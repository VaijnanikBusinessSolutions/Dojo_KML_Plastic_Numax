import { useState, useEffect } from 'react';
import { Building, Layers, Zap, Target, Save, X, CheckCircle, ArrowRight, Plus, Loader2, MapPin } from 'lucide-react';
import axios from 'axios';

// Types
type Hq = { hq_id: number; hq_name: string; };
type Department = { department_id: number; department_name: string; factory: number; hq: number; stations?: { id?: number; station_name: string; }[]; };
type Factory = { factory_id: number; factory_name: string; hq: number; stations?: { id?: number; station_name: string; }[]; };
type Line = { line_id: number; line_name: string; department: number; factory: number; hq: number; stations?: { id?: number; station_name: string; }[]; };
type SubLine = { subline_id: number; subline_name: string; line: number; department: number; factory: number; hq: number; };
type Station = { station_id: number; station_name: string; subline: number; line: number; department: number; factory: number; hq: number; };

type PlanStation = { id?: number; station_name: string; };
type PlanSubline = { id?: number; subline_name: string; stations: PlanStation[]; };
type PlanLine = { id?: number; line_name: string; sublines?: PlanSubline[]; stations?: PlanStation[]; };
type PlanDepartment = { id?: number; department_name: string; lines: PlanLine[]; stations?: PlanStation[]; };

type HierarchyStructure = {
  structure_id?: number;
  structure_name: string;
  hq?: number | null;
  factory?: number | null;
  // backend sometimes returns these as top-level props in saved objects, so allow them:
  hq_name?: string;
  factory_name?: string;
  structure_data: {
    hq_name?: string;
    factory_name?: string;
    departments: PlanDepartment[];
    stations?: PlanStation[]; // direct stations under factory/hq if used
  };
};

const API_BASE_URL = 'http://127.0.0.1:8000';
const AUTO_DEPT = 'Auto Department';
const AUTO_LINE = 'Auto Line';
const AUTO_SUBLINE = 'Auto SubLine';

// Components
const ProgressBar = ({ step }: { step: number }) => (
  <div className="w-full bg-gray-200 rounded-full h-4 mb-8">
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500" style={{ width: `${step * 16.67}%` }}></div>
  </div>
);

const SelectionCard = ({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<any>; children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
      <Icon className="mr-2 text-blue-600" size={20} />
      {title}
    </h3>
    {children}
  </div>
);

const OptionButton = ({ option, isSelected, onClick, variant = 'default' }: { option: string; isSelected: boolean; onClick: () => void; variant?: 'default' | 'small'; }) => {
  const baseClasses = `rounded-lg font-medium transition-all duration-200 flex items-center justify-center cursor-pointer ${isSelected ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`;
  const sizeClasses = variant === 'small' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2.5';
  return <div className={`${baseClasses} ${sizeClasses}`} onClick={onClick}>{option}</div>;
};

const RemoveButton = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
    <X size={16} />
  </button>
);

