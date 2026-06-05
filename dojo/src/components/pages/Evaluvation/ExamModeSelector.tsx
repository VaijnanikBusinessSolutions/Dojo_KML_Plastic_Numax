import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

type ExamMode = {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: 'blue' | 'purple' | 'green';
  features: string[];
};

interface LocationState {
  lineId?: number;
  lineName?: string;
  questionPaperId: number;
  Level: string;
}

const ExamModeSelector = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  // Get all the state data passed from previous page
  const locationState = location.state as LocationState;
console.log(locationState)
  const examModes: ExamMode[] = [
    {
      id: 'remote',
      name: 'Remote Control',
      description: 'Use TV remote or wireless remote control to navigate and answer questions',
      icon: Smartphone,
      color: 'blue',
      features: [
        'Navigate with arrow keys',
        'Select answers with A, B, C, D buttons',
        'Perfect for living room setup',
        'Multiple remotes supported'
      ]
    },
    {
      id: 'computer',
      name: 'Computer Mode',
      description: 'Use keyboard and mouse for full computer experience',
      icon: Monitor,
      color: 'purple',
      features: [
        'Click to select answers',
        'Keyboard shortcuts available',
        'Best for desktop/laptop',
        'Full screen experience'
      ]
    },
    {
      id: 'tablet',
      name: 'Tablet Mode',
      description: 'Optimized touch interface for tablets and mobile devices',
      icon: Tablet,
      color: 'green',
      features: [
        'Touch-friendly interface',
        'Swipe navigation',
        'Mobile responsive design',
        'Portrait & landscape support'
      ]
    }
  ];

  const handleModeSelect = (mode: string) => {
    setSelectedMode(mode);
  };

const handleStartExam = () => {
  if (!selectedMode) return;

  setIsStarting(true);

  setTimeout(() => {
    navigate('/assign-remote', {
      state: {
        ...locationState,
        examMode: selectedMode
      }
    });
    setIsStarting(false);
  }, 1000);
};


  type ColorClasses = {
    bg: string;
    border: string;
    text: string;
    shadow: string;
    hover: string;
  };

  const getColorClasses = (color: 'blue' | 'purple' | 'green', isSelected = false): ColorClasses => {
    const colors: Record<'blue' | 'purple' | 'green', ColorClasses> = {
      blue: {
        bg: isSelected ? 'bg-blue-500/20' : 'bg-blue-500/5',
        border: isSelected ? 'border-blue-400/60' : 'border-blue-400/20',
        text: 'text-blue-400',
        shadow: isSelected ? 'shadow-lg shadow-blue-500/20' : '',
        hover: 'hover:bg-blue-500/10 hover:border-blue-400/40'
      },
      purple: {
        bg: isSelected ? 'bg-purple-500/20' : 'bg-purple-500/5',
        border: isSelected ? 'border-purple-400/60' : 'border-purple-400/20',
        text: 'text-purple-400',
        shadow: isSelected ? 'shadow-lg shadow-purple-500/20' : '',
        hover: 'hover:bg-purple-500/10 hover:border-purple-400/40'
      },
      green: {
        bg: isSelected ? 'bg-green-500/20' : 'bg-green-500/5',
        border: isSelected ? 'border-green-400/60' : 'border-green-400/20',
        text: 'text-green-400',
        shadow: isSelected ? 'shadow-lg shadow-green-500/20' : '',
        hover: 'hover:bg-green-500/10 hover:border-green-400/40'
      }
    };
    return colors[color];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
          .glass-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
          }
          .glass-input {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.3);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .glass-input:focus {
            background: rgba(255, 255, 255, 0.9);
            border-color: #3b82f6;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          }
          .mode-card {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8));
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.4);
            transition: all 0.3s ease;
          }
          .mode-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          }
          .animate-fade-in {
            animation: fadeIn 0.6s ease-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-slide-in {
            animation: slideIn 0.5s ease-out;
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .gradient-text {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .icon-glow {
            filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.4));
          }
          .floating-shapes {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 0;
          }
          .shape {
            position: absolute;
            border-radius: 50%;
            background: linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
            animation: float 20s infinite ease-in-out;
          }
          .shape:nth-child(1) {
            width: 300px;
            height: 300px;
            top: 10%;
            left: 10%;
            animation-delay: -2s;
          }
          .shape:nth-child(2) {
            width: 200px;
            height: 200px;
            top: 60%;
            right: 10%;
            animation-delay: -8s;
          }
          .shape:nth-child(3) {
            width: 150px;
            height: 150px;
            bottom: 20%;
            left: 50%;
            animation-delay: -15s;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-20px) rotate(120deg); }
            66% { transform: translateY(20px) rotate(240deg); }
          }
        `
      }} />

      {/* Background Shapes */}
      <div className="floating-shapes">
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            {/* <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 icon-glow">
              <span className="text-white text-2xl font-bold">E</span>
            </div> */}
            <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-4">
              Choose Your Exam Mode
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Select how you'd like to take your exam. Each mode is optimized for different devices and preferences.
            </p>
          </div>

          {/* Mode Selection Cards */}
          <div className="glass-card rounded-2xl p-8 animate-slide-in">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {examModes.map((mode) => {
                const IconComponent = mode.icon;
                const isSelected = selectedMode === mode.id;
                const colorClasses = getColorClasses(mode.color, isSelected);
                
                return (
                  <div
                    key={mode.id}
                    onClick={() => handleModeSelect(mode.id)}
                    className={`
                      relative cursor-pointer transition-all duration-300 transform
                      mode-card rounded-xl p-6
                      ${isSelected ? 'scale-105 ring-2 ring-blue-300' : 'hover:scale-102'}
                    `}
                  >
                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute -top-2 -right-2">
                        <div className="w-6 h-6 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                      </div>
                    )}

                    {/* Icon */}
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>

                    {/* Title and Description */}
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{mode.name}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{mode.description}</p>
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                      {mode.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                          <span className="text-gray-600 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Mode Info */}
            {selectedMode && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      {React.createElement(examModes.find(m => m.id === selectedMode)!.icon, {
                        className: "w-6 h-6 text-white"
                      })}
                    </div>
                    <div>
                      <h4 className="text-gray-800 font-semibold text-lg">
                        {examModes.find(m => m.id === selectedMode)!.name} Selected
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {examModes.find(m => m.id === selectedMode)!.description}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleStartExam}
                    disabled={isStarting}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    {isStarting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Loading...
                      </>
                    ) : (
                      'Continue'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="glass-card rounded-xl p-6 mt-8">
            <h5 className="text-gray-800 font-semibold mb-3">Before You Start:</h5>
            <div className="grid md:grid-cols-2 gap-4 text-gray-600 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>Ensure your device is properly connected and functional</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>Check your internet connection for stability</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>Make sure you have adequate lighting and comfortable seating</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>Close unnecessary applications to avoid distractions</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12">
            <p className="text-gray-500 text-sm">
              Need help? Contact support or check the user manual for your selected mode.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamModeSelector;