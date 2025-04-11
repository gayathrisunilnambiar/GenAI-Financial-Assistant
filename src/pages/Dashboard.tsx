// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import {
  fetchMarketOverview,
  fetchPortfolioData,
  fetchWatchlistData,
  fetchRecommendationsData,
  fetchSectorPerformanceData,
} from '../api/ycommerceApi';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [portfolioData, setPortfolioData] = useState<any>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      const portfolio = await fetchPortfolioData();
      setPortfolioData(portfolio);
    };
    fetchData();
  }, []);

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
          <Link to="/dashboard" className="nav-item active">Dashboard</Link>
          <Link to="#" className="nav-item">Login</Link>
          <Link to="#" className="nav-item">Assistant</Link>
        </nav>
      </header>

      <main className="dashboard-content">
        {/* Portfolio Overview Panel */}
        <section className="insights-panel">
          <div className="panel-header">
            <h2>Portfolio Overview</h2>
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
              <h1>${portfolioData?.value?.toLocaleString() || '0'}<span className="cents">.24</span></h1>
              <div className="balance-stats">
                <span className="stat-pill positive">↑ {portfolioData?.dayChangePercent || '0'}%</span>
                <span className="stat-pill positive">+ ${portfolioData?.dayChange || '0'}</span>
              </div>
            </div>
          </div>

          <div className="chart-container">
            <div className="chart-values">
              {[110, 105, 100, 95, 90, 85].map(value => (
                <span key={value}>{value}</span>
              ))}
            </div>
            <div className="chart">
              {/* Chart implementation */}
            </div>
            <div className="chart-labels">
              {[1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31].map(num => (
                <span key={num}>{num}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Real-time Analytics */}
        <section className="analytics-section">
          <div className="analytics-header">
            <h3>Real-time Analytics</h3>
            <div className="analytics-filters">
              <span className="filter active">New</span>
              <span className="filter">Retention</span>
            </div>
          </div>
          <div className="scatter-plot">
            {/* Scatter plot implementation */}
          </div>
        </section>

        {/* Holdings Section */}
        <section className="holdings-section">
          <div className="section-header">
            <h3>Your Holdings</h3>
            <button className="view-all-btn">View All →</button>
          </div>
          
          <div className="holdings-grid">
            {portfolioData?.holdings?.map((holding: any) => (
              <div key={holding.ticker} className="holding-card">
                <div className="holding-info">
                  <h4>{holding.ticker}</h4>
                  <p className="holding-value">${holding.value.toLocaleString()}</p>
                </div>
                <div className="holding-chart">
                  {/* Mini chart implementation */}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Market Overview */}
        <section className="market-section">
          <div className="section-header">
            <h3>Market Overview</h3>
            <div className="market-filters">
              <button className="market-btn active">Stocks</button>
              <button className="market-btn">Crypto</button>
              <button className="market-btn">Forex</button>
            </div>
          </div>
          
          <div className="market-grid">
            {/* Market data will be mapped here */}
            <div className="market-card">
              <div className="market-info">
                <span className="market-name">NIFTY 50</span>
                <span className="market-value">22,356.25</span>
                <span className="market-change positive">+110.5 (0.5%)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Watchlist Section */}
        <section className="watchlist-section">
          <div className="section-header">
            <h3>Watchlist</h3>
            <button className="add-btn">+ Add Assets</button>
          </div>
          
          <div className="watchlist-table">
            {/* Watchlist data will be mapped here */}
            <div className="watchlist-row">
              <div className="asset-info">
                <span className="asset-name">Infosys</span>
                <span className="asset-ticker">INFY</span>
              </div>
              <div className="asset-price">₹1,450.25</div>
              <div className="asset-change positive">+1.06%</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;