import type { LucideIcon } from 'lucide-react';
import React from 'react';


interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, icon: Icon }) => (
  <div className="text-center mb-10">
    <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-xl mb-5">
      <Icon size={36} className="text-white" />
    </div>
    <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
    <p className="mt-3 text-gray-500 text-lg">{subtitle}</p>
  </div>
);

export default PageHeader;
