import React from 'react';
import type { PredictionData } from '../types/production';
import { Calendar, Target, TrendingUp, AlertCircle } from 'lucide-react';

interface PredictiveInsightsProps {
  predictions: PredictionData[];
}

export const PredictiveInsights: React.FC<PredictiveInsightsProps> = ({ predictions }) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-emerald-700 bg-gradient-to-r from-emerald-100 to-emerald-200 border-emerald-300';
    if (confidence >= 60) return 'text-amber-700 bg-gradient-to-r from-amber-100 to-amber-200 border-amber-300';
    return 'text-rose-700 bg-gradient-to-r from-rose-100 to-rose-200 border-rose-300';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return <Target className="w-4 h-4 drop-shadow-sm" />;
    if (confidence >= 60) return <TrendingUp className="w-4 h-4 drop-shadow-sm" />;
    return <AlertCircle className="w-4 h-4 drop-shadow-sm" />;
  };

  return (
    <div className="bg-gradient-to-br from-white/90 to-violet-50/80 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-2xl">
      <h3 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-6 flex items-center">
        <Calendar className="w-6 h-6 mr-3 text-violet-600 drop-shadow-sm" />
        Predictive Insights
      </h3>
      
      <div className="space-y-4">
        {predictions.map((prediction, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-5 bg-gradient-to-r from-white/80 to-slate-50/80 rounded-xl hover:from-white/90 hover:to-slate-50/90 transition-all duration-300 border border-slate-200/50 hover:shadow-lg"
          >
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900">
                {prediction.month} {prediction.year}
              </h4>
              <p className="text-sm text-slate-600 font-medium">
                Predicted: {prediction.predicted.toLocaleString()} units
              </p>
            </div>
            
            <div className={`flex items-center px-4 py-2 rounded-full text-sm font-semibold border shadow-sm ${getConfidenceColor(prediction.confidence)}`}>
              {getConfidenceIcon(prediction.confidence)}
              <span className="ml-1">{prediction.confidence}% confidence</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};