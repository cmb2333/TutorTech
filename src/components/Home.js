import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Container, Card, CardBody } from 'react-bootstrap';
import HomeCarousel from './HomeCarousel';
import ListGroup from 'react-bootstrap/ListGroup';
import CardGroup from 'react-bootstrap/CardGroup';



function Home() {
  // Get user data from context
  const { user } = useUser(); 

  return (
    <body>
      <section className="banner">
        <Container className='banner-text'>
          <h1 class="display-4 banner-text">
            Personalize your Learning Experience
            <br></br>
            with Artifical Intelligence</h1>
        </Container>
      </section>

      <section className='current-landscape-section'>
        <Container className='py-5 text-center '>
          <h1>The Current Landscape of Student Learning</h1>
          <CardGroup className='mt-2 gap-5'>
            <Card className='landscape-card shadow'>
              <Card.Body>
                <Card.Title>Limitations of LMS systems</Card.Title>
                <ListGroup variant="flush">
                  <ListGroup.Item className='limitations'>Lack of real-time support</ListGroup.Item>
                  <ListGroup.Item className='limitations'>Limited Personalization</ListGroup.Item>
                  <ListGroup.Item className='limitations'>Minimal Engagement</ListGroup.Item>
                  <ListGroup.Item className='limitations'>Inconsistent Progress Checking</ListGroup.Item>
              </ListGroup>
              </Card.Body>
            </Card>
            <Card className='landscape-card shadow'>
              <Card.Body>
              <Card.Title>Learning frustration and degradement of motivation</Card.Title>
                <p>
                  Students start to develop a result based mindset, in which they prioritize
                  getting assignments completed or passing the course, instead of actually 
                  understanding the material and learning foundational concepts. 
                  <br></br><br></br>
                  In today's learning environment, this mindset causes the student to resort to Generative AI and 
                  LLMs(Large Language Models). In our eyes, the real problem lies within the employment and
                  utilization of this evolutionary technology.
                  <br></br><br></br>
                  The MRTL has teamed up with NAU students from the 
                  Computer Science and Software Engineering Capstone Experience to create the blueprint for
                  a potential solution. 
                </p>
              </Card.Body>
            </Card>
          </CardGroup>
        </Container>
      </section>

      <Container className='d-flex carousel-section'>
        <HomeCarousel />
      </Container>



    </body>
  );
}

export default Home;

