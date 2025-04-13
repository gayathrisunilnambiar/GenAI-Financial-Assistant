import yfinance as yf
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import load_model
import joblib

def get_stock_data(ticker, start_date, end_date):
    df = yf.download(ticker, start=start_date, end=end_date, auto_adjust=True)
    price_col = "Adj Close" if "Adj Close" in df.columns else "Close"
    df['Returns'] = df[price_col].pct_change()
    df['Volatility'] = df['Returns'].rolling(window=10).std()
    df['50_MA'] = df[price_col].rolling(window=50).mean()
    df['200_MA'] = df[price_col].rolling(window=200).mean()
    df.dropna(inplace=True)
    return df, price_col

def analyze_stock(ticker, start_date, end_date):
    model = load_model("lstm_model.h5")
    scaler = joblib.load("scaler.save")

    df, price_col = get_stock_data(ticker, start_date, end_date)
    data = scaler.transform(df[[price_col, 'Returns', 'Volatility', '50_MA', '200_MA']])

    time_step = 60
    sequences = []
    for i in range(len(data) - time_step):
        sequences.append(data[i:i + time_step])
    sequences = np.array(sequences)

    predictions = model.predict(sequences)
    predictions = np.concatenate((predictions, np.zeros((predictions.shape[0], 4))), axis=1)
    predictions = scaler.inverse_transform(predictions)[:, 0]

    returns = np.diff(predictions) / predictions[:-1]
    return {
        "expected_return": float(np.mean(returns)),
        "volatility": float(np.std(returns)),
        "ticker": ticker
    }
