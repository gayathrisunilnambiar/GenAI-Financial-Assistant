import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Groq API Configuration
GROQ_API_KEY = "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"

# Backend Configuration
BACKEND_HOST = '0.0.0.0'
BACKEND_PORT = 5000

# CORS Configuration
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://192.168.75.248:3000",
    "http://localhost:8000",
    "http://127.0.0.1:5173",
    "http://192.168.75.248:5173"
] 