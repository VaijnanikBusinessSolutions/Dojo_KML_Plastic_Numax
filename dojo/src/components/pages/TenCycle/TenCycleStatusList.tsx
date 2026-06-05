
// 'use client';

// import React, { useEffect, useState, useMemo } from "react";
// import {
//   Search,
//   Filter,
//   CheckCircle,
//   XCircle,
//   Clock,
//   Users,
//   Award,
//   Download,
//   AlertCircle,
//   Building,
//   RefreshCw,
// } from "lucide-react";
// import * as ExcelJS from "exceljs";
// import { saveAs } from "file-saver";

// interface TenCycleRecord {
//   id: number;
//   emp_id: string;
//   employee_name: string;
//   department_name: string;
//   station_name: string | null;
//   level_name: string;
//   line: string | null;
//   operation_no: string | null;
//   final_percentage: number | null;
//   final_status: string;
//   is_completed: boolean;
//   date: string;
//   shift: string | null;
//   passing_percentage: number;
//   created_at: string;
// }

// const API_URL = "http://127.0.0.1:8000/tencycle-status/";

// const TenCycleStatusList: React.FC = () => {
//   const [data, setData] = useState<TenCycleRecord[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState<"All" | "Complete" | "Incomplete" | "Pass" | "Fail" | "Not Evaluated">("All");
//   const [departmentFilter, setDepartmentFilter] = useState<string>("All");
//   const [levelFilter, setLevelFilter] = useState<string>("All");   // ← This now controls the header dropdown
  
//   /* Fetch Data */
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         let url = API_URL;
//         const params = new URLSearchParams();

//         if (levelFilter !== "All") {
//           const levelMap: { [key: string]: string } = { "Level 1": "1", "Level 2": "2", "Level 3": "3", "Level 4": "4" };
//           params.append("level__id", levelMap[levelFilter] || "");
//         }
//         if (departmentFilter !== "All") params.append("department__id", departmentFilter);
//         if (statusFilter !== "All") {
//           if (statusFilter === "Complete") params.append("is_completed", "true");
//           if (statusFilter === "Incomplete") params.append("is_completed", "false");
//           if (statusFilter === "Pass") params.append("final_status", "Pass");
//           if (statusFilter === "Fail") params.append("final_status", "Fail - Retraining Required");
//           if (statusFilter === "Not Evaluated") params.append("final_status", "Not Evaluated");
//         }
      

//         if (params.toString()) url += `?${params.toString()}`;
//         const res = await fetch(url);
//         if (!res.ok) throw new Error(`Failed to load data (${res.status})`);
//         const result: TenCycleRecord[] = await res.json();
//         setData(result || []);
//       } catch (err: any) {
//         setError(err.message || "Failed to load data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [searchTerm, statusFilter, departmentFilter, levelFilter]);

//   const levels = useMemo(() => ["All", ...[...new Set(data.map(i => i.level_name))].filter(Boolean).sort()], [data]);
//   const departments = useMemo(() => ["All", ...[...new Set(data.map(i => i.department_name))].filter(Boolean).sort()], [data]);

//   const filtered = useMemo(() => {
//     const result = data
//       .filter(item => {
//         const search = searchTerm.toLowerCase();
//         const matchesSearch = !searchTerm ||
//           item.emp_id.toLowerCase().includes(search) ||
//           item.employee_name.toLowerCase().includes(search);

//         const matchesLevel = levelFilter === "All" || item.level_name === levelFilter;
//         const matchesDept = departmentFilter === "All" || item.department_name === departmentFilter;

//         let matchesStatus = true;
//         if (statusFilter !== "All") {
//           if (statusFilter === "Complete") matchesStatus = item.is_completed;
//           else if (statusFilter === "Incomplete") matchesStatus = !item.is_completed;
//           else if (statusFilter === "Pass") matchesStatus = item.final_status === "Pass";
//           else if (statusFilter === "Fail") matchesStatus = item.final_status.includes("Fail");
//           else if (statusFilter === "Not Evaluated") matchesStatus = item.final_status === "Not Evaluated";
//         }

