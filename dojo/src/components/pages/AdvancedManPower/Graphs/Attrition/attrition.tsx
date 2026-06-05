// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import {
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   LabelList,
//   Legend,
//   CartesianGrid,
// } from 'recharts';
// import { getWeek, startOfMonth } from 'date-fns';

// // --- INTERFACES ---
// interface OperatorsDataPoint {
//   name: string;
//   planned: number;
//   actual: number;
// }

// interface ApiResponseItem {
//   period: string;
//   year?: number;
//   total_operators_required_plan: number;
//   total_operators_required_actual: number;
// }

// interface ApiResponse {
//   data_type: 'Monthly' | 'Weekly';
//   data: ApiResponseItem[];
// }

// interface Props {
//   selectedFactoryId: number | null;
//   selectedShopFloorId: number | null;
//   selectedLineId: number | null;
//   selectedStationId: number | null;
//   startDate: string | null;
//   endDate: string | null;
//   timeView: 'Monthly' | 'Weekly';
// }

// const api = axios.create({
//   baseURL: 'http://172.25.0.51:8000',
//   headers: { 'Content-Type': 'application/json' },
// });

// // --- MAIN COMPONENT ---
// const AttritionTrendChart: React.FC<Props> = ({
//   selectedFactoryId,
//   selectedShopFloorId,
//   selectedLineId,
//   selectedStationId,
//   startDate,
//   endDate,
//   timeView,
// }) => {
//   const [data, setData] = useState<OperatorsDataPoint[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [effectiveTimeView, setEffectiveTimeView] = useState<'Monthly' | 'Weekly'>(timeView);

//   const fetchData = useCallback(async () => {
//     if (!selectedFactoryId || !startDate || !endDate) {
//       setData([]);
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
//         time_view: timeView,
//       });

//       if (selectedStationId) params.set('station', String(selectedStationId));
//       else if (selectedLineId) params.set('line', String(selectedLineId));
//       else if (selectedShopFloorId) params.set('shop_floor', String(selectedShopFloorId));

//       console.log('API Request:', `/trends/operators-required/?${params.toString()}`);
//       const response = await api.get<ApiResponse>(`/trends/operators-required/?${params.toString()}`);
//       console.log('API Response:', response.data);

//       const { data_type, data: apiData } = response.data;

//       const renderTimeView = timeView; // Force the requested view
//       setEffectiveTimeView(renderTimeView);

//       const chartData = apiData.map((item, index) => {
//         if (renderTimeView === 'Monthly') {
//           // For monthly view, use the single aggregated data point
//           return {
//             name: `${item.period.substring(0, 3)} '${String(item.year || new Date(startDate).getFullYear()).slice(-2)}`,
//             planned: item.total_operators_required_plan,
//             actual: item.total_operators_required_actual,
//           };
//         } else {
//           // For weekly view, assign week numbers
//           const weekNumber = index + 1;
//           return {
//             name: `Week ${weekNumber}`,
//             planned: item.total_operators_required_plan,
//             actual: item.total_operators_required_actual,
//           };
//         }
//       });

//       console.log('Final Chart Data:', chartData);
//       setData(chartData);
//     } catch (e) {
//       console.error('Failed to load operators trend data', e);
//       setError('Failed to load operators required data.');
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedFactoryId, selectedShopFloorId, selectedLineId, selectedStationId, startDate, endDate, timeView]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   // --- UI COMPONENTS ---
//   const CustomTooltip = ({ active, payload, label }: any) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl text-sm">
//           <p className="font-semibold text-gray-800 mb-3 text-base">{label}</p>
//           <div className="space-y-1">
//             {payload.map((entry: any, index: number) => (
//               <p key={index} className="flex items-center gap-2">
//                 <span
//                   className="w-3 h-3 rounded-sm"
//                   style={{ backgroundColor: entry.color }}
//                 />
//                 <span className="text-gray-600">
//                   {entry.dataKey === 'planned' ? 'Planned:' : 'Actual:'}
//                 </span>
//                 <span className="font-medium">
//                   {entry.value.toLocaleString()} Operators
//                 </span>
//               </p>
//             ))}
//           </div>
//         </div>
//       );
//     }
//     return null;
//   };

