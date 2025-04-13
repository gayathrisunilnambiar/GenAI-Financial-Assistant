// src/pages/Chatbot.tsx
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
    content: `You are FinBot, a helpful and beginner-friendly financial assistant for Indian users. 
Your role is to explain personal finance concepts in a clear, concise, and engaging way — especially for beginners. 
Do not provide personalized financial advice, only general educational information.

You specialize in:
- SIPs (Systematic Investment Plans)
- Mutual funds
- Stock market basics
- Risk profiles
- Investment options for beginners
- Tax-saving instruments in India

Always be friendly and informative. Use relatable analogies or simple examples if needed.

Even if the question is vague or incomplete, do your best to infer intent and provide an educational answer.`,
    timestamp: new Date()
  }
];


const API_BASE_URL = 'http://localhost:5000'; // Update this to match your backend URL

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
      const response = await axios.get(`${API_BASE_URL}/health`, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log('Backend connection successful:', response.data);
      setIsConnected(response.data.status === 'healthy');
    } catch (error) {
      console.error('Backend connection check failed:', error);
      setIsConnected(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (!isConnected) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Unable to connect to the server. Please check if the backend is running.',
          timestamp: new Date()
        }
      ]);
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      console.log('Sending message to backend:', userMessage.content);
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        message: userMessage.content,
        context: messages.slice(-5),
        userId: currentUser?.uid
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Backend response:', response.data);

      if (response.data && response.data.reply) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.data.reply,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error:', error);
      let errorMessage = 'I apologize, but I encountered an error. Please try again or check your connection.';
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          errorMessage = 'Request timed out. Please try again.';
        } else if (!error.response) {
          errorMessage = 'Unable to connect to the server. Please check if the backend is running.';
          setIsConnected(false);
        } else if (error.response.status === 404) {
          errorMessage = 'The chat endpoint was not found. Please check the server configuration.';
        } else if (error.response.data && error.response.data.error) {
          errorMessage = `Server error: ${error.response.data.error}`;
        }
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date()
        }
      ]);
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

  const formatTimestamp = (date?: Date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

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
          <Link to="/assistant" className="nav-item active">Assistant</Link>
          <UserIcon />
        </nav>
      </header>

      <main className="chatbot-container">
        <div className="chatbot-box">
          <div className="chat-header">
            <h2>
              <span role="img" aria-label="bot" style={{ marginRight: '8px' }}>🤖</span>
              Financial Assistant
            </h2>
          </div>
          <div className="chat-window" id="chat-window" ref={chatWindowRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="assistant-avatar">AI</div>
                )}
                <div className="message-content">
                  {msg.content}
                  <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '4px' }}>
                    {formatTimestamp(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-message assistant">
                <div className="assistant-avatar">AI</div>
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
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your finances, investments, or market trends..."
              disabled={isLoading}
            />
            <button 
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className={isLoading ? 'loading' : ''}
            >
              {isLoading ? 'Thinking...' : 'Send'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chatbot;
