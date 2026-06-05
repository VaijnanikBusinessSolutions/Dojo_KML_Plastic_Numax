

// // StationRequirementPage.tsx
// import React, { useEffect, useState } from 'react';
// import { Building, Users, Save, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';

// // API base URL
// const API_BASE_URL = 'http://172.25.0.51:8000';

// // Types
// interface Department {
//   department_id: number;
//   department_name: string;
//   lines: Line[];
//   stations: Station[];
// }

// interface Line {
//   line_id: number;
//   line_name: string;
//   sublines: Subline[];
//   stations: Station[];
// }

// interface Subline {
//   subline_id: number;
//   subline_name: string;
//   stations: Station[];
// }

// interface Station {
//   station_id: number;
//   station_name: string;
// }

// interface FactoryStructure {
//   factory_id: number;
//   factory_name: string;
//   hq: number;
//   departments: Department[];
// }

// // API Response Interfaces
// interface ApiStation {
//   id: number;
//   station_name: string;
// }

// interface ApiSubline {
//   id: number;
//   subline_name: string;
//   stations: ApiStation[];
// }

// interface ApiLine {
//   id: number;
//   line_name: string;
//   sublines: ApiSubline[];
//   stations: ApiStation[];
// }

// interface ApiDepartment {
//   id: number;
//   department_name: string;
//   lines: ApiLine[];
//   stations: ApiStation[];
// }

// interface ApiStructureData {
//   hq_name: string;
//   factory_name: string;
//   departments: ApiDepartment[];
// }

// interface ApiHierarchyResponseItem {
//   structure_id: number;
//   structure_name: string;
//   hq: number;
//   hq_name: string;
//   factory: number;
//   factory_name: string;
//   structure_data: ApiStructureData;
// }

// const LEVEL_CHOICES = [
//   { value: 'Beginner', label: 'Beginner' },
//   { value: 'Intermediate', label: 'Intermediate' },
//   { value: 'Advanced', label: 'Advanced' },
//   { value: 'Expert', label: 'Expert' },
// ];

// const fetchHierarchyStructures = async (): Promise<FactoryStructure[]> => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/hierarchy-simple/`);
//     if (!response.ok) throw new Error(`Failed to fetch hierarchy: HTTP ${response.status}`);
//     const apiData: ApiHierarchyResponseItem[] = await response.json();
    
//     const factoriesMap = new Map<number, FactoryStructure>();

//     apiData.forEach(item => {
//       if (!item.factory || !item.factory_name) return;

//       let factory = factoriesMap.get(item.factory);
//       if (!factory) {
//         factory = {
//           factory_id: item.factory,
//           factory_name: item.factory_name,
//           hq: item.hq,
//           departments: [],
//         };
//         factoriesMap.set(item.factory, factory);
//       }

//       item.structure_data?.departments?.forEach(deptData => {
//         if (!deptData.id || !deptData.department_name) return;

//         let department = factory.departments.find(d => d.department_id === deptData.id);
//         if (!department) {
//           department = {
//             department_id: deptData.id,
//             department_name: deptData.department_name,
//             lines: [],
//             stations: [],
//           };
//           factory.departments.push(department);
//         }

//         // Add stations directly under department
//         deptData.stations?.forEach(stationData => {
//           const stationExists = department.stations.some(s => s.station_id === stationData.id);
//           if (!stationExists) {
//             department.stations.push({
//               station_id: stationData.id,
//               station_name: stationData.station_name,
//             });
//           }
//         });

//         // Process lines
//         deptData.lines?.forEach(lineData => {
//           if (!lineData.id || !lineData.line_name) return;
          
//           let line = department.lines.find(l => l.line_id === lineData.id);
//           if (!line) {
//             line = {
//               line_id: lineData.id,
//               line_name: lineData.line_name,
//               sublines: [],
//               stations: []
//             };
//             department.lines.push(line);
//           }
          
//           // Add stations directly under line
//           lineData.stations?.forEach(stationData => {
//             const stationExists = line.stations.some(s => s.station_id === stationData.id);
//             if (!stationExists) {
//               line.stations.push({ 
//                 station_id: stationData.id, 
//                 station_name: stationData.station_name 
//               });
//             }
//           });

//           // Process sublines
//           lineData.sublines?.forEach(sublineData => {
//             if (!sublineData.id || !sublineData.subline_name) return;

//             let subline = line.sublines.find(sl => sl.subline_id === sublineData.id);
//             if (!subline) {
//               subline = {
//                 subline_id: sublineData.id,
//                 subline_name: sublineData.subline_name,
//                 stations: []
//               };
//               line.sublines.push(subline);
//             }

