import React from 'react';
import { Search, Filter } from 'lucide-react';

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  departmentFilter: string;
  onDepartmentChange: (department: string) => void;
  evaluationFilter: string;
  onEvaluationChange: (evaluation: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  departments: Array<{department_id: number; department_name: string}>;
  evaluationTypes: string[];
  isLoading?: boolean;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  onSearchChange,
  departmentFilter,
  onDepartmentChange,
  evaluationFilter,
  onEvaluationChange,
  statusFilter,
  onStatusChange,
  departments,
  evaluationTypes,
  isLoading = false
}) => {
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'total', label: 'Total' }
  ];

  console.log('Departments:', departments);
  console.log('Evaluation Types:', evaluationTypes);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Search & Filter</h2>
        {isLoading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={isLoading}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Department Filter */}
        <select
          value={departmentFilter}
          onChange={(e) => onDepartmentChange(e.target.value)}
          disabled={isLoading}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
        >
          <option value="">All Departments</option>
          {departments
            .filter((dept) => dept && dept.department_id !== undefined) 
            .map((dept) => (
              <option key={dept.department_id} value={String(dept.department_id)}>
                {dept.department_name}
              </option>
            ))}
        </select>

        {/* Evaluation Type Filter */}
        <select
          value={evaluationFilter}
          onChange={(e) => onEvaluationChange(e.target.value)}
          disabled={isLoading}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
        >
          <option value="">All Evaluation Types</option>
          {evaluationTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        {/* Status Filter */}
        {/* <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          disabled={isLoading}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select> */}

        {/* Clear Filters Button */}
        <button
          onClick={() => {
            onSearchChange('');
            onDepartmentChange('');
            onEvaluationChange('');
            onStatusChange('');
          }}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
        >
          Clear Filters
        </button>
      </div>

      {/* Filter Summary */}
      {(searchTerm || departmentFilter || evaluationFilter || statusFilter) && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Active filters:</span>
            {searchTerm && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Search: {searchTerm}
              </span>
            )}
            {departmentFilter && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Department: {departments.find(d => d.department_id.toString() === departmentFilter)?.department_name}
              </span>
            )}
            {evaluationFilter && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Evaluation: {evaluationFilter}
              </span>
            )}

          </div>
        </div>
      )}
    </div>
  );
};