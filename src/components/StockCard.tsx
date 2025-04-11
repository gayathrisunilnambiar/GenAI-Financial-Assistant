import React from 'react';
import './stockcard.css';

type StockCardProps = {
  ticker: string;
  name: string;
  price: number;
  change: number;
  percentChange: number;
  volume: number;
};

const StockCard: React.FC<StockCardProps> = ({
  ticker,
  name,
  price,
  change,
  percentChange,
  volume,
}) => {
  const isPositive = change >= 0;

  return (
    <div className={`stock-card ${isPositive ? 'positive' : 'negative'}`}>
      <div className="stock-header">
        <div className="ticker">{ticker}</div>
        <div className="name">{name}</div>
      </div>
      <div className="stock-price">₹{price.toFixed(2)}</div>
      <div className={`stock-change ${isPositive ? 'up' : 'down'}`}>
        {isPositive ? '+' : ''}
        ₹{change.toFixed(2)} ({percentChange.toFixed(2)}%)
      </div>
      <div className="stock-volume">Vol: {volume.toLocaleString()}</div>
    </div>
  );
};

export default StockCard;
