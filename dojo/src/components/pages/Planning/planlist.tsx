// import React, { useState, useMemo, useEffect } from 'react';
// import { 
//   Search, 
//   Calendar, 
//   TrendingUp, 
//   Users, 
//   Target, 
//   CheckCircle, 
//   ChevronDown, 
//   ArrowUpDown, 
//   Loader, 
//   AlertCircle 
// } from 'lucide-react';

// // The full interface matching your API response
// interface ProductionData {
//   id: number;
//   start_date: string;
//   end_date: string;
//   entry_mode: string;
//   batch_id: string;
//   total_production_plan: number;
//   total_production_actual: number;
//   total_operators_available: number;
//   total_operators_required_plan: number;
//   total_operators_required_actual: number;
//   attrition_rate: string;
//   absenteeism_rate: string;
//   ctq_plan_total: number;
//   ctq_actual_total: number;
//   pdi_plan_total: number;
//   pdi_actual_total: number;
//   other_plan_total: number;
//   other_actual_total: number;
//   grand_total_plan: number;
//   grand_total_actual: number;
//   created_at: string;
//   updated_at: string;
//   Hq: number;
//   factory: number;
//   department: number;
//   line: number | null;
//   subline: number | null;
//   station: number;
//   // Including other fields from the API response for completeness
//   ctq_plan_l1?: number;
//   ctq_actual_l1?: number;
//   pdi_plan_l1?: number;
//   pdi_actual_l1?: number;
//   other_plan_l1?: number;
//   other_actual_l1?: number;
//   bifurcation_plan_l1?: number;
//   bifurcation_actual_l1?: number;
//   // Add other l2, l3, l4 fields if needed
// }

// const ProductionDashboard: React.FC = () => {
//   // State for API data, loading, and errors
//   const [allData, setAllData] = useState<ProductionData[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   // Filter and sort states
//   const [selectedMonth, setSelectedMonth] = useState<string>('');
//   const [selectedYear, setSelectedYear] = useState<string>('');
//   const [searchTerm, setSearchTerm] = useState<string>('');
//   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

//   // Fetch data from the API on component mount
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // NOTE: If your React dev server is on a different port than your Django API,
//         // you may need the full URL, e.g., 'http://127.0.0.1:8000/api/production-data/'
//         const response = await fetch('http://127.0.0.1:8000/production-data/');
        
//         if (!response.ok) {
//           throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
//         }
//         const data: ProductionData[] = await response.json();
//         setAllData(data);
        
//         // After fetching, set the default year to the most recent one available
//         if (data.length > 0) {
//           const years = new Set(data.map(item => new Date(item.start_date).getFullYear().toString()));
//           const mostRecentYear = Array.from(years).sort((a, b) => b.localeCompare(a))[0];
//           setSelectedYear(mostRecentYear);
//         }
//       } catch (e: any) {
//         console.error("Failed to fetch production data:", e);
//         setError("Could not load production data. Please check the network connection and try again.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []); // Empty dependency array ensures this runs only once on mount

//   // Get unique years from data
//   const availableYears = useMemo(() => {
//     if (allData.length === 0) return [];
//     const years = new Set(allData.map(item => new Date(item.start_date).getFullYear().toString()));
//     return Array.from(years).sort((a, b) => b.localeCompare(a));
//   }, [allData]);

//   const availableMonths = [
//     { value: '', label: 'All Months' }, { value: '01', label: 'January' },
//     { value: '02', label: 'February' }, { value: '03', label: 'March' },
//     { value: '04', label: 'April' }, { value: '05', label: 'May' },
//     { value: '06', label: 'June' }, { value: '07', label: 'July' },
//     { value: '08', label: 'August' }, { value: '09', label: 'September' },
//     { value: '10', label: 'October' }, { value: '11', label: 'November' },
//     { value: '12', label: 'December' }
//   ];

//   // Filter and sort data based on the state variable `allData`
//   const filteredAndSortedData = useMemo(() => {
//     let filtered = [...allData];

