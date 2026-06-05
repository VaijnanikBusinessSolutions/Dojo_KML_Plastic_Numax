

// import { useState, useEffect, useMemo } from 'react';
// import {
//   CheckCircle,
//   XCircle,
//   Calendar,
//   Save,
//   Loader2,
//   ChevronLeft,
//   ChevronRight,
//   Users,
//   History,
//   Search,

// } from 'lucide-react';

// interface Batch {
//   batch_id: string;
//   start_date?: string;
//   is_completed?: boolean;
// }

// interface Employee {
//   id: number;
//   first_name: string;
//   last_name?: string;
//   email?: string;
//   temp_id?: string;
//   full_name: string;
// }

// interface Day {
//   days_id: number;
//   day: string;
// }

// interface AttendanceMarkingProps {
//   onSuccess: () => void;}


// export default function AttendanceMarking({ onSuccess }: AttendanceMarkingProps)  {
//   const [viewMode, setViewMode] = useState<'active' | 'past'>('active');
//   const [batches, setBatches] = useState<Batch[]>([]);
//   const [selectedBatch, setSelectedBatch] = useState<string>('');
//   const [employees, setEmployees] = useState<Employee[]>([]);
//   const [days, setDays] = useState<Day[]>([]);
//   const [currentDay, setCurrentDay] = useState(1);
//   const [currentDate, setCurrentDate] = useState('');
//   const [attendance, setAttendance] = useState<Record<number, 'present' | 'absent' | ''>>({});
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState('');
//   const [isBatchCompleted, setIsBatchCompleted] = useState(false);

//   // Pagination & Search State
//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [sortConfig, setSortConfig] = useState<{ key: 'full_name' | 'temp_id'; direction: 'asc' | 'desc' } | null>(null);

//   // Fetch training days
//   useEffect(() => {
//     const fetchDays = async () => {
//       try {
//         const res = await fetch('http://127.0.0.1:8000/days/');
//         if (!res.ok) throw new Error('Failed to load days');
//         const data: Day[] = await res.json();
//         setDays(data.sort((a, b) => a.days_id - b.days_id));
//       } catch (err) {
//         setError('Could not load training days');
//       }
//     };
//     fetchDays();
//   }, []);
//   useEffect(() => {
//   console.log("AttendanceMarking loaded");
// }, [onSuccess]);


//   // Fetch batches
//   useEffect(() => {
//     const fetchBatches = async () => {
//       setLoading(true);
//       setBatches([]);
//       setSelectedBatch('');
//       setError('');
//       const endpoint =
//         viewMode === 'active'
//           ? 'http://127.0.0.1:8000/training-batches/active/'
//           : 'http://127.0.0.1:8000/training-batches/past/';
//       try {
//         const res = await fetch(endpoint);
//         if (!res.ok) throw new Error(`Failed to fetch ${viewMode} batches`);
//         const data: Batch[] = await res.json();
//         setBatches(data);
//       } catch (err: any) {
//         setError(err.message || 'Failed to load batches');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchBatches();
//   }, [viewMode]);

//   // Fetch batch details
//   useEffect(() => {
//     if (!selectedBatch) {
//       setEmployees([]);
//       setAttendance({});
//       setIsBatchCompleted(false);
//       setPage(1);
//       return;
//     }

//     const fetchBatchDetails = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(`http://127.0.0.1:8000/attendance-detail/${selectedBatch}/`);
//         if (!res.ok) throw new Error('Failed to load batch details');
//         const data = await res.json();

//         setIsBatchCompleted(data.is_completed || false);

//         const formattedEmployees: Employee[] = data.users.map((u: any) => ({
//           id: u.id,
//           first_name: u.first_name,
//           last_name: u.last_name || '',
//           email: u.email || '',
//           temp_id: u.temp_id || `EMP${u.id}`,
//           full_name: `${u.first_name} ${u.last_name || ''}`.trim(),
//         }));

//         setEmployees(formattedEmployees);

//         // Load current day attendance
//         const initial: Record<number, 'present' | 'absent' | ''> = {};
//         data.users.forEach((user: any) => {
//           const status = user.attendances[currentDay];
//           if (status === 'present' || status === 'absent') {
//             initial[user.id] = status;
//           }
//         });
//         setAttendance(initial);

//         const base = new Date();
//         base.setDate(base.getDate() + currentDay - 1);
//         setCurrentDate(base.toISOString().split('T')[0]);
//       } catch (err: any) {
//         setError(err.message || 'Failed to load batch data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBatchDetails();
//   }, [selectedBatch, currentDay]);