//             // Add stations under subline
//             sublineData.stations?.forEach(stationData => {
//               const stationExists = subline.stations.some(s => s.station_id === stationData.id);
//               if (!stationExists) {
//                 subline.stations.push({ 
//                   station_id: stationData.id, 
//                   station_name: stationData.station_name 
//                 });
//               }
//             });
//           });
//         });
//       });
//     });

//     return Array.from(factoriesMap.values());
//   } catch (error) {
//     console.error('Error fetching hierarchy:', error);
//     throw error;
//   }
// };

// const createStationManager = async (payload: any) => {
//   console.log('Sending payload to API:', payload);
//   try {
//     const response = await fetch(`${API_BASE_URL}/station-managers/`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(payload),
//     });
//     const data = await response.json();
//     if (!response.ok) {
//       console.error('API Error Response:', data);
//       throw new Error(data.error || `Failed to create station manager: HTTP ${response.status}`);
//     }
//     console.log('Station manager created:', data);
//     return data;
//   } catch (error) {
//     console.error('Error in createStationManager:', error);
//     throw error;
//   }
// };

// const StationRequirementPage: React.FC = () => {
//   const [factoryStructures, setFactoryStructures] = useState<FactoryStructure[]>([]);
//   const [departments, setDepartments] = useState<Department[]>([]);
//   const [lines, setLines] = useState<Line[]>([]);
//   const [sublines, setSublines] = useState<Subline[]>([]);
//   const [stations, setStations] = useState<Station[]>([]);
  
//   const [departmentId, setDepartmentId] = useState<number | null>(null);
//   const [lineId, setLineId] = useState<number | null>(null);
//   const [sublineId, setSublineId] = useState<number | null>(null);
//   const [stationId, setStationId] = useState<number | null>(null);
//   const [minOperators, setMinOperators] = useState<number | ''>('');
//   const [minLevelRequired, setMinLevelRequired] = useState<string | ''>('');
//   const [submitting, setSubmitting] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

//   const successToast = (message: string) => {
//     setToast({ type: 'success', message });
//     setTimeout(() => setToast(null), 2500);
//   };

//   const errorToast = (message: string) => {
//     setToast({ type: 'error', message });
//     setTimeout(() => setToast(null), 3500);
//   };

//   useEffect(() => {
//     const loadHierarchy = async () => {
//       try {
//         console.log('Loading hierarchy structures...');
//         const structures = await fetchHierarchyStructures();
//         setFactoryStructures(structures);
        
//         // Get all unique departments from all factories
//         const allDepartments: Department[] = [];
//         structures.forEach(factory => {
//           factory.departments.forEach(dept => {
//             if (!allDepartments.find(d => d.department_id === dept.department_id)) {
//               allDepartments.push(dept);
//             }
//           });
//         });
//         setDepartments(allDepartments);
//         console.log('Loaded departments:', allDepartments);
//       } catch (err: any) {
//         console.error('Error loading hierarchy:', err);
//         errorToast(`Failed to load hierarchy: ${err.message}`);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadHierarchy();
//   }, []);

//   // Update lines when department changes
//   useEffect(() => {
//     if (departmentId) {
//       const selectedDept = departments.find(d => d.department_id === departmentId);
//       if (selectedDept) {
//         setLines(selectedDept.lines || []);
//         setStations(selectedDept.stations || []);
//         console.log('Lines for department:', selectedDept.lines);
//         console.log('Stations directly under department:', selectedDept.stations);
//       }
//     } else {
//       setLines([]);
//       setStations([]);
//     }
//     setSublines([]);
//   }, [departmentId, departments]);

//   // Update sublines and stations when line changes
//   useEffect(() => {
//     if (lineId) {
//       const selectedLine = lines.find(l => l.line_id === lineId);
//       if (selectedLine) {
//         setSublines(selectedLine.sublines || []);
//         setStations(selectedLine.stations || []);
//         console.log('Sublines for line:', selectedLine.sublines);
//         console.log('Stations directly under line:', selectedLine.stations);
//       }
//     } else if (departmentId) {
//       // If no line selected but department is, show department stations
//       const selectedDept = departments.find(d => d.department_id === departmentId);
//       if (selectedDept) {
//         setStations(selectedDept.stations || []);
//         setSublines([]);
//       }
//     } else {
//       setSublines([]);
//       setStations([]);
//     }
//   }, [lineId, lines, departmentId, departments]);

