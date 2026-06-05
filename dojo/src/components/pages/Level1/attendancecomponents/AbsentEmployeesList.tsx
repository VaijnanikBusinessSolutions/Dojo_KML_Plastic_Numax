
// import { useState, useEffect, useMemo } from 'react';
// import {
//   UserX,
//   Loader2,
//   Search,
//   Users,
//   History,
//   Calendar,
//   Clock,
//   BookOpen,
//   Save,
//   X,
//   ChevronLeft,
//   ChevronRight,
// } from 'lucide-react';
// import axios from 'axios';

// interface AbsentUser {
//   id: number;
//   temp_id: string;
//   full_name: string;
//   attendance_date?: string | null;
// }

// interface AbsenteesByDay {
//   day_number: number;
//   absent_count: number;
//   absent_users: AbsentUser[];
// }

// interface Batch {
//   batch_id: string;
//   created_at?: string;
//   is_completed?: boolean;
// }

// interface AbsenceItem {
//   id: number;
//   temp_id: string;
//   full_name: string;
//   day_number: number;
//   absent_date: string;
// }

// interface SubTopic {
//   subtopic_id: number;
//   subtopic_name: string;
//   day_name: string;
// }

// export default function AbsentEmployeesList() {
//   const [viewMode, setViewMode] = useState<'active' | 'past'>('active');
//   const [batches, setBatches] = useState<Batch[]>([]);
//   const [batchId, setBatchId] = useState<string>('');
//   const [absences, setAbsences] = useState<AbsenceItem[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [loadingBatches, setLoadingBatches] = useState(true);

//   // Pagination & Search & Sort
//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [sortConfig, setSortConfig] = useState<{
//     key: 'full_name' | 'temp_id' | 'day_number' | 'absent_date';
//     direction: 'asc' | 'desc';
//   } | null>(null);

//   // Reschedule Modal State
//   const [showModal, setShowModal] = useState(false);
//   const [selectedItem, setSelectedItem] = useState<AbsenceItem | null>(null);
//   const [saving, setSaving] = useState(false);
//   const [subtopics, setSubtopics] = useState<SubTopic[]>([]);
//   const [loadingSubtopics, setLoadingSubtopics] = useState(false);

//   const [form, setForm] = useState({
//     rescheduled_date: '',
//     rescheduled_time: '10:00',
//     training_name: '',
//   });

//   const API_BASE = import.meta.env.VITE_API_URL || 'http://172.25.0.51:8000';

//   // Fetch Batches
//   useEffect(() => {
//     const fetchBatches = async () => {
//       setLoadingBatches(true);
//       const endpoint =
//         viewMode === 'active'
//           ? `${API_BASE}/training-batches/active/`
//           : `${API_BASE}/training-batches/past/`;

//       try {
//         const res = await axios.get(endpoint);
//         const list = res.data.results || res.data || [];
//         console.log('Fetched batches:', list);
//         setBatches(list);
//         if (list.length > 0 && !batchId) {
//           setBatchId(list[0].batch_id);
//         }
//       } catch (err) {
//         console.error('Failed to load batches:', err);
//       } finally {
//         setLoadingBatches(false);
//       }
//     };
//     fetchBatches();
//   }, [viewMode, API_BASE]);
  

//   // Fetch Absences
//   useEffect(() => {
//     if (!batchId) {
//       setAbsences([]);
//       setPage(1);
//       return;
//     }

//     const fetchAbsences = async () => {
//       setLoading(true);
//       try {
//         const res = await axios.get(`${API_BASE}/batch/${batchId}/absentees/`);
//         console.log('Raw absences response:', res.data);

//         const days: AbsenteesByDay[] = res.data.absentees_by_day || [];

//         const flatData: AbsenceItem[] = days.flatMap((day) =>
//           day.absent_users.map((user) => ({
//             id: user.id,
//             temp_id: user.temp_id,
//             full_name: user.full_name,
//             day_number: day.day_number,
//             absent_date: user.attendance_date || new Date().toISOString().split('T')[0],
//           }))
//         );