//   // Search + Sort + Pagination Logic (High Performance with useMemo)
//   const processedEmployees = useMemo(() => {
//     let filtered = employees;

//     // Search
//     if (searchTerm) {
//       const lower = searchTerm.toLowerCase();
//       filtered = employees.filter(
//         (emp) =>
//           emp.full_name.toLowerCase().includes(lower) ||
//           emp.temp_id?.toLowerCase().includes(lower)
//       );
//     }

//     // Sort (default: latest first by ID, but allow column sort)
//     let sorted = [...filtered];
//     if (sortConfig) {
//    sorted.sort((a, b) => {
//   const aVal = a[sortConfig.key] ?? "";
//   const bVal = b[sortConfig.key] ?? "";

//   if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
//   if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
//   return 0;
// });
//     } else {
//       // Default: newest employees first
//       sorted.sort((a, b) => b.id - a.id);
//     }

//     return sorted;
//   }, [employees, searchTerm, sortConfig]);

//   const totalItems = processedEmployees.length;
//   const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
//   const paginatedEmployees = useMemo(() => {
//     const start = (page - 1) * pageSize;
//     return processedEmployees.slice(start, start + pageSize);
//   }, [processedEmployees, page, pageSize]);

//   // Reset page when filters change
//   useEffect(() => {
//     setPage(1);
//   }, [searchTerm, selectedBatch]);

//   const handleSort = (key: 'full_name' | 'temp_id') => {
//     setSortConfig((current) => {
//       if (!current || current.key !== key) return { key, direction: 'asc' };
//       if (current.direction === 'asc') return { key, direction: 'desc' };
//       return null; // remove sort
//     });
//   };

//   const handleAttendanceToggle = (employeeId: number, status: 'present' | 'absent') => {
//     if (viewMode === 'past' || isBatchCompleted) return;
//     setAttendance((prev) => ({
//       ...prev,
//       [employeeId]: prev[employeeId] === status ? '' : status,
//     }));
//   };

//   const handleDayChange = (day: number) => {
//     if (day < 1 || day > days.length) return;
//     setCurrentDay(day);
//   };

//   const handleSave = async () => {
//     const changes = Object.entries(attendance)
//       .filter(([_, status]) => status !== '')
//       .map(([userId, status]) => ({
//         user: Number(userId),
//         batch: selectedBatch,
//         day_number: currentDay,
//         status: status === 'present' ? 'present' : 'absent',
//       }));

//     if (changes.length === 0) {
//       setError('No attendance marked to save');
//       return;
//     }

//     setSaving(true);
//     setError('');
//     try {
//       const res = await fetch('http://127.0.0.1:8000/attendances/', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(changes),
//       });
//       const result = await res.json();
//       if (!res.ok) throw new Error(result.error || 'Failed to save');
//       alert('Attendance saved successfully!');
//       handleDayChange(currentDay);
//     } catch (err: any) {
//       setError(err.message || 'Save failed');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const totalDays = days.length;

//   return (
//     <div className="w-full bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100 min-h-screen">
//       <div className="w-full p-6">
//         {/* Header */}
//         <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
//                 <Calendar className="w-10 h-10 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-4xl font-bold text-gray-800">Training Attendance</h1>
//                 <p className="text-lg text-gray-600 mt-1">Manage attendance for active and past batches</p>
//               </div>
//             </div>
//             <div className="flex bg-gray-100 rounded-xl p-2">
//               <button
//                 onClick={() => setViewMode('active')}
//                 className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
//                   viewMode === 'active'
//                     ? 'bg-white text-blue-600 shadow-lg'
//                     : 'text-gray-600 hover:text-gray-800'
//                 }`}
//               >
//                 <Users className="w-5 h-5" />
//                 Active Batches
//               </button>
//               <button
//                 onClick={() => setViewMode('past')}
//                 className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
//                   viewMode === 'past'
//                     ? 'bg-white text-purple-600 shadow-lg'
//                     : 'text-gray-600 hover:text-gray-800'
//                 }`}
//               >
//                 <History className="w-5 h-5" />
//                 Past Batches
//               </button>
//             </div>
//           </div>
//         </div>

//         {error && (
//           <div className="mb-6 p-5 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
//             {error}
//           </div>
//         )}

