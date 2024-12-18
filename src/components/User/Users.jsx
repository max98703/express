import React, { useState, useEffect } from "react";
import api from "../../api/api";
import Spinner from "../Spinner/Spinner.jsx";
import Activity from "../PullRequest/Activity.jsx";
import SmartTable from "../DataTable/SmartTable.jsx";
import Qrcode from "../QrCode/Qrcode";
import { userService } from "../../Services/authentication.service";
import ResetPasswordModal from "./ResetPasswordModal.jsx";
const Users = () => {
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null); // Change the initial state to null
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
      console.error("Error fetching users:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const userData = userService.getUserData();
    setUser(userData); // Set user data
    fetchUsers(); // Call fetchUsers on component mount
  }, []);
  
  const [isModalOpen, setIsModalOpen] = useState(false); // State for opening/closing the modal
  const [oldPassword, setOldPassword] = useState(''); // To store the old password input
  const [newPassword, setNewPassword] = useState(''); // To store the new password input

  // Function to open the modal with necessary data
  const openModal = (rowData) => {
    setOldPassword(rowData.oldPassword || ''); // Example: setting the old password if needed
    setNewPassword(rowData.newPassword || ''); // Example: setting the new password if needed
    setIsModalOpen(true); // Open the modal
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
    setOldPassword("");
    setNewPassword("");
  };

  const columns = [
    { key: "index", label: "SN" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phoneNumber", label: "Phone Number" },
    {
      key: "admin",
      label: "Role",
      render: (pr) => (
        <span className="bg-gray-600 rounded-full px-3 py-1 text-gray-100">
          {pr.admin ? "Admin" : "User"}
        </span>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (row) => {
        // Check if the logged-in user is an admin or if their id matches the row id
        const adminAction = user?.role == false;
        const userAction = user?.user_id == row.id;

        
        return (
          <td
            data-name="Action"
            className="max-lg:flex justify-between dark:text-gray-300 before:font-bold before:lg:hidden before:pr-3 before:text-left lg:text-left text-right before:content-[attr(data-name)]"
          >
              <div className="flex items-center gap-2">
                   {userAction && (
                <div className="bg-blue-100 hover:bg-blue-300 rounded-full p-1"  onClick={() => openModal({ oldPassword: 'currentPassword123', newPassword: 'newPassword456' })}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path d="M16.7574 2.99677L14.7574 4.99677H5V18.9968H19V9.23941L21 7.23941V19.9968C21 20.5491 20.5523 20.9968 20 20.9968H4C3.44772 20.9968 3 20.5491 3 19.9968V3.99677C3 3.44448 3.44772 2.99677 4 2.99677H16.7574ZM20.4853 2.09727L21.8995 3.51149L12.7071 12.7039L11.2954 12.7063L11.2929 11.2897L20.4853 2.09727Z"></path>
                  </svg>
                </div>
                   )}
                   {(adminAction &&
              <>
                <Qrcode userId={row.id} />
                </>
                   )}
              </div>
          </td>
        );
      },
    },
  ];

  return (
    <Activity>
      <div className="overflow-x-auto example mt-4">
        <div className=" mt-14">
          <header className="bg-white p-3">
            <div className="flex justify-between gap-5 lg:items-center">
              <div className="flex flex-col">
                <div className="flex items-center gap-4">
                  <div className="mb-1 text-2xl font-bold text-primary-500 dark:text-gray-300">
                    Users
                  </div>
                </div>
                <nav>
                  <ol className="flex items-center gap-x-1.5 p-0 m-0">
                    <li className="breadcrumb-item">
                      <a
                        className="flex items-center cursor-pointer text-gray-500 dark:text-gray-300 text-[12px] gap-1 font-bold hover:text-primary-800 dark:hover:text-gray-400"
                        href="{{ url('/feeds') }}"
                      >
                        <svg
                          className="w-3.5 h-3.5"
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
                    <li className="dark:text-gray-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        fill="currentColor"
                        className="bi bi-chevron-right"
                        viewBox="0 0 16 16"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                        />
                      </svg>
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          </header>
          {error && (
            <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-md text-yellow-700">
              <p className="font-semibold">{error}</p>
            </div>
          )}
          <div className="relative h-[800px] w-full">
            {!isLoading ? (
              <>
              <SmartTable data={users} columns={columns} />
              <ResetPasswordModal
              id={user.user_id}
              isOpen={isModalOpen}
              onClose={closeModal}
              oldPassword={oldPassword}
              newPassword={newPassword}
              // Pass other required props here as needed
            />
            </>
            ) : (
              <Spinner />
            )}
          </div>
        </div>
      </div>
    </Activity>
  );
};

export default Users;
