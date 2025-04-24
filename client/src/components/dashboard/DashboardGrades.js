/* --------------------------------- DashboardGrades.js --------------------------------- 
Component for viewing student grades in a compact, accordion-style layout.
Fetches both enrolled courses and assignment grades.
Ensures all courses display, even those with no grades yet.
Shows total points and percent score per course.
---------------------------------------------------------------------------------------- */

import React, { useState, useEffect } from 'react';
import { Container, Table, Spinner, Alert, Accordion } from 'react-bootstrap';


import './styles/DashboardGrades.css';

/* ------------------ Utility: Group grades by course and module ------------------
   Organizes flat list of grades into nested structure by course and then module.
   Also builds a lookup table for course titles.
----------------------------------------------------------------------------- */
function groupGradesByCourseAndModule(grades) {
  const grouped = {};
  const courseInfoMap = {};

  grades.forEach((g) => {
    const courseCode = g.course_code || 'UNKNOWN';
    const courseTitle = g.course_title || 'Untitled Course';
    const moduleKey = `${g.module_sequence || 0} - ${g.module_title || 'Unknown Module'}`;

		// Initialize nested objects if not already created
    if (!grouped[courseCode]) grouped[courseCode] = {};
    if (!grouped[courseCode][moduleKey]) grouped[courseCode][moduleKey] = [];

		// Push assignment into its respective module
    grouped[courseCode][moduleKey].push(g);
    courseInfoMap[courseCode] = courseTitle;
  });

  return { grouped, courseInfoMap };
}

/* -------------------------- DashboardGrades Component --------------------------
   - Fetches user grades and enrolled courses
   - Renders an accordion section for each course
   - Each course lists grades by module and computes totals
-------------------------------------------------------------------------------- */
function DashboardGrades({ userId, filterCourse, onAssignmentSelect }) {
  const [grades, setGrades] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

	/* ----------------------- Fetch grades + enrollments on load ----------------------- */
  useEffect(() => {
    setLoading(true);

    Promise.all([
      fetch(`${process.env.REACT_APP_API_URL}/api/grades/${userId}`).then(res => res.json()),
      fetch(`${process.env.REACT_APP_API_URL}/enrolled-courses/${userId}`).then(res => res.json())
    ])
      .then(([gradeData, courseData]) => {
				// Optional filtering for a specific course
				console.log("Fetched grades:", gradeData);
        const filtered = filterCourse
          ? gradeData.filter(g => g.course_code === filterCourse)
          : gradeData;

        setGrades(filtered);
        setEnrollments(courseData);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load grades or enrollments');
        setLoading(false);
      });
  }, [userId, filterCourse]);

	// Show loading spinner while fetching
  if (loading) return <div className="text-center"><Spinner animation="border" /><p>Loading grades...</p></div>;
  
	// Show alert if an error occurred
	if (error) return <Alert variant="danger">{error}</Alert>;

	// Organize grades by course/module and extract course titles
  const { grouped: rawGrouped, courseInfoMap } = groupGradesByCourseAndModule(grades);

  // Ensure all enrolled courses are shown even if no grades exist
  const grouped = {};
  const courseAverages = {};
  enrollments.forEach(course => {
    const code = course.course_code;
    grouped[code] = rawGrouped[code] || {};
    courseInfoMap[code] = course.course_title;
  });

	// Extract average percent score per course (used in headers)
	grades.forEach(g => {
		const avg = g.course_average;
		if (
			g.course_code &&
			typeof avg === 'number' &&
			!isNaN(avg) &&
			!courseAverages[g.course_code]
		) {
			courseAverages[g.course_code] = avg;
		}
	});

	// Determine score color based on grade percent
  const getGradeClass = (avg) => {
    if (avg >= 90) return 'score-green';
    if (avg >= 70) return 'score-yellow';
    return 'score-red';
  };

	/* -------------------------- Render Grades Accordion -------------------------- */
  return (
    <Container className="dashboard-grades mt-3">
      <Accordion alwaysOpen>
        {Object.entries(grouped).map(([courseCode, modules], index) => (
          <Accordion.Item eventKey={index.toString()} key={courseCode}>
						<Accordion.Header>
							<span>
								<strong>{courseCode}</strong> – {courseInfoMap[courseCode]}
								{/* Show course average next to title if available */}
								{Number.isFinite(courseAverages[courseCode]) && (
									<span className={`ms-2 ${getGradeClass(courseAverages[courseCode])}`}>
										({courseAverages[courseCode]}%)
									</span>
								)}
							</span>
						</Accordion.Header>



            <Accordion.Body className="p-2">
							{/* Show fallback if no grades exist for this course */}
              {Object.keys(modules).length === 0 ? (
                <div className="text-muted ps-2 pb-2">No grades available yet for this course.</div>
              ) : (() => {
								// Compute total and max score per course
                let totalScore = 0;
                let totalMax = 0;

                Object.values(modules).forEach(modGrades => {
                  modGrades.forEach(g => {
										if (g.score !== null && g.score !== undefined) {
											totalScore += parseFloat(g.score);
										}
										if (g.max_score !== null && g.max_score !== undefined) {
											totalMax += parseFloat(g.max_score);
										}
										
                  });
                });

                return (
                  <Table size="sm" bordered responsive hover>
                    <thead>
                      <tr>
                        <th>Assignment</th>
                        <th>Score</th>
                        <th>Max Score</th>
                      </tr>
                    </thead>
                    <tbody>
											{/* Render each module group */}
                      {Object.entries(modules).map(([modKey, modGrades]) => (
                        <React.Fragment key={modKey}>
                          <tr className="table-active small">
                            <td colSpan={3}><strong>Module {modKey}</strong></td>
                          </tr>

													{/* Render individual assignments inside the module */}
                          {modGrades.map((grade) => (
														<tr
															key={grade.assignment_id}
															onClick={() => onAssignmentSelect?.({
																assignment_id: grade.assignment_id,
																course_code: grade.course_code,
																assignment_title: grade.assignment_title,
															})}
															style={{ cursor: 'pointer' }}
														>
															<td>{grade.assignment_title}</td>

															<td className={`score-${grade.score >= 80 ? 'green' : grade.score >= 60 ? 'yellow' : 'red'}`}>
																{grade.score !== null && grade.score !== undefined
																	? parseFloat(grade.score).toFixed(2)
																	: <span className="text-muted">–</span>}
															</td>

															<td>
																{grade.max_score !== null && grade.max_score !== undefined
																	? parseFloat(grade.max_score).toFixed(2)
																	: <span className="text-muted">–</span>}
															</td>
														</tr>

                          ))}
                        </React.Fragment>
                      ))}

											{/* Render totals row for each course */}
                      <tr className="table-secondary fw-bold">
                        <td>Total</td>
                        <td>{totalScore.toFixed(2)}</td>
                        <td>{totalMax.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </Table>
                );
              })()}
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </Container>
  );
}

export default DashboardGrades;

