import React from 'react';

const SkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="h-4 bg-slate-700 rounded w-3/4 animate-pulse"></div>
      <div className="h-4 bg-slate-700 rounded w-full animate-pulse"></div>
      <div className="h-4 bg-slate-700 rounded w-full animate-pulse"></div>
      <div className="h-4 bg-slate-700 rounded w-5/6 animate-pulse"></div>
    </div>
  );
};

export default SkeletonLoader;