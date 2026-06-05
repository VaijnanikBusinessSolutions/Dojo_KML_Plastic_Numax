// import type { 
//   Employee, 
//   RetrainingSession, 
//   RetrainingConfig, 
//   RetrainingSummary,
//   ApiResponse,
//   Department,
//   Level,
//   Station
// } from '../types/Employee';

// const BASE_URL = 'http://172.25.0.51:8000';

// class RetrainingApiService {
//   private async fetchWithErrorHandling<T>(url: string, options?: RequestInit): Promise<T> {
//     try {
//       const response = await fetch(`${BASE_URL}${url}`, {
//         headers: {
//           'Content-Type': 'application/json',
//           ...options?.headers,
//         },
//         ...options,
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.error || errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
//       }

//       return await response.json();
//     } catch (error) {
//       console.error(`API Error for ${url}:`, error);
//       throw error;
//     }
//   }

//   // Failed employees endpoints
//   async getFailedEmployees(filters?: {
//     department_id?: number;
//     evaluation_type?: string;
//     status?: string;
//   }): Promise<ApiResponse<Employee>> {
//     const params = new URLSearchParams();
//     if (filters?.department_id) params.append('department_id', filters.department_id.toString());
//     if (filters?.evaluation_type) params.append('evaluation_type', filters.evaluation_type);
//     if (filters?.status) params.append('status', filters.status);

//     const queryString = params.toString();
//     const url = `/retraining-sessions/failed-employees/${queryString ? `?${queryString}` : ''}`;
    
//     return this.fetchWithErrorHandling<ApiResponse<Employee>>(url);
//   }

//   // Retraining session endpoints 
//   async getRetrainingSessions(filters?: {
//     employee_id?: string;
//     department_id?: number;
//     evaluation_type?: string;
//     status?: string;
//   }): Promise<RetrainingSession[]> {
//     const params = new URLSearchParams();
//     if (filters?.employee_id) params.append('employee_id', filters.employee_id);
//     if (filters?.department_id) params.append('department_id', filters.department_id.toString());
//     if (filters?.evaluation_type) params.append('evaluation_type', filters.evaluation_type);
//     if (filters?.status) params.append('status', filters.status);

//     const queryString = params.toString();
//     const url = `/retraining-sessions/${queryString ? `?${queryString}` : ''}`;
    
//     // Backend returns paginated response
//     const response = await this.fetchWithErrorHandling<{results: RetrainingSession[]}>(url);
//     return response.results || [];
//   }

//   // Create retraining session with proper field mapping
//   async createRetrainingSession(sessionData: {
//     employee_pk: number; 
//     level_id: number;
//     department_id: number;
//     station_id: number | null;
//     evaluation_type: string;
//     scheduled_date: string;
//     scheduled_time: string;
//     venue: string;
//     required_percentage: number;
//   }): Promise<RetrainingSession> {
//     // Map frontend fields to backend fields
//     const backendData = {
//       employee: sessionData.employee_pk,
//       level: sessionData.level_id,         
//       department: sessionData.department_id,
//       station: sessionData.station_id,   
//       evaluation_type: sessionData.evaluation_type,
//       scheduled_date: sessionData.scheduled_date,
//       scheduled_time: sessionData.scheduled_time,
//       venue: sessionData.venue,
//       required_percentage: sessionData.required_percentage,
//       status: 'Pending' 
//     };

//     return this.fetchWithErrorHandling<RetrainingSession>('/retraining-sessions/', {
//       method: 'POST',
//       body: JSON.stringify(backendData),
//     });
//   }

//   async updateRetrainingSession(id: number, sessionData: Partial<RetrainingSession>): Promise<RetrainingSession> {
//     return this.fetchWithErrorHandling<RetrainingSession>(`/retraining-sessions/${id}/`, {
//       method: 'PATCH',
//       body: JSON.stringify(sessionData),
//     });
//   }

//   async deleteRetrainingSession(id: number): Promise<void> {
//     return this.fetchWithErrorHandling<void>(`/retraining-sessions/${id}/`, {
//       method: 'DELETE',
//     });
//   }

