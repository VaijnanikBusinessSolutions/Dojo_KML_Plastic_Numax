// src/components/pages/Machine/machinesApi.ts
import axios, { type AxiosError } from 'axios';
import { API_ENDPOINTS } from '../../constants/api';
import type { Machine, Operation, Department } from './types';

const api = axios.create({
  baseURL: API_ENDPOINTS.BASE_URL, // e.g. http://172.25.0.51:8000
  timeout: 10000,
  headers: { Accept: 'application/json' },
});

const onError = (error: AxiosError) => {
  if (error.response) throw new Error(`Request failed ${error.response.status}: ${JSON.stringify(error.response.data)}`);
  if (error.request) throw new Error('No response from server');
  throw new Error(`Request setup error: ${error.message}`);
};

// accept array or paginated { results: [] }
const asList = (data: any) =>
  Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];

const ENDPOINTS = {
  MACHINES: '/machines/',            // http://172.25.0.51:8000/machines/
  OPERATIONS: '/operationlist/',     // http://172.25.0.51:8000/operationlist/
  // DEPARTMENTS: '/departments/',  // http://172.25.0.51:8000/departments/
  DEPARTMENTS: API_ENDPOINTS.DEPARTMENT,
} as const;

// map department_id/department_name -> id/name
export async function fetchDepartments(): Promise<Department[]> {
  try {
    const res = await api.get(ENDPOINTS.DEPARTMENTS);
    const list = asList(res.data);
    return list.map((d: any) => ({
      id: d.department_id,
      name: d.department_name,
      factory: d.factory,
      lines: d.lines,
    }));
  } catch (e) {
    return onError(e as AxiosError);
  }
}

// prefer department_id param; fallback from department if provided
export async function fetchMachines(params?: { department_id?: number; department?: number }): Promise<Machine[]> {
  try {
    const p =
      params?.department_id != null
        ? { department_id: params.department_id }
        : params?.department != null
        ? { department_id: params.department }
        : undefined;

    const res = await api.get(ENDPOINTS.MACHINES, { params: p });
    return asList(res.data) as Machine[];
  } catch (e) {
    return onError(e as AxiosError);
  }
}

export async function fetchOperations(): Promise<Operation[]> {
  try {
    // ⬇️ temporary mock data for testing frontend
    const mock = [
      { id: 1, name: "Cutting" },
      { id: 2, name: "Welding" },
      { id: 3, name: "Painting" },
    ];
    return mock;
    // const res = await api.get(ENDPOINTS.OPERATIONS);
    // const list = asList(res.data);
    // return list.map((op: any) => ({ id: op.id, name: op.name })) as Operation[];
  } catch (e) {
    return onError(e as AxiosError);
  }
}

export async function createMachine(payload: FormData): Promise<Machine> {
  try {
    const res = await api.post(ENDPOINTS.MACHINES, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (e) {
    return onError(e as AxiosError);
  }
}

export async function updateMachine(id: number, payload: FormData): Promise<Machine> {
  try {
    const res = await api.put(`${ENDPOINTS.MACHINES}${id}/`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (e) {
    return onError(e as AxiosError);
  }
}

export async function deleteMachine(id: number): Promise<void> {
  try {
    await api.delete(`${ENDPOINTS.MACHINES}${id}/`);
  } catch (e) {
    return onError(e as AxiosError);
  }
}

// never add /api/ to media paths
export function getAbsoluteImageUrl(image?: string | null): string | null {
  if (!image) return null;
  if (/^https?:\/\//i.test(image)) return image;
  const origin = typeof window !== 'undefined' ? window.location.origin.replace(/\/+$/, '') : '';
  const rel = String(image).replace(/^\/+/, '');
  return `${origin}/${rel}`;
}