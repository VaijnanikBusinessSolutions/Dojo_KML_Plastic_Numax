import { useState, useMemo } from 'react';
import type { ProductionData, FilterOptions, PredictionData } from '../types/production';
import { ProductionAnalytics } from '../utils/analytics';
import { mockProductionData } from '../data/mockData';

export const useProductionData = () => {
  const [filters, setFilters] = useState<FilterOptions>({
    hq: 'KML',
    factory: 'KML Factory 1',
    department: 'Department 1',
    line: '',
    subline: '',
    station: '',
    dateRange: {
      start: new Date('2024-01-01'),
      end: new Date('2024-12-31')
    }
  });

  const filteredData = useMemo(() => {
    return mockProductionData.filter(item => {
      return (
        item.hq === filters.hq &&
        item.factory === filters.factory &&
        item.department === filters.department &&
        (!filters.line || item.line === filters.line) &&
        (!filters.subline || item.subline === filters.subline) &&
        (!filters.station || item.station === filters.station)
      );
    });
  }, [filters]);

  const analytics = useMemo(() => {
    const average = ProductionAnalytics.calculateAverage(filteredData);
    const trend = ProductionAnalytics.calculateTrend(filteredData);
    const predictions = ProductionAnalytics.predictNextMonths(filteredData, 6);
    const efficiency = ProductionAnalytics.calculateEfficiency(filteredData);
    
    const currentMonth = filteredData[filteredData.length - 1];
    const previousMonth = filteredData[filteredData.length - 2];
    
    const growthRate = currentMonth && previousMonth 
      ? ProductionAnalytics.getGrowthRate(currentMonth.grandTotal, previousMonth.grandTotal)
      : 0;

    return {
      average,
      trend,
      predictions,
      efficiency,
      growthRate,
      totalProduction: filteredData.reduce((sum, item) => sum + item.grandTotal, 0),
      totalOperators: filteredData.reduce((sum, item) => sum + item.operatorsRequired, 0)
    };
  }, [filteredData]);

  return {
    data: filteredData,
    filters,
    setFilters,
    analytics
  };
};