//   // Complete session with results and observations 
//   async completeRetrainingSession(
//     sessionId: number,
//     completionData: {
//       status: 'Completed' | 'Missed';
//       performance_percentage?: number;
//       required_percentage?: number;
//       observations_failure_points?: string;
//       trainer_name?: string;
//     }
//   ): Promise<RetrainingSession> {
//     return this.fetchWithErrorHandling<RetrainingSession>(
//       `/retraining-sessions/${sessionId}/complete-session/`,
//       {
//         method: 'PATCH',
//         body: JSON.stringify(completionData),
//       }
//     );
//   }

//   // Update only observations and trainer info
//   async updateRetrainingSessionObservations(
//     sessionId: number,
//     observationData: {
//       observations_failure_points?: string;
//       trainer_name?: string;
//     }
//   ): Promise<RetrainingSession> {
//     return this.fetchWithErrorHandling<RetrainingSession>(
//       `/retraining-sessions/${sessionId}/update-observations/`,
//       {
//         method: 'PATCH',
//         body: JSON.stringify(observationData),
//       }
//     );
//   }

//   // Retraining config endpoints
//   async getRetrainingConfigs(filters?: {
//     level_id?: number;
//     evaluation_type?: string;
//   }): Promise<RetrainingConfig[]> {
//     const params = new URLSearchParams();
//     if (filters?.level_id) params.append('level_id', filters.level_id.toString());
//     if (filters?.evaluation_type) params.append('evaluation_type', filters.evaluation_type);

//     const queryString = params.toString();
//     const url = `/retraining-configs/${queryString ? `?${queryString}` : ''}`;
    
//     // Handle potential pagination
//     const response = await this.fetchWithErrorHandling<RetrainingConfig[] | {results: RetrainingConfig[]}>(url);
//     return Array.isArray(response) ? response : (response.results || []);
//   }

//   async createRetrainingConfig(configData: Omit<RetrainingConfig, 'id' | 'created_at' | 'updated_at'>): Promise<RetrainingConfig> {
//     return this.fetchWithErrorHandling<RetrainingConfig>('/retraining-configs/', {
//       method: 'POST',
//       body: JSON.stringify(configData),
//     });
//   }

//   async updateRetrainingConfig(id: number, configData: Partial<RetrainingConfig>): Promise<RetrainingConfig> {
//     return this.fetchWithErrorHandling<RetrainingConfig>(`/retraining-configs/${id}/`, {
//       method: 'PATCH',
//       body: JSON.stringify(configData),
//     });
//   }

//   async deleteRetrainingConfig(id: number): Promise<void> {
//     return this.fetchWithErrorHandling<void>(`/retraining-configs/${id}/`, {
//       method: 'DELETE',
//     });
//   }

//   // Summary endpoint
//   async getRetrainingSummary(): Promise<RetrainingSummary> {
//     return this.fetchWithErrorHandling<RetrainingSummary>('/retraining-sessions/summary/');
//   }

//   // Lookup data endpoints to handle different response formats
//   async getDepartments(): Promise<Department[]> {
//     const response = await this.fetchWithErrorHandling<Department[] | {results: Department[]}>('/departments/');
//     return Array.isArray(response) ? response : (response.results || []);
//   }

//   async getLevels(): Promise<Level[]> {
//     const response = await this.fetchWithErrorHandling<Level[] | {results: Level[]}>('/levels/');
//     return Array.isArray(response) ? response : (response.results || []);
//   }

//   async getStations(): Promise<Station[]> {
//     const response = await this.fetchWithErrorHandling<Station[] | {results: Station[]}>('/stations/');
//     return Array.isArray(response) ? response : (response.results || []);
//   }

//   // Get specific employee sessions 
//   async getEmployeeSessions(employeeId: string): Promise<{
//     employee_id: string;
//     employee_name: string;
//     sessions: RetrainingSession[];
//   }> {
//     return this.fetchWithErrorHandling(`/retraining-sessions/employee-sessions/${employeeId}/`);
//   }

