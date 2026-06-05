import React, { useState } from 'react';

import { Eye, EyeOff } from 'lucide-react';
import { Input } from '../../atoms/Inputs/Inputs';
import { Icon } from '../../atoms/LucidIcons/LucidIcons';

interface PasswordFieldProps {
  label: string;
  name: string;
  placeholder?: string;
  value: string;
  hasError?: boolean;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  name,
  placeholder,
  value,
  hasError = false,
  disabled = false,
  onChange,
  className = '',
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`mb-6 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          id={name}
          name={name}
          placeholder={placeholder}
          value={value}
          hasError={hasError}
          disabled={disabled}
          onChange={onChange}
          className="pr-10"
        />
        <button
          type="button"
          className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 focus:outline-none"
          onClick={handleTogglePassword}
          disabled={disabled}
        >
         <Icon icon={showPassword ? EyeOff : Eye} size={20} />
        </button>
      </div>
    </div>
  );
};
