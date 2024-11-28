import React, { useState, useEffect } from "react";
import { FaSearch, FaFilter, FaTachometerAlt, FaNewspaper, FaCodeBranch, FaUsers, FaComments, FaTasks, FaBars, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { userService } from "../../Services/authentication.service.js";

const Activity = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState(location.pathname);
  const [isCompact, setIsCompact] = useState(false); // State to toggle compact mode
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tasksOpen, setTasksOpen] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const data = userService.getUserData();
    setUsers(data);
  }, []);

  const handleLinkClick = (link) => {
    setActiveLink(link);
    navigate(link);
  };

  const toggleSidebar = () => {
    setIsCompact((prev) => !prev);
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const toggleTasks = () => {
    setTasksOpen((prev) => !prev);
  };

  const Logout = () => {
    userService.logout();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed h-full bg-white border-r-2 transition-width duration-300  ${
          isCompact ? "w-16" : "w-52"
        }`}
      >
        <div
    onClick={toggleSidebar}
    className="absolute top-1 -right-2 bg-primary-500 text-white rounded-full p-2 cursor-pointer border border-white shadow-md"
  >
    {/* Icon with dynamic arrow */}
    {isCompact ? <span>&gt;</span> : <span>&lt;</span>}
  </div>

        <nav className="space-y-2 mt-12">
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
                className={`flex items-center ${
                  isCompact ? "justify-center" : "justify-start"
                } py-3 px-4  no-underline text-gray-600 ${
                  activeLink === link.to ? "bg-gray-200 font-semibold text-primary-500" : "hover:bg-gray-100"
                }`}
              >
                {link.icon}
                {!isCompact && <span className="ml-2">{link.label}</span>}
              </Link>
            ))}
          {/* Tasks Section */}
          <div>
            <button
              onClick={toggleTasks}
              className={`flex items-center ${
                isCompact ? "justify-center" : "justify-start"
              } py-3 px-4 w-full text-gray-600  ${
                tasksOpen ? "bg-gray-200 font-semibold text-primary-500" : "hover:bg-gray-100"
              }`}
            >
              <FaTasks />
              {!isCompact && <span className="ml-2">Tasks</span>}
            </button>
            {tasksOpen && !isCompact && (
              <div className="pl-6">
                <Link
                  to="/user/dashboard"
                  onClick={() => handleLinkClick("/user/dashboard")}
                  className="flex items-center py-2 px-4 text-gray-600 hover:bg-gray-100 no-underline mt-1"
                >
                  Dashboard
                </Link>
                <Link
                  to="/task"
                  onClick={() => handleLinkClick("/task")}
                  className="flex items-center py-2 px-4 text-gray-600 hover:bg-gray-100 no-underline"
                >
                  Task
                </Link>
                <Link
                  to="/tasks/project"
                  onClick={() => handleLinkClick("/tasks/project")}
                  className="flex items-center py-2 px-4 text-gray-600 hover:bg-gray-100 no-underline"
                >
                  Project
                </Link>
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div
    className={`flex-1 flex flex-col transition-margin duration-300 border-r-2 border-gray-300 ${
      isCompact ? "ml-16" : "ml-52"
    }`}
  >
    {/* Top Bar */}
    <div
      className={`fixed top-0 right-0 bg-white p-3 z-40 flex items-center border-b-2 border-gray-300 transition-all duration-300 ${
        isCompact ? "left-16" : "left-52"
      }`}
    >
          <div className="flex items-center w-4/5 relative">
            <FaSearch className="absolute left-3 top-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 w-full mr-2 h-14 rounded-full bg-gray-100 text-gray-600 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button className="flex items-center px-3 py-2 0 rounded-full text-gray-600 border  hover:bg-gray-200">
            <FaFilter /> Filter
          </button>
          <div className="relative ml-4">
            <div onClick={toggleDropdown} className="flex items-center gap-2 py-1 pl-1 pr-3 border rounded-full">
              <div className="flex items-center justify-center rounded-full w-8 h-8 bg-primary-800">
                <FaUserCircle className="text-lg h-8 w-8" />
              </div>
              <span>{users ? users.name : null}</span>
            </div>
            {dropdownOpen && (
              <div className="absolute z-10 w-48 bg-white border rounded-lg shadow-lg right-1 mt-2">
                <Link to="/profile" className="flex items-center gap-3 py-2 px-4 hover:bg-gray-100 no-underline">
                  Profile
                </Link>
                <button onClick={Logout} className="flex items-center gap-3 py-2 px-4 text-gray-400 hover:bg-gray-100 w-full">
                  Logout
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
