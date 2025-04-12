from flask import Flask, request, jsonify
from flask_cors import CORS
import yfinance as yf
import numpy as np
import json
import pandas as pd
import logging
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from groq import Groq
import config

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": config.ALLOWED_ORIGINS,
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept"],
        "supports_credentials": True
    }
})

# Initialize Groq client
try:
    client = Groq(api_key="gsk_1234567890abcdefghijklmnopqrstuvwxyz")  # Replace this with your actual API key
except Exception as e:
    logger.error(f"Failed to initialize Groq client: {str(e)}")
    client = None

@app.before_request
def before_request():
    logger.info(f"Incoming request: {request.method} {request.url}")
    logger.info(f"Headers: {request.headers}")
    if request.method == 'POST':
        logger.info(f"Request data: {request.get_data()}")

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    logger.info(f"Response status: {response.status}")
    return response

@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({"status": "ok", "message": "Backend is running"})

@app.route('/health', methods=['GET'])
def health_check():
    logger.info("Health check endpoint called")
    return jsonify({"status": "healthy", "message": "Backend is running"})

@app.route('/chat', methods=['POST'])
def chat():
    try:
        logger.info("Chat endpoint called")
        data = request.get_json()
        logger.info(f"Received data: {data}")
        
        if not data or 'message' not in data:
            logger.error("Invalid request format")
            return jsonify({"error": "Invalid request format"}), 400
            
        user_message = data['message'].lower()
        
        # System message for FinBot
        system_message = """You are FinBot, a helpful and beginner-friendly financial assistant for Indian users. 
Your role is to explain personal finance concepts in a clear, concise, and engaging way — especially for beginners. 
Do not provide personalized financial advice, only general educational information.

You specialize in:
- SIPs (Systematic Investment Plans)
- Mutual funds
- Stock market basics
- Risk profiles
- Investment options for beginners
- Tax-saving instruments in India

Always be friendly and informative. Use relatable analogies or simple examples if needed.

Even if the question is vague or incomplete, do your best to infer intent and provide an educational answer."""
        
        # Define comparison keywords and their corresponding topics
        comparison_keywords = {
            'vs': 'comparison',
            'versus': 'comparison',
            'compare': 'comparison',
            'difference': 'comparison',
            'better': 'comparison',
            'which': 'comparison'
        }
        
        # Define financial topics and their comparisons
        financial_topics = {
            'sip': {
                'vs': {
                    'lumpsum': """📊 SIP vs Lump Sum Investment Comparison

🔍 Overview:
- SIP: Systematic Investment Plan
- Lump Sum: One-time investment

📈 Key Differences:

1️⃣ Cost Averaging
   └─ SIP: Spreads investment over time, reducing impact of market volatility
   └─ Lump Sum: Single investment at current market price

2️⃣ Market Timing
   └─ SIP: No need to time the market
   └─ Lump Sum: Requires good market timing

3️⃣ Risk Management
   └─ SIP: Lower risk due to regular investments
   └─ Lump Sum: Higher risk due to single investment

4️⃣ Returns
   └─ SIP: Potentially lower returns in rising markets
   └─ Lump Sum: Higher returns in rising markets

5️⃣ Flexibility
   └─ SIP: Can adjust amount and frequency
   └─ Lump Sum: One-time commitment

💡 Recommendation:
- SIP: Best for regular income earners and long-term goals
- Lump Sum: Suitable for those with large capital and market knowledge

❓ Which approach suits your investment goals better?""",
                    'mutual fund': """📊 SIP vs Mutual Fund Comparison

🔍 Overview:
- SIP: A systematic way to invest in mutual funds
- Mutual Fund: The actual investment product

📈 Key Differences:

1️⃣ Investment Approach
   └─ SIP: Systematic investment method
   └─ Mutual Fund: Investment product

2️⃣ Investment Frequency
   └─ SIP: Regular, fixed intervals (monthly/quarterly)
   └─ Mutual Fund: Flexible timing (anytime)

3️⃣ Risk Management
   └─ SIP: Reduces market timing risk
   └─ Mutual Fund: Risk varies by type

4️⃣ Cost Structure
   └─ SIP: No additional cost
   └─ Mutual Fund: Has expense ratio

5️⃣ Flexibility
   └─ SIP: Fixed amount at intervals
   └─ Mutual Fund: Any amount anytime

6️⃣ Suitability
   └─ SIP: Regular income earners
   └─ Mutual Fund: All investors

7️⃣ Market Impact
   └─ SIP: Less affected by volatility
   └─ Mutual Fund: Direct market impact

8️⃣ Investment Discipline
   └─ SIP: Enforces regular habits
   └─ Mutual Fund: Requires self-discipline

💡 Recommendation:
- SIP: Best for disciplined, long-term investing
- Mutual Fund: Flexible for all investment styles

❓ Would you like to know more about specific types of mutual funds that work well with SIP?"""
                }
            },
            'mutual fund': {
                'vs': {
                    'stocks': """📊 Mutual Funds vs Direct Stock Investment

🔍 Overview:
- Mutual Funds: Pooled investment vehicle
- Stocks: Direct company ownership

📈 Key Differences:

1️⃣ Risk Management
   └─ Mutual Funds: Diversified portfolio
   └─ Stocks: Single company risk

2️⃣ Expertise Required
   └─ Mutual Funds: Professional management
   └─ Stocks: Personal market knowledge

3️⃣ Investment Amount
   └─ Mutual Funds: Start with small amounts
   └─ Stocks: May need larger capital

4️⃣ Time Commitment
   └─ Mutual Funds: Passive investment
   └─ Stocks: Active monitoring needed

5️⃣ Returns
   └─ Mutual Funds: Market-linked, diversified
   └─ Stocks: Potentially higher but volatile

💡 Recommendation:
- Mutual Funds: Best for beginners and passive investors
- Stocks: Suitable for experienced investors

❓ Which aligns better with your investment style?"""
                }
            },
            'portfolio': {
                'vs': {
                    'single': """📊 Diversified Portfolio vs Single Investment

🔍 Overview:
- Portfolio: Multiple investments
- Single: One investment focus

📈 Key Differences:

1️⃣ Risk Distribution
   └─ Portfolio: Spreads risk across assets
   └─ Single: Concentrated risk

2️⃣ Return Potential
   └─ Portfolio: Balanced returns
   └─ Single: Higher potential but volatile

3️⃣ Market Impact
   └─ Portfolio: Less affected by swings
   └─ Single: Highly sensitive to changes

4️⃣ Management
   └─ Portfolio: Requires rebalancing
   └─ Single: Simpler to manage

5️⃣ Growth
   └─ Portfolio: Steady, long-term growth
   └─ Single: Faster growth potential

💡 Recommendation:
- Portfolio: Best for risk-averse investors
- Single: Suitable for focused investors

❓ Which approach matches your risk tolerance?"""
                }
            }
        }
        
        # Check for comparison queries
        is_comparison = any(keyword in user_message for keyword in comparison_keywords)
        
        if is_comparison:
            # Extract topics for comparison
            topics = []
            for topic in financial_topics:
                if topic in user_message:
                    topics.append(topic)
            
            if len(topics) >= 2:
                # If two topics are mentioned, compare them
                reply = f"Comparing {topics[0]} and {topics[1]}:\n\n"
                if topics[0] in financial_topics and 'vs' in financial_topics[topics[0]]:
                    if topics[1] in financial_topics[topics[0]]['vs']:
                        reply += financial_topics[topics[0]]['vs'][topics[1]]
                    else:
                        reply += f"I can help you compare {topics[0]} with other investment options. Would you like to know more about specific comparisons?"
            else:
                # If only one topic is mentioned, show its comparisons
                topic = topics[0] if topics else None
                if topic and 'vs' in financial_topics[topic]:
                    comparisons = list(financial_topics[topic]['vs'].keys())
                    reply = f"I can compare {topic} with: {', '.join(comparisons)}. Which comparison would you like to see?"
                else:
                    reply = "I can help you compare different investment options. Please specify which ones you'd like to compare."
        else:
            # Regular topic-based responses
            responses = {
                'sip': """📊 Systematic Investment Plan (SIP)

🔍 What is SIP?
A systematic way to invest fixed amounts at regular intervals in mutual funds or other instruments.

📈 Key Benefits:

1️⃣ Rupee Cost Averaging
   └─ Buy more units when prices are low
   └─ Buy fewer units when prices are high

2️⃣ Disciplined Investing
   └─ Regular savings habit
   └─ Systematic approach

3️⃣ Power of Compounding
   └─ Long-term growth
   └─ Reinvestment of returns

4️⃣ Flexibility
   └─ Start with small amounts
   └─ Adjust as per capacity

5️⃣ Convenience
   └─ Automatic deductions
   └─ Hassle-free investing

💡 Recommendation:
- Best for regular income earners
- Ideal for long-term financial goals

❓ Would you like to know more about starting a SIP or compare it with other investment options?""",
                
                'mutual fund': """📊 Mutual Funds

🔍 What are Mutual Funds?
Investment vehicles that pool money from multiple investors to create a diversified portfolio.

📈 Key Aspects:

1️⃣ Professional Management
   └─ Experienced fund managers
   └─ Expert decision-making

2️⃣ Diversification
   └─ Spreads risk
   └─ Multiple securities

3️⃣ Liquidity
   └─ Easy to buy/sell
   └─ Quick access to funds

4️⃣ Variety
   └─ Equity funds
   └─ Debt funds
   └─ Hybrid funds

5️⃣ Transparency
   └─ Regular updates
   └─ Performance tracking

💡 Recommendation:
- Suitable for all investors
- Various options available

❓ Would you like to know about specific types of mutual funds or compare them with other investment options?""",
                
                'stock market': """📊 Stock Market

🔍 What is the Stock Market?
A platform for buying and selling shares of publicly traded companies.

📈 Important Aspects:

1️⃣ Primary Market
   └─ New share issues
   └─ IPOs

2️⃣ Secondary Market
   └─ Trading existing shares
   └─ Market liquidity

3️⃣ Market Indices
   └─ NIFTY
   └─ SENSEX

4️⃣ Trading Hours
   └─ Regular market
   └─ After-hours trading

5️⃣ Risk Factors
   └─ Market volatility
   └─ Company performance
   └─ Economic conditions

💡 Recommendation:
- Requires market knowledge
- Higher risk, higher potential returns

❓ Would you like to know more about specific aspects of the stock market or compare it with other investment options?""",
                
                'portfolio': """📊 Portfolio Management

🔍 What is a Portfolio?
A collection of investments held by an individual or institution.

📈 Key Concepts:

1️⃣ Diversification
   └─ Spread investments
   └─ Risk management

2️⃣ Asset Allocation
   └─ Different asset classes
   └─ Balance risk/return

3️⃣ Risk Management
   └─ Portfolio balance
   └─ Risk assessment

4️⃣ Rebalancing
   └─ Regular adjustments
   └─ Maintain strategy

5️⃣ Performance Tracking
   └─ Monitor returns
   └─ Make adjustments

💡 Recommendation:
- Regular review needed
- Professional guidance helpful

❓ Would you like to know more about portfolio construction or compare different portfolio strategies?""",
                
                'risk profile': """📊 Understanding Risk Profile

🔍 What is a Risk Profile?
Your risk profile is a measure of your willingness and ability to take risks in investments. It helps determine suitable investment options.

📈 Key Components:

1️⃣ Risk Tolerance
   └─ Your emotional comfort with market fluctuations
   └─ How much loss you can handle
   └─ Your investment time horizon

2️⃣ Risk Capacity
   └─ Your financial ability to take risks
   └─ Based on income, expenses, and financial goals
   └─ Your age and life stage

3️⃣ Risk Types
   └─ Market Risk: Price fluctuations
   └─ Credit Risk: Default risk
   └─ Liquidity Risk: Ease of selling
   └─ Inflation Risk: Purchasing power loss

4️⃣ Risk Categories
   └─ Conservative: Low risk, stable returns
   └─ Moderate: Balanced risk and return
   └─ Aggressive: High risk, potential high returns

5️⃣ Assessment Factors
   └─ Investment goals
   └─ Time horizon
   └─ Financial situation
   └─ Past investment experience

💡 Recommendation:
- Start with a risk assessment questionnaire
- Align investments with your risk profile
- Review profile periodically

❓ Would you like to know more about assessing your risk profile or suitable investments for different risk profiles?""",
                
                'default': """👋 Welcome to PortaFi Financial Assistant!

I can help you with:

📊 Investment Options
   └─ Explain different types
   └─ Compare strategies

📈 Risk & Returns
   └─ Understand risk factors
   └─ Evaluate returns

💼 Portfolio Management
   └─ Construction guidance
   └─ Strategy comparison

❓ Please ask me about any specific topic or comparison you're interested in."""
            }
            
            # Determine the appropriate response
            reply = responses['default']
            for topic in responses:
                if topic in user_message or (topic == 'risk profile' and ('risk' in user_message and 'profile' in user_message)):
                    reply = responses[topic]
                    break
        
        response = {
            "reply": reply,
            "status": "success"
        }
        
        logger.info(f"Sending response: {response}")
        return jsonify(response)
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

