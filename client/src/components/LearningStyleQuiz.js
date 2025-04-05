import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';

const LearningStyleQuiz = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [preferences, setPreferences] = useState({
    response_length: '',
    guidance_style: '',
    value_focus: '',
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // ------------- Load Existing Preferences ---------------
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/get-preferences?user_id=${user.user_id}`);
        const data = await res.json();
        console.log("Fetched learning preferences:", data);
        if (res.ok && data.preferences) {
          setPreferences(data.preferences);
        }
      } catch (err) {
        console.error('Error loading preferences:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.user_id) {
      fetchPreferences();
    }
  }, [user]);

  // ------------- Handle Form Change ---------------
  const handleChange = (e) => {
    setPreferences({ ...preferences, [e.target.name]: e.target.value });
  };

  // ------------- Handle Save Preferences ---------------
  const handleSubmit = async () => {
    try {
      const res = await fetch('${process.env.REACT_APP_API_URL}/save-preferences', {
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
    <div className="page-container">
      <div className="quiz-content-wrapper">
        {/* ---- Left: Quiz Form ---- */}
        <Card className="learning-panel">
          <Card.Body>
            <Card.Title className="text-center mb-4">LEARNING STYLE QUIZ</Card.Title>
            <hr />
  
            {loading ? (
              <div className="text-center">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              <>
                {message && <Alert variant="info">{message}</Alert>}
  
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Preferred Response Length</Form.Label>
                    <Form.Select
                      name="response_length"
                      value={preferences.response_length}
                      onChange={handleChange}
                    >
                      <option value="" disabled={!!preferences.response_length}>-- Select --</option>
                      <option value="short">Short</option>
                      <option value="long">Long</option>
                    </Form.Select>
                  </Form.Group>
  
                  <Form.Group className="mb-3">
                    <Form.Label>Guidance Style</Form.Label>
                    <Form.Select
                      name="guidance_style"
                      value={preferences.guidance_style}
                      onChange={handleChange}
                    >
                      <option value="" disabled={!!preferences.response_length}>-- Select --</option>
                      <option value="step_by_step">Step-by-step</option>
                      <option value="real_world">Real-world examples</option>
                    </Form.Select>
                  </Form.Group>
  
                  <Form.Group className="mb-3">
                    <Form.Label>What Do You Value More?</Form.Label>
                    <Form.Select
                      name="value_focus"
                      value={preferences.value_focus}
                      onChange={handleChange}
                    >
                      <option value="" disabled={!!preferences.response_length}>-- Select --</option>
                      <option value="process">Understanding the process</option>
                      <option value="direct">Getting the answer directly</option>
                    </Form.Select>
                  </Form.Group>
  
                  <Button
                    onClick={handleSubmit}
                    className="w-100"
                    disabled={
                      !preferences.response_length ||
                      !preferences.guidance_style ||
                      !preferences.value_focus
                    }
                  >
                    Save Preferences
                  </Button>
                </Form>
              </>
            )}
          </Card.Body>
        </Card>
  
        {/* ---- Right: Explanation Panel ---- */}
        <Card className="learning-panel">
          <Card.Body>
            <Card.Title className="info-title text-center">ABOUT THE AI MODES</Card.Title>
            <hr />
            <p className="info-text">
              Your choices here directly influence how the AI tutor interacts with you in your Customized Learning Style responses.
            </p>
            <ul className="info-list">
              <li><strong>Response Length</strong>: Want a quick summary or a deep explanation?</li>
              <li><strong>Guidance Style</strong>: Choose between structured steps or real-world examples.</li>
              <li><strong>Value Focus</strong>: Learn the process, or just get the answer fast.</li>
            </ul>
            <p className="info-text mt-3">
              These preferences customize the AI's tone, explanation depth, and teaching style —
              tailoring the learning experience to what works best for you.
            </p>
          </Card.Body>
        </Card>

      </div>
    </div>
  );
  
};

export default LearningStyleQuiz;