//         flatData.sort((a, b) => new Date(b.absent_date).getTime() - new Date(a.absent_date).getTime());
//         console.log('Processed absences:', flatData);
//         setAbsences(flatData);
//       } catch (err) {
//         console.error('Failed to load absences:', err);
//         setAbsences([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAbsences();
//   }, [batchId, API_BASE]);

//   // Fetch Subtopics and Auto-fill Training Name
//   const fetchSubtopics = async (dayNumber: number) => {
//     if (!dayNumber) return;
//     setLoadingSubtopics(true);
//     try {
//       const res = await axios.get(`${API_BASE}/subtopics/by-day/${dayNumber}/`);
//       const topics: SubTopic[] = res.data || [];
//       console.log(`Subtopics for Day ${dayNumber}:`, topics);

//       setSubtopics(topics);

//       if (topics.length > 0) {
//         const names = topics.map(t => t.subtopic_name.trim()).filter(Boolean);
//         const joined = names.length > 0 ? names.join(' + ') : `Day ${dayNumber} Training`;
//         const finalName = `${joined} `;
//         console.log('Auto-generated Training Name:', finalName);
//         setForm(prev => ({ ...prev, training_name: finalName }));
//       } else {
//         const fallback = `Day ${dayNumber} Training (Make-up Session)`;
//         console.log('No subtopics found → using fallback:', fallback);
//         setForm(prev => ({ ...prev, training_name: fallback }));
//       }
//     } catch (err) {
//       console.error('Failed to fetch subtopics:', err);
//       setSubtopics([]);
//       const fallback = `Day ${selectedItem?.day_number} Training (Make-up Session)`;
//       setForm(prev => ({ ...prev, training_name: fallback }));
//     } finally {
//       setLoadingSubtopics(false);
//     }
//   };

//   // Open Modal
//   const openReschedule = async (item: AbsenceItem) => {
//     setSelectedItem(item);
//     setSubtopics([]);

//     const tomorrow = new Date();
//     tomorrow.setDate(tomorrow.getDate() + 1);
//     const tomorrowStr = tomorrow.toISOString().split('T')[0];

//     setForm({
//       rescheduled_date: tomorrowStr,
//       rescheduled_time: '10:00',
//       training_name: '',
//     });

//     setShowModal(true);
//     await fetchSubtopics(item.day_number);
//   };

//   const saveReschedule = async () => {
//     if (!selectedItem || !batchId) return;

//     setSaving(true);
//     try {
//       const payload = {
//         employee_id: selectedItem.id,
//         batch_id: batchId,
//         absent_day: selectedItem.day_number,
//         rescheduled_date: form.rescheduled_date,
//         rescheduled_time: form.rescheduled_time,
//         training_name: form.training_name,
//         notes: `Rescheduled from absence on Day ${selectedItem.day_number} – ${selectedItem.full_name}`,
//       };

//       console.log('Saving reschedule payload:', payload);

//       await axios.post(`${API_BASE}/reschedule-from-absent/`, payload);

//       setAbsences(prev => prev.filter(
//         i => !(i.id === selectedItem.id && i.day_number === selectedItem.day_number)
//       ));

//       setShowModal(false);
//       alert('Session rescheduled successfully!');
//     } catch (err: any) {
//       console.error('Reschedule failed:', err.response?.data || err);
//       alert(err.response?.data?.error || 'Failed to reschedule session.');
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Sorting, Filtering & Pagination
//   const processedData = useMemo(() => {
//     let result = [...absences];

//     if (searchTerm) {
//       const lower = searchTerm.toLowerCase();
//       result = result.filter(i =>
//         i.full_name.toLowerCase().includes(lower) ||
//         i.temp_id.toLowerCase().includes(lower)
//       );
//     }

//     if (sortConfig) {
//       result.sort((a, b) => {
//         let aVal: any = a[sortConfig.key];
//         let bVal: any = b[sortConfig.key];
//         if (sortConfig.key === 'absent_date') {
//           aVal = new Date(aVal).getTime();
//           bVal = new Date(bVal).getTime();
//         }
//         return (aVal < bVal ? -1 : 1) * (sortConfig.direction === 'asc' ? 1 : -1);
//       });
//     }

