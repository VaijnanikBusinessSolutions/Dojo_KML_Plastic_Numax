



import React, { useState, useEffect, useMemo } from "react";
import { RetrainingSheet } from "./components/RetrainingSheet";
import { ScheduledList } from "./components/ScheduledList";
import { RetrainingFormModal } from "./components/RetrainingFormModal";
import { SchedulingModal } from "./components/SchedulingModal";
import { SearchAndFilter } from "./components/SearchAndFilter";
import type { Employee, Department } from "./types/Employee";
import retrainingApi from "./services/retrainingApi";
import { GraduationCap, AlertCircle } from "lucide-react";

function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [evaluationFilter, setEvaluationFilter] = useState("");
  // const [statusFilter, setStatusFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "scheduled">(
    "pending"
  );
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);
  const [isRetrainingModalOpen, setIsRetrainingModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const evaluationTypes = useMemo(() => ["Evaluation", "OJT", "10 Cycle"], []);

 
  useEffect(() => {
    loadInitialData();
  }, []);

  // Apply filters when data changes
  useEffect(() => {
    applyFilters();
  }, [employees, searchTerm, departmentFilter, evaluationFilter]);

  const loadInitialData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load failed employees and departments in parallel
      const [employeesResponse, departmentsData] = await Promise.all([
        retrainingApi.getFailedEmployees(),
        retrainingApi.getDepartments(),
      ]);

      // Validate and clean employee data
      const validEmployees = employeesResponse.results.filter(emp => {
        const isValid = emp.employee_pk && 
                       emp.level_id && 
                       emp.department_id && 
                       emp.evaluation_type;
        
        if (!isValid) {
          console.warn(`Invalid employee data for ${emp.employee_name}:`, {
            employee_pk: emp.employee_pk,
            level_id: emp.level_id,
            department_id: emp.department_id,
            evaluation_type: emp.evaluation_type
          });
        }
        
        return isValid;
      });

      console.log(`Loaded ${validEmployees.length} valid employees out of ${employeesResponse.results.length} total`);

      setEmployees(validEmployees);
      setDepartments(departmentsData);

      
      console.log("Fetched employees:", validEmployees);
      console.log("Fetched departments:", departmentsData);
      console.log("Raw API response:", employeesResponse);

    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load retraining data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...employees];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (emp) =>
          emp.employee_name.toLowerCase().includes(searchLower) ||
          emp.employee_id.toLowerCase().includes(searchLower)
      );
    }

    // Department filter
    if (departmentFilter) {
      filtered = filtered.filter(
        (emp) => emp.department_id.toString() === departmentFilter
      );
    }

    // Evaluation type filter
    if (evaluationFilter) {
      filtered = filtered.filter(
        (emp) => emp.evaluation_type === evaluationFilter
      );
    }

    // Status filter
    // if (statusFilter) {
    //   filtered = filtered.filter(
    //     (emp) => emp.retraining_status === statusFilter
    //   );
    // }

    setFilteredEmployees(filtered);
  };

  const handleRefreshData = async () => {
    await loadInitialData();
  };

  const handleOpenScheduleModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsSchedulingModalOpen(true);
  };

  const handleOpenRetrainingForm = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsRetrainingModalOpen(true);
  };

  const handleSaveRetrainingSession = async (
  employeeId: string,
  updateData: {
    observations_failure_points: string;
    trainer_name: string;
    performance_percentage?: number;
    status?: 'Completed' | 'Missed';
    required_percentage?: number;
  }
) => {
  try {
    console.log('Starting session update for employee:', employeeId);
    
    // Find the employee in our current data
    const employee = employees.find(emp => emp.employee_id === employeeId);
    if (!employee) {
      throw new Error(`Employee not found with ID: ${employeeId}`);
    }
    
    console.log('Employee data:', {
      employee_id: employee.employee_id,
      employee_pk: employee.employee_pk,
      name: employee.employee_name
    });

    // Try the direct employee sessions endpoint
    try {
      console.log('Trying direct employee sessions endpoint...');
      const employeeSessionsResponse = await retrainingApi.getEmployeeSessions(employeeId);
      
      if (employeeSessionsResponse.sessions && employeeSessionsResponse.sessions.length > 0) {
        // Sort by created_at to get most recent
        const sortedSessions = employeeSessionsResponse.sessions.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const mostRecentSession = sortedSessions[0];
        
        console.log('Found session via employee endpoint:', mostRecentSession.id);
        
        // Update the session
        if (updateData.performance_percentage !== undefined || updateData.status) {
          await retrainingApi.completeRetrainingSession(mostRecentSession.id, {
            status: updateData.status || 'Completed',
            performance_percentage: updateData.performance_percentage,
            required_percentage: updateData.required_percentage || employee.required_percentage,
            observations_failure_points: updateData.observations_failure_points,
            trainer_name: updateData.trainer_name
          });
        } else {
          await retrainingApi.updateRetrainingSessionObservations(mostRecentSession.id, {
            observations_failure_points: updateData.observations_failure_points,
            trainer_name: updateData.trainer_name
          });
        }
        
        console.log('Session updated successfully');
        await loadInitialData();
        return;
      }
    } catch (error) {
      console.log('Employee sessions endpoint failed:', error);
    }

    // Get all sessions and try multiple matching strategies
    console.log('Trying to find session via all sessions endpoint...');
    const allSessions = await retrainingApi.getRetrainingSessions();
    console.log('Total sessions available:', allSessions.length);
    
    let employeeSessions = [];
    
    // Match by employee_pk if it exists
    if (employee.employee_pk) {
      employeeSessions = allSessions.filter(session => 
        session.employee === employee.employee_pk
      );
      console.log(`Found ${employeeSessions.length} sessions matching employee_pk: ${employee.employee_pk}`);
    }
    
    // If no match by PK, try matching by employee_id (in case backend uses string ID)
    if (employeeSessions.length === 0) {
      employeeSessions = allSessions.filter(session => 
        session.employee === employeeId || session.employee === parseInt(employeeId)
      );
      console.log(`Found ${employeeSessions.length} sessions matching employee_id: ${employeeId}`);
    }
    
    // Match by employee name as last resort
    if (employeeSessions.length === 0) {
      const normalizedEmployeeName = employee.employee_name?.trim().toLowerCase();
      employeeSessions = allSessions.filter(session => {
        const sessionEmployeeName = session.employee_name?.trim().toLowerCase();
        return sessionEmployeeName === normalizedEmployeeName;
      });
      console.log(`Found ${employeeSessions.length} sessions matching employee name: ${employee.employee_name}`);
    }
    
    if (employeeSessions.length === 0) {
      // Log available sessions for debugging
      console.log('No sessions found. Available sessions:');
      allSessions.slice(0, 5).forEach((session, index) => {
        console.log(`Session ${index}:`, {
          id: session.id,
          employee: session.employee,
          employee_name: session.employee_name,
          evaluation_type: session.evaluation_type,
          status: session.status
        });
      });
      
      throw new Error(
        `No retraining session found for employee ${employeeId} (${employee.employee_name}). ` +
        `Please schedule a retraining session first. ` +
        `Employee PK: ${employee.employee_pk}, Total sessions in system: ${allSessions.length}`
      );
    }

    // Get the most recent session
    const mostRecentSession = employeeSessions.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
    
    console.log('Using session:', {
      id: mostRecentSession.id,
      attempt_no: mostRecentSession.attempt_no,
      status: mostRecentSession.status,
      created_at: mostRecentSession.created_at
    });
    
    // Update the session
    if (updateData.performance_percentage !== undefined || updateData.status) {
      await retrainingApi.completeRetrainingSession(mostRecentSession.id, {
        status: updateData.status || 'Completed',
        performance_percentage: updateData.performance_percentage,
        required_percentage: updateData.required_percentage || employee.required_percentage,
        observations_failure_points: updateData.observations_failure_points,
        trainer_name: updateData.trainer_name
      });
    } else {
      await retrainingApi.updateRetrainingSessionObservations(mostRecentSession.id, {
        observations_failure_points: updateData.observations_failure_points,
        trainer_name: updateData.trainer_name
      });
    }

    console.log('Session updated successfully');
    await loadInitialData();
    
  } catch (error) {
    console.error("Error updating retraining session:", error);
    throw error;
  }
};



  // Corrected the session data structure to match API expectations
  const handleSaveScheduling = async (
    employeeId: string,
    scheduledDate: string,
    scheduledTime: string,
    venue: string
  ) => {
    if (!selectedEmployee) {
      console.error("No selected employee found");
      setError("No employee selected for scheduling");
      return;
    }

    if (!selectedEmployee.employee_pk) {
      console.error("Selected employee missing employee_pk");
      setError("Employee data is incomplete. Please refresh and try again.");
      return;
    }

    const employee = selectedEmployee;

    // Create session data with the structure expected by the API
    const sessionData = {
      employee_pk: employee.employee_pk,        
      level_id: employee.level_id,             
      department_id: employee.department_id,    
      station_id: employee.station_id,          
      evaluation_type: employee.evaluation_type,
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      venue: venue,
      required_percentage: employee.required_percentage
    };

    console.log("Sending session data:", sessionData); // Debug log

    try {
      // Use the correct API method that handles field mapping
      await retrainingApi.createRetrainingSession(sessionData);
      await loadInitialData();
      setIsSchedulingModalOpen(false);
      setSelectedEmployee(null);
      setError(null); // Clear any previous errors
    } catch (error: any) {
      console.error("Error scheduling training:", error);
      setError(`Failed to schedule training session: ${error.message}`);
      // Don't close the modal so user can try again
    }
  };

  const pendingEmployees = filteredEmployees.filter(
    (emp) =>
      emp.retraining_status === "pending" || emp.retraining_status === "failed"
  );

  const scheduledEmployees = filteredEmployees.filter(
    (emp) =>
      emp.retraining_status === "scheduled" ||
      emp.retraining_status === "completed"
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading retraining data...</p>
        </div>
      </div>
    );
  }

  if (error && employees.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefreshData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-2">
      {/* Header */}
      <div className="flex justify-center mb-8">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Retraining Management
          </h1>
          <p className="text-sm text-gray-500">Employee Skills Development</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Banner - Show at top if there's an error but data is still available */}
        {error && employees.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div className="flex-1">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("pending")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "pending"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Pending Retraining
                <span className="ml-2 bg-amber-100 text-amber-800 py-0.5 px-2.5 rounded-full text-xs font-medium">
                  {pendingEmployees.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("scheduled")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "scheduled"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Scheduled Sessions
                <span className="ml-2 bg-green-100 text-green-800 py-0.5 px-2.5 rounded-full text-xs font-medium">
                  {scheduledEmployees.length}
                </span>
              </button>
            </nav>
          </div>

          {/* Refresh Button */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
              <button
                onClick={handleRefreshData}
                disabled={isLoading}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Refreshing..." : "Refresh Data"}
              </button>
            </div>
          </div>
        </div>

        {activeTab === "pending" ? (
          <>
            <SearchAndFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              departmentFilter={departmentFilter}
              onDepartmentChange={setDepartmentFilter}
              evaluationFilter={evaluationFilter}
              onEvaluationChange={setEvaluationFilter}
              // statusFilter={statusFilter}
              // onStatusChange={setStatusFilter}
              departments={departments}
              evaluationTypes={evaluationTypes}
              isLoading={isLoading}
            />
            <RetrainingSheet
              employees={pendingEmployees}
              onOpenRetrainingForm={handleOpenRetrainingForm}
              onScheduleTraining={handleOpenScheduleModal}
              isLoading={isLoading}
            />
          </>
        ) : (
          <ScheduledList
            scheduledEmployees={scheduledEmployees}
            onOpenRetrainingForm={handleOpenRetrainingForm}
          />
        )}

        {/* Scheduling Modal */}
        {selectedEmployee && (
          <SchedulingModal
            employee={selectedEmployee}
            isOpen={isSchedulingModalOpen}
            onClose={() => {
              setIsSchedulingModalOpen(false);
              setSelectedEmployee(null);
              setError(null); 
            }}
            onSave={handleSaveScheduling}
          />
        )}

        {/* Retraining Form Modal */}
        {selectedEmployee && (
          <RetrainingFormModal
            employee={selectedEmployee}
            isOpen={isRetrainingModalOpen}
            onClose={() => {
              setIsRetrainingModalOpen(false);
              setSelectedEmployee(null);
            }}
            onSave={handleSaveRetrainingSession}
          />
        )}
      </div>
    </div>
  );
}

export default App;