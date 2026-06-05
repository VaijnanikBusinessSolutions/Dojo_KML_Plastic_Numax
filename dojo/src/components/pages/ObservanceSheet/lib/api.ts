

import axios from 'axios';

const API_BASE_URL = 'http://172.25.0.51:8000/'; 

// --- Helper for handling API responses ---
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
    console.error('API Error:', errorData);
    throw new Error(errorData.detail || errorData.message || 'API request failed');
  }
  return response.json();
};


// --- Employee API ---
export const employeeApi = {
  getAll: async () => {
    // Corrected endpoint based on the urls.py you provided
    const response = await fetch(`${API_BASE_URL}/mastertable/`);
    return handleResponse(response);
  }
};


// --- Annual Plan API ---
export const annualPlanApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/plans/`);
    return handleResponse(response);
  },
  
  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/plans/${id}/`);
    return handleResponse(response);
  },

  create: async (planData: any) => {
    const response = await fetch(`${API_BASE_URL}/plans/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(planData)
    });
    return handleResponse(response);
  },
  
  update: async (id: string, planData: any) => {
    const response = await fetch(`${API_BASE_URL}/plans/${id}/`, {
      method: 'PATCH', // PATCH only sends the fields that changed
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(planData)
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/plans/${id}/`, {
      method: 'DELETE',
    });
    // DELETE requests often don't return a body, so we just check the status
    if (!response.ok) {
        throw new Error('Failed to delete plan');
    }
    return true; // Or return response.status
  },

  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/plans/stats/`);
    return handleResponse(response);
  }
};


// --- Observation Sheet API ---
export const observationSheetApi = {
    // We primarily create sheets. Getting/updating them individually is less common.
    create: async (sheetData: any) => {
        const response = await fetch(`${API_BASE_URL}/observationsheets/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sheetData)
        });
        return handleResponse(response);
    },
    update: async (sheetId: string, sheetData: any) => {
        const response = await fetch(`${API_BASE_URL}/observationsheets/${sheetId}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sheetData)
        });
        return handleResponse(response);
    },
    // NEW: Finalize a plan
    finalize: async (sheetId: string) => {
        const response = await fetch(`${API_BASE_URL}/observationsheets/${sheetId}/finalize/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        return handleResponse(response);
    }
};

export interface OptionType {
  value: number;
  label: string;
}

// --- From your Hierarchy Endpoint ---
export interface Station {
    id: number;
    station_name: string;
}

export interface Line {
    id: number;
    line_name: string;
    stations: Station[];
}

export interface Department {
    id: number;
    department_name: string;
    lines: Line[];
}

export interface HierarchyData {
    structure_id: number;
    structure_name: string;
    structure_data: {
        departments: Department[];
    };
}

interface LevelOption {
  id: number;
  name: string;
}

export const hierarchyApi = {
  getStructure: async (): Promise<HierarchyData> => {
    const response = await axios.get(`${API_BASE_URL}/hierarchy-simple/`);
    if (response.status !== 200) {
      throw new Error('Failed to fetch hierarchy structure');
    }
    // The response is an array with one object, so we return the first element
    return response.data[0]; 
  }
};

// New API function to get Levels
export const levelApi = {
    getAll: async (): Promise<LevelOption[]> => {
        // NOTE: You need to create this simple endpoint in your Django backend
        const response = await axios.get(`${API_BASE_URL}/levels/`);
        if (response.status !== 200) {
            throw new Error('Failed to fetch levels');
        }
        return response.data;
    }
}