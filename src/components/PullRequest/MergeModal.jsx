import React, { useContext } from "react";
import api from "../../api/api";
import { AppContext } from "../../context/AppContext";

const MergeModal = ({ pr, onClose, fetchPullRequests }) => {
  const { showAlert } = useContext(AppContext);

  const handleMerge = async (prNumber) => {
    try {
      const payload = {
        pr_number: prNumber, // Only include the PR number in the payload
      };

      const response = await api.put(`/merge`, JSON.stringify(payload), {
        headers: {
          "Content-Type": "application/json", // Ensure content type is set to JSON
        },
      });
      const { message } = response.data; // Destructure status and message from response.data
      console.log(message);
      if (message) {
        fetchPullRequests();
        showAlert(message, "success");
      }
    } catch (err) {
      showAlert(err.response.data.message, "error");
    }

    onClose(); // Close the modal or perform any other closing logic
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-300 mb-4">
          Merge Confirmation
        </h2>

        <div className="flex justify-end">
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded mr-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            onClick={() => handleMerge(pr.number)} // Pass pr.number to handleMerge
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default MergeModal;
