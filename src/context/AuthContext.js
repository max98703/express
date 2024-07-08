
import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const login = async (data) => {
   
     try {
       const response = await axios.post('http://localhost:5000/login', data);

       const { message, user } = response.data;

       localStorage.setItem('user', JSON.stringify(user));

       sessionStorage.setItem('session', JSON.stringify(user) );

       window.location.href = `/`;

     } catch (error) {
        
       alert('Invalid credentials. Please check your username and password.');

       console.log('Login error:', error);

       localStorage.removeItem('user');
     }
   };
 
  const logout = () => {
    // localStorage.removeItem('user');
    // setUser(null);
    // setAuthenticated(false);
    // // Optionally, you might want to redirect or update state based on logout
    // window.location.href = `/login`; // Redirect to login page after logout
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
