import React, { useState, useEffect, useRef } from "react";
import socket from "./socket"; // Import your configured Socket.IO instance
import Videocall from "./Videocall";
import { userService } from "../../Services/authentication.service";
import { v4 as uuidv4 } from "uuid";
import Activity from "../PullRequest/Activity";

const Chat = () => {
  const chatContainerRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [data, setUser] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingStatus, setTypingStatus] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("id_token");
    const storedMessages = JSON.parse(localStorage.getItem("messages")) || [];
    const storedActiveUsers =
      JSON.parse(localStorage.getItem("activeUsers")) || [];

    const userData = userService.getUserData();
    setUser(userData);
    setMessages(storedMessages);
    if (storedToken) {
      setToken(storedToken);
      setIsLoggedIn(true);
      socket.emit("register_session", { token: storedToken });
    }

    setActiveUsers(storedActiveUsers);

    socket.on("receive_message", (data) => {
      console.log(data);
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, data];
        localStorage.setItem("messages", JSON.stringify(updatedMessages)); // Save messages to localStorage
        return updatedMessages;
      });
    });

    socket.on("update_active_users", (users) => {
      setActiveUsers(users);
      localStorage.setItem("activeUsers", JSON.stringify(users)); // Save active users to localStorage
    });

    socket.on("typing_status", (data) => {
      console.log(data);
      setTypingStatus(data);
    });

    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }

    return () => {
      socket.off("receive_message");
      socket.off("update_active_users");
      socket.off("typing_status");
    };
  }, []);

  const handleSendMessage = async () => {
    if (files.length > 0) {
      try {
        // Process files into the desired format
        const filesToSend = await Promise.all(
          files.map((file) => {
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const arrayBuffer = e.target.result;
                const timestamp = Date.now();
                const uniqueId = uuidv4();
                const newFileName = `${timestamp}_${uniqueId}_${file.name}`;
                resolve({
                  name: newFileName,
                  data: new Uint8Array(arrayBuffer),
                });
              };
              reader.onerror = () => reject(new Error("Failed to read file."));
              reader.readAsArrayBuffer(file);
            });
          })
        );

        // Emit the message after processing all files
        const newMessage = {
          message: message || "", // Default to empty string if no message
          target_id: selectedUser.id,
          token,
          files: filesToSend,
          from: data.user_id,
          to: selectedUser.id, // Assuming `selectedUser.id` is the recipient
        };

        socket.emit("send_message", newMessage);

        // Update UI locally
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages, newMessage];
          localStorage.setItem("messages", JSON.stringify(updatedMessages));
          return updatedMessages;
        });

        // Clear input fields
        setMessage("");
        setFiles([]);
      } catch (error) {
        console.error("Error sending message with files:", error);
      }
    } else {
      // Send text-only message
      const newMessage = {
        message: message.trim() || "No message", // Graceful handling of empty messages
        target_id: selectedUser.id,
        token,
        files: [],
        from: data.user_id,
        to: selectedUser.id, // Assuming `selectedUser.id` is the recipient
      };

      socket.emit("send_message", newMessage);

      // Update UI locally
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, newMessage];
        localStorage.setItem("messages", JSON.stringify(updatedMessages));
        return updatedMessages;
      });

      // Clear input fields
      setMessage("");
    }
  };

  const handleTyping = (typing) => {
    console.log(typing);
    socket.emit("typing", {
      token,
      from: data.user_id,
      to: selectedUser.id,
      is_typing: typing,
    });
    setIsTyping(typing);
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    localStorage.setItem("selectedUser", JSON.stringify(user)); // Save selected user to localStorage

    // Filter messages for the logged-in user and selected user
    const filteredMessages = messages.filter(
      (msg) =>
        (msg.from === data.user_id && msg.to === user.id) ||
        (msg.from === user.id && msg.to === data.user_id)
    );
    setMessages(filteredMessages);
  };
  const closeImageModal = () => {
    setShowModal(false);
    setModalFiles([]);
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

  const truncateFileName = (fileName, maxLength) => {
    if (fileName.length > maxLength) {
      const [name, extension] = fileName.split(".");
      const truncatedName = name.substring(0, maxLength - extension.length - 3);
      return `${truncatedName}...${extension}`;
    }
    return fileName;
  };

  return (
    <Activity>
      <div className="overflow-x-auto example">
        <div className=" bg-blue-100">
          <div className=" fixed left-56 right-3 top-24 bg-white  h-full z-40 flex flex-1 items-center border-b-2 border-gray-300   ">
            <div className="flex flex-1  min-h-full">
              <aside className="w-64 bg-gray-200 p-4 shadow-md ">
                <h2 className="text-xl font-bold mb-4">Active Users</h2>
                <ul>
                  {activeUsers
                    .filter((user) => user.id !== data.user_id) // Exclude the current user
                    .map((user) => (
                      <li
                        key={user.id}
                        onClick={() => handleSelectUser(user)} // Pass the whole user object
                        className={`cursor-pointer p-2 rounded-lg mb-2 ${
                          selectedUser?.id === user.id
                            ? "bg-gray-300"
                            : "hover:bg-gray-100"
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
                          {typingStatus.is_typing &&
                            typingStatus.from == user.id && (
                              <div
                                id="wave"
                                className="flex items-center space-x-2 mt-2  ml-4 mb-2"
                              >
                                {/* Typing Indicator Dots */}
                                <span className="dot one animate-typingWave delay-200">
                                  .
                                </span>
                                <span className="dot two animate-typingWave delay-400">
                                  .
                                </span>
                                <span className="dot three animate-typingWave delay-600">
                                  .
                                </span>
                              </div>
                            )}
                        </div>
                      </li>
                    ))}
                </ul>
              </aside>
              <main
                className="flex-1 flex flex-col shadow-md bg-white relative
           "
                style={{
                  backgroundSize: "cover", // Adjusts the image size
                  backgroundPosition: "center", // Centers the image
                  backgroundRepeat: "no-repeat", // Prevents the image from repeating
                }}
              >
                {selectedUser && (
                  <div
                    className="h-20 p-2 bg-white text-white flex items-center border-b-2 border-gray-200 justify-between "
                    style={{
                      marginTop: "-10px",
                    }}
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-400 rounded-full mr-3">
                        <img
                          className="w-12 h-12 rounded-full"
                          src={`/image/${selectedUser.img}`}
                          alt={selectedUser.username}
                        />
                      </div>
                    </div>
                    <div className="font-bold">
                      <Videocall user={selectedUser} data={data} />
                    </div>
                  </div>
                )}

                <div
                  className="flex-1 p-4 overflow-y-auto example"
                  style={{
                    maxHeight: "calc(100vh - 240px)", // Adjust height dynamically
                  }}
                >
                  {selectedUser ? (
                    <div>
                      {messages
                        .filter(
                          (msg) =>
                            msg.from === selectedUser?.id ||
                            msg.to === selectedUser?.id ||
                            msg.from === data.user_id ||
                            msg.to === data.user_id
                        ) // Filter messages for the selected user and current user
                        .map((msg, index) => {
                          const files = Array.isArray(msg.files)
                            ? msg.files
                            : [];
                          const images = files.filter((file) =>
                            /\.(jpeg|jpg|gif|png|svg|webp)$/i.test(file.name)
                          );
                          const nonImageFiles = files.filter(
                            (file) =>
                              !/\.(jpeg|jpg|gif|png|svg|webp)$/i.test(file.name)
                          );

                          const calculatedWidth = Math.min(
                            Math.max(msg.message.length * 8, 300), // Base width between 100px and 200px
                            400
                          );
                          return (
                            <>
                              <div
                                key={index}
                                className={`flex ${
                                  msg.from === data.user_id
                                    ? "justify-end"
                                    : "justify-start"
                                } mb-2`}
                              >
                                <div
                                  className={`max-w-xs p-2 rounded-lg mt-3 shadow-md ${
                                    msg.from === data.user_id
                                      ? "bg-blue-600 text-white"
                                      : "bg-blue-100 text-gray-800"
                                  } relative`}
                                  style={{
                                    maxWidth: "400px", // Maximum width
                                    width: `${calculatedWidth}px`, // Dynamic width based on message length
                                    padding: "8px",
                                    wordBreak: "break-word", // Ensures long words will break and not overflow
                                    overflowWrap: "break-word", // Prevents words from spilling out
                                  }}
                                >
                                  {msg.message}

                                  {msg.files && msg.files.length > 0 && (
                                    <div className="mt-2">
                                      {/* If there are more than one image, show the thumbnail and open modal */}
                                      {images.length > 1 ? (
                                        <div
                                          className="relative bg-white dark:bg-gray-800 p-2 w-52 rounded-lg shadow-md border dark:border-gray-700 cursor-pointer"
                                          onClick={() => openImageModal(images)} // Open modal for all images
                                        >
                                          <img
                                            src={`/uploads/${images[0].name}`} // Thumbnail of the first image
                                            alt={images[0].name}
                                            className="w-48 h-48 object-cover rounded-lg opacity-60"
                                          />
                                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                                            <span className="text-white font-semibold text-lg">
                                              +{images.length - 1}{" "}
                                              {/* Additional images count */}
                                            </span>
                                          </div>
                                        </div>
                                      ) : (
                                        // If there are 1 or 2 images, display them directly
                                        <div className="flex gap-2">
                                          {images
                                            .slice(0, 2)
                                            .map((file, index) => (
                                              <div
                                                key={index}
                                                className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md border dark:border-gray-700 cursor-pointer"
                                              >
                                                <img
                                                  src={`/uploads/${file.name}`}
                                                  alt={file.name}
                                                  className="w-58 h-48 object-cover rounded-lg"
                                                />
                                              </div>
                                            ))}
                                        </div>
                                      )}

                                      {/* Render non-image files */}
                                      <div className="mt-2">
                                        {nonImageFiles.map((file, index) => (
                                          <div
                                            key={index}
                                            className="w-52 text-gray-400"
                                          >
                                            <a
                                              href={`/uploads/${file.name}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-white underline"
                                            >
                                              {truncateFileName(file.name, 20)}
                                            </a>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Image modal */}
                                  {showModal && modalFiles.length > 0 && (
                                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                      <div className="relative bg-white rounded-lg p-6">
                                        <button
                                          className="absolute top-2 right-2 text-white bg-red-500 rounded-full p-2"
                                          onClick={closeImageModal} // Function to close modal
                                        >
                                          Close
                                        </button>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                          {modalFiles.map((file, index) => (
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
                              </div>
                              <div className="text-xs  text-gray-600">
                                {msg.time}
                              </div>
                            </>
                          );
                        })}
                      {selectedUser &&
                        typingStatus.is_typing &&
                        typingStatus.form === selectedUser.user_id && (
                          <div
                            id="wave"
                            className="flex items-center space-x-2 mt-2 mb-2"
                          >
                            <span className="srfriendzone">
                              <span className="srname">
                                {selectedUser.username}
                              </span>{" "}
                              is typing
                            </span>

                            {/* Typing Indicator Dots */}
                            <span className="dot one animate-typingWave delay-200">
                              .
                            </span>
                            <span className="dot two animate-typingWave delay-400">
                              .
                            </span>
                            <span className="dot three animate-typingWave delay-600">
                              .
                            </span>
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      Select a user to start chatting
                    </div>
                  )}
                </div>

                {selectedUser && (
                  <div className="bg-gray-200 flex items-center w-11/12 gap-2  m-4 rounded-full p-2 absolute bottom-20">
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
                      onFocus={() => handleTyping(true)} // Notify typing start
                      onBlur={() => handleTyping(false)} // Notify typing stop
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

                    {/* Display the added files */}
                  </div>
                )}
              </main>
            </div>
          </div>
        </div>
      </div>
    </Activity>
  );
};

export default Chat;
