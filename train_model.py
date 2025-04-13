import yfinance as yf
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from sklearn.metrics import mean_absolute_error, mean_squared_error
import time

# Function to fetch stock data with retry mechanism
def get_stock_data(ticker, period="10y", retries=3, delay=5):
    attempt = 0
    while attempt < retries:
        try:
            print(f"[INFO] Fetching data for {ticker}...")
            # Try using yf.Ticker as an alternative
            stock = yf.Ticker(ticker)
            data = stock.history(period=period, auto_adjust=True)
            
            if data.empty:
                print(f"[WARNING] No data returned for {ticker}. Trying yf.download...")
                data = yf.download(ticker, period=period, auto_adjust=True)
                if data.empty:
                    raise ValueError(f"[ERROR] No data returned for ticker: {ticker}")
            
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
        except Exception as e:
            print(f"[ERROR] Attempt {attempt + 1} failed: {e}")
            attempt += 1
            if attempt < retries:
                print(f"[INFO] Retrying in {delay} seconds...")
                time.sleep(delay)
            else:
                print(f"[ERROR] All retries failed for {ticker}.")
                return pd.DataFrame()  # Return empty DataFrame if retries fail

# Example usage
ticker = "AAPL"
data = get_stock_data(ticker)

# Ensure the data is not empty before proceeding
if data.empty:
    print("[ERROR] No valid data retrieved, exiting...")
    exit()

# Normalize the data
scaler = MinMaxScaler(feature_range=(0, 1))
price_col = "Adj Close" if "Adj Close" in data.columns else "Close"
scaled_data = scaler.fit_transform(data[[price_col, 'Returns', 'Volatility', '50_MA', '200_MA']])

# Function to create sequences for LSTM model
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

# Convert predictions and true values back to original scale
predictions_rescaled = scaler.inverse_transform(
    np.concatenate((predictions, np.zeros((predictions.shape[0], 4))), axis=1)
)[:, 0]

Y_test_rescaled = scaler.inverse_transform(
    np.concatenate((Y_test.reshape(-1, 1), np.zeros((Y_test.shape[0], 4))), axis=1)
)[:, 0]

# Optionally save the model and scaler
model.save("lstm_model.h5")
import joblib
joblib.dump(scaler, "scaler.save")
