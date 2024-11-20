import React, { useEffect, useState } from "react";
import api from "../../api/api";
import Activity from "./Activity";
import { format } from "date-fns"; // Import date-fns for date formatting
import Spinner from "../Spinner/Spinner.jsx";

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4 text-gray-400"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="4" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="2" y1="8" x2="22" y2="8"></line>
    <path d="M16 12h2v2h-2zm-4 0h2v2h-2z"></path>
  </svg>
);

const Feed = () => {
  const [pullRequests, setPullRequests] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeed = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/webhook/responses");
      console.log(response);
      setPullRequests(response.data);
    } catch (err) {
      console.error("Error fetching pull requests:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "dd-MM-yyyy hh:mm a"); // Format date as d-m-y h:mm AM/PM
  };

  const formatUsername = (username) => {
    return username.replace(/[0-9]+$/, ""); // Remove any digits at the end
  };

  return (
    <Activity>
      <div className="overflow-x-auto example mt-4">
        <div className="p-6 mt-4">
          <header>
            <div className="flex justify-between gap-5 lg:items-center">
              <div className="flex flex-col">
                <div className="flex items-center gap-4">
                  <div className="mb-1 text-2xl font-bold text-primary-500 dark:text-gray-300">
                    Feeds
                  </div>
                </div>
                <nav>
                  <ol className="flex items-center gap-x-1.5 p-0 m-0">
                    <li className="breadcrumb-item">
                      <a
                        className="flex items-center cursor-pointer text-gray-500 dark:text-gray-300 text-[12px] gap-1 font-bold hover:text-primary-800 dark:hover:text-gray-400"
                        href="/feeds"
                      >
                        <svg
                          className="w-3.5 h-3.5"
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
                    <li className="dark:text-gray-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        fill="currentColor"
                        className="bi bi-chevron-right"
                        viewBox="0 0 16 16"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                        />
                      </svg>
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          </header>

          <div className="flex-1 flex flex-col">
            {/* Scrollable Feed Content */}
            <div className="flex-1 overflow-y-auto w-3/5">
              {isLoading ? (
                <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-md text-yellow-700">
                  <p className="font-semibold">
                    <Spinner />
                  </p>
                </div>
              ) : error ? (
                <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-md text-yellow-700">
              <p className="font-semibold">{error}</p>
            </div>
              ) : (
                pullRequests.map((request, index) => (
                  <div key={index} className="flex space-x-4 mt-4">
                    {/* Logo Outside Card with Vertical Line */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 text-white flex items-center justify-center rounded-full bg-primary-500 shadow-md">
                      <img src={request.image} className="w-12 h-12 text-white flex items-center justify-center rounded-full bg-primary-500 shadow-md" />
                      </div>
                      {index < pullRequests.length - 1 && (
                        <div
                          className="absolute left-1/2 w-px -translate-x-1/2 bg-gray-300"
                          style={{ top: "3rem", height: "8rem" }} // Adjust height to make it longer
                        ></div>
                      )}
                    </div>

                    {/* Activity Card */}
                    <div className="flex-1 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200   ease-in-out">
                      {/* Background for Username and Date */}
                      <div className="bg-gray-100 p-2">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-lg text-gray-500 w-18">
                            <a
                              href={request.pull_request_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-500 font-medium hover:underline"
                            >
                              {request.pull_request_title}
                            </a>
                          </p>
                          <div className="flex items-center">
                            <CalendarIcon />
                            <p className="text-xs text-gray-400 ml-1">
                              {formatDate(request.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 text-sm mb-1 p-2">
                        <span className="font-bold text-lg">
                          {request.pull_request_sender_username
                            ? formatUsername(
                                request.pull_request_sender_username
                              )
                            : ""}
                        </span>{" "}
                        {request.action} a pull request
                      </p>

                      <p className="text-md text-gray-700 rounded p-2 mb-2">
                        <span className="font-bold text-lg text-gray-700">
                          {request.pull_request_comment !== null
                            ? `Comment: ${request.pull_request_comment}`
                            : ""}
                        </span>
                      </p>

                      <hr className="my-2" />
                      <p className="text-xs text-gray-400 p-2">
                        Repository:{" "}
                        <a
                          href={request.repository_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-500 hover:underline"
                        >
                          {request.repository_name}
                        </a>
                      </p>
                    </div>
                  </div>
                ))
              )}
              { pullRequests.length === 0 &&(
<>
<div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-md text-yellow-700">
              <p className="font-semibold">No Feeds Found</p>
              <p className="mt-1">
                It seems there are currently no Feeds Available.
              </p>
            </div>
</>
              )}
            </div>
          </div>
        </div>
      </div>
    </Activity>
  );
};

export default Feed;
