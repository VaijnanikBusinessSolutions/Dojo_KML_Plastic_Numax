

// // src/components/attendance/RescheduledSessionList.tsx
// import { useState, useEffect, useMemo, useRef } from 'react';
// import {
//   CalendarClock, Edit2, Save, X, Loader2, Search,
//   CheckCircle, Calendar, Clock, Camera as CameraIcon, ChevronUp, ChevronDown, AlertCircle
// } from 'lucide-react';
// import axios from 'axios';
// import toast from 'react-hot-toast';

// interface RescheduledSession {
//   id: number;
//   employee_name: string;
//   employee_last_name: string;
//   employee_email: string;
//   employee_temp_id: string;
//   training_name: string;
//   original_date: string;
//   rescheduled_date: string;
//   rescheduled_time: string;
//   status: 'scheduled' | 'completed' | 'cancelled';
//   attendance_marked: boolean;
//   attendance_status: 'present' | 'absent' | null;
// }

// type SortKey = 'employee_name' | 'employee_temp_id' | 'training_name' | 'original_date' | 'rescheduled_date' | 'rescheduled_time' | 'status';
// type SortOrder = 'asc' | 'desc';

// export default function RescheduledSessionList() {
//   const [sessions, setSessions] = useState<RescheduledSession[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize] = useState(10);
//   const [sortKey, setSortKey] = useState<SortKey>('rescheduled_date');
//   const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

//   // Editing
//   const [editingId, setEditingId] = useState<number | null>(null);
//   const [editForm, setEditForm] = useState({ rescheduled_date: '', rescheduled_time: '', training_name: '' });

//   // Attendance Modal
//   const [showAttendanceModal, setShowAttendanceModal] = useState(false);
//   const [markingSession, setMarkingSession] = useState<RescheduledSession | null>(null);
//   const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
//   const [stream, setStream] = useState<MediaStream | null>(null);
//   const [cameraError, setCameraError] = useState(false);
//   const [hasStartedCameraFlow, setHasStartedCameraFlow] = useState(false);
//   const [skipPhotoConfirm, setSkipPhotoConfirm] = useState(false); // NEW: For "Mark Without Photo" confirmation

//   const videoRef = useRef<HTMLVideoElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   const API_BASE = import.meta.env.VITE_API_URL || 'http://172.25.0.51:8000';

//   const isAttendanceAllowed = (session: RescheduledSession): { allowed: boolean; reason?: string } => {
//     if (session.attendance_marked) return { allowed: false, reason: 'Already marked' };
//     if (session.status !== 'scheduled') return { allowed: false, reason: 'Session not active' };

//     const [y, m, d] = session.rescheduled_date.split('-').map(Number);
//     const [h, min] = session.rescheduled_time.split(':').map(Number);
//     const sessionTime = new Date(y, m - 1, d, h, min);
//     const now = new Date();
//     if (now < sessionTime) {
//       const mins = Math.round((sessionTime.getTime() - now.getTime()) / 60000);
//       return { allowed: false, reason: `Starts in ${mins} min${mins > 1 ? 's' : ''}` };
//     }
//     return { allowed: true };
//   };

//   const fetchSessions = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`${API_BASE}/rescheduled-sessions/`);
//       setSessions(res.data.sort((a: any, b: any) => b.id - a.id));
//     } catch (err) {
//       toast.error('Failed to load sessions');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchSessions(); }, []);

//   // Camera Controls
//   const startCamera = async () => {
//     setCameraError(false);
//     setHasStartedCameraFlow(true);
//     setSkipPhotoConfirm(false);
//     try {
//       const mediaStream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: 'environment' },
//         audio: false
//       });
//       if (videoRef.current) {
//         videoRef.current.srcObject = mediaStream;
//         videoRef.current.play();
//       }
//       setStream(mediaStream);
//     } catch (err) {
//       setCameraError(true);
//       toast.error('Camera access denied or not available');
//     }
//   };

//   const stopCamera = () => {
//     stream?.getTracks().forEach(t => t.stop());
//     setStream(null);
//     if (videoRef.current) videoRef.current.srcObject = null;
//   };

//   const capturePhoto = () => {
//     if (!videoRef.current || !canvasRef.current) return;
//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     const ctx = canvas.getContext('2d');
//     if (ctx) {
//       ctx.drawImage(video, 0, 0);
//       setCapturedPhoto(canvas.toDataURL('image/jpeg', 0.9));
//       stopCamera();
//     }
//   };

