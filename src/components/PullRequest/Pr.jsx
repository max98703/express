import React, { useEffect, useState } from "react";
import api from "../../api/api";
import MergeModal from "./MergeModal";
import Spinner from "../Spinner/Spinner.jsx";
import Activity from "./Activity.jsx";
const PullRequest = () => {
  const [pullRequests, setPullRequests] = useState([]);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPR, setSelectedPR] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Corrected use of isLoading

  const fetchPullRequests = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/pull-requests");
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

  useEffect(() => {
    fetchPullRequests(); // Call fetchPullRequests on component mount
  }, []);

  const openModal = (pr) => {
    setSelectedPR(pr);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPR(null);
  };

  return (
    <Activity>
  <div className="overflow-x-auto example mt-4">
  <div className=" p-6 mt-4">
      <header>
        <div class="flex justify-between gap-5  lg:items-center">
          <div class="flex flex-col">
            <div class="flex items-center gap-4">
              <div class="mb-1 text-2xl font-bold text-primary-500 dark:text-gray-300">
                Pull Request
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
          <div></div>
        </div>
      </header>
      {error && <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-md text-yellow-700">
              <p className="font-semibold">{error}</p>
              
            </div>}
      {!isLoading ? (
        <>
          {pullRequests.length > 0 ? (
            <div className="overflow-x-auto bg-white  border rounded-lg shadow-md mt-4 dark:bg-gray-800 dark:border-gray-700">
              <table className="min-w-full table-auto text-left">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-gray-600 font-medium dark:text-gray-300">
                      SN
                    </th>
                    <th className="px-4 py-2 text-gray-600 font-medium dark:text-gray-300">
                      Title
                    </th>
                    <th className="px-4 py-2 text-gray-600 font-medium dark:text-gray-300">
                      URL
                    </th>
                    <th className="px-4 py-2 text-gray-600 font-medium dark:text-gray-300">
                      State
                    </th>
                    <th className="px-4 py-2 text-gray-600 font-medium dark:text-gray-300">
                      Comment
                    </th>
                    <th className="px-4 py-2 text-gray-600 font-medium dark:text-gray-300">
                      Branch
                    </th>
                    <th className="px-4 py-2 text-gray-600 font-medium dark:text-gray-300">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pullRequests.map((pr, index) => (
                    <tr
                      key={pr.id}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                    >
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {pr.title}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        <a
                          href={pr.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {pr.html_url}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {pr.state}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {pr.body}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {pr.head.label}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded mr-2 transition-all duration-300"
                          onClick={() => openModal(pr)}
                        >
                          Merge
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-md text-yellow-700">
              <p className="font-semibold">No Pull Requests Found</p>
              <p className="mt-1">
                It seems there are currently no pull requests. You can create a
                new pull request to start contributing.
              </p>
            </div>
          )}
        </>
      ) : (
            <Spinner />
      )}
      {isModalOpen && (
        <MergeModal
          pr={selectedPR}
          onClose={closeModal}
          fetchPullRequests={fetchPullRequests}
        />
      )}
    </div>
    </div>
    </Activity>
  );
};

export default PullRequest;
