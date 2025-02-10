import React, { useState } from 'react';

// Trying something a bit different... 
// Including course ID and beginning to consolidate code as per Seth's request
function Chat({ botType, courseId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  // Send user messge to backend for OpenAI API calls
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (input.trim()) {
      // Add user message
      setMessages((prevMessages) => [...prevMessages, { sender: 'user', text: input }]);

      // Send message to backend
      try {
        const response = await fetch('http://localhost:5000/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ botType, prompt: input, courseId }),
        });

        // Handle the backend response 
        const data = await response.json();
        setMessages((prevMessages) => [...prevMessages, { sender: 'ai', text: data.response || 'No response' }]);
      } catch (error) {
        console.error('Error during chat', error);
        setMessages((prevMessages) => [...prevMessages, { sender: 'ai', text: 'There was an error processing your request' }]);
      }

      setInput('');
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
          value={input}
          onChange={(e) => setInput(e.target.value)}
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