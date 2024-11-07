import React, { useEffect, useState } from "react";
import api from "../../api/api.js";
import Spinner from "../Spinner/Spinner.jsx";
import Activity from "./Activity.jsx";
import { format } from "date-fns"; // Import date-fns for date formatting
import MergeModal from "./MergeModal";

const Collaborators = () => {
  const [pullRequests, setPullRequests] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPRs, setUserPRs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpens, setIsModalOpens] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPRLoading, setIsPRLoading] = useState(false);
  const [selectedPR, setSelectedPR] = useState(null);
  const fetchPullRequests = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/pr/collaborator");
      if (response) {
        setPullRequests(response.data);
      }
    } catch (err) {
      console.error("Error fetching pull requests:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserPRs = async (username) => {
    setIsPRLoading(true);
    try {
      const response = await api.get(`/pr/collaborator/${username}`);
      console.log(response);
      setUserPRs(response.data);
    } catch (error) {
      console.error("Error fetching user PRs:", error.message);
    } finally {
      setIsPRLoading(false);
    }
  };

  const openModal = (username) => {
    setSelectedUser(username);
    fetchUserPRs(username); // Fetch PRs for the selected user
    setIsModalOpen(true);   // Open the modal
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsModalOpens(false);
    setUserPRs([]);
    setSelectedPR([]);
  };

  const openModals = (pr) => {
    setSelectedPR(pr);
    setIsModalOpens(true);
  };

  useEffect(() => {
    fetchPullRequests();
  }, []);

  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "dd-MM-yyyy hh:mm a"); // Format date as d-m-y h:mm AM/PM
  };

  return (
    <Activity>
      <div className="overflow-x-auto example mb-12 mt-4">
        <div className="p-6 mt-4">
          <header>
            <div className="flex justify-between gap-5 lg:items-center">
              <div className="flex flex-col">
                <div className="flex items-center gap-4">
                  <div className="mb-1 text-2xl font-bold text-primary-500 dark:text-gray-300">
                    Collaborators
                  </div>
                </div>
                <nav>
              <ol class="flex items-center gap-x-1.5 p-0 m-0">
                <li class="breadcrumb-item">
                  <a
                    class="flex items-center cursor-pointer text-gray-500  dark:text-gray-300 text-[12px] gap-1 font-bold hover:text-primary-800 dark:hover:text-gray-400"
                    href="{{ url('/feeds') }}"
                  >
                    <svg
                      class="w-3.5 h-3.5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M21 19.9997C21 20.552 20.5523 20.9997 20 20.9997H4C3.44772 20.9997 3 20.552 3 19.9997V9.48882C3 9.18023 3.14247 8.88893 3.38606 8.69947L11.3861 2.47725C11.7472 2.19639 12.2528 2.19639 12.6139 2.47725L20.6139 8.69947C20.8575 8.88893 21 9.18023 21 9.48882V19.9997ZM19 18.9997V9.97791L12 4.53346L5 9.97791V18.9997H19Z"
                        fill="currentColor"
                      ></path>
                    </svg>
                    Home
                  </a>
                </li>
                <li class="dark:text-gray-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    fill="currentColor"
                    class="bi bi-chevron-right"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                    />
                  </svg>
                </li>
              </ol>
            </nav>
              </div>
            </div>
          </header>
          {error && <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-md text-yellow-700">
              <p className="font-semibold">{error}</p>
              
            </div>}
          {!isLoading ? (
            <>
              {pullRequests.length > 0 ? (
                <div className="overflow-x-auto bg-white border rounded-lg shadow-md mt-4 dark:bg-gray-800 dark:border-gray-700">
                  <table className="min-w-full table-auto text-left">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-gray-600 font-medium dark:text-gray-300">SN</th>
                        <th className="px-4 py-2 text-gray-600 font-medium dark:text-gray-300">Image</th>
                        <th className="px-4 py-2 text-gray-600 font-medium dark:text-gray-300">User</th>
                        <th className="px-4 py-2 text-gray-600 font-medium dark:text-gray-300">Profile</th>
                        <th className="px-4 py-2 text-gray-600 font-medium dark:text-gray-300">Role</th>
                        <th className="px-4 py-2 text-gray-600 font-medium dark:text-gray-300">Permission</th>
                        <th className="px-4 py-2 text-gray-600 font-medium dark:text-gray-300">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pullRequests.map((pr, index) => {
                        const roleClass = pr.role_name === 'admin' ? 'bg-gray-500 text-white' : 'bg-gray-800 text-gray-400 text-white';
                        return (
                          <tr key={pr.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300">
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{index + 1}</td>
                            <td  className="px-4 py-3 text-gray-700 dark:text-gray-300">
                            <img src={pr.avatar_url} className="w-12 h-12 text-white flex items-center justify-center rounded-full bg-primary-500 shadow-md" />
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{pr.login}</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                              <a href={pr.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                {pr.html_url}
                              </a>
                            </td>
                            <td>
                              <span className={`${roleClass} px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap`}>
                                {pr.role_name}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                              {JSON.stringify(pr.permissions, null, 2)}
                            </td>
                            <td className="px-4 py-3">
                              <div
                                onClick={() => openModal(pr.login)}
                              
                              >
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path d="M7 8.82929C8.16519 8.41746 9 7.30622 9 6C9 4.34315 7.65685 3 6 3C4.34315 3 3 4.34315 3 6C3 7.30622 3.83481 8.41746 5 8.82929V15.1707C3.83481 15.5825 3 16.6938 3 18C3 19.6569 4.34315 21 6 21C7.65685 21 9 19.6569 9 18C9 16.6938 8.16519 15.5825 7 15.1707V8.82929ZM21 18C21 19.6569 19.6569 21 18 21C16.3431 21 15 19.6569 15 18C15 16.3431 16.3431 15 18 15C19.6569 15 21 16.3431 21 18ZM18 7.5C18.8284 7.5 19.5 6.82843 19.5 6C19.5 5.17157 18.8284 4.5 18 4.5C17.1716 4.5 16.5 5.17157 16.5 6C16.5 6.82843 17.1716 7.5 18 7.5ZM19.5 11.5C19.5 12.3284 18.8284 13 18 13C17.1716 13 16.5 12.3284 16.5 11.5C16.5 10.6716 17.1716 10 18 10C18.8284 10 19.5 10.6716 19.5 11.5Z"></path></svg>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-md text-yellow-700">
                  <p className="font-semibold">No Collaborators Found</p>
                  <p className="mt-1">It seems there are currently no collaborators.</p>
                </div>
              )}
            </>
          ) : (
              <Spinner />
          )}
        </div>

        {/* Modal for displaying PRs */}
        {isModalOpen && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-3/4 max-h-[60%] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-primary-500 dark:text-gray-300">
                  PRs by {selectedUser}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-red-500 hover:text-red-600 font-bold"
                >
                  Close
                </button>
              </div>

              {isPRLoading ? (
                <Spinner />
              ) : userPRs.length > 0 ? (
                <div className="overflow-y-auto example" style={{ maxHeight: "60vh" }}>
                <table className="min-w-full table-auto text-left bg-white dark:bg-gray-800 rounded-md
                 ">
                <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-gray-600 font-medium dark:text-gray-300">Title</th>
                      <th className="px-4 py-2 text-gray-600 font-medium dark:text-gray-300">Link</th>
                      <th className="px-4 py-2 text-gray-600 font-medium dark:text-gray-300">Status</th>
                      <th className="px-4 py-2 text-gray-600 font-medium dark:text-gray-300">Created At</th>
                      <th className="px-4 py-2 text-gray-600 font-medium dark:text-gray-300">
                      Action
                    </th>
                    </tr>
                  </thead>
                  <tbody>
                    {userPRs.map((pr, idx) => (
                      <tr key={idx} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300">
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{pr.title}</td>
                        <td className="px-4 py-3 text-blue-500 dark:text-blue-400">
                          <a href={pr.url} target="_blank" rel="noopener noreferrer">
                            {pr.url}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{pr.state}</td>
                        <td  className="px-4 py-3 text-gray-700 dark:text-gray-300">  {formatDate(pr.created_at)}</td>
                        <td className="px-4 py-3">
                          {pr.state === "open" &&(
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded mr-2 transition-all duration-300"
                          onClick={() => openModals(pr)}
                        >
                          Merge
                        </button>)}
                      </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              ) : (
                <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-md text-yellow-700">
                <p className="text-gray-700 dark:text-gray-300">No PRs found for this user.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {isModalOpens && (
        <MergeModal
          pr={selectedPR}
          onClose={closeModal}
          fetchPullRequests={fetchPullRequests}
        />
      )}
    </Activity>
  );
};

export default Collaborators;
