import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import AOS from 'aos';
import 'aos/dist/aos.css';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/courses`)
      .then((response) => response.json())
      .then((data) => setCourses(data))
      .catch((error) => console.error('Error fetching courses:', error));
    
    if (user) {
      fetch(`${process.env.REACT_APP_API_URL}/enrolled-courses/${user.user_id}`)
        .then((response) => response.json())
        .then((data) => setEnrolledCourses(data.map(course => course.course_code)))
        .catch((error) => console.error('Error fetching enrolled courses:', error));
    }
  }, [user]);

  // Redirect to login if not logged in
  const handleEnroll = (course_code) => {
    if (!user) {
      navigate('/login');
    } else {
      fetch(`${process.env.REACT_APP_API_URL}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id, course_code }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.message === "Enrolled successfully") {
          setEnrolledCourses(prev => [...prev, course_code]);
        }
      })
      .catch(error => console.error('Error enrolling in course:', error));
    }
  };

  return (
    <Container className="courses-page">
      <h2 data-aos="fade-up" data-aos-delay="100">AVAILABLE COURSES</h2>
      <Row>
        {courses.map((course, index) => (
          <Col md={4} key={index}>
            <Card className="course-card" data-aos="flip-up" data-aos-delay="200">
            <Card.Img 
              variant="top" 
              src={`/assets/courses/${course.course_code}.jpg`} 
              alt={`Image for ${course.course_title}`} 
              onError={(e) => e.target.src = "/assets/courses/exampleCourse.jpg"}
            />
              <Card.Body>
                <Card.Title>{course.course_code} - {course.course_title}</Card.Title>
                <Card.Text>{course.course_description}</Card.Text>
                <strong>Credits:</strong> {course.credits}
                {enrolledCourses.includes(course.course_code) ? (
                  <Button variant="success" disabled>Enrolled</Button>
                ) : (
                  <Button variant="primary" onClick={() => handleEnroll(course.course_code)}>Enroll</Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Courses;
