import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'icon' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  loading?: boolean; // ✅ added
  'aria-label'?: string;
  title?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  loading = false, // ✅ default false
  'aria-label': ariaLabel,
  title
}) => {
  const baseClasses = 'transition-colors duration-200 focus:outline-none rounded-md font-medium';

  const variantClasses = {
    primary: 'bg-[#001740] text-white hover:bg-blue-800 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
    secondary: 'bg-white text-[#001740] hover:bg-gray-100 border border-gray-200',
    icon: 'p-2 rounded-full hover:bg-gray-100',
    ghost: 'text-gray-400 hover:text-gray-600'
  };

  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading} // ✅ disable while loading
      aria-label={ariaLabel}
      title={title}
    >
      {loading ? 'Loading...' : children} {/* ✅ show loading text */}
    </button>
  );
};
