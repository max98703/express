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
    fetchTasks();
  }, []);

  // Columns for the task table
  const columns = [
    { key: "index", label: "SN" },
    { key: "title", label: "Title",  render: (row) => {
      const priorityMapping = {
        0: { color: "bg-gray-200", label: "Normal" },
        1: { color: "bg-red-500 text-white", label: "High" },
        2: { color: "bg-red-700 text-white", label: "Urgent" },
      };

      const { color, label } = priorityMapping[row.priority];
    

      return <div><div>{row.title}</div><span className={`${color} px-2 py-1 rounded-full`}>{label}</span>
      <span className={`bg-blue-200 px-2 py-1 rounded-full ml-1`}>{row.creator.name}</span>
      </div>;
    }, },
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
      render: (row) =>
        row.deadline
          ? format(new Date(row.deadline), "dd-MM-yyyy hh:mm a")
          : "-",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const statusMapping = {
          0: { color: "bg-yellow-300", label: "Assigned" },
          1: { color: "bg-blue-500 text-white", label: "In Progress" },
          2: { color: "bg-green-500 text-white", label: "Completed" },
          3: { color: "bg-gray-500 text-white", label: "Closed" },
        };

        const { color, label } = statusMapping[row.status] || {
          color: "bg-gray-200",
          label: "Unknown",
        };

        return <span className={`${color} px-2 py-1 rounded-full`}>{label}</span>;
      },
    },

    {
      key: "assignees",
      label: "Assignees",
      render: (row) => (
        <div>
          {row.collaborators
            .filter((assignee) => assignee.flag === true) // Filter assignees where flag is 0
            .map((assignee, index) => (
              <span key={index} className="text-blue-800 text-md font-bold">
                {assignee.user.name},&nbsp;{" "}
                {/* Use assignee.collaborator.username to access the collaborator details */}
              </span>
            ))}
        </div>
      ),
    },
    {
      key: "reviewers",
      label: "Reviewers",
      render: (row) => (
        <div>
          {row.collaborators
            .filter((reviewer) => reviewer.flag === false) // Filter reviewers where flag is 1
            .map((reviewer, index) => (
              <span key={index} className="text-purple-800 text-md font-bold">
                {reviewer.user.name},&nbsp;{" "}
                {/* Use reviewer.collaborator.username to access the reviewer details */}
              </span>
            ))}
        </div>
      ),
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
      error.response?.data?.message || error.response?.data?.error || "Error creating task",
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
  const fileTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/csv'];

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const invalidFiles = selectedFiles.filter(file => !fileTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      setError("Some files have unsupported formats. Please upload JPEG, PNG, JPG, DOC, DOCX, or CSV files only.");
      setUploading(true);
      setFiles([]);
    } else {
      setError("");
      console.log('max',selectedFiles);
      setFiles(selectedFiles);
    }
  };
  return (
    <Activity>
      <div className="overflow-x-auto example mt-4 ">
        <div className="p-6 mt-4">
          <header className="flex justify-between gap-5 lg:items-center">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <div className="mb-1 text-2xl font-bold text-primary-500 dark:text-gray-300">
                  Tasks
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
            </div>
            <div className="flex gap-2">
              
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Add Task
              </button>
              <button className="text-gray-700 bg-blue-500 text-white rounded-lg w-24 h-10">
  Export Task
</button>

              <div></div>
            </div>
          </header>

          {isModalOpen && (
            <div className="fixed inset-0 bg-gray-400 top-0 bg-opacity-50 z-40 flex justify-center items-center ">
              <div className="bg-white p-8 rounded-md shadow-lg w-2/5 h-4/5 overflow-x-auto example mt-6 mb-12">
                <h2 className="text-xl font-bold mb-4">Add Task</h2>
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="mb-4">
                    <label className="block text-gray-700">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="border border-gray-300 rounded-md p-2 w-full"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700">Project</label>
                    <select
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="border border-gray-300 rounded-md p-2 w-full"
                      required
                    >
                      <option value="">Select Project</option>
                      {project.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="border border-gray-300 rounded-md p-2 w-full"
                      required
                    ></textarea>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700">Deadline</label>
                    <input
                      type="datetime-local"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="border border-gray-300 rounded-md p-2 w-full"
                      required
                    />
                  </div>
                  
                    <div className="mb-4 w-2/5">
                      <label className="block text-gray-700">Priority</label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="border border-gray-300 rounded-md p-2 w-full"
                      >
                        <option value="0">Normal</option>
                        <option value="1">High</option>
                        <option value="2">Urgent</option>
                      </select>
                    </div>
                  
                  <div className="flex flex-1 gap-10 ">
                    {/* Assignees */}
                    <div className="mb-4 w-2/5">
                      <label className="block text-gray-700">Assignees</label>
                      <FormControl sx={{ width: 250 }}>
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
                    <div className="mb-4 w-2/5">
                      <label className="block text-gray-700">Reviewers</label>
                      <FormControl sx={{ width: 250 }}>
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
                   <div className="mb-4 w-2/5">
                      <label className="block text-gray-700">Attachment</label>
                   
                      <input
                      type="file"
                      multiple
                      accept={fileTypes.join(",")}
                      onChange={handleFileChange}
                    />
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                  </div>
                  <div className="flex justify-end gap-2 ">
                    <button
                      type="button"
                      onClick={handleAddTask}
                      className="bg-green-500 text-white px-4 py-2 rounded-md"
                      disabled={uploading}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={closeTask}
                      className="bg-green-500 text-white px-4 py-2 rounded-md"
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
      </div>
    </Activity>
  );
};

export default TaskPage;
