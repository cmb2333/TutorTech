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
          <Link to="/courses" className="nav-link">Courses</Link>
          <Link to="/signup" className="nav-link">Sign-up</Link>
          <Link to="/login" className="nav-link">Login</Link>
        </div>
      </nav>
    </header>
  );
}

export default Header;