//     return result;
//   }, [absences, searchTerm, sortConfig]);

//   const totalItems = processedData.length;
//   const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
//   const paginatedData = useMemo(() =>
//     processedData.slice((page - 1) * pageSize, page * pageSize),
//     [processedData, page, pageSize]
//   );

//   useEffect(() => setPage(1), [searchTerm, batchId]);

//   const handleSort = (key: 'full_name' | 'temp_id' | 'day_number' | 'absent_date') => {
//     setSortConfig(prev =>
//       !prev || prev.key !== key ? { key, direction: 'asc' } :
//       prev.direction === 'asc' ? { key, direction: 'desc' } : null
//     );
//   };

//   return (
//     <div className="w-full bg-gradient-to-br from-red-50 to-orange-50 p-6 min-h-screen">
//       <div className="w-full mx-auto space-y-8">

//         {/* Header */}
//         <div className="bg-white rounded-2xl shadow-xl p-8">
//           <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
//             <div className="flex items-center gap-5">
//               <div className="p-4 bg-red-500 rounded-2xl">
//                 <UserX className="w-10 h-10 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-3xl font-bold text-gray-800">Absent Employees</h1>
//                 <p className="text-lg text-gray-600 mt-1">Reschedule missed training sessions</p>
//               </div>
//             </div>

//             <div className="flex gap-4">
//               <button
//                 onClick={() => setViewMode('active')}
//                 className={`px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-all ${
//                   viewMode === 'active'
//                     ? 'bg-red-500 text-white shadow-xl'
//                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                 }`}
//               >
//                 <Users className="w-6 h-6" /> Active Batches
//               </button>
//               <button
//                 onClick={() => setViewMode('past')}
//                 className={`px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-all ${
//                   viewMode === 'past'
//                     ? 'bg-indigo-600 text-white shadow-xl'
//                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                 }`}
//               >
//                 <History className="w-6 h-6" /> Past Batches
//               </button>
//             </div>
//           </div>

//           {/* Batch Selector */}
//           <div className="mt-8">
//             <label className="block text-xl font-bold text-gray-800 mb-4">
//               Select {viewMode === 'active' ? 'Active' : 'Past'} Batch
//             </label>
//             {loadingBatches ? (
//               <div className="flex items-center gap-4 text-gray-600">
//                 <Loader2 className="w-8 h-8 animate-spin" />
//                 Loading batches...
//               </div>
//             ) : (
//               <select
//                 value={batchId}
//                 onChange={(e) => setBatchId(e.target.value)}
//                 className="w-full max-w-2xl px-8 py-5 text-xl font-medium border-4 border-gray-300 rounded-2xl focus:ring-8 focus:ring-orange-300 focus:border-orange-600 transition-all shadow-lg"
//               >
//                 <option value="">-- Choose Batch --</option>
//                 {batches.map((b) => (
//                   <option key={b.batch_id} value={b.batch_id}>
//                     {b.batch_id} {b.is_completed && '(Completed)'}
//                     {b.created_at && ` — ${new Date(b.created_at).toLocaleDateString()}`}
//                   </option>
//                 ))}
//               </select>
//             )}
//           </div>
//         </div>

//         {/* Table Card */}
//         {batchId && (
//           <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
//             <div className="p-8 border-b-4 border-orange-500 bg-gradient-to-r from-red-50 to-orange-50">
//               <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-800">
//                     Batch: <span className="text-orange-600">{batchId}</span>
//                   </h2>
//                   <div className="mt-4 space-y-2">
//                     <p className="text-xl text-gray-700">
//                       Total Pending Reschedules:{' '}
//                       <span className="font-bold text-red-600">{totalItems}</span>
//                     </p>
//                     <p className="text-lg text-gray-600">
//                       Showing page <span className="font-bold text-orange-600">{page}</span> of{' '}
//                       <span className="font-bold text-orange-600">{totalPages}</span>
//                     </p>
//                   </div>
//                 </div>

