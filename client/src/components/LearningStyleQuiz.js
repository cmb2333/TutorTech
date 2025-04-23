/* ------------------------------ LearningStyleQuiz.js ------------------------------
Component responsible for:
  - displaying a personalized AI quiz with clickable options
  - loading and saving preferences from/to the backend
  - redirecting to dashboard after submission
---------------------------------------------------------------------------------- */

import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { Spinner, Alert } from 'react-bootstrap';

import styles from './styles/LearningStyleQuiz.module.css';

/* ------------------------ Main LearningStyleQuiz Component ------------------------ */
function LearningStyleQuiz() {
  const { user } = useUser();
  const navigate = useNavigate();

  /* ------------------------ Component State ------------------------ */
  const [preferences, setPreferences] = useState({
    response_length: '', // short | long
    guidance_style: '', // step_by_step | real_world
    value_focus: '', // process | direct
  });

  const [loading, setLoading] = useState(true);    // toggle spinner on load
  const [message, setMessage] = useState('');      // message to show after save

  // ------------- Load Existing Preferences ---------------
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        // fetch preferences from backend using user_id
        const res = await fetch(`${process.env.REACT_APP_API_URL}/get-preferences?user_id=${user.user_id}`);
        const data = await res.json();
        // update state if data found
        if (res.ok && data.preferences) {
          setPreferences(data.preferences);
        }
      } catch (err) {
        console.error('Error loading preferences:', err);
      } finally {
        setLoading(false);
      }
    };

    // trigger fetch if user is defined
    if (user?.user_id) {
      fetchPreferences();
    }
  }, [user]);

  /* ------------------------ Handle Option Selection ------------------------ */
  const handleButtonSelect = (name, value) => {
    setPreferences({ ...preferences, [name]: value });
  };

  /* ------------------------ Handle Form Submit ------------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // send POST request to save preferences
      const res = await fetch(`${process.env.REACT_APP_API_URL}/save-preferences`, {
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

  /* ------------------------ Render Component ------------------------ */
  return (
    <div className={styles.quizWrapper}>
      
      {/* -------------------- Preferences Card -------------------- */}
      <div className={styles.quiz}>
        <img src="/assets/nau_logo.png" alt="NAU Logo" />

        {/* title and subtitle */}
        <h2>Learning Style Quiz</h2>
        <h3>Help us personalize your tutoring experience</h3>

        {/* -------------------- Quiz Form -------------------- */}
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            {message && <Alert variant="info">{message}</Alert>}

            {/* ------------------ Response Length ------------------ */}
            <div className={styles.buttonGroup}>
              <label className={styles.label}>Response Length</label>
              <div className={styles.optionRow}>
                <button
                  type="button"
                  className={`${styles.optionButton} ${preferences.response_length === 'short' ? styles.selected : ''}`}
                  onClick={() => handleButtonSelect('response_length', 'short')}
                >
                  Short
                </button>
                <button
                  type="button"
                  className={`${styles.optionButton} ${preferences.response_length === 'long' ? styles.selected : ''}`}
                  onClick={() => handleButtonSelect('response_length', 'long')}
                >
                  Long
                </button>
              </div>
            </div>

            {/* ------------------ Guidance Style ------------------ */}
            <div className={styles.buttonGroup}>
              <label className={styles.label}>Guidance Style</label>
              <div className={styles.optionRow}>
                <button
                  type="button"
                  className={`${styles.optionButton} ${preferences.guidance_style === 'step_by_step' ? styles.selected : ''}`}
                  onClick={() => handleButtonSelect('guidance_style', 'step_by_step')}
                >
                  Step-by-step
                </button>
                <button
                  type="button"
                  className={`${styles.optionButton} ${preferences.guidance_style === 'real_world' ? styles.selected : ''}`}
                  onClick={() => handleButtonSelect('guidance_style', 'real_world')}
                >
                  Real-world examples
                </button>
              </div>
            </div>

            {/* ------------------ Value Focus ------------------ */}
            <div className={styles.buttonGroup}>
              <label className={styles.label}>Value Focus</label>
              <div className={styles.optionRow}>
                <button
                  type="button"
                  className={`${styles.optionButton} ${preferences.value_focus === 'process' ? styles.selected : ''}`}
                  onClick={() => handleButtonSelect('value_focus', 'process')}
                >
                  Understanding the process
                </button>
                <button
                  type="button"
                  className={`${styles.optionButton} ${preferences.value_focus === 'direct' ? styles.selected : ''}`}
                  onClick={() => handleButtonSelect('value_focus', 'direct')}
                >
                  Getting the answer directly
                </button>
              </div>
            </div>

            {/* ------------------ Submit Button ------------------ */}
            <button
              type="submit"
              className={styles.button}
              disabled={
                !preferences.response_length ||
                !preferences.guidance_style ||
                !preferences.value_focus
              }
            >
              <p>
                Save Preferences
                <span className="material-symbols-outlined">arrow_forward</span>
              </p>
            </button>
          </form>
        )}
      </div>

      {/* animated SVG wave background */}
      <object
        className={styles.wave}
        type="image/svg+xml"
        data="/animations/wave.svg"
        aria-label="Animated wave"
      />
    </div>
  );
}

export default LearningStyleQuiz;

