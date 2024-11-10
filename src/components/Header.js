import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header>
      <nav>
        <div className="logo">
          <img src="./assets/TutorTech.png" alt="TutorTech Logo" className="logo-img" />
          <h1>TutorTech</h1>
        </div>
        <div className="header-buttons">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/team" className="nav-link">Meet the Team</Link>
          <Link to="/sponsors" className="nav-link">Our Sponsors</Link>
          <Link to="/technologies" className="nav-link">Technologies</Link>
          <Link to="/solution" className="nav-link">Solution</Link>
          <Link to="/schedule" className="nav-link">Schedule</Link>
          <Link to="/login" className="nav-link">Login</Link>
        </div>
      </nav>
    </header>
  );
}

export default Header;