//                 <div className="relative">
//                   <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-7 h-7 text-gray-400" />
//                   <input
//                     type="text"
//                     placeholder="Search by name or Temp ID..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="pl-16 pr-8 py-5 w-96 text-xl border-4 border-gray-300 rounded-2xl focus:ring-8 focus:ring-orange-300 focus:border-orange-600 transition-all shadow-lg"
//                   />
//                 </div>
//               </div>
//             </div>

//             {loading ? (
//               <div className="text-center py-32">
//                 <Loader2 className="w-20 h-20 animate-spin mx-auto text-orange-600" />
//               </div>
//             ) : totalItems === 0 ? (
//               <div className="text-center py-32">
//                 <div className="p-10 bg-green-100 rounded-full inline-block mb-8">
//                   <Users className="w-32 h-32 text-green-600" />
//                 </div>
//                 <p className="text-3xl font-bold text-green-700">All absences rescheduled!</p>
//                 <p className="text-xl text-gray-600 mt-4">Great job! No pending make-up sessions.</p>
//               </div>
//             ) : (
//               <>
//                 <div className="overflow-x-auto">
//                   <table className="w-full">
//                     <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
//                       <tr>
//                         <th onClick={() => handleSort('full_name')} className="px-8 py-6 text-left text-xl font-bold text-gray-700 cursor-pointer hover:bg-gray-300 transition">
//                           Employee Name {sortConfig?.key === 'full_name' && (sortConfig.direction === 'asc' ? 'Up' : 'Down')}
//                         </th>
//                         <th onClick={() => handleSort('temp_id')} className="px-8 py-6 text-left text-xl font-bold text-gray-700 cursor-pointer hover:bg-gray-300 transition">
//                           Temp ID {sortConfig?.key === 'temp_id' && (sortConfig.direction === 'asc' ? 'Up' : 'Down')}
//                         </th>
//                         <th onClick={() => handleSort('absent_date')} className="px-8 py-6 text-left text-xl font-bold text-gray-700 cursor-pointer hover:bg-gray-300 transition">
//                           Absent Date {sortConfig?.key === 'absent_date' && (sortConfig.direction === 'asc' ? 'Up' : 'Down')}
//                         </th>
//                         <th onClick={() => handleSort('day_number')} className="px-8 py-6 text-left text-xl font-bold text-gray-700 cursor-pointer hover:bg-gray-300 transition">
//                           Day {sortConfig?.key === 'day_number' && (sortConfig.direction === 'asc' ? 'Up' : 'Down')}
//                         </th>
//                         <th className="px-8 py-6 text-left text-xl font-bold text-gray-700">Action</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {paginatedData.map((item) => (
//                         <tr key={`${item.id}-${item.day_number}`} className="border-b-4 border-gray-200 hover:bg-orange-50 transition-all">
//                           <td className="px-8 py-8 text-2xl text-gray-900 font-medium">{item.full_name}</td>
//                           <td className="px-8 py-8">
//                             <code className="text-2xl font-mono bg-gray-100 px-6 py-3 rounded-xl">{item.temp_id}</code>
//                           </td>
//                           <td className="px-8 py-8">
//                             <div className="flex items-center gap-4">
//                               <Calendar className="w-8 h-8 text-orange-600" />
//                               <span className="text-xl font-medium text-gray-800">
//                                 {new Date(item.absent_date).toLocaleDateString('en-GB')}
//                               </span>
//                             </div>
//                           </td>
//                           <td className="px-8 py-8">
//                             <span className="inline-flex items-center px-8 py-4 bg-orange-100 text-orange-800 rounded-full text-2xl font-bold">
//                               Day {item.day_number}
//                             </span>
//                           </td>
//                           <td className="px-8 py-8">
//                             <button
//                               onClick={() => openReschedule(item)}
//                               className="px-8 py-5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-xl rounded-2xl hover:from-orange-600 hover:to-red-700 transition-all shadow-2xl hover:shadow-orange-500/50 flex items-center gap-4"
//                             >
//                               <Calendar className="w-8 h-8" />
//                               Reschedule Session
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>

