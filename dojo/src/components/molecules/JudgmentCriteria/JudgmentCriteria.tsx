// JudgmentCriteria.tsx - Overall judgment criteria display

import React from 'react';
import { Award, CheckCircle } from 'lucide-react';

const JudgmentCriteria: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-2xl p-8 border border-gray-200/50 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-gray-600 to-slate-600 rounded-lg">
          <Award className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Judgment Criteria</h3>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-4 p-4 bg-white/80 rounded-xl border border-gray-200">
          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-gray-800">Satisfactory:</span>
            <span className="text-gray-600 ml-2">All criteria met</span>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-white/80 rounded-xl border border-gray-200">
          <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">✗</span>
          </div>
          <div>
            <span className="font-bold text-gray-800">Needs Retraining:</span>
            <span className="text-gray-600 ml-2">Criteria not met</span>
          </div>
        </div>
        <div className="mt-6 p-4 bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl border border-orange-300">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-white font-bold text-xs">!</span>
            </div>
            <div>
              <strong className="text-orange-800">Important Note:</strong>
              <p className="text-orange-700 text-sm mt-1 leading-relaxed">
                If failed in evaluation, re-training is required. 
                Minimum 70% marks required in both Production and Quality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgmentCriteria;