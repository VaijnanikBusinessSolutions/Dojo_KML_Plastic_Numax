// src/components/pages/EmployeeHistorySearch/mockData.ts
// import { MasterEmployee, EmployeeCardDetails } from "./types";
import type { MasterEmployee, EmployeeCardDetails } from "./types";

// Mock data for the search results dropdown
export const mockEmployeeList: MasterEmployee[] = [
  {
    emp_id: "EMP1001",
    first_name: "John",
    last_name: "Doe",
    department_name: "Assembly Line A",
    date_of_joining: "2022-01-15",
    birth_date: "1995-05-20",
    sex: "Male",
    email: "john.doe@example.com",
    phone: "123-456-7890",
    pay_code: "PC01",
    card_no: "EMP1001",
    name: "John Doe",
    guardian_name: "Richard Doe",
    department: "Assembly",
    section: "A",
    desig_category: "Operator",
  },
  {
    emp_id: "EMP1002",
    first_name: "Jane",
    last_name: "Smith",
    department_name: "Quality Control",
    date_of_joining: "2021-11-01",
    birth_date: "1998-09-10",
    sex: "Female",
    email: "jane.smith@example.com",
    phone: "987-654-3210",
    pay_code: "PC02",
    card_no: "EMP1002",
    name: "Jane Smith",
    guardian_name: "Robert Smith",
    department: "QC",
    section: "B",
    desig_category: "Inspector",
  },
    {
    emp_id: "EMP1003",
    first_name: "Peter",
    last_name: "Jones",
    department_name: "Assembly Line A",
    date_of_joining: "2023-02-20",
    birth_date: "2000-01-01",
    sex: "Male",
    email: "peter.jones@example.com",
    phone: "555-555-5555",
    pay_code: "PC01",
    card_no: "EMP1003",
    name: "Peter Jones",
    guardian_name: "David Jones",
    department: "Assembly",
    section: "A",
    desig_category: "Operator",
  },
];

// Mock data for the detailed employee card view
export const mockEmployeeDetails: EmployeeCardDetails = {
  employee: mockEmployeeList[0], // We'll use John Doe for the details
  operator_skills: [
    { id: 1, operator_name: "John Doe", station_skill: "Soldering Station 1", skill_level: "Level 3 - Advanced", sequence: 1 },
    { id: 2, operator_name: "John Doe", station_skill: "Component Inspection", skill_level: "Level 4 - Expert", sequence: 2 },
    { id: 3, operator_name: "John Doe", station_skill: "Final Assembly", skill_level: "Level 2 - Intermediate", sequence: 3 },
  ],
  scores: [
    { id: 10, test_name: "Safety Protocol Exam", marks: 92, created_at: "2023-06-10T10:00:00Z", percentage: 92.0, passed: "Pass" },
    { id: 11, test_name: "Advanced Soldering Test", marks: 68, created_at: "2023-08-22T14:30:00Z", percentage: 68.0, passed: "Fail" },
  ],
  attendance: [
    { id: 101, batch: "B001-Soldering", day_number: 1, status: 'present', attendance_date: "2023-05-01" },
    { id: 102, batch: "B001-Soldering", day_number: 2, status: 'present', attendance_date: "2023-05-02" },
    { id: 103, batch: "B001-Soldering", day_number: 3, status: 'absent', attendance_date: "2023-05-03" },
    { id: 104, batch: "B001-Soldering", day_number: 4, status: 'present', attendance_date: "2023-05-04" },
  ],
  scheduled_trainings: [
    { id: 20, topic: "Advanced Circuitry", category_name: "Technical", trainer_name: "Dr. Eleanor Vance", venue_name: "Training Hall A", status: "completed", date: "2023-04-15" },
    { id: 21, topic: "Emergency Evacuation Drill", category_name: "Safety", trainer_name: "Captain Rogers", venue_name: "Assembly Floor", status: "scheduled", date: "2024-09-01" },
  ],
  hanchou_results: [
    { id: 30, exam_name: "Hanchou Leadership Test 2023", score: 28, total_questions: 30, percentage: 93.3, passed: true, submitted_at: "2023-07-20T11:00:00Z" },
  ],
  shokuchou_results: [], // No shokuchou results to test the empty state
};