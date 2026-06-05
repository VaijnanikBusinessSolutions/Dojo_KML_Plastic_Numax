// import React, { useState, useEffect, useMemo } from 'react';
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
//   Legend,
// } from 'recharts';

// // --- Helper: A robust useFetch Hook ---
// // This hook is smart enough to NOT fetch if the URL is null.
// function useFetch<T>(url: string | null) {
//   const [data, setData] = useState<T | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     // This is the key defense: if the url is null, do absolutely nothing.
//     if (!url) {
//       setData(null);
//       setLoading(false);
//       setError(null);
//       return;
//     }

//     const fetchData = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const response = await fetch(url);
//         if (!response.ok) {
//           const errorData = await response.json().catch(() => ({}));
//           throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
//         }
//         const result = await response.json();
//         if (result && result.success === false) {
//           throw new Error(result.error || 'The API returned an error.');
//         }
//         setData(result);
//       } catch (err) {
//         setError(err instanceof Error ? err.message : 'An unknown error occurred.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [url]); // This effect only re-runs when the URL string itself changes.

//   return { data, loading, error };
// }

// // --- Type Definitions matching the FINAL backend API response ---
// interface DataPoint {
//   label: string; // e.g., "April" or "Week of Apr 01"
//   planned_production: number;
//   actual_manpower: number;
// }

// interface ApiData {
//   success: boolean;
//   graph_title: string;
//   subtitle: string;
//   data: DataPoint[];
// }

// // --- UI Sub-components ---
// const CustomTooltip = ({ active, payload, label }: any) => {
//   if (active && payload && payload.length) {
//     const data = payload[0].payload;
//     return (
//       <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg text-sm">
//         <p className="font-semibold text-gray-800 mb-1">{data.label}</p>
//         <p style={{ color: payload[0].fill }}>
//           Productivity: {payload[0].value.toFixed(2)}
//         </p>
//         <hr className="my-1 border-gray-200" />
//         <p className="text-xs text-gray-500">
//           Planned Production: {data.planned_production.toLocaleString()}
//         </p>
//         <p className="text-xs text-gray-500">
//           Actual Manpower: {data.actual_manpower.toLocaleString()}
//         </p>
//       </div>
//     );
//   }
//   return null;
// };

// // --- Main Component Props Definition ---
// interface Props {
//   factoryId: number | null;
//   startDate: string | null;
//   endDate: string | null;
//   timeView: 'Monthly' | 'Weekly';
// }

// const MonthPlanning: React.FC<Props> = ({ factoryId, startDate, endDate, timeView }) => {
  
//   // This is the PRIMARY defense against bad API calls.
//   // If props are missing, it generates a `null` URL.
//   const apiUrl = useMemo(() => {
//     if (!factoryId || !startDate || !endDate) {
//       return null;
//     }
//     const params = new URLSearchParams({
//       factory: factoryId.toString(),
//       start_date: startDate,
//       end_date: endDate,
//       group_by: timeView === 'Monthly' ? 'month' : 'week',
//     });
//     return `http://127.0.0.1:8000/production-plans/planning-data/?${params.toString()}`;
//   }, [factoryId, startDate, endDate, timeView]);

//   const { data: apiData, loading, error } = useFetch<ApiData>(apiUrl);
  
//   const chartData = useMemo(() => {
//     if (!apiData?.data) return [];
    
//     return apiData.data.map(item => {
//       const productivity = item.actual_manpower > 0
//         ? item.planned_production / item.actual_manpower
//         : 0;

//       return {
//         ...item, 
//         productivity: productivity,
//         name: item.label.substring(0, 3), // e.g., 'April' -> 'Apr', 'Week of' -> 'Wee'
//       };
//     });
//   }, [apiData]);

//   // --- Render Logic ---
//   if (loading) {
//     return (
//       <div className="w-full h-[400px] bg-white rounded-lg shadow-lg p-4 flex items-center justify-center text-gray-500">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
//         <span className="ml-3">Loading Productivity Data...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="w-full h-[400px] bg-white rounded-lg shadow-lg p-4 flex flex-col items-center justify-center text-red-600 text-center">
//         <div className="text-lg font-medium mb-1">Error Loading Data</div>
//         <div className="text-sm">{error}</div>
//       </div>
//     );
//   }
  
//   // Display a message if there are no filters selected OR if the API call was successful but returned no data.
//   if (!apiData || chartData.length === 0) {
//     return (
//        <div className="w-full h-[400px] bg-white rounded-lg shadow-lg p-4 flex flex-col items-center justify-center text-gray-500 text-center">
//         <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
//         <p className="font-semibold">No Data to Display</p>
//         <p className="text-sm">No productivity data found for the selected criteria.</p>
//       </div>
//     );
//   }
  
//   return (
//     <div className="w-full bg-white rounded-lg shadow-lg p-4">
//         <div className="flex items-center justify-center mb-4">
//             <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg px-6 py-3">
//               <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
//                 <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
//                 Productivity
//               </h2>
//             </div>
//         </div>
        

