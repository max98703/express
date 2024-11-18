import React, { useEffect, useState } from "react";
import Activity from "../PullRequest/Activity.jsx";
import api from "../../api/api.js";

const Dashboard = () => {
  const [groupedTasks, setGroupedTasks] = useState({
    Open: [],
    "In Progress": [],
    "To Review": [],
    Completed: [],
  });

  const fetchUserTasks = async () => {
    try {
      const response = await api.get("/user/task/dashboard");
      const fetchedTasks = response.data.tasks;
      console.log(fetchedTasks);
      // Group tasks by status
      const tasksByStatus = {
        Open: fetchedTasks.filter((task) => task.status === "0"),
        "In Progress": fetchedTasks.filter((task) => task.status === "1"),
        "To Review": fetchedTasks.filter(
          (task) => task.status === "2" || task.status === "3"
        ),
        Completed: fetchedTasks.filter((task) => task.status === "4"),
      };

      setGroupedTasks(tasksByStatus);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };
  const getBorderColor = (title) => {
    switch (title) {
      case "Open":
        return "border-blue-600"; // Blue border for "Open"
      case "In Progress":
        return "border-yellow-600"; // Yellow border for "In Progress"
      case "To Review":
        return "border-gray-800"; // Orange border for "To Review"
      case "Completed":
        return "border-red-600"; // Green border for "Completed"
      default:
        return "border-orange-600"; // Default gray border
    }
  };
  const [sortOrder, setSortOrder] = useState({
    Open: true,
    "In Progress": true,
    "To Review": true,
    Completed: true,
  });
  const sortTasksByPriority = (column) => {
    const sortedTasks = [...groupedTasks[column]].sort((a, b) => {
      return sortOrder[column]
        ? a.priority - b.priority
        : b.priority - a.priority;
    });

    setGroupedTasks((prevTasks) => ({
      ...prevTasks,
      [column]: sortedTasks,
    }));

    setSortOrder((prevOrder) => ({
      ...prevOrder,
      [column]: !prevOrder[column],
    }));
  };

  
  useEffect(() => {
    fetchUserTasks();
  }, []);

  // Helper function to get the first and last letter of assignee's name
  const getAssigneeInitials = (name) => {
    const nameParts = name.split(" ");
    const firstLetter = nameParts[0][0].toUpperCase(); // Capitalize the first letter
    const lastLetter = nameParts[nameParts.length - 1][0].toUpperCase(); // Capitalize the last letter
    return `${firstLetter}${lastLetter}`;
  };
  
  const renderTaskColumn = (title, tasks, bgColor, textColor) => {
    return (
      <div className={`w-11/12 py-2 px-2 h-1/6 overflow-y-auto relative`}>
        {/* Task count circle */}
        <div className={`border-t-2 ${getBorderColor(title)} rounded-sm`}>
          <div className={`mb-2 p-1 border-l border-r border-b border-gray-300 rounded-sm flex flex-1`}>
            <div className="flex flex-1 gap-2">
              <h3 className="text-sm font-semibold mb-2 ml-2 mt-1 text-gray-400">
                {title}
              </h3>
              <div className="w-5 h-5 bg-blue-300 mt-1 text-gray-200 rounded-full flex items-center justify-center font-semibold text-xs">
                {tasks.length}
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mt-1 text-gray-500"   onClick={() => sortTasksByPriority(title)}><path d="M19 3L23 8H20V20H18V8H15L19 3ZM14 18V20H3V18H14ZM14 11V13H3V11H14ZM12 4V6H3V4H12Z"></path></svg>
          </div>
        </div>
  
        {tasks.map((task) => (
        <div
        key={task.id}
        className="mb-2 p-3 bg-white border border-gray-300 rounded-lg transition-all duration-300 relative text-xs hover:shadow-lg hover:scale-105"
      >
      
            {/* Priority Indicator */}
            <div
              className={`absolute top-0 right-0 text-xs font-semibold px-2 py-1 rounded-tr-sm ${
                task.priority === "0"
                  ? "bg-red-500 text-white"
                  : task.priority === "1"
                  ? "bg-yellow-500 text-white animate-blink"
                  : "bg-green-500 text-white animate-blink"
              }`}
            >
              {task.priority === "1" ? "High" : task.priority === "2" ? "Urgent" : "Normal"}
            </div>
  
            <div className="mb-2 mt-2">
              <p className="text-xs text-gray-800 font-semibold ">{task.title}</p>
              <div className="inline-block mt-1">
                <div
                  className={`text-xs font-semibold flex items-center justify-center p-1 rounded-full ${
                    task.status === "0"
                      ? "bg-blue-200 text-blue-800"
                      : task.status === "1"
                      ? "bg-yellow-200 text-yellow-800"
                      : task.status === "2"
                      ? "bg-green-400 text-green-700"
                      : task.status === "3"
                      ? "bg-purple-200 text-purple-800"
                      : "bg-green-200 text-green-800"
                  }`}
                >
                  {task.status === "0"
                    ? "Assigned"
                    : task.status === "1"
                    ? "In Progress"
                    : task.status === "2"
                    ? "Assigned for Review"
                    : task.status === "3"
                    ? "Reviewed"
                    : "Completed"}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-2">
              {task.description.split(" ").slice(0, 15).join(" ")}
              {task.description.split(" ").length > 15 ? "..." : ""}
            </p>
  
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <div>
                <span className="mr-1 font-semibold text-gray-400">Assignee:</span>
                <div className="flex gap-1">
                  {task.collaborators
                    .filter((collab) => collab.flag)
                    .map((collab) => (
                      <span
                        key={collab.collaborator_id}
                        className="bg-yellow-300 text-gray-600 rounded-full w-6 h-6 flex items-center justify-center font-semibold"
                      >
                        {getAssigneeInitials(collab.user?.name)}
                      </span>
                    ))}
                </div>
              </div>
              <div>
                <span className="mr-1 font-semibold text-gray-400">Reviewer:</span>
                <div className="flex gap-1">
                  {task.collaborators
                    .filter((collab) => !collab.flag)
                    .map((collab) => (
                      <span
                        key={collab.collaborator_id}
                        className="bg-blue-300 text-gray-600 rounded-full w-6 h-6 flex items-center justify-center font-semibold"
                      >
                        {getAssigneeInitials(collab.user?.name)}
                      </span>
                    ))}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-3 h-3"
              >
                <path d="M9 1V3H15V1H17V3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H7V1H9ZM20 11H4V19H20V11ZM8 13V15H6V13H8ZM13 13V15H11V13H13ZM18 13V15H16V13H18ZM7 5H4V9H20V5H17V7H15V5H9V7H7V5Z"></path>
              </svg>
              {new Date(task.deadline).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    );
  };
  

  return (
    <Activity>
      <div className="overflow-x-auto mt-4 mb-4 bg-white h-full example">
        <div className="p-6 mt-12 w-lvw ">
          <div className="flex gap-4">
            {/* Open Column */}
            {renderTaskColumn("Open", groupedTasks.Open, "gray-50", "blue-600")}

            {/* In Progress Column */}
            {renderTaskColumn(
              "In Progress",
              groupedTasks["In Progress"],
              "yellow-50",
              "yellow-600"
            )}

            {/* To Review Column */}
            {renderTaskColumn(
              "To Review",
              groupedTasks["To Review"],
              "orange-50",
              "orange-600"
            )}

            {/* Completed Column */}
            {renderTaskColumn(
              "Completed",
              groupedTasks.Completed,
              "green-50",
              "green-600"
            )}
          </div>
        </div>
      </div>
    </Activity>
  );
};

export default Dashboard;
