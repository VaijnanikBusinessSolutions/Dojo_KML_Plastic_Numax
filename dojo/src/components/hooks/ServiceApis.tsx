import axios from "axios";
import { API_ENDPOINTS } from "../constants/api";
import type { CheckData, CheckDataPayload, CheckDataResponse, CheckResults, Employee, PassingCriteria, Question, StationSettingPayload, SublineResponse } from "../constants/types";

export const saveUserInfo = async (formData: FormData) => {
  const response = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.TEMP_USER_INFO}`, {
    method: "POST",
    body: formData,
  });

  return response;
};


const convertStatus = (status: string): 'pass' | 'fail' | '' => {
  if (status === 'pass' || status === 'fail') {
    return status;
  }
  return '';
};

export const humanBodyCheckService = {
  // Fetch all questions from the API
  async fetchQuestions(): Promise<Question[]> {
    try {
      const url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.HUMAN_BODY_CHECKS.QUESTIONS}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      const questions = await response.json();
      return questions;
    } catch (error) {
      console.error('Failed to fetch questions', error);
      throw new Error('Failed to fetch questions');
    }
  },
  async submitQuestion(questionText: string): Promise<Question> {
    try {
      const url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.HUMAN_BODY_CHECKS.QUESTIONS}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question_text: questionText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.question_text ? errorData.question_text[0] : 'Failed to submit question');
      }

      const question = await response.json();
      return question;
    } catch (error) {
      console.error('Failed to submit question', error);
      throw error;
    }
  },

  async updateCheckData(payload: CheckDataPayload): Promise<void> {
    try {
      // --- THIS IS THE CORRECTED URL ---
      // Manually construct the correct RESTful URL for the update.
      // It should look like: /api/human-body-checks/TEMP12345/
      const url = `${API_ENDPOINTS.BASE_URL}/human-body-checks/${payload.temp_id}/`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update check data');
      }
    } catch (error) {
      console.error('Failed to update check data', error);
      throw error;
    }
  },


  async fetchCheckDataByTempId(tempId: string): Promise<CheckDataResponse[]> {
    try {
      const url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.HUMAN_BODY_CHECKS.GET_BY_TEMP_ID(tempId)}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      // --- START OF FIX ---

      // Get the response as text first to see if it's empty
      const responseText = await response.text();

      if (responseText) {
        // Only try to parse if the response text is not empty
        return JSON.parse(responseText);
      } else {
        // If the response is empty, it means no records were found. Return an empty array.
        return [];
      }

      // --- END OF FIX ---

    } catch (error) {
      console.error('Failed to fetch or parse existing check data by tempId', error);
      throw error; // Re-throw so the UI can handle it
    }
  },


  // Save check data with new format
  async saveCheckData(payload: CheckDataPayload): Promise<void> {
    try {
      const url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.HUMAN_BODY_CHECKS.CREATE}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save check data');
      }
    } catch (error) {
      console.error('Failed to save check data', error);
      throw error;
    }
  },

  // Alternative method: Convert CheckData to CheckResults format (if backend expects different format)
  // Convert CheckData to CheckResults format
  convertToCheckResults(tempId: string, checkData: CheckData): CheckResults {
    const answers: Array<{ question_id: number, status: '' | 'pass' | 'fail' }> = [];
    const additional_checks: Array<{ description: string, status: '' | 'pass' | 'fail' }> = [];

    Object.entries(checkData).forEach(([_, item]) => {
      if (item.question_id) {
        // This is a predefined question
        answers.push({
          question_id: item.question_id,
          status: item.status || ''
        });
      } else {
        // This is an additional custom check
        additional_checks.push({
          description: item.description,
          status: item.status || ''
        });
      }
    });

    return {
      temp_id: tempId,
      answers,
      additional_checks: additional_checks.length > 0 ? additional_checks : undefined,
      notes: ''
    };
  },

  // Alternative save method for CheckResults format
  async saveCheckResults(checkResults: CheckResults): Promise<void> {
    try {
      const url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.HUMAN_BODY_CHECKS.CREATE}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkResults)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save check data');
      }
    } catch (error) {
      console.error('Failed to save check data', error);
      throw error;
    }
  },

  fetchTempUsers: async () => {
    const response = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.TEMP_USER_INFO}`);
    if (!response.ok) throw new Error("Failed to fetch user info");
    return response.json();
  },

  // Check if user has existing assessment data
  checkUserAssessment: async (tempId: string) => {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.HUMAN_BODY_CHECKS.GET_BY_TEMP_ID(tempId)}`
    );
    return response.json();
  },
};




//Employee Master 



export const fetchEmployees = async (): Promise<Employee[]> => {
  try {
    // Now use the corrected BASE_URL
    const url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.EMPLOYEES}`;

    console.log('Fetching employees from:', url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // Ensure we return an array
    if (!Array.isArray(data)) {
      console.error('Expected array but got:', typeof data, data);
      throw new Error("Invalid data format received from server");
    }

    return data;
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to load employee data');
  }
};



