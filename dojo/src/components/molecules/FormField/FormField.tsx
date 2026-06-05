import React from 'react';
import { Input } from '../../atoms/Inputs/Inputs';

interface FormFieldProps {
  label: string;
  type?: string;
  name: string;
  placeholder?: string;
  value: string;
  hasError?: boolean;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  type = 'text',
  name,
  placeholder,
  value,
  hasError = false,
  disabled = false,
  onChange,
  className = '',
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <Input
        type={type}
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        hasError={hasError}
        disabled={disabled}
        onChange={onChange}
      />
    </div>
  );
};
