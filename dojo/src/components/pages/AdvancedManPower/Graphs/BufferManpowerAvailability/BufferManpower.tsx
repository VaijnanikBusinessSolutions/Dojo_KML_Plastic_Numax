// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import {
//   BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, Cell,
// } from 'recharts';

// // --- CONFIGURATION ---
// const API_BASE_URL = 'http://172.25.0.51:8000/';

// // --- PASTEL COLORS FOR BARS ---
// const PASTEL_COLORS = ['#B5C7F5', '#F5C7E8', '#C7F5D4', '#F5E6C7', '#E8C7F5', '#C7E8F5', '#F5D4C7', '#D4F5C7'];

// // --- HELPER FUNCTIONS ---
// // These are needed to calculate the display label for the weekly view
// const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// const getWeeksForMonth = (year: number, month: string) => {
//   const weeks = [];
//   const monthIndex = MONTHS.indexOf(month);
//   if (monthIndex < 0) return [];
//   const firstDayOfMonth = new Date(year, monthIndex, 1);
//   const lastDayOfMonth = new Date(year, monthIndex + 1, 0);
//   let currentWeekStart = new Date(firstDayOfMonth);
//   currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
//   while (currentWeekStart <= lastDayOfMonth) {
//       const weekStartDate = new Date(currentWeekStart);
//       if (weekStartDate.getMonth() === monthIndex || (new Date(weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000)).getMonth() === monthIndex) {
//           const label = `Week of ${weekStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
//           weeks.push({ value: weekStartDate.toISOString().split('T')[0], label });
//       }
//       currentWeekStart.setDate(currentWeekStart.getDate() + 7);
//   }
//   return weeks;
// };


// // --- INTERFACES ---
// interface LevelManpowerData {
//   name: string;
//   operators_required: number;
//   net_available: number;
//   gap: number;
// }
// interface BufferAnalysisResponse {
//   lost_production_due_to_operator_gap: number;
//   manpower_analysis_by_level: LevelManpowerData[];
// }
// interface ChartData {
//   name: string;
//   lost_production_level: number;
//   level_gap: number;
// }

// // --- PROPS INTERFACE ---
// interface Props {
//   selectedFactoryId: number | null;
//   selectedShopFloorId: number | null;
//   selectedLineId: number | null;
//   selectedStationId: number | null;
//   startDate: string | null;
//   endDate: string | null; // This prop is passed but not used in the current logic
//   // New props received from parent to determine the display label
//   timeView: 'Monthly' | 'Weekly';
//   selectedMonth: string;
//   selectedYear: number;
//   selectedWeek: string;
// }

// // --- CUSTOM TOOLTIP COMPONENT ---
// const CustomTooltip = ({ active, payload, label, lossPerOperator }: any) => {
//   if (active && payload && payload.length) {
//     const dataPoint: ChartData = payload[0].payload;
//     return (
//       <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl text-sm w-64">
//         <p className="font-semibold text-gray-800 mb-3 text-base">{label}</p>
//         <p className="font-semibold text-xs text-gray-500 uppercase mb-2">Calculation Breakdown</p>
//         <div className="space-y-1 text-xs text-gray-700">
//           <p className="flex justify-between">
//             <span>Manpower Gap for this Level:</span>
//             <span className="font-medium">{dataPoint.level_gap.toLocaleString()}</span>
//           </p>
//           <p className="flex justify-between">
//             <span>Avg. Lost Production / Gap:</span>
//             <span className="font-medium">{lossPerOperator.toFixed(2)}</span>
//           </p>
//         </div>
//         <hr className="my-2 border-gray-200" />
//         <p className="flex justify-between font-bold text-gray-700">
//           <span>Estimated Lost Production:</span>
//           <span>{Math.round(dataPoint.lost_production_level).toLocaleString()} Units</span>
//         </p>
//       </div>
//     );
//   }
//   return null;
// };

// // --- MAIN COMPONENT ---
// const BufferManpowerAvailability: React.FC<Props> = ({
//   selectedFactoryId,
//   selectedShopFloorId,
//   selectedLineId,
//   selectedStationId,
//   startDate,
//   timeView,
//   selectedMonth,
//   selectedYear,
//   selectedWeek,
// }) => {
//   const [analysisData, setAnalysisData] = useState<BufferAnalysisResponse | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   // --- DATA FETCHING ---
//   const fetchData = useCallback(async () => {
//     if (!selectedFactoryId || !startDate) {
//       setAnalysisData(null);
//       setLoading(false);
//       return;
//     }
//     setLoading(true);
//     setError(null);
//     try {
//       const params = new URLSearchParams({ factory: String(selectedFactoryId), start_date: startDate });
//       if (selectedStationId) params.set('station', String(selectedStationId));
//       else if (selectedLineId) params.set('line', String(selectedLineId));
//       else if (selectedShopFloorId) params.set('shop_floor', String(selectedShopFloorId));
      
