import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 sm:p-8 ${className}`}>
      <div className="absolute -inset-px bg-gradient-to-r from-sky-500 to-indigo-500 rounded-2xl opacity-30"></div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Card;