//Departments

export const getDepartments = async () => {
  const response = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.DEPARTMENT}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching departments: ${response.statusText}`);
  }

  return response.json();
};


//Levels

export const getLevels = async () => {
  const response = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.LEVELS}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching levels: ${response.statusText}`);
  }

  return response.json();
};






//Training content fetch , post  and delete for the TrainingOptionsPage 

export const getTrainingContentsByLevelStation = async (levelId: number, stationId: number) => {
  const response = await fetch(
    `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.TRAINING_CONTENTS_BY_LEVEL_STATION}?level_id=${levelId}&station_id=${stationId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Error fetching training contents: ${response.statusText}`);
  }

  return response.json();
};

export const createTrainingContent = async (formData: FormData) => {
  const response = await fetch(
    `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.TRAINING_CONTENTS}`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`Error creating training content: ${response.statusText}`);
  }

  return response.json();
};

export const deleteTrainingContent = async (contentId: string) => {
  const response = await fetch(
    `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.TRAINING_CONTENTS}${contentId}/`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error(`Error deleting training content: ${response.statusText}`);
  }

  return response.ok;
};





/////////////////////////////////////////////////////////////////////////////////
// OJT 
export const ojtApi = {

  getStations: async () => {
    try {
      // Make sure you have an endpoint for STATIONS in your constants file
      // If not, you can replace API_ENDPOINTS.STATIONS with the actual path, like '/stations/'
      const response = await fetch(`/${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.WORKSTATIONS}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch stations:", error);
      // Re-throw the error so the component's catch block can handle it
      throw error;
    }
  },
  //  Get Topics
  getTopics: async (department: number, level: number) => {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_TOPIC_LIST}?department=${department}&level=${level}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching topics: ${response.statusText}`);
    }
    return response.json();
  },

  //  Create Topic
  createTopic: async (topicData: {
    sl_no: number;
    topic: string;
    category: string;
    department: number;
    level: number;
  }) => {
    const url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_TOPICS}?department=${topicData.department}&level=${topicData.level}`;
    console.log("Create Topic URL:", url); // ✅ Debug

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(topicData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Validation Error:", errorData);
      throw new Error(`Error creating topic: ${response.statusText}`);
    }

    return response.json();
  },

  //  Update Topic
  updateTopic: async (id: number, topicData: any) => {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_TOPICS}${id}/`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topicData),
      }
    );

    if (!response.ok) {
      throw new Error(`Error updating topic: ${response.statusText}`);
    }
    return response.json();
  },

  //  Delete Topic
  deleteTopic: async (id: number) => {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_TOPICS}${id}/`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      throw new Error(`Error deleting topic: ${response.statusText}`);
    }
    return true;
  },

  // Get Days
  getDays: async (department: number, level: number) => {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_DAYS_LIST}?department=${department}&level=${level}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching days: ${response.statusText}`);
    }
    return response.json();
  },

  //  Create Day
  createDay: async (dayData: any) => {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_DAYS}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dayData),
      }
    );

    if (!response.ok) {
      throw new Error(`Error creating day: ${response.statusText}`);
    }
    return response.json();
  },

  //update Day
  updateDay: async (id: number, dayData: any) => {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_DAYS}${id}/`,
      {
        method: 'put',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dayData),
      }
    );

    if (!response.ok) {
      throw new Error(`Error deleting day: ${response.statusText}`);
    }
    return true;
  },

  //  Delete Day
  deleteDay: async (id: number) => {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_DAYS}${id}/`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      throw new Error(`Error deleting day: ${response.statusText}`);
    }
    return true;
  },

  //  Save Form Data (FormData - No Content-Type header)
  saveFormData: async (formData: FormData) => {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_FORMS}`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Error saving form data: ${response.statusText}`);
    }
    return response.json();
  },


  // getQualityTraineeInfoList: async (
  //   empId: string,
  //   stationId: number | null,
  //   levelId: number | null,
  //   deptId?: number
  // ) => {
  //   const params: any = {};

  //   if (empId) params.emp_id = empId.trim();
  //   if (stationId !== null) params.station_id = stationId;
  //   if (levelId !== null) params.level_id = levelId;

  //   console.log('[API] GET Quality →', params);

  //   try {
  //     // ✅ Use the correct endpoint path
  //     const response = await axios.get(
  //       `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_QUALITY_TRAINEE_INFO_LIST}`,
  //       { params }
  //     );

  //     console.log('[API] Quality Response →', response.data);
  //     return response.data;
  //   } catch (error: any) {
  //     console.error('[API] GET Quality Error:', error.response?.status, error.response?.data);
  //     throw error;
  //   }
  // },

  // postOJTData: async (data: any) => {
  //   console.log('[API] POST OJT (Upsert) →', data);
  //   try {
  //     const res = await axios.post(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_POST}`, data);
  //     console.log('[API] Upserted OJT - Returned:', res.data);
  //     return res.data;
  //   } catch (error: any) {
  //     console.error('[API] POST Failed:', error.response?.data || error.message);
  //     throw error;
  //   }
  // },

  // // ❌ REMOVE OR DEPRECATE - Should not be called directly
  // // Only use if you're certain you want to update the SAME level
  // updateOJTData: async (id: number, data: any) => {
  //   console.warn('[API] Direct PUT is deprecated - use POST for upsert behavior');
  //   console.log(`[API] PUT OJT ID ${id} →`, data);
  //   try {
  //     const res = await axios.put(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_POST}${id}/`, data);
  //     console.log('[API] Updated OJT ID:', id);
  //     return res.data;
  //   } catch (error: any) {
  //     console.error('[API] PUT Failed:', error.response?.data);
  //     throw error;
  //   }
  // },



  getQualityTraineeInfoList: async (
    empId: string,
    stationId: number | null,
    levelId: number | null,
    deptId?: number
  ) => {
    const params: any = {};

    if (empId) params.emp_id = empId.trim();
    if (stationId !== null) params.station_id = stationId;
    if (levelId !== null) params.level_id = levelId;

    console.log('[API] GET Quality →', params);

    try {
      // ✅ Use the correct endpoint path
      const response = await axios.get(
        `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_QUALITY_TRAINEE_INFO_LIST}?ordering=-attempt_no`,
        { params }
      );

      console.log('[API] Quality Response →', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[API] GET Quality Error:', error.response?.status, error.response?.data);
      throw error;
    }
  },

  postOJTData: async (data: any) => {
    console.log('[API] POST OJT (Upsert) →', data);
    try {
      const res = await axios.post(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_POST}`, data);
      console.log('[API] Upserted OJT - Returned:', res.data);
      return res.data;
    } catch (error: any) {
      console.error('[API] POST Failed:', error.response?.data || error.message);
      throw error;
    }
  },

  // ❌ REMOVE OR DEPRECATE - Should not be called directly
  // Only use if you're certain you want to update the SAME level
  updateOJTData: async (id: number, data: any) => {
    console.warn('[API] Direct PUT is deprecated - use POST for upsert behavior');
    console.log(`[API] PUT OJT ID ${id} →`, data);
    try {
      const res = await axios.put(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_POST}${id}/`, data);
      console.log('[API] Updated OJT ID:', id);
      return res.data;
    } catch (error: any) {
      console.error('[API] PUT Failed:', error.response?.data);
      throw error;
    }
  },








  getQuantityTraineeInfoList: async (traineeId: string, level: number, stationId: number) => {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_QUANTITY_TRAINEE_INFO_LIST}?trainee_id=${traineeId}&level=${level}&station_id=${stationId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching quantity trainee info: ${response.statusText}`);
    }

    return response.json();
  },


  // ✅ POST - Create new Quantity OJT record
  postOJTQuantityData: async (traineeData: any) => {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_QUANTITY_TRAINEE_INFO_LIST}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(traineeData),
      }
    );

    if (!response.ok) {
      throw new Error(`Error creating quantity OJT trainee: ${response.statusText}`);
    }

    return response.json();
  },


  updateOJTQuantityData: async (id: number, traineeData: any) => {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_QUANTITY_TRAINEE_INFO_LIST}${id}/`, // Append ID
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(traineeData),
      }
    );

    if (!response.ok) {
      throw new Error(`Error updating quantity OJT trainee: ${response.statusText}`);
    }

    return response.json();
  },



  getScoreRanges: async (department: number, level: number) => {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_SCORE_RANGE}?department=${department}&level=${level}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching score ranges: ${response.statusText}`);
    }

    return response.json();
  },

  createScoreRange: async (data: any) => {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_SCORE_RANGE}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`Error creating score range: ${response.statusText}`);
    }

    return response.json();
  },

  updateScoreRange: async (id: number, data: any) => {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_SCORE_RANGE}${id}/`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`Error updating score range: ${response.statusText}`);
    }

    return response.json();
  },

  deleteScoreRange: async (id: number) => {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_SCORE_RANGE}${id}/`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error(`Error deleting score range: ${response.statusText}`);
    }

    return true; // or return response if needed
  },

  // Get passing criteria for a specific department and level
  getPassingCriteria: async (department: number, level: number) => {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_PASSING_CRITERIA}?department=${department}&level=${level}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching passing criteria: ${response.statusText}`);
    }
    return response.json();
  },

  // Create new passing criteria
  createPassingCriteria: async (criteriaData: PassingCriteria) => {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_PASSING_CRITERIA}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(criteriaData),
      }
    );

    if (!response.ok) {
      throw new Error(`Error creating passing criteria: ${response.statusText}`);
    }
    return response.json();
  },

  // Update existing passing criteria
  updatePassingCriteria: async (criteriaId: number, criteriaData: PassingCriteria) => {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_PASSING_CRITERIA}${criteriaId}/`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(criteriaData),
      }
    );

    if (!response.ok) {
      throw new Error(`Error updating passing criteria: ${response.statusText}`);
    }
    return response.json();
  },

  // Partially update passing criteria
  patchPassingCriteria: async (criteriaId: number, partialData: Partial<PassingCriteria>) => {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_PASSING_CRITERIA}${criteriaId}/`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partialData),
      }
    );

    if (!response.ok) {
      throw new Error(`Error updating passing criteria: ${response.statusText}`);
    }
    return response.json();
  },

  // Delete specific passing criteria
  deletePassingCriteria: async (criteriaId: number) => {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_PASSING_CRITERIA}${criteriaId}/`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error(`Error deleting passing criteria: ${response.statusText}`);
    }
    return response.ok;
  },



  //quantity score range


  getQuantityScoreRanges: async (department: number, level: number) => {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_QUANTITY_SCORE_RANGE}?department=${department}&level=${level}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching quantity score ranges: ${response.statusText}`);
    }

    return response.json();
  },

  createQuantityScoreRange: async (data: any) => {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_QUANTITY_SCORE_RANGE}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`Error creating quantity score range: ${response.statusText}`);
    }

    return response.json();
  },

  updateQuantityScoreRange: async (id: number, data: any) => {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_QUANTITY_SCORE_RANGE}${id}/`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`Error updating quantity score range: ${response.statusText}`);
    }

    return response.json();
  },

  deleteQuantityScoreRange: async (id: number) => {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_QUANTITY_SCORE_RANGE}${id}/`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(`Error deleting quantity score range: ${response.statusText}`);
    }

    return true; // or response if you want
  },


  // Quantity Passing Criteria APIs

  // Get passing criteria for a specific department and level
  getQuantityPassingCriteria: async (department: number, level: number) => {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_QUANTITY_PASSING_CRITERIA}?department=${department}&level=${level}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching quantity passing criteria: ${response.statusText}`);
    }
    return response.json();
  },

  // Create new passing criteria
  createQuantityPassingCriteria: async (criteriaData: any) => {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_QUANTITY_PASSING_CRITERIA}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(criteriaData),
      }
    );

    if (!response.ok) {
      throw new Error(`Error creating quantity passing criteria: ${response.statusText}`);
    }
    return response.json();
  },

  // Update existing passing criteria
  updateQuantityPassingCriteria: async (criteriaId: number, criteriaData: any) => {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_QUANTITY_PASSING_CRITERIA}${criteriaId}/`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(criteriaData),
      }
    );

    if (!response.ok) {
      throw new Error(`Error updating quantity passing criteria: ${response.statusText}`);
    }
    return response.json();
  },



  // Delete specific passing criteria
  deleteQuantityPassingCriteria: async (criteriaId: number) => {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_QUANTITY_PASSING_CRITERIA}${criteriaId}/`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(`Error deleting quantity passing criteria: ${response.statusText}`);
    }
    return response.ok;
  },




  getAssessmentMode: async () => {
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_ASSESSMENT_MODE}`);
    if (!res.ok) throw new Error("Error fetching assessment mode");
    return res.json();
  },

  toggleAssessmentMode: async (mode: string) => {
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_ASSESSMENT_TOGGLE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mode }),
    });
    if (!res.ok) throw new Error("Error updating assessment mode");
    return res.json();
  },

  getSelections: async () => {
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.OJT_SELECTION}`);
    if (!res.ok) throw new Error("Error fetching selections");
    return res.json();
  },


};

export const saveStationSettings = async (payload: StationSettingPayload) => {
  const response = await fetch(
    `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.STATION_SETTINGS}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  return response;
};


