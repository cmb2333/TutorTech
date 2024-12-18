import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, ProgressBar } from 'react-bootstrap';

function Courses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Fetch course data from the backend
    fetch('http://localhost:5000/courses')
      .then((response) => response.json())
      .then((data) => setCourses(data))
      .catch((error) => console.error('Error fetching courses:', error));
  }, []);

  return (
    <Container className="courses-page">
      <h2>Courses</h2>
      <Row>
        {courses.map((course, index) => (
          <Col md={4} key={index}>
            <Card className="course-card">
              <Link to={`/courses/${course.course_code}`}>
                <Card.Img
                  variant="top"
                  src="/assets/exampleCourse.jpg"
                  alt={`Image for ${course.course_title}`}
                />
                <Card.Body>
                  <Card.Title className="course-card-title">{course.course_title}</Card.Title>
                </Card.Body>
              </Link>
              <Card.Body>
                <Card.Text>{course.course_description}</Card.Text>
                <div>
                  <strong>Credits:</strong> {course.credits}
                  <ProgressBar now={Math.random() * 100} label={`${Math.floor(Math.random() * 100)}%`} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Courses;
