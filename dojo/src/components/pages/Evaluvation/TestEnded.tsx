// src/pages/TestEnded.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

const TestEnded: React.FC = () => {
  const navigate = useNavigate();
  // const location = useLocation();
  // const { paperId, answers } = location.state || {
    
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 text-center max-w-4xl px-8">
        {/* Success Icon */}
        <div className="mb-8 inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-2xl animate-bounce">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        {/* Main Message */}
        <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-blue-200 mb-6 leading-tight">
          Congratulations!
        </h1>
        
        <p className="text-2xl md:text-3xl text-slate-300 font-light mb-16 leading-relaxed">
          You've completed the quiz successfully
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <button
            onClick={() => navigate('/')}
            className="group relative px-12 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-lg font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 active:scale-95"
          >
            <span className="relative z-10">Return Home</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </button>
          
          <button
            onClick={() => navigate('/quiz-results')}
            className="group relative px-12 py-4 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white text-lg font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25 active:scale-95"
          >
            <span className="relative z-10">View Results</span>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full opacity-60 animate-ping"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-300 rounded-full opacity-40 animate-ping delay-700"></div>
        <div className="absolute bottom-1/4 left-3/4 w-1.5 h-1.5 bg-blue-300 rounded-full opacity-50 animate-ping delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-indigo-300 rounded-full opacity-30 animate-ping delay-300"></div>
      </div>
    </div>
  );
};

export default TestEnded;