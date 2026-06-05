import React from 'react';
import { Sparkles } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, icon }) => (
  <div className="text-center mb-12 relative">
    <div className="absolute inset-0 flex items-center justify-center opacity-5">
      <div className="w-96 h-96 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full blur-3xl"></div>
    </div>
    <div className="relative">
      <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2">{icon}</div>
      </div>
      <div className="flex items-center justify-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-yellow-400" />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          {title}
        </h1>
        <Sparkles className="w-5 h-5 text-yellow-400" />
      </div>
      <p className="text-gray-600 text-lg font-medium">{subtitle}</p>
    </div>
  </div>
);