//         return matchesSearch && matchesLevel && matchesDept && matchesStatus;
//       })
//       .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // latest first

//     return result;
//   }, [data, searchTerm, levelFilter, departmentFilter, statusFilter]);

//   const stats = useMemo(() => ({
//     total: filtered.length,
//     complete: filtered.filter(i => i.is_completed).length,
//     incomplete: filtered.filter(i => !i.is_completed).length,
//     passed: filtered.filter(i => i.final_status === "Pass").length,
//     failed: filtered.filter(i => i.final_status.includes("Fail")).length,
//     notEvaluated: filtered.filter(i => i.final_status === "Not Evaluated").length,
//   }), [filtered]);

//   const getDeptColor = (dept: string) => {
//     const colors = [
//       "bg-blue-100 text-blue-700 border-blue-300",
//       "bg-indigo-100 text-indigo-700 border-indigo-300",
//       "bg-purple-100 text-purple-700 border-purple-300",
//       "bg-pink-100 text-pink-700 border-pink-300",
//       "bg-teal-100 text-teal-700 border-teal-300",
//       "bg-cyan-100 text-cyan-700 border-cyan-300",
//     ];
//     let hash = 0;
//     for (let i = 0; i < dept.length; i++) hash = (hash << 5) - hash + dept.charCodeAt(i);
//     return colors[Math.abs(hash) % colors.length];
//   };

//   const exportToExcel = async () => { /* ← same Excel code as before (kept for brevity) */ 
//     const workbook = new ExcelJS.Workbook();
//     const sheet = workbook.addWorksheet("TenCycle Report");
//     // ... (same as previous version)
//     const buffer = await workbook.xlsx.writeBuffer();
//     saveAs(new Blob([buffer]), `TenCycle_${levelFilter === "All" ? "AllLevels" : levelFilter}_${new Date().toISOString().slice(0,10)}.xlsx`);
//   };

//   const renderStatusBadge = (completed: boolean) =>
//     completed ? (
//       <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
//         <CheckCircle className="w-4 h-4" /> Complete
//       </div>
//     ) : (
//       <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full border border-amber-300">
//         <Clock className="w-4 h-4" /> Incomplete
//       </div>
//     );

//   const renderResultBadge = (status: string) => {
//     if (status === "Pass")
//       return <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300"><CheckCircle className="w-4 h-4" /> Pass</div>;
//     if (status.includes("Fail"))
//       return <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-rose-100 text-rose-800 rounded-full border border-rose-300"><XCircle className="w-4 h-4" /> Fail</div>;
//     return <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full border border-gray-300"><Clock className="w-4 h-4" /> {status}</div>;
//   };

//   const clearFilters = () => {
//     setSearchTerm("");
//     setStatusFilter("All");
//     setDepartmentFilter("All");
//     // levelFilter stays (user usually wants to keep the selected level)
//   };

//   if (loading) return /* loading spinner */;
//   if (error) return /* error UI */;

//   return (
//     <div className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="w-full mx-auto space-y-6">

//         {/* ─────── HEADER WITH LEVEL SELECTOR ─────── */}
//         <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-2xl shadow-2xl">
//           <div className="absolute inset-0 backdrop-blur-xl bg-white/10" />
//           <div className="relative p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
//             <div className="flex items-center gap-5">
//               <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg border border-white/30">
//                 <Award className="w-10 h-10 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent drop-shadow-lg">
//                   TenCycle Evaluation Status
//                 </h1>
//                 <p className="text-white/80 mt-1 text-sm sm:text-base">Real-time Operator Performance Dashboard</p>
//               </div>
//             </div>

