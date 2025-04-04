/* --------------------------------- Login.js ---------------------------------
Component responsible for 
  - rendering the login form
  - validating user credentials
  - redirecting the user to their dashboard upon successful authentication.
---------------------------------------------------------------------------- */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import styles from './styles/Login.module.css'; // scoped module CSS

/* --------------------------- Main Login Component ------------------------ */
function Login() {

  /* ----- state hooks for form input values and status message ----- */
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const { setUser } = useUser(); // setUser from global user context
  const navigate = useNavigate(); // navigation hook from react-router


  /* -------------------- Handle Login -------------------- */
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // make login request to backend API
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, user_password: password }),
        credentials: 'include', // include cookies for session management
      });

      const data = await response.json();

      // set user data and redirect to dashboard if successful 
      if (response.ok) {
        setMessage(data.message);
        setUser(data);
        navigate('/dashboard');

      // otherwise, show error message from server
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.'); // fallback error message
    }
  };

  // render the login UI
  return (
    <div className={styles.loginWrapper}>

      {/* login form container */}
      <div className={styles.login}>
        <img
          src="/assets/nau_logo.png"
          alt="NAU Logo"
        />

        {/* login title + subtitle */}
        <h2>Welcome</h2>
        <h3>Metrology Research and Teaching Laboratory!</h3>

        {/* login form */}
        <form className={styles.form} onSubmit={handleLogin}>
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
              type="password"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>Password</label>
          </div>

          <button type="submit" className={styles.button}>
            <p>Login<span className="material-symbols-outlined">arrow_forward</span></p>
          </button>
        </form>

        {/* dynamic feedback message */}
        {message && <p>{message}</p>}

        {/* placeholder forgot password link */}
        <a href="#">Forgot password?</a>

        {/* link to signup page */}
        <p className={styles.footer}>
          Not a member yet? <Link to="/signup">Sign up!</Link>
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
}

export default Login;


