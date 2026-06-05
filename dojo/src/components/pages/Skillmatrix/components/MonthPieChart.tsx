import React, { useEffect, useRef } from 'react';

interface MonthPieChartProps {
  operationNumber: number;
  skillLevel: number;
  department: string;
  size?: number;
  title?: string;
}

const operationColors = {
  'Assembly': {
    1: '#FFF200', 2: '#F8B87A', 3: '#006B76', 4: '#708238', 5: '#B1C4CC',
    6: '#4D3E6C', 7: '#475A93', 8: '#854B07', 9: '#FFD300', 10: '#D01F1F',
    11: '#00A651', 12: '#662D91', 13: '#002663', 14: '#00CFFF', 15: '#A3D55C',
    16: '#3A3A3A', 17: '#C6BDD6', 18: '#902734', 19: '#98C4D4', 20: '#D2DFAA'
  },
  'Quality': { 1: '#00A94E', 2: '#00B7F1', 3: '#782D91', 4: '#FFC100' },
  'Moulding': { 1: '#F47C26', 2: '#A8A8A8', 3: '#FFC400', 4: '#4A79C9', 5: '#4CAF50' },
  'Surface Treatment': { 1: '#4682B4', 2: '#5F9EA0', 3: '#B0C4DE', 4: '#ADD8E6', 5: '#87CEEB' },
};

const MonthPieChart: React.FC<MonthPieChartProps> = ({
  operationNumber,
  skillLevel,
  department,
  size = 32,
  title
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getContrastColor = (hexColor: string): string => {
    if (!hexColor) return '#000000';
    const r = parseInt(hexColor.substring(1, 3), 16);
    const g = parseInt(hexColor.substring(3, 5), 16);
    const b = parseInt(hexColor.substring(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 2;
    
    // Clear canvas
    ctx.clearRect(0, 0, size, size);
    
    // Get the operation color
    const opColor = (operationColors as any)[department]?.[operationNumber] || '#E5E7EB';
    const contrastColor = getContrastColor(opColor);

    // Draw background circle (light gray)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#f3f4f6';
    ctx.fill();
    
    // Draw skill level as a filled portion
    if (skillLevel > 0) {
      const fillPercentage = skillLevel / 4; // Convert to 0-1 range
      const endAngle = Math.PI * 2 * fillPercentage - Math.PI / 2;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, -Math.PI / 2, endAngle);
      ctx.closePath();
      ctx.fillStyle = opColor;
      ctx.fill();
    }

    // Draw operation number in center
    ctx.fillStyle = contrastColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${Math.floor(size * 0.4)}px Arial`;
    ctx.fillText(operationNumber.toString(), centerX, centerY);

    // Draw border
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#9CA3AF';
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [operationNumber, skillLevel, department, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="rounded-full"
      title={title || `Operation ${operationNumber} - Level ${skillLevel}`}
    />
  );
};

export default MonthPieChart;