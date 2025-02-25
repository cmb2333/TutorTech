import React, { useState, useEffect } from 'react';
import { Button, Card, Spinner, Alert } from 'react-bootstrap';

const Assignment = ({ assignment, onBack }) => {
    const [questions, setQuestions] = useState([]); // store questions
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // track current question
    const [answers, setAnswers] = useState({}); // store user answers
    const [results, setResults] = useState([]); // store grading results
    const [totalScore, setTotalScore] = useState(0); // store total score
    const [loading, setLoading] = useState(false); // track loading state
    const [error, setError] = useState(""); // store error messages

    // fetch assignment questions from backend
    useEffect(() => {
        if (assignment) {
            fetchQuestions(assignment.assignment_id);
        }
    }, [assignment]);

    // fetch questions by assignment ID
    const fetchQuestions = async (assignmentId) => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`http://localhost:5000/api/assignments/${assignmentId}/questions`);
            if (!response.ok) throw new Error("failed to load questions");

            const data = await response.json();
            setQuestions(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // handle user answer input
    const handleAnswerChange = (questionId, value) => {
        setAnswers({ ...answers, [questionId]: value });
    };

    // navigate to previous question
    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    // navigate to next question
    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    // check if all questions are answered
    const allAnswered = questions.every((q) => answers[q.question_id]);

    // submit assignment and get results
    const handleSubmitAssignment = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/assignments/${assignment.assignment_id}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assignment_id: assignment.assignment_id,
                    answers: answers,
                }),
            });

            const result = await response.json();
            if (response.ok) {
                setTotalScore(result.total_score);
                setResults(result.results);
            } else {
                alert(result.error || "failed to submit assignment.");
            }
        } catch (error) {
            console.error("error submitting assignment:", error);
            alert("an error occurred while submitting.");
        }
    };

    // render question index buttons
    const renderQuestionIndex = () => (
        <div className="assignment-container question-index">
            {questions.map((_, index) => (
                <Button
                    key={index}
                    size="sm"
                    className={index === currentQuestionIndex ? "current-question-index" : "secondary-question-index"}
                    onClick={() => setCurrentQuestionIndex(index)}
                >
                    {index + 1}
                </Button>
            ))}
        </div>
    );

// render current question with consistent sizing
const renderQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex]; // get current question

    if (!currentQuestion) return null; // return nothing if no question available

    return (
        <div className="question-display">
            {/* question text */}
            <div className="question-text">
                <strong>Q{currentQuestionIndex + 1}: {currentQuestion.question_text}</strong>
            </div>

            {/* answer section */}
            <div className="answer-container">
                {/* multiple choice options */}
                {currentQuestion.question_type === 'multiple_choice' && currentQuestion.options && (
                    currentQuestion.options.choices.map((choice, index) => (
                        <label key={index} className="answer-option">
                            <input
                                type="radio"
                                name={`question-${currentQuestion.question_id}`}
                                value={choice}
                                checked={answers[currentQuestion.question_id] === choice}
                                onChange={(e) => handleAnswerChange(currentQuestion.question_id, e.target.value)}
                            />
                            {choice}
                        </label>
                    ))
                )}

                {/* text-based answer */}
                {currentQuestion.question_type === 'text' && (
                    <textarea
                        className="answer-textarea"
                        value={answers[currentQuestion.question_id] || ''}
                        onChange={(e) => handleAnswerChange(currentQuestion.question_id, e.target.value)}
                        placeholder="write your answer here..."
                    />
                )}

                {/* true/false questions (as radio buttons) */}
                {currentQuestion.question_type === 'true_false' && (
                    ['True', 'False'].map((option, index) => (
                        <label key={index} className="answer-option">
                            <input
                                type="radio"
                                name={`question-${currentQuestion.question_id}`}
                                value={option}
                                checked={answers[currentQuestion.question_id] === option}
                                onChange={(e) => handleAnswerChange(currentQuestion.question_id, e.target.value)}
                            />
                            {option}
                        </label>
                    ))
                )}
            </div>
        </div>
    );
};


// render assignment results with question details and points display
const renderResults = () => (
    <div className="results-section">
        <h4>Assignment Results</h4>

        {results.map((res, index) => {
            // find the corresponding question by question_id
            const question = questions.find(q => String(q.question_id) === String(res.question_id));

            return (
                <div key={res.question_id} className="result-item">
                    {/* Question Header with Points */}
                    <div className="result-header d-flex justify-content-between align-items-center">
                        <strong>Q{index + 1}: {question?.question_text || 'Question not found'}</strong>
                        <span className="points-earned">{res.points_awarded}/{res.max_points} points</span>
                    </div>

                    {/* Display Answer Options for Multiple Choice */}
                    {question?.question_type === 'multiple_choice' && question?.options?.choices && (
                        <ul className="answer-options">
                            {question.options.choices.map((choice, i) => (
                                <li key={i} style={{ color: choice === res.correct_answer ? 'green' : 'black' }}>
                                    {choice}
                                    {choice === res.correct_answer}
                                </li>
                            ))}
                        </ul>
                    )}

                    <hr />

                    {/* Display User's Answer with Conditional Styling */}
                    <p style={{ color: res.correct ? 'green' : 'red' }}>
                        <strong>Your Answer:</strong> {res.user_answer || 'No answer provided'}
                    </p>

                    {/* Highlight Correct Answer if Incorrect */}
                    {!res.correct && (
                        <p style={{ color: 'green' }}>
                            <strong>Correct Answer:</strong> {res.correct_answer}
                        </p>
                    )}
                </div>
            );
        })}

        {/* Total Score at the Bottom */}
        <h5>Total Score: {totalScore}/{results.reduce((acc, res) => acc + (res.max_points || 0), 0)}</h5>
    </div>
);




    return (
        <div className="assignment-container">
            <Card className="mt-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h4 className="m-0">{assignment.assignment_title}</h4>
                    <Button variant="outline-danger" onClick={onBack}>Back to assignments</Button>
                </Card.Header>

                <Card.Body>
                    {loading ? (
                        <Spinner animation="border" />
                    ) : error ? (
                        <Alert variant="danger">{error}</Alert>
                    ) : results.length > 0 ? (
                        renderResults()
                    ) : (
                        <>
                            {renderQuestionIndex()} {/* question navigation */}
                            {renderQuestion()} {/* current question display */}

                            {/* navigation buttons */}
                            <div className="assignment-navigation-buttons mt-3">
                                <Button
                                    className="prev-button"
                                    variant="secondary"
                                    onClick={handlePrevious}
                                    disabled={currentQuestionIndex === 0}
                                >
                                    Previous
                                </Button>

                                <Button
                                    className="next-button"
                                    variant="primary"
                                    onClick={handleNext}
                                    disabled={currentQuestionIndex === questions.length - 1}
                                >
                                    Next
                                </Button>
                            </div>

                            {/* submit button when all questions are answered */}
                            {allAnswered && (
                                <Button
                                    className="submit-assignment-button"
                                    variant="success"
                                    onClick={handleSubmitAssignment}
                                >
                                    Submit
                                </Button>
                            )}
                        </>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default Assignment;


