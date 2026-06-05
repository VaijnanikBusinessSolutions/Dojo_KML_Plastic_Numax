import React from 'react';

interface MonthlySkillDisplayProps {
  stationId: number;
  stationName?: string; // Optional now, used only for tooltip
  skillLevel: number;
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

const defaultOperationColor = '#E5E7EB';

const MonthlySkillDisplay: React.FC<MonthlySkillDisplayProps> = ({
  stationId,
  stationName,
  skillLevel,
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
    
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 2;
    
    // Clear canvas
    ctx.clearRect(0, 0, size, size);
    
    // Draw background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = defaultOperationColor;
    ctx.fill();
    
    // Draw skill level as a filled portion if skillLevel > 0
    if (skillLevel > 0) {
      const fillPercentage = skillLevel / 4;
      const endAngle = Math.PI * 2 * fillPercentage - Math.PI / 2;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, -Math.PI / 2, endAngle);
      ctx.closePath();
      ctx.fillStyle = colors[skillLevel] || '#6b7280';
      ctx.fill();
    }

    // Draw station ID in center
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${Math.floor(size * 0.35)}px Arial`;
    ctx.fillText(stationId.toString(), centerX, centerY);

    // Draw border
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#9CA3AF';
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [stationId, skillLevel, size, colors]);

  return (
    <div className="flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded-full"
        title={title || `Station ${stationId} (${stationName}) - Level ${skillLevel}`}
      />
    </div>
  );
};

export default MonthlySkillDisplay;