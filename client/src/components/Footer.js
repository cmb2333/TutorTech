import React from 'react';
import { useState, useEffect } from "react";

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Function to check scroll position
  const toggleVisibility = () => {
    if (window.scrollY > 100) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Add event listener on scroll
  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <footer className="footer text-light">
      <div className="container py-4">
        <div className="row">
          {/* Location Section */}
          <div className="col-md-4">
            <h5>Location</h5>
            <p>123 University Ave, Flagstaff, AZ 86001</p>
          </div>

          {/* Contact Info Section */}
          <div className="col-md-4">
            <h5>Contact Info</h5>
            <p>Email: support@tutortech.com</p>
            <p>Phone: +1 (555) 123-4567</p>
          </div>

          {/* Common Links Section */}
          <div className="col-md-4">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-light">Home</a></li>
              <li><a href="/about" className="text-light">About Us</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Back to Top Button */}
      <a
        href="#"
        className={`back-to-top d-flex align-items-center justify-content-center ${
          isVisible ? "active" : "hidden"
        }`}
      >
        <i className="bi bi-arrow-up"></i>
      </a>
    </footer>
  );
}

export default Footer;