//   const openMarkAttendance = (session: RescheduledSession) => {
//     const { allowed, reason } = isAttendanceAllowed(session);
//     if (!allowed) {
//       toast.error(reason || 'Cannot mark attendance');
//       return;
//     }
//     setMarkingSession(session);
//     setCapturedPhoto(null);
//     setStream(null);
//     setCameraError(false);
//     setHasStartedCameraFlow(false);
//     setSkipPhotoConfirm(false);
//     setShowAttendanceModal(true);
//   };

//   const submitAttendance = async () => {
//     if (!markingSession) return;

//     setSaving(true);
//     try {
//       const formData = new FormData();
//       formData.append('session_id', markingSession.id.toString());
//       formData.append('attendance_status', 'present');

//       if (capturedPhoto) {
//         const byteString = atob(capturedPhoto.split(',')[1]);
//         const mime = capturedPhoto.split(',')[0].split(':')[1].split(';')[0];
//         const ab = new ArrayBuffer(byteString.length);
//         const ia = new Uint8Array(ab);
//         for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
//         const blob = new Blob([ab], { type: mime });
//         formData.append('photo', blob, `attendance_${markingSession.employee_temp_id}_${Date.now()}.jpg`);
//       }

//       await axios.post(`${API_BASE}/rescheduled-sessions/mark-attendance/`, formData, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       });

//       setSessions(prev => prev.map(s =>
//         s.id === markingSession.id
//           ? { ...s, attendance_marked: true, attendance_status: 'present', status: 'completed' }
//           : s
//       ));

//       toast.success(capturedPhoto ? 'Attendance marked with photo!' : 'Attendance marked without photo');
//       closeModal();
//     } catch (err: any) {
//       toast.error(err.response?.data?.error || 'Failed to mark attendance');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const closeModal = () => {
//     stopCamera();
//     setShowAttendanceModal(false);
//     setCapturedPhoto(null);
//     setMarkingSession(null);
//     setCameraError(false);
//     setHasStartedCameraFlow(false);
//     setSkipPhotoConfirm(false);
//   };

//   // Sorting & Pagination
//   const processedData = useMemo(() => {
//     let data = [...sessions];
//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       data = data.filter(s =>
//         `${s.employee_name} ${s.employee_last_name}`.toLowerCase().includes(term) ||
//         s.employee_temp_id.toLowerCase().includes(term) ||
//         s.training_name.toLowerCase().includes(term)
//       );
//     }
//     data.sort((a, b) => {
//       let aVal: any = a[sortKey];
//       let bVal: any = b[sortKey];
//       if (sortKey === 'employee_name') {
//         aVal = `${a.employee_name} ${a.employee_last_name}`;
//         bVal = `${b.employee_name} ${b.employee_last_name}`;
//       }
//       if (sortKey.includes('date') || sortKey === 'rescheduled_time') {
//         aVal = sortKey === 'rescheduled_time' ? aVal : new Date(aVal).getTime();
//         bVal = sortKey === 'rescheduled_time' ? bVal : new Date(bVal).getTime();
//       }
//       return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
//     });
//     return data;
//   }, [sessions, searchTerm, sortKey, sortOrder]);

//   const totalPages = Math.max(1, Math.ceil(processedData.length / pageSize));
//   const paginatedData = processedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

//   useEffect(() => setCurrentPage(1), [searchTerm]);

//   const handleSort = (key: SortKey) => {
//     if (sortKey === key) setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
//     else { setSortKey(key); setSortOrder('desc'); }
//   };

//   const getSortIcon = (key: SortKey) => sortKey === key ? (sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />) : null;

//   const startEdit = (session: RescheduledSession) => {
//     setEditingId(session.id);
//     setEditForm({
//       rescheduled_date: session.rescheduled_date,
//       rescheduled_time: session.rescheduled_time,
//       training_name: session.training_name,
//     });
//   };

//   const saveEdit = async () => {
//     if (!editingId) return;
//     setSaving(true);
//     try {
//       await axios.patch(`${API_BASE}/rescheduled-sessions/${editingId}/`, editForm);
//       toast.success('Updated successfully');
//       fetchSessions();
//       setEditingId(null);
//     } catch (err: any) {
//       toast.error(err.response?.data?.error || 'Update failed');
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="w-full bg-gray-50 py-6 px-4 sm:px-6 lg:px-8 min-h-screen">
//       <div className="max-w-7xl mx-auto space-y-6">

