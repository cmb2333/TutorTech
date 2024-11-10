import React from 'react';
import { Link } from 'react-router-dom';

function Banner() {
  return (
    <section className="banner">
      <div className="content">
        <h2>Empowering Learning, One Click at a Time</h2>
        <p>Personalized AI-Integrated Tutoring for a Smarter Future.</p>
        <Link to="/chat" className="button-chat">Chat With AI Tutor</Link>
      </div>
    </section>
  );
}

export default Banner;