//       const response = await fetch(`${API_BASE_URL}/production-data/buffer-analysis/?${params.toString()}`);
//       if (!response.ok) {
//         const errData = await response.json().catch(() => ({}));
//         throw new Error(errData.error || `Failed to fetch buffer analysis: ${response.status}`);
//       }
//       const result: BufferAnalysisResponse = await response.json();
//       setAnalysisData(result);
//     } catch (err: any) {
//       setError(err.message || 'An unknown error occurred.');
//       setAnalysisData(null);
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedFactoryId, selectedShopFloorId, selectedLineId, selectedStationId, startDate]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   // --- DATA TRANSFORMATION FOR CHART ---
//   const { chartData, lossPerOperator } = useMemo(() => {
//     if (!analysisData?.manpower_analysis_by_level) {
//       return { chartData: [], lossPerOperator: 0 };
//     }
//     const levels = analysisData.manpower_analysis_by_level;
//     const totalLostProduction = analysisData.lost_production_due_to_operator_gap;
//     const totalGap = levels.reduce((sum, level) => sum + level.gap, 0);
//     const calculatedLossPerOperator = totalGap > 0 ? totalLostProduction / totalGap : 0;
//     const transformedData: ChartData[] = levels.map(level => ({
//       name: level.name,
//       lost_production_level: level.gap * calculatedLossPerOperator,
//       level_gap: level.gap,
//     }));
//     return { chartData: transformedData, lossPerOperator: calculatedLossPerOperator };
//   }, [analysisData]);
  
//   // --- LOGIC TO CREATE THE DISPLAY LABEL FOR SUBTITLE ---
//   const periodLabel = useMemo(() => {
//     if (timeView === 'Monthly') {
//       return selectedMonth;
//     }
//     if (timeView === 'Weekly') {
//       if (!selectedWeek || !selectedYear || !selectedMonth) return null;
//       const weeksForMonth = getWeeksForMonth(selectedYear, selectedMonth);
//       const selectedWeekObject = weeksForMonth.find(week => week.value === selectedWeek);
//       return selectedWeekObject ? selectedWeekObject.label : null;
//     }
//     return null;
//   }, [timeView, selectedMonth, selectedYear, selectedWeek]);

//   // --- RENDER LOGIC ---
//   const renderContent = () => {
//     if (loading) return <div className="h-full flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div><p className="text-gray-500">Calculating Analysis...</p></div></div>;
//     if (error) return <div className="h-full flex items-center justify-center"><div className="text-red-500 text-center p-4 bg-red-50 rounded-lg"><svg className="w-12 h-12 mx-auto mb-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><p>{error}</p></div></div>;
    
//     if (chartData.length > 0) {
//       return (
//         <ResponsiveContainer width="100%" height="100%">
//           <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
//             <CartesianGrid strokeDasharray="3 3" vertical={false} />
//             <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
//             <YAxis label={{ value: 'Lost Production (Units)', angle: -90, position: 'insideLeft' }} tick={{fontSize: 12}} />
//             <Tooltip content={<CustomTooltip lossPerOperator={lossPerOperator} />} cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }}/>
//             <Legend verticalAlign="top" align="right" wrapperStyle={{paddingBottom: '20px'}}/>
//             <Bar dataKey="lost_production_level" name="Lost Production Volume" radius={[4, 4, 0, 0]}>
//               {chartData.map((entry, index) => (
//                 <Cell key={`cell-${index}`} fill={PASTEL_COLORS[index % PASTEL_COLORS.length]} />
//               ))}
//             </Bar>
            
//           </BarChart>
//         </ResponsiveContainer>
//       );
//     }
    
//     return <div className="h-full flex items-center justify-center"><div className="text-gray-400 text-center"><p className="text-lg">No data available for the selected period.</p></div></div>;
//   };

//   return (
//     <div className="relative w-full h-[500px] bg-white rounded-xl shadow-lg p-6 flex flex-col">
//       <div className="flex flex-col items-center justify-center mb-4 text-center">
//         <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg px-4 sm:px-6 py-2 sm:py-3">
        