//         {/* Header */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
//                 <CalendarClock className="w-6 h-6 text-white" />
//               </div>
//               <div>
//                 <h2 className="text-2xl font-bold text-gray-900">Rescheduled Sessions</h2>
//                 <p className="text-sm text-gray-600">Manage makeup training sessions</p>
//               </div>
//             </div>
//             <div className="relative w-full sm:w-80">
//               <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search employee, ID, training..."
//                 value={searchTerm}
//                 onChange={e => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 text-sm"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Table */}
//         {loading ? (
//           <div className="flex justify-center py-16">
//             <Loader2 className="w-12 h-12 animate-spin text-violet-600" />
//           </div>
//         ) : processedData.length === 0 ? (
//           <div className="text-center py-16 bg-white rounded-xl shadow-sm border">
//             <CalendarClock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//             <p className="text-xl text-gray-600">{searchTerm ? 'No matching sessions' : 'No rescheduled sessions'}</p>
//           </div>
//         ) : (
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead className="bg-gray-50 border-b">
//                   <tr>
//                     {['employee_name','employee_temp_id','training_name','original_date','rescheduled_date','rescheduled_time','status'].map(key => (
//                       <th key={key} onClick={() => handleSort(key as SortKey)}
//                         className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100 select-none">
//                         <div className="flex items-center gap-1">
//                           {key === 'employee_name' && 'Employee'}
//                           {key === 'employee_temp_id' && 'Temp ID'}
//                           {key === 'training_name' && 'Training'}
//                           {key === 'original_date' && 'Original'}
//                           {key === 'rescheduled_date' && 'Rescheduled Date'}
//                           {key === 'rescheduled_time' && 'Time'}
//                           {key === 'status' && 'Status'}
//                           {getSortIcon(key as SortKey)}
//                         </div>
//                       </th>
//                     ))}
//                     <th className="px-4 py-3 text-center font-medium text-gray-700">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {paginatedData.map(session => {
//                     const { allowed, reason } = isAttendanceAllowed(session);
//                     return (
//                       <tr key={session.id} className="hover:bg-violet-50/30 transition">
//                         <td className="px-4 py-3">
//                           <div className="font-medium">{session.employee_name} {session.employee_last_name}</div>
//                           <div className="text-xs text-gray-500">{session.employee_email}</div>
//                         </td>
//                         <td className="px-4 py-3 font-mono">{session.employee_temp_id}</td>
//                         <td className="px-4 py-3">
//                           {editingId === session.id ? (
//                             <input type="text" value={editForm.training_name}
//                               onChange={e => setEditForm({ ...editForm, training_name: e.target.value })}
//                               className="w-full px-2 py-1 border border-violet-400 rounded text-sm" />
//                           ) : (
//                             <span className="font-medium text-violet-700">{session.training_name}</span>
//                           )}
//                         </td>
//                         <td className="px-4 py-3 text-gray-600">{new Date(session.original_date).toLocaleDateString('en-GB')}</td>
//                         <td className="px-4 py-3">
//                           {editingId === session.id ? (
//                             <input type="date" value={editForm.rescheduled_date}
//                               onChange={e => setEditForm({ ...editForm, rescheduled_date: e.target.value })}
//                               className="px-2 py-1 border border-violet-400 rounded text-sm" />
//                           ) : (
//                             <div className="flex items-center gap-2">
//                               <Calendar className="w-4 h-4 text-violet-600" />
//                               {new Date(session.rescheduled_date).toLocaleDateString('en-GB')}
//                             </div>
//                           )}
//                         </td>
//                         <td className="px-4 py-3">
//                           {editingId === session.id ? (
//                             <input type="time" value={editForm.rescheduled_time}
//                               onChange={e => setEditForm({ ...editForm, rescheduled_time: e.target.value })}
//                               className="px-2 py-1 border border-violet-400 rounded text-sm" />
//                           ) : (
//                             <div className="flex items-center gap-2">
//                               <Clock className="w-4 h-4 text-gray-500" />
//                               {session.rescheduled_time}
//                             </div>
//                           )}
//                         </td>
//                         <td className="px-4 py-3">
//                           <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
//                             session.status === 'completed' ? 'bg-green-100 text-green-800' :
//                             session.status === 'cancelled' ? 'bg-red-100 text-red-800' :
//                             'bg-blue-100 text-blue-800'
//                           }`}>
//                             {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3 text-center">
//                           <div className="flex gap-3 justify-center items-center">
//                             {editingId === session.id ? (
//                               <>
//                                 <button onClick={saveEdit} disabled={saving}
//                                   className="p-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
//                                   <Save className="w-4 h-4" />
//                                 </button>
//                                 <button onClick={() => setEditingId(null)}
//                                   className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700">
//                                   <X className="w-4 h-4" />
//                                 </button>
//                               </>
//                             ) : session.status === 'scheduled' && (
//                               <>
//                                 <button onClick={() => startEdit(session)}
//                                   className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded hover:opacity-90">
//                                   <Edit2 className="w-4 h-4" />
//                                 </button>

