

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Info } from 'lucide-react';

const InstructionsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [timer, setTimer] = useState(10);

  // Get paperId, examMode, and departmentName from navigation state
  const paperId = location.state?.paperId;
  const examMode = location.state?.examMode;
  const departmentName = location.state?.departmentName || 'N/A'; // Fallback if departmentName is missing
  
  console.log(location.state);

  const handleStartNow = () => {
    const nextPage = examMode === 'computer' || examMode === 'tablet' 
      ? '/IndividualQuiz' 
      : '/remote';
    navigate(nextPage, { state: location.state, replace: true });
  };

  useEffect(() => {
    if (!paperId) {
      alert('No Question Paper selected. Redirecting to assignment page.');
      navigate('/assign');
      return;
    }

    if (timer <= 0) {
      const nextPage = examMode === 'computer' || examMode === 'tablet' 
        ? '/IndividualQuiz' 
        : '/remote';
      navigate(nextPage, { state: location.state });
      return;
    }

    const countdown = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);

    return () => clearInterval(countdown);
  }, [timer, navigate, paperId, location.state, examMode]);

  const progress = ((10 - timer) / 10) * 100;

  // Dynamic content based on exam mode
  const isRemoteMode = examMode === 'remote';
  const modeText = examMode === 'computer' ? 'Computer' : examMode === 'tablet' ? 'Tablet' : 'Remote';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-2xl">
              <Info className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
              Quiz Instructions
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Please read the following instructions carefully before starting your assessment
            </p>
            {/* Exam Mode Indicator */}
            <div className="mt-6 inline-flex items-center px-4 py-2 bg-blue-100/20 backdrop-blur-sm rounded-full border border-blue-400/30">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-blue-300 capitalize">
                {modeText} Mode
              </span>
            </div>
          </div>

          {/* Main Instructions Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl mb-8">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Left Column - Instructions */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                  Important Guidelines
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-400 font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Auto-Start Timer</h3>
                      <p className="text-slate-300 text-sm">The quiz will begin automatically in <strong className="text-blue-400">{timer} seconds</strong></p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-400 font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Question Timer</h3>
                      <p className="text-slate-300 text-sm">Each question has a <strong className="text-purple-400">30 second</strong> time limit</p>
                    </div>
                  </div>

                  {isRemoteMode ? (
                    <>
                      <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-green-400 font-bold">3</span>
                        </div>
                        <div>
                          <h3 className="text-white font-medium mb-1">Remote Control</h3>
                          <p className="text-slate-300 text-sm">Each remote can answer <strong className="text-green-400">only once</strong> per question</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-yellow-400 font-bold">4</span>
                        </div>
                        <div>
                          <h3 className="text-white font-medium mb-1">Group Quiz Mode</h3>
                          <p className="text-slate-300 text-sm">This is a <strong className="text-yellow-400">collaborative</strong> assessment for your team</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-green-400 font-bold">3</span>
                        </div>
                        <div>
                          <h3 className="text-white font-medium mb-1">Individual Assessment</h3>
                          <p className="text-slate-300 text-sm">Answer questions using the <strong className="text-green-400">{modeText.toLowerCase()}</strong> interface</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-yellow-400 font-bold">4</span>
                        </div>
                        <div>
                          <h3 className="text-white font-medium mb-1">Single User Mode</h3>
                          <p className="text-slate-300 text-sm">This is an <strong className="text-yellow-400">individual</strong> assessment for one participant</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Right Column - Timer Display */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="relative">
                  {/* Circular Progress */}
                  <div className="w-48 h-48 relative">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="4"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="url(#gradient)"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray="283"
                        strokeDashoffset={283 - (283 * progress) / 100}
                        className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    
                    {/* Timer Display */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl font-bold text-white mb-2">{timer}</div>
                        <div className="text-slate-300 text-sm">seconds</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <p className="text-xl text-blue-300 font-medium animate-pulse">
                    Starting Quiz in {timer} second{timer !== 1 ? 's' : ''}...
                  </p>
                  
                  <button
                    onClick={handleStartNow}
                    className="group relative px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-green-400/50 hover:border-green-400"
                  >
                    <span className="relative z-10">Start Quiz Now</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-8 pt-6 border-t border-white/20">
              <div className="flex items-center justify-between text-sm text-slate-300 mb-2">
                <span>Auto-start Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Quiz ID: {paperId || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>{isRemoteMode ? 'Group Assessment' : 'Individual Assessment'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>{modeText} Mode</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>Department: {departmentName}</span>
              </div>
            </div>
            
            <p className="text-slate-500 text-sm">
              {isRemoteMode 
                ? 'Make sure all participants are ready with their remotes before starting'
                : 'Ensure you are comfortable with the interface before starting'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionsPage;