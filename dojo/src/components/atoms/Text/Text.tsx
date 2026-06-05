import React from 'react';

interface TextProps {
  children: React.ReactNode;
  variant?: 'heading' | 'subtitle' | 'body' | 'caption';
  className?: string;
  onClick?: () => void;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  className = '',
  onClick
}) => {
  const variantClasses = {
    heading: 'text-2xl font-bold leading-tight',
    // subtitle: 'text-xl md:text-2xl lg:text-3xl font-bold',
    subtitle: 'text-lg font-bold',
    body: 'text-base',
    caption: 'text-sm text-gray-400'
  };

  const baseClasses = `${variantClasses[variant]} ${onClick ? 'cursor-pointer' : ''}`;

  return (
    <div className={`${baseClasses} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};