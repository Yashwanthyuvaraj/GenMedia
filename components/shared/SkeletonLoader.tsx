import React from 'react';

const SkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="h-4 bg-slate-700/80 rounded w-3/4 shimmer relative overflow-hidden"></div>
      <div className="h-4 bg-slate-700/80 rounded w-full shimmer relative overflow-hidden"></div>
      <div className="h-4 bg-slate-700/80 rounded w-full shimmer relative overflow-hidden"></div>
      <div className="h-4 bg-slate-700/80 rounded w-5/6 shimmer relative overflow-hidden"></div>
    </div>
  );
};

export default SkeletonLoader;