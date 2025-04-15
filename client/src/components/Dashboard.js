import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ProgressBar, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Grades from './Grades';
import "./styles/Dashboard.css"

function Dashboard() {
  const [courses, setCourses] = useState([]);
  const { user, setUser } = useUser();
  const [hasPreferences, setHasPreferences] = useState(false);

// TODO: Implement Analysis functionality using user data

    useEffect(() => {
    const fetchPreferences = async () => {
        try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/get-preferences?user_id=${user.user_id}`);
        const data = await res.json();
        if (res.ok && data.preferences) {
            setHasPreferences(true);
        }
        } catch (err) {
        console.error('Error checking preferences:', err);
        }
    };

    if (user?.user_id) {
        fetchPreferences();
    }
    }, [user]);


    useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    }, []);

  // Get only the users enrolled courses
  useEffect(() => {
    if (user) {
      fetch(`${process.env.REACT_APP_API_URL}/enrolled-courses/${user.user_id}`)
        .then((response) => response.json())
        .then((data) => setCourses(data))
        .catch((error) => console.error('Error fetching enrolled courses:', error));
    }
  }, [user]);

    return(
        <div className='Dashboard'>
            <Row>
                <Col md={3}>
                    <div className='profile-section'>
                        <div className='user-section'>
                            <div className="profile-avatar">
                                <img
                                variant="top"
                                src="../assets/newLogo.png"
                                className='profile-img'
                                />
                            </div>
                        </div>
                        <h2>{user.first_name} {user.last_name}</h2>
                        <Container className='learning-style-panel d-flex flex-column align-items-center'>
                            <Link
                                to="/learning-style-quiz"
                                className="learning-style-button mt-3"
                                style={{ maxWidth: '100%' }}
                            >
                                {hasPreferences ? "Custom Learning Style" : "Create Your Custom Learning Style"}
                            </Link>
                            <Form className="w-100 mt-2">
                                    {user && (
                                        <Form.Check
                                            type="switch"
                                            id="history-toggle"
                                            label="Enable Chat History & Semantic Search"
                                            checked={user.history_enabled}
                                            onChange={async () => {
                                            const updated = !user.history_enabled;
                                            const res = await fetch(`${process.env.REACT_APP_API_URL}/update-history-setting`, {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                user_id: user.user_id,
                                                history_enabled: updated,
                                                }),
                                            });

                                            if (res.ok) {
                                                setUser({ ...user, history_enabled: updated });
                                            }
                                            }}
                                        />
                                    )}
                                    <p className="text-muted small mt-2">
                                        Enabling history may slightly slow down the bot. Data is only used within this platform.
                                    </p>
                            </Form>
                        </Container>
                    </div>
            
                </Col>
                <Col>

                    <Container className='UserCourses'>
                    <h1>Courses</h1>
                        <Row>
                            {courses.map((course, index) => (
                            <Col md={3} key={index}>
                                <Link to={`/courses/${course.course_code}`}style={{ textDecoration: 'none', color: 'inherit' }}>
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

            <Row className='Analysis gx-4 gy-3 mt-2'>
                <Col md={5} className="analysis-panel">
                    <h1>Analysis</h1>
                    <p>Include radar charts, line graphs, performance summaries, etc.</p>
                </Col>
                <Col md={5} className='grades-section'>
                    <h1>Grades</h1>
                    <Grades userId={user?.user_id}/>
                </Col>
            </Row>

        </div>
    );
}


export default Dashboard;