//   // Update stations when subline changes
//   useEffect(() => {
//     if (sublineId) {
//       const selectedSubline = sublines.find(sl => sl.subline_id === sublineId);
//       if (selectedSubline) {
//         setStations(selectedSubline.stations || []);
//         console.log('Stations under subline:', selectedSubline.stations);
//       }
//     } else if (lineId) {
//       // If no subline selected but line is, show line stations
//       const selectedLine = lines.find(l => l.line_id === lineId);
//       if (selectedLine) {
//         setStations(selectedLine.stations || []);
//       }
//     } else if (departmentId) {
//       // If no line selected but department is, show department stations
//       const selectedDept = departments.find(d => d.department_id === departmentId);
//       if (selectedDept) {
//         setStations(selectedDept.stations || []);
//       }
//     }
//   }, [sublineId, sublines, lineId, lines, departmentId, departments]);

//   const resetForm = () => {
//     setDepartmentId(null);
//     setLineId(null);
//     setSublineId(null);
//     setStationId(null);
//     setMinOperators('');
//     setMinLevelRequired('');
//     setToast(null);
//   };

//   const onSubmit = async () => {
//     setToast(null);

//     if (!departmentId && !stationId) {
//       errorToast('Please select at least one of department or station');
//       return;
//     }
//     if (!minOperators) {
//       errorToast('Please enter minimum operators');
//       return;
//     }
//     if (!minLevelRequired) {
//       errorToast('Please select minimum level required');
//       return;
//     }

//     const payload: any = {
//       minimum_operators: Number(minOperators),
//       minimum_level_required: minLevelRequired,
//     };
//     if (departmentId) payload.department_id = departmentId;
//     if (lineId) payload.line_id = lineId;
//     if (sublineId) payload.subline_id = sublineId;
//     if (stationId) payload.station_id = stationId;

//     console.log('Form submission payload:', payload);

//     try {
//       setSubmitting(true);
//       const result = await createStationManager(payload);
//       const selectedDept = departments.find(d => d.department_id === departmentId);
//       const selectedLine = lines.find(l => l.line_id === lineId);
//       const selectedSubline = sublines.find(sl => sl.subline_id === sublineId);
//       const selectedStation = stations.find(s => s.station_id === stationId);
      
//       let successMessage = '✅ Station Manager requirement saved successfully!';
//       if (selectedDept && selectedLine && selectedSubline && selectedStation) {
//         successMessage = `✅ Requirement saved for ${selectedDept.department_name} - ${selectedLine.line_name} - ${selectedSubline.subline_name} - ${selectedStation.station_name}`;
//       } else if (selectedDept && selectedLine && selectedStation) {
//         successMessage = `✅ Requirement saved for ${selectedDept.department_name} - ${selectedLine.line_name} - ${selectedStation.station_name}`;
//       } else if (selectedDept && selectedLine) {
//         successMessage = `✅ Requirement saved for ${selectedDept.department_name} - ${selectedLine.line_name}`;
//       } else if (selectedDept) {
//         successMessage = `✅ Requirement saved for Department: ${selectedDept.department_name}`;
//       } else if (selectedStation) {
//         successMessage = `✅ Requirement saved for Station: ${selectedStation.station_name}`;
//       }
//       successMessage += ` (${minOperators} operators, ${minLevelRequired} level)`;
//       successToast(successMessage);
//       resetForm();
//     } catch (e: any) {
//       console.error('Error creating station manager:', e);
//       const errorMessage = e.message.includes('HierarchyStructure')
//         ? `${e.message}. Please check if the department or station exists in the hierarchy.`
//         : e.message || 'Failed to save station manager requirement';
//       errorToast(errorMessage);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading hierarchy...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
//       <div className="container mx-auto px-4 py-8">
//         <div className="mb-8">
//           <h1 className="text-4xl font-bold text-gray-900 mb-2">Station Manager Requirements</h1>
//           <p className="text-lg text-gray-600">Configure minimum staffing requirements for operational efficiency</p>
//         </div>
        
//         <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
//           <h3 className="font-semibold text-yellow-800 mb-2">Debug Information:</h3>
//           <div className="text-sm text-yellow-700 space-y-1">
//             <div>Departments loaded: {departments.length}</div>
//             <div>Lines available: {lines.length}</div>
//             <div>Sublines available: {sublines.length}</div>
//             <div>Stations available: {stations.length}</div>
//             <div>Selected Department ID: {departmentId || 'None'}</div>
//             <div>Selected Line ID: {lineId || 'None'}</div>
//             <div>Selected Subline ID: {sublineId || 'None'}</div>
//             <div>Selected Station ID: {stationId || 'None'}</div>
//           </div>
//         </div>

