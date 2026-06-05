//This file will hold all your TypeScript interfaces.
// src/components/pages/EmployeeHistorySearch/types.ts

export interface MasterEmployee {
	emp_id: string;
	first_name: string | null;
	last_name: string | null;
	// department_name: string;
	date_of_joining: string;
	birth_date: string | null;
	sex: string | null;
	email: string;
	phone: string;
	// Fields from old 'Employee' interface needed for the info card
	pay_code: string;
	card_no: string; // Same as emp_id
	name: string; // Constructed from first_name/last_name
	guardian_name: string;
	department: string;
	section: string;
	desig_category: string;
}

export interface OperatorSkill {
	id: number;
	employee_name: string;
	station_name: string;
	level_name: string;
	sequence: number | null;
}

export interface Attendance {
	id: number;
	batch: string;
	day_number: number;
	status: 'present' | 'absent';
	attendance_date: string;
}

export interface Score {
	id: number;
	test_name: string;
	marks: number;
	created_at: string;
	percentage: number;
	passed: string; // Kept as string per original code
}

export interface HanchouResult {
	id: number;
	exam_name: string;
	score: number;
	total_questions: number;
	percentage: number;
	passed: boolean;
	submitted_at: string;
}

export interface ShokuchouResult {
	id: number;
	exam_name: string;
	score: number;
	total_questions: number;
	percentage: number;
	passed: boolean;
	submitted_at: string;
}

export interface ScheduledTraining {
	id: number;
	topic: string;
	category_name: string;
	trainer_name: string | null;
	venue_name: string | null;
	status: string;
	date: string;
}

export interface EmployeeCardDetails {
	employee: MasterEmployee;
	operator_skills: OperatorSkill[];
	scores: Score[];
	attendance: Attendance[];
	scheduled_trainings: ScheduledTraining[];
	hanchou_results: HanchouResult[];
	shokuchou_results: ShokuchouResult[];
}

export interface LocationState {
	fromReport?: boolean;
}

// Combined type for the ExamResultsCard
export type ExamResult = (HanchouResult & { type: 'hanchou' }) | (ShokuchouResult & { type: 'shokuchou' });