//                                 <div className="relative group">
//                                   <button
//                                     onClick={() => openMarkAttendance(session)}
//                                     disabled={!allowed}
//                                     className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition shadow-md ${
//                                       allowed
//                                         ? 'bg-green-600 text-white hover:bg-green-700'
//                                         : 'bg-gray-400 text-white/80 cursor-not-allowed'
//                                     }`}
//                                   >
//                                     Mark Present
//                                   </button>
//                                   {!allowed && (
//                                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-20 shadow-xl">
//                                       <div className="flex items-center gap-2">
//                                         <AlertCircle className="w-4 h-4" />
//                                         <span>{reason || 'Not allowed'}</span>
//                                       </div>
//                                       <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-gray-900"></div>
//                                     </div>
//                                   )}
//                                 </div>
//                               </>
//                             )}
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>

//             {/* Pagination */}
//             <div className="px-4 py-3 bg-gray-50 border-t flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
//               <span className="text-gray-700">
//                 Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, processedData.length)} of {processedData.length}
//               </span>
//               <div className="flex items-center gap-2">
//                 <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
//                   className="p-2 hover:bg-gray-200 rounded disabled:opacity-50">
//                   <ChevronUp className="w-4 h-4 rotate-[-90deg]" />
//                 </button>
//                 <span className="text-gray-700">Page {currentPage} / {totalPages}</span>
//                 <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
//                   className="p-2 hover:bg-gray-200 rounded disabled:opacity-50">
//                   <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Attendance Modal */}
//       {showAttendanceModal && markingSession && (
//         <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
//             <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-5 relative">
//               <h3 className="text-xl font-bold flex items-center gap-3">
//                 <CameraIcon className="w-7 h-7" />
//                 Mark Attendance
//               </h3>
//               <button onClick={closeModal} className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-full">
//                 <X className="w-6 h-6" />
//               </button>
//             </div>

//             <div className="p-6 space-y-6">

//               {/* Employee Info */}
//               <div className="bg-green-50 rounded-xl p-5 space-y-2 text-sm border border-green-200">
//                 <p className="font-bold text-lg text-green-900">
//                   {markingSession.employee_name} {markingSession.employee_last_name}
//                 </p>
//                 <p>Temp ID: <span className="font-mono bg-white px-3 py-1 rounded">{markingSession.employee_temp_id}</span></p>
//                 <p>Training: <span className="font-medium">{markingSession.training_name}</span></p>
//                 <p className="text-green-700 font-semibold">
//                   {new Date(markingSession.rescheduled_date).toLocaleDateString('en-GB')} at {markingSession.rescheduled_time}
//                 </p>
//               </div>

//               <video ref={videoRef} className="hidden" playsInline />
//               <canvas ref={canvasRef} className="hidden" />

//               {/* Photo Captured - Confirm */}
//               {capturedPhoto && (
//                 <div className="space-y-6">
//                   <div className="flex justify-center">
//                     <img src={capturedPhoto} alt="Captured" className="w-64 h-64 object-cover rounded-2xl shadow-2xl border-8 border-white" />
//                   </div>
//                   <div className="text-center space-y-4">
//                     <p className="text-lg font-bold text-gray-800">Photo looks good?</p>
//                     <div className="grid grid-cols-2 gap-4">
//                       <button
//                         onClick={() => {
//                           setCapturedPhoto(null);
//                           setTimeout(startCamera, 200);
//                         }}
//                         className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 flex items-center justify-center gap-2"
//                       >
//                         <CameraIcon className="w-5 h-5" />
//                         Retake
//                       </button>
//                       <button
//                         onClick={submitAttendance}
//                         disabled={saving}
//                         className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
//                       >
//                         {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
//                         Confirm & Mark
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Skip Photo - Confirm Step */}
//               {skipPhotoConfirm && !capturedPhoto && (
//                 <div className="space-y-6 text-center">
//                   <AlertCircle className="w-16 h-16 text-orange-500 mx-auto" />
//                   <p className="text-lg font-bold text-gray-800">Mark Without Photo?</p>
//                   <p className="text-sm text-gray-600">This action cannot be undone and skips verification.</p>
//                   <div className="grid grid-cols-2 gap-4">
//                     <button
//                       onClick={() => setSkipPhotoConfirm(false)}
//                       className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       onClick={submitAttendance}
//                       disabled={saving}
//                       className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 disabled:opacity-50 shadow-lg"
//                     >
//                       {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Mark Present'}
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* Camera Active */}
//               {stream && !capturedPhoto && !skipPhotoConfirm && (
//                 <div className="relative bg-black rounded-2xl overflow-hidden aspect-[4/3] shadow-2xl">
//                   <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline />
//                   <button
//                     onClick={capturePhoto}
//                     className="absolute bottom-6 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition"
//                   >
//                     <CameraIcon className="w-12 h-12 text-green-600" />
//                   </button>
//                 </div>
//               )}

