import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import App from './App';
import AppContextProvider from './context/AppContext'

const root = ReactDOM.createRoot(document.getElementById('root'));

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(function (registration) {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch(function (error) {
      console.log('Service Worker registration failed:', error);
    });
}

root.render(

  // App is a children of AppContext
  <GoogleOAuthProvider clientId="697486615012-c4p3q96elor2om5esdvt3o1bstqtnruq.apps.googleusercontent.com">
  <AppContextProvider>
    <App />
  </AppContextProvider>
</GoogleOAuthProvider>


);
