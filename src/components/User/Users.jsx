import React, { useState, useEffect } from "react";
import api from "../../api/api";
import Spinner from "../Spinner/Spinner.jsx";
import Activity from "../PullRequest/Activity.jsx";
import SmartTable from "../DataTable/SmartTable.jsx";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);

    try {
      const response = await api.get(`/user`);
      const indexedData = response.data.map((pr, idx) => ({
        ...pr,
        index: idx + 1, // Add index starting from 1
      }));
      console.log(indexedData);

      setUsers(indexedData);
    } catch (err) {
      console.error("Error fetching pull requests:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(); // Call fetchPullRequests on component mount
  }, []);

  const columns = [
    { key: "index", label: "SN" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phoneNumber", label: "Phone Number" },
    {
      key: "admin",
      label: "Role",
      render: (pr) => 
      <span className="bg-gray-600 rounded-full px-3 py-1 text-gray-100">
      {pr.admin ? "Admin" : "User"}
        </span>
    },
    {
      key: "action",
      label: "Action",
      render: () => (
        <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded mr-2 transition-all duration-300">
          Action
        </button>
      ),
    },
  ];

  return (
    <Activity>
      <div className="overflow-x-auto example mt-4">
        <div className=" p-6 mt-4">
          <header>
            <div class="flex justify-between gap-5  lg:items-center">
              <div class="flex flex-col">
                <div class="flex items-center gap-4">
                  <div class="mb-1 text-2xl font-bold text-primary-500 dark:text-gray-300">
                    Users
                  </div>
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
              <div></div>
            </div>
          </header>
          {error && (
            <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-md text-yellow-700">
              <p className="font-semibold">{error}</p>
            </div>
          )}
          {!isLoading ? (
            <SmartTable data={users} columns={columns} />
          ) : (
            <Spinner />
          )}
        </div>
      </div>
    </Activity>
  );
};

export default Users;
