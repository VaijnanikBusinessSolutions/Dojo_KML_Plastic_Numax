import React from 'react';

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'label';
  className?: string;
  href?: string;
}

export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body',
  className = '',
  href,
}) => {
  const baseClasses = {
    h1: 'text-3xl font-bold text-gray-800',
    h2: 'text-2xl font-semibold text-gray-800',
    h3: 'text-xl font-semibold text-gray-800',
    h4: 'text-lg font-medium text-gray-800',
    body: 'text-base text-gray-700',
    caption: 'text-sm text-gray-600',
    label: 'text-sm font-medium text-gray-700',
  };

  if (href) {
    return (
      <a href={href} className={`text-sm text-blue-600 hover:text-blue-800 transition duration-300 ease-in-out ${className}`}>
        {children}
      </a>
    );
  }

  const Tag = variant.startsWith('h') ? variant : 'span';
  return React.createElement(Tag, {
    className: `${baseClasses[variant]} ${className}`
  }, children);
};