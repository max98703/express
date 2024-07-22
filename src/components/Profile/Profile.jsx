import React, { useEffect, useState ,useContext,useMemo} from "react";
import {userService} from "../../Services/authentication.service";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import api from '../../api/api';
import { AppContext } from "../../context/AppContext";

const Profile = () => {
  const { handleFileUpload } = useAuth();
  const [isEditing, setIsEditing] = useState({ name: false, phone: false });
  const [user, setUserInfo] = useState({ userName: "", phone: "", logo: "", email: "" });
  const [loading, setLoading] = useState(true); // Added loading state
  const { showAlert } = useContext(AppContext);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/profile');
      const { name, phoneNumber, logo, email } = data.user;
      setUserInfo({ userName: name || "", phone: phoneNumber || "", logo: logo || "", email: email || "" });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const toggleEditing = (field) => {
    setIsEditing((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    updateProfileImage(file);
  };

  const updateProfileImage = async (file) => {
    const response = await handleFileUpload({ file });
    if (response.data.success) {
      fetchProfile();
      showAlert(response.data.message, 'success');
    } else {
      showAlert(response.message, 'error');
    }
  };

  const updateProfile = async () => {
    const data = { userName: user.userName, phone: user.phone };
    const response = await handleFileUpload(data);
    if (response.data.success) {
      fetchProfile();
      showAlert(response.data.message, 'success');
      setIsEditing({ name: false, phone: false });
    } else {
      showAlert(response.message, 'error');
    }
  };

  if (loading) {
    // Render a loading spinner or placeholder while data is being fetched
    return <div className="text-center mt-5">Loading...</div>;
  }
  return (
    <>
      <div className="mt-24 flex justify-center items-center">
        <div className="relative">
          <div className="w-36 h-36 rounded-full overflow-hidden">
            {user.logo && (
              <>
                <img
                     src={user.logo?.startsWith("http") ? user.logo : `/images/${user.logo}`}
                  alt="Profile"
                  className="ring-2 ring-gray-300 dark:ring-gray-500 w-full h-full object-cover rounded-full"
                />
                <span class="top-8  ml-32  absolute w-5 h-5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></span>
              </> 
            )}
          </div>
          <div className="absolute right-0 top-2/3 transform -translate-y-1/2">
            <label htmlFor="uploadInput" className="cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="h-8 w-8 text-gray-500 fontSize-xl"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="text-red font-bold"
                  d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15M9 12l3 3m0 0 3-3m-3 3V2.25"
                />
              </svg>
            </label>
            <input
              id="uploadInput"
              type="file"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
        </div>
      </div>
      <div className="px-4 py-5 p-0">
      <dl className="divide-y divide-gray-200">
                    {['name', 'phone'].map(field => (
                        <div key={field} className="py-3 grid grid-cols-3 gap-4 px-6">
                            <div className="text-sm mt-1 font-medium text-gray-500">{field === 'name' ? 'Full name' : 'Phone number'}</div>
                            <span className="mt-1 text-sm flex text-gray-500 mt-0 col-span-2">
                                {isEditing[field] ? (
                                    <>
                                        <input
                                            type={field === 'phone' ? 'number' : 'text'}
                                            name={field === 'name' ? 'userName' : 'phone'}
                                            value={user[field === 'name' ? 'userName' : 'phone']}
                                            onChange={handleInputChange}
                                            className="border border-gray-300 rounded-full bg-transparent px-2 py-1"
                                        />
                                        <svg onClick={() => toggleEditing(field)} className="h-7 w-7 absolute ml-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="15" y1="9" x2="9" y2="15" />
                                            <line x1="9" y1="9" x2="15" y2="15" />
                                        </svg>
                                    </>
                                ) : (
                                    <>
                                        <div>{user[field === 'name' ? 'userName' : 'phone']}</div>
                                        <i className="fa fa-edit mt-1 cursor-pointer ml-2" onClick={() => toggleEditing(field)}></i>
                                    </>
                                )}
                            </span>
                        </div>
                    ))}
                    {(isEditing.name || isEditing.phone) && (
                        <div className="pt-4">
                            <button onClick={updateProfile} className="bg-transparent text-gray-500 font-semibold py-2 px-4 border border-gray-400 rounded shadow">
                                Update
                            </button>
                        </div>
                    )}
                </dl>
        <div className=" w-full  flex flex-col ">
          <Link className="mt-2  bg-gray-800 p-2 rounded-lg shadow-md flex flex-col-2 gap-2 items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="h-6 w-6  text-gray-500 "
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
            <span className="text-xs  text-gray-500">Notifications</span>
          </Link>
          <Link
            to="/mylist"
            className="mt-2 flex bg-gray-800 p-2 rounded-lg gap-2 shadow-md flex flex-col-2 items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="h-6 w-6 text-gray-500 "
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
            <span className="text-xs text-gray-500">My List</span>
          </Link>
          <Link className="mt-2 flex bg-gray-800 p-2 gap-2 rounded-lg shadow-md flex flex-col-2 items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="h-6 w-6 text-gray-500 "
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 14v2m0 0v2m0-2h2m-2 0h-2M9 8L7.41 6.41A2 2 0 016 6H4a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-2m0-2v-2m0 2h2m-2 0h-2m-2-4l1.59-1.59A2 2 0 0112 6h2a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2v-2m0-2v-2m0 2H6m2 4l-1.59 1.59A2 2 0 0112 18h-2a2 2 0 01-2-2V6a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2z"
              />
            </svg>
            <span className="text-xs text-gray-500">App Settings</span>
          </Link>
          <button className="mt-2 flex  rounded-lg bg-gray-800 p-2 gap-2 shadow-md flex flex-col-2 items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              className="h-6 w-6 text-gray-500 "
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
              />
            </svg>

            <span className="text-xs text-gray-500">Help</span>
          </button>

          {!user.googleLogin && (
            <Link
              to="/password-reset"
              className="mt-2 flex bg-gray-800 p-2 gap-2 rounded-lg shadow-md flex flex-col-2 items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6 text-gray-500"
              >
                <path
                  fillRule="evenodd"
                  d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs text-gray-500">Password Reset</span>
            </Link>
          )}
          <div onClick={userService.logout} className="text-center text-xl text-gray-500 mt-3 ">
            Logout
            <div className="text-xs">version:14.11.2341.43.2.3.1</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