//             <div className="flex flex-col sm:flex-row items-center gap-4">
//               {/* Level Selector – Now in Header */}
//               <div className="flex items-center gap-3">
//                 <label className="text-white font-semibold">Level:</label>
//                 <select
//                   value={levelFilter}
//                   onChange={(e) => setLevelFilter(e.target.value)}
//                   className="px-6 py-3 text-base font-bold text-indigo-900 bg-white rounded-xl shadow-lg focus:ring-4 focus:ring-white/50 outline-none transition"
//                 >
//                   {levels.map(l => (
//                     <option key={l} value={l}>{l === "All" ? "All Levels" : l}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Export Button */}
//               <button
//                 onClick={exportToExcel}
//                 className="flex items-center gap-2 px-5 py-3 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/30 transition font-medium"
//               >
//                 <Download className="w-5 h-5" /> Export Excel
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Showing Text */}
//         <div className="text-center">
//           <p className="text-2xl font-bold text-gray-800">
//             Showing: <span className="text-indigo-600">{levelFilter === "All" ? "All Levels" : levelFilter}</span>
//             {filtered.length > 0 && ` • ${filtered.length} Operators`}
//           </p>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
//           <StatCard icon={<Users className="w-5 h-5" />} label="Total" value={stats.total} color="indigo" />
//           <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Complete" value={stats.complete} color="emerald" />
//           <StatCard icon={<Clock className="w-5 h-5" />} label="Incomplete" value={stats.incomplete} color="amber" />
//           <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Passed" value={stats.passed} color="emerald" />
//           <StatCard icon={<XCircle className="w-5 h-5" />} label="Failed" value={stats.failed} color="rose" />
//           <StatCard icon={<Clock className="w-5 h-5" />} label="Not Evaluated" value={stats.notEvaluated} color="gray" />
//         </div>

//         {/* Filters (Search + Status + Department) */}
//         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
//           <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 flex items-center justify-between">
//             <div className="flex items-center gap-2 text-white">
//               <Filter className="w-4 h-4" />
//               <span className="text-sm font-semibold">Filters</span>
//             </div>
//             {(searchTerm || statusFilter !== "All" || departmentFilter !== "All") && (
//               <button onClick={clearFilters} className="text-xs text-white/90 hover:text-white">Clear all</button>
//             )}
//           </div>
//           <div className="p-6 space-y-5">
//             <div className="relative max-w-md">
//               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
//               <input
//                 type="text"
//                 placeholder="Search by ID or Name..."
//                 value={searchTerm}
//                 onChange={e => setSearchTerm(e.target.value)}
//                 className="w-full pl-12 pr-4 py-3 border border-indigo-200 rounded-xl bg-indigo-50/50 focus:ring-2 focus:ring-indigo-500 outline-none"
//               />
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//               <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="px-4 py-3 border border-emerald-200 rounded-xl bg-emerald-50/50 focus:ring-2 focus:ring-emerald-500 outline-none">
//                 <option value="All">All Status</option>
//                 <option value="Complete">Complete</option>
//                 <option value="Incomplete">Incomplete</option>
//                 <option value="Pass">Pass</option>
//                 <option value="Fail">Fail</option>
//                 <option value="Not Evaluated">Not Evaluated</option>
//               </select>
//               <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="px-4 py-3 border border-purple-200 rounded-xl bg-purple-50/50 focus:ring-2 focus:ring-purple-500 outline-none">
//                 {departments.map(d => <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>)}
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Table */}
//         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead className="bg-gray-50 border-b border-gray-200">
//                 <tr>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Emp ID</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
        
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Station</th>
//                   <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Score</th>
//                   <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Required</th>
//                   <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
//                   <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Result</th>
//                   <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {filtered.length === 0 ? (
//                   <tr><td colSpan={10} className="text-center py-16 text-gray-500 text-lg">No records found</td></tr>
//                 ) : (
//                   filtered.map(item => (
//                     <tr key={item.id} className="hover:bg-gray-50 transition">
//                       <td className="px-6 py-4 font-mono text-indigo-700 font-bold">{item.emp_id}</td>
//                       <td className="px-6 py-4 font-medium text-gray-900">{item.employee_name}</td>
//                       {/* <td className="px-6 py-4"><span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold">{item.level_name}</span></td> */}
//                       <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold border ${getDeptColor(item.department_name)}`}>{item.department_name}</span></td>
//                       <td className="px-6 py-4 text-gray-700">{item.station_name || "—"}</td>
//                       <td className="px-6 py-4 text-center font-bold text-xl">
//                         <span className={item.final_percentage && item.final_percentage >= item.passing_percentage ? "text-emerald-600" : "text-rose-600"}>
//                           {item.final_percentage ? item.final_percentage.toFixed(1) + "%" : "—"}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 text-center font-medium text-gray-600">{item.passing_percentage}%</td>
//                       <td className="px-6 py-4 text-center">{renderStatusBadge(item.is_completed)}</td>
//                       <td className="px-6 py-4 text-center">{renderResultBadge(item.final_status)}</td>
//                       <td className="px-6 py-4 text-center text-gray-600">{new Date(item.date).toLocaleDateString("en-IN")}</td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// /* StatCard component (same as before) */
// const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string }> = ({ icon, label, value, color }) => {
//   const colors: any = {
//     indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
//     emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
//     amber: "bg-amber-50 border-amber-200 text-amber-700",
//     rose: "bg-rose-50 border-rose-200 text-rose-700",
//     gray: "bg-gray-50 border-gray-200 text-gray-700",
//   };
//   const c = colors[color] || colors.gray;
//   return (
//     <div className={`bg-white ${c.split(' ')[0]} ${c.split(' ')[1]} border rounded-xl p-5 shadow-sm hover:shadow-md transition`}>
//       <div className="flex items-center justify-between">
//         <div>
//           <p className={`text-2xl font-bold ${c.split(' ')[2]}`}>{value}</p>
//           <p className={`text-xs font-medium ${c.split(' ')[2]} mt-1`}>{label}</p>
//         </div>
//         <div className={`p-2.5 rounded-lg ${c.split(' ')[0]}`}>{icon}</div>
//       </div>
//     </div>
//   );
// };

