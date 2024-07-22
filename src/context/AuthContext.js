import React, { createContext, useState, useContext } from 'react';
import api from '../api/api';
import { userService } from "../Services/authentication.service";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);

  const login = async (data) => {
    try {
      const response = await api.post('/login', data);
      const { user } = response.data;
      userService.setToken(user);
      window.location.href = `/`;
    } catch (error) {
      alert('Invalid credentials. Please check your username and password.');
      console.error('Login error:', error);
      localStorage.removeItem('user');
    }
  };

  const resetPassword = async (data) => {
    const response = await api.post('/reset-password', {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });
    return response;
  };

  const handleFileUpload = async (data) => {
    const formData = new FormData();
    if (data.file) formData.append('myImage', data.file);
    if (data.userName) formData.append('name', data.userName);
    if (data.phone) formData.append('phone', data.phone);

    try {
      return await api.post('/upload-profile-picture', formData);
    } catch (error) {
      console.error('Error uploading file:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ login, handleFileUpload, resetPassword, setLoading, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
