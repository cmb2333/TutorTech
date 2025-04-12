/* --------------------------------- Grades.js ---------------------------------
Component responsible for 
  - fetching and displaying a student's grades
  - filtering by course (if provided)
  - enabling selection of specific assignments for detailed review
------------------------------------------------------------------------------- */

import React, { useState, useEffect } from 'react';
import { Container, Table, Spinner, Alert } from 'react-bootstrap';

function groupGradesByModule(grades) {
    const grouped = {};
  
    grades.forEach((g) => {
      const key = `${g.module_sequence || 0} - ${g.module_title || 'Unknown Module'}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(g);
    });
  
    return Object.fromEntries(
      Object.entries(grouped).sort((a, b) => {
        const aSeq = parseInt(a[0].split(' - ')[0]);
        const bSeq = parseInt(b[0].split(' - ')[0]);
        return aSeq - bSeq;
      })
    );
  }

/* -------------------------- Main Grades Component -------------------------- */
function Grades({ userId, filterCourse, onAssignmentSelect }) {

    /* ----- state: store fetched grade data, loading status, and errors ----- */
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /* -------------------- Fetch grades on mount or userId change -------------------- */
    useEffect(() => {
        setLoading(true);
        fetch(`${process.env.REACT_APP_API_URL}/api/grades/${userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then(data => {

                // only show grades for the current course if specified
                if (filterCourse) {
                    const filtered = data.filter(g => g.course_code === filterCourse);
                    setGrades(filtered);
                  } else {
                    setGrades(data); // full grade list
                  }
                  
                setLoading(false);
            })
            // error handling
            .catch(error => {
                console.error("Failed to fetch grades:", error);
                setError("Failed to fetch grades");
                setLoading(false);
            });
    }, [userId, filterCourse]); // refetch when user or course changes

    /* -------------------- CASE: Loading Grades -------------------- */
    if (loading) {
        return <div className="text-center">
            <Spinner animation="border" variant="primary" />
            <p>Loading grades...</p>
        </div>;
    }

    /* -------------------- CASE: Error Fetching Grades -------------------- */
    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    /* -------------------- CASE: No Grades Found -------------------- */
    if (grades.length === 0 && !loading) {
        return <p>No grades available yet.</p>;
    }

    /* -------------------- Render: Grades Table -------------------- */
    return (
        // TODO: group grades by assignment type (quiz, project, homework)
        <Container className='Grades' data-aos="slide-up" data-aos-delay="100">
            <h2>Grades</h2>

            {/* table of assignment scores */}
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Assignment</th>
                        <th>Score</th>
                        <th>Max Score</th>
                    </tr>
                </thead>
                <tbody>
                {/* loop through each grade and render row */}
                {Object.entries(groupGradesByModule(grades)).map(([moduleLabel, moduleGrades]) => (
                    <React.Fragment key={moduleLabel}>
                        {/* Module header row */}
                        <tr className="table-light">
                        <td colSpan={3}>
                            <strong>{moduleLabel}</strong>
                        </td>
                        </tr>

                        {/* Assignment rows */}
                        {moduleGrades.map((grade) => (
                        <tr
                            key={grade.assignment_id}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                            if (onAssignmentSelect) {
                                onAssignmentSelect({
                                assignment_id: grade.assignment_id,
                                course_code: grade.course_code,
                                assignment_title: grade.assignment_title
                                });
                            }
                            }}
                        >
                            <td>{grade.assignment_title}</td>
                            <td style={{ color: grade.score >= 80 ? 'green' : 'red' }}>
                            {parseFloat(grade.score).toFixed(2)}
                            </td>
                            <td>{parseFloat(grade.max_score).toFixed(2)}</td>
                        </tr>
                        ))}
                    </React.Fragment>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
}

export default Grades;
