import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { ProductionData, PredictionData } from '../types/production';

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

interface ProductionTrendChartProps {
  historicalData: ProductionData[];
  predictions: PredictionData[];
}

export const ProductionTrendChart: React.FC<ProductionTrendChartProps> = ({
  historicalData,
  predictions
}) => {
  const historicalLabels = historicalData.map(d => `${d.month} ${d.year}`);
  const predictionLabels = predictions.map(p => `${p.month} ${p.year}`);
  const allLabels = [...historicalLabels, ...predictionLabels];

  const historicalValues = historicalData.map(d => d.grandTotal);
  const predictionValues = predictions.map(p => p.predicted);
  const allHistoricalValues = [...historicalValues, ...new Array(predictionLabels.length).fill(null)];
  const allPredictionValues = [...new Array(historicalLabels.length).fill(null), ...predictionValues];

  const data = {
    labels: allLabels,
    datasets: [
      {
        label: 'Historical Production',
        data: allHistoricalValues,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        borderWidth: 4,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        pointRadius: 8,
        fill: true,
        tension: 0.4,
        pointHoverRadius: 10,
        pointHoverBorderWidth: 4
      },
      {
        label: 'Predicted Production',
        data: allPredictionValues,
        borderColor: '#ec4899',
        backgroundColor: 'rgba(236, 72, 153, 0.15)',
        borderWidth: 4,
        borderDash: [5, 5],
        pointBackgroundColor: '#ec4899',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        pointRadius: 8,
        fill: true,
        tension: 0.4,
        pointHoverRadius: 10,
        pointHoverBorderWidth: 4
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
        displayColors: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
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
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: 'Inter, sans-serif'
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    }
  };

  return (
    <div className="bg-gradient-to-br from-white/90 to-indigo-50/80 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-2xl">
      <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">Production Trend & Forecast</h3>
      <div className="h-80">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};