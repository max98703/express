import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import App from './App';
import AppContextProvider from './context/AppContext'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(

  // App is a children of AppContext
  <GoogleOAuthProvider clientId="697486615012-c4p3q96elor2om5esdvt3o1bstqtnruq.apps.googleusercontent.com">
  <AppContextProvider>
    <App />
  </AppContextProvider>
</GoogleOAuthProvider>


);
