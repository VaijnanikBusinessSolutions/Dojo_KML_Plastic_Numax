// Authentication

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    email: string;
    first_name: string;
    last_name: string;
    employeeid: string;
    role: string;
    hq: string;
    factory: string;
    department: string;
    status: boolean;
  };
  access_token: string;
  refresh_token: string;
  message?: string;
}

// User & Profile
export interface UserInfo {
    id: number;
    firstName: string;
    lastName: string; 
    tempId: string;
    email: string;
    phoneNumber: string;
    sex: string;
    photo: File | null;
    created_at: string;
    updated_at: string;
    is_active: boolean;
}

export interface PassedUser {
  id: number;
  temp_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  photo_url?: string;
  status: "Passed" | "Pending" | "Rejected";
  date_created: string;
  body_check: BodyCheck | BodyCheck[] | null;
}

// Body Check

export interface CheckItem {
  question_id?: number;
  description: string;
  status: 'pass' | 'fail' | '';
}

export interface CheckData {
  [key: string]: CheckItem;
}

export interface BodyCheck {
  id: number;
  temp_id: string;
  check_date: string;
  overall_status: 'pass' | 'fail' | 'pending';
  color_vision: string;
  eye_movement: string;
  fingers_functionality: string;
  hand_deformity: string;
  joint_mobility: string;
  hearing: string;
  bending_ability: string;
  additional_checks: {
    description: string;
    status: 'pass' | 'fail' | '';
  }[];
  notes: string;
}

export interface CheckResults {
  temp_id: string;
  answers: {
    question_id: number;
    status: 'pass' | 'fail' | '';
  }[];
  additional_checks?: {
    description: string;
    status: 'pass' | 'fail' | '';
  }[];
  notes: string;
}

export interface CheckDataResponse {
  temp_id: string;
  checkData: CheckData;
}

export interface CheckDataPayload {
  temp_id: string;
  checkData: CheckData;
}

// Orientation

export interface OrientationFields {
  pay_code: string;
  card_no: string;
  birth_date: string;
  guardian_name: string;
  department: string;
  section: string;
  desig_category: string;
  joining_date: string;
}

export interface OrientationFeedback {
  id: number;
  pay_code: string;
  card_no: string;
  sex: string;
  birth_date: string;
  guardian_name: string;
  department: string;
  section: string;
  desig_category: string;
  joining_date: string;
  user: number;
}

// Full User with Relations


export interface User {
  id: number;
  first_name: string;
  last_name: string;
  temp_id: string;
  email: string;
  phone_number: string;
  sex: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  body_checks: BodyCheck[];
  orientation_feedbacks: OrientationFeedback[];
  photo?: string; 
  is_added_to_master: boolean;
  added_to_master_at: string | null;
  aadharNumber: string;
  employment_type: string;
  hasExperience: boolean;
  experienceYears: number;
  companyOfExperience: string;
  dateOfBirth: string | null;
}


export interface UserInfoEntryProps {
  onNext: (user: UserInfo) => void;
}

export interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

export interface ProgressBarProps {
  progress: number; // 0-100
}

export interface FormSectionProps {
  title?: string;
  children: React.ReactNode;
}

export interface InputFieldProps {
  label?: string;
  type: string;
  id: string;
  value: string;
  name?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  icon?: React.ReactNode;
  maxLength?: number;
  hasError?: boolean;
  disabled?: boolean;
}

export interface SelectFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  icon: React.ReactNode;
}

export interface StatusAlertProps {
  type: 'success' | 'error';
  title: string;
  message: string;
}

export interface FormActionsProps {
  onReset: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export interface GenderOption {
  value: string;
  label: string;
}

// Body Check UI

export interface HumanBodyCheckSheetProps {
  tempId: string;
  userDetails: UserInfo;
  onNext?: () => void;
}

export interface CheckSheetHeaderProps {
  title: string;
}

export interface UserInfoCardProps {
  userDetails: UserInfo;
  tempId: string;
}

export interface InfoItemProps {
  label: string;
  value: string;
  valueClassName?: string;
}

export interface CheckItemRowProps {
  id: string;
  item: CheckItem;
  onStatusChange: (id: string, status: 'pass' | 'fail' | '') => void;
}

export interface StatusToggleButtonProps {
  status: 'pass' | 'fail' | '';
  onClick: () => void;
}

export interface AddItemFormProps {
  newItem: string;
  onNewItemChange: (value: string) => void;
  onAdd: () => void;
  onCancel: () => void;
}

export interface CheckTableProps {
  checkData: CheckData;
  onStatusChange: (id: string, status: 'pass' | 'fail' | '') => void;
  showAddForm: boolean;
  newItem: string;
  onNewItemChange: (value: string) => void;
  onAddItem: () => void;
  onCancelAdd: () => void;
}

export interface ActionBarProps {
  onAddNew: () => void;
  onSave: () => void;
  showAddForm: boolean;
  isExisting: boolean;
  onEdit: () => void;      // --- NEW ---
  onCancelEdit: () => void; // --- NEW ---
  isEditMode: boolean;    // --- NEW ---
  isReadOnly: boolean;    // --- NEW ---
  loading: boolean;
}

export interface CheckSheetContainerProps {
  children: React.ReactNode;
}

export interface OrientationFeedbackModalProps {
  user: User;
  onClose: () => void;
  onSave: () => void;
}


export interface Question {
  id: number;
  question_text: string;
}


export interface CheckTableHeaderProps {}


export interface Employee {
  emp_id: string;
  first_name: string | null;
  last_name: string | null;
  department: number | string | null; // ✅ Updated to handle both number and string
  date_of_joining: string;
  birth_date: string | null; // ✅ Added birth_date field
  sex: string | null;
  email: string;
  department_name:string;
  phone: string;
}

export interface StationSettingPayload {
  department_id: number;
  station_id: number;
  options: string[]; // multiple options
}
export interface PassingCriteria {
  id?: number;
  department: number;
  level: number;
  day: number | null; // null means applies to all days
  percentage: number;
}

export type AssessmentMode = 'quality' | 'quantity';

export interface FormData {
  traineeInfo: {
    name: string;
    id: string;
    empNo: string;
    stationName: string;
    lineName: string;
    processName: string;
    revisionDate: string;
    doi: string;
    trainerName: string;
    trainerLine: string;
  };
  dailyScores: {
    [topicId: string | number]: {
      [dayId: string | number]: string;
    };
  };
  signatures: {
    preparedBy: string;
    approvedBy: string;
    engineerJudge: string;
  };
}

export interface TrainingTopic {
  id: number;
  description: string;
  category: string;
}

export interface QuantityEvaluation {
  day: number;
  date: string;
  plan: number;
  production_actual: number;
  production_marks: number;  // Changed from 'marks'
  rejection_marks: number;   // Added this field
  number_of_rejections: number;
}
export interface Station {
  station_id: number;
  station_name: string;
}

export interface SublineResponse {
  subline_id: number;
  subline_name: string;
  stations: Station[];
}