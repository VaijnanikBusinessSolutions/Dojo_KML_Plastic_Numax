import { useState, useEffect } from 'react';
import AddSkill from '../addSkill/addSkill';

// Interface for skills from SkillMatrix (comes with /employee-skill-search/)
interface Skill {
  skill_id: number;
  station: string;
  department: string;
  level: string;
  updated_at: string;
}

// Interface for the completed skills from /multiskilling/ (for tracking/assignments if needed)
interface Multiskill {
  id: number;
  employee_name: string;
  station_name: string;
  skill_level: string;
  start_date: string;
  remarks: string;
  status: string;
  current_status: string;
  employee: number;
  hierarchy: number;
  created_at: string;
  updated_at: string;
}

// Interface for the main employee object
interface Employee {
  emp_id: string;
  first_name: string;
  last_name: string;
  department: string | null;
  date_of_joining: string;
  skills: Skill[];
}


interface NotificationState {
    message: string;
    type: 'success' | 'error';
}



const EmployeeSearch = () => {
  // State for employee search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // State for multiskilling tracking (kept in case you want assignments later)
  const [multiskillingSkills, setMultiskillingSkills] = useState<Multiskill[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillsError, setSkillsError] = useState('');

  const [notification, setNotification] = useState<NotificationState | null>(null);


  // Function to handle the initial search for employees
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.length >= 2) {
      try {
        setIsLoading(true);
        const response = await fetch(
          `http://127.0.0.1:8000/employee-skill-search/?query=${encodeURIComponent(term)}`
        );

        if (response.ok) {
          const data: Employee[] = await response.json();
          setFilteredEmployees(data);
          setError(data.length ? '' : 'No matching employees found');
        } else {
          setFilteredEmployees([]);
          setError('Error searching for employees');
        }
      } catch (err) {
        console.error('Error searching employees:', err);
        setError('Error searching for employees');
        setFilteredEmployees([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setFilteredEmployees([]);
      setError(term.length ? 'Type at least 2 characters' : '');
    }
  };

  // Function to handle selecting an employee from the search results
  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSearchTerm(`${employee.first_name} ${employee.last_name}`);
    setFilteredEmployees([]);
  };

  const fetchAllEmployeeSkills = async (employeeId: string) => {
    // Set loading states for both sections
    setSkillsLoading(true);
    setSkillsError('');

    try {
        // Use Promise.all to fetch both data points concurrently
        const [assignedSkillsRes, completedSkillsRes] = await Promise.all([
            fetch(`http://127.0.0.1:8000/multiskilling/?emp_id=${employeeId}`),
            fetch(`http://127.0.0.1:8000/employee-skill-search/?query=${encodeURIComponent(employeeId)}`)
        ]);

        // Handle Assigned Skills
        if (assignedSkillsRes.ok) {
            const assignedData: Multiskill[] = await assignedSkillsRes.json();
            setMultiskillingSkills(assignedData);
        } else {
            setSkillsError('Could not fetch assigned skills.');
        }

        // Handle Completed Skills (refreshing the main employee object)
        if (completedSkillsRes.ok) {
            const employeeData: Employee[] = await completedSkillsRes.json();
            if (employeeData.length > 0) {
                setSelectedEmployee(employeeData[0]); // Update state with fresh data
            }
        } else {
            console.error("Failed to refresh employee's completed skills.");
        }

    } catch (err) {
        console.error('Error fetching employee skills data:', err);
        setSkillsError('A network error occurred while fetching skill data.');
    } finally {
        setSkillsLoading(false);
    }
  };


  // Multiskilling fetch for assignment history
  useEffect(() => {
    const fetchMultiskillingData = async (employeeId: string) => {
      setSkillsLoading(true);
      setSkillsError('');
      setMultiskillingSkills([]);

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/multiskilling/?emp_id=${employeeId}`
        );

        if (response.ok) {
          const filteredSkills: Multiskill[] = await response.json();
          setMultiskillingSkills(filteredSkills);
        } else {
          setSkillsError('Could not fetch assigned skills for this employee.');
        }
      } catch (err) {
        console.error('Error fetching multiskilling data:', err);
        setSkillsError('A network error occurred while fetching assigned skills.');
      } finally {
        setSkillsLoading(false);
      }
    };

    if (selectedEmployee) {
      fetchMultiskillingData(selectedEmployee.emp_id);
    } else {
      setMultiskillingSkills([]);
    }
  }, [selectedEmployee]);

  const handleSkillAdded = async () => {
    // A. Show a success notification
    setNotification({ message: 'Skill allocated successfully!', type: 'success' });
    setTimeout(() => setNotification(null), 5000); // Hide after 5 seconds

    // B. Refresh the employee's data to update the UI
    if (selectedEmployee) {
      // We already have a function for this!
      await fetchAllEmployeeSkills(selectedEmployee.emp_id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Employee Skill Management</h1>
          <p className="text-gray-600 text-lg">Search and manage employee skills</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by employee name or ID..."
              className="w-full p-4 pl-12 bg-white border-2 border-red-200 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-red-300 focus:border-red-500 transition-all duration-300 text-xl"
              value={searchTerm}
              onChange={handleSearch}
            />
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-400 w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {isLoading && (
            <div className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl overflow-hidden p-4">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            </div>
          )}
          {error && !isLoading && (
            <div className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl overflow-hidden p-4 text-red-500">
              {error}
            </div>
          )}
          {filteredEmployees.length > 0 && !isLoading && (
            <ul className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
              {filteredEmployees.map(emp => (
                <li
                  key={emp.emp_id}
                  className="p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-0"
                  onClick={() => handleEmployeeSelect(emp)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">{emp.first_name} {emp.last_name}</span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{emp.department || 'No department'}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">ID: {emp.emp_id}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Employee Details and AddSkill section */}
        {selectedEmployee && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Employee Information Card */}
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Employee Information</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                    <span className="font-semibold text-gray-700 w-32">Name :</span>
                    <span className="text-gray-800 font-medium">{selectedEmployee.first_name} {selectedEmployee.last_name}</span>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                    <span className="font-semibold text-gray-700 w-32">Employee ID :</span>
                    <span className="text-gray-800 font-medium">{selectedEmployee.emp_id}</span>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                    <span className="font-semibold text-gray-700 w-32">Department :</span>
                    <span className="text-gray-800 font-medium">{selectedEmployee.department || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                    <span className="font-semibold text-gray-700 w-32">Join Date :</span>
                    <span className="text-gray-800 font-medium">{selectedEmployee.date_of_joining}</span>
                  </div>
                </div>
              </div>

              {/* Current Skills Card */}
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Current Skills</h3>
                    <p className="text-sm text-gray-600">Skills mastered by this employee</p>
                  </div>
                </div>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {selectedEmployee.skills.length > 0 ? (
                    selectedEmployee.skills.map((s) => (
                      <div key={s.skill_id} className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-l-4 border-green-500 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-bold text-gray-800 text-lg">{s.station}</p>
                          <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                            {s.level}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Department: {s.department}</p>
                        <p className="text-sm text-gray-600">Updated: {new Date(s.updated_at).toLocaleDateString()}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">No current skills found</p>
                      <p className="text-gray-400 text-sm mt-1">This employee hasn't completed any skills yet.</p>
                    </div>
                  )}
                </div>
                {selectedEmployee.skills.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Current Skills:</span>
                      <span className="font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">{selectedEmployee.skills.length}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Multiskilling Assignments Card */}
            {multiskillingSkills.length > 0 && (
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-r from-orange-500 to-yellow-600 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Assigned Skills</h3>
                    <p className="text-sm text-gray-600">Skills assigned for training/development</p>
                  </div>
                </div>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {multiskillingSkills.map((skill) => (
                    <div key={skill.id} className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-xl border-l-4 border-orange-500 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-gray-800 text-lg">{skill.station_name}</p>
                        <div className="flex items-center space-x-2">
                          <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded-full">
                            {skill.skill_level}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            skill.current_status === 'completed' ? 'bg-green-100 text-green-800' :
                            skill.current_status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {skill.current_status}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">Start Date: {skill.start_date}</p>
                      {skill.remarks && (
                        <p className="text-sm text-gray-600 mt-1">Remarks: {skill.remarks}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AddSkill component */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-purple-500 to-red-600 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Add New Skill</h3>
              </div>
              <AddSkill
                employeeID={selectedEmployee.emp_id}
                employee={selectedEmployee}
                onSkillAdded={handleSkillAdded}
              />

              {notification && (
                <div
                  className={`mt-6 flex items-center justify-between p-4 rounded-xl shadow-lg text-white transition-all duration-300 ${
                    notification.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600'
                  }`}
                >
                  <div className="flex items-center">
                    {notification.type === 'success' ? (
                      <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    ) : (
                      <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                    <span className="font-medium">{notification.message}</span>
                  </div>
                  <button onClick={() => setNotification(null)} className="ml-4 p-1 rounded-full hover:bg-white/20 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                  </button>
                </div>
              )}

              
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeSearch;