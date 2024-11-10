import React, { useState } from 'react';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (input.trim()) {
      // Add the user's message to the chat
      setMessages([...messages, { sender: 'user', text: input }]);
      // TODO: Add logic to send input to AI model and receive a response
      setInput('');
    }
  };

  return (
    <section className="chat-section">
      <h2>AI Chat</h2>
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`chat-message ${message.sender}`}>
            {message.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
    </section>
  );
}

export default Chat;

