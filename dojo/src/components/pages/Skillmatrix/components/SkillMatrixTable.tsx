import React, { useEffect, useState, useMemo } from 'react';
import { Users, Calendar, FileText, RefreshCw, ChevronDown, Building, GitBranch, Layers, Cpu, Download, ChevronRight, ChevronLeft, Search, X } from 'lucide-react';
import type { SkillMatrix, Operation, Section, MonthlySkill, OperatorLevel, Month } from '../api/types';
import LevelBlock from './shapes/Levelblocks';
import PieChart from './shapes/piechart';
import axios from 'axios';
import MonthlySkillDisplay from './MonthlySkillDisplay';

// Add interface for skill matrix API data
interface SkillMatrixApiData {
    station_id: number;
    id: number;
    employee_name: string;
    emp_id: string;
    doj: string;
    updated_at: string;
    employee: string;
    level: number;
    skill: number;
}

// Add interface for multi-skilling data
interface MultiSkillingData {
    id?: number;
    emp_id: string;
    station: { station_id: number; station_name?: string } | number;
    skill_level: { level_number: number } | number;
    start_date: string;
    status: string;
    current_status: string;
    department?: number;
    department_name?: string;
}

// Add interfaces for the new hierarchy structure
interface HierarchyStation {
    station_id: number;
    station_name: string;
}

interface HierarchySubline {
    subline_id: number;
    subline_name: string;
    stations: HierarchyStation[];
}

interface HierarchyLine {
    line_id: number;
    line_name: string;
    sublines: HierarchySubline[];
    stations: HierarchyStation[];
}

interface HierarchyDepartment {
    department_id: number;
    department_name: string;
    lines: HierarchyLine[];
    sublines: HierarchySubline[];
    stations: HierarchyStation[];
}

interface StationRequirement {
    id: number;
    station_id: number;
    station_name: string;
    department_id: number;
    department_name: string;
    minimum_operators: number;
    minimum_level_required: string;
    minimum_level_name: number;
    minimum_level_number: number;
}

interface SkillMatrixTableProps {
    skillMatrices: SkillMatrix[];
    selectedMatrix: SkillMatrix | null;
    employees: any[];
    operations: Operation[];
    sections: Section[];
    monthlySkills: MonthlySkill[];
    operatorLevels: OperatorLevel[];
    months: Month[];
    isLoading: boolean;
    error: string | null;
    onMatrixChange: (matrix: SkillMatrix) => void;
    onRefresh: () => Promise<void>;
    stationRequirements: StationRequirement[];
}

