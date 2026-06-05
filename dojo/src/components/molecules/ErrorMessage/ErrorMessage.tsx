import React from 'react';
import { Typography } from '../../atoms/Typography/Typography';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  className = ''
}) => {
  return (
    <div className={`mb-4 text-center ${className}`}>
      <Typography variant="caption" className="text-red-600">
        {message}
      </Typography>
    </div>
  );
};
