
// // components/AttendanceHistory.tsx
// import { useState, useEffect, useMemo } from 'react';
// import {
//   History, Search, Loader2, RefreshCw, Calendar, Clock,
//   CheckCircle, CalendarDays, ChevronUp, ChevronDown
// } from 'lucide-react';
// import axios from 'axios';
// import toast from 'react-hot-toast';

// interface RescheduledSession {
//   id: number;
//   employee_name: string;
//   employee_last_name: string;
//   employee_temp_id: string;
//   original_date: string;
//   original_day_number: number;
//   rescheduled_date: string;
//   rescheduled_time: string;
//   training_name: string;
//   attendance_marked_at: string | null;
// }

// type SortKey = 'employee_name' | 'employee_temp_id' | 'original_day_number' | 'original_date' | 'rescheduled_date' | 'rescheduled_time' | 'training_name';
// type SortOrder = 'asc' | 'desc';

// export default function AttendanceHistory() {
//   const [data, setData] = useState<RescheduledSession[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [sortKey, setSortKey] = useState<SortKey>('rescheduled_date');
//   const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

//   const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

//   const loadHistory = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`${API_BASE}/rescheduled-sessions/?status=completed`);
//       const completed = res.data.filter((s: any) => s.attendance_status === 'present');
//       // Default: latest completed first
//       const sorted = completed.sort((a: any, b: any) => 
//         new Date(b.attendance_marked_at || b.rescheduled_date).getTime() - 
//         new Date(a.attendance_marked_at || a.rescheduled_date).getTime()
//       );
//       setData(sorted);
//     } catch (err) {
//       toast.error('Failed to load attendance history');
//       setData([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadHistory();
//   }, []);

//   // Search + Sort + Pagination with useMemo
//   const processedData = useMemo(() => {
//     let filtered = data;

//     // Search
//     if (search.trim()) {
//       const term = search.toLowerCase();
//       filtered = data.filter(r =>
//         `${r.employee_name} ${r.employee_last_name}`.toLowerCase().includes(term) ||
//         r.employee_temp_id.toLowerCase().includes(term) ||
//         r.training_name.toLowerCase().includes(term) ||
//         `day ${r.original_day_number}`.includes(term.toLowerCase())
//       );
//     }

//     // Sorting
//     const sorted = [...filtered].sort((a, b) => {
//       let aVal: any = a[sortKey];
//       let bVal: any = b[sortKey];

//       if (sortKey === 'employee_name') {
//         aVal = `${a.employee_name} ${a.employee_last_name}`;
//         bVal = `${b.employee_name} ${b.employee_last_name}`;
//       }

//       if (aVal == null) aVal = '';
//       if (bVal == null) bVal = '';

//       if (typeof aVal === 'string') aVal = aVal.toLowerCase();
//       if (typeof bVal === 'string') bVal = bVal.toLowerCase();

//       if (sortKey.includes('date')) {
//         aVal = new Date(aVal).getTime();
//         bVal = new Date(bVal).getTime();
//       }

//       if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
//       if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
//       return 0;
//     });

//     return sorted;
//   }, [data, search, sortKey, sortOrder]);

//   const totalItems = processedData.length;
//   const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
//   const paginatedData = useMemo(() => {
//     const start = (currentPage - 1) * pageSize;
//     return processedData.slice(start, start + pageSize);
//   }, [processedData, currentPage, pageSize]);

//   // Reset page on search/pageSize change
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [search, pageSize]);

//   const handleSort = (key: SortKey) => {
//     if (sortKey === key) {
//       setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
//     } else {
//       setSortKey(key);
//       setSortOrder('desc');
//     }
//   };

//   const getSortIcon = (key: SortKey) => {
//     if (sortKey !== key) return null;
//     return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
//   };

//   return (
//     <div className="bg-white rounded-2xl shadow-xl p-8 max-w-full mx-auto">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
//         <div className="flex items-center gap-4">
//           <div className="p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
//             <History className="w-10 h-10 text-white" />
//           </div>
//           <div>
//             <h2 className="text-3xl font-bold text-gray-800">Attendance History</h2>
//             <p className="text-gray-600 mt-1">All employees who completed their make-up sessions</p>
//           </div>
//         </div>

