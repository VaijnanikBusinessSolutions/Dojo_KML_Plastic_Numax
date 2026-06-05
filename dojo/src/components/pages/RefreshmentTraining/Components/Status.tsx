import React, { useState, useEffect, useMemo } from 'react';
import { Filter, TrendingUp, BookOpen } from 'lucide-react';

// const API_BASE = API_ENDPOINTS.BASE_URL;
const API_BASE = 'http://127.0.0.1:8000';

interface Employee {
  id: string;            // emp_id (PK)
  employee_code: string; // emp_id
  full_name: string;     // computed
}

interface TrainingSession {
  id: number;
  training_name?: { topic?: string } | string;
  date: string;
  time: string;
  trainer?: { name?: string } | string;
  venue?: { name?: string } | string;
  // From ScheduleSerializer (RefresherOperatorMasterSerializer without id)
  employees: Array<{
    emp_id: string;
    first_name?: string;
    last_name?: string;
  }>;
}

interface EmployeeStatus {
  id: number;
  schedule: number;
  employee: string; // emp_id string
  status: 'present' | 'absent' | 'rescheduled';
  notes?: string;
  reschedule_date?: string;
  reschedule_time?: string;
  reschedule_reason?: string;
}

type TrainingRow = {
  sessionId: number;
  trainingName: string;
  date: string;
  time: string;
  trainer: string;
  venue: string;
  status: 'present' | 'absent' | 'rescheduled' | 'not added';
  notes?: string;
  reschedule_date?: string;
  reschedule_time?: string;
  reschedule_reason?: string;
};

type AggregatedEmployee = {
  id: string;
  name: string;
  employee_code: string;
  trainings: TrainingRow[];
  presentCount: number;
  absentCount: number;
  rescheduledCount: number;
  totalCount: number;
};

// Helpers to safely extract text fields
function getName(field: any): string {
  if (!field) return '';
  if (typeof field === 'object' && field !== null && 'name' in field) return field.name;
  if (typeof field === 'string') return field;
  return '';
}
function getTopic(field: any): string {
  if (!field) return '';
  if (typeof field === 'object' && field !== null && 'topic' in field) return field.topic;
  if (typeof field === 'string') return field;
  return '';
}

// Build full name for session employee objects
const sessionEmpFullName = (emp: any) =>
  [emp?.first_name, emp?.last_name].filter(Boolean).join(' ').trim() || String(emp?.emp_id || '');

