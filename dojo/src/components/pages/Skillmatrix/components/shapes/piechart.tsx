import React from 'react';

interface PieChartProps {
  level: number;
  isRequired?: boolean;
  onLevelChange?: (newLevel: number) => void;
  size?: number;
  title?: string;
  colors?: Record<number, string>;
}

const defaultColors = {
  1: '#ef4444',
  2: '#f59e0b',
  3: '#3b82f6',
  4: '#10b981'
};

const PieChart: React.FC<PieChartProps> = ({
  level,
  isRequired = false,
  onLevelChange,
  size = 32,
  title,
  colors = defaultColors
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, size, size);

    // Draw base circle
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2 - 2, 0, Math.PI * 2);
    ctx.fillStyle = isRequired ? '#e5e7eb' : '#f3f4f6';
    ctx.fill();
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw skill level pie segment, if level > 0
    if (level > 0) {
      const fillPercent = Math.max(0, Math.min(level/4, 1));
      ctx.beginPath();
      ctx.moveTo(size/2, size/2);
      ctx.arc(size/2, size/2, size/2 - 2, -Math.PI/2, Math.PI*2*fillPercent - Math.PI/2);
      ctx.closePath();
      ctx.fillStyle = colors[level] || '#6b7280';
      ctx.fill();
    }
  }, [level, isRequired, size, colors]);

  const handleClick = () => {
    if (!isRequired && onLevelChange) {
      const newLevel = level >= 4 ? 0 : level + 1;
      onLevelChange(newLevel);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className={`${!isRequired && onLevelChange ? 'cursor-pointer hover:opacity-80' : ''}`}
        onClick={handleClick}
        title={title || (isRequired ? `Required Level: ${level}` : level > 0 ? `Skill Level: ${level}` : 'No level')}
        tabIndex={-1}
        style={{ outline: 'none' }}
      />
    </div>
  );
};

// Preview component for smaller displays
export const PieChartPreview: React.FC<{ level: number; color: string }> = ({ level, color }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const size = 32;
    ctx.clearRect(0, 0, size, size);
    
    // Draw base circle
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2 - 2, 0, Math.PI * 2);
    ctx.fillStyle = '#f3f4f6';
    ctx.fill();
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw skill level pie segment
    if (level > 0) {
      const fillPercent = level / 4;
      ctx.beginPath();
      ctx.moveTo(size/2, size/2);
      ctx.arc(size/2, size/2, size/2 - 2, -Math.PI/2, Math.PI*2*fillPercent - Math.PI/2);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    }
  }, [level, color]);
  
  return <canvas ref={canvasRef} width={32} height={32} />;
};

export default PieChart;