

import React from 'react';
import type { Employee } from '../types/Employee';
import { EmployeeRow } from './EmployeeRow';
import { Users, AlertTriangle, Clock, Calendar, CheckCircle, TrendingUp } from 'lucide-react';

interface RetrainingSheetProps {
  employees: Employee[];
  onOpenRetrainingForm: (employee: Employee) => void;
  onScheduleTraining: (employee: Employee) => void;
  isLoading?: boolean;
}

export const RetrainingSheet: React.FC<RetrainingSheetProps> = ({
  employees,
  onOpenRetrainingForm,
  onScheduleTraining,
  isLoading = false
}) => {

      // Filter: Only show employees who still can retrain
const visibleEmployees = employees.filter(emp => {
  const attemptsUsed = emp.existing_sessions_count ?? 0;
  const max = emp.max_attempts ?? 2;

  // ❌ Hide employees who have reached max attempts or marked as failed
  if (attemptsUsed >= max || emp.retraining_status === 'failed') {
    return false;
  }
  return true;
});

  // Calculate summary statistics
  const pendingCount = visibleEmployees.filter(emp => emp.retraining_status === 'pending').length;
  // const scheduledCount = employees.filter(emp => emp.retraining_status === 'scheduled').length;
  // const completedCount = employees.filter(emp => emp.retraining_status === 'completed').length;
  // const failedCount = employees.filter(emp => emp.retraining_status === 'failed').length;

  // Calculate evaluation type breakdown
  const evaluationBreakdown = visibleEmployees.reduce((acc, emp) => {
    const type = emp.evaluation_type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {



    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading retraining data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header with Statistics */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-amber-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Employee Retraining Sheet</h2>
              <p className="text-sm text-gray-600">
                Employees requiring skill development and retraining
              </p>
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
              <div className="text-xs text-gray-500 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Pending
              </div>
            </div>
            {/* <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{scheduledCount}</div>
              <div className="text-xs text-gray-500 flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                Scheduled
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
              <div className="text-xs text-gray-500 flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                Completed
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{failedCount}</div>
              <div className="text-xs text-gray-500 flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Failed
              </div>
            </div> */}
            <div className="text-center border-l pl-6">
              <div className="text-2xl font-bold text-slate-600">{employees.length}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </div>

        {/* Evaluation Type Breakdown */}
        {Object.keys(evaluationBreakdown).length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-6">
              <span className="text-sm font-medium text-gray-700">By Evaluation Type:</span>
              {Object.entries(evaluationBreakdown).map(([type, count]) => (
                <div key={type} className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    type === 'Evaluation' ? 'bg-blue-100 text-blue-800' :
                    type === 'OJT' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {type}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      {employees.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
          <p className="text-gray-500 mb-4">
            No employees requiring retraining match your current filters.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span>This could be good news - your team is performing well!</span>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department & Station
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evaluation Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance Gap
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Retraining Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visibleEmployees.map((employee, index) => (
                <EmployeeRow
                  key={`${employee.employee_id}-${employee.evaluation_type}-${employee.level_id}`}
                  employee={employee}
                  isEven={index % 2 === 0}
                  onOpenRetrainingForm={onOpenRetrainingForm}
                  onScheduleTraining={onScheduleTraining}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer with Action Summary */}
      {visibleEmployees.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing {visibleEmployees.length} employees requiring retraining
            </div>
            <div className="flex items-center space-x-4">
              {pendingCount > 0 && (
                <span className="text-amber-600">
                  {pendingCount} awaiting schedule
                </span>
              )}
              {/* {scheduledCount > 0 && (
                <span className="text-blue-600">
                  {scheduledCount} sessions scheduled
                </span>
              )} */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
