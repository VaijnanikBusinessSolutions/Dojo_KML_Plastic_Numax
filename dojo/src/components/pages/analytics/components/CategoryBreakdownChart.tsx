import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { ProductionData } from '../types/production';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CategoryBreakdownChartProps {
  data: ProductionData[];
}

export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({ data }) => {
  const labels = data.map(d => `${d.month} ${d.year}`);
  
  const ctqData = data.map(d => d.ctq.total);
  const pdiData = data.map(d => d.pdi.total);
  const otherData = data.map(d => d.other.total);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'CTQ',
        data: ctqData,
        backgroundColor: 'rgba(99, 102, 241, 0.9)',
        borderColor: '#6366f1',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: 'PDI',
        data: pdiData,
        backgroundColor: 'rgba(6, 182, 212, 0.9)',
        borderColor: '#06b6d4',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: 'OTHER',
        data: otherData,
        backgroundColor: 'rgba(236, 72, 153, 0.9)',
        borderColor: '#ec4899',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: 'Inter, sans-serif',
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#6366f1',
        borderWidth: 2,
        cornerRadius: 12,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        stacked: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.2)',
        },
        ticks: {
          font: {
            family: 'Inter, sans-serif'
          }
        }
      },
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: 'Inter, sans-serif'
          }
        }
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-white/90 to-cyan-50/80 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-2xl">
      <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-indigo-600 bg-clip-text text-transparent mb-6">Production Category Breakdown</h3>
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};