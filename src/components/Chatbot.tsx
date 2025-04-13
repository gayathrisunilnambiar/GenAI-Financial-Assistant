import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { chatWithAssistant, checkServerHealth } from "../api/apiService";
import "./Chatbot.css";

interface Message {
  type: "user" | "bot";
  text: string;
}

const Chatbot: React.FC = () => {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isServerConnected, setIsServerConnected] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check server health on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await checkServerHealth();
        setIsServerConnected(true);
      } catch (err) {
        console.error("Server connection error:", err);
        setIsServerConnected(false);
        setError("Unable to connect to the server. Please check if the backend is running.");
      }
    };
    checkConnection();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading || !isServerConnected) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { type: "user", text: userMessage }]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatWithAssistant(userMessage);
      setMessages(prev => [...prev, { type: "bot", text: response.response }]);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Sorry, I'm having trouble connecting. Please try again later.");
      setMessages(prev => [...prev, { 
        type: "bot", 
        text: "I apologize, but I'm having trouble connecting right now. Please try again in a few moments." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>Portafi Assistant 💬</h2>
        <p className="subtitle">Your personal financial guide</p>
        {!isServerConnected && (
          <div className="connection-status error">
            Server is not connected. Please check if the backend is running.
          </div>
        )}
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <h3>Welcome to Portafi!</h3>
            <p>I can help you with:</p>
            <ul>
              <li>Understanding mutual funds and SIPs</li>
              <li>Basic stock market concepts</li>
              <li>Investment options in India</li>
              <li>Tax-saving instruments</li>
            </ul>
            <p>What would you like to know?</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`message ${msg.type === "user" ? "user-message" : "bot-message"}`}
            >
              <div className="message-header">
                <strong>{msg.type === "user" ? "You" : "Portafi"}</strong>
              </div>
              <div className="message-content">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="message bot-message">
            <div className="message-header">
              <strong>Portafi</strong>
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSend} className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me about investing..."
          disabled={isLoading || !isServerConnected}
        />
        <button 
          type="submit" 
          disabled={isLoading || !input.trim() || !isServerConnected}
          className={isLoading ? "loading" : ""}
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default Chatbot; 