//     if (selectedYear) {
//       filtered = filtered.filter(item => new Date(item.start_date).getFullYear().toString() === selectedYear);
//     }
//     if (selectedMonth) {
//       filtered = filtered.filter(item => new Date(item.start_date).getMonth() + 1 === parseInt(selectedMonth));
//     }
//     if (searchTerm) {
//       const lowercasedSearch = searchTerm.toLowerCase();
//       filtered = filtered.filter(item =>
//         item.batch_id.toLowerCase().includes(lowercasedSearch) ||
//         item.entry_mode.toLowerCase().includes(lowercasedSearch)
//       );
//     }

//     filtered.sort((a, b) => {
//       const dateA = new Date(a.start_date).getTime();
//       const dateB = new Date(b.start_date).getTime();
//       return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
//     });

//     return filtered;
//   }, [allData, selectedYear, selectedMonth, searchTerm, sortOrder]);

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
//   };

//   const toggleSortOrder = () => {
//     setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
//   };

//   const MetricCard: React.FC<{
//     title: string; plan: number; actual: number; icon: React.ReactNode; gradient: string;
//   }> = ({ title, plan, actual, icon, gradient }) => {
//     const percentage = plan > 0 ? ((actual / plan) * 100).toFixed(1) : '0.0';
//     const isOverTarget = actual >= plan;

//     return (
//       <div className={`bg-gradient-to-br ${gradient} p-6 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105`}>
//         <div className="flex items-center justify-between mb-4">
//           <div className="text-white/80">{icon}</div>
//           <span className={`text-sm font-semibold px-3 py-1 rounded-full ${isOverTarget ? 'bg-green-400/20 text-green-100' : 'bg-white/20 text-white'}`}>
//             {percentage}%
//           </span>
//         </div>
//         <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
//         <div className="space-y-2">
//           <div className="flex justify-between items-center"><span className="text-white/70 text-sm">Plan</span><span className="text-white font-bold">{plan.toLocaleString()}</span></div>
//           <div className="flex justify-between items-center"><span className="text-white/70 text-sm">Actual</span><span className="text-white font-bold">{actual.toLocaleString()}</span></div>
//         </div>
//         <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
//           <div className="h-full bg-white/80 rounded-full transition-all duration-500" style={{ width: `${Math.min(parseFloat(percentage), 100)}%` }} />
//         </div>
//       </div>
//     );
//   };

//   const aggregatedMetrics = useMemo(() => {
//     if (filteredAndSortedData.length === 0) return null;
//     if (filteredAndSortedData.length === 1) return filteredAndSortedData[0];

//     return {
//       total_production_plan: filteredAndSortedData.reduce((sum, item) => sum + item.total_production_plan, 0),
//       total_production_actual: filteredAndSortedData.reduce((sum, item) => sum + item.total_production_actual, 0),
//       ctq_plan_total: filteredAndSortedData.reduce((sum, item) => sum + item.ctq_plan_total, 0),
//       ctq_actual_total: filteredAndSortedData.reduce((sum, item) => sum + item.ctq_actual_total, 0),
//       pdi_plan_total: filteredAndSortedData.reduce((sum, item) => sum + item.pdi_plan_total, 0),
//       pdi_actual_total: filteredAndSortedData.reduce((sum, item) => sum + item.pdi_actual_total, 0),
//       grand_total_plan: filteredAndSortedData.reduce((sum, item) => sum + item.grand_total_plan, 0),
//       grand_total_actual: filteredAndSortedData.reduce((sum, item) => sum + item.grand_total_actual, 0),
//     };
//   }, [filteredAndSortedData]);
  
//   // RENDER STATES
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-slate-50">
//         <div className="flex flex-col items-center gap-4">
//           <Loader className="w-12 h-12 animate-spin text-purple-600" />
//           <p className="text-gray-600">Loading Production Data...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
//         <div className="bg-white rounded-2xl shadow-md p-8 text-center max-w-md">
//           <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
//           <h3 className="text-xl font-semibold text-gray-800 mb-2">An Error Occurred</h3>
//           <p className="text-red-600">{error}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header and Filters */}
//         <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//             <div>
//               <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Production Dashboard</h1>
//               <p className="text-gray-600 mt-1">Monitor your production metrics and performance</p>
//             </div>
            