//                   {/* Pagination */}
//                   <div className="p-6 bg-gray-50 border-t-4 border-gray-200">
//                     <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
//                       <div className="flex items-center gap-4">
//                         <span className="text-lg font-medium text-gray-700">Rows per page:</span>
//                         <select
//                           value={pageSize}
//                           onChange={(e) => {
//                             setPageSize(Number(e.target.value));
//                             setPage(1);
//                           }}
//                           className="px-5 py-3 border-2 border-gray-300 rounded-xl text-lg font-medium focus:ring-4 focus:ring-orange-300"
//                         >
//                           {[10, 25, 50, 100].map((size) => (
//                             <option key={size} value={size}>{size}</option>
//                           ))}
//                         </select>
//                       </div>

//                       <div className="flex items-center gap-2">
//                         <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-3 rounded-lg bg-white border border-gray-300 disabled:opacity-50 hover:bg-gray-100">
//                           <ChevronLeft className="w-6 h-6" />
//                         </button>
//                         {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
//                           <button key={p} onClick={() => setPage(p)} className={`px-5 py-3 rounded-lg font-medium ${p === page ? 'bg-orange-600 text-white' : 'bg-white border border-gray-300 hover:bg-gray-100'}`}>
//                             {p}
//                           </button>
//                         ))}
//                         <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-3 rounded-lg bg-white border border-gray-300 disabled:opacity-50 hover:bg-gray-100">
//                           <ChevronRight className="w-6 h-6" />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Reschedule Modal */}
//       {showModal && selectedItem && (
//         <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-8 overflow-y-auto">
//           <div className="bg-white rounded-3xl shadow-3xl max-w-4xl w-full p-12 my-8">
//             <div className="flex justify-between items-center mb-10">
//               <h3 className="text-4xl font-bold text-gray-800">Reschedule Training Session</h3>
//               <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
//                 <X className="w-12 h-12" />
//               </button>
//             </div>

//             <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8 mb-10">
//               <div className="text-2xl font-bold text-gray-800 mb-4">{selectedItem.full_name}</div>
//               <div className="text-xl text-gray-700 space-y-3">
//                 <p>Temp ID: <span className="font-mono font-bold text-orange-700">{selectedItem.temp_id}</span></p>
//                 <p>Absent on: <span className="font-bold text-red-600">Day {selectedItem.day_number}</span></p>
//                 <p>Date: <span className="font-bold">{new Date(selectedItem.absent_date).toLocaleDateString('en-GB')}</span></p>
//               </div>
//             </div>

//             <div className="space-y-10">
//               <div>
//                 <label className="flex items-center gap-4 text-2xl font-bold text-gray-800 mb-4">
//                   <Calendar className="w-10 h-10 text-orange-600" /> New Date
//                 </label>
//                 <input
//                   type="date"
//                   value={form.rescheduled_date}
//                   min={new Date().toISOString().split('T')[0]}
//                   onChange={(e) => setForm({ ...form, rescheduled_date: e.target.value })}
//                   className="w-full px-8 py-6 text-xl border-4 border-gray-300 rounded-2xl focus:ring-8 focus:ring-orange-300 focus:border-orange-600 transition-all"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="flex items-center gap-4 text-2xl font-bold text-gray-800 mb-4">
//                   <Clock className="w-10 h-10 text-orange-600" /> Time
//                 </label>
//                 <input
//                   type="time"
//                   value={form.rescheduled_time}
//                   onChange={(e) => setForm({ ...form, rescheduled_time: e.target.value })}
//                   className="w-full px-8 py-6 text-xl border-4 border-gray-300 rounded-2xl focus:ring-8 focus:ring-orange-300 focus:border-orange-600 transition-all"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="flex items-center gap-4 text-2xl font-bold text-gray-800 mb-4">
//                   <BookOpen className="w-10 h-10 text-orange-600" /> Training Name 
//                 </label>
//                 {loadingSubtopics ? (
//                   <div className="flex items-center gap-4 py-6 text-xl text-gray-600">
//                     <Loader2 className="w-8 h-8 animate-spin" />
//                     Loading subtopics for Day {selectedItem.day_number}...
//                   </div>
//                 ) : (
//                   <>
//                     <input
//                       type="text"
//                       value={form.training_name}
//                       onChange={(e) => setForm({ ...form, training_name: e.target.value })}
//                       className="w-full px-8 py-6 text-xl border-4 border-green-300 bg-green-50 rounded-2xl focus:ring-8 focus:ring-green-300 focus:border-green-600 transition-all font-medium"
//                       placeholder="Auto-filled from subtopics..."
//                     />
//                     {subtopics.length > 0 && (
//                       <p className="mt-4 text-lg text-gray-700">
//                         Based on <strong className="text-green-700">{subtopics.length}</strong> subtopic{subtopics.length > 1 ? 's' : ''}:
//                         <span className="block mt-2 text-xl font-bold text-green-800">
//                           {subtopics.map(t => t.subtopic_name).join(' + ')}
//                         </span>
//                       </p>
//                     )}
//                   </>
//                 )}
//               </div>
//             </div>

