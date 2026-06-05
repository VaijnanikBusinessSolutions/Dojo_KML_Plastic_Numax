import React from 'react';

interface StatusAlertProps {
  type: 'success' | 'error';
  title: string;
  message: string;
}

export const StatusAlert: React.FC<StatusAlertProps> = ({ type, title, message }) => {
  const isSuccess = type === 'success';
  const bgGradient = isSuccess ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-gradient-to-r from-red-50 to-pink-50';
  const borderColor = isSuccess ? 'border-green-200' : 'border-red-200';
  const iconColor = isSuccess ? 'text-green-500' : 'text-red-500';
  const titleColor = isSuccess ? 'text-green-800' : 'text-red-800';
  const messageColor = isSuccess ? 'text-green-700' : 'text-red-700';

  return (
    <div className="px-8 pb-8">
      <div className={`rounded-2xl ${bgGradient} border-2 ${borderColor} p-6 shadow-lg`}>
        <div className="flex items-start">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full ${isSuccess ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center`}>
            {isSuccess ? (
              <svg className={`h-6 w-6 ${iconColor}`} fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className={`h-6 w-6 ${iconColor}`} fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <div className="ml-4">
            <p className={`text-base font-semibold ${titleColor} mb-1`}>{title}</p>
            <p className={`text-sm ${messageColor} leading-relaxed`}>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};