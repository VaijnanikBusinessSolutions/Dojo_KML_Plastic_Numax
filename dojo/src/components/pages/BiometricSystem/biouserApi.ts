// src/api/biouserApi.ts
import axios from 'axios';

// const API_URL = 'http://172.25.0.51:8000/biouser/'; // Change if needed
const API_URL = 'http://172.25.0.51:8000/biouser/'; // Change if needed

export interface BioUser {
  id: number;
  employeeid: string;
  first_name: string;
  last_name: string;
}

export const getBioUsers = async (): Promise<BioUser[]> => {
  const res = await axios.get<BioUser[]>(API_URL);
  return res.data;
};

export const addBioUser = async (user: Omit<BioUser, 'id'>): Promise<BioUser> => {
  const res = await axios.post<BioUser>(API_URL, user);
  return res.data;
};

export const deleteBioUser = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}${id}/`);
};


// Enroll face
export const enrollFace = async (id: number, is_overwrite = false): Promise<any> => {
  const res = await axios.post(`${API_URL}${id}/enroll_face/`, { is_overwrite });
  return res.data;
};


// Enroll fingerprint
export const enrollFingerprint = async (
  id: number,
  finger_index = 1,
  is_overwrite = false
): Promise<any> => {
  const res = await axios.post(`${API_URL}${id}/enroll_fingerprint/`, {
    finger_index,
    is_overwrite,
  });
  return res.data;
};