const Planning = () => {
  const [plan, setPlan] = useState<HierarchyStructure>({
    structure_name: '',
    hq: null,
    factory: null,
    structure_data: { departments: [], stations: [] }
  });
  const [showSummary, setShowSummary] = useState(false);
  const [newItems, setNewItems] = useState({ hq: '', factory: '', department: '', line: '', subline: '', station: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [savedStructures, setSavedStructures] = useState<HierarchyStructure[]>([]);
  const [selectedStructure, setSelectedStructure] = useState<HierarchyStructure | null>(null);
  const [data, setData] = useState({ hqs: [] as Hq[], factories: [] as Factory[], departments: [] as Department[], lines: [] as Line[], sublines: [] as SubLine[], stations: [] as Station[] });
  const [isLoading, setIsLoading] = useState({ hqs: false, factories: false, departments: false, lines: false, sublines: false, stations: false, structures: false });
  const [levelEnabled, setLevelEnabled] = useState({ hq: true, factory: true, department: true, line: true, subline: true, station: true });

  const effectiveEnabled = {
    hq: levelEnabled.hq,
    factory: levelEnabled.hq && levelEnabled.factory,
    department: levelEnabled.hq && levelEnabled.factory && levelEnabled.department,
    line: levelEnabled.hq && levelEnabled.factory && levelEnabled.department && levelEnabled.line,
    subline: levelEnabled.hq && levelEnabled.factory && levelEnabled.department && levelEnabled.line && levelEnabled.subline,
    station: levelEnabled.hq && levelEnabled.factory && levelEnabled.department && levelEnabled.line && levelEnabled.subline && levelEnabled.station
  };

  // API calls
  const fetchData = async (endpoint: string, key: keyof typeof data) => {
    setIsLoading(prev => ({ ...prev, [key]: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/${endpoint}`);
      setData(prev => ({ ...prev, [key]: response.data }));
    } catch (error) {
      console.error(`Error fetching ${key}:`, error);
    } finally {
      setIsLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const fetchFactories = (hqId?: number) => fetchData(hqId ? `factories/?hq=${hqId}` : 'factories/', 'factories');
  const fetchDepartments = (factoryId?: number, hqId?: number) => fetchData(`departments/${factoryId ? `?factory=${factoryId}` : hqId ? `?hq=${hqId}` : ''}`, 'departments');
  const fetchLines = (departmentId?: number, factoryId?: number, hqId?: number) => fetchData(`lines/${departmentId ? `?department=${departmentId}` : factoryId ? `?factory=${factoryId}` : hqId ? `?hq=${hqId}` : ''}`, 'lines');
  const fetchSubLines = (lineId?: number, departmentId?: number, factoryId?: number, hqId?: number) => fetchData(`sublines/${lineId ? `?line=${lineId}` : departmentId ? `?department=${departmentId}` : factoryId ? `?factory=${factoryId}` : hqId ? `?hq=${hqId}` : ''}`, 'sublines');
  const fetchStations = (sublineId?: number, lineId?: number, departmentId?: number, factoryId?: number, hqId?: number) => fetchData(`stations/${sublineId ? `?subline=${sublineId}` : lineId ? `?line=${lineId}` : departmentId ? `?department=${departmentId}` : factoryId ? `?factory=${factoryId}` : hqId ? `?hq=${hqId}` : ''}`, 'stations');
  const fetchHqs = () => fetchData('hq/', 'hqs');
  const fetchHierarchyStructures = async () => {
    setIsLoading(prev => ({ ...prev, structures: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/hierarchy-simple/`);
      setSavedStructures(response.data);
    } catch (error) {
      console.error('Error fetching hierarchy structures:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, structures: false }));
    }
  };

  // Handler functions
  const handleAddNewItem = async (type: keyof typeof newItems) => {
    if (!newItems[type]) return;
    const endpointMap = { hq: 'hq/', factory: 'factories/', department: 'departments/', line: 'lines/', subline: 'sublines/', station: 'stations/' };
    const nameFieldMap = { hq: 'hq_name', factory: 'factory_name', department: 'department_name', line: 'line_name', subline: 'subline_name', station: 'station_name' };

    try {
      const payload = { [nameFieldMap[type]]: newItems[type] };
      await axios.post(`${API_BASE_URL}/${endpointMap[type]}`, payload);
      setNewItems(prev => ({ ...prev, [type]: '' }));

      if (type === 'hq') await fetchHqs();
      else if (type === 'factory' && plan.structure_data.hq_name) {
        const hq = data.hqs.find(h => h.hq_name === plan.structure_data.hq_name);
        if (hq) await fetchFactories(hq.hq_id);
      } else if (type === 'department' && plan.structure_data.factory_name) {
        const factory = data.factories.find(f => f.factory_name === plan.structure_data.factory_name);
        if (factory) await fetchDepartments(factory.factory_id);
      }
    } catch (error) {
      console.error(`Error adding ${type}:`, error);
    }
  };

  const handleHqSelect = (hqName: string) => {
    const selectedHq = data.hqs.find(h => h.hq_name === hqName);
    if (selectedHq) {
      setPlan(prev => ({
        ...prev,
        hq: selectedHq.hq_id,
        structure_data: { ...prev.structure_data, hq_name: hqName, departments: [], stations: [] }
      }));
      fetchFactories(selectedHq.hq_id);
      setShowSummary(false);
      setSelectedStructure(null);
    }
  };

  const handleFactorySelect = (factoryName: string) => {
    const selectedFactory = data.factories.find(f => f.factory_name === factoryName);
    if (selectedFactory) {
      setPlan(prev => ({
        ...prev,
        factory: selectedFactory.factory_id,
        structure_data: { ...prev.structure_data, factory_name: factoryName, departments: [], stations: [] }
      }));
      fetchDepartments(selectedFactory.factory_id);
      setShowSummary(false);
      setSelectedStructure(null);
    }
  };

  const handleDepartmentSelect = (departmentName: string) => {
    const selectedDepartment = data.departments.find(d => d.department_name === departmentName);
    if (selectedDepartment) {
      setPlan(prev => {
        const isSelected = prev.structure_data.departments.some(d => d.department_name === departmentName);

        if (isSelected) {
          // Deselect department
          return {
            ...prev,
            structure_data: {
              ...prev.structure_data,
              departments: prev.structure_data.departments.filter(d => d.department_name !== departmentName)
            }
          };
        } else {
          // Select department
          return {
            ...prev,
            structure_data: {
              ...prev.structure_data,
              departments: [
                ...prev.structure_data.departments,
                {
                  department_name: departmentName,
                  id: selectedDepartment.department_id,
                  lines: [],
                  stations: !levelEnabled.line ? [] : undefined
                }
              ]
            }
          };
        }
      });

      if (levelEnabled.line) {
        // Fetch lines for the selected department
        fetchLines(selectedDepartment.department_id);
      } else if (levelEnabled.station) {
        fetchStations(undefined, undefined, selectedDepartment.department_id);
      }
      setShowSummary(false);
    }
  };
  const handleLineSelect = (departmentIndex: number, lineName: string) => {
    const selectedLine = data.lines.find(l => l.line_name === lineName);
    if (selectedLine) {
      setPlan(prev => {
        const updatedDepartments = [...prev.structure_data.departments];
        const department = updatedDepartments[departmentIndex];
        const isSelected = department.lines.some(l => l.line_name === lineName);

        if (isSelected) {
          // Deselect line
          updatedDepartments[departmentIndex] = {
            ...department,
            lines: department.lines.filter(l => l.line_name !== lineName)
          };
        } else {
          // Select line
          updatedDepartments[departmentIndex] = {
            ...department,
            lines: [
              ...department.lines,
              {
                line_name: lineName,
                id: selectedLine.line_id,
                sublines: levelEnabled.subline ? [] : undefined,
                stations: !levelEnabled.subline ? [] : undefined
              }
            ]
          };
        }

        return { ...prev, structure_data: { ...prev.structure_data, departments: updatedDepartments } };
      });

      if (levelEnabled.subline) fetchSubLines(selectedLine.line_id);
      else if (levelEnabled.station) fetchStations(undefined, selectedLine.line_id);
      setShowSummary(false);
    }
  };


  const handleSubLineSelect = (departmentIndex: number, lineIndex: number, sublineName: string) => {
    const selectedSubLine = data.sublines.find(s => s.subline_name === sublineName);
    if (selectedSubLine) {
      setPlan(prev => {
        const updatedDepartments = [...prev.structure_data.departments];
        const updatedLines = [...updatedDepartments[departmentIndex].lines];
        const updatedSubLines = [...updatedLines[lineIndex].sublines || []];

        const sublineIndex = updatedSubLines.findIndex(s => s.subline_name === sublineName);
        if (sublineIndex === -1) {
          updatedSubLines.push({ subline_name: sublineName, id: selectedSubLine.subline_id, stations: [] });
        } else {
          updatedSubLines.splice(sublineIndex, 1);
        }

        updatedLines[lineIndex] = { ...updatedLines[lineIndex], sublines: updatedSubLines };
        updatedDepartments[departmentIndex] = { ...updatedDepartments[departmentIndex], lines: updatedLines };
        return { ...prev, structure_data: { ...prev.structure_data, departments: updatedDepartments } };
      });
      fetchStations(selectedSubLine.subline_id);
      setShowSummary(false);
    }
  };

  const handleDepartmentStationSelect = (departmentIndex: number, stationId: number) => {
    const selectedStation = data.stations.find(s => s.station_id === stationId);
    if (!selectedStation) return;

    setPlan(prev => {
      const updatedDepartments = [...prev.structure_data.departments];
      const department = updatedDepartments[departmentIndex];
      const updatedStations = [...(department.stations || [])];

      const stationIndex = updatedStations.findIndex(s => s.id === stationId);
      if (stationIndex === -1) {
        updatedStations.push({ station_name: selectedStation.station_name, id: selectedStation.station_id });
      } else {
        updatedStations.splice(stationIndex, 1);
      }

      updatedDepartments[departmentIndex] = { ...department, stations: updatedStations };
      return { ...prev, structure_data: { ...prev.structure_data, departments: updatedDepartments } };
    });

    setShowSummary(false);
  };


  const handleStationSelect = (departmentIndex: number, lineIndex: number, sublineIndex: number | null, stationId: number) => {
    const selectedStation = data.stations.find(s => s.station_id === stationId);
    if (!selectedStation) return;

    setPlan(prev => {
      const updatedDepartments = [...prev.structure_data.departments];
      const department = updatedDepartments[departmentIndex];
      const updatedLines = [...(department.lines || [])];

      if (sublineIndex !== null && levelEnabled.subline) {
        const updatedSubLines = [...(updatedLines[lineIndex]?.sublines || [])];
        const updatedStations = [...(updatedSubLines[sublineIndex]?.stations || [])];

        const stationIndex = updatedStations.findIndex(s => s.id === stationId);
        if (stationIndex === -1) {
          updatedStations.push({ station_name: selectedStation.station_name, id: selectedStation.station_id });
        } else {
          updatedStations.splice(stationIndex, 1);
        }

        updatedSubLines[sublineIndex] = { ...(updatedSubLines[sublineIndex] || { subline_name: '', stations: [] }), stations: updatedStations };
        updatedLines[lineIndex] = { ...(updatedLines[lineIndex] || { line_name: '', sublines: [], stations: [] }), sublines: updatedSubLines };
        updatedDepartments[departmentIndex] = { ...department, lines: updatedLines };
      } else {
        const updatedStations = [...(updatedLines[lineIndex]?.stations || [])];

        const stationIndex = updatedStations.findIndex(s => s.id === stationId);
        if (stationIndex === -1) {
          updatedStations.push({ station_name: selectedStation.station_name, id: selectedStation.station_id });
        } else {
          updatedStations.splice(stationIndex, 1);
        }

        updatedLines[lineIndex] = { ...(updatedLines[lineIndex] || { line_name: '', sublines: [], stations: [] }), stations: updatedStations };
        updatedDepartments[departmentIndex] = { ...department, lines: updatedLines };
      }

      return { ...prev, structure_data: { ...prev.structure_data, departments: updatedDepartments } };
    });

    setShowSummary(false);
  };



  const removeDepartment = (index: number) => {
    setPlan(prev => ({
      ...prev,
      structure_data: { ...prev.structure_data, departments: prev.structure_data.departments.filter((_, i) => i !== index) }
    }));
  };

  const removeLine = (departmentIndex: number, lineIndex: number) => {
    setPlan(prev => {
      const updatedDepartments = [...prev.structure_data.departments];
      updatedDepartments[departmentIndex] = {
        ...updatedDepartments[departmentIndex],
        lines: updatedDepartments[departmentIndex].lines.filter((_, i) => i !== lineIndex)
      };
      return { ...prev, structure_data: { ...prev.structure_data, departments: updatedDepartments } };
    });
  };

  const removeSubLine = (departmentIndex: number, lineIndex: number, sublineIndex: number) => {
    setPlan(prev => {
      const updatedDepartments = [...prev.structure_data.departments];
      const updatedLines = [...updatedDepartments[departmentIndex].lines];
      updatedLines[lineIndex] = {
        ...updatedLines[lineIndex],
        sublines: updatedLines[lineIndex].sublines?.filter((_, i) => i !== sublineIndex) || []
      };
      updatedDepartments[departmentIndex] = { ...updatedDepartments[departmentIndex], lines: updatedLines };
      return { ...prev, structure_data: { ...prev.structure_data, departments: updatedDepartments } };
    });
  };

  const saveHierarchyStructure = async () => {
    if (!hasCompletePlan()) return;
    setIsSaving(true);

    try {
      const payload = {
        structure_name: plan.structure_name || `Structure-${Date.now()}`,
        structure_data: plan.structure_data,
        hq: plan.hq || null,
        factory: plan.factory || null
      };

      const isCreate = !plan.structure_id;

      if (isCreate) {
        await axios.post(`${API_BASE_URL}/hierarchy-structures/`, payload);
        // notify only on create
        alert('New hierarchy saved');
      } else {
        await axios.put(`${API_BASE_URL}/hierarchy-structures/${plan.structure_id}/`, payload);
        // notify only on update
        alert('Hierarchy updated successfully');
      }

      // refresh saved list and show summary
      await fetchHierarchyStructures();
      setShowSummary(true);
    } catch (error: any) {
      console.error('Error saving/updating hierarchy structure:', error);
      // prefer server-provided message if present
      const serverMsg = error?.response?.data?.detail || error?.response?.data || null;
      const message = typeof serverMsg === 'string' ? serverMsg : (serverMsg ? JSON.stringify(serverMsg) : error?.message || 'Failed to save/update plan');
      alert(`Error: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };


  const loadStructure = (structure: HierarchyStructure) => {
    setPlan(structure);
    setSelectedStructure(structure);
    setShowSummary(false);

    // compute what exists in the loaded structure
    const departments = structure.structure_data?.departments || [];
    const hasDepartments = departments.length > 0;
    const hasLines = departments.some(d => !!(d.lines && d.lines.length > 0));
    const hasSublines = departments.some(d => d.lines?.some(l => !!(l.sublines && l.sublines.length > 0)));
    const hasDirectStations = Boolean(structure.structure_data?.stations && structure.structure_data.stations.length > 0);
    const hasDeptStations = departments.some(d => !!(d.stations && d.stations.length > 0));
    const hasLineStations = departments.some(d => d.lines?.some(l => !!(l.stations && l.stations.length > 0)));
    const hasNestedStations = departments.some(d => d.lines?.some(l => l.sublines?.some(s => !!(s.stations && s.stations.length > 0))));
    const hasStations = hasDirectStations || hasDeptStations || hasLineStations || hasNestedStations;

    // update levelEnabled so the UI matches the saved structure
    setLevelEnabled(prev => ({
      ...prev,
      // preserve HQ/factory toggles as they are (you can change this if you want to auto-toggle them too)
      department: hasDepartments,
      // show line level only if there are lines or there are stations attached to lines
      line: hasLines || hasLineStations || hasNestedStations,
      // show subline level only if sublines exist
      subline: hasSublines,
      // show station level if any station exists anywhere in the structure
      station: hasStations
    }));

    // fetch children so the selection lists (lines, sublines, stations) populate correctly
    if (structure.hq) fetchFactories(structure.hq);
    if (structure.factory) fetchDepartments(structure.factory);

    departments.forEach((dept) => {
      if (dept.id) {
        fetchLines(dept.id);

        if (dept.stations && dept.stations.length > 0) {
          // populate department-level stations
          fetchStations(undefined, undefined, dept.id);
        }

        (dept.lines || []).forEach((line) => {
          if (line.id) {
            fetchSubLines(line.id);

            if (line.stations && line.stations.length > 0) {
              // populate line-level stations
              fetchStations(undefined, line.id);
            }

            (line.sublines || []).forEach((sub) => {
              if (sub.id) {
                // populate subline stations
                fetchStations(sub.id);
              }
            });
          }
        });
      }
    });
  };


  const hasCompletePlan = () => {
    if (levelEnabled.hq && !plan.structure_data.hq_name) return false;
    if (levelEnabled.factory && !plan.structure_data.factory_name) return false;

    const hasDepartments = plan.structure_data.departments.length > 0;
    if (levelEnabled.department && !hasDepartments) return false;

    if (levelEnabled.line && !plan.structure_data.departments.some(d => d.lines.length > 0)) return false;
    if (levelEnabled.subline && !plan.structure_data.departments.some(d => d.lines.some(l => l.sublines && l.sublines.length > 0))) return false;

    if (levelEnabled.station) {
      const hasDirectStations = plan.structure_data.stations && plan.structure_data.stations.length > 0;
      const hasDeptStations = plan.structure_data.departments.some(d => d.stations && d.stations.length > 0);
      const hasNestedStations = plan.structure_data.departments.some(d => d.lines.some(l => l.sublines?.some(s => s.stations.length > 0)));
      const hasLineStations = plan.structure_data.departments.some(d => d.lines.some(l => l.stations && l.stations.length > 0));
      if (!hasDirectStations && !hasDeptStations && !hasNestedStations && !hasLineStations) return false;
    }
    return true;
  };

  const getProgressStep = () => {
    if (levelEnabled.hq && !plan.structure_data.hq_name) return 1;
    if (levelEnabled.factory && !plan.structure_data.factory_name) return 1;

    const hasDepartments = plan.structure_data.departments.length > 0;
    if (levelEnabled.department && !hasDepartments) return 2;

    if (levelEnabled.line && !plan.structure_data.departments.some(d => d.lines.length > 0)) return 3;
    if (levelEnabled.subline && !plan.structure_data.departments.some(d => d.lines.some(l => l.sublines && l.sublines.length > 0))) return 4;

    if (levelEnabled.station) {
      const hasDirectStations = plan.structure_data.stations && plan.structure_data.stations.length > 0;
      const hasDeptStations = plan.structure_data.departments.some(d => d.stations && d.stations.length > 0);
      const hasNestedStations = plan.structure_data.departments.some(d => d.lines.some(l => l.sublines?.some(s => s.stations.length > 0)));
      const hasLineStations = plan.structure_data.departments.some(d => d.lines.some(l => l.stations && l.stations.length > 0));
      if (!hasDirectStations && !hasDeptStations && !hasNestedStations && !hasLineStations) return 5;
    }
    return 6;
  };

  const handleGlobalLineSelect = (lineName: string) => {
    const selectedLine = data.lines.find(l => l.line_name === lineName);
    setPlan(prev => {
      let departments = [...prev.structure_data.departments];
      let deptIndex = departments.findIndex(d => d.department_name === AUTO_DEPT);

      if (deptIndex === -1) {
        departments.push({ department_name: AUTO_DEPT, lines: [], stations: !levelEnabled.line ? [] : undefined });
        deptIndex = departments.length - 1;
      }

      const dept = departments[deptIndex];
      const exists = dept.lines.some(l => l.line_name === lineName);
      const newLines = exists
        ? dept.lines.filter(l => l.line_name !== lineName)
        : [...dept.lines, {
          line_name: lineName,
          id: selectedLine?.line_id,
          sublines: levelEnabled.subline ? [] : undefined,
          stations: !levelEnabled.subline ? [] : undefined
        }];

      departments[deptIndex] = { ...dept, lines: newLines };
      return { ...prev, structure_data: { ...prev.structure_data, departments } };
    });

    if (selectedLine?.line_id) {
      if (levelEnabled.subline) fetchSubLines(selectedLine.line_id);
      else if (levelEnabled.station) fetchStations(undefined, selectedLine.line_id);
    }
    setShowSummary(false);
  };

  const handleGlobalSubLineSelect = (sublineName: string) => {
    const selectedSubLine = data.sublines.find(s => s.subline_name === sublineName);
    setPlan(prev => {
      let departments = [...prev.structure_data.departments];
      let deptIndex = departments.findIndex(d => d.department_name === AUTO_DEPT);

      if (deptIndex === -1) {
        departments.push({ department_name: AUTO_DEPT, lines: [] });
        deptIndex = departments.length - 1;
      }

      let lines = [...departments[deptIndex].lines];
      let lineIndex = lines.findIndex(l => l.line_name === AUTO_LINE);

      if (lineIndex === -1) {
        lines.push({ line_name: AUTO_LINE, sublines: [], stations: !levelEnabled.subline ? [] : undefined });
        lineIndex = lines.length - 1;
      }

      const line = lines[lineIndex];
      const exists = line.sublines?.some(s => s.subline_name === sublineName);
      const newSubLines = exists
        ? line.sublines?.filter(s => s.subline_name !== sublineName) || []
        : [...(line.sublines || []), { subline_name: sublineName, id: selectedSubLine?.subline_id, stations: [] }];

      lines[lineIndex] = { ...line, sublines: newSubLines };
      departments[deptIndex] = { ...departments[deptIndex], lines };
      return { ...prev, structure_data: { ...prev.structure_data, departments } };
    });

    if (selectedSubLine?.subline_id) fetchStations(selectedSubLine.subline_id);
    setShowSummary(false);
  };

  const handleGlobalStationSelect = (stationName: string) => {
    const selectedStation = data.stations.find(s => s.station_name === stationName);
    if (!selectedStation) return;

    setPlan(prev => {
      // Case: no dept/line/subline - store in top-level stations
      if (!levelEnabled.department && !levelEnabled.line && !levelEnabled.subline && levelEnabled.station) {
        const currentStations = prev.structure_data.stations || [];
        const exists = currentStations.some(s => s.id === selectedStation.station_id);
        const newStations = exists
          ? currentStations.filter(s => s.id !== selectedStation.station_id)
          : [...currentStations, { station_name: stationName, id: selectedStation.station_id }];
        return { ...prev, structure_data: { ...prev.structure_data, stations: newStations } };
      }

      // Ensure an AUTO_DEPT exists
      let departments = [...prev.structure_data.departments];
      let deptIndex = departments.findIndex(d => d.department_name === AUTO_DEPT);

      if (deptIndex === -1) {
        departments.push({ department_name: AUTO_DEPT, lines: [], stations: !levelEnabled.line ? [] : undefined });
        deptIndex = departments.length - 1;
      }

      // If lines are disabled but stations allowed directly under department
      if (!levelEnabled.line && levelEnabled.station) {
        const dept = departments[deptIndex];
        const exists = dept.stations?.some(s => s.id === selectedStation.station_id);
        const newStations = exists
          ? dept.stations?.filter(s => s.id !== selectedStation.station_id) || []
          : [...(dept.stations || []), { station_name: stationName, id: selectedStation.station_id }];

        departments[deptIndex] = { ...dept, stations: newStations };
        return { ...prev, structure_data: { ...prev.structure_data, departments } };
      }

      // Otherwise put station under AUTO_LINE (and AUTO_SUBLINE if subline enabled)
      let lines = [...departments[deptIndex].lines];
      let lineIndex = lines.findIndex(l => l.line_name === AUTO_LINE);

      if (lineIndex === -1) {
        lines.push({ line_name: AUTO_LINE, sublines: [], stations: !levelEnabled.subline ? [] : undefined });
        lineIndex = lines.length - 1;
      }

      if (levelEnabled.subline) {
        let sublines = [...(lines[lineIndex].sublines || [])];
        let sublineIndex = sublines.findIndex(s => s.subline_name === AUTO_SUBLINE);

        if (sublineIndex === -1) {
          sublines.push({ subline_name: AUTO_SUBLINE, stations: [] });
          sublineIndex = sublines.length - 1;
        }

        const subline = sublines[sublineIndex];
        const exists = subline.stations.some(s => s.id === selectedStation.station_id);
        const newStations = exists
          ? subline.stations.filter(s => s.id !== selectedStation.station_id)
          : [...subline.stations, { station_name: stationName, id: selectedStation.station_id }];

        sublines[sublineIndex] = { ...subline, stations: newStations };
        lines[lineIndex] = { ...lines[lineIndex], sublines };
      } else {
        const line = lines[lineIndex];
        const exists = line.stations?.some(s => s.id === selectedStation.station_id);
        const newStations = exists
          ? line.stations?.filter(s => s.id !== selectedStation.station_id) || []
          : [...(line.stations || []), { station_name: stationName, id: selectedStation.station_id }];

        lines[lineIndex] = { ...line, stations: newStations };
      }

      departments[deptIndex] = { ...departments[deptIndex], lines };
      return { ...prev, structure_data: { ...prev.structure_data, departments } };
    });

    setShowSummary(false);
  };


  // Initial data fetch
  useEffect(() => {
    fetchHqs();
    fetchHierarchyStructures();
  }, []);

  useEffect(() => {
    if (!levelEnabled.hq) fetchFactories();
  }, [levelEnabled.hq]);

  useEffect(() => {
    if (!levelEnabled.factory && levelEnabled.department) fetchDepartments();
  }, [levelEnabled.factory, levelEnabled.department]);

  useEffect(() => {
    if (!levelEnabled.department && levelEnabled.line) fetchLines();
  }, [levelEnabled.department, levelEnabled.line]);

  useEffect(() => {
    if (!levelEnabled.line && levelEnabled.subline) fetchSubLines();
  }, [levelEnabled.line, levelEnabled.subline]);

  useEffect(() => {
    if (!levelEnabled.subline && levelEnabled.station) fetchStations();
  }, [levelEnabled.subline, levelEnabled.station]);

  // Plan summary component
  const PlanSummary = () => (
    <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-2xl shadow-xl p-8 border border-green-200">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <CheckCircle className="text-white" size={32} />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Manufacturing Plan Summary</h3>
        <p className="text-gray-600">Your production hierarchy is ready!</p>
      </div>

      <div className="space-y-8">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-center space-x-8">
            {effectiveEnabled.hq && plan.structure_data.hq_name && (
              <div className="flex items-center">
                <MapPin className="text-red-600 mr-3" size={20} />
                <div>
                  <span className="text-sm text-gray-500 block">Headquarters</span>
                  <span className="font-semibold text-gray-800 text-xl">{plan.structure_data.hq_name}</span>
                </div>
              </div>
            )}
            {effectiveEnabled.factory && plan.structure_data.factory_name && (
              <div className="flex items-center">
                <Building className="text-purple-600 mr-3" size={20} />
                <div>
                  <span className="text-sm text-gray-500 block">Factory</span>
                  <span className="font-semibold text-gray-800 text-xl">{plan.structure_data.factory_name}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 overflow-x-auto">
          <h4 className="text-xl font-bold text-gray-800 mb-6 text-center">Production Flow Hierarchy</h4>
          <div className="flex flex-col items-center min-w-max">
            {effectiveEnabled.hq && plan.structure_data.hq_name && (
              <>
                <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-4 rounded-xl shadow-lg font-semibold flex items-center mb-6">
                  <MapPin className="mr-3" size={24} />
                  {plan.structure_data.hq_name}
                </div>
                <div className="w-0.5 h-8 bg-gradient-to-b from-red-400 to-purple-400 mb-4"></div>
              </>
            )}

            {effectiveEnabled.factory && plan.structure_data.factory_name && (
              <>
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-4 rounded-xl shadow-lg font-semibold flex items-center mb-6">
                  <Building className="mr-3" size={24} />
                  {plan.structure_data.factory_name}
                </div>
                {/* <div className="w-0.5 h-8 bg-gradient-to-b from-purple-400 to-blue-400 mb-4"></div> */}
              </>
            )}

            {!levelEnabled.department && !levelEnabled.line && !levelEnabled.subline && levelEnabled.station &&
              plan.structure_data.stations && plan.structure_data.stations.length > 0 && (
                <>
                  <div className="w-0.5 h-8 bg-gradient-to-b from-purple-400 to-red-400 mb-4"></div>
                  <div className="flex flex-col items-center">
                    {/* <h5 className="text-lg font-semibold text-gray-700 mb-4">Stations</h5> */}
                    <div className="flex flex-wrap gap-3 justify-center">
                      {plan.structure_data.stations.map((station, stationIdx) => (
                        <div key={stationIdx} className="bg-gradient-to-r from-red-400 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center">
                          <Target className="mr-2" size={16} />
                          {station.station_name}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

            {levelEnabled.department && plan.structure_data.departments.length > 0 && (
              <>
                <div className="w-0.5 h-8 bg-gradient-to-b from-purple-400 to-blue-400 mb-4"></div>
                <div className="flex flex-col items-center">
                  {plan.structure_data.departments.length > 1 && (
                    <div className="relative mb-4">
                      <div className="h-0.5 bg-gradient-to-r from-blue-400 to-blue-400" style={{ width: `${(plan.structure_data.departments.length - 1) * 300 + 160}px` }}></div>
                      {plan.structure_data.departments.map((_, idx) => (
                        <div key={idx} className="absolute w-0.5 h-4 bg-blue-400" style={{ left: `${idx * 300 + 80}px`, top: '0px' }}></div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-12 mb-6">
                    {plan.structure_data.departments.map((department, deptIdx) => (
                      <div key={deptIdx} className="flex flex-col items-center">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-lg shadow-md font-medium flex items-center mb-4">
                          <Layers className="mr-2" size={20} />
                          {department.department_name}
                        </div>

                        {!levelEnabled.line && levelEnabled.station && department.stations && department.stations.length > 0 && (
                          <>
                            <div className="w-0.5 h-6 bg-gradient-to-b from-blue-400 to-red-400 mb-3"></div>
                            <div className="flex flex-col items-center">
                              {/* <h6 className="text-sm font-semibold text-gray-700 mb-2">Stations</h6> */}
                              <div className="flex flex-wrap gap-2 justify-center">
                                {department.stations.map((station, stationIdx) => (
                                  <div key={stationIdx} className="bg-gradient-to-r from-red-400 to-red-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center">
                                    <Target className="mr-1" size={10} />
                                    {station.station_name}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                        {levelEnabled.line && department.lines.length > 0 && (
                          <>
                            <div className="w-0.5 h-6 bg-gradient-to-b from-blue-400 to-green-400 mb-4"></div>
                            <div className="flex flex-col items-center">
                              {department.lines.length > 1 && (
                                <div className="relative mb-4">
                                  <div className="h-0.5 bg-gradient-to-r from-green-400 to-green-400" style={{ width: `${(department.lines.length - 1) * 200 + 120}px` }}></div>
                                  {department.lines.map((_, idx) => (
                                    <div key={idx} className="absolute w-0.5 h-4 bg-green-400" style={{ left: `${idx * 200 + 60}px`, top: '0px' }}></div>
                                  ))}
                                </div>
                              )}

                              <div className="flex gap-8">
                                {department.lines.map((line, lineIdx) => (
                                  <div key={lineIdx} className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2 rounded-lg shadow-md font-medium flex items-center mb-3">
                                      <Zap className="mr-2" size={18} />
                                      {line.line_name}
                                    </div>

                                    {levelEnabled.subline && line.sublines && line.sublines.length > 0 && (
                                      <>
                                        <div className="w-0.5 h-6 bg-gradient-to-b from-green-400 to-yellow-400 mb-3"></div>
                                        <div className="flex flex-col items-center">
                                          {line.sublines.length > 1 && (
                                            <div className="relative mb-3">
                                              <div className="h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-400" style={{ width: `${(line.sublines.length - 1) * 120 + 80}px` }}></div>
                                              {line.sublines.map((_, idx) => (
                                                <div key={idx} className="absolute w-0.5 h-3 bg-yellow-400" style={{ left: `${idx * 120 + 40}px`, top: '0px' }}></div>
                                              ))}
                                            </div>
                                          )}

                                          <div className="flex gap-6">
                                            {line.sublines.map((subline, sublineIdx) => (
                                              <div key={sublineIdx} className="flex flex-col items-center">
                                                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-md shadow text-sm font-medium flex items-center mb-2">
                                                  <Zap className="mr-1" size={14} />
                                                  {subline.subline_name}
                                                </div>

                                                {levelEnabled.station && subline.stations.length > 0 && (
                                                  <>
                                                    <div className="w-0.5 h-4 bg-gradient-to-b from-yellow-400 to-red-400 mb-2"></div>
                                                    <div className="flex flex-col items-center">
                                                      {subline.stations.length > 1 && (
                                                        <div className="relative mb-2">
                                                          <div className="h-0.5 bg-gradient-to-r from-red-400 to-red-400" style={{ width: `${(subline.stations.length - 1) * 80 + 60}px` }}></div>
                                                          {subline.stations.map((_, idx) => (
                                                            <div key={idx} className="absolute w-0.5 h-2 bg-red-400" style={{ left: `${idx * 80 + 30}px`, top: '0px' }}></div>
                                                          ))}
                                                        </div>
                                                      )}

                                                      <div className="flex gap-3">
                                                        {subline.stations.map((station, stationIdx) => (
                                                          <div key={stationIdx} className="bg-gradient-to-r from-red-400 to-red-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center">
                                                            <Target className="mr-1" size={10} />
                                                            {station.station_name}
                                                          </div>
                                                        ))}
                                                      </div>
                                                    </div>
                                                  </>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </>
                                    )}

                                    {!levelEnabled.subline && levelEnabled.station && line.stations && line.stations.length > 0 && (
                                      <>
                                        <div className="w-0.5 h-6 bg-gradient-to-b from-green-400 to-red-400 mb-3"></div>
                                        <div className="flex flex-col items-center">
                                          {line.stations.length > 1 && (
                                            <div className="relative mb-3">
                                              <div className="h-0.5 bg-gradient-to-r from-red-400 to-red-400" style={{ width: `${(line.stations.length - 1) * 80 + 60}px` }}></div>
                                              {line.stations.map((_, idx) => (
                                                <div key={idx} className="absolute w-0.5 h-3 bg-red-400" style={{ left: `${idx * 80 + 30}px`, top: '0px' }}></div>
                                              ))}
                                            </div>
                                          )}

                                          <div className="flex gap-3">
                                            {line.stations.map((station, stationIdx) => (
                                              <div key={stationIdx} className="bg-gradient-to-r from-red-400 to-red-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center">
                                                <Target className="mr-1" size={10} />
                                                {station.station_name}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h5 className="text-sm font-semibold text-gray-600 mb-3">Hierarchy Legend:</h5>
            <div className="flex flex-wrap justify-center gap-4 text-xs">
              {[
                levelEnabled.hq && { color: 'from-red-500 to-pink-600', label: 'Headquarters' },
                levelEnabled.factory && { color: 'from-purple-500 to-indigo-600', label: 'Factory' },
                levelEnabled.department && { color: 'from-blue-500 to-cyan-600', label: 'Department' },
                levelEnabled.line && { color: 'from-green-500 to-emerald-600', label: 'Production Line' },
                levelEnabled.subline && { color: 'from-yellow-400 to-orange-500', label: 'Sub Line' },
                levelEnabled.station && { color: 'from-red-400 to-red-600', label: 'Station' }
              ].filter(Boolean).map((item: any, idx) => (
                <div key={idx} className="flex items-center">
                  <div className={`w-4 h-4 bg-gradient-to-r ${item.color} rounded mr-2`}></div>
                  <span className="text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={() => setShowSummary(false)} className="py-3 px-6 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center">
          <ArrowRight className="mr-2 rotate-180" size={20} />
          Continue Editing Plan
        </button>
        <button onClick={saveHierarchyStructure} disabled={isSaving} className="py-3 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center">
          {isSaving ? <><Loader2 className="mr-2 animate-spin" size={20} />Saving...</> : <><Save className="mr-2" size={20} />Save Plan</>}
        </button>
      </div>
    </div>
  );

  const SavedStructuresList = () => (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Save className="mr-2 text-blue-600" size={20} />
        Saved Manufacturing Plans
      </h3>
      {isLoading.structures ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading saved plans...</p>
        </div>
      ) : savedStructures.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No saved manufacturing plans found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedStructures.map((structure, idx) => (
            <div key={idx} className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${selectedStructure?.structure_id === structure.structure_id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`} onClick={() => loadStructure(structure)}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-gray-800 flex items-center">
                  {structure.hq_name && <MapPin className="mr-2 text-red-600" size={18} />}
                  {structure.factory_name && <Building className="mr-2 text-purple-600" size={18} />}
                  {structure.structure_name}
                </h4>
                {selectedStructure?.structure_id === structure.structure_id && <CheckCircle className="text-green-500" size={18} />}
              </div>
              <div className="text-sm text-gray-600">
                {structure.hq_name && (
                  <div className="flex items-center mb-1">
                    <MapPin className="mr-1" size={14} />
                    {structure.hq_name}
                  </div>
                )}
                {structure.factory_name && (
                  <div className="flex items-center mb-1">
                    <Building className="mr-1" size={14} />
                    {structure.factory_name}
                  </div>
                )}
                <div className="flex items-center mb-1">
                  <Layers className="mr-1" size={14} />
                  {structure.structure_data.departments?.length || 0} Departments
                </div>
                <div className="flex items-center">
                  <Zap className="mr-1" size={14} />
                  {structure.structure_data.departments?.reduce((acc, d) => acc + (d.lines?.length || 0), 0) || 0} Lines
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Manufacturing Planning System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Design your production hierarchy with precision and elegance</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Plus className="mr-2 text-blue-600" size={20} />
            Add New Items
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'hq', label: 'Headquarters', placeholder: 'HQ name' },
              { key: 'factory', label: 'Factory', placeholder: 'Factory name' },
              { key: 'department', label: 'Department', placeholder: 'Department name' },
              { key: 'line', label: 'Line', placeholder: 'Line name' },
              { key: 'subline', label: 'Sub Line', placeholder: 'SubLine name' },
              { key: 'station', label: 'Station', placeholder: 'Station name' }
            ].map((item) => (
              <div key={item.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{item.label}</label>
                <div className="flex">
                  <input
                    type="text"
                    value={newItems[item.key as keyof typeof newItems]}
                    onChange={(e) => setNewItems(prev => ({ ...prev, [item.key]: e.target.value }))}
                    className="flex-1 rounded-l-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={item.placeholder}
                  />
                  <button onClick={() => handleAddNewItem(item.key as keyof typeof newItems)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-lg flex items-center justify-center">
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <SavedStructuresList />
        <ProgressBar step={getProgressStep()} />

        {showSummary ? (
          <PlanSummary />
        ) : (
          <div className="space-y-8">
            <SelectionCard title="Enable / Disable Hierarchy Levels" icon={Layers}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { key: 'hq', label: 'Headquarters' },
                  { key: 'factory', label: 'Factory' },
                  { key: 'department', label: 'Department' },
                  { key: 'line', label: 'Production Line' },
                  { key: 'subline', label: 'Sub Line' },
                  { key: 'station', label: 'Station' }
                ].map((lvl) => (
                  <OptionButton
                    key={lvl.key}
                    option={`${lvl.label}: ${levelEnabled[lvl.key as keyof typeof levelEnabled] ? 'On' : 'Off'}`}
                    isSelected={levelEnabled[lvl.key as keyof typeof levelEnabled]}
                    onClick={() => setLevelEnabled(prev => {
                      const key = lvl.key as keyof typeof prev;
                      return { ...prev, [key]: !prev[key] };
                    })}
                  />
                ))}
              </div>
            </SelectionCard>

            {levelEnabled.hq && (
              <SelectionCard title="Choose Headquarters" icon={MapPin}>
                {isLoading.hqs ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading headquarters...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {data.hqs.map(hq => (
                      <OptionButton
                        key={hq.hq_id}
                        option={hq.hq_name}
                        isSelected={plan.structure_data.hq_name === hq.hq_name}
                        onClick={() => handleHqSelect(hq.hq_name)}
                      />
                    ))}
                  </div>
                )}
              </SelectionCard>
            )}

            {(levelEnabled.hq ? !!plan.structure_data.hq_name : true) && levelEnabled.factory && (
              <SelectionCard title="Choose Manufacturing Factory" icon={Building}>
                {isLoading.factories ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading factories...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {data.factories.map(factory => (
                      <OptionButton
                        key={factory.factory_id}
                        option={factory.factory_name}
                        isSelected={plan.structure_data.factory_name === factory.factory_name}
                        onClick={() => handleFactorySelect(factory.factory_name)}
                      />
                    ))}
                  </div>
                )}
              </SelectionCard>
            )}

            {(levelEnabled.factory ? !!plan.structure_data.factory_name : true) && (
              <SelectionCard title="Configure Departments & Production Structure" icon={Layers}>
                {levelEnabled.department && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-700 mb-4">Available Departments:</h4>
                    {isLoading.departments ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading departments...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {data.departments.map(department => (
                          <OptionButton
                            key={department.department_id}
                            option={department.department_name}
                            isSelected={plan.structure_data.departments.some(d => d.department_name === department.department_name)}
                            onClick={() => handleDepartmentSelect(department.department_name)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {levelEnabled.department && plan.structure_data.departments.map((department, departmentIndex) => (
                  <div key={departmentIndex} className="mb-8 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-blue-200 shadow-inner">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-xl font-bold text-gray-800 flex items-center">
                        <Layers className="mr-2 text-blue-600" size={20} />
                        {department.department_name}
                      </h4>
                      <RemoveButton onClick={() => removeDepartment(departmentIndex)} />
                    </div>

                    {/* Show stations directly under department when lines are disabled */}
                    {!levelEnabled.line && levelEnabled.station && (
                      <div className="mb-6">
                        <h5 className="text-lg font-semibold text-gray-700 mb-3">Department Stations:</h5>
                        {isLoading.stations ? (
                          <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Loading stations...</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {data.stations.map(station => (
                              <OptionButton
                                key={station.station_id}
                                option={station.station_name}
                                isSelected={department.stations?.some(s => s.id === station.station_id) || false}
                                onClick={() => handleDepartmentStationSelect(departmentIndex, station.station_id)}
                                variant="small"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {levelEnabled.line && (
                      <div className="mb-6">
                        <h5 className="text-lg font-semibold text-gray-700 mb-3">Production Lines:</h5>
                        {isLoading.lines ? (
                          <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Loading lines...</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {data.lines.map(line => (
                              <OptionButton
                                key={line.line_id}
                                option={line.line_name}
                                isSelected={department.lines.some(l => l.line_name === line.line_name)}
                                onClick={() => handleLineSelect(departmentIndex, line.line_name)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {levelEnabled.line && department.lines.map((line, lineIndex) => (
                      <div key={lineIndex} className="mb-6 p-5 bg-white rounded-lg shadow-md border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <h6 className="text-lg font-semibold text-gray-800 flex items-center">
                            <Zap className="mr-2 text-purple-600" size={18} />
                            {line.line_name}
                          </h6>
                          <RemoveButton onClick={() => removeLine(departmentIndex, lineIndex)} />
                        </div>

                        {levelEnabled.subline && (
                          <div className="mb-4">
                            <h6 className="text-md font-medium text-gray-700 mb-3">Select Sub Lines:</h6>
                            {isLoading.sublines ? (
                              <div className="text-center py-2">
                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="mt-1 text-gray-600 text-sm">Loading sub lines...</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                                {data.sublines.map(subline => (
                                  <OptionButton
                                    key={subline.subline_id}
                                    option={subline.subline_name}
                                    isSelected={line.sublines?.some(s => s.subline_name === subline.subline_name) || false}
                                    onClick={() => handleSubLineSelect(departmentIndex, lineIndex, subline.subline_name)}
                                    variant="small"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {levelEnabled.subline && line.sublines?.map((subline, sublineIndex) => (
                          <div key={sublineIndex} className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <h6 className="text-md font-medium text-gray-800 flex items-center">
                                <Zap className="mr-2 text-orange-600" size={16} />
                                {subline.subline_name}
                              </h6>
                              <RemoveButton onClick={() => removeSubLine(departmentIndex, lineIndex, sublineIndex)} />
                            </div>

                            {levelEnabled.station && (
                              <div>
                                <h6 className="text-sm font-medium text-gray-700 mb-2">Select Active Stations:</h6>
                                {isLoading.stations ? (
                                  <div className="text-center py-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                                    <p className="mt-1 text-gray-600 text-xs">Loading stations...</p>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2">
                                    {data.stations.map(station => (
                                      <OptionButton
                                        key={station.station_id}
                                        option={station.station_name}
                                        isSelected={subline.stations.some(s => s.id === station.station_id)}
                                        onClick={() => handleStationSelect(departmentIndex, lineIndex, sublineIndex, station.station_id)}
                                        variant="small"
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}

                        {!levelEnabled.subline && levelEnabled.station && (
                          <div className="mt-4">
                            <h6 className="text-md font-medium text-gray-700 mb-3">Select Active Stations:</h6>
                            {isLoading.stations ? (
                              <div className="text-center py-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="mt-1 text-gray-600 text-xs">Loading stations...</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2">
                                {data.stations.map(station => (
                                  <OptionButton
                                    key={station.station_id}
                                    option={station.station_name}
                                    isSelected={line.stations?.some(s => s.id === station.station_id) || false}
                                    onClick={() => handleStationSelect(departmentIndex, lineIndex, null, station.station_id)}
                                    variant="small"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </SelectionCard>
            )}

            {!levelEnabled.department && levelEnabled.line && (
              <SelectionCard title="Select Production Lines" icon={Zap}>
                {isLoading.lines ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading lines...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {data.lines.map(line => (
                      <OptionButton
                        key={line.line_id}
                        option={line.line_name}
                        isSelected={plan.structure_data.departments.some(d => d.lines.some(l => l.line_name === line.line_name))}
                        onClick={() => handleGlobalLineSelect(line.line_name)}
                      />
                    ))}
                  </div>
                )}
              </SelectionCard>
            )}

            {!levelEnabled.line && levelEnabled.subline && (
              <SelectionCard title="Select Sub Lines" icon={Zap}>
                {isLoading.sublines ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading sub lines...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {data.sublines.map(subline => (
                      <OptionButton
                        key={subline.subline_id}
                        option={subline.subline_name}
                        isSelected={plan.structure_data.departments.some(d => d.lines.some(l => l.sublines?.some(s => s.subline_name === subline.subline_name)))}
                        onClick={() => handleGlobalSubLineSelect(subline.subline_name)}
                      />
                    ))}
                  </div>
                )}
              </SelectionCard>
            )}

            {/* {(!levelEnabled.subline || !levelEnabled.line || !levelEnabled.department) && levelEnabled.station && (
              <SelectionCard title="Select Stations" icon={Target}>
                {isLoading.stations ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading stations...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {data.stations.map(station => {
                      const isSelected = plan.structure_data.stations?.some(s => s.station_name === station.station_name) ||
                                       plan.structure_data.departments.some(d => 
                                         (d.stations?.some(s => s.station_name === station.station_name)) ||
                                         d.lines.some(l => 
                                           (l.sublines?.some(s => s.stations.some(st => st.station_name === station.station_name))) ||
                                           (l.stations?.some(st => st.station_name === station.station_name))
                                         )
                                       );
                      return (
                        <OptionButton
                          key={station.station_id}
                          option={station.station_name}
                          isSelected={isSelected}
                          onClick={() => handleGlobalStationSelect(station.station_name)}
                          variant="small"
                        />
                      );
                    })}
                  </div>
                )}
              </SelectionCard>
            )} */}

            {hasCompletePlan() && (
              <div className="text-center">
                <button onClick={() => setShowSummary(true)} className="py-4 px-8 bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 text-white rounded-2xl font-bold text-lg hover:from-green-600 hover:via-blue-600 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 flex items-center mx-auto">
                  <Save className="mr-3" size={24} />
                  Finalize Manufacturing Plan
                  <ArrowRight className="ml-3" size={24} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Planning;


// import { useState, useEffect } from 'react';
// import { Building, Layers, Zap, Target, Save, X, CheckCircle, ArrowRight, Plus, Loader2, MapPin } from 'lucide-react';
// import axios from 'axios';

// // Types
// type Hq = { hq_id: number; hq_name: string; };
// type Department = { department_id: number; department_name: string; factory: number; hq: number; stations?: { id?: number; station_name: string; }[]; };
// type Factory = { factory_id: number; factory_name: string; hq: number; stations?: { id?: number; station_name: string; }[]; };
// type Line = { line_id: number; line_name: string; department: number; factory: number; hq: number; stations?: { id?: number; station_name: string; }[]; };
// type SubLine = { subline_id: number; subline_name: string; line: number; department: number; factory: number; hq: number; };
// type Station = { station_id: number; station_name: string; subline: number; line: number; department: number; factory: number; hq: number; };

// type PlanStation = { id?: number; station_name: string; };
// type PlanSubline = { id?: number; subline_name: string; stations: PlanStation[]; };
// type PlanLine = { id?: number; line_name: string; sublines?: PlanSubline[]; stations?: PlanStation[]; };
// type PlanDepartment = { id?: number; department_name: string; lines: PlanLine[]; stations?: PlanStation[]; };

// type HierarchyStructure = {
//   structure_id?: number;
//   structure_name: string;
//   hq?: number | null;
//   factory?: number | null;
//   // backend sometimes returns these as top-level props in saved objects, so allow them:
//   hq_name?: string;
//   factory_name?: string;
//   structure_data: {
//     hq_name?: string;
//     factory_name?: string;
//     departments: PlanDepartment[];
//     stations?: PlanStation[]; // direct stations under factory/hq if used
//   };
// };

// const API_BASE_URL = 'http://127.0.0.1:8000';
// const AUTO_DEPT = 'Auto Department';
// const AUTO_LINE = 'Auto Line';
// const AUTO_SUBLINE = 'Auto SubLine';

// // Components
// const ProgressBar = ({ step }: { step: number }) => (
//   <div className="w-full bg-gray-200 rounded-full h-4 mb-8">
//     <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500" style={{ width: `${step * 16.67}%` }}></div>
//   </div>
// );

// const SelectionCard = ({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<any>; children: React.ReactNode }) => (
//   <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
//     <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
//       <Icon className="mr-2 text-blue-600" size={20} />
//       {title}
//     </h3>
//     {children}
//   </div>
// );

// const OptionButton = ({ option, isSelected, onClick, variant = 'default' }: { option: string; isSelected: boolean; onClick: () => void; variant?: 'default' | 'small'; }) => {
//   const baseClasses = `rounded-lg font-medium transition-all duration-200 flex items-center justify-center cursor-pointer ${
//     isSelected ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//   }`;
//   const sizeClasses = variant === 'small' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2.5';
//   return <div className={`${baseClasses} ${sizeClasses}`} onClick={onClick}>{option}</div>;
// };

// const RemoveButton = ({ onClick }: { onClick: () => void }) => (
//   <button onClick={onClick} className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
//     <X size={16} />
//   </button>
// );

// const Planning = () => {
//   const [plan, setPlan] = useState<HierarchyStructure>({
//     structure_name: '',
//     hq: null,
//     factory: null,
//     structure_data: { departments: [], stations: [] }
//   });
//   const [showSummary, setShowSummary] = useState(false);
//   const [newItems, setNewItems] = useState({ hq: '', factory: '', department: '', line: '', subline: '', station: '' });
//   const [isSaving, setIsSaving] = useState(false);
//   const [savedStructures, setSavedStructures] = useState<HierarchyStructure[]>([]);
//   const [selectedStructure, setSelectedStructure] = useState<HierarchyStructure | null>(null);
//   const [data, setData] = useState({ hqs: [] as Hq[], factories: [] as Factory[], departments: [] as Department[], lines: [] as Line[], sublines: [] as SubLine[], stations: [] as Station[] });
//   const [isLoading, setIsLoading] = useState({ hqs: false, factories: false, departments: false, lines: false, sublines: false, stations: false, structures: false });
//   const [levelEnabled, setLevelEnabled] = useState({ hq: true, factory: true, department: true, line: true, subline: true, station: true });

//   const effectiveEnabled = {
//     hq: levelEnabled.hq,
//     factory: levelEnabled.hq && levelEnabled.factory,
//     department: levelEnabled.hq && levelEnabled.factory && levelEnabled.department,
//     line: levelEnabled.hq && levelEnabled.factory && levelEnabled.department && levelEnabled.line,
//     subline: levelEnabled.hq && levelEnabled.factory && levelEnabled.department && levelEnabled.line && levelEnabled.subline,
//     station: levelEnabled.hq && levelEnabled.factory && levelEnabled.department && levelEnabled.line && levelEnabled.subline && levelEnabled.station
//   };

//   // API calls
//   const fetchData = async (endpoint: string, key: keyof typeof data) => {
//     setIsLoading(prev => ({ ...prev, [key]: true }));
//     try {
//       const response = await axios.get(`${API_BASE_URL}/${endpoint}`);
//       setData(prev => ({ ...prev, [key]: response.data }));
//     } catch (error) {
//       console.error(`Error fetching ${key}:`, error);
//     } finally {
//       setIsLoading(prev => ({ ...prev, [key]: false }));
//     }
//   };

//   const fetchFactories = (hqId?: number) => fetchData(hqId ? `factories/?hq=${hqId}` : 'factories/', 'factories');
//   const fetchDepartments = (factoryId?: number, hqId?: number) => fetchData(`departments/${factoryId ? `?factory=${factoryId}` : hqId ? `?hq=${hqId}` : ''}`, 'departments');
//   const fetchLines = (departmentId?: number, factoryId?: number, hqId?: number) => fetchData(`lines/${departmentId ? `?department=${departmentId}` : factoryId ? `?factory=${factoryId}` : hqId ? `?hq=${hqId}` : ''}`, 'lines');
//   const fetchSubLines = (lineId?: number, departmentId?: number, factoryId?: number, hqId?: number) => fetchData(`sublines/${lineId ? `?line=${lineId}` : departmentId ? `?department=${departmentId}` : factoryId ? `?factory=${factoryId}` : hqId ? `?hq=${hqId}` : ''}`, 'sublines');
//   const fetchStations = (sublineId?: number, lineId?: number, departmentId?: number, factoryId?: number, hqId?: number) => fetchData(`stations/${sublineId ? `?subline=${sublineId}` : lineId ? `?line=${lineId}` : departmentId ? `?department=${departmentId}` : factoryId ? `?factory=${factoryId}` : hqId ? `?hq=${hqId}` : ''}`, 'stations');
//   const fetchHqs = () => fetchData('hq/', 'hqs');
//   const fetchHierarchyStructures = async () => {
//     setIsLoading(prev => ({ ...prev, structures: true }));
//     try {
//       const response = await axios.get(`${API_BASE_URL}/hierarchy-simple/`);
//       setSavedStructures(response.data);
//     } catch (error) {
//       console.error('Error fetching hierarchy structures:', error);
//     } finally {
//       setIsLoading(prev => ({ ...prev, structures: false }));
//     }
//   };

//   // Handler functions
//   const handleAddNewItem = async (type: keyof typeof newItems) => {
//     if (!newItems[type]) return;
//     const endpointMap = { hq: 'hq/', factory: 'factories/', department: 'departments/', line: 'lines/', subline: 'sublines/', station: 'stations/' };
//     const nameFieldMap = { hq: 'hq_name', factory: 'factory_name', department: 'department_name', line: 'line_name', subline: 'subline_name', station: 'station_name' };

//     try {
//       const payload = { [nameFieldMap[type]]: newItems[type] };
//       await axios.post(`${API_BASE_URL}/${endpointMap[type]}`, payload);
//       setNewItems(prev => ({ ...prev, [type]: '' }));
      
//       if (type === 'hq') await fetchHqs();
//       else if (type === 'factory' && plan.structure_data.hq_name) {
//         const hq = data.hqs.find(h => h.hq_name === plan.structure_data.hq_name);
//         if (hq) await fetchFactories(hq.hq_id);
//       } else if (type === 'department' && plan.structure_data.factory_name) {
//         const factory = data.factories.find(f => f.factory_name === plan.structure_data.factory_name);
//         if (factory) await fetchDepartments(factory.factory_id);
//       }
//     } catch (error) {
//       console.error(`Error adding ${type}:`, error);
//     }
//   };

//   const handleHqSelect = (hqName: string) => {
//     const selectedHq = data.hqs.find(h => h.hq_name === hqName);
//     if (selectedHq) {
//       setPlan(prev => ({
//         ...prev,
//         hq: selectedHq.hq_id,
//         structure_data: { ...prev.structure_data, hq_name: hqName, departments: [], stations: [] }
//       }));
//       fetchFactories(selectedHq.hq_id);
//       setShowSummary(false);
//       setSelectedStructure(null);
//     }
//   };

//   const handleFactorySelect = (factoryName: string) => {
//     const selectedFactory = data.factories.find(f => f.factory_name === factoryName);
//     if (selectedFactory) {
//       setPlan(prev => ({
//         ...prev,
//         factory: selectedFactory.factory_id,
//         structure_data: { ...prev.structure_data, factory_name: factoryName, departments: [], stations: [] }
//       }));
//       fetchDepartments(selectedFactory.factory_id);
//       setShowSummary(false);
//       setSelectedStructure(null);
//     }
//   };

// const handleDepartmentSelect = (departmentName: string) => {
//     const selectedDepartment = data.departments.find(d => d.department_name === departmentName);
//     if (selectedDepartment) {
//       setPlan(prev => {
//         const isSelected = prev.structure_data.departments.some(d => d.department_name === departmentName);
        
//         if (isSelected) {
//           // Deselect department
//           return {
//             ...prev,
//             structure_data: {
//               ...prev.structure_data,
//               departments: prev.structure_data.departments.filter(d => d.department_name !== departmentName)
//             }
//           };
//         } else {
//           // Select department
//           return {
//             ...prev,
//             structure_data: {
//               ...prev.structure_data,
//               departments: [
//                 ...prev.structure_data.departments, 
//                 { 
//                   department_name: departmentName, 
//                   id: selectedDepartment.department_id, 
//                   lines: [],
//                   stations: !levelEnabled.line ? [] : undefined
//                 }
//               ]
//             }
//           };
//         }
//       });
      
//       if (levelEnabled.line) {
//         // Fetch lines for the selected department
//         fetchLines(selectedDepartment.department_id);
//       } else if (levelEnabled.station) {
//         fetchStations(undefined, undefined, selectedDepartment.department_id);
//       }
//       setShowSummary(false);
//     }
//   };
// const handleLineSelect = (departmentIndex: number, lineName: string) => {
//     const selectedLine = data.lines.find(l => l.line_name === lineName);
//     if (selectedLine) {
//       setPlan(prev => {
//         const updatedDepartments = [...prev.structure_data.departments];
//         const department = updatedDepartments[departmentIndex];
//         const isSelected = department.lines.some(l => l.line_name === lineName);
        
//         if (isSelected) {
//           // Deselect line
//           updatedDepartments[departmentIndex] = {
//             ...department,
//             lines: department.lines.filter(l => l.line_name !== lineName)
//           };
//         } else {
//           // Select line
//           updatedDepartments[departmentIndex] = {
//             ...department,
//             lines: [
//               ...department.lines, 
//               { 
//                 line_name: lineName, 
//                 id: selectedLine.line_id, 
//                 sublines: levelEnabled.subline ? [] : undefined,
//                 stations: !levelEnabled.subline ? [] : undefined
//               }
//             ]
//           };
//         }
        
//         return { ...prev, structure_data: { ...prev.structure_data, departments: updatedDepartments } };
//       });
      
//       if (levelEnabled.subline) fetchSubLines(selectedLine.line_id);
//       else if (levelEnabled.station) fetchStations(undefined, selectedLine.line_id);
//       setShowSummary(false);
//     }
//   };


//   const handleSubLineSelect = (departmentIndex: number, lineIndex: number, sublineName: string) => {
//     const selectedSubLine = data.sublines.find(s => s.subline_name === sublineName);
//     if (selectedSubLine) {
//       setPlan(prev => {
//         const updatedDepartments = [...prev.structure_data.departments];
//         const updatedLines = [...updatedDepartments[departmentIndex].lines];
//         const updatedSubLines = [...updatedLines[lineIndex].sublines || []];
        
//         const sublineIndex = updatedSubLines.findIndex(s => s.subline_name === sublineName);
//         if (sublineIndex === -1) {
//           updatedSubLines.push({ subline_name: sublineName, id: selectedSubLine.subline_id, stations: [] });
//         } else {
//           updatedSubLines.splice(sublineIndex, 1);
//         }
        
//         updatedLines[lineIndex] = { ...updatedLines[lineIndex], sublines: updatedSubLines };
//         updatedDepartments[departmentIndex] = { ...updatedDepartments[departmentIndex], lines: updatedLines };
//         return { ...prev, structure_data: { ...prev.structure_data, departments: updatedDepartments } };
//       });
//       fetchStations(selectedSubLine.subline_id);
//       setShowSummary(false);
//     }
//   };

//   const handleDepartmentStationSelect = (departmentIndex: number, stationName: string) => {
//     const selectedStation = data.stations.find(s => s.station_name === stationName);
//     if (selectedStation) {
//       setPlan(prev => {
//         const updatedDepartments = [...prev.structure_data.departments];
//         const department = updatedDepartments[departmentIndex];
//         const updatedStations = [...(department.stations || [])];
        
//         const stationIndex = updatedStations.findIndex(s => s.station_name === stationName);
//         if (stationIndex === -1) {
//           updatedStations.push({ station_name: stationName, id: selectedStation.station_id });
//         } else {
//           updatedStations.splice(stationIndex, 1);
//         }

//         updatedDepartments[departmentIndex] = { ...department, stations: updatedStations };
//         return { ...prev, structure_data: { ...prev.structure_data, departments: updatedDepartments } };
//       });
//       setShowSummary(false);
//     }
//   };

//   const handleStationSelect = (departmentIndex: number, lineIndex: number, sublineIndex: number | null, stationName: string) => {
//     const selectedStation = data.stations.find(s => s.station_name === stationName);
//     if (selectedStation) {
//       setPlan(prev => {
//         const updatedDepartments = [...prev.structure_data.departments];
        
//         if (sublineIndex !== null && levelEnabled.subline) {
//           const updatedLines = [...updatedDepartments[departmentIndex].lines];
//           const updatedSubLines = [...updatedLines[lineIndex].sublines || []];
//           const updatedStations = [...updatedSubLines[sublineIndex].stations];
          
//           const stationIndex = updatedStations.findIndex(s => s.station_name === stationName);
//           if (stationIndex === -1) updatedStations.push({ station_name: stationName, id: selectedStation.station_id });
//           else updatedStations.splice(stationIndex, 1);
          
//           updatedSubLines[sublineIndex] = { ...updatedSubLines[sublineIndex], stations: updatedStations };
//           updatedLines[lineIndex] = { ...updatedLines[lineIndex], sublines: updatedSubLines };
//           updatedDepartments[departmentIndex] = { ...updatedDepartments[departmentIndex], lines: updatedLines };
//         } else {
//           const updatedLines = [...updatedDepartments[departmentIndex].lines];
//           const updatedStations = [...updatedLines[lineIndex].stations || []];
          
//           const stationIndex = updatedStations.findIndex(s => s.station_name === stationName);
//           if (stationIndex === -1) updatedStations.push({ station_name: stationName, id: selectedStation.station_id });
//           else updatedStations.splice(stationIndex, 1);
          
//           updatedLines[lineIndex] = { ...updatedLines[lineIndex], stations: updatedStations };
//           updatedDepartments[departmentIndex] = { ...updatedDepartments[departmentIndex], lines: updatedLines };
//         }

//         return { ...prev, structure_data: { ...prev.structure_data, departments: updatedDepartments } };
//       });
//       setShowSummary(false);
//     }
//   };

//   const removeDepartment = (index: number) => {
//     setPlan(prev => ({
//       ...prev,
//       structure_data: { ...prev.structure_data, departments: prev.structure_data.departments.filter((_, i) => i !== index) }
//     }));
//   };

//   const removeLine = (departmentIndex: number, lineIndex: number) => {
//     setPlan(prev => {
//       const updatedDepartments = [...prev.structure_data.departments];
//       updatedDepartments[departmentIndex] = {
//         ...updatedDepartments[departmentIndex],
//         lines: updatedDepartments[departmentIndex].lines.filter((_, i) => i !== lineIndex)
//       };
//       return { ...prev, structure_data: { ...prev.structure_data, departments: updatedDepartments } };
//     });
//   };

//   const removeSubLine = (departmentIndex: number, lineIndex: number, sublineIndex: number) => {
//     setPlan(prev => {
//       const updatedDepartments = [...prev.structure_data.departments];
//       const updatedLines = [...updatedDepartments[departmentIndex].lines];
//       updatedLines[lineIndex] = {
//         ...updatedLines[lineIndex],
//         sublines: updatedLines[lineIndex].sublines?.filter((_, i) => i !== sublineIndex) || []
//       };
//       updatedDepartments[departmentIndex] = { ...updatedDepartments[departmentIndex], lines: updatedLines };
//       return { ...prev, structure_data: { ...prev.structure_data, departments: updatedDepartments } };
//     });
//   };

//   const saveHierarchyStructure = async () => {
//     if (!hasCompletePlan()) return;
//     setIsSaving(true);
//     try {
//       const payload = {
//         structure_name: plan.structure_name || `Structure-${Date.now()}`,
//         structure_data: plan.structure_data,
//         hq: plan.hq || null,
//         factory: plan.factory || null
//       };
      
//       if (plan.structure_id) {
//         await axios.put(`${API_BASE_URL}/hierarchy-structures/${plan.structure_id}/`, payload);
//       } else {
//         await axios.post(`${API_BASE_URL}/hierarchy-structures/`, payload);
//       }
//       await fetchHierarchyStructures();
//       setShowSummary(true);
//     } catch (error) {
//       console.error('Error saving hierarchy structure:', error);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//  const loadStructure = (structure: HierarchyStructure) => {
//   setPlan(structure);
//   setSelectedStructure(structure);
//   setShowSummary(false);

//   // compute what exists in the loaded structure
//   const departments = structure.structure_data?.departments || [];
//   const hasDepartments = departments.length > 0;
//   const hasLines = departments.some(d => !!(d.lines && d.lines.length > 0));
//   const hasSublines = departments.some(d => d.lines?.some(l => !!(l.sublines && l.sublines.length > 0)));
//   const hasDirectStations = Boolean(structure.structure_data?.stations && structure.structure_data.stations.length > 0);
//   const hasDeptStations = departments.some(d => !!(d.stations && d.stations.length > 0));
//   const hasLineStations = departments.some(d => d.lines?.some(l => !!(l.stations && l.stations.length > 0)));
//   const hasNestedStations = departments.some(d => d.lines?.some(l => l.sublines?.some(s => !!(s.stations && s.stations.length > 0))));
//   const hasStations = hasDirectStations || hasDeptStations || hasLineStations || hasNestedStations;

//   // update levelEnabled so the UI matches the saved structure
//   setLevelEnabled(prev => ({
//     ...prev,
//     // preserve HQ/factory toggles as they are (you can change this if you want to auto-toggle them too)
//     department: hasDepartments,
//     // show line level only if there are lines or there are stations attached to lines
//     line: hasLines || hasLineStations || hasNestedStations,
//     // show subline level only if sublines exist
//     subline: hasSublines,
//     // show station level if any station exists anywhere in the structure
//     station: hasStations
//   }));

//   // fetch children so the selection lists (lines, sublines, stations) populate correctly
//   if (structure.hq) fetchFactories(structure.hq);
//   if (structure.factory) fetchDepartments(structure.factory);

//   departments.forEach((dept) => {
//     if (dept.id) {
//       fetchLines(dept.id);

//       if (dept.stations && dept.stations.length > 0) {
//         // populate department-level stations
//         fetchStations(undefined, undefined, dept.id);
//       }

//       (dept.lines || []).forEach((line) => {
//         if (line.id) {
//           fetchSubLines(line.id);

//           if (line.stations && line.stations.length > 0) {
//             // populate line-level stations
//             fetchStations(undefined, line.id);
//           }

//           (line.sublines || []).forEach((sub) => {
//             if (sub.id) {
//               // populate subline stations
//               fetchStations(sub.id);
//             }
//           });
//         }
//       });
//     }
//   });
// };


//   const hasCompletePlan = () => {
//     if (levelEnabled.hq && !plan.structure_data.hq_name) return false;
//     if (levelEnabled.factory && !plan.structure_data.factory_name) return false;
    
//     const hasDepartments = plan.structure_data.departments.length > 0;
//     if (levelEnabled.department && !hasDepartments) return false;
    
//     if (levelEnabled.line && !plan.structure_data.departments.some(d => d.lines.length > 0)) return false;
//     if (levelEnabled.subline && !plan.structure_data.departments.some(d => d.lines.some(l => l.sublines && l.sublines.length > 0))) return false;
    
//     if (levelEnabled.station) {
//       const hasDirectStations = plan.structure_data.stations && plan.structure_data.stations.length > 0;
//       const hasDeptStations = plan.structure_data.departments.some(d => d.stations && d.stations.length > 0);
//       const hasNestedStations = plan.structure_data.departments.some(d => d.lines.some(l => l.sublines?.some(s => s.stations.length > 0)));
//       const hasLineStations = plan.structure_data.departments.some(d => d.lines.some(l => l.stations && l.stations.length > 0));
//       if (!hasDirectStations && !hasDeptStations && !hasNestedStations && !hasLineStations) return false;
//     }
//     return true;
//   };

//   const getProgressStep = () => {
//     if (levelEnabled.hq && !plan.structure_data.hq_name) return 1;
//     if (levelEnabled.factory && !plan.structure_data.factory_name) return 1;
    
//     const hasDepartments = plan.structure_data.departments.length > 0;
//     if (levelEnabled.department && !hasDepartments) return 2;
    
//     if (levelEnabled.line && !plan.structure_data.departments.some(d => d.lines.length > 0)) return 3;
//     if (levelEnabled.subline && !plan.structure_data.departments.some(d => d.lines.some(l => l.sublines && l.sublines.length > 0))) return 4;
    
//     if (levelEnabled.station) {
//       const hasDirectStations = plan.structure_data.stations && plan.structure_data.stations.length > 0;
//       const hasDeptStations = plan.structure_data.departments.some(d => d.stations && d.stations.length > 0);
//       const hasNestedStations = plan.structure_data.departments.some(d => d.lines.some(l => l.sublines?.some(s => s.stations.length > 0)));
//       const hasLineStations = plan.structure_data.departments.some(d => d.lines.some(l => l.stations && l.stations.length > 0));
//       if (!hasDirectStations && !hasDeptStations && !hasNestedStations && !hasLineStations) return 5;
//     }
//     return 6;
//   };

//   const handleGlobalLineSelect = (lineName: string) => {
//     const selectedLine = data.lines.find(l => l.line_name === lineName);
//     setPlan(prev => {
//       let departments = [...prev.structure_data.departments];
//       let deptIndex = departments.findIndex(d => d.department_name === AUTO_DEPT);
      
//       if (deptIndex === -1) {
//         departments.push({ department_name: AUTO_DEPT, lines: [], stations: !levelEnabled.line ? [] : undefined });
//         deptIndex = departments.length - 1;
//       }
      
//       const dept = departments[deptIndex];
//       const exists = dept.lines.some(l => l.line_name === lineName);
//       const newLines = exists
//         ? dept.lines.filter(l => l.line_name !== lineName)
//         : [...dept.lines, { 
//             line_name: lineName, 
//             id: selectedLine?.line_id, 
//             sublines: levelEnabled.subline ? [] : undefined,
//             stations: !levelEnabled.subline ? [] : undefined
//           }];
      
//       departments[deptIndex] = { ...dept, lines: newLines };
//       return { ...prev, structure_data: { ...prev.structure_data, departments } };
//     });
    
//     if (selectedLine?.line_id) {
//       if (levelEnabled.subline) fetchSubLines(selectedLine.line_id);
//       else if (levelEnabled.station) fetchStations(undefined, selectedLine.line_id);
//     }
//     setShowSummary(false);
//   };

//   const handleGlobalSubLineSelect = (sublineName: string) => {
//     const selectedSubLine = data.sublines.find(s => s.subline_name === sublineName);
//     setPlan(prev => {
//       let departments = [...prev.structure_data.departments];
//       let deptIndex = departments.findIndex(d => d.department_name === AUTO_DEPT);
      
//       if (deptIndex === -1) {
//         departments.push({ department_name: AUTO_DEPT, lines: [] });
//         deptIndex = departments.length - 1;
//       }
      
//       let lines = [...departments[deptIndex].lines];
//       let lineIndex = lines.findIndex(l => l.line_name === AUTO_LINE);
      
//       if (lineIndex === -1) {
//         lines.push({ line_name: AUTO_LINE, sublines: [], stations: !levelEnabled.subline ? [] : undefined });
//         lineIndex = lines.length - 1;
//       }
      
//       const line = lines[lineIndex];
//       const exists = line.sublines?.some(s => s.subline_name === sublineName);
//       const newSubLines = exists
//         ? line.sublines?.filter(s => s.subline_name !== sublineName) || []
//         : [...(line.sublines || []), { subline_name: sublineName, id: selectedSubLine?.subline_id, stations: [] }];
      
//       lines[lineIndex] = { ...line, sublines: newSubLines };
//       departments[deptIndex] = { ...departments[deptIndex], lines };
//       return { ...prev, structure_data: { ...prev.structure_data, departments } };
//     });
    
//     if (selectedSubLine?.subline_id) fetchStations(selectedSubLine.subline_id);
//     setShowSummary(false);
//   };

//   const handleGlobalStationSelect = (stationName: string) => {
//     const selectedStation = data.stations.find(s => s.station_name === stationName);
//     setPlan(prev => {
//       if (!levelEnabled.department && !levelEnabled.line && !levelEnabled.subline && levelEnabled.station) {
//         const currentStations = prev.structure_data.stations || [];
//         const exists = currentStations.some(s => s.station_name === stationName);
//         const newStations = exists
//           ? currentStations.filter(s => s.station_name !== stationName)
//           : [...currentStations, { station_name: stationName, id: selectedStation?.station_id }];
//         return { ...prev, structure_data: { ...prev.structure_data, stations: newStations } };
//       }
      
//       let departments = [...prev.structure_data.departments];
//       let deptIndex = departments.findIndex(d => d.department_name === AUTO_DEPT);
      
//       if (deptIndex === -1) {
//         departments.push({ department_name: AUTO_DEPT, lines: [], stations: !levelEnabled.line ? [] : undefined });
//         deptIndex = departments.length - 1;
//       }
      
//       if (!levelEnabled.line && levelEnabled.station) {
//         const dept = departments[deptIndex];
//         const exists = dept.stations?.some(s => s.station_name === stationName);
//         const newStations = exists
//           ? dept.stations?.filter(s => s.station_name !== stationName) || []
//           : [...(dept.stations || []), { station_name: stationName, id: selectedStation?.station_id }];
        
//         departments[deptIndex] = { ...dept, stations: newStations };
//         return { ...prev, structure_data: { ...prev.structure_data, departments } };
//       }
      
//       let lines = [...departments[deptIndex].lines];
//       let lineIndex = lines.findIndex(l => l.line_name === AUTO_LINE);
      
//       if (lineIndex === -1) {
//         lines.push({ line_name: AUTO_LINE, sublines: [], stations: !levelEnabled.subline ? [] : undefined });
//         lineIndex = lines.length - 1;
//       }
      
//       if (levelEnabled.subline) {
//         let sublines = [...lines[lineIndex].sublines || []];
//         let sublineIndex = sublines.findIndex(s => s.subline_name === AUTO_SUBLINE);
        
//         if (sublineIndex === -1) {
//           sublines.push({ subline_name: AUTO_SUBLINE, stations: [] });
//           sublineIndex = sublines.length - 1;
//         }
        
//         const subline = sublines[sublineIndex];
//         const exists = subline.stations.some(s => s.station_name === stationName);
//         const newStations = exists
//           ? subline.stations.filter(s => s.station_name !== stationName)
//           : [...subline.stations, { station_name: stationName, id: selectedStation?.station_id }];
        
//         sublines[sublineIndex] = { ...subline, stations: newStations };
//         lines[lineIndex] = { ...lines[lineIndex], sublines };
//       } else {
//         const line = lines[lineIndex];
//         const exists = line.stations?.some(s => s.station_name === stationName);
//         const newStations = exists
//           ? line.stations?.filter(s => s.station_name !== stationName) || []
//           : [...(line.stations || []), { station_name: stationName, id: selectedStation?.station_id }];
        
//         lines[lineIndex] = { ...line, stations: newStations };
//       }
      
//       departments[deptIndex] = { ...departments[deptIndex], lines };
//       return { ...prev, structure_data: { ...prev.structure_data, departments } };
//     });
//     setShowSummary(false);
//   };

//   // Initial data fetch
//   useEffect(() => {
//     fetchHqs();
//     fetchHierarchyStructures();
//   }, []);

//   useEffect(() => {
//     if (!levelEnabled.hq) fetchFactories();
//   }, [levelEnabled.hq]);

//   useEffect(() => {
//     if (!levelEnabled.factory && levelEnabled.department) fetchDepartments();
//   }, [levelEnabled.factory, levelEnabled.department]);

//   useEffect(() => {
//     if (!levelEnabled.department && levelEnabled.line) fetchLines();
//   }, [levelEnabled.department, levelEnabled.line]);

//   useEffect(() => {
//     if (!levelEnabled.line && levelEnabled.subline) fetchSubLines();
//   }, [levelEnabled.line, levelEnabled.subline]);

//   useEffect(() => {
//     if (!levelEnabled.subline && levelEnabled.station) fetchStations();
//   }, [levelEnabled.subline, levelEnabled.station]);

//   // Plan summary component
//   const PlanSummary = () => (
//     <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-2xl shadow-xl p-8 border border-green-200">
//       <div className="text-center mb-8">
//         <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
//           <CheckCircle className="text-white" size={32} />
//         </div>
//         <h3 className="text-2xl font-bold text-gray-800 mb-2">Manufacturing Plan Summary</h3>
//         <p className="text-gray-600">Your production hierarchy is ready!</p>
//       </div>

//       <div className="space-y-8">
//         <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
//           <div className="flex items-center justify-center space-x-8">
//             {effectiveEnabled.hq && plan.structure_data.hq_name && (
//               <div className="flex items-center">
//                 <MapPin className="text-red-600 mr-3" size={20} />
//                 <div>
//                   <span className="text-sm text-gray-500 block">Headquarters</span>
//                   <span className="font-semibold text-gray-800 text-xl">{plan.structure_data.hq_name}</span>
//                 </div>
//               </div>
//             )}
//             {effectiveEnabled.factory && plan.structure_data.factory_name && (
//               <div className="flex items-center">
//                 <Building className="text-purple-600 mr-3" size={20} />
//                 <div>
//                   <span className="text-sm text-gray-500 block">Factory</span>
//                   <span className="font-semibold text-gray-800 text-xl">{plan.structure_data.factory_name}</span>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 overflow-x-auto">
//           <h4 className="text-xl font-bold text-gray-800 mb-6 text-center">Production Flow Hierarchy</h4>
//           <div className="flex flex-col items-center min-w-max">
//             {effectiveEnabled.hq && plan.structure_data.hq_name && (
//               <>
//                 <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-4 rounded-xl shadow-lg font-semibold flex items-center mb-6">
//                   <MapPin className="mr-3" size={24} />
//                   {plan.structure_data.hq_name}
//                 </div>
//                 <div className="w-0.5 h-8 bg-gradient-to-b from-red-400 to-purple-400 mb-4"></div>
//               </>
//             )}

//             {effectiveEnabled.factory && plan.structure_data.factory_name && (
//               <>
//                 <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-4 rounded-xl shadow-lg font-semibold flex items-center mb-6">
//                   <Building className="mr-3" size={24} />
//                   {plan.structure_data.factory_name}
//                 </div>
//                 {/* <div className="w-0.5 h-8 bg-gradient-to-b from-purple-400 to-blue-400 mb-4"></div> */}
//               </>
//             )}

//             {!levelEnabled.department && !levelEnabled.line && !levelEnabled.subline && levelEnabled.station && 
//              plan.structure_data.stations && plan.structure_data.stations.length > 0 && (
//               <>
//                 <div className="w-0.5 h-8 bg-gradient-to-b from-purple-400 to-red-400 mb-4"></div>
//                 <div className="flex flex-col items-center">
//                   {/* <h5 className="text-lg font-semibold text-gray-700 mb-4">Stations</h5> */}
//                   <div className="flex flex-wrap gap-3 justify-center">
//                     {plan.structure_data.stations.map((station, stationIdx) => (
//                       <div key={stationIdx} className="bg-gradient-to-r from-red-400 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center">
//                         <Target className="mr-2" size={16} />
//                         {station.station_name}
//                       </div>
//                     ))} 
//                   </div>
//                 </div>
//               </>
//             )}

//             {levelEnabled.department && plan.structure_data.departments.length > 0 && (
//               <>
//                 <div className="w-0.5 h-8 bg-gradient-to-b from-purple-400 to-blue-400 mb-4"></div>
//                 <div className="flex flex-col items-center">
//                   {plan.structure_data.departments.length > 1 && (
//                     <div className="relative mb-4">
//                       <div className="h-0.5 bg-gradient-to-r from-blue-400 to-blue-400" style={{ width: `${(plan.structure_data.departments.length - 1) * 300 + 160}px` }}></div>
//                       {plan.structure_data.departments.map((_, idx) => (
//                         <div key={idx} className="absolute w-0.5 h-4 bg-blue-400" style={{ left: `${idx * 300 + 80}px`, top: '0px' }}></div>
//                       ))}
//                     </div>
//                   )}

//                   <div className="flex gap-12 mb-6">
//                     {plan.structure_data.departments.map((department, deptIdx) => (
//                       <div key={deptIdx} className="flex flex-col items-center">
//                         <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-lg shadow-md font-medium flex items-center mb-4">
//                           <Layers className="mr-2" size={20} />
//                           {department.department_name}
//                         </div>

//                         {!levelEnabled.line && levelEnabled.station && department.stations && department.stations.length > 0 && (
//                           <>
//                             <div className="w-0.5 h-6 bg-gradient-to-b from-blue-400 to-red-400 mb-3"></div>
//                             <div className="flex flex-col items-center">
//                               {/* <h6 className="text-sm font-semibold text-gray-700 mb-2">Stations</h6> */}
//                               <div className="flex flex-wrap gap-2 justify-center">
//                                 {department.stations.map((station, stationIdx) => (
//                                   <div key={stationIdx} className="bg-gradient-to-r from-red-400 to-red-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center">
//                                     <Target className="mr-1" size={10} />
//                                     {station.station_name}
//                                   </div>
//                                 ))}
//                               </div>
//                             </div>
//                           </>
//                         )}

//                         {levelEnabled.line && department.lines.length > 0 && (
//                           <>
//                             <div className="w-0.5 h-6 bg-gradient-to-b from-blue-400 to-green-400 mb-4"></div>
//                             <div className="flex flex-col items-center">
//                               {department.lines.length > 1 && (
//                                 <div className="relative mb-4">
//                                   <div className="h-0.5 bg-gradient-to-r from-green-400 to-green-400" style={{ width: `${(department.lines.length - 1) * 200 + 120}px` }}></div>
//                                   {department.lines.map((_, idx) => (
//                                     <div key={idx} className="absolute w-0.5 h-4 bg-green-400" style={{ left: `${idx * 200 + 60}px`, top: '0px' }}></div>
//                                   ))}
//                                 </div>
//                               )} 

//                               <div className="flex gap-8">
//                                 {department.lines.map((line, lineIdx) => (
//                                   <div key={lineIdx} className="flex flex-col items-center">
//                                     <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2 rounded-lg shadow-md font-medium flex items-center mb-3">
//                                       <Zap className="mr-2" size={18} />
//                                       {line.line_name}
//                                     </div>

//                                     {levelEnabled.subline && line.sublines && line.sublines.length > 0 && (
//                                       <>
//                                         <div className="w-0.5 h-6 bg-gradient-to-b from-green-400 to-yellow-400 mb-3"></div>
//                                         <div className="flex flex-col items-center">
//                                           {line.sublines.length > 1 && (
//                                             <div className="relative mb-3">
//                                               <div className="h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-400" style={{ width: `${(line.sublines.length - 1) * 120 + 80}px` }}></div>
//                                               {line.sublines.map((_, idx) => (
//                                                 <div key={idx} className="absolute w-0.5 h-3 bg-yellow-400" style={{ left: `${idx * 120 + 40}px`, top: '0px' }}></div>
//                                               ))}
//                                             </div>
//                                           )}

//                                           <div className="flex gap-6">
//                                             {line.sublines.map((subline, sublineIdx) => (
//                                               <div key={sublineIdx} className="flex flex-col items-center">
//                                                 <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-md shadow text-sm font-medium flex items-center mb-2">
//                                                   <Zap className="mr-1" size={14} />
//                                                   {subline.subline_name}
//                                                 </div>

//                                                 {levelEnabled.station && subline.stations.length > 0 && (
//                                                   <>
//                                                     <div className="w-0.5 h-4 bg-gradient-to-b from-yellow-400 to-red-400 mb-2"></div>
//                                                     <div className="flex flex-col items-center">
//                                                       {subline.stations.length > 1 && (
//                                                         <div className="relative mb-2">
//                                                           <div className="h-0.5 bg-gradient-to-r from-red-400 to-red-400" style={{ width: `${(subline.stations.length - 1) * 80 + 60}px` }}></div>
//                                                           {subline.stations.map((_, idx) => (
//                                                             <div key={idx} className="absolute w-0.5 h-2 bg-red-400" style={{ left: `${idx * 80 + 30}px`, top: '0px' }}></div>
//                                                           ))}
//                                                         </div>
//                                                       )}

//                                                       <div className="flex gap-3">
//                                                         {subline.stations.map((station, stationIdx) => (
//                                                           <div key={stationIdx} className="bg-gradient-to-r from-red-400 to-red-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center">
//                                                             <Target className="mr-1" size={10} />
//                                                             {station.station_name}
//                                                           </div>
//                                                         ))}
//                                                       </div>
//                                                     </div>
//                                                   </>
//                                                 )}
//                                               </div>
//                                             ))}
//                                           </div>
//                                         </div>
//                                       </>
//                                     )}

//                                     {!levelEnabled.subline && levelEnabled.station && line.stations && line.stations.length > 0 && (
//                                       <>
//                                         <div className="w-0.5 h-6 bg-gradient-to-b from-green-400 to-red-400 mb-3"></div>
//                                         <div className="flex flex-col items-center">
//                                           {line.stations.length > 1 && (
//                                             <div className="relative mb-3">
//                                               <div className="h-0.5 bg-gradient-to-r from-red-400 to-red-400" style={{ width: `${(line.stations.length - 1) * 80 + 60}px` }}></div>
//                                               {line.stations.map((_, idx) => (
//                                                 <div key={idx} className="absolute w-0.5 h-3 bg-red-400" style={{ left: `${idx * 80 + 30}px`, top: '0px' }}></div>
//                                               ))}
//                                             </div>
//                                           )}

//                                           <div className="flex gap-3">
//                                             {line.stations.map((station, stationIdx) => (
//                                               <div key={stationIdx} className="bg-gradient-to-r from-red-400 to-red-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center">
//                                                 <Target className="mr-1" size={10} />
//                                                 {station.station_name}
//                                               </div>
//                                             ))}
//                                           </div>
//                                         </div>
//                                       </>
//                                     )}
//                                   </div>
//                                 ))}
//                               </div>
//                             </div>
//                           </>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>

//           <div className="mt-8 pt-6 border-t border-gray-200">
//             <h5 className="text-sm font-semibold text-gray-600 mb-3">Hierarchy Legend:</h5>
//             <div className="flex flex-wrap justify-center gap-4 text-xs">
//               {[
//                 levelEnabled.hq && { color: 'from-red-500 to-pink-600', label: 'Headquarters' },
//                 levelEnabled.factory && { color: 'from-purple-500 to-indigo-600', label: 'Factory' },
//                 levelEnabled.department && { color: 'from-blue-500 to-cyan-600', label: 'Department' },
//                 levelEnabled.line && { color: 'from-green-500 to-emerald-600', label: 'Production Line' },
//                 levelEnabled.subline && { color: 'from-yellow-400 to-orange-500', label: 'Sub Line' },
//                 levelEnabled.station && { color: 'from-red-400 to-red-600', label: 'Station' }
//               ].filter(Boolean).map((item: any, idx) => (
//                 <div key={idx} className="flex items-center">
//                   <div className={`w-4 h-4 bg-gradient-to-r ${item.color} rounded mr-2`}></div>
//                   <span className="text-gray-600">{item.label}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="flex justify-between mt-8">
//         <button onClick={() => setShowSummary(false)} className="py-3 px-6 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center">
//           <ArrowRight className="mr-2 rotate-180" size={20} />
//           Continue Editing Plan
//         </button>
//         <button onClick={saveHierarchyStructure} disabled={isSaving} className="py-3 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center">
//           {isSaving ? <><Loader2 className="mr-2 animate-spin" size={20} />Saving...</> : <><Save className="mr-2" size={20} />Save Plan</>}
//         </button>
//       </div>
//     </div>
//   );

//   const SavedStructuresList = () => (
//     <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
//       <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
//         <Save className="mr-2 text-blue-600" size={20} />
//         Saved Manufacturing Plans
//       </h3>
//       {isLoading.structures ? (
//         <div className="text-center py-8">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading saved plans...</p>
//         </div>
//       ) : savedStructures.length === 0 ? (
//         <div className="text-center py-8 text-gray-500">No saved manufacturing plans found</div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {savedStructures.map((structure, idx) => (
//             <div key={idx} className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${selectedStructure?.structure_id === structure.structure_id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`} onClick={() => loadStructure(structure)}>
//               <div className="flex items-center justify-between mb-2">
//                 <h4 className="font-bold text-gray-800 flex items-center">
//                   {structure.hq_name && <MapPin className="mr-2 text-red-600" size={18} />}
//                   {structure.factory_name && <Building className="mr-2 text-purple-600" size={18} />}
//                   {structure.structure_name}
//                 </h4>
//                 {selectedStructure?.structure_id === structure.structure_id && <CheckCircle className="text-green-500" size={18} />}
//               </div>
//               <div className="text-sm text-gray-600">
//                 {structure.hq_name && (
//                   <div className="flex items-center mb-1">
//                     <MapPin className="mr-1" size={14} />
//                     {structure.hq_name}
//                   </div>
//                 )}
//                 {structure.factory_name && (
//                   <div className="flex items-center mb-1">
//                     <Building className="mr-1" size={14} />
//                     {structure.factory_name}
//                   </div>
//                 )}
//                 <div className="flex items-center mb-1">
//                 <Layers className="mr-1" size={14} />
//                   {structure.structure_data.departments?.length || 0} Departments
//                 </div>
//                 <div className="flex items-center">
//                   <Zap className="mr-1" size={14} />
//                   {structure.structure_data.departments?.reduce((acc, d) => acc + (d.lines?.length || 0), 0) || 0} Lines
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8">
//       <div className="max-w-6xl mx-auto">
//         <div className="text-center mb-12">
//           <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
//             Manufacturing Planning System
//           </h1>
//           <p className="text-xl text-gray-600 max-w-2xl mx-auto">Design your production hierarchy with precision and elegance</p>
//         </div>

//         <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
//           <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
//             <Plus className="mr-2 text-blue-600" size={20} />
//             Add New Items
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {[
//               { key: 'hq', label: 'Headquarters', placeholder: 'HQ name' },
//               { key: 'factory', label: 'Factory', placeholder: 'Factory name' },
//               { key: 'department', label: 'Department', placeholder: 'Department name' },
//               { key: 'line', label: 'Line', placeholder: 'Line name' },
//               { key: 'subline', label: 'Sub Line', placeholder: 'SubLine name' },
//               { key: 'station', label: 'Station', placeholder: 'Station name' }
//             ].map((item) => (
//               <div key={item.key}>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">{item.label}</label>
//                 <div className="flex">
//                   <input
//                     type="text"
//                     value={newItems[item.key as keyof typeof newItems]}
//                     onChange={(e) => setNewItems(prev => ({ ...prev, [item.key]: e.target.value }))}
//                     className="flex-1 rounded-l-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder={item.placeholder}
//                   />
//                   <button onClick={() => handleAddNewItem(item.key as keyof typeof newItems)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-lg flex items-center justify-center">
//                     <Plus size={18} />
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <SavedStructuresList />
//         <ProgressBar step={getProgressStep()} />

//         {showSummary ? (
//           <PlanSummary />
//         ) : (
//           <div className="space-y-8">
//             <SelectionCard title="Enable / Disable Hierarchy Levels" icon={Layers}>
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//                 {[
//                   { key: 'hq', label: 'Headquarters' },
//                   { key: 'factory', label: 'Factory' },
//                   { key: 'department', label: 'Department' },
//                   { key: 'line', label: 'Production Line' },
//                   { key: 'subline', label: 'Sub Line' },
//                   { key: 'station', label: 'Station' }
//                 ].map((lvl) => (
//                   <OptionButton
//                     key={lvl.key}
//                     option={`${lvl.label}: ${levelEnabled[lvl.key as keyof typeof levelEnabled] ? 'On' : 'Off'}`}
//                     isSelected={levelEnabled[lvl.key as keyof typeof levelEnabled]}
//                     onClick={() => setLevelEnabled(prev => {
//                       const key = lvl.key as keyof typeof prev;
//                       return { ...prev, [key]: !prev[key] };
//                     })}
//                   />
//                 ))}
//               </div>
//             </SelectionCard>

//             {levelEnabled.hq && (
//               <SelectionCard title="Choose Headquarters" icon={MapPin}>
//                 {isLoading.hqs ? (
//                   <div className="text-center py-8">
//                     <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
//                     <p className="mt-4 text-gray-600">Loading headquarters...</p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                     {data.hqs.map(hq => (
//                       <OptionButton
//                         key={hq.hq_id}
//                         option={hq.hq_name}
//                         isSelected={plan.structure_data.hq_name === hq.hq_name}
//                         onClick={() => handleHqSelect(hq.hq_name)}
//                       />
//                     ))}
//                   </div>
//                 )}
//               </SelectionCard>
//             )}

//             {(levelEnabled.hq ? !!plan.structure_data.hq_name : true) && levelEnabled.factory && (
//               <SelectionCard title="Choose Manufacturing Factory" icon={Building}>
//                 {isLoading.factories ? (
//                   <div className="text-center py-8">
//                     <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
//                     <p className="mt-4 text-gray-600">Loading factories...</p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                     {data.factories.map(factory => (
//                       <OptionButton
//                         key={factory.factory_id}
//                         option={factory.factory_name}
//                         isSelected={plan.structure_data.factory_name === factory.factory_name}
//                         onClick={() => handleFactorySelect(factory.factory_name)}
//                       />
//                     ))}
//                   </div>
//                 )}
//               </SelectionCard>
//             )}

//             {(levelEnabled.factory ? !!plan.structure_data.factory_name : true) && (
//               <SelectionCard title="Configure Departments & Production Structure" icon={Layers}>
//                 {levelEnabled.department && (
//                   <div className="mb-6">
//                     <h4 className="text-lg font-semibold text-gray-700 mb-4">Available Departments:</h4>
//                     {isLoading.departments ? (
//                       <div className="text-center py-4">
//                         <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
//                         <p className="mt-2 text-gray-600">Loading departments...</p>
//                       </div>
//                     ) : (
//                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                         {data.departments.map(department => (
//                           <OptionButton
//                             key={department.department_id}
//                             option={department.department_name}
//                             isSelected={plan.structure_data.departments.some(d => d.department_name === department.department_name)}
//                             onClick={() => handleDepartmentSelect(department.department_name)}
//                           />
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {levelEnabled.department && plan.structure_data.departments.map((department, departmentIndex) => (
//                   <div key={departmentIndex} className="mb-8 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-blue-200 shadow-inner">
//                     <div className="flex items-center justify-between mb-6">
//                       <h4 className="text-xl font-bold text-gray-800 flex items-center">
//                         <Layers className="mr-2 text-blue-600" size={20} />
//                         {department.department_name}
//                       </h4>
//                       <RemoveButton onClick={() => removeDepartment(departmentIndex)} />
//                     </div>

//                     {/* Show stations directly under department when lines are disabled */}
//                     {!levelEnabled.line && levelEnabled.station && (
//                       <div className="mb-6">
//                         <h5 className="text-lg font-semibold text-gray-700 mb-3">Department Stations:</h5>
//                         {isLoading.stations ? (
//                           <div className="text-center py-4">
//                             <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
//                             <p className="mt-2 text-gray-600">Loading stations...</p>
//                           </div>
//                         ) : (
//                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
//                             {data.stations.map(station => (
//                               <OptionButton
//                                 key={station.station_id}
//                                 option={station.station_name}
//                                 isSelected={department.stations?.some(s => s.station_name === station.station_name) || false}
//                                 onClick={() => handleDepartmentStationSelect(departmentIndex, station.station_name)}
//                                 variant="small"
//                               />
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                     )}

//                     {levelEnabled.line && (
//                       <div className="mb-6">
//                         <h5 className="text-lg font-semibold text-gray-700 mb-3">Production Lines:</h5>
//                         {isLoading.lines ? (
//                           <div className="text-center py-4">
//                             <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
//                             <p className="mt-2 text-gray-600">Loading lines...</p>
//                           </div>
//                         ) : (
//                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
//                             {data.lines.map(line => (
//                               <OptionButton
//                                 key={line.line_id}
//                                 option={line.line_name}
//                                 isSelected={department.lines.some(l => l.line_name === line.line_name)}
//                                 onClick={() => handleLineSelect(departmentIndex, line.line_name)}
//                               />
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                     )}

//                     {levelEnabled.line && department.lines.map((line, lineIndex) => (
//                       <div key={lineIndex} className="mb-6 p-5 bg-white rounded-lg shadow-md border border-gray-200">
//                         <div className="flex items-center justify-between mb-4">
//                           <h6 className="text-lg font-semibold text-gray-800 flex items-center">
//                             <Zap className="mr-2 text-purple-600" size={18} />
//                             {line.line_name}
//                           </h6>
//                           <RemoveButton onClick={() => removeLine(departmentIndex, lineIndex)} />
//                         </div>

//                         {levelEnabled.subline && (
//                           <div className="mb-4">
//                             <h6 className="text-md font-medium text-gray-700 mb-3">Select Sub Lines:</h6>
//                             {isLoading.sublines ? (
//                               <div className="text-center py-2">
//                                 <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
//                                 <p className="mt-1 text-gray-600 text-sm">Loading sub lines...</p>
//                               </div>
//                             ) : (
//                               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
//                                 {data.sublines.map(subline => (
//                                   <OptionButton
//                                     key={subline.subline_id}
//                                     option={subline.subline_name}
//                                     isSelected={line.sublines?.some(s => s.subline_name === subline.subline_name) || false}
//                                     onClick={() => handleSubLineSelect(departmentIndex, lineIndex, subline.subline_name)}
//                                     variant="small"
//                                   />
//                                 ))}
//                               </div>
//                             )}
//                           </div>
//                         )}

//                         {levelEnabled.subline && line.sublines?.map((subline, sublineIndex) => (
//                           <div key={sublineIndex} className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
//                             <div className="flex items-center justify-between mb-3">
//                               <h6 className="text-md font-medium text-gray-800 flex items-center">
//                                 <Zap className="mr-2 text-orange-600" size={16} />
//                                 {subline.subline_name}
//                               </h6>
//                               <RemoveButton onClick={() => removeSubLine(departmentIndex, lineIndex, sublineIndex)} />
//                             </div>

//                             {levelEnabled.station && (
//                               <div>
//                                 <h6 className="text-sm font-medium text-gray-700 mb-2">Select Active Stations:</h6>
//                                 {isLoading.stations ? (
//                                   <div className="text-center py-2">
//                                     <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
//                                     <p className="mt-1 text-gray-600 text-xs">Loading stations...</p>
//                                   </div>
//                                 ) : (
//                                   <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2">
//                                     {data.stations.map(station => (
//                                       <OptionButton
//                                         key={station.station_id}
//                                         option={station.station_name}
//                                         isSelected={subline.stations.some(s => s.station_name === station.station_name)}
//                                         onClick={() => handleStationSelect(departmentIndex, lineIndex, sublineIndex, station.station_name)}
//                                         variant="small"
//                                       />
//                                     ))}
//                                   </div>
//                                 )}
//                               </div>
//                             )}
//                           </div>
//                         ))}

//                         {!levelEnabled.subline && levelEnabled.station && (
//                           <div className="mt-4">
//                             <h6 className="text-md font-medium text-gray-700 mb-3">Select Active Stations:</h6>
//                             {isLoading.stations ? (
//                               <div className="text-center py-2">
//                                 <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
//                                 <p className="mt-1 text-gray-600 text-xs">Loading stations...</p>
//                               </div>
//                             ) : (
//                               <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2">
//                                 {data.stations.map(station => (
//                                   <OptionButton
//                                     key={station.station_id}
//                                     option={station.station_name}
//                                     isSelected={line.stations?.some(s => s.station_name === station.station_name) || false}
//                                     onClick={() => handleStationSelect(departmentIndex, lineIndex, null, station.station_name)}
//                                     variant="small"
//                                   />
//                                 ))}
//                               </div>
//                             )}
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 ))}
//               </SelectionCard>
//             )}

//             {!levelEnabled.department && levelEnabled.line && (
//               <SelectionCard title="Select Production Lines" icon={Zap}>
//                 {isLoading.lines ? (
//                   <div className="text-center py-4">
//                     <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
//                     <p className="mt-2 text-gray-600">Loading lines...</p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
//                     {data.lines.map(line => (
//                       <OptionButton
//                         key={line.line_id}
//                         option={line.line_name}
//                         isSelected={plan.structure_data.departments.some(d => d.lines.some(l => l.line_name === line.line_name))}
//                         onClick={() => handleGlobalLineSelect(line.line_name)}
//                       />
//                     ))}
//                   </div>
//                 )}
//               </SelectionCard>
//             )}

//             {!levelEnabled.line && levelEnabled.subline && (
//               <SelectionCard title="Select Sub Lines" icon={Zap}>
//                 {isLoading.sublines ? (
//                   <div className="text-center py-4">
//                     <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
//                     <p className="mt-2 text-gray-600">Loading sub lines...</p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
//                     {data.sublines.map(subline => (
//                       <OptionButton
//                         key={subline.subline_id}
//                         option={subline.subline_name}
//                         isSelected={plan.structure_data.departments.some(d => d.lines.some(l => l.sublines?.some(s => s.subline_name === subline.subline_name)))}
//                         onClick={() => handleGlobalSubLineSelect(subline.subline_name)}
//                       />
//                     ))}
//                   </div>
//                 )}
//               </SelectionCard>
//             )}

//             {/* {(!levelEnabled.subline || !levelEnabled.line || !levelEnabled.department) && levelEnabled.station && (
//               <SelectionCard title="Select Stations" icon={Target}>
//                 {isLoading.stations ? (
//                   <div className="text-center py-4">
//                     <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
//                     <p className="mt-2 text-gray-600">Loading stations...</p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
//                     {data.stations.map(station => {
//                       const isSelected = plan.structure_data.stations?.some(s => s.station_name === station.station_name) ||
//                                        plan.structure_data.departments.some(d => 
//                                          (d.stations?.some(s => s.station_name === station.station_name)) ||
//                                          d.lines.some(l => 
//                                            (l.sublines?.some(s => s.stations.some(st => st.station_name === station.station_name))) ||
//                                            (l.stations?.some(st => st.station_name === station.station_name))
//                                          )
//                                        );
//                       return (
//                         <OptionButton
//                           key={station.station_id}
//                           option={station.station_name}
//                           isSelected={isSelected}
//                           onClick={() => handleGlobalStationSelect(station.station_name)}
//                           variant="small"
//                         />
//                       );
//                     })}
//                   </div>
//                 )}
//               </SelectionCard>
//             )} */}

//             {hasCompletePlan() && (
//               <div className="text-center">
//                 <button onClick={() => setShowSummary(true)} className="py-4 px-8 bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 text-white rounded-2xl font-bold text-lg hover:from-green-600 hover:via-blue-600 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 flex items-center mx-auto">
//                   <Save className="mr-3" size={24} />
//                   Finalize Manufacturing Plan
//                   <ArrowRight className="ml-3" size={24} />
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Planning;
