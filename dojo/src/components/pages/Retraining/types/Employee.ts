

export interface Employee {
  employee_pk: number; 
  employee_id: string;
  employee_name: string;
  department_id: number;
  department_name: string;
  station_id: number | null;
  station_name: string;
  level_id: number;
  level_name: string;
  evaluation_type: 'Evaluation' | 'OJT' | '10 Cycle';
  obtained_percentage: number;
  required_percentage: number;
  performance_gap: number;
  last_evaluation_date: string;
  existing_sessions_count: number;
  max_attempts: number;
  can_schedule_retraining: boolean;
  retraining_status: 'pending' | 'scheduled' | 'completed' | 'failed';
  retraining_records: RetrainingRecord[];
}

export interface RetrainingRecord {
  id: number;
  attempt_no: number;
  scheduled_date: string;
  scheduled_time: string;
  venue: string;
  status: 'Pending' | 'Completed' | 'Missed';
  performance_percentage?: number;
  required_percentage?: number;
  // Add session_detail to match backend structure
  session_detail?: {
    id?: number;
    observations_failure_points?: string;
    trainer_name?: string;
    created_at?: string;
    updated_at?: string;
  };
}

export interface RetrainingSession {
  id?: number;
  employee: number; 
  employee_name?: string;
  level: number; 
  level_name?: string;
  department: number; 
  department_name?: string;
  station: number | null; 
  station_name?: string;
  evaluation_type: 'Evaluation' | 'OJT' | '10 Cycle'; 
  scheduled_date: string;
  scheduled_time: string; 
  venue: string; 
  status: 'Pending' | 'Completed' | 'Missed';
  attempt_no?: number;
  performance_percentage?: number | undefined; 
  required_percentage?: number;
  created_at?: string;
  // Add session_detail to match backend
  session_detail?: {
    id?: number;
    observations_failure_points?: string;
    trainer_name?: string;
    created_at?: string;
    updated_at?: string;
  };
}

export interface RetrainingConfig {
  id?: number;
  level: number;
  evaluation_type: 'Evaluation' | 'OJT' | '10 Cycle';
  max_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface RetrainingSummary {
  overall_summary: {
    total_failed_employees: number;
    pending_retraining: number;
    scheduled_retraining: number;
    completed_retraining: number;
    failed_retraining: number;
  };
  by_evaluation_type: Record<string, {
    total: number;
    pending: number;
    scheduled: number;
    completed: number;
    failed: number;
  }>;
  by_department: Record<string, {
    total: number;
    pending: number;
    scheduled: number;
    completed: number;
    failed: number;
  }>;
}

export interface ApiResponse<T> {
  count: number;
  results: T[];
}

export interface Department {
  department_id: number;
  department_name: string;
}

export interface Level {
  level_id: number;
  level_name: string;
}

export interface Station {
  station_id: number;
  station_name: string;
}