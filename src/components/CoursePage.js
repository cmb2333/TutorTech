import React, { useState, useEffect} from 'react';
import { useParams } from 'react-router-dom'; // hook to access URL parameters (e.g., courseId)
import Chat from './Chat'; // import the Chat component
import { Nav, Button } from "react-bootstrap"; // import Bootstrap components
import Assignment from "./Assignment"; // import Assignment component
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useUser } from '../context/UserContext'; // get the logged-in user
import Grades from './Grades'; // import user's grades




// ---------- Functional React Component ----------
// Receives: None directly, but uses courseId from the URL
function CoursePage() {

  useEffect(() => {
  AOS.init({ duration: 1000, once: true });
  }, []);

  // Extract courseId from the URL using useParams()
  const { courseId } = useParams();
          
  // define user first
  const { user } = useUser();

  // gets user id or guest default
  const userId = user?.user_id || 'guest';           

  // ---------- State Variables ----------
  const [course, setCourse] = useState(null); // store course details fetched from the backend
  const [botType, setBotType] = useState('Tutor'); // store selected bot type (default: Tutor)
  const [selectedSection, setSelectedSection] = useState('lectures'); // track the active section (default: Lectures)
  const [selectedAssignment, setSelectedAssignment] = useState(null); // store the selected assignment for viewing

  // ---------- Event Handlers ----------
  // Handle when an assignment is clicked
  const handleAssignmentClick = (assignment) => {
    setSelectedAssignment(assignment); // store the selected assignment
  };

  // Handle when user goes back to assignment list
  const handleBackToAssignments = () => {
    setSelectedAssignment(null); // clear selected assignment
  };

  // ---------- Fetch Course Information ----------
  // Fetch course details when the component mounts or when courseId changes
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`http://localhost:5000/courses/${courseId}`);
        const data = await response.json();

        if (response.ok) {
          setCourse(data); // store course details if fetch is successful
        } else {
          console.error('Course not found:', data.message);
        }
      } catch (error) {
        console.error('Error fetching course:', error); // handle errors during fetch
      }
    };

    fetchCourse(); // execute the fetch function
  }, [courseId]); // dependency array ensures fetch runs when courseId changes

  // ---------- Render Component ----------
  return (
    <div className="course-page d-flex">
      
      {/* ---------- Sidebar Navigation ---------- */}
      <div className="sidebar d-flex flex-column p-3 bg-light" data-aos="slide-right" data-aos-delay="200">
        <h4 className="mb-3">Course Menu</h4>
        <Nav className="flex-column">
          {/* Navigation Links for each section */}
          <Nav.Link onClick={() => setSelectedSection('lectures')} className="sidebar-link">
            📖 Lectures
          </Nav.Link>
          <Nav.Link onClick={() => setSelectedSection('assignments')} className="sidebar-link">
            📝 Assignments
          </Nav.Link>
          <Nav.Link onClick={() => setSelectedSection('grades')} className="sidebar-link">
            📊 Grades
          </Nav.Link>
        </Nav>
      </div>
      
      {/* ---------- Main Course Content ---------- */}
      <div className="course-info flex-grow-1 p-4" data-aos="slide-down" data-aos-delay="200">
        {/* Check if course data is available */}
        {course ? (
          <>
            {/* Display Course Title with Section Heading */}
            <h2>
                {course.course_title}
                {selectedSection && ` - ${selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)}`}
            </h2>

            {/* ---------- Conditional Rendering for Sections ---------- */}
            {/* ----- Lectures Section ----- */}
            {selectedSection === 'lectures' && (
              <>
                <div className='lecture-section'></div>
                <div>
                  {/* Map through course lectures and display each one */}
                  {course.lectures.map((lecture) => {
                    let embedUrl = lecture.video_link; // store video link

                    // convert YouTube video link to embeddable format
                    if (embedUrl.includes("youtube.com/watch?v=")) {
                      embedUrl = embedUrl.replace("watch?v=", "embed/");
                    } else if (embedUrl.includes("youtu.be/")) {
                      embedUrl = embedUrl.replace("youtu.be/", "www.youtube.com/embed/");
                    }

                    // render each lecture with an embedded video player
                    return (
                      <div key={lecture.lecture_id} className="lecture-item" style={{ marginBottom: '20px' }}>
                        <strong>{lecture.lecture_title}</strong>
                        <div className="lecture-video-container">
                          <iframe
                            className="responsive-iframe"
                            src={embedUrl}
                            title={lecture.lecture_title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}


            {/* ----- Assignments Section ----- */}
            {selectedSection === 'assignments' && (
              <>
                {/* Display assignment list or selected assignment */}
                {!selectedAssignment ? (
                  <div className="assignment-list">
                    {/* Map through assignments and display each as a button */}
                    {course.assignments.map((assignment) => (
                      // TODO: add support for assignment modules (Week 1, Week 2)
                      <div key={assignment.assignment_id} className="assignment-item">
                        <Button
                          className="custom-assignment-button"
                          onClick={() => handleAssignmentClick(assignment)}
                        >
                          {assignment.assignment_title}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Display Assignment component when an assignment is selected
                  <Assignment
                    assignment={{...selectedAssignment, course_code: course.course_code}}
                    onBack={handleBackToAssignments}
                    userId={userId}
                  />
                )}
              </>
            )}

            {/* ----- Grades Section ----- */}
            {selectedSection === 'grades' && (
              <>
                <Grades userId={user.user_id} filterCourse={course.course_code} />
              </>
            )}
          </>
        ) : (
          // Show loading message while course data is being fetched
          <p>Loading course information...</p>
        )}
      </div>

      {/* ---------- Bot Section ---------- */}
      <div className="bot-section" data-aos="slide-left" data-aos-delay="200">
        <label className="bot-label">
          <span>Select AI Bot Type:</span>
          {/* Dropdown to select the bot type */}
          <select value={botType} onChange={(e) => setBotType(e.target.value)} className="bot-type-selector">
            <option value="Tutor">Tutor</option>
            <option value="Mentor">Mentor</option>
            <option value="Co-Learner">Co-Learner</option>
          </select>
        </label>

        {/* Chat component with botType and courseId as props */}
        <Chat botType={botType} courseId={courseId} userId={user?.user_id} />
      </div>
    </div>
  );
}

// Export the component for use in other parts of the app
export default CoursePage;
