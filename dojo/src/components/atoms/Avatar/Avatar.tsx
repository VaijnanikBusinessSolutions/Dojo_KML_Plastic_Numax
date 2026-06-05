import React from 'react';

interface AvatarProps {
  initial: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
}

export const Avatar: React.FC<AvatarProps> = ({
  initial,
  size = 'md',
  className = '',
  onClick
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  const baseClasses = `rounded-full border-2 border-[#001740] flex items-center justify-center bg-[#001740] text-white font-semibold shadow-md ${onClick ? 'cursor-pointer' : ''}`;

  return (
    <div
      className={`${baseClasses} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
    >
      {initial}
    </div>
  );
};