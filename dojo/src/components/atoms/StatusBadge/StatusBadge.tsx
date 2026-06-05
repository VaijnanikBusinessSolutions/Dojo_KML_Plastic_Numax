import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const isPass = status.toLowerCase() === 'pass';
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
      isPass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {status.toUpperCase()}
    </span>
  );
};