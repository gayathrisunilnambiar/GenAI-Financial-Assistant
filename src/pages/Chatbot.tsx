// === Chatbot.tsx (Updated for proper context passing and backend sync) ===

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import UserIcon from '../components/UserIcon';
import './Chatbot.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

const INITIAL_MESSAGES: Message[] = [
  {
    role: 'assistant',
    content: `Hi! I’m FinBot – your beginner-friendly financial assistant for India 🇮🇳.
I can help you learn about SIPs, mutual funds, stocks, risk profiles, and more!
Go ahead, ask me anything about investing 🧠💰`,
    timestamp: new Date()
  }
];

const API_BASE_URL = 'http://localhost:5000'; // Ensure this matches your backend

const Chatbot: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, loading, logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, loading, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    checkConnection();
  }, []);

  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  };

  const checkConnection = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      setIsConnected(response.data.status === 'healthy');
    } catch {
      setIsConnected(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const context = messages.slice(-6).map(msg => ({ role: msg.role, content: msg.content }));

      const response = await axios.post(`${API_BASE_URL}/chat`, {
        message: userMessage.content,
        context,
        userId: currentUser?.uid
      });

      const replyText = response.data?.reply || 'Hmm... I couldn’t understand that. Try rephrasing?';

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: replyText,
        timestamp: new Date()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo-section" onClick={() => navigate('/')}>PortFi</div>
        <nav className="nav-menu">
          <Link to="/">Overview</Link>
          <Link to="#">Insights</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/assistant" className="active">Assistant</Link>
          <UserIcon />
        </nav>
      </header>
      <main className="chatbot-container">
        <div className="chatbot-box">
          <div className="chat-window" ref={chatWindowRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role}`}>
                <div className="message-content">
                  {msg.content}
                  <div className="timestamp">
                    {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-message assistant typing-indicator">Typing...</div>
            )}
          </div>
          <div className="chat-input">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask something about SIPs, stocks, taxes..."
            />
            <button onClick={sendMessage} disabled={isLoading || !input.trim()}>
              {isLoading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chatbot;
