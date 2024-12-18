import React, { createContext, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { userService } from "../Services/authentication.service";
//import { useNavigate } from 'react-router-dom';
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // const navigate = useNavigate();
  const login = async (data) => {
    return await api.post("/login", data);
    
  };

  const googlylogin = async (data) => {
    try {
      const response = await api.post("/login", data);
      if (response.data.success) {
        console.log(response.data.user);
        userService.setToken(response.data.user);
        navigate("/user/dashboard");
      }
    } catch (error) {
      console.log('error',error);
      alert(error.response.data.message);
      console.error("Login error:", error);
      localStorage.removeItem("id_token");
    }
  };

  const resetPassword = async (data) => {
    const response = await api.post("/reset-password", {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });
    return response;
  };

  const handleFileUpload = async (data) => {
    const formData = new FormData();
    if (data.file) formData.append("myImage", data.file);
    if (data.userName) formData.append("name", data.userName);

    try {
      return await api.post("/upload-profile-picture", formData);
    } catch (error) {
      console.error("Error uploading file:", error);
      return false;
    }
  };

  const Qrcode = async (userId) => {
    try {
      const response = await api.get(`/Qrcode/${userId}`); // Pass userId as a URL parameter
      return response.data;
    } catch (error) {
      console.error("Error fetching QR code:", error);
    }
  };
  return (
    <AuthContext.Provider
      value={{
        login,
        handleFileUpload,
        resetPassword,
        setLoading,
        loading,
        googlylogin,
        Qrcode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
