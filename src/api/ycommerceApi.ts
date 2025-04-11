// Market Indices (NIFTY, SENSEX, etc.)
export const fetchMarketIndices = async () => {
  return [
    { id: '1', name: 'NIFTY 50', currentValue: 22356.25, change: 110.5, percentChange: 0.5 },
    { id: '2', name: 'SENSEX', currentValue: 73289.25, change: -95.3, percentChange: -0.13 },
    { id: '3', name: 'BANK NIFTY', currentValue: 47890.15, change: 230.1, percentChange: 0.48 }
  ];
};

// Trending Stocks (optional, if needed)
export const fetchTrendingStocks = async () => {
  return [
    { id: '1', ticker: 'INFY', name: 'Infosys', price: 1450.25, change: 15.2, percentChange: 1.06 },
    { id: '2', ticker: 'RELI', name: 'Reliance', price: 2505.10, change: -25.3, percentChange: -1.00 },
    { id: '3', ticker: 'TCS', name: 'Tata Consultancy', price: 3150.0, change: 50.0, percentChange: 1.6 }
  ];
};

// Latest News
export const fetchLatestNews = async (limit = 5) => {
  return new Array(limit).fill(0).map((_, i) => ({
    id: `${i}`,
    title: `Market Update #${i + 1}`,
    summary: 'Quick summary of the news item',
    source: 'Economic Times',
    imageUrl: '/assets/news.jpg',
    publishedAt: new Date().toISOString(),
    url: 'https://example.com/news'
  }));
};

// Market Overview (can be reused or removed if redundant)
export const fetchMarketOverview = async () => {
  return [
    { name: 'NIFTY 50', value: 17500 },
    { name: 'BANK NIFTY', value: 38500 },
  ];
};

// ✅ Correctly formatted portfolio data for Dashboard
export const fetchPortfolioData = async () => {
  return {
    value: 120000,
    dayChange: 1500,
    dayChangePercent: 1.27,
    returnValue: 20000,
    returnPercent: 20.0,
    holdings: [
      { ticker: 'INFY', value: 40000 },
      { ticker: 'TCS', value: 50000 },
      { ticker: 'RELIANCE', value: 30000 },
    ]
  };
};

// ✅ Watchlist Data with proper info
export const fetchWatchlistData = async () => {
  return [
    { ticker: 'INFY', price: 1450.25, change: 15.2, percentChange: 1.06 },
    { ticker: 'TCS', price: 3150.0, change: 50.0, percentChange: 1.6 },
    { ticker: 'RELIANCE', price: 2505.10, change: -25.3, percentChange: -1.00 },
    { ticker: 'HDFCBANK', price: 1625.50, change: 12.5, percentChange: 0.78 }
  ];
};

// ✅ Recommendations Data
export const fetchRecommendationsData = async () => {
  return [
    { ticker: 'ITC', rating: 'Buy' },
    { ticker: 'HCLTECH', rating: 'Hold' }
  ];
};

// ✅ Sector Performance Data
export const fetchSectorPerformanceData = async () => {
  return [
    { name: 'Tech', value: 8.3 },
    { name: 'Energy', value: -1.5 },
    { name: 'Finance', value: 3.7 }
  ];
};
