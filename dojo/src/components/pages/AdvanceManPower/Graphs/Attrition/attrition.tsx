// import React, { useEffect, useState } from 'react';
// import {
//   AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Legend,
// } from 'recharts';

// interface AttritionProps {
//   hqId: string | null; // Changed to string to match your other files, adjust if numbers are strictly used
//   factoryId: string | null;
//   departmentId: string | null;
//   lineId: string | null;
//   sublineId: string | null;
//   stationId: string | null;
//   selectedYear?: number; 
// }

// const API_BASE_URL = "http://172.25.0.51:8000";

// // Labels ordered for Financial Year
// const monthNames = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

// const AttritionTrendChart: React.FC<AttritionProps> = ({ 
//   hqId, factoryId, departmentId, lineId, sublineId, stationId, selectedYear 
// }) => {
//   const [data, setData] = useState<any[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   // Fallback for year display
//   const displayYear = selectedYear || new Date().getFullYear();

//   useEffect(() => {
//     const fetchData = async () => {
//       // If your logic requires a factoryId to load, keep this. 
//       // Otherwise remove this check if you want to load HQ data without a factory selected.
//       /* 
//       if (!factoryId) {
//         setLoading(false);
//         return;
//       }
//       */

//       try {
//         setLoading(true);
//         setError(null);

//         const params = new URLSearchParams();
//         params.append('year', displayYear.toString());

//         if (hqId) params.append('hq', hqId.toString());
//         if (factoryId) params.append('factory', factoryId.toString());
//         if (departmentId) params.append('department', departmentId.toString());
//         if (lineId) params.append('line', lineId.toString());
//         if (sublineId) params.append('subline', sublineId.toString());
//         if (stationId) params.append('station', stationId.toString());

//         const response = await fetch(`${API_BASE_URL}/chart/attrition-trend/?${params.toString()}`);
        
//         if (!response.ok) throw new Error('Failed to fetch data');
        
//         const apiData = await response.json();

//         // --- DATA MAPPING LOGIC (Financial Year) ---
//         const fullYearData = monthNames.map((name, index) => {
//             // Logic: Map array index (0-11) to Calendar Month (1-12)
//             // Index 0 (Apr) -> Month 4
//             // Index 8 (Dec) -> Month 12
//             // Index 9 (Jan) -> Month 1
            
//             let apiMonth = index + 4;
//             if (apiMonth > 12) apiMonth -= 12;

//             const found = apiData.find((d: any) => d.month === apiMonth);
            
//             return {
//                 name: name,
//                 attrition: found ? found.attrition_rate : 0,
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
//   }, [hqId, factoryId, departmentId, lineId, sublineId, stationId, selectedYear, displayYear]);

//   const CustomLegend = () => (
//     <div className="text-sm text-gray-600 text-center mt-2">
//       <span className="inline-flex items-center gap-2">
//         <div className="w-3 h-3 rounded-full bg-[#007bff]" />
//         Attrition Rate
//       </span>
//     </div>
//   );

//   if (loading) return <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>;
//   if (error) return <div className="flex items-center justify-center h-full text-red-500">{error}</div>;

//   return (
//     <div className="w-full h-[350px] bg-white rounded-lg shadow-lg p-4">
//       <h2 className="text-center text-lg font-semibold mb-2 text-gray-700">
//         Attrition Rate Trend 
        
//       </h2>
      
//       <ResponsiveContainer width="100%" height="90%">
        
//         <AreaChart 
//             data={data} 
//             margin={{ top: 20, right: 20, left: 20, bottom: 0 }} // Added left/right margin
//         >
          
          
//           <defs>
//             <linearGradient id="colorAttrition" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%" stopColor="#007bff" stopOpacity={0.8}/>
//               <stop offset="95%" stopColor="#007bff" stopOpacity={0.1}/>
//             </linearGradient>
//           </defs>
          
//           <XAxis 
//             dataKey="name" 
//             axisLine={false} 
//             tickLine={false} 
//             interval={0}  // <--- FIXED: Forces all labels (Apr-Mar) to show
//             padding={{ left: 10, right: 10 }} // <--- FIXED: Adds breathing room so Apr/Mar aren't cut off
//           />
          
