// src/components/pages/Machine/types.ts

export interface Department {
  id: number;
  name: string;
  factory?: number;
  lines?: any[];
}

export interface Machine {
  id: number;
  name: string;
  image: string; // relative or absolute URL
  level: number;
  process: string | null;
  process_name : string | null;
  created_at: string;
  updated_at: string;

  department: number;       // department id
  department_name?: string; // optional helper from API

  // --- ADD THIS Fro Numax easytimepro---
  biometric_device?: number | null; // The ID of the device
  biometric_device_name?: string;   // Optional: For displaying name in the card
}

export interface OperatorMaster {
  id: string; // emp_id from backend
  name: string; // full name
  department: number;
}

// export interface MachineAllocation {
//   id: number;
//   machine: number;
//   machine_name: string;
//   employee: number;
//   employee_name: string;
//   allocated_at: string;
//   approval_status: 'pending' | 'approved';
// }

export interface MachineAllocation  {
  id: number;
  allocated_at: string;
  approval_status: string;
  machine: number;       // ID only
  department: number;    // ID only
  employee: string;
  machine_name: string;      // employee code (string, e.g., "NL001")
  employee_name: string; // full name
  is_temporary?: boolean;
  access_date?: string | null;
};

// export interface MachineAllocationRequest {
//   machine_id: number;
//   // employee_id: number;
//   employee_id: string;
// }
export interface MachineAllocationRequest {
  machine: number;      // backend wants `machine`
  department: number;   // backend wants `department`
  employee: string;     // backend wants `employee`
  is_temporary?: boolean;
  access_date?: string | null;
}


export type Operation = { id: number; name: string };

export const LEVEL_CHOICES = [
  { value: 1, label: 'Level 1' },
  { value: 2, label: 'Level 2' },
  { value: 3, label: 'Level 3' },
  { value: 4, label: 'Level 4' },
];

export const APPROVAL_STATUS_CHOICES = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
];

// // src/components/pages/Machine/types.ts
// export interface Machine {
//   id: number;
//   name: string;
//   image: string; // relative or absolute URL
//   level: number;
//   process: string | null;
//   created_at: string;
//   updated_at: string;
// }

// export interface OperatorMaster {
//   id: number;
//   name: string;
//   level?: number;
// }

// export interface MachineAllocation {
//   id: number;
//   machine: number;
//   machine_name: string;
//   employee: number;
//   employee_name: string;
//   allocated_at: string;
//   approval_status: 'pending' | 'approved';
// }

// export interface MachineAllocationRequest {
//   machine_id: number;
//   employee_id: number;
// }

// export type Operation = { id: number; name: string };

// export const LEVEL_CHOICES = [
//   { value: 1, label: 'Level 1' },
//   { value: 2, label: 'Level 2' },
//   { value: 3, label: 'Level 3' },
//   { value: 4, label: 'Level 4' },
// ];

// export const APPROVAL_STATUS_CHOICES = [
//   { value: 'pending', label: 'Pending' },
//   { value: 'approved', label: 'Approved' },
// ];