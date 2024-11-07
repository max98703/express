import React, { useState } from "react";
import { FaSearch, FaFilter, FaTachometerAlt, FaNewspaper, FaCodeBranch, FaUsers, FaComments } from "react-icons/fa"; // Importing icons
import { Link, useLocation } from "react-router-dom";

const Activity = ({ children }) => {
  const location = useLocation();
  const [activeLink, setActiveLink] = useState(location.pathname);

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="fixed w-64 h-full bg-white border-r border-gray-200 p-4">
        <img
          src="/image/tally.png"
          alt="Tasktaly Logo"
          className="w-24 h-26 shadow-md rounded-lg"
        />
        <nav className="space-y-2 text-gray-600 mt-2">
          <Link
            to="/dashboard"
            onClick={() => handleLinkClick("/dashboard")}
            className={`flex items-center py-2 px-4 rounded-lg no-underline ${
              activeLink === "/dashboard"
                ? "bg-gray-200 font-semibold text-primary-500"
                : "hover:bg-gray-100"
            }`}
            style={{ textDecoration: 'none' }}
          >
            <FaTachometerAlt className="mr-2" /> {/* Icon for Dashboard */}
            Dashboard
          </Link>
          <Link
            to="/pr/feed"
            onClick={() => handleLinkClick("/pr/feed")}
            className={`flex items-center py-2 px-4 rounded-lg no-underline ${
              activeLink === "/pr/feed"
                ? "bg-gray-200 font-semibold text-primary-500"
                : "hover:bg-gray-100"
            }`}
            style={{ textDecoration: 'none' }}
          >
            <FaNewspaper className="mr-2" /> {/* Icon for Feed */}
            Feed
          </Link>
          <Link
            to="/pr"
            onClick={() => handleLinkClick("/pr")}
            className={`flex items-center py-2 px-4 rounded-lg no-underline ${
              activeLink === "/pr"
                ? "bg-gray-200 font-semibold text-primary-500"
                : "hover:bg-gray-100"
            }`}
            style={{ textDecoration: 'none' }}
          >
            <FaCodeBranch className="mr-2" /> {/* Icon for Pull Request */}
            Pull Request
          </Link>
          <Link
            to="/pr/collaborator"
            onClick={() => handleLinkClick("/pr/collaborator")}
            className={`flex items-center py-2 px-4 rounded-lg no-underline ${
              activeLink === "/pr/collaborator"
                ? "bg-gray-200 font-semibold text-primary-500"
                : "hover:bg-gray-100"
            }`}
            style={{ textDecoration: 'none' }}
          >
            <FaUsers className="mr-2" /> {/* Icon for Collaborator */}
            Collaborator
          </Link>
          <Link
            to="/chat"
            onClick={() => handleLinkClick("/chat")}
            className={`flex items-center py-2 px-4 rounded-lg no-underline ${
              activeLink === "/chat"
                ? "bg-gray-200 font-semibold text-primary-500"
                : "hover:bg-gray-100"
            }`}
            style={{ textDecoration: 'none' }}
          >
            <FaComments className="mr-2" /> {/* Icon for Chat */}
            Chat
          </Link>
        </nav>
        <div className="mt-8">
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
      <div className="flex-1 flex flex-col ml-64  ">
        {/* Fixed Top Bar */}
        <div className="fixed left-64 right-0 top-0 bg-white p-3 z-40 ">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-700">Activity</h2>
            <div className="flex items-center space-x-2 w-4/5 ml-4">
              <div className="relative flex-1 rounded-lg">
                <FaSearch className="absolute left-3 top-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 w-full h-14 rounded-full bg-gray-100 text-gray-600 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button className="flex items-center px-3 py-2 bg-gray-100 rounded-lg ml-4 text-gray-600 hover:bg-gray-200">
                <FaFilter className="mr-2" /> Filter
              </button>
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Activity;
