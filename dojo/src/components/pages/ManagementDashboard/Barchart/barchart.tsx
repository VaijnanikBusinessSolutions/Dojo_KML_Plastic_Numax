import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import type { ChartData, ChartOptions } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

// Register Chart.js components
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface BarChartProps {
  labels: string[];
  data1: number[];
  data2: number[];
  groupLabels: string[];
  title?: string;
  color1?: string;
  color2?: string;
  height?: string | number;
  showDataLabels?: boolean;
  showLegend?: boolean;
  showTitle?: boolean;
}

const BarChart: React.FC<BarChartProps> = ({
  labels,
  data1,
  data2,
  groupLabels,
  title,
  color1 = "#4f46e5",
  color2 = "#10b981",
  height = "400px",
  showDataLabels = true,
  showLegend = true,
  showTitle = false,
}) => {
  const chartData: ChartData<"bar", number[], string> = {
    labels,
    datasets: [
      {
        label: groupLabels[0],
        data: data1,
        backgroundColor: color1,
        borderColor: color1,
        borderWidth: 2,
        borderRadius: 6,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      },
      {
        label: groupLabels[1],
        data: data2,
        backgroundColor: color2,
        borderColor: color2,
        borderWidth: 2,
        borderRadius: 6,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },
    plugins: {
      legend: {
        display: showLegend,
        position: "top",
        align: "start",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          font: {
            size: 13,
            family: "Inter, system-ui, sans-serif",
            weight: 600,
          },
          color: "#374151",
        },
      },
      title: {
        display: showTitle,
        text: title,
        color: "#111827",
        font: {
          size: 16,
          weight: "bold",
          family: "Inter, system-ui, sans-serif",
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      datalabels: {
        display: showDataLabels,
        anchor: "end",
        align: "top",
        font: {
          weight: "bold",
          size: 11,
          family: "Inter, system-ui, sans-serif",
        },
        color: "#111827",
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#6b7280",
          font: {
            size: 12,
            family: "Inter, system-ui, sans-serif",
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(156,163,175,0.2)",
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 12,
            family: "Inter, system-ui, sans-serif",
          },
        },
      },
    },
  };

  return (
    <div style={{ width: "100%", height:"100% " }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChart;
