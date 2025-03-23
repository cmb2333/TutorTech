import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Alert } from 'react-bootstrap';

const LearningStyleQuiz = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [preferences, setPreferences] = useState({
    response_length: '',
    guidance_style: '',
    value_focus: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setPreferences({ ...preferences, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch('http://localhost:5000/save-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id, preferences }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Preferences saved successfully!');
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        setMessage(data.error || 'Error saving preferences.');
      }
    } catch (err) {
      console.error('Error:', err);
      setMessage('Failed to save preferences.');
    }
  };

  return (
    <Card className="form-container">
      <Card.Body>
        <Card.Title>Learning Style Quiz</Card.Title>
        {message && <Alert variant="info">{message}</Alert>}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Preferred Response Length</Form.Label>
            <Form.Select name="response_length" value={preferences.response_length} onChange={handleChange}>
              <option value="">-- Select --</option>
              <option value="short">Short</option>
              <option value="long">Long</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Guidance Style</Form.Label>
            <Form.Select name="guidance_style" value={preferences.guidance_style} onChange={handleChange}>
              <option value="">-- Select --</option>
              <option value="step_by_step">Step-by-step</option>
              <option value="real_world">Real-world examples</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>What Do You Value More?</Form.Label>
            <Form.Select name="value_focus" value={preferences.value_focus} onChange={handleChange}>
              <option value="">-- Select --</option>
              <option value="process">Understanding the process</option>
              <option value="direct">Getting the answer directly</option>
            </Form.Select>
          </Form.Group>

          <Button variant="primary" onClick={handleSubmit}>Save Preferences</Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default LearningStyleQuiz;