def fetch_single_stock(args):
    ticker, period = args
    try:
        logger.debug(f"Fetching data for {ticker}")
        data = yf.download(
            ticker,
            period=period,
            progress=False,
            timeout=5,
            interval="1d"
        )
        
        if data is None or data.empty:
            logger.error(f"No data found for {ticker}")
            return None
            
        if 'Close' not in data.columns:
            logger.error(f"Missing 'Close' column for {ticker}")
            return None
            
        close_prices = data['Close'].values.astype(float)
        if len(close_prices) < 2:
            logger.error(f"Not enough data points for {ticker}")
            return None
            
        return ticker, close_prices
    except Exception as e:
        logger.error(f"Error fetching {ticker}: {str(e)}")
        return None

def get_stock_data(tickers, period='1y'):
    stocks_data = {}
    with ThreadPoolExecutor(max_workers=min(len(tickers), 5)) as executor:
        future_to_ticker = {
            executor.submit(fetch_single_stock, (ticker, period)): ticker 
            for ticker in tickers
        }
        
        for future in as_completed(future_to_ticker):
            result = future.result()
            if result is not None:
                ticker, data = result
                stocks_data[ticker] = data
    
    return stocks_data

def calculate_portfolio_metrics(stocks_data, weights):
    try:
        logger.debug(f"Calculating metrics for {len(stocks_data)} stocks")
        
        # Calculate portfolio returns
        min_length = min(len(data) for data in stocks_data.values())
        portfolio_returns = np.zeros(min_length)
        
        for ticker, data in stocks_data.items():
            weight = weights[ticker]
            portfolio_returns += data[:min_length] * weight
        
        # Calculate basic metrics
        returns = np.diff(portfolio_returns) / portfolio_returns[:-1]
        expected_return = np.mean(returns) * 252  # Annualized
        volatility = np.std(returns) * np.sqrt(252)  # Annualized
        sharpe_ratio = expected_return / volatility if volatility != 0 else 0
        
        # Simple prediction (last value)
        prediction = portfolio_returns[-1]
        
        return {
            'expectedReturn': float(expected_return),
            'volatility': float(volatility),
            'sharpeRatio': float(sharpe_ratio),
            'prediction': float(prediction),
            'mse': 0.0,  # Placeholder
            'rmse': 0.0,  # Placeholder
            'mae': 0.0   # Placeholder
        }
    except Exception as e:
        logger.error(f"Error in calculate_portfolio_metrics: {str(e)}")
        raise Exception(f"Error calculating metrics: {str(e)}")

