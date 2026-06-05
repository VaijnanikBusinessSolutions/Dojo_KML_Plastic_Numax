

// import React, { useEffect, useState, useCallback } from 'react';
// import {
//   BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, Cell,
// } from 'recharts';

// // --- Interfaces ---
// interface ChartData {
//   name: string;
//   planned: number;
//   actual: number;
// }

// // --- Props Interface ---
// interface Props {
//   selectedFactoryId: number | null;
//   selectedShopFloorId: number | null;
//   selectedLineId: number | null;
//   selectedStationId: number | null;
//   startDate: string | null;
//   endDate: string | null;
//   selectedMonth: string | null;
//   selectedYear: number | null;
//   timeView: 'Monthly' | 'Weekly';
// }

// // --- Constants ---
// const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
// const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// const COLORS = {
//   planned: { past: '#A855F7', current: '#F97316', future: '#84CC16' },
//   actual: { past: '#EC4899', current: '#FACC15', future: '#16A34A' },
// };

// const ManpowerTrendChart: React.FC<Props> = ({
//   selectedFactoryId,
//   selectedShopFloorId,
//   selectedLineId,
//   selectedStationId,
//   startDate,
//   endDate,
//   selectedMonth = MONTHS[new Date().getMonth()], // Default to current month
//   selectedYear = new Date().getFullYear(), // Default to current year
//   timeView,
// }) => {
//   const [chartData, setChartData] = useState<ChartData[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   const getMonthStatus = useCallback((entry: ChartData): 'past' | 'current' | 'future' => {
//     if (!selectedYear || !selectedMonth) {
//       console.log('Missing selectedYear or selectedMonth, defaulting to current');
//       return 'current';
//     }

//     const currentDate = new Date();
//     const currentYear = currentDate.getFullYear();
//     const currentMonth = currentDate.getMonth(); // 0-based
//     const selectedMonthIndex = MONTHS.indexOf(selectedMonth);

//     if (timeView === 'Monthly') {
//       // Parse entry.name in format "Jan '25"
//       const match = entry.name.match(/^(\w{3})\s'(\d{2})$/);
//       if (!match) {
//         console.log(`Invalid month name format: ${entry.name}`);
//         return 'current';
//       }

//       const [, monthAbbr, yearStr] = match;
//       const entryMonthIndex = SHORT_MONTHS.indexOf(monthAbbr);
//       if (entryMonthIndex === -1) {
//         console.log(`Invalid month abbreviation: ${monthAbbr}`);
//         return 'current';
//       }

//       const entryYear = 2000 + parseInt(yearStr, 10); // Convert '25' to 2025

//       if (entryYear < selectedYear || (entryYear === selectedYear && entryMonthIndex < selectedMonthIndex)) {
//         return 'past';
//       } else if (entryYear > selectedYear || (entryYear === selectedYear && entryMonthIndex > selectedMonthIndex)) {
//         return 'future';
//       } else {
//         return 'current';
//       }
//     } else {
//       // Handle weekly view (assuming entry.name is "Week 1", "Week 2", etc.)
//       const weekMatch = entry.name.match(/Week (\d+)/);
//       if (!weekMatch) {
//         console.log(`Invalid week name: ${entry.name}`);
//         return 'current';
//       }
//       const weekNumber = parseInt(weekMatch[1], 10);
//       const currentWeek = Math.ceil((currentDate.getDate() + (currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1)) / 7);

//       if (selectedYear < currentYear || (selectedYear === currentYear && weekNumber < currentWeek)) {
//         return 'past';
//       } else if (selectedYear > currentYear || (selectedYear === currentYear && weekNumber > currentWeek)) {
//         return 'future';
//       } else {
//         return 'current';
//       }
//     }
//   }, [selectedYear, selectedMonth, timeView]);

//   const fetchData = useCallback(async () => {
//     if (!selectedFactoryId || !startDate || !endDate) {
//       console.log('Missing required props:', { selectedFactoryId, startDate, endDate });
//       setChartData([]);
//       setLoading(false);
//       return;
//     }
//     setLoading(true);
//     setError(null);

