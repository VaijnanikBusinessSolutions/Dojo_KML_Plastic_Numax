// src/components/pages/Report/api.ts
import { API_ENDPOINTS } from '../../constants/api';

const ENDPOINTS = {
  MASTER_TABLE_XLSX: '/operators-excel/export_excel/',
} as const;

export async function downloadMasterTableExcel(signal?: AbortSignal): Promise<Blob> {
  const res = await fetch(`${API_ENDPOINTS.BASE_URL}${ENDPOINTS.MASTER_TABLE_XLSX}`, { signal });
  if (!res.ok) throw new Error(`Failed to download file: ${res.status} ${res.statusText}`);
  return res.blob();
}

// import { API_ENDPOINTS } from '../../constants/api';

// const ENDPOINTS = {
//   MASTER_TABLE_XLSX: '/operators-excel/export_excel/',
// } as const;

// export async function downloadMasterTableExcel(signal?: AbortSignal): Promise<Blob> {
//   const res = await fetch(
//     `${API_ENDPOINTS.BASE_URL}${ENDPOINTS.MASTER_TABLE_XLSX}`,
//     { signal }
//   );
//   if (!res.ok) {
//     throw new Error(`Failed to download file: ${res.status} ${res.statusText}`);
//   }
//   return res.blob();
// }