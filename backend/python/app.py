import os
import time
import json
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from threading import Thread
from win10toast import ToastNotifier
import pusher
import jwt
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
        self.setup_routes()

    def initialize_users(self):
        return {
            "max": {"id": 1, "username": "max", "role": "customer", "img": "1724733931428.jpeg"},
            "customercare": {"id": 2, "username": "customercare", "role": "customer_care", "img": "nothing"},
            "alina": {"id": 3, "username": "alina", "role": "customer", "img": "1724126776640.jpg"}
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
                    'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
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
                
        def broadcast_active_users(self):
            users_list = [
                {'id': user_id, 'username': details['username'], 'img': details['img']}
                for user_id, session_id in self.active_users.items()
                for username, details in self.users.items() if details['id'] == user_id
            ]
            self.socketio.emit('update_active_users', users_list)

        @self.socketio.on('send_message')
        def handle_message(data):
            token = data.get('token')
            message = data.get('message')
            target_id = int(data.get('target_id'))

            try:
                decoded = jwt.decode(token, self.app.config['SECRET_KEY'], algorithms=["HS256"])
                sender_id = decoded['user_id']
            except jwt.ExpiredSignatureError:
                emit('error', {'message': 'Token expired'}, room=request.sid)
                return
            except jwt.InvalidTokenError:
                emit('error', {'message': 'Invalid token'}, room=request.sid)
                return
            
            target_sid = self.active_users.get(target_id)
            if target_sid:
                emit('receive_message', {'message': message, 'from': sender_id}, room=target_sid)
            else:
                emit('error', {'message': 'User not active'}, room=request.sid)

    def start_file_watcher(self):
        file_watcher = Thread(target=self.notifier.watch_file, args=('movies.json', 5)) 
        file_watcher.start()

    def run(self):
        self.start_file_watcher()
        self.socketio.run(self.app, port=5000)

if __name__ == '__main__':
    movie_app = MovieApp()
    movie_app.run()
