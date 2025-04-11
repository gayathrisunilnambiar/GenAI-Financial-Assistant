import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './UserIcon.css';

const UserIcon: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleClick = () => {
    if (currentUser) {
      // If user is logged in, show dropdown or navigate to profile
      navigate('/dashboard');
    } else {
      // If user is not logged in, navigate to login
      navigate('/login');
    }
  };

  return (
    <div className="user-icon-container" onClick={handleClick}>
      {currentUser ? (
        <div className="user-icon">
          <span className="user-initial">
            {currentUser.email.charAt(0).toUpperCase()}
          </span>
        </div>
      ) : (
        <button className="login-button">Login</button>
      )}
    </div>
  );
};

export default UserIcon; 