//             <div className="flex gap-6 mt-12">
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="flex-1 py-6 border-4 border-gray-300 text-gray-800 font-bold text-2xl rounded-2xl hover:bg-gray-50 transition-all"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={saveReschedule}
//                 disabled={saving || !form.rescheduled_date || !form.rescheduled_time || !form.training_name}
//                 className="flex-1 py-6 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-2xl rounded-2xl hover:from-orange-600 hover:to-red-700 transition-all shadow-2xl disabled:opacity-50 flex items-center justify-center gap-4"
//               >
//                 {saving ? 'Saving...' : (
//                   <>
//                     <Save className="w-10 h-10" /> Save & Reschedule
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }




import { useState, useEffect, useMemo } from 'react';
import {
  UserX,
  Loader2,
  Search,
  Users,
  History,
  Calendar,
  Clock,
  BookOpen,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import axios from 'axios';

interface AbsentUser { id: number; temp_id: string; full_name: string; attendance_date?: string | null; }
interface AbsenteesByDay { day_number: number; absent_count: number; absent_users: AbsentUser[]; }
interface Batch { batch_id: string; created_at?: string; is_completed?: boolean; }
interface AbsenceItem { id: number; temp_id: string; full_name: string; day_number: number; absent_date: string; }
interface SubTopic { subtopic_id: number; subtopic_name: string; day_name: string; }

export default function AbsentEmployeesList() {
  const [viewMode, setViewMode] = useState<'active' | 'past'>('active');
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchId, setBatchId] = useState<string>('');
  const [absences, setAbsences] = useState<AbsenceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(true);

  // Table controls
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: 'full_name' | 'temp_id' | 'day_number' | 'absent_date';
    direction: 'asc' | 'desc';
  } | null>(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AbsenceItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [subtopics, setSubtopics] = useState<SubTopic[]>([]);
  const [loadingSubtopics, setLoadingSubtopics] = useState(false);

  const [form, setForm] = useState({
    rescheduled_date: '',
    rescheduled_time: '10:00',
    training_name: '',
  });

  const API_BASE = import.meta.env.VITE_API_URL || 'http://172.25.0.51:8000';

  // Fetch batches
  useEffect(() => {
    const fetchBatches = async () => {
      setLoadingBatches(true);
      const endpoint = viewMode === 'active'
        ? `${API_BASE}/training-batches/active/`
        : `${API_BASE}/training-batches/past/`;

      try {
        const res = await axios.get(endpoint);
        const list = res.data.results || res.data || [];
        setBatches(list);
        if (list.length > 0 && !batchId) setBatchId(list[0].batch_id);
      } catch (err) {
        console.error('Failed to load batches:', err);
      } finally {
        setLoadingBatches(false);
      }
    };
    fetchBatches();
  }, [viewMode, API_BASE]);

  // Fetch absences
  useEffect(() => {
    if (!batchId) {
      setAbsences([]);
      setPage(1);
      return;
    }

    const fetchAbsences = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/batch/${batchId}/absentees/`);
        const days: AbsenteesByDay[] = res.data.absentees_by_day || [];

        const flatData: AbsenceItem[] = days.flatMap(day =>
          day.absent_users.map(user => ({
            id: user.id,
            temp_id: user.temp_id,
            full_name: user.full_name,
            day_number: day.day_number,
            absent_date: user.attendance_date || new Date().toISOString().split('T')[0],
          }))
        );

        flatData.sort((a, b) => new Date(b.absent_date).getTime() - new Date(a.absent_date).getTime());
        setAbsences(flatData);
      } catch (err) {
        console.error('Failed to load absences:', err);
        setAbsences([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAbsences();
  }, [batchId, API_BASE]);

  // Fetch subtopics for training name
  const fetchSubtopics = async (dayNumber: number) => {
    if (!dayNumber) return;
    setLoadingSubtopics(true);
    try {
      const res = await axios.get(`${API_BASE}/subtopics/by-day/${dayNumber}/`);
      const topics: SubTopic[] = res.data || [];
      setSubtopics(topics);

      const names = topics.map(t => t.subtopic_name.trim()).filter(Boolean);
      const trainingName = names.length > 0
        ? names.join(' + ')
        : `Day ${dayNumber} Training (Make-up Session)`;

      setForm(prev => ({ ...prev, training_name: trainingName }));
    } catch (err) {
      console.error('Failed to fetch subtopics:', err);
      setForm(prev => ({ ...prev, training_name: `Day ${dayNumber} Training (Make-up Session)` }));
    } finally {
      setLoadingSubtopics(false);
    }
  };

  const openReschedule = async (item: AbsenceItem) => {
    setSelectedItem(item);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setForm({
      rescheduled_date: tomorrow.toISOString().split('T')[0],
      rescheduled_time: '10:00',
      training_name: '',
    });
    setShowModal(true);
    await fetchSubtopics(item.day_number);
  };

  const saveReschedule = async () => {
    if (!selectedItem || !batchId) return;

    setSaving(true);
    try {
      await axios.post(`${API_BASE}/reschedule-from-absent/`, {
        employee_id: selectedItem.id,
        batch_id: batchId,
        absent_day: selectedItem.day_number,
        rescheduled_date: form.rescheduled_date,
        rescheduled_time: form.rescheduled_time,
        training_name: form.training_name,
        notes: `Rescheduled from absence on Day ${selectedItem.day_number}`,
      });

      setAbsences(prev => prev.filter(i => !(i.id === selectedItem.id && i.day_number === selectedItem.day_number)));
      setShowModal(false);
      alert('Session rescheduled successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to reschedule session.');
    } finally {
      setSaving(false);
    }
  };

  // Table processing
  const processedData = useMemo(() => {
    let result = [...absences];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(i =>
        i.full_name.toLowerCase().includes(term) ||
        i.temp_id.toLowerCase().includes(term)
      );
    }

    if (sortConfig) {
      result.sort((a, b) => {
        let aVal: any = a[sortConfig.key];
        let bVal: any = b[sortConfig.key];
        if (sortConfig.key === 'absent_date') {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        }
        return (aVal < bVal ? -1 : 1) * (sortConfig.direction === 'asc' ? 1 : -1);
      });
    }

    return result;
  }, [absences, searchTerm, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(processedData.length / pageSize));
  const paginatedData = processedData.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [searchTerm, batchId]);

  const handleSort = (key: typeof sortConfig['key']) => {
    setSortConfig(prev =>
      !prev || prev.key !== key ? { key, direction: 'asc' } :
      prev.direction === 'asc' ? { key, direction: 'desc' } : null
    );
  };

  return (
    <div className="w-full bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="w-full mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
                <UserX className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Retraining Required</h1>
                <p className="text-sm text-gray-600">Reschedule missed training sessions</p>
              </div>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button onClick={() => setViewMode('active')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${viewMode === 'active' ? 'bg-white shadow-sm text-red-700' : 'text-gray-600'}`}>
                <Users className="w-4 h-4 inline mr-1" /> Active
              </button>
              <button onClick={() => setViewMode('past')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${viewMode === 'past' ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-600'}`}>
                <History className="w-4 h-4 inline mr-1" /> Past
              </button>
            </div>
          </div>

          {/* Batch Selector */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Batch</label>
            {loadingBatches ? (
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading batches...
              </div>
            ) : (
              <select
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
              >
                <option value="">-- Select Batch --</option>
                {batches.map(b => (
                  <option key={b.batch_id} value={b.batch_id}>
                    {b.batch_id} {b.is_completed && '(Completed)'}
                    {b.created_at && ` — ${new Date(b.created_at).toLocaleDateString()}`}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {batchId && (
          <>
            {/* Search + Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Batch: <span className="text-red-600">{batchId}</span></h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Total Pending Reschedules: <span className="font-bold text-red-600">{processedData.length}</span>
                  </p>
                </div>
                <div className="relative w-full lg:w-80">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search name or Temp ID..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-12 h-12 animate-spin text-red-600" />
              </div>
            ) : processedData.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                  <Users className="w-10 h-10 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-700">All absences rescheduled!</p>
                <p className="text-gray-600 mt-2">No pending make-up sessions.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th onClick={() => handleSort('full_name')} className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100">
                          Name {sortConfig?.key === 'full_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('temp_id')} className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100">
                          Temp ID {sortConfig?.key === 'temp_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('absent_date')} className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100">
                          Absent Date {sortConfig?.key === 'absent_date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('day_number')} className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100">
                          Day {sortConfig?.key === 'day_number' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="px-4 py-3 text-center font-medium text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedData.map(item => (
                        <tr key={`${item.id}-${item.day_number}`} className="hover:bg-red-50/30">
                          <td className="px-4 py-3 font-medium">{item.full_name}</td>
                          <td className="px-4 py-3 font-mono text-gray-700">{item.temp_id}</td>
                          <td className="px-4 py-3 text-gray-700">
                            {new Date(item.absent_date).toLocaleDateString('en-GB')}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                              Day {item.day_number}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => openReschedule(item)}
                              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-medium rounded-lg hover:from-orange-600 hover:to-red-700 transition shadow-sm"
                            >
                              Reschedule
                            </button>
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
                    <select value={pageSize} onChange={e => { setPageSize(+e.target.value); setPage(1); }} className="px-2 py-1 border rounded">
                      {[10, 25, 50].map(n => <option key={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 hover:bg-gray-200 rounded disabled:opacity-50">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-gray-700">Page {page} of {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 hover:bg-gray-200 rounded disabled:opacity-50">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reschedule Modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-8">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Reschedule Training Session</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="font-semibold text-gray-900">{selectedItem.full_name}</p>
                <p className="text-sm text-gray-600">Temp ID: {selectedItem.temp_id}</p>
                <p className="text-sm text-gray-600">Absent on Day {selectedItem.day_number} — {new Date(selectedItem.absent_date).toLocaleDateString('en-GB')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Date</label>
                <input
                  type="date"
                  value={form.rescheduled_date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm({ ...form, rescheduled_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  value={form.rescheduled_time}
                  onChange={e => setForm({ ...form, rescheduled_time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Training Name</label>
                {loadingSubtopics ? (
                  <p className="text-sm text-gray-600">Loading subtopics...</p>
                ) : (
                  <input
                    type="text"
                    value={form.training_name}
                    onChange={e => setForm({ ...form, training_name: e.target.value })}
                    className="w-full px-3 py-2 border border-green-300 bg-green-50 rounded-lg focus:ring-2 focus:ring-green-500 font-medium"
                    placeholder="Auto-filled from topics"
                  />
                )}
                {subtopics.length > 0 && (
                  <p className="text-xs text-gray-600 mt-2">
                    Based on: {subtopics.map(t => t.subtopic_name).join(' + ')}
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-100">
                Cancel
              </button>
              <button
                onClick={saveReschedule}
                disabled={saving || !form.rescheduled_date || !form.training_name}
                className="flex-1 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {saving ? 'Saving...' : 'Save & Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}