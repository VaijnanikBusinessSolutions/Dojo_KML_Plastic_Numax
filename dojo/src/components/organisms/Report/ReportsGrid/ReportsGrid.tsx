// src/components/organisms/Report/ReportsGrid/ReportsGrid.tsx
import React from 'react';

type Props = {
  children: React.ReactNode;
};

const ReportsGrid: React.FC<Props> = ({ children }) => {
  return <div className="grid grid-cols-1 gap-6 md:grid-cols-2">{children}</div>;
};

export default ReportsGrid;