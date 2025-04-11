from flask import Flask, request, jsonify
from flask_cors import CORS
import yfinance as yf
import numpy as np
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def calculate_portfolio_metrics(stocks_data, weights):
    # Calculate portfolio returns
    portfolio_returns = np.zeros(len(stocks_data[0]))
    for data, weight in zip(stocks_data, weights):
        portfolio_returns += data * weight
    
    # Calculate basic metrics
    returns = np.diff(portfolio_returns) / portfolio_returns[:-1]
    expected_return = np.mean(returns) * 252  # Annualized
    volatility = np.std(returns) * np.sqrt(252)  # Annualized
    sharpe_ratio = expected_return / volatility if volatility != 0 else 0
    
    # Simple prediction (last value)
    prediction = portfolio_returns[-1]
    
    return {
        'expectedReturn': expected_return,
        'volatility': volatility,
        'sharpeRatio': sharpe_ratio,
        'prediction': prediction,
        'mse': 0.0,  # Placeholder
        'rmse': 0.0,  # Placeholder
        'mae': 0.0   # Placeholder
    }

@app.route('/analyze-portfolio', methods=['GET'])
def analyze_portfolio_endpoint():
    try:
        # Get parameters from query string
        stocks = json.loads(request.args.get('stocks', '[]'))
        period = request.args.get('period', '1y')
        
        # Extract tickers and weights
        tickers = [stock['ticker'] for stock in stocks]
        weights = [stock['weight'] for stock in stocks]
        
        # Fetch stock data
        stocks_data = []
        for ticker in tickers:
            stock = yf.Ticker(ticker)
            data = stock.history(period=period)
            stocks_data.append(data['Close'].values)
        
        # Calculate metrics
        result = calculate_portfolio_metrics(stocks_data, weights)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 