//   const CustomLegend = () => (
//     <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700 mt-4">
//       <span className="inline-flex items-center gap-2">
//         <div className="w-4 h-4 rounded-sm bg-[#818CF8]" />
//         <span>Planned Operators</span>
//       </span>
//       <span className="inline-flex items-center gap-2">
//         <div className="w-4 h-4 rounded-sm bg-[#34D399]" />
//         <span>Actual Operators</span>
//       </span>
//     </div>
//   );

//   const renderContent = () => {
//     if (loading) {
//       return (
//         <div className="h-full flex items-center justify-center">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
//             <p className="text-gray-500">Loading operators required data...</p>
//           </div>
//         </div>
//       );
//     }

//     if (error) {
//       return (
//         <div className="h-full flex items-center justify-center">
//           <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg">
//             <svg className="w-12 h-12 mx-auto mb-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//             <p>{error}</p>
//           </div>
//         </div>
//       );
//     }

//     if (data.length > 0 && data.some(d => d.planned > 0 || d.actual > 0)) {
//       return (
//         <ResponsiveContainer width="100%" height="100%">
//           <AreaChart
//             data={data}
//             margin={{ top: 20, right: 40, left: 40, bottom: 60 }}
//           >
//             <defs>
//               <linearGradient id="plannedGradient" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="0%" stopColor="#818CF8" stopOpacity={0.8} />
//                 <stop offset="100%" stopColor="#818CF8" stopOpacity={0.1} />
//               </linearGradient>
//               <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="0%" stopColor="#34D399" stopOpacity={0.8} />
//                 <stop offset="100%" stopColor="#34D399" stopOpacity={0.1} />
//               </linearGradient>
//             </defs>
//             <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
//             <XAxis
//               dataKey="name"
//               tick={{ fill: '#4B5563', fontSize: 14, fontWeight: 500 }}
//               axisLine={{ stroke: '#E5E7EB' }}
//               tickLine={false}
//               dy={10}
//             />
//             <YAxis
//               tick={{ fill: '#4B5563', fontSize: 12 }}
//               axisLine={{ stroke: '#E5E7EB' }}
//               tickLine={false}
//               tickFormatter={(value) => new Intl.NumberFormat('en-US', {
//                 notation: 'compact',
//                 compactDisplay: 'short'
//               }).format(value as number)}
//             />
//             <Tooltip
//               content={<CustomTooltip />}
//               cursor={{ fill: 'rgba(156, 163, 175, 0.1)', radius: 4 }}
//             />
//             <Legend
//               verticalAlign="bottom"
//               height={50}
//               content={<CustomLegend />}
//             />
//             <Area
//               type="monotone"
//               dataKey="planned"
//               stroke="#818CF8"
//               strokeWidth={3}
//               fill="url(#plannedGradient)"
//               dot={{ stroke: '#818CF8', strokeWidth: 2, fill: '#fff', r: 5 }}
//               activeDot={{ r: 7, stroke: '#818CF8', strokeWidth: 2, fill: '#fff' }}
//             >
//               <LabelList
//                 dataKey="planned"
//                 position="top"
//                 fontSize={12}
//                 fill="#4B5563"
//                 fontWeight={500}
//                 offset={10}
//                 formatter={(value: number) => (value ?? 0) > 0 ? value.toLocaleString() : ''}
//               />
//             </Area>
//             <Area
//               type="monotone"
//               dataKey="actual"
//               stroke="#34D399"
//               strokeWidth={3}
//               fill="url(#actualGradient)"
//               dot={{ stroke: '#34D399', strokeWidth: 2, fill: '#fff', r: 5 }}
//               activeDot={{ r: 7, stroke: '#34D399', strokeWidth: 2, fill: '#fff' }}
//             >
//               <LabelList
//                 dataKey="actual"
//                 position="bottom"
//                 fontSize={12}
//                 fill="#4B5563"
//                 fontWeight={500}
//                 offset={10}
//                 formatter={(value: number) => (value ?? 0) > 0 ? value.toLocaleString() : ''}
//               />
//             </Area>
//           </AreaChart>
//         </ResponsiveContainer>
//       );
//     }

