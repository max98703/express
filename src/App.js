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

function App() {
  useEffect(() => {
    const beamsClient = new PusherPushNotifications.Client({
      instanceId: '12effc35-a27f-4fd4-ba62-1812b323b16c',
    });

    beamsClient.start()
      .then(() => {
        const user = userService.getUserData();
        if (user) {
          const userId = user.id; 
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
       <Route path="/chat" element={<CustomerCare />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/login" element={<Login />} />
      <Route path="/pr/feed" element={<PrFeed />} />
      <Route path="/dashboard" element={<Dashboard/>}/>
      <Route path="/pr" element={<Pr />} />
      <Route path="/admin" element={<Logins />} />
      <Route path="/pr/feed" element={<PrFeed />} />
      <Route path="pr/collaborator" element={<Collaborator/>}/>
      <Route path="/task" element={<TaskPage/>}/>
      <Route path="/users" element={<Users/>}/>
      <Route path="/pr" element={<Pr />} />
      <Route path="/user/dashboard" element={<Taskdashboard/>} />
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