// export default TenCycleStatusList;


'use client';

import React, { useEffect, useState, useMemo } from "react";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Award,
  Download,
} from "lucide-react";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";

interface TenCycleRecord {
  id: number;
  emp_id: string;
  employee_name: string;
  department_name: string;
  station_name: string | null;
  level_name: string;
  line: string | null;
  operation_no: string | null;
  final_percentage: number | null;
  final_status: string;
  is_completed: boolean;
  date: string;
  shift: string | null;
  passing_percentage: number;
  created_at: string;
}

const API_URL = "http://127.0.0.1:8000/tencycle-status/";

const TenCycleStatusList: React.FC = () => {
  const [data, setData] = useState<TenCycleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Complete" | "Incomplete" | "Pass" | "Fail" | "Not Evaluated">("All");
  const [departmentFilter, setDepartmentFilter] = useState<string>("All");
  const [levelFilter, setLevelFilter] = useState<string>("All");

  /* Fetch Data - Only on level/department/status change (search is client-side now) */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        let url = API_URL;
        const params = new URLSearchParams();

        if (levelFilter !== "All") {
          const levelMap: { [key: string]: string } = { "Level 1": "1", "Level 2": "2", "Level 3": "3", "Level 4": "4" };
          params.append("level__id", levelMap[levelFilter] || "");
        }
        if (departmentFilter !== "All") params.append("department__id", departmentFilter);
        if (statusFilter !== "All") {
          if (statusFilter === "Complete") params.append("is_completed", "true");
          if (statusFilter === "Incomplete") params.append("is_completed", "false");
          if (statusFilter === "Pass") params.append("final_status", "Pass");
          if (statusFilter === "Fail") params.append("final_status", "Fail - Retraining Required");
          if (statusFilter === "Not Evaluated") params.append("final_status", "Not Evaluated");
        }

        if (params.toString()) url += `?${params.toString()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to load data (${res.status})`);
        const result: TenCycleRecord[] = await res.json();
        setData(result || []);
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [statusFilter, departmentFilter, levelFilter]); // ← searchTerm removed on purpose

  const levels = useMemo(() => ["All", ...[...new Set(data.map(i => i.level_name))].filter(Boolean).sort()], [data]);
  const departments = useMemo(() => ["All", ...[...new Set(data.map(i => i.department_name))].filter(Boolean).sort()], [data]);

  const filtered = useMemo(() => {
    return data
      .filter(item => {
        const search = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm ||
          item.emp_id.toLowerCase().includes(search) ||
          item.employee_name.toLowerCase().includes(search);

        const matchesLevel = levelFilter === "All" || item.level_name === levelFilter;
        const matchesDept = departmentFilter === "All" || item.department_name === departmentFilter;

        let matchesStatus = true;
        if (statusFilter !== "All") {
          if (statusFilter === "Complete") matchesStatus = item.is_completed;
          else if (statusFilter === "Incomplete") matchesStatus = !item.is_completed;
          else if (statusFilter === "Pass") matchesStatus = item.final_status === "Pass";
          else if (statusFilter === "Fail") matchesStatus = item.final_status.includes("Fail");
          else if (statusFilter === "Not Evaluated") matchesStatus = item.final_status === "Not Evaluated";
        }

        return matchesSearch && matchesLevel && matchesDept && matchesStatus;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data, searchTerm, levelFilter, departmentFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: filtered.length,
    complete: filtered.filter(i => i.is_completed).length,
    incomplete: filtered.filter(i => !i.is_completed).length,
    passed: filtered.filter(i => i.final_status === "Pass").length,
    failed: filtered.filter(i => i.final_status.includes("Fail")).length,
    notEvaluated: filtered.filter(i => i.final_status === "Not Evaluated").length,
  }), [filtered]);

  const getDeptColor = (dept: string) => {
    const colors = [
      "bg-blue-100 text-blue-700 border-blue-300",
      "bg-indigo-100 text-indigo-700 border-indigo-300",
      "bg-purple-100 text-purple-700 border-purple-300",
      "bg-pink-100 text-pink-700 border-pink-300",
      "bg-teal-100 text-teal-700 border-teal-300",
      "bg-cyan-100 text-cyan-700 border-cyan-300",
    ];
    let hash = 0;
    for (let i = 0; i < dept.length; i++) hash = (hash << 5) - hash + dept.charCodeAt(i);
    return colors[Math.abs(hash) % colors.length];
  };

  // BEAUTIFUL COLORFUL EXCEL EXPORT
  const exportToExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("TenCycle Report", {
        pageSetup: { paperSize: 9, orientation: "landscape", fitToPage: true },
      });

      // Title
      sheet.mergeCells("A1:I1");
      const titleCell = sheet.getCell("A1");
      titleCell.value = `TenCycle Evaluation Status - ${levelFilter === "All" ? "All Levels" : levelFilter}`;
      titleCell.font = { size: 18, bold: true, color: { argb: "FFFFFFFF" } };
      titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6366F1" } };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      sheet.getRow(1).height = 45;

      // Headers
      const headerRow = sheet.getRow(3);
headerRow.values = [
  "Emp ID", "Name", "Department", "Station",
  "Score (%)", "Required (%)", "Status", "Result", "Date"
];
headerRow.height = 40;

headerRow.eachCell(cell => {
  cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4F46E5" } };
  cell.alignment = { horizontal: "center", vertical: "middle" };
  cell.border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" }
  };
});


      // Data rows
      filtered.forEach(item => {
        const row = sheet.addRow([
          item.emp_id,
          item.employee_name,
          item.department_name,
          item.station_name || "—",
          item.final_percentage != null ? Number(item.final_percentage.toFixed(1)) : "—",
          item.passing_percentage,
          item.is_completed ? "Complete" : "Incomplete",
          item.final_status === "Pass" ? "Pass" : item.final_status.includes("Fail") ? "Fail" : item.final_status,
          new Date(item.date).toLocaleDateString("en-IN"),
        ]);

        // Score
        const scoreCell = row.getCell(5);
        if (item.final_percentage != null) {
          const passed = item.final_percentage >= item.passing_percentage;
          scoreCell.font = { bold: true, color: { argb: passed ? "FF059669" : "FFDC2626" } };
          scoreCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: passed ? "FFE6F7EF" : "FFFEE7E7" } };
        }

        // Status
        const statusCell = row.getCell(7);
        statusCell.font = { bold: true, color: { argb: item.is_completed ? "FF059669" : "FFD97706" } };
        statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: item.is_completed ? "FFE6F7EF" : "FFFFF8E7" } };

        // Result
        const resultCell = row.getCell(8);
        if (item.final_status === "Pass") {
          resultCell.font = { bold: true, color: { argb: "FF059669" } };
          resultCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE6F7EF" } };
        } else if (item.final_status.includes("Fail")) {
          resultCell.font = { bold: true, color: { argb: "FFDC2626" } };
          resultCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEE7E7" } };
        }

        // Department color
        const deptCell = row.getCell(3);
        const hash = item.department_name.split("").reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0);
        const bgColors = ["FFE0E7FF", "FFF3E8FF", "FFE0F2FE", "FFF0FDF4", "FFECFEF6", "FFE7F5FD"];
        deptCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColors[Math.abs(hash) % bgColors.length] } };
        deptCell.font = { bold: true };
      });

      // Column widths
   sheet.columns = [
  { width: 12 },  // Emp ID
  { width: 18 },  // Name
  { width: 20 },  // Department
  { width: 15 },  // Station
  { width: 12 },  // Score
  { width: 12 },  // Required
  { width: 12 },  // Status
  { width: 12 },  // Result
  { width: 15 },  // Date
];

      // Footer
      const footerRow = sheet.getRow(sheet.rowCount + 2);
      sheet.mergeCells(`A${footerRow.number}:I${footerRow.number}`);
      const footerCell = sheet.getCell(`A${footerRow.number}`);
      footerCell.value = `Generated on: ${new Date().toLocaleString("en-IN")} | Total Records: ${filtered.length}`;
      footerCell.font = { italic: true, size: 10, color: { argb: "FF64748B" } };
      footerCell.alignment = { horizontal: "center" };

      // Download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      saveAs(blob, `TenCycle_${levelFilter === "All" ? "All_Levels" : levelFilter}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Excel export failed. Check console.");
    }
  };

  const renderStatusBadge = (completed: boolean) =>
    completed ? (
      <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
        <CheckCircle className="w-4 h-4" /> Complete
      </div>
    ) : (
      <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full border border-amber-300">
        <Clock className="w-4 h-4" /> Incomplete
      </div>
    );

  const renderResultBadge = (status: string) => {
    if (status === "Pass")
      return <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300"><CheckCircle className="w-4 h-4" /> Pass</div>;
    if (status.includes("Fail"))
      return <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-rose-100 text-rose-800 rounded-full border border-rose-300"><XCircle className="w-4 h-4" /> Fail</div>;
    return <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full border border-gray-300"><Clock className="w-4 h-4" /> {status}</div>;
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setDepartmentFilter("All");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold text-indigo-600">Loading TenCycle data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full mx-auto space-y-6 ">

        {/* HEADER */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-2xl shadow-2xl">
          <div className="absolute inset-0 backdrop-blur-xl bg-white/10" />
          <div className="relative p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg border border-white/30">
                <Award className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent drop-shadow-lg">
                  TenCycle Evaluation Status
                </h1>
                <p className="text-white/80 mt-1 text-sm sm:text-base">Real-time Operator Performance Dashboard</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-3">
                <label className="text-white font-semibold">Level:</label>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="px-6 py-3 text-base font-bold text-indigo-900 bg-white rounded-xl shadow-lg focus:ring-4 focus:ring-white/50 outline-none transition"
                >
                  {levels.map(l => (
                    <option key={l} value={l}>{l === "All" ? "All Levels" : l}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/30 transition font-medium shadow-lg"
              >
                <Download className="w-5 h-5" /> Export Excel
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800">
            Showing: <span className="text-indigo-600">{levelFilter === "All" ? "All Levels" : levelFilter}</span>
            {filtered.length > 0 && ` • ${filtered.length} Operators`}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard icon={<Users className="w-5 h-5" />} label="Total" value={stats.total} color="indigo" />
          <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Complete" value={stats.complete} color="emerald" />
          <StatCard icon={<Clock className="w-5 h-5" />} label="Incomplete" value={stats.incomplete} color="amber" />
          <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Passed" value={stats.passed} color="emerald" />
          <StatCard icon={<XCircle className="w-5 h-5" />} label="Failed" value={stats.failed} color="rose" />
          <StatCard icon={<Clock className="w-5 h-5" />} label="Not Evaluated" value={stats.notEvaluated} color="gray" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-semibold">Filters</span>
            </div>
            {(searchTerm || statusFilter !== "All" || departmentFilter !== "All") && (
              <button onClick={clearFilters} className="text-xs text-white/90 hover:text-white">Clear all</button>
            )}
          </div>
          <div className="p-6 space-y-5">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
              <input
                type="text"
                placeholder="Search by ID or Name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-indigo-200 rounded-xl bg-indigo-50/50 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="px-4 py-3 border border-emerald-200 rounded-xl bg-emerald-50/50 focus:ring-2 focus:ring-emerald-500 outline-none">
                <option value="All">All Status</option>
                <option value="Complete">Complete</option>
                <option value="Incomplete">Incomplete</option>
                <option value="Pass">Pass</option>
                <option value="Fail">Fail</option>
                <option value="Not Evaluated">Not Evaluated</option>
              </select>
              <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="px-4 py-3 border border-purple-200 rounded-xl bg-purple-50/50 focus:ring-2 focus:ring-purple-500 outline-none">
                {departments.map(d => <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Emp ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Station</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Required</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Result</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-16 text-gray-500 text-lg font-medium">No records found</td></tr>
                ) : (
                  filtered.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-mono text-indigo-700 font-bold">{item.emp_id}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{item.employee_name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getDeptColor(item.department_name)}`}>
                          {item.department_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{item.station_name || "—"}</td>
                      <td className="px-6 py-4 text-center font-bold text-xl">
                        <span className={item.final_percentage && item.final_percentage >= item.passing_percentage ? "text-emerald-600" : "text-rose-600"}>
                          {item.final_percentage ? item.final_percentage.toFixed(1) + "%" : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-gray-600">{item.passing_percentage}%</td>
                      <td className="px-6 py-4 text-center">{renderStatusBadge(item.is_completed)}</td>
                      <td className="px-6 py-4 text-center">{renderResultBadge(item.final_status)}</td>
                      <td className="px-6 py-4 text-center text-gray-600">{new Date(item.date).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string }> = ({ icon, label, value, color }) => {
  const colors: any = {
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    rose: "bg-rose-50 border-rose-200 text-rose-700",
    gray: "bg-gray-50 border-gray-200 text-gray-700",
  };
  const c = colors[color] || colors.gray;
  const bg = c.split(" ")[0];
  const border = c.split(" ")[1];
  const text = c.split(" ")[2];

  return (
    <div className={`bg-white ${bg} ${border} border rounded-xl p-5 shadow-sm hover:shadow-md transition`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-2xl font-bold ${text}`}>{value}</p>
          <p className={`text-xs font-medium ${text} mt-1`}>{label}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${bg}`}>{icon}</div>
      </div>
    </div>
  );
};

export default TenCycleStatusList;