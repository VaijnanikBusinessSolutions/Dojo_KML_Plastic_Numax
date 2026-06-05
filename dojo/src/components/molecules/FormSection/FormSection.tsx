import React from 'react';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({ title, children }) => (
  <div>
    <h3 className="text-lg font-medium text-gray-800 mb-4">{title}</h3>
    {children}
  </div>
);