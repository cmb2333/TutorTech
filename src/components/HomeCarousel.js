import React from 'react';
import { Container, Carousel, Card } from 'react-bootstrap';


function HomeCarousel() {

  return (
    <section className="home-carousel">
    <Container>
      <Carousel variant='dark'>
        <Carousel.Item className='carousel-content'>
          <Card className="carousel-card">
            <Card.Img variant="top" src="/assets/exampleCourse.jpg" alt="Course Image" />
            <Card.Body>
                <Card.Title className="course-title">Course Title 1</Card.Title>
            </Card.Body>
            <Card.Body>
                <Card.Text>A brief description of the course.</Card.Text>
                <div>
                <strong>Progress</strong>
                </div>
            </Card.Body>
          </Card>
        </Carousel.Item>

        <Carousel.Item className='carousel-content'>
          <Card className="carousel-card">
            <Card.Img variant="top" src="/assets/exampleCourse.jpg" alt="Course Image" />
            <Card.Body>
                <Card.Title className="course-title">Course Title 1</Card.Title>
            </Card.Body>
            <Card.Body>
                <Card.Text>A brief description of the course.</Card.Text>
                <div>
                <strong>Progress</strong>
                </div>
            </Card.Body>
          </Card>
        </Carousel.Item>

        <Carousel.Item className='carousel-content'>
          <Card className="carousel-card">
            <Card.Img variant="top" src="/assets/exampleCourse.jpg" alt="Course Image" />
            <Card.Body>
                <Card.Title className="course-title">Course Title 1</Card.Title>
            </Card.Body>
            <Card.Body>
                <Card.Text>A brief description of the course.</Card.Text>
                <div>
                <strong>Progress</strong>
                </div>
            </Card.Body>
          </Card>
        </Carousel.Item>

      </Carousel>
    </Container>
  </section>
  );
}

export default HomeCarousel;