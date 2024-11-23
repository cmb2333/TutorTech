import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Card } from 'react-bootstrap';

const Signup = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3001/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
      });

      const data = await response.json();
      setMessage(data.message);

      if (response.ok) {
        // Redirect to login page after successful registration
        navigate("/login");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <section className="d-flex justify-content-center align-items-center">
      <Card className="login-card text-center shadow-sm mt-5 p-3">
        <Card.Body>
          <Card.Title>Sign-up</Card.Title>
          <Form onSubmit={handleSignup}>
            {/* User ID field */}
            <Form.Group controlId="userId" className="mb-3">
              <Form.Label>User ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
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
              Register
            </Button>
          </Form>

          <p className="mt-3">{message}</p>
        </Card.Body>
      </Card>
    </section>
  );
};

export default Signup;
