/* -------------------------------- Signup.js --------------------------------
Component responsible for 
  - rendering the signup form
  - collecting user registration data
  - redirecting the user to the login page upon successful account creation.
---------------------------------------------------------------------------- */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './styles/Login.module.css'; // scoped module CSS

/* --------------------------- Main Signup Component ------------------------ */

const Signup = () => {

    /* ----- state hooks for form input values and status message ----- */
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate(); // navigation hook from react-router

  /* -------------------- Handle Signup -------------------- */
  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      // send signup request to backend API
      const response = await fetch('${process.env.REACT_APP_API_URL}/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          email,
          user_password: password,
          first_name: firstName,
          last_name: lastName,
        }),
      });

      const data = await response.json();
      setMessage(data.message); // display feedback message

      // if signup was successful, redirect to login
      if (response.ok) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setMessage('An error occurred. Please try again.'); // fallback error message
    }
  };

  // render the signup UI
  return (
    <div className={styles.loginWrapper}>

      {/* signup form container */}
      <div className={styles.login}>
        <img
          src="/assets/nau_logo.png"
          alt="NAU Logo"
          style={{ width: '120px', height: 'auto' }}
        />

        {/* signup title + subtitle */}
        <h2>Sign Up</h2>
        <h3>Join the Metrology Research and Teaching Lab</h3>

        {/* signup form */}
        <form className={styles.form} onSubmit={handleSignup}>
          <div className={styles.textbox}>
            <input
              required
              type="text"
              placeholder=" "
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <label>User ID</label>
          </div>

          <div className={styles.textbox}>
            <input
              required
              type="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label>Email</label>
          </div>

          <div className={styles.textbox}>
            <input
              required
              type="text"
              placeholder=" "
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <label>First Name</label>
          </div>

          <div className={styles.textbox}>
            <input
              required
              type="text"
              placeholder=" "
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <label>Last Name</label>
          </div>

          <div className={styles.textbox}>
            <input
              required
              type="password"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>Password</label>
          </div>

          <button type="submit" className={styles.button}>
            <p>Register <span className="material-symbols-outlined">arrow_forward</span></p>
          </button>
        </form>

        {/* dynamic feedback message */}
        {message && <p>{message}</p>}

        {/* link to login page if user already has an account */}
        <p className={styles.footer}>
          Already have an account? <Link to="/login">Log in!</Link>
        </p>
      </div>

      {/* animated wave background at bottom */}
      <object
        className={styles.wave}
        type="image/svg+xml"
        data="/animations/wave.svg"
        aria-label="Animated wave"
      />
    </div>
  );
};

export default Signup;
