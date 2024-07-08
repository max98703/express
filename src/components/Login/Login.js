import React, { useEffect,useState } from 'react';
import axios from 'axios'; // Ensure axios is imported if needed
import { useAuth } from '../../context/AuthContext'; // Adjust path as per your project structure
import {useGoogleLogin } from '@react-oauth/google';

const Login = () => {
  const { login } = useAuth();
  const [username, setUser] = useState('');
  const [password, setPassword] = useState('');

  const logn = useGoogleLogin({
    onSuccess: (codeResponse) =>setUser(codeResponse),
    onError: (error) => console.log('Login Failed:', error)
  });

  useEffect(
    () => {
        if (username) {
            axios
                .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${username.access_token}`, {
                    headers: {
                        Authorization: `Bearer ${username.access_token}`,
                        Accept: 'application/json'
                    }
                })
                .then((res) => {
                    console.log(res);
                   login(res.data);
                })
                .catch((err) => console.log(err));
        }
    },
    [ username ]
);

  return (
    <div className='section1 ml-3'>
      <div className="wrapper">
        <form className="p-3 mt-3" >
          <h4>Sign In</h4>
          <div className="form-field d-flex align-items-center">
            <i className="fa fa-user"></i>
            <input
              type="text"
              name="userName"
              id="userName"
              placeholder="Username"
              value={username}
              // onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-field d-flex align-items-center">
            <i className="fa fa-key"></i>
            <input
              type="password" // Changed to password type for secure input
              name="password"
              id="pwd"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn mt-3">Login</button>
        </form>
        <div className="text-center fs-6">
        <br/>
            <br/>
            <button onClick={logn}>Sign in with Google 🚀 </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