//     try {
//       const params = new URLSearchParams({
//         factory: String(selectedFactoryId),
//         start_date: startDate,
//         end_date: endDate,
//         data_key: 'production',
//         group_by: timeView === 'Weekly' ? 'weekly' : 'monthly',
//       });
//       if (selectedStationId) params.set('station', String(selectedStationId));
//       else if (selectedLineId) params.set('line', String(selectedLineId));
//       else if (selectedShopFloorId) params.set('shop_floor', String(selectedShopFloorId));

//       const url = `http://172.25.0.51:8000/production-data/trend-data/?${params.toString()}`;
//       console.log('Fetching from:', url);
//       const response = await fetch(url);
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log('API Response:', data);
//       setChartData(data);
//     } catch (e) {
//       console.error('Failed to load production data', e);
//       setError('Failed to load production data.');
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedFactoryId, selectedShopFloorId, selectedLineId, selectedStationId, startDate, endDate, timeView]);

//   useEffect(() => {
//     console.log('Props:', { selectedFactoryId, selectedShopFloorId, selectedLineId, selectedStationId, startDate, endDate, selectedMonth, selectedYear, timeView });
//     fetchData();
//   }, [fetchData]);

//   const CustomTooltip = ({ active, payload, label }: any) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl text-sm">
//           <p className="font-semibold text-gray-800 mb-3 text-base">{label}</p>
//           <div className="space-y-1">
//             {payload.map((entry: any, index: number) => (
//               <p key={index} className="flex items-center gap-2">
//                 <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }} />
//                 <span className="text-gray-600">{entry.dataKey === 'planned' ? 'Planned:' : 'Actual:'}</span>
//                 <span className="font-medium">{entry.value.toLocaleString()} Units</span>
//               </p>
//             ))}
//           </div>
//         </div>
//       );
//     }
//     return null;
//   };

//   const CustomLegend = () => {
//     return (
//       <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700 mt-2">
//         <span className="inline-flex items-center gap-1.5"><div className="w-2.5 h-2.5" style={{ backgroundColor: COLORS.planned.past }} /><span>Past Planned</span></span>
//         <span className="inline-flex items-center gap-1.5"><div className="w-2.5 h-2.5" style={{ backgroundColor: COLORS.actual.past }} /><span>Past Actual</span></span>
//         <span className="inline-flex items-center gap-1.5"><div className="w-2.5 h-2.5" style={{ backgroundColor: COLORS.planned.current }} /><span>Current Planned</span></span>
//         <span className="inline-flex items-center gap-1.5"><div className="w-2.5 h-2.5" style={{ backgroundColor: COLORS.actual.current }} /><span>Current Actual</span></span>
//         <span className="inline-flex items-center gap-1.5"><div className="w-2.5 h-2.5" style={{ backgroundColor: COLORS.planned.future }} /><span>Future Planned</span></span>
//         <span className="inline-flex items-center gap-1.5"><div className="w-2.5 h-2.5" style={{ backgroundColor: COLORS.actual.future }} /><span>Future Actual</span></span>
//       </div>
//     );
//   };

//   const renderContent = () => {
//     if (loading) {
//       return (
//         <div className="h-full flex items-center justify-center">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//             <p className="text-gray-500">Loading Chart Data...</p>
//           </div>
//         </div>
//       );
//     }
//     if (error) {
//       return (
//         <div className="h-full flex items-center justify-center">
//           <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg">
//             <p>{error}</p>
//           </div>
//         </div>
//       );
//     }
//     if (chartData.length > 0) {
//       return (
//         <ResponsiveContainer width="100%" height="100%">
//           <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
//             <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
//             <XAxis dataKey="name" tick={{ fill: '#474e5aff', fontSize: 12, fontWeight: 'bold' }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} interval={0} angle={0} textAnchor="middle" dy={10} />
//             <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4B5563', fontSize: 12 }} tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value as number)} />
//             <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(156, 163, 175, 0.1)' }} />
//             <Legend verticalAlign="bottom" height={40} content={<CustomLegend />} />
//             <Bar dataKey="planned" radius={[4, 4, 0, 0]} maxBarSize={50}>
//               {chartData.map((entry, index) => {
//                 const color = COLORS.planned[getMonthStatus(entry)];
//                 console.log(`Planned Bar: ${entry.name}, Status: ${getMonthStatus(entry)}, Color: ${color}`);
//                 return <Cell key={`cell-planned-${index}`} fill={color} />;
//               })}
//             </Bar>
//             <Bar dataKey="actual" radius={[4, 4, 0, 0]} maxBarSize={50}>
//               {chartData.map((entry, index) => {
//                 const color = COLORS.actual[getMonthStatus(entry)];
//                 console.log(`Actual Bar: ${entry.name}, Status: ${getMonthStatus(entry)}, Color: ${color}`);
//                 return <Cell key={`cell-actual-${index}`} fill={color} />;
//               })}
//             </Bar>
//           </BarChart>
//         </ResponsiveContainer>
//       );
//     }
//     return (
//       <div className="h-full flex items-center justify-center">
//         <div className="text-gray-400 text-center">
//           <p className="text-lg">No data available.</p>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="relative w-full h-[600px] bg-white rounded-xl shadow-lg p-6 flex flex-col manpower-trend-chart">
//       <div className="flex items-center justify-center mb-4 sm:mb-6">
//         <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg px-4 sm:px-6 py-2 sm:py-3">
//           <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
//             <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>
//             Production Plan vs Actual
//           </h2>
//         </div>
//       </div>
//       <div className="flex-grow">{renderContent()}</div>
//     </div>
//   );
// };