//             <div className="flex flex-wrap items-center gap-3">
//               <div className="relative">
//                 <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
//                   <option value="">All Years</option>
//                   {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
//                 </select>
//                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
//               </div>

//               <div className="relative">
//                 <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
//                   {availableMonths.map(month => <option key={month.value} value={month.value}>{month.label}</option>)}
//                 </select>
//                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
//               </div>

//               <button onClick={toggleSortOrder} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors">
//                 <ArrowUpDown className="w-4 h-4" />
//                 <span className="text-sm font-medium">{sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}</span>
//               </button>

//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
//                 <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Results Summary */}
//         <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-4 mb-6">
//           <div className="flex items-center justify-between">
//             <p className="text-sm">
//               Showing <span className="font-bold">{filteredAndSortedData.length}</span> record(s) 
//               {selectedYear && ` for ${selectedYear}`}
//               {selectedMonth && ` - ${availableMonths.find(m => m.value === selectedMonth)?.label}`}
//             </p>
//             {filteredAndSortedData.length > 1 && <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Aggregated View</span>}
//           </div>
//         </div>

//         {/* Main Content */}
//         {aggregatedMetrics ? (
//           <>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
//               <MetricCard title="Production" plan={aggregatedMetrics.total_production_plan} actual={aggregatedMetrics.total_production_actual} icon={<TrendingUp className="w-6 h-6" />} gradient="from-blue-500 to-blue-600" />
//               <MetricCard title="CTQ Total" plan={aggregatedMetrics.ctq_plan_total} actual={aggregatedMetrics.ctq_actual_total} icon={<Target className="w-6 h-6" />} gradient="from-purple-500 to-purple-600" />
//               <MetricCard title="PDI Total" plan={aggregatedMetrics.pdi_plan_total} actual={aggregatedMetrics.pdi_actual_total} icon={<CheckCircle className="w-6 h-6" />} gradient="from-indigo-500 to-indigo-600" />
//               <MetricCard title="Grand Total" plan={aggregatedMetrics.grand_total_plan} actual={aggregatedMetrics.grand_total_actual} icon={<Users className="w-6 h-6" />} gradient="from-violet-500 to-violet-600" />
//             </div>

