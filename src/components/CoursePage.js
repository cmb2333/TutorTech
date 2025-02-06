import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Chat from './Chat';

function CoursePage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  // Default bot
  const [botType, setBotType] = useState('Tutor');

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
    <div className="course-page">
      <div className="course-info">
        {course ? (
          <>
            <h2>{course.course_title}</h2>
            <p>Credits: {course.credits}</p>
            <h3>Lectures</h3>
            <ul>
              {course.lectures.map((lecture) => (
                <li key={lecture.lecture_id}>
                  <strong>{lecture.lecture_title}</strong> - <a href={lecture.video_link}>Watch</a>
                </li>
              ))}
            </ul>
            <h3>Assignments</h3>
            <ul>
              {course.assignments.map((assignment) => (
                <li key={assignment.assignment_id}>
                  <strong>{assignment.assignment_title}</strong> - Max Score: {assignment.max_score}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>Loading course information...</p>
        )}
      </div>
      
      <label>
        Select AI Bot Type:
        <select value={botType} onChange={(e) => setBotType(e.target.value)} className="bot-type-selector">
          <option value="Tutor">Tutor</option>
          <option value="Mentor">Mentor</option>
          <option value="Co-Learner">Co-Learner</option>
        </select>
      </label>

      <Chat botType={botType} courseId={courseId} />
    </div>
  );
}

export default CoursePage;