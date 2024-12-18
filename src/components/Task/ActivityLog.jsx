import React from 'react'

import { format } from "date-fns";


const ActivityLog = ({isActivityOpen, closeActivity,activityLogs=null,setIsActivityOpen=null}) => {
    
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };
  
    
  return (
    <>
  <div
    className={`fixed inset-0 flex justify-end items-center z-50`}
    style={{
      transform: isActivityOpen ? "translateX(0)" : "translateX(100%)",
    }}
    onClick={(e) => {
      // Close the modal if the click is outside of the modal content
      if (e.target.id === "modal-overlay") {
        setIsActivityOpen(false);
      }
    }}
  >
    <div
      id="modal-overlay"
      className="absolute inset-0  bg-opacity-50"
    ></div>
    {/* Modal Content */}
    <div className="w-2/6 bg-white h-screen top-20 pb-20 relative">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b bg-blue-100">
        <h2 className="text-lg font-semibold text-gray-700">Activity Logs</h2>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          onClick={closeActivity}
          fill="currentColor"
          className="w-6 h-6 text-red-500 cursor-pointer"
        >
          <path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"></path>
        </svg>
      </div>

      {/* Logs */}
      <div className="p-4 bg-gray-100 overflow-y-auto h-[calc(100%-64px)] example">
        {activityLogs.length > 0 ? (
          activityLogs.map((log, index) => {
            const statusMap = {
              "0": { color: "bg-gray-400", text: "Assigned" },
              "1": { color: "bg-yellow-400", text: "In Progress" },
              "2": { color: "bg-blue-500", text: "Assigned For Review" },
              "3": { color: "bg-green-500", text: "Reviewed" },
              "4": { color: "bg-purple-500", text: "Completed" },
            };

            const prevStatus = statusMap[log.previousStatus] || {
              color: "bg-gray-300",
              text: "Unknown",
            };
            const currentStatus = statusMap[log.currentStatus] || {
              color: "bg-gray-300",
              text: "Unknown",
            };

            return (
              <div
                key={index}
                className="border rounded-lg mb-2 p-3 bg-white shadow-md h-36"
              >
                <div className="flex justify-between items-center border-b pb-2 mb-3">
                  <h3 className="text-sm font-medium text-gray-600">
                    {log.creator}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
                <div className="mb-3">
                  <span className="px-3 py-1 rounded-full text-sm text-gray-700 bg-blue-100">
                    {log.task.length > 50 ? `${log.task.slice(0, 50)}...` : log.task}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span>Change status to</span>
                  <span
                    className={`px-2 py-1 rounded-full text-white ${currentStatus.color}`}
                  >
                    {currentStatus.text}
                  </span>
                  <span>from</span>
                  <span
                    className={`px-2 py-1 rounded-full text-white ${prevStatus.color}`}
                  >
                    {prevStatus.text}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-3">{log.description}</p>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 text-sm text-center">No activity logs found.</p>
        )}
      </div>
    </div>
  </div>
</>
  )
}

export default ActivityLog
