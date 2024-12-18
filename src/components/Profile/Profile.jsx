import React, { useState, useEffect, useContext, useRef } from "react";
import {
  FaBars,
  FaUser,
  FaBell,
  FaPaintBrush,
  FaGlobe,
  FaRegShareSquare,
  FaBook,
  FaComments,
  FaPlus,
  FaEdit,
  FaTimes,
} from "react-icons/fa";
import ResetPasswordModal from "../User/ResetPasswordModal";
import api from "../../api/api";
import { userService } from "../../Services/authentication.service.js";
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";


const SettingsPage = () => {
  const navigate = useNavigate();

  const inputRef = useRef(null);
  const handleRedirect = () => {
    navigate("/user/dashboard"); // Redirect to the user dashboard
  };
  const { showAlert } = useContext(AppContext);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [isValidName, setIsValidName] = useState(false);
  const [profileImage, setProfileImage] = useState(null); // To store the uploaded profile image
  const [isEditingName, setIsEditingName] = useState(false); // For toggling name edit mode
  const [userName, setUserName] = useState(""); // Initial name
  const [user, setUser] = useState(null); // Change the initial state to null
  const [isModalOpen, setIsModalOpen] = useState(false); // State for opening/closing the modal
  const [oldPassword, setOldPassword] = useState(""); // To store the old password input
  const [newPassword, setNewPassword] = useState(""); // To store the new password input
  const [userId, setUserId] = useState(null); // Add this state to hold the user ID
  const { handleFileUpload } = useAuth();
  const [isHovered, setIsHovered] = useState(false); // Track hover state
  const [selectedImage, setSelectedImage] = useState(null);

  const [users, setUserInfo] = useState({
    name: "",
    email: "",
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result); // Update the selected image with the preview
      };
      reader.readAsDataURL(file);
      setProfileImage(file);
    }
  };

  const updateProfileImage = async (file) => {
    const response = await handleFileUpload({ file });
    if (response.data.success) {
      showAlert(response.data.message, "success");
      await fetchProfile();
    } else {
      showAlert(response.message, "error");
    }
  };

  const updateUserName = async (data) => {
    const response = await handleFileUpload({ userName:data});
    if (response.data.success) {
      showAlert(response.data.message, "success");
      toggleEditName();
      fetchProfile();
    } else {
      showAlert(response.message, "error");
    }
  };
  const [qrCode, setQrCode] = useState(null);
  const [otp, setOtp] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const disable2FA = async () => {
    setIsLoading(true);
    try {
      const response = await api.post("/2fa/disable");
      showAlert(response.data.message, "success");
      fetchProfile();
    } catch (error) {
      showAlert(error.response.data.message, "error");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleEnable2FA = async () => {
 
    try {
      const response = await api.post("/2fa/enable"); // Replace with actual email
      setQrCode(response.data.qrCode);
    } catch (error) {
      console.log("Error enabling 2FA:", error);
      showAlert(error.response.data.message, "error");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setIsEditingName(false); // Close edit mode
        setIsHovered(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/profile");
      const { name, phoneNumber, logo, email, id , twoFactorEnabled} = data.user;
      setUser({
        userName: name || "",
        phone: phoneNumber || "",
        logo: logo || "",
        email: email || "",
        user_id: id || "",
        twoFactorEnabled:twoFactorEnabled || "",
      });
      setUserInfo({
        name: name || "",
        email: email || "",
      });
      setUserName(name);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Function to open the modal with necessary data
  const openModal = (rowData) => {
    setOldPassword(rowData.oldPassword || ""); // Example: setting the old password if needed
    setNewPassword(rowData.newPassword || ""); // Example: setting the new password if needed
    setUserId(user.user_id);
    setIsModalOpen(true); // Open the modal
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
  };

  const toggleSidebar = () => {
    setIsSidebarMinimized(!isSidebarMinimized);
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setNewEmail(email);
    // Simple email validation check
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    setIsValidEmail(emailPattern.test(email));
  };

  const handleAddEmail = () => {
    // Handle the action of adding the email address (e.g., API call)
    console.log("Email added:", newEmail);
    // Reset the field after adding email
    setNewEmail("");
    setIsValidEmail(false);
  };


  const toggleEditName = () => {
    setIsEditingName(!isEditingName); // Toggle between editing and viewing mode
    setIsHovered(false);
  };

  const logoutAllDevice = async (repo) => {
    try {
      const response = await api.post(`/logout/alldevice`);

      if (response.data.message) {
        localStorage.removeItem("id_token");
        window.location.reload(); // Corrected from window.reload()
      }
    } catch (err) {
      console.log("Error fetching pull requests:", err);
      showAlert(err.response.data.message, "error");
    }
  };

  const handleCloseModal = () => {
    setQrCode(null);
    setOtp(null);
  };
  const handleOtpSubmit = async () => {
    try {
      const response = await api.post("/2fa/verify", {
        otp,
        id: user.user_id, // Replace with the actual user ID
      });
      showAlert(response.data.message, "success");
      handleCloseModal();
      fetchProfile();
    } catch (error) {
      console.log("Error verifying OTP:", error);
      showAlert(error.response.data.message, "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };
  
  useEffect(() => {
    if (users.name === userName) {
      setIsValidName(false); // Initial value matches, invalid name
    } else {
      setIsValidName(true); // Name has been changed
    }
  }, [users.name, userName]); // Watch for changes to `userInfo.name`

  const handleUpload = () => {
    if (profileImage) {
      updateProfileImage(profileImage); // Pass selected image to the parent component for uploading
      handleCancel(); // Close the modal after upload
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setSelectedImage(null); // Clear the selected image
    setProfileImage(null);
  };
 
  const handleNameSubmit = (e) =>{
    e.preventDefault();
    updateUserName(users.name); 
  }
  return (
    <>
      {user && (
        <div className="flex h-screen">
          <button
            onClick={handleRedirect}
            className="fixed top-16 right-32  p-3   border rounded-full  "
          >
            <FaTimes className="text-red-500 text-lg " />{" "}
            {/* Using FaTimes for the cross icon */}
          </button>
          {qrCode && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-4/5 max-w-lg">
                <h3 className="text-xl font-bold mb-4 text-center">
                  Set Up Two-Factor Authentication
                </h3>
                <p>
                  Please scan this QR code using the Google Authenticator App or
                  equivalent.
                </p>
                <img
                  src={qrCode}
                  alt="QR Code for 2FA"
                  className="w-32 h-32 mx-auto border  mb-4"
                />
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleOtpSubmit();
                  }}
                  className="w-full"
                >
                  <label
                    htmlFor="otp"
                    className="block  font-bold text-gray-700"
                  >
                    Complete Two-Factor Setup
                  </label>
                  <p className="text-sm text-gray-400">
                    Authenticator code should be 6 numerical digits.
                  </p>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="border p-2 w-full rounded mb-4"
                    placeholder="Enter the OTP from your authenticator app"
                  />
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      className=" text-gray-700 py-2 px-4 rounded border"
                      onClick={() => {
                        setQrCode(null);
                        setOtp("");
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`py-2 px-4 rounded  ${
                        otp?.length === 6 ? "bg-blue-500" : "bg-gray-400"
                      }`}
                      disabled={otp.length !== 6}
                    >
                      Enable
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {selectedImage && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white w-72 rounded-lg">
                <div className="w-full h-12 bg-gray-100 mb-3 rounded-lg">
                  <h2 className=" text-lg mb-4 flex font-bold justify-center pt-2 ">
                    Edit Profile Image
                  </h2>
                </div>

                {/* Display Cropper only when an image is selected */}
                {selectedImage ? (
                  <div
                    className="mb-3 inset-0 bg-black bg-opacity-50 rounded-md  z-50"
                    style={{
                      width: "250px",
                      height: "250px",
                      overflow: "hidden",
                      margin: "0 auto",
                    }}
                  >
                    <img
                      src={selectedImage}
                      alt="Profile"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover", // Ensures image covers the entire circle
                        borderRadius: "50%",
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex justify-center mb-4">
                    <img
                      src={currentImage}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 mb-2 pr-3">
                  <button
                    onClick={handleCancel}
                    className="border text-black px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                  >
                    Upload
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Sidebar */}
          <aside
            className={`${
              isSidebarMinimized ? "w-20" : "w-64"
            } bg-gray-800 text-white fixed h-full transition-all`}
          >
            <div className="p-4 flex items-center justify-between border-b border-gray-700">
              <div
                className={`text-lg font-bold ${
                  isSidebarMinimized ? "hidden" : ""
                }`}
              >
                Settings
              </div>
              <FaBars
                className="text-xl cursor-pointer"
                onClick={toggleSidebar}
              />
            </div>
            <nav>
              <ul>
                <li className="py-2 px-4 hover:bg-gray-700 cursor-pointer flex items-center gap-2 text-xl">
                  <FaUser />
                  <span
                    className={`text-lg ${isSidebarMinimized ? "hidden" : ""}`}
                  >
                    Account
                  </span>
                </li>
                <li className="py-2 px-4 hover:bg-gray-700 cursor-pointer flex items-center gap-2">
                  <FaBell />
                  <span
                    className={`text-lg ${isSidebarMinimized ? "hidden" : ""}`}
                  >
                    Notifications
                  </span>
                </li>
                <li className="py-2 px-4 hover:bg-gray-700 cursor-pointer flex items-center gap-2">
                  <FaPaintBrush />
                  <span
                    className={`text-lg ${isSidebarMinimized ? "hidden" : ""}`}
                  >
                    Appearance
                  </span>
                </li>
                <li className="py-2 px-4 hover:bg-gray-700 cursor-pointer flex items-center gap-2">
                  <FaGlobe />
                  <span
                    className={`text-lg ${isSidebarMinimized ? "hidden" : ""}`}
                  >
                    Language & Region
                  </span>
                </li>
                <li className="py-2 px-4 hover:bg-gray-700 cursor-pointer flex items-center gap-2">
                  <FaRegShareSquare />
                  <span
                    className={`text-lg ${isSidebarMinimized ? "hidden" : ""}`}
                  >
                    Tell a Friend
                  </span>
                </li>
                <li className="py-2 px-4 hover:bg-gray-700 cursor-pointer flex items-center gap-2">
                  <FaBook />
                  <span
                    className={`text-lg ${isSidebarMinimized ? "hidden" : ""}`}
                  >
                    My Courses
                  </span>
                </li>
                <li className="py-2 px-4 hover:bg-gray-700 cursor-pointer flex items-center gap-2">
                  <FaComments />
                  <span
                    className={`text-lg ${isSidebarMinimized ? "hidden" : ""}`}
                  >
                    My Discussions
                  </span>
                </li>
              </ul>
            </nav>
          </aside>

          {/* Content Area */}
          <div
            className={`${
              isSidebarMinimized ? "ml-20" : "ml-64"
            }  overflow-auto p-2 w-2/3 example`}
          >
            {/* Profile Section */}
            <div className="bg-white p-4 rounded ">
              <h2 className="text-lg font-semibold mb-2">Profile</h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  {/* Profile Image */}
                  <div className="bg-green-500 text-white w-20 h-20 rounded-full flex items-center justify-center">
                    {user.logo ? (
                      <img
                        src={`/image/${user.logo}`}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      "M"
                    )}
                  </div>
                  {/* + button to add image */}
                  <label className="absolute bottom-0 right-0 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                    <FaPlus />
                    <input
                      type="file"
                      accept="image"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </label>
                </div>
                <div>
                  <div
                    className="relative flex items-center gap-2"
                    ref={inputRef}
                    onMouseOver={() => {
                      setIsHovered(true);
                    }}
                    onMouseOut={() => {
                      setIsHovered(false);
                    }}
                  >
                    <div>
                      {isEditingName ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={users.name}
                            name="name"
                            onChange={handleInputChange}
                            className="border border-gray-300 px-4 py-2 rounded text-sm"
                            autoFocus
                          />
                          <button
                            disabled={!isValidName}
                            className={`px-4 py-2 rounded ${
                              isValidName ? "bg-blue-500" : "bg-gray-400"
                            } text-white`}
                            onClick={handleNameSubmit}
                          >
                            Change Name
                          </button>
                        </div>
                      ) : (
                        <div className="font-bold text-xl">{users.name}</div>
                      )}
                    </div>

                    {/* Show the icon only if not editing and when hovered */}
                    {!isEditingName && isHovered && (
                      <button onClick={toggleEditName}>
                        <FaEdit className="text-blue-500 cursor-pointer" />
                      </button>
                    )}
                  </div>

                  <div className="text-gray-500">{user.email}</div>
                </div>
              </div>
            </div>

            {/* Emails Section */}
            <div className="bg-white p-4 rounded ">
              <h2 className="text-lg font-semibold mb-2">Emails</h2>
              <p className="text-gray-700 mb-2">
                You will only receive emails at your primary email address.
              </p>
              <p className="text-gray-700 mb-2">
                You can associate additional email addresses with your Ed
                account for the purpose of recovering your account in the case
                of a forgotten password.
              </p>
              <p className="text-gray-700 mb-2">
                You can log into Ed using any of your registered email
                addresses.
              </p>
              <div className="relative w-64">
                <input
                  type="text"
                  value={user.email}
                  readOnly
                  className="border border-gray-300 px-4 py-2 w-full pr-16 rounded text-sm"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-white bg-blue-500 px-1 rounded border">
                  PRIMARY
                </span>
              </div>

              {/* Add New Email Address */}
              <div className="mt-4">
                <h2 className="text-lg font-semibold mb-2">
                  Add Email Address
                </h2>
                <div className="flex gap-2">
                  <div className="relative w-64">
                    <input
                      type="email"
                      placeholder="Add email address"
                      value={newEmail}
                      onChange={handleEmailChange}
                      className="border border-gray-300 px-4 py-2 w-full rounded text-sm"
                    />
                  </div>
                  <button
                    onClick={handleAddEmail}
                    disabled={!isValidEmail}
                    className={`px-4 py-2 rounded ${
                      isValidEmail ? "bg-blue-500" : "bg-gray-400"
                    } text-white`}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Account Security */}
            <div className="bg-white p-4 rounded">
              <h2 className="text-lg font-semibold mb-2">Account Security</h2>
              <div className="flex gap-4 mb-4">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={() =>
                    openModal({
                      oldPassword: "currentPassword123",
                      newPassword: "newPassword456",
                    })
                  }
                >
                  Update Password
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded"
                  onClick={logoutAllDevice}
                >
                  Log Out All Sessions
                </button>
              </div>

              {/* 2FA Section */}
              <div className="border-t border-gray-300 pt-4">
                <h3 className="text-md font-semibold mb-2 text-gray-700">
                  Two-Factor Authentication
                </h3>
                <p className="text-gray-700 mb-4">
                  Increase account security by enabling two-factor
                  authentication.
                </p>
                <p className="text-gray-700 mb-4">
                  <strong>Why enable 2FA?</strong> By enabling 2FA, you'll need
                  to confirm your identity using an additional method (such as a
                  mobile app or SMS) when logging into your account. This adds
                  an extra layer of protection.
                </p>
                <p className="text-gray-700">
                  <strong>What if I lose access to my 2FA method?</strong> If
                  you lose access to your 2FA method (e.g., lose your phone),
                  you can still recover your account by contacting support.
                </p>
                <div className="flex gap-4 mt-1 mb-4">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={handleEnable2FA}
                  >
                    Set Up Two Factor Authentication
                  </button>
                  {user.twoFactorEnabled == true && (
                    <button
                      className="bg-gray-500 text-white px-4 py-2 rounded"
                      disabled={isLoading}
                      onClick={disable2FA}
                    >
                      {isLoading ? "Disabling..." : "Disable"}
                    </button>
                  )}
                </div>
              </div>
            </div>
            <ResetPasswordModal
              id={userId}
              isOpen={isModalOpen}
              onClose={closeModal}
              oldPassword={oldPassword}
              newPassword={newPassword}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsPage;
