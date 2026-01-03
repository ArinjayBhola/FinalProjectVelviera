import React from 'react';

const Card = ({ children, className = '', padding = true }) => {
  return (
    <div className={`bg-[var(--background-base)] border border-[var(--border-base)] rounded-soft shadow-soft ${padding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