//         <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
//             <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
//             </svg>
//             Lost Production Volume by Level 
//           </h2>
//           </div>
        
//       </div>
//       <div className="flex-grow">
//         {renderContent()}
//       </div>
//       <div className="flex flex-col items-center justify-center mb-4 text-center">
//         {periodLabel && (
//           <p className="text-base font-semibold text-purple-900 mt-1">
//             {periodLabel}
//           </p>
//         )}
        

//       </div>
      
      
//     </div>
//   );
// };

// export default BufferManpowerAvailability;


import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, Cell,
} from 'recharts';

// --- CONFIGURATION ---
const API_BASE_URL = 'http://172.25.0.51:8000';

// --- PASTEL COLORS FOR BARS ---
const PASTEL_COLORS = ['#B5C7F5', '#F5C7E8', '#C7F5D4', '#F5E6C7', '#E8C7F5', '#C7E8F5', '#F5D4C7', '#D4F5C7'];

// --- HELPER FUNCTIONS ---
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const getWeeksForMonth = (year: number, month: string) => {
  const weeks = [];
  const monthIndex = MONTHS.indexOf(month);
  if (monthIndex < 0) return [];
  const actualYear = monthIndex < 3 ? year + 1 : year;
  const firstDayOfMonth = new Date(actualYear, monthIndex, 1);
  const lastDayOfMonth = new Date(actualYear, monthIndex + 1, 0);
  let currentWeekStart = new Date(firstDayOfMonth);
  currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
  while (currentWeekStart <= lastDayOfMonth) {
      const weekStartDate = new Date(currentWeekStart);
      if (weekStartDate.getMonth() === monthIndex || (new Date(weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000)).getMonth() === monthIndex) {
          const label = `Week of ${weekStartDate.toLocaleString('en-US', { month: 'short', day: 'numeric' })}`;
          weeks.push({ value: weekStartDate.toISOString().split('T')[0], label });
      }
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  }
  return weeks;
};

// --- INTERFACES ---
interface LevelManpowerData {
  name: string;
  operators_required: number;
  net_available: number;
  gap: number;
}
interface BufferAnalysisResponse {
  lost_production_due_to_operator_gap: number;
  manpower_analysis_by_level: LevelManpowerData[];
}
interface ChartData {
  name: string;
  lost_production_level: number;
  level_gap: number;
}

// --- PROPS INTERFACE (UPDATED) ---
interface Props {
  selectedHqId: number | null;
  selectedFactoryId: number | null;
  selectedDepartmentId: number | null;
  selectedLineId: number | null;
  selectedSublineId: number | null;
  selectedStationId: number | null;
  startDate: string | null;
  endDate: string | null;
  timeView: 'Monthly' | 'Weekly';
  selectedMonth: string;
  selectedYear: number;
  selectedWeek: string;
}

// --- CUSTOM TOOLTIP COMPONENT ---
const CustomTooltip = ({ active, payload, label, lossPerOperator }: any) => {
  if (active && payload && payload.length) {
    const dataPoint: ChartData = payload[0].payload;
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl text-sm w-64">
        <p className="font-semibold text-gray-800 mb-3 text-base">{label}</p>
        <p className="font-semibold text-xs text-gray-500 uppercase mb-2">Calculation Breakdown</p>
        <div className="space-y-1 text-xs text-gray-700">
          <p className="flex justify-between">
            <span>Manpower Gap for this Level:</span>
            <span className="font-medium">{dataPoint.level_gap.toLocaleString()}</span>
          </p>
          <p className="flex justify-between">
            <span>Avg. Lost Production / Gap:</span>
            <span className="font-medium">{lossPerOperator.toFixed(2)}</span>
          </p>
        </div>
        <hr className="my-2 border-gray-200" />
        <p className="flex justify-between font-bold text-gray-700">
          <span>Estimated Lost Production:</span>
          <span>{Math.round(dataPoint.lost_production_level).toLocaleString()} Units</span>
        </p>
      </div>
    );
  }
  return null;
};

