


'use client';

import React, { useEffect, useState, useMemo } from "react";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  AlertCircle,
  XCircle as XIcon,
  Building,
  Award,
  Download,
} from "lucide-react";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/* ---------- Types ---------- */
interface OJTScore {
  day: number;
  topic: { id: number; department: string; level: number };
  score: number;
}

interface TraineeInfo {
  id: number;
  trainee_name: string;
  trainer_name: string;
  emp_id: string | null;
  line: string | null;
  subline: string | null;
  station_name: string | null;
  process_name: string | null;
  status: "Pending" | "Pass" | "Fail";
  level: number;
  level_name: string;
  scores_data: OJTScore[];
  calculated_status: "Complete" | "Incomplete";
  calculated_result: "Pass" | "Fail" | "N/A";
  category: string;
}

/* ---------- API URL ---------- */
const API_URL = "http://127.0.0.1:8000/ojt-dashboard/";

/* ---------- Component ---------- */
const Level4OJTStatusList: React.FC = () => {
  const [data, setData] = useState<TraineeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Complete" | "Incomplete" | "Pass" | "Fail">("All");
  const [departmentFilter, setDepartmentFilter] = useState<string>("All");
  const [selectedView, setSelectedView] = useState<"OJT" | "TenCycle">("OJT");

  /* ---- FETCH DATA WITH FILTERS ---- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.append("level_id", "4");
        if (searchTerm.trim()) params.append("search", searchTerm.trim());
        if (departmentFilter !== "All") params.append("department", departmentFilter);
        if (statusFilter !== "All") params.append("status", statusFilter);

        const response = await fetch(`${API_URL}?${params.toString()}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const result: TraineeInfo[] = await response.json();
        if (!Array.isArray(result)) throw new Error("Invalid response format");

        setData(result);
      } catch (err: any) {
        console.error("Fetch failed:", err);
        setError(err.message || "Failed to load Level 4 OJT data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchTerm, statusFilter, departmentFilter]);

  /* ---- UNIQUE DEPARTMENTS ---- */
  const departments = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach(i => {
      if (i.category) map.set(i.category, i.category);
    });
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [data]);

  /* ---- FILTERED DATA ---- */
  const filtered = useMemo(() => {
    return data.filter(item => {
      const matchesSearch =
        !searchTerm ||
        (item.emp_id ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.trainee_name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        statusFilter === item.calculated_status ||
        (statusFilter === "Pass" && item.calculated_result === "Pass") ||
        (statusFilter === "Fail" && item.calculated_result === "Fail");

      const matchesDepartment = departmentFilter === "All" || item.category === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [data, searchTerm, statusFilter, departmentFilter]);

  /* ---- STATS ---- */
  const stats = useMemo(() => ({
    total: filtered.length,
    complete: filtered.filter(i => i.calculated_status === "Complete").length,
    incomplete: filtered.filter(i => i.calculated_status === "Incomplete").length,
    passed: filtered.filter(i => i.calculated_result === "Pass").length,
    failed: filtered.filter(i => i.calculated_result === "Fail").length,
  }), [filtered]);

  /* ---- EXCEL EXPORT ---- */
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("OJT Level 4", {
      pageSetup: { paperSize: 9, orientation: "landscape" },
    });

    // === COMPANY & TITLE ===
    worksheet.mergeCells("A1:I1");
    const companyCell = worksheet.getCell("A1");
    companyCell.value = "Krishna Maruti Limited Penstone";
    companyCell.font = { size: 16, bold: true, color: { argb: "FF1E40AF" } };
    companyCell.alignment = { horizontal: "center", vertical: "middle" };

    worksheet.mergeCells("A2:I2");
    const titleCell = worksheet.getCell("A2");
    titleCell.value = "OJT Level 4 Status Report";
    titleCell.font = { size: 14, bold: true, color: { argb: "FF1E40AF" } };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };

    // === GENERATED INFO ===
    const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const filterSummary = [
      searchTerm ? `Search: ${searchTerm}` : null,
      statusFilter !== "All" ? `Status: ${statusFilter}` : null,
      departmentFilter !== "All" ? `Dept: ${departmentFilter}` : null,
    ].filter(Boolean).join(" | ") || "All Records";

    worksheet.mergeCells("A3:I3");
    const infoCell = worksheet.getCell("A3");
    infoCell.value = `Generated on: ${now} | Filters: ${filterSummary}`;
    infoCell.font = { size: 10, italic: true, color: { argb: "FF6B7280" } };
    infoCell.alignment = { horizontal: "center" };

    // === COLUMN HEADERS ===
    const headerRow = worksheet.getRow(5);
    const headers = [
      "Emp ID",
      "Trainee Name",
      "Trainer",
      "Department",
      "Line",
      "Station",
      "Status",
      "Result",
    ];
    headers.forEach((h, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = h;
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4F46E5" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
    });
    headerRow.height = 30;

    // === DATA ROWS ===
    filtered.forEach((item, idx) => {
      const row = worksheet.addRow([
        item.emp_id ?? "—",
        item.trainee_name,
        item.trainer_name,
        item.category,
        item.line ?? "—",
        item.station_name ?? "—",
        item.calculated_status,
        item.calculated_result,
      ]);

      if (idx % 2 === 1) {
        row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF9FAFB" } };
      }

      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        cell.alignment = { vertical: "middle" };
      });

      // Status Color
      const statusCell = row.getCell(7);
      statusCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: item.calculated_status === "Complete" ? "FF10B981" : "FFF59E0B" },
      };
      statusCell.font = { color: { argb: "FFFFFFFF" }, bold: true };
      statusCell.alignment = { horizontal: "center" };

      // Result Color
      const resultCell = row.getCell(8);
      let resultColor = "FF6B7280";
      if (item.calculated_result === "Pass") resultColor = "FF10B981";
      else if (item.calculated_result === "Fail") resultColor = "FFEF4444";
      resultCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: resultColor } };
      resultCell.font = { color: { argb: "FFFFFFFF" }, bold: true };
      resultCell.alignment = { horizontal: "center" };

      // Department Color
      const deptCell = row.getCell(4);
      const hash = item.category.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
      const deptColors = [
        "FF3B82F6", "FF6366F1", "FF8B5CF6", "FFEC4899", "FF14B8A6", "FF06B6D4",
      ];
      deptCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: deptColors[hash % deptColors.length] } };
      deptCell.font = { color: { argb: "FFFFFFFF" } };
    });

    // === COLUMN WIDTHS ===
    worksheet.columns = [
      { width: 14 },
      { width: 26 },
      { width: 22 },
      { width: 20 },
      { width: 16 },
      { width: 20 },
      { width: 14 },
      { width: 12 },
    ];

    // === DOWNLOAD ===
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, `OJT_Level4_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  /* ---- RENDER HELPERS ---- */
  const renderStatus = (status: "Complete" | "Incomplete") =>
    status === "Complete" ? (
      <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>Complete</span>
      </div>
    ) : (
      <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full border border-amber-300">
        <Clock className="w-3.5 h-3.5" />
        <span>Incomplete</span>
      </div>
    );

  const renderResult = (result: "Pass" | "Fail" | "N/A") => {
    if (result === "Pass")
      return (
        <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Pass</span>
        </div>
      );
    if (result === "Fail")
      return (
        <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-rose-100 text-rose-800 rounded-full border border-rose-300">
          <XCircle className="w-3.5 h-3.5" />
          <span>Fail</span>
        </div>
      );
    return <span className="text-xs italic text-gray-400">N/A</span>;
  };

  const getDepartmentBadgeStyle = (dept: string) => {
    const hash = dept.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const colors = [
      "bg-blue-100 text-blue-700 border-blue-300",
      "bg-indigo-100 text-indigo-700 border-indigo-300",
      "bg-purple-100 text-purple-700 border-purple-300",
      "bg-pink-100 text-pink-700 border-pink-300",
      "bg-teal-100 text-teal-700 border-teal-300",
      "bg-cyan-100 text-cyan-700 border-cyan-300",
    ];
    return colors[hash % colors.length];
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setDepartmentFilter("All");
  };

  /* ---- LOADING STATE ---- */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Level 4 OJT Data...</p>
        </div>
      </div>
    );
  }

  /* ---- ERROR STATE ---- */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-800 mb-2">Failed to Load Data</h3>
          <p className="text-red-600 mb-4 break-words">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ---- MAIN RENDER ---- */
  return (
    <div className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full mx-auto space-y-6">

        {/* HEADER */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-2xl shadow-2xl border border-white/20">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.3),_transparent_50%)]" />
          </div>
          <div className="absolute inset-0 backdrop-blur-xl bg-white/10" />
          <div className="relative p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative p-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 transform transition-all duration-300 hover:scale-110 hover:shadow-2xl group">
                <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl scale-75 group-hover:scale-100 transition-all duration-500" />
                <Award className="w-8 h-8 text-white relative z-10 drop-shadow-md" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent drop-shadow-lg">
                  {selectedView === "OJT" ? "OJT Level 4 Status Dashboard" : "TenCycle Status"}
                </h1>
                {/* <p className="text-white/80 mt-2 text-sm sm:text-base font-medium drop-shadow">
                  {selectedView === "OJT"
                    ? "Real-time expert-level trainee progress tracking"
                    : "TenCycle view coming soon"}
                </p> */}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:flex items-center gap-2 text-white/70 text-xs font-medium">
                <Clock className="w-4 h-4" />
                <span>Updated: {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
              </span>
              {selectedView === "OJT" && (
                <button
                  onClick={exportToExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/30 transition-all font-medium"
                >
                  <Download className="w-4 h-4" />
                  Export Excel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* OJT VIEW */}
        {selectedView === "OJT" ? (
          <>
            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatCard icon={<Users className="w-5 h-5" />} label="Total Trainees" value={stats.total} color="indigo" />
              <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Completed" value={stats.complete} color="emerald" />
              <StatCard icon={<Clock className="w-5 h-5" />} label="Incomplete" value={stats.incomplete} color="amber" />
              <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Passed" value={stats.passed} color="emerald" />
              <StatCard icon={<XCircle className="w-5 h-5" />} label="Failed" value={stats.failed} color="rose" />
            </div>

            {/* FILTER CARD */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-semibold">Filters</span>
                </div>
                {(searchTerm || statusFilter !== "All" || departmentFilter !== "All") && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 text-xs text-white/90 hover:text-white transition-colors"
                  >
                    <XIcon className="w-3.5 h-3.5" />
                    Clear all
                  </button>
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
                    className="w-full pl-12 pr-4 py-3 text-sm border border-indigo-200 rounded-xl bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-indigo-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Status */}
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value as any)}
                      className="w-full pl-12 pr-10 py-3 text-sm border border-emerald-200 rounded-xl bg-emerald-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none cursor-pointer transition-all"
                    >
                      <option value="All">All Status</option>
                      <option value="Complete">Complete</option>
                      <option value="Incomplete">Incomplete</option>
                      <option value="Pass">Pass</option>
                      <option value="Fail">Fail</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Department */}
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-600" />
                    <select
                      value={departmentFilter}
                      onChange={e => setDepartmentFilter(e.target.value)}
                      className="w-full pl-12 pr-10 py-3 text-sm border border-purple-200 rounded-xl bg-purple-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none cursor-pointer transition-all"
                    >
                      <option value="All">All Departments</option>
                      {departments.map(([_, name]) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TABLE – HORIZONTAL SCROLL ONLY */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-gray-100">
                <div className="min-w-[1200px]">
                  <table className="w-full text-sm table-auto">
                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Emp ID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Trainee Name</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Trainer</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Department</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Line</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Station</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-16 text-center">
                            <div className="text-gray-400">
                              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-3" />
                              <p className="text-sm font-medium">No trainees found</p>
                              <p className="text-xs mt-1">Try adjusting your filters</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filtered.map(item => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 font-mono text-xs text-gray-700 whitespace-nowrap">{item.emp_id ?? "—"}</td>
                            <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">{item.trainee_name}</td>
                            <td className="px-6 py-4 text-gray-600">{item.trainer_name}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getDepartmentBadgeStyle(item.category)}`}>
                                {item.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {item.line ? item.line : <span className="italic text-gray-400">—</span>}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {item.station_name ? item.station_name : <span className="italic text-gray-400">—</span>}
                            </td>
                            <td className="px-6 py-4">{renderStatus(item.calculated_status)}</td>
                            <td className="px-6 py-4">{renderResult(item.calculated_result)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">TenCycle View Coming Soon</h2>
            <p className="text-gray-500">This section is under construction. Please check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ──────────────────────── STAT CARD ──────────────────────── */
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "indigo" | "emerald" | "amber" | "rose";
}
const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => {
  const colors = {
    indigo: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700" },
    emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
    amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
    rose: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700" },
  };
  const { bg, border, text } = colors[color];

  return (
    <div className={`bg-white ${border} border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 group`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-2xl font-bold ${text}`}>{value}</p>
          <p className={`text-xs font-medium ${text} mt-1`}>{label}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${bg} group-hover:scale-110 transition-transform`}>
          <div className={text}>{icon}</div>
        </div>
      </div>
    </div>
  );
};

export default Level4OJTStatusList;