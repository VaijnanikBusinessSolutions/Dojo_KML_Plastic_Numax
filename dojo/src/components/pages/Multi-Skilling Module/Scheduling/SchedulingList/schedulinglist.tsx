import React, { useEffect, useState } from 'react';
import { User, Calendar, Award, AlertTriangle } from 'lucide-react';

// line ~4
const formatSkillLevel = (level: any): string => {
  if (typeof level === "string") return level.replace(/_/g, " ").trim();
  if (typeof level === "number" && Number.isFinite(level)) return `L${level}`;
  if (level && typeof level === "object") {
    const v = (level as any).name ?? (level as any).label ?? (level as any).value;
    return v != null ? formatSkillLevel(v) : "—";
  }
  return "—";
};


const formatDate = (dateString: string) =>
  dateString && dateString !== 'N/A'
    ? new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    : 'N/A';

interface MultiSkillingListProps {
  employees: any[];
  statusFilter: string;
  dateFilter: string;
}

const MultiSkillingList: React.FC<MultiSkillingListProps> = ({
  employees,
  statusFilter,
  dateFilter,
}) => {
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);

  React.useEffect(() => {
    if (!employees || !Array.isArray(employees)) {
      setFilteredEmployees([]);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filtered = employees
      .map(emp => {
        // Defensive: ensure employee name exists
        const employeeName = emp.full_name || emp.name || 'Unnamed Employee';

        const skills = Array.isArray(emp.skills) ? emp.skills : [];
        const filteredSkills = skills.filter(skill => {
          const statusOK = statusFilter === 'all' || (skill.status && skill.status.toLowerCase() === statusFilter.toLowerCase());
          let dateOK = true;

          if (dateFilter !== 'all-time' && skill.start_date && skill.start_date !== 'N/A') {
            const skillStartDate = new Date(skill.start_date);
            skillStartDate.setHours(0, 0, 0, 0);

            switch (dateFilter) {
              case 'today':
                dateOK = skillStartDate.getTime() === today.getTime();
                break;
              case 'this-week': {
                const dayOfWeek = today.getDay();
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - dayOfWeek);
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                dateOK = skillStartDate >= startOfWeek && skillStartDate <= endOfWeek;
                break;
              }
              case 'this-month':
                dateOK = skillStartDate.getFullYear() === today.getFullYear() && skillStartDate.getMonth() === today.getMonth();
                break;
              default:
                dateOK = true;
            }
          }
          return statusOK && dateOK;
        });

        return { ...emp, full_name: employeeName, skills: filteredSkills };
      })
      .filter(emp => emp.skills.length > 0);

    setFilteredEmployees(filtered);
  }, [employees, statusFilter, dateFilter]);

  if (!employees || employees.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Award className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Multi-Skilling Data Found</h3>
          <p className="text-gray-600">No skill assignments have been created yet.</p>
        </div>
      </div>
    );
  }

  if (filteredEmployees.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Matching Skills</h3>
          <p className="text-gray-600">No skills match the selected filters.</p>
          <p className="text-sm text-gray-500 mt-2">Try adjusting your filters to see more results.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Multi-Skilling Allocations
            </h1>
          </div>
          <p className="text-gray-600 ml-14">
            Total employees: {filteredEmployees.length} | Total skills: {filteredEmployees.reduce((sum, emp) => sum + emp.skills.length, 0)}
          </p>
        </div>

        {/* Employee Cards */}
        <div className="space-y-6">
          {filteredEmployees.map(employee => (
            <div
              key={employee.employee_id}
              className="group bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {/* Employee Header */}
              <div className="bg-gradient-to-r from-slate-50 to-white border-b border-gray-100 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <User className="w-8 h-8 text-white" />
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{employee.full_name}</h3>
                      <div className="flex items-center gap-4 mb-1">
                        <p className="text-sm text-gray-500">ID: {employee.card_no || employee.employee_id}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm mb-2">
                        {employee.department && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                            {employee.department}
                          </span>
                        )}
                        {employee.section && employee.section !== employee.department && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600">{employee.section}</span>
                          </>
                        )}
                        {employee.department_code && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600">Code: {employee.department_code}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-500">Joined: {employee.joining_date}</span>
                        </div>
                        {employee.employment_pattern && (
                          <>
                            <span className="text-gray-300">|</span>
                            <span className="text-gray-500">Pattern: {employee.employment_pattern}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-gray-500" />
                  <h4 className="font-semibold text-gray-800">Multi-Skills</h4>
                  <span className="text-sm text-gray-500">({employee.skills.length} skills)</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent ml-2"></div>
                </div>

                {employee.skills.length ? (
                  <div className="grid grid-cols-1 gap-4">
                    {employee.skills.map((skill: any, index: number) => {
                      let cardBgColor = 'bg-gray-50';
                      let cardBorderColor = 'border-gray-200';

                      if (skill.status) {
                        switch (skill.status.toLowerCase()) {
                          case 'completed':
                            cardBgColor = 'bg-green-50';
                            cardBorderColor = 'border-green-200';
                            break;
                          case 'in-progress':
                            cardBgColor = 'bg-blue-50';
                            cardBorderColor = 'border-blue-200';
                            break;
                          case 'scheduled':
                            cardBgColor = 'bg-yellow-50';
                            cardBorderColor = 'border-yellow-200';
                            break;
                          default:
                            cardBgColor = 'bg-gray-50';
                            cardBorderColor = 'border-gray-200';
                        }
                      }

                      return (
                        <div
                          key={index}
                          className={`relative p-4 rounded-xl border-2 ${cardBorderColor} ${cardBgColor} transition-all duration-200 hover:shadow-md`}
                        >
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              {/* Skill name */}
                              <span className="font-semibold text-gray-800">
                                {skill.skill || skill.station || '(No Skill Name)'}
                              </span>

                              {skill.status && (
                                <span
                                  className={`text-xs px-3 py-1 rounded-full font-medium ${skill.status.toLowerCase() === 'completed'
                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                    : skill.status.toLowerCase() === 'in-progress'
                                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                      : skill.status.toLowerCase() === 'scheduled'
                                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                                    }`}
                                >
                                  {skill.status}
                                </span>
                              )}
                            </div>

                            <div className="flex gap-6 flex-wrap items-center text-xs text-gray-600">
                              <span>
                                <Award className="inline-block w-4 h-4 mr-1 -mt-1" />
                                Level: {formatSkillLevel(skill.skill_level)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <div className="flex items-center gap-4">
                                <p className="text-xs text-gray-500">Start: {formatDate(skill.start_date)}</p>
                              </div>
                            </div>

                            {skill.notes && (
                              <div className="flex items-start gap-2">
                                <svg
                                  className="w-4 h-4 text-gray-500 mt-0.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                                <p className="text-xs text-gray-600">Notes: {skill.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No multi-skills found for this employee
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Last updated: {formatDate(new Date().toISOString())}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MultiSkillingList;