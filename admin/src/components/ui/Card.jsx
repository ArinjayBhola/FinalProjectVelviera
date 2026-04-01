import React from 'react';

const Card = ({ children, className = '', padding = true, variant = 'default' }) => {
  const variants = {
    default: 'bg-[var(--background-base)] border-[var(--border-base)] shadow-soft',
    glass: 'bg-white/70 backdrop-blur-md border-white/20 shadow-xl dark:bg-black/40 dark:border-white/10'
  };

  return (
    <div className={`border rounded-soft ${variants[variant]} ${padding ? 'p-6 md:p-8' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
