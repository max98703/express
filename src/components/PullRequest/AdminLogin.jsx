import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AppContext } from "../../context/AppContext";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

const Logins = () => {
  const { login, googlylogin } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { showAlert } = useContext(AppContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!username || !password) {
        showAlert("Email and password are required.", "error");
        return;
      }
      const response = await login({ email: username, password: password });
      console.log(response.data);
      if(response?.data?.redirectToOtp){
        console.log('max');
        navigate("/2fa/otp",{ state: { userDetails: response.data.user }})
      }
      if (response.data.success) {
        localStorage.setItem("id_token", response.data.user);
        navigate("/user/dashboard");
        showAlert(result.message, "success");
      }
    } catch (error) {
      console.log(error);
      showAlert(error?.response?.data?.message, "error");
    } finally {
      setUsername("");
      setPassword("");
      setLoading(false);
    }
  };

  const logn = useGoogleLogin({
    clientId:
      "697486615012-c4p3q96elor2om5esdvt3o1bstqtnruq.apps.googleusercontent.com", 
    onSuccess: async (response) => {
      setGoogleLoading(true);
      try {
        const { access_token } = response;
        const userInfo = await axios.get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              Accept: "application/json",
            },
          }
        );
        googlylogin(userInfo.data);
        navigate("/user/dashboard");
      } catch (error) {
        showAlert("Google login failed. Please try again later.", "error");
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: (error) => {
      showAlert("Google login failed. Please try again later.", "error");
    },
    onClick: () => {
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?scope=email&response_type=token&redirect_uri=http://localhost:3000/callback`;
      window.open(googleAuthUrl, "_blank", "width=500,height=600");
    },
  });

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: "url('/image/task111.png')", // Replace with correct path to task111 image
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">
          Task Management Login
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Hey, enter your details to get signed into your account
        </p>
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter Email / Phone No"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your Password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 text-white ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-500"
            } rounded-md`}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <div className="mt-6 text-center text-gray-500">OR</div>
        <div className="flex gap-4 mt-4">
          <button
            onClick={logn}
            disabled={googleLoading}
            className=" p-3  text-white bg-red-500 hover:bg-red-400 rounded-md"
          >
            {googleLoading
              ? "Signing in with Google..."
              : "Sign in with Google"}
          </button>
          <a
            href="http://localhost:5050/auth/facebook"
            style={{ textDecoration: "none" }}
          >
            <button className="w-full p-3 flex items-center justify-center text-white bg-blue-600 hover:bg-blue-500 rounded-md">
              Login with Facebook
            </button>
          </a>
        </div>
        <div className="mt-6 text-sm text-center text-gray-600">
          Don’t have an account?{" "}
          <a
            href="#"
            className="text-blue-600 hover:text-blue-500 font-semibold"
          >
            Request Now
          </a>
        </div>
      </div>
    </div>
  );
};

export default Logins;
