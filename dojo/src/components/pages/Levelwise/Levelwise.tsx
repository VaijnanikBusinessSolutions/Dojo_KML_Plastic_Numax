import React, { useEffect, useState } from "react";
import {
  Factory,
  Settings,
  MapPin,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Target,
  TrendingUp,
  Layers,
} from "lucide-react";
import { ProcessDojo } from "../../hooks/ServiceApis";
import { useLocation, useNavigate } from "react-router-dom";

// ---------------- Types used by the component ----------------
interface Station {
  station_name: string;
  id: number;
}

interface Subline {
  subline_name: string;
  id: number;
  stations: Station[];
}

interface Line {
  line_name: string;
  id: number;
  sublines: Subline[];
  stations?: Station[]; // some APIs include direct stations under line
}

interface Department {
  department_id: number;
  department_name: string;
  lines: Line[];
  sublines?: Subline[];
  stations?: Station[];
}

interface HierarchyStructure {
  structure_id: number;
  structure_name: string;
  hq_id: number;
  hq_name: string;
  factory_id: number;
  factory_name: string;
  department: Department;
}

interface LocationState {
  levelId?: number;
  levelName?: string;
}

// ---------------- Helper functions to normalize API data ----------------
const normalizeStation = (raw: any): Station => ({
  id: raw.station_id ?? raw.id,
  station_name: raw.station_name,
});

const normalizeSubline = (raw: any): Subline => ({
  id: raw.subline_id ?? raw.id,
  subline_name: raw.subline_name,
  stations: Array.isArray(raw.stations) ? raw.stations.map(normalizeStation) : [],
});

const normalizeLine = (raw: any): Line => ({
  id: raw.line_id ?? raw.id,
  line_name: raw.line_name,
  sublines: Array.isArray(raw.sublines) ? raw.sublines.map(normalizeSubline) : [],
  stations: Array.isArray(raw.stations) ? raw.stations.map(normalizeStation) : [],
});

const normalizeDepartment = (raw: any): Department => ({
  department_id: raw.department_id ?? raw.id ?? 0,
  department_name: raw.department_name ?? raw.name ?? "",
  lines: Array.isArray(raw.lines) ? raw.lines.map(normalizeLine) : [],
  sublines: Array.isArray(raw.sublines) ? raw.sublines.map(normalizeSubline) : [],
  stations: Array.isArray(raw.stations) ? raw.stations.map(normalizeStation) : [],
});

const normalizeHierarchyResponse = (res: any): HierarchyStructure | null => {
  if (!res) return null;
  const first = Array.isArray(res) ? res[0] : res;

  // Case A: API returned a Department object directly
  if (first && (first.department_id || first.department_name) && (first.lines || first.sublines || first.stations)) {
    return {
      structure_id: 0,
      structure_name: "",
      hq_id: 0,
      hq_name: "",
      factory_id: 0,
      factory_name: "",
      department: normalizeDepartment(first),
    };
  }

  // Case B: API returned a HierarchyStructure-like object { department: { ... } }
  if (first && first.department) {
    return {
      structure_id: first.structure_id ?? 0,
      structure_name: first.structure_name ?? "",
      hq_id: first.hq_id ?? first.hq ?? 0,
      hq_name: first.hq_name ?? "",
      factory_id: first.factory_id ?? first.factory ?? 0,
      factory_name: first.factory_name ?? "",
      department: normalizeDepartment(first.department),
    };
  }

  // Unknown shape
  return null;
};

// Station colors for visual variety
const stationColors = ['purple', 'blue', 'green', 'red', 'orange', 'yellow', 'indigo', 'pink'];