//               {/* Camera Error */}
//               {cameraError && !capturedPhoto && !skipPhotoConfirm && (
//                 <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-800 text-center">
//                   <AlertCircle className="w-12 h-12 mx-auto mb-3" />
//                   <p className="font-bold text-lg">Camera Not Available</p>
//                   <p className="text-sm">Please allow camera access or try again</p>
//                 </div>
//               )}

//               {/* Initial State */}
//               {!capturedPhoto && !stream && !cameraError && !skipPhotoConfirm && (
//                 <div className="space-y-6">
//                   <button
//                     onClick={startCamera}
//                     className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition shadow-xl flex items-center justify-center gap-3 text-lg"
//                   >
//                     <CameraIcon className="w-7 h-7" />
//                     Take Photo (Recommended)
//                   </button>

//                   {!hasStartedCameraFlow && (
//                     <>
//                       <div className="relative my-4">
//                         <div className="absolute inset-0 flex items-center">
//                           <div className="w-full border-t border-gray-300"></div>
//                         </div>
//                         <div className="relative flex justify-center">
//                           <span className="px-4 bg-white text-sm font-medium text-gray-500">or</span>
//                         </div>
//                       </div>

//                       <button
//                         onClick={() => setSkipPhotoConfirm(true)}
//                         className="w-full px-6 py-4 bg-orange-100 text-orange-700 rounded-xl font-bold hover:bg-orange-200 border-2 border-orange-400 transition flex items-center justify-center gap-3 text-lg"
//                       >
//                         <AlertCircle className="w-6 h-6" />
//                         Mark Without Photo
//                       </button>

//                       <p className="text-center text-xs text-gray-500">
//                         Use only when camera is not working
//                       </p>
//                     </>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }





// src/components/attendance/RescheduledSessionList.tsx
import { useState, useEffect, useMemo, useRef } from 'react';
import {
  CalendarClock, Edit2, Save, X, Loader2, Search,
  CheckCircle, Calendar, Clock, Camera as CameraIcon, ChevronUp, ChevronDown, AlertCircle, Eye
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface RescheduledSession {
  id: number;
  employee_name: string;
  employee_last_name: string;
  employee_email: string;
  employee_temp_id: string;
  training_name: string;
  original_date: string;
  rescheduled_date: string;
  rescheduled_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  attendance_marked: boolean;
  attendance_status: 'present' | 'absent' | null;
  attendance_photo_url?: string | null;  // ← NEW: Photo URL from backend
}

type SortKey = 'employee_name' | 'employee_temp_id' | 'training_name' | 'original_date' | 'rescheduled_date' | 'rescheduled_time' | 'status';
type SortOrder = 'asc' | 'desc';

export default function RescheduledSessionList() {
  const [sessions, setSessions] = useState<RescheduledSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortKey, setSortKey] = useState<SortKey>('rescheduled_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Editing
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ rescheduled_date: '', rescheduled_time: '', training_name: '' });

  // Attendance Modal
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [markingSession, setMarkingSession] = useState<RescheduledSession | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState(false);
  const [hasStartedCameraFlow, setHasStartedCameraFlow] = useState(false);
  const [skipPhotoConfirm, setSkipPhotoConfirm] = useState(false);

  // Photo Full View Modal
  const [photoModalUrl, setPhotoModalUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://172.25.0.51:8000';

  const isAttendanceAllowed = (session: RescheduledSession): { allowed: boolean; reason?: string } => {
    if (session.attendance_marked) return { allowed: false, reason: 'Already marked' };
    if (session.status !== 'scheduled') return { allowed: false, reason: 'Session not active' };

    const [y, m, d] = session.rescheduled_date.split('-').map(Number);
    const [h, min] = session.rescheduled_time.split(':').map(Number);
    const sessionTime = new Date(y, m - 1, d, h, min);
    const now = new Date();
    if (now < sessionTime) {
      const mins = Math.round((sessionTime.getTime() - now.getTime()) / 60000);
      return { allowed: false, reason: `Starts in ${mins} min${mins > 1 ? 's' : ''}` };
    }
    return { allowed: true };
  };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/rescheduled-sessions/`);
      setSessions(res.data.sort((a: any, b: any) => b.id - a.id));
    } catch (err) {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, []);

  // Camera Controls
  const startCamera = async () => {
    setCameraError(false);
    setHasStartedCameraFlow(true);
    setSkipPhotoConfirm(false);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setStream(mediaStream);
    } catch (err) {
      setCameraError(true);
      toast.error('Camera access denied or not available');
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      setCapturedPhoto(canvas.toDataURL('image/jpeg', 0.9));
      stopCamera();
    }
  };

  const openMarkAttendance = (session: RescheduledSession) => {
    const { allowed, reason } = isAttendanceAllowed(session);
    if (!allowed) {
      toast.error(reason || 'Cannot mark attendance');
      return;
    }
    setMarkingSession(session);
    setCapturedPhoto(null);
    setStream(null);
    setCameraError(false);
    setHasStartedCameraFlow(false);
    setSkipPhotoConfirm(false);
    setShowAttendanceModal(true);
  };

  const submitAttendance = async () => {
    if (!markingSession) return;

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('session_id', markingSession.id.toString());
      formData.append('attendance_status', 'present');

      if (capturedPhoto) {
        const byteString = atob(capturedPhoto.split(',')[1]);
        const mime = capturedPhoto.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
        const blob = new Blob([ab], { type: mime });
        formData.append('photo', blob, `attendance_${markingSession.employee_temp_id}_${Date.now()}.jpg`);
      }

      const response = await axios.post(`${API_BASE}/rescheduled-sessions/mark-attendance/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Update session with photo URL from backend
      const updatedSession = response.data.session;
      setSessions(prev => prev.map(s =>
        s.id === markingSession.id
          ? { 
              ...s, 
              attendance_marked: true, 
              attendance_status: 'present', 
              status: 'completed',
              attendance_photo_url: updatedSession.attendance_photo_url || null
            }
          : s
      ));

      toast.success(capturedPhoto ? 'Attendance marked with photo!' : 'Attendance marked without photo');
      closeModal();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to mark attendance');
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    stopCamera();
    setShowAttendanceModal(false);
    setCapturedPhoto(null);
    setMarkingSession(null);
    setCameraError(false);
    setHasStartedCameraFlow(false);
    setSkipPhotoConfirm(false);
  };

  // Sorting & Pagination
  const processedData = useMemo(() => {
    let data = [...sessions];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(s =>
        `${s.employee_name} ${s.employee_last_name}`.toLowerCase().includes(term) ||
        s.employee_temp_id.toLowerCase().includes(term) ||
        s.training_name.toLowerCase().includes(term)
      );
    }
    data.sort((a, b) => {
      let aVal: any = a[sortKey];
      let bVal: any = b[sortKey];
      if (sortKey === 'employee_name') {
        aVal = `${a.employee_name} ${a.employee_last_name}`;
        bVal = `${b.employee_name} ${b.employee_last_name}`;
      }
      if (sortKey.includes('date') || sortKey === 'rescheduled_time') {
        aVal = sortKey === 'rescheduled_time' ? aVal : new Date(aVal).getTime();
        bVal = sortKey === 'rescheduled_time' ? bVal : new Date(bVal).getTime();
      }
      return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
    return data;
  }, [sessions, searchTerm, sortKey, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(processedData.length / pageSize));
  const paginatedData = processedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => setCurrentPage(1), [searchTerm]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortOrder('desc'); }
  };

  const getSortIcon = (key: SortKey) => sortKey === key ? (sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />) : null;

  const startEdit = (session: RescheduledSession) => {
    setEditingId(session.id);
    setEditForm({
      rescheduled_date: session.rescheduled_date,
      rescheduled_time: session.rescheduled_time,
      training_name: session.training_name,
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await axios.patch(`${API_BASE}/rescheduled-sessions/${editingId}/`, editForm);
      toast.success('Updated successfully');
      fetchSessions();
      setEditingId(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full bg-gray-50 py-6 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="w-full mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                <CalendarClock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Rescheduled Sessions</h2>
                <p className="text-sm text-gray-600">Manage makeup training sessions</p>
              </div>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search employee, ID, training..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-12 h-12 animate-spin text-violet-600" />
          </div>
        ) : processedData.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border">
            <CalendarClock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600">{searchTerm ? 'No matching sessions' : 'No rescheduled sessions'}</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['employee_name','employee_temp_id','training_name','original_date','rescheduled_date','rescheduled_time','status'].map(key => (
                      <th key={key} onClick={() => handleSort(key as SortKey)}
                        className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100 select-none">
                        <div className="flex items-center gap-1">
                          {key === 'employee_name' && 'Employee'}
                          {key === 'employee_temp_id' && 'Temp ID'}
                          {key === 'training_name' && 'Training'}
                          {key === 'original_date' && 'Original'}
                          {key === 'rescheduled_date' && 'Rescheduled Date'}
                          {key === 'rescheduled_time' && 'Time'}
                          {key === 'status' && 'Status'}
                          {getSortIcon(key as SortKey)}
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedData.map(session => {
                    const { allowed, reason } = isAttendanceAllowed(session);
                    return (
                      <tr key={session.id} className="hover:bg-violet-50/30 transition">
                        <td className="px-4 py-3">
                          <div className="font-medium">{session.employee_name} {session.employee_last_name}</div>
                          <div className="text-xs text-gray-500">{session.employee_email}</div>
                        </td>
                        <td className="px-4 py-3 font-mono">{session.employee_temp_id}</td>
                        <td className="px-4 py-3">
                          {editingId === session.id ? (
                            <input type="text" value={editForm.training_name}
                              onChange={e => setEditForm({ ...editForm, training_name: e.target.value })}
                              className="w-full px-2 py-1 border border-violet-400 rounded text-sm" />
                          ) : (
                            <span className="font-medium text-violet-700">{session.training_name}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{new Date(session.original_date).toLocaleDateString('en-GB')}</td>
                        <td className="px-4 py-3">
                          {editingId === session.id ? (
                            <input type="date" value={editForm.rescheduled_date}
                              onChange={e => setEditForm({ ...editForm, rescheduled_date: e.target.value })}
                              className="px-2 py-1 border border-violet-400 rounded text-sm" />
                          ) : (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-violet-600" />
                              {new Date(session.rescheduled_date).toLocaleDateString('en-GB')}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingId === session.id ? (
                            <input type="time" value={editForm.rescheduled_time}
                              onChange={e => setEditForm({ ...editForm, rescheduled_time: e.target.value })}
                              className="px-2 py-1 border border-violet-400 rounded text-sm" />
                          ) : (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              {session.rescheduled_time}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            session.status === 'completed' ? 'bg-green-100 text-green-800' :
                            session.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex gap-3 justify-center items-center">
                            {editingId === session.id ? (
                              <>
                                <button onClick={saveEdit} disabled={saving}
                                  className="p-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                                  <Save className="w-4 h-4" />
                                </button>
                                <button onClick={() => setEditingId(null)}
                                  className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : session.status === 'scheduled' ? (
                              <>
                                <button onClick={() => startEdit(session)}
                                  className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded hover:opacity-90">
                                  <Edit2 className="w-4 h-4" />
                                </button>

                                <div className="relative group">
                                  <button
                                    onClick={() => openMarkAttendance(session)}
                                    disabled={!allowed}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition shadow-md ${
                                      allowed
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-gray-400 text-white/80 cursor-not-allowed'
                                    }`}
                                  >
                                    Mark Present
                                  </button>
                                  {!allowed && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-20 shadow-xl">
                                      <div className="flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{reason || 'Not allowed'}</span>
                                      </div>
                                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-gray-900"></div>
                                    </div>
                                  )}
                                </div>
                              </>
                            ) : (
                              // COMPLETED: Show check + photo
                              <div className="flex items-center gap-3">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                                {session.attendance_photo_url ? (
                                  <button
                                    onClick={() => setPhotoModalUrl(session.attendance_photo_url!)}
                                    className="group relative"
                                  >
                                    <img
                                      src={session.attendance_photo_url}
                                      alt="Attendance proof"
                                      className="w-12 h-12 object-cover rounded-lg border-2 border-green-500 shadow-md hover:scale-150 transition duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                      <Eye className="w-6 h-6 text-white" />
                                    </div>
                                  </button>
                                ) : (
                                  <span className="text-xs text-gray-500 italic">No photo</span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 bg-gray-50 border-t flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
              <span className="text-gray-700">
                Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, processedData.length)} of {processedData.length}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="p-2 hover:bg-gray-200 rounded disabled:opacity-50">
                  <ChevronUp className="w-4 h-4 rotate-[-90deg]" />
                </button>
                <span className="text-gray-700">Page {currentPage} / {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="p-2 hover:bg-gray-200 rounded disabled:opacity-50">
                  <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Attendance Modal */}
      {showAttendanceModal && markingSession && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-5 relative">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <CameraIcon className="w-7 h-7" />
                Mark Attendance
              </h3>
              <button onClick={closeModal} className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-green-50 rounded-xl p-5 space-y-2 text-sm border border-green-200">
                <p className="font-bold text-lg text-green-900">
                  {markingSession.employee_name} {markingSession.employee_last_name}
                </p>
                <p>Temp ID: <span className="font-mono bg-white px-3 py-1 rounded">{markingSession.employee_temp_id}</span></p>
                <p>Training: <span className="font-medium">{markingSession.training_name}</span></p>
                <p className="text-green-700 font-semibold">
                  {new Date(markingSession.rescheduled_date).toLocaleDateString('en-GB')} at {markingSession.rescheduled_time}
                </p>
              </div>

              <video ref={videoRef} className="hidden" playsInline />
              <canvas ref={canvasRef} className="hidden" />

              {capturedPhoto && (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <img src={capturedPhoto} alt="Captured" className="w-64 h-64 object-cover rounded-2xl shadow-2xl border-8 border-white" />
                  </div>
                  <div className="text-center space-y-4">
                    <p className="text-lg font-bold text-gray-800">Photo looks good?</p>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          setCapturedPhoto(null);
                          setTimeout(startCamera, 200);
                        }}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 flex items-center justify-center gap-2"
                      >
                        <CameraIcon className="w-5 h-5" />
                        Retake
                      </button>
                      <button
                        onClick={submitAttendance}
                        disabled={saving}
                        className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                      >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                        Confirm & Mark
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {skipPhotoConfirm && !capturedPhoto && (
                <div className="space-y-6 text-center">
                  <AlertCircle className="w-16 h-16 text-orange-500 mx-auto" />
                  <p className="text-lg font-bold text-gray-800">Mark Without Photo?</p>
                  <p className="text-sm text-gray-600">This action cannot be undone and skips verification.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setSkipPhotoConfirm(false)} className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50">
                      Cancel
                    </button>
                    <button onClick={submitAttendance} disabled={saving} className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 disabled:opacity-50 shadow-lg">
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Mark Present'}
                    </button>
                  </div>
                </div>
              )}

              {stream && !capturedPhoto && !skipPhotoConfirm && (
                <div className="relative bg-black rounded-2xl overflow-hidden aspect-[4/3] shadow-2xl">
                  <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline />
                  <button onClick={capturePhoto} className="absolute bottom-6 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition">
                    <CameraIcon className="w-12 h-12 text-green-600" />
                  </button>
                </div>
              )}

              {cameraError && !capturedPhoto && !skipPhotoConfirm && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-800 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3" />
                  <p className="font-bold text-lg">Camera Not Available</p>
                  <p className="text-sm">Please allow camera access or try again</p>
                </div>
              )}

              {!capturedPhoto && !stream && !cameraError && !skipPhotoConfirm && (
                <div className="space-y-6">
                  <button onClick={startCamera} className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition shadow-xl flex items-center justify-center gap-3 text-lg">
                    <CameraIcon className="w-7 h-7" />
                    Take Photo (Recommended)
                  </button>

                  {!hasStartedCameraFlow && (
                    <>
                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <span className="px-4 bg-white text-sm font-medium text-gray-500">or</span>
                        </div>
                      </div>

                      <button onClick={() => setSkipPhotoConfirm(true)} className="w-full px-6 py-4 bg-orange-100 text-orange-700 rounded-xl font-bold hover:bg-orange-200 border-2 border-orange-400 transition flex items-center justify-center gap-3 text-lg">
                        <AlertCircle className="w-6 h-6" />
                        Mark Without Photo
                      </button>

                      <p className="text-center text-xs text-gray-500">
                        Use only when camera is not working
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full Photo Modal */}
      {photoModalUrl && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPhotoModalUrl(null)}
        >
          <div className="relative max-w-4xl w-full">
            <button 
              onClick={() => setPhotoModalUrl(null)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full p-3 transition"
            >
              <X className="w-8 h-8 text-white" />
            </button>
            <img 
              src={photoModalUrl} 
              alt="Attendance proof" 
              className="w-full h-auto rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}