//   // Helper method to find employee PK by employee_id
//   async getEmployeeByIdWithPk(employeeId: string): Promise<Employee | null> {
//     try {
//       const response = await this.getFailedEmployees();
//       return response.results.find(emp => emp.employee_id === employeeId) || null;
//     } catch (error) {
//       console.error('Error fetching employee:', error);
//       return null;
//     }
//   }

//   // Method to check if employee can be scheduled for retraining
//   async canScheduleRetraining(
//     employeePk: number, 
//     levelId: number, 
//     evaluationType: string
//   ): Promise<{ canSchedule: boolean; reason?: string; attemptsUsed: number; maxAttempts: number }> {
//     try {
//       // Get existing sessions by employee PK
//       const sessions = await this.getRetrainingSessions();
//       const employeeSessions = sessions.filter(s => 
//         s.employee === employeePk && s.evaluation_type === evaluationType
//       );

//       // Get config for max attempts
//       const configs = await this.getRetrainingConfigs({
//         level_id: levelId,
//         evaluation_type: evaluationType
//       });

//       const maxAttempts = configs[0]?.max_count || 2;
//       const attemptsUsed = employeeSessions.length;

//       return {
//         canSchedule: attemptsUsed < maxAttempts,
//         reason: attemptsUsed >= maxAttempts ? `Maximum attempts (${maxAttempts}) reached` : undefined,
//         attemptsUsed,
//         maxAttempts
//       };
//     } catch (error) {
//       console.error('Error checking retraining eligibility:', error);
//       return {
//         canSchedule: false,
//         reason: 'Error checking eligibility',
//         attemptsUsed: 0,
//         maxAttempts: 2
//       };
//     }
//   }

//   // Helper method to schedule retraining with employee lookup
//   async scheduleRetrainingByEmployeeId(
//     employeeId: string,
//     schedulingData: {
//       scheduled_date: string;
//       scheduled_time: string;
//       venue: string;
//     }
//   ): Promise<RetrainingSession> {
//     // First, find the employee to get their PK and other details
//     const employee = await this.getEmployeeByIdWithPk(employeeId);
//     if (!employee) {
//       throw new Error(`Employee with ID ${employeeId} not found`);
//     }

//     // Create the session with the employee's PK
//     return this.createRetrainingSession({
//       employee_pk: employee.employee_pk,
//       level_id: employee.level_id,
//       department_id: employee.department_id,
//       station_id: employee.station_id,
//       evaluation_type: employee.evaluation_type,
//       required_percentage: employee.required_percentage,
//       ...schedulingData
//     });
//   }
// }

// // Create and export a singleton instance
// const retrainingApi = new RetrainingApiService();
// export default retrainingApi;

// // Export the class for testing purposes
// export { RetrainingApiService };


import type { 
  Employee, 
  RetrainingSession, 
  RetrainingConfig, 
  RetrainingSummary,
  ApiResponse,
  Department,
  Level,
  Station
} from '../types/Employee';

const BASE_URL = 'http://172.25.0.51:8000';

