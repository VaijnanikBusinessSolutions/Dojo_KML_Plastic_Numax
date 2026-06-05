import React, { useState, useEffect } from 'react';
import SkillMatrixTable from '../components/SkillMatrixTable';
import { fetchSkillMatrices, fetchOperations, fetchSections, fetchMonthlySkill, fetchOperatorLevels, fetchDepartments, fetchStationRequirements } from '../api/api';
import { type SkillMatrix, type Operation, type Section, type MonthlySkill, type OperatorLevel, months, type StationRequirement } from '../api/types';

const SkillMatrixPage: React.FC = () => {
  const [skillMatrices, setSkillMatrices] = useState<SkillMatrix[]>([]);
  const [selectedMatrix, setSelectedMatrix] = useState<SkillMatrix | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [monthlySkills, setMonthlySkills] = useState<MonthlySkill[]>([]);
  const [operatorLevels, setOperatorLevels] = useState<OperatorLevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stationRequirements, setStationRequirements] = useState<StationRequirement[]>([]); // <-- NEW STATE

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [matricesData, operationsData, sectionsData, monthlySkillsData, departmentsData,requirementsData] = await Promise.all([
          fetchSkillMatrices(),
          fetchOperations(),
          fetchSections(),
          fetchMonthlySkill(),
          fetchDepartments(),
          fetchStationRequirements() // <-- NEW FETCH
        ]);

        // Normalize departments
        console.log('📡 Departments raw:', departmentsData);
        const normalizedDepartments = (departmentsData || []).map((d: any, idx: number) => ({
          id: d.department_id ?? d.id ?? idx + 1,
          name: d.department_name ?? d.name ?? String(d)
        }));
        console.log('✅ Departments normalized:', normalizedDepartments);

        // Extract unique employees from monthly skills data
        const employeesFromMonthlySkills = monthlySkillsData.reduce((acc: any[], current) => {
          if (!acc.find(item => item.employee_code === current.employee_code)) {
            acc.push({
              employee_code: current.employee_code,
              full_name: current.full_name,
              designation: current.designation,
              date_of_join: current.date_of_join,
              department: current.department,
              section: sectionsData.find(s => s.name === current.section)?.id
            });
          }
          return acc;
        }, []);

        // Fetch operator levels for first department if available
        let operatorLevelsData: OperatorLevel[] = [];
        if (normalizedDepartments.length > 0) {
          try {
            operatorLevelsData = await fetchOperatorLevels(normalizedDepartments[0].name);
          } catch (e) {
            console.error('Error fetching operator levels:', e);
          }
        }

        setSkillMatrices(matricesData);
        setEmployees(employeesFromMonthlySkills);
        setOperations(operationsData);
        setSections(sectionsData);
        setMonthlySkills(monthlySkillsData);
        setOperatorLevels(operatorLevelsData);
        console.log('✅ Fetched Station Requirements (includes minimum_level_number):', requirementsData); 
        setStationRequirements(requirementsData); // <-- SET NEW STATE


        
        
        if (matricesData.length > 0) {
          setSelectedMatrix(matricesData[0]);
        }

      } catch (err) {
        console.error('Error loading initial data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleMatrixChange = async (matrix: SkillMatrix) => {
    setSelectedMatrix(matrix);

    // Fetch operator levels for the new department
    try {
      setIsLoading(true);
      const operatorLevelsData = await fetchOperatorLevels(matrix.department);
      setOperatorLevels(operatorLevelsData);
    } catch (error) {
      console.error('Error fetching operator levels for department:', matrix.department, error);
      setError('Failed to load operator levels for selected department');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh data (can be called when skills are updated)
  const refreshData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use the currently selected department, or default to first available department
      const currentDepartment = selectedMatrix?.department;

      const [matricesData, operationsData, sectionsData, monthlySkillsData, requirementsData] = await Promise.all([
        fetchSkillMatrices(),
        fetchOperations(),
        fetchSections(),
        fetchMonthlySkill(),
        fetchStationRequirements() // <-- ADD REFRESH FETCH
      ]);

      // Extract unique employees from monthly skills data
      const employeesFromMonthlySkills = monthlySkillsData.reduce((acc: any[], current) => {
        if (!acc.find(item => item.employee_code === current.employee_code)) {
          acc.push({
            employee_code: current.employee_code,
            full_name: current.full_name,
            designation: current.designation,
            date_of_join: current.date_of_join,
            department: current.department,
            section: sectionsData.find(s => s.name === current.section)?.id
          });
        }
        return acc;
      }, []);

      // Fetch operator levels for current department
      let operatorLevelsData: OperatorLevel[] = [];
      if (currentDepartment) {
        try {
          operatorLevelsData = await fetchOperatorLevels(currentDepartment);
        } catch (e) {
          console.error('Error fetching operator levels:', e);
        }
      }

      setSkillMatrices(matricesData);
      setEmployees(employeesFromMonthlySkills);
      setOperations(operationsData);
      setSections(sectionsData);
      setMonthlySkills(monthlySkillsData);
      setOperatorLevels(operatorLevelsData);
      setStationRequirements(requirementsData); // <-- SET REFRESHED STATE

    } catch (err) {
      console.error('Error refreshing data:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SkillMatrixTable
        skillMatrices={skillMatrices}
        selectedMatrix={selectedMatrix}
        employees={employees}
        operations={operations}
        sections={sections}
        monthlySkills={monthlySkills}
        operatorLevels={operatorLevels}
        stationRequirements={stationRequirements} // <-- PASS NEW PROP
        months={months}
        isLoading={isLoading}
        error={error}
        onMatrixChange={handleMatrixChange}
        onRefresh={refreshData}
      />
    </>
  );
};

export default SkillMatrixPage;