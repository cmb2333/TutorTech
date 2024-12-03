import React from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import aboutimg from '../assets/aboutimg.jpg'; 
// import chatbot and conversation flow
import Chatbot from 'react-chatbotify';
import { flow } from './flow';

function About() {
  return (
    <section className='about-page'>
      {/* Breadcrumbs Section */}
      <div className="breadcrumbs aos-init aos-animate" data-aos="fade-in">
        <div className="container">
           {/*  'About Us' */}
          <h2>About Us</h2>
          <p>TutorTech aims to provide a comprehensive, personalized learning experience for students by offering real-time, adaptive learning resources. The platform is developed by a team of students interested in AI and education technology, inspired by initiatives like the Metrology Research and Teaching Laboratory (MRTL). MRTL's interdisciplinary approach to research and education has influenced TutorTech’s design, focusing on creating an intuitive and responsive academic support system. TutorTech features tools like interactive assistance, progress tracking, and tailored feedback to meet the unique needs of each student. Focused on bridging the gap between classroom instruction and individual learning, TutorTech ensures that every student has access to the support they need for academic success.</p>
        </div>
      </div>

      {/* Vision, Mission, and Features Section */}
      <section className="vision-mission-section">
        <Container>
          <Row className="vision-mission-row">
            <Col md={6} className="vision-mission-text">
              <h3 className="tutortech-title">TutorTech</h3> 
              <h3 className="underline vision-heading">Vision</h3>
              <p>To address the challenge of students feeling under-supported academically, TutorTech is proposed as a web application designed to provide real-time, personalized learning resources that go beyond what is typically available in the classroom. Through features such as interactive AI assistance, progress tracking, and tailored feedback, TutorTech will give students the academic support they need, in a format that adapts to their individual learning needs.</p>

              <h3 className="underline mission-heading">Mission</h3>
              <p>The mission of TutorTech is to create a Learning management system (LMS) that uses AI to create personalized learning experiences for registered students. Important features that this LMS will hold is a study partner and tutor powered by AI that will allow students to ask any and all questions they may have to receive various explanations to level up their understanding. Tracking features will also be available to visibly show their progress and areas to improve based on the student’s quizzes, assignments, etc. Any feedback given through this LMS will be generated based on each student and their needs.</p>

              <h3 className="underline key-features-heading">Key Features</h3>
              <ul>
                <li>Personalized AI assistant</li>
                <li>Performance tracking</li>
                <li>Progress report</li>
                <li>Personalized feedback</li>
                <li>AI chat</li>
              </ul>

              <h3 className="underline key-requirements-heading">Key Requirements</h3>
              <ul>
                <li>Responsive LMS</li>
                <li>Engaging User Interface (UI)</li>
                <li>Real-time grading & progress-tracking</li>
                <li>Protection of user-data</li>
                <li>AI-powered adaptive learning</li>
              </ul>
            </Col>

            {/* Image Section */}
            <Col md={6} className="about-image-col">
              <img src={aboutimg} alt="About TutorTech" className="about-image" />
            </Col>
          </Row>
          {/* Chatbot at the bottom of the page */}
        <Chatbot flow={flow} />
        </Container>
      </section>
    </section>
  );
}

export default About;