//             <div className="space-y-6">
//               <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2"><Calendar className="w-5 h-5 text-purple-600" />Monthly Records</h2>
//               {filteredAndSortedData.map((data) => (
//                 <div key={data.id} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
//                   {/* Card Header */}
//                   <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-4 border-b border-gray-100">
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-800">{new Date(data.start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
//                       <p className="text-sm text-gray-500 mt-1">{formatDate(data.start_date)} - {formatDate(data.end_date)}</p>
//                     </div>
//                     <div className="flex items-center gap-3 mt-3 md:mt-0">
//                       <span className="text-xs px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-purple-700 rounded-full font-medium">{data.entry_mode}</span>
//                       <span className="text-xs text-gray-500">ID: {data.id}</span>
//                     </div>
//                   </div>
//                   {/* Card Body */}
//                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                     <div>
//                       <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-purple-600" />Operator Information</h4>
//                       <div className="space-y-2">
//                         <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg"><span className="text-sm text-gray-700">Available Operators</span><span className="font-semibold text-blue-600">{data.total_operators_available}</span></div>
//                         <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg"><span className="text-sm text-gray-700">Required (Plan/Actual)</span><span className="font-semibold text-purple-600">{data.total_operators_required_plan} / {data.total_operators_required_actual}</span></div>
//                         <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg"><span className="text-sm text-gray-700">Attrition Rate</span><span className="font-semibold text-blue-600">{data.attrition_rate}%</span></div>
//                         <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg"><span className="text-sm text-gray-700">Absenteeism Rate</span><span className="font-semibold text-purple-600">{data.absenteeism_rate}%</span></div>
//                       </div>
//                     </div>
//                     <div>
//                       <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-600" />Production Metrics</h4>
//                       <div className="space-y-2">
//                         <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg"><span className="text-sm text-gray-700">Production (Plan/Actual)</span><span className="font-semibold text-purple-600">{data.total_production_plan.toLocaleString()} / {data.total_production_actual.toLocaleString()}</span></div>
//                         <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg"><span className="text-sm text-gray-700">CTQ Total (Plan/Actual)</span><span className="font-semibold text-blue-600">{data.ctq_plan_total} / {data.ctq_actual_total}</span></div>
//                         <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg"><span className="text-sm text-gray-700">PDI Total (Plan/Actual)</span><span className="font-semibold text-purple-600">{data.pdi_plan_total} / {data.pdi_actual_total}</span></div>
//                         <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg"><span className="text-sm text-gray-700">Grand Total (Plan/Actual)</span><span className="font-semibold text-blue-600">{data.grand_total_plan} / {data.grand_total_actual}</span></div>
//                       </div>
//                     </div>
//                   </div>
//                   {/* Card Footer */}
//                   <div className="mt-4 pt-4 border-t border-gray-100">
//                     <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
//                       <div className="flex items-center gap-2"><span className="text-gray-500">HQ:</span><span className="font-medium text-gray-700">{data.Hq}</span></div>
//                       <div className="flex items-center gap-2"><span className="text-gray-500">Factory:</span><span className="font-medium text-gray-700">{data.factory}</span></div>
//                       <div className="flex items-center gap-2"><span className="text-gray-500">Department:</span><span className="font-medium text-gray-700">{data.department}</span></div>
//                       <div className="flex items-center gap-2"><span className="text-gray-500">Station:</span><span className="font-medium text-gray-700">{data.station}</span></div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </>
//         ) : (
//           <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
//             <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//             <h3 className="text-xl font-semibold text-gray-700 mb-2">No Data Found</h3>
//             <p className="text-gray-500">No records match the selected filters. Try adjusting your search criteria.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProductionDashboard;



import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Calendar, 
  TrendingUp, 
  Users, 
  Target, 
  CheckCircle, 
  ChevronDown, 
  ArrowUpDown, 
  Loader, 
  AlertCircle,
  BarChart2
} from 'lucide-react';

// The full interface matching your API response, including all detailed fields
interface ProductionData {
  id: number;
  start_date: string;
  end_date: string;
  entry_mode: string;
  batch_id: string;
  total_production_plan: number;
  total_production_actual: number;
  total_operators_available: number;
  total_operators_required_plan: number;
  total_operators_required_actual: number;
  attrition_rate: string;
  absenteeism_rate: string;
  ctq_plan_l1: number;
  ctq_plan_l2: number;
  ctq_plan_l3: number;
  ctq_plan_l4: number;
  ctq_plan_total: number;
  ctq_actual_l1: number;
  ctq_actual_l2: number;
  ctq_actual_l3: number;
  ctq_actual_l4: number;
  ctq_actual_total: number;
  pdi_plan_l1: number;
  pdi_plan_l2: number;
  pdi_plan_l3: number;
  pdi_plan_l4: number;
  pdi_plan_total: number;
  pdi_actual_l1: number;
  pdi_actual_l2: number;
  pdi_actual_l3: number;
  pdi_actual_l4: number;
  pdi_actual_total: number;
  other_plan_l1: number;
  other_plan_l2: number;
  other_plan_l3: number;
  other_plan_l4: number;
  other_plan_total: number;
  other_actual_l1: number;
  other_actual_l2: number;
  other_actual_l3: number;
  other_actual_l4: number;
  other_actual_total: number;
  bifurcation_plan_l1: number;
  bifurcation_plan_l2: number;
  bifurcation_plan_l3: number;
  bifurcation_plan_l4: number;
  bifurcation_actual_l1: number;
  bifurcation_actual_l2: number;
  bifurcation_actual_l3: number;
  bifurcation_actual_l4: number;
  grand_total_plan: number;
  grand_total_actual: number;
  created_at: string;
  updated_at: string;
  Hq: number;
  factory: number;
  department: number;
  line: number | null;
  subline: number | null;
  station: number;
}


