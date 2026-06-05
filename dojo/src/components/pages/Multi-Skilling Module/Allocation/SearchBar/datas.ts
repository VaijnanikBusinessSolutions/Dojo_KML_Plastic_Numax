// datas.ts
export interface Skill {
  name: string;
  certifiedDate: string;
  expiresDate: string;
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  email: string;
  skills: Skill[];
}

export const employees: Employee[] = [
  {
    id: 'EMP001',
    name: 'John Doe',
    department: 'Design',
    position: 'UI/UX Designer',
    email: 'john.doe@company.com',
    skills: [
      { name: 'UI/UX Design', certifiedDate: '2023-01-15', expiresDate: '2025-01-15' },
      { name: 'Figma', certifiedDate: '2023-03-10', expiresDate: '2024-03-10' }
    ]
  },
  {
    id: 'EMP002',
    name: 'Jane Smith',
    department: 'Development',
    position: 'Frontend Developer',
    email: 'jane.smith@company.com',
    skills: [
      { name: 'React', certifiedDate: '2022-11-05', expiresDate: '2024-11-05' },
      { name: 'TypeScript', certifiedDate: '2023-02-20', expiresDate: '2025-02-20' }
    ]
  }
];

