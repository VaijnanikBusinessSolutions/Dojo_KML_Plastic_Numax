import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Upload, Plus, Trash2, FileSpreadsheet, Users, TrendingUp,
  Calendar, BarChart3, Building, Factory, Briefcase,
  AlertCircle, Loader2, Layers, Wrench, MapPin, CheckCircle, Pencil, X
} from "lucide-react";

// --- CONFIG ---
const API_BASE_URL = "http://127.0.0.1:8000/";

// --- INTERFACES ---
interface ManagementReviewData {
  id?: number;
  hq: string;
  factory: string;
  department: string;
  line: string;
  subline: string;
  station: string;
  month_year: string;
  new_operators_joined: number;
  new_operators_trained: number;
  total_training_plans: number;
  total_trainings_actual: number;
  total_defects_msil: number;
  ctq_defects_msil: number;
  total_defects_tier1: number;
  ctq_defects_tier1: number;
  total_internal_rejection: number;
  ctq_internal_rejection: number;
  manpower_available: number;
  manpower_required: number;
  gca_defects: number;
}

interface DropdownOption {
  id: number;
  name: string;
}

interface HierarchyItem {
  hq: number;
  hq_name: string;
  factory: number;
  factory_name: string;
  structure_data: {
    departments: Array<{
      id: number;
      department_name: string;
      lines?: Array<{
        id: number;
        line_name: string;
        stations?: Array<{ id: number; station_name: string; }>;
        sublines?: Array<{
          id: number;
          subline_name: string;
          stations?: Array<{
            id: number;
            station_name: string;
          }>;
        }>;
      }>;
    }>;
  };
}

const ManagementSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'add-data' | 'upload' | 'data-list'>('overview');
  const [managementReviewData, setManagementReviewData] = useState<ManagementReviewData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit State
  const [editingId, setEditingId] = useState<number | null>(null);

  // Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialFormState: ManagementReviewData = {
    hq: '', factory: '', department: '', line: '', subline: '', station: '', month_year: '',
    new_operators_joined: 0, new_operators_trained: 0, total_training_plans: 0,
    total_trainings_actual: 0, total_defects_msil: 0, ctq_defects_msil: 0,
    total_defects_tier1: 0, ctq_defects_tier1: 0, total_internal_rejection: 0,
    ctq_internal_rejection: 0,
    manpower_available: 0,
    manpower_required: 0,
    gca_defects: 0,
  };

  const [formData, setFormData] = useState<ManagementReviewData>(initialFormState);

  // Full hierarchy from API
  const [hierarchyData, setHierarchyData] = useState<HierarchyItem[]>([]);

  // Dropdown Options
  const [hqOptions, setHqOptions] = useState<DropdownOption[]>([]);
  const [factoryOptions, setFactoryOptions] = useState<DropdownOption[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<DropdownOption[]>([]);
  const [lineOptions, setLineOptions] = useState<DropdownOption[]>([]);
  const [sublineOptions, setSublineOptions] = useState<DropdownOption[]>([]);
  const [stationOptions, setStationOptions] = useState<DropdownOption[]>([]);

  // Name ↔ ID Maps
  const [nameToIdMap, setNameToIdMap] = useState<Record<string, Record<string, number>>>({
    hq: {}, factory: {}, department: {}, line: {}, subline: {}, station: {}
  });
  const [idToNameMap, setIdToNameMap] = useState<Record<string, Record<number, string>>>({
    hq: {}, factory: {}, department: {}, line: {}, subline: {}, station: {}
  });

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'add-data', name: 'Add Data', icon: Plus },
    { id: 'upload', name: 'Upload Excel', icon: Upload },
    { id: 'data-list', name: 'Data Records', icon: FileSpreadsheet },
  ];

  // --- INITIAL DATA LOAD ---
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        const [hierarchyRes, reviewsRes] = await Promise.all([
          axios.get<HierarchyItem[]>(`${API_BASE_URL}hierarchy-simple/`),
          axios.get(`${API_BASE_URL}management-reviews/`),
        ]);

        const data = hierarchyRes.data;
        setHierarchyData(data);

        // Build global maps
        const hqs = new Map<number, string>();
        const factories = new Map<number, string>();
        const depts = new Map<number, string>();
        const lines = new Map<number, string>();
        const sublines = new Map<number, string>();
        const stations = new Map<number, string>();

        data.forEach(item => {
          hqs.set(item.hq, item.hq_name);
          factories.set(item.factory, item.factory_name);

          item.structure_data.departments.forEach(dept => {
            depts.set(dept.id, dept.department_name);
            dept.lines?.forEach(line => {
              lines.set(line.id, line.line_name);
              line.stations?.forEach(st => stations.set(st.id, st.station_name));
              line.sublines?.forEach(sub => {
                sublines.set(sub.id, sub.subline_name);
                sub.stations?.forEach(st => stations.set(st.id, st.station_name));
              });
            });
          });
        });

        const buildMaps = (map: Map<number, string>) => {
          const options = Array.from(map, ([id, name]) => ({ id, name }));
          const nameToId = Object.fromEntries(Array.from(map, ([id, name]) => [name, id]));
          const idToName = Object.fromEntries(Array.from(map, ([id, name]) => [id, name]));
          return { options, nameToId, idToName };
        };

        const hq = buildMaps(hqs);
        const factory = buildMaps(factories);
        const dept = buildMaps(depts);
        const line = buildMaps(lines);
        const subline = buildMaps(sublines);
        const station = buildMaps(stations);

        setHqOptions(hq.options);

        setNameToIdMap({
          hq: hq.nameToId, factory: factory.nameToId, department: dept.nameToId,
          line: line.nameToId, subline: subline.nameToId, station: station.nameToId,
        });

        setIdToNameMap({
          hq: hq.idToName, factory: factory.idToName, department: dept.idToName,
          line: line.idToName, subline: subline.idToName, station: station.idToName,
        });

        // Transform existing records
        const transformed = reviewsRes.data.map((item: any) => ({
          ...item,
          hq: hq.idToName[item.hq] || 'Unknown',
          factory: factory.idToName[item.factory] || 'Unknown',
          department: dept.idToName[item.department] || 'Unknown',
          line: item.line ? line.idToName[item.line] || '-' : '-',
          subline: item.subline ? subline.idToName[item.subline] || '-' : '-',
          station: item.station ? station.idToName[item.station] || '-' : '-',
          month_year: `${item.year}-${String(item.month).padStart(2, '0')}`,
        }));

        setManagementReviewData(transformed);
      } catch (err) {
        setError("Failed to load data. Is the backend running?");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // --- CASCADING LOGIC ---
  const handleHqChange = (value: string) => {
    setFormData(prev => ({ ...prev, hq: value, factory: '', department: '', line: '', subline: '', station: '' }));
    if (!value) { setFactoryOptions([]); return; }

    const hqId = nameToIdMap.hq[value];
    const filtered = hierarchyData
      .filter(item => item.hq === hqId)
      .map(item => ({ id: item.factory, name: item.factory_name }));

    // Remove duplicates
    const unique = Array.from(new Map(filtered.map(i => [i.id, i])).values());
    setFactoryOptions(unique);
    setDepartmentOptions([]); setLineOptions([]); setSublineOptions([]); setStationOptions([]);
  };

  const handleFactoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, factory: value, department: '', line: '', subline: '', station: '' }));
    if (!value) { setDepartmentOptions([]); return; }

    const hqId = nameToIdMap.hq[formData.hq];
    const factoryId = nameToIdMap.factory[value];
    const depts = new Map<number, string>();

    hierarchyData
      .filter(item => item.hq === hqId && item.factory === factoryId)
      .forEach(item => {
        item.structure_data.departments.forEach(d => depts.set(d.id, d.department_name));
      });
    setDepartmentOptions(Array.from(depts, ([id, name]) => ({ id, name })));
    setLineOptions([]); setSublineOptions([]); setStationOptions([]);
  };

  const handleDepartmentChange = (value: string) => {
    setFormData(prev => ({ ...prev, department: value, line: '', subline: '', station: '' }));
    if (!value) { setLineOptions([]); return; }

    const hqId = nameToIdMap.hq[formData.hq];
    const factoryId = nameToIdMap.factory[formData.factory];
    const deptId = nameToIdMap.department[value];
    const lines = new Map<number, string>();

    hierarchyData
      .filter(item => item.hq === hqId && item.factory === factoryId)
      .forEach(item => {
        item.structure_data.departments
          .filter(d => d.id === deptId)
          .forEach(d => d.lines?.forEach(l => lines.set(l.id, l.line_name)));
      });
    setLineOptions(Array.from(lines, ([id, name]) => ({ id, name })));
    setSublineOptions([]); setStationOptions([]);
  };

  const handleLineChange = (value: string) => {
    setFormData(prev => ({ ...prev, line: value, subline: '', station: '' }));
    if (!value) { setSublineOptions([]); setStationOptions([]); return; }

    const hqId = nameToIdMap.hq[formData.hq];
    const factoryId = nameToIdMap.factory[formData.factory];
    const deptId = nameToIdMap.department[formData.department];
    const lineId = nameToIdMap.line[value];

    const foundSublines = new Map<number, string>();
    const foundDirectStations = new Map<number, string>();

    hierarchyData
      .filter(item => item.hq === hqId && item.factory === factoryId)
      .forEach(item => {
        item.structure_data.departments.forEach(d => {
          if (d.id === deptId) {
            d.lines?.forEach(l => {
              if (l.id === lineId) {
                l.sublines?.forEach(s => foundSublines.set(s.id, s.subline_name));
                l.stations?.forEach(st => foundDirectStations.set(st.id, st.station_name));
              }
            });
          }
        });
      });

    setSublineOptions(Array.from(foundSublines, ([id, name]) => ({ id, name })));
    setStationOptions(Array.from(foundDirectStations, ([id, name]) => ({ id, name })));
  };

  const handleSublineChange = (value: string) => {
    setFormData(prev => ({ ...prev, subline: value, station: '' }));

    const hqId = nameToIdMap.hq[formData.hq];
    const factoryId = nameToIdMap.factory[formData.factory];
    const deptId = nameToIdMap.department[formData.department];
    const lineId = nameToIdMap.line[formData.line];

    // Helper to get direct stations if subline is cleared
    const getDirectStations = () => {
      const directMap = new Map<number, string>();
      hierarchyData
        .filter(item => item.hq === hqId && item.factory === factoryId)
        .forEach(item => {
          item.structure_data.departments.forEach(d => {
            if (d.id === deptId) d.lines?.forEach(l => {
              if (l.id === lineId) l.stations?.forEach(st => directMap.set(st.id, st.station_name));
            });
          });
        });
      return Array.from(directMap, ([id, name]) => ({ id, name }));
    };

    if (!value) {
      setStationOptions(getDirectStations());
      return;
    }

    const sublineId = nameToIdMap.subline[value];
    const stations = new Map<number, string>();

    hierarchyData
      .filter(item => item.hq === hqId && item.factory === factoryId)
      .forEach(item => {
        item.structure_data.departments.forEach(d => {
          if (d.id === deptId) {
            d.lines?.forEach(l => {
              if (l.id === lineId) {
                l.sublines?.forEach(s => {
                  if (s.id === sublineId) {
                    s.stations?.forEach(st => stations.set(st.id, st.station_name));
                  }
                });
              }
            });
          }
        });
      });

    setStationOptions(Array.from(stations, ([id, name]) => ({ id, name })));
  };

  // --- EDIT LOGIC ---
  const handleEdit = (item: ManagementReviewData) => {
    setEditingId(item.id || null);

    // We need to re-generate the dropdown options for the selected hierarchy path
    // 1. Get IDs
    const hqId = nameToIdMap.hq[item.hq];
    const factoryId = nameToIdMap.factory[item.factory];
    const deptId = nameToIdMap.department[item.department];
    const lineId = item.line !== '-' ? nameToIdMap.line[item.line] : null;
    const sublineId = item.subline !== '-' ? nameToIdMap.subline[item.subline] : null;

    // 2. Generate Factory Options
    const filteredFactories = hierarchyData
      .filter(i => i.hq === hqId)
      .map(i => ({ id: i.factory, name: i.factory_name }));
    const uniqueFactories = Array.from(new Map(filteredFactories.map(i => [i.id, i])).values());
    setFactoryOptions(uniqueFactories);

    // 3. Generate Department Options
    const depts = new Map<number, string>();
    hierarchyData
      .filter(i => i.hq === hqId && i.factory === factoryId)
      .forEach(i => i.structure_data.departments.forEach(d => depts.set(d.id, d.department_name)));
    setDepartmentOptions(Array.from(depts, ([id, name]) => ({ id, name })));

    // 4. Generate Line Options
    const lines = new Map<number, string>();
    if (deptId) {
      hierarchyData
        .filter(i => i.hq === hqId && i.factory === factoryId)
        .forEach(i => i.structure_data.departments
          .filter(d => d.id === deptId)
          .forEach(d => d.lines?.forEach(l => lines.set(l.id, l.line_name))));
    }
    setLineOptions(Array.from(lines, ([id, name]) => ({ id, name })));

    // 5. Generate Subline & Station Options
    const foundSublines = new Map<number, string>();
    const foundDirectStations = new Map<number, string>();
    const sublineStations = new Map<number, string>();

    if (lineId) {
      hierarchyData
        .filter(i => i.hq === hqId && i.factory === factoryId)
        .forEach(i => {
          i.structure_data.departments.forEach(d => {
            if (d.id === deptId) {
              d.lines?.forEach(l => {
                if (l.id === lineId) {
                  l.sublines?.forEach(s => foundSublines.set(s.id, s.subline_name));
                  l.stations?.forEach(st => foundDirectStations.set(st.id, st.station_name));
                  // If subline selected, get its stations
                  if (sublineId) {
                    l.sublines?.forEach(s => {
                      if (s.id === sublineId) {
                        s.stations?.forEach(st => sublineStations.set(st.id, st.station_name));
                      }
                    });
                  }
                }
              });
            }
          });
        });
    }

    setSublineOptions(Array.from(foundSublines, ([id, name]) => ({ id, name })));

    // Set stations based on whether subline is selected or not
    if (sublineId) {
      setStationOptions(Array.from(sublineStations, ([id, name]) => ({ id, name })));
    } else {
      setStationOptions(Array.from(foundDirectStations, ([id, name]) => ({ id, name })));
    }

    // 6. Set Form Data
    setFormData({
      ...item,
      line: item.line === '-' ? '' : item.line,
      subline: item.subline === '-' ? '' : item.subline,
      station: item.station === '-' ? '' : item.station,
    });

    setActiveTab('add-data');
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setFactoryOptions([]);
    setDepartmentOptions([]);
    setLineOptions([]);
    setSublineOptions([]);
    setStationOptions([]);
  }

  // --- SUBMIT LOGIC ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const [year, month] = formData.month_year.split('-');

    const payload: any = {
      hq: nameToIdMap.hq[formData.hq],
      factory: nameToIdMap.factory[formData.factory],
      department: formData.department ? nameToIdMap.department[formData.department] : null,
      line: formData.line ? nameToIdMap.line[formData.line] : null,
      subline: formData.subline ? nameToIdMap.subline[formData.subline] : null,
      station: formData.station ? nameToIdMap.station[formData.station] : null,
      year: parseInt(year),
      month: parseInt(month),

      new_operators_joined: formData.new_operators_joined,
      new_operators_trained: formData.new_operators_trained,
      total_training_plans: formData.total_training_plans,
      total_trainings_actual: formData.total_trainings_actual,
      total_defects_msil: formData.total_defects_msil,
      ctq_defects_msil: formData.ctq_defects_msil,
      total_defects_tier1: formData.total_defects_tier1,
      ctq_defects_tier1: formData.ctq_defects_tier1,
      total_internal_rejection: formData.total_internal_rejection,
      ctq_internal_rejection: formData.ctq_internal_rejection,
      manpower_available: formData.manpower_available,
      manpower_required: formData.manpower_required,
      gca_defects: formData.gca_defects,
    };

    try {
      let res;
      if (editingId) {
        // UPDATE
        res = await axios.put(`${API_BASE_URL}management-reviews/${editingId}/`, payload);
      } else {
        // CREATE
        res = await axios.post(`${API_BASE_URL}management-reviews/`, payload);
      }

      const newItem = res.data;

      // Transform Helper
      const getName = (map: any, id: number) => (id ? map[id] || '-' : '-');

      const transformed = {
        ...newItem,
        hq: idToNameMap.hq[newItem.hq],
        factory: idToNameMap.factory[newItem.factory],
        department: idToNameMap.department[newItem.department],
        line: getName(idToNameMap.line, newItem.line),
        subline: getName(idToNameMap.subline, newItem.subline),
        station: getName(idToNameMap.station, newItem.station),
        month_year: `${newItem.year}-${String(newItem.month).padStart(2, '0')}`,
      };

      if (editingId) {
        setManagementReviewData(prev => prev.map(item => item.id === editingId ? transformed : item));
        alert("Data updated successfully!");
      } else {
        setManagementReviewData(prev => [...prev, transformed]);
        alert("Data added successfully!");
      }

      resetForm();
      setActiveTab('data-list');

    } catch (err: any) {
      alert("Error: " + (err.response?.data?.detail || "Failed to submit. Check duplicates."));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... (Delete, Upload, FormatDate logic remains same) ...
  const handleDelete = async (id: number) => {
    if (confirm("Delete this record?")) {
      await axios.delete(`${API_BASE_URL}management-reviews/${id}/`);
      setManagementReviewData(prev => prev.filter(x => x.id !== id));
    }
  };

  const handleDownloadTemplate = () => {
    window.location.href = `${API_BASE_URL}management/download-template/`;
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploadLoading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);
    try {
      await axios.post(`${API_BASE_URL}management/upload-excel/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("File uploaded successfully!");
      setUploadFile(null);
      window.location.reload();
    } catch (err: any) {
      alert("Upload failed: " + (err.response?.data?.error || "Unknown error"));
    } finally {
      setUploadLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const [y, m] = dateStr.split('-');
    return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  // Calculations for Overview
  const totalRecords = managementReviewData.length;
  const totalJoined = managementReviewData.reduce((acc, item) => acc + item.new_operators_joined, 0);
  const totalTrained = managementReviewData.reduce((acc, item) => acc + item.new_operators_trained, 0);
  const totalPlans = managementReviewData.reduce((acc, item) => acc + item.total_training_plans, 0);
  const totalActual = managementReviewData.reduce((acc, item) => acc + item.total_trainings_actual, 0);
  const totalDefectsMsil = managementReviewData.reduce((acc, item) => acc + item.total_defects_msil, 0);
  const totalCtqMsil = managementReviewData.reduce((acc, item) => acc + item.ctq_defects_msil, 0);
  const totalDefectsTier1 = managementReviewData.reduce((acc, item) => acc + item.total_defects_tier1, 0);
  const totalCtqTier1 = managementReviewData.reduce((acc, item) => acc + item.ctq_defects_tier1, 0);
  const totalInternalRej = managementReviewData.reduce((acc, item) => acc + item.total_internal_rejection, 0);
  const totalCtqRej = managementReviewData.reduce((acc, item) => acc + item.ctq_internal_rejection, 0);

  const isSublineVisible = sublineOptions.length > 0;

  // --- RENDER ---
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-blue-600" /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Management Review Dashboard</h1>
        <p className="text-lg text-gray-600 mb-8">Track and manage operational metrics</p>

        {/* Tabs */}
        <div className="mb-8 bg-white rounded-t-2xl shadow">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    if (tab.id === 'add-data' && !editingId) resetForm(); // Clear form if clicking add data manually
                  }}
                  className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center gap-2 transition-all ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 1. OVERVIEW TAB (Unchanged) */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center border-l-4 border-gray-500">
                <div className="bg-gray-100 p-4 rounded-full text-gray-600 mr-4">
                  <FileSpreadsheet className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-semibold">Total Records</p>
                  <h3 className="text-2xl font-bold text-gray-800">{totalRecords}</h3>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mt-8 border-b pb-2">Training Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col">
                <p className="text-gray-500 text-sm mb-1">Operators Joined</p>
                <div className="flex items-center text-blue-600"><Users className="h-6 w-6 mr-2" /><span className="text-2xl font-bold">{totalJoined}</span></div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col">
                <p className="text-gray-500 text-sm mb-1">Operators Trained</p>
                <div className="flex items-center text-green-600"><Users className="h-6 w-6 mr-2" /><span className="text-2xl font-bold">{totalTrained}</span></div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col">
                <p className="text-gray-500 text-sm mb-1">Training Plans</p>
                <div className="flex items-center text-purple-600"><TrendingUp className="h-6 w-6 mr-2" /><span className="text-2xl font-bold">{totalPlans}</span></div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col">
                <p className="text-gray-500 text-sm mb-1">Trainings Actual</p>
                <div className="flex items-center text-indigo-600"><CheckCircle className="h-6 w-6 mr-2" /><span className="text-2xl font-bold">{totalActual}</span></div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mt-8 border-b pb-2">Defects & Rejections</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-md border-t-4 border-red-500">
                <h4 className="font-bold text-gray-700 mb-4 flex items-center"><Factory className="w-4 h-4 mr-2" /> MSIL Defects</h4>
                <div className="flex justify-between mb-2"><span className="text-gray-500">Total</span><span className="font-bold text-red-600">{totalDefectsMsil}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">CTQ</span><span className="font-bold text-red-800">{totalCtqMsil}</span></div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-md border-t-4 border-orange-500">
                <h4 className="font-bold text-gray-700 mb-4 flex items-center"><Layers className="w-4 h-4 mr-2" /> Tier-1 Defects</h4>
                <div className="flex justify-between mb-2"><span className="text-gray-500">Total</span><span className="font-bold text-orange-600">{totalDefectsTier1}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">CTQ</span><span className="font-bold text-orange-800">{totalCtqTier1}</span></div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-md border-t-4 border-yellow-500">
                <h4 className="font-bold text-gray-700 mb-4 flex items-center"><AlertCircle className="w-4 h-4 mr-2" /> Internal Rejection</h4>
                <div className="flex justify-between mb-2"><span className="text-gray-500">Total</span><span className="font-bold text-yellow-600">{totalInternalRej}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">CTQ</span><span className="font-bold text-yellow-800">{totalCtqRej}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* 2. ADD / EDIT DATA TAB */}
        {activeTab === 'add-data' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                {editingId ? <><Pencil className="h-8 w-8 text-orange-600 mr-3" />Edit Entry</> : <><Plus className="h-8 w-8 text-blue-600 mr-3" />Add New Entry</>}
              </h2>
              {editingId && (
                <button onClick={resetForm} className="flex items-center text-gray-500 hover:text-red-500 transition-colors">
                  <X className="h-5 w-5 mr-1" /> Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Hierarchy Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><Building className="h-4 w-4 mr-2" /> HQ <span className="text-red-500 ml-1">*</span></label>
                  <select value={formData.hq} onChange={(e) => handleHqChange(e.target.value)} className="w-full px-4 py-3 border rounded-xl" required>
                    <option value="">Select HQ</option>
                    {hqOptions.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><Factory className="h-4 w-4 mr-2" /> Factory <span className="text-red-500 ml-1">*</span></label>
                  <select value={formData.factory} onChange={(e) => handleFactoryChange(e.target.value)} className="w-full px-4 py-3 border rounded-xl" disabled={!formData.hq} required>
                    <option value="">Select Factory</option>
                    {factoryOptions.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><Briefcase className="h-4 w-4 mr-2" /> Department</label>
                  <select value={formData.department} onChange={(e) => handleDepartmentChange(e.target.value)} className="w-full px-4 py-3 border rounded-xl" disabled={!formData.factory}>
                    <option value="">Select Department</option>
                    {departmentOptions.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><Layers className="h-4 w-4 mr-2" /> Line</label>
                  <select value={formData.line} onChange={(e) => handleLineChange(e.target.value)} className="w-full px-4 py-3 border rounded-xl" disabled={!formData.department}>
                    <option value="">All Lines</option>
                    {lineOptions.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
                  </select>
                </div>
                <div className={isSublineVisible ? "block" : "hidden"}>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><Wrench className="h-4 w-4 mr-2" /> Subline</label>
                  <select value={formData.subline} onChange={(e) => handleSublineChange(e.target.value)} className="w-full px-4 py-3 border rounded-xl">
                    <option value="">All Sublines</option>
                    {sublineOptions.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><MapPin className="h-4 w-4 mr-2" /> Station</label>
                  <select value={formData.station} onChange={(e) => setFormData(prev => ({ ...prev, station: e.target.value }))} className="w-full px-4 py-3 border rounded-xl" disabled={!formData.line}>
                    <option value="">All Stations</option>
                    {stationOptions.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { id: 'month_year', label: 'Month/Year', type: 'month', icon: Calendar },
                  { id: 'manpower_available', label: 'Manpower Available', type: 'number', icon: Users },
                  { id: 'manpower_required', label: 'Manpower Required', type: 'number', icon: Users },
                  { id: 'new_operators_joined', label: 'New Operators Joined', type: 'number', icon: Users },
                  { id: 'new_operators_trained', label: 'New Operators Trained', type: 'number', icon: Users },
                  { id: 'total_training_plans', label: 'Training Plans', type: 'number', icon: TrendingUp },
                  { id: 'total_trainings_actual', label: 'Trainings Actual', type: 'number', icon: TrendingUp },
                  { id: 'total_defects_msil', label: 'Defects MSIL', type: 'number', icon: BarChart3 },
                  { id: 'ctq_defects_msil', label: 'CTQ Defects MSIL', type: 'number', icon: BarChart3 },
                  { id: 'total_defects_tier1', label: 'Total Defects Tier-1', type: 'number', icon: BarChart3 },
                  { id: 'ctq_defects_tier1', label: 'CTQ Defects Tier-1', type: 'number', icon: BarChart3 },
                  { id: 'total_internal_rejection', label: 'Internal Rejection', type: 'number', icon: BarChart3 },
                  { id: 'ctq_internal_rejection', label: 'CTQ Internal Rejection', type: 'number', icon: BarChart3 },
                  { id: 'gca_defects', label: 'GCA Defects', type: 'number', icon: AlertCircle, isDecimal: true },
                ].map((field: any) => {
                  const Icon = field.icon;
                  return (
                    <div key={field.id}>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <Icon className="h-4 w-4 mr-2" /> {field.label}
                      </label>
                      <input
                        type={field.type}
                        step={field.isDecimal ? "0.01" : "1"}
                        value={formData[field.id as keyof ManagementReviewData] as any}
                        onChange={(e) => {
                          let val: any = e.target.value;
                          if (field.type === 'number') {
                            val = field.isDecimal ? parseFloat(e.target.value) || 0 : parseInt(e.target.value) || 0;
                          }
                          setFormData(prev => ({ ...prev, [field.id]: val }));
                        }}
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4">
                <button type="submit" disabled={isSubmitting} className={`px-8 py-4 font-bold rounded-xl text-white disabled:opacity-50 flex-1 ${editingId ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  {isSubmitting ? 'Processing...' : (editingId ? 'Update Entry' : 'Add Entry')}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} className="px-8 py-4 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* 3. UPLOAD EXCEL TAB (Unchanged) */}
        {activeTab === 'upload' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Bulk Upload Data</h2>
            <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
              <button onClick={handleDownloadTemplate} className="px-6 py-2 bg-white text-blue-700 font-bold rounded-lg border border-blue-200 shadow-sm hover:bg-blue-50 transition-all">Download Template.xlsx</button>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
              <input type="file" accept=".xlsx, .xls" onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)} className="mb-6 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
              {uploadFile && <div className="flex items-center text-sm text-green-600 font-medium mb-4 bg-green-50 px-4 py-2 rounded-full"><CheckCircle className="h-4 w-4 mr-2" />{uploadFile.name} selected</div>}
              <button onClick={handleUpload} disabled={!uploadFile || uploadLoading} className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center shadow-lg disabled:shadow-none transition-all">
                {uploadLoading ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Uploading...</> : <><Upload className="h-5 w-5 mr-2" /> Upload Excel File</>}
              </button>
            </div>
          </div>
        )}

        {/* 4. DATA LIST TAB */}
        {activeTab === 'data-list' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b"><h2 className="text-2xl font-bold">Data Records ({managementReviewData.length})</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">HQ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Factory</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dept</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Line</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subline</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Station</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {managementReviewData.map(item => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 text-sm">{item.hq}</td>
                      <td className="px-6 py-4 text-sm">{item.factory}</td>
                      <td className="px-6 py-4 text-sm">{item.department}</td>
                      <td className="px-6 py-4 text-sm">{item.line}</td>
                      <td className="px-6 py-4 text-sm">{item.subline}</td>
                      <td className="px-6 py-4 text-sm">{item.station}</td>
                      <td className="px-6 py-4 text-sm">{formatDate(item.month_year)}</td>
                      <td className="px-6 py-4 flex gap-2">
                        {/* EDIT BUTTON ADDED HERE */}
                        <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800" title="Edit">
                          <Pencil className="h-5 w-5" />
                        </button>
                        <button onClick={() => item.id && handleDelete(item.id)} className="text-red-600 hover:text-red-800" title="Delete">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagementSettings;