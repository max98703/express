import React, { useEffect, Fragment, useContext } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Detail from "./components/Details/Detail";
import Home from "./components/Home/Home";
import SearchMovie from "./components/Search/SearchMovie";
import Category from "./components/Category/Category";
import Login from "./components/Login/Login";
import Footer from "./components/Footer/Footer";
import "./App.css";
import { AppContext } from "./context/AppContext"; // Adjust path as per your project structure
import Navbar from "./components/Nav/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import SearchBar from "./components/Search/SearchBar";

function App() {
  const { handleScroll, storedValue } = useContext(AppContext);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  return (
    <Router>
      {storedValue && (
        <>
          <Navbar />
          <SearchBar />
          <Footer />
        </>
      )}
      <Fragment>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route exact path="" element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:movieName" element={<SearchMovie />} />
            <Route path="/details/:id" element={<Detail />} />
            <Route path="/category/:value" element={<Category />} />
          </Route>
        </Routes>
      </Fragment>
    </Router>
  );
}

export default App;
