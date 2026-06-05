




// import React, { useEffect, useState } from 'react';
// import {
//   BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList,
// } from 'recharts';

// // 1. Update Props Interface
// interface ManpowerTrendProps {
//   hqId: number | null;
//   factoryId: number | null;
//   departmentId: number | null;
//   lineId: number | null;
//   sublineId: number | null;
//   stationId: number | null;
  
//   // Optional: If you want to filter by specific dates passed from parent
//   selectedYear?: number; 
//   selectedMonth?: string; 
//   startDate?: string | null;
//   endDate?: string | null;
//   timeView?: 'Monthly' | 'Weekly';
// }

// const API_BASE_URL = "http://127.0.0.1:8000";

// const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// const ManpowerTrendChart: React.FC<ManpowerTrendProps> = ({ 
//   hqId, factoryId, departmentId, lineId, sublineId, stationId, selectedYear 
// }) => {
//   const [data, setData] = useState<any[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!factoryId) {
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);
//         setError(null);

//         // Build Params
//         const params = new URLSearchParams();
//         // Use selectedYear prop or default to 2025 (or current year)
//         params.append('year', selectedYear ? selectedYear.toString() : new Date().getFullYear().toString());

//         // "All" Logic: Only append if not null
//         if (hqId) params.append('hq', hqId.toString());
//         if (factoryId) params.append('factory', factoryId.toString());
//         if (departmentId) params.append('department', departmentId.toString());
//         if (lineId) params.append('line', lineId.toString());
//         if (sublineId) params.append('subline', sublineId.toString());
//         if (stationId) params.append('station', stationId.toString());

//         // Call the NEW Aggregation Endpoint
//         const response = await fetch(`${API_BASE_URL}/chart/advanced-manpower-trend/?${params.toString()}`);
        
//         if (!response.ok) throw new Error('Failed to fetch data');
        
//         const apiData = await response.json();

//         // Transform for Chart
//         // We create a full 12-month array to ensure the X-Axis is stable
//         const fullYearData = Array.from({ length: 12 }, (_, i) => {
//             const monthIndex = i + 1;
//             const found = apiData.find((d: any) => d.month === monthIndex);
//             return {
//                 name: `${monthNames[i]}`, // X-Axis Label
//                 Required: found ? found.operators_required : 0,
//                 Available: found ? found.operators_available : 0,
//             };
//         });

//         setData(fullYearData);

//       } catch (err: any) {
//         console.error(err);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [hqId, factoryId, departmentId, lineId, sublineId, stationId, selectedYear]);

//   if (loading) return <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>;
//   if (error) return <div className="flex items-center justify-center h-full text-red-500">Error: {error}</div>;

//   return (
//     <div className="w-full h-[350px] bg-white rounded-lg shadow-lg p-4">
//       <h2 className="text-lg font-semibold mb-4 text-center text-gray-700">
//         Manpower Availability Trend ({selectedYear})
//       </h2>
//       <ResponsiveContainer width="100%" height="80%">
//         <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
//           <XAxis dataKey="name" axisLine={false} tickLine={false} />
//           <YAxis hide />
//           <Tooltip 
//             cursor={{ fill: '#f3f4f6' }}
//             contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
//           />
//           <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '20px' }} />
          
//           <Bar dataKey="Required" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={20}>
//             <LabelList dataKey="Required" position="top" fontSize={10} formatter={(v: number) => v > 0 ? v : ''} />
//           </Bar>
          
//           <Bar dataKey="Available" fill="#1E3A8A" radius={[4, 4, 0, 0]} barSize={20}>
//             <LabelList dataKey="Available" position="top" fontSize={10} formatter={(v: number) => v > 0 ? v : ''} />
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default ManpowerTrendChart;




import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList,
} from 'recharts';
import type { LegendProps } from 'recharts';

// ... (Keep your existing renderCustomLegend and LegendProps here) ...

