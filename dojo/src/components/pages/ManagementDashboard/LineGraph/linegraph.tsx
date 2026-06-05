import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);


interface LineGraphProps {
  labels: string[];
  data1: number[];
  data2: number[];
  area?: boolean;
  showSecondLine?: boolean;
  label1?: string;
  label2?: string;
  line1Color?: string;
  line2Color?: string;
  area1Color?: string;
  area2Color?: string;
  height?: number | string;
  width?: number | string;
  responsive?: boolean;
  maintainAspectRatio?: boolean;
}

const LineGraph: React.FC<LineGraphProps> = ({
  labels = [],
  data1 = [],
  data2 = [],
  area = true,
  showSecondLine = true,
  label1 = 'Line 1',
  label2 = 'Line 2',
  line1Color = '#52a9faff',
  line2Color = '#2c47e0ff',
  area1Color = 'rgba(27, 30, 206, 0.1)',
  area2Color = 'rgba(24, 15, 109, 0.1)',
  height = '100%',
  width = '100%',
  responsive = true,
  maintainAspectRatio = false
}) => {
  const chartData: ChartData<'line', number[], string> = {
    labels,
    datasets: [
      {
        label: label1,
        data: data1,
        borderColor: line1Color,
        backgroundColor: area ? area1Color : 'transparent',
        borderWidth: 2,
        tension: 0.4,
        fill: area ? 'start' : false,
        pointBackgroundColor: line1Color,
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
        pointHoverBorderWidth: 2,
        pointRadius: 3,
        pointHitRadius: 10,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: line1Color,
      },
      ...(showSecondLine ? [{
        label: label2,
        data: data2,
        borderColor: line2Color,
        backgroundColor: area ? area2Color : 'transparent',
        borderWidth: 2,
        tension: 0.4,
        fill: area ? 'start' : false,
        borderDash: [5, 5],
        pointBackgroundColor: line2Color,
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
        pointHoverBorderWidth: 2,
        pointRadius: 3,
        pointHitRadius: 10,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: line2Color,
      }] : [])
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: responsive,
    maintainAspectRatio: maintainAspectRatio,
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
        
        },
      },
      y: {
        beginAtZero: true,
        ticks: { display: false },
        grid: { 
          display: false,
          drawTicks: false
        },
        border: {
          display: false
        }
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        align: "start",
        labels: {
          color: "#333",
          font: { size: 12 },
          boxWidth: 10,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        enabled: true,
        displayColors: true,
      },
    },
  };

  // Custom plugin for gradient under line with safe checks
  const gradientFill = {
    id: 'gradientFill',
    beforeDraw(chart: any) {
      try {
        // Check if chart context and required properties exist
        if (!chart?.chart?.ctx || !chart.chartArea) {
          return;
        }
        
        const { ctx, chartArea } = chart.chart;
        const { top, bottom } = chartArea;
        const { datasets } = chart.data;
        
        if (!datasets || !Array.isArray(datasets)) return;
        
        datasets.forEach((dataset: any, i: number) => {
          if (!dataset?.fill || !dataset?.backgroundColor) return;
          
          const meta = chart.getDatasetMeta(i);
          if (!meta?.data?.length) return;
          
          const firstPoint = meta.data[0];
          const lastPoint = meta.data[meta.data.length - 1];
          
          if (!firstPoint || !lastPoint) return;
          
          try {
            const gradient = ctx.createLinearGradient(0, top, 0, bottom);
            gradient.addColorStop(0, `${dataset.backgroundColor}80`);
            gradient.addColorStop(1, `${dataset.backgroundColor}00`);
            
            const fillPath = new Path2D();
            fillPath.moveTo(firstPoint.x, firstPoint.y);
            
            meta.data.forEach((point: any) => {
              if (point && typeof point.x === 'number' && typeof point.y === 'number') {
                fillPath.lineTo(point.x, point.y);
              }
            });
            
            fillPath.lineTo(lastPoint.x, bottom);
            fillPath.lineTo(firstPoint.x, bottom);
            fillPath.closePath();
            
            ctx.save();
            ctx.fillStyle = gradient;
            ctx.fill(fillPath);
            ctx.restore();
          } catch (e) {
            console.warn('Error drawing gradient fill:', e);
          }
        });
      } catch (e) {
        console.warn('Error in gradient fill plugin:', e);
      }
    },
  };

  return (
    <div style={{ 
      height: height,
      width: width,
      position: 'relative',
      fontFamily: 'Inter, sans-serif',
    }}>
      <Line 
        data={chartData} 
        options={options} 
        plugins={[gradientFill]}
      />
    </div>
  );
};

export default LineGraph;