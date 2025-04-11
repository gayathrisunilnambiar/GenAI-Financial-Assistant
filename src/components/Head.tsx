// components/Header.tsx
import React from 'react';
import './Header.css'; // Optional, for custom styling

const Header = () => {
  return (
    <div className="logo-container">
      <div className="bot-icon">
        <i className="fas fa-robot"></i>
      </div>
      <h1>FinBot</h1>
    </div>
  );
};

export default Header;
