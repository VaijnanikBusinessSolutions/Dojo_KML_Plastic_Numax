import React, { useState } from 'react';
import { ChevronDown, Eye, Clock, AlertCircle } from 'lucide-react';

interface Attempt {
  id: number;
  attempt_no: number;
  status: string;
  doj: string;
  scores_data?: any[];
  trainee_name?: string;
  revision_date: string;
}

interface AttemptsSelectorProps {
  attempts: Attempt[];
  currentAttemptNo: number;
  onViewAttempt: (attempt: Attempt) => void;
  onResetToCurrentAttempt: () => void;
  isViewingPrevious: boolean;
  maxAttempts: number;
}

const AttemptsSelector: React.FC<AttemptsSelectorProps> = ({
  attempts,
  currentAttemptNo,
  onViewAttempt,
  onResetToCurrentAttempt,
  isViewingPrevious,
  maxAttempts,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pass':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'fail':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pass':
        return '✓';
      case 'fail':
        return '✗';
      case 'pending':
        return '○';
      default:
        return '•';
    }
  };

  // Sort attempts by attempt_no descending (latest first)
  const sortedAttempts = [...attempts].sort((a, b) => b.attempt_no - a.attempt_no);
  const previousAttempts = sortedAttempts.filter(a => a.attempt_no !== currentAttemptNo);

  return (
    <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 p-5 rounded-xl border-2 border-indigo-200 mb-6 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Current Attempt Info */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-xl shadow-md">
            <Clock className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Current Training Attempt</p>
            <p className="text-2xl font-bold text-indigo-900">
              Attempt {currentAttemptNo} <span className="text-lg text-gray-500">of {maxAttempts}</span>
            </p>
          </div>
        </div>

        {/* View Previous Button */}
        {previousAttempts.length > 0 && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-indigo-300 rounded-lg hover:bg-indigo-50 hover:border-indigo-400 transition-all shadow-sm font-medium text-gray-700"
          >
            <Eye className="w-5 h-5 text-indigo-600" />
            <span>View Previous Attempts</span>
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        )}
      </div>

      {/* Previous Attempts Dropdown */}
      {isOpen && previousAttempts.length > 0 && (
        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto pr-2">
          <p className="text-sm font-semibold text-gray-600 mb-3 px-1">
            📋 Historical Attempts ({previousAttempts.length})
          </p>
          {previousAttempts.map((attempt) => (
            <button
              key={attempt.id}
              onClick={() => {
                onViewAttempt(attempt);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="text-center min-w-[80px]">
                  <p className="text-xs text-gray-500 font-medium">ATTEMPT</p>
                  <p className="text-2xl font-bold text-indigo-600 group-hover:text-indigo-700">
                    #{attempt.attempt_no}
                  </p>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800">
                    {attempt.trainee_name || 'Training Session'}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <span>📅</span>
                    {new Date(attempt.revision_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 ${getStatusColor(
                    attempt.status
                  )}`}
                >
                  {getStatusIcon(attempt.status)} {attempt.status}
                </span>
                <Eye className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Alert Banner When Viewing Previous */}
      {isViewingPrevious && (
        <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600" />
              <div>
                <p className="text-sm font-bold text-amber-900">
                  📌 Viewing Previous Attempt (Read-Only Mode)
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  You cannot edit or save changes while viewing historical data
                </p>
              </div>
            </div>
            <button
              onClick={onResetToCurrentAttempt}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-bold shadow-md hover:shadow-lg"
            >
              ← Return to Current Attempt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttemptsSelector;
