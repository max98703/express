import React, { useContext } from "react";
import "../../App.css";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext"; // Adjust path as per your project structure
import { useLocation } from "react-router-dom";

const Navbar = () => {
  const { state, handleCategoryChange, toggleTheme, toggleSearch } =
    useContext(AppContext);
  const location = useLocation();

  const renderNavbarSection = () => {
    if (location.pathname === "/") {
      return (
        <div>
          <nav className="navbar navbar-expand-lg fixed">
            <div className="container-fluid">
              <div className="navbar-brand" onClick={toggleTheme}>
                <img
                  src="https://flowbite.com/docs/images/logo.svg"
                  alt="Flowbite Logo"
                  width="30"
                  height="24"
                  className="d-inline-block align-text-top"
                />
                &nbsp;
              </div>
              {!state.showSearch && (
                <select
                  className="form-select"
                  value={state.selectedCategory}
                  onChange={handleCategoryChange}
                >
                  <option
                    value="all"
                    style={{ color: "#ffffff", background: "#6067b799" }}
                    disabled
                  >
                    Select Category
                  </option>
                  <option
                    value="movie"
                    style={{ color: "#ffffff", background: "#6067b799" }}
                  >
                    Movie
                  </option>
                  <option
                    value="episode"
                    style={{ color: "#ffffff", background: "#6067b799" }}
                  >
                    Episode
                  </option>
                  <option
                    value="series"
                    style={{ color: "#ffffff", background: "#6067b799" }}
                  >
                    Series
                  </option>
                </select>
              )}
              <div onClick={toggleSearch}>
                <i className="fa fa-search" style={{ color: "#ffffff" }}></i>
              </div>
            </div>
          </nav>
        </div>
      );
    } else {
      return (
        <div className="fixed top-0 left-0 w-full flex justify-between bg-gray-800 p-4 shadow-md">
          <Link to="/">
            <i className="fa fa-arrow-left text-xl" aria-hidden="true"></i>
          </Link>
          <div onClick={toggleSearch}>
            <i className="fa fa-search text-xl" aria-hidden="true"></i>
          </div>
        </div>
      );
    }
  };

  return <>{renderNavbarSection()}</>;
};

export default Navbar;
