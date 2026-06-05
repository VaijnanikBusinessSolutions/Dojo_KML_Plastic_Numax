// dojo/src/components/Planning/plan.types.ts

export interface Station {
  station_id: number;
  station_name: string;
  subline: number;
}

export interface SubLine {
  subline_id: number;
  subline_name: string;
  line: number;
  stations?: Station[];
}

export interface Line {
  line_id: number;
  line_name: string;
  department: number;
  sublines?: SubLine[];
}

export interface Department {
  department_id: number;
  department_name: string;
  factory: number;
  lines?: Line[];
}

export interface Factory {
  factory_id: number;
  factory_name: string;
  hq: number;
  departments?: Department[];
}

export interface Hq {
  hq_id: number;
  hq_name: string;
  factories?: Factory[];
}

export interface ProductionPlan {
  id?: number;
  month: string;
  year: number;
  
  // Hierarchy fields
  hq: number | null;
  factory: number | null;
  department: number | null;
  line: number | null;
  subline: number | null;
  station: number | null;

  // Production data
  total_production_plan: number;
  total_production_actual: number;
  total_operators_required_plan: number;
  total_operators_required_actual: number;

  // CTQ metrics
  ctq_plan_l1: number;
  ctq_plan_l2: number;
  ctq_plan_l3: number;
  ctq_plan_l4: number;
  ctq_plan_total: number;
  ctq_actual_l1: number;
  ctq_actual_l2: number;
  ctq_actual_l3: number;
  ctq_actual_l4: number;
  ctq_actual_total: number;
  
  // PDI metrics
  pdi_plan_l1: number;
  pdi_plan_l2: number;
  pdi_plan_l3: number;
  pdi_plan_l4: number;
  pdi_plan_total: number;
  pdi_actual_l1: number;
  pdi_actual_l2: number;
  pdi_actual_l3: number;
  pdi_actual_l4: number;
  pdi_actual_total: number;
  
  // Other metrics
  other_plan_l1: number;
  other_plan_l2: number;
  other_plan_l3: number;
  other_plan_l4: number;
  other_plan_total: number;
  other_actual_l1: number;
  other_actual_l2: number;
  other_actual_l3: number;
  other_actual_l4: number;
  other_actual_total: number;
  
  // Bifurcation metrics
  bifurcation_plan_l1: number;
  bifurcation_plan_l2: number;
  bifurcation_plan_l3: number;
  bifurcation_plan_l4: number;
  bifurcation_actual_l1: number;
  bifurcation_actual_l2: number;
  bifurcation_actual_l3: number;
  bifurcation_actual_l4: number;
  
  // Totals and gaps
  grand_total_plan: number;
  grand_total_actual: number;
  gap_plan: number;
  gap_actual: number;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
}