// --- MAIN COMPONENT ---
const BufferManpowerAvailability: React.FC<Props> = ({
  // Updated function signature
  selectedHqId,
  selectedFactoryId,
  selectedDepartmentId,
  selectedLineId,
  selectedSublineId,
  selectedStationId,
  startDate,
  timeView,
  selectedMonth,
  selectedYear,
  selectedWeek,
}) => {
  const [analysisData, setAnalysisData] = useState<BufferAnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- DATA FETCHING (UPDATED) ---
  const fetchData = useCallback(async () => {
    if (!selectedFactoryId || !startDate) {
      setAnalysisData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Updated params to include all new filters
      const params = new URLSearchParams({ 
        factory: String(selectedFactoryId), 
        start_date: startDate 
      });
      if (selectedHqId) params.set('hq', String(selectedHqId));
      if (selectedDepartmentId) params.set('department', String(selectedDepartmentId));
      if (selectedLineId) params.set('line', String(selectedLineId));
      if (selectedSublineId) params.set('subline', String(selectedSublineId));
      if (selectedStationId) params.set('station', String(selectedStationId));
      
      const response = await fetch(`${API_BASE_URL}/production-data/buffer-analysis/?${params.toString()}`);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to fetch buffer analysis: ${response.status}`);
      }
      const result: BufferAnalysisResponse = await response.json();
      setAnalysisData(result);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      setAnalysisData(null);
    } finally {
      setLoading(false);
    }
    // Updated dependency array
  }, [selectedHqId, selectedFactoryId, selectedDepartmentId, selectedLineId, selectedSublineId, selectedStationId, startDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- No changes needed below this line ---

  // --- DATA TRANSFORMATION FOR CHART ---
  const { chartData, lossPerOperator } = useMemo(() => {
    if (!analysisData?.manpower_analysis_by_level) {
      return { chartData: [], lossPerOperator: 0 };
    }
    const levels = analysisData.manpower_analysis_by_level;
    const totalLostProduction = analysisData.lost_production_due_to_operator_gap;
    const totalGap = levels.reduce((sum, level) => sum + level.gap, 0);
    const calculatedLossPerOperator = totalGap > 0 ? totalLostProduction / totalGap : 0;
    const transformedData: ChartData[] = levels.map(level => ({
      name: level.name,
      lost_production_level: level.gap * calculatedLossPerOperator,
      level_gap: level.gap,
    }));
    return { chartData: transformedData, lossPerOperator: calculatedLossPerOperator };
  }, [analysisData]);
  
  // --- LOGIC TO CREATE THE DISPLAY LABEL FOR SUBTITLE ---
  const periodLabel = useMemo(() => {
    if (timeView === 'Monthly') {
      return selectedMonth;
    }
    if (timeView === 'Weekly') {
      if (!selectedWeek || !selectedYear || !selectedMonth) return null;
      const weeksForMonth = getWeeksForMonth(selectedYear, selectedMonth);
      const selectedWeekObject = weeksForMonth.find(week => week.value === selectedWeek);
      return selectedWeekObject ? selectedWeekObject.label : null;
    }
    return null;
  }, [timeView, selectedMonth, selectedYear, selectedWeek]);

  // --- RENDER LOGIC ---
  const renderContent = () => {
    if (loading) return <div className="h-full flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div><p className="text-gray-500">Calculating Analysis...</p></div></div>;
    if (error) return <div className="h-full flex items-center justify-center"><div className="text-red-500 text-center p-4 bg-red-50 rounded-lg"><svg className="w-12 h-12 mx-auto mb-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><p>{error}</p></div></div>;
    
    if (chartData.length > 0 && chartData.some(d => d.lost_production_level > 0)) {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
            <YAxis label={{ value: 'Lost Production (Units)', angle: -90, position: 'insideLeft' }} tick={{fontSize: 12}} />
            <Tooltip content={<CustomTooltip lossPerOperator={lossPerOperator} />} cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }}/>
            <Legend verticalAlign="top" align="right" wrapperStyle={{paddingBottom: '20px'}}/>
            <Bar dataKey="lost_production_level" name="Lost Production Volume" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PASTEL_COLORS[index % PASTEL_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }
    
    return <div className="h-full flex items-center justify-center"><div className="text-gray-400 text-center"><p className="text-lg">No data available for the selected period.</p></div></div>;
  };

  return (
    <div className="relative w-full h-[500px] bg-white rounded-xl shadow-lg p-6 flex flex-col">
      <div className="flex flex-col items-center justify-center mb-4 text-center">
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg px-4 sm:px-6 py-2 sm:py-3">
          <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Lost Production Volume by Level (FY {selectedYear}-{selectedYear ? selectedYear + 1 : ''})
          </h2>
        </div>
      </div>
      <div className="flex-grow">
        {renderContent()}
      </div>
      <div className="flex flex-col items-center justify-center mb-4 text-center">
        {periodLabel && (
          <p className="text-base font-semibold text-purple-900 mt-1">
            {periodLabel}
          </p>
        )}
      </div>
    </div>
  );
};

export default BufferManpowerAvailability;