import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      style={{
        fontSize: '1.6rem',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        zIndex: 10
      }}
      aria-label="Toggle theme"
    >
      {darkMode ? '🌞' : '🌙'}
    </button>
  );
};

export default ThemeToggle;
