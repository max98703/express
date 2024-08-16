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
import Missing from "./components/Missing/Missing";
import Category from "./components/Category/Category";
import Reset from "./components/PasswordReset/Reset";
import { userService } from "./Services/authentication.service";
import * as PusherPushNotifications from "@pusher/push-notifications-web";

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
      <Route path="/login" element={<Login />} />
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
