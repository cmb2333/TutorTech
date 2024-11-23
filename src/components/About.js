import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';


function About() {
  return (
    <section className='about-page'>
      <section className='about-section'>
        <Row>
          <h2>About Us</h2>
          <Col md={12} lg={6}>
            <Card className='custom-card'>
              <Card.Body>
                <Card.Title>Welcome to TutorTech</Card.Title>
                <Card.Text>
                  At TutorTech, we believe that every student deserves a learning
                  experience tailored just for them. Our platform offers a range of
                  courses, interactive tools, and personalized learning paths to help
                  students thrive academically and professionally in the field of
                  metrology.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={12} lg={6}>
            <Card className='custom-card'>
              <Card.Body>
                <Card.Title>Our Mission</Card.Title>
                <Card.Text>
                  Our mission is to provide an accessible and engaging learning
                  environment that empowers students to excel. Through
                  flexible courses, collaborative features, and real-time feedback, we
                  aim to foster a deep understanding of measurement science and
                  support the next generation of researchers and professionals.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>

      <section className='features-section'>
      <h2>Features & Benefits</h2>
      <Row>
        <Col md={12} lg={4}>
          <Card className="custom-card">
            <Card.Body>
              <Card.Title>Personalized Learning Paths</Card.Title>
              <Card.Text>
                Tailored course recommendations based on your goals and learning style. 
                Experience a personalized learning journey that adapts to your progress.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={12} lg={4}>
          <Card className="custom-card">
            <Card.Body>
              <Card.Title>Interactive Tools</Card.Title>
              <Card.Text>
                Utilize a wide range of interactive tools, including lectures, assignments, quizzes,
                course calendar, gradebook, and progress tracking, all working together to
                ensure you stay engaged and retain knowledge effectively.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={12} lg={4}>
          <Card className="custom-card">
            <Card.Body>
              <Card.Title>Personalized AI Assistant</Card.Title>
              <Card.Text>
                Our platform features an intelligent AI assistant designed to enhance your learning experience
                by offering personalized feedback and recommendations. The AI analyzes your progress, grades,
                and past assignments to provide tailored suggestions that will help you improve academically.              
                The AI can adapt to different personas based on your needs:
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      </section>

    </section>
  );
}

export default About;
