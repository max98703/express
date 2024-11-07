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

# Load environment variables
load_dotenv()

class PusherClient:
    def __init__(self):
        self.client = pusher.Pusher(
            app_id=os.getenv('PUSHER_APP_ID'),
            key=os.getenv('PUSHER_KEY'),
            secret=os.getenv('PUSHER_SECRET'),
            cluster=os.getenv('PUSHER_CLUSTER'),
            ssl=True
        )

    def send_batch(self, channel, event, data):
        self.client.trigger(channel, event, data)

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
        self.users = self.initialize_users()
        self.active_users = {}
        self.UPLOAD_FOLDER = '../../public/uploads'

        self.setup_routes()
        os.makedirs(self.UPLOAD_FOLDER, exist_ok=True)

    def initialize_users(self):
        return {
            "max": {"id": 1, "username": "max", "role": "superadmin", "img": "1724221288745.jpeg"},
            "customercare": {"id": 2, "username": "customercare", "role": "customer_care", "img": "nothing"},
            "alina": {"id": 3, "username": "alina", "role": "user", "img": "1723709496205.jpg"}
        }

    def setup_routes(self):
        @self.app.route('/movies', methods=['GET'])
        def get_movies():
            movies = self.movie_data.load_movies()
            self.movie_data.processed_movies.update(movie['id'] for movie in movies)
            return jsonify(movies)
        
        @self.app.route('/login', methods=['POST'])
        def login():
            data = request.get_json()
            username = data.get('username')
            user = self.users.get(username)

            if user:
                token = jwt.encode({
                    'user_id': user['id'],
                    'image':user['img'],
                    'role':user['role'],
                    'exp': datetime.now() + timedelta(hours=1)
                }, self.app.config['SECRET_KEY'], algorithm='HS256')
                return jsonify({"message": "Login successful", "token": token, "role": user['role']}), 200
            return jsonify({"message": "Invalid username"}), 401
        
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
            target_id = int(data.get('target_id'))
            files = data.get('files', [])  # List of file data and original names
            file_urls = []
            current_time = datetime.now().strftime('%Y-%m-%d %I:%M %p')

            # Handle file uploads
            if files:
                for file in files:
                    file_name = secure_filename(file['name'])  # Make filename safe
                    file_data = file['data']  # Byte-like data

                    # Convert the byte data to a file and save it
                    file_buffer = io.BytesIO(bytearray(file_data))

                    # Define the full path to save the file
                    file_path = os.path.join(self.UPLOAD_FOLDER, file_name)

                    # Save the file to the specified folder
                    with open(file_path, 'wb') as f:
                        f.write(file_buffer.getbuffer())

                    # Store the file path for future reference
                    file_urls.append({
                        'name': file_name
                    })
                    
            # Verify JWT token
            try:
                decoded = jwt.decode(token, self.app.config['SECRET_KEY'], algorithms=["HS256"])
                sender_id = decoded['user_id']
            except jwt.ExpiredSignatureError:
                emit('error', {'message': 'Token expired'}, room=request.sid)
                return
            except jwt.InvalidTokenError:
                emit('error', {'message': 'Invalid token'}, room=request.sid)
                return

            # Send the message and file URLs to the target user
            target_sid = self.active_users.get(target_id)
            if target_sid:
                emit('receive_message', {'message': message, 'files': file_urls, 'from': sender_id, 'time':current_time}, room=target_sid)
            else:
                emit('error', {'message': 'User not active'}, room=request.sid)
        
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
            {'id': user_id, 'username': details['username'], 'img': details['img']}
            for user_id, session_id in self.active_users.items()
            for username, details in self.users.items() if details['id'] == user_id
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
