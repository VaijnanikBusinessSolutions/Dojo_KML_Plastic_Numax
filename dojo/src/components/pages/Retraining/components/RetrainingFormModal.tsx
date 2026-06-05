import React, { useState, useEffect } from 'react';
import { X, FileText, User, Building2, CheckCircle, AlertCircle, Save } from 'lucide-react';
import type { Employee } from '../types/Employee';

interface RetrainingFormModalProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
  onSave: (employeeId: string, data: {
    observations_failure_points: string;
    trainer_name: string;
  }) => Promise<void>;
}

export const RetrainingFormModal: React.FC<RetrainingFormModalProps> = ({
  employee,
  isOpen,
  onClose,
  onSave
}) => {
  const [observations, setObservations] = useState('');
  const [trainerName, setTrainerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Calculate session info
  const totalSessions = employee.existing_sessions_count || 0;
  const maxRetrainingSessions = employee.max_attempts - 1;
  const totalMaxAttempts = employee.max_attempts;
  const remainingAttempts = totalMaxAttempts - totalSessions - 1;

  // Find the most recent session (the one we're updating)
  const mostRecentSession = employee.retraining_records?.[0];
  
  // Check if we have a session to update
  const hasSessionToUpdate = mostRecentSession && 
  ['Pending', 'Scheduled'].includes(mostRecentSession.status);

  // Pre-populate form with existing data when modal opens
  useEffect(() => {
    if (isOpen && mostRecentSession?.session_detail) {
      console.log('Loading session detail:', mostRecentSession.session_detail);
      setObservations(mostRecentSession.session_detail.observations_failure_points || '');
      setTrainerName(mostRecentSession.session_detail.trainer_name || '');
    } else if (isOpen) {
      // Reset form for new entry
      setObservations('');
      setTrainerName('');
    }
    setError(null);
    setSuccessMessage(null);
  }, [mostRecentSession, isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!observations.trim() || !trainerName.trim()) {
      setError('Both observations and trainer name are required');
      return;
    }

    if (!hasSessionToUpdate) {
      setError('No pending session found to update');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      console.log('Saving retraining data for employee:', employee.employee_id);
      console.log('Session ID to update:', mostRecentSession.id);
      
      await onSave(employee.employee_id, {
        observations_failure_points: observations.trim(),
        trainer_name: trainerName.trim()
      });
      
      setSuccessMessage('Retraining record saved successfully!');
      
      // Auto-close modal after 2 seconds on success
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 2000);
      
    } catch (error: any) {
      console.error('Error saving retraining data:', error);
      setError(error.message || 'Failed to save retraining data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Don't show the form if there's no session to update
  if (!hasSessionToUpdate) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Session Found</h2>
          <p className="text-gray-600 mb-4">
            Please schedule a retraining session first before adding observations.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Employee Retraining Form</h2>
              <p className="text-sm text-gray-600">
                Attempt {mostRecentSession.attempt_no} of {totalMaxAttempts}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <p className="text-green-800 text-sm">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Employee Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{employee.employee_name}</h3>
                <p className="text-sm text-gray-600">ID: {employee.employee_id}</p>
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
              <div className="text-gray-600">
                <span className="font-medium">Obtained:</span> {employee.obtained_percentage}%
              </div>
              <div className="text-red-600">
                <span className="font-medium">Gap:</span> -{employee.performance_gap}%
              </div>
            </div>
          </div>

          {/* Session Status Info */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">
                  Retraining Session - Attempt {mostRecentSession.attempt_no}
                </span>
              </div>
              <div className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded">
                {new Date(mostRecentSession.scheduled_date).toLocaleDateString()} at {mostRecentSession.scheduled_time}
              </div>
            </div>
            <p className="text-amber-700 text-xs mt-2">
              Venue: {mostRecentSession.venue}
            </p>
            <p className="text-amber-700 text-xs mt-1">
              Session ID: {mostRecentSession.id} | Status: {mostRecentSession.status}
            </p>
          </div>

          {/* Retraining Form Table */}
          <div className="border border-gray-300 rounded-lg overflow-hidden mb-6">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                    S. NO.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                    OBSERVATIONS<br/>(Failure Points)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                    Re-Training<br/>Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                    Venue
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trainer's<br/>Name
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employee.retraining_records?.map((record, index) => {
                  const isCurrentSession = record.id === mostRecentSession?.id;
                  const serialNumber = index + 1;
                  
                  return (
                    <tr key={record.id} className={`border-b border-gray-200 ${isCurrentSession ? 'bg-blue-50' : ''}`}>
                      <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-300 text-center font-medium">
                        {serialNumber}
                      </td>
                      <td className="px-4 py-4 border-r border-gray-300">
                        {isCurrentSession ? (
                          <textarea
                            value={observations}
                            onChange={(e) => setObservations(e.target.value)}
                            placeholder="Enter failure points and observations..."
                            required
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            disabled={isSubmitting}
                          />
                        ) : (
                          <div className="text-sm text-gray-900 whitespace-pre-wrap">
                            {record.session_detail?.observations_failure_points || 'No observations recorded'}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-300">
                        <div>
                          <div>{new Date(record.scheduled_date).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">{record.scheduled_time}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-300">
                        {record.venue || 'TBD'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {isCurrentSession ? (
                          <input
                            type="text"
                            value={trainerName}
                            onChange={(e) => setTrainerName(e.target.value)}
                            placeholder="Enter trainer's name"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={isSubmitting}
                          />
                        ) : (
                          <div className="font-medium">
                            {record.session_detail?.trainer_name || 'TBD'}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Training History Summary */}
          {employee.retraining_records && employee.retraining_records.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Training History</h4>
              <div className="text-sm text-gray-600">
                <p><span className="font-medium">Total Attempts:</span> {totalSessions + 1} (including initial evaluation)</p>
                <p><span className="font-medium">Retraining Sessions:</span> {totalSessions} / {maxRetrainingSessions}</p>
                <p><span className="font-medium">Remaining Attempts:</span> {remainingAttempts}</p>
                <p><span className="font-medium">Current Session Status:</span> {mostRecentSession.status}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <form onSubmit={handleSave}>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !observations.trim() || !trainerName.trim()}
                className="flex-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Retraining Record
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};