//     return (
//       <div className="h-full flex items-center justify-center">
//         <div className="text-gray-400 text-center">
//           <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//           </svg>
//           <p className="text-lg">No data available for the selected filters.</p>
//         </div>
//       </div>
//     );
//   };

//   const fiscalYearStart = startDate ? new Date(startDate).getFullYear() : null;
//   const fiscalYearTitle = fiscalYearStart
//     ? `(FY ${fiscalYearStart}-${String(fiscalYearStart + 1).slice(-2)})`
//     : '(...)';

//   return (
//     <div className="relative w-full h-[550px] bg-white rounded-xl p-6 flex flex-col">
//       <div className="flex items-center justify-center mb-4 sm:mb-6">
//         <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg px-4 sm:px-6 py-2 sm:py-3">
//           <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
//             <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
//             </svg>
//             Operators Required Trend {effectiveTimeView === 'Monthly' ? fiscalYearTitle : 'Weekly View'}
//           </h2>
//         </div>
//       </div>
//       <div className="flex-grow">
//         {renderContent()}
//       </div>
//     </div>
//   );
// };

// export default AttritionTrendChart;


import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Legend,
  CartesianGrid,
} from 'recharts';
import { getWeek, startOfMonth } from 'date-fns';

// --- INTERFACES ---
interface OperatorsDataPoint {
  name: string;
  planned: number;
  actual: number;
}

interface ApiResponseItem {
  period: string;
  year?: number;
  total_operators_required_plan: number;
  total_operators_required_actual: number;
}

interface ApiResponse {
  data_type: 'Monthly' | 'Weekly';
  data: ApiResponseItem[];
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
}

const api = axios.create({
  baseURL: 'http://172.25.0.51:8000',
  headers: { 'Content-Type': 'application/json' },
});

