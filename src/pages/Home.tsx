// src/pages/Home.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserIcon from '../components/UserIcon';
import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();
  const [selectedStock, setSelectedStock] = useState(0);
  const [timeRange, setTimeRange] = useState('1D');
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Sample stock data - replace with real data
  const topStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 175.34, change: 2.5, data: [170, 172, 171, 173, 174, 175, 174, 175, 176, 175] },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 328.39, change: 1.8, data: [325, 326, 327, 326, 328, 327, 328, 329, 328, 328] },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.56, change: 3.2, data: [140, 141, 142, 141, 142, 143, 142, 143, 142, 142] },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.75, change: 1.5, data: [177, 178, 177, 178, 179, 178, 179, 178, 179, 178] },
    { symbol: 'META', name: 'Meta Platforms', price: 485.58, change: 2.1, data: [480, 482, 483, 484, 483, 484, 485, 484, 485, 485] }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setSelectedStock((prev) => (prev + 1) % topStocks.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, topStocks.length]);

  const handlePrev = () => {
    setSelectedStock((prev) => (prev - 1 + topStocks.length) % topStocks.length);
    setIsAutoPlaying(false);
  };

  const handleNext = () => {
    setSelectedStock((prev) => (prev + 1) % topStocks.length);
    setIsAutoPlaying(false);
  };

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
          </div>

          <div className="stocks-list">
            {topStocks.map((stock, index) => (
              <div 
                key={stock.symbol}
                className={`stock-item ${selectedStock === index ? 'active' : ''}`}
                onClick={() => {
                  setSelectedStock(index);
                  setIsAutoPlaying(false);
                }}
              >
                <div className="stock-info">
                  <span className="stock-symbol">{stock.symbol}</span>
                  <span className="stock-name">{stock.name}</span>
                </div>
                <div className="stock-price">
                  <span className="price">${stock.price}</span>
                  <span className={`change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.change}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Analytics Section */}
        <section className="analytics-section">
          <div className="analytics-header">
            <h3>Real-time Analytics</h3>
            <div className="time-controls">
              <button 
                className={`time-btn ${timeRange === '1D' ? 'active' : ''}`}
                onClick={() => setTimeRange('1D')}
              >
                Day
              </button>
              <button 
                className={`time-btn ${timeRange === '1W' ? 'active' : ''}`}
                onClick={() => setTimeRange('1W')}
              >
                Week
              </button>
              <button 
                className={`time-btn ${timeRange === '1M' ? 'active' : ''}`}
                onClick={() => setTimeRange('1M')}
              >
                Month
              </button>
            </div>
          </div>

          <div className="chart-container">
            <div className="chart">
              <svg className="line-chart" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path
                  d={topStocks[selectedStock].data.map((value, i) => {
                    const x = (i / (topStocks[selectedStock].data.length - 1)) * 100;
                    const y = 100 - ((value - Math.min(...topStocks[selectedStock].data)) / 
                      (Math.max(...topStocks[selectedStock].data) - Math.min(...topStocks[selectedStock].data))) * 100;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  stroke="#007bff"
                  strokeWidth="1"
                  fill="none"
                />
              </svg>
            </div>
            <div className="stock-info-container">
              <div className="stock-info">
                <span className="stock-symbol">{topStocks[selectedStock].symbol}</span>
                <span className="stock-name">{topStocks[selectedStock].name}</span>
              </div>
              <div className="stock-price">
                <span className="price">${topStocks[selectedStock].price}</span>
                <span className={`change ${topStocks[selectedStock].change >= 0 ? 'positive' : 'negative'}`}>
                  {topStocks[selectedStock].change >= 0 ? '+' : ''}{topStocks[selectedStock].change}%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* About Us */}
        <section className="community-section">
          <div className="section-header">
            <h3>About Us</h3>
          </div>
          
          <div className="project-card">
            <h4>Our Mission</h4>
            <p>PortFi is dedicated to democratizing financial analysis and investment management through cutting-edge AI technology. We empower investors of all levels with sophisticated tools and insights previously available only to professionals.</p>
            
            <div className="progress-bar">
              <div className="progress" style={{width: '100%'}}></div>
              <span>100% Committed to Your Success</span>
            </div>

            <div className="participants-circle">
              <div className="circle-progress" style={{background: 'conic-gradient(#8b5cf6 100%, #22c55e 0%)'}}></div>
              <div className="circle-content">
                <h2>24/7</h2>
                <span>Support</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;