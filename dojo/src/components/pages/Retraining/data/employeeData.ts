import type { Employee } from '../types/Employee';

export const employeeData: Employee[] = [
  {
    employeeId: 'EMP001',
    employeeName: 'John Smith',
    department: 'Manufacturing',
    station: 'Assembly Line A',
    evaluationType: 'Evaluation',
    marksObtained: 65,
    marksNeeded: 80,
    status: 'pending',
    lastEvaluationDate: '2024-01-15',
    retrainingRecords: []
  },
  {
    employeeId: 'EMP002',
    employeeName: 'Sarah Johnson',
    department: 'Quality Control',
    station: 'Inspection Booth 2',
    evaluationType: 'OJT',
    marksObtained: 72,
    marksNeeded: 85,
    status: 'pending',
    lastEvaluationDate: '2024-01-20',
    retrainingRecords: []
  },
  {
    employeeId: 'EMP003',
    employeeName: 'Michael Davis',
    department: 'Manufacturing',
    station: 'Assembly Line B',
    evaluationType: '10 Cycle',
    marksObtained: 58,
    marksNeeded: 75,
    status: 'pending',
    lastEvaluationDate: '2024-01-18',
    retrainingRecords: []
  },
  {
    employeeId: 'EMP004',
    employeeName: 'Emily Rodriguez',
    department: 'Packaging',
    station: 'Pack Station 1',
    evaluationType: 'Evaluation',
    marksObtained: 69,
    marksNeeded: 80,
    status: 'pending',
    lastEvaluationDate: '2024-01-22',
    retrainingRecords: []
  },
  {
    employeeId: 'EMP005',
    employeeName: 'David Wilson',
    department: 'Quality Control',
    station: 'Final Inspection',
    evaluationType: 'OJT',
    marksObtained: 61,
    marksNeeded: 85,
    status: 'scheduled',
    lastEvaluationDate: '2024-01-14',
    retrainingRecords: [
      {
        id: 'RT001',
        observations: 'Needs improvement in quality inspection procedures',
        retrainingDate: '2024-02-15',
        degreeOfConfirmation: {
          first: false,
          second: false,
          third: false
        },
        trainerName: 'Mark Thompson',
        attempt: 1,
        status: 'scheduled'
      }
    ]
  },
  {
    employeeId: 'EMP006',
    employeeName: 'Lisa Chen',
    department: 'Manufacturing',
    station: 'Assembly Line C',
    evaluationType: '10 Cycle',
    marksObtained: 55,
    marksNeeded: 75,
    status: 'pending',
    lastEvaluationDate: '2024-01-19',
    retrainingRecords: []
  },
  {
    employeeId: 'EMP007',
    employeeName: 'Robert Taylor',
    department: 'Packaging',
    station: 'Pack Station 2',
    evaluationType: 'Evaluation',
    marksObtained: 66,
    marksNeeded: 80,
    status: 'pending',
    lastEvaluationDate: '2024-01-21',
    retrainingRecords: []
  },
  {
    employeeId: 'EMP008',
    employeeName: 'Amanda Brown',
    department: 'Quality Control',
    station: 'Incoming Inspection',
    evaluationType: 'OJT',
    marksObtained: 70,
    marksNeeded: 85,
    status: 'pending',
    lastEvaluationDate: '2024-01-17',
    retrainingRecords: []
  },
  {
    employeeId: 'EMP009',
    employeeName: 'James Martinez',
    department: 'Manufacturing',
    station: 'Assembly Line A',
    evaluationType: '10 Cycle',
    marksObtained: 59,
    marksNeeded: 75,
    status: 'scheduled',
    lastEvaluationDate: '2024-01-16',
    retrainingRecords: [
      {
        id: 'RT002',
        observations: 'Assembly sequence errors, needs practice with new procedures',
        retrainingDate: '2024-02-20',
        degreeOfConfirmation: {
          first: true,
          second: false,
          third: false
        },
        trainerName: 'Jennifer Lee',
        attempt: 2,
        status: 'scheduled'
      }
    ]
  },
  {
    employeeId: 'EMP010',
    employeeName: 'Jessica White',
    department: 'Packaging',
    station: 'Pack Station 3',
    evaluationType: 'Evaluation',
    marksObtained: 67,
    marksNeeded: 80,
    status: 'pending',
    lastEvaluationDate: '2024-01-23',
    retrainingRecords: []
  }
];