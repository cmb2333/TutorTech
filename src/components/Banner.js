import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function Banner() {
  // Get user data from context
  const { user } = useUser(); 

  return (
    <section className="banner">
      <div className="content">
        <h2>Empowering Learning, One Click at a Time</h2>
        <p>Personalized AI-Integrated Tutoring for a Smarter Future.</p>
        {user ? (
          <p>Welcome, {user.firstName} {user.lastName}!</p>
        ) : (
          <p>Welcome to TutorTech! Please log in to access personalized features.</p>
        )}
        <Link to="/chat" className="button-chat">Chat With AI Tutor</Link>
      </div>
    </section>
  );
}

export default Banner;

