import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function CoursePage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [botType, setBotType] = useState('Tutor');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  // Fetch course details
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`http://localhost:5000/courses/${courseId}`);
        const data = await response.json();

        // Set course data
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

  // Handle sending chat messages
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (input.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'user', text: input },
      ]);

      try {
        const response = await fetch('http://localhost:5000/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            botType,
            prompt: input,
            courseId,
          }),
        });

        const data = await response.json();

        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'ai', text: data.response || 'No response' },
        ]);
      } catch (error) {
        console.error('Error during chat:', error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'ai', text: 'There was an error processing your request.' },
        ]);
      }

      setInput('');
    }
  };

  return (
    <div className="course-page">
      <div className="course-info">
        {course ? (
          <>
            <h2>{course.course_title}</h2>
            <p>{course.course_description}</p>
            <p>Credits: {course.credits}</p>
          </>
        ) : (
          <p>Loading course information...</p>
        )}
      </div>
      <div className="ai-chat">
        <h3>AI Chat</h3>
        <select
          value={botType}
          onChange={(e) => setBotType(e.target.value)}
          className="bot-type-selector"
        >
          <option value="Tutor">Tutor</option>
          <option value="Mentor">Mentor</option>
          <option value="Co-Learner">Co-Learner</option>
        </select>
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`chat-message ${message.sender}`}
            >
              {message.text}
            </div>
          ))}
        </div>
        <form onSubmit={handleSendMessage}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

export default CoursePage;

