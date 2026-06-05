


// import React, { useEffect, useState } from 'react';
// import {
//   AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Legend,
// } from 'recharts';

// interface AbsenteeismProps {
//   hqId: number | null;
//   factoryId: number | null;
//   departmentId: number | null;
//   lineId: number | null;
//   sublineId: number | null;
//   stationId: number | null;
//   selectedYear?: number; 
//   // We ignore startDate/endDate for Monthly trend, similar to others
//   startDate?: string | null;
//   endDate?: string | null;
//   timeView?: 'Monthly' | 'Weekly';
//   selectedMonth?: string; 
//   selectedWeek?: string;
// }

// const API_BASE_URL = "http://127.0.0.1:8000";

// const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// const Absenteeism: React.FC<AbsenteeismProps> = ({ 
//   hqId, factoryId, departmentId, lineId, sublineId, stationId, selectedYear 
// }) => {
//   const [data, setData] = useState<any[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [containerWidth, setContainerWidth] = useState<number>(560);

//   useEffect(() => {
//     const handleResize = () => {
//       const container = document.getElementById('absentee-chart-container');
//       if (container) setContainerWidth(container.clientWidth);
//     };
//     handleResize();
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!factoryId) {
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);
//         setError(null);

//         const params = new URLSearchParams();
//         params.append('year', selectedYear ? selectedYear.toString() : new Date().getFullYear().toString());

//         // All Logic
//         if (hqId) params.append('hq', hqId.toString());
//         if (factoryId) params.append('factory', factoryId.toString());
//         if (departmentId) params.append('department', departmentId.toString());
//         if (lineId) params.append('line', lineId.toString());
//         if (sublineId) params.append('subline', sublineId.toString());
//         if (stationId) params.append('station', stationId.toString());

//         const response = await fetch(`${API_BASE_URL}/chart/absenteeism-trend/?${params.toString()}`);
        
//         if (!response.ok) throw new Error('Failed to fetch data');
        
//         const apiData = await response.json();

//         // Transform & Zero-Fill
//         const fullYearData = Array.from({ length: 12 }, (_, i) => {
//             const monthIndex = i + 1;
//             const found = apiData.find((d: any) => d.month === monthIndex);
//             return {
//                 month: monthNames[i],
//                 absenteeism: found ? found.absenteeism_rate : 0,
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

//   const CustomLegend = () => (
//     <div className="text-xs sm:text-sm text-gray-600 text-center mt-3">
//       <span className="inline-flex items-center gap-1 sm:gap-2">
//         <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#ff4d4d]" />
//         Absenteeism Rate
//       </span>
//     </div>
//   );

//   const labelFontSize = containerWidth < 500 ? 10 : 12;
//   const tickFontSize = containerWidth < 500 ? 10 : 12;

//   if (loading) return <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>;
//   if (error) return <div className="flex items-center justify-center h-full text-red-500">{error}</div>;

//   return (
//     <div id="absentee-chart-container" className="relative w-full h-[350px] bg-white rounded-lg shadow-lg p-4">
//       <h2 className="text-center text-lg font-semibold mb-2 text-gray-700">
//         Absenteeism Rate Trend ({selectedYear})
//       </h2>
//       <ResponsiveContainer width="100%" height="90%">
//         <AreaChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
//           <defs>
//             <linearGradient id="colorAbsentee" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#ff4d4d" stopOpacity={0.8}/>
//                 <stop offset="95%" stopColor="#ff4d4d" stopOpacity={0.1}/>
//             </linearGradient>
//           </defs>
//           <XAxis dataKey="month" tick={{ fontSize: tickFontSize }} axisLine={false} tickLine={false} />
//           <YAxis hide domain={[0, 'dataMax + 2']} />
//           <Legend verticalAlign="bottom" height={40} content={<CustomLegend />} />
//           <Tooltip formatter={(value: number) => [`${value}%`, 'Absentee Rate']} />
          
//           <Area type="monotone" dataKey="absenteeism" stroke="#ff4d4d" fill="url(#colorAbsentee)">
//             <LabelList dataKey="absenteeism" position="top" fontSize={labelFontSize} formatter={(v: number) => v > 0 ? `${v}%` : ''} />
//           </Area>
//         </AreaChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default Absenteeism;




import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, CartesianGrid
} from 'recharts';

interface AbsenteeismProps {
  hqId: number | null;
  factoryId: number | null;
  departmentId: number | null;
  lineId: number | null;
  sublineId: number | null;
  stationId: number | null;
  selectedYear?: number;
}

const API_BASE_URL = "http://127.0.0.1:8000";

// FISCAL YEAR ORDER (Apr - Mar)
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

const Absenteeism: React.FC<AbsenteeismProps> = ({
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

        // --- AUTOMATIC YEAR SWITCH LOGIC ---
        const today = new Date();
        const currentMonth = today.getMonth(); // 0 = Jan, 11 = Dec
        const currentYear = today.getFullYear();
        
        // If Jan, Feb, Mar -> Start Year is Previous Year
        const fyStartYear = selectedYear 
            ? selectedYear 
            : (currentMonth < 3 ? currentYear - 1 : currentYear);

        const params = new URLSearchParams();
        params.append('year', fyStartYear.toString());

        if (hqId) params.append('hq', hqId.toString());
        if (factoryId) params.append('factory', factoryId.toString());
        if (departmentId) params.append('department', departmentId.toString());
        if (lineId) params.append('line', lineId.toString());
        if (sublineId) params.append('subline', sublineId.toString());
        if (stationId) params.append('station', stationId.toString());

        // Single Fetch (Backend now handles the overlap)
        const response = await fetch(`${API_BASE_URL}/chart/absenteeism-trendlive/?${params.toString()}`);

        if (!response.ok) throw new Error("Failed to fetch data");

        const apiData = await response.json();

        // --- MAP DATA TO APR-MAR LABELS ---
        const fullYearData = financialYearConfig.map((config) => {
          const found = apiData.find((d: any) => d.month === config.id);

          return {
            month: config.name,
            absenteeism: found ? found.absenteeism_rate : 0,
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

  if (loading) return <div className="h-[350px] flex items-center justify-center text-gray-500 animate-pulse">Loading Chart...</div>;
  if (error) return <div className="h-[350px] flex items-center justify-center text-red-500">Error loading data</div>;

  return (
    <div id="absentee-chart-container" className="w-full h-[350px] bg-white rounded-lg shadow-md p-4 border border-gray-100 flex flex-col">
      <div className="flex flex-col items-center justify-center mb-4 px-2 w-full gap-1">
        <h2 className="text-lg font-semibold text-gray-700">
          Absenteeism Rate Trendd– FY {displayFY}
        </h2>
        <div className="text-xs sm:text-sm text-gray-600">
          <span className="inline-flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#007bff]" />
            Absenteeism Rate 
          </span>
        </div>
      </div>

      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorAbsentee" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#007bff" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#007bff" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              interval={0} 
              padding={{ left: 20, right: 20 }}
              dy={10}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: number) => [`${value}%`, 'Absentee Rate']} 
              cursor={{ stroke: '#007bff', strokeWidth: 1, strokeDasharray: '5 5' }}
            />
            <Area
              type="monotone"
              dataKey="absenteeism"
              stroke="#007bff"
              strokeWidth={2}
              fill="url(#colorAbsentee)"
              animationDuration={1500}
            >
              <LabelList
                dataKey="absenteeism"
                position="top"
                offset={10}
                fontSize={11}
                fill="#007bff"
                formatter={(v: number) => v > 0 ? `${v}%` : ''}
              />
            </Area>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Absenteeism;



