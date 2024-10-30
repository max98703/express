import React, { useEffect, useState } from "react";
import api from "../../api/api";
import MergeModal from "./MergeModal";

const PullRequest = () => {
  const [pullRequests, setPullRequests] = useState([]);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPR, setSelectedPR] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Corrected use of isLoading

  useEffect(() => {
    const fetchPullRequests = async () => {
      setIsLoading(true); // Set loading to true at the start
      try {
        const response = await api.get("/pull-requests");
        if (response) {
          setPullRequests(response.data);
        }
      } catch (err) {
        console.error("Error fetching pull requests:", err.message);
        setError("Could not load pull requests.");
      } finally {
        setIsLoading(false); // Set loading to false in finally block
      }
    };
    fetchPullRequests();
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
    <div className="bg-white min-h-screen p-6">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Pull Requests</h1>
      {error && <p className="text-red-500">{error}</p>}
      {!isLoading ? (
        <>
          {pullRequests.length > 0 ? (
            <div className="overflow-x-auto bg-white border rounded-lg shadow-lg mt-4 dark:bg-gray-800 dark:border-gray-700">
              <table className="min-w-full table-auto text-left">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-gray-600 font-medium dark:text-gray-300">SN</th>
                    <th className="px-4 py-2 text-gray-600 font-medium dark:text-gray-300">Title</th>
                    <th className="px-4 py-2 text-gray-600 font-medium dark:text-gray-300">URL</th>
                    <th className="px-4 py-2 text-gray-600 font-medium dark:text-gray-300">State</th>
                    <th className="px-4 py-2 text-gray-600 font-medium dark:text-gray-300">Comment</th>
                    <th className="px-4 py-2 text-gray-600 font-medium dark:text-gray-300">Branch</th>
                    <th className="px-4 py-2 text-gray-600 font-medium dark:text-gray-300">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pullRequests.map((pr, index) => (
                    <tr key={pr.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300">
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{index + 1}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{pr.title}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        <a href={pr.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          {pr.html_url}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{pr.state}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{pr.body}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{pr.head.label}</td>
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
              <p className="mt-1">It seems there are currently no pull requests. You can create a new pull request to start contributing.</p>
            </div>
          )}
        </>
      ) : (
        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-md text-yellow-700">
          <p className="font-semibold">Loading....</p>
        </div>
      )}
      {isModalOpen && <MergeModal pr={selectedPR} onClose={closeModal} />}
    </div>
  );
};

export default PullRequest;