//         <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
//           <div className="flex items-center mb-6">
//             <Building className="h-6 w-6 text-blue-600 mr-3" />
//             <h2 className="text-2xl font-bold text-gray-800">Create Station Manager Requirement</h2>
//           </div>
//           <div className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//               <div className="space-y-2">
//                 <label htmlFor="department" className="flex items-center text-sm font-medium text-gray-700 mb-2">
//                   <Building className="h-4 w-4 mr-2 text-gray-500" />
//                   Department
//                 </label>
//                 <select
//                   id="department"
//                   value={departmentId ?? ''}
//                   onChange={(e) => {
//                     const value = e.target.value ? Number(e.target.value) : null;
//                     console.log('Department selected:', value);
//                     setDepartmentId(value);
//                     setLineId(null);
//                     setSublineId(null);
//                     setStationId(null);
//                   }}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
//                 >
//                   <option value="">Select a department (Optional)</option>
//                   {departments.map((d) => (
//                     <option key={d.department_id} value={d.department_id}>
//                       {d.department_name} (ID: {d.department_id})
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="line" className="flex items-center text-sm font-medium text-gray-700 mb-2">
//                   <Building className="h-4 w-4 mr-2 text-gray-500" />
//                   Line
//                 </label>
//                 <select
//                   id="line"
//                   value={lineId ?? ''}
//                   onChange={(e) => {
//                     const value = e.target.value ? Number(e.target.value) : null;
//                     console.log('Line selected:', value);
//                     setLineId(value);
//                     setSublineId(null);
//                     setStationId(null);
//                   }}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
//                   disabled={!departmentId}
//                 >
//                   <option value="">Select a line (Optional)</option>
//                   {lines.length > 0 ? (
//                     lines.map((l) => (
//                       <option key={l.line_id} value={l.line_id}>
//                         {l.line_name} (ID: {l.line_id})
//                       </option>
//                     ))
//                   ) : (
//                     <option disabled>
//                       {departmentId ? 'No lines available' : 'Select a department first'}
//                     </option>
//                   )}
//                 </select>
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="subline" className="flex items-center text-sm font-medium text-gray-700 mb-2">
//                   <Building className="h-4 w-4 mr-2 text-gray-500" />
//                   Subline
//                 </label>
//                 <select
//                   id="subline"
//                   value={sublineId ?? ''}
//                   onChange={(e) => {
//                     const value = e.target.value ? Number(e.target.value) : null;
//                     console.log('Subline selected:', value);
//                     setSublineId(value);
//                     setStationId(null);
//                   }}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
//                   disabled={!lineId}
//                 >
//                   <option value="">Select a subline (Optional)</option>
//                   {sublines.length > 0 ? (
//                     sublines.map((sl) => (
//                       <option key={sl.subline_id} value={sl.subline_id}>
//                         {sl.subline_name} (ID: {sl.subline_id})
//                       </option>
//                     ))
//                   ) : (
//                     <option disabled>
//                       {lineId ? 'No sublines available' : 'Select a line first'}
//                     </option>
//                   )}
//                 </select>
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="station" className="flex items-center text-sm font-medium text-gray-700 mb-2">
//                   <Building className="h-4 w-4 mr-2 text-gray-500" />
//                   Station
//                 </label>
//                 <select
//                   id="station"
//                   value={stationId ?? ''}
//                   onChange={(e) => {
//                     const value = e.target.value ? Number(e.target.value) : null;
//                     console.log('Station selected:', value);
//                     setStationId(value);
//                   }}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
//                   disabled={!departmentId}
//                 >
//                   <option value="">Select a station (Optional)</option>
//                   {stations.length > 0 ? (
//                     stations.map((s) => (
//                       <option key={s.station_id} value={s.station_id}>
//                         {s.station_name} (ID: {s.station_id})
//                       </option>
//                     ))
//                   ) : (
//                     <option disabled>
//                       {departmentId ? 'No stations available' : 'Select a department first'}
//                     </option>
//                   )}
//                 </select>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="space-y-2">
//                 <label htmlFor="operators" className="flex items-center text-sm font-medium text-gray-700 mb-2">
//                   <Users className="h-4 w-4 mr-2 text-gray-500" />
//                   Minimum Operators
//                   <span className="text-red-500 ml-1">*</span>
//                 </label>
//                 <input
//                   id="operators"
//                   type="number"
//                   min={1}
//                   value={minOperators}
//                   onChange={(e) => setMinOperators(e.target.value ? Number(e.target.value) : '')}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
//                   placeholder="Enter minimum operators required"
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <label htmlFor="minLevelRequired" className="flex items-center text-sm font-medium text-gray-700 mb-2">
//                   <Users className="h-4 w-4 mr-2 text-gray-500" />
//                   Minimum Level Required
//                   <span className="text-red-500 ml-1">*</span>
//                 </label>
//                 <select
//                   id="minLevelRequired"
//                   value={minLevelRequired}
//                   onChange={(e) => setMinLevelRequired(e.target.value)}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
//                   required
//                 >
//                   <option value="">Select a level (Required)</option>
//                   {LEVEL_CHOICES.map((level) => (
//                     <option key={level.value} value={level.value}>
//                       {level.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             {toast && (
//               <div
//                 className={`p-4 rounded-xl border ${
//                   toast.type === 'success'
//                     ? 'bg-green-50 border-green-200'
//                     : 'bg-red-50 border-red-200'
//                 }`}
//               >
//                 <div className="flex items-center">
//                   {toast.type === 'success' ? (
//                     <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
//                   ) : (
//                     <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
//                   )}
//                   <span className={`font-medium ${toast.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
//                     {toast.message}
//                   </span>
//                 </div>
//               </div>
//             )}

