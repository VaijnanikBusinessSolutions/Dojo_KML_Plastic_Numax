


import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, User, Building2 } from 'lucide-react';
import type { Employee } from '../types/Employee';

interface SchedulingModalProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
  onSave: (employeeId: string, scheduledDate: string, scheduledTime: string, venue: string) => void;
}

export const SchedulingModal: React.FC<SchedulingModalProps> = ({
  employee,
  isOpen,
  onClose,
  onSave
}) => {
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [venue, setVenue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!scheduledDate || !scheduledTime || !venue) {
      setError('All fields are required');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      await onSave(employee.employee_id, scheduledDate, scheduledTime, venue);
      onClose();
      setScheduledDate('');
      setScheduledTime('');
      setVenue('');
    } catch (error: any) {
      console.error('Error scheduling training:', error);
      setError(error.message || 'Failed to schedule training session');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const venues = [
    'Training Room A',
    'Training Room B', 
    'Conference Hall',
    'Workshop Floor',
    'Simulation Lab',
    'Online Session'
  ];

  // =========================================
  // CORRECTED ATTEMPT + SESSION CALC LOGIC
  // =========================================

  const maxAttempts = employee.max_attempts ?? 2;

  // Retraining sessions allowed (excluding evaluation)
  const maxRetrainingSessions = maxAttempts - 1;

  // Retraining sessions already completed
  const usedRetrainingSessions = employee.existing_sessions_count ?? 0;

  // Next retraining session number
  const currentRetrainingSession = Math.min(usedRetrainingSessions + 1, maxRetrainingSessions);

  // Attempt number INCLUDING original evaluation
  const currentAttemptNumber = usedRetrainingSessions + 2;

  const hasReachedMax = currentAttemptNumber > maxAttempts;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full my-8 max-h-full overflow-y-auto">
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Schedule Training</h2>
              <p className="text-sm text-gray-600">Set up retraining session</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">

          {/* ERROR */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-red-800">Error</span>
              </div>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* EMPLOYEE INFO */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{employee.employee_name}</h3>
                <p className="text-sm text-gray-600">ID: {employee.employee_id}</p>
                <p className="text-xs text-gray-500">PK: {employee.employee_pk}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <Building2 className="w-4 h-4" />
                <span>{employee.department_name}</span>
              </div>
              <div className="text-gray-600">
                <span className="font-medium">Station:</span> {employee.station_name || 'N/A'}
              </div>
              <div className="text-gray-600">
                <span className="font-medium">Level:</span> {employee.level_name}
              </div>
              <div className="text-gray-600">
                <span className="font-medium">Evaluation:</span> {employee.evaluation_type}
              </div>
              <div className="text-red-600">
                <span className="font-medium">Performance Gap:</span> {employee.performance_gap.toFixed(1)}%
              </div>
              <div className="text-gray-600">
                <span className="font-medium">Current Score:</span> {employee.obtained_percentage.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* RETRAINING SESSION INFO */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">

              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-sm font-medium text-amber-800">
                  Retraining Session: {currentRetrainingSession} / {maxRetrainingSessions}
                </span>
              </div>

              <div className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded">
                Attempt {currentAttemptNumber} of {maxAttempts}
              </div>
            </div>

            <div className="mt-2 text-xs text-amber-700">
              Scheduling retraining session #{currentRetrainingSession}
              {usedRetrainingSessions > 0 && (
                <span className="ml-2 text-amber-600">
                  (Previous attempts: {usedRetrainingSessions})
                </span>
              )}
            </div>
          </div>

          {/* DATE */}
          <div className="space-y-6">
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                <span>Training Date <span className="text-red-500">*</span></span>
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={getCurrentDate()}
                required
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
              />
            </div>

            {/* TIME */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4" />
                <span>Training Time <span className="text-red-500">*</span></span>
              </label>
              <select
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select time slot</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            {/* VENUE */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4" />
                <span>Training Venue <span className="text-red-500">*</span></span>
              </label>
              <select
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select venue</option>
                {venues.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            {/* MAX REACH WARNING */}
            {currentAttemptNumber >= maxAttempts && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-red-800">Final Retraining Opportunity</span>
                </div>
                <p className="text-red-700 text-xs mt-1">
                  This is the last attempt allowed.
                </p>
              </div>
            )}

            {/* BUTTONS */}
            <div className="flex space-x-3 pt-4 sticky bottom-0 bg-white pb-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !scheduledDate || !scheduledTime || !venue || hasReachedMax}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {isSubmitting ? 'Scheduling...' : 'Schedule Training'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


