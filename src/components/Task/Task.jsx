import React, { useContext } from "react";
import { useState, useEffect, useRef } from "react";
import Activity from "../PullRequest/Activity.jsx";
import SmartTable from "../DataTable/SmartTable.jsx";
import api from "../../api/api.js";
import { format } from "date-fns";
import { Theme, useTheme } from "@mui/material/styles";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { AppContext } from "../../context/AppContext";
import { userService } from "../../Services/authentication.service";

const TaskPage = () => {
  const { showAlert } = useContext(AppContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedRepo, setSelectedRepo] = useState("nodes-project");
  const [priority, setPriority] = useState("0");
  const [assignees, setAssignees] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [users, setUsers] = useState();
  const [project, setProjects] = useState();
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [data, setUser] = useState([]);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const fetchTasks = async () => {
    try {
      const response = await api.get("/tasks");

      // Destructure from response.data, not response directly
      const { tasks, projects, users } = response.data;
      console.log(tasks);
      setUsers(users);
      setProjects(projects);
      const indexedData = tasks.map((pr, idx) => ({
        ...pr,
        index: idx + 1, // Add index starting from 1
      }));
      setProjects(projects);
      setTasks(indexedData);
      
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const data = userService.getUserData();
    setUser(data);
    
    fetchTasks();
  }, []);

  const openActivity = async () => {
    try {
      const response = await api.get(`/activity`);
      const { logs } = response.data;
      console.log(logs);
      setActivityLogs(logs);
      setIsActivityOpen(true); // Open the activity sidebar
    } catch (error) {
      console.log(error);
    }
  };

  const closeActivity = () => {
    setIsActivityOpen(false); // Close the activity sidebar
  };
  // Columns for the task table
  const columns = [
    { key: "index", label: "SN" },
    {
      key: "title",
      label: "Title",
      render: (row) => {
        const priorityMapping = {
          0: { color: "bg-gray-200", label: "Normal" },
          1: { color: "bg-red-500 text-white", label: "High" },
          2: { color: "bg-red-700 text-white", label: "Urgent" },
        };

        const { color, label } = priorityMapping[row.priority];

        return (
          <div>
            <div>{row.title}</div>
            <span className={`${color} px-2 py-1 rounded-full`}>{label}</span>
            <span className={`bg-blue-200 px-2 py-1 rounded-full ml-1`}>
              {row.creator.name}
            </span>
          </div>
        );
      },
    },
    {
      key: "projects",
      label: "Project Name",
      render: (row) => {
        return <div>{row.project.name}</div>;
      },
    },
    // { key: "description", label: "Description" },
    {
      key: "deadline",
      label: "Deadline",
      render: (row) => row.formattedDeadline,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const statusMapping = {
          0: { color: "bg-yellow-300", label: "Assigned" },
          1: { color: "bg-blue-500 text-white", label: "In Progress" },
          2: { color: "bg-green-400 text-white", label: "Assigned For Review" },
          3: { color: "bg-gray-500 text-white", label: "Reviewd" },
          4: { color: "bg-blue-300 text-white", label: "Completed" },
          5: { color: "bg-gree-300 text-white", label: "Closed" },
        };

        const { color, label } = statusMapping[row.status] || {
          color: "bg-gray-200",
          label: "Unknown",
        };

        return (
          <span className={`${color} px-2 py-1 rounded-full`}>{label}</span>
        );
      },
    },

    {
      key: "assignees",
      label: "Assignees",
      render: (row) => {
        const filteredAssignees = row.collaborators.filter(
          (assignee) => assignee.flag === true
        );

        return (
          <div className="flex space-x-1  items-center">
            {filteredAssignees.slice(0, 3).map((assignee, index) => (
              <div key={index} className="relative">
                <img
                  src={`/image/${assignee.user.logo}`}
                  alt={assignee.user.name}
                  className={`w-8 h-8 rounded-full border-2 border-white ${
                    index > 0 ? "-pl-12 " : ""
                  }`} // Negative margin for overlap
                />
                {index === 2 && filteredAssignees.length > 3 && (
                  <span className="absolute right-0 bottom-0 bg-black text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                    +
                  </span>
                )}
              </div>
            ))}
            {filteredAssignees.length === 1 && (
              <span className="ml-2 text-xs font-semibold">
                {filteredAssignees[0].user.name}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "reviewers",
      label: "Reviewers",
      render: (row) => {
        const filteredReviewers = row.collaborators.filter(
          (reviewer) => reviewer.flag === false
        );

        return (
          <div className="flex items-center space-x-2">
            {filteredReviewers.slice(0, 3).map((reviewer, index) => (
              <div key={index} className="relative">
                <img
                  src={`/image/${reviewer.user.logo}`} // Assuming `profilePicture` is the URL to the user's image
                  alt={reviewer.user.name}
                  className="w-8 h-8 rounded-full border-2 border-white" // Circular image with border
                />
                {index === 2 && filteredReviewers.length > 3 && (
                  <span className="absolute right-0 bottom-0 bg-black text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                    +
                  </span>
                )}
              </div>
            ))}
            {filteredReviewers.length === 1 && (
              <span className="ml-2 text-xs font-semibold">
                {filteredReviewers[0].user.name}
              </span>
            )}
          </div>
        );
      },
    },
  ];

  // Handle adding a new task
  const handleAddTask = async () => {
    // Set default deadline to today at 5 PM if not provided
    const defaultDeadline =
      deadline ||
      (() => {
        const today = new Date();
        today.setHours(17, 0, 0, 0); // Set time to 5 PM
        return today.toISOString(); // Use ISO format to make sure it's in a standard format
      })();

    const formData = new FormData();

    // Append text fields to formData
    formData.append("title", title);
    formData.append("description", description);
    formData.append("deadline", defaultDeadline);
    formData.append("projectId", selectedProject);
    formData.append("priority", priority);

    // Append assignees and reviewers arrays as JSON strings
    formData.append("assignees", JSON.stringify(assignees));
    formData.append("reviewers", JSON.stringify(reviewers));

    // Append files individually to formData as 'myImage'
    files.forEach((file, index) => {
      formData.append("myImage", file); // Server will interpret this as multiple files under 'myImage'
    });

    try {
      const response = await api.post("/task/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const { message } = response.data;
      if (message) {
        fetchTasks();
        showAlert(message, "success");
      }
    } catch (error) {
      showAlert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Error creating task",
        "error"
      );
    }
    // Clear form fields after adding the task
    setTitle("");
    setDescription("");
    setDeadline(""); // Clear the deadline field
    setSelectedProject("");
    setPriority("0");
    setAssignees([]);
    setReviewers([]);
    setIsModalOpen(false);
  };

  const closeTask = () => {
    setIsModalOpen(false);
  };
  const fileTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/csv",
  ];

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const invalidFiles = selectedFiles.filter(
      (file) => !fileTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      setError(
        "Some files have unsupported formats. Please upload JPEG, PNG, JPG, DOC, DOCX, or CSV files only."
      );
      setUploading(true);
      setFiles([]);
    } else {
      setError("");
      console.log("max", selectedFiles);
      setFiles(selectedFiles);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "dd-MM-yyyy hh:mm a"); // Format date as d-m-y h:mm AM/PM
  };

  return (
    <Activity>
      <div className="overflow-x-auto example mt-2 ">
        <div className=" mt-4">
          <header className="flex justify-between  lg:items-center mt-20 p-2 mb-1 bg-white shadow-md">
            <div className="flex items-center gap-4 mb-2">
              <div className="flex flex-1 gap-1 pl-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-8 h-8 text-gray-400"
                >
                  <path d="M19 4H5V20H19V4ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H19.9997C20.5519 2 20.9996 2.44772 20.9997 3L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918ZM11.2929 13.1213L15.5355 8.87868L16.9497 10.2929L11.2929 15.9497L7.40381 12.0607L8.81802 10.6464L11.2929 13.1213Z"></path>
                </svg>
                <div className=" pt-1 text-xl font-bold text-gray-400 dark:text-gray-300">
                  Tasks
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {data?.role !== 0 && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="border-2 border-gray-200 rounded-full text-gray-400 px-4 py-2 flex justify-between"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 pr-2"
                  >
                    <path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path>
                  </svg>
                  Add Task
                </button>
              )}
              <button
                className="border-2 border-gray-200  rounded-full text-gray-400 px-4 py-2 flex  justify-between "
                onClick={() => openActivity()}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6 pr-2"
                >
                  <path d="M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z"></path>
                </svg>
                Activity
              </button>
              <button className="border-2 border-gray-200  rounded-full text-gray-400 px-4 py-2 flex  justify-between ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6 pr-2"
                >
                  <path d="M5 2H19C19.5523 2 20 2.44772 20 3V22.1433C20 22.4194 19.7761 22.6434 19.5 22.6434C19.4061 22.6434 19.314 22.6168 19.2344 22.5669L12 18.0313L4.76559 22.5669C4.53163 22.7136 4.22306 22.6429 4.07637 22.4089C4.02647 22.3293 4 22.2373 4 22.1433V3C4 2.44772 4.44772 2 5 2ZM18 4H6V19.4324L12 15.6707L18 19.4324V4Z"></path>
                </svg>
                Tags
              </button>
            </div>
          </header>

          {isModalOpen && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40 flex justify-center example items-center">
    <div className="bg-white rounded-lg shadow-xl w-2/5 h-4/5 overflow-y-auto example p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-700">Add Task</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        {/* Title */}
        <div className="mb-3">
          <label className="block text-gray-600 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-gray-300 focus:ring focus:ring-green-300 rounded-md p-3 w-full"
            placeholder="Enter task title"
            required
          />
        </div>

        {/* Project */}
        <div className="mb-3">
          <label className="block text-gray-600 mb-1">Project</label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="border border-gray-300 focus:ring focus:ring-green-300 rounded-md p-3 w-full"
            required
          >
            <option value="">Select Project</option>
            {project.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.name}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="block text-gray-600 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-gray-300 focus:ring focus:ring-green-300 rounded-md p-3 w-full"
            rows="4"
            placeholder="Describe the task"
            required
          ></textarea>
        </div>

        {/* Deadline */}
        <div className="mb-3">
          <label className="block text-gray-600 mb-1">Deadline</label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="border border-gray-300 focus:ring focus:ring-green-300 rounded-md p-3 w-full"
            required
          />
        </div>

        {/* Priority */}
        <div className="mb-3">
          <label className="block text-gray-600 mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="border border-gray-300 focus:ring focus:ring-green-300 rounded-md p-3 w-full"
          >
            <option value="0">Normal</option>
            <option value="1">High</option>
            <option value="2">Urgent</option>
          </select>
        </div>

        {/* Assignees and Reviewers */}
        <div className="flex justify-between gap-4">
          {/* Assignees */}
          <div className="mb-5 w-1/2">
            <label className="block text-gray-600 mb-1">Assignees</label>
            <FormControl sx={{ width: '100%' }}>
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
          <div className="mb-5 w-1/2">
            <label className="block text-gray-600 mb-1">Reviewers</label>
            <FormControl sx={{ width: '100%' }}>
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
        </div>

        {/* Attachment */}
        <div className="mb-5">
          <label className="block text-gray-600 mb-1">Attachment</label>
          <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
            <input
              type="file"
              multiple
              accept={fileTypes.join(",")}
              onChange={handleFileChange}
             class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleAddTask}
            className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition"
            disabled={uploading}
          >
            Add
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

        </div>

        <SmartTable columns={columns} data={tasks} />
        {isActivityOpen && (
  <div
    className={`fixed top-24 right-0 h-full w-1/4 bg-white shadow-md z-50 overflow-y-auto example transition-transform duration-300 ease-in-out`}
    style={{
      transform: isActivityOpen ? "translateX(0)" : "translateX(100%)",
    }}
  >
    <div className="flex justify-between items-center p-3 border-b">
      <h2 className="text-lg font-medium text-gray-600">Activity Logs</h2>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        onClick={closeActivity}
        fill="currentColor"
        className="w-6 h-6 text-red-400 cursor-pointer"
      >
        <path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"></path>
      </svg>
    </div>
    <div className="p-3">
      {activityLogs.length > 0 ? (
        activityLogs.map((log, index) => {
          // Define status colors and labels
          const statusMap = {
            "0": { color: "bg-gray-300", text: "Assigned" },
            "1": { color: "bg-yellow-300", text: "In Progress" },
            "2": { color: "bg-blue-300", text: "Assigned For Review" },
            "3": { color: "bg-green-300", text: "Reviewd" },
            "4": { color: "bg-blue-300", text: "Completed" },
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
              className="border bg-white rounded-md mb-3 p-2 shadow-sm"
            >
              {/* Card Header */}
              <div className="flex justify-between items-center border-b pb-1 mb-2">
                <h3 className="text-sm text-gray-500">{log.creator}</h3>
                <span className="text-xs text-gray-400">
                  {formatDate(log.createdAt)}
                </span>
              </div>
              {/* Task and Status */}
              <div className="text-sm mb-2">
                <span className="px-2 py-1 rounded-full text-white bg-blue-200">
                  {log.task}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-xs">
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
              {/* Description */}
              <p className="text-xs text-gray-600 mt-2">{log.description}</p>
            </div>
          );
        })
      ) : (
        <p className="text-gray-500 text-sm">No activity logs found.</p>
      )}
    </div>
  </div>
)}

      </div>
    </Activity>
  );
};

export default TaskPage;