//             <div className="flex justify-end space-x-4 pt-6">
//               <button
//                 type="button"
//                 onClick={resetForm}
//                 className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
//               >
//                 <RotateCcw className="inline h-5 w-5 mr-2" />
//                 Reset Form
//               </button>
//               <button
//                 type="button"
//                 onClick={onSubmit}
//                 disabled={submitting}
//                 className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
//               >
//                 {submitting ? (
//                   <>
//                     <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full inline-block"></div>
//                     Saving...
//                   </>
//                 ) : (
//                   <>
//                     <Save className="inline h-5 w-5 mr-2" />
//                     Save Requirement
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>

//         {submitting && (
//           <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm pointer-events-none">
//             <div className="absolute right-4 top-4 bg-white shadow-xl px-4 py-3 rounded-lg text-sm flex items-center gap-3">
//               <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
//               Saving...
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default StationRequirementPage;



// StationRequirementPage.tsx
import React, { useEffect, useState } from 'react';
import { 
  Building, 
  Users, 
  Save, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle, 
  List, 
  MapPin,
  RefreshCw,
  Pencil,     // New icon for Edit
  Trash2,     // New icon for Delete
  X           // New icon for Cancel
} from 'lucide-react';

// API base URL
const API_BASE_URL = 'http://172.25.0.51:8000';

// --- Types ---

interface Department {
  department_id: number;
  department_name: string;
  lines: Line[];
  stations: Station[];
}

interface Line {
  line_id: number;
  line_name: string;
  sublines: Subline[];
  stations: Station[];
}

interface Subline {
  subline_id: number;
  subline_name: string;
  stations: Station[];
}

interface Station {
  station_id: number;
  station_name: string;
}

interface FactoryStructure {
  factory_id: number;
  factory_name: string;
  hq: number;
  departments: Department[];
}

// Interface for the data fetched for the "Right Side" list
interface ExistingRequirement {
  id: number;
  // IDs are needed for populating the form during Edit
  department_id?: number;
  line_id?: number;
  subline_id?: number;
  station_id?: number;
  // Names are needed for display
  department_name?: string;
  line_name?: string;
  subline_name?: string;
  station_name?: string;
  
  minimum_operators: number;
  minimum_level_required: string;
}

// API Response Interfaces (Internal use for parsing hierarchy)
interface ApiHierarchyResponseItem {
  structure_id: number;
  structure_name: string;
  hq: number;
  hq_name: string;
  factory: number;
  factory_name: string;
  structure_data: any; // Simplified for brevity
}

const LEVEL_CHOICES = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
  { value: 'Expert', label: 'Expert' },
];

// --- API Functions ---

