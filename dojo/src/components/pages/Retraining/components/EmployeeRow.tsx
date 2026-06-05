

import React from 'react';
import type { Employee } from '../types/Employee';
import { Calendar, CheckCircle, Clock, User, Building2, AlertTriangle, TrendingDown, XCircle } from 'lucide-react';

interface EmployeeRowProps {
  employee: Employee;
  isEven: boolean;
  onOpenRetrainingForm: (employee: Employee) => void;
  onScheduleTraining: (employee: Employee) => void;
}

export const EmployeeRow: React.FC<EmployeeRowProps> = ({
  employee,
  isEven,
  onOpenRetrainingForm,
  onScheduleTraining
}) => {
  const getEvaluationBadgeColor = (type: string) => {
    switch (type) {
      case 'Evaluation':
        return 'bg-blue-100 text-blue-800';
      case 'OJT':
        return 'bg-green-100 text-green-800';
      case '10 Cycle':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status: string, attemptCount: number, maxAttempts: number) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending Retraining
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Calendar className="w-3 h-3 mr-1" />
            Scheduled (Attempt {attemptCount + 1})
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Retraining Complete
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Max Attempts Reached
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unknown Status
          </span>
        );
    }
  };

  const performancePercentage = (employee.obtained_percentage / employee.required_percentage) * 100;
  const attemptCount = employee.existing_sessions_count ?? 0;
  const maxAttempts = employee.max_attempts ?? 2;
  const nextAttemptNumber = Math.min(attemptCount + 1, maxAttempts);

  const hasReachedMaxAttempts = attemptCount >= maxAttempts;
  const canSchedule =
    employee.can_schedule_retraining &&
    employee.retraining_status !== 'failed' &&
    !hasReachedMaxAttempts;



  // Get the latest retraining record for display
  const latestRecord = employee.retraining_records?.[0];

  return (
    <tr className={`${isEven ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div 
          className="flex items-center cursor-pointer"
          onClick={() => onOpenRetrainingForm(employee)}
        >
          <div className="flex items-center justify-center w-10 h-10 bg-slate-100 rounded-full mr-3">
            <User className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
              {employee.employee_name}
            </div>
            <div className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
              ID: {employee.employee_id}
            </div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Building2 className="w-4 h-4 text-gray-400 mr-2" />
          <div>
            <div className="text-sm font-medium text-gray-900">{employee.department_name}</div>
            <div className="text-sm text-gray-500">{employee.station_name}</div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="space-y-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEvaluationBadgeColor(employee.evaluation_type)}`}>
            {employee.evaluation_type}
          </span>
          <div className="text-xs text-gray-500">
            Level: {employee.level_name}
          </div>
          {employee.last_evaluation_date && (
            <div className="text-xs text-gray-500">
              Last: {new Date(employee.last_evaluation_date).toLocaleDateString()}
            </div>
          )}
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Obtained:</span>
            <span className="font-medium text-gray-900">{employee.obtained_percentage.toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Required:</span>
            <span className="font-medium text-gray-900">{employee.required_percentage.toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center">
              <TrendingDown className="w-3 h-3 mr-1" />
              Gap:
            </span>
            <span className="font-medium text-red-600">{employee.performance_gap.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                performancePercentage >= 90 ? 'bg-green-500' :
                performancePercentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(performancePercentage, 100)}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 text-center">
            {performancePercentage.toFixed(1)}% of required
          </div>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="space-y-1">
          {getStatusBadge(employee.retraining_status, attemptCount, employee.max_attempts)}
          {attemptCount > 0 && (
            <div className="text-xs text-gray-500">
              {Math.min(attemptCount, maxAttempts)}/{maxAttempts} attempts used
            </div>
          )}
          {latestRecord && latestRecord.status === 'Pending' && (
            <div className="text-xs text-blue-600">
              Next: {new Date(latestRecord.scheduled_date).toLocaleDateString()} at {latestRecord.scheduled_time}
            </div>
          )}
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-center">
  {employee.retraining_status === 'failed' || hasReachedMaxAttempts ? (
    <div className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-700 cursor-not-allowed">
      <XCircle className="w-4 h-4 mr-2 text-gray-500" />
      Removed
    </div>
  ) : employee.retraining_status === 'completed' ? (
    <span className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-green-100 text-green-800">
      <CheckCircle className="w-4 h-4 mr-2" />
      Completed
    </span>
  ) : (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onScheduleTraining(employee);
      }}
      disabled={!canSchedule}
      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
        canSchedule
          ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
          : 'bg-gray-300 cursor-not-allowed'
      } transition-colors`}
    >
      <Calendar className="w-4 h-4 mr-2" />
      {employee.retraining_status === 'scheduled'
  ? `Scheduled (${nextAttemptNumber}/${maxAttempts})`
  : 'Schedule'}
    </button>
  )}
</td>

    </tr>
  );
};