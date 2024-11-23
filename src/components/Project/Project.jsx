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

const Project = () => {
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

  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects");

      // Destructure from response.data, not response directly
      const {  projects } = response.data;
      const indexedData = projects.map((pr, idx) => ({
        ...pr,
        index: idx + 1, // Add index starting from 1
      }));
      console.log(indexedData);
      setProjects(indexedData);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <Activity>
    <div className="overflow-x-auto example mt-4 ">
      <div className="p-6 mt-4">
        <header className="flex justify-between gap-5 lg:items-center">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <div className="mb-1 text-2xl font-bold text-primary-500 dark:text-gray-300">
                Projects
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
              Add Project
            </button>
            <div></div>
          </div>
        </header>
</div></div>
</Activity>
  )
}

export default Project