const fetchHierarchyStructures = async (): Promise<FactoryStructure[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/hierarchy-simple/`);
    if (!response.ok) throw new Error(`Failed to fetch hierarchy: HTTP ${response.status}`);
    const apiData: ApiHierarchyResponseItem[] = await response.json();
    
    // logic to parse apiData into FactoryStructure[] (same as previous code)
    // ... (This logic remains identical to your previous working version)
    // Re-implementing the parsing logic briefly for completeness:
    const factoriesMap = new Map<number, FactoryStructure>();

    apiData.forEach(item => {
      if (!item.factory || !item.factory_name) return;
      let factory = factoriesMap.get(item.factory);
      if (!factory) {
        factory = { factory_id: item.factory, factory_name: item.factory_name, hq: item.hq, departments: [] };
        factoriesMap.set(item.factory, factory);
      }
      item.structure_data?.departments?.forEach((deptData: any) => {
        if (!deptData.id || !deptData.department_name) return;
        let department = factory!.departments.find(d => d.department_id === deptData.id);
        if (!department) {
          department = { department_id: deptData.id, department_name: deptData.department_name, lines: [], stations: [] };
          factory!.departments.push(department);
        }
        deptData.stations?.forEach((stationData: any) => {
            if(!department!.stations.some(s => s.station_id === stationData.id)) {
                department!.stations.push({ station_id: stationData.id, station_name: stationData.station_name });
            }
        });
        deptData.lines?.forEach((lineData: any) => {
          let line = department!.lines.find(l => l.line_id === lineData.id);
          if (!line) {
            line = { line_id: lineData.id, line_name: lineData.line_name, sublines: [], stations: [] };
            department!.lines.push(line);
          }
          lineData.stations?.forEach((stationData: any) => {
            if(!line!.stations.some(s => s.station_id === stationData.id)) {
                line!.stations.push({ station_id: stationData.id, station_name: stationData.station_name });
            }
          });
          lineData.sublines?.forEach((sublineData: any) => {
            let subline = line!.sublines.find(sl => sl.subline_id === sublineData.id);
            if (!subline) {
              subline = { subline_id: sublineData.id, subline_name: sublineData.subline_name, stations: [] };
              line!.sublines.push(subline);
            }
            sublineData.stations?.forEach((stationData: any) => {
                if(!subline!.stations.some(s => s.station_id === stationData.id)) {
                    subline!.stations.push({ station_id: stationData.id, station_name: stationData.station_name });
                }
            });
          });
        });
      });
    });
    return Array.from(factoriesMap.values());
  } catch (error) {
    console.error('Error fetching hierarchy:', error);
    throw error;
  }
};

// CREATE
const createStationManager = async (payload: any) => {
  const response = await fetch(`${API_BASE_URL}/station-managers/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `Failed to create: HTTP ${response.status}`);
  return data;
};

