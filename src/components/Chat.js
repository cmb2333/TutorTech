import React, { useState, useRef, useEffect } from 'react';

function Chat({ botType, courseId, userId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  // Adjust textarea height and overflow based on input
  const handleInputChange = (e) => {
    setInput(e.target.value);
    const textarea = textareaRef.current;

    // Reset height to recalculate
    textarea.style.height = '20px';
    textarea.style.overflowY = 'hidden';

    // Expand height based on content
    const scrollHeight = textarea.scrollHeight;
    if (scrollHeight <= 100) {
      textarea.style.height = `${scrollHeight}px`; // Grow until max-height
    } else {
      textarea.style.height = '100px'; // Lock at max height
      textarea.style.overflowY = 'auto'; // Enable scrolling after max height
    }
  };

  // Send message and reset textarea
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages((prev) => [...prev, { sender: 'user', text: input }]);

      try {
        const response = await fetch('http://localhost:5000/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ botType, prompt: input, courseId, userId}),
        });

        const data = await response.json();
        setMessages((prev) => [...prev, { sender: 'ai', text: data.response || 'No response' }]);
      } catch (error) {
        console.error('Error during chat:', error);
        setMessages((prev) => [...prev, { sender: 'ai', text: 'Error processing request.' }]);
      }

      // Reset textarea after sending
      setInput('');
      const textarea = textareaRef.current;
      textarea.style.height = '80px';
      textarea.style.overflowY = 'hidden';
    }
  };

  return (
    <div className="ai-chat">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`chat-message ${message.sender}`}>
            <div className="message-bubble">{message.text}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="chat-input">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          placeholder="Ask a question..."
          rows="1"
          className="chat-textarea"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;

