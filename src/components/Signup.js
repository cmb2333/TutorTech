import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Card } from 'react-bootstrap';

const Signup = () => {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          email: email,
          user_password: password,
          first_name: firstName,
          last_name: lastName
        }),
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
    <section className="d-flex justify-content-center align-items-center flex-column" style={{ height: '100vh' }}>
      {/* Sign Up title centered above the card */}
      <h1 style={{
        marginBottom: '40px', 
        textAlign: 'center', 
        color: '#003466', 
        fontSize: '2rem', 
        fontWeight: 'bold'
      }}>Sign Up</h1>

      <Card className="login-card text-center shadow-sm p-3">
        <Card.Body>
        <Form onSubmit={handleSignup}>
          <Form.Group controlId="userId" className="mb-3">
            <Form.Label>User ID</Form.Label>
            <Form.Control type="text" placeholder="Enter user ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
          </Form.Group>

          <Form.Group controlId="email" className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Form.Group>

          <Form.Group controlId="firstName" className="mb-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control type="text" placeholder="Enter first name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </Form.Group>

          <Form.Group controlId="lastName" className="mb-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control type="text" placeholder="Enter last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </Form.Group>

          <Form.Group controlId="password" className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100">Register</Button>
        </Form>

          <p className="mt-3">{message}</p>
        </Card.Body>
      </Card>
    </section>
  );
};

export default Signup;