// --- MAIN COMPONENT ---
const AttritionTrendChart: React.FC<Props> = ({
  // Updated function signature
  selectedHqId,
  selectedFactoryId,
  selectedDepartmentId,
  selectedLineId,
  selectedSublineId,
  selectedStationId,
  startDate,
  endDate,
  timeView,
}) => {
  const [data, setData] = useState<OperatorsDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [effectiveTimeView, setEffectiveTimeView] = useState<'Monthly' | 'Weekly'>(timeView);

  const fetchData = useCallback(async () => {
    if (!selectedFactoryId || !startDate || !endDate) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // --- API CALL LOGIC (UPDATED) ---
      // Now includes all new filter parameters.
      const params = new URLSearchParams({
        factory: String(selectedFactoryId),
        start_date: startDate,
        end_date: endDate,
        time_view: timeView,
      });

      // Add all optional filters
      if (selectedHqId) params.set('hq', String(selectedHqId));
      if (selectedDepartmentId) params.set('department', String(selectedDepartmentId));
      if (selectedLineId) params.set('line', String(selectedLineId));
      if (selectedSublineId) params.set('subline', String(selectedSublineId));
      if (selectedStationId) params.set('station', String(selectedStationId));

      const response = await api.get<ApiResponse>(`/trends/operators-required/?${params.toString()}`);
      
      const { data: apiData } = response.data;

      setEffectiveTimeView(timeView);

      const chartData = apiData.map((item, index) => {
        if (timeView === 'Monthly') {
          return {
            name: `${item.period.substring(0, 3)} '${String(item.year || new Date(startDate).getFullYear()).slice(-2)}`,
            planned: item.total_operators_required_plan,
            actual: item.total_operators_required_actual,
          };
        } else {
          const weekNumber = index + 1;
          return {
            name: `Week ${weekNumber}`,
            planned: item.total_operators_required_plan,
            actual: item.total_operators_required_actual,
          };
        }
      });

      setData(chartData);
    } catch (e) {
      console.error('Failed to load operators trend data', e);
      setError('Failed to load operators required data.');
    } finally {
      setLoading(false);
    }
    // --- DEPENDENCY ARRAY (UPDATED) ---
  }, [selectedHqId, selectedFactoryId, selectedDepartmentId, selectedLineId, selectedSublineId, selectedStationId, startDate, endDate, timeView]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- No changes needed below this line ---

  // --- UI COMPONENTS ---
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl text-sm">
          <p className="font-semibold text-gray-800 mb-3 text-base">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <p key={index} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-600">
                  {entry.dataKey === 'planned' ? 'Planned:' : 'Actual:'}
                </span>
                <span className="font-medium">
                  {entry.value.toLocaleString()} Operators
                </span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = () => (
    <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700 mt-4">
      <span className="inline-flex items-center gap-2">
        <div className="w-4 h-4 rounded-sm bg-[#818CF8]" />
        <span>Planned Operators</span>
      </span>
      <span className="inline-flex items-center gap-2">
        <div className="w-4 h-4 rounded-sm bg-[#34D399]" />
        <span>Actual Operators</span>
      </span>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading operators required data...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg">
            <svg className="w-12 h-12 mx-auto mb-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{error}</p>
          </div>
        </div>
      );
    }

    if (data.length > 0 && data.some(d => d.planned > 0 || d.actual > 0)) {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 20, right: 40, left: 40, bottom: 60 }}
          >
            <defs>
              <linearGradient id="plannedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818CF8" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#818CF8" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34D399" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#34D399" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#4B5563', fontSize: 14, fontWeight: 500 }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tick={{ fill: '#4B5563', fontSize: 12 }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
              tickFormatter={(value) => new Intl.NumberFormat('en-US', {
                notation: 'compact',
                compactDisplay: 'short'
              }).format(value as number)}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(156, 163, 175, 0.1)', radius: 4 }}
            />
            <Legend
              verticalAlign="bottom"
              height={50}
              content={<CustomLegend />}
            />
            <Area
              type="monotone"
              dataKey="planned"
              stroke="#818CF8"
              strokeWidth={3}
              fill="url(#plannedGradient)"
              dot={{ stroke: '#818CF8', strokeWidth: 2, fill: '#fff', r: 5 }}
              activeDot={{ r: 7, stroke: '#818CF8', strokeWidth: 2, fill: '#fff' }}
            >
              <LabelList
                dataKey="planned"
                position="top"
                fontSize={12}
                fill="#4B5563"
                fontWeight={500}
                offset={10}
                formatter={(value: any) => (Number(value) || 0) > 0 ? Number(value).toLocaleString() : ''}
              />
            </Area>
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#34D399"
              strokeWidth={3}
              fill="url(#actualGradient)"
              dot={{ stroke: '#34D399', strokeWidth: 2, fill: '#fff', r: 5 }}
              activeDot={{ r: 7, stroke: '#34D399', strokeWidth: 2, fill: '#fff' }}
            >
              <LabelList
                dataKey="actual"
                position="bottom"
                fontSize={12}
                fill="#4B5563"
                fontWeight={500}
                offset={10}
                formatter={(value: any) => (Number(value) || 0) > 0 ? Number(value).toLocaleString() : ''}
              />
            </Area>
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-400 text-center">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-lg">No data available for the selected filters.</p>
        </div>
      </div>
    );
  };

  const fiscalYearStart = startDate ? new Date(startDate).getFullYear() : null;
  const fiscalYearTitle = fiscalYearStart
    ? `(FY ${fiscalYearStart}-${fiscalYearStart + 1})`
    : '(...)';

  return (
    <div className="relative w-full h-[550px] bg-white rounded-xl p-6 flex flex-col">
      <div className="flex items-center justify-center mb-4 sm:mb-6">
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg px-4 sm:px-6 py-2 sm:py-3">
          <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Operators Required Trend {effectiveTimeView === 'Monthly' ? fiscalYearTitle : 'Weekly View'}
          </h2>
        </div>
      </div>
      <div className="flex-grow">
        {renderContent()}
      </div>
    </div>
  );
};

export default AttritionTrendChart;
