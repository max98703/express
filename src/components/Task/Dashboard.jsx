import React, { useEffect, useState ,useMemo} from "react";
import Activity from "../PullRequest/Activity.jsx";
import api from "../../api/api.js";

const Dashboard = () => {
  const [groupedTasks, setGroupedTasks] = useState({
    Open: [],
    "In Progress": [],
    "To Review": [],
    Completed: [],
  });
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  console.log(groupedTasks.Completed);
  const [selectedProject, setSelectedProject] = useState(null);
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
        if (name) {
          collaboratorSet.add(JSON.stringify({name})); // Add unique names to the set
        }
      });
    });
    const uniqueCollaborators = Array.from(collaboratorSet).map((name) => JSON.parse(name));
    console.log(uniqueCollaborators);
      setMembers(uniqueCollaborators);
      setProjects(projects);
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
        ? a.id - b.id
        : b.id - a.id;
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

  
  const filteredTasks = useMemo(() => {
    if (!selectedProject) return groupedTasks; // Return all tasks if no project is selected

    const filtered = {};
    Object.keys(groupedTasks).forEach((status) => {
      filtered[status] = groupedTasks[status].filter(
        (task) => task.project?.name === selectedProject
      );
    });

    return filtered;
  }, [selectedProject, groupedTasks]);
   
  console.log(filteredTasks);
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

  const [activeSection, setActiveSection] = useState('tasks'); // Default to 'tasks'

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const notes = [
    {
      id: 1,
      title: "This is Docket note.",
      date: "May 20, 2020",
      color: "bg-orange-300",
    },
    {
      id: 2,
      title:
        "The beginning of screenless design: UI jobs to be taken over by Solution Architect",
      date: "May 21, 2020",
      color: "bg-yellow-300",
    },
    {
      id: 3,
      title:
        "13 Things You Should Give Up If You Want To Be a Successful UX Designer",
      date: "May 25, 2020",
      color: "bg-orange-200",
    },
    {
      id: 4,
      title: "10 UI & UX Lessons from Designing My Own Product",
      color: "bg-purple-300",
    },
    {
      id: 5,
      title: "52 Research Terms you need to know as a UX Designer",
      color: "bg-blue-300",
    },
    {
      id: 6,
      title: "Text fields & Forms design – UI component series",
      color: "bg-teal-300",
    },
  ];
  const fadeInAnimation = {
    animation: "fadeIn 1s ease-in-out",
  };
  return (
    <Activity>
      <div className="overflow-x-auto mt-4 bg-white h-full example">
        <div className=" mt-16 w-full flex ">
          {/* Sidebar for Projects */}
          <div className="w-1/5 bg-white border-r p-2  border-gray-200">
  {/* Projects Section */}
  <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-2">Projects</h3>
  <ul className="h-48 overflow-y-auto space-y-3 example">
    {projects.map((project) => (
      <li
        key={project.id}
        onClick={() => setSelectedProject(project.name)} 
        className="flex justify-between items-center p-2  hover:bg-blue-50 border border-gray-300 rounded-lg transition-colors duration-200 shadow-sm"
      >
        <span className="font-medium text-gray-800">{project.name}</span>
        <button className="text-gray-500 hover:text-blue-600 transition">
          ⋮
        </button>
      </li>
    ))}
  </ul>

  {/* Team Members Section */}
  <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">Team Members</h3>
  <ul className="h-52 overflow-y-auto space-y-3 example">
    {members.map((member, index) => (
      <li
        key={index}
        className="flex justify-between items-center p-1  hover:bg-blue-50 border border-gray-100 rounded-lg transition-colors duration-200 shadow-sm"
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center rounded-full text-sm font-semibold">
            {member.name
              .split(" ")
              .map((part) => part[0])
              .join("")}
          </div>
          {/* Member Name */}
          <span className="font-medium text-gray-800">{member.name}</span>
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
  
<div className="w-full h-12 ">
  <ul className="flex gap-12 items-center h-full px-4 border-b-2 border-gray-300">
    <li className="text-sm font-semibold text-gray-700 hover:text-blue-600 cursor-pointer">
      Overview
    </li>
    <li onClick={() => handleSectionChange('tasks')} className="text-sm font-semibold text-gray-700 hover:text-blue-600 cursor-pointer">
      Tasks
    </li>
    <li  onClick={() => handleSectionChange('notes')}  className="text-sm font-semibold text-gray-700 hover:text-blue-600 cursor-pointer">
      Notes
    </li>
    <li  onClick={() => handleSectionChange('questions')} className="text-sm font-semibold text-gray-700 hover:text-blue-600 cursor-pointer">
      Questions
    </li>
  </ul>
</div>
          {/* Tasks Section */}
        { activeSection == "tasks" && ( 
          <div className="flex-1 flex gap-4 h-full" style={fadeInAnimation}>
            {/* Open Column */}
            {renderTaskColumn("Open", filteredTasks.Open, "gray-50", "blue-600")}
  
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
          <div style={fadeInAnimation} className="p-6">
            <div className="flex">
              <div>
                <button className="p-1 bg-black text-white rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </button>
              </div>

              {/* Notes Grid */}
              <div className="flex-1 grid grid-cols-3 gap-6 p-4">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-4 rounded-lg ${note.color}`}
                  >
                    <h3 className="font-semibold text-lg">{note.title}</h3>
                    {note.date && (
                      <p className="mt-2 text-gray-700 text-sm">{note.date}</p>
                    )}
                    <button className="mt-4 p-2 bg-black text-white rounded-md">
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

          </div>
        </div>
      </div>
    </Activity>
  );
  
};

export default Dashboard;
