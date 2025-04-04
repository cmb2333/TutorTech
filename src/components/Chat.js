import React, { useState, useRef, useEffect } from 'react';

function Chat({ botType, courseId, userId, externalPrompt, historyEnabled }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesContainerRef = useRef(null);


  // ---------- Scroll Chat to Bottom ----------
  // Scrolls the chat container to the bottom so newest message is visible
  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };


  // ---------- Handle Input Changes ----------
  // Adjusts textarea height based on content as user types
  const handleInputChange = (e) => {
    setInput(e.target.value);
    const textarea = textareaRef.current;

    // Reset and shrink height before expanding
    textarea.style.height = '20px';
    textarea.style.overflowY = 'hidden';

    // Dynamically expand textarea height up to 100px
    const scrollHeight = textarea.scrollHeight;
    if (scrollHeight <= 100) {
      textarea.style.height = `${scrollHeight}px`; // grow until max-height
    } else {
      textarea.style.height = '100px'; // lock at max height
      textarea.style.overflowY = 'auto'; // enable scrolling after max height
    }
  };


  // ---------- Handle Enter Key ----------
  // Sends message when Enter is pressed (Shift + Enter creates newline)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // stop newline
      handleSendMessage(e); // trigger message send
    }
  };
  
  // ---------- Send Prompt to Flask Chat Endpoint ----------
  // Sends user or system message to the backend and stores AI's response
  const sendToBot = async (promptText) => {
    setIsTyping(true); // show typing indicator
  
    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ botType, prompt: promptText, courseId, userId, historyEnabled }),
      });
  
      const data = await response.json(); // parse backend response
      setMessages((prev) => [...prev, { sender: 'ai', text: data.response || 'No response' }]);
    } catch (error) {
      console.error('Error during chat:', error); // log error for debugging
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Error processing request.' }]);
    } finally {
      setIsTyping(false); // hide typing indicator after response
    }
  };

  // ---------- Handle Send Button / Enter Submission ----------
  // Submits user input to chat and triggers AI response
  const handleSendMessage = async (e) => {
    e.preventDefault(); // prefvent form submit page reload

    if (input.trim()) {
      setMessages((prev) => [...prev, { sender: 'user', text: input }]);
      sendToBot(input); // send to backend
      setInput(''); // clear input

      // Reset textarea styling after sending
      const textarea = textareaRef.current;
      textarea.style.height = '80px';
      textarea.style.overflowY = 'hidden';
  
      // Scroll to bottom after sending
      setTimeout(() => {
        scrollToBottom();
      }, 50); // delay ensures new message is rendered before scroll
    }
  };
  
  
  // ---------- Handle System-Pushed Prompts (e.g. Explanation Button) ----------
  // When externalPrompt changes, send it as a system question
  useEffect(() => {
    if (externalPrompt) {
      sendToBot(externalPrompt); // send explanation or system-initiated message
  
      // Scroll only when explanation is clicked
      setTimeout(() => {
        scrollToBottom();
      }, 50); // wait for typing dots to render
    }
  }, [externalPrompt]); // triggered when prompt prop changes
  

  // ---------- Render Chat Interface ----------
  return (
    <div className="ai-chat">
      {/* Chat messages container */}
      <div className="chat-messages" ref={messagesContainerRef}>

        {/* Render each message in chat history */}
        {messages.map((message, index) => (
          <div key={index} className={`chat-message ${message.sender}`}>
            <div className="message-bubble">{message.text}</div>
          </div>
        ))}


        {/* Animated typing dots while AI is "thinking" */}
        {isTyping && (
          <div className="chat-message ai">
            <div className="message-bubble typing-indicator">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
      </div>
  
      {/* Chat input field and buttons */}
      <form onSubmit={handleSendMessage} className="chat-input">
        <div className="chat-input-row">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            rows="1"
            className="chat-textarea"
          />
          <div className="chat-button-group">
            <button type="submit">Send</button>
            <button
              type="button"
              className="clear-button"
              onClick={() => setMessages([])}
            >
              Clear
            </button>
          </div>
        </div>
      </form>

    </div>
  );
  
}

export default Chat;

