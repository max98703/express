import os
import time
import json
from datetime import datetime, timedelta , timezone
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from threading import Thread
from win10toast import ToastNotifier
import pusher
import jwt
import io
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import pooling
import requests
from werkzeug.security import check_password_hash
import bcrypt
from pusher_push_notifications import PushNotifications


# Load environment variables
load_dotenv()

class Database:
    def __init__(self, host, user, password, database, pool_size=5):
        self.host = host
        self.user = user
        self.password = password
        self.database = database
        self.pool_size = pool_size
        
        # Create the connection pool
        self.pool = pooling.MySQLConnectionPool(
            pool_name="task_pool",
            pool_size=self.pool_size,
            host=self.host,
            user=self.user,
            password=self.password,
            database=self.database
        )

    def execute_query(self, query, params=None):
        # Get a connection from the pool
        connection = self.pool.get_connection()
        cursor = connection.cursor(dictionary=True)
        
        try:
            # Execute the query
            cursor.execute(query, params)
            result = cursor.fetchall()
            connection.commit()  # Ensure changes are committed if any
            return result
        except mysql.connector.Error as err:
            print(f"Error: {err}")
            return None
        finally:
            cursor.close()  # Close the cursor
            connection.close()  # Release the connection back to the pool
            
class PusherClient:
    def __init__(self):
        self.client = pusher.Pusher(
            app_id=os.getenv('PUSHER_APP_ID'),
            key=os.getenv('PUSHER_KEY'),
            secret=os.getenv('PUSHER_SECRET'),
            cluster=os.getenv('PUSHER_CLUSTER'),
            ssl=True
        )
        
        self.beams_client = PushNotifications(
            instance_id=os.getenv('INSTANCE_ID'),
            secret_key=os.getenv('PRIMARY_KEY'),
        )

    def send_batch(self, channel, event, data):
        self.client.trigger(channel, event, data)
    
    def send_login_notification(self, user):
        response = self.beams_client.publish_to_interests(
        interests=[f"{user['id']}"],  # Correctly targeting the user based on ID
        publish_body={
            'web': {
                'notification': {
                'title': "Login Success",
                'body': f"{user['email']} logged in successfully!",  # Corrected string formatting
                'deep_link': 'https://www.pusher.com',
                    },
                },
            },
        )

        print(response['publishId'])  # Logging the response for debugging
class MovieData:
    def __init__(self, file_path):
        self.file_path = file_path
        self.processed_movies = set()

    def load_movies(self):
        with open(self.file_path) as f:
            return json.load(f)

    def sync_movies(self, movies):
        current_movie_ids = {movie['id'] for movie in movies}
        deleted_movies = list(self.processed_movies - current_movie_ids)
        new_movies = [movie for movie in movies if movie['id'] not in self.processed_movies]

        self.processed_movies = current_movie_ids
        return new_movies, deleted_movies

class MovieNotifier:
    def __init__(self, movie_data, pusher_client, batch_size=3):
        self.movie_data = movie_data
        self.pusher_client = pusher_client
        self.batch_size = batch_size
        self.notifier = ToastNotifier()
    
    def batch_movies(self, movies):
        for i in range(0, len(movies), self.batch_size):
            yield movies[i:i + self.batch_size]
    
    def notify_user(self, new_movies):
        for movie in new_movies:
            self.notifier.show_toast(
                title="New Movie Alert",
                msg=f"New Movie: {movie['Title']}",
                duration=1  # Duration in seconds
            )
            time.sleep(2)
            
    def send_movie_updates(self):
        movies = self.movie_data.load_movies()
        new_movies, deleted_movies = self.movie_data.sync_movies(movies)

        if not new_movies and not deleted_movies:
            return {'status': '200', 'message': 'No new or deleted movies to process'}
        
        if new_movies:
            notification_thread = Thread(target=self.notify_user, args=(new_movies,))
            notification_thread.start()
            
            for batch in self.batch_movies(new_movies):
                self.pusher_client.send_batch('my-channel', 'new-movies', batch)
                
        if deleted_movies:
            self.pusher_client.send_batch('my-channel', 'deleted-movies', deleted_movies)

        return {'status': '200', 'message': 'Movie updates (new and deleted) sent successfully'}
    
    def watch_file(self, file_path, interval=3):
        last_modified = os.path.getmtime(file_path)
        while True:
            time.sleep(interval)
            current_modified = os.path.getmtime(file_path)
            if current_modified > last_modified:
                self.send_movie_updates()
                last_modified = current_modified

