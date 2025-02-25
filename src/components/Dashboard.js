import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function Dashboard() {
  const [courses, setCourses] = useState([]);
  const { user, setUser } = useUser(); 

  // TODO: Implement Analysis functionality using user data

  // Get only the users enrolled courses
  useEffect(() => {
    if (user) {
      fetch(`http://localhost:5000/enrolled-courses/${user.user_id}`)
        .then((response) => response.json())
        .then((data) => setCourses(data))
        .catch((error) => console.error('Error fetching enrolled courses:', error));
    }
  }, [user]);

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
                    <h1>Courses</h1>
                        <Container className='UserCourses'>
                            <Row>
                                {courses.map((course, index) => (
                                <Col md={4} key={index} className="mb-4">
                                    <Link to={`/courses/${course.course_code}`}>
                                    <Card className="course-card h-100">
                                        <Card.Img
                                        variant="top"
                                        src={`/assets/courses/${course.course_code}.jpg`}
                                        alt={`Image for ${course.course_title}`}
                                        />
                                        <Card.Body className='d-flex flex-column'>
                                            <Card.Title className="fs-6">{course.course_title}</Card.Title>
                                            {/*
                                            
                                            ------------------------------------
                                            This snippet will be used in the FUTURE to display course progress

                                            <div className="mt-auto">
                                                <ProgressBar
                                                    now={Math.random() * 100}
                                                    label={`${Math.floor(Math.random() * 100)}%`}
                                                />
                                            </div>
                                            
                                            */}
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
                <Row>
                    <Container className='Grades'>
                        <h1>Grades</h1>
                        <p>This feature will be implemented soon.</p>
                    </Container>
                </Row>

            </Container>
        </div>
    );
}

export default Dashboard;

