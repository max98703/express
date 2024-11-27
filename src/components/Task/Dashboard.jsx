import React, { useEffect, useState, useMemo } from "react";
import Activity from "../PullRequest/Activity.jsx";
import api from "../../api/api.js";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import Spinner from "../Spinner/Spinner.jsx";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { FaUserCheck, FaUser, FaFlag, FaPen, FaImage ,FaComment} from 'react-icons/fa'; // Importing React Icons
import { useNavigate } from "react-router-dom";
import Comment from "./Comment";
import Note from "./Note.jsx";
const Dashboard = () => {
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [assignees, setAssignees] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [projectss, setProjectss] = useState();
  const [taskDetails, setTaskDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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
    fetchUserTasks();
  }, []);

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
      <div className={`w-11/12 py-2 px-2 h-1/6 overflow-y-auto relative`}>
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
              className="w-4 h-4 mt-1 text-gray-500"
              onClick={() => sortTasksByPriority(title)}
            >
              <path d="M19 3L23 8H20V20H18V8H15L19 3ZM14 18V20H3V18H14ZM14 11V13H3V11H14ZM12 4V6H3V4H12Z"></path>
            </svg>
          </div>
        </div>

        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => fetchTaskDetails(task.id)}
            className="mb-2 p-3 bg-white border border-gray-300 rounded-lg transition-all duration-300 relative text-xs hover:shadow-lg hover:scale-105"
          >
            {/* Priority Indicator */}
            <div
              className={`absolute top-0 right-0 text-xs font-semibold px-2 py-1 rounded-tr-sm ${task.priority === "0"
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
                  className={`text-xs font-semibold flex items-center justify-center p-1 rounded-full ${task.status === "0"
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
                <span className="mr-1 font-semibold text-gray-400">
                  Reviewer:
                </span>
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

  const [activeSection, setActiveSection] = useState("tasks"); // Default to 'tasks'

  const handleSectionChange = (section) => {
    setActiveSection(section);
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
    // Set loading to true before the API call
    setIsLoading(true);
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

  return (
    <Activity>
      <div className="overflow-x-auto mt-4 bg-white h-full example">
        <div className=" mt-16 w-full flex ">
          {/* Sidebar for Projects */}
          <div className="w-1/5 bg-white border-r-2 p-2  border-gray-200">
            {/* Projects Section */}
            <div className="flex justify-between items-center w-full ">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-2 flex-grow">
                Projects
              </h3>
              {activeSection === "tasks" && (
                <div
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center px-3 py-2 0 rounded-full text-gray-600 border  hover:bg-gray-200 -mt-4"
                >
                  Filter
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
       ${activeSection === "overview"
                      ? "border-b-4 border-blue-500 transition-all"
                      : ""
                    }`}
                >
                  Overview
                </li>
                <li
                  onClick={() => handleSectionChange("tasks")}
                  className={`text-sm font-semibold text-gray-700 hover:text-blue-600 cursor-pointer
       ${activeSection === "tasks"
                      ? "border-b-4 border-blue-500 transition-all"
                      : ""
                    }`}
                >
                  Tasks
                </li>
                <li
                  onClick={() => handleSectionChange("notes")}
                  className={`text-sm font-semibold text-gray-700 hover:text-blue-600 cursor-pointer
       ${activeSection === "notes"
                      ? "border-b-4 border-blue-500 transition-all"
                      : ""
                    }`}
                >
                  Notes
                </li>
                <li
                  onClick={() => handleSectionChange("questions")}
                  className={`text-sm font-semibold text-gray-700 hover:text-blue-600 cursor-pointer
       ${activeSection === "questions"
                      ? "border-b-4 border-blue-500 transition-all"
                      : ""
                    }`}
                >
                  Questions
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
                className="p-6 h-full mt-4 w-full  overflow-y-auto example"
              >
                <Note />
              </div>
            )}
          </div>
        </div>
        {isModalOpen && (
          <div className="fixed inset-0 flex justify-center items-center z-50">
            <div
              className="bg-white rounded-lg shadow-xl w-1/3 h-98 overflow-y-auto p-6 transform transition-transform duration-500 ease-out"
              style={{
                transform: isModalOpen ? "translateX(0)" : "translateX(-100%)",
                transitionDelay: isModalOpen ? "300ms" : "0ms", // Adds a delay when opening
              }}
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-700">Filter</h2>
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
          <div className="fixed inset-0 flex justify-end items-center z-50 top-20 right-2"
          onClick={(e) => {
            // Close the modal if the click is outside of the modal content
            if (e.target.id === "modal-overlay") {
              setTaskModalOpen(false);
              setTaskDetails([]); // Clear task details
              setTaskDetailVisible(false);
            }
          }}>
             <div
      id="modal-overlay"
      className="absolute inset-0  bg-opacity-50"
    ></div>
            <div
              className={`realtive  overflow-auto max-h-screen bg-white w-2/5 h-full example shadow-xl transform transition-transform duration-500 ease-in-out border-2 rounded-lg border ${isTaskModalOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
            {isLoading ? (
            <Spinner />
            ):(
              <>
              {/* Modal Header */}
              <div className="p-3 border-b-2 border-gray-400 flex justify-between items-center">
                <h5 className="text-2xl text-gray-700 font-bold w-4/5">
                  #{taskDetails.task_id} || {taskDetails.project_name || 'N/A'}
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
                  <h3 className="text-gray-700 font-bold text-xl">{taskDetails.task_title || 'No title provided'}</h3>
                </div>
                {/* Created By & Deadline */}
                <div className="flex gap-2 items-center mb-4">
                  <span className="text-md text-gray-600 font-bold">
                    Created by{' '}
                    <span className="font-normal text-gray-500 bg-blue-200 p-2 rounded-full">
                      {taskDetails.createdBy || 'N/A'}
                    </span>{' '}
                    || Deadline{' '}
                    <span className="font-normal">{taskDetails.deadline || 'No deadline'}</span>
                  </span>
                </div>

                {/* Priority */}
                <div className="flex gap-2 items-center">
                  <h3 className="text-lg font-semibold flex items-center">
                    <FaFlag className="mr-2 text-gray-500" /> {/* React Icon for Priority */}
                    Priority:
                  </h3>
                  <p
                    className={`text-white py-1 px-4 rounded-full ${taskDetails.priority === '0'
                        ? 'bg-gray-400' // Normal - Gray
                        : taskDetails.priority === '1'
                          ? 'bg-red-500' // High - Red
                          : 'bg-yellow-500' // Urgent - Yellow
                      }`}
                  >
                    {taskDetails.priority === '0'
                      ? 'Normal'
                      : taskDetails.priority === '1'
                        ? 'High'
                        : 'Urgent'}
                  </p>

                </div>

                {/* Assigner */}
                <div className="flex gap-2 items-center mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <FaUserCheck className="mr-2 text-yellow-500" /> {/* React Icon for Assigner */}
                    Assigner:
                  </h3>
                  <div className="flex items-center">
                    {taskDetails.collaborators && taskDetails.collaborators.length > 0
                      ? taskDetails.collaborators
                        .filter(collaborator => collaborator.collaborator_flag !== 0) // Assigner
                        .map((collaborator, index) => (
                          <div key={index}>
                            <span className="bg-yellow-200  py-2 px-2 rounded-full ml-1">
                              {collaborator.collaborator_name}
                            </span>
                          </div>
                        ))
                      : 'No assigner found'}
                  </div>
                </div>

                {/* Collaborators */}
                <div className="flex gap-2 items-center mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <FaUser className="mr-2 text-blue-500" /> {/* React Icon for Collaborators */}
                    Reviwers:
                  </h3>
                  <div className="flex items-center space-x-2">
                    {taskDetails.collaborators && taskDetails.collaborators.length > 0
                      ? taskDetails.collaborators
                        .filter(collaborator => collaborator.collaborator_flag == 0) // Regular Collaborators
                        .map((collaborator, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <span className="bg-blue-200 py-2 px-2 rounded-full ml-1" >
                              {collaborator.collaborator_name}
                            </span>
                          </div>
                        ))
                      : 'No collaborators available'}
                  </div>
                </div>

                {/* Task Description */}

                <div className="">
                  <h3 className="text-lg font-semibold flex items-center border-b-2 border-gray-200 mb-2">
                    <FaPen className="text-gray-500 mr-2" /> {/* Icon for Description */}
                    Description:
                  </h3>
                  <p className="bg-gray-100 border p-2 rounded-lg">{taskDetails.task_description}</p>
                </div>


                {/* Task Attachments */}
                <h3 className="text-lg font-semibold border-b-2 border-gray-200  flex items-center">
                <FaImage className="text-gray-500 mr-2" /> 
                  Attachments:</h3>
                {taskDetails.task_attachments && taskDetails.task_attachments.length > 0 ? (
                  <ul className="list-none text-gray-700 grid grid-4 gap-1">
                    {taskDetails.task_attachments.map((attachment, index) => (
                      <li key={index}>
                        <div className="flex items-center space-x-2">
                        <FaImage className="text-blue-500 cursor-pointer" />
                        <span className="cursor-pointer">
                          <a
                            href={`/image/${attachment.attachment_name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600"
                          > 
                            {attachment.attachment_name || 'Unnamed Attachment'}
                          </a>
                        </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-700">No attachments available</p>
                )}
              
              </div>
              </>
              
              )}
                 {isTaskDetailVisible && (
              <div >
              
                <Comment  status={taskDetails.status} Comments = {taskDetails.activity} taskId={taskDetails.task_id}  fetchTaskDetails ={ fetchTaskDetails }/>
              </div>
                 )}
              </>
              
        )}
            </div>
          </div>
        )}

      </div>
    </Activity>
  );
};

export default Dashboard;
