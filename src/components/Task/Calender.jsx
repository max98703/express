import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"; // Icon library for navigation buttons

const localizer = momentLocalizer(moment);

const MyCalendar = ({ groupedTasks }) => {
  const [popupTask, setPopupTask] = useState(null);
  const [bounce, setBounce] = useState(false); // State to trigger bounce animation

  // Aggregate tasks by deadline date
  const taskCountsByDate = {};

  Object.keys(groupedTasks).forEach((status) => {
    groupedTasks[status].forEach((task) => {
      const deadline = task.deadline;
      if (!taskCountsByDate[deadline]) {
        taskCountsByDate[deadline] = [];
      }
      taskCountsByDate[deadline].push(task); // Add task details instead of just count
    });
  });

  // Transform aggregated tasks into individual events for the calendar
  const events = Object.entries(taskCountsByDate).flatMap(([deadline, tasks]) =>
    tasks.map((task) => ({
      title: (
        <div className="flex items-center">
          {/* Conditionally style task title */}
          <span
            className={`font-semibold ${
              task.priority === "2" ? "blinking-circle" : "text-white"
            }`}
          >
            {task.title}
          </span>
        </div>
      ),
      start: new Date(deadline),
      end: new Date(deadline),
      task: task, // Store the full task details for display
    }))
  );

  // Custom styles for events
  const eventPropGetter = (event) => {
    let bgColor = "#F3F4F6"; // Default light gray for task event
    if (event.task.status === "completed") {
      bgColor = "#D1FAE5"; // Light green for completed tasks
    } else if (event.task.status === "in-progress") {
      bgColor = "#FFEDD5"; // Light pink for in-progress tasks
    }

    return {
      style: {
        backgroundColor: bgColor,
        color: "#333333", // Darker text for better contrast
        borderRadius: "10px",
        padding: "12px",
        fontWeight: "600",
        textAlign: "left", // Align text to the left to fit task title
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
        cursor: "pointer",
        transition: "all 0.3s ease-in-out",
        marginBottom: "10px", // Space between tasks on the same day
        maxWidth: "90%", // Prevent it from going too wide
        wordWrap: "break-word", // Ensure long task titles break into new lines
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        position: "relative", // Ensure absolute positioning works within this container
      },
    };
  };

  // Custom toolbar
  const CustomToolbar = ({ onNavigate, label }) => (
    <div className="flex justify-between items-center bg-white p-4  shadow-lg mb-4">
      <button
        onClick={() => onNavigate("TODAY")}
        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 border border-gray-300 rounded-md transition-all"
      >
        Today
      </button>
      <h2 className="text-lg font-semibold text-gray-800">{label}</h2>
      <div>
        <button
          onClick={() => onNavigate("PREV")}
          className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 hover:text-blue-600 border border-gray-300 rounded-md transition-all"
        >
          <FaChevronLeft />
        </button>
        <button
          onClick={() => onNavigate("NEXT")}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 border border-gray-300 rounded-md transition-all"
        >
          <FaChevronRight />
        </button>
      </div>
    </div>
  );

  // Close the popup
  const closePopup = () => {
    setPopupTask(null);
    setBounce(false); // Reset the bounce state when popup is closed
  };

  // Trigger bounce animation when popupTask is set
  useEffect(() => {
    if (popupTask) {
      setBounce(true);
    }
  }, [popupTask]);

  const statusMapping = {
    "0": { color: "bg-yellow-300", label: "Assigned" },
    "1": { color: "bg-blue-500 text-white", label: "In Progress" },
    "2": { color: "bg-green-400 text-white", label: "Assigned For Review" },
    "3": { color: "bg-gray-500 text-white", label: "Reviewd" },
    "4": { color: "bg-blue-300 text-white", label: "Completed" },
    "5": { color: "bg-gree-300 text-white", label: "Closed" },
  };

  return (
    <div className=" w-[150vh] h-[85vh] overflow-hidden ">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="month"
        views={["month"]} // Disable other views (Week, Day)
        components={{
          toolbar: CustomToolbar,
        }}
        onSelectEvent={(event) => setPopupTask(event.task)} // Show task details in a popup on click
        style={{
          fontFamily: "Inter, sans-serif",
          color: "#374151",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)", // Soft shadow around the calendar
        }}
      />

      {/* Popup for showing task details */}
      {popupTask && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-all"
          onClick={(e) => {
            // Close the modal if the click is outside of the modal content
            if (e.target.id === "modal-overlay") {
              closePopup();
            }
          }}
        >
          <div
            id="modal-overlay"
            className="absolute inset-0  bg-opacity-50"
          ></div>
          <div
            className={`bg-white rounded-2xl p-8 max-w-2xl w-full shadow-lg ${bounce ? "bounce" : ""} relative`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="absolute top-4 left-0 pb-6 ">
                {/* Priority indicator with improved styling */}
                <span
                  className={`${
                    popupTask.priority === "0"
                      ? "bg-red-500"
                      : popupTask.priority === "1"
                      ? "bg-yellow-500 animate-blink"
                      : "bg-green-500 animate-blink"
                  } text-white px-4 py-2 font-semibold  shadow-md`}
                >
                  {popupTask.priority === "0"
                    ? "Normal"
                    : popupTask.priority === "1"
                    ? "High"
                    : "Urgent"}
                </span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900">{popupTask.title}</h3>
              <button
                onClick={closePopup}
                className="text-gray-500 hover:text-gray-800 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="h-7 w-7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Task Description */}
            <p className="text-md text-gray-700 mb-6 border p-4 rounded-lg bg-gray-50 shadow-sm">{popupTask.description}</p>

            {/* Task Status */}
            <div
              className={`flex items-center justify-start ${statusMapping[popupTask.status]?.color} text-white px-3 py-2 rounded-full w-max mb-6`}
            >
              <span className="font-semibold text-md">{statusMapping[popupTask.status]?.label}</span>
            </div>

            {/* Task Deadline */}
            <p className="text-sm text-gray-500 mt-3">
              <strong>Deadline:</strong> {popupTask.deadline}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCalendar;
