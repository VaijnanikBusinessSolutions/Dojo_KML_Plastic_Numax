import type { SkillMatrix, Operation, Section, MonthlySkill } from './types';

const API_BASE_URL = 'http://127.0.0.1:8000';

// Generic API call wrapper (fetch-based)
const apiCall = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const fullUrl = `${API_BASE_URL}${url}`;

  try {
    const response = await fetch(fullUrl, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const err: any = new Error(`HTTP error! status: ${response.status}`);
      err.status = response.status;
      err.url = fullUrl;
      throw err;
    }

    return response.json();
  } catch (error) {
    console.error('❌ Fetch Error:', error);
    throw error;
  }
};

// -------- Skill Matrix APIs --------
export const fetchSkillMatrices = async (): Promise<SkillMatrix[]> => {
  try {
    return await apiCall<SkillMatrix[]>('/skill-matrix/');
  } catch (e: any) {
    if (e?.status === 404) return [];
    throw e;
  }
};

export const fetchSkillMatrixData = async (department?: string): Promise<any> => {
  const endpoint = department ? `/api/skill-matrix/${department}/` : '/api/skill-matrix/';
  return apiCall<any>(endpoint);
};

export const fetchOperations = async (): Promise<Operation[]> => {
  try {
    return await apiCall<Operation[]>('/operationlist/');
  } catch (e: any) {
    if (e?.status === 404) return [];
    throw e;
  }
};

export const fetchSections = async (): Promise<Section[]> => {
  try {
    return await apiCall<Section[]>('/sections/');
  } catch (e: any) {
    if (e?.status === 404) return [];
    throw e;
  }
};

export const fetchMonthlySkill = async (): Promise<MonthlySkill[]> => {
  console.log('📡 Fetching Monthly skills...');
  try {
    const data = await apiCall<MonthlySkill[]>('/monthly-skills/');
    console.log('✅ Data received from /monthly-skills/:', data);
    return data;
  } catch (e: any) {
    if (e?.status === 404) return [];
    throw e;
  }
};

export const fetchOperatorLevels = async (department?: string): Promise<any[]> => {
  console.log('📡 Fetching Operator levels...');
  const endpoint = department ? `/operator-levels/${department}/` : '/operator-levels/Assembly/';
  try {
    const data = await apiCall<any[]>(endpoint);
    console.log('✅ Data received from operator-levels:', data);
    return data;
  } catch (e: any) {
    if (e?.status === 404) return [];
    throw e;
  }
};

// -------- Cascading dropdown APIs --------
export const fetchDepartments = async (): Promise<any[]> => {
  try {
    return await apiCall<any[]>('/departments/');
  } catch (e: any) {
    if (e?.status === 404) return [];
    throw e;
  }
};

export const fetchLinesByDepartment = async (departmentId: number): Promise<any[]> => {
  if (!departmentId) return [];
  try {
    return await apiCall<any[]>(`/departments/${departmentId}/lines/`);
  } catch (e: any) {
    if (e?.status === 404) return [];
    throw e;
  }
};

export const fetchSublinesByLine = async (lineId: number): Promise<any[]> => {
  if (!lineId) return [];
  try {
    return await apiCall<any[]>(`/lines/${lineId}/sublines/`);
  } catch (e: any) {
    if (e?.status === 404) return [];
    throw e;
  }
};

export const fetchStationsBySubline = async (sublineId: number): Promise<any[]> => {
  if (!sublineId) return [];
  try {
    return await apiCall<any[]>(`/sublines/${sublineId}/stations/`);
  } catch (e: any) {
    if (e?.status === 404) return [];
    throw e;
  }
};

// -------- Station Requirement APIs --------
export const fetchLevels = async (): Promise<any[]> => {
  try {
    return await apiCall<any[]>('/levels/');
  } catch (e: any) {
    if (e?.status === 404) return [];
    throw e;
  }
};

export const fetchStations = async (): Promise<any[]> => {
  try {
    return await apiCall<any[]>('/stations/');
  } catch (e: any) {
    if (e?.status === 404) return [];
    throw e;
  }
};

export const createStationRequirement = async (payload: {
  station: number;
  minimum_level_required?: number | null;
  minimum_operators_required: number;
}) => {
  return apiCall('/station-requirements/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};



// Define a type for the requirement data
export interface StationRequirement {
    id: number;
    station_id: number;
    station_name: string;
    department_id: number | null;
    department_name: string;
    minimum_operators: number | null;
    minimum_level_required: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | null;
    minimum_level_number: number;
}

export const fetchStationRequirements = async (): Promise<StationRequirement[]> => {
    // Assuming API_BASE_URL is defined
    const response = await fetch(`${API_BASE_URL}/station-requirements/`); 
    if (!response.ok) {
        throw new Error(`Failed to fetch station requirements: HTTP ${response.status}`);
    }
    return response.json();
};