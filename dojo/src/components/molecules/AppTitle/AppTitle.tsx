import React from 'react';
import { Text } from '../../atoms/Text/Text';
import { COMPANY_INFO } from '../../constants/navigation';

interface AppTitleProps {
  onClick?: () => void;
  className?: string;
}

export const AppTitle: React.FC<AppTitleProps> = ({ onClick, className = '' }) => {
  return (
    <Text 
      variant="subtitle"
      className={`absolute left-1/2 transform -translate-x-1/2 text-[#001740] ${className}`}
      onClick={onClick}
    >
      {COMPANY_INFO.APP_NAME}
    </Text>
  );
};