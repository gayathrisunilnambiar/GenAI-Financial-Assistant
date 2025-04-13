from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yfinance as yf
import torch
import numpy as np
from groq import Groq
import joblib
import os
from dotenv import load_dotenv
load_dotenv()

import sys
import logging
logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)

import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # Suppress TensorFlow info and warning messages
import tensorflow as tf
tf.get_logger().setLevel('ERROR')  # Further suppress warnings

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

from tensorflow.keras.models import load_model
import joblib

model = load_model("lstm_model.h5")
model.compile(optimizer="adam", loss="mse")
scaler = joblib.load("scaler.save")

scaler = joblib.load("scaler.save")

# Constants for Groq
MODEL = "llama3-8b-8192"
SYSTEM_PROMPT = (
    "You are FinBot, a helpful and beginner-friendly financial assistant for Indian users. "
    "Your role is to explain personal finance concepts in a clear, concise, and engaging way — especially for beginners. "
    "Do not provide personalized financial advice, only general educational information.\n\n"
    "You specialize in:\n"
    "- SIPs (Systematic Investment Plans)\n"
    "- Mutual funds\n"
    "- Stock market basics\n"
    "- Risk profiles\n"
    "- Investment options for beginners\n"
    "- Tax-saving instruments in India\n\n"
    "Always be friendly and informative. Use relatable analogies or simple examples if needed. "
    "Even if the question is vague or incomplete, do your best to infer intent and provide an educational answer."
)

# Pydantic models for request/response schemas
class ChatRequest(BaseModel):
    message: str
    context: list[dict] = []

class PortfolioRequest(BaseModel):
    tickers: list[str]
    start_date: str
    end_date: str

class StockRequest(BaseModel):
    ticker: str
    start_date: str
    end_date: str

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/chat")
async def chat(request: ChatRequest):
    context = request.context[-5:] if request.context else []

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in context:
        messages.append({"role": msg["role"], "content": msg["content"]})

    user_message = request.message.strip()
    vague_responses = ["yes", "ok", "okay", "sure", "yeah", "yep"]
    if user_message.lower() in vague_responses:
        messages.append({"role": "user", "content": "Please continue or tell me more about what you just explained."})
    else:
        messages.append({"role": "user", "content": user_message})

    response = groq_client.chat.completions.create(
        model=MODEL,
        messages=messages,
        temperature=0.7
    )

    reply = response.choices[0].message.content.strip()
    return {"reply": reply}

@app.post("/analyze_portfolio")
async def analyze_portfolio(request: PortfolioRequest):
    portfolio_data = []

    for ticker in request.tickers:
        df = yf.download(ticker, start=request.start_date, end=request.end_date)
        if df.empty:
            continue
        df = df[["Close"]]
        df = df.values
        df = scaler.transform(df)
        seq_length = 10
        sequences = [df[i:i + seq_length] for i in range(len(df) - seq_length)]
        sequences = torch.tensor(sequences).float()
        with torch.no_grad():
            predictions = model(sequences)
        predictions = predictions.numpy()
        predictions = scaler.inverse_transform(predictions)
        returns = np.diff(predictions.squeeze()) / predictions[:-1].squeeze()
        volatility = np.std(returns)
        expected_return = np.mean(returns)

        portfolio_data.append({
            "ticker": ticker,
            "expected_return": expected_return,
            "volatility": volatility
        })

    return {"portfolio_analysis": portfolio_data}

@app.post("/get_stock_data")
async def get_stock_data(request: StockRequest):
    df = yf.download(request.ticker, start=request.start_date, end=request.end_date)
    if df.empty:
        return {"error": "No data found for ticker."}
    return df.reset_index().to_dict(orient="records")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend:app",
        host="0.0.0.0",
        port=5000,
        reload=True,
        log_level="info",  # <-- This ensures logs appear
        access_log=True   # <-- Shows HTTP requests
    )