export const getStationSettings = async (departmentId: number) => {
  const response = await fetch(
    `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.STATION_SETTINGS}?department_id=${departmentId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch station settings");
  }

  return response.json(); // returns array of { station_id, option }
};



export const ProcessDojo = {
  async fetchDepartments(): Promise<{ departments: any[] }> {
    const url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.DEPARTMENTS.ALL}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch departments");
    const data = await response.json(); // { departments: [...] }
    return data;
  },

  // Example for lines
  async fetchLinesByDepartment(departmentId: number): Promise<{ lines: any[] }> {
    const url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.DEPARTMENTS.LINES(departmentId)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch lines");
    const data = await response.json(); // { lines: [...] }
    return data;
  },

  async fetchSublinesByLine(lineId: number): Promise<any[]> {
    try {
      const url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.LINES.SUBLINES(lineId)}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch sublines");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch sublines", error);
      throw error;
    }
  },

  async fetchStationsBySubline(sublineId: number): Promise<SublineResponse> {
    try {
      const url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.SUBLINES_BY_ID.STATIONS(sublineId)}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch stations by subline");
      }

      const data = await response.json();
      return data; // This returns the SublineResponse object
    } catch (error) {
      console.error("Failed to fetch stations by subline", error);
      throw error;
    }
  },

  async fetchStationsByDepartment(departmentId: number): Promise<any[]> {
    try {
      const url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.DEPARTMENTS.STATIONS(departmentId)}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch stations by department");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch stations by department", error);
      throw error;
    }
  },

  async fetchStationsByLine(lineId: number): Promise<any[]> {
    try {
      const url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.LINES.STATIONS(lineId)}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch stations by line");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch stations by line", error);
      throw error;
    }
  },

  async fetchHierarchyByDepartment(
    departmentId: number
  ): Promise<any[]> {
    const url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.HIERARCHY.BY_DEPARTMENT(
      departmentId
    )}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch hierarchy by department");
    return await response.json();
  },
};