//         <div className="flex gap-4 w-full sm:w-auto">
//           <div className="relative flex-1 sm:flex-initial">
//             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
//             <input
//               type="text"
//               placeholder="Search name, Temp ID, Day number or training..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="pl-12 pr-5 py-4 w-full sm:w-96 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-lg"
//             />
//           </div>
//           <button
//             onClick={loadHistory}
//             disabled={loading}
//             className="p-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-70 transition-all shadow-lg"
//           >
//             <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
//           </button>
//         </div>
//       </div>

//       {/* Count & Pagination Info */}
//       <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
//         <div className="text-lg font-semibold text-gray-700">
//           Total Completed Sessions: <span className="text-emerald-700">{totalItems}</span>
//           {' • '}
//           Showing page <span className="text-emerald-700">{currentPage}</span> of <span className="text-emerald-700">{totalPages}</span>
//         </div>
//         <div className="flex items-center gap-3">
//           <span className="text-sm text-gray-600">Rows per page:</span>
//           <select
//             value={pageSize}
//             onChange={(e) => setPageSize(Number(e.target.value))}
//             className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500"
//           >
//             {[10, 25, 50, 100].map(size => (
//               <option key={size} value={size}>{size}</option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Loading / Empty */}
//       {loading ? (
//         <div className="text-center py-32">
//           <Loader2 className="w-20 h-20 animate-spin mx-auto text-emerald-600" />
//           <p className="text-xl text-gray-600 mt-6">Loading completed sessions...</p>
//         </div>
//       ) : totalItems === 0 ? (
//         <div className="text-center py-32 bg-gradient-to-b from-gray-50 to-gray-100 rounded-2xl">
//           <CheckCircle className="w-24 h-24 text-gray-300 mx-auto mb-6" />
//           <p className="text-2xl text-gray-500">
//             {search ? 'No matching records found.' : 'No completed make-up sessions yet.'}
//           </p>
//         </div>
//       ) : (
//         <>
//           {/* Table */}
//           <div className="overflow-x-auto border-2 border-gray-200 rounded-2xl shadow-lg">
//             <table className="w-full min-w-[1200px]">
//               <thead className="bg-gradient-to-r from-emerald-600 to-green-700 text-white">
//                 <tr>
//                   <th className="px-8 py-6 text-left text-lg font-bold cursor-pointer hover:bg-emerald-700 transition" onClick={() => handleSort('employee_name')}>
//                     <div className="flex items-center gap-2">Employee Name {getSortIcon('employee_name')}</div>
//                   </th>
//                   <th className="px-8 py-6 text-left text-lg font-bold cursor-pointer hover:bg-emerald-700 transition" onClick={() => handleSort('employee_temp_id')}>
//                     <div className="flex items-center gap-2">Temp ID {getSortIcon('employee_temp_id')}</div>
//                   </th>
//                   <th className="px-8 py-6 text-left text-lg font-bold cursor-pointer hover:bg-emerald-700 transition" onClick={() => handleSort('original_day_number')}>
//                     <div className="flex items-center gap-2">Absent On Day {getSortIcon('original_day_number')}</div>
//                   </th>
//                   <th className="px-8 py-6 text-left text-lg font-bold cursor-pointer hover:bg-emerald-700 transition" onClick={() => handleSort('original_date')}>
//                     <div className="flex items-center gap-2">Absent Date {getSortIcon('original_date')}</div>
//                   </th>
//                   <th className="px-8 py-6 text-left text-lg font-bold cursor-pointer hover:bg-emerald-700 transition" onClick={() => handleSort('rescheduled_date')}>
//                     <div className="flex items-center gap-2">Attended Date {getSortIcon('rescheduled_date')}</div>
//                   </th>
//                   {/* <th className="px-8 py-6 text-left text-lg font-bold cursor-pointer hover:bg-emerald-700 transition" onClick={() => handleSort('rescheduled_time')}>
//                     <div className="flex items-center gap-2">Time {getSortIcon('rescheduled_time')}</div>
//                   </th> */}
//                   <th className="px-8 py-6 text-left text-lg font-bold cursor-pointer hover:bg-emerald-700 transition" onClick={() => handleSort('training_name')}>
//                     <div className="flex items-center gap-2">Training Name {getSortIcon('training_name')}</div>
//                   </th>
//                   <th className="px-8 py-6 text-left text-lg font-bold">Status</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {paginatedData.map((record) => (
//                   <tr key={record.id} className="hover:bg-emerald-50 transition-all text-gray-800">
//                     <td className="px-8 py-6 font-semibold text-xl">
//                       {record.employee_name} {record.employee_last_name}
//                     </td>
//                     <td className="px-8 py-6">
//                       <code className="bg-gray-100 px-4 py-2 rounded-lg font-mono text-lg font-bold text-emerald-700">
//                         {record.employee_temp_id}
//                       </code>
//                     </td>
//                     <td className="px-8 py-6">
//                       <span className="inline-flex items-center gap-3 px-6 py-3 bg-red-100 text-red-800 font-bold text-xl rounded-full shadow-md">
//                         <CalendarDays className="w-7 h-7" />
//                         Day {record.original_day_number}
//                       </span>
//                     </td>
//                     <td className="px-8 py-6 text-red-600 font-medium text-lg">
//                       {new Date(record.original_date).toLocaleDateString('en-GB')}
//                     </td>
//                     <td className="px-8 py-6 text-emerald-700 font-bold text-xl flex items-center gap-3">
//                       <Calendar className="w-6 h-6" />
//                       {new Date(record.rescheduled_date).toLocaleDateString('en-GB', {
//                         weekday: 'short',
//                         day: 'numeric',
//                         month: 'short',
//                         year: 'numeric'
//                       })}
//                     </td>
//                     <td className="px-8 py-6 flex items-center gap-3">
//                       <Clock className="w-6 h-6 text-emerald-600" />
//                       <span className="font-bold text-lg">{record.rescheduled_time}</span>
//                     </td>
//                     <td className="px-8 py-6 text-gray-900 font-medium text-lg max-w-md">
//                       {record.training_name}
//                     </td>
//                     <td className="px-8 py-6">
//                       <span className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 font-bold text-xl rounded-full shadow-md">
//                         <CheckCircle className="w-8 h-8" />
//                         Present
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination Controls */}
//           {totalPages > 1 && (
//             <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
//               <div className="text-sm text-gray-600">
//                 Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} records
//               </div>
//               <div className="flex items-center gap-3">
//                 <button
//                   onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//                   disabled={currentPage === 1}
//                   className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md"
//                 >
//                   Previous
//                 </button>
//                 <div className="flex gap-2">
//                   {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                     let pageNum;
//                     if (totalPages <= 5) pageNum = i + 1;
//                     else if (currentPage <= 3) pageNum = i + 1;
//                     else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
//                     else pageNum = currentPage - 2 + i;

