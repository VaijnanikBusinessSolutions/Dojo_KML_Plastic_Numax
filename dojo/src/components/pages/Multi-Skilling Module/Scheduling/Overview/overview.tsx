import { useEffect, useState } from 'react';
import { useSkillFilter } from './SkillFilterContext';
import MultiSkillingList from '../SchedulingList/schedulinglist';

const Overview = () => {
  const {
    statusFilter,
    dateFilter,
    setStatusFilter,
    setDateFilter,
    stats,
    setStats,
    allEmployees,
    setAllEmployees,
  } = useSkillFilter();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Fetch from the new MultiSkilling backend
        const multiSkillingRes = await fetch('http://172.25.0.51:8000/multiskilling/');

        if (!multiSkillingRes.ok) {
          throw new Error('Failed to fetch multiskilling data');
        }

        const multiSkilling = await multiSkillingRes.json();
        console.log("📊 MultiSkilling data:", multiSkilling);

        const today = new Date();
        let scheduledCount = 0;
        let inProgressCount = 0;
        let completedCount = 0;
        const totalSkills = multiSkilling.length;

        const employeeMap: Record<string, any> = {};

        multiSkilling.forEach((skill: any) => {
          // Use the current_status from the serializer which handles all logic
          const finalStatus = skill.current_status?.toLowerCase() || skill.status?.toLowerCase() || 'scheduled';

          // Count based on the status
          switch (finalStatus) {
            case 'scheduled':
              scheduledCount++;
              break;
            case 'in-progress':
              inProgressCount++;
              break;
            case 'completed':
              completedCount++;
              break;
          }

          const empId = skill.emp_id || skill.employee;
          if (!employeeMap[empId]) {
            employeeMap[empId] = {
              full_name: skill.employee_name || `Employee ${empId}`,
              card_no: skill.emp_id || '',
              employee_id: empId,
              joining_date: skill.date_of_joining
                ? new Date(skill.date_of_joining).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })
                : 'N/A',
              department: skill.department_name || skill.department_from_hierarchy || '',
              section: skill.department_from_hierarchy || '',
              department_code: '',
              employment_pattern: '',
              skills: [],
            };
          }

          employeeMap[empId].skills.push({
            skill: skill.station_name || `Station ${skill.hierarchy}`,
            skill_level: skill.skill_level || 'Unknown',
            start_date: skill.start_date
              ? new Date(skill.start_date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })
              : 'N/A',
            status: finalStatus,
            notes: skill.remarks || '',
            station: skill.station_name,
          });
        });

        setAllEmployees(Object.values(employeeMap));
        setStats({
          scheduled: scheduledCount,
          in_progress: inProgressCount,
          completed: completedCount,
          total: totalSkills,
        });

        console.log("📈 Stats:", {
          scheduled: scheduledCount,
          in_progress: inProgressCount,
          completed: completedCount,
          total: totalSkills,
        });

      } catch (err: any) {
        console.error("❌ Error fetching stats:", err);
        setError(err.message || 'Failed to fetch statistics');
        setStats({
          scheduled: 0,
          in_progress: 0,
          completed: 0,
          total: 0,
        });
        setAllEmployees([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [setStats, setAllEmployees]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Error Loading Statistics</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header & Filters */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Skill Scheduling Overview</h1>
          <p className="text-gray-600 text-lg">Monitor and track skill development across your organization</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label htmlFor="status-filter" className="block text-sm font-semibold mb-2">Filter by Status</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              <option value="all">🔍 All Status</option>
              <option value="scheduled">📅 Scheduled</option>
              <option value="in-progress">⚡ In Progress</option>
              <option value="completed">✅ Completed</option>
            </select>
          </div>
          <div>
            <label htmlFor="date-filter" className="block text-sm font-semibold mb-2">Filter by Date Range</label>
            <select
              id="date-filter"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              <option value="all-time">🕒 All Time</option>
              <option value="today">📍 Today</option>
              <option value="this-week">📊 This Week</option>
              <option value="this-month">📈 This Month</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Scheduled */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <div className="flex justify-between mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-2xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="rounded-lg">
                <span className="rounded-lg bg-blue-50 p-3 text-blue-700 text-xs font-semibold">PENDING</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Scheduled</h3>
            <p className="text-4xl font-bold text-blue-600 mb-3">{stats.scheduled || 0}</p>
            <p className="text-sm text-gray-600">Skills waiting to be started</p>
            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500" style={{ width: stats.total > 0 ? `${(stats.scheduled / stats.total) * 100}%` : '0%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{stats.total > 0 ? `${Math.round((stats.scheduled / stats.total) * 100)}%` : '0%'} of total</p>
          </div>

          {/* In Progress */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <div className="flex justify-between mb-4">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 rounded-2xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="rounded-lg">
                <span className="rounded-lg bg-yellow-50 p-3 text-yellow-700 text-xs font-semibold">ACTIVE</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">In Progress</h3>
            <p className="text-4xl font-bold text-yellow-600 mb-3">{stats.in_progress || 0}</p>
            <p className="text-sm text-gray-600">Skills currently in progress</p>
            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500" style={{ width: stats.total > 0 ? `${(stats.in_progress / stats.total) * 100}%` : '0%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{stats.total > 0 ? `${Math.round((stats.in_progress / stats.total) * 100)}%` : '0%'} of total</p>
          </div>

          {/* Completed */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <div className="flex justify-between mb-4">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-2xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="rounded-lg">
                <span className="rounded-lg bg-green-50 p-3 text-green-700 text-xs font-semibold">DONE</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Completed</h3>
            <p className="text-4xl font-bold text-green-600 mb-3">{stats.completed || 0}</p>
            <p className="text-sm text-gray-600">Successfully finished skills</p>
            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500" style={{ width: stats.total > 0 ? `${(stats.completed / stats.total) * 100}%` : '0%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}%` : '0%'} of total</p>
          </div>

          {/* Total */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <div className="flex justify-between mb-4">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 rounded-2xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="rounded-lg">
                <span className="rounded-lg bg-purple-50 p-3 text-purple-700 text-xs font-semibold">TOTAL</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Total Skills</h3>
            <p className="text-4xl font-bold text-purple-600 mb-3">{stats.total || 0}</p>
            <p className="text-sm text-gray-600">All skills in the system</p>
            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500" style={{ width: '100%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{stats.scheduled + stats.in_progress + stats.completed} allocated</p>
          </div>
        </div>

        {/* Pass employees and filters to MultiSkillingList */}
        <MultiSkillingList
          employees={allEmployees}
          statusFilter={statusFilter}
          dateFilter={dateFilter}
        />
      </div>
    </div>
  );
};

export default Overview;