class MovieApp:
    def __init__(self):
        self.app = Flask(__name__)
        CORS(self.app)
        self.socketio = SocketIO(self.app, cors_allowed_origins="*")
        self.app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your_default_secret_key')
        self.pusher_client = PusherClient()
        self.movie_data = MovieData('movies.json')
        self.notifier = MovieNotifier(self.movie_data, self.pusher_client)
        self.query= Database(host='localhost', user='root', password='Alina123@', database='movies')
        self.users = self.initialize_users()
        self.active_users = {}
        self.UPLOAD_FOLDER = '../../public/uploads'

        self.setup_routes()
        os.makedirs(self.UPLOAD_FOLDER, exist_ok=True)

    def initialize_users(self):
        query = """ SELECT * FROM users"""
        result = self.query.execute_query(query)
        return result if result else None

    def setup_routes(self):
        @self.app.route('/movies', methods=['GET'])
        def get_movies():
            movies = self.movie_data.load_movies()
            self.movie_data.processed_movies.update(movie['id'] for movie in movies)
            return jsonify(movies)
        
        @self.app.route('/login', methods=['POST'])
        def login():
            data = request.get_json()
            email = data.get('email')
            password = data.get('password')
            
            # Ensure there's no unnecessary whitespace or processing delay
            if not email or not password:
                return jsonify({"message": "Email and password are required"}), 400
            
            # Make sure the query is optimized with indexing on 'email'
            query = "SELECT id, logo, admin, name, password FROM users WHERE email = %s LIMIT 1"
            user = self.query.execute_query(query, (email,))  # Ensure execute_query uses parameterized queries
            
            if not user:
                return jsonify({"message": "Invalid email or password"}), 401

            user = user[0]  # Single user result from query

            # Validate the password using bcrypt
            if not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
                return jsonify({"message": "Invalid email or password"}), 401

            # Create JWT token with necessary claims
            token = jwt.encode({
                'user_id': user['id'],
                'image': user['logo'],
                'role': user['admin'],
                'name': user['name'],
                'exp': datetime.now() + timedelta(hours=1)
            }, self.app.config['SECRET_KEY'], algorithm='HS256')

            # Return success message and JWT token
            return jsonify({
                "message": "You Are Logged In", 
                "token": token, 
                "role": user['admin']
            }), 200
        
 
        @self.app.route('/tasks/<int:task_id>', methods=['GET'])
        def get_task_details(task_id):

            task_query = """
                SELECT 
                    t.id AS task_id, 
                    t.title AS task_title, 
                    t.description AS task_description, 
                    t.status AS status,
                    t.deadline, 
                    t.priority, 
                    p.name AS project_name, 
                    u.name AS created_by
                FROM tasks t
                LEFT JOIN projects p ON t.project_id = p.id
                LEFT JOIN users u ON t.created_by = u.id
                WHERE t.id = %s
            """
            task = self.query.execute_query(task_query, (task_id,))
            if not task:
                return jsonify({"message": "Task not found"}), 404
            task = task[0]  # Use the first result directly

            # 2. Get Task Attachments
            attachments_query = """
                SELECT  
                    ta.name AS attachment_name
                FROM task_attachments ta
                WHERE ta.task_id = %s
                ORDER BY ta.id DESC
            """
            attachments = self.query.execute_query(attachments_query, (task_id,))

            # 3. Get Task Collaborators
            collaborators_query = """
                SELECT 
                    tc.collaborator_id,
                    uc.name AS collaborator_name,
                    uc.logo AS collaborator_logo,
                    tc.flag AS collaborator_flag
                FROM task_collaborators tc
                LEFT JOIN users uc ON tc.collaborator_id = uc.id
                WHERE tc.task_id = %s
            """
            collaborators = self.query.execute_query(collaborators_query, (task_id,))

            # 4. Get Task Comments
            comments_query = """
                SELECT
                    'comment' AS type,
                    c.comment AS text,
                    cu.name AS user_name,
                    c.created_at,
                    cu.logo AS user_logo
                FROM comments c
                LEFT JOIN users cu ON c.created_by = cu.id
                WHERE c.task_id = %s
                ORDER BY c.created_at DESC
            """
            comments = self.query.execute_query(comments_query, (task_id,))

            # 5. Get Task Activity Logs (Status Changes)
            activity_query = """
                SELECT
                    'activity' AS type,
                    tl.previousStatus AS previous_status,
                    tl.currentStatus AS current_status,
                    tl.created_at,
                    u.logo AS user_logo,
                    u.name AS user_name
                FROM task_status_logs tl
                LEFT JOIN users u ON tl.createdBy = u.id
                WHERE tl.taskId = %s
                ORDER BY tl.created_at DESC
            """
            logs = self.query.execute_query(activity_query, (task_id,))

            # Combine comments and logs
            combined_activity = comments + logs  # Concatenate both lists

            # Sort by created_at in descending order
            combined_activity.sort(key=lambda x: x['created_at'], reverse=True)

            return jsonify({
                "task_id": task["task_id"],
                "task_title": task["task_title"],
                "task_description": task["task_description"],
                "status": task["status"],
                "deadline": task["deadline"],
                "priority": task["priority"],
                "project_name": task["project_name"],
                "createdBy": task["created_by"],
                "task_attachments": attachments,  # Return list of attachments
                "collaborators": collaborators,  # Return list of collaborators
                "activity": combined_activity  # Return the combined and sorted activity (comments + logs)
            }), 200

        @self.socketio.on('connect')
        def handle_connect():
            print(f"Client connected with session ID {request.sid}")

        @self.socketio.on('disconnect')
        def handle_disconnect():
            self.active_users = {user_id: sid for user_id, sid in self.active_users.items() if sid != request.sid}
            print(f"Client disconnected with session ID {request.sid}")
        
        @self.socketio.on('register_session')
        def handle_register_session(data):
            token = data.get('token')
            session_id = request.sid
            try:
                decoded = jwt.decode(token, self.app.config['SECRET_KEY'], algorithms=["HS256"])
                user_id = decoded['user_id']
                self.active_users[user_id] = session_id
                self.broadcast_active_users() 
            except jwt.ExpiredSignatureError:
                emit('error', {'message': 'Token expired'})
            except jwt.InvalidTokenError:
                emit('error', {'message': 'Invalid token'})


        @self.socketio.on('send_message')
        def handle_message(data):
            token = data.get('token')
            message = data.get('message')
            target_id = data.get('target_id')  # This might represent `to` or `from`
            to = data.get('to')  # Recipient ID
            from_user = data.get('from')  # Sender ID
            files = data.get('files', [])  # List of file data and original names
            file_urls = []
            current_time = datetime.now().strftime('%Y-%m-%d %I:%M %p')

            # Handle file uploads
            if files:
                for file in files:
                    file_name = secure_filename(file['name'])  # Make filename safe
                    file_data = file['data']  # Byte-like data

                    # Define the full path to save the file
                    file_path = os.path.join(self.UPLOAD_FOLDER, file_name)

                    # Save the file directly
                    with open(file_path, 'wb') as f:
                        f.write(bytearray(file_data))

                    # Store the file path for future reference
                    file_urls.append({'name': file_name})

            # Verify JWT token (if needed)
            try:
                decoded = jwt.decode(token, self.app.config['SECRET_KEY'], algorithms=["HS256"])
                sender_id = decoded['user_id']
                if sender_id != from_user:
                    emit('error', {'message': 'Unauthorized sender'}, room=request.sid)
                    return
            except jwt.ExpiredSignatureError:
                emit('error', {'message': 'Token expired'}, room=request.sid)
                return
            except jwt.InvalidTokenError:
                emit('error', {'message': 'Invalid token'}, room=request.sid)
                return

            # Send the message and file URLs to the target user
            target_sid = self.active_users.get(to)  # Use `to` to fetch the recipient's session ID
            if target_sid:
                emit('receive_message', {
                    'message': message,
                    'files': file_urls,
                    'from': from_user,
                    'to': to,
                    'time': current_time
                }, room=target_sid)
            else:
                emit('error', {'message': 'User not active'}, room=request.sid)
       
        @self.socketio.on('typing')
        def handle_typing(data):
            token = data.get('token')
            to = data.get('to')  # Recipient ID
            from_user = data.get('from')  # Sender ID
            is_typing = data.get('is_typing')  # Boolean: True if typing, False if stopped

            # Verify JWT token (optional)
            try:
                decoded = jwt.decode(token, self.app.config['SECRET_KEY'], algorithms=["HS256"])
                sender_id = decoded['user_id']
                if sender_id != from_user:
                    emit('error', {'message': 'Unauthorized sender'}, room=request.sid)
                    return
            except jwt.ExpiredSignatureError:
                emit('error', {'message': 'Token expired'}, room=request.sid)
                return
            except jwt.InvalidTokenError:
                emit('error', {'message': 'Invalid token'}, room=request.sid)
                return

            # Notify the recipient user
            target_sid = self.active_users.get(to)
            if target_sid:
                emit('typing_status', {
                    'from': from_user,
                    'is_typing': is_typing
                }, room=target_sid)

                
        @self.socketio.on('call_user')
        def handle_call_user(data):
            callee_id = data['calleeId']
            sender_id = data['sender_id']
            target_sid = self.active_users.get(callee_id)
            # Send the offer to the specific callee
            if target_sid:
                emit('incoming_call', {'id': callee_id, 'from': sender_id}, room=target_sid)

        @self.socketio.on('accept_call')
        def handle_accept_call(data):
            caller_id = data['callerId']
            target_sid = self.active_users.get(caller_id)
            # Send the offer to the specific callee
            if target_sid:
             emit('call_accepted', room=target_sid)

        # Handle call decline
        @self.socketio.on('decline_call')
        def handle_decline_call(data):
            caller_id = data['callerId']
            target_sid = self.active_users.get(caller_id)
            # Send the offer to the specific callee
            if target_sid:
             emit('call_declined', room=target_sid)
            
        @self.socketio.on('ice_candidate')
        def handle_ice_candidate(data):
            target_id = data['calleeId']
            candidate = data['candidate']
            target_sid = self.active_users.get(target_id)
            # Send the ICE candidate to the target user
            if target_sid:
                emit('ice_candidate', {'candidate': candidate}, room=target_sid)
                
    def broadcast_active_users(self): 
        users_list = [
            {'id':user_id, 'username': user['name'], 'img': user['logo']}
            for user_id, session_id in self.active_users.items()
            for user in self.users if user['id'] == user_id
        ]
        self.socketio.emit('update_active_users', users_list)

    def start_file_watcher(self):
        file_watcher = Thread(target=self.notifier.watch_file, args=('movies.json', 5)) 
        file_watcher.start()

    def run(self):
        self.start_file_watcher()
        self.socketio.run(self.app, port=5000)

if __name__ == '__main__':
    movie_app = MovieApp()
    movie_app.run()
