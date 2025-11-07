
import React from 'react';

interface TabButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, icon, isActive, onClick }) => {
  const baseClasses =
    'flex items-center gap-2 sm:gap-3 px-4 py-2.5 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500';
  const activeClasses = 'bg-sky-500 text-white shadow-lg scale-105';
  const inactiveClasses = 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white';

  return (
    <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
        {icon}
      </svg>
      {label}
    </button>
  );
};

export default TabButton;
