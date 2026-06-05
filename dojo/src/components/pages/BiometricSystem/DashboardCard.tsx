import React from 'react';

interface DashboardCardProps {
  value: number | string;
  label: string;
  color: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ value, label, color }) => (
  <div className={`rounded-xl px-8 py-6 shadow-lg flex flex-col items-start w-64 h-32 ${color}`}>
    <div className="text-3xl font-bold">{value}</div>
    <div className="text-sm font-semibold mt-7">{label}</div>
  </div>
);

export default DashboardCard;