//                     return pageNum >= 1 && pageNum <= totalPages ? (
//                       <button
//                         key={pageNum}
//                         onClick={() => setCurrentPage(pageNum)}
//                         className={`px-4 py-2 rounded-lg font-bold transition-all ${
//                           currentPage === pageNum
//                             ? 'bg-emerald-600 text-white shadow-lg'
//                             : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                         }`}
//                       >
//                         {pageNum}
//                       </button>
//                     ) : null;
//                   })}
//                 </div>
//                 <button
//                   onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//                   disabled={currentPage === totalPages}
//                   className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Summary */}
//           <div className="mt-10 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-8 border-2 border-emerald-200">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
//               <div>
//                 <div className="text-5xl font-bold text-emerald-700">{totalItems}</div>
//                 <div className="text-xl text-gray-700 mt-2">Total Make-up Sessions Completed</div>
//               </div>
//               <div>
//                 <div className="text-5xl font-bold text-green-700">100%</div>
//                 <div className="text-xl text-gray-700 mt-2">Recovery Rate</div>
//               </div>
//               <div>
//                 <div className="text-5xl font-bold text-emerald-700">Excellent!</div>
//                 <div className="text-xl text-gray-700 mt-2">All absences recovered</div>
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }



// components/AttendanceHistory.tsx
import { useState, useEffect, useMemo } from 'react';
import {
  History, Search, Loader2, RefreshCw, Calendar, CheckCircle, CalendarDays
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface RescheduledSession {
  id: number;
  employee_name: string;
  employee_last_name: string;
  employee_temp_id: string;
  original_date: string;
  original_day_number: number;
  rescheduled_date: string;
  rescheduled_time: string;
  training_name: string;
  attendance_marked_at: string | null;
}

type SortKey = 'employee_name' | 'employee_temp_id' | 'original_day_number' | 'original_date' | 'rescheduled_date' | 'training_name';
type SortOrder = 'asc' | 'desc';

export default function AttendanceHistory() {
  const [data, setData] = useState<RescheduledSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortKey, setSortKey] = useState<SortKey>('rescheduled_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/rescheduled-sessions/?status=completed`);
      const completed = res.data.filter((s: any) => s.attendance_status === 'present');
      const sorted = completed.sort((a: any, b: any) => 
        new Date(b.attendance_marked_at || b.rescheduled_date).getTime() - 
        new Date(a.attendance_marked_at || a.rescheduled_date).getTime()
      );
      setData(sorted);
    } catch (err) {
      toast.error('Failed to load history');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const processedData = useMemo(() => {
    let filtered = [...data];

    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(r =>
        `${r.employee_name} ${r.employee_last_name}`.toLowerCase().includes(term) ||
        r.employee_temp_id.toLowerCase().includes(term) ||
        r.training_name.toLowerCase().includes(term) ||
        r.original_day_number.toString().includes(term)
      );
    }

    filtered.sort((a, b) => {
      let aVal: any = a[sortKey];
      let bVal: any = b[sortKey];

      if (sortKey === 'employee_name') {
        aVal = `${a.employee_name} ${a.employee_last_name}`;
        bVal = `${b.employee_name} ${b.employee_last_name}`;
      }

      if (sortKey.includes('date')) {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data, search, sortKey, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(processedData.length / pageSize));
  const paginatedData = processedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => setCurrentPage(1), [search]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="w-full bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="w-full mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                <History className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Attendance History</h2>
                <p className="text-sm text-gray-600">Completed make-up sessions</p>
              </div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search name, ID, day or training..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
              <button
                onClick={loadHistory}
                disabled={loading}
                className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-sm text-gray-600">
              Total Completed: <span className="font-bold text-emerald-600">{processedData.length}</span>
              {' • '} Page <span className="font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Rows:</span>
              <select
                value={pageSize}
                onChange={e => setPageSize(+e.target.value)}
                className="px-3 py-1 border rounded text-sm"
              >
                {[10, 25, 50].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Loading / Empty */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
          </div>
        ) : processedData.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border">
            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600">
              {search ? 'No matching records' : 'No completed make-up sessions yet'}
            </p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {['employee_name', 'employee_temp_id', 'original_day_number', 'original_date', 'rescheduled_date', 'training_name'].map(key => (
                        <th
                          key={key}
                          onClick={() => handleSort(key as SortKey)}
                          className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                        >
                          <div className="flex items-center gap-1">
                            {key === 'employee_name' && 'Employee'}
                            {key === 'employee_temp_id' && 'Temp ID'}
                            {key === 'original_day_number' && 'Absent Day'}
                            {key === 'original_date' && 'Absent Date'}
                            {key === 'rescheduled_date' && 'Attended Date'}
                            {key === 'training_name' && 'Training'}
                            <span className="text-xs">{getSortIcon(key as SortKey)}</span>
                          </div>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-center font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedData.map(record => (
                      <tr key={record.id} className="hover:bg-emerald-50/30">
                        <td className="px-4 py-3 font-medium">
                          {record.employee_name} {record.employee_last_name}
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-700">{record.employee_temp_id}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                            <CalendarDays className="w-4 h-4 mr-1" />
                            Day {record.original_day_number}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(record.original_date).toLocaleDateString('en-GB')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-emerald-600" />
                            <span className="font-medium text-emerald-700">
                              {new Date(record.rescheduled_date).toLocaleDateString('en-GB')}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-800">{record.training_name}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                            <CheckCircle className="w-4 h-4" />
                            Present
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-4 py-3 bg-gray-50 border-t flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
                <span className="text-gray-700">
                  Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, processedData.length)} of {processedData.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 hover:bg-gray-200 rounded disabled:opacity-50"
                  >
                    ←
                  </button>
                  <span className="text-gray-700">Page {currentPage} / {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 hover:bg-gray-200 rounded disabled:opacity-50"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            {/* <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200 p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-4xl font-bold text-emerald-700">{processedData.length}</div>
                  <div className="text-sm text-gray-700 mt-1">Completed Sessions</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-green-700">100%</div>
                  <div className="text-sm text-gray-700 mt-1">Recovery Rate</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-emerald-700">Excellent!</div>
                  <div className="text-sm text-gray-700 mt-1">All absences recovered</div>
                </div>
              </div>
            </div> */}
          </>
        )}
      </div>
    </div>
  );
}






