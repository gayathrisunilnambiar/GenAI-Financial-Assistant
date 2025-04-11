import numpy as np
import pandas as pd
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.optimizers import Adam
import tensorflow as tf

class PortfolioLSTMModel:
    def __init__(self, sequence_length=60):
        self.sequence_length = sequence_length
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        self.model = None
        
    def prepare_data(self, stock_data):
        # Scale the data
        scaled_data = self.scaler.fit_transform(stock_data.reshape(-1, 1))
        
        # Create sequences
        X, y = [], []
        for i in range(len(scaled_data) - self.sequence_length):
            X.append(scaled_data[i:(i + self.sequence_length)])
            y.append(scaled_data[i + self.sequence_length])
            
        return np.array(X), np.array(y)
    
    def build_model(self):
        model = Sequential([
            LSTM(50, return_sequences=True, input_shape=(self.sequence_length, 1)),
            Dropout(0.2),
            LSTM(50, return_sequences=False),
            Dropout(0.2),
            Dense(25),
            Dense(1)
        ])
        
        model.compile(optimizer=Adam(learning_rate=0.001), loss='mse')
        return model
    
    def train(self, stock_data, epochs=50, batch_size=32):
        X, y = self.prepare_data(stock_data)
        self.model = self.build_model()
        
        # Split into train and validation
        train_size = int(len(X) * 0.8)
        X_train, X_val = X[:train_size], X[train_size:]
        y_train, y_val = y[:train_size], y[train_size:]
        
        history = self.model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=epochs,
            batch_size=batch_size,
            verbose=0
        )
        
        return history
    
    def predict(self, stock_data):
        if self.model is None:
            raise ValueError("Model not trained yet")
            
        # Prepare the last sequence for prediction
        scaled_data = self.scaler.transform(stock_data.reshape(-1, 1))
        last_sequence = scaled_data[-self.sequence_length:]
        last_sequence = last_sequence.reshape(1, self.sequence_length, 1)
        
        # Make prediction
        scaled_prediction = self.model.predict(last_sequence)
        prediction = self.scaler.inverse_transform(scaled_prediction)
        
        return prediction[0][0]
    
    def evaluate(self, stock_data):
        X, y = self.prepare_data(stock_data)
        predictions = self.model.predict(X)
        predictions = self.scaler.inverse_transform(predictions)
        y = self.scaler.inverse_transform(y)
        
        mse = np.mean((predictions - y) ** 2)
        rmse = np.sqrt(mse)
        mae = np.mean(np.abs(predictions - y))
        
        return {
            'mse': mse,
            'rmse': rmse,
            'mae': mae
        }

def get_stock_data(ticker, period='1y'):
    stock = yf.Ticker(ticker)
    data = stock.history(period=period)
    return data['Close'].values

def analyze_portfolio(stocks, weights, period='1y'):
    # Get data for all stocks
    stock_data = {}
    for ticker in stocks:
        stock_data[ticker] = get_stock_data(ticker, period)
    
    # Create portfolio returns
    min_length = min(len(data) for data in stock_data.values())
    portfolio_returns = np.zeros(min_length)
    
    for ticker, weight in zip(stocks, weights):
        data = stock_data[ticker][-min_length:]
        portfolio_returns += data * weight
    
    # Train LSTM model
    model = PortfolioLSTMModel()
    model.train(portfolio_returns)
    
    # Make prediction
    prediction = model.predict(portfolio_returns)
    
    # Calculate metrics
    metrics = model.evaluate(portfolio_returns)
    
    return {
        'prediction': prediction,
        'metrics': metrics
    } 