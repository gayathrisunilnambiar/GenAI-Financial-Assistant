from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
import numpy as np
import pandas as pd
from portfolio_lstm import analyze_portfolio

app = Flask(__name__)
CORS(app)

@app.route('/analyze-portfolio', methods=['POST'])
def analyze_portfolio_endpoint():
    try:
        data = request.get_json()
        stocks = data.get('stocks', [])
        weights = data.get('weights', [])
        period = data.get('period', '1y')
        
        if not stocks or not weights:
            return jsonify({"error": "Stocks and weights are required"}), 400
            
        if len(stocks) != len(weights):
            return jsonify({"error": "Number of stocks and weights must match"}), 400
            
        if not all(0 <= w <= 1 for w in weights):
            return jsonify({"error": "Weights must be between 0 and 1"}), 400
            
        if abs(sum(weights) - 1.0) > 0.01:  # Allow small floating point error
            return jsonify({"error": "Weights must sum to 1"}), 400
            
        result = analyze_portfolio(stocks, weights, period)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 