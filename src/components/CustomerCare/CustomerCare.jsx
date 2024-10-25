import React, { useState, useEffect } from "react";
import socket from "./socket"; // Import your configured Socket.IO instance
import Videocall from "./Videocall";
import { userService } from "../../Services/authentication.service";
import { v4 as uuidv4 } from "uuid";
const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [data,setUser] = useState([]);
  useEffect(() => {
    const storedToken = localStorage.getItem("id_token");
    const data = userService.getUserData();
    setUser(data);

    if (storedToken) {
      setToken(storedToken);
      setIsLoggedIn(true);
      socket.emit("register_session", { token: storedToken });
    }
  
    socket.on("receive_message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });
  
    socket.on("error", (data) => {
      console.error(data.message);
    });
  
    socket.on("update_active_users", (users) => {
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
  
      const result = await response.json();
      if (response.ok) {
        setIsLoggedIn(true);
        setToken(result.token);
        localStorage.setItem("id_token", result.token);
        socket.emit("register_session", { token: result.token });
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };
  
  const handleSendMessage = () => {
    const filesToSend = [];
  
    if (files.length > 0) {
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const arrayBuffer = e.target.result;
          const timestamp = Date.now();
          const uniqueId = uuidv4();
          const newFileName = `${timestamp}_${uniqueId}_${file.name}`;
          filesToSend.push({ name: newFileName, data: new Uint8Array(arrayBuffer) });
  
          if (filesToSend.length === files.length) {
            socket.emit("send_message", {
              message: message || "No message",
              target_id: selectedUser.id,
              token,
              files: filesToSend,
            });
          }
        };
        reader.readAsArrayBuffer(file);
      });
      setFiles((prevFiles) => [...prevFiles, { files, from: "me" }]);
    } else {
      socket.emit("send_message", {
        message: message || "No message",
        target_id: selectedUser.id,
        token,
        files: [],
      });
    }
    setMessages((prevMessages) => [...prevMessages, { message, from: "me" }]);
    setMessage("");
  };
  
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setMessages(messages.filter((msg) => msg.from === user.id || msg.to === user.id));
  };
  
  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length) {
      setFiles(selectedFiles);
    }
  };
  
  const [showModal, setShowModal] = useState(false);
  const [modalFiles, setModalFiles] = useState([]);
  
  const openImageModal = (files) => {
    setModalFiles(files);
    setShowModal(true);
  };
  
  const closeImageModal = () => {
    setShowModal(false);
    setModalFiles([]);
  };
  
  const truncateFileName = (fileName, maxLength) => {
    if (fileName.length > maxLength) {
      const [name, extension] = fileName.split(".");
      const truncatedName = name.substring(0, maxLength - extension.length - 3);
      return `${truncatedName}...${extension}`;
    }
    return fileName;
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
          <aside className="w-1/4 bg-gray-300 p-4 shadow-md ">
            <h2 className="text-xl font-bold mb-4">Active Users</h2>
            <ul>
              {activeUsers.map((user) => (
                <li
                  key={user.id}
                  onClick={() => handleSelectUser(user)} // Pass the whole user object
                  className={`cursor-pointer p-2 rounded-lg mb-2 ${
                    selectedUser?.id === user.id
                      ? "bg-gray-400"
                      : "hover:bg-gray-200"
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-400 rounded-full mr-3">
                      <img
                        className="w-10 h-10 rounded-full"
                        src={`/image/${user.img}`}
                        alt={user.username}
                      />
                    </div>
                    <span>{user.username}</span>
                  </div>
                </li>
              ))}
            </ul>
          </aside>
          <main className="flex-1 flex flex-col bg-white shadow-md
           "
           style={{
            backgroundImage: `url('/image/fffff.jpg')`,
            backgroundSize: 'cover',  // Adjusts the image size
            backgroundPosition: 'center',  // Centers the image
            backgroundRepeat: 'no-repeat', // Prevents the image from repeating
          }}>
            {selectedUser && (
              <div className="h-20 p-2 bg-gray-400 text-white flex items-center justify-between"
              style={{
                marginTop: '-10px'
              }}>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-400 rounded-full mr-3">
                  <img
                    className="w-12 h-12 rounded-full"
                    src={`/image/${selectedUser.img}`}
                    alt={selectedUser.username}
                  />
                </div>
                {/* <span className="font-bold">
                  Chatting with {selectedUser.username}
                </span> */}
              </div>
              <div className="font-bold">
                <Videocall user={selectedUser} data={data}/>
              </div>
            </div>
            
            )}

            <div className="flex-1 p-4 overflow-y-auto">
              {selectedUser ? (
                <div>
                  {messages.map((msg, index) => {
                    const files = Array.isArray(msg.files) ? msg.files : [];
                    const images = files.filter((file) =>
                      /\.(jpeg|jpg|gif|png|svg|webp)$/i.test(file.name)
                    );
                    const nonImageFiles = files.filter(
                      (file) =>
                        !/\.(jpeg|jpg|gif|png|svg|webp)$/i.test(file.name)
                    );
                    return (
                      <div
                        key={index}
                        className={`mb-4 ${
                          msg.from === "me" ? "text-right" : "text-left"
                        }`}
                      >
                        <span
                          className={`inline-block max-w-xs p-2 m-1 rounded-lg  leading-1.5  p-2 m-1 rounded-lg border-gray-200 bg-gray-200 rounded-e-xl rounded-es-xl dark:bg-gray-700 text-ms`}
                        >
                          {msg.message}

                          {msg.files && msg.files.length > 0 && (
                            <div className="mt-2 ">
                              {images.length > 1 ? (
                                <div
                                  className="relative bg-white dark:bg-gray-800 p-2 w-52 rounded-lg shadow-md border dark:border-gray-700 cursor-pointer"
                                  onClick={() => openImageModal(images)} // Open modal for all images
                                >
                                  <img
                                    src={`/uploads/${images[1].name}`} // Thumbnail of the third image
                                    alt={images[1].name}
                                    className="w-48 h-48 object-cover rounded-lg opacity-60"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                                    <span className="text-white font-semibold text-lg">
                                      +{images.length - 1}{" "}
                                      {/* Display number of additional images */}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {/* Display the first two images */}
                                  {images.slice(0, 2).map((file, index) => (
                                    <div
                                      key={index}
                                      className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md border dark:border-gray-700 cursor-pointer"
                                    >
                                      <img
                                        src={`/uploads/${file.name}`} // Display image
                                        alt={file.name}
                                        className="w-48 h-48 object-cover rounded-lg"
                                        onClick={() => openImageModal(images)} // Open modal for all images
                                      />
                                    </div>
                                  ))}
                                </>
                              )}
                              <div className="mt-2">
                                {nonImageFiles.map((file, index) => (
                                  <div
                                    key={index}
                                    className=" w-52 text-gray-400 "
                                  >
                                    <a
                                      href={`/uploads/${file.name}`} // Link for non-image files
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-gray-400 underline"
                                    >
                                      {truncateFileName(file.name, 20)}
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </span>
                        <div className="text-xs m-1 text-gray-600">
                          {msg.time}
                        </div>
                        {/* Modal for viewing all images (only if images exist) */}
                        {showModal && images.length > 0 && (
                          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                            <div className="relative bg-white rounded-lg p-6">
                              <button
                                className="absolute top-2 right-2 text-white bg-red-500 rounded-full p-2"
                                onClick={closeImageModal} // Function to close modal
                              >
                                Close
                              </button>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {images.map((file, index) => (
                                  <div key={index} className="p-2">
                                    <img
                                      src={`/uploads/${file.name}`}
                                      alt={file.name}
                                      className="w-48 h-48 object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  Select a user to start chatting
                </div>
              )}
            </div>

            {selectedUser && (
              <div className="p-2 bg-gray-200 flex items-center w-11/12 mb-2 gap-2 ml-12 mt-2 rounded-full">
                <label htmlFor="file-input" className="cursor-pointer pl-1">
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
                    multiple
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
