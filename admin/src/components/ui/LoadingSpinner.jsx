import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = "md", color = "var(--brand-primary)" }) => {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4"
  };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className={`${sizes[size]} border-t-transparent rounded-full`}
        style={{ borderColor: `${color} transparent transparent transparent`, borderStyle: 'solid' }}
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 1,
          ease: "linear"
        }}
      />
    </div>
  );
};

export default LoadingSpinner;
