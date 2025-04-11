import yfinance as yf
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from sklearn.metrics import mean_absolute_error, mean_squared_error

# Fetch historical stock data with additional features
#def get_stock_data(ticker, period="5y"):
    #data = yf.download(ticker, period=period, auto_adjust=True)
    #data['Returns'] = data['Adj Close'].pct_change()
    #data['Volatility'] = data['Returns'].rolling(window=10).std()
    #data['50_MA'] = data['Adj Close'].rolling(window=50).mean()
    #data['200_MA'] = data['Adj Close'].rolling(window=200).mean()
    #data.dropna(inplace=True)
    #return data

def get_stock_data(ticker, period="10y"):
    data = yf.download(ticker, period=period, auto_adjust=True)

    # Ensure we have the correct price column
    price_col = "Adj Close" if "Adj Close" in data.columns else "Close"

    # Compute additional features
    data['Returns'] = data[price_col].pct_change()
    data['Volatility'] = data['Returns'].rolling(window=10).std()
    data['50_MA'] = data[price_col].rolling(window=50).mean()
    data['200_MA'] = data[price_col].rolling(window=200).mean()

    # Drop NaN values
    data.dropna(inplace=True)

    return data

# Example usage
ticker = "AAPL"
data = get_stock_data(ticker)

# Normalize data
scaler = MinMaxScaler(feature_range=(0, 1))
price_col = "Adj Close" if "Adj Close" in data.columns else "Close"
scaled_data = scaler.fit_transform(data[[price_col, 'Returns', 'Volatility', '50_MA', '200_MA']])

def create_sequences(data, time_step=60):
    X, Y = [], []
    for i in range(len(data) - time_step):
        X.append(data[i : i + time_step])
        Y.append(data[i + time_step, 0])  # Predicting Adj Close
    return np.array(X), np.array(Y)

# Prepare training data
time_step = 60
X, Y = create_sequences(scaled_data, time_step)
X = np.reshape(X, (X.shape[0], X.shape[1], X.shape[2]))

# Train-test split
train_size = int(len(X) * 0.8)
X_train, Y_train = X[:train_size], Y[:train_size]
X_test, Y_test = X[train_size:], Y[train_size:]

# Define improved LSTM Model
model = Sequential([
    LSTM(100, return_sequences=True, input_shape=(time_step, X.shape[2])),
    Dropout(0.2),
    LSTM(100, return_sequences=False),
    Dropout(0.2),
    Dense(50, activation='relu'),
    Dense(1)
])

# Compile Model
model.compile(optimizer="adam", loss="mean_squared_error")

# Train Model
model.fit(X_train, Y_train, epochs=50, batch_size=32, validation_data=(X_test, Y_test))

# Predict on Test Data
predictions = model.predict(X_test)

# Convert back to original scale
predictions = scaler.inverse_transform(
    np.concatenate((predictions, np.zeros((predictions.shape[0], 4))), axis=1)
)[:, 0]

Y_test_rescaled = scaler.inverse_transform(
    np.concatenate((Y_test.reshape(-1, 1), np.zeros((Y_test.shape[0], 4))), axis=1)
)[:, 0]

# Evaluation Metrics
mae = mean_absolute_error(Y_test_rescaled, predictions)
mse = mean_squared_error(Y_test_rescaled, predictions)
rmse = np.sqrt(mse)

print(f"📊 Mean Absolute Error (MAE): {mae:.4f}")
print(f"📊 Mean Squared Error (MSE): {mse:.4f}")
print(f"📊 Root Mean Squared Error (RMSE): {rmse:.4f}")

# Portfolio Analysis
portfolio_weights = {"AAPL": 0.2, "MSFT": 0.3, "GOOGL": 0.25, "AMZN": 0.15, "TSLA": 0.1}
returns = {ticker: get_stock_data(ticker)['Returns'] for ticker in portfolio_weights.keys()}
returns_df = pd.DataFrame(returns).dropna()
portfolio_return = (returns_df * list(portfolio_weights.values())).sum(axis=1).mean()
portfolio_volatility = returns_df.mul(list(portfolio_weights.values()), axis=1).sum(axis=1).std()
sharpe_ratio = portfolio_return / portfolio_volatility

print("\n📈 Portfolio Analysis:")
print(f"✅ Expected Portfolio Return: {portfolio_return:.4f}")
print(f"✅ Portfolio Volatility: {portfolio_volatility:.4f}")
print(f"✅ Sharpe Ratio: {sharpe_ratio:.4f}")
