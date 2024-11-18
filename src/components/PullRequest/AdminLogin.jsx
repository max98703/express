import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../CustomerCare/socket";
import { AppContext } from "../../context/AppContext";
const Logins = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const { showAlert } = useContext(AppContext);
  const handleLogin = async (e) => {
    e.preventDefault(); // Corrected typo: use preventDefault() instead of preventdefault()

    console.log(username);
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username }),
      });
  
      const result = await response.json();
      if (response.ok) {
        console.log('max');
        localStorage.setItem("id_token", result.token);
        socket.emit("register_session", { token: result.token });
        navigate('/dashboard');
      } else {
        console.error(result.message);
        showAlert(result.message, "error");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

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
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                name="username"
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
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit" // Using type="submit" to trigger form submission
              className="w-full py-2 px-4 bg-blue-800 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Logins;
