import React ,{useContext}from 'react';
import { Link } from 'react-router-dom';
import './Footer.css'; // Import your CSS file for styling
import { AppContext } from "../../context/AppContext";

const Footer = () => {
    const {
        toggleSearch,
        storedValue,
      } = useContext(AppContext);
    return (
        <>
        {storedValue && (
        <footer className="footer">
            <div className="footer-container">
                <Link to="/" onClick={toggleSearch} className="footer-link">
                    <i className="fa fa-home"></i>
                        <span>home</span>
                </Link>
                <Link  onClick={toggleSearch}  className="footer-link">
                    <i className="fa fa-search"></i>
                    <span>Search</span>
                 
                </Link>
                <a href="/download" className="footer-link">
                    <i className="fa fa-download"></i>
                    <span>Download</span>
                 
                </a>
                
                <img src="Image/netflix-profile-pictures-1000-x-1000-2fg93funipvqfs9i.jpg" alt="Logo" className="h-8 w-8" /> 
            
            </div>
        </footer>
        )}
    </>
    );
};

export default Footer;
