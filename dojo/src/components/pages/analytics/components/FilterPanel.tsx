import React from 'react';
import type { FilterOptions } from '../types/production';

interface FilterPanelProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange }) => {
  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-xl">
      <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">Analytics Filters</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">HQ</label>
          <select 
            value={filters.hq}
            onChange={(e) => handleFilterChange('hq', e.target.value)}
            className="w-full rounded-xl border-slate-200 shadow-md focus:border-indigo-500 focus:ring-indigo-500 focus:ring-2 transition-all duration-300 bg-white/90 backdrop-blur-sm"
          >
            <option value="KML">KML</option>
            <option value="TML">TML</option>
            <option value="BML">BML</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Factory</label>
          <select 
            value={filters.factory}
            onChange={(e) => handleFilterChange('factory', e.target.value)}
            className="w-full rounded-xl border-slate-200 shadow-md focus:border-indigo-500 focus:ring-indigo-500 focus:ring-2 transition-all duration-300 bg-white/90 backdrop-blur-sm"
          >
            <option value="KML Factory 1">KML Factory 1</option>
            <option value="KML Factory 2">KML Factory 2</option>
            <option value="KML Factory 3">KML Factory 3</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
          <select 
            value={filters.department}
            onChange={(e) => handleFilterChange('department', e.target.value)}
            className="w-full rounded-xl border-slate-200 shadow-md focus:border-indigo-500 focus:ring-indigo-500 focus:ring-2 transition-all duration-300 bg-white/90 backdrop-blur-sm"
          >
            <option value="Department 1">Department 1</option>
            <option value="Department 2">Department 2</option>
            <option value="Department 3">Department 3</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Line</label>
          <select 
            value={filters.line}
            onChange={(e) => handleFilterChange('line', e.target.value)}
            className="w-full rounded-xl border-slate-200 shadow-md focus:border-indigo-500 focus:ring-indigo-500 focus:ring-2 transition-all duration-300 bg-white/90 backdrop-blur-sm"
          >
            <option value="">All Lines</option>
            <option value="Line A">Line A</option>
            <option value="Line B">Line B</option>
            <option value="Line C">Line C</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Subline</label>
          <select 
            value={filters.subline}
            onChange={(e) => handleFilterChange('subline', e.target.value)}
            className="w-full rounded-xl border-slate-200 shadow-md focus:border-indigo-500 focus:ring-indigo-500 focus:ring-2 transition-all duration-300 bg-white/90 backdrop-blur-sm"
          >
            <option value="">All Sublines</option>
            <option value="Subline 1">Subline 1</option>
            <option value="Subline 2">Subline 2</option>
            <option value="Subline 3">Subline 3</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Station</label>
          <select 
            value={filters.station}
            onChange={(e) => handleFilterChange('station', e.target.value)}
            className="w-full rounded-xl border-slate-200 shadow-md focus:border-indigo-500 focus:ring-indigo-500 focus:ring-2 transition-all duration-300 bg-white/90 backdrop-blur-sm"
          >
            <option value="">All Stations</option>
            <option value="Station 1">Station 1</option>
            <option value="Station 2">Station 2</option>
            <option value="Station 3">Station 3</option>
          </select>
        </div>
      </div>
    </div>
  );
};