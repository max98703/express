import React, { useState, useEffect } from "react";
import { FaSearch, FaFilter, FaTachometerAlt, FaNewspaper, FaCodeBranch, FaUsers, FaComments, FaUserSecret, FaSignOutAlt, FaUserCircle, FaTasks } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { userService } from "../../Services/authentication.service.js";

const Activity = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState(location.pathname);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tasksOpen, setTasksOpen] = useState(false); // State to toggle the Tasks section
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const data = userService.getUserData();
    setUsers(data);
  }, []);
  

  const handleLinkClick = (link) => {
    // Update active link and navigate
    setActiveLink(link);
    if (location.pathname === link) {
      // If already on the same page, force a re-render
      navigate(0);  // This will reload the page
    } else {
      navigate(link);
    }
  };

  const toggleDropdown = () => {
    setActiveLink("");
    setDropdownOpen((prev) => !prev);
  };

  const toggleTasks = () => {
    setActiveLink("");
    setTasksOpen((prev) => !prev); // Toggle the Tasks section
  };

  const Logout = () => {
    userService.logout();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed w-64 h-full bg-white border-r border-gray-200">
        <img src="/image/unnamed.gif" alt="Tasktaly Logo" className="w-42 h-24 bg-inherit" />

        <nav className="space-y-2 text-gray-600 mt-2 p-3">
          {[{ to: "/dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
            { to: "/pr/feed", icon: <FaNewspaper />, label: "Feed" },
            { to: "/pr", icon: <FaCodeBranch />, label: "Pull Request" },
            { to: "/pr/collaborator", icon: <FaUsers />, label: "Collaborator" },
            { to: "/users", icon: <FaUsers />, label: "Users" },
            { to: "/chat", icon: <FaComments />, label: "Chat" }]
            .map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => handleLinkClick(link.to)}
                className={`flex items-center py-2 px-4 rounded-lg no-underline ${
                  activeLink === link.to ? "bg-gray-200 font-semibold text-primary-500" : "hover:bg-gray-100"
                }`}
              >
                {link.icon}
                <span className="ml-2">{link.label}</span>
              </Link>
            ))}

          {/* Tasks Dropdown */}
          <div>
            <button onClick={toggleTasks} className={`flex items-center py-2 px-4 rounded-lg w-full text-left text-gray-500 ${tasksOpen ? 'bg-gray-200 font-semibold text-primary-500' : 'hover:bg-gray-100'}`}>
              <FaTasks className="mr-2" />
              Tasks
            </button>
            {tasksOpen && (
              <div className="pl-6">
                <Link
                  to="/user/dashboard"
                  onClick={() => handleLinkClick("/user/dashboard")}
                  className={`flex items-center py-2 px-4 rounded-lg no-underline ${
                    activeLink === "/user/dashboard" ? "bg-gray-200 font-semibold text-primary-500" : "hover:bg-gray-100"
                  }`}
                >
                  <FaTachometerAlt className="mr-2" />
                  Dashboard
                </Link>
                <Link
                  to="/task"
                  onClick={() => handleLinkClick("/task")}
                  className={`flex items-center py-2 px-4 rounded-lg no-underline ${
                    activeLink === "/tasks/task" ? "bg-gray-200 font-semibold text-primary-500" : "hover:bg-gray-100"
                  }`}
                >
                  <FaTasks className="mr-2" />
                  Task
                </Link>
                <Link
                  to="/tasks/project"
                  onClick={() => handleLinkClick("/tasks/project")}
                  className={`flex items-center py-2 px-4 rounded-lg no-underline ${
                    activeLink === "/tasks/project" ? "bg-gray-200 font-semibold text-primary-500" : "hover:bg-gray-100"
                  }`}
                >
                  <FaCodeBranch className="mr-2" />
                  Project
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Members */}
        <div className="p-3">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">Members</h3>
          <ul className="space-y-1">
            {["Max Chamling", "David Rai", "Abhinav Sapkota"].map((name) => (
              <li key={name} className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>{name}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Top Bar */}
        <div className="fixed left-64 right-0 top-0 bg-white p-3 z-40 flex flex-1 items-center border-b-2 border-gray-300">
          <div className="flex items-center w-4/5 relative">
            <FaSearch className="absolute left-3 top-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 w-full mr-2 h-14 rounded-full bg-gray-100 text-gray-600 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button className="flex items-center px-3 py-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200">
            <FaFilter /> Filter
          </button>

          {/* Profile Dropdown */}
          <div className="relative ml-4">
            <div onClick={toggleDropdown} className="flex items-center gap-2 py-1 pl-1 pr-3 border rounded-full">
              <div className="flex items-center justify-center rounded-full w-8 h-8 bg-primary-800">
                <FaUserCircle className="text-lg h-8 w-8" />
              </div>
              <span>{users ? users.name : null}</span>
            </div>
            {dropdownOpen && (
              <div className="absolute z-10 w-48 bg-white border rounded-lg shadow-lg right-1 mt-2">
                <div className="p-3">
                  <p className="text-gray-500">Welcome, <strong>{users ? users.name : null}</strong></p>
                </div>
                <Link to="/profile" className="flex items-center gap-3 py-2 px-4 hover:bg-gray-100">
                  <FaUsers className="w-5 h-5 opacity-80" />
                  <span>Profile</span>
                </Link>
                <button onClick={Logout} className="flex items-center gap-3 py-2 px-4 hover:bg-gray-100 w-full">
                  <FaSignOutAlt className="w-5 h-5 text-gray-500 " />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Activity;
