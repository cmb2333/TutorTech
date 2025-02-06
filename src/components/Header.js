import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Container, Navbar, Nav } from 'react-bootstrap';

function Header() {
  // Access user and setUser from context
  const { user, setUser } = useUser(); 
  const navigate = useNavigate();

  // Handle logout - clear user from context and redirect
  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <Navbar expand="lg" variant="dark" className="navbar-custom">
      <Container fluid>
        <Navbar.Brand className="d-flex me-auto">
          <a href="/">
            <img
              alt="NAU Logo"
              src="/assets/nau_logo.png"
              className="logo"
            />
          </a>
          <h1 className="mtrl-heading">MRTL
            <span className="lab-subtext">Metrology Research and Teaching Laboratory</span>
          </h1>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav" className="justify-content-center">
          <Nav className="d-flex mx-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            {user ? (
              <><Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link></>
            ) : (
              <></>
            )}
            <Nav.Link as={Link} to="/courses">Courses</Nav.Link>
            <Nav.Link as={Link} to="/about">About Us</Nav.Link>
          </Nav>

          <Nav className="ms-auto">
            {user ? (
              <>
                <Nav.Link as={Link} to="/profile">
                <i className="bi bi-person"></i> Profile
                </Nav.Link>
                <Nav.Link as="span" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right"></i> Logout
                </Nav.Link>
                
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  <i className="bi bi-person"></i> Login
                </Nav.Link>
                <Nav.Link as={Link} to="/signup">
                  <i className="bi bi-door-open"></i> Signup
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
