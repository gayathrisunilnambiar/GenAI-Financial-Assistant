import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserIcon from '../components/UserIcon';
import './PortfolioAnalysis.css';

interface PortfolioMetrics {
  prediction: number;
  metrics: {
    mse: number;
    rmse: number;
    mae: number;
  };
  portfolio_metrics: {
    expected_return: number;
    volatility: number;
    sharpe_ratio: number;
  };
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

      const response = await fetch('http://localhost:5000/analyze-portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stocks: stocks.map(s => s.ticker),
          weights: stocks.map(s => s.weight),
          period
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze portfolio');
      }

      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
                  <p className="metric-value">{(metrics.portfolio_metrics.expected_return * 100).toFixed(2)}%</p>
                  <p className="metric-label">Annualized</p>
                </div>
                <div className="metric-card">
                  <h3>Volatility</h3>
                  <p className="metric-value">{(metrics.portfolio_metrics.volatility * 100).toFixed(2)}%</p>
                  <p className="metric-label">Annualized</p>
                </div>
                <div className="metric-card">
                  <h3>Sharpe Ratio</h3>
                  <p className="metric-value">{metrics.portfolio_metrics.sharpe_ratio.toFixed(4)}</p>
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
                    <p className="metric-value">{metrics.metrics.mae.toFixed(4)}</p>
                    <p className="metric-label">Prediction Accuracy</p>
                  </div>
                  <div className="metric-card">
                    <h3>Mean Squared Error</h3>
                    <p className="metric-value">{metrics.metrics.mse.toFixed(4)}</p>
                    <p className="metric-label">Model Performance</p>
                  </div>
                  <div className="metric-card">
                    <h3>Root Mean Squared Error</h3>
                    <p className="metric-value">{metrics.metrics.rmse.toFixed(4)}</p>
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