const SkillMatrixTable: React.FC<SkillMatrixTableProps> = ({
    skillMatrices,
    selectedMatrix,
    operations,
    monthlySkills,
    operatorLevels,
    months,
    isLoading,
    error,
    onMatrixChange,
    onRefresh,
    stationRequirements,
}) => {
    // State declarations
    const [hierarchyData, setHierarchyData] = useState<HierarchyDepartment[]>([]);
    const [availableLines, setAvailableLines] = useState<HierarchyLine[]>([]);
    const [availableSublines, setAvailableSublines] = useState<HierarchySubline[]>([]);
    const [availableStations, setAvailableStations] = useState<HierarchyStation[]>([]);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
    const [selectedLineId, setSelectedLineId] = useState<number | null>(null);
    const [selectedSublineId, setSelectedSublineId] = useState<number | null>(null);
    const [selectedStationId, setSelectedStationId] = useState<number | null>(null);
    const [multiSkillingsData, setMultiSkillingsData] = useState<MultiSkillingData[]>([]);
    const [levelColors, setLevelColors] = useState<{ 1: string; 2: string; 3: string; 4: string }>({
        1: '#ef4444',
        2: '#f59e0b',
        3: '#10b981',
        4: '#3b82f6'
    });
    const [displayShape, setDisplayShape] = useState<'piechart' | 'levelblock'>('piechart');
    const [skillMatrixData, setSkillMatrixData] = useState<SkillMatrixApiData[]>([]);
    const [skillMatrixLoading, setSkillMatrixLoading] = useState(false);
    const [hierarchyError, setHierarchyError] = useState<string | null>(null);
    const [skillMatrixError, setSkillMatrixError] = useState<string | null>(null);
    const [downloadLoading, setDownloadLoading] = useState<'template' | 'report' | null>(null);
    const [downloadError, setDownloadError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');

    const API_BASE_URL = 'http://127.0.0.1:8000';

    // Load hierarchy data
    const loadHierarchyData = async () => {
        try {
            setHierarchyError(null);
            const response = await axios.get(`${API_BASE_URL}/hierarchy/all-departments/`);
            setHierarchyData(response.data || []);
        } catch (err) {
            console.error('Failed to load hierarchy data:', err);
            setHierarchyError('Failed to load hierarchy data.');
            setHierarchyData([]);
        }
    };

    // Load skill matrix data
    const loadSkillMatrixData = async (stationId?: number | null) => {
        try {
            setSkillMatrixLoading(true);
            setSkillMatrixError(null);
            let url = `${API_BASE_URL}/skill-matrix/`;
            if (stationId) {
                url = `${API_BASE_URL}/skill-matrix/by_station/?station_id=${stationId}`;
            }
            const response = await axios.get(url);
            setSkillMatrixData(response.data || []);
        } catch (err) {
            console.error('Failed to load skill matrix data:', err);
            setSkillMatrixError('Failed to load skill matrix data.');
            setSkillMatrixData([]);
        } finally {
            setSkillMatrixLoading(false);
        }
    };

    // Handle Excel downloads
    const handleDownload = async (type: 'template' | 'report') => {
        try {
            setDownloadLoading(type);
            setDownloadError(null);
            const filters: { [key: string]: number | undefined } = {};
            if (selectedDepartmentId) filters.department_id = selectedDepartmentId;
            if (selectedLineId) filters.main_line_id = selectedLineId;
            if (selectedSublineId) filters.sub_line_id = selectedSublineId;
            const url = type === 'template'
                ? `${API_BASE_URL}/skill-matrix/template/download/`
                : `${API_BASE_URL}/skill-matrix/report/download/`;
            
            const response = await axios.post(url, filters, {
                responseType: 'blob',
            });
            
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            const filename = type === 'template'
                ? `skill_matrix_template${selectedSublineId ? '_sub_line' : selectedLineId ? '_main_line' : selectedDepartmentId ? '_department' : '_all'}.xlsx`
                : `skill_matrix_report${selectedSublineId ? '_sub_line' : selectedLineId ? '_main_line' : selectedDepartmentId ? '_department' : '_all'}.xlsx`;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error(`Failed to download ${type}:`, err);
            setDownloadError(`Failed to download ${type}. Please try again.`);
        } finally {
            setDownloadLoading(null);
        }
    };

    // Load settings
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const colorsResponse = await axios.get(`${API_BASE_URL}/levelcolours/`);
                if (colorsResponse.data && Array.isArray(colorsResponse.data)) {
                    const colorsFromBackend: { 1?: string; 2?: string; 3?: string; 4?: string } = {};
                    colorsResponse.data.forEach((item: any) => {
                        if (item.level_number && [1, 2, 3, 4].includes(item.level_number)) {
                            colorsFromBackend[item.level_number as 1 | 2 | 3 | 4] = item.colour_code;
                        }
                    });
                    setLevelColors(prev => ({
                        1: colorsFromBackend[1] || prev[1],
                        2: colorsFromBackend[2] || prev[2],
                        3: colorsFromBackend[3] || prev[3],
                        4: colorsFromBackend[4] || prev[4]
                    }));
                }
                const shapeResponse = await axios.get(`${API_BASE_URL}/displaysetting/`);
                if (shapeResponse.data && shapeResponse.data.display_shape) {
                    setDisplayShape(shapeResponse.data.display_shape);
                }
            } catch (err) {
                console.error('Failed to load settings:', err);
            }
        };
        loadSettings();
    }, []);

    // Sync selected department from selectedMatrix
    useEffect(() => {
        if (!selectedMatrix || hierarchyData.length === 0) return;
        const targetDepartment = (selectedMatrix.department || '').toString().trim().toLowerCase();
        const matchingDept = hierarchyData.find((dept) =>
            dept.department_name.toLowerCase().trim() === targetDepartment
        );
        if (matchingDept && matchingDept.department_id !== selectedDepartmentId) {
            setSelectedDepartmentId(matchingDept.department_id);
        }
    }, [selectedMatrix, hierarchyData]);

    // When department changes
    useEffect(() => {
        if (!selectedDepartmentId) {
            setAvailableLines([]);
            setAvailableSublines([]);
            setAvailableStations([]);
            return;
        }
        const selectedDepartment = hierarchyData.find(dept => dept.department_id === selectedDepartmentId);
        if (selectedDepartment) {
            setAvailableLines(selectedDepartment.lines || []);
            setSelectedLineId(null);
            setSelectedSublineId(null);
            setSelectedStationId(null);
            setAvailableSublines([]);
            setAvailableStations([]);
        }
    }, [selectedDepartmentId, hierarchyData]);

    // When line changes
    useEffect(() => {
        if (!selectedLineId) {
            setAvailableSublines([]);
            setAvailableStations([]);
            return;
        }
        const selectedLine = availableLines.find(line => line.line_id === selectedLineId);
        if (selectedLine) {
            setAvailableSublines(selectedLine.sublines || []);
            if (!selectedLine.sublines || selectedLine.sublines.length === 0) {
                setAvailableStations(selectedLine.stations || []);
            } else {
                setAvailableStations([]);
            }
            setSelectedSublineId(null);
            setSelectedStationId(null);
        }
    }, [selectedLineId, availableLines]);

    // When subline changes
    useEffect(() => {
        if (!selectedSublineId) {
            if (selectedLineId) {
                const selectedLine = availableLines.find(line => line.line_id === selectedLineId);
                if (selectedLine && (!selectedLine.sublines || selectedLine.sublines.length === 0)) {
                    setAvailableStations(selectedLine.stations || []);
                }
            }
            return;
        }
        const selectedSubline = availableSublines.find(subline => subline.subline_id === selectedSublineId);
        if (selectedSubline) {
            setAvailableStations(selectedSubline.stations || []);
        }
        setSelectedStationId(null);
    }, [selectedSublineId, availableSublines, selectedLineId, availableLines]);

    // Load skill matrix data when station selection changes
    useEffect(() => {
        if (selectedStationId) {
            loadSkillMatrixData(selectedStationId);
        } else {
            loadSkillMatrixData();
        }
    }, [selectedStationId]);

    // Initial Load
    useEffect(() => {
        loadHierarchyData();
        loadSkillMatrixData();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedDepartmentId, selectedLineId, selectedSublineId, selectedStationId, selectedMatrix, searchQuery]);

    // Load multi-skillings data
    const loadMultiSkillingsData = async (departmentId?: number) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/multiskilling/`);
            let filteredData = response.data || [];
            if (departmentId) {
                filteredData = filteredData.filter((ms: any) =>
                    ms.department === departmentId ||
                    ms.department_name === selectedMatrix?.department
                );
            }
            setMultiSkillingsData(filteredData);
        } catch (err) {
            console.error('Failed to load multiskilling data:', err);
            setMultiSkillingsData([]);
        }
    };

    useEffect(() => {
        if (selectedMatrix) {
            loadMultiSkillingsData();
        }
    }, [selectedMatrix]);

    // Helper function to get all relevant stations based on current selection
    const getRelevantStations = (): HierarchyStation[] => {
        if (selectedStationId) {
            const selectedStation = availableStations.find(st => st.station_id === selectedStationId);
            return selectedStation ? [selectedStation] : [];
        }
        if (selectedSublineId) {
            const selectedSubline = availableSublines.find(sl => sl.subline_id === selectedSublineId);
            return selectedSubline?.stations || [];
        } else if (selectedLineId) {
            const selectedLine = availableLines.find(l => l.line_id === selectedLineId);
            if (!selectedLine) return [];
            const lineStations = selectedLine.stations || [];
            const sublineStations = (selectedLine.sublines || []).flatMap(sl => sl.stations || []);
            const allStations = [...lineStations, ...sublineStations];
            const uniqueStations = allStations.filter((station, index, self) =>
                index === self.findIndex(s => s.station_id === station.station_id)
            );
            return uniqueStations;
        } else if (selectedDepartmentId) {
            const selectedDepartment = hierarchyData.find(d => d.department_id === selectedDepartmentId);
            if (!selectedDepartment) return [];
            const departmentStations = selectedDepartment.stations || [];
            const lineStations = (selectedDepartment.lines || []).flatMap(l => [
                ...(l.stations || []),
                ...(l.sublines || []).flatMap(sl => sl.stations || [])
            ]);
            const sublineStations = (selectedDepartment.sublines || []).flatMap(sl => sl.stations || []);
            const allStations = [...departmentStations, ...lineStations, ...sublineStations];
            const uniqueStations = allStations.filter((station, index, self) =>
                index === self.findIndex(s => s.station_id === station.station_id)
            );
            return uniqueStations;
        }
        return [];
    };

    const stationHeaders = getRelevantStations();

    const getDepartmentEmployees = (): any[] => {
        if (!selectedMatrix) return [];
        
        // Basic aggregation of employees from available data
        const employeesFromSkillMatrix = skillMatrixData.reduce((acc: any[], current) => {
            if (!acc.find(emp => emp.emp_id === current.emp_id)) {
                acc.push({
                    employee_code: current.emp_id,
                    emp_id: current.emp_id,
                    full_name: current.employee_name,
                    date_of_join: current.doj,
                    department: selectedMatrix.department, // Note: this might be inaccurate if raw data has Mixed depts
                    section: null
                });
            }
            return acc;
        }, []);

        const employeesFromOperatorLevels = operatorLevels
            .filter(ol => ol.skill_matrix.department === selectedMatrix.department)
            .map(ol => ol.employee)
            .reduce((acc: any[], current) => {
                if (!acc.find(emp => emp.employee_code === current.employee_code)) {
                    acc.push({
                        employee_code: current.employee_code,
                        emp_id: current.employee_code,
                        full_name: current.full_name,
                        date_of_join: current.date_of_join,
                        department: selectedMatrix.department,
                        section: null
                    });
                }
                return acc;
            }, []);

        const allEmployees = [...employeesFromSkillMatrix, ...employeesFromOperatorLevels];
        const uniqueEmployees = allEmployees.reduce((acc: any[], current) => {
            if (!acc.find(emp => emp.employee_code === current.employee_code || emp.emp_id === current.emp_id)) {
                acc.push(current);
            }
            return acc;
        }, []);
        
        return uniqueEmployees;
    };

    const getEmployeeMonthlySkills = (employeeCode: string): MonthlySkill[] => {
        if (!selectedMatrix) return [];
        return monthlySkills.filter(ms =>
            ms.employee_code === employeeCode &&
            ms.department === selectedMatrix.department
        );
    };

    const getEmployeeMultiSkills = (employeeCode: string): MultiSkillingData[] => {
        return multiSkillingsData.filter(ms =>
            ms.emp_id === employeeCode &&
            ms.status !== 'completed'
        );
    };

    const getOperatorSkillLevel = (employeeCode: string, stationId: number | string): number => {
        const skillRecord = skillMatrixData.find(skill =>
            skill.emp_id === employeeCode &&
            skill.station_id === parseInt(stationId.toString())
        );
        if (skillRecord) {
            return skillRecord.level;
        }
        const operatorLevel = operatorLevels.find(ol =>
            ol.employee.employee_code === employeeCode &&
            ol.operation.id.toString() === stationId.toString()
        );
        if (operatorLevel) {
            return parseInt(operatorLevel.level?.toString() || '0');
        }
        return 0;
    };

    const getStationMinimumLevel = (stationId: number): number | null => {
        const requirementsForStation = stationRequirements.filter(req =>
            req.station_id === stationId
        );
        if (requirementsForStation.length === 0) return null;
        // const maxLevel = Math.max(...requirementsForStation.map(r => r.minimum_level_name));
        const maxLevel = Math.max(...requirementsForStation.map(r => r.minimum_level_number));
        return isFinite(maxLevel) ? maxLevel : null;
    };

    const getStationMinOperators = (stationId: number): number | string => {
        // Find the requirement specifically for this station
        const requirement = stationRequirements.find(req => 
            req.station_id === stationId
        );
        return requirement ? requirement.minimum_operators : '-';
    };


    const formatDate = (dateString: string): string => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-GB');
        } catch {
            return '-';
        }
    };

    const SkillDisplay: React.FC<{ level: number }> = ({ level }) => {
        const safeLevel = Math.max(0, Math.min(4, level || 0));
const size = 36; // You can adjust: 32, 36, 40px looks good

    if (displayShape === 'levelblock') {
        return (
            <div className="flex justify-center items-center w-full h-full min-h-16">
                <div className="w-12 h-10"> {/* Fixed wrapper */}
                    <LevelBlock level={safeLevel} colors={levelColors} size={size} />
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center w-full h-full min-h-16">
            <div className="w-12 h-10">
                <PieChart level={safeLevel} colors={levelColors} size={size} />
            </div>
        </div>
    );
};

    const handleRefresh = async () => {
        setSkillMatrixLoading(true);
        await Promise.all([
            onRefresh(),
            loadSkillMatrixData(selectedStationId),
            loadHierarchyData(),
            loadMultiSkillingsData()
        ]);
        setSkillMatrixLoading(false);
    };

    const handleDepartmentChange = (departmentId: number | null) => {
        setSelectedDepartmentId(departmentId);
        if (departmentId) {
            const selectedDept = hierarchyData.find(d => d.department_id === departmentId);
            if (selectedDept) {
                const matrix = skillMatrices.find(m =>
                    (m.department || '').toString().trim().toLowerCase() ===
                    selectedDept.department_name.toLowerCase().trim()
                );
                if (matrix) {
                    onMatrixChange(matrix);
                }
            }
        }
    };

    const handleStationChange = (stationId: number | null) => {
        setSelectedStationId(stationId);
    };

    // --- SEARCH, FILTER & PAGINATION LOGIC ---

    // 1. Get all potential employees from data sources
    const allPotentialEmployees = getDepartmentEmployees();

    // 2. Filter employees based on:
    //    a. Search Query
    //    b. **CRITICAL FIX**: Only show employees who have a skill entry in the CURRENTLY VISIBLE STATIONS
    const filteredEmployees = useMemo(() => {
        const query = searchQuery.toLowerCase();
        
        // Get the IDs of the stations currently showing in the table header
        const visibleStationIds = new Set(stationHeaders.map(s => s.station_id));

        return allPotentialEmployees.filter(emp => {
            const empCode = (emp.employee_code || emp.emp_id || '').toString();
            
            // a. Search Logic
            const matchesSearch = 
                (emp.full_name || '').toLowerCase().includes(query) || 
                empCode.toLowerCase().includes(query);

            if (!matchesSearch) return false;

            // b. Station Association Logic (The Fix)
            // Check if this employee has a skill record for ANY of the visible stations
            // We check both skillMatrixData and operatorLevels (legacy)
            
            const hasSkillInVisibleStations = skillMatrixData.some(skill => 
                skill.emp_id === empCode && 
                visibleStationIds.has(skill.station_id) &&
                skill.level > 0 // Only show if they have a skill level > 0
            );

            const hasLegacySkillInVisibleStations = operatorLevels.some(ol => 
                ol.employee.employee_code === empCode &&
                visibleStationIds.has(Number(ol.operation.id))
            );

            // If no stations are selected/available, we might want to hide everyone or show everyone.
            // Here we show only if they match the filter to prevent cross-department pollution.
            if (visibleStationIds.size > 0) {
                return hasSkillInVisibleStations || hasLegacySkillInVisibleStations;
            }
            
            // If visibleStationIds is empty (e.g. empty department), list will be empty.
            return false; 
        });
    }, [allPotentialEmployees, searchQuery, stationHeaders, skillMatrixData, operatorLevels]);

    // 3. Pagination Calculations based on FILTERED results
    const totalEmployees = filteredEmployees.length;
    const totalPages = Math.ceil(totalEmployees / itemsPerPage) || 1;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    // 4. Create the list to display
    const currentEmployees = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);

    const changePage = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const showLoading = isLoading && skillMatrices.length === 0;
    const showErrorBanner = error || hierarchyError || skillMatrixError || downloadError;

    if (showLoading) {
        return <div className="flex items-center justify-center h-64"><div className="text-lg">Loading skill matrix data...</div></div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen pt-16">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Error Banner */}
                {showErrorBanner && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm">
                                    {error || hierarchyError || skillMatrixError || downloadError} Some data may be incomplete or unavailable.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="border-b-2 border-blue-200 p-6 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        Skill Matrix & Skill Upgradation Plan
                    </h1>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => handleDownload('report')}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50"
                            title="Download skill matrix report"
                            disabled={downloadLoading === 'report' || !selectedDepartmentId}
                        >
                            <Download className="w-4 h-4" />
                            <span>{downloadLoading === 'report' ? 'Downloading...' : 'Download Report'}</span>
                        </button>
                        <button
                            onClick={handleRefresh}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                            title="Refresh skill matrix data"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Legend */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="text-md font-semibold mb-3 text-gray-700 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Legend
                    </div>
                    <div className="mb-3">
                        <div className="text-sm font-semibold mb-2 text-gray-600">Skill Level Scale:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                            <div className="text-sm flex items-center space-x-2 bg-gray-100 p-2 rounded-md">
                                <SkillDisplay level={0} />
                                <span>0 = Beginner (just started within last week)</span>
                            </div>
                            <div className="text-sm flex items-center space-x-1 bg-gray-100 p-2 rounded-md">
                                <SkillDisplay level={1} />
                                <span>1 = Learner (under training)</span>
                            </div>
                            <div className="text-sm flex items-center space-x-1 bg-gray-100 p-2 rounded-md">
                                <SkillDisplay level={2} />
                                <span>2 = Practitioner (works independently per SOP)</span>
                            </div>
                            <div className="text-sm flex items-center space-x-1 bg-gray-100 p-2 rounded-md">
                                <SkillDisplay level={3} />
                                <span>3 = Expert (works independently)</span>
                            </div>
                            <div className="text-sm flex items-center space-x-1 bg-gray-100 p-2 rounded-md">
                                <SkillDisplay level={4} />
                                <span>4 = Master (can train others)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Matrix Info + Dropdown Row */}
                <div className="border-b border-gray-200 p-5 bg-white">
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2 shadow-sm">
                            <Building className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold text-gray-700">Department:</span>
                            <select
                                value={selectedDepartmentId ?? ''}
                                onChange={(e) => handleDepartmentChange(e.target.value ? Number(e.target.value) : null)}
                                className="border-0 bg-transparent rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-700 font-medium"
                            >
                                <option value="">Select Department</option>
                                {hierarchyData.map((dept) => (
                                    <option key={dept.department_id} value={dept.department_id}>
                                        {dept.department_name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2 shadow-sm">
                            <GitBranch className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold text-gray-700">Line:</span>
                            <select
                                value={selectedLineId ?? ''}
                                onChange={(e) => setSelectedLineId(e.target.value ? Number(e.target.value) : null)}
                                className="border-0 bg-transparent rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-700 font-medium"
                                disabled={!selectedDepartmentId || availableLines.length === 0}
                            >
                                <option value="">Select Line</option>
                                {availableLines.map((line) => (
                                    <option key={line.line_id} value={line.line_id}>
                                        {line.line_name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2 shadow-sm">
                            <Layers className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold text-gray-700">Sub Line:</span>
                            <select
                                value={selectedSublineId ?? ''}
                                onChange={(e) => setSelectedSublineId(e.target.value ? Number(e.target.value) : null)}
                                className="border-0 bg-transparent rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-700 font-medium"
                                disabled={!selectedLineId || availableSublines.length === 0}
                            >
                                <option value="">
                                    {availableSublines.length === 0 ? 'No Sub Lines' : 'Select Sub Line'}
                                </option>
                                {availableSublines.map((subline) => (
                                    <option key={subline.subline_id} value={subline.subline_id}>
                                        {subline.subline_name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2 shadow-sm">
                            <Cpu className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold text-gray-700">Station:</span>
                            <select
                                value={selectedStationId ?? ''}
                                onChange={(e) => handleStationChange(e.target.value ? Number(e.target.value) : null)}
                                className="border-0 bg-transparent rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-700 font-medium"
                                disabled={availableStations.length === 0}
                            >
                                <option value="">
                                    {availableStations.length === 0 ? 'No Stations Available' : 'All Stations'}
                                </option>
                                {availableStations.map((station) => (
                                    <option key={station.station_id} value={station.station_id}>
                                        {station.station_name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                        {(() => {
                            const selectedDept = hierarchyData.find(d => d.department_id === selectedDepartmentId);
                            const selectedLine = availableLines.find(l => l.line_id === selectedLineId);
                            const selectedSubline = availableSublines.find(sl => sl.subline_id === selectedSublineId);
                            const selectedStation = availableStations.find(st => st.station_id === selectedStationId);
                            const depName = selectedDept?.department_name || '-';
                            const lineName = selectedLine?.line_name || '-';
                            const sublineName = selectedSubline?.subline_name || '-';
                            const stationName = selectedStation?.station_name || 'All Stations';
                            return (
                                <div className="flex flex-wrap gap-4">
                                    <span className="flex items-center">
                                        <Building className="w-4 h-4 mr-1 text-blue-600" />
                                        <span className="font-semibold mr-1">Department:</span> {depName}
                                    </span>
                                    <span className="flex items-center">
                                        <GitBranch className="w-4 h-4 mr-1 text-blue-600" />
                                        <span className="font-semibold mr-1">Line:</span> {lineName}
                                    </span>
                                    <span className="flex items-center">
                                        <Layers className="w-4 h-4 mr-1 text-blue-600" />
                                        <span className="font-semibold mr-1">Sub Line:</span> {sublineName}
                                    </span>
                                    <span className="flex items-center">
                                        <Cpu className="w-4 h-4 mr-1 text-blue-600" />
                                        <span className="font-semibold mr-1">Station:</span> {stationName}
                                    </span>
                                    <span className="flex items-center ml-4 text-green-700">
                                        <span className="font-semibold mr-1">Showing:</span> {stationHeaders.length} station(s)
                                    </span>
                                </div>
                            );
                        })()}
                    </div>
                </div>

                {/* Employee Count & Search Bar */}
                <div className="px-5 py-3 bg-blue-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="text-sm text-blue-700 flex items-center flex-wrap">
                        <Users className="w-4 h-4 mr-2" />
                        <span className="font-semibold">{totalEmployees} result(s)</span>
                        {searchQuery && <span className="text-gray-500 ml-1"> (filtered from total)</span>}
                        {!searchQuery && (
                             <span className="ml-1"> in current view</span>
                        )}
                    </div>

                    <div className="relative w-full md:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-blue-500" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-10 py-2 border border-blue-200 rounded-lg leading-5 bg-white placeholder-blue-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                            placeholder="Search Name or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-400 hover:text-blue-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs">
                        <thead>
                            <tr>
                                <th className="border border-gray-300 p-2 w-12 bg-gray-100" rowSpan={3}>Sl. No.</th>
                                <th className="border border-gray-300 p-2 w-16 bg-gray-100" rowSpan={3}>CC No/EMP Code</th>
                                <th className="border border-gray-300 p-2 w-32 bg-gray-100" rowSpan={3}>Employee Name</th>
                                <th className="border border-gray-300 p-2 w-24 bg-gray-100" rowSpan={3}>DOJ</th>
                                <th
                                    className="border border-gray-300 p-2 text-center font-bold bg-blue-100"
                                    colSpan={Math.max(1, stationHeaders.length)}
                                >
                                    Training Points (Stations)
                                </th>
                                <th
                                    className="border border-gray-300 p-2 text-center font-bold bg-green-100"
                                    colSpan={months.length}
                                >
                                    Skill Matrix & Skill Upgradation Plan
                                </th>
                                <th className="border border-gray-300 p-2 text-center font-bold bg-gray-100" rowSpan={3}>
                                    Remarks
                                </th>
                            </tr>
                            <tr>
                                {stationHeaders.length > 0 && stationHeaders.map(st => (
                                    <th
                                        key={st.station_id}
                                        className="border border-gray-300 p-1 text-center text-xs font-bold bg-yellow-100"
                                    >
                                        {st.station_id}
                                    </th>
                                ))}
                                {stationHeaders.length === 0 && (
                                    <th className="border border-gray-300 p-1 text-center text-xs font-bold bg-yellow-100">-</th>
                                )}
                                {selectedMatrix?.department !== 'Assembly' && (
                                    <th className="border border-gray-300 p-2 text-center font-bold bg-green-50" colSpan={months.length}>
                                        Monthly Plan
                                    </th>
                                )}
                            </tr>
                            <tr>
                                {stationHeaders.length > 0 ? (
                                    stationHeaders.map(st => (
                                        <th
                                            key={st.station_id}
                                            className="border border-gray-300 p-1 text-center text-xs font-bold h-20 bg-blue-50"
                                        >
                                            <div className="flex flex-col items-center justify-center h-full">
                                                {st.station_name}
                                            </div>
                                        </th>
                                    ))
                                ) : (
                                    <th className="border border-gray-300 p-1 text-center text-xs font-bold bg-gray-50 h-20">
                                        <div className="flex flex-col items-center justify-center h-full">
                                            No Stations Available
                                        </div>
                                    </th>
                                )}
                                {months.map(month => (
                                    <th
                                        key={month.id}
                                        className="border border-gray-300 p-1 text-center text-xs font-bold bg-green-50"
                                        style={{
                                            height: '80px',
                                            width: '24px'
                                        }}
                                    >
                                        <div
                                            style={{
                                                writingMode: 'vertical-rl',
                                                transform: 'rotate(180deg)',
                                                textAlign: 'center',
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            {month.displayName}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                            {/* <tr className="bg-gray-100">
                                <td className="border border-gray-300 p-2 text-center font-bold" colSpan={4}>Required Level</td>
                                {stationHeaders.length > 0 ? (
                                    stationHeaders.map(st => {
                                        const requiredLevel = getStationMinimumLevel(st.station_id) || 0;
                                        return (
                                            <td key={st.station_id} className="border border-gray-300 p-1 text-center font-bold">
                                                <div className="flex items-center justify-center">
                                                    <SkillDisplay level={requiredLevel} />
                                                </div>
                                            </td>
                                        );
                                    })
                                ) : (
                                    <td className="border border-gray-300 p-1 text-center font-bold">-</td>
                                )}
                                <td className="border border-gray-300 p-1 text-center font-bold bg-gray-100" colSpan={months.length + 1}>
                                </td>
                            </tr>
                             {/* REQUIRED LEVEL ROW */}
                            <tr className="bg-gray-100">
                                <td className="border border-gray-300 p-2 text-center font-bold" colSpan={4}>Required Level</td>
                                {stationHeaders.length > 0 ? (
                                    stationHeaders.map(st => {
                                        const requiredLevel = getStationMinimumLevel(st.station_id) || 0;
                                        return (
                                            <td key={st.station_id} className="border border-gray-300 p-1 text-center font-bold">
                                                <div className="flex items-center justify-center w-full h-full">
                                                    {/* FORCED SQUARE SHAPE: We use LevelBlock directly for the header to match your image */}
                                                    <div className="w-16 h-15"> 
                                                        <LevelBlock level={requiredLevel} colors={levelColors} size={36} />
                                                    </div>
                                                </div>
                                            </td>
                                        );
                                    })
                                ) : (
                                    <td className="border border-gray-300 p-1 text-center font-bold">-</td>
                                )}
                                <td className="border border-gray-300 p-1 text-center font-bold bg-gray-100" colSpan={months.length + 1}>
                                </td>
                            </tr>
                            {/* --- NEW ROW STARTS HERE --- */}

                            <tr className="bg-gray-50">
                                <td className="border border-gray-300 p-2 text-center font-bold text-gray-700" colSpan={4}>
                                    Min Operators
                                </td>
                                {stationHeaders.length > 0 ? (
                                    stationHeaders.map(st => {
                                        const minOps = getStationMinOperators(st.station_id);
                                        return (
                                            <td key={st.station_id} className="border border-gray-300 p-1 text-center font-bold text-blue-800">
                                                {minOps}
                                            </td>
                                        );
                                    })
                                ) : (
                                    <td className="border border-gray-300 p-1 text-center font-bold">-</td>
                                )}
                                {/* Empty cell for calendar columns */}
                                <td className="border border-gray-300 p-1 text-center font-bold bg-gray-50" colSpan={months.length + 1}></td>
                            </tr>
                            {/* --- NEW ROW ENDS HERE --- */}
                        </thead>
                        <tbody>
                            {currentEmployees.length > 0 ? (
                                currentEmployees.map((employee, index) => {
                                    const employeeMonthlySkills = getEmployeeMonthlySkills(employee.employee_code || employee.emp_id);
                                    return (
                                        <tr key={employee.employee_code || employee.emp_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="border border-gray-300 p-2 text-center">{indexOfFirstItem + index + 1}</td>
                                            <td className="border border-gray-300 p-2 text-center font-mono">{employee.employee_code || employee.emp_id || '-'}</td>
                                            <td className="border border-gray-300 p-2">{employee.full_name || '-'}</td>
                                            <td className="border border-gray-300 p-2 text-center">{formatDate(employee.date_of_join)}</td>
                                            {stationHeaders.length > 0 ? (
                                                stationHeaders.map(st => {
                                                    const skillLevel = getOperatorSkillLevel(
                                                        employee.employee_code || employee.emp_id,
                                                        st.station_id
                                                    );
                                                    const skillRecord = skillMatrixData.find(skill =>
                                                        skill.emp_id === (employee.employee_code || employee.emp_id) &&
                                                        skill.station_id === st.station_id
                                                    );
                                                    const updatedDate = skillRecord?.updated_at ? formatDate(skillRecord.updated_at) : null;
                                                    return (
                                                        <td
                                                            key={st.station_id}
                                                            className="border border-gray-300 p-1 text-center"
                                                            title={`${employee.full_name} - ${st.station_name}: Level ${skillLevel}${updatedDate ? ` (Updated: ${updatedDate})` : ''}`}
                                                        >
                                                            <div className="flex flex-col items-center justify-center space-y-1">
                                                                <div className="flex items-center justify-center">
                                                                    <SkillDisplay level={skillLevel} />
                                                                </div>
                                                                {updatedDate && (
                                                                    <div className="text-xs text-gray-500 font-mono leading-tight">
                                                                        {updatedDate}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    );
                                                })
                                            ) : (
                                                <td className="border border-gray-300 p-1 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <span className="text-xs text-gray-400">No stations</span>
                                                    </div>
                                                </td>
                                            )}
                                            {months.map(month => {
                                                const employeeMultiSkills = getEmployeeMultiSkills(employee.employee_code || employee.emp_id);
                                                const monthMultiSkills = employeeMultiSkills.filter(ms => {
                                                    if (!ms.start_date) return false;
                                                    try {
                                                        const startDate = new Date(ms.start_date);
                                                        return startDate.getMonth() + 1 === month.id &&
                                                            startDate.getFullYear() === month.year;
                                                    } catch {
                                                        return false;
                                                    }
                                                });
                                                return (
                                                    <td
                                                        key={month.id}
                                                        className="border border-gray-300 p-1 text-center"
                                                        style={{ width: '24px' }}
                                                    >
                                                        {monthMultiSkills.length > 0 ? (
                                                            <div className="flex flex-col items-center justify-center h-full space-y-1">
                                                                {monthMultiSkills.map(ms => {
                                                                    const stationId = ms.station?.station_id || ms.station || 0;
                                                                    let stationName = ms.station?.station_name;
                                                                    if (!stationName) {
                                                                        const foundStation = availableStations.find(st =>
                                                                            st.station_id === parseInt(stationId.toString())
                                                                        );
                                                                        stationName = foundStation?.station_name;
                                                                    }
                                                                    if (!stationName) {
                                                                        const allStations = hierarchyData.flatMap(dept => [
                                                                            ...(dept.stations || []),
                                                                            ...(dept.lines || []).flatMap(line => [
                                                                                ...(line.stations || []),
                                                                                ...(line.sublines || []).flatMap(sl => sl.stations || [])
                                                                            ]),
                                                                            ...(dept.sublines || []).flatMap(sl => sl.stations || [])
                                                                        ]);
                                                                        const foundInAll = allStations.find(st =>
                                                                            st.station_id === parseInt(stationId.toString())
                                                                        );
                                                                        stationName = foundInAll?.station_name;
                                                                    }
                                                                    if (!stationName) {
                                                                        stationName = `Station ${stationId}`;
                                                                    }
                                                                    const skillLevel = ms.skill_level?.level_number ||
                                                                        parseInt(ms.skill_level) || 0;
                                                                    const isCompleted = ms.status === 'completed';
                                                                    const isInProgress = ms.current_status === 'in-progress';
                                                                    return (
                                                                        <div
                                                                            key={ms.id || `${ms.emp_id}-${ms.station}-${ms.start_date}`}
                                                                            className="flex flex-col items-center space-y-1"
                                                                        >
                                                                            {isCompleted ? (
                                                                                <div
                                                                                    className="flex items-center justify-center w-6 h-6 bg-green-500 text-white rounded-full text-sm font-bold"
                                                                                    title={`Station ${stationId} (${stationName}) - Level ${skillLevel} - Completed`}
                                                                                >
                                                                                    ✓
                                                                                </div>
                                                                            ) : (
                                                                                <div className="flex flex-col items-center space-y-1">
                                                                                    <MonthlySkillDisplay
                                                                                        stationId={stationId}
                                                                                        stationName={stationName}
                                                                                        skillLevel={skillLevel}
                                                                                        size={24}
                                                                                        colors={levelColors}
                                                                                        title={`Station ${stationId} (${stationName}) - Level ${skillLevel} - ${isInProgress ? 'In Progress' : 'Scheduled'}`}
                                                                                    />
                                                                                    <div className="text-xs text-gray-500 font-sans leading-tight truncate w-20">
                                                                                        {stationName}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                            {isCompleted && (
                                                                                <div className="text-xs text-gray-500 font-sans leading-tight truncate w-20">
                                                                                    {stationName}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <div className="text-xs text-gray-400">-</div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            <td className="border border-gray-300 p-2 text-xs">
                                                {employeeMonthlySkills.length > 0
                                                    ? employeeMonthlySkills[0].remarks || '-'
                                                    : '-'}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7 + Math.max(1, stationHeaders.length) + months.length} className="p-8 text-center text-gray-500">
                                        <div className="text-lg font-semibold mb-2">No Employees Found</div>
                                        <div className="text-sm">
                                            No employees found with skills in the selected stations.
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* --- PAGINATION FOOTER CONTROLS --- */}
                {totalEmployees > 0 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-700">
                                Showing <span className="font-semibold">{indexOfFirstItem + 1}</span> to <span className="font-semibold">{Math.min(indexOfLastItem, totalEmployees)}</span> of <span className="font-semibold">{totalEmployees}</span> results
                            </span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="border border-gray-300 rounded-md text-sm py-1 px-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value={10}>10 per page</option>
                                <option value={20}>20 per page</option>
                                <option value={50}>50 per page</option>
                                <option value={100}>100 per page</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => changePage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Previous Page"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            <div className="flex items-center space-x-1">
                                {(() => {
                                    let startPage = Math.max(1, currentPage - 2);
                                    let endPage = Math.min(totalPages, startPage + 4);

                                    if (endPage - startPage < 4) {
                                        startPage = Math.max(1, endPage - 4);
                                    }

                                    const pages = [];
                                    for (let i = startPage; i <= endPage; i++) {
                                        pages.push(i);
                                    }

                                    return pages.map((pageNum) => (
                                        <button
                                            key={pageNum}
                                            onClick={() => changePage(pageNum)}
                                            className={`px-3 py-1 text-sm rounded-md border ${currentPage === pageNum
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    ));
                                })()}
                            </div>

                            <button
                                onClick={() => changePage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Next Page"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SkillMatrixTable;