@app.route('/analyze-portfolio', methods=['GET', 'POST', 'OPTIONS'])
def analyze_portfolio_endpoint():
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        return response

    try:
        logger.info(f"Request method: {request.method}")
        logger.info(f"Request headers: {request.headers}")
        logger.info(f"Request data: {request.get_data()}")
        
        # Initialize variables
        tickers = []
        weights = {}
        period = '1y'
        
        # Get parameters from either query string (GET) or JSON body (POST)
        if request.method == 'GET':
            stocks_str = request.args.get('stocks', '[]')
            try:
                stocks = json.loads(stocks_str)
                if isinstance(stocks, list):
                    weights = {s['ticker']: s['weight'] for s in stocks}
                    tickers = list(weights.keys())
            except json.JSONDecodeError:
                return jsonify({'error': 'Invalid JSON format for stocks'}), 400
        else:  # POST
            try:
                data = request.get_json()
                logger.info(f"Received POST data: {data}")
                
                if not isinstance(data, dict):
                    return jsonify({'error': 'Invalid request body format'}), 400
                
                # Handle the new format: { stocks: [{ticker: "AAPL", weight: 0.3}] }
                stocks = data.get('stocks', [])
                if not isinstance(stocks, list):
                    return jsonify({'error': 'Stocks must be an array'}), 400
                    
                weights = {s['ticker']: s['weight'] for s in stocks}
                tickers = list(weights.keys())
                period = data.get('period', '1y')
            except Exception as e:
                logger.error(f"Error parsing request data: {str(e)}")
                return jsonify({'error': f'Error parsing request data: {str(e)}'}), 400

        if not tickers:
            return jsonify({'error': 'No stocks provided'}), 400
            
        logger.info(f"Processing stocks: {tickers}")
        logger.info(f"With weights: {weights}")
        logger.info(f"Period: {period}")
        
        # Fetch stock data in parallel
        stocks_data = get_stock_data(tickers, period)
        if not stocks_data:
            return jsonify({'error': 'Failed to fetch data for any stocks'}), 400
        
        # Calculate metrics
        result = calculate_portfolio_metrics(stocks_data, weights)
        logger.info(f"Calculated metrics: {result}")
        
        response = jsonify(result)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {str(e)}")
        return jsonify({'error': 'Invalid JSON format for stocks'}), 400
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    logger.info("Starting backend server...")
    app.run(host='0.0.0.0', port=5000, debug=True)
 