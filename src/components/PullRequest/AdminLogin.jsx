import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import socket from "../CustomerCare/socket";
import { AppContext } from "../../context/AppContext";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

const Logins = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Loading state for normal login
  const [googleLoading, setGoogleLoading] = useState(false); // Loading state for Google login
  const navigate = useNavigate();
  const { showAlert } = useContext(AppContext);

  // Handle normal login
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      showAlert("Email and password are required.", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password: password }),
      });

      const result = await response.json();
      if (response.ok) {
        localStorage.setItem("id_token", result.token);
        socket.emit("register_session", { token: result.token });
        navigate("/user/dashboard");
        showAlert(result.message, "success");
      } else {
        showAlert(result.message, "error");
      }
    } catch (error) {
      showAlert("An error occurred. Please try again later.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Google login logic
  const logn = useGoogleLogin({
    onSuccess: async (response) => {
      setGoogleLoading(true);
      try {
        const { access_token } = response;

        // Fetch user info from Google
        const userInfo = await axios.get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              Accept: "application/json",
            },
          }
        );
        login(userInfo.data);
      } catch (error) {
        console.error("Google login error:", error);
        showAlert("Google login failed. Please try again later.", "error");
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google Login Failed:", error);
      showAlert("Google login failed. Please try again later.", "error");
    },
  });

  return (
    <div className="min-h-screen flex bg-gray-100">
      <div className="flex w-full bg-white rounded-lg shadow-lg">
        <div className="w-1/2 h-full bg-cover bg-center rounded-l-lg bg-red-200">
          <img
            src="/image/yt.jpg"
            className="w-full h-full bg-inherit object-cover"
            alt="background"
          />
        </div>

        <div className="w-1/2 p-8 flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-blue-800 p-8">Login</h1>

          <form className="space-y-6 ml-8" onSubmit={handleLogin}>
            <div>
              <label htmlFor="username" className="block text-md font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="username"
                value={username}
                name="email"
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-md font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                name="password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-60 py-2 px-4 ${
                  loading ? "bg-gray-400" : "bg-blue-800 hover:bg-blue-600"
                } text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  "Login"
                )}
              </button>

              <button
                type="button"
                onClick={logn}
                disabled={googleLoading}
                className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                {googleLoading ? "Signing in with Google..." : "Sign in with Google 🚀"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Logins;
