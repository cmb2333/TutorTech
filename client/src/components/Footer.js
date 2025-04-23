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
            <p>Bldg #98E, South Engineering Lab <br />
            560 E Pine Knoll Drive <br />
            Flagstaff AZ 86011 <br />
            United States </p>
          </div>

          {/* Contact Info Section */}
          <div className="col-md-4">
            <h5>Contact Info</h5>
            <p>Email: MRTL@nau.edu</p>
            <p><a href="https://ac.nau.edu/~jw2575/" target="_blank" rel="noopener noreferrer" className="text-light">MRTL Website</a></p>
            <p>Phone: 928/523-7079</p>
          </div>

          {/* Common Links Section */}
          <div className="col-md-4">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-light">Home</a></li>
              <li><a href="/courses" className="text-light">Courses</a></li>
              <li><a href="/about" className="text-light">About Us</a></li>
              <li><a href="/contact" className="text-light">Contact</a></li>
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