class RetrainingApiService {
  private async fetchWithErrorHandling<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${BASE_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error for ${url}:`, error);
      throw error;
    }
  }

  // Failed employees endpoints
  async getFailedEmployees(filters?: {
    department_id?: number;
    evaluation_type?: string;
    status?: string;
  }): Promise<ApiResponse<Employee>> {
    const params = new URLSearchParams();
    if (filters?.department_id) params.append('department_id', filters.department_id.toString());
    if (filters?.evaluation_type) params.append('evaluation_type', filters.evaluation_type);
    if (filters?.status) params.append('status', filters.status);

    const queryString = params.toString();
    const url = `/retraining-sessions/failed-employees/${queryString ? `?${queryString}` : ''}`;
    
    return this.fetchWithErrorHandling<ApiResponse<Employee>>(url);
  }

  // Retraining session endpoints 
  async getRetrainingSessions(filters?: {
    employee_id?: string;
    department_id?: number;
    evaluation_type?: string;
    status?: string;
  }): Promise<RetrainingSession[]> {
    const params = new URLSearchParams();
    if (filters?.employee_id) params.append('employee_id', filters.employee_id);
    if (filters?.department_id) params.append('department_id', filters.department_id.toString());
    if (filters?.evaluation_type) params.append('evaluation_type', filters.evaluation_type);
    if (filters?.status) params.append('status', filters.status);

    const queryString = params.toString();
    const url = `/retraining-sessions/${queryString ? `?${queryString}` : ''}`;
    
    // Backend returns paginated response
    const response = await this.fetchWithErrorHandling<{results: RetrainingSession[]}>(url);
    return response.results || [];
  }

  // Create retraining session with proper field mapping
  async createRetrainingSession(sessionData: {
    employee_pk: number; 
    level_id: number;
    department_id: number;
    station_id: number | null;
    evaluation_type: string;
    scheduled_date: string;
    scheduled_time: string;
    venue: string;
    required_percentage: number;
  }): Promise<RetrainingSession> {
    // Map frontend fields to backend fields
    const backendData = {
      employee: sessionData.employee_pk,
      level: sessionData.level_id,         
      department: sessionData.department_id,
      station: sessionData.station_id,   
      evaluation_type: sessionData.evaluation_type,
      scheduled_date: sessionData.scheduled_date,
      scheduled_time: sessionData.scheduled_time,
      venue: sessionData.venue,
      required_percentage: sessionData.required_percentage,
      status: 'Pending' 
    };

    return this.fetchWithErrorHandling<RetrainingSession>('/retraining-sessions/', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });
  }

  async updateRetrainingSession(id: number, sessionData: Partial<RetrainingSession>): Promise<RetrainingSession> {
    return this.fetchWithErrorHandling<RetrainingSession>(`/retraining-sessions/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(sessionData),
    });
  }

  async deleteRetrainingSession(id: number): Promise<void> {
    return this.fetchWithErrorHandling<void>(`/retraining-sessions/${id}/`, {
      method: 'DELETE',
    });
  }

  // Complete session with results and observations 
  async completeRetrainingSession(
    sessionId: number,
    completionData: {
      status: 'Completed' | 'Missed';
      performance_percentage?: number;
      required_percentage?: number;
      observations_failure_points?: string;
      trainer_name?: string;
    }
  ): Promise<RetrainingSession> {
    return this.fetchWithErrorHandling<RetrainingSession>(
      `/retraining-sessions/${sessionId}/complete-session/`,
      {
        method: 'PATCH',
        body: JSON.stringify(completionData),
      }
    );
  }

  // Update only observations and trainer info
  async updateRetrainingSessionObservations(
    sessionId: number,
    observationData: {
      observations_failure_points?: string;
      trainer_name?: string;
    }
  ): Promise<RetrainingSession> {
    return this.fetchWithErrorHandling<RetrainingSession>(
      `/retraining-sessions/${sessionId}/update-observations/`,
      {
        method: 'PATCH',
        body: JSON.stringify(observationData),
      }
    );
  }

  // Retraining config endpoints
  async getRetrainingConfigs(filters?: {
    level_id?: number;
    evaluation_type?: string;
  }): Promise<RetrainingConfig[]> {
    const params = new URLSearchParams();
    if (filters?.level_id) params.append('level_id', filters.level_id.toString());
    if (filters?.evaluation_type) params.append('evaluation_type', filters.evaluation_type);

    const queryString = params.toString();
    const url = `/retraining-configs/${queryString ? `?${queryString}` : ''}`;
    
    // Handle potential pagination
    const response = await this.fetchWithErrorHandling<RetrainingConfig[] | {results: RetrainingConfig[]}>(url);
    return Array.isArray(response) ? response : (response.results || []);
  }

  async createRetrainingConfig(configData: Omit<RetrainingConfig, 'id' | 'created_at' | 'updated_at'>): Promise<RetrainingConfig> {
    return this.fetchWithErrorHandling<RetrainingConfig>('/retraining-configs/', {
      method: 'POST',
      body: JSON.stringify(configData),
    });
  }

  async updateRetrainingConfig(id: number, configData: Partial<RetrainingConfig>): Promise<RetrainingConfig> {
    return this.fetchWithErrorHandling<RetrainingConfig>(`/retraining-configs/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(configData),
    });
  }

  async deleteRetrainingConfig(id: number): Promise<void> {
    return this.fetchWithErrorHandling<void>(`/retraining-configs/${id}/`, {
      method: 'DELETE',
    });
  }

  // Summary endpoint
  async getRetrainingSummary(): Promise<RetrainingSummary> {
    return this.fetchWithErrorHandling<RetrainingSummary>('/retraining-sessions/summary/');
  }

  // Lookup data endpoints to handle different response formats
  async getDepartments(): Promise<Department[]> {
    const response = await this.fetchWithErrorHandling<Department[] | {results: Department[]}>('/departments/');
    return Array.isArray(response) ? response : (response.results || []);
  }

  async getLevels(): Promise<Level[]> {
    const response = await this.fetchWithErrorHandling<Level[] | {results: Level[]}>('/levels/');
    return Array.isArray(response) ? response : (response.results || []);
  }

  async getStations(): Promise<Station[]> {
    const response = await this.fetchWithErrorHandling<Station[] | {results: Station[]}>('/stations/');
    return Array.isArray(response) ? response : (response.results || []);
  }

  // Get specific employee sessions 
  async getEmployeeSessions(employeeId: string): Promise<{
    employee_id: string;
    employee_name: string;
    sessions: RetrainingSession[];
  }> {
    return this.fetchWithErrorHandling(`/retraining-sessions/employee-sessions/${employeeId}/`);
  }

  // Helper method to find employee PK by employee_id
  async getEmployeeByIdWithPk(employeeId: string): Promise<Employee | null> {
    try {
      const response = await this.getFailedEmployees();
      return response.results.find(emp => emp.employee_id === employeeId) || null;
    } catch (error) {
      console.error('Error fetching employee:', error);
      return null;
    }
  }

  // Method to check if employee can be scheduled for retraining
  async canScheduleRetraining(
    employeePk: number, 
    levelId: number, 
    evaluationType: string
  ): Promise<{ canSchedule: boolean; reason?: string; attemptsUsed: number; maxAttempts: number }> {
    try {
      // Get existing sessions by employee PK
      const sessions = await this.getRetrainingSessions();
      const employeeSessions = sessions.filter(s => 
        s.employee === employeePk && s.evaluation_type === evaluationType
      );

      // Get config for max attempts
      const configs = await this.getRetrainingConfigs({
        level_id: levelId,
        evaluation_type: evaluationType
      });

      const maxAttempts = configs[0]?.max_count || 2;
      const attemptsUsed = employeeSessions.length;

      return {
        canSchedule: attemptsUsed < maxAttempts,
        reason: attemptsUsed >= maxAttempts ? `Maximum attempts (${maxAttempts}) reached` : undefined,
        attemptsUsed,
        maxAttempts
      };
    } catch (error) {
      console.error('Error checking retraining eligibility:', error);
      return {
        canSchedule: false,
        reason: 'Error checking eligibility',
        attemptsUsed: 0,
        maxAttempts: 2
      };
    }
  }

  // Helper method to schedule retraining with employee lookup
  async scheduleRetrainingByEmployeeId(
    employeeId: string,
    schedulingData: {
      scheduled_date: string;
      scheduled_time: string;
      venue: string;
    }
  ): Promise<RetrainingSession> {
    // First, find the employee to get their PK and other details
    const employee = await this.getEmployeeByIdWithPk(employeeId);
    if (!employee) {
      throw new Error(`Employee with ID ${employeeId} not found`);
    }

    // Create the session with the employee's PK
    return this.createRetrainingSession({
      employee_pk: employee.employee_pk,
      level_id: employee.level_id,
      department_id: employee.department_id,
      station_id: employee.station_id,
      evaluation_type: employee.evaluation_type,
      required_percentage: employee.required_percentage,
      ...schedulingData
    });
  }
}

// Create and export a singleton instance
const retrainingApi = new RetrainingApiService();
export default retrainingApi;

// Export the class for testing purposes
export { RetrainingApiService };