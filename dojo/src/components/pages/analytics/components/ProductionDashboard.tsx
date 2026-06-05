import React from 'react';
import { BarChart3, Users, Target, TrendingUp } from 'lucide-react';
import { KPICard } from './KPICard';
import { FilterPanel } from './FilterPanel';
import { ProductionTrendChart } from './ProductionTrendChart';
import { CategoryBreakdownChart } from './CategoryBreakdownChart';
import { LineComparisonChart } from './LineComparisonChart';
import { PredictiveInsights } from './PredictiveInsights';
import { EfficiencyHeatmap } from './EfficiencyHeatmap';
import { useProductionData } from '../hooks/useProductionData';

export const ProductionDashboard: React.FC = () => {
  const { data, filters, setFilters, analytics } = useProductionData();

  const getChangeType = (value: number): 'increase' | 'decrease' | 'neutral' => {
    if (value > 0) return 'increase';
    if (value < 0) return 'decrease';
    return 'neutral';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 via-purple-50 to-pink-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 drop-shadow-sm">Production Analytics Dashboard</h1>
          <p className="text-xl text-slate-600 font-medium">Real-time insights and predictive analysis for manufacturing operations</p>
        </div>

        {/* Filters */}
        <FilterPanel filters={filters} onFilterChange={setFilters} />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Average Monthly Production"
            value={analytics.average.toLocaleString()}
            change={analytics.growthRate}
            changeType={getChangeType(analytics.growthRate)}
            icon={<BarChart3 className="w-7 h-7" />}
            suffix=" units"
          />
          <KPICard
            title="Production Efficiency"
            value={analytics.efficiency}
            change={5.2}
            changeType="increase"
            icon={<Target className="w-7 h-7" />}
            suffix=" units/operator"
          />
          <KPICard
            title="Monthly Trend"
            value={analytics.trend > 0 ? `+${analytics.trend}` : analytics.trend.toString()}
            change={Math.abs(analytics.trend / analytics.average * 100)}
            changeType={getChangeType(analytics.trend)}
            icon={<TrendingUp className="w-7 h-7" />}
            suffix=" units"
          />
          <KPICard
            title="Total Operators"
            value={analytics.totalOperators}
            change={2.8}
            changeType="increase"
            icon={<Users className="w-7 h-7" />}
            suffix=" people"
          />
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProductionTrendChart 
            historicalData={data} 
            predictions={analytics.predictions} 
          />
          <CategoryBreakdownChart data={data} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LineComparisonChart data={data} />
          <PredictiveInsights predictions={analytics.predictions} />
        </div>

        {/* Efficiency Heatmap - Full Width */}
        <EfficiencyHeatmap data={data} />

        {/* Summary Statistics */}
        <div className="bg-gradient-to-r from-white/90 via-indigo-50/80 to-purple-50/80 backdrop-blur-md rounded-2xl p-8 border border-white/40 shadow-2xl">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-8 text-center">Production Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-3 drop-shadow-sm">
                {analytics.totalProduction.toLocaleString()}
              </div>
              <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Production (Units)</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-3 drop-shadow-sm">
                {data.length}
              </div>
              <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Months Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-3 drop-shadow-sm">
                {analytics.predictions.length}
              </div>
              <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Months Forecasted</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};