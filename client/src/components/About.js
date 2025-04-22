import React, { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faEye, faRocket, faComments } from '@fortawesome/free-solid-svg-icons';
import "./styles/about.css"

function About() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <div className="about-body">
      <section id="about">
        {/* About Us Section */}
        <div className="about-1 text-center" data-aos="fade-in">
          <h1 data-aos="fade-up" data-aos-delay="100">ABOUT US</h1>
          <p className="breadcrumbs-text" data-aos="fade-up" data-aos-delay="100">
            TutorTech enhances learning by offering personalized support through adaptive resources, 
            interactive assistance, and progress tracking. 
            Inspired by the Metrology Research and Teaching Laboratory (MRTL),
            a connection hub of various stem fields to innovate the future of research and education;
            our student-led platform bridges the gap between classroom instruction and individual learning, 
            ensuring students have the tools they need for academic success.
          </p>
        </div>

        {/* Vision, Mission, Features, Chatbot Personas Section */}
        <Container>
          <div className="about-container">
            {/* Vision Section */}
            <div className="about-item text-center" data-aos="fade-up" data-aos-delay="200">
              <FontAwesomeIcon icon={faEye} size="2x" />  
              <h3>VISION</h3>
              <hr />
              <p>
                TutorTech addresses the challenge of academic under-support by offering real-time, personalized learning resources. With interactive assistance, progress tracking, and tailored feedback, TutorTech adapts to each student's unique learning needs.
              </p>
            </div>

            {/* Mission Section */}
            <div className="about-item text-center" data-aos="fade-up" data-aos-delay="300">
              <FontAwesomeIcon icon={faRocket} size="2x" />  
              <h3>MISSION</h3>
              <hr />
              <p>
                TutorTech’s mission is to develop an AI-powered Learning Management System (LMS) that enhances learning through personalized study partners, progress tracking, and targeted feedback to help students succeed academically.
              </p>
            </div>

            {/* Key Features Section */}
            <div className="about-item text-center" data-aos="fade-up" data-aos-delay="400">
              <FontAwesomeIcon icon={faKey} size="2x" />  
              <h3>KEY FEATURES</h3>
              <hr />
              <ul>
                <li>Personalized AI assistant</li>
                <li>Performance tracking</li>
                <li>Progress report</li>
                <li>Personalized feedback</li>
                <li>AI chat</li>
              </ul>
            </div>

            {/* Chatbot Personas */}
            <div className="about-item text-center" data-aos="fade-up" data-aos-delay="400">
              <FontAwesomeIcon icon={faComments} size='2x' />
              <h3>CHAT PERSONA</h3>
              <hr />
              <ul>
                <li><strong>Tutor</strong> - Thorough step-by-step explanations</li>
                <li><strong>Mentor</strong> - Real-world applications in explanations</li>
                <li><strong>Co-Learner</strong> - Acts as a study partner</li>
                <li><strong>Custom Learning Style</strong> - Explanations are catered to student preferances</li>
              </ul>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

export default About;
