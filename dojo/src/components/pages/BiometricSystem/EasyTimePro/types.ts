//src\components\pages\BiometricSystem\EasyTimePro\types.ts
export interface BioUser {
  id: number;
  employeeid: string;
  first_name: string;
  last_name: string;
  enrolled_devices?: string[]; // Names of devices the user is on
}

export interface BiometricDevice {
  id: number;
  name: string;
  // FIX: Allow null here so TypeScript accepts the payload
  ip_address: string | null;
  port: number;
  serial_number: string;
  is_attendance_device: boolean;

  is_enrollment_device: boolean;
  
  machine_name?: string;       // Read-only from backend
  linked_machine_id?: number | null;  // For updating the link
}

export interface AttendanceLog {
  employee_code: string;
  employee_name?: string; // <--- This must be here
  device_name: string;
  device_sn: string;
  datetime: string;
}

export interface Machine {
  id: number;
  name: string;
  department_name?: string;
  biometric_device?: number | null; // ID of linked device
}


export interface MatrixData {
  machine_id: number;
  machine_name: string;
  process_name: string;
  device_sn: string;
  operators: {
    emp_id: string;
    name: string;
    level: string; // "L1", "L2", etc.
    level_value: number;
    is_synced: boolean;
  }[];
}