// ---------------- Component ----------------
export const Levelwise: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { levelId, levelName } = (location.state as LocationState) || {};
  console.log("Levelwise component mounted with levelId:", levelId, "levelName:", levelName);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [currentDepartmentId, setCurrentDepartmentId] = useState<number | null>(null);
  const [hierarchy, setHierarchy] = useState<HierarchyStructure | null>(null);

  const [expandedLines, setExpandedLines] = useState<number[]>([]);
  const [expandedSublines, setExpandedSublines] = useState<number[]>([]);

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await ProcessDojo.fetchDepartments();
        const incomingDepartments = Array.isArray(res) ? res : res?.departments ?? [];
        const normalized = incomingDepartments.map((d: any) => normalizeDepartment(d));
        setDepartments(normalized);

        if (normalized.length > 0) {
          const firstDeptId = normalized[0].department_id;
          setCurrentDepartmentId(firstDeptId);
          await loadHierarchy(firstDeptId);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchDepartments();
  }, []);

  // Load hierarchy structure for a department
  const loadHierarchy = async (departmentId: number) => {
    try {
      const res = await ProcessDojo.fetchHierarchyByDepartment(departmentId);
      console.log("raw hierarchy response:", res);

      const normalized = normalizeHierarchyResponse(res);
      if (normalized) {
        setHierarchy(normalized);
        setExpandedLines([]);
        setExpandedSublines([]);
      } else {
        console.warn("Unable to normalize hierarchy response", res);
        setHierarchy(null);
      }
    } catch (error) {
      console.error("Error fetching hierarchy:", error);
      setHierarchy(null);
    }
  };

  const handleDepartmentChange = (departmentId: number) => {
    setCurrentDepartmentId(departmentId);
    loadHierarchy(departmentId);
  };

  const toggleLine = (lineId: number) => {
    setExpandedLines((prev) => (prev.includes(lineId) ? prev.filter((id) => id !== lineId) : [...prev, lineId]));
  };

  const toggleSubline = (sublineId: number) => {
    setExpandedSublines((prev) => (prev.includes(sublineId) ? prev.filter((id) => id !== sublineId) : [...prev, sublineId]));
  };

  // ---------- Navigation handler for station clicks ----------
  const handleStationClick = (
    station: Station,
    ctx: { department: Department; line?: Line; subline?: Subline }
  ) => {
    navigate("/TrainingOptionsPageNew", {
      state: {
        stationId: station.id,
        stationName: station.station_name,
        sublineId: ctx.subline?.id ?? null,
        sublineName: ctx.subline?.subline_name ?? null,
        lineId: ctx.line?.id ?? null,
        lineName: ctx.line?.line_name ?? null,
        departmentId: ctx.department?.department_id ?? currentDepartmentId,
        departmentName: ctx.department?.department_name ?? null,
        levelId,
        levelName,
      },
    });
  };

  // Get color class for station
  const getStationColorClass = (index: number) => {
    const color = stationColors[index % stationColors.length];
    const colorClasses = {
      purple: 'bg-gradient-to-r from-purple-500 to-violet-600',
      blue: 'bg-gradient-to-r from-blue-500 to-cyan-600',
      green: 'bg-gradient-to-r from-green-500 to-emerald-600',
      red: 'bg-gradient-to-r from-red-500 to-rose-600',
      orange: 'bg-gradient-to-r from-orange-500 to-amber-600',
      yellow: 'bg-gradient-to-r from-yellow-500 to-orange-600',
      indigo: 'bg-gradient-to-r from-indigo-500 to-purple-600',
      pink: 'bg-gradient-to-r from-pink-500 to-rose-600'
    };
    return colorClasses[color as keyof typeof colorClasses];
  };

  const getStationBgClass = (index: number) => {
    const color = stationColors[index % stationColors.length];
    const bgClasses = {
      purple: 'bg-purple-400/10',
      blue: 'bg-blue-400/10',
      green: 'bg-green-400/10',
      red: 'bg-red-400/10',
      orange: 'bg-orange-400/10',
      yellow: 'bg-yellow-400/10',
      indigo: 'bg-indigo-400/10',
      pink: 'bg-pink-400/10'
    };
    return bgClasses[color as keyof typeof bgClasses];
  };

  // Helper function to render stations with Dashboard styling
  const renderStations = (
    stations: Station[] | undefined,
    department: Department,
    line?: Line,
    subline?: Subline,
    levelType?: string
  ) => {
    const list = stations ?? [];
    if (list.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
            <MapPin size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No stations configured</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/*{list.map((station, index) => ( */}
        {list
          .filter(station => station.station_name?.toLowerCase() !== "general")
          .map((station, index) => (
          <button
            key={station.id}
            onClick={() => handleStationClick(station, { department, line, subline })}
            className="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 transition-all duration-300 text-left hover:shadow-2xl hover:-translate-y-2 transform border border-white/30 overflow-hidden"
          >
            {/* Station Color Indicator */}
            <div className={`absolute top-0 left-0 w-full h-1 ${getStationColorClass(index)}`}></div>
            
            {/* Background Pattern */}
            <div className={`absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl ${getStationBgClass(index)}`}></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-4 h-4 rounded-full shadow-lg ${getStationColorClass(index)}`}></div>
                {/* <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors duration-300">
                  <MapPin size={16} className="text-gray-600" />
                </div> */}
                {/* {levelType && (
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                    levelType === 'Department' ? 'bg-orange-100 text-orange-700' :
                    levelType === 'Line' ? 'bg-blue-100 text-blue-700' : 
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {levelType} Level
                  </span>
                )} */}
              </div>
              <h5 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-indigo-700 transition-colors duration-300">
                {station.station_name}
              </h5>
              {/* <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                <Target size={14} />
                Ready for training
              </p> */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500  tracking-wider">
                  Station
                </span>
                {/* <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-xs font-bold shadow-sm">
                  Active
                </span> */}
              </div>
            </div>
            
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
          </button>
        ))}
      </div>
    );
  };

  const activeDepartment = departments.find(d => d.department_id === currentDepartmentId) || departments[0];

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-400/5 to-purple-400/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-tr from-indigo-400/5 to-pink-400/5 rounded-full blur-3xl"></div>

      {/* Department Tabs */}
      <div className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-2xl">
        <div className="px-8">
          <nav className="flex space-x-8">
            {departments.map((dept) => (
              <button
                key={dept.department_id}
                onClick={() => handleDepartmentChange(dept.department_id)}
                className={`py-6 px-4 border-b-3 font-bold text-lg transition-all duration-300 relative group ${
                  dept.department_id === currentDepartmentId
                    ? "border-indigo-500 text-indigo-600 bg-gradient-to-t from-indigo-50/50 to-transparent"
                    : "border-transparent text-gray-600 hover:text-indigo-600 hover:border-indigo-300 hover:bg-gradient-to-t hover:from-indigo-50/30 hover:to-transparent"
                }`}
              >
                {dept.department_id === currentDepartmentId && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 rounded-t-xl"></div>
                )}
                {dept.department_name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Hierarchical Content */}
      <div className="relative z-10 p-8">
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl">
              <Sparkles size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
                {activeDepartment?.department_name} Operations
              </h2>
              {/* <p className="text-gray-600 text-lg">
                Navigate through your manufacturing hierarchy
              </p> */}
            </div>
          </div>
        </div>

        {/* Hierarchy View */}
        {hierarchy ? (
          <>
            {/* Department has lines */}
            {hierarchy.department.lines && hierarchy.department.lines.length > 0 ? (
              <div className="space-y-8">
                {hierarchy.department.lines.map((line) => (
                  <div key={line.id} className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 relative">
                    {/* Animated Background */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
                    
                    {/* Line Header */}
                    <div 
                      className="relative z-10 p-8 bg-gradient-to-r from-indigo-50/80 via-blue-50/60 to-purple-50/80 backdrop-blur-sm border-b border-white/20 cursor-pointer hover:from-indigo-100/80 hover:via-blue-100/60 hover:to-purple-100/80 transition-all duration-300"
                      onClick={() => toggleLine(line.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl">
                            <Factory size={32} className="text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">{line.line_name}</h3>
                            {/* <p className="text-gray-600 flex items-center gap-2">
                              <TrendingUp size={16} />
                              {line.sublines?.length || 0} sub line{(line.sublines?.length || 0) !== 1 ? 's' : ''}
                            </p> */}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-2xl text-sm font-bold shadow-lg">
                            Line
                          </span>
                          <div className="p-2 bg-white/50 rounded-xl">
                            {expandedLines.includes(line.id) ? (
                              <ChevronDown size={24} className="text-gray-600" />
                            ) : (
                              <ChevronRight size={24} className="text-gray-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expand line content */}
                    {expandedLines.includes(line.id) && (
                      <div className="relative z-10 p-6 bg-gradient-to-br from-gray-50/80 to-white/80 backdrop-blur-sm">
                        {/* Line has sublines */}
                        {line.sublines && line.sublines.length > 0 ? (
                          <div className="space-y-6">
                            {line.sublines.map((subline) => (
                              <div key={subline.id} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl"></div>
                                
                                {/* Sub Line Header */}
                                <div 
                                  className="relative z-10 p-6 bg-gradient-to-r from-purple-50/80 to-pink-50/80 backdrop-blur-sm border-b border-white/20 cursor-pointer hover:from-purple-100/80 hover:to-pink-100/80 transition-all duration-300"
                                  onClick={() => toggleSubline(subline.id)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                      <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                                        <Settings size={24} className="text-white" />
                                      </div>
                                      <div>
                                        <h4 className="text-xl font-bold text-gray-900 mb-1">{subline.subline_name}</h4>
                                        <p className="text-gray-600 flex items-center gap-2">
                                          <Target size={14} />
                                          {subline.stations?.length || 0} station{(subline.stations?.length || 0) !== 1 ? 's' : ''}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-2xl text-sm font-bold shadow-lg">
                                        Sub Line
                                      </span>
                                      <div className="p-2 bg-white/50 rounded-xl">
                                        {expandedSublines.includes(subline.id) ? (
                                          <ChevronDown size={20} className="text-gray-600" />
                                        ) : (
                                          <ChevronRight size={20} className="text-gray-600" />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Show stations under subline */}
                                {expandedSublines.includes(subline.id) && (
                                  <div className="relative z-10 p-6">
                                    {renderStations(subline.stations, hierarchy.department, line, subline, 'Subline')}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          // Line has no sublines; show stations under line or fallback message
                          <div className="bg-gray-50/80 rounded-xl p-6">
                            {line.stations && line.stations.length > 0 ? 
                              renderStations(line.stations, hierarchy.department, line, undefined, 'Line') : 
                              <div className="text-center py-12">
                                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                                  <Layers size={40} className="text-gray-400" />
                                </div>
                                <p className="text-gray-500 text-lg font-medium">No sublines available for this line</p>
                              </div>
                            }
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : hierarchy.department.sublines && hierarchy.department.sublines.length > 0 ? (
              // Department has no lines but has sublines
              <div className="space-y-6">
                {hierarchy.department.sublines.map((subline) => (
                  <div key={subline.id} className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 relative">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
                    
                    <div 
                      className="relative z-10 p-8 bg-gradient-to-r from-purple-50/80 to-pink-50/80 backdrop-blur-sm border-b border-white/20 cursor-pointer hover:from-purple-100/80 hover:to-pink-100/80 transition-all duration-300"
                      onClick={() => toggleSubline(subline.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl">
                            <Settings size={32} className="text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">{subline.subline_name}</h3>
                            <p className="text-gray-600 flex items-center gap-2">
                              <Target size={16} />
                              {subline.stations?.length || 0} station{(subline.stations?.length || 0) !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-2xl text-sm font-bold shadow-lg">
                            Sub Line
                          </span>
                          <div className="p-2 bg-white/50 rounded-xl">
                            {expandedSublines.includes(subline.id) ? (
                              <ChevronDown size={24} className="text-gray-600" />
                            ) : (
                              <ChevronRight size={24} className="text-gray-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Show stations under subline */}
                    {expandedSublines.includes(subline.id) && (
                      <div className="relative z-10 p-8">
                        {renderStations(subline.stations, hierarchy.department, undefined, subline, 'Subline')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // Department has no lines and no sublines, show stations under department
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-400/10 to-red-400/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 p-8 bg-gradient-to-r from-orange-50/80 via-red-50/60 to-pink-50/80 backdrop-blur-sm border-b border-white/20">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-xl">
                      <MapPin size={32} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">Department Stations</h3>
                      <p className="text-gray-600 flex items-center gap-2">
                        <Target size={16} />
                        {hierarchy.department.stations?.length || 0} station{(hierarchy.department.stations?.length || 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 p-8">
                  {hierarchy.department.stations && hierarchy.department.stations.length > 0 ? (
                    renderStations(hierarchy.department.stations, hierarchy.department, undefined, undefined, 'Department')
                  ) : (
                    <div className="text-center py-20">
                      <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
                        <Factory size={64} className="text-gray-400" />
                      </div>
                      <p className="text-2xl font-bold text-gray-500 mb-4">No stations configured</p>
                      <p className="text-gray-400 text-lg max-w-md mx-auto">
                        Set up your stations in the Settings page to get started.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/50"></div>
            <div className="relative z-10">
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
                <Factory size={64} className="text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-500 mb-4">Select a department to view hierarchy</p>
              <p className="text-gray-400 text-lg max-w-md mx-auto">
                Choose a department from the tabs above to explore the manufacturing hierarchy.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};