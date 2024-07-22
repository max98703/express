import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const Reset = () => {
  const initialState = {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      };
    
      const [formState, setFormState] = useState(initialState);
  const [message, setMessage] = useState('');

  const { resetPassword } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = formState;
    try {
      const response = await resetPassword({ currentPassword, newPassword, confirmPassword });
      setMessage(response.data.message);
      setTimeout(() => {
        setMessage('');
      }, 3000);
      setFormState(initialState);
    } catch (error) {
      setMessage('Failed to reset password. Please try again.');
      setTimeout(() => {
        setMessage('');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen pt-24 lg:px-8 bg-white">
      <div className="max-w-md w-full mx-auto">
        <h2 className="text-2xl font-bold text-center mb-4">Password Reset</h2>
        {message && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white text-center py-2">
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="bg-white px-8 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="currentPassword">
              Current Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="currentPassword"
              name="currentPassword"
              type="password"
              placeholder="Current Password"
              value={formState.currentPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">
              New Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="New Password"
              value={formState.newPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={formState.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Reset;
