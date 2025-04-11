// src/pages/Home.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserIcon from '../components/UserIcon';
import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="logo-section" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="img1.jpeg" alt="PortFi" className="logo-img" />
          <span className="logo-text">PortFi</span>
        </div>
        <nav className="nav-menu">
          <Link to="/" className="nav-item active">Overview</Link>
          <Link to="#" className="nav-item">Insights</Link>
          <Link to="/dashboard" className="nav-item">Dashboard</Link>
          <UserIcon />
        </nav>
      </header>

      <main className="main-content">
        {/* AI Insights Panel */}
        <section className="insights-panel">
          <div className="panel-header">
            <h2>AI Insights Panel</h2>
            <div className="time-controls">
              <button className="time-btn active">Day</button>
              <button className="time-btn">Week</button>
              <button className="time-btn">Month</button>
              <button className="time-btn">Quarter</button>
            </div>
            <div className="assets-dropdown">
              <button>All assets ▾</button>
            </div>
          </div>

          <div className="balance-section">
            <div className="total-balance">
              <h1>$103,489<span className="cents">.24</span></h1>
              <div className="balance-stats">
                <span className="stat-pill positive">↑ 1.8%</span>
                <span className="stat-pill positive">+ $5.29%</span>
              </div>
            </div>
          </div>

          <div className="chart-container">
            <div className="chart-values">
              <span>110</span>
              <span>105</span>
              <span>100</span>
              <span>95</span>
              <span>90</span>
              <span>85</span>
            </div>
            <div className="chart">
              {/* Chart will be implemented separately */}
            </div>
            <div className="chart-labels">
              {[1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31].map(num => (
                <span key={num}>{num}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Analytics Section */}
        <section className="analytics-section">
          <div className="analytics-header">
            <h3>Real-time Analytics</h3>
            <div className="analytics-filters">
              <span className="filter active">New</span>
              <span className="filter">Retention</span>
            </div>
          </div>
          <div className="scatter-plot">
            {/* Scatter plot will be implemented separately */}
          </div>
        </section>

        {/* Community Projects */}
        <section className="community-section">
          <div className="section-header">
            <h3>Community Projects</h3>
            <button className="projects-btn">Projects →</button>
          </div>
          
          <div className="project-card">
            <h4>AI-Powered Fraud Detection System</h4>
            <p>A fraud detection system that uses AI algorithms to analyze transaction data on the blockchain and identify suspicious activities, enabling early detection and prevention of fraudulent behavior in d...</p>
            
            <div className="progress-bar">
              <div className="progress" style={{width: '37%'}}></div>
              <span>37% of transactions analyzed</span>
            </div>

            <div className="participants-circle">
              <div className="circle-progress" style={{background: 'conic-gradient(#8b5cf6 50%, #22c55e 50%)'}}></div>
              <div className="circle-content">
                <h2>534</h2>
                <span>Users</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;