//         {/* Batch Selection */}
//         <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="md:col-span-2">
//               <label className="block text-lg font-bold text-gray-700 mb-3">
//                 {viewMode === 'active' ? 'Select Active Batch' : 'Select Past Batch'}
//               </label>
//               <select
//                 value={selectedBatch}
//                 onChange={(e) => setSelectedBatch(e.target.value)}
//                 className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all"
//               >
//                 <option value="">
//                   {loading ? 'Loading batches...' : '-- Choose a batch --'}
//                 </option>
//                 {batches.map((batch) => (
//                   <option key={batch.batch_id} value={batch.batch_id}>
//                     {batch.batch_id} {batch.is_completed && '(Completed)'}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-lg font-bold text-gray-700 mb-3">
//                 Total Training Days
//               </label>
//               <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-2xl font-bold px-8 py-6 rounded-xl text-center">
//                 {totalDays}
//               </div>
//             </div>
//           </div>
//         </div>

//         {loading && (
//           <div className="flex justify-center py-20">
//             <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
//           </div>
//         )}

//         {!loading && selectedBatch && employees.length > 0 && (
//           <>
//             {/* Day Header */}
//             <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl shadow-xl p-8 mb-8">
//               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//                 <div>
//                   <h2 className="text-3xl font-bold">Batch: {selectedBatch}</h2>
//                   <p className="text-xl mt-2 opacity-90">
//                     Day {currentDay} of {totalDays} • {new Date(currentDate).toLocaleDateString('en-US', {
//                       weekday: 'long',
//                       year: 'numeric',
//                       month: 'long',
//                       day: 'numeric',
//                     })}
//                   </p>
//                   {isBatchCompleted && (
//                     <span className="inline-block mt-3 px-4 py-2 bg-yellow-500 text-black font-bold rounded-full text-sm">
//                       Batch Completed
//                     </span>
//                   )}
//                 </div>
//               </div>

//               {/* Day Navigation */}
//               <div className="flex items-center justify-center gap-4 mt-8">
//                 <button
//                   onClick={() => handleDayChange(currentDay - 1)}
//                   disabled={currentDay === 1}
//                   className="p-4 bg-white/20 hover:bg-white/30 rounded-xl disabled:opacity-50"
//                 >
//                   <ChevronLeft className="w-8 h-8" />
//                 </button>
//                 <div className="flex gap-3 flex-wrap justify-center max-w-4xl">
//                   {days.map((day) => (
//                     <button
//                       key={day.days_id}
//                       onClick={() => handleDayChange(day.days_id)}
//                       disabled={viewMode === 'past'}
//                       className={`w-16 h-16 rounded-xl font-bold text-lg transition-all ${
//                         day.days_id === currentDay
//                           ? 'bg-white text-blue-600 shadow-2xl scale-110'
//                           : 'bg-white/20 hover:bg-white/30'
//                       }`}
//                     >
//                       {day.day}
//                     </button>
//                   ))}
//                 </div>
//                 <button
//                   onClick={() => handleDayChange(currentDay + 1)}
//                   disabled={currentDay === totalDays}
//                   className="p-4 bg-white/20 hover:bg-white/30 rounded-xl disabled:opacity-50"
//                 >
//                   <ChevronRight className="w-8 h-8" />
//                 </button>
//               </div>
//             </div>

//             {/* Search Bar */}
//             <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
//               <div className="relative">
//                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
//                 <input
//                   type="text"
//                   placeholder="Search by name or temp ID..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-14 pr-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all"
//                 />
//               </div>
//             </div>

//             {/* Total Count */}
//             <div className="bg-white rounded-2xl shadow-xl p-6 mb-4">
//               <div className="flex flex-wrap justify-between items-center gap-4 text-lg">
//                 <div>
//                   <span className="font-bold text-gray-700">Total Employees:</span>{' '}
//                   <span className="text-blue-600 font-bold">{totalItems}</span>
//                 </div>
//                 <div className="text-gray-600">
//                   Showing page <span className="font-bold text-blue-600">{page}</span> of{' '}
//                   <span className="font-bold text-blue-600">{totalPages}</span>
//                 </div>
//               </div>
//             </div>