const Status: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showYearOnly, setShowYearOnly] = useState(false);
  const [filterEmployee, setFilterEmployee] = useState('');
  const [loading, setLoading] = useState(false);

  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeStatuses, setEmployeeStatuses] = useState<EmployeeStatus[]>([]);

  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sessionsRes, employeesRes, statusesRes] = await Promise.all([
        fetch(`${API_BASE}/schedules/`),
        fetch(`${API_BASE}/mastertable/`),
        fetch(`${API_BASE}/empattendances/`),
      ]);

      if (!sessionsRes.ok) throw new Error('Failed to fetch training sessions');
      if (!employeesRes.ok) throw new Error('Failed to fetch employees');
      if (!statusesRes.ok) throw new Error('Failed to fetch employee statuses');

      const sessionsData = await sessionsRes.json();
      const employeesData = await employeesRes.json();
      const statusesData = await statusesRes.json();

      // Handle pagination if present for employees
      const employeeRows = Array.isArray(employeesData) ? employeesData : employeesData?.results ?? [];

      setTrainingSessions(sessionsData);
      setEmployees(
        employeeRows.map((e: any) => ({
          id: String(e.emp_id), // PK
          employee_code: String(e.emp_id),
          full_name: [e.first_name, e.last_name].filter(Boolean).join(' ').trim() || String(e.emp_id),
        }))
      );
      setEmployeeStatuses(statusesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load data from server: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Build per-employee training status
  const allTrainingData: AggregatedEmployee[] = useMemo(() => {
    if (!trainingSessions.length) return [];

    // Map normalized employee full_name (from mastertable) -> Employee record
    const employeeNameMap = new Map<string, Employee>();
    employees.forEach(emp => {
      employeeNameMap.set((emp.full_name || '').toLowerCase(), emp);
    });

    // Collect unique employee names from sessions
    const allTrainingEmployees = new Set<string>();
    trainingSessions.forEach(session => {
      session.employees?.forEach(emp => {
        const name = sessionEmpFullName(emp);
        if (name) allTrainingEmployees.add(name);
      });
    });

    // Build aggregated data for each unique employee name found in sessions
    return Array.from(allTrainingEmployees).map(employeeName => {
      const lower = employeeName.toLowerCase();
      const employeeRecord = employeeNameMap.get(lower);

      // Find emp_id by scanning sessions (since session employees don't include id)
      let employeeId: string | null = null;
      for (const session of trainingSessions) {
        const emp = session.employees?.find(e => sessionEmpFullName(e) === employeeName);
        if (emp) {
          employeeId = String(emp.emp_id);
          break;
        }
      }

      // Sessions for this employee
      const sessionsForEmployee = trainingSessions.filter(
        s => s.employees?.some(e => sessionEmpFullName(e) === employeeName)
      );

      // Trainings rows with attendance join (attendance.employee is emp_id string)
      const trainings: TrainingRow[] = sessionsForEmployee.map(session => {
        const attendance = employeeStatuses.find(
          st => st.schedule === session.id && String(st.employee) === String(employeeId)
        );

        return {
          sessionId: session.id,
          trainingName: getTopic(session.training_name) || 'Unknown Training',
          date: session.date,
          time: session.time,
          trainer: getName(session.trainer) || 'TBD',
          venue: getName(session.venue) || 'TBD',
          status: attendance ? attendance.status : 'not added',
          notes: attendance?.notes,
          reschedule_date: attendance?.reschedule_date,
          reschedule_time: attendance?.reschedule_time,
          reschedule_reason: attendance?.reschedule_reason,
        };
      });

      const presentCount = trainings.filter(t => t.status === 'present').length;
      const absentCount = trainings.filter(t => t.status === 'absent').length;
      const rescheduledCount = trainings.filter(t => t.status === 'rescheduled').length;

      return {
        id: employeeId || employeeRecord?.id || `temp-${employeeName}`,
        name: employeeName,
        employee_code: employeeRecord?.employee_code || employeeId || '',
        trainings,
        presentCount,
        absentCount,
        rescheduledCount,
        totalCount: trainings.length,
      };
    });
  }, [trainingSessions, employees, employeeStatuses]);

  // Filter by employee/code/id and by date range
  const filteredEmployees = useMemo(() => {
    const searchTerm = (filterEmployee || '').toLowerCase();
    let filtered = allTrainingData.filter(employee => {
      const name = (employee.name || '').toLowerCase();
      const idStr = String(employee.id || '').toLowerCase();
      const code = (employee.employee_code || '').toLowerCase();
      return name.includes(searchTerm) || idStr.includes(searchTerm) || code.includes(searchTerm);
    });

    filtered = filtered.map(employee => {
      const filteredTrainings = employee.trainings.filter(training => {
        if (!training.date) return false;

        const trainingDate = new Date(training.date);
        if (isNaN(trainingDate.getTime())) return false;

        const trainingYear = trainingDate.getFullYear();
        const trainingMonth = trainingDate.getMonth();

        if (showYearOnly) {
          return trainingYear === selectedYear;
        } else {
          return trainingYear === selectedYear && trainingMonth === selectedMonth;
        }
      });

      const presentCount = filteredTrainings.filter(t => t.status === 'present').length;
      const absentCount = filteredTrainings.filter(t => t.status === 'absent').length;
      const rescheduledCount = filteredTrainings.filter(t => t.status === 'rescheduled').length;

      return {
        ...employee,
        trainings: filteredTrainings,
        presentCount,
        absentCount,
        rescheduledCount,
        totalCount: filteredTrainings.length,
      };
    }).filter(employee => employee.trainings.length > 0);

    return filtered;
  }, [filterEmployee, selectedYear, selectedMonth, showYearOnly, allTrainingData]);

  // Aggregate stats - totals are per session rows (not unique employees)
  const overallStats = useMemo(() => {
    const totalPresentSessions = filteredEmployees.reduce((sum, emp) => sum + emp.presentCount, 0);
    const totalAbsentSessions = filteredEmployees.reduce((sum, emp) => sum + emp.absentCount, 0);
    const totalRescheduledSessions = filteredEmployees.reduce((sum, emp) => sum + emp.rescheduledCount, 0);
    const totalSessions = filteredEmployees.reduce((sum, emp) => sum + emp.totalCount, 0);

    return {
      total: filteredEmployees.length,
      present: totalPresentSessions,
      absent: totalAbsentSessions,
      rescheduled: totalRescheduledSessions,
      totalSessions: totalSessions,
      employeesWithPresent: filteredEmployees.filter(emp => emp.presentCount > 0).length,
      employeesWithAbsent: filteredEmployees.filter(emp => emp.absentCount > 0).length,
      employeesWithRescheduled: filteredEmployees.filter(emp => emp.rescheduledCount > 0).length,
    };
  }, [filteredEmployees]);

  // Session stats for unique sessions count
  const sessionStats = useMemo(() => {
    const uniqueSessions = new Set(
      filteredEmployees.flatMap(emp =>
        emp.trainings.map(t => `${t.sessionId}-${t.trainingName}-${t.date}`)
      )
    ).size;

    return {
      uniqueSessions,
      uniqueEmployees: filteredEmployees.length,
      totalSessions: trainingSessions.length
    };
  }, [filteredEmployees, trainingSessions]);

  const getStatusPercentage = (count: number, total: number) => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTime = (dateString: string, timeString?: string) => {
    let date: Date;
    if (timeString) {
      date = new Date(`${dateString}T${timeString}`);
    } else {
      date = new Date(dateString);
    }
    if (isNaN(date.getTime())) return timeString || '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Training Status Report</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Month Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              disabled={showYearOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              {monthNames.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          </div>

          {/* Year Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* View Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="viewMode"
                  checked={!showYearOnly}
                  onChange={() => setShowYearOnly(false)}
                  className="mr-2"
                />
                <span className="text-sm">Monthly</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="viewMode"
                  checked={showYearOnly}
                  onChange={() => setShowYearOnly(true)}
                  className="mr-2"
                />
                <span className="text-sm">Yearly</span>
              </label>
            </div>
          </div>

          {/* Filter Employee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Filter Employee
            </label>
            <input
              type="text"
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              placeholder="Search by name, ID, or employee code"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <strong>Period:</strong> {showYearOnly ? `Year ${selectedYear}` : `${monthNames[selectedMonth]} ${selectedYear}`}
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Sessions',
            value: sessionStats.uniqueSessions,
            icon: <BookOpen className="w-8 h-8 text-blue-600" />,
            color: 'blue'
          },
          {
            label: 'Present',
            value: overallStats.present,
            icon: <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"><div className="w-4 h-4 bg-green-600 rounded-full"></div></div>,
            color: 'green',
            percentage: getStatusPercentage(overallStats.present, overallStats.totalSessions)
          },
          {
            label: 'Absent',
            value: overallStats.absent,
            icon: <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center"><div className="w-4 h-4 bg-red-600 rounded-full"></div></div>,
            color: 'red',
            percentage: getStatusPercentage(overallStats.absent, overallStats.totalSessions)
          },
          {
            label: 'Rescheduled',
            value: overallStats.rescheduled,
            icon: <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center"><div className="w-4 h-4 bg-yellow-600 rounded-full"></div></div>,
            color: 'yellow',
            percentage: getStatusPercentage(overallStats.rescheduled, overallStats.totalSessions)
          },
        ].map(({ label, value, icon, color, percentage }) => (
          <div key={label} className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{label}</p>
              <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
              {percentage !== undefined && (
                <p className="text-xs text-gray-500">{percentage}%</p>
              )}
            </div>
            {icon}
          </div>
        ))}
      </div>

      {/* Employee Status Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Employee Training Status</h3>
          <p className="text-sm text-gray-600 mt-1">
            Showing {filteredEmployees.length} employees
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Training Details</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-500">
                    No training data available for the selected filters.
                  </td>
                </tr>
              )}
              {filteredEmployees.map(employee => {
                const completionRate = getStatusPercentage(employee.presentCount, employee.totalCount);
                return employee.trainings.map((training, idx) => {
                  const isLast = idx === employee.trainings.length - 1;
                  return (
                    <tr
                      key={`${employee.id}-${training.sessionId}`}
                      className={isLast ? "border-b-2 border-gray-200" : ""}
                    >
                      {/* Employee info in first row, with rowSpan */}
                      {idx === 0 && (
                        <td className="px-6 py-4 whitespace-nowrap align-top" rowSpan={employee.trainings.length}>
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-800">
                                {(employee.name || '').split(' ').map(n => (n?.[0] || '')).join('')}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                              <div className="text-sm text-gray-500">ID: {employee.id}</div>
                              {employee.employee_code && (
                                <div className="text-xs text-gray-400">Code: {employee.employee_code}</div>
                              )}
                            </div>
                          </div>
                        </td>
                      )}
                      {/* Training details */}
                      <td className="px-6 py-4 align-top">
                        <div className="font-medium text-gray-900">{training.trainingName}</div>
                        <div className="text-sm text-gray-600 mb-1">
                          {formatDate(training.date)} at {formatTime(training.date, training.time)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Trainer: {training.trainer} | Venue: {training.venue}
                        </div>
                        {training.status === 'rescheduled' && training.reschedule_date && (
                          <div className="mt-2 text-sm text-yellow-600">
                            Rescheduled to: {formatDate(training.reschedule_date)}
                            {training.reschedule_reason && ` (${training.reschedule_reason})`}
                          </div>
                        )}
                        {training.notes && (
                          <div className="mt-2 text-sm text-gray-500 italic">
                            Notes: {training.notes}
                          </div>
                        )}
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4 text-center align-middle">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(training.status)}`}>
                          {training.status.charAt(0).toUpperCase() + training.status.slice(1)}
                        </span>
                      </td>
                      {/* Progress bar in first row, with rowSpan */}
                      {idx === 0 && (
                        <td className="px-6 py-4 whitespace-nowrap align-top" rowSpan={employee.trainings.length}>
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${completionRate}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-700">{completionRate}%</span>
                          </div>
                          <div className="mt-1 text-xs text-gray-500">Completion Rate</div>
                          <div className="mt-1 text-xs text-gray-500">Total Trainings: {employee.totalCount}</div>
                          <div className="mt-1 text-xs text-gray-500">
                            Present: {employee.presentCount}, Absent: {employee.absentCount}, Rescheduled: {employee.rescheduledCount}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredEmployees.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Training Data Found</h3>
          <p className="text-gray-600">
            No employees have training records for the selected period. Try adjusting your filters or date range.
          </p>
        </div>
      )}
    </div>
  );
};

export default Status;