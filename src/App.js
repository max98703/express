import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Nav/Navbar";
import SearchBar from "./components/Search/SearchBar";
import Footer from "./components/Footer/Footer";
import Login from "./components/Login/Login";
import Profile from "./components/Profile/Profile";
import Home from "./components/Home/Home";
import Payment from "./components/Payment/Payment";
import Paymentproccess from "./components/Payment/Paymentproccess";
import SearchMovie from "./components/Search/SearchMovie";
import Detail from "./components/Details/Detail";
import Pr from "./components/PullRequest/Pr";
import Missing from "./components/Missing/Missing";
import PrFeed from "./components/PullRequest/Feed";
import Collaborator from "./components/PullRequest/Collaborators";
import Dashboard from "./components/PullRequest/Dashboard";
import Category from "./components/Category/Category";
import Reset from "./components/PasswordReset/Reset";
import CustomerCare from "./components/CustomerCare/CustomerCare";
import Users from "./components/User/Users"
import TaskPage from "./components/Task/Task";
import { userService } from "./Services/authentication.service";
import Taskdashboard from "./components/Task/Dashboard";
import Feed from "./components/Feeds/Feed";
import * as PusherPushNotifications from "@pusher/push-notifications-web";
import Logins from "./components/PullRequest/AdminLogin";
import Project from "./components/Project/Project";
import TaskDetail from "./components/TaskDetail/TaskDetail";
import Otp from "./components/2fa/Otp";

const PrivateRoute = ({ element }) => {
  return userService.loggedIn() ? (
    <>
      <Navbar />
      {element}
      <Footer />
      <SearchBar/>
    </>
  ) : (
    <Navigate to="/login" replace />
  );
};

const PrivateAdmin = ({ element }) => {
  return userService.loggedIn() ? (
    <>  
      {element}
    </>
  ) : (
    <Navigate to="/admin" replace />
  );
};
function App() {
  useEffect(() => {
    const beamsClient = new PusherPushNotifications.Client({
      instanceId: '12effc35-a27f-4fd4-ba62-1812b323b16c',
    });

    beamsClient.start()
      .then(() => {
        const user = userService.getUserData();
        if (user) {
          const userId = String(user.user_id);  // Ensure userId is a string
          return beamsClient.addDeviceInterest(userId);
        }
      })
      .then(() => console.log('Successfully registered and subscribed!'))
      .catch(console.error);

    return () => {
      beamsClient.stop();
    };
  }, []);

  return (
    <Routes>
      <Route path="/admin" element={<Logins />} />
    <Route path="/chat" element={<PrivateAdmin element={<CustomerCare />} />} />
    <Route path="/feed" element={<PrivateAdmin element={<Feed />} />} />
    <Route path="/login" element={<Login />} />
    <Route path="/2fa/otp" element={<Otp />} />
    <Route path="/pr/feed" element={<PrivateAdmin element={<PrFeed />} />} />
    <Route path="/dashboard" element={<PrivateAdmin element={<Dashboard />} />} />
    <Route path="/pr" element={<PrivateAdmin element={<Pr />} />} />
    <Route path="/pr/collaborator" element={<PrivateAdmin element={<Collaborator />} />} />
    <Route path="/task" element={<PrivateAdmin element={<TaskPage />} />} />
    <Route path="/users" element={<PrivateAdmin element={<Users />} />} />
    <Route path="/projects" element={<PrivateAdmin element={<Project />} />} />
    <Route path="/user/dashboard" element={<PrivateAdmin element={<Taskdashboard />} />} />
    <Route path="/task/details/:id" element={<PrivateAdmin element={<TaskDetail/>} />} />
  
    {/* Routes for regular users */}
    <Route path="/" element={<PrivateRoute element={<Home />} />} />
    <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
    <Route path="/payment" element={<PrivateRoute element={<Payment />} />} />
    <Route path="/paymentproccess" element={<PrivateRoute element={<Paymentproccess />} />} />
    <Route path="/movie/:movieName" element={<PrivateRoute element={<SearchMovie />} />} />
    <Route path="/details/:id" element={<PrivateRoute element={<Detail />} />} />
    <Route path="/category/:value" element={<PrivateRoute element={<Category />} />} />
    <Route path="/password-reset" element={<PrivateRoute element={<Reset />} />} />
    <Route path="*" element={<Missing />} />
  </Routes>
  
  );
}

export default App;
