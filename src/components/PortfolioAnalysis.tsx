import React, { useState } from 'react';

interface StockWeight {
  [key: string]: number;
}

interface PortfolioAnalysis {
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  prediction: number;
  mse: number;
  rmse: number;
  mae: number;
}

const PortfolioAnalysis: React.FC = () => {
  const [weights, setWeights] = useState<StockWeight>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PortfolioAnalysis | null>(null);

  const analyzePortfolio = async () => {
    try {
      setLoading(true);
      setError(null);
      setAnalysis(null);

      // Validate weights
      const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
      if (Math.abs(totalWeight - 1) > 0.01) {
        setError('Portfolio weights must sum to 1 (100%)');
        setLoading(false);
        return;
      }

      // Prepare the request payload
      const payload = {
        stocks: Object.entries(weights).map(([ticker, weight]) => ({
          ticker,
          weight
        }))
      };

      // Make the API request with proper CORS headers
      const response = await fetch('http://localhost:5000/analyze-portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'http://localhost:3000'
        },
        mode: 'cors',
        credentials: 'include', // Include credentials for CORS
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze portfolio');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error analyzing portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portfolio-analysis">
      <h2>Portfolio Analysis</h2>
      {error && <div className="error">{error}</div>}
      {loading && <div>Loading...</div>}
      {analysis && (
        <div className="analysis-results">
          <h3>Analysis Results</h3>
          <p>Expected Return: {analysis.expectedReturn.toFixed(2)}%</p>
          <p>Volatility: {analysis.volatility.toFixed(2)}%</p>
          <p>Sharpe Ratio: {analysis.sharpeRatio.toFixed(2)}</p>
          <p>Prediction: {analysis.prediction.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
};

export default PortfolioAnalysis; 