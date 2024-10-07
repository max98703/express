import React, { useState, useEffect } from "react";
import socket from "./socket"; // Import your configured Socket.IO instance

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]); // List of active users
  const [selectedUser, setSelectedUser] = useState(null); // The user you are chatting with

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      setToken(storedToken);
      setIsLoggedIn(true);
      socket.emit("register_session", {
        token: storedToken,
      });
    }

    socket.on("receive_message", (data) => {
      console.log("Message received:", data);
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on("error", (data) => {
      console.error("Error:", data.message);
    });

    socket.on("update_active_users", (users) => {
      console.log(users);
      setActiveUsers(users);
    });

    return () => {
      socket.off("receive_message");
      socket.off("error");
      socket.off("update_active_users");
    };
  }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      const result = await response.json();
      if (response.ok) {
        setIsLoggedIn(true);
        setToken(result.token);
        localStorage.setItem("token", result.token);
        socket.emit("register_session", {
          token: result.token,
        });
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleSendMessage = () => {
    if (message.trim() && selectedUser && token) {
      console.log("Sending message:", {
        message,
        target_id: selectedUser.id,
        token,
      });
      socket.emit("send_message", {
        message,
        target_id: selectedUser.id,
        token,
      });
      setMessages((prevMessages) => [...prevMessages, { message, from: "me" }]);
      setMessage("");
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    const filteredMessages = messages.filter(
      (msg) => msg.from === user.id || msg.to === user.id
    );
    setMessages(filteredMessages);
  };
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
    //  setFile(file);
      console.log("File selected:", file);
    }
  };
  return (
    <div className="flex h-screen bg-gray-100">
      {!isLoggedIn ? (
        <div className="flex items-center justify-center w-full h-full">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border p-2 rounded mb-4 w-full"
            />
            <button
              onClick={handleLogin}
              className="bg-blue-500 text-white p-2 rounded w-full"
            >
              Login
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1">
          <aside className="w-1/4 bg-gray-200 p-4">
            <h2 className="text-xl font-bold mb-4">Active Users</h2>
            <ul>
              {activeUsers.map((user) => (
                <li
                  key={user.id}
                  onClick={() => handleSelectUser(user)} // Pass the whole user object
                  className={`cursor-pointer p-2 rounded-lg mb-2 ${
                    selectedUser?.id === user.id
                      ? "bg-blue-300"
                      : "hover:bg-blue-100"
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-400 rounded-full mr-3">
                      <img className="w-10 h-10 rounded-full" src={`/image/${user.img}`} alt={user.username} />
                    </div>
                    <span>{user.username}</span>
                  </div>
                </li>
              ))}
            </ul>
          </aside>
          <main className="flex-1 flex flex-col bg-white rounded-lg shadow-lg">
            {selectedUser && (
              <div className="p-3 bg-blue-400 text-white flex items-center">
                <div className="w-10 h-10 bg-gray-400 rounded-full mr-3">
                  <img className="w-10 h-10 rounded-full" src={`/image/${selectedUser.img}`} alt={selectedUser.username} />
                </div>
                <span className="font-bold">Chatting with {selectedUser.username}</span>
              </div>
            )}

            <div className="flex-1 p-4 overflow-y-auto">
              {selectedUser ? (
                <div>
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`mb-4 ${
                        msg.from === "me"
                          ? "text-right"
                          : "text-left"
                      }`}
                    >
                      <span
                        className={`inline-block max-w-xs p-2 rounded-lg ${
                          msg.from === "me"
                            ? "bg-blue-400 text-white"
                            : "bg-gray-300"
                        }`}
                      >
                        {msg.from === "me" ? "You" : ''}
                        : {msg.message}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  Select a user to start chatting
                </div>
              )}
            </div>

            {selectedUser && (
              <div className="p-4 bg-gray-200 flex items-center">
                <label htmlFor="file-input" className="cursor-pointer mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 16a4 4 0 00-4-4H8a4 4 0 00-4 4v4a4 4 0 004 4h8a4 4 0 004-4v-4zM4 8a4 4 0 014-4h8a4 4 0 014 4v4H4V8z"
                    />
                  </svg>
                  <input
                    type="file"
                    id="file-input"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 p-2 rounded-full border border-gray-300 mr-4"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-500 text-white p-3 rounded-full"
                >
                  Send
                </button>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};

export default Chat;
