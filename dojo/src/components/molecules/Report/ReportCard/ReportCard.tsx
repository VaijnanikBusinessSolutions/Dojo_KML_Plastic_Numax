// src/components/molecules/Report/ReportCard/ReportCard.tsx
import React from 'react';
import type { ReportAction } from '../../../pages/Report/types';

type Props = {
  title: string;
  description: string;
  primaryAction?: ReportAction;
  secondaryAction?: ReportAction;
};

const btnBase =
  'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors';
const btnPrimary = `${btnBase} bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500`;
const btnSecondary = `${btnBase} bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300`;
const btnQuiet = `${btnBase} bg-indigo-50 text-indigo-600 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-300`;

const ReportCard: React.FC<Props> = ({ title, description, primaryAction, secondaryAction }) => {
  const renderBtn = (action: ReportAction, idx: number) => {
    const variant =
      action.variant === 'secondary' ? btnSecondary : action.variant === 'primary' ? btnPrimary : btnQuiet;

    return (
      <button
        key={idx}
        onClick={action.onClick}
        disabled={action.disabled || action.loading}
        className={`${variant} ${action.disabled || action.loading ? 'opacity-70 cursor-not-allowed' : ''} flex-1`}
        aria-busy={action.loading ? true : undefined}
      >
        {action.loading ? (
          <span className="flex items-center">
            <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing…
          </span>
        ) : (
          action.label
        )}
      </button>
    );
  };

  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mb-6 flex-grow text-gray-600">{description}</p>
      <div className="mt-auto flex gap-3">
        {primaryAction && renderBtn(primaryAction, 0)}
        {secondaryAction && renderBtn(secondaryAction, 1)}
      </div>
    </div>
  );
};

export default ReportCard;