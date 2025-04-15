import React, { useEffect } from 'react';
import { Container, Card } from 'react-bootstrap';
import HomeCarousel from './HomeCarousel';
import ListGroup from 'react-bootstrap/ListGroup';
import CardGroup from 'react-bootstrap/CardGroup';
// AOS library
import AOS from 'aos';
// AOS styles
import 'aos/dist/aos.css';

function Home() {

  // initialize AOS
  useEffect(() => {
    AOS.init({ 
      duration: 1000,
      easing: 'ease-in-out', }); 
  }, []);

  return (
    <div className='home-page'>
      <section className="banner">
        <Container className='banner-text'>
          <h1 className="display-4" data-aos="fade-up" data-aos-delay="200">
            Tell me and I forget, teach me and I may remember, involve me and I learn
            <br />
          </h1>
        </Container>
      </section>

      <section className='current-landscape-section'>
        <Container className='py-5 text-center'>
          <h1 data-aos="zoom-in" data-aos-delay="400">The Current Landscape of Student Learning</h1>
          <CardGroup className='mt-2 gap-5'>
            <Card className='landscape-card shadow' data-aos="flip-left">
              <Card.Body>
                <Card.Title>Learning Management System Limitations</Card.Title>
                <ListGroup variant="flush">
                  <ListGroup.Item className='list-format'>Lack of real-time support</ListGroup.Item>
                  <ListGroup.Item className='list-format'>Limited personalization</ListGroup.Item>
                  <ListGroup.Item className='list-format'>Minimal engagement</ListGroup.Item>
                  <ListGroup.Item className='list-format'>Inconsistent progress checking</ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
            <Card className='landscape-card shadow' data-aos="flip-left" data-aos-delay="200">
              <Card.Body>
                <Card.Title>Current Classroom Environment</Card.Title>
                <ListGroup variant="flush">
                  <ListGroup.Item className='list-format'>Average professor to student ratio = 1:18</ListGroup.Item>
                  <ListGroup.Item className='list-format'>Only 2-3 hours of class time per week</ListGroup.Item>
                  <ListGroup.Item className='list-format'>Extensive lectures with minimal time for clarification</ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
            <Card className='landscape-card shadow' data-aos="flip-left" data-aos-delay="400">
              <Card.Body>
                <Card.Title>Academic Integrity Issues</Card.Title>
                <ListGroup variant="flush">
                  <ListGroup.Item className='list-format'>Misuse of generative AI</ListGroup.Item>
                  <ListGroup.Item className='list-format'>Prohibited student collaboration</ListGroup.Item>
                  <ListGroup.Item className='list-format'>Online platforms with collection of completed assignments</ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </CardGroup>
        </Container>
      </section>

      <section className='ai-integration-section'>

      {/* ----------- Left Side: Robot + Heading ----------- */}
      <div className='robot-proposal'>
        <h1>AI that understands <br /> how you learn</h1>
        <img 
          src='/assets/newLogo.png' 
          alt='Friendly AI robot' 
          className='robot-img'
        />
      </div>

      {/* ----------- Right Side: Mission Description ----------- */}
      <div className='solution-description'>
        <h2>Our Personalized Solution</h2>
        <p>
          TutorTech integrates AI to help students master material 
          in a way that fits their learning style. Whether you 
          prefer step-by-step guidance, or want a co-learner by your side — 
          our chatbot adapts to you.
        </p>
        <p>
          With real-time feedback, interactive course modules, and adaptive tutoring, 
          this isn’t just a platform — it’s your personal learning companion.
        </p>
      </div>

      </section>

      <section className='why-MRTL-section'>
        <Container className='py-5 text-center'>
          <h1 data-aos="zoom-in" data-aos-delay="400">Why Choose MRTL?</h1>
          <CardGroup className='mt-2 gap-5'>
            <Card className='landscape-card shadow' data-aos="flip-left">
              <Card.Body>
                <Card.Title>Personified Chatbot Options</Card.Title>
                <ListGroup variant="flush">
                  <ListGroup.Item className='list-format'><strong>Tutor</strong> - gives step-by-step explanations with a structured teaching style.</ListGroup.Item>
                  <ListGroup.Item className='list-format'><strong>Mentor</strong> - gives real-world applications to give better clarity on topics.</ListGroup.Item>
                  <ListGroup.Item className='list-format'><strong>Co-Learner</strong> - acts as a study partner to enhance your current learning environment.</ListGroup.Item>
                  <ListGroup.Item className='list-format'><strong>Custom Learning Style</strong> - gathers student learning preferances and tailors responses accordingly.</ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
            <Card className='landscape-card shadow' data-aos="flip-left" data-aos-delay="200">
              <Card.Body>
                <Card.Title>The Learning Environment</Card.Title>
                <ListGroup variant="flush">
                  <ListGroup.Item className='list-format'>Enroll into desired course(s).</ListGroup.Item>
                  <ListGroup.Item className='list-format'>Engage with course content such as lectures & assignments.</ListGroup.Item>
                  <ListGroup.Item className='list-format'>Receive additional help through the chatbot tailored to student's choices.</ListGroup.Item>
                  <ListGroup.Item className='list-format'>Receive personalized feedback:
                    <ul>
                      <li>Suggestions for concepts to re-study.</li>
                      <li>Extra resources for better comprehension.</li>
                    </ul>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </CardGroup>
        </Container>
      </section>

      <Container className='d-flex carousel-section' data-aos="fade-up" data-aos-delay="600">
        <HomeCarousel />
      </Container>

    </div>
  );
}

export default Home;