const renderCustomLegend = (props: LegendProps) => {
  const { payload } = props;
  if (!payload) return null;

  const order: Record<string, number> = { Required: 0, Available: 1 };

  const sorted = [...payload].sort((a, b) => {
    const aKey = String(a.value);
    const bKey = String(b.value);
    return (order[aKey] ?? 99) - (order[bKey] ?? 99);
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
      {sorted.map((entry, index) => (
        <div
          key={`item-${index}`}
          style={{ display: 'flex', alignItems: 'center', marginRight: 16 }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 13,
              height: 13,
              marginRight: 4,
              backgroundColor: entry.color || '#000',
              borderRadius: 8,
            }}
          />
          <span style={{ fontSize: 12, color: '#374151' }}>
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

interface ManpowerTrendProps {
  hqId: number | null;
  factoryId: number | null;
  departmentId: number | null;
  lineId: number | null;
  sublineId: number | null;
  stationId: number | null;
  selectedYear?: number;
}

const API_BASE_URL = "http://127.0.0.1:8000";

// Ordered sequence for Graph Labels
const financialYearConfig = [
  { name: "Apr", id: 4 },
  { name: "May", id: 5 },
  { name: "Jun", id: 6 },
  { name: "Jul", id: 7 },
  { name: "Aug", id: 8 },
  { name: "Sep", id: 9 },
  { name: "Oct", id: 10 },
  { name: "Nov", id: 11 },
  { name: "Dec", id: 12 },
  { name: "Jan", id: 1 },
  { name: "Feb", id: 2 },
  { name: "Mar", id: 3 },
];

const COLORS = {
  Required: "#3B82F6",
  Available: "#1E3A8A",
};

const ManpowerTrendChart: React.FC<ManpowerTrendProps> = ({
  hqId, factoryId, departmentId, lineId, sublineId, stationId, selectedYear
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
    const displayFY = selectedYear 
    ? `${selectedYear}-${(selectedYear + 1).toString().slice(-2)}`
    : (() => {
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();
        const fyStart = month < 3 ? year - 1 : year;
        return `${fyStart}-${(fyStart + 1).toString().slice(-2)}`;
      })();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // --- LOGIC CHANGE START ---
        const today = new Date();
        const currentMonth = today.getMonth(); // 0=Jan, 11=Dec
        const currentYear = today.getFullYear();

        // If selectedYear is not passed via props, calculate FY Start Year
        // If Jan(0), Feb(1), Mar(2) -> Start Year is previous year
        const fyStartYear = selectedYear 
            ? selectedYear 
            : (currentMonth < 3 ? currentYear - 1 : currentYear);
            
        const params = new URLSearchParams();
        params.append('year', fyStartYear.toString());
        // --- LOGIC CHANGE END ---

        if (hqId) params.append('hq', hqId.toString());
        if (factoryId) params.append('factory', factoryId.toString());
        if (departmentId) params.append('department', departmentId.toString());
        if (lineId) params.append('line', lineId.toString());
        if (sublineId) params.append('subline', sublineId.toString());
        if (stationId) params.append('station', stationId.toString());

        const response = await fetch(`${API_BASE_URL}/chart/total-stats/?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch data');
        const apiData = await response.json();

        // Map backend data to the fixed Financial Year Label order
        const fullYearData = financialYearConfig.map((config) => {
          // apiData now contains correct months from different years 
          // (e.g., month 1 is Jan 2026, month 12 is Dec 2025)
          const monthData = apiData.find((d: any) => d.month === config.id);
          return {
            name: config.name,
            Required: monthData ? monthData.total_required : 0,
            Available: monthData ? monthData.total_available : 0,
          };
        });
        setData(fullYearData);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hqId, factoryId, departmentId, lineId, sublineId, stationId, selectedYear]);

  if (loading) return <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-full text-red-500">Error: {error}</div>;

  const customLegendData = [
    { id: 'Required', value: 'Required', type: 'square', color: COLORS.Required },
    { id: 'Available', value: 'Available', type: 'square', color: COLORS.Available },
  ];

  return (
    <div className="w-full h-[350px] bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-lg font-semibold mb-4 text-center text-gray-700">
        Manpower Availability Trendd– FY {displayFY}
      </h2>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip
            cursor={{ fill: '#f3f4f6' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend
            verticalAlign="top"
            iconType="circle"
            align="center"
            wrapperStyle={{ paddingBottom: '20px' }}
            content={renderCustomLegend}
          />
          <Bar
            dataKey="Required"
            fill={COLORS.Required}
            radius={[4, 4, 0, 0]}
            barSize={20}
            name="Required"
          >
            <LabelList
              dataKey="Required"
              position="top"
              fontSize={10}
              formatter={(label: React.ReactNode) => {
                const value = Number(label);
                return value > 0 ? label : '';
              }}
            />
          </Bar>
          <Bar
            dataKey="Available"
            fill={COLORS.Available}
            radius={[4, 4, 0, 0]}
            barSize={20}
            name="Available"
          >
            <LabelList
              dataKey="Available"
              position="top"
              fontSize={10}
              formatter={(label: React.ReactNode) => {
                const value = Number(label);
                return value > 0 ? label : '';
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ManpowerTrendChart;