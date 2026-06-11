import axios from 'axios';
import type { BioUser, BiometricDevice, AttendanceLog, Machine, MatrixData } from './types';

// Adjust to your Django URL
const API_BASE = 'http://127.0.0.1:8000'; 

const api = axios.create({ baseURL: API_BASE });

// --- DEVICES ---
export const getDevices = async () => (await api.get<BiometricDevice[]>('/biometric-devices/')).data;
export const createDevice = async (data: any) => (await api.post('/biometric-devices/', data)).data;
export const updateDevice = async (id: number, data: Partial<BiometricDevice>) => (await api.put(`/biometric-devices/${id}/`, data)).data;
export const deleteDevice = async (id: number) => await api.delete(`/biometric-devices/${id}/`);
export const unlockDevice = async (id: number) => (await api.post(`/biometric-devices/${id}/unlock/`)).data; 
export const rebootDevice = async (id: number) => (await api.post(`/biometric-devices/${id}/reboot/`)).data; 

// --- USERS ---
export const getBioUsers = async () => (await api.get<BioUser[]>('/biouser/')).data;
export const addBioUser = async (data: any) => (await api.post('/biouser/', data)).data;
export const deleteBioUser = async (id: number) => await api.delete(`/biouser/${id}/`);
export const enrollFace = async (userId: number, deviceId: number) => (await api.post(`/biouser/${userId}/enroll_face/`, { device_id: deviceId })).data; 
export const enrollFinger = async (userId: number, deviceId: number, idx: number) => (await api.post(`/biouser/${userId}/enroll_fingerprint/`, { device_id: deviceId, finger_index: idx })).data; 
export const syncToDevice = async (userId: number, deviceId: number) => (await api.post(`/biouser/${userId}/sync_to_device/`, { device_id: deviceId })).data; 
export const refreshStatus = async (id: number) => (await api.post(`/biouser/${id}/refresh_status/`)).data; // <--- THIS WAS NEEDED
export const syncUsersFromDevice = async () => (await api.post('/biouser/sync_users_from_server/')).data;
// NEW: Revoke Access (Safe)
export const revokeAccess = async (id: number) => (await api.post(`/biouser/${id}/revoke_access/`)).data;


// --- LOGS & MACHINES ---
export const getLogs = async (deviceId?: number) => {
  const params = deviceId ? { device_id: deviceId } : {};
  return (await api.get<{ logs: AttendanceLog[] }>('/api/attendance-logs/', { params })).data.logs;
};

export const getMachines = async () => (await axios.get<Machine[]>('http://127.0.0.1:8000/machines/')).data;




//Manmachine matrix
export const getManMachineMatrix = async () => (await api.get<MatrixData[]>('/api/man-machine-matrix/')).data;



export const getOperatorHistory = async (date: string) => {
    // Calls the new view: OperatorHistoryView
    const response = await axios.get(`${API_BASE}/api/operator-history/?date=${date}`);
    return response.data; // Returns { date: "...", count: 10, logs: [...] }
};