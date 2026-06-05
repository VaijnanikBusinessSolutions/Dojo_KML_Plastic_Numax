//attendanceApi.ts
import axios from 'axios';

export interface AttendanceLog {
  employee_code: string;
  datetime: string;
}

export const getAttendanceLogs = async (): Promise<AttendanceLog[]> => {
  // const res = await axios.get('http://172.25.0.51:8000/api/attendance-logs/');
  const res = await axios.get('http://172.25.0.51:8000/api/attendance-logs/');
  return res.data.logs; // This is an array of logs
};

// export const getAttendanceLogs = async () => {
//   const res = await axios.get('http://172.25.0.51:8000/api/attendance-logs/');
//   return res.data.logs; // This will be the raw logs string (XML/CSV)
// };