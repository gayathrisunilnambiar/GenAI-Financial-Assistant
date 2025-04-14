import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserIcon from '../components/UserIcon';
import './PortfolioAnalysis.css';
import axios from 'axios';

interface StockAnalysis {
  ticker: string;
  weight: number;
  expectedReturn: number;
  volatility: number;
}

interface PortfolioSummary {
  total_expected_return: number;
  total_volatility: number;
}

interface PortfolioAnalysisResult {
  portfolio_analysis: StockAnalysis[];
  portfolio_summary: PortfolioSummary;
}

interface StockInput {
  ticker: string;
  weight: number;
}

const PortfolioAnalysis: React.FC = () => {
  const { currentUser, loading, logout } = useAuth();
  const [analysis, setAnalysis] = useState<PortfolioAnalysisResult | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stocks, setStocks] = useState<StockInput[]>([
    { ticker: 'AAPL', weight: 0.3 },
    { ticker: 'MSFT', weight: 0.3 },
    { ticker: 'GOOGL', weight: 0.4 }
  ]);
  const [period, setPeriod] = useState('1y');

  const handleStockChange = (index: number, field: keyof StockInput, value: string | number) => {
    const newStocks = [...stocks];
    if (field === 'weight') {
      newStocks[index][field] = typeof value === 'string' ? parseFloat(value) : value as number;
    } else {
      newStocks[index][field] = value as string;
    }
    setStocks(newStocks);
  };

  const addStock = () => {
    setStocks([...stocks, { ticker: '', weight: 0 }]);
  };

  const removeStock = (index: number) => {
    setStocks(stocks.filter((_, i) => i !== index));
  };

  const analyzePortfolio = async () => {
    try {
      // Mock API response - replace with actual API call
      const mockResponse = {
        portfolio_analysis: stocks.map(stock => ({
          ticker: stock.ticker,
          weight: stock.weight,
          expectedReturn: Math.random() * 0.2,
          volatility: Math.random() * 0.1
        })),
        portfolio_summary: {
          total_expected_return: stocks.reduce((sum, stock) => sum + (stock.weight * 0.1), 0),
          total_volatility: stocks.reduce((sum, stock) => sum + (stock.weight * 0.05), 0)
        }
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return mockResponse;
      
      /* Actual API call would look like:
      const response = await axios.post('http://localhost:5000/analyze_portfolio', {
        stocks: stocks,
        time_period: period
      });
      return response.data;
      */
    } catch (error) {
      console.error('API Error:', error);
      throw new Error('Failed to analyze portfolio. Please try again later.');
    }
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

      const result = await analyzePortfolio();
      setAnalysis(result);
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

  const formatPercent = (value: number) => {
    return (value * 100).toFixed(2) + '%';
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
                <option value="1wk">1 Week</option>
                <option value="1mo">1 Month</option>
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

          {analysis && (
            <div className="results-section">
              <div className="portfolio-summary">
                <h3>Portfolio Summary</h3>
                <div className="metrics-grid">
                  <div className="metric-card">
                    <h3>Expected Return</h3>
                    <p className="metric-value">
                      {formatPercent(analysis.portfolio_summary.total_expected_return)}
                    </p>
                  </div>
                  <div className="metric-card">
                    <h3>Volatility</h3>
                    <p className="metric-value">
                      {formatPercent(analysis.portfolio_summary.total_volatility)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="stock-analysis">
                <h3>Stock Performance</h3>
                <div className="analysis-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Ticker</th>
                        <th>Weight</th>
                        <th>Expected Return</th>
                        <th>Volatility</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.portfolio_analysis.map((stock, index) => (
                        <tr key={index}>
                          <td>{stock.ticker}</td>
                          <td>{formatPercent(stock.weight)}</td>
                          <td>{formatPercent(stock.expectedReturn)}</td>
                          <td>{formatPercent(stock.volatility)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default PortfolioAnalysis;