import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext'; // 👈 Import this

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <AuthProvider> {/* ✅ MUST wrap App */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);
