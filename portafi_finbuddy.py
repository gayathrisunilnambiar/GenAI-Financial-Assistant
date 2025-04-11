import streamlit as st
import requests
import os

# Load Groq API key
GROQ_API_KEY = "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"

# Streamlit app layout
st.set_page_config(page_title="FinBot 💰", page_icon="💬", layout="centered")
st.title("💰 PortaFi FinBuddy - Your Financial Buddy")
st.markdown("Ask me anything about SIPs, mutual funds, stocks, or investments in India!")

# User input
user_input = st.text_input("Ask a question", placeholder="e.g. What is a SIP?")

# Send request to Groq API
def ask_groq(question):
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    body = {
    "model": "llama3-8b-8192",  # you can try mixtral-8x7b too
    "messages": [
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

                "Here are some example user questions you should understand and respond to effectively:\n"
                "- What is SIP?\n"
                "- SIP vs mutual fund\n"
                "- How do mutual funds work?\n"
                "- Can I invest in stocks directly?\n"
                "- What is a risk profile?\n"
                "- How much should I invest monthly?\n"
                "- What are low-risk investment options?\n"
                "- Best tax-saving investments in India\n"
                "- Difference between FD and SIP\n"
                "- Is SIP good for students?\n"
                "- What returns can I expect from mutual funds?\n"
                "- Can I stop SIP anytime?\n"
                "- Are SIPs safe?\n\n"

                "Even if the question is vague, casually worded, or incomplete, do your best to infer intent and provide an informative answer."
            )
        },
        {
            "role": "user",
            "content": question
        }
    ]
}


    response = requests.post(url, headers=headers, json=body)
    reply = response.json()["choices"][0]["message"]["content"]
    return reply.strip()

# Trigger on input
if user_input:
    with st.spinner("PortaFi FinBuddy is thinking..."):
        try:
            response = ask_groq(user_input)
            st.markdown("#### 🤖 PortaFi FinBuddy says:")
            st.success(response)
        except Exception as e:
            st.error("Something went wrong. Check your API key or internet.")
