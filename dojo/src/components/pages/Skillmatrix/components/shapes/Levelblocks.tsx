import React from 'react';

interface LevelBlockProps {
  level: number;
  colors?: Record<number, string>;
}

const defaultColors = {
  1: '#ef4444',
  2: '#f59e0b',
  3: '#3b82f6',
  4: '#10b981'
};

const LevelBlock: React.FC<LevelBlockProps> = ({ 
  level, 
  colors = defaultColors
}) => {
  const labels = [1, 2, 4, 3];
  
  return (
    <div className="w-fit border mb-1">
      <div className="grid grid-cols-2 border border-black text-[10px] font-semibold">
        {labels.map((label) => (
          <div
            key={label}
            className="w-6 h-6 flex items-center justify-center border border-black"
            style={{
              backgroundColor: label <= level ? colors[level] : 'white'
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

// Preview component for smaller displays
export const LevelBlockPreview: React.FC<{ level: number; color: string }> = ({ level, color }) => {
  const labels = [1, 2, 4, 3];
  
  return (
    <div className="w-fit border">
      <div className="grid grid-cols-2 border border-black text-[10px] font-semibold">
        {labels.map((label) => (
          <div
            key={label}
            className={`w-6 h-6 flex items-center justify-center border border-black`}
            style={{
              backgroundColor: label <= level ? color : 'white'
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LevelBlock;