//         <div className="w-full h-[450px]">
//             <ResponsiveContainer width="100%" height="100%">
//             <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
//                 <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#666' }} axisLine={false} tickLine={false} />
//                 <YAxis label={{ value: 'Units per Operator', angle: -90, position: 'insideLeft', fill: '#666', dy: 40 }} tick={{ fontSize: 12, fill: '#666' }} axisLine={false} />
//                 <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(196, 181, 253, 0.4)' }} />
//                 <Legend verticalAlign="top" height={36} />
//                 <Bar dataKey="productivity" name="Productivity" fill="#6360dbff" radius={[4, 4, 0, 0]} />
//             </BarChart>
//             </ResponsiveContainer>
//         </div>
//     </div>
//   );
// };

// export default MonthPlanning;


import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

// --- Helper: A robust useFetch Hook ---
// This hook is smart enough to NOT fetch if the URL is null.
function useFetch<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This is the key defense: if the url is null, do absolutely nothing.
    if (!url) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        // Check for the existence of the `data` array in the response
        if (result && !result.data) {
          throw new Error(result.error || 'The API returned an error or unexpected format.');
        }
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [url]); // This effect only re-runs when the URL string itself changes.

  return { data, loading, error };
}

// --- Type Definitions matching the FINAL backend API response ---
interface DataPoint {
  label: string; // e.g., "April" or "Week of Apr 01"
  planned_production: number;
  actual_manpower: number;
}

// Updated to match the standalone function's response format
interface ApiData {
  success: boolean;
  data: DataPoint[];
}

// --- UI Sub-components ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg text-sm">
        <p className="font-semibold text-gray-800 mb-1">{data.label}</p>
        <p style={{ color: payload[0].fill }}>
          Productivity: {payload[0].value.toFixed(2)}
        </p>
        <hr className="my-1 border-gray-200" />
        <p className="text-xs text-gray-500">
          Planned Production: {data.planned_production.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500">
          Actual Manpower: {data.actual_manpower.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

// --- Main Component Props Definition (UPDATED) ---
interface Props {
  hqId: number | null;
  factoryId: number | null;
  departmentId: number | null;
  lineId: number | null;
  sublineId: number | null;
  stationId: number | null;
  startDate: string | null;
  endDate: string | null;
  timeView: 'Monthly' | 'Weekly';
}

const MonthPlanning: React.FC<Props> = ({ 
    // Updated function signature
    hqId,
    factoryId,
    departmentId,
    lineId,
    sublineId,
    stationId,
    startDate, 
    endDate, 
    timeView 
}) => {
  
  // --- API URL GENERATION (UPDATED) ---
  // Now includes all the new filter parameters.
  const apiUrl = useMemo(() => {
    if (!factoryId || !startDate || !endDate) {
      return null;
    }
    const params = new URLSearchParams({
      factory: factoryId.toString(),
      start_date: startDate,
      end_date: endDate,
      group_by: timeView === 'Monthly' ? 'month' : 'week',
    });
    // Add optional filters
    if (hqId) params.set('hq', hqId.toString());
    if (departmentId) params.set('department', departmentId.toString());
    if (lineId) params.set('line', lineId.toString());
    if (sublineId) params.set('subline', sublineId.toString());
    if (stationId) params.set('station', stationId.toString());

    // NOTE: This URL should match your standalone function's path from urls.py
    // return `http://127.0.0.1:8000/get-planning-data/?${params.toString()}`;
    return `http://127.0.0.1:8000/production-plans/planning-data/?${params.toString()}`;
  }, [hqId, factoryId, departmentId, lineId, sublineId, stationId, startDate, endDate, timeView]);

  const { data: apiData, loading, error } = useFetch<ApiData>(apiUrl);
  
  const chartData = useMemo(() => {
    if (!apiData?.data) return [];
    
    return apiData.data.map(item => {
      const productivity = item.actual_manpower > 0
        ? item.planned_production / item.actual_manpower
        : 0;

      return {
        ...item, 
        productivity: productivity,
        name: item.label.substring(0, 3), // e.g., 'April' -> 'Apr', 'Week of' -> 'Wee'
      };
    });
  }, [apiData]);

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="w-full h-[400px] bg-white rounded-lg shadow-lg p-4 flex items-center justify-center text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3">Loading Productivity Data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[400px] bg-white rounded-lg shadow-lg p-4 flex flex-col items-center justify-center text-red-600 text-center">
        <div className="text-lg font-medium mb-1">Error Loading Data</div>
        <div className="text-sm">{error}</div>
      </div>
    );
  }
  
  // Display a message if there are no filters selected OR if the API call was successful but returned no data.
  if (!apiData || chartData.length === 0) {
    return (
       <div className="w-full h-[400px] bg-white rounded-lg shadow-lg p-4 flex flex-col items-center justify-center text-gray-500 text-center">
        <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        <p className="font-semibold">No Data to Display</p>
        <p className="text-sm">No productivity data found for the selected criteria.</p>
      </div>
    );
  }
  
  const fyStartYear = startDate ? new Date(startDate).getFullYear() : null;

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg px-6 py-3">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Productivity {fyStartYear ? `(FY ${fyStartYear}-${fyStartYear + 1})` : ''}
              </h2>
            </div>
        </div>
        
        <div className="w-full h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#666' }} axisLine={false} tickLine={false} />
                <YAxis label={{ value: 'Units per Operator', angle: -90, position: 'insideLeft', fill: '#666', dy: 40 }} tick={{ fontSize: 12, fill: '#666' }} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(196, 181, 253, 0.4)' }} />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="productivity" name="Productivity" fill="#6360dbff" radius={[4, 4, 0, 0]} />
            </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
};

export default MonthPlanning;