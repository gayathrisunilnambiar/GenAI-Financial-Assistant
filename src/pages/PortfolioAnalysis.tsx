import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserIcon from '../components/UserIcon';
import './PortfolioAnalysis.css';

interface PortfolioMetrics {
  prediction: number;
  mse: number;
  rmse: number;
  mae: number;
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
}

interface StockInput {
  ticker: string;
  weight: number;
}

const PortfolioAnalysis: React.FC = () => {
  const { currentUser, loading, logout } = useAuth();
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stocks, setStocks] = useState<StockInput[]>([
    { ticker: 'AAPL', weight: 0.3 },
    { ticker: 'MSFT', weight: 0.3 },
    { ticker: 'GOOGL', weight: 0.4 }
  ]);
  const [period, setPeriod] = useState('1y');

  const handleStockChange = (index: number, field: keyof StockInput, value: string) => {
    const newStocks = [...stocks];
    if (field === 'weight') {
      newStocks[index][field] = parseFloat(value);
    } else {
      newStocks[index][field] = value;
    }
    setStocks(newStocks);
  };

  const addStock = () => {
    setStocks([...stocks, { ticker: '', weight: 0 }]);
  };

  const removeStock = (index: number) => {
    setStocks(stocks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAnalysis(true);
    setError(null);

    try {
      const totalWeight = stocks.reduce((sum, stock) => sum + stock.weight, 0);
      if (Math.abs(totalWeight - 1) > 0.01) {
        throw new Error('Weights must sum to 1');
      }

      const requestData = {
        stocks: stocks.map(s => ({ ticker: s.ticker, weight: s.weight })),
        period
      };

      console.log('Sending request to analyze portfolio:', requestData);

      const response = await fetch('http://192.168.75.248:5000/analyze-portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received portfolio analysis data:', data);
      setMetrics(data);
    } catch (err) {
      console.error('Error analyzing portfolio:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while analyzing the portfolio');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo-section" onClick={() => window.location.href = '/'} style={{ cursor: 'pointer' }}>
          <img src="img1.jpeg" alt="PortFi" className="logo-img" />
          <span className="logo-text">PortFi</span>
        </div>
        <nav className="nav-menu">
          <Link to="/" className="nav-item">Overview</Link>
          <Link to="#" className="nav-item">Insights</Link>
          <Link to="/dashboard" className="nav-item">Dashboard</Link>
          <Link to="/portfolio-analysis" className="nav-item active">Portfolio Analysis</Link>
          <Link to="/assistant" className="nav-item">Assistant</Link>
          <UserIcon />
          <button onClick={handleLogout} className="nav-item logout-btn">Logout</button>
        </nav>
      </header>

      <main className="portfolio-analysis-content">
        <section className="analysis-panel">
          <div className="panel-header">
            <h2>Portfolio Analysis</h2>
            <div className="time-controls">
              <select 
                value={period} 
                onChange={(e) => setPeriod(e.target.value)}
                className="period-select"
              >
                <option value="1d">1 Day</option>
                <option value="1w">1 Week</option>
                <option value="1m">1 Month</option>
                <option value="1y">1 Year</option>
              </select>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="portfolio-form">
            <div className="input-description">
              <h3>Portfolio Input Guide</h3>
              <p>Enter your stock portfolio details below:</p>
              <ul>
                <li><strong>Ticker Symbol:</strong> The stock's trading symbol (e.g., AAPL for Apple, MSFT for Microsoft)</li>
                <li><strong>Weight:</strong> The percentage of your portfolio allocated to this stock (must be between 0 and 1, and all weights must sum to 1)</li>
                <li><strong>Time Period:</strong> Select the historical data period for analysis (1 day, 1 week, 1 month, or 1 year)</li>
              </ul>
              <p className="note">Note: Make sure all weights sum to 1 (100%) for accurate portfolio analysis.</p>
            </div>

            <div className="stocks-input">
              {stocks.map((stock, index) => (
                <div key={index} className="stock-row">
                  <input
                    type="text"
                    value={stock.ticker}
                    onChange={(e) => handleStockChange(index, 'ticker', e.target.value)}
                    placeholder="Stock Ticker"
                    className="ticker-input"
                  />
                  <input
                    type="number"
                    value={stock.weight}
                    onChange={(e) => handleStockChange(index, 'weight', e.target.value)}
                    placeholder="Weight"
                    min="0"
                    max="1"
                    step="0.01"
                    className="weight-input"
                  />
                  <button
                    type="button"
                    onClick={() => removeStock(index)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button type="button" onClick={addStock} className="add-btn">
                Add Stock
              </button>
            </div>

            <button type="submit" className="analyze-btn" disabled={loadingAnalysis}>
              {loadingAnalysis ? 'Analyzing...' : 'Analyze Portfolio'}
            </button>
          </form>

          {error && <div className="error-message">{error}</div>}

          {metrics && (
            <>
              <div className="metrics-grid">
                <div className="metric-card">
                  <h3>Expected Return</h3>
                  <p className="metric-value">{(metrics.expectedReturn * 100).toFixed(2)}%</p>
                  <p className="metric-label">Annualized</p>
                </div>
                <div className="metric-card">
                  <h3>Volatility</h3>
                  <p className="metric-value">{(metrics.volatility * 100).toFixed(2)}%</p>
                  <p className="metric-label">Annualized</p>
                </div>
                <div className="metric-card">
                  <h3>Sharpe Ratio</h3>
                  <p className="metric-value">{metrics.sharpeRatio.toFixed(4)}</p>
                  <p className="metric-label">Risk-Adjusted Return</p>
                </div>
                <div className="metric-card">
                  <h3>Predicted Value</h3>
                  <p className="metric-value">${metrics.prediction.toFixed(2)}</p>
                  <p className="metric-label">Next Period</p>
                </div>
              </div>

              <div className="model-performance">
                <h3>Model Performance</h3>
                <div className="metrics-grid">
                  <div className="metric-card">
                    <h3>Mean Absolute Error</h3>
                    <p className="metric-value">{metrics.mae.toFixed(4)}</p>
                    <p className="metric-label">Prediction Accuracy</p>
                  </div>
                  <div className="metric-card">
                    <h3>Mean Squared Error</h3>
                    <p className="metric-value">{metrics.mse.toFixed(4)}</p>
                    <p className="metric-label">Model Performance</p>
                  </div>
                  <div className="metric-card">
                    <h3>Root Mean Squared Error</h3>
                    <p className="metric-value">{metrics.rmse.toFixed(4)}</p>
                    <p className="metric-label">Model Performance</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default PortfolioAnalysis; 