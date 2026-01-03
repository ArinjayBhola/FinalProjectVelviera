import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-soft';
  
  const variants = {
    primary: 'bg-[var(--brand-primary)] text-[var(--background-base)] hover:opacity-90 focus:ring-[var(--brand-primary)]',
    secondary: 'bg-[var(--background-subtle)] text-[var(--text-base)] border border-[var(--border-base)] hover:bg-[var(--border-base)] focus:ring-[var(--brand-secondary)]',
    ghost: 'bg-transparent text-[var(--text-base)] hover:bg-[var(--background-subtle)] focus:ring-[var(--brand-secondary)]',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
