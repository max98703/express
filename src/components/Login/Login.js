import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useGoogleLogin } from "@react-oauth/google";
import { AppContext } from "../../context/AppContext";
// import FacebookLogin from 'react-facebook-login';
import useToggle from "../../hooks/useToggle";

const Login = () => {
  const { login } = useAuth();
  const { showAlert } = useContext(AppContext);

  const userRef = useRef();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    googleToken: "",
    facebookToken: ""
  });

  const { email, password, googleToken, facebookToken } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login({ email, password });
      if (response.data.success) {
        showAlert(response.data.message, 'success');
      } else {
        showAlert(response.data.message, 'error');
      }
    } catch (error) {
      console.error("error", error);
    }
  };

  // const handleFacebookCallback = (response) => {
  //   if (response.accessToken) {
  //     setFormData((prevData) => ({ ...prevData, facebookToken: response.accessToken }));
  //   }
  // };

  const logn = useGoogleLogin({
    onSuccess: (codeResponse) => setFormData((prevData) => ({ ...prevData, googleToken: codeResponse.access_token })),
    onError: (error) => console.log("Login Failed:", error),
  });
  
  const [check, toggleCheck] = useToggle('persist', false);

  useEffect(() => {
    if (googleToken) {
      axios
        .get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${googleToken}`,
          {
            headers: {
              Authorization: `Bearer ${googleToken}`,
              Accept: "application/json",
            },
          }
        )
        .then((res) => {
          login(res.data);
          console.log(res.data);
        })
        .catch((err) => console.log(err));
    }
  }, [googleToken, login]);

  useEffect(() => {
    if (facebookToken) {
      axios
        .get(
          `https://graph.facebook.com/me?access_token=${facebookToken}&fields=id,name,email`,
          {
            headers: {
              Authorization: `Bearer ${facebookToken}`,
              Accept: "application/json",
            },
          }
        )
        .then((res) => {
          login(res.data);
          console.log(res.data);
        })
        .catch((err) => console.log(err));
    }
  }, [facebookToken, login]);

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8"
      style={{
        backgroundImage: `url('https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/f562aaf4-5dbb-4603-a32b-6ef6c2230136/dh0w8qv-9d8ee6b2-b41a-4681-ab9b-8a227560dc75.jpg/v1/fill/w_1280,h_720,q_75,strp/the_netflix_login_background__canada__2024___by_logofeveryt_dh0w8qv-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NzIwIiwicGF0aCI6IlwvZlwvZjU2MmFhZjQtNWRiYi00NjAzLWEzMmItNmVmNmMyMjMwMTM2XC9kaDB3OHF2LTlkOGVlNmIyLWI0MWEtNDY4MS1hYjliLThhMjI3NTYwZGM3NS5qcGciLCJ3aWR0aCI6Ijw9MTI4MCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.LOYKSxIDqfPwWHR0SSJ-ugGQ6bECF0yO6Cmc0F26CQs')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
      <div className="w-12rem mx-auto bg-neutral-100 rounded-lg p-2"
        style={{
          boxShadow: "rgba(6, 24, 44, 0.4) 0px 0px 0px 2px, rgba(6, 24, 44, 0.65) 0px 4px 6px -1px, rgba(255, 255, 255, 0.08) 0px 1px 0px inset",
        }}>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-extrabold text-white">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="rounded-lg py-8 px-4 sm:px-10">

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-white"
                >
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    ref={userRef}
                    value={email}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-white"
                >
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="persistCheck mt-4">
                    <input
                        type="checkbox"
                        id="persist"
                        onChange={toggleCheck}
                        checked={check}
                    />
                    <label  className="block text-sm font-medium text-white">Trust This Device</label>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign in
                </button>
              </div>
            </form>
            <div className="text-center mt-4">
              <button
                onClick={logn}
                className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Sign in with Google 🚀
              </button>
              {/* <FacebookLogin 
                appId="1082538672269893"  
                autoLoad={false}  
                fields="name,email,picture"  
                callback={handleFacebookCallback}
                cssClass="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                icon="fa-facebook"
              /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
