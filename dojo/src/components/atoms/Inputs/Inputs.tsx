import React from 'react';

interface InputProps {
  label?: string;
  type?: string;
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  hasError?: boolean;
  error?: string;
  required?: boolean;
  optional?: boolean;
  icon?: React.ReactNode;
  maxLength?: number;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  id,
  name,
  placeholder,
  value,
  disabled = false,
  hasError = false,
  error,
  required = false,
  optional = false,
  icon,
  maxLength,
  className = '',
  onChange,
}) => {
  const baseClasses =
    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';
  const errorClasses = hasError ? 'border-red-500' : 'border-gray-300';

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
          {optional && <span className="text-gray-400">(Optional)</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && <span className="absolute left-3">{icon}</span>}
        <input
          type={type}
          id={id}
          name={name}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          maxLength={maxLength}
          className={`${baseClasses} ${errorClasses} ${
            icon ? 'pl-10' : ''
          } ${className}`}
          onChange={onChange}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
