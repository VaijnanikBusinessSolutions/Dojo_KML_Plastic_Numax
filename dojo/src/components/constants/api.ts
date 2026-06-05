export const API_ENDPOINTS = {
  BASE_URL: 'http://172.25.0.51:8000',
  USERS: '/user/',
  AUTH: '/auth/',
  HQ: 'hq/',
  FACTORY: 'factories/',
  DEPARTMENT: '/departments/',
  LINE: 'lines/',
  SUBLINES: 'sublines/',
  WORKSTATIONS: 'stations/',
  FACTORY_STRUCTURES: 'factory-structures/',
  LOGOS: '/logos/',
  LOGIN: "/login/",
  LOGOUT: "/logout/",
  // PASSED_USERS: "/user-body-checks/",
  EMPLOYEES: "/mastertable/",
  EMPLOYEES_DOWNLOAD_TEMPLATE: '/mastertable/download_template/',
  EMPLOYEES_UPLOAD_EXCEL: '/mastertable/upload_excel/',
  PASSED_USER_BY_ID: (tempId: string) => `/user-body-checks/?temp_id=${tempId}/`,
  EMPLOYEE_DETAIL: (id: string | number) => `/mastertable/${id}/`,
  EMPLOYEES_UI_LIST: '/mastertable-ui-list/',

  TEMP_USER_INFO: "/temp-user-info/",
  USER_BY_TEMP_ID: (tempId: string) => `/users/${tempId}/`,
  ALL_PASSED_USERS: '/user-body-checks/',
  HUMAN_BODY_CHECKS: {
    QUESTIONS: '/humanbody-questions/',
    LIST: '/human-body-checks/',
    CREATE: '/human-body-checks/',
    GET_BY_TEMP_ID: (tempId: string) => `/human-body-checks/?temp_id=${tempId}`,
  },
  LEVELS: "/levels",
  TRAINING_CONTENTS: '/levelwise-training-contents/',
  TRAINING_CONTENTS_BY_LEVEL_STATION: '/levelwise-training-contents/by_level_station/',
  OJT_TOPICS: '/ojt-topics/',
  OJT_DAYS: '/ojt-days/',
  OJT_FORMS: '/ojt-forms/',
  OJT_TOPIC_LIST: '/ojt-topics-list/',
  OJT_DAYS_LIST: "/ojt-days-list/",
  OJT_POST: "/trainees/",
  OJT_SCORE_RANGE: "/ojt-score-ranges/",
  OJT_QUALITY_TRAINEE_INFO_LIST: "/trainee-info-list/",
  STATION_SETTINGS: "/station-settings/",
  OJT_PASSING_CRITERIA: "/ojt-passing-criteria/",
  OJT_QUANTITY_TRAINEE_INFO_LIST: "/ojt-quantity/",
  OJT_QUANTITY_SCORE_RANGE: "/score-ranges/",
  OJT_QUANTITY_PASSING_CRITERIA: "/passing-criteria/",
  OJT_ASSESSMENT_MODE: '/api/assessment-mode/',
  OJT_ASSESSMENT_TOGGLE: '/api/assessment-mode/toggle/',
  OJT_SELECTION: "/selections/",
  DEPARTMENTS: {
    ALL: "/fetch-departments/",
    LINES: (departmentId: number) => `/department/${departmentId}/lines/`,
    STATIONS: (departmentId: number) => `/department/${departmentId}/stations/`,
  },

  LINES: {
    SUBLINES: (lineId: number) => `/line/${lineId}/sublines/`,
    STATIONS: (lineId: number) => `/line/${lineId}/stations/`,
  },

  SUBLINES_BY_ID: {
    STATIONS: (sublineId: number) => `/subline/${sublineId}/stations/`,
  },
  HIERARCHY: {
    BY_DEPARTMENT: (departmentId: number) =>
      `/hierarchy/by-department/?department_id=${departmentId}`
  },

} as const;



export const AUTO_NAMES = {
  HQ: 'Auto HQ',
  FACTORY: 'Auto Factory',
  DEPARTMENT: 'Auto Department',
  LINE: 'Auto Line',
  SUBLINE: 'Auto SubLine',
  STATION: 'Auto Station'
} as const;

