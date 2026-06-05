

import React, { useState } from 'react';
import type { Employee } from '../types/Employee';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Building2,
  GraduationCap,
  CheckCircle,
  Filter,
  Edit,
} from 'lucide-react';

interface ScheduledListProps {
  scheduledEmployees: Employee[];
  onOpenRetrainingForm: (employee: Employee) => void;
}

export const ScheduledList: React.FC<ScheduledListProps> = ({
  scheduledEmployees,
  onOpenRetrainingForm,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'completed'>('all');

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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const filteredEmployees =
    filterStatus === 'all'
      ? scheduledEmployees
      : scheduledEmployees.filter((emp) => emp.retraining_status === filterStatus);

  if (scheduledEmployees.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Retraining Sessions
        </h3>
        <p className="text-gray-600">
          Training sessions will appear here once scheduled.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      {/* 🔹 Header with Filter */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Retraining Sessions
            </h2>
            <p className="text-sm text-gray-600">
              {scheduledEmployees.length} total sessions
            </p>
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'scheduled' | 'completed')}
              className="border border-gray-300 text-sm rounded-md px-3 py-1.5 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* 🔹 Sessions List */}
      <div className="grid gap-4">
        {filteredEmployees.map((employee, index) => {
          const latestSession = employee.retraining_records?.[0];
          const maxSessions = employee.max_attempts - 1;
          const totalAttempts = employee.max_attempts;

          return (
            <div
              key={`${employee.employee_id}-${index}`}
              // Removed onClick and cursor-pointer from here
              className={`border rounded-lg p-6 hover:shadow-md transition-all ${
                employee.retraining_status === 'completed'
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                  : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full ${
                      employee.retraining_status === 'completed'
                        ? 'bg-green-100'
                        : 'bg-blue-100'
                    }`}
                  >
                    {employee.retraining_status === 'completed' ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <User className="w-6 h-6 text-blue-600" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {employee.employee_name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEvaluationBadgeColor(
                          employee.evaluation_type
                        )}`}
                      >
                        {employee.evaluation_type}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                          employee.retraining_status
                        )}`}
                      >
                        {employee.retraining_status === 'scheduled'
                          ? 'Scheduled'
                          : 'Completed'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4" />
                          <span>{employee.department_name}</span>
                        </div>
                        <div>
                          <span className="font-medium">Station:</span>{' '}
                          {employee.station_name}
                        </div>
                        <div>
                          <span className="font-medium">Level:</span>{' '}
                          {employee.level_name}
                        </div>
                        {latestSession && (
                          <>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span className="font-medium">
                                {formatDate(latestSession.scheduled_date)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4" />
                              <span>{latestSession.scheduled_time}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4" />
                              <span>{latestSession.venue}</span>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="font-medium">Employee ID:</span>{' '}
                          {employee.employee_id}
                        </div>
                        <div>
                          <span className="font-medium">Performance Gap:</span>{' '}
                          <span className="text-red-600 font-medium">
                            {employee.performance_gap.toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Current Score:</span>{' '}
                          {employee.obtained_percentage.toFixed(1)}% /{' '}
                          {employee.required_percentage.toFixed(1)}%
                        </div>
                        <div>
                          <span className="font-medium">Sessions:</span>{' '}
                          {employee.existing_sessions_count} / {maxSessions}
                          <span className="text-xs text-gray-500 ml-2">
                            (Attempt {employee.existing_sessions_count + 1}/
                            {totalAttempts})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right ml-4 flex flex-col items-end">
                  <div className="text-sm text-gray-600 mb-1">Performance</div>
                  <div
                    className={`text-lg font-bold ${
                      employee.obtained_percentage >= employee.required_percentage
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {employee.obtained_percentage.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 mb-4">
                    of {employee.required_percentage.toFixed(1)}% required
                  </div>
                  <div className="text-sm text-gray-600 mb-4 font-small">⚠️ Session details are required before the re-test can begin</div>

                  {/* 🔹 NEW BUTTON HERE */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents bubbling if wrapper had click (extra safety)
                      onOpenRetrainingForm(employee);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      employee.retraining_status === 'completed'
                        ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500'
                        : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                    }`}
                  >
                    <Edit className="w-4 h-4" />
                    {employee.retraining_status === 'completed' 
                      ? 'Edit Details' 
                      : 'Add Details'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};