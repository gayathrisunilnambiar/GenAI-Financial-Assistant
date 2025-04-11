// src/pages/Chatbot.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Added Link import
import axios from 'axios';
import './Chatbot.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Chatbot: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    // Add initial welcome message
    {
      role: 'assistant',
      content: 'Hello! I\'m your financial assistant. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Add this useEffect to scroll to bottom when new messages arrive
  useEffect(() => {
    const chatWindow = document.getElementById('chat-window');
    if (chatWindow) {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/chat', {
        message: input.trim()
      });

      if (response.data && response.data.reply) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.data.reply
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again or check your connection.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo-section" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="img1.jpeg" alt="PortFi" className="logo-img" />
          <span className="logo-text">PortFi</span>
        </div>
        <nav className="nav-menu">
          <Link to="/" className="nav-item">Overview</Link>
          <Link to="#" className="nav-item">Insights</Link>
          <Link to="/dashboard" className="nav-item">Dashboard</Link>
          <Link to="#" className="nav-item">Community</Link>
          <Link to="/assistant" className="nav-item active">Assistant</Link>
        </nav>
      </header>

      <main className="chatbot-container">
        <div className="chatbot-box">
          <div className="chat-header">
            <h2>Financial Assistant</h2>
          </div>
          <div className="chat-window" id="chat-window">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="assistant-avatar">🤖</div>
                )}
                <div className="message-content">
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-message assistant">
                <div className="assistant-avatar">🤖</div>
                <div className="message-content typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything about finance..."
              disabled={isLoading}
            />
            <button 
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className={isLoading ? 'loading' : ''}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chatbot;