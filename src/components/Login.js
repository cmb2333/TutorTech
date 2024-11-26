import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Form, Button, Card } from 'react-bootstrap';
// import chatbot and conversation flow
import Chatbot from 'react-chatbotify';
import { flow } from './flow';

function Login() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { setUser } = useUser();
  // Redirect
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, password }),
        credentials: 'include',
      });

      const data = await response.json();

      // Store user data for session then go to home page
      if (response.ok) {
        setMessage(data.message);
        setUser(data);
        navigate('/');
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <section className="d-flex justify-content-center align-items-center flex-column" style={{ height: '100vh' }}>
      {/* Login title centered above the card */}
      <h1 style={{
        marginBottom: '40px', 
        textAlign: 'center', 
        color: '#003466', 
        fontSize: '2rem', 
        fontWeight: 'bold'
      }}>Login</h1>

      <Card className="login-card text-center shadow-sm p-3">
        <Card.Body>
          <Form onSubmit={handleLogin}>
            {/* User ID field */}
            <Form.Group controlId="userId" className="mb-3">
              <Form.Label>User ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter user ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </Form.Group>

            {/* Password field */}
            <Form.Group controlId="password" className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            {/* Submit button */}
            <Button variant="primary" type="submit" className="w-100">
              Login
            </Button>
          </Form>

          <p className="mt-3">{message}</p>
        </Card.Body>
      </Card>
      {/* Chatbot at the bottom of the page */}
      <Chatbot flow={flow} />
    </section>
  );
}

export default Login;
