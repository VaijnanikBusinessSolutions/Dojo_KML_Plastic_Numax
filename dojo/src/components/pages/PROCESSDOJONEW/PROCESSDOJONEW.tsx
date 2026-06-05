import React, { useEffect, useState } from "react";
import { ChevronRight, ChevronDown, Factory, TrendingUp, MapPin, Settings } from "lucide-react";
import { ProcessDojo } from "../../hooks/ServiceApis";

// ---------------- Types ----------------
interface Department {
  department_id: number;
  department_name: string;
}

interface Station {
  station_id: number;
  station_name: string;
}

interface Subline {
  subline_id: number;
  subline_name: string;
  stations?: Station[];
}

interface Line {
  line_id: number;
  line_name: string;
  sublines?: Subline[];
}

interface DepartmentsResponse {
  departments: Department[];
}

interface LinesResponse {
  lines: Line[];
}

interface SublineResponse {
  subline_id: number;
  subline_name: string;
  stations: Station[];
}

// ---------------- Component ----------------
export const PROCESSDOJONEW: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [currentDepartmentId, setCurrentDepartmentId] = useState<number | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [expandedLines, setExpandedLines] = useState<Set<number>>(new Set());
  const [expandedSublines, setExpandedSublines] = useState<Set<number>>(new Set());
  const [loadingSublines, setLoadingSublines] = useState<Set<number>>(new Set());
  const [loadingStations, setLoadingStations] = useState<Set<number>>(new Set());

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res: DepartmentsResponse = await ProcessDojo.fetchDepartments();
        setDepartments(res.departments);

        if (res.departments.length > 0) {
          const firstDeptId = res.departments[0].department_id;
          setCurrentDepartmentId(firstDeptId);

          // Fetch lines for the first department
          const linesRes: LinesResponse = await ProcessDojo.fetchLinesByDepartment(firstDeptId);
          setLines(linesRes.lines);
        }
      } catch (error) {
        console.error("Error fetching departments or lines:", error);
      }
    };

    fetchDepartments();
  }, []);

  // When department changes, fetch lines
  const handleDepartmentChange = async (departmentId: number) => {
    setCurrentDepartmentId(departmentId);
    try {
      const linesRes: LinesResponse = await ProcessDojo.fetchLinesByDepartment(departmentId);
      setLines(linesRes.lines);
      setExpandedLines(new Set()); // collapse all lines
      setExpandedSublines(new Set()); // collapse all sublines
    } catch (error) {
      console.error("Error fetching lines for department:", error);
    }
  };

  // Toggle line expansion and fetch sublines if needed
  const toggleLineExpansion = async (lineId: number) => {
    const newExpandedLines = new Set(expandedLines);
    
    if (newExpandedLines.has(lineId)) {
      newExpandedLines.delete(lineId);
      // Also collapse all sublines of this line
      const lineSublines = lines.find(l => l.line_id === lineId)?.sublines || [];
      const newExpandedSublines = new Set(expandedSublines);
      lineSublines.forEach(subline => newExpandedSublines.delete(subline.subline_id));
      setExpandedSublines(newExpandedSublines);
    } else {
      newExpandedLines.add(lineId);
      
      // Fetch sublines if not already loaded
      const line = lines.find(l => l.line_id === lineId);
      if (line && !line.sublines) {
        setLoadingSublines(prev => new Set(prev).add(lineId));
        try {
          const sublinesData: Subline[] = await ProcessDojo.fetchSublinesByLine(lineId);
          
          // Update the lines state with sublines data
          setLines(prevLines => 
            prevLines.map(l => 
              l.line_id === lineId 
                ? { ...l, sublines: sublinesData } 
                : l
            )
          );
        } catch (error) {
          console.error("Error fetching sublines:", error);
        } finally {
          setLoadingSublines(prev => {
            const newSet = new Set(prev);
            newSet.delete(lineId);
            return newSet;
          });
        }
      }
    }
    
    setExpandedLines(newExpandedLines);
  };

  // Toggle subline expansion and fetch stations if needed
  const toggleSublineExpansion = async (sublineId: number) => {
    const newExpandedSublines = new Set(expandedSublines);
    
    if (newExpandedSublines.has(sublineId)) {
      newExpandedSublines.delete(sublineId);
    } else {
      newExpandedSublines.add(sublineId);
      
      // Find the subline and check if stations need to be loaded
      let targetSubline: Subline | undefined;
      for (const line of lines) {
        if (line.sublines) {
          targetSubline = line.sublines.find(s => s.subline_id === sublineId);
          if (targetSubline) break;
        }
      }
      
      if (targetSubline && !targetSubline.stations) {
        setLoadingStations(prev => new Set(prev).add(sublineId));
        try {
          const stationData: SublineResponse = await ProcessDojo.fetchStationsBySubline(sublineId);
          
          // Update the lines state with stations data
          setLines(prevLines => 
            prevLines.map(line => ({
              ...line,
              sublines: line.sublines?.map(subline => 
                subline.subline_id === sublineId 
                  ? { ...subline, stations: stationData.stations }
                  : subline
              )
            }))
          );
        } catch (error) {
          console.error("Error fetching stations:", error);
        } finally {
          setLoadingStations(prev => {
            const newSet = new Set(prev);
            newSet.delete(sublineId);
            return newSet;
          });
        }
      }
    }
    
    setExpandedSublines(newExpandedSublines);
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
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
                {dept.department_name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Lines */}
      <div className="relative z-10 p-8 space-y-6">
        {lines.map((line) => (
          <div
            key={line.line_id}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 relative"
          >
            {/* Line Header */}
            <div
              className="relative z-10 p-6 bg-gradient-to-r from-indigo-50/80 via-blue-50/60 to-purple-50/80 cursor-pointer"
              onClick={() => toggleLineExpansion(line.line_id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl">
                    <Factory size={32} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {line.line_name}
                    </h3>
                    <p className="text-gray-600 flex items-center gap-2">
                      <TrendingUp size={16} /> 
                      {loadingSublines.has(line.line_id) ? "Loading sublines..." : "Click to expand"}
                    </p>
                  </div>
                </div>
                <div className="p-2 bg-white/50 rounded-xl">
                  {expandedLines.has(line.line_id) ? (
                    <ChevronDown size={24} className="text-gray-600" />
                  ) : (
                    <ChevronRight size={24} className="text-gray-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Sublines */}
            {expandedLines.has(line.line_id) && (
              <div className="p-6 space-y-4">
                {line.sublines && line.sublines.length > 0 ? (
                  line.sublines.map((subline) => (
                    <div
                      key={subline.subline_id}
                      className="bg-gradient-to-r from-blue-50/50 to-cyan-50/50 rounded-2xl border border-blue-100/50 overflow-hidden"
                    >
                      {/* Subline Header */}
                      <div
                        className="p-4 cursor-pointer hover:bg-white/30 transition-colors"
                        onClick={() => toggleSublineExpansion(subline.subline_id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                              <Settings size={24} className="text-white" />
                            </div>
                            <div>
                              <h4 className="text-xl font-semibold text-gray-800">
                                {subline.subline_name}
                              </h4>
                              <p className="text-gray-500 text-sm">
                                {loadingStations.has(subline.subline_id) 
                                  ? "Loading stations..." 
                                  : "Click to view stations"}
                              </p>
                            </div>
                          </div>
                          <div className="p-1 bg-white/50 rounded-lg">
                            {expandedSublines.has(subline.subline_id) ? (
                              <ChevronDown size={20} className="text-gray-600" />
                            ) : (
                              <ChevronRight size={20} className="text-gray-600" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stations */}
                      {expandedSublines.has(subline.subline_id) && (
                        <div className="px-4 pb-4">
                          {subline.stations && subline.stations.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {subline.stations.map((station) => (
                                <div
                                  key={station.station_id}
                                  className="bg-white/70 rounded-xl p-4 border border-gray-200/50 hover:shadow-lg transition-all duration-200 hover:bg-white/90"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                                      <MapPin size={18} className="text-white" />
                                    </div>
                                    <div>
                                      <h5 className="font-medium text-gray-800">
                                        {station.station_name}
                                      </h5>
                                      <p className="text-xs text-gray-500">
                                        Station ID: {station.station_id}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-gray-500">
                              {loadingStations.has(subline.subline_id) 
                                ? "Loading stations..." 
                                : "No stations found"}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    {loadingSublines.has(line.line_id) 
                      ? "Loading sublines..." 
                      : "No sublines found"}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};