// NEW: A dedicated component for the detailed metrics table
const DetailedMetricsTable: React.FC<{ data: ProductionData }> = ({ data }) => {
  const metrics = [
    { name: 'CTQ', plan: 'ctq_plan', actual: 'ctq_actual' },
    { name: 'PDI', plan: 'pdi_plan', actual: 'pdi_actual' },
    { name: 'Other', plan: 'other_plan', actual: 'other_actual' },
    { name: 'Bifurcation', plan: 'bifurcation_plan', actual: 'bifurcation_actual' },
  ];

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">Metric</th>
            <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">L1 (Plan/Actual)</th>
            <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">L2 (Plan/Actual)</th>
            <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">L3 (Plan/Actual)</th>
            <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">L4 (Plan/Actual)</th>
            <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">Total (Plan/Actual)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {metrics.map((metric, index) => (
            <tr key={metric.name} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
              <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">{metric.name}</td>
              <td className="whitespace-nowrap px-4 py-2 text-gray-700">{data[`${metric.plan}_l1` as keyof ProductionData]} / {data[`${metric.actual}_l1` as keyof ProductionData]}</td>
              <td className="whitespace-nowrap px-4 py-2 text-gray-700">{data[`${metric.plan}_l2` as keyof ProductionData]} / {data[`${metric.actual}_l2` as keyof ProductionData]}</td>
              <td className="whitespace-nowrap px-4 py-2 text-gray-700">{data[`${metric.plan}_l3` as keyof ProductionData]} / {data[`${metric.actual}_l3` as keyof ProductionData]}</td>
              <td className="whitespace-nowrap px-4 py-2 text-gray-700">{data[`${metric.plan}_l4` as keyof ProductionData]} / {data[`${metric.actual}_l4` as keyof ProductionData]}</td>
              {metric.name !== 'Bifurcation' && (
                <td className="whitespace-nowrap px-4 py-2 text-gray-700 font-semibold">{data[`${metric.plan}_total` as keyof ProductionData]} / {data[`${metric.actual}_total` as keyof ProductionData]}</td>
              )}
               {/* Bifurcation doesn't have a total in the provided data model, so we can calculate or omit it */}
               {metric.name === 'Bifurcation' && (
                <td className="whitespace-nowrap px-4 py-2 text-gray-700 font-semibold">- / -</td>
               )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


const ProductionDashboard: React.FC = () => {
  // State for API data, loading, and errors
  const [allData, setAllData] = useState<ProductionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and sort states
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch data from the API on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/production-data/');
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }
        const data: ProductionData[] = await response.json();
        setAllData(data);
        
        if (data.length > 0) {
          const years = new Set(data.map(item => new Date(item.start_date).getFullYear().toString()));
          const mostRecentYear = Array.from(years).sort((a, b) => b.localeCompare(a))[0];
          setSelectedYear(mostRecentYear);
        }
      } catch (e: any) {
        console.error("Failed to fetch production data:", e);
        setError("Could not load production data. Please check the network connection and try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const availableYears = useMemo(() => {
    if (allData.length === 0) return [];
    const years = new Set(allData.map(item => new Date(item.start_date).getFullYear().toString()));
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [allData]);

  const availableMonths = [
    { value: '', label: 'All Months' }, { value: '01', label: 'January' },
    { value: '02', label: 'February' }, { value: '03', label: 'March' },
    { value: '04', label: 'April' }, { value: '05', label: 'May' },
    { value: '06', label: 'June' }, { value: '07', label: 'July' },
    { value: '08', label: 'August' }, { value: '09', label: 'September' },
    { value: '10', label: 'October' }, { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const filteredAndSortedData = useMemo(() => {
    let filtered = [...allData];
    if (selectedYear) {
      filtered = filtered.filter(item => new Date(item.start_date).getFullYear().toString() === selectedYear);
    }
    if (selectedMonth) {
      filtered = filtered.filter(item => new Date(item.start_date).getMonth() + 1 === parseInt(selectedMonth));
    }
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.batch_id.toLowerCase().includes(lowercasedSearch) ||
        item.entry_mode.toLowerCase().includes(lowercasedSearch)
      );
    }
    filtered.sort((a, b) => {
      const dateA = new Date(a.start_date).getTime();
      const dateB = new Date(b.start_date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    return filtered;
  }, [allData, selectedYear, selectedMonth, searchTerm, sortOrder]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const MetricCard: React.FC<{
    title: string; plan: number; actual: number; icon: React.ReactNode; gradient: string;
  }> = ({ title, plan, actual, icon, gradient }) => {
    const percentage = plan > 0 ? ((actual / plan) * 100).toFixed(1) : '0.0';
    const isOverTarget = actual >= plan;
    return (
      <div className={`bg-gradient-to-br ${gradient} p-6 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105`}>
        <div className="flex items-center justify-between mb-4">
          <div className="text-white/80">{icon}</div>
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${isOverTarget ? 'bg-green-400/20 text-green-100' : 'bg-white/20 text-white'}`}>
            {percentage}%
          </span>
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center"><span className="text-white/70 text-sm">Plan</span><span className="text-white font-bold">{plan.toLocaleString()}</span></div>
          <div className="flex justify-between items-center"><span className="text-white/70 text-sm">Actual</span><span className="text-white font-bold">{actual.toLocaleString()}</span></div>
        </div>
        <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-white/80 rounded-full transition-all duration-500" style={{ width: `${Math.min(parseFloat(percentage), 100)}%` }} />
        </div>
      </div>
    );
  };

  const aggregatedMetrics = useMemo(() => {
    if (filteredAndSortedData.length === 0) return null;
    if (filteredAndSortedData.length === 1) return filteredAndSortedData[0];
    return {
      total_production_plan: filteredAndSortedData.reduce((sum, item) => sum + item.total_production_plan, 0),
      total_production_actual: filteredAndSortedData.reduce((sum, item) => sum + item.total_production_actual, 0),
      ctq_plan_total: filteredAndSortedData.reduce((sum, item) => sum + item.ctq_plan_total, 0),
      ctq_actual_total: filteredAndSortedData.reduce((sum, item) => sum + item.ctq_actual_total, 0),
      pdi_plan_total: filteredAndSortedData.reduce((sum, item) => sum + item.pdi_plan_total, 0),
      pdi_actual_total: filteredAndSortedData.reduce((sum, item) => sum + item.pdi_actual_total, 0),
      grand_total_plan: filteredAndSortedData.reduce((sum, item) => sum + item.grand_total_plan, 0),
      grand_total_actual: filteredAndSortedData.reduce((sum, item) => sum + item.grand_total_actual, 0),
    };
  }, [filteredAndSortedData]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 animate-spin text-purple-600" />
          <p className="text-gray-600">Loading Production Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="bg-white rounded-2xl shadow-md p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">An Error Occurred</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Production Dashboard</h1>
              <p className="text-gray-600 mt-1">Monitor your production metrics and performance</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                  <option value="">All Years</option>
                  {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
              <div className="relative">
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  {availableMonths.map(month => <option key={month.value} value={month.value}>{month.label}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
              <button onClick={toggleSortOrder} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors">
                <ArrowUpDown className="w-4 h-4" /><span className="text-sm font-medium">{sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}</span>
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <p className="text-sm">Showing <span className="font-bold">{filteredAndSortedData.length}</span> record(s) {selectedYear && ` for ${selectedYear}`} {selectedMonth && ` - ${availableMonths.find(m => m.value === selectedMonth)?.label}`}</p>
            {filteredAndSortedData.length > 1 && <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Aggregated View</span>}
          </div>
        </div>
        {aggregatedMetrics ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <MetricCard title="Production" plan={aggregatedMetrics.total_production_plan} actual={aggregatedMetrics.total_production_actual} icon={<TrendingUp className="w-6 h-6" />} gradient="from-blue-500 to-blue-600" />
              <MetricCard title="CTQ Total" plan={aggregatedMetrics.ctq_plan_total} actual={aggregatedMetrics.ctq_actual_total} icon={<Target className="w-6 h-6" />} gradient="from-purple-500 to-purple-600" />
              <MetricCard title="PDI Total" plan={aggregatedMetrics.pdi_plan_total} actual={aggregatedMetrics.pdi_actual_total} icon={<CheckCircle className="w-6 h-6" />} gradient="from-indigo-500 to-indigo-600" />
              <MetricCard title="Grand Total" plan={aggregatedMetrics.grand_total_plan} actual={aggregatedMetrics.grand_total_actual} icon={<Users className="w-6 h-6" />} gradient="from-violet-500 to-violet-600" />
            </div>
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2"><Calendar className="w-5 h-5 text-purple-600" />Monthly Records</h2>
              {filteredAndSortedData.map((data) => (
                <div key={data.id} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{new Date(data.start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                      <p className="text-sm text-gray-500 mt-1">{formatDate(data.start_date)} - {formatDate(data.end_date)}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-3 md:mt-0">
                      <span className="text-xs px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-purple-700 rounded-full font-medium">{data.entry_mode}</span>
                      <span className="text-xs text-gray-500">ID: {data.id}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-purple-600" />Operator Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg"><span className="text-sm text-gray-700">Available Operators</span><span className="font-semibold text-blue-600">{data.total_operators_available}</span></div>
                        <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg"><span className="text-sm text-gray-700">Required (Plan/Actual)</span><span className="font-semibold text-purple-600">{data.total_operators_required_plan} / {data.total_operators_required_actual}</span></div>
                        <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg"><span className="text-sm text-gray-700">Attrition Rate</span><span className="font-semibold text-blue-600">{data.attrition_rate}%</span></div>
                        <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg"><span className="text-sm text-gray-700">Absenteeism Rate</span><span className="font-semibold text-purple-600">{data.absenteeism_rate}%</span></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-600" />Production Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg"><span className="text-sm text-gray-700">Production (Plan/Actual)</span><span className="font-semibold text-purple-600">{data.total_production_plan.toLocaleString()} / {data.total_production_actual.toLocaleString()}</span></div>
                        <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg"><span className="text-sm text-gray-700">CTQ Total (Plan/Actual)</span><span className="font-semibold text-blue-600">{data.ctq_plan_total} / {data.ctq_actual_total}</span></div>
                        <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg"><span className="text-sm text-gray-700">PDI Total (Plan/Actual)</span><span className="font-semibold text-purple-600">{data.pdi_plan_total} / {data.pdi_actual_total}</span></div>
                        <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg"><span className="text-sm text-gray-700">Grand Total (Plan/Actual)</span><span className="font-semibold text-blue-600">{data.grand_total_plan} / {data.grand_total_actual}</span></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* NEW: Detailed Metrics Section */}
                  <div className="mt-6">
                    <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-indigo-600" />
                        Metric Breakdown
                    </h4>
                    <DetailedMetricsTable data={data} />
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                      <div className="flex items-center gap-2"><span className="text-gray-500">HQ:</span><span className="font-medium text-gray-700">{data.Hq}</span></div>
                      <div className="flex items-center gap-2"><span className="text-gray-500">Factory:</span><span className="font-medium text-gray-700">{data.factory}</span></div>
                      <div className="flex items-center gap-2"><span className="text-gray-500">Department:</span><span className="font-medium text-gray-700">{data.department}</span></div>
                      <div className="flex items-center gap-2"><span className="text-gray-500">Station:</span><span className="font-medium text-gray-700">{data.station}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Data Found</h3>
            <p className="text-gray-500">No records match the selected filters. Try adjusting your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionDashboard;