import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function Dashboard() {
  const [courses, setCourses] = useState([]);
  const { user, setUser } = useUser(); 

  // TODO: Implement functionality for getting only the user's enrolled courses
  // TODO: Implement Analysis functionality using user data

  useEffect(() => {
    // Fetch course data from the backend
    fetch('http://localhost:5000/courses')
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched courses:', data); // Log fetched courses
        setCourses(data);
      })
      .catch((error) => console.error('Error fetching courses:', error));
    }, []);

    return(
        <div>

            <Container className='Dashboard'>
                <Row>
                    <Col md={4} className='Profile'>
                        <h1>Welcome</h1>
                        <Card className="profile-card shadow">
                            <Card.Body className='d-flex flex-column'>
                                <Card.Title>{user.first_name} {user.last_name}</Card.Title>
                            </Card.Body>
                            <Card.Img
                            variant="top"
                            src="/assets/louie-icon.png"
                            className='profile-img'
                            />
                        </Card>
                    </Col>
                    <Col>
                        <Container className='UserCourses'>
                            <h1>Courses</h1>
                            <Row>
                                {courses.map((course, index) => (
                                <Col md={4} key={index}>
                                    <Link to={`/courses/${course.course_code}`}>
                                    <Card className="course-card h-100">
                                        <Card.Img
                                        variant="top"
                                        src="/assets/exampleCourse.jpg"
                                        alt={`Image for ${course.course_title}`}
                                        />
                                        <Card.Body className='d-flex flex-column'>
                                            <Card.Title className="fs-6">{course.course_title}</Card.Title>
                                            <div className="mt-auto">
                                                <ProgressBar
                                                    now={Math.random() * 100}
                                                    label={`${Math.floor(Math.random() * 100)}%`}
                                                />
                                            </div>
                                        </Card.Body>
                                    </Card>
                                    </Link>
                                </Col>
                                ))}
                            </Row>
                        </Container>
                    </Col>
                </Row>

                <Row>
                    <Container className='Analysis'>
                        <h1>Analysis</h1>
                        <p>Course Activity - Create dynamic radar chart showing time spent on courses</p>
                    </Container>
                </Row>
            </Container>
        </div>
    );
}

export default Dashboard;