//             {/* Table */}
//             <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
//                     <tr>
//                       <th className="px-8 py-6 text-left text-lg font-bold">#</th>
//                       <th
//                         onClick={() => handleSort('temp_id')}
//                         className="px-8 py-6 text-left text-lg font-bold cursor-pointer hover:bg-white/10 transition"
//                       >
//                         Temp ID {sortConfig?.key === 'temp_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
//                       </th>
//                       <th
//                         onClick={() => handleSort('full_name')}
//                         className="px-8 py-6 text-left text-lg font-bold cursor-pointer hover:bg-white/10 transition"
//                       >
//                         Employee Name {sortConfig?.key === 'full_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
//                       </th>
//                       <th className="px-8 py-6 text-center text-lg font-bold">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {paginatedEmployees.map((employee, idx) => (
//                       <tr
//                         key={employee.id}
//                         className="border-b border-gray-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all"
//                       >
//                         <td className="px-8 py-6 text-gray-700 font-medium">
//                           {(page - 1) * pageSize + idx + 1}
//                         </td>
//                         <td className="px-8 py-6 text-gray-900 font-semibold">{employee.temp_id}</td>
//                         <td className="px-8 py-6 text-gray-900 font-semibold">{employee.full_name}</td>
//                         <td className="px-8 py-6">
//                           <div className="flex justify-center gap-4">
//                             <button
//                               onClick={() => handleAttendanceToggle(employee.id, 'present')}
//                               disabled={viewMode === 'past' || isBatchCompleted}
//                               className={`px-10 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-all ${
//                                 attendance[employee.id] === 'present'
//                                   ? 'bg-green-500 text-white shadow-xl scale-105'
//                                   : 'bg-gray-200 text-gray-700 hover:bg-green-100'
//                               } ${viewMode === 'past' || isBatchCompleted ? 'cursor-not-allowed opacity-70' : ''}`}
//                             >
//                               <CheckCircle className="w-7 h-7" /> P
//                             </button>
//                             <button
//                               onClick={() => handleAttendanceToggle(employee.id, 'absent')}
//                               disabled={viewMode === 'past' || isBatchCompleted}
//                               className={`px-10 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-all ${
//                                 attendance[employee.id] === 'absent'
//                                   ? 'bg-red-500 text-white shadow-xl scale-105'
//                                   : 'bg-gray-200 text-gray-700 hover:bg-red-100'
//                               } ${viewMode === 'past' || isBatchCompleted ? 'cursor-not-allowed opacity-70' : ''}`}
//                             >
//                               <XCircle className="w-7 h-7" /> A
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Pagination Controls */}
//               <div className="p-6 border-t border-gray-200 bg-gray-50">
//                 <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
//                   <div className="flex items-center gap-3">
//                     <span className="text-gray-700 font-medium">Rows per page:</span>
//                     <select
//                       value={pageSize}
//                       onChange={(e) => {
//                         setPageSize(Number(e.target.value));
//                         setPage(1);
//                       }}
//                       className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                     >
//                       {[10, 25, 50, 100].map((size) => (
//                         <option key={size} value={size}>
//                           {size}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div className="flex items-center gap-2">
//                     <button
//                       onClick={() => setPage((p) => Math.max(1, p - 1))}
//                       disabled={page === 1}
//                       className="p-3 rounded-lg bg-white border border-gray-300 disabled:opacity-50 hover:bg-gray-100 transition"
//                     >
//                       <ChevronLeft className="w-5 h-5" />
//                     </button>

//                     <div className="flex gap-1">
//                       {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
//                         <button
//                           key={p}
//                           onClick={() => setPage(p)}
//                           className={`px-4 py-2 rounded-lg font-medium transition ${
//                             p === page
//                               ? 'bg-blue-600 text-white'
//                               : 'bg-white border border-gray-300 hover:bg-gray-100'
//                           }`}
//                         >
//                           {p}
//                         </button>
//                       ))}
//                     </div>

//                     <button
//                       onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                       disabled={page === totalPages}
//                       className="p-3 rounded-lg bg-white border border-gray-300 disabled:opacity-50 hover:bg-gray-100 transition"
//                     >
//                       <ChevronRight className="w-5 h-5" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Save Button */}
//             {viewMode === 'active' && !isBatchCompleted && (
//               <div className="mt-8">
//                 <button
//                   onClick={handleSave}
//                   disabled={saving || Object.values(attendance).every((v) => v === '')}
//                   className="w-full py-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-2xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4"
//                 >
//                   {saving ? (
//                     <>
//                       <Loader2 className="w-10 h-10 animate-spin" />
//                       Saving Attendance...
//                     </>
//                   ) : (
//                     <>
//                       <Save className="w-10 h-10" />
//                       Save Day {currentDay} Attendance
//                     </>
//                   )}
//                 </button>
//               </div>
//             )}
//           </>
//         )}

//         {!loading && selectedBatch && employees.length === 0 && (
//           <div className="text-center py-20 text-2xl text-gray-500 bg-white rounded-2xl shadow-xl">
//             No employees found in this batch
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }





import { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle,
  XCircle,
  Calendar,
  Save,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Users,
  History,
  Search,
} from 'lucide-react';

interface Batch { batch_id: string; start_date?: string; is_completed?: boolean; }
interface Employee { id: number; first_name: string; last_name?: string; email?: string; temp_id?: string; full_name: string; }
interface Day { days_id: number; day: string; }

interface AttendanceMarkingProps { onSuccess: () => void; }

export default function AttendanceMarking({ onSuccess }: AttendanceMarkingProps) {
  const [viewMode, setViewMode] = useState<'active' | 'past'>('active');
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [days, setDays] = useState<Day[]>([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [currentDate, setCurrentDate] = useState('');
  const [attendance, setAttendance] = useState<Record<number, 'present' | 'absent' | ''>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isBatchCompleted, setIsBatchCompleted] = useState(false);

  // Pagination & Search
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: 'full_name' | 'temp_id'; direction: 'asc' | 'desc' } | null>(null);

  // Fetch days
  useEffect(() => {
    const fetchDays = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/days/');
        if (!res.ok) throw new Error('Failed to load days');
        const data: Day[] = await res.json();
        setDays(data.sort((a, b) => a.days_id - b.days_id));
      } catch {
        setError('Could not load training days');
      }
    };
    fetchDays();
  }, []);

  // Fetch batches
  useEffect(() => {
    const fetchBatches = async () => {
      setLoading(true);
      const endpoint = viewMode === 'active'
        ? 'http://127.0.0.1:8000/training-batches/active/'
        : 'http://127.0.0.1:8000/training-batches/past/';
      try {
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`Failed to fetch ${viewMode} batches`);
        const data: Batch[] = await res.json();
        setBatches(data);
        setSelectedBatch('');
      } catch (err: any) {
        setError(err.message || 'Failed to load batches');
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, [viewMode]);

  // Fetch batch details
  useEffect(() => {
    if (!selectedBatch) {
      setEmployees([]); setAttendance({}); setPage(1); return;
    }

    const fetchBatchDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://127.0.0.1:8000/attendance-detail/${selectedBatch}/`);
        if (!res.ok) throw new Error('Failed to load batch');
        const data = await res.json();

        setIsBatchCompleted(data.is_completed || false);

        const formattedEmployees: Employee[] = data.users.map((u: any) => ({
          id: u.id,
          first_name: u.first_name,
          last_name: u.last_name || '',
          temp_id: u.temp_id || `EMP${u.id}`,
          full_name: `${u.first_name} ${u.last_name || ''}`.trim(),
        }));
        setEmployees(formattedEmployees);

        const initial: Record<number, 'present' | 'absent' | ''> = {};
        data.users.forEach((user: any) => {
          const status = user.attendances[currentDay];
          if (status) initial[user.id] = status;
        });
        setAttendance(initial);

        const date = new Date();
        date.setDate(date.getDate() + currentDay - 1);
        setCurrentDate(date.toISOString().split('T')[0]);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchBatchDetails();
  }, [selectedBatch, currentDay]);

  // Processed employees
  const processedEmployees = useMemo(() => {
    let list = searchTerm
      ? employees.filter(e => 
          e.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.temp_id?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : employees;

    if (sortConfig) {
      list = [...list].sort((a, b) => {
        const aVal = a[sortConfig.key] ?? '';
        const bVal = b[sortConfig.key] ?? '';
        return (aVal < bVal ? -1 : 1) * (sortConfig.direction === 'asc' ? 1 : -1);
      });
    }
    return list;
  }, [employees, searchTerm, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(processedEmployees.length / pageSize));
  const paginated = processedEmployees.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [searchTerm, selectedBatch]);

  const handleSort = (key: 'full_name' | 'temp_id') => {
    setSortConfig(prev => 
      prev?.key === key 
        ? prev.direction === 'asc' ? null : { key, direction: 'asc' }
        : { key, direction: 'asc' }
    );
  };

  const toggleAttendance = (id: number, status: 'present' | 'absent') => {
    if (viewMode === 'past' || isBatchCompleted) return;
    setAttendance(prev => ({ ...prev, [id]: prev[id] === status ? '' : status }));
  };

  const handleSave = async () => {
    const changes = Object.entries(attendance)
      .filter(([_, s]) => s)
      .map(([id, status]) => ({
        user: Number(id),
        batch: selectedBatch,
        day_number: currentDay,
        status,
      }));

    if (!changes.length) return setError('No changes to save');

    setSaving(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/attendances/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
      alert('Attendance saved successfully!');
      onSuccess?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="w-full mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-lg">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Training Attendance</h1>
                <p className="text-sm text-gray-600">Mark daily attendance for training batches</p>
              </div>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button onClick={() => setViewMode('active')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${viewMode === 'active' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-600'}`}>
                <Users className="w-4 h-4 inline mr-1" /> Active
              </button>
              <button onClick={() => setViewMode('past')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${viewMode === 'past' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-600'}`}>
                <History className="w-4 h-4 inline mr-1" /> Past
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Batch Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Batch</label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gradient-blue focus:border-blue-500 text-sm"
                disabled={loading}
              >
                <option value="">{loading ? 'Loading...' : '-- Select Batch --'}</option>
                {batches.map(b => (
                  <option key={b.batch_id} value={b.batch_id}>
                    {b.batch_id} {b.is_completed && '(Completed)'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Days</label>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white text-center py-3 px-4 rounded-lg font-bold text-xl shadow-md">
                {days.length}
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          </div>
        )}

        {selectedBatch && !loading && employees.length > 0 && (
          <>
            {/* Day Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl p-5 shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-2xl font-bold">Batch: {selectedBatch}</h2>
                  <p className="text-sm opacity-90">
                    Day {currentDay} • {new Date(currentDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  {isBatchCompleted && <span className="inline-block mt-2 px-4 py-1 bg-yellow-400 text-black text-xs font-bold rounded-full">Batch Completed</span>}
                </div>
              </div>

              {/* Day Navigation Pills */}
              <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-2">
                <button onClick={() => setCurrentDay(d => Math.max(1, d - 1))} disabled={currentDay === 1} className="p-2 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 disabled:opacity-50 transition">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {days.map(d => (
                  <button
                    key={d.days_id}
                    onClick={() => setCurrentDay(d.days_id)}
                    disabled={viewMode === 'past'}
                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
                      d.days_id === currentDay 
                        ? 'bg-white text-blue-700 shadow-lg' 
                        : 'bg-white/20 backdrop-blur hover:bg-white/30'
                    }`}
                  >
                    {d.day}
                  </button>
                ))}
                <button onClick={() => setCurrentDay(d => Math.min(days.length, d + 1))} disabled={currentDay === days.length} className="p-2 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 disabled:opacity-50 transition">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or Temp ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">#</th>
                      <th onClick={() => handleSort('temp_id')} className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-blue-100/50">
                        Temp ID {sortConfig?.key === 'temp_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('full_name')} className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-blue-100/50">
                        Name {sortConfig?.key === 'full_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-gray-700">Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginated.map((emp, i) => (
                      <tr key={emp.id} className="hover:bg-blue-50/30 transition">
                        <td className="px-4 py-3 text-gray-600">{(page - 1) * pageSize + i + 1}</td>
                        <td className="px-4 py-3 font-mono font-medium text-blue-700">{emp.temp_id}</td>
                        <td className="px-4 py-3 font-medium">{emp.full_name}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-4">
                            <button
                              onClick={() => toggleAttendance(emp.id, 'present')}
                              disabled={viewMode === 'past' || isBatchCompleted}
                              className={`px-5 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                                attendance[emp.id] === 'present'
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                              } disabled:opacity-50`}
                            >
                              <CheckCircle className="w-5 h-5" /> Present
                            </button>
                            <button
                              onClick={() => toggleAttendance(emp.id, 'absent')}
                              disabled={viewMode === 'past' || isBatchCompleted}
                              className={`px-5 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                                attendance[emp.id] === 'absent'
                                  ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-700 hover:bg-red-100'
                              } disabled:opacity-50`}
                            >
                              <XCircle className="w-5 h-5" /> Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-4 py-3 bg-gray-50 border-t flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">Rows:</span>
                  <select value={pageSize} onChange={e => { setPageSize(+e.target.value); setPage(1); }} className="px-3 py-1 border rounded">
                    {[10, 25, 50].map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 hover:bg-gray-200 rounded disabled:opacity-50">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-medium text-gray-700">Page {page} of {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 hover:bg-gray-200 rounded disabled:opacity-50">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Save Button with Gradient */}
            {viewMode === 'active' && !isBatchCompleted && (
              <button
                onClick={handleSave}
                disabled={saving || !Object.values(attendance).some(v => v)}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold text-lg rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all duration-200"
              >
                {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                {saving ? 'Saving Attendance...' : 'Save Attendance for Day ' + currentDay}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}