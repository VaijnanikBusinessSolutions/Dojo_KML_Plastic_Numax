import { createContext, useContext, useState, useMemo } from 'react';

interface Skill {
  skill: string;
  skill_level: string;
  start_date: string;
  status?: string;
  notes?: string;
  station?: string;
}

interface Employee {
  card_no: string;
  employee_id: string;
  full_name: string;
  joining_date: string;
  department: string;
  section: string;
  department_code?: string;
  employment_pattern?: string;
  skills?: Skill[];
}

interface Stats {
  scheduled: number;
  in_progress: number;
  completed: number;
  total: number;
}

interface SkillFilterContextType {
  statusFilter: string;
  dateFilter: string;
  setStatusFilter: (filter: string) => void;
  setDateFilter: (filter: string) => void;
  stats: Stats;
  setStats: (stats: Stats) => void;
  allEmployees: Employee[];
  setAllEmployees: (employees: Employee[]) => void;
  filteredEmployees: Employee[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SkillFilterContext = createContext<SkillFilterContextType | undefined>(undefined);

export const SkillFilterProvider = ({ children }: { children: React.ReactNode }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all-time');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stats, setStats] = useState<Stats>({
    scheduled: 0,
    in_progress: 0,
    completed: 0,
    total: 0,
  });
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);

  const filteredEmployees = useMemo(() => {
    return allEmployees
      .map(employee => {
        // Filter skills first
        const filteredSkills = (employee.skills || []).filter(skill => {
          // Filter by status
          if (statusFilter !== 'all') {
            const skillStatus = skill.status?.toLowerCase() || 'scheduled';
            if (skillStatus !== statusFilter.toLowerCase()) {
              return false;
            }
          }

          // Filter by date using only start_date
          if (dateFilter !== 'all-time') {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normalize to start of day

            if (!skill.start_date || skill.start_date === 'N/A') {
              return false;
            }

            const startDate = new Date(skill.start_date);
            startDate.setHours(0, 0, 0, 0);

            let dateMatches = false;
            switch (dateFilter) {
              case 'today':
                dateMatches = startDate.getTime() === today.getTime();
                break;
              case 'this-week': {
                const dayOfWeek = today.getDay(); // Sunday = 0, Saturday = 6
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - dayOfWeek);
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                dateMatches = startDate >= startOfWeek && startDate <= endOfWeek;
                break;
              }
              case 'this-month': {
                dateMatches = (
                  startDate.getFullYear() === today.getFullYear() &&
                  startDate.getMonth() === today.getMonth()
                );
                break;
              }
              default:
                dateMatches = true;
            }

            if (!dateMatches) {
              return false;
            }
          }

          // Filter by search query
          if (searchQuery.trim() !== '') {
            const lowerQuery = searchQuery.toLowerCase();
            const matchesSearch =
              skill.skill?.toLowerCase().includes(lowerQuery) ||
              skill.station?.toLowerCase().includes(lowerQuery) ||
              skill.skill_level?.toLowerCase().includes(lowerQuery);
            
            if (!matchesSearch) {
              return false;
            }
          }

          return true;
        });

        // Return employee with filtered skills
        return {
          ...employee,
          skills: filteredSkills
        };
      })
      .filter(employee => {
        // Only include employees who have at least one matching skill
        if (employee.skills && employee.skills.length > 0) {
          return true;
        }

        // Also include employees if searching by name (even if no skills match)
        if (searchQuery.trim() !== '') {
          const lowerQuery = searchQuery.toLowerCase();
          return employee.full_name?.toLowerCase().includes(lowerQuery);
        }

        return false;
      });
  }, [allEmployees, statusFilter, dateFilter, searchQuery]);

  const value = {
    statusFilter,
    dateFilter,
    setStatusFilter,
    setDateFilter,
    stats,
    setStats,
    allEmployees,
    setAllEmployees,
    filteredEmployees,
    searchQuery,
    setSearchQuery,
  };

  return (
    <SkillFilterContext.Provider value={value}>
      {children}
    </SkillFilterContext.Provider>
  );
};

export const useSkillFilter = (): SkillFilterContextType => {
  const context = useContext(SkillFilterContext);
  if (context === undefined) {
    throw new Error('useSkillFilter must be used within a SkillFilterProvider');
  }
  return context;
};