import type { ProductionData, PredictionData } from '../types/production';
import { format, addMonths } from 'date-fns';

export class ProductionAnalytics {
  static calculateAverage(data: ProductionData[]): number {
    if (data.length === 0) return 0;
    const total = data.reduce((sum, item) => sum + item.grandTotal, 0);
    return Math.round(total / data.length);
  }

  static calculateTrend(data: ProductionData[]): number {
    if (data.length < 2) return 0;
    
    const sortedData = data.sort((a, b) => 
      new Date(`${a.year}-${a.month}-01`).getTime() - 
      new Date(`${b.year}-${b.month}-01`).getTime()
    );
    
    let totalChange = 0;
    for (let i = 1; i < sortedData.length; i++) {
      const change = sortedData[i].grandTotal - sortedData[i - 1].grandTotal;
      totalChange += change;
    }
    
    return Math.round(totalChange / (sortedData.length - 1));
  }

  static predictNextMonths(data: ProductionData[], months: number = 6): PredictionData[] {
    if (data.length === 0) return [];
    
    const trend = this.calculateTrend(data);
    const average = this.calculateAverage(data);
    const latestData = data[data.length - 1];
    const baseDate = new Date(`${latestData.year}-${latestData.month}-01`);
    
    const predictions: PredictionData[] = [];
    
    for (let i = 1; i <= months; i++) {
      const futureDate = addMonths(baseDate, i);
      const predicted = Math.max(0, average + (trend * i));
      const confidence = Math.max(0.6, 1 - (i * 0.05)); // Decreasing confidence over time
      
      predictions.push({
        month: format(futureDate, 'MMMM'),
        year: futureDate.getFullYear(),
        predicted: Math.round(predicted),
        confidence: Math.round(confidence * 100)
      });
    }
    
    return predictions;
  }

  static calculateEfficiency(data: ProductionData[]): number {
    if (data.length === 0) return 0;
    const totalProduction = data.reduce((sum, item) => sum + item.grandTotal, 0);
    const totalOperators = data.reduce((sum, item) => sum + item.operatorsRequired, 0);
    return totalOperators > 0 ? Math.round((totalProduction / totalOperators) * 100) / 100 : 0;
  }

  static getGrowthRate(current: number, previous: number): number {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100 * 100) / 100;
  }
}