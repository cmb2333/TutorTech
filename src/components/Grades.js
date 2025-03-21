import React, { useState, useEffect } from 'react';
import { Container, Table, Spinner, Alert } from 'react-bootstrap';

function Grades({ userId, filterCourse }) {
    const [grades, setGrades] = useState([]); // store grades
    const [loading, setLoading] = useState(true); // track loading state
    const [error, setError] = useState(null); // store error messages

    // fetch grades from API
    useEffect(() => {
        setLoading(true);
        fetch(`http://localhost:5000/api/grades/${userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then(data => {
                // to only display the grades of the specific course your on
                if (filterCourse) {
                    const filtered = data.filter(g => g.course_code === filterCourse);
                    setGrades(filtered);
                  } else {
                    setGrades(data);
                  }
                  
                setLoading(false);
            })
            // error handling
            .catch(error => {
                console.error("Failed to fetch grades:", error);
                setError("Failed to fetch grades");
                setLoading(false);
            });
    }, [userId, filterCourse]); // get user id and specific course

    // display loading gradws
    if (loading) {
        return <div className="text-center">
            <Spinner animation="border" variant="primary" />
            <p>Loading grades...</p>
        </div>;
    }

    // error message
    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    // display message if no grades are available
    if (grades.length === 0 && !loading) {
        return <p>No grades available yet.</p>;
    }

    // grades table
    return (
        // TODO: group grades by assignment type (quiz, project, homework)
        <Container className='Grades' data-aos="slide-up" data-aos-delay="100">
            <h2>Grades</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Assignment</th>
                        <th>Score</th>
                        <th>Max Score</th>
                    </tr>
                </thead>
                <tbody>
                    {grades.map((grade, index) => (
                        <tr key={index}>
                            <td>{grade.assignment_title}</td>
                            {/* highlight grade based on score */}
                            <td style={{ color: grade.graded_score >= 80 ? 'green' : 'red' }}>
                            {parseFloat(grade.score).toFixed(2)}
                            </td>
                            <td>{parseFloat(grade.max_score).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
}

export default Grades;