//           <YAxis hide domain={[0, 'dataMax + 5']} />
//           <Tooltip formatter={(value: number) => [`${value}%`, 'Attrition']} />
//           <Legend content={<CustomLegend />} verticalAlign="top" height={36}/>
          
//           <Area 
//             type="monotone" 
//             dataKey="attrition" 
//             stroke="#007bff" 
//             fillOpacity={1} 
//             fill="url(#colorAttrition)" 
//           >
//             <LabelList 
//                 dataKey="attrition" 
//                 position="top" 
//                 formatter={(val: number) => val > 0 ? `${val}%` : ''} 
//                 fontSize={12} 
//             />
//           </Area>
//         </AreaChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default AttritionTrendChart;




import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Legend,
} from 'recharts';

interface AttritionProps {
  hqId: string | null;
  factoryId: string | null;
  departmentId: string | null;
  lineId: string | null;
  sublineId: string | null;
  stationId: string | null;
  selectedYear?: number; 
}

const API_BASE_URL = "http://172.25.0.51:8000";

// Financial Year Configuration: April to March
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

const AttritionTrendChart: React.FC<AttritionProps> = ({ 
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

        // --- DYNAMIC YEAR LOGIC ---
        const today = new Date();
        const currentMonth = today.getMonth(); // 0 = Jan, 11 = Dec
        const currentYear = today.getFullYear();

        // Calculate Start Year based on System Date
        // If Jan(0), Feb(1), or Mar(2), the FY started last year.
        const fyStartYear = selectedYear 
            ? selectedYear 
            : (currentMonth < 3 ? currentYear - 1 : currentYear);

        const params = new URLSearchParams();
        params.append('year', fyStartYear.toString());

        if (hqId) params.append('hq', hqId);
        if (factoryId) params.append('factory', factoryId);
        if (departmentId) params.append('department', departmentId);
        if (lineId) params.append('line', lineId);
        if (sublineId) params.append('subline', sublineId);
        if (stationId) params.append('station', stationId);

        const response = await fetch(`${API_BASE_URL}/chart/attrition-trend/?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const apiData = await response.json();

        // --- DATA MAPPING LOGIC ---
        // Map the API results (which have month IDs) to our Fixed April-March Labels
        const fullYearData = financialYearConfig.map((config) => {
            // Find the data point that matches the month ID (e.g., 4 for April, 1 for Jan)
            const found = apiData.find((d: any) => d.month === config.id);
            
            return {
                name: config.name,
                attrition: found ? found.attrition_rate : 0,
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

  const CustomLegend = () => (
    <div className="text-sm text-gray-600 text-center mt-2">
      <span className="inline-flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-[#007bff]" />
        Attrition Rate
      </span>
    </div>
  );

  if (loading) return <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-full text-red-500">{error}</div>;

  return (
    <div className="w-full h-[350px] bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-center text-lg font-semibold mb-2 text-gray-700">
        Attrition Rate Trendd– FY {displayFY}
      </h2>
      
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart 
            data={data} 
            margin={{ top: 20, right: 20, left: 20, bottom: 0 }} 
        >
          <defs>
            <linearGradient id="colorAttrition" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#007bff" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#007bff" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            interval={0} 
            padding={{ left: 10, right: 10 }} 
          />
          
          <YAxis hide domain={[0, 'dataMax + 2']} />
          <Tooltip 
            cursor={{ stroke: '#007bff', strokeWidth: 1, strokeDasharray: '4 4' }}
            formatter={(value: number) => [`${value}%`, 'Attrition']} 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend content={<CustomLegend />} verticalAlign="top" height={36}/>
          
          <Area 
            type="monotone" 
            dataKey="attrition" 
            stroke="#007bff" 
            fillOpacity={1} 
            fill="url(#colorAttrition)" 
          >
            <LabelList 
                dataKey="attrition" 
                position="top" 
                formatter={(val: number) => val > 0 ? `${val}%` : ''} 
                fontSize={12} 
            />
          </Area>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttritionTrendChart;