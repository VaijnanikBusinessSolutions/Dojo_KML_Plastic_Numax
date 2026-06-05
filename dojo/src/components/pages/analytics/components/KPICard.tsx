import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: React.ReactNode;
  suffix?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  suffix = ''
}) => {
  const getTrendIcon = () => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case 'decrease':
        return <TrendingDown className="w-4 h-4 text-rose-500" />;
      default:
        return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-emerald-500 font-semibold';
      case 'decrease':
        return 'text-rose-500 font-semibold';
      default:
        return 'text-slate-500';
    }
  };

  return (
    <div className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:from-white/95 hover:to-white/80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">{title}</h3>
        {icon && <div className="text-indigo-600 drop-shadow-sm">{icon}</div>}
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-1">
            {value}{suffix}
          </p>
          {change !== undefined && (
            <div className={`flex items-center text-sm ${getChangeColor()}`}>
              {getTrendIcon()}
              <span className="ml-1">{Math.abs(change)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};