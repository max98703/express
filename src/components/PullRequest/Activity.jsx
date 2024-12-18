import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaFilter,
  FaTachometerAlt,
  FaNewspaper,
  FaCodeBranch,
  FaUsers,
  FaComments,
  FaTasks,
  FaBars,
  FaUserCircle,
  FaBell,  // Import the notification icon
} from "react-icons/fa";
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
        className={`fixed h-full bg-black text-white transition-width duration-300 ${
          isCompact ? "w-16" : "w-52"
        }`}
      >
        {!isCompact && (
          <div className="p-2  px-4 bg-black w-full">
            <img
              src="/image/tt.png"
              alt="Logo"
              className="w-24 h-24 object-fit rounded-full "
            />
          </div>
        )}
        <div
          onClick={toggleSidebar}
          className="absolute top-2 right-3 bg-primary-500 text-white rounded-full p-2 cursor-pointer shadow-md"
        >
          <FaBars className="text-xl" />
        </div>

        <nav className={`space-y-2 example ${isCompact ? "mt-12" : ""}`}>
          {[
            { to: "/dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
            { to: "/pr/feed", icon: <FaNewspaper />, label: "Feed" },
            { to: "/pr", icon: <FaCodeBranch />, label: "Pull Request" },
            { to: "/pr/collaborator", icon: <FaUsers />, label: "Collaborator" },
            { to: "/users", icon: <FaUsers />, label: "Users" },
            { to: "/chat", icon: <FaComments />, label: "Chat" },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => handleLinkClick(link.to)}
              className={`flex items-center py-3 px-4 no-underline ${
                isCompact ? "justify-center" : "justify-start"
              } ${
                activeLink === link.to
                  ? "bg-gray-700 text-primary-500 font-semibold rounded-lg mr-2"
                  : "hover:bg-gray-800 mr-2 rounded-lg no-underline"
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
              className={`flex items-center mr-2 ${
                isCompact ? "justify-center" : "justify-start"
              } py-3 px-4 w-full rounded-lg  ${
                tasksOpen ? "bg-gray-700 font-semibold text-primary-500" : "hover:bg-gray-800"
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
                  className="flex items-center py-2 px-4 text-gray-300 mr-2  no-underline hover:bg-gray-700 rounded-lg mt-1"
                >
                  Dashboard
                </Link>
                <Link
                  to="/task"
                  onClick={() => handleLinkClick("/task")}
                  className="flex items-center py-2 px-4 text-gray-300 mr-2 hover:bg-gray-700 rounded-lg"
                >
                  Task
                </Link>
                <Link
                  to="/projects"
                  onClick={() => handleLinkClick("/projects")}
                  className="flex items-center py-2 px-4 text-gray-300 hover:bg-gray-700 mr-2 rounded-lg"
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
          className={`fixed top-0 right-0 bg-white p-3 z-40 flex items-center border-b-2 border-gray-300 transition-all duration-300 example ${
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
          <button className="flex items-center px-3 py-2 rounded-full text-gray-600 border hover:bg-gray-200">
            <FaFilter /> Filter
          </button>
          <div className="relative ml-4 flex gap-2">
          <FaBell className="text-2xl ml-2 cursor-pointer mt-2" /> {/* Notification Icon */}
          <div
  onClick={toggleDropdown}
  className="flex items-center gap-2 py-1 pl-1 pr-3 border rounded-full cursor-pointer"
>
  <div className="flex items-center justify-center rounded-full w-8 h-8 overflow-hidden bg-primary-800">
    {users && users.image ? (
      <img
        src={`/image/${users.image}`}
        alt="User Logo"
        className="w-full h-full object-cover"
      />
    ) : (
      <div className="bg-gray-300 w-full h-full flex items-center justify-center">
        {/* Placeholder if no user logo exists */}
        <span className="text-gray-500 text-sm">No Image</span>
      </div>
    )}
  </div>
  <span>{users ? users.name : null}</span>
</div>

            {dropdownOpen && (
              <div className="absolute z-10 w-48 bg-white border rounded-lg shadow-lg right-1 mt-11">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 py-2 px-4 hover:bg-gray-100 no-underline"
                >
                  Profile
                </Link>
                <button
                  onClick={Logout}
                  className="flex items-center gap-3 py-2 px-4 text-gray-400 hover:bg-gray-100 w-full"
                >
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
