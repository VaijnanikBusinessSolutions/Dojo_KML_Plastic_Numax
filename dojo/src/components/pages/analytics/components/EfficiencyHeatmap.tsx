import React from 'react';
import type { ProductionData } from '../types/production';

interface EfficiencyHeatmapProps {
  data: ProductionData[];
}

export const EfficiencyHeatmap: React.FC<EfficiencyHeatmapProps> = ({ data }) => {
  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg';
    if (efficiency >= 80) return 'bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-md';
    if (efficiency >= 70) return 'bg-gradient-to-br from-amber-400 to-amber-500 shadow-md';
    if (efficiency >= 60) return 'bg-gradient-to-br from-orange-400 to-orange-500 shadow-md';
    return 'bg-gradient-to-br from-rose-400 to-rose-500 shadow-md';
  };

  const calculateLineEfficiency = (lineData: { l1: number; l2: number; l3: number; l4: number }) => {
    const total = lineData.l1 + lineData.l2 + lineData.l3 + lineData.l4;
    const maxPossible = Math.max(lineData.l1, lineData.l2, lineData.l3, lineData.l4) * 4;
    return maxPossible > 0 ? (total / maxPossible) * 100 : 0;
  };

  const categories = ['CTQ', 'PDI', 'OTHER'];
  const lines = ['L1', 'L2', 'L3', 'L4'];

  return (
    <div className="bg-gradient-to-br from-white/90 to-emerald-50/80 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-2xl">
      <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-6">Efficiency Heatmap</h3>
      
      <div className="overflow-hidden">
        <div className="grid grid-cols-5 gap-1 mb-4">
          <div></div>
          {lines.map(line => (
            <div key={line} className="text-center text-sm font-bold text-slate-700 py-2">
              {line}
            </div>
          ))}
        </div>
        
        {categories.map(category => (
          <div key={category} className="grid grid-cols-5 gap-1 mb-1">
            <div className="text-sm font-bold text-slate-800 py-3 flex items-center">
              {category}
            </div>
            {lines.map(line => {
              const latestData = data[data.length - 1];
              if (!latestData) return <div key={line} className="w-full h-12 bg-gray-200 rounded"></div>;
              
              const lineKey = line.toLowerCase() as 'l1' | 'l2' | 'l3' | 'l4';
              const categoryKey = category.toLowerCase() as 'ctq' | 'pdi' | 'other';
              const value = latestData[categoryKey][lineKey];
              const efficiency = (value / 250) * 100; // Assuming max capacity of 250
              
              return (
                <div
                  key={line}
                  className={`w-full h-12 rounded-lg flex items-center justify-center text-white text-sm font-bold transition-all duration-300 hover:scale-110 cursor-pointer border border-white/20 ${getEfficiencyColor(efficiency)}`}
                  title={`${category} ${line}: ${value} units (${efficiency.toFixed(1)}% efficiency)`}
                >
                  {efficiency.toFixed(0)}%
                </div>
              );
            })}
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-center mt-6 space-x-4 text-xs font-semibold text-slate-600">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gradient-to-br from-rose-400 to-rose-500 rounded-full mr-2 shadow-sm"></div>
          <span>&lt;60%</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full mr-2 shadow-sm"></div>
          <span>60-69%</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full mr-2 shadow-sm"></div>
          <span>70-79%</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full mr-2 shadow-sm"></div>
          <span>80-89%</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full mr-2 shadow-sm"></div>
          <span>≥90%</span>
        </div>
      </div>
    </div>
  );
};