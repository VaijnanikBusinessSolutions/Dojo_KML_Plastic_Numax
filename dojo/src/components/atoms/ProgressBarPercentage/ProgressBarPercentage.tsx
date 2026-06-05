import React from 'react';

interface ProgressBarProps {
  progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => (
  <div className="h-2 bg-gradient-to-r from-gray-100 to-gray-200 relative overflow-hidden">
    <div
      className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 transition-all duration-700 ease-out relative"
      style={{ width: `${progress}%` }}
    >
      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
    </div>
  </div>
);