// UPDATE (New)
const updateStationManager = async (id: number, payload: any) => {
  const response = await fetch(`${API_BASE_URL}/station-managers/${id}/`, {
    method: 'PUT', // Or PATCH depending on your backend
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `Failed to update: HTTP ${response.status}`);
  return data;
};

// DELETE (New)
const deleteStationManager = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/station-managers/${id}/`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error(`Failed to delete: HTTP ${response.status}`);
  return true;
};

// READ LIST
const fetchExistingRequirements = async (): Promise<ExistingRequirement[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/station-managers/`);
    if (!response.ok) throw new Error(`Failed to fetch requirements: HTTP ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : data.results || [];
  } catch (error) {
    console.error('Error fetching existing requirements:', error);
    return [];
  }
};

// --- Main Component ---

const StationRequirementPage: React.FC = () => {
  // --- State: Hierarchy Data ---
  const [factoryStructures, setFactoryStructures] = useState<FactoryStructure[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [sublines, setSublines] = useState<Subline[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  
  // --- State: Form Selections ---
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [lineId, setLineId] = useState<number | null>(null);
  const [sublineId, setSublineId] = useState<number | null>(null);
  const [stationId, setStationId] = useState<number | null>(null);
  const [minOperators, setMinOperators] = useState<number | ''>('');
  const [minLevelRequired, setMinLevelRequired] = useState<string | ''>('');
  
  // --- State: UI & Data ---
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [existingRequirements, setExistingRequirements] = useState<ExistingRequirement[]>([]);
  
  // New State for Editing
  const [editingId, setEditingId] = useState<number | null>(null);

  // --- Helpers for Toasts ---
  const successToast = (message: string) => {
    setToast({ type: 'success', message });
    setTimeout(() => setToast(null), 2500);
  };

  const errorToast = (message: string) => {
    setToast({ type: 'error', message });
    setTimeout(() => setToast(null), 3500);
  };

  // --- Initial Data Load ---
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const structures = await fetchHierarchyStructures();
        setFactoryStructures(structures);
        
        const allDepartments: Department[] = [];
        structures.forEach(factory => {
          factory.departments.forEach(dept => {
            if (!allDepartments.find(d => d.department_id === dept.department_id)) {
              allDepartments.push(dept);
            }
          });
        });
        setDepartments(allDepartments);

        const reqs = await fetchExistingRequirements();
        setExistingRequirements(reqs);

      } catch (err: any) {
        errorToast(`Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // --- Hierarchy Logic Effects ---
  useEffect(() => {
    if (departmentId) {
      const selectedDept = departments.find(d => d.department_id === departmentId);
      if (selectedDept) {
        setLines(selectedDept.lines || []);
        // Only reset stations if we aren't currently editing (or if we changed department manually)
        // Note: The logic below simplifies to "Update available stations", preservation of selected stationId is handled by React state if the ID still exists in the new list
        setStations(selectedDept.stations || []);
      }
    } else {
      setLines([]);
      setStations([]);
    }
    if (!editingId) {
       // Only clear children if we are NOT in the middle of populating the form for edit
       // However, for simplicity, we let the user re-select if they change parent structure
    }
  }, [departmentId, departments]);

  useEffect(() => {
    if (lineId) {
      const selectedLine = lines.find(l => l.line_id === lineId);
      if (selectedLine) {
        setSublines(selectedLine.sublines || []);
        setStations(selectedLine.stations || []);
      }
    } else if (departmentId) {
      const selectedDept = departments.find(d => d.department_id === departmentId);
      if (selectedDept) {
        setStations(selectedDept.stations || []);
        setSublines([]);
      }
    } else {
      setSublines([]);
      setStations([]);
    }
  }, [lineId, lines, departmentId, departments]);

  useEffect(() => {
    if (sublineId) {
      const selectedSubline = sublines.find(sl => sl.subline_id === sublineId);
      if (selectedSubline) {
        setStations(selectedSubline.stations || []);
      }
    } else if (lineId) {
      const selectedLine = lines.find(l => l.line_id === lineId);
      if (selectedLine) {
        setStations(selectedLine.stations || []);
      }
    } else if (departmentId) {
      const selectedDept = departments.find(d => d.department_id === departmentId);
      if (selectedDept) {
        setStations(selectedDept.stations || []);
      }
    }
  }, [sublineId, sublines, lineId, lines, departmentId, departments]);

  // --- Handlers ---

  const resetForm = () => {
    setDepartmentId(null);
    setLineId(null);
    setSublineId(null);
    setStationId(null);
    setMinOperators('');
    setMinLevelRequired('');
    setEditingId(null);
    setToast(null);
  };

  const refreshRequirementsList = async () => {
    const reqs = await fetchExistingRequirements();
    setExistingRequirements(reqs);
  };

  const handleEditClick = (req: ExistingRequirement) => {
    // 1. Set Editing Mode
    setEditingId(req.id);
    
    // 2. Populate fields
    // Note: The hierarchy effects will run when departmentId/lineId change.
    // React's batching usually handles this, but sometimes the child dropdowns (lines/sublines) 
    // might render before they have data if the parent wasn't already selected.
    // The 'value' prop on select elements will hold the ID even if the option isn't there yet,
    // and when the effect runs, the options appear and it matches.
    
    setDepartmentId(req.department_id || null);
    
    // We set these immediately. The effects above will see the new ID and populate options
    setLineId(req.line_id || null);
    setSublineId(req.subline_id || null);
    setStationId(req.station_id || null);
    
    setMinOperators(req.minimum_operators);
    setMinLevelRequired(req.minimum_level_required);

    // Scroll to top (mobile mainly)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this requirement?')) {
      try {
        await deleteStationManager(id);
        successToast('Requirement deleted successfully');
        if (editingId === id) resetForm(); // If deleting the item currently being edited
        await refreshRequirementsList();
      } catch (e: any) {
        errorToast(e.message || 'Failed to delete');
      }
    }
  };

  const onSubmit = async () => {
    setToast(null);

    // Validation
    if (!departmentId && !stationId) {
      errorToast('Please select at least one of department or station');
      return;
    }
    if (!minOperators) {
      errorToast('Please enter minimum operators');
      return;
    }
    if (!minLevelRequired) {
      errorToast('Please select minimum level required');
      return;
    }

    const payload: any = {
      minimum_operators: Number(minOperators),
      minimum_level_required: minLevelRequired,
      // Send IDs, or null if not selected
      department_id: departmentId || null,
      line_id: lineId || null,
      subline_id: sublineId || null,
      station_id: stationId || null
    };

    try {
      setSubmitting(true);
      
      if (editingId) {
        // UPDATE MODE
        await updateStationManager(editingId, payload);
        successToast('Requirement updated successfully!');
      } else {
        // CREATE MODE
        await createStationManager(payload);
        successToast('Requirement added successfully!');
      }

      resetForm();
      await refreshRequirementsList();
    } catch (e: any) {
      console.error('Error saving:', e);
      errorToast(e.message || 'Failed to save requirement');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper string builder
  const formatLocation = (req: ExistingRequirement) => {
    const parts = [];
    if (req.department_name) parts.push(req.department_name);
    if (req.line_name) parts.push(req.line_name);
    if (req.subline_name) parts.push(req.subline_name);
    if (req.station_name) parts.push(req.station_name);
    
    if (parts.length === 0) return 'Unknown Location';
    return parts.join(' › ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hierarchy and requirements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Station Manager Requirements</h1>
          <p className="text-lg text-gray-600">Configure staffing rules and view existing configurations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDE: Form */}
          <div className="lg:col-span-7">
            <div className={`bg-white rounded-2xl shadow-lg p-8 border h-full transition-colors duration-300 ${editingId ? 'border-amber-400 ring-1 ring-amber-100' : 'border-gray-100'}`}>
              
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                <div className="flex items-center">
                  <Building className={`h-6 w-6 mr-3 ${editingId ? 'text-amber-500' : 'text-blue-600'}`} />
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingId ? 'Edit Requirement' : 'Add New Requirement'}
                  </h2>
                </div>
                {editingId && (
                  <button 
                    onClick={resetForm}
                    className="text-xs flex items-center text-gray-500 hover:text-red-500 bg-gray-100 hover:bg-red-50 px-3 py-1 rounded-full transition-colors"
                  >
                    <X className="h-3 w-3 mr-1" /> Cancel Edit
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Selectors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Department</label>
                    <select
                      value={departmentId ?? ''}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : null;
                        setDepartmentId(val);
                        setLineId(null); setSublineId(null); setStationId(null);
                      }}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select Department</option>
                      {departments.map(d => (
                        <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Line</label>
                    <select
                      value={lineId ?? ''}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : null;
                        setLineId(val);
                        setSublineId(null); setStationId(null);
                      }}
                      disabled={!departmentId}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
                    >
                      <option value="">Select Line (Optional)</option>
                      {lines.map(l => (
                        <option key={l.line_id} value={l.line_id}>{l.line_name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Subline</label>
                    <select
                      value={sublineId ?? ''}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : null;
                        setSublineId(val);
                        setStationId(null);
                      }}
                      disabled={!lineId}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
                    >
                      <option value="">Select Subline (Optional)</option>
                      {sublines.map(sl => (
                        <option key={sl.subline_id} value={sl.subline_id}>{sl.subline_name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Station</label>
                    <select
                      value={stationId ?? ''}
                      onChange={(e) => setStationId(e.target.value ? Number(e.target.value) : null)}
                      disabled={!departmentId}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
                    >
                      <option value="">Select Station (Optional)</option>
                      {stations.map(s => (
                        <option key={s.station_id} value={s.station_id}>{s.station_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="border-t border-gray-100 my-4"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Users className="h-4 w-4 mr-2 text-gray-500" />
                      Minimum Operators <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={minOperators}
                      onChange={(e) => setMinOperators(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g. 2"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Users className="h-4 w-4 mr-2 text-gray-500" />
                      Min Level Required <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      value={minLevelRequired}
                      onChange={(e) => setMinLevelRequired(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    >
                      <option value="">Select Level</option>
                      {LEVEL_CHOICES.map((level) => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {toast && (
                  <div className={`p-4 rounded-xl border flex items-center ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    {toast.type === 'success' ? <CheckCircle className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
                    <span className="font-medium">{toast.message}</span>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                  >
                    <RotateCcw className="inline h-4 w-4 mr-2" /> 
                    {editingId ? 'Cancel' : 'Reset'}
                  </button>
                  <button
                    type="button"
                    onClick={onSubmit}
                    disabled={submitting}
                    className={`px-6 py-2 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed
                      ${editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}
                    `}
                  >
                    {submitting ? 'Processing...' : (
                      <>
                        <Save className="inline h-4 w-4 mr-2" /> 
                        {editingId ? 'Update Requirement' : 'Save Requirement'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: List */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 h-full flex flex-col">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                <div className="flex items-center">
                  <List className="h-6 w-6 text-indigo-600 mr-3" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Existing List</h2>
                    <p className="text-sm text-gray-500">{existingRequirements.length} items</p>
                  </div>
                </div>
                <button 
                  onClick={refreshRequirementsList}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="Refresh List"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[600px] bg-gray-50/50">
                {existingRequirements.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <List className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No requirements added yet.</p>
                  </div>
                ) : (
                  existingRequirements.map((req, index) => (
                    <div 
                      key={req.id || index} 
                      className={`bg-white p-4 rounded-xl shadow-sm border transition-all 
                        ${editingId === req.id ? 'border-amber-400 ring-2 ring-amber-100' : 'border-gray-100 hover:shadow-md'}
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start flex-1 mr-4">
                          <MapPin className="h-5 w-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-semibold text-gray-800 leading-snug mb-1">
                              {formatLocation(req)}
                            </h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <Users className="h-3 w-3 mr-1" />
                                {req.minimum_operators} Ops
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {req.minimum_level_required}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleEditClick(req)}
                            className={`p-2 rounded-lg transition-colors ${editingId === req.id ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-600'}`}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(req.id)}
                            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>

        {submitting && (
          <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm pointer-events-none flex items-center justify-center">
            <div className="bg-white shadow-xl px-6 py-4 rounded-lg flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="font-medium text-gray-700">{editingId ? 'Updating...' : 'Saving...'}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default StationRequirementPage;