import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from 'axios';
import { 
    Upload, FileSpreadsheet, Clock, BarChart3, Loader2, Fingerprint, 
    Search, Filter, Trash2, Download, X, ChevronLeft, ChevronRight,
    ArrowUpDown, Calendar, AlertCircle, CheckCircle2, Timer, TrendingUp, TrendingDown,
    Users, UserCheck, UserX, AlarmClock, Coffee, ArrowUp, ArrowDown,
    FileDown, Eye, RefreshCw, SlidersHorizontal, LayoutGrid, List,
    AlertTriangle, ShieldAlert
} from "lucide-react";
import SetAutoFetchTime from './SetAttendanceTaskTime';
import Modal from './Modal';

// --- API Configuration ---
const API_BASE_URL = 'http://127.0.0.1:8000/'; 
const ATTENDANCE_ENDPOINT = 'biometric-attendance/';
const UPLOAD_ENDPOINT = 'bioattendance/upload-excel/';
const SUMMARY_ENDPOINT = 'biometric-attendance/summary/'; 
const DETAIL_ENDPOINT = 'biometric-attendance/employee-detail/'; 
const CLEAR_DATE_ENDPOINT = 'biometric-attendance/clear-date/';
const CLEAR_MONTH_ENDPOINT = 'biometric-attendance/clear-month/';

// --- Interfaces ---
interface AttendanceRecord {
  [key: string]: string | number | null | undefined;
  id?: number;
  attendance_date?: string;
  sr_no: number | null;
  card_no: string;
  employee_name: string;
  department: string;
  in_time: string;
  out_time: string;
  status: string;
  late_arrival: string | null;
  early_arrival: string | null;
  ot: string | null;
  hrs_works: string | null;
}

interface MonthlySummaryRecord {
    card_no: string;
    employee_name: string;
    department: string;
    designation: string;
    total_present: number;
    total_absent: number;
    total_early: number;
    total_late: number;
    total_ot_hours: number;
}

interface EmployeeDailyLog {
    attendance_date: string;
    status: string;
    in_time: string;
    out_time: string;
    late_arrival: string;
    ot: string;
}

interface DailyStats {
    total: number;
    present: number;
    absent: number;
    late: number;
    onTime: number;
    otWorkers: number;
    totalOtHours: number;
}

interface MonthlyStats {
    totalEmployees: number;
    avgPresent: number;
    avgAbsent: number;
    totalOtHours: number;
    perfectAttendance: number;
    criticalAttendance: number;
}

const dailyFields = [
  { key: "sr_no", label: "Sr.No.", type: "number", sortable: true },
  { key: "card_no", label: "Card No", type: "text", sortable: true },
  { key: "employee_name", label: "Name", type: "text", sortable: true },
  { key: "department", label: "Dept", type: "text", sortable: true },
  { key: "in_time", label: "In", type: "time", sortable: true },
  { key: "out_time", label: "Out", type: "time", sortable: true },
  { key: "status", label: "Status", type: "text", sortable: true },
  { key: "late_arrival", label: "Late", type: "number", sortable: true },
  { key: "ot", label: "OT", type: "number", sortable: true },
];

const monthlyFields = [
    { key: "card_no", label: "Card No", sortable: true },
    { key: "employee_name", label: "Name", sortable: true },
    { key: "department", label: "Dept", sortable: true },
    { key: "total_present", label: "Present", sortable: true },
    { key: "total_absent", label: "Absent", sortable: true },
    { key: "total_early", label: "Early", sortable: true },
    { key: "total_late", label: "Late", sortable: true },
    { key: "total_ot_hours", label: "OT Hrs", sortable: true },
];

const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 5; year <= currentYear + 5; year++) {
        years.push(year);
    }
    return years;
};

const AttendanceSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState("daily-ops");
  const [loading, setLoading] = useState(false);
  
  // Daily State
  const [dailyData, setDailyData] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(""); 
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [dailySearchTerm, setDailySearchTerm] = useState("");
  const [dailyStatusFilter, setDailyStatusFilter] = useState<string>("all");
  const [dailyDeptFilter, setDailyDeptFilter] = useState<string>("all");
  const [dailySortConfig, setDailySortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [dailyCurrentPage, setDailyCurrentPage] = useState(1);
  const [dailyRowsPerPage, setDailyRowsPerPage] = useState(25);
  const [showDailyFilters, setShowDailyFilters] = useState(false);
  
  // Monthly State
  const [summaryData, setSummaryData] = useState<MonthlySummaryRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth() + 1 + "");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear() + "");
  const [monthlySortConfig, setMonthlySortConfig] = useState<{ key: keyof MonthlySummaryRecord; direction: 'asc' | 'desc' } | null>(null);
  const [monthlySearchTerm, setMonthlySearchTerm] = useState("");
  const [monthlyDeptFilter, setMonthlyDeptFilter] = useState<string>("all");
  const [monthlyCurrentPage, setMonthlyCurrentPage] = useState(1);
  const [monthlyRowsPerPage, setMonthlyRowsPerPage] = useState(25);
  const [showMonthlyFilters, setShowMonthlyFilters] = useState(false);
  const [quickSortOption, setQuickSortOption] = useState<string>("");

  // --- MODAL STATES ---
  const [isCalModalOpen, setIsCalModalOpen] = useState(false);
  const [selectedEmpSummary, setSelectedEmpSummary] = useState<MonthlySummaryRecord | null>(null);
  const [employeeLogs, setEmployeeLogs] = useState<EmployeeDailyLog[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [isClockModalOpen, setIsClockModalOpen] = useState(false);
  const [selectedDailyRecord, setSelectedDailyRecord] = useState<AttendanceRecord | null>(null);
  const [currentDailyIndex, setCurrentDailyIndex] = useState<number>(0);

  // --- DELETE MODAL STATES ---
  const [isDeleteDailyModalOpen, setIsDeleteDailyModalOpen] = useState(false);
  const [isDeleteMonthlyModalOpen, setIsDeleteMonthlyModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // --- COMPUTED VALUES ---
  
  const dailyDepartments = useMemo(() => {
      const depts = [...new Set(dailyData.map(d => d.department).filter(Boolean))];
      return depts.sort();
  }, [dailyData]);

  const monthlyDepartments = useMemo(() => {
      const depts = [...new Set(summaryData.map(d => d.department).filter(Boolean))];
      return depts.sort();
  }, [summaryData]);

  const dailyStats = useMemo((): DailyStats => {
      const total = dailyData.length;
      const present = dailyData.filter(d => d.status?.toLowerCase().startsWith('p')).length;
      const absent = dailyData.filter(d => d.status?.toLowerCase().startsWith('a')).length;
      const late = dailyData.filter(d => Number(d.late_arrival) > 0).length;
      const onTime = present - late;
      const otWorkers = dailyData.filter(d => Number(d.ot) > 0).length;
      const totalOtHours = dailyData.reduce((sum, d) => sum + (Number(d.ot) || 0), 0);
      return { total, present, absent, late, onTime, otWorkers, totalOtHours };
  }, [dailyData]);

  const monthlyStats = useMemo((): MonthlyStats => {
      const totalEmployees = summaryData.length;
      const avgPresent = totalEmployees > 0 ? summaryData.reduce((sum, d) => sum + d.total_present, 0) / totalEmployees : 0;
      const avgAbsent = totalEmployees > 0 ? summaryData.reduce((sum, d) => sum + d.total_absent, 0) / totalEmployees : 0;
      const totalOtHours = summaryData.reduce((sum, d) => sum + (d.total_ot_hours || 0), 0);
      const perfectAttendance = summaryData.filter(d => d.total_absent === 0).length;
      const criticalAttendance = summaryData.filter(d => d.total_present < (d.total_present + d.total_absent) * 0.5).length;
      return { totalEmployees, avgPresent, avgAbsent, totalOtHours, perfectAttendance, criticalAttendance };
  }, [summaryData]);

  const processedDailyData = useMemo(() => {
      let data = [...dailyData];
      
      if (dailySearchTerm) {
          const term = dailySearchTerm.toLowerCase();
          data = data.filter(d => 
              d.employee_name?.toLowerCase().includes(term) ||
              d.card_no?.toLowerCase().includes(term) ||
              d.department?.toLowerCase().includes(term)
          );
      }
      
      if (dailyStatusFilter !== "all") {
          if (dailyStatusFilter === "present") {
              data = data.filter(d => d.status?.toLowerCase().startsWith('p'));
          } else if (dailyStatusFilter === "absent") {
              data = data.filter(d => d.status?.toLowerCase().startsWith('a'));
          } else if (dailyStatusFilter === "late") {
              data = data.filter(d => Number(d.late_arrival) > 0);
          } else if (dailyStatusFilter === "ot") {
              data = data.filter(d => Number(d.ot) > 0);
          } else if (dailyStatusFilter === "ontime") {
              data = data.filter(d => d.status?.toLowerCase().startsWith('p') && Number(d.late_arrival) <= 0);
          }
      }
      
      if (dailyDeptFilter !== "all") {
          data = data.filter(d => d.department === dailyDeptFilter);
      }
      
      if (dailySortConfig) {
          data.sort((a, b) => {
              const aVal = a[dailySortConfig.key] || '';
              const bVal = b[dailySortConfig.key] || '';
              if (aVal < bVal) return dailySortConfig.direction === 'asc' ? -1 : 1;
              if (aVal > bVal) return dailySortConfig.direction === 'asc' ? 1 : -1;
              return 0;
          });
      }
      
      return data;
  }, [dailyData, dailySearchTerm, dailyStatusFilter, dailyDeptFilter, dailySortConfig]);

  const paginatedDailyData = useMemo(() => {
      const start = (dailyCurrentPage - 1) * dailyRowsPerPage;
      return processedDailyData.slice(start, start + dailyRowsPerPage);
  }, [processedDailyData, dailyCurrentPage, dailyRowsPerPage]);

  const dailyTotalPages = Math.ceil(processedDailyData.length / dailyRowsPerPage);

  const processedMonthlyData = useMemo(() => {
      let data = [...summaryData];
      
      if (monthlySearchTerm) {
          const term = monthlySearchTerm.toLowerCase();
          data = data.filter(d => 
              d.employee_name?.toLowerCase().includes(term) ||
              d.card_no?.toLowerCase().includes(term) ||
              d.department?.toLowerCase().includes(term)
          );
      }
      
      if (monthlyDeptFilter !== "all") {
          data = data.filter(d => d.department === monthlyDeptFilter);
      }
      
      if (quickSortOption) {
          switch (quickSortOption) {
              case "most_present":
                  data.sort((a, b) => b.total_present - a.total_present);
                  break;
              case "most_absent":
                  data.sort((a, b) => b.total_absent - a.total_absent);
                  break;
              case "most_late":
                  data.sort((a, b) => (b.total_late || 0) - (a.total_late || 0));
                  break;
              case "most_ot":
                  data.sort((a, b) => (b.total_ot_hours || 0) - (a.total_ot_hours || 0));
                  break;
              case "best_attendance":
                  data.sort((a, b) => {
                      const aRate = a.total_present / (a.total_present + a.total_absent) || 0;
                      const bRate = b.total_present / (b.total_present + b.total_absent) || 0;
                      return bRate - aRate;
                  });
                  break;
              case "worst_attendance":
                  data.sort((a, b) => {
                      const aRate = a.total_present / (a.total_present + a.total_absent) || 0;
                      const bRate = b.total_present / (b.total_present + b.total_absent) || 0;
                      return aRate - bRate;
                  });
                  break;
          }
      } else if (monthlySortConfig) {
          data.sort((a, b) => {
              const aVal = a[monthlySortConfig.key] || 0;
              const bVal = b[monthlySortConfig.key] || 0;
              if (aVal < bVal) return monthlySortConfig.direction === 'asc' ? -1 : 1;
              if (aVal > bVal) return monthlySortConfig.direction === 'asc' ? 1 : -1;
              return 0;
          });
      }
      
      return data;
  }, [summaryData, monthlySearchTerm, monthlyDeptFilter, quickSortOption, monthlySortConfig]);

  const paginatedMonthlyData = useMemo(() => {
      const start = (monthlyCurrentPage - 1) * monthlyRowsPerPage;
      return processedMonthlyData.slice(start, start + monthlyRowsPerPage);
  }, [processedMonthlyData, monthlyCurrentPage, monthlyRowsPerPage]);

  const monthlyTotalPages = Math.ceil(processedMonthlyData.length / monthlyRowsPerPage);

  // --- FETCHERS ---
  const fetchDailyData = useCallback(async () => {
    if (!selectedDate) { setDailyData([]); return; }
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}${ATTENDANCE_ENDPOINT}`);
      let rawData = Array.isArray(response.data) ? response.data : (response.data.results || []);
      const filteredByDate = rawData.filter((item: any) => item.attendance_date === selectedDate);
      setDailyData(filteredByDate);
      setDailyCurrentPage(1);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [selectedDate]);

  useEffect(() => { fetchDailyData(); }, [fetchDailyData]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !selectedDate) return alert("Select File and Date first.");
    setLoading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('date', selectedDate);
    try {
        const res = await axios.post(`${API_BASE_URL}${UPLOAD_ENDPOINT}`, formData);
        alert(res.data.message);
        setUploadFile(null);
        fetchDailyData();
    } catch (err: any) {
        alert("Upload failed: " + (err.response?.data?.error || err.message));
    } finally { setLoading(false); }
  };

  const fetchMonthlySummary = useCallback(async () => {
      setLoading(true);
      try {
          const res = await axios.get(`${API_BASE_URL}${SUMMARY_ENDPOINT}`, { params: { month: selectedMonth, year: selectedYear } });
          setSummaryData(res.data);
          setMonthlyCurrentPage(1);
      } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [selectedMonth, selectedYear]);

  // --- DELETE FUNCTIONS ---
  const handleDeleteDailyData = async () => {
      if (!selectedDate) return;
      if (deleteConfirmText !== "DELETE") {
          alert("Please type DELETE to confirm");
          return;
      }
      
      setDeleteLoading(true);
      try {
          const response = await axios.delete(`${API_BASE_URL}${CLEAR_DATE_ENDPOINT}`, {
              params: { date: selectedDate }
          });
          
          // Clear local data
          setDailyData([]);
          setIsDeleteDailyModalOpen(false);
          setDeleteConfirmText("");
          
          // Show success message
          alert(response.data.message || `Successfully cleared all attendance records for ${selectedDate}`);
      } catch (err: any) {
          console.error(err);
          const errorMessage = err.response?.data?.error || err.message || "Failed to delete records";
          alert("Failed to delete: " + errorMessage);
      } finally {
          setDeleteLoading(false);
      }
  };

  const handleDeleteMonthlyData = async () => {
      if (deleteConfirmText !== "DELETE") {
          alert("Please type DELETE to confirm");
          return;
      }
      
      setDeleteLoading(true);
      try {
          const response = await axios.delete(`${API_BASE_URL}${CLEAR_MONTH_ENDPOINT}`, {
              params: { month: selectedMonth, year: selectedYear }
          });
          
          // Clear local data
          setSummaryData([]);
          setIsDeleteMonthlyModalOpen(false);
          setDeleteConfirmText("");
          
          // Show success message
          alert(response.data.message || `Successfully cleared all attendance records`);
      } catch (err: any) {
          console.error(err);
          const errorMessage = err.response?.data?.error || err.message || "Failed to delete records";
          alert("Failed to delete: " + errorMessage);
      } finally {
          setDeleteLoading(false);
      }
  };

  // --- MODAL ACTIONS ---
  const openCalendarModal = async (employee: MonthlySummaryRecord) => {
      setSelectedEmpSummary(employee);
      setIsCalModalOpen(true);
      setModalLoading(true);
      try {
          const res = await axios.get(`${API_BASE_URL}${DETAIL_ENDPOINT}`, {
              params: { card_no: employee.card_no, month: selectedMonth, year: selectedYear }
          });
          setEmployeeLogs(res.data);
      } catch (error) { alert("Failed to fetch details"); } finally { setModalLoading(false); }
  };

  const openClockModal = (record: AttendanceRecord, index: number) => {
      setSelectedDailyRecord(record);
      setCurrentDailyIndex(index);
      setIsClockModalOpen(true);
  };

  const navigateDailyModal = (direction: 'prev' | 'next') => {
      const newIndex = direction === 'prev' ? currentDailyIndex - 1 : currentDailyIndex + 1;
      if (newIndex >= 0 && newIndex < paginatedDailyData.length) {
          setCurrentDailyIndex(newIndex);
          setSelectedDailyRecord(paginatedDailyData[newIndex]);
      }
  };

  const openDeleteDailyModal = () => {
      setDeleteConfirmText("");
      setIsDeleteDailyModalOpen(true);
  };

  const openDeleteMonthlyModal = () => {
      setDeleteConfirmText("");
      setIsDeleteMonthlyModalOpen(true);
  };

  // --- SORTING ---
  const handleDailySort = (key: string) => {
      let direction: 'asc' | 'desc' = 'asc';
      if (dailySortConfig && dailySortConfig.key === key && dailySortConfig.direction === 'asc') {
          direction = 'desc';
      }
      setDailySortConfig({ key, direction });
  };

  const handleMonthlySort = (key: keyof MonthlySummaryRecord) => {
      setQuickSortOption("");
      let direction: 'asc' | 'desc' = 'asc';
      if (monthlySortConfig && monthlySortConfig.key === key && monthlySortConfig.direction === 'asc') {
          direction = 'desc';
      }
      setMonthlySortConfig({ key, direction });
  };

  // --- EXPORT ---
  const exportDailyData = () => {
      if (processedDailyData.length === 0) return alert("No data to export");
      const header = "Sr.No,Card No,Name,Department,In Time,Out Time,Status,Late,OT\n";
      const rows = processedDailyData.map(row => 
          `${row.sr_no || ''},${row.card_no},${row.employee_name},${row.department},${row.in_time || ''},${row.out_time || ''},${row.status},${row.late_arrival || ''},${row.ot || ''}`
      ).join("\n");
      const blob = new Blob([header + rows], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); 
      a.href = url; 
      a.download = `Daily_Attendance_${selectedDate}.csv`; 
      a.click();
  };

  const exportMonthlyData = () => {
      if (processedMonthlyData.length === 0) return alert("No data to export");
      const header = "Card No,Name,Department,Present,Absent,Early,Late,OT Hours\n";
      const rows = processedMonthlyData.map(row => 
          `${row.card_no},${row.employee_name},${row.department},${row.total_present},${row.total_absent},${(row.total_early||0).toFixed(2)},${(row.total_late||0).toFixed(2)},${(row.total_ot_hours||0).toFixed(2)}`
      ).join("\n");
      const blob = new Blob([header + rows], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); 
      a.href = url; 
      a.download = `Monthly_Summary_${selectedMonth}_${selectedYear}.csv`; 
      a.click();
  };

  // --- RESET FILTERS ---
  const resetDailyFilters = () => {
      setDailySearchTerm("");
      setDailyStatusFilter("all");
      setDailyDeptFilter("all");
      setDailySortConfig(null);
      setDailyCurrentPage(1);
  };

  const resetMonthlyFilters = () => {
      setMonthlySearchTerm("");
      setMonthlyDeptFilter("all");
      setQuickSortOption("");
      setMonthlySortConfig(null);
      setMonthlyCurrentPage(1);
  };

  // --- PAGINATION COMPONENT ---
  const PaginationControls: React.FC<{
      currentPage: number;
      totalPages: number;
      totalItems: number;
      rowsPerPage: number;
      onPageChange: (page: number) => void;
      onRowsPerPageChange: (rows: number) => void;
  }> = ({ currentPage, totalPages, totalItems, rowsPerPage, onPageChange, onRowsPerPageChange }) => {
      const startItem = (currentPage - 1) * rowsPerPage + 1;
      const endItem = Math.min(currentPage * rowsPerPage, totalItems);
      
      const getPageNumbers = () => {
          const pages = [];
          const maxVisible = 5;
          let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
          let end = Math.min(totalPages, start + maxVisible - 1);
          if (end - start + 1 < maxVisible) {
              start = Math.max(1, end - maxVisible + 1);
          }
          for (let i = start; i <= end; i++) {
              pages.push(i);
          }
          return pages;
      };

      if (totalPages <= 0) return null;

      return (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Showing <span className="font-semibold">{startItem}-{endItem}</span> of <span className="font-semibold">{totalItems}</span></span>
                  <div className="flex items-center gap-2">
                      <span>Rows:</span>
                      <select 
                          value={rowsPerPage} 
                          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
                          className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      >
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                      </select>
                  </div>
              </div>
              
              <div className="flex items-center gap-1">
                  <button 
                      onClick={() => onPageChange(1)} 
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      First
                  </button>
                  <button 
                      onClick={() => onPageChange(currentPage - 1)} 
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {getPageNumbers().map(page => (
                      <button
                          key={page}
                          onClick={() => onPageChange(page)}
                          className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                              currentPage === page 
                                  ? 'bg-blue-600 text-white border-blue-600' 
                                  : 'border-gray-300 hover:bg-gray-100'
                          }`}
                      >
                          {page}
                      </button>
                  ))}
                  
                  <button 
                      onClick={() => onPageChange(currentPage + 1)} 
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      <ChevronRight className="w-4 h-4" />
                  </button>
                  <button 
                      onClick={() => onPageChange(totalPages)} 
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      Last
                  </button>
              </div>
          </div>
      );
  };

  // --- STATS CARD COMPONENT ---
  const StatCard: React.FC<{
      icon: React.ReactNode;
      label: string;
      value: string | number;
      subValue?: string;
      color: string;
      bgColor: string;
  }> = ({ icon, label, value, subValue, color, bgColor }) => (
      <div className={`${bgColor} rounded-xl p-4 border border-opacity-20`}>
          <div className="flex items-center justify-between">
              <div>
                  <p className="text-sm text-gray-600 mb-1">{label}</p>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
              </div>
              <div className={`p-3 rounded-xl ${bgColor} ${color}`}>
                  {icon}
              </div>
          </div>
      </div>
  );

  // --- CALENDAR RENDERER ---
  const renderCalendar = () => {
      const year = parseInt(selectedYear);
      const month = parseInt(selectedMonth) - 1;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDay = new Date(year, month, 1).getDay();
      const days = [];
      
      for (let i = 0; i < firstDay; i++) {
          days.push(
              <div key={`empty-${i}`} className="h-20 bg-gray-50/50 border-b border-r border-gray-100"></div>
          );
      }
      
      for (let d = 1; d <= daysInMonth; d++) {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const log = employeeLogs.find(l => l.attendance_date === dateStr);
          let bgColor = "bg-white hover:bg-gray-50", statusColor = "text-gray-300", statusText = "-", borderClass = "";
          
          if (log) {
              if (log.status.toLowerCase().startsWith('p')) { 
                  bgColor = "bg-green-50 hover:bg-green-100"; 
                  statusColor = "text-green-600"; 
                  statusText = "P"; 
                  borderClass = "border-l-4 border-l-green-500";
              }
              else if (log.status.toLowerCase().startsWith('a')) { 
                  bgColor = "bg-red-50 hover:bg-red-100"; 
                  statusColor = "text-red-600"; 
                  statusText = "A"; 
                  borderClass = "border-l-4 border-l-red-500";
              }
              else { 
                  bgColor = "bg-yellow-50 hover:bg-yellow-100"; 
                  statusColor = "text-yellow-600"; 
                  statusText = log.status.substring(0, 2); 
                  borderClass = "border-l-4 border-l-yellow-500";
              }
          }
          
          days.push(
              <div key={d} className={`h-20 p-2 border-b border-r border-gray-100 relative ${bgColor} ${borderClass} transition-colors cursor-pointer`}>
                  <span className="text-xs font-bold text-gray-400">{d}</span>
                  {log ? (
                    <div className="mt-1 flex flex-col items-center">
                        <span className={`text-xl font-black ${statusColor}`}>{statusText}</span>
                        <div className="text-[9px] text-gray-500 font-medium">
                            {log.in_time?.substring(0,5) || '--:--'} - {log.out_time?.substring(0,5) || '--:--'}
                        </div>
                    </div>
                  ) : (
                    <div className="mt-3 flex justify-center">
                        <span className={`text-lg ${statusColor}`}>-</span>
                    </div>
                  )}
              </div>
          );
      }
      
      return (
          <div className="grid grid-cols-7 border-t border-l border-gray-200 rounded-xl overflow-hidden shadow-inner">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="h-10 flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-50 text-xs font-bold text-gray-600 border-b border-r border-gray-200">
                      {d}
                  </div>
              ))}
              {days}
          </div>
      );
  };

  // --- CLOCK VIEW RENDERER ---
  const renderClockView = () => {
      if (!selectedDailyRecord) return null;
      const { in_time, out_time, late_arrival, ot, hrs_works, status } = selectedDailyRecord;

      const parseHours = (value: any): number => {
          if (!value || value === '' || value === '--' || value === null) return 0;
          const str = String(value).trim();
          if (str.includes(':')) {
              const [h, m] = str.split(':').map(Number);
              return isNaN(h) ? 0 : h + (isNaN(m) ? 0 : m / 60);
          }
          const num = parseFloat(str);
          return isNaN(num) ? 0 : num;
      };

      const hours = parseHours(hrs_works);
      const isLate = Number(late_arrival) > 0;
      const isOT = Number(ot) > 0;
      const progress = Math.min(100, (hours / 9) * 100);

      return (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Gauge */}
              <div className="flex flex-col items-center justify-center">
                  <div className="relative w-64 h-64">
                      <svg className="w-full h-full transform -rotate-90">
                          <circle cx="128" cy="128" r="116" stroke="#e5e7eb" strokeWidth="20" fill="transparent" />
                          <circle
                              cx="128" cy="128" r="116"
                              stroke="currentColor"
                              strokeWidth="20"
                              fill="transparent"
                              strokeDasharray={728}
                              strokeDashoffset={728 - (728 * progress) / 100}
                              strokeLinecap="round"
                              className={`${hours >= 8 ? 'text-emerald-500' : hours >= 6 ? 'text-blue-500' : 'text-orange-500'} transition-all duration-1000`}
                          />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-6xl font-black text-gray-800">{hours.toFixed(1)}</span>
                          <span className="text-lg text-gray-500 font-medium">Hours Worked</span>
                      </div>
                  </div>

                  <div className={`mt-8 px-8 py-3 rounded-full text-lg font-bold shadow-xl ${
                      status?.toLowerCase().includes('present') || status?.toLowerCase().startsWith('p')
                          ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
                          : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
                  }`}>
                      {status?.toLowerCase().includes('present') || status?.toLowerCase().startsWith('p') ? 'Present' : 'Absent'}
                  </div>
              </div>

              {/* Right: Details */}
              <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                          <div className="flex items-center text-blue-600 mb-2">
                              <Clock className="w-5 h-5 mr-2"/> Clock In
                          </div>
                          <div className="text-3xl font-black text-gray-800">
                              {in_time?.substring(0,5) || '--:--'}
                          </div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
                          <div className="flex items-center text-purple-600 mb-2">
                              <Clock className="w-5 h-5 mr-2"/> Clock Out
                          </div>
                          <div className="text-3xl font-black text-gray-800">
                              {out_time?.substring(0,5) || '--:--'}
                          </div>
                      </div>
                  </div>

                  <div className="space-y-4">
                      {isLate && (
                          <div className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-orange-50 to-red-50 border-2 border-red-200">
                              <div className="flex items-center">
                                  <AlertCircle className="w-8 h-8 text-red-600 mr-4"/>
                                  <div>
                                      <p className="font-bold text-red-700">Late Arrival</p>
                                      <p className="text-sm text-red-600">You were late today</p>
                                  </div>
                              </div>
                              <span className="text-2xl font-black text-red-700">+{late_arrival} min</span>
                          </div>
                      )}

                      {!isLate && (status?.toLowerCase().includes('present') || status?.toLowerCase().startsWith('p')) && (
                          <div className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-green-200">
                              <div className="flex items-center">
                                  <CheckCircle2 className="w-8 h-8 text-green-600 mr-4"/>
                                  <div>
                                      <p className="font-bold text-green-700">On Time!</p>
                                      <p className="text-sm text-green-600">Great job arriving early</p>
                                  </div>
                              </div>
                              <span className="text-3xl">✨</span>
                          </div>
                      )}

                      {isOT && (
                          <div className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
                              <div className="flex items-center">
                                  <Timer className="w-8 h-8 text-purple-600 mr-4"/>
                                  <div>
                                      <p className="font-bold text-purple-700">Overtime Bonus</p>
                                      <p className="text-sm text-purple-600">Extra effort recognized</p>
                                  </div>
                              </div>
                              <span className="text-2xl font-black text-purple-700">+{ot} hrs</span>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      );
  };

  // --- DELETE CONFIRMATION MODAL CONTENT ---
  const renderDeleteConfirmation = (type: 'daily' | 'monthly') => {
      const isDaily = type === 'daily';
      const dateDisplay = isDaily 
          ? selectedDate && new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            })
          : `${new Date(0, parseInt(selectedMonth) - 1).toLocaleString('default', { month: 'long' })} ${selectedYear}`;
      
      const recordCount = isDaily ? dailyData.length : summaryData.length;

      return (
          <div className="p-6">
              {/* Warning Icon */}
              <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                      <ShieldAlert className="w-10 h-10 text-red-600" />
                  </div>
              </div>

              {/* Warning Message */}
              <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Delete All {isDaily ? 'Daily' : 'Monthly'} Records?
                  </h3>
                  <p className="text-gray-600 mb-4">
                      You are about to permanently delete <strong className="text-red-600">{recordCount}</strong> attendance records for:
                  </p>
                  <div className="inline-flex items-center px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
                      <Calendar className="w-5 h-5 text-red-600 mr-2" />
                      <span className="font-semibold text-red-700">{dateDisplay}</span>
                  </div>
              </div>

              {/* Warning Details */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div className="text-sm text-amber-800">
                          <p className="font-semibold mb-1">⚠️ This action cannot be undone!</p>
                          <ul className="list-disc list-inside space-y-1 text-amber-700">
                              <li>All attendance records for this {isDaily ? 'date' : 'month'} will be permanently removed</li>
                              <li>Employee attendance history will be affected</li>
                              <li>You will need to re-upload the data if needed</li>
                          </ul>
                      </div>
                  </div>
              </div>

              {/* Confirmation Input */}
              <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">DELETE</span> to confirm:
                  </label>
                  <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                      placeholder="Type DELETE here"
                      className={`w-full px-4 py-3 border-2 rounded-xl text-center text-lg font-mono uppercase tracking-widest transition-all ${
                          deleteConfirmText === "DELETE" 
                              ? 'border-green-500 bg-green-50 focus:ring-4 focus:ring-green-100' 
                              : 'border-gray-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                      }`}
                  />
                  {deleteConfirmText && deleteConfirmText !== "DELETE" && (
                      <p className="text-xs text-red-500 mt-1 text-center">Please type exactly: DELETE</p>
                  )}
                  {deleteConfirmText === "DELETE" && (
                      <p className="text-xs text-green-600 mt-1 text-center flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Ready to delete
                      </p>
                  )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                  <button
                      onClick={() => {
                          isDaily ? setIsDeleteDailyModalOpen(false) : setIsDeleteMonthlyModalOpen(false);
                          setDeleteConfirmText("");
                      }}
                      disabled={deleteLoading}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                      Cancel
                  </button>
                  <button
                      onClick={isDaily ? handleDeleteDailyData : handleDeleteMonthlyData}
                      disabled={deleteConfirmText !== "DELETE" || deleteLoading}
                      className={`flex-1 px-6 py-3 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                          deleteConfirmText === "DELETE" && !deleteLoading
                              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 shadow-lg hover:shadow-xl'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                      {deleteLoading ? (
                          <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Deleting...
                          </>
                      ) : (
                          <>
                              <Trash2 className="w-5 h-5" />
                              Delete All Records
                          </>
                      )}
                  </button>
              </div>
          </div>
      );
  };

  // --- DAILY OPS TAB ---
  const renderDailyOps = () => (
      <div className="space-y-6">
          {/* Upload Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex flex-col lg:flex-row gap-6">
                  <div className="w-full lg:w-1/3">
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-blue-600"/>
                          1. Select Work Date
                      </label>
                      <input 
                          type="date" 
                          value={selectedDate} 
                          onChange={(e) => setSelectedDate(e.target.value)} 
                          className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl bg-blue-50 text-blue-900 font-medium focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all"
                      />
                  </div>
                  <form onSubmit={handleUpload} className="w-full lg:w-2/3 flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                              <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600"/>
                              2. Select Excel File
                          </label>
                          <div className="relative">
                              <input 
                                  type="file" 
                                  accept=".xlsx,.xls" 
                                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)} 
                                  className="block w-full text-sm text-gray-500 border-2 border-dashed border-gray-300 rounded-xl p-3 hover:border-green-400 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                              />
                          </div>
                      </div>
                      <div className="flex items-end">
                          <button 
                              type="submit" 
                              disabled={!uploadFile || !selectedDate || loading} 
                              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                          >
                              {loading ? <Loader2 className="animate-spin w-5 h-5"/> : <Upload className="w-5 h-5"/>}
                              Upload
                          </button>
                      </div>
                  </form>
              </div>
          </div>

          {/* Stats Cards */}
          {dailyData.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <StatCard icon={<Users className="w-6 h-6"/>} label="Total" value={dailyStats.total} color="text-blue-600" bgColor="bg-blue-50" />
                  <StatCard icon={<UserCheck className="w-6 h-6"/>} label="Present" value={dailyStats.present} subValue={`${((dailyStats.present / dailyStats.total) * 100).toFixed(1)}%`} color="text-green-600" bgColor="bg-green-50" />
                  <StatCard icon={<UserX className="w-6 h-6"/>} label="Absent" value={dailyStats.absent} subValue={`${((dailyStats.absent / dailyStats.total) * 100).toFixed(1)}%`} color="text-red-600" bgColor="bg-red-50" />
                  <StatCard icon={<AlarmClock className="w-6 h-6"/>} label="Late" value={dailyStats.late} color="text-orange-600" bgColor="bg-orange-50" />
                  <StatCard icon={<CheckCircle2 className="w-6 h-6"/>} label="On Time" value={dailyStats.onTime} color="text-emerald-600" bgColor="bg-emerald-50" />
                  <StatCard icon={<Timer className="w-6 h-6"/>} label="OT Workers" value={dailyStats.otWorkers} subValue={`${dailyStats.totalOtHours.toFixed(1)} hrs total`} color="text-purple-600" bgColor="bg-purple-50" />
              </div>
          )}

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                  <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                      <div className="flex items-center gap-3">
                          <h3 className="font-bold text-gray-800 text-lg">Daily Logs</h3>
                          <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                              {processedDailyData.length} entries
                          </span>
                          {selectedDate && (
                              <span className="bg-gray-200 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                                  {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                              </span>
                          )}
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                          <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"/>
                              <input 
                                  type="text"
                                  placeholder="Search name, card, dept..."
                                  value={dailySearchTerm}
                                  onChange={(e) => { setDailySearchTerm(e.target.value); setDailyCurrentPage(1); }}
                                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                              />
                          </div>
                          <button 
                              onClick={() => setShowDailyFilters(!showDailyFilters)}
                              className={`p-2 rounded-lg border transition-colors ${showDailyFilters ? 'bg-blue-100 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
                          >
                              <SlidersHorizontal className="w-5 h-5"/>
                          </button>
                          <button 
                              onClick={exportDailyData}
                              disabled={processedDailyData.length === 0}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              <Download className="w-4 h-4"/> Export
                          </button>
                          {/* DELETE BUTTON FOR DAILY */}
                          {dailyData.length > 0 && selectedDate && (
                              <button 
                                  onClick={openDeleteDailyModal}
                                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                              >
                                  <Trash2 className="w-4 h-4"/> Clear All
                              </button>
                          )}
                      </div>
                  </div>
                  
                  {showDailyFilters && (
                      <div className="mt-4 pt-4 border-t border-blue-100 flex flex-wrap gap-4 items-center">
                          <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                              <select 
                                  value={dailyStatusFilter}
                                  onChange={(e) => { setDailyStatusFilter(e.target.value); setDailyCurrentPage(1); }}
                                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              >
                                  <option value="all">All Status</option>
                                  <option value="present">Present</option>
                                  <option value="absent">Absent</option>
                                  <option value="late">Late Arrivals</option>
                                  <option value="ontime">On Time</option>
                                  <option value="ot">OT Workers</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
                              <select 
                                  value={dailyDeptFilter}
                                  onChange={(e) => { setDailyDeptFilter(e.target.value); setDailyCurrentPage(1); }}
                                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              >
                                  <option value="all">All Departments</option>
                                  {dailyDepartments.map(dept => (
                                      <option key={dept} value={dept}>{dept}</option>
                                  ))}
                              </select>
                          </div>
                          <button 
                              onClick={resetDailyFilters}
                              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors mt-5"
                          >
                              <RefreshCw className="w-4 h-4"/> Reset
                          </button>
                      </div>
                  )}
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                  {paginatedDailyData.length > 0 ? (
                      <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                              <tr>
                                  {dailyFields.map(f => (
                                      <th 
                                          key={f.key} 
                                          onClick={() => f.sortable && handleDailySort(f.key)}
                                          className={`px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider ${f.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''}`}
                                      >
                                          <div className="flex items-center gap-1">
                                              {f.label}
                                              {f.sortable && dailySortConfig?.key === f.key && (
                                                  dailySortConfig.direction === 'asc' 
                                                      ? <ArrowUp className="w-3 h-3 text-blue-600"/> 
                                                      : <ArrowDown className="w-3 h-3 text-blue-600"/>
                                              )}
                                          </div>
                                      </th>
                                  ))}
                              </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-100">
                              {paginatedDailyData.map((row, idx) => {
                                  const isPresent = row.status?.toLowerCase().startsWith('p');
                                  const isLate = Number(row.late_arrival) > 0;
                                  const hasOT = Number(row.ot) > 0;
                                  
                                  return (
                                      <tr 
                                          key={idx} 
                                          onClick={() => openClockModal(row, idx)} 
                                          className="hover:bg-blue-50 cursor-pointer transition-colors group"
                                      >
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.sr_no || '-'}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-800">{row.card_no}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 group-hover:text-blue-700">{row.employee_name}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.department}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{row.in_time?.substring(0,5) || '-'}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">{row.out_time?.substring(0,5) || '-'}</td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                                  isPresent ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                              }`}>
                                                  {isPresent ? '✓' : '✗'} {row.status}
                                              </span>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                              {isLate ? (
                                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                                                      <TrendingDown className="w-3 h-3 mr-1"/> {row.late_arrival}
                                                  </span>
                                              ) : <span className="text-gray-400">-</span>}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                              {hasOT ? (
                                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                                                      <TrendingUp className="w-3 h-3 mr-1"/> +{row.ot}
                                                  </span>
                                              ) : <span className="text-gray-400">-</span>}
                                          </td>
                                      </tr>
                                  );
                              })}
                          </tbody>
                      </table>
                  ) : (
                      <div className="p-16 text-center">
                          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                              <Calendar className="w-10 h-10 text-gray-400"/>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Records Found</h3>
                          <p className="text-gray-500 mb-4">
                              {selectedDate ? "No attendance data for this date" : "Select a date to view attendance logs"}
                          </p>
                          {!selectedDate && (
                              <button 
                                  onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                  Select Today
                              </button>
                          )}
                      </div>
                  )}
              </div>

              {processedDailyData.length > 0 && (
                  <PaginationControls 
                      currentPage={dailyCurrentPage}
                      totalPages={dailyTotalPages}
                      totalItems={processedDailyData.length}
                      rowsPerPage={dailyRowsPerPage}
                      onPageChange={setDailyCurrentPage}
                      onRowsPerPageChange={(rows) => { setDailyRowsPerPage(rows); setDailyCurrentPage(1); }}
                  />
              )}
          </div>
      </div>
  );

  // --- MONTHLY LEDGER TAB ---
  const renderMonthlyLedger = () => (
      <div className="space-y-6">
          {/* Controls Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Month</label>
                      <select 
                          value={selectedMonth} 
                          onChange={(e) => setSelectedMonth(e.target.value)} 
                          className="px-4 py-3 border-2 border-purple-200 rounded-xl bg-purple-50 text-purple-900 font-medium focus:ring-4 focus:ring-purple-100 focus:border-purple-400"
                      >
                          {Array.from({length: 12}, (_, i) => (
                              <option key={i+1} value={i+1}>
                                  {new Date(0, i).toLocaleString('default', {month: 'long'})}
                              </option>
                          ))}
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Year</label>
                      <select 
                          value={selectedYear} 
                          onChange={(e) => setSelectedYear(e.target.value)} 
                          className="px-4 py-3 border-2 border-purple-200 rounded-xl bg-purple-50 text-purple-900 font-medium focus:ring-4 focus:ring-purple-100 focus:border-purple-400"
                      >
                          {generateYearOptions().map(year => (
                              <option key={year} value={year}>{year}</option>
                          ))}
                      </select>
                  </div>
                  <button 
                      onClick={fetchMonthlySummary} 
                      disabled={loading}
                      className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                      {loading ? <Loader2 className="animate-spin w-5 h-5"/> : <BarChart3 className="w-5 h-5"/>}
                      Generate Report
                  </button>
              </div>
          </div>

          {/* Stats Cards */}
          {summaryData.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <StatCard icon={<Users className="w-6 h-6"/>} label="Employees" value={monthlyStats.totalEmployees} color="text-purple-600" bgColor="bg-purple-50" />
                  <StatCard icon={<UserCheck className="w-6 h-6"/>} label="Avg Present" value={monthlyStats.avgPresent.toFixed(1)} subValue="days/employee" color="text-green-600" bgColor="bg-green-50" />
                  <StatCard icon={<UserX className="w-6 h-6"/>} label="Avg Absent" value={monthlyStats.avgAbsent.toFixed(1)} subValue="days/employee" color="text-red-600" bgColor="bg-red-50" />
                  <StatCard icon={<Timer className="w-6 h-6"/>} label="Total OT" value={monthlyStats.totalOtHours.toFixed(1)} subValue="hours" color="text-blue-600" bgColor="bg-blue-50" />
                  <StatCard icon={<CheckCircle2 className="w-6 h-6"/>} label="Perfect" value={monthlyStats.perfectAttendance} subValue="0 absents" color="text-emerald-600" bgColor="bg-emerald-50" />
                  <StatCard icon={<AlertCircle className="w-6 h-6"/>} label="Critical" value={monthlyStats.criticalAttendance} subValue="<50% attendance" color="text-orange-600" bgColor="bg-orange-50" />
              </div>
          )}

          {/* Search, Filters & Quick Sort */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200">
                  <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                      <div className="flex items-center gap-3">
                          <h3 className="font-bold text-gray-800 text-lg">Monthly Summary</h3>
                          <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                              {processedMonthlyData.length} employees
                          </span>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                          <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"/>
                              <input 
                                  type="text"
                                  placeholder="Search..."
                                  value={monthlySearchTerm}
                                  onChange={(e) => { setMonthlySearchTerm(e.target.value); setMonthlyCurrentPage(1); }}
                                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 w-48"
                              />
                          </div>
                          <button 
                              onClick={() => setShowMonthlyFilters(!showMonthlyFilters)}
                              className={`p-2 rounded-lg border transition-colors ${showMonthlyFilters ? 'bg-purple-100 border-purple-300 text-purple-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
                          >
                              <SlidersHorizontal className="w-5 h-5"/>
                          </button>
                          <button 
                              onClick={exportMonthlyData}
                              disabled={processedMonthlyData.length === 0}
                              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              <Download className="w-4 h-4"/> Export
                          </button>
                          {/* DELETE BUTTON FOR MONTHLY */}
                          {summaryData.length > 0 && (
                              <button 
                                  onClick={openDeleteMonthlyModal}
                                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                              >
                                  <Trash2 className="w-4 h-4"/> Clear Month
                              </button>
                          )}
                      </div>
                  </div>

                  {showMonthlyFilters && (
                      <div className="mt-4 pt-4 border-t border-purple-100">
                          <div className="flex flex-wrap gap-4 items-end">
                              <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
                                  <select 
                                      value={monthlyDeptFilter}
                                      onChange={(e) => { setMonthlyDeptFilter(e.target.value); setMonthlyCurrentPage(1); }}
                                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                  >
                                      <option value="all">All Departments</option>
                                      {monthlyDepartments.map(dept => (
                                          <option key={dept} value={dept}>{dept}</option>
                                      ))}
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Quick Sort</label>
                                  <select 
                                      value={quickSortOption}
                                      onChange={(e) => { setQuickSortOption(e.target.value); setMonthlyCurrentPage(1); }}
                                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                  >
                                      <option value="">Default</option>
                                      <option value="most_present">🏆 Most Present</option>
                                      <option value="most_absent">⚠️ Most Absent</option>
                                      <option value="most_late">⏰ Most Late Hours</option>
                                      <option value="most_ot">💪 Most OT Hours</option>
                                      <option value="best_attendance">📈 Best Attendance %</option>
                                      <option value="worst_attendance">📉 Worst Attendance %</option>
                                  </select>
                              </div>
                              <button 
                                  onClick={resetMonthlyFilters}
                                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                  <RefreshCw className="w-4 h-4"/> Reset
                              </button>
                          </div>
                      </div>
                  )}
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                  {paginatedMonthlyData.length > 0 ? (
                      <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                              <tr>
                                  {monthlyFields.map(f => (
                                      <th 
                                          key={f.key} 
                                          onClick={() => f.sortable && handleMonthlySort(f.key as keyof MonthlySummaryRecord)}
                                          className={`px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider ${f.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''}`}
                                      >
                                          <div className="flex items-center gap-1">
                                              {f.label}
                                              {f.sortable && monthlySortConfig?.key === f.key && (
                                                  monthlySortConfig.direction === 'asc' 
                                                      ? <ArrowUp className="w-3 h-3 text-purple-600"/> 
                                                      : <ArrowDown className="w-3 h-3 text-purple-600"/>
                                              )}
                                          </div>
                                      </th>
                                  ))}
                                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Rate</th>
                              </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-100">
                              {paginatedMonthlyData.map((row, idx) => {
                                  const attendanceRate = row.total_present / (row.total_present + row.total_absent) * 100 || 0;
                                  let rateColor = 'text-green-600 bg-green-100';
                                  if (attendanceRate < 80) rateColor = 'text-yellow-600 bg-yellow-100';
                                  if (attendanceRate < 60) rateColor = 'text-red-600 bg-red-100';
                                  
                                  return (
                                      <tr 
                                          key={idx} 
                                          onClick={() => openCalendarModal(row)} 
                                          className="hover:bg-purple-50 cursor-pointer transition-colors group"
                                      >
                                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-800">{row.card_no}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 group-hover:text-purple-700">{row.employee_name}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.department}</td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                  {row.total_present}
                                              </span>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${row.total_absent > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                                                  {row.total_absent}
                                              </span>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">{(row.total_early||0).toFixed(2)}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 font-medium">{(row.total_late||0).toFixed(2)}</td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                                                  {(row.total_ot_hours||0).toFixed(2)}
                                              </span>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${rateColor}`}>
                                                  {attendanceRate.toFixed(1)}%
                                              </span>
                                          </td>
                                      </tr>
                                  );
                              })}
                          </tbody>
                      </table>
                  ) : (
                      <div className="p-16 text-center">
                          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                              <BarChart3 className="w-10 h-10 text-gray-400"/>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Summary Data</h3>
                          <p className="text-gray-500 mb-4">Select a month and year, then click "Generate Report"</p>
                      </div>
                  )}
              </div>

              {processedMonthlyData.length > 0 && (
                  <PaginationControls 
                      currentPage={monthlyCurrentPage}
                      totalPages={monthlyTotalPages}
                      totalItems={processedMonthlyData.length}
                      rowsPerPage={monthlyRowsPerPage}
                      onPageChange={setMonthlyCurrentPage}
                      onRowsPerPageChange={(rows) => { setMonthlyRowsPerPage(rows); setMonthlyCurrentPage(1); }}
                  />
              )}
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl text-white">
                    <Fingerprint className="w-8 h-8"/>
                </div>
                Attendance Management System
            </h1>
            <p className="text-gray-500 mt-1 ml-14">Track, analyze, and manage employee attendance</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8 p-2">
            <nav className="flex space-x-2">
                <button 
                    onClick={() => setActiveTab('daily-ops')} 
                    className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all ${
                        activeTab === 'daily-ops' 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200' 
                            : 'text-gray-500 hover:bg-gray-100'
                    }`}
                >
                    <FileSpreadsheet className="w-5 h-5 mr-2"/> Daily Operations
                </button>
                <button 
                    onClick={() => setActiveTab('monthly-ledger')} 
                    className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all ${
                        activeTab === 'monthly-ledger' 
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-200' 
                            : 'text-gray-500 hover:bg-gray-100'
                    }`}
                >
                    <BarChart3 className="w-5 h-5 mr-2"/> Monthly Ledger
                </button>
                <button 
                    onClick={() => setActiveTab('settings')} 
                    className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all ${
                        activeTab === 'settings' 
                            ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-lg shadow-gray-200' 
                            : 'text-gray-500 hover:bg-gray-100'
                    }`}
                >
                    <Fingerprint className="w-5 h-5 mr-2"/> Settings
                </button>
            </nav>
        </div>
        
        {/* Tab Content */}
        <div className="min-h-[600px]">
            {activeTab === 'daily-ops' && renderDailyOps()}
            {activeTab === 'monthly-ledger' && renderMonthlyLedger()}
            {activeTab === 'settings' && <SetAutoFetchTime />}
        </div>
      </div>

      {/* ==================== MODALS ==================== */}

      {/* MONTHLY CALENDAR MODAL */}
      <Modal
          isOpen={isCalModalOpen}
          onClose={() => setIsCalModalOpen(false)}
          size="xl"
          headerColor="from-purple-600 to-indigo-600"
          headerContent={
              selectedEmpSummary && (
                  <div className="flex justify-between items-start w-full">
                      <div>
                          <h2 className="text-2xl font-bold">{selectedEmpSummary.employee_name}</h2>
                          <p className="opacity-80">{selectedEmpSummary.department} | Card: {selectedEmpSummary.card_no}</p>
                          <div className="flex gap-4 mt-3">
                              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">✓ {selectedEmpSummary.total_present} Present</span>
                              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">✗ {selectedEmpSummary.total_absent} Absent</span>
                          </div>
                      </div>
                      <button 
                          onClick={() => setIsCalModalOpen(false)}
                          className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                      >
                          <X className="w-5 h-5"/>
                      </button>
                  </div>
              )
          }
      >
          <div className="p-6">
              {modalLoading ? (
                  <div className="flex items-center justify-center py-20">
                      <Loader2 className="animate-spin w-10 h-10 text-purple-600"/>
                  </div>
              ) : (
                  <>
                      <div className="flex items-center gap-6 mb-4 pb-4 border-b border-gray-200">
                          <span className="text-sm font-medium text-gray-600">Legend:</span>
                          <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-green-500 rounded"></div>
                              <span className="text-sm text-gray-600">Present</span>
                          </div>
                          <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-red-500 rounded"></div>
                              <span className="text-sm text-gray-600">Absent</span>
                          </div>
                          <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                              <span className="text-sm text-gray-600">Half Day / Other</span>
                          </div>
                          <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-gray-200 rounded"></div>
                              <span className="text-sm text-gray-600">No Data</span>
                          </div>
                      </div>
                      {renderCalendar()}
                  </>
              )}
          </div>
      </Modal>

      {/* DAILY CLOCK MODAL */}
      <Modal
          isOpen={isClockModalOpen}
          onClose={() => setIsClockModalOpen(false)}
          size="lg"
          headerColor="from-blue-600 to-indigo-700"
          headerContent={
              selectedDailyRecord && (
                  <div className="w-full">
                      <div className="flex justify-between items-start">
                          <div>
                              <h2 className="text-2xl font-bold">{selectedDailyRecord.employee_name}</h2>
                              <p className="opacity-80">{selectedDailyRecord.department} | Card: {selectedDailyRecord.card_no}</p>
                              <p className="opacity-60 text-sm mt-1">
                                  {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', { 
                                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                                  })}
                              </p>
                          </div>
                          <button 
                              onClick={() => setIsClockModalOpen(false)} 
                              className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                          >
                              <X className="w-5 h-5"/>
                          </button>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/20">
                          <button
                              onClick={() => navigateDailyModal('prev')}
                              disabled={currentDailyIndex === 0}
                              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                              <ChevronLeft className="w-4 h-4"/> Previous
                          </button>
                          <span className="text-sm opacity-70">
                              {currentDailyIndex + 1} of {paginatedDailyData.length}
                          </span>
                          <button
                              onClick={() => navigateDailyModal('next')}
                              disabled={currentDailyIndex === paginatedDailyData.length - 1}
                              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                              Next <ChevronRight className="w-4 h-4"/>
                          </button>
                      </div>
                  </div>
              )
          }
      >
          {renderClockView()}
      </Modal>

      {/* DELETE DAILY CONFIRMATION MODAL */}
      <Modal
          isOpen={isDeleteDailyModalOpen}
          onClose={() => { setIsDeleteDailyModalOpen(false); setDeleteConfirmText(""); }}
          size="md"
          headerColor="from-red-600 to-rose-600"
          headerContent={
              <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-3">
                      <Trash2 className="w-6 h-6" />
                      <h2 className="text-xl font-bold">Clear Daily Records</h2>
                  </div>
                  <button 
                      onClick={() => { setIsDeleteDailyModalOpen(false); setDeleteConfirmText(""); }}
                      className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                  >
                      <X className="w-5 h-5"/>
                  </button>
              </div>
          }
      >
          {renderDeleteConfirmation('daily')}
      </Modal>

      {/* DELETE MONTHLY CONFIRMATION MODAL */}
      <Modal
          isOpen={isDeleteMonthlyModalOpen}
          onClose={() => { setIsDeleteMonthlyModalOpen(false); setDeleteConfirmText(""); }}
          size="md"
          headerColor="from-red-600 to-rose-600"
          headerContent={
              <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-3">
                      <Trash2 className="w-6 h-6" />
                      <h2 className="text-xl font-bold">Clear Monthly Records</h2>
                  </div>
                  <button 
                      onClick={() => { setIsDeleteMonthlyModalOpen(false); setDeleteConfirmText(""); }}
                      className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                  >
                      <X className="w-5 h-5"/>
                  </button>
              </div>
          }
      >
          {renderDeleteConfirmation('monthly')}
      </Modal>
    </div>
  );
};

export default AttendanceSystem;