import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css'; // Import your CSS file for styling
import { AppContext } from "../../context/AppContext";

const Footer = () => {
  const { searchOpen,toggleSearch} = useContext(AppContext);

  const handleHomeClick = () => {
    if (searchOpen){
       toggleSearch(!searchOpen);
    };
  };

  return (
    <>
        <footer className="footer">
          <div className="footer-container">
            <Link to="/" onClick={handleHomeClick} className="footer-link">
              <i className="fa fa-home"></i>
              <span>home</span>
            </Link>
            <Link onClick={toggleSearch} className="footer-link">
              <i className="fa fa-search"></i>
              <span>Search</span>
            </Link>
            <Link>
            <div className="footer-link">
              <i className="fa fa-download"></i>
              <span>Download</span>
            </div>
            </Link>
            <Link to="/profile">
              <img
              src='/images/1720765611488.jpg'
              alt="Default Logo" className="h-8 w-8 object-cover" />          
            </Link>
          </div>
        </footer>
      
    </>
  );
};

export default Footer;
