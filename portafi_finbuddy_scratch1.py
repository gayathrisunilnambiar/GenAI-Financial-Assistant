import streamlit as st
import requests
from portfolio_lstm import analyze_portfolio

# Load API Key
GROQ_API_KEY = "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"

# Streamlit page setup
st.set_page_config(page_title="PortaFi FinBuddy 💬", page_icon="💰", layout="centered")
st.title("💰 PortaFi FinBuddy")
st.markdown("Your friendly financial assistant. Ask anything about SIPs, mutual funds, or investing in India!")

# Initialize chat history
if "chat_history" not in st.session_state:
    st.session_state.chat_history = [
        {
            "role": "system",
            "content": (
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
                "Always be friendly and informative. Use relatable analogies or simple examples if needed.\n\n"
                "Even if the question is vague or incomplete, do your best to infer intent and provide an educational answer."
            )
        }
    ]

# Function to call Groq API
def ask_groq(messages):
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    body = {
        "model": "llama3-8b-8192",
        "messages": messages
    }

    response = requests.post(url, headers=headers, json=body)
    response.raise_for_status()
    reply = response.json()["choices"][0]["message"]["content"]
    return reply.strip()

# Portfolio Analysis Section
st.sidebar.title("Portfolio Analysis")
stocks = st.sidebar.text_input("Enter stock tickers (comma-separated)", "AAPL,MSFT,GOOGL")
weights = st.sidebar.text_input("Enter weights (comma-separated)", "0.3,0.3,0.4")
period = st.sidebar.selectbox("Select time period", ["1d", "1w", "1m", "1y"])

if st.sidebar.button("Analyze Portfolio"):
    try:
        stocks_list = [s.strip() for s in stocks.split(",")]
        weights_list = [float(w.strip()) for w in weights.split(",")]
        
        if len(stocks_list) != len(weights_list):
            st.sidebar.error("Number of stocks and weights must match!")
        else:
            result = analyze_portfolio(stocks_list, weights_list, period)
            
            st.sidebar.subheader("Portfolio Analysis Results")
            st.sidebar.write(f"Predicted Next Value: ${result['prediction']:.2f}")
            st.sidebar.write("Model Performance Metrics:")
            st.sidebar.write(f"MSE: {result['metrics']['mse']:.4f}")
            st.sidebar.write(f"RMSE: {result['metrics']['rmse']:.4f}")
            st.sidebar.write(f"MAE: {result['metrics']['mae']:.4f}")
    except Exception as e:
        st.sidebar.error(f"Error in portfolio analysis: {str(e)}")

# Display chat history like ChatGPT
for message in st.session_state.chat_history[1:]:  # skip system message
    if message["role"] == "user":
        with st.chat_message("user"):
            st.markdown(message["content"])
    elif message["role"] == "assistant":
        with st.chat_message("assistant"):
            st.markdown(message["content"])

# Input for new message at bottom
user_prompt = st.chat_input("Ask me anything...")

# On new message
if user_prompt:
    st.session_state.chat_history.append({"role": "user", "content": user_prompt})
    with st.chat_message("user"):
        st.markdown(user_prompt)

    with st.chat_message("assistant"):
        with st.spinner("FinBuddy is thinking..."):
            try:
                response = ask_groq(st.session_state.chat_history)
                st.session_state.chat_history.append({"role": "assistant", "content": response})
                st.markdown(response)
            except Exception as e:
                st.error("❌ Error: Could not fetch response. Please check your internet or API key.")
