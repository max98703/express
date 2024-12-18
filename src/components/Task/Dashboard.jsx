import React, { useEffect, useState, useMemo, useRef, useContext } from "react";
import Activity from "../PullRequest/Activity.jsx";
import api from "../../api/api.js";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import Spinner from "../Spinner/Spinner.jsx";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { AppContext } from "../../context/AppContext";
import ActivityLog from "./ActivityLog.jsx";

import {
  FaUserCheck,
  FaUser,
  FaFlag,
  FaPen,
  FaImage,
  FaComment,
  FaCalendarAlt,
  FaFilter,
  FaFilePdf,
  FaFileCsv,
  FaUserPlus,
  FaFileWord,
  FaFileAlt,
  FaPlus
} from "react-icons/fa"; // Importing React Icons
import { useNavigate } from "react-router-dom";
import Comment from "./Comment";
import Note from "./Note.jsx";
import { userService } from "../../Services/authentication.service";
import Calender from "./Calender.jsx";
import { format } from "date-fns";

const Dashboard = () => {
  const { showAlert } = useContext(AppContext);
  const navigate = useNavigate();
  const [groupedTasks, setGroupedTasks] = useState({
    Open: [],
    "In Progress": [],
    "To Review": [],
    Completed: [],
  });
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState(null);
  const [users, setUsers] = useState();
  const [loginUser, setloginUser] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [assignees, setAssignees] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [projectss, setProjectss] = useState();
  const [taskDetails, setTaskDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatePriority, setUpdatePriority] = useState("0");
  const [updateAssignees, setUpdateAssignees] = useState([]);
  const [updateReviewers, setUpdateReviewers] = useState([]);
  const [deadline, setDeadline] = useState("");
  const modalRef = useRef(null);
  const fetchUserTasks = async () => {
    try {
      const response = await api.get("/user/task/dashboard");
      const fetchedTasks = response.data.tasks;
      console.log(fetchedTasks);
      const users = response.data.users;
      const projectss = response.data.projects;
      // Group tasks by status
      const tasksByStatus = {
        Open: fetchedTasks.filter((task) => task.status === "0"),
        "In Progress": fetchedTasks.filter((task) => task.status === "1"),
        "To Review": fetchedTasks.filter(
          (task) => task.status === "2" || task.status === "3"
        ),
        Completed: fetchedTasks.filter((task) => task.status === "4"),
      };
      const projectSet = new Set();

      fetchedTasks.forEach((task) => {
        if (task.project) {
          const { id, name } = task.project;
          projectSet.add(JSON.stringify({ id, name })); // Serialize to ensure uniqueness
        }
      });
      const projects = Array.from(projectSet).map((item) => JSON.parse(item)); // Deserialize to get array of objects
      const collaboratorSet = new Set();

      fetchedTasks.forEach((task) => {
        task.collaborators.forEach((collaborator) => {
          const name = collaborator.user?.name;
          const id = collaborator.user?.id;
          if (name) {
            collaboratorSet.add(JSON.stringify({ id, name })); // Add unique names to the set
          }
        });
      });
      const uniqueCollaborators = Array.from(collaboratorSet).map((name) =>
        JSON.parse(name)
      );
      console.log(uniqueCollaborators);
      setMembers(uniqueCollaborators);
      setProjects(projects);
      setGroupedTasks(tasksByStatus);
      setUsers(users);
      setProjectss(projectss);
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

  const [sortOrder, setSortOrder] = useState({
    Open: true,
    "In Progress": true,
    "To Review": true,
    Completed: true,
  });
  const sortTasksByPriority = (column) => {
    const sortedTasks = [...groupedTasks[column]].sort((a, b) => {
      return sortOrder[column] ? a.id - b.id : b.id - a.id;
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
    const data = userService.getUserData();
    console.log(data);
    setloginUser(data);
    fetchUserTasks();
  }, []);

  const statusMapping = {
    0: { color: "bg-yellow-300", label: "Assigned" },
    1: { color: "bg-blue-500 text-white", label: "In Progress" },
    2: { color: "bg-green-400 text-white", label: "Assigned For Review" },
    3: { color: "bg-gray-500 text-white", label: "Reviewd" },
    4: { color: "bg-blue-300 text-white", label: "Completed" },
    5: { color: "bg-gree-300 text-white", label: "Closed" },
  };

  // Helper function to get the first and last letter of assignee's name
  const getAssigneeInitials = (name) => {
    const nameParts = name.split(" ");
    const firstLetter = nameParts[0][0].toUpperCase(); // Capitalize the first letter
    const lastLetter = nameParts[nameParts.length - 1][0].toUpperCase(); // Capitalize the last letter
    return `${firstLetter}${lastLetter}`;
  };

  const handleProjectFilter = (project) => {
    setSelectedProject(project); // Update selected project
    setSelectedMembers(null); // Clear member filter
  };

  const handleMemberFilter = (member) => {
    setSelectedMembers(member); // Update selected member
    setSelectedProject(null); // Clear project filter
  };

  const filteredTasks = useMemo(() => {
    if (!selectedProject && !selectedMembers) return groupedTasks; // Return all tasks if neither project nor member is selected

    const filtered = {};

    Object.keys(groupedTasks).forEach((status) => {
      filtered[status] = groupedTasks[status].filter((task) => {
        // Check if task matches the selected project
        const matchesProject =
          !selectedProject || task.project?.name === selectedProject;

        // Check if any of the task's collaborators match the selected member
        const matchesMember =
          !selectedMembers ||
          task.collaborators.some(
            (collaborator) => collaborator.user.name === selectedMembers
          );

        // Include tasks that match at least one condition
        return matchesProject && matchesMember;
      });
    });

    return filtered;
  }, [selectedProject, selectedMembers, groupedTasks]);

  console.log(filteredTasks);
  const renderTaskColumn = (title, tasks, bgColor, textColor) => {
    return (
      <div
        className={`w-11/12  px-2 mt-3 relative max-h-[600px] overflow-y-auto example`} // Fixed height and scrollable
      >
        {/* Task count circle */}
        <div className={`border-t-2 ${getBorderColor(title)} rounded-sm`}>
          <div
            className={`mb-2 p-1 border-l border-r border-b border-gray-300 rounded-sm flex flex-1`}
          >
            <div className="flex flex-1 gap-2">
              <h3 className="text-sm font-semibold mb-2 ml-2 mt-1 text-gray-400">
                {title}
              </h3>
              <div className="w-5 h-5 bg-blue-300 mt-1 text-gray-200 rounded-full flex items-center justify-center font-semibold text-xs">
                {tasks.length}
              </div>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 mt-1 text-gray-500 cursor-pointer"
              onClick={() => sortTasksByPriority(title)}
            >
              <path d="M19 3L23 8H20V20H18V8H15L19 3ZM14 18V20H3V18H14ZM14 11V13H3V11H14ZM12 4V6H3V4H12Z"></path>
            </svg>
          </div>
        </div>

        {/* Task items */}
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => fetchTaskDetails(task.id)}
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
              {task.priority === "1"
                ? "High"
                : task.priority === "2"
                ? "Urgent"
                : "Normal"}
            </div>
            <div
              className={`absolute top-0 left-0 text-xs font-semibold px-2 py-1 rounded-tr-sm text-gray-400`}
              onClick={() => handleTaskClick(task.id)}
            >
              #{task.id}
            </div>
            <div className="mb-2 mt-2">
              <p className="text-xs text-gray-800 font-semibold ">
                {task.title}
              </p>
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
                <span className="mr-1 font-semibold text-gray-400">
                  Assignee:
                </span>
                <div className="flex gap-1">
                  {task.collaborators
                    .filter((collab) => collab.flag == "0")
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
                <span className="mr-1 font-semibold text-gray-400">
                  Reviewer:
                </span>
                <div className="flex gap-1">
                  {task.collaborators
                    .filter((collab) => collab.flag == "1")
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

  const [activeSection, setActiveSection] = useState("tasks"); // Default to 'tasks'
  const [activeDetail, setActiveDetail] = useState("Comments"); // Default to 'tasks'

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const handleDetailChange = (section) => {
    setActiveDetail(section);
  };

  const fadeInAnimation = {
    animation: "fadeIn 1s ease-in-out",
  };

  const closeTask = () => {
    setIsModalOpen(false);
  };
  const handleFilter = async () => {
    try {
      // Create URLSearchParams to send filter data as query parameters
      const params = new URLSearchParams();

      // Append selected assignee, reviewers, and project to the query parameters
      if (assignees) {
        params.append("assignee", JSON.stringify(assignees));
      }
      if (reviewers) {
        params.append("reviewers", JSON.stringify(reviewers));
      }
      if (selectedProjects) {
        params.append("project", selectedProjects);
      }

      // Send a GET request with the query parameters
      const response = await api.get("/user/task/dashboard", {
        params: params, // Attach query parameters
      });

      const fetchedTasks = response.data.tasks;
      console.log(fetchedTasks);
      const users = response.data.users;
      const projects = response.data.projects;

      // Group tasks by status
      const tasksByStatus = {
        Open: fetchedTasks.filter((task) => task.status === "0"),
        "In Progress": fetchedTasks.filter((task) => task.status === "1"),
        "To Review": fetchedTasks.filter(
          (task) => task.status === "2" || task.status === "3"
        ),
        Completed: fetchedTasks.filter((task) => task.status === "4"),
      };

      // Set the filtered data
      setMembers(users); // Set the list of users
      setProjects(projects); // Set the list of projects
      setGroupedTasks(tasksByStatus); // Set grouped tasks based on status
      setUsers(users); // Set users
      setProjectss(projects); // Set projects
      closeTask();
    } catch (err) {
      console.error("Error fetching filtered tasks:", err);
    }
  };

  const handleTaskClick = (taskId) => {
    navigate(`/task/details/${taskId}`); // Navigate to the task detail page with the task ID
  };

  const fetchTaskDetails = async (id) => {
    // Declare the loading state

    try {
      setTaskModalOpen(true); // Open modal after fetching data
      const response = await fetch(`http://localhost:5000/tasks/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      setTaskDetails(data); // Store task details in state
      setUpdatePriority(data.priority || "0");
      setDeadline(data.deadline || ""); // Set deadline if present
      setUpdateAssignees(
        Array.isArray(data.collaborators)
          ? data.collaborators
              .filter((collaborator) => collaborator.collaborator_flag == 0)
              .map((collaborator) => collaborator.collaborator_id)
          : []
      );

      setUpdateReviewers(
        Array.isArray(data.collaborators)
          ? data.collaborators
              .filter((collaborator) => collaborator.collaborator_flag == 1)
              .map((collaborator) => collaborator.collaborator_id)
          : []
      );
    } catch (err) {
      console.log(err);
    } finally {
      // Set loading to false after the API call
      setIsLoading(false);
    }
  };

  const [isTaskDetailVisible, setTaskDetailVisible] = useState(false); // State to toggle task details

  const toggleTaskDetails = () => {
    setTaskDetailVisible(!isTaskDetailVisible); // Toggle task details visibility
  };

  const clearFliter = () => {
    setSelectedProjects("");
    setAssignees([]);
    setReviewers([]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    // Prepare the data to be sent to the API
    const taskData = {
      priority: updatePriority,
      assignees: updateAssignees,
      reviewers: updateReviewers,
      deadline: deadline,
    };
    console.log(taskData);
    try {
      // Make the API request with the dynamic task ID in the URL
      const response = await api.post(
        `/task/update/${taskDetails.task_id}`,
        taskData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Handle the response message
      const { message } = response.data;
      if (message) {
        showAlert(message, "success"); // Show success alert
      }
    } catch (error) {
      console.error("Error updating task:", error);
      showAlert("An error occurred while updating the task.", "error");
    }
  };
  const formatNameToInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Activity>
      <div className="overflow-x-auto mt-4 bg-white h-full example">
        <div className=" mt-16 w-full flex ">
          {/* Sidebar for Projects */}
          <div className="w-1/5 bg-white border-r-2 p-2 h-[650px] border-gray-200  ">
            {/* Projects Section */}
            <div className="flex justify-between items-center w-full ">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-2 flex-grow">
                Projects
              </h3>
              {activeSection === "tasks" && (
                <div
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center px-3 py-2 0 rounded-lg text-gray-600 border  hover:bg-gray-200 -mt-4"
                >
                  <FaFilter /> Filter
                </div>
              )}
            </div>

            <ul className="h-48 overflow-y-auto space-y-3 example">
              {projects.map((project) => (
                <li
                  key={project.id}
                  onClick={(e) => handleProjectFilter(project.name)}
                  className="flex justify-between items-center p-2  hover:bg-blue-50 border border-gray-300 rounded-lg transition-colors duration-200 shadow-sm"
                >
                  <span className="font-medium text-gray-800">
                    {project.name}
                  </span>
                  <button className="text-gray-500 hover:text-blue-600 transition">
                    ⋮
                  </button>
                </li>
              ))}
            </ul>

            {/* Team Members Section */}
            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">
              Team Members
            </h3>
            <ul className="h-52 overflow-y-auto space-y-3 example">
              {members.map((member, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center p-1  hover:bg-blue-50 border border-gray-100 rounded-lg transition-colors duration-200 shadow-sm"
                >
                  <div
                    key={member.id}
                    onClick={(e) => handleMemberFilter(member.name)}
                    className="flex items-center gap-3"
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center rounded-full text-sm font-semibold">
                      {member.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </div>
                    {/* Member Name */}
                    <span className="font-medium text-gray-800">
                      {member.name}
                    </span>
                  </div>
                  {/* Action Button */}
                  <button className="text-gray-500 hover:text-blue-600 transition">
                    ⋮
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full h-full">
            <div className="w-full h-12 flex justify-between  border-b-2 border-gray-300">
              <ul className="flex gap-12 items-center h-full px-4">
                <li
                  onClick={() => handleSectionChange("overview")}
                  className={`text-sm font-semibold text-gray-700 hover:text-blue-600 cursor-pointer
       ${
         activeSection === "overview"
           ? "border-b-4 border-blue-500 transition-all"
           : ""
       }`}
                >
                  Overview
                </li>
                <li
                  onClick={() => handleSectionChange("tasks")}
                  className={`text-sm font-semibold text-gray-700 hover:text-blue-600 cursor-pointer
       ${
         activeSection === "tasks"
           ? "border-b-4 border-blue-500 transition-all"
           : ""
       }`}
                >
                  Tasks
                </li>
                <li
                  onClick={() => handleSectionChange("notes")}
                  className={`text-sm font-semibold text-gray-700 hover:text-blue-600 cursor-pointer
       ${
         activeSection === "notes"
           ? "border-b-4 border-blue-500 transition-all"
           : ""
       }`}
                >
                  Notes
                </li>
                <li
                  onClick={() => handleSectionChange("questions")}
                  className={`text-sm font-semibold text-gray-700 hover:text-blue-600 cursor-pointer
       ${
         activeSection === "questions"
           ? "border-b-4 border-blue-500 transition-all"
           : ""
       }`}
                >
                  Calender
                </li>
              </ul>
            </div>
            {/* Tasks Section */}
            {activeSection == "tasks" && (
              <div className="flex-1 flex gap-4 h-full" style={fadeInAnimation}>
                {/* Open Column */}
                {renderTaskColumn(
                  "Open",
                  filteredTasks.Open,
                  "gray-50",
                  "blue-600"
                )}

                {/* In Progress Column */}
                {renderTaskColumn(
                  "In Progress",
                  filteredTasks["In Progress"],
                  "yellow-50",
                  "yellow-600"
                )}

                {/* To Review Column */}
                {renderTaskColumn(
                  "To Review",
                  filteredTasks["To Review"],
                  "orange-50",
                  "orange-600"
                )}

                {/* Completed Column */}
                {renderTaskColumn(
                  "Completed",
                  filteredTasks.Completed,
                  "gray-50",
                  "blue-600"
                )}
              </div>
            )}
            <style>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
            {activeSection === "notes" && (
              <div
                style={fadeInAnimation}
                className="p-6 h-full  w-full  overflow-y-auto example"
              >
                <Note />
              </div>
            )}
            {activeSection === "questions" && (
              <div style={fadeInAnimation}>
                <Calender groupedTasks={groupedTasks} />
              </div>
            )}
          </div>
        </div>
        {isModalOpen && (
          <div
            className="fixed inset-0 flex justify-center items-center z-50"
            onClick={(e) => {
              // Close the modal if the click is outside of the modal content
              if (e.target.id === "modal-overlay") {
                closeTask();
              }
            }}
          >
            <div
              id="modal-overlay"
              className="absolute inset-0  bg-opacity-50"
            ></div>
            <div
              className="bg-white rounded-lg shadow-xl w-1/3 h-98 overflow-y-auto p-6 transform transition-transform duration-500 ease-out"
              style={{
                transform: isModalOpen ? "translateX(0)" : "translateX(-100%)",
                transitionDelay: isModalOpen ? "300ms" : "0ms", // Adds a delay when opening
              }}
            >
              <div className="flex justify-between w-full ">
                <h2 className="text-2xl font-bold mb-6 text-gray-700">
                  Filter
                </h2>
                <h2 className="pt-2 underline" onClick={clearFliter}>
                  clear filter
                </h2>
              </div>
              <form onSubmit={(e) => e.preventDefault()}>
                {/* Project */}
                <div className="mb-3">
                  <label className="block text-gray-600 mb-1">Project</label>
                  <select
                    value={selectedProjects}
                    onChange={(e) => setSelectedProjects(e.target.value)}
                    className="border border-gray-300 focus:ring focus:ring-green-300 rounded-md p-3 w-full"
                    required
                  >
                    <option value="">Select Project</option>
                    {projectss.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assignees */}
                <div className="mb-3">
                  <label className="block text-gray-600 mb-1">Assignees</label>
                  <FormControl sx={{ width: "100%" }}>
                    <InputLabel id="assignees-label">Assignees</InputLabel>
                    <Select
                      labelId="assignees-label"
                      id="assignees"
                      multiple
                      value={assignees}
                      onChange={(e) => setAssignees(e.target.value)}
                      input={<OutlinedInput label="Assignees" />}
                    >
                      {users.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>

                {/* Reviewers */}
                <div className="mb-3">
                  <label className="block text-gray-600 mb-1">Reviewers</label>
                  <FormControl sx={{ width: "100%" }}>
                    <InputLabel id="reviewers-label">Reviewers</InputLabel>
                    <Select
                      labelId="reviewers-label"
                      id="reviewers"
                      multiple
                      value={reviewers}
                      onChange={(e) => setReviewers(e.target.value)}
                      input={<OutlinedInput label="Reviewers" />}
                    >
                      {users.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleFilter}
                    className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition"
                  >
                    Filter
                  </button>
                  <button
                    type="button"
                    onClick={closeTask}
                    className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isTaskModalOpen && (
          <>
            {loginUser.role == "1" ? (
              <div
                className="fixed inset-0 flex justify-end items-center z-50 top-20 right-2"
                onClick={(e) => {
                  // Close the modal if the click is outside of the modal content
                  if (e.target.id === "modal-overlay") {
                    setTaskModalOpen(false);
                    setTaskDetails([]); // Clear task details
                    setTaskDetailVisible(false);
                    setIsLoading(true);
                  }
                }}
              >
                <div
                  id="modal-overlay"
                  className="absolute inset-0  bg-opacity-50"
                ></div>
                <div
                  className={`realtive  overflow-auto max-h-screen bg-white ${
                    isTaskDetailVisible ? "w-5/12" : " w-2/5"
                  } h-full example shadow-xl transform transition-transform duration-500 ease-in-out border-2 rounded-lg border ${
                    isTaskModalOpen ? "translate-x-0" : "translate-x-full"
                  }`}
                >
                  {isLoading ? (
                    <Spinner />
                  ) : (
                    <>
                      {/* Modal Header */}
                      <div className="p-3 border-b-2 border-gray-400 flex justify-between items-center">
                        <h5 className="text-2xl text-gray-700 font-bold w-4/5">
                          #{taskDetails.task_id} ||{" "}
                          {taskDetails.project_name || "N/A"}
                        </h5>
                        <label className="inline-flex items-center cursor-pointer pt-2 mr-4 text-gray-500">
                          comment:
                          <input
                            type="checkbox"
                            checked={isTaskDetailVisible}
                            onChange={toggleTaskDetails}
                            className="sr-only peer "
                          />
                          <div className="relative w-11 ml-1 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                        <div
                          className="text-gray-600 hover:text-gray-800 font-bold text-3xl"
                          onClick={() => {
                            setTaskModalOpen(false);
                            setTaskDetails([]); // Clear task details
                            setTaskDetailVisible(false);
                          }}
                        >
                          &times;
                        </div>
                      </div>
                      {!isTaskDetailVisible && (
                        <>
                          {/* Modal Content */}
                          <div className="p-6 space-y-4">
                            {/* Task Title */}
                            <div className="flex justify-between items-center">
                              <h3 className="text-gray-700 font-bold text-xl">
                                {taskDetails.task_title || "No title provided"}{" "}
                                <span className="font-normal text-gray-500 bg-blue-200 p-2 rounded-full">
                                  {taskDetails.createdBy || "N/A"}
                                </span>
                              </h3>
                            </div>

                            {/* Task Description */}
                            <div>
                              <h3 className="text-lg font-semibold flex items-center border-b-2 border-gray-200 mb-2">
                                <FaPen className="text-gray-500 mr-2" />{" "}
                                Description:
                              </h3>
                              <p className="text-gray-500 border p-2 rounded-lg">
                                {taskDetails.task_description}
                              </p>
                            </div>

                            {/* Form for updating task details */}
                            <form onSubmit={handleUpdate} className="space-y-4">
                              {/* Priority */}
                              <div className="flex gap-2 items-center">
                                <h3 className="text-lg font-semibold flex items-center">
                                  <FaFlag className="mr-2 text-gray-500" />
                                  Priority:
                                </h3>
                                <select
                                  onChange={(e) =>
                                    setUpdatePriority(e.target.value)
                                  }
                                  value={updatePriority}
                                  className="border border-gray-300 focus:ring focus:ring-green-300 rounded-md p-3 ml-4 w-full"
                                >
                                  <option value="0">Normal</option>
                                  <option value="1">High</option>
                                  <option value="2">Urgent</option>
                                </select>
                              </div>

                              {/* Assignees */}
                              <div className="flex gap-2 items-center mb-4">
                                <h3 className="text-lg font-semibold flex items-center">
                                  <FaUserCheck className="mr-2 text-yellow-500" />
                                  Assignees:
                                </h3>
                                <FormControl sx={{ width: "100%" }}>
                                  <InputLabel id="assignees-label">
                                    Assignees
                                  </InputLabel>
                                  <Select
                                    labelId="assignees-label"
                                    id="assignees"
                                    multiple
                                    value={updateAssignees}
                                    onChange={(e) =>
                                      setUpdateAssignees(e.target.value)
                                    }
                                    input={<OutlinedInput label="Assignees" />}
                                  >
                                    {users.map((user) => (
                                      <MenuItem key={user.id} value={user.id}>
                                        {user.name}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </div>

                              {/* Reviewers */}
                              <div className="flex gap-2 items-center mb-4">
                                <h3 className="text-lg font-semibold flex items-center">
                                  <FaUser className="mr-2 text-blue-500" />
                                  Reviewers:
                                </h3>
                                <FormControl
                                  sx={{ width: "100%" }}
                                  className="ml-1"
                                >
                                  <InputLabel id="reviewers-label">
                                    Reviewers
                                  </InputLabel>
                                  <Select
                                    labelId="reviewers-label"
                                    id="reviewers"
                                    multiple
                                    value={updateReviewers}
                                    onChange={(e) =>
                                      setUpdateReviewers(e.target.value)
                                    }
                                    input={<OutlinedInput label="Reviewers" />}
                                  >
                                    {users.map((user) => (
                                      <MenuItem key={user.id} value={user.id}>
                                        {user.name}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </div>

                              {/* Deadline */}
                              <div className="flex gap-2 items-center mb-4">
                                <h3 className="text-lg font-semibold flex items-center">
                                  <FaCalendarAlt className="mr-2 text-gray-500" />
                                  Deadline:
                                </h3>
                                <input
                                  type="datetime-local"
                                  value={deadline}
                                  onChange={(e) => setDeadline(e.target.value)}
                                  className="border border-gray-300 focus:ring focus:ring-green-300 rounded-md p-3 ml-3 w-full"
                                />
                              </div>

                              {/* Update Button */}
                              <div className="flex justify-end p-2 rounded-lg mb-4">
                                <button
                                  type="submit"
                                  className="text-white px-6 py-2 rounded-lg bg-blue-700 w-auto"
                                >
                                  Update
                                </button>
                              </div>
                            </form>
                          </div>
                        </>
                      )}

                      {isTaskDetailVisible && (
                        <div>
                          <Comment
                            status={taskDetails.status}
                            Comments={taskDetails.activity}
                            taskId={taskDetails.task_id}
                            fetchTaskDetails={fetchTaskDetails}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div
                  className="fixed inset-0 flex justify-end items-center z-50 top-20 right-2 "
                  onClick={(e) => {
                    // Close the modal if the click is outside of the modal content
                    if (e.target.id === "modal-overlay") {
                      setTaskModalOpen(false);
                      setTaskDetails([]); // Clear task details
                      setTaskDetailVisible(false);
                      setIsLoading(true);
                      setActiveDetail("Comments");
                    }
                  }}
                >
                  <div
                    id="modal-overlay"
                    className="absolute inset-0  bg-opacity-50"
                  ></div>
                <div
  className={`relative overflow-auto max-h-screen bg-white w-[700px] h-full example shadow-xl transform transition-transform duration-500 ease-in-out border-2 ${
    isTaskModalOpen ? "translate-x-0" : "translate-x-full"
  } rounded-tl-2xl rounded-tr-2xl border`}
>
                    {isLoading ? (
                      <Spinner />
                    ) : (
                      <>
                        {/* Modal Header */}
                        <div className="p-2 border-b-2 border-gray-400 flex justify-between items-center">
                          <h5 className="text-md text-gray-400  w-4/5 flex gap-2 mt-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-6 h-6"
                            >
                              <path d="M6.41421 5H10V3H3V10H5V6.41421L9.29289 10.7071L10.7071 9.29289L6.41421 5ZM21 14H19V17.5858L14.7071 13.2929L13.2929 14.7071L17.5858 19H14V21H21V14Z"></path>
                            </svg>{" "}
                            | {taskDetails.project_name || "N/A"} /{" "}
                            {statusMapping[taskDetails.status].label}
                          </h5>
                          <label className="inline-flex items-center cursor-pointer pt-2 mr-4 text-gray-500">
                            comment:
                            <input
                              type="checkbox"
                              checked={isTaskDetailVisible}
                              onChange={toggleTaskDetails}
                              className="sr-only peer "
                            />
                            <div className="relative w-11 ml-1 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                          <div
                            className="text-gray-600 hover:text-gray-800 font-bold text-3xl"
                            onClick={() => {
                              setTaskModalOpen(false);
                              setTaskDetails([]); // Clear task details
                              setTaskDetailVisible(false);
                              setActiveDetail("Comments");
                            }}
                          >
                            &times;
                          </div>
                        </div>
                        {!isTaskDetailVisible && (
                          <>
                            {/* Modal Content */}
                            <div className="p-6 space-y-4">
                              {/* Task Title */}
                              <div className="flex justify-between items-center">
                                <h3 className="text-gray-700 font-bold text-xl">
                                  {taskDetails.task_title ||
                                    "No title provided"}
                                </h3>
                              </div>
                              {/* Created By & Deadline */}
                              <div className="flex gap-2 items-center mb-4">
                                <span className="text-md text-gray-600 font-bold">
                                  Created by{" "}
                                  <span className="font-normal text-gray-500 bg-blue-200 p-2 rounded-full">
                                    {taskDetails.createdBy || "N/A"}
                                  </span>{" "}
                                  || Deadline{" "}
                                  <span className="font-normal">
                                    {taskDetails.deadline || "No deadline"}
                                  </span>
                                </span>
                              </div>

                              {/* Priority */}
                              <div className="flex gap-2 items-center">
                                <h3 className="text-lg  flex items-center">
                                  <FaFlag className="mr-2 text-gray-500" />{" "}
                                  {/* React Icon for Priority */}
                                  Priority:
                                </h3>
                                <p
                                  className={`text-white py-1 px-4 rounded-full ${
                                    taskDetails.priority === "0"
                                      ? "bg-gray-400" // Normal - Gray
                                      : taskDetails.priority === "1"
                                      ? "bg-red-500" // High - Red
                                      : "bg-yellow-500" // Urgent - Yellow
                                  }`}
                                >
                                  {taskDetails.priority === "0"
                                    ? "Normal"
                                    : taskDetails.priority === "1"
                                    ? "High"
                                    : "Urgent"}
                                </p>
                              </div>

                              {/* Assigner */}
                              <div className="flex gap-2 items-center mb-4">
                                <h3 className="text-lg  flex items-center">
                                  <FaUserCheck className="mr-2 text-gray-500" />{" "}
                                  {/* React Icon for Assigner */}
                                  Assigner:
                                </h3>
                                <div className="flex items-center">
                                  {taskDetails.collaborators &&
                                  taskDetails.collaborators.length > 0
                                    ? taskDetails.collaborators
                                        .filter(
                                          (collaborator) =>
                                            collaborator.collaborator_flag !== 0
                                        ) // Assigner
                                        .map((collaborator, index) => (
                                          <div key={index} className="bg-blue-200 flex  mb-2 rounded-full ">
                                          {/* User Logo on the left side */}
                                          <div className="w-8 h-8 rounded-full overflow-hidden ">
                                            <img
                                              src={`/image/${collaborator.collaborator_logo}`}
                                              alt={collaborator.collaborator_name}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                          
                                          {/* Collaborator Name */}
                                          <span className="text-gray-600 py-2 px-2">
                                            {collaborator.collaborator_name}
                                          </span>
                                        </div>
                                        
                                        
                                        ))
                                    : "No assigner found"}
                                  <div className="flex items-center text-black  px-2 py-1 rounded-lg text-sm hover:border-gray-500 transition duration-200 border-2 border-gray-200 ml-2">
                                    <FaUserPlus className="mr-2" /> {/* Icon */}
                                    Invite
                                  </div>
                                </div>
                              </div>

                              {/* Collaborators */}
                              <div className="flex gap-2 items-center mb-4">
                                <h3 className="text-lg flex items-center">
                                  <FaUser className="mr-2 text-gray-500" />{" "}
                                  {/* React Icon for Collaborators */}
                                  Reviwers:
                                </h3>
                                <div className="flex items-center space-x-2">
                                  {taskDetails.collaborators &&
                                  taskDetails.collaborators.length > 0
                                    ? taskDetails.collaborators
                                        .filter(
                                          (collaborator) =>
                                            collaborator.collaborator_flag == 0
                                        ) // Regular Collaborators
                                        .map((collaborator, index) => (
                                          <div key={index} className="bg-blue-200 flex  mb-2 rounded-full ">
                                          {/* User Logo on the left side */}
                                          <div className="w-8 h-8 rounded-full overflow-hidden ">
                                            <img
                                              src={`/image/${collaborator.collaborator_logo}`}
                                              alt={collaborator.collaborator_name}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                          
                                          {/* Collaborator Name */}
                                          <span className="text-gray-600 py-2 px-2">
                                            {collaborator.collaborator_name}
                                          </span>
                                        </div>
                                        
                                        ))
                                    : "No collaborators available"}
                                </div>
                              </div>

                              {/* Task Description */}

                              <div className="">
                                <h3 className="text-lg  flex items-center border-b-2 border-gray-200 mb-2">
                                  <FaPen className="text-gray-500 mr-2" />{" "}
                                  {/* Icon for Description */}
                                  Description:
                                </h3>
                                <p className="border-2 border-gray-200 py-2 px-2 rounded-lg">
                                  {taskDetails.task_description}
                                </p>
                              </div>

                              {/* Task Attachments */}
                              <h3 className="text-lg  border-b-2 border-gray-200 flex gap-2">
                                <div className="flex items-center">
                                  <FaImage className="text-gray-500 mr-2" />
                                  Attachments
                                </div>
                                <span className="text-sm text-gray-500 mt-1">
                                  (
                                  {taskDetails.task_attachments
                                    ? taskDetails.task_attachments.length
                                    : 0}
                                  )
                                </span>
                                :
                              </h3>
                              {taskDetails.task_attachments.length > 0 ? (
  <ul className=" flex flex-wrap gap-2">
    {taskDetails.task_attachments.map((attachment, index) => {
      const fileExtension = attachment.attachment_name
        .split(".")
        .pop()
        .toLowerCase();

      let isImage = ["jpg", "jpeg", "png", "gif"].includes(fileExtension);
      let IconComponent;

      if (!isImage) {
        if (fileExtension === "pdf") {
          IconComponent = FaFilePdf;
        } else if (fileExtension === "csv") {
          IconComponent = FaFileCsv;
        } else {
          IconComponent = FaFileAlt;
        }
      }

      return (
        <li key={index} className=" flex-4 w-24 h-24 border border-gray-300 rounded-md p-2">
          {isImage ? (
            // Display image with source
            <a
            href={`/image/${attachment.attachment_name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[8px] text-blue-600 hover:text-blue-800 font-medium block mt-0.5"
          >
            <img
              src={`/image/${attachment.attachment_name}`}
              alt={attachment.attachment_name}
              className="mx-auto mb-0.5 rounded-md w-full h-full object-cover"
            />
            </a>
          ) : (
            <a
            href={`/image/${attachment.attachment_name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 text-7xl mx-auto mb-0.5 flex justify-center items-center"
          >
          
            <IconComponent className="text-gray-600 text-7xl mx-auto mb-0.5" />
            </a>
          )}
          {/* Attachment Name */}
        </li>
      );
    })}
     <div className="text-gray-600 text-xl flex justify-center items-center mb-0.5 border border-gray-300 w-24 h-24 rounded-md ">
        <FaPlus className="text-gray-700 text-6xl " />
      </div>
  </ul>
) : (
  <p className="text-gray-600 text-xs">No attachments available</p>
)}

                              <div className="w-full h-full">
                                <div className="w-full h-12 flex justify-between  border-b-2 border-gray-300">
                                  <ul className="flex gap-12 items-center h-full px-4">
                                    <li
                                      onClick={() =>
                                        handleDetailChange("Comments")
                                      }
                                      className={`text-sm font-semibold text-gray-700 hover:text-blue-600 cursor-pointer
       ${
         activeDetail === "Comments"
           ? "border-b-4 border-blue-500 transition-all"
           : ""
       }`}
                                    >
                                      Comments (
  {
    taskDetails.activity
      .filter((item) => item.type === "comment") // Filter by type "Comments"
      .length // Count the filtered comments
  }
  )
                                    </li>
                                    <li
                                      onClick={() =>
                                        handleDetailChange("Activity")
                                      }
                                      className={`text-sm font-semibold text-gray-700 hover:text-blue-600 cursor-pointer
       ${
         activeDetail === "Activity"
           ? "border-b-4 border-blue-500 transition-all"
           : ""
       }`}
                                    >
                                      Activities
                                    </li>
                                  </ul>
                                </div>
                                {/* Tasks Section */}
                                {activeSection == "tasks" && <></>}
                                <style>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
                                {activeDetail === "Comments" && (
                                  <div
                                    style={fadeInAnimation}
                                    className="p-2 h-full  w-full  overflow-y-auto example"
                                  >
                                    <Comment
                                      status={taskDetails.status}
                                      Comments={taskDetails.activity}
                                      taskId={taskDetails.task_id}
                                      model={false}
                                      fetchTaskDetails={fetchTaskDetails}
                                    />
                                  </div>
                                )}
                                {activeDetail === "Activity" && (
                                  <div style={fadeInAnimation}>
                                    <div
                                      className="p-1 overflow-y-auto h-[calc(100%-64px)] example"
                                      style={{
                                        height: "calc(100vh - 250px)",
                                        overflowY: "auto",
                                      }}
                                    >
                                      {taskDetails.activity.filter(
                                        (log) => log.type === "activity"
                                      ).length > 0 ? (
                                        taskDetails.activity
                                          .filter(
                                            (log) => log.type === "activity"
                                          )
                                          .map((log, index) => {
                                            const statusMap = {
                                              0: {
                                                color: "bg-gray-400",
                                                text: "Assigned",
                                              },
                                              1: {
                                                color: "bg-yellow-400",
                                                text: "In Progress",
                                              },
                                              2: {
                                                color: "bg-blue-500",
                                                text: "Assigned For Review",
                                              },
                                              3: {
                                                color: "bg-green-500",
                                                text: "Reviewed",
                                              },
                                              4: {
                                                color: "bg-purple-500",
                                                text: "Completed",
                                              },
                                            };

                                            const prevStatus = statusMap[
                                              log.previous_status
                                            ] || {
                                              color: "bg-gray-300",
                                              text: "Unknown",
                                            };
                                            const currentStatus = statusMap[
                                              log.current_status
                                            ] || {
                                              color: "bg-gray-300",
                                              text: "Unknown",
                                            };

                                            return (
                                              <div
                                                key={index}
                                                className="comment-item flex gap-4"
                                              >
                                                {/* Profile Image outside the card (flex item placed outside the bordered content) */}
                                                <div className="flex flex-col items-center mt-4">
                                                  {log.user_logo ? (
                                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white">
                                                      <img
                                                        src={`/image/${log.user_logo}`}
                                                        alt={log.user_name}
                                                        className="rounded-full w-full h-full object-center object-cover cursor-pointer"
                                                      />
                                                    </div>
                                                  ) : (
                                                    <span className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                                                      {formatNameToInitials(
                                                        log.user_name
                                                      )}
                                                    </span>
                                                  )}
                                                  <span className="w-[1px] block bg-gray-300 dark:bg-slate-700 grow mt-2 1 "></span>
                                                </div>

                                                {/* Card Content */}

                                                <div className="border rounded-lg  bg-white shadow-md flex-1 relative mt-6">
                                                  <div className="absolute  border-gray-300 bg-gray-100 w-4 h-4 rotate-45 top-3 -left-2 z-10"></div>
                                                  {/* Header: User Name & Date */}
                                                  <div className="z-20 w-full h-full overflow-hidden rounded-lg">
                                                    <div className="flex justify-between items-center bg-gray-100 py-2 px-3">
                                                      <span className="text-xs text-gray-400">
                                                        {formatDate(
                                                          log.created_at
                                                        )}
                                                      </span>
                                                    </div>

                                                    {/* Status Change Information */}
                                                    <div className="flex items-center space-x-2 text-xs p-1">
                                                      <span>
                                                        Change status to
                                                      </span>
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

                                                    {/* Description */}
                                                    <p className="text-sm text-gray-700 mt-3">
                                                      {log.description}
                                                    </p>
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })
                                      ) : (
                                        <p className="text-gray-500 text-sm text-center">
                                          No activity logs found.
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                        {isTaskDetailVisible && (
                          <div>
                            <Comment
                              status={taskDetails.status}
                              Comments={taskDetails.activity}
                              taskId={taskDetails.task_id}
                              model={true}
                              fetchTaskDetails={fetchTaskDetails}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Activity>
  );
};

export default Dashboard;
