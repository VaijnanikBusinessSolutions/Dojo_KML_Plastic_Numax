import React from 'react';
import { RefreshCw } from 'lucide-react';

interface FormActionsProps {
  onReset: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({ onReset, onSubmit, isSubmitting }) => (
  <div className="mt-8 flex flex-col sm:flex-row gap-3">
    {/* Reset Button */}
    <button
      type="button"
      onClick={onReset}
      disabled={isSubmitting}
      className="flex-1 px-5 py-3 rounded-2xl font-semibold
             bg-transparent backdrop-blur-md border border-gray-300
             text-gray-600 hover:text-indigo-600
             hover:bg-gray-100/40
             disabled:opacity-50 transition-all duration-300
             shadow-sm hover:shadow-md"
    >
      Reset Form
    </button>

    {/* Submit Button */}
    <button
      type="submit"
      disabled={isSubmitting}
      className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-semibold
                 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
                 text-white shadow-lg hover:shadow-xl
                 hover:scale-[1.02] active:scale-[0.98]
                 transition-all duration-300 disabled:opacity-60 relative overflow-hidden"
    >
      {isSubmitting ? (
        <>
          <RefreshCw className="w-5 h-5 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          Continue
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </>
      )}
    </button>
  </div>
);
