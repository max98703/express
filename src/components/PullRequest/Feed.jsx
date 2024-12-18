import React, { useEffect, useState } from "react";
import api from "../../api/api";
import Activity from "./Activity";
import { formatDistanceToNow, parseISO } from "date-fns";
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

const FeedCard = ({ request, index, totalRequests }) => {
  const formatDate = (dateString) => {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  };

  const formatUsername = (username) => username.replace(/[0-9]+$/, "");

  return (
    <div className="flex space-x-4 mt-4">
      {/* Logo Outside Card with Vertical Line */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 text-white flex items-center justify-center rounded-full bg-blue-500 shadow-md">
          <img
            src={request.image || "/default-avatar.png"} // Add fallback image
            alt="Avatar"
            className="w-12 h-12 rounded-full"
          />
        </div>
        {index < totalRequests - 1 && (
          <div
            className="absolute left-1/2 w-px -translate-x-1/3 bg-gray-300"
            style={{ top: "4rem", height: "8rem" }}
          ></div>
        )}
      </div>

      {/* Activity Card */}
      <div className="flex-1 bg-gray-50 transition-shadow duration-200 ease-in-out shadow hover:shadow-lg rounded-md">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="text-blue-600 font-semibold flex gap-2 items-center">
              {formatUsername(request.pull_request_sender_username)}
              <div className="text-gray-500 text-sm">
                {formatDate(request.created_at)}
              </div>
            </div>
          </div>
          <a
            href={request.pull_request_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 text-sm hover:underline"
          >
            {request.pull_request_title}
          </a>
        </div>

        <p className="text-sm px-4 py-2">
          <span className="text-md border text-black w-full px-2 py-1 rounded bg-gray-100">
            {request.action} a pull request
          </span>
        </p>

        {/* Conditional rendering for pull_request_comment */}
        {request.pull_request_comment && (
          <div className=" px-4 py-2">
            <span className="text-lg text-black">Comment:</span>
            <p className="text-sm text-gray-700 bg-gray-100 rounded border border-gray-300 px-3 py-2 mb-2 break-words">
              {request.pull_request_comment.length > 400
                ? `${request.pull_request_comment.slice(0, 400)}...`
                : request.pull_request_comment}
            </p>
          </div>
        )}

        <hr className="my-2" />
        <p className="text-xs text-gray-500 px-4 pb-4">
          Repository:{" "}
          <a
            href={request.repository_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {request.repository_name}
          </a>
        </p>
      </div>
    </div>
  );
};

const Feed = () => {
  const [pullRequests, setPullRequests] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeed = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/webhook/responses");
      setPullRequests(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  return (
    <Activity>
      <div className="overflow-x-auto example mt-4 ">
        <div className="p-6 mt-4">
          <header>
            <div className="flex justify-between gap-5 lg:items-center">
              <div className="flex flex-col">
                <div className="text-2xl font-bold text-blue-600">Feeds</div>
                <p className="text-sm text-gray-500 mt-1">
                  Recent pull request activities
                </p>
              </div>
            </div>
          </header>

          <div className="flex-1 flex flex-col mt-4">
            <div className="flex-1 overflow-y-auto w-full lg:w-3/5">
              {isLoading ? (
                <div className="flex justify-center mt-4">
                  <Spinner />
                </div>
              ) : error ? (
                <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-md text-red-700">
                  <p className="font-semibold">Error: {error}</p>
                  <button
                    onClick={fetchFeed}
                    className="text-blue-500 underline mt-2"
                  >
                    Retry
                  </button>
                </div>
              ) : pullRequests.length > 0 ? (
                pullRequests.map((request, index) => (
                  <FeedCard
                    key={index}
                    request={request}
                    index={index}
                    totalRequests={pullRequests.length}
                  />
                ))
              ) : (
                <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-md text-yellow-700">
                  <p className="font-semibold">No Feeds Found</p>
                  <p className="mt-1">
                    It seems there are currently no feeds available.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Activity>
  );
};

export default Feed;