// export default ManpowerTrendChart;




import React, { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, Cell,
} from 'recharts';

// --- Interfaces ---
interface ChartData {
  name: string;
  planned: number;
  actual: number;
}

// --- Props Interface (UPDATED) ---
interface Props {
  selectedHqId: number | null;
  selectedFactoryId: number | null;
  selectedDepartmentId: number | null;
  selectedLineId: number | null;
  selectedSublineId: number | null;
  selectedStationId: number | null;
  startDate: string | null;
  endDate: string | null;
  selectedMonth: string | null;
  selectedYear: number | null;
  timeView: 'Monthly' | 'Weekly';
}

// --- Constants ---
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const COLORS = {
  planned: { past: '#A855F7', current: '#F97316', future: '#84CC16' },
  actual: { past: '#EC4899', current: '#FACC15', future: '#16A34A' },
};

const ManpowerTrendChart: React.FC<Props> = ({
  // Updated function signature
  selectedHqId,
  selectedFactoryId,
  selectedDepartmentId,
  selectedLineId,
  selectedSublineId,
  selectedStationId,
  startDate,
  endDate,
  selectedMonth = MONTHS[new Date().getMonth()],
  selectedYear = new Date().getFullYear(),
  timeView,
}) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // No changes needed for getMonthStatus
  const getMonthStatus = useCallback((entry: ChartData): 'past' | 'current' | 'future' => {
    if (!selectedYear || !selectedMonth) {
      return 'current';
    }
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-based
    const selectedMonthIndex = MONTHS.indexOf(selectedMonth);

    if (timeView === 'Monthly') {
      const match = entry.name.match(/^(\w{3})\s'(\d{2})$/);
      if (!match) return 'current';
      const [, monthAbbr, yearStr] = match;
      const entryMonthIndex = SHORT_MONTHS.indexOf(monthAbbr);
      if (entryMonthIndex === -1) return 'current';
      const entryYear = 2000 + parseInt(yearStr, 10);
      const actualSelectedYear = selectedMonthIndex < 3 ? selectedYear + 1 : selectedYear;
      if (entryYear < actualSelectedYear || (entryYear === actualSelectedYear && entryMonthIndex < selectedMonthIndex)) return 'past';
      if (entryYear > actualSelectedYear || (entryYear === actualSelectedYear && entryMonthIndex > selectedMonthIndex)) return 'future';
      return 'current';
    } else {
      const weekMatch = entry.name.match(/Week (\d+)/);
      if (!weekMatch) return 'current';
      const weekNumber = parseInt(weekMatch[1], 10);
      const currentWeek = Math.ceil((currentDate.getDate() + (currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1)) / 7);
      
      const actualSelectedYear = selectedMonthIndex < 3 ? selectedYear + 1 : selectedYear;
      if (actualSelectedYear < currentYear || (actualSelectedYear === currentYear && weekNumber < currentWeek)) return 'past';
      if (actualSelectedYear > currentYear || (actualSelectedYear === currentYear && weekNumber > currentWeek)) return 'future';
      return 'current';
    }
  }, [selectedYear, selectedMonth, timeView]);

  // --- DATA FETCHING (UPDATED) ---
  const fetchData = useCallback(async () => {
    if (!selectedFactoryId || !startDate || !endDate) {
      setChartData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Updated params to include all new filters
      const params = new URLSearchParams({
        factory: String(selectedFactoryId),
        start_date: startDate,
        end_date: endDate,
        data_key: 'production',
        group_by: timeView === 'Weekly' ? 'weekly' : 'monthly',
      });
      if (selectedHqId) params.set('hq', String(selectedHqId));
      if (selectedDepartmentId) params.set('department', String(selectedDepartmentId));
      if (selectedLineId) params.set('line', String(selectedLineId));
      if (selectedSublineId) params.set('subline', String(selectedSublineId));
      if (selectedStationId) params.set('station', String(selectedStationId));

      const url = `http://172.25.0.51:8000/production-data/trend-data/?${params.toString()}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setChartData(data);
    } catch (e) {
      console.error('Failed to load production data', e);
      setError('Failed to load production data.');
    } finally {
      setLoading(false);
    }
    // Updated dependency array
  }, [selectedHqId, selectedFactoryId, selectedDepartmentId, selectedLineId, selectedSublineId, selectedStationId, startDate, endDate, timeView]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- No changes needed below this line ---

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl text-sm">
          <p className="font-semibold text-gray-800 mb-3 text-base">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <p key={index} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }} />
                <span className="text-gray-600">{entry.dataKey === 'planned' ? 'Planned:' : 'Actual:'}</span>
                <span className="font-medium">{entry.value.toLocaleString()} Units</span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = () => {
    return (
      <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700 mt-2">
        <span className="inline-flex items-center gap-1.5"><div className="w-2.5 h-2.5" style={{ backgroundColor: COLORS.planned.past }} /><span>Past Planned</span></span>
        <span className="inline-flex items-center gap-1.5"><div className="w-2.5 h-2.5" style={{ backgroundColor: COLORS.actual.past }} /><span>Past Actual</span></span>
        <span className="inline-flex items-center gap-1.5"><div className="w-2.5 h-2.5" style={{ backgroundColor: COLORS.planned.current }} /><span>Current Planned</span></span>
        <span className="inline-flex items-center gap-1.5"><div className="w-2.5 h-2.5" style={{ backgroundColor: COLORS.actual.current }} /><span>Current Actual</span></span>
        <span className="inline-flex items-center gap-1.5"><div className="w-2.5 h-2.5" style={{ backgroundColor: COLORS.planned.future }} /><span>Future Planned</span></span>
        <span className="inline-flex items-center gap-1.5"><div className="w-2.5 h-2.5" style={{ backgroundColor: COLORS.actual.future }} /><span>Future Actual</span></span>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading Chart Data...</p>
          </div>
        </div>
      );
    }
    if (error) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg">
            <p>{error}</p>
          </div>
        </div>
      );
    }
    if (chartData.length > 0) {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#474e5aff', fontSize: 12, fontWeight: 'bold' }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} interval={0} angle={0} textAnchor="middle" dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4B5563', fontSize: 12 }} tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value as number)} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(156, 163, 175, 0.1)' }} />
            <Legend verticalAlign="bottom" height={40} content={<CustomLegend />} />
            <Bar dataKey="planned" radius={[4, 4, 0, 0]} maxBarSize={50}>
              {chartData.map((entry, index) => <Cell key={`cell-planned-${index}`} fill={COLORS.planned[getMonthStatus(entry)]} />)}
            </Bar>
            <Bar dataKey="actual" radius={[4, 4, 0, 0]} maxBarSize={50}>
              {chartData.map((entry, index) => <Cell key={`cell-actual-${index}`} fill={COLORS.actual[getMonthStatus(entry)]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-400 text-center">
          <p className="text-lg">No data available.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-[600px] bg-white rounded-xl shadow-lg p-6 flex flex-col manpower-trend-chart">
      <div className="flex items-center justify-center mb-4 sm:mb-6">
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg px-4 sm:px-6 py-2 sm:py-3">
          <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>
            Production Plan vs Actual (FY {selectedYear}-{selectedYear ? selectedYear + 1 : ''})
          </h2>
        </div>
      </div>
      <div className="flex-grow">{renderContent()}</div>
    </div>
  );
};

export default ManpowerTrendChart;