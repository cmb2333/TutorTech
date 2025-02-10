import React, { useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import Chat from './Chat';
import { Nav } from "react-bootstrap";

function CoursePage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  // Default bot
  const [botType, setBotType] = useState('Tutor');
  const [selectedSection, setSelectedSection] = useState('lectures'); // Default section


  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`http://localhost:5000/courses/${courseId}`);
        const data = await response.json();
        if (response.ok) {
          setCourse(data);
        } else {
          console.error('Course not found:', data.message);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      }
    };
    fetchCourse();
  }, [courseId]);

  return (
    <div className="course-page d-flex">
      {/* Sidebar */}
      <div className="sidebar d-flex flex-column p-3 bg-light">
        <h4 className="mb-3">Course Menu</h4>
        <Nav className="flex-column">
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
      
      {/* Main Content */}
      <div className="course-info flex-grow-1 p-4">
        {course ? (
          <>
            <h2>{course.course_title}</h2>
            <p>Credits: {course.credits}</p>

            {/* Conditional Rendering */}
            {selectedSection === 'lectures' && (
              <>
                <h3>Lectures</h3>
                <ul>
                  {course.lectures.map((lecture) => {
                    let embedUrl = lecture.video_link;

                    // Check if it's a YouTube video and convert it to an embeddable link
                    if (embedUrl.includes("youtube.com/watch?v=")) {
                      embedUrl = embedUrl.replace("watch?v=", "embed/");
                    } else if (embedUrl.includes("youtu.be/")) {
                      embedUrl = embedUrl.replace("youtu.be/", "www.youtube.com/embed/");
                    }

                    return (
                      <li key={lecture.lecture_id}>
                        <strong>{lecture.lecture_title}</strong>
                        <div>
                          <iframe
                            width="560"
                            height="315"
                            src={embedUrl}
                            title={lecture.lecture_title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}



            {selectedSection === 'assignments' && (
              <>
                <h3>Assignments</h3>
                <ul>
                  {course.assignments.map((assignment) => (
                    <li key={assignment.assignment_id}>
                      <strong>{assignment.assignment_title}</strong> - Max Score: {assignment.max_score}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {selectedSection === 'grades' && (
              <>
                <h3>Grades</h3>
                <p>Grades feature coming soon!</p>
              </>
            )}
          </>
        ) : (
          <p>Loading course information...</p>
        )}
      </div>

      {/* Bot Section */}
      <div className="bot-section">
        <label className="bot-label">
          <span>Select AI Bot Type:</span>
          <select value={botType} onChange={(e) => setBotType(e.target.value)} className="bot-type-selector">
            <option value="Tutor">Tutor</option>
            <option value="Mentor">Mentor</option>
            <option value="Co-Learner">Co-Learner</option>
          </select>
        </label>
        <Chat botType={botType} courseId={courseId} />
      </div>
    </div>
  );
}

export default CoursePage;