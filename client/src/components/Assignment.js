/* ------------------------ Assignment.js ------------------------
Component responsible for 
  - rendering assignment questions
  - collecting user responses
  - submitting answers for grading
  - displaying results with AI explanations
----------------------------------------------------------------- */

import React, { useState, useEffect } from 'react';
import { Button, Card, Spinner, Alert } from 'react-bootstrap';

// TODO: add 'module' or 'week' field to group assignments
// TODO: use assignment.type in future to conditionally render different layouts

/* ------------------------ Main Assignment Component ------------------------ */
const Assignment = ({ assignment, userId = 'guest', onAskChat }) => {


    /* ----- state: store fetched questions, answers, and grading results ----- */
    const [questions, setQuestions] = useState([]); 
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // track current question
    const [answers, setAnswers] = useState({}); 
    const [results, setResults] = useState([]); 

    const [loading, setLoading] = useState(false); // track loading state
    const [submitting, setSubmitting] = useState(false); // track submitting state
    const [error, setError] = useState(""); // store error messages

    /* ------------------------ Fetch assignment questions ------------------------ */
    useEffect(() => {
        if (assignment) {
            fetchQuestions(assignment.assignment_id);
        }
    }, [assignment]);

    /* ------------------------ Fetch any previous results ------------------------ */
    useEffect(() => {
        if (assignment && userId) {
            fetchPreviousResults(assignment.assignment_id, userId);
        }
    }, [assignment, userId]);

    /* ------------------------ API call to load questions ------------------------ */
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

    /* ------------------------ API call to load past results ------------------------ */
    const fetchPreviousResults = async (assignmentId, userId) => {
        try {
          const res = await fetch(`http://localhost:5000/api/assignments/${assignmentId}/results?user_id=${userId}`);
          const data = await res.json();
      
          if (res.ok && data.results && data.results.length > 0) {
            setResults(data.results);
          } else {
            // Don't do anything — assume user hasn't completed the assignment
            setResults([]); // ensure we clear old results
          }
        } catch (err) {
          console.error('Failed to fetch previous results:', err);
        }
      };

    /* ------------------------ Handle answer change ------------------------ */
    const handleAnswerChange = (questionId, value) => {
        setAnswers({ ...answers, [questionId]: value });
    };

    /* ------------------------ Question Navigation: Prev / Next ------------------------ */
    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };
    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    /* ------------------------ Check if all questions answered ------------------------ */
    const allAnswered = questions.every((q) => answers[q.question_id]);

    /* ------------------------ Submit assignment for grading ------------------------ */
    const handleSubmitAssignment = async () => {
        setSubmitting(true);
      
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/assignments/${assignment.assignment_id}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: userId || 'guest',
              assignment_id: assignment.assignment_id,
              course_code: assignment.course_code,
              answers: answers,
      
              score: 0,
              max_score: questions.reduce((acc, q) => acc + (q.max_points || 0), 0)
            })
          });
      
          const result = await response.json();
          if (response.ok) {
            setResults(result.results); // assignment results
          } else {
            alert(result.error || "Failed to submit assignment.");
          }
        } catch (error) {
          console.error("error submitting assignment:", error);
          alert("An error occurred while submitting.");
        } finally {
          setSubmitting(false);
        }
      };
      

    /* ------------------------ Build AI prompt and send to Chat ------------------------ */
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
      
      
      

    /* ------------------------ Render: Question Index Buttons ------------------------ */
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


    /* ------------------------ Determine if question is unlocked ------------------------ */
    const isQuestionAccessible = (index) => {
        return index <= currentQuestionIndex || answers[questions[index]?.question_id];
    };


/* ------------------------ Render: Current Question View ------------------------ */
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


    /* ------------------------ Render: Assignment Results ------------------------ */
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
            <h5>
                Total Score: {
                    results.reduce((acc, res) => acc + (parseFloat(res.points_awarded) || 0), 0).toFixed(2)
                } / {
                    results.reduce((acc, res) => acc + (parseFloat(res.max_points) || 0), 0).toFixed(2)
                }
            </h5>



        </div>
    );

    /* ------------------------ Component Render ------------------------ */
    return (
        <div className="assignment-container">
            <Card className="mt-4">
                {/* ------------------ Card Header: Assignment Title ------------------ */}
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h4 className="m-0">{assignment.assignment_title}</h4>
                </Card.Header>

                {/* ------------------ Card Body: Assignment Content ------------------ */}
                <Card.Body>

                {/* CASE 1: Loading state while fetching questions */}
                    {loading && questions.length === 0 ? (
                        <Spinner animation="border" />
                    
                /*  CASE 2: Error fetching questions  */
                    ) : error ? (
                        <Alert variant="danger">{error}</Alert>

                /*  CASE 3: Results already exist (assignment previously submitted)  */
                    ) : results.length > 0 ? (
                        <>
                        <Alert variant="info">
                          You’ve already submitted this assignment. Here are your results:
                        </Alert>

                        {/* render assignment results including points and feedback */}
                        {renderResults()}
                      </>

                /*  CASE 4: Active assignment in progress  */
                    ) : (
                        <>
                            {renderQuestionIndex()} {/* question navigation */}
                            {renderQuestion()} {/* current question display */}

                            {/* ------------------ Question Navigation Buttons ------------------ */}
                            <div className="assignment-navigation-buttons mt-3">
                                <Button
                                    className="prev-button"
                                    variant="secondary"
                                    onClick={handlePrevious}
                                    disabled={currentQuestionIndex === 0} // disable if on first question
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

                            {/* ------------------ Submit Button (when all answered) ------------------ */}
                            {questions.length > 0 && allAnswered && (
                                <Button
                                    className="submit-assignment-button"
                                    variant="success"
                                    onClick={handleSubmitAssignment}
                                    disabled={submitting} // disable while waiting on submission response
                                >
                                    {submitting ? (
                                    <>
                                        {/* show spinner while grading */}
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
                                    "Submit" // static label when not submitting
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


