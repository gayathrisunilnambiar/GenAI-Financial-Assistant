// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserIcon from '../components/UserIcon';
import './Dashboard.css';
import {
  fetchMarketOverview,
  fetchPortfolioData,
  fetchWatchlistData,
  fetchRecommendationsData,
  fetchSectorPerformanceData,
} from '../api/ycommerceApi';

interface StockAnalysis {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  recommendation: string;
  confidence: number;
  data: number[];
  analysis: {
    technical: string;
    fundamental: string;
    sentiment: string;
  };
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, loading, logout } = useAuth();
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState<StockAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [marketFilter, setMarketFilter] = useState<'stocks' | 'crypto' | 'forex'>('stocks');

  // Sample stock data for demonstration
  const sampleStocks: { [key: string]: StockAnalysis } = {
    'AAPL': {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      currentPrice: 175.34,
      change: 2.5,
      recommendation: 'BUY',
      confidence: 85,
      data: [170, 172, 171, 173, 174, 175, 174, 175, 176, 175],
      analysis: {
        technical: 'Strong uptrend with increasing volume. RSI indicates potential for further growth.',
        fundamental: 'Strong financials with consistent revenue growth. High profit margins.',
        sentiment: 'Positive market sentiment with increasing institutional interest.'
      }
    },
    'MSFT': {
      symbol: 'MSFT',
      name: 'Microsoft Corp.',
      currentPrice: 328.39,
      change: 1.8,
      recommendation: 'HOLD',
      confidence: 75,
      data: [325, 326, 327, 326, 328, 327, 328, 329, 328, 328],
      analysis: {
        technical: 'Consolidating in a range. MACD shows potential for breakout.',
        fundamental: 'Stable growth with strong cloud business. Moderate valuation.',
        sentiment: 'Neutral to positive sentiment with steady institutional holdings.'
      }
    },
    'GOOGL': {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      currentPrice: 142.56,
      change: 3.2,
      recommendation: 'STRONG BUY',
      confidence: 90,
      data: [140, 141, 142, 141, 142, 143, 142, 143, 142, 142],
      analysis: {
        technical: 'Breaking out of resistance with strong momentum.',
        fundamental: 'Dominant market position with high growth potential.',
        sentiment: 'Very positive sentiment with increasing analyst upgrades.'
      }
    },
    'AMZN': {
      symbol: 'AMZN',
      name: 'Amazon.com Inc.',
      currentPrice: 178.75,
      change: 1.5,
      recommendation: 'BUY',
      confidence: 80,
      data: [177, 178, 177, 178, 179, 178, 179, 178, 179, 178],
      analysis: {
        technical: 'Breaking out of consolidation pattern.',
        fundamental: 'Strong e-commerce and cloud business growth.',
        sentiment: 'Positive sentiment with improving margins.'
      }
    },
    'META': {
      symbol: 'META',
      name: 'Meta Platforms',
      currentPrice: 485.58,
      change: 2.1,
      recommendation: 'HOLD',
      confidence: 70,
      data: [480, 482, 483, 484, 483, 484, 485, 484, 485, 485],
      analysis: {
        technical: 'Trading in a range with support at $480.',
        fundamental: 'Strong advertising revenue but facing regulatory challenges.',
        sentiment: 'Mixed sentiment with focus on AI investments.'
      }
    },
    'TSLA': {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      currentPrice: 175.22,
      change: -1.2,
      recommendation: 'HOLD',
      confidence: 65,
      data: [178, 177, 176, 175, 174, 175, 176, 175, 174, 175],
      analysis: {
        technical: 'Testing support levels after recent decline.',
        fundamental: 'Strong EV market position but facing increased competition.',
        sentiment: 'Cautious sentiment due to market conditions.'
      }
    },
    'NVDA': {
      symbol: 'NVDA',
      name: 'NVIDIA Corp.',
      currentPrice: 950.02,
      change: 4.5,
      recommendation: 'STRONG BUY',
      confidence: 95,
      data: [910, 920, 925, 930, 935, 940, 945, 950, 945, 950],
      analysis: {
        technical: 'Strong uptrend with increasing volume.',
        fundamental: 'Dominant position in AI and gaming markets.',
        sentiment: 'Very positive sentiment with strong growth outlook.'
      }
    }
  };

  // Add crypto data
  const cryptoData = {
    'BTC': {
      symbol: 'BTC',
      name: 'Bitcoin',
      currentPrice: 65000.45,
      change: 3.2,
      recommendation: 'BUY',
      confidence: 80,
      data: [63000, 63500, 64000, 64500, 65000, 64500, 65000, 65500, 65000, 65000],
      analysis: {
        technical: 'Breaking out of resistance with strong momentum.',
        fundamental: 'Increasing institutional adoption and ETF inflows.',
        sentiment: 'Positive sentiment with halving event approaching.'
      }
    },
    'ETH': {
      symbol: 'ETH',
      name: 'Ethereum',
      currentPrice: 3500.75,
      change: 2.8,
      recommendation: 'BUY',
      confidence: 75,
      data: [3400, 3420, 3440, 3460, 3480, 3500, 3480, 3500, 3520, 3500],
      analysis: {
        technical: 'Consolidating before potential breakout.',
        fundamental: 'Strong DeFi and NFT ecosystem growth.',
        sentiment: 'Positive sentiment with upcoming upgrades.'
      }
    },
    'SOL': {
      symbol: 'SOL',
      name: 'Solana',
      currentPrice: 120.45,
      change: 5.1,
      recommendation: 'STRONG BUY',
      confidence: 85,
      data: [115, 116, 117, 118, 119, 120, 119, 120, 121, 120],
      analysis: {
        technical: 'Breaking out with strong volume.',
        fundamental: 'Fast-growing ecosystem with increasing adoption.',
        sentiment: 'Very positive sentiment with strong developer activity.'
      }
    }
  };

  // Add forex data
  const forexData = {
    'EUR/USD': {
      symbol: 'EUR/USD',
      name: 'Euro / US Dollar',
      currentPrice: 1.0850,
      change: 0.2,
      recommendation: 'HOLD',
      confidence: 60,
      data: [1.0830, 1.0835, 1.0840, 1.0845, 1.0850, 1.0845, 1.0850, 1.0855, 1.0850, 1.0850],
      analysis: {
        technical: 'Trading in a tight range.',
        fundamental: 'Mixed economic signals from both regions.',
        sentiment: 'Neutral sentiment with focus on central bank policies.'
      }
    },
    'GBP/USD': {
      symbol: 'GBP/USD',
      name: 'British Pound / US Dollar',
      currentPrice: 1.2650,
      change: -0.1,
      recommendation: 'HOLD',
      confidence: 65,
      data: [1.2660, 1.2655, 1.2650, 1.2645, 1.2650, 1.2645, 1.2650, 1.2655, 1.2650, 1.2650],
      analysis: {
        technical: 'Testing support levels.',
        fundamental: 'UK economic recovery showing signs of strength.',
        sentiment: 'Cautious sentiment with Brexit concerns.'
      }
    },
    'USD/JPY': {
      symbol: 'USD/JPY',
      name: 'US Dollar / Japanese Yen',
      currentPrice: 151.25,
      change: 0.3,
      recommendation: 'SELL',
      confidence: 70,
      data: [151.00, 151.05, 151.10, 151.15, 151.20, 151.25, 151.20, 151.25, 151.30, 151.25],
      analysis: {
        technical: 'Approaching resistance levels.',
        fundamental: 'BOJ policy uncertainty affecting market.',
        sentiment: 'Bearish sentiment with intervention risks.'
      }
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const stock = sampleStocks[searchQuery.toUpperCase()];
      if (stock) {
        setSelectedStock(stock);
      } else {
        setError('Company not found. Please try another symbol.');
      }
    } catch (err) {
      setError('Error fetching stock data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, loading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      const portfolio = await fetchPortfolioData();
      setPortfolioData(portfolio);
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
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
          <Link to="/dashboard" className="nav-item active">Dashboard</Link>
          <Link to="/assistant" className="nav-item">Assistant</Link>
          <UserIcon />
          <button onClick={handleLogout} className="nav-item logout-btn">Logout</button>
        </nav>
      </header>

      <main className="dashboard-content">
        <section className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter company symbol (e.g., AAPL, MSFT)"
              className="search-input"
            />
            <button type="submit" className="search-button" disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </form>
          {error && <div className="error-message">{error}</div>}
        </section>

        {/* Market Overview Section */}
        <section className="market-section">
          <div className="section-header">
            <h3>Market Overview</h3>
            <div className="market-filters">
              <button 
                className={`market-btn ${marketFilter === 'stocks' ? 'active' : ''}`}
                onClick={() => setMarketFilter('stocks')}
              >
                Stocks
              </button>
              <button 
                className={`market-btn ${marketFilter === 'crypto' ? 'active' : ''}`}
                onClick={() => setMarketFilter('crypto')}
              >
                Crypto
              </button>
              <button 
                className={`market-btn ${marketFilter === 'forex' ? 'active' : ''}`}
                onClick={() => setMarketFilter('forex')}
              >
                Forex
              </button>
            </div>
          </div>
          
          <div className="market-grid">
            {marketFilter === 'stocks' && Object.values(sampleStocks).map((stock) => (
              <div 
                key={stock.symbol} 
                className="market-card"
                onClick={() => {
                  setSelectedStock(stock);
                  setSearchQuery(stock.symbol);
                }}
              >
                <div className="market-info">
                  <div className="market-name">
                    {stock.symbol}
                    <span className="company-name">{stock.name}</span>
                  </div>
                  <div className="market-value">${stock.currentPrice.toLocaleString()}</div>
                  <div className={`market-change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.change}%
                  </div>
                </div>
              </div>
            ))}
            
            {marketFilter === 'crypto' && Object.values(cryptoData).map((crypto) => (
              <div 
                key={crypto.symbol} 
                className="market-card"
                onClick={() => {
                  setSelectedStock(crypto);
                  setSearchQuery(crypto.symbol);
                }}
              >
                <div className="market-info">
                  <div className="market-name">
                    {crypto.symbol}
                    <span className="company-name">{crypto.name}</span>
                  </div>
                  <div className="market-value">${crypto.currentPrice.toLocaleString()}</div>
                  <div className={`market-change ${crypto.change >= 0 ? 'positive' : 'negative'}`}>
                    {crypto.change >= 0 ? '+' : ''}{crypto.change}%
                  </div>
                </div>
              </div>
            ))}
            
            {marketFilter === 'forex' && Object.values(forexData).map((forex) => (
              <div 
                key={forex.symbol} 
                className="market-card"
                onClick={() => {
                  setSelectedStock(forex);
                  setSearchQuery(forex.symbol);
                }}
              >
                <div className="market-info">
                  <div className="market-name">
                    {forex.symbol}
                    <span className="company-name">{forex.name}</span>
                  </div>
                  <div className="market-value">{forex.currentPrice.toFixed(4)}</div>
                  <div className={`market-change ${forex.change >= 0 ? 'positive' : 'negative'}`}>
                    {forex.change >= 0 ? '+' : ''}{forex.change}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {selectedStock && (
          <section className="analysis-section">
            <div className="stock-header">
              <div className="stock-info">
                <h2>{selectedStock.symbol}</h2>
                <p className="company-name">{selectedStock.name}</p>
              </div>
              <div className="stock-price">
                <span className="price">${selectedStock.currentPrice}</span>
                <span className={`change ${selectedStock.change >= 0 ? 'positive' : 'negative'}`}>
                  {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change}%
                </span>
              </div>
            </div>

            <div className="chart-container">
              <svg className="line-chart" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path
                  d={selectedStock.data.map((value, i) => {
                    const x = (i / (selectedStock.data.length - 1)) * 100;
                    const y = 100 - ((value - Math.min(...selectedStock.data)) / 
                      (Math.max(...selectedStock.data) - Math.min(...selectedStock.data))) * 100;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  stroke="#007bff"
                  strokeWidth="1"
                  fill="none"
                />
              </svg>
            </div>

            <div className="recommendation-box">
              <h3>Investment Recommendation</h3>
              <div className={`recommendation ${selectedStock.recommendation.toLowerCase()}`}>
                <span className="recommendation-text">{selectedStock.recommendation}</span>
                <span className="confidence">Confidence: {selectedStock.confidence}%</span>
              </div>
            </div>

            <div className="analysis-details">
              <div className="analysis-section">
                <h4>Technical Analysis</h4>
                <p>{selectedStock.analysis.technical}</p>
              </div>
              <div className="analysis-section">
                <h4>Fundamental Analysis</h4>
                <p>{selectedStock.analysis.fundamental}</p>
              </div>
              <div className="analysis-section">
                <h4>Market Sentiment</h4>
                <p>{selectedStock.analysis.sentiment}</p>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;