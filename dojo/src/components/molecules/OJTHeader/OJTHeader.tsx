// Header.tsx - Header component with assessment mode toggle and settings button

import React from 'react';
import { Award } from 'lucide-react';




const OJTHeader: React.FC = ({

}) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-8">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
            <Award className="w-8 h-8" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-2 tracking-tight">
          ON-THE-JOB TRAINING
        </h1>
        <p className="text-xl font-light opacity-90 mb-6">
          Unified Monitoring & Assessment Sheet
        </p>
        
     

      
      </div>
    </div>
  );
};

export default OJTHeader;