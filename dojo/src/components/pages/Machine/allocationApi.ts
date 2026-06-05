
import axios, { AxiosError } from 'axios';
import { API_ENDPOINTS } from '../../constants/api';
import type { MachineAllocation, MachineAllocationRequest, SkillMatrix } from './types';

const api = axios.create({
  baseURL: API_ENDPOINTS.BASE_URL,
  timeout: 10000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

const onError = (error: AxiosError) => {
  if (error.response) throw new Error(`Request failed ${error.response.status}: ${JSON.stringify(error.response.data)}`);
  if (error.request) throw new Error('No response from server');
  throw new Error(`Request setup error: ${error.message}`);
};

const ENDPOINTS = {
  MACHINE_ALLOCATIONS: '/allocations/',
  EMPLOYEES: '/skill-matrix/',
  ELIGIBLE_EMPLOYEES: '/allocations/eligible_employees/',
} as const;

export async function fetchMachineAllocations(): Promise<MachineAllocation[]> {
  try {
    const res = await api.get(ENDPOINTS.MACHINE_ALLOCATIONS);
    if (!Array.isArray(res.data)) throw new Error('Invalid allocations data format');
    return res.data;
  } catch (e) {
    return onError(e as AxiosError);
  }
}

export async function createMachineAllocation(data: MachineAllocationRequest): Promise<MachineAllocation> {
  try {
    // Ensure all IDs are numbers
    const payload = {
      machine: Number(data.machine),
      department: Number(data.department),
      employee: Number(data.employee), // Convert to number
    };
    
    console.log('Sending payload:', payload); // Debug log
    
    const res = await api.post(ENDPOINTS.MACHINE_ALLOCATIONS, payload);
    return res.data;
  } catch (e) {
    return onError(e as AxiosError);
  }
}

export async function updateMachineAllocation(id: number, data: MachineAllocationRequest): Promise<MachineAllocation> {
  try {
    // Ensure all IDs are numbers
    const payload = {
      machine: Number(data.machine),
      department: Number(data.department),
      employee: Number(data.employee), // Convert to number
    };
    
    const res = await api.put(`${ENDPOINTS.MACHINE_ALLOCATIONS}${id}/`, payload);
    return res.data;
  } catch (e) {
    return onError(e as AxiosError);
  }
}

export async function deleteMachineAllocation(id: number): Promise<void> {
  try {
    await api.delete(`${ENDPOINTS.MACHINE_ALLOCATIONS}${id}/`);
  } catch (e) {
    return onError(e as AxiosError);
  }
}

export async function fetchEmployees(): Promise<SkillMatrix[]> {
  try {
    const res = await api.get(ENDPOINTS.EMPLOYEES);
    if (!Array.isArray(res.data)) throw new Error('Invalid employees data format');
    
    // Map API response to frontend format with all required fields
    // Note: SkillMatrix model has level as ForeignKey to Level model and emp_id as CharField
    return res.data.map((emp: any) => ({
      id: emp.id, // Use the actual SkillMatrix ID (integer primary key)
      employee_name: emp.employee_name,
      employee_code: emp.emp_id, // This is CharField, keep as string
      name: emp.employee_name,
      level: emp.level, // This should come as integer from serializer (level.level_name or level.id)
      department: emp.hierarchy?.department || emp.department, // From hierarchy relationship
      is_eligible: emp.is_eligible || false,
    }));
  } catch (e) {
    return onError(e as AxiosError);
  }
}

export async function fetchEligibleEmployees(machineId: number, departmentId?: number): Promise<{
  machine_level: number;
  employees: SkillMatrix[];
}> {
  try {
    let url = `${ENDPOINTS.ELIGIBLE_EMPLOYEES}?machine_id=${machineId}`;
    if (departmentId) {
      url += `&department_id=${departmentId}`;
    }
    
    const res = await api.get(url);
    
    // Map the response to ensure proper format for SkillMatrix data
    const mappedEmployees = res.data.employees?.map((emp: any) => ({
      id: emp.id, // SkillMatrix primary key
      employee_name: emp.employee_name,
      employee_code: emp.emp_id, // CharField from SkillMatrix
      name: emp.employee_name,
      level: emp.level_value, // Use level_value from serializer (level.id)
      department: emp.department_id, // From hierarchy.department.id
      is_eligible: emp.is_eligible || false,
    })) || [];
    
    return {
      machine_level: Number(res.data.machine_level || 1),
      employees: mappedEmployees,
    };
  } catch (e) {
    // Fallback to all employees if eligible employees endpoint fails
    console.warn('Eligible employees endpoint failed, falling back to all employees');
    const allEmployees = await fetchEmployees();
    return {
      machine_level: 1,
      employees: allEmployees,
    };
  }
}
