import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`aurora-card relative bg-slate-900/80 backdrop-blur-lg rounded-2xl shadow-2xl p-6 sm:p-8 ${className}`}>
      <div className="absolute -inset-px bg-gradient-to-r from-sky-500/50 to-indigo-500/50 rounded-2xl opacity-50 blur-sm"></div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Card;