import axios, { AxiosError } from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Unable to connect to the server. Please check if the backend is running.');
    }
    throw error;
  }
);

export const chatWithAssistant = async (message: string) => {
  try {
    const response = await api.post('/chat', { message });
    return response.data;
  } catch (error) {
    console.error('Error in chat:', error);
    throw error;
  }
};

export const analyzePortfolio = async (tickers: string[], prices: number[][], windowSize: number) => {
  try {
    const response = await api.post('/portfolio-analysis', {
      tickers,
      prices,
      window_size: windowSize
    });
    return response.data;
  } catch (error) {
    console.error('Error in portfolio analysis:', error);
    throw error;
  }
};

export const checkServerHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Error checking server health:', error);
    throw error;
  }
};

export const fetchMarketData = async () => {
  try {
    const response = await api.get('/market-data');
    return response.data;
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw error;
  }
}; 