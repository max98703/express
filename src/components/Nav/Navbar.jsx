import React, { useContext } from 'react';
import "../../App.css";
import { AppContext } from '../../context/AppContext'; // Adjust path as per your project structure
import { useLocation } from 'react-router-dom';

const Navbar = () => {
  const {
    state,
    showSearch,
    handleCategoryChange,
    toggleTheme,
    storedValue,
    toggleSearch,
    
  } = useContext(AppContext);
  
  const location = useLocation();

  const renderNavbarSection = () => {
    if (location.pathname === '/') {
      return (
        <>
          {storedValue && (
            <div>
              <nav className="navbar navbar-expand-lg fixed ">
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
                  {!showSearch && (
                    <select
                      className="form-select"
                      value={state.selectedCategory}
                      onChange={handleCategoryChange}
                    >
                      <option
                        value="all"
                        style={{ color: '#ffffff', background: '#6067b799' }}
                        disabled
                      >
                        Select Category
                      </option>
                      <option
                        value="movie"
                        style={{ color: '#ffffff', background: '#6067b799' }}
                      >
                        Movie
                      </option>
                      <option
                        value="episode"
                        style={{ color: '#ffffff', background: '#6067b799' }}
                      >
                        Episode
                      </option>
                      <option
                        value="series"
                        style={{ color: '#ffffff', background: '#6067b799' }}
                      >
                        Series
                      </option>
                    </select>
                  )}
                  <div onClick={toggleSearch}>
                  <i
                      className="fa fa-search"
                      style={{ color: '#ffffff' }}
                    ></i>
                  </div>
                  
                </div>
              </nav>
            </div>
          )}
        </>
      );
    } else {
      return (
        <>
          <div>No Navbar content for this route.</div>
        </>
      );
    }
  };

  return (
    <>
      {renderNavbarSection()}
    </>
  );
};

export default Navbar;
