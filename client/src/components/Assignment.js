import React, { useState, useEffect } from 'react';
import { Button, Card, Spinner, Alert } from 'react-bootstrap';

const Assignment = ({ assignment, onBack, userId = 'guest', onAskChat }) => {
    // TODO: add 'module' or 'week' field to group assignments
    // TODO: use assignment.type in future to conditionally render different layouts

    const [questions, setQuestions] = useState([]); // store questions
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // track current question
    const [answers, setAnswers] = useState({}); // store user answers
    const [results, setResults] = useState([]); // store grading results
    const [totalScore, setTotalScore] = useState(0); // store total score
    const [loading, setLoading] = useState(false); // track loading state
    const [submitting, setSubmitting] = useState(false);
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
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/assignments/${assignmentId}/questions`);
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

    // ---------- Submit Assignment and Trigger Grading ----------
    const handleSubmitAssignment = async () => {
        setSubmitting(true); // show spinner

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/assignments/${assignment.assignment_id}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId || 'guest',
                    assignment_id: assignment.assignment_id,
                    course_code: assignment.course_code,
                    answers: answers,
                    score: totalScore,
                    max_score: results.reduce((acc, res) => acc + (res.max_points || 0), 0),
                }),                
            });

            const result = await response.json(); // parse grading result from backend
            if (response.ok) {
                setTotalScore(result.total_score); // update total score after grading
                setResults(result.results); // update individual question feedback
            } else {
                alert(result.error || "failed to submit assignment.");
            }
        } catch (error) {
            console.error("error submitting assignment:", error);
            alert("an error occurred while submitting.");
        } finally {
            setSubmitting(false); // hide spinner
        }
    };

    // ---------- Build AI Explanation Prompt for Chat ----------
    const handleAskChat = (question, res) => {
        const isText = question?.question_type === 'text';
        const isMultipleChoice = question?.question_type === 'multiple_choice';
      
        // Format choices for multiple choice
        const formattedChoices = isMultipleChoice && question?.options?.choices
          ? `Choices were: ${question.options.choices.join(', ')}`
          : '';
      
        // Format correct answer (string or array)
        const correctAnswer = Array.isArray(res.correct_answer)
          ? res.correct_answer.join(', ')
          : res.correct_answer;
      
        // Construct full AI prompt including question, user answer, correct answer, and score
        const prompt = `
      The student needs help understanding a question from their assignment.
      
      Question:
      ${question.question_text}
      
      Their Answer:
      ${res.user_answer || 'No answer provided'}
      
      ${isText
          ? `The correct answer is represented by the following key concepts:\n${correctAnswer}\n\nThese keywords are not a full answer — please evaluate the student's response in the context of the question, and explain why it was fully correct, partially correct, or incorrect.`
          : `${formattedChoices}\nCorrect Answer:\n${correctAnswer}`
      }
      
      Score Received:
      ${res.points_awarded}/${res.max_points}
      
      Please explain what they got right or wrong, and give a clear explanation to help them learn. Your response should speak directly to the student.
      `.trim();
      
        // Trigger the Chat component via callback to CoursePage
        if (typeof onAskChat === 'function') {
          onAskChat(prompt); // sets externalPrompt in <CoursePage />, passed down to <Chat />
        }
      };
      
      
      

    // -------------------- render: question index buttons --------------------
    const renderQuestionIndex = () => (
        <div className="assignment-container question-index">
            {questions.map((_, index) => {
                const isAccessible = isQuestionAccessible(index);

                return (
                    <Button
                        key={index}
                        size="sm"
                        variant={index === currentQuestionIndex ? "primary" : "outline-secondary"}
                        className={index === currentQuestionIndex ? "current-question-index" : "secondary-question-index"}
                        onClick={() => isAccessible && setCurrentQuestionIndex(index)}
                        disabled={!isAccessible} // disable if user is not allowed to click it
                    >
                        {index + 1}
                    </Button>
                );
            })}
        </div>
    );


// -------------------- helper: determine if question is unlocked --------------------
const isQuestionAccessible = (index) => {
    // a question is accessible if it's before or at the current question index
    // or it has already been answered
    return index <= currentQuestionIndex || answers[questions[index]?.question_id];
};


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
            const question = questions.find(q => String(q.question_id) === String(res.question_id));
            const isTextQuestion = question?.question_type === 'text';

            return (
                <div key={res.question_id} className="result-item">
                    {/* Question Header with Points */}
                    <div className="result-header d-flex justify-content-between align-items-center">
                        <strong>Q{index + 1}: {question?.question_text || 'Question not found'}</strong>
                        <span className="points-earned">{res.points_awarded}/{res.max_points} points</span>
                    </div>

                    {/* Multiple Choice Answer Display */}
                    {question?.question_type === 'multiple_choice' && question?.options?.choices && (
                        <ul className="answer-options">
                            {question.options.choices.map((choice, i) => (
                                <li
                                    key={i}
                                    style={{ color: choice === res.correct_answer ? 'green' : 'black' }}
                                >
                                    {choice}
                                </li>
                            ))}
                        </ul>
                    )}

                    <hr />

                    {/* Display User's Answer with Conditional Styling */}
                    <p style={{
                        color:
                            isTextQuestion && res.points_awarded > 0 && res.points_awarded < res.max_points ? 'orange' :
                            res.correct ? 'green' :
                            'red'
                    }}>

                        <strong>Your Answer:</strong> {res.user_answer || 'No answer provided'}
                    </p>

                    {/* Feedback for Text-Based (AI-Graded) Questions */}
                    {isTextQuestion && res.points_awarded > 0 && res.points_awarded < res.max_points && (
                        <p style={{ color: 'orange' }}>
                            <em>Partially correct — your answer matched some key concepts.</em>
                        </p>
                    )}

                    {/* Show Correct Answer if incorrect */}
                    {!res.correct && (
                        <p style={{ color: 'green' }}>
                            <strong>Correct Answer:</strong>{' '}
                            {Array.isArray(res.correct_answer)
                                ? res.correct_answer.join(', ')
                                : res.correct_answer}
                        </p>
                    )}

                    {/* Ask Chat for Explanation */}
                    <div className='explanation-button-container'>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            className="explanation-button"
                            onClick={() => handleAskChat(question, res)}
                        >
                            Explanation
                        </Button>
                    </div>
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
                    {loading && questions.length === 0 ? (
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
                                    disabled={currentQuestionIndex === questions.length - 1 ||
                                        !answers[questions[currentQuestionIndex]?.question_id] // disable button if question is unanswred 
                                    }
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
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                    <>
                                        <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        className="me-2"
                                        />
                                        Grading...
                                    </>
                                    ) : (
                                    "Submit"
                                    )}
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


