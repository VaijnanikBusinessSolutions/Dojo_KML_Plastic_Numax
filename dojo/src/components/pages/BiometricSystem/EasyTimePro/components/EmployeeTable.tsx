import React, { useState, useMemo } from 'react';
import { FiRefreshCw, FiSearch, FiChevronLeft, FiChevronRight, FiFilter, FiUploadCloud,FiSlash } from 'react-icons/fi';
import { MdFace, MdFingerprint, MdCheckCircle, MdCancel, MdDeleteForever } from 'react-icons/md';
import type { BioUser, BiometricDevice } from '../types';
import * as API from '../api';

const StatusBadge = ({ active, onClick, loading }: { active: boolean, onClick: () => void, loading: boolean }) => (
    <div className={`flex items-center gap-2 px-2 py-1 rounded-full border w-fit ${active ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
        {active ? <MdCheckCircle size={14} /> : <MdCancel size={14} />}
        <span className="text-xs font-bold">{active ? "Yes" : "No"}</span>
        <button 
            onClick={(e) => { e.stopPropagation(); onClick(); }} 
            className={`p-1 rounded-full hover:bg-white text-blue-500 transition-all ${loading ? "animate-spin" : ""}`}
            title="Check Device Status Now"
        >
            <FiRefreshCw size={12} />
        </button>
    </div>
);

interface Props {
    users: BioUser[];
    devices: BiometricDevice[];
    isAuthorized: boolean; // <--- NEW PROP
    onAction: (type: 'face' | 'finger' | 'sync', user: BioUser) => void;
    onDelete: (userId: number) => void;
    onRefresh: () => void;
    onRevoke: (userId: number) => void; // <--- NEW PROP
}

const EmployeeTable: React.FC<Props> = ({ users, devices, isAuthorized, onAction, onDelete, onRevoke, onRefresh }) => {
    const [loadingId, setLoadingId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMachine, setSelectedMachine] = useState(""); 
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesSearch = 
                u.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (u.last_name && u.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                u.employeeid.toLowerCase().includes(searchTerm.toLowerCase());

            const enrolledDevs = (u as any).enrolled_devices || [];
            const matchesMachine = selectedMachine === "" || enrolledDevs.includes(selectedMachine);

            return matchesSearch && matchesMachine;
        });
    }, [users, searchTerm, selectedMachine]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleStatusCheck = async (userId: number) => {
        setLoadingId(userId);
        try {
            await API.refreshStatus(userId);
            onRefresh();
        } catch (e) { console.error(e); }
        setLoadingId(null);
    };

    return (
        <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden flex flex-col">
            
            {/* TOOLBAR */}
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-4 justify-between items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" placeholder="Search by Name or ID..." value={searchTerm}
                        onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                </div>
                <div className="relative min-w-[250px]">
                    <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select 
                        value={selectedMachine}
                        onChange={(e) => { setSelectedMachine(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer"
                    >
                        <option value="">All Machines</option>
                        {devices.map(dev => (
                            <option key={dev.id} value={dev.name}>{dev.name} - {dev.serial_number}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-white text-gray-600 uppercase text-xs border-b border-gray-200">
                        <tr>
                            <th className="p-4">Employee</th>
                            <th className="p-4">Synced Devices</th>
                            <th className="p-4">Biometric Status</th>
                            <th className="p-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-100">
                        {paginatedUsers.map(u => {
                            const hasFace = (u as any).has_face;
                            const hasFinger = (u as any).has_fingerprint;
                            const enrolledDevs = (u as any).enrolled_devices || [];
                            const isRefreshing = loadingId === u.id;

                            return (
                                <tr key={u.id} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-800 text-base">{u.first_name} {u.last_name}</span>
                                            <span className="font-mono text-xs text-gray-500 bg-gray-100 px-1 rounded w-fit">{u.employeeid}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1">
                                            {enrolledDevs.length > 0 ? (
                                                enrolledDevs.map((d: string) => (
                                                    <span key={d} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">{d}</span>
                                                ))
                                            ) : <span className="text-gray-400 text-xs italic">Not synced</span>}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-3">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] uppercase text-gray-400 font-bold">Face</span>
                                                <StatusBadge active={hasFace} onClick={() => handleStatusCheck(u.id)} loading={isRefreshing} />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] uppercase text-gray-400 font-bold">Finger</span>
                                                <StatusBadge active={hasFinger} onClick={() => handleStatusCheck(u.id)} loading={isRefreshing} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-center gap-2">
                                            {/* ENROLL (Everyone can see/use this usually, or restrict to Guru?) 
                                                If you want to restrict Enroll to Devs/Admins too, wrap these in isAuthorized && (...) */}
                                            <button onClick={() => onAction('face', u)} className="p-2 rounded-lg border bg-white text-blue-600 border-blue-200 hover:bg-blue-50" title="Enroll Face"><MdFace size={20} /></button>
                                            <button onClick={() => onAction('finger', u)} className="p-2 rounded-lg border bg-white text-green-600 border-green-200 hover:bg-green-50" title="Enroll Fingerprint"><MdFingerprint size={20} /></button>
                                            
                                            {/* SENSITIVE ACTIONS - DEVELOPER ONLY */}
                                            {isAuthorized && (
                                                <>
                                                    <button onClick={() => onAction('sync', u)} className="p-2 rounded-lg border bg-white text-purple-600 border-purple-200 hover:bg-purple-50" title="Force Push"><FiUploadCloud size={20} /></button>
                                                    {/* NEW: REVOKE ACCESS BUTTON (Orange) */}
                                                    <button 
                                                        onClick={() => onRevoke(u.id)} 
                                                        className="p-2 rounded-lg border bg-white text-orange-600 border-orange-200 hover:bg-orange-50" 
                                                        title="Revoke Machine Access (Keep on Server)"
                                                    >
                                                        <FiSlash size={20} />
                                                    </button>
                                                    <button 
                                                        onClick={() => onDelete(u.id)} 
                                                        className="p-2 rounded-lg border bg-white text-red-600 border-red-200 hover:bg-red-50" 
                                                        title="Permanently Delete User"
                                                    >
                                                        <MdDeleteForever size={20} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            
            {/* PAGINATION (Keep exactly as before) */}
            {totalPages > 1 && (
                <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                    <span className="text-xs text-gray-500">Page {currentPage} of {totalPages}</span>
                    <div className="flex gap-2">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded bg-white border hover:bg-gray-100 disabled:opacity-50"><FiChevronLeft /></button>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded bg-white border hover:bg-gray-100 disabled:opacity-50"><FiChevronRight /></button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeTable;

// import React, { useState, useMemo } from 'react';
// import { FiUploadCloud, FiRefreshCw, FiSearch, FiChevronLeft, FiChevronRight, FiFilter } from 'react-icons/fi';
// import { MdFace, MdFingerprint, MdCheckCircle, MdCancel, MdDeleteForever } from 'react-icons/md';
// import type { BioUser, BiometricDevice } from '../types';
// import * as API from '../api';

// // --- HELPER: Status Badge ---
// const StatusBadge = ({ active, onClick, loading }: { active: boolean, onClick: () => void, loading: boolean }) => (
//     <div className={`flex items-center gap-2 px-2 py-1 rounded-full border w-fit ${active ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
//         {active ? <MdCheckCircle size={14} /> : <MdCancel size={14} />}
//         <span className="text-xs font-bold">{active ? "Yes" : "No"}</span>
//         <button 
//             onClick={(e) => { e.stopPropagation(); onClick(); }} 
//             className={`p-1 rounded-full hover:bg-white text-blue-500 transition-all ${loading ? "animate-spin" : ""}`}
//             title="Check Device Status Now"
//         >
//             <FiRefreshCw size={12} />
//         </button>
//     </div>
// );

// interface Props {
//     users: BioUser[];
//     devices: BiometricDevice[]; // <--- NEW: Need devices list for the filter dropdown
//     isDevMode: boolean;
//     onAction: (type: 'face' | 'finger' | 'sync', user: BioUser) => void;
//     onDelete: (userId: number) => void;
//     onRefresh: () => void;
// }

// const EmployeeTable: React.FC<Props> = ({ users, devices, isDevMode, onAction, onDelete, onRefresh }) => {
//     const [loadingId, setLoadingId] = useState<number | null>(null);
    
//     // --- FILTER STATE ---
//     const [searchTerm, setSearchTerm] = useState("");
//     const [selectedMachine, setSelectedMachine] = useState(""); // Filter by Machine Name
    
//     // --- PAGINATION STATE ---
//     const [currentPage, setCurrentPage] = useState(1);
//     const itemsPerPage = 10;

//     // --- FILTER LOGIC ---
//     const filteredUsers = useMemo(() => {
//         return users.filter(u => {
//             // 1. Text Search
//             const matchesSearch = 
//                 u.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 u.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 u.employeeid.toLowerCase().includes(searchTerm.toLowerCase());

//             // 2. Machine Filter
//             // We check if the selected machine name is in the user's 'enrolled_devices' array
//             const enrolledDevs = (u as any).enrolled_devices || [];
//             const matchesMachine = selectedMachine === "" || enrolledDevs.includes(selectedMachine);

//             return matchesSearch && matchesMachine;
//         });
//     }, [users, searchTerm, selectedMachine]);

//     // --- PAGINATION LOGIC ---
//     const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
//     const paginatedUsers = filteredUsers.slice(
//         (currentPage - 1) * itemsPerPage, 
//         currentPage * itemsPerPage
//     );

//     const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setSearchTerm(e.target.value);
//         setCurrentPage(1); 
//     };

//     const handleStatusCheck = async (userId: number) => {
//         setLoadingId(userId);
//         try {
//             const res = await API.refreshStatus(userId);
//             if (res.status === 'success') {
//                 onRefresh();
//             } else {
//                 alert("Status Check Failed: " + (res.message || "User not found on device"));
//             }
//         } catch (e) { console.error(e); }
//         setLoadingId(null);
//     };

//     return (
//         <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden flex flex-col">
            
//             {/* --- TOOLBAR --- */}
//             <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-4 justify-between items-center">
                
//                 {/* Search Input */}
//                 <div className="relative flex-1 min-w-[200px]">
//                     <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//                     <input 
//                         type="text" 
//                         placeholder="Search by Name or ID..." 
//                         value={searchTerm}
//                         onChange={handleSearch}
//                         className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//                     />
//                 </div>

//                 {/* Machine Filter */}
//                 <div className="relative min-w-[250px]">
//                     <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//                     <select 
//                         value={selectedMachine}
//                         onChange={(e) => { setSelectedMachine(e.target.value); setCurrentPage(1); }}
//                         className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer"
//                     >
//                         <option value="">All Machines</option>
//                         {devices.map(dev => (
//                             <option key={dev.id} value={dev.name}>
//                                 {dev.name} - {dev.serial_number}
//                             </option>
//                         ))}
//                     </select>
//                 </div>

//                 <div className="text-sm text-gray-500 font-medium whitespace-nowrap">
//                     Total: {filteredUsers.length}
//                 </div>
//             </div>

//             {/* --- TABLE --- */}
//             <div className="overflow-x-auto">
//                 <table className="w-full text-left">
//                     <thead className="bg-white text-gray-600 uppercase text-xs border-b border-gray-200">
//                         <tr>
//                             <th className="p-4">Employee</th>
//                             <th className="p-4">Synced Devices</th>
//                             <th className="p-4">Biometric Status</th>
//                             <th className="p-4 text-center">Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody className="text-sm divide-y divide-gray-100">
//                         {paginatedUsers.map(u => {
//                             const hasFace = (u as any).has_face;
//                             const hasFinger = (u as any).has_fingerprint;
//                             const enrolledDevs = (u as any).enrolled_devices || [];
//                             const disableFace = hasFace && !isDevMode;
//                             const disableFinger = hasFinger && !isDevMode;
//                             const isRefreshing = loadingId === u.id;

//                             return (
//                                 <tr key={u.id} className="hover:bg-blue-50/50 transition-colors">
//                                     <td className="p-4">
//                                         <div className="flex flex-col">
//                                             <span className="font-bold text-gray-800 text-base">{u.first_name} {u.last_name}</span>
//                                             <span className="font-mono text-xs text-gray-500 bg-gray-100 px-1 rounded w-fit">{u.employeeid}</span>
//                                         </div>
//                                     </td>
//                                     <td className="p-4">
//                                         <div className="flex flex-wrap gap-1">
//                                             {enrolledDevs.length > 0 ? (
//                                                 enrolledDevs.map((d: string) => (
//                                                     <span key={d} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">{d}</span>
//                                                 ))
//                                             ) : (
//                                                 <span className="text-gray-400 text-xs italic">Not synced</span>
//                                             )}
//                                         </div>
//                                     </td>
//                                     <td className="p-4">
//                                         <div className="flex gap-3">
//                                             <div className="flex flex-col gap-1">
//                                                 <span className="text-[10px] uppercase text-gray-400 font-bold">Face</span>
//                                                 <StatusBadge active={hasFace} onClick={() => handleStatusCheck(u.id)} loading={isRefreshing} />
//                                             </div>
//                                             <div className="flex flex-col gap-1">
//                                                 <span className="text-[10px] uppercase text-gray-400 font-bold">Finger</span>
//                                                 <StatusBadge active={hasFinger} onClick={() => handleStatusCheck(u.id)} loading={isRefreshing} />
//                                             </div>
//                                         </div>
//                                     </td>
//                                     <td className="p-4">
//                                         <div className="flex justify-center gap-2">
//                                             <button onClick={() => onAction('face', u)} disabled={disableFace} className={`p-2 rounded-lg border transition-all ${disableFace ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`} title="Enroll Face"><MdFace size={20} /></button>
//                                             <button onClick={() => onAction('finger', u)} disabled={disableFinger} className={`p-2 rounded-lg border transition-all ${disableFinger ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : 'bg-white text-green-600 border-green-200 hover:bg-green-50'}`} title="Enroll Fingerprint"><MdFingerprint size={20} /></button>
//                                             <button onClick={() => onAction('sync', u)} className="p-2 rounded-lg border bg-white text-purple-600 border-purple-200 hover:bg-purple-50" title="Force Push"><FiUploadCloud size={20} /></button>
//                                             <button onClick={() => onDelete(u.id)} className="p-2 rounded-lg border bg-white text-red-600 border-red-200 hover:bg-red-50" title="Delete User"><MdDeleteForever size={20} /></button>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             );
//                         })}
//                         {paginatedUsers.length === 0 && (
//                             <tr>
//                                 <td colSpan={4} className="p-8 text-center text-gray-400 italic">No employees found matching criteria.</td>
//                             </tr>
//                         )}
//                     </tbody>
//                 </table>
//             </div>

//             {/* --- FOOTER: PAGINATION --- */}
//             {totalPages > 1 && (
//                 <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
//                     <span className="text-xs text-gray-500">
//                         Page {currentPage} of {totalPages}
//                     </span>
//                     <div className="flex gap-2">
//                         <button 
//                             onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//                             disabled={currentPage === 1}
//                             className="p-2 rounded bg-white border hover:bg-gray-100 disabled:opacity-50"
//                         >
//                             <FiChevronLeft />
//                         </button>
//                         <button 
//                             onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//                             disabled={currentPage === totalPages}
//                             className="p-2 rounded bg-white border hover:bg-gray-100 disabled:opacity-50"
//                         >
//                             <FiChevronRight />
//                         </button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default EmployeeTable;