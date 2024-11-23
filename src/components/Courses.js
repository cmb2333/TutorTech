import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, ProgressBar } from 'react-bootstrap';

function Courses() {

  return (
    <Container className="courses-page">
      <h2>Courses</h2>
      <Row>
        <Col md={4}>
          <Card className="course-card">
            <Link to="/course-page">
              <Card.Img variant="top" src="/assets/exampleCourse.jpg" alt="Course Image" />
              <Card.Body>
                <Card.Title className="course-title">Course Title 1</Card.Title>
              </Card.Body>
            </Link>
            <Card.Body>
              <Card.Text>A brief description of the course.</Card.Text>
              <div>
                <strong>Progress</strong>
                <ProgressBar now={60} label="60%" />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="course-card">
            <Link to="/course-page">
              <Card.Img variant="top" src="/assets/exampleCourse.jpg" alt="Course Image" />
              <Card.Body>
                <Card.Title className="course-title">Course Title 2</Card.Title>
              </Card.Body>
            </Link>
            <Card.Body>
              <Card.Text>A brief description of the course.</Card.Text>
              <div>
                <strong>Progress</strong>
                <ProgressBar now={30} label="30%" />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="course-card">
            <Link to="/course-page">
              <Card.Img variant="top" src="/assets/exampleCourse.jpg" alt="Course Image" />
              <Card.Body>
                <Card.Title className="course-title">Course Title 3</Card.Title>
              </Card.Body>
            </Link>
            <Card.Body>
              <Card.Text>A brief description of the course.</Card.Text>
              <div>
                <strong>Progress</strong>
                <ProgressBar now={90} label="90%" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Courses;