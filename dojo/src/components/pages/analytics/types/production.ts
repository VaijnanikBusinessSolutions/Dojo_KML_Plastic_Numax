export interface ProductionData {
  id: string;
  month: string;
  year: number;
  hq: string;
  factory: string;
  department: string;
  line?: string;
  subline?: string;
  station?: string;
  ctq: {
    l1: number;
    l2: number;
    l3: number;
    l4: number;
    total: number;
  };
  pdi: {
    l1: number;
    l2: number;
    l3: number;
    l4: number;
    total: number;
  };
  other: {
    l1: number;
    l2: number;
    l3: number;
    l4: number;
    total: number;
  };
  grandTotal: number;
  operatorsRequired: number;
}

export interface PredictionData {
  month: string;
  year: number;
  predicted: number;
  confidence: number;
}

export interface FilterOptions {
  hq: string;
  factory: string;
  department: string;
  line: string;
  subline: string;
  station: string;
  dateRange: {
    start: Date;
    end: Date;
  };
}