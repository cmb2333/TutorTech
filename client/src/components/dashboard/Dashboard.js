
/* --------------------------------- Dashboard.js ---------------------------------
Component: Dashboard

Overview:
  Main dashboard view rendered after a user logs in. 
  Provides an overview of the student's profile, enrolled courses, grades, 
  and assignment completion progress.

Core Features:
  - Displays user information with profile avatar and name
  - Links to customize learning style preferences
  - Toggle for enabling/disabling chat history and semantic memory
  - Horizontal carousel of enrolled courses with progress bars
  - Accordion-based grade viewer by course and module
  - Pie chart visualization of assignment completion status

Data Sources:
  - /enrolled-courses/:user_id          → User's course enrollment
  - /api/grades/:user_id                → User's assignment grades
  - /api/course-progress/:user_id       → Completion % per course
  - /api/completion-counts/:user_id     → Assignment completion summary
  - /get-preferences                    → Learning style preference check
  - /update-history-setting             → Update semantic memory toggle

Dependencies:
  - React Bootstrap for layout and UI elements
  - AOS for scroll animations
  - Custom components: DashboardGrades, CoursesCarousel, AnalysisPieChart
---------------------------------------------------------------------------------- */

/* ------------------------------ React + Libraries ------------------------------ */
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

/* ------------------------------ Animations + Styles ------------------------------ */
import AOS from 'aos';
import 'aos/dist/aos.css';
import './styles/Dashboard.css';

/* ------------------------------ Custom Components ------------------------------ */
import DashboardGrades from './DashboardGrades';
import CoursesCarousel from './CoursesCarousel';
import AnalysisPieChart from './AnalysisPieChart';



/* ------------------------------ Dashboard Component ------------------------------
   Main dashboard view rendered after login.
   - Displays user info, courses, grades, and assignment analysis
   - Fetches user settings, preferences, course data, and AI completion stats
----------------------------------------------------------------------------------- */
function Dashboard() {

  /* ------------------------------ State Setup ------------------------------ */
  const [courses, setCourses] = useState([]);
  const [courseProgress, setCourseProgress] = useState({});
  const { user, setUser } = useUser();
  const [hasPreferences, setHasPreferences] = useState(false);
  const [completionCounts, setCompletionCounts] = useState({ completed: 0, total: 0 });


/* ------------------------------ Effect: Get Learning Preferences ------------------------------
     - Checks if the user has a saved custom learning style
     - Sets `hasPreferences` for toggling link display text
  ----------------------------------------------------------------------------------------------- */
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


  /* ------------------------------ Effect: Initialize AOS ------------------------------
     - Runs once to activate AOS animations on scroll
  -------------------------------------------------------------------------------------- */
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);


  /* ------------------------------ Effect: Fetch Enrolled Courses ------------------------------
     - Retrieves all courses the user is enrolled in
     - Populates `courses` state used in the carousel
  --------------------------------------------------------------------------------------------- */
  useEffect(() => {
    if (user) {
      fetch(`${process.env.REACT_APP_API_URL}/enrolled-courses/${user.user_id}`)
        .then((response) => response.json())
        .then((data) => setCourses(data))
        .catch((error) => console.error('Error fetching enrolled courses:', error));
    }
  }, [user]);


  /* ------------------------------ Effect: Fetch Course Progress ------------------------------
     - Gets assignment completion % per course for progress bars
     - Converts array into a dictionary { course_code: percent }
  ---------------------------------------------------------------------------------------------- */
  useEffect(() => {
    if (user) {
      fetch(`${process.env.REACT_APP_API_URL}/api/course-progress/${user.user_id}`)
        .then((res) => res.json())
        .then((data) => {
          // Convert array of { course_code, progress } to a dictionary
          const progressMap = {};
          data.forEach((item) => {
            progressMap[item.course_code] = parseFloat(item.progress);
          });
          setCourseProgress(progressMap);
        })
        .catch((err) => console.error("Error fetching course progress:", err));
    }
  }, [user]);
  

  /* --------------------------- Effect: Fetch Assignment Completion Summary ---------------------------
     - Gets total # of assignments and how many are completed
     - Used to populate the pie chart in the Analysis section
  ------------------------------------------------------------------------------------------------------ */
  useEffect(() => {
    if (user?.user_id) {
      fetch(`${process.env.REACT_APP_API_URL}/api/completion-counts/${user.user_id}`)
        .then(res => res.json())
        .then(data => setCompletionCounts(data))
        .catch(err => console.error("Error fetching assignment completion counts:", err));
    }

  }, [user]);
  
  /* ------------------------------ Render Dashboard Layout ------------------------------ */
  return(
    <div className='Dashboard'>

      
      <Row>
        {/* ------------------ Profile Section (Left Column) ------------------ */}
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

              {/* Toggle for enabling chat history and semantic memory */}
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
                <p className="small mt-2">
                  Enabling history may slightly slow down the bot. Data is only used within this platform.
                </p>
              </Form>
            </Container>
          </div>
        </Col>

        {/* ------------------ Courses Carousel (Right Column) ------------------ */}
        <Col md={9}>
          <Container className='UserCourses'>
            <h1>Courses</h1>
            <CoursesCarousel courses={courses} progressByCourse={courseProgress} />
          </Container>
        </Col>
      </Row>


      {/* ------------------ Grades and Analysis Section ------------------ */}
      <Row className='Analysis gx-4 gy-3 mt-2 align-items-start'>
        <Col md={5} className='grades-section'>
          <h1>Grades</h1>
          <DashboardGrades userId={user?.user_id} />
        </Col>
        <Col md={5} className="analysis-panel">
          <h1>Analysis</h1>
          <div className='d-flex' style={{ width: '100%', height: '100%'}}>
            <AnalysisPieChart
              completedCount={completionCounts.completed}
              totalCount={completionCounts.total}
            />
          </div>
        </Col>

      </Row>
    </div>
  );
}

export default Dashboard;


