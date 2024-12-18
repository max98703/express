import React, { useState, useContext } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons
import api from "../../api/api";
import { AppContext } from "../../context/AppContext";
const ResetPasswordModal = ({ id, isOpen, onClose }) => {
  const { showAlert } = useContext(AppContext);

  const [localOldPassword, setLocalOldPassword] = useState("");
  const [localNewPassword, setLocalNewPassword] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // To toggle password visibility
  const [showNewPassword, setShowNewPassword] = useState(false); // To toggle new password visibility
  const [loading, setLoading] = useState(false); // Loading state for submit button

  // Function to generate a password with special characters
  const generateRandomPassword = () => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=<>?";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return password;
  };

  // Handle the password generation logic
  const handleGeneratePassword = () => {
    const password = generateRandomPassword();
    setGeneratedPassword(password);
    setLocalNewPassword(password); // Set the generated password to the new password input
  };

  // Handle password submit
  const handleSubmit = async () => {
    if (!localOldPassword || !localNewPassword) {
      setErrorMessage("Both old and new passwords are required.");
      return;
    }

    try {
      setLoading(true);

      const data = {
        id: id,
        oldPassword: localOldPassword,
        newPassword: localNewPassword,
      };
      // Send data to backend for password reset logic
      const response = await api.post("/resetPassword", data);
      if (response.data.message) {
        showAlert(response.data.message, "success");
        onClose(); // Close the modal after successful submission
      }
    } catch (error) {
      console.error("Error resetting password:", error.response.data.message);
      showAlert(error.response.data.message, "error");
    } finally {
      setLocalNewPassword("");
      setLocalOldPassword("");
      setLoading(false);
    }
  };

  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] relative">
          <h2 className="text-xl font-semibold mb-4">Reset Password</h2>

          {/* Old Password */}
          <div className="mb-4 relative">
            <label
              htmlFor="oldPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Old Password
            </label>
            <input
              id="oldPassword"
              type={showPassword ? "text" : "password"}
              value={localOldPassword}
              onChange={(e) => setLocalOldPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              placeholder="Enter old password"
              autoComplete="off"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 text-gray-500"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* New Password */}
          <div className="mb-3 relative">
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={localNewPassword}
              onChange={(e) => setLocalNewPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              placeholder="Enter new password"
              autoComplete="new-password" // Disable autofill
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-2 top-2 text-gray-500"
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Generate Password Button */}
          <div className="flex justify-between mb-4">
            <button
              onClick={handleGeneratePassword}
              className="border text-gray-600 px-2 py-2 rounded-md"
            >
              Generate Password
            </button>
            <span className="text-sm text-gray-500">{generatedPassword}</span>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`${
                loading ? "bg-blue-300" : "bg-blue-500"
              } text-white px-4 py-2 rounded-md`}
            >
              {loading ? "Processing..." : "Reset Password"}
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            X
          </button>
        </div>
      </div>
    )
  );
};

export default ResetPasswordModal;
