import React from 'react';
import { Link } from 'react-router-dom';

import { Container, Navbar, Nav } from 'react-bootstrap';

function Header() {
  return (
    <Navbar expand="lg" variant='dark' className='navbar-custom'>
      <Container fluid>
        <Navbar.Brand className='me-auto'>
          <img
            alt="NAU Logo"
            src="/assets/nau_logo.png"
            className='logo'
          />{' '}
          Metrology Research and Teaching Laboratory
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav" className="justify-content-center">
          <Nav className="d-flex mx-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/courses">Courses</Nav.Link>
            <Nav.Link as={Link} to="about">About Us</Nav.Link>
            <Nav.Link as={Link} to="/chat">Chat</Nav.Link>
          </Nav>

        <Nav className='ms-auto'>
          <Nav.Link as={Link} to="/login">
            <i className="bi bi-person"></i> Login
          </Nav.Link>

          <Nav.Link as={Link} to="/signup">
            <i className="bi bi-door-open"></i> Signup
          </Nav.Link>
        </Nav>

        </Navbar.Collapse>

      </Container>

    </Navbar>
  );
}

export default Header;
