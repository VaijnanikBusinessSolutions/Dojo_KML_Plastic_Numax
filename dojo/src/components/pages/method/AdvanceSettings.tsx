

// import React, { useState, useEffect } from "react";
// import { 
//   Upload, Plus, Trash2, FileSpreadsheet, Users, 
//   Calendar, BarChart3, Building, Layers, CheckCircle, Loader2, Download
// } from "lucide-react";

// // --- API Configuration ---
// const API_BASE_URL = "http://127.0.0.1:8000"; 

// // --- Frontend Form Data Interface ---
// interface AdvanceSettingsData {
//   id?: number;
//   hq: number | null;
//   factory: number | null;
//   department: number | null;
//   line: number | null;
//   subline: number | null;
//   station: number | null;
//   month_year: string;
  
//   // KPIs
//   total_stations_ctq: number;
//   operator_required_ctq: number;
//   operator_availability_ctq: number;
//   buffer_manpower_required_ctq: number;
//   buffer_manpower_availability_ctq: number;
//   attrition_trend_ctq: number;
//   absentee_trend_ctq: number;

//   // Skill Levels
//   l1_required: number; l1_available: number;
//   l2_required: number; l2_available: number;
//   l3_required: number; l3_available: number;
//   l4_required: number; l4_available: number;
// }

// // --- API Payload/Response Interface ---
// interface ApiAdvanceManpowerData {
//     id: number; 
//     hq: number | null; 
//     factory: number; 
//     department: number | null;
//     line: number | null;
//     subline: number | null;
//     station: number | null;
    
//     month: number; 
//     year: number; 
    
//     total_stations: number; 
//     operators_required: number;
//     operators_available: number; 
//     buffer_manpower_required: number; 
//     buffer_manpower_available: number;
    
//     l1_required: number; l1_available: number;
//     l2_required: number; l2_available: number;
//     l3_required: number; l3_available: number;
//     l4_required: number; l4_available: number;

//     attrition_rate: string; 
//     absenteeism_rate: string;
// }

// // --- UPDATED Hierarchy Interfaces ---
// // We add 'stations?' to LineNode to allow direct parent-child relationship
// interface StationNode { id: number; station_name: string; }
// interface SublineNode { id: number; subline_name: string; stations?: StationNode[]; }
// interface LineNode { 
//     id: number; 
//     line_name: string; 
//     sublines?: SublineNode[]; 
//     stations?: StationNode[]; // <--- ADDED: Stations can exist directly under Line
// }
// interface DepartmentNode { id: number; department_name: string; lines?: LineNode[]; }

// interface HierarchyStructure {
//     hq: number; hq_name: string;
//     factory: number; factory_name: string;
//     structure_data: {
//         departments: DepartmentNode[];
//     };
// }

// interface DropdownOption { id: number; name: string; }

// // --- Data Transformers (Kept same as before) ---
// const apiToFrontend = (apiData: ApiAdvanceManpowerData): AdvanceSettingsData => ({
//     id: apiData.id, 
//     hq: apiData.hq, factory: apiData.factory, department: apiData.department,
//     line: apiData.line, subline: apiData.subline, station: apiData.station,
//     month_year: `${apiData.year}-${apiData.month.toString().padStart(2, '0')}`,
    
//     total_stations_ctq: apiData.total_stations, 
//     operator_required_ctq: apiData.operators_required,
//     operator_availability_ctq: apiData.operators_available, 
//     buffer_manpower_required_ctq: apiData.buffer_manpower_required,
//     buffer_manpower_availability_ctq: apiData.buffer_manpower_available, 
    
//     l1_required: apiData.l1_required, l1_available: apiData.l1_available,
//     l2_required: apiData.l2_required, l2_available: apiData.l2_available,
//     l3_required: apiData.l3_required, l3_available: apiData.l3_available,
//     l4_required: apiData.l4_required, l4_available: apiData.l4_available,

//     attrition_trend_ctq: parseFloat(apiData.attrition_rate),
//     absentee_trend_ctq: parseFloat(apiData.absenteeism_rate),
// });

// const frontendToApi = (formData: Omit<AdvanceSettingsData, 'id'>) => {
//     const [year, month] = formData.month_year.split('-').map(Number);
//     return {
//         hq: formData.hq, factory: formData.factory, department: formData.department,
//         line: formData.line, subline: formData.subline, station: formData.station,
//         month, year,
//         total_stations: formData.total_stations_ctq, 
//         operators_required: formData.operator_required_ctq,
//         operators_available: formData.operator_availability_ctq, 
//         buffer_manpower_required: formData.buffer_manpower_required_ctq,
//         buffer_manpower_available: formData.buffer_manpower_availability_ctq, 
        
//         l1_required: formData.l1_required, l1_available: formData.l1_available,
//         l2_required: formData.l2_required, l2_available: formData.l2_available,
//         l3_required: formData.l3_required, l3_available: formData.l3_available,
//         l4_required: formData.l4_required, l4_available: formData.l4_available,

//         attrition_rate: formData.attrition_trend_ctq.toFixed(2),
//         absenteeism_rate: formData.absentee_trend_ctq.toFixed(2),
//     };
// };

// const AdvanceSettings: React.FC = () => {
//   const [activeTab, setActiveTab] = useState('overview');
//   const [advanceSettingsData, setAdvanceSettingsData] = useState<AdvanceSettingsData[]>([]);
//   const [loading, setLoading] = useState(true);
  
//   // --- Hierarchy State ---
//   const [fullHierarchy, setFullHierarchy] = useState<HierarchyStructure[]>([]);
  
//   // Dropdown Options State
//   const [hqOptions, setHqOptions] = useState<DropdownOption[]>([]);
//   const [factoryOptions, setFactoryOptions] = useState<DropdownOption[]>([]);
//   const [departmentOptions, setDepartmentOptions] = useState<DropdownOption[]>([]);
//   const [lineOptions, setLineOptions] = useState<DropdownOption[]>([]);
//   const [sublineOptions, setSublineOptions] = useState<DropdownOption[]>([]);
//   const [stationOptions, setStationOptions] = useState<DropdownOption[]>([]);

//   // Display Maps (ID -> Name) for Table
//   const [allHqsMap, setAllHqsMap] = useState<Record<number, string>>({});
//   const [allFactoriesMap, setAllFactoriesMap] = useState<Record<number, string>>({});
//   const [allDepartmentsMap, setAllDepartmentsMap] = useState<Record<number, string>>({});
//   const [allLinesMap, setAllLinesMap] = useState<Record<number, string>>({});
//   const [allSublinesMap, setAllSublinesMap] = useState<Record<number, string>>({});
//   const [allStationsMap, setAllStationsMap] = useState<Record<number, string>>({});

//   // Upload State
//   const [uploadFile, setUploadFile] = useState<File | null>(null);
//   const [uploadLoading, setUploadLoading] = useState(false);

//   const initialFormData: Omit<AdvanceSettingsData, 'id'> = {
//     hq: null, factory: null, department: null, 
//     line: null, subline: null, station: null,
//     month_year: `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`,
//     total_stations_ctq: 0, operator_required_ctq: 0, operator_availability_ctq: 0,
//     buffer_manpower_required_ctq: 0, buffer_manpower_availability_ctq: 0,
//     l1_required: 0, l1_available: 0,
//     l2_required: 0, l2_available: 0,
//     l3_required: 0, l3_available: 0,
//     l4_required: 0, l4_available: 0,
//     attrition_trend_ctq: 0.00, absentee_trend_ctq: 0.00,
//   };
  
//   const [formData, setFormData] = useState<Omit<AdvanceSettingsData, 'id'>>(initialFormData);

//   // --- Initial Load ---
//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         setLoading(true);
        
//         // 1. Fetch Dashboard Data
//         const dashboardRes = await fetch(`${API_BASE_URL}/advance-dashboard/`);
//         const dashboardJson: ApiAdvanceManpowerData[] = await dashboardRes.json();
//         setAdvanceSettingsData(dashboardJson.map(apiToFrontend));

//         // 2. Fetch Deep Hierarchy
//         const hierarchyRes = await fetch(`${API_BASE_URL}/hierarchy-simple/`);
//         const hierarchyJson: HierarchyStructure[] = await hierarchyRes.json();
//         setFullHierarchy(hierarchyJson);

//         // 3. Flatten Hierarchy for Maps & Top-level Options
//         const hMap: Record<number, string> = {};
//         const fMap: Record<number, string> = {};
//         const dMap: Record<number, string> = {};
//         const lMap: Record<number, string> = {};
//         const slMap: Record<number, string> = {};
//         const stMap: Record<number, string> = {};

//         const uniqueHqs = new Map<number, string>();
        
//         hierarchyJson.forEach(item => {
//              if(item.hq) {
//                  hMap[item.hq] = item.hq_name;
//                  uniqueHqs.set(item.hq, item.hq_name);
//              }
//              fMap[item.factory] = item.factory_name;

//              // Traverse down
//              item.structure_data.departments.forEach(dept => {
//                  dMap[dept.id] = dept.department_name;
//                  dept.lines?.forEach(line => {
//                      lMap[line.id] = line.line_name;
                     
//                      // Mapping direct stations under line (if any)
//                      line.stations?.forEach(stn => {
//                         stMap[stn.id] = stn.station_name;
//                      });

//                      line.sublines?.forEach(sub => {
//                          slMap[sub.id] = sub.subline_name;
//                          sub.stations?.forEach(stn => {
//                              stMap[stn.id] = stn.station_name;
//                          });
//                      });
//                  });
//              });
//         });

//         setHqOptions(Array.from(uniqueHqs).map(([id, name]) => ({ id, name })));
//         setAllHqsMap(hMap);
//         setAllFactoriesMap(fMap);
//         setAllDepartmentsMap(dMap);
//         setAllLinesMap(lMap);
//         setAllSublinesMap(slMap);
//         setAllStationsMap(stMap);

//       } catch (err) {
//         console.error("Failed to load data", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadData();
//   }, []);


//   // --- UPDATED Cascading Dropdown Logic ---

//   const handleHqChange = (hqId: number | null) => {
//     setFormData(prev => ({ ...prev, hq: hqId, factory: null, department: null, line: null, subline: null, station: null }));
    
//     if (hqId) {
//         const filtered = fullHierarchy.filter(item => item.hq === hqId);
//         const uniqueFacs = [...new Map(filtered.map(item => [item.factory, { id: item.factory, name: item.factory_name }])).values()];
//         setFactoryOptions(uniqueFacs);
//     } else {
//         setFactoryOptions([]);
//     }
//     setDepartmentOptions([]); setLineOptions([]); setSublineOptions([]); setStationOptions([]);
//   };

//   const handleFactoryChange = (factoryId: number | null) => {
//     setFormData(prev => ({ ...prev, factory: factoryId, department: null, line: null, subline: null, station: null }));
    
//     if (factoryId) {
//         const structure = fullHierarchy.find(item => item.factory === factoryId && item.hq === formData.hq);
//         if (structure) {
//             setDepartmentOptions(structure.structure_data.departments.map(d => ({ id: d.id, name: d.department_name })));
//         } else {
//             setDepartmentOptions([]);
//         }
//     } else {
//         setDepartmentOptions([]);
//     }
//     setLineOptions([]); setSublineOptions([]); setStationOptions([]);
//   };

//   const handleDepartmentChange = (deptId: number | null) => {
//     setFormData(prev => ({ ...prev, department: deptId, line: null, subline: null, station: null }));
    
//     if (deptId && formData.factory) {
//         const structure = fullHierarchy.find(item => item.factory === formData.factory && item.hq === formData.hq);
//         const dept = structure?.structure_data.departments.find(d => d.id === deptId);
//         if (dept && dept.lines) {
//             setLineOptions(dept.lines.map(l => ({ id: l.id, name: l.line_name })));
//         } else {
//             setLineOptions([]);
//         }
//     } else {
//         setLineOptions([]);
//     }
//     setSublineOptions([]); setStationOptions([]);
//   };

//   // --- CRITICAL UPDATE: Handle Flexible Hierarchy Here ---
//   const handleLineChange = (lineId: number | null) => {
//     // Reset subline and station when line changes
//     setFormData(prev => ({ ...prev, line: lineId, subline: null, station: null }));
    
//     if (lineId && formData.department && formData.factory) {
//         const structure = fullHierarchy.find(item => item.factory === formData.factory && item.hq === formData.hq);
//         const dept = structure?.structure_data.departments.find(d => d.id === formData.department);
//         const line = dept?.lines?.find(l => l.id === lineId);

//         // 1. Set Subline Options (if any exist)
//         if (line && line.sublines && line.sublines.length > 0) {
//             setSublineOptions(line.sublines.map(sl => ({ id: sl.id, name: sl.subline_name })));
//         } else {
//             setSublineOptions([]); // No sublines
//         }

//         // 2. Set Station Options (Look for direct stations first)
//         if (line && line.stations && line.stations.length > 0) {
//             setStationOptions(line.stations.map(st => ({ id: st.id, name: st.station_name })));
//         } else {
//             setStationOptions([]); // Clear stations until subline selected or none exist
//         }
//     } else {
//         setSublineOptions([]);
//         setStationOptions([]);
//     }
//   };

//   const handleSublineChange = (sublineId: number | null) => {
//     // Reset station when subline changes
//     setFormData(prev => ({ ...prev, subline: sublineId, station: null }));

//     if (formData.line && formData.department) {
//         const structure = fullHierarchy.find(item => item.factory === formData.factory && item.hq === formData.hq);
//         const dept = structure?.structure_data.departments.find(d => d.id === formData.department);
//         const line = dept?.lines?.find(l => l.id === formData.line);

//         if (sublineId) {
//             // User SELECTED a subline: Show subline's stations
//             const subline = line?.sublines?.find(sl => sl.id === sublineId);
//             if (subline && subline.stations) {
//                 setStationOptions(subline.stations.map(st => ({ id: st.id, name: st.station_name })));
//             } else {
//                 setStationOptions([]);
//             }
//         } else {
//             // User CLEARED subline (or selected "All Sublines"): Revert to Line's direct stations (if any)
//             if (line && line.stations) {
//                  setStationOptions(line.stations.map(st => ({ id: st.id, name: st.station_name })));
//             } else {
//                  setStationOptions([]);
//             }
//         }
//     } else {
//         setStationOptions([]);
//     }
//   };

//   // --- Submit & Delete Handlers ---
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!formData.factory) { alert("Factory is a required field."); return; }
    
//     const apiPayload = frontendToApi(formData);
//     try {
//       const response = await fetch(`${API_BASE_URL}/advance-dashboard/`, {
//         method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(apiPayload),
//       });
//       if (!response.ok) {
//         const errorData = await response.json(); throw new Error(JSON.stringify(errorData));
//       }
//       const newApiData: ApiAdvanceManpowerData = await response.json();
//       setAdvanceSettingsData(prev => [...prev, apiToFrontend(newApiData)]);
//       setFormData(initialFormData);
//       setFactoryOptions([]); setDepartmentOptions([]); setLineOptions([]); setSublineOptions([]); setStationOptions([]);
//       alert('Data added successfully!');
//       setActiveTab('data-list');
//     } catch (err: any) {
//       alert(`Failed to add entry: ${err.message}`);
//     }
//   };

//   const handleDelete = async (id: number) => {
//     if (window.confirm('Are you sure you want to delete this entry?')) {
//       try {
//         await fetch(`${API_BASE_URL}/advance-dashboard/${id}/`, { method: 'DELETE' });
//         setAdvanceSettingsData(prev => prev.filter(item => item.id !== id));
//       } catch (err: any) {
//         alert(`Error: ${err.message}`);
//       }
//     }
//   };

//   // --- UPLOAD & DOWNLOAD HANDLERS ---
//   const handleDownloadTemplate = () => {
//     window.location.href = `${API_BASE_URL}/advance-dashboard/download-template/`;
//   };

//   const handleExcelUpload = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!uploadFile) return;
//     setUploadLoading(true);
//     const formData = new FormData();
//     formData.append('file', uploadFile);
//     try {
//       const response = await fetch(`${API_BASE_URL}/advance-dashboard/upload-data/`, { method: 'POST', body: formData });
//       const result = await response.json();
//       if (!response.ok) throw new Error(result.error || (result.errors && result.errors.join('\n')) || 'Upload failed');
      
//       alert(`Upload successful!\nCreated: ${result.records_created}\nUpdated: ${result.records_updated}`);
      
//       // Refresh data
//       const dashboardRes = await fetch(`${API_BASE_URL}/advance-dashboard/`);
//       const dashboardJson = await dashboardRes.json();
//       setAdvanceSettingsData(dashboardJson.map(apiToFrontend));
//       setActiveTab('data-list');
//     } catch (err: any) {
//       alert(`Upload failed:\n${err.message}`);
//     } finally {
//       setUploadLoading(false); setUploadFile(null);
//     }
//   };
  
//   const formatDate = (dateString: string) => {
//     if (!dateString) return '';
//     const [year, month] = dateString.split('-').map(Number);
//     const date = new Date(year, month - 1, 1);
//     return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
//   };

//   // --- Render ---
//   const renderTabContent = () => {
//     if (loading) return <div className="text-center p-12 text-gray-600">Loading system data...</div>;
    
//     switch (activeTab) {
//       case 'overview':
//         return (
//           <div className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-between">
//                     <div><p className="text-gray-500 text-sm">Total Records</p><p className="text-3xl font-bold text-gray-800">{advanceSettingsData.length}</p></div>
//                     <div className="bg-blue-500 p-3 rounded-xl text-white"><FileSpreadsheet size={24} /></div>
//                  </div>
//                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-between">
//                     <div><p className="text-gray-500 text-sm">Total Operators Req.</p><p className="text-3xl font-bold text-gray-800">{advanceSettingsData.reduce((a,b)=>a+b.operator_required_ctq,0)}</p></div>
//                     <div className="bg-green-500 p-3 rounded-xl text-white"><Users size={24} /></div>
//                  </div>
//             </div>
//             <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Entries</h3>
//                 <div className="space-y-3">
//                     {advanceSettingsData.slice(-5).reverse().map(item => (
//                         <div key={item.id} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
//                             <div className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3"><Calendar size={18} /></div>
//                             <div>
//                                 <p className="font-semibold text-sm text-gray-800">{formatDate(item.month_year)}</p>
//                                 <p className="text-xs text-gray-500">
//                                     {allFactoriesMap[item.factory || 0]} • {allDepartmentsMap[item.department || 0]} 
//                                 </p>
//                             </div>
//                             <div className="ml-auto text-right">
//                                 <p className="text-sm font-bold text-gray-700">{item.operator_required_ctq} Ops</p>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//           </div>
//         );

//       case 'add-data':
//         // Helper to determine if Subline Input should be visible
//         const isSublineVisible = sublineOptions.length > 0;

//         return (
//           <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
//             <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center"><Plus className="h-6 w-6 mr-3 text-blue-600" />Add New Entry</h2>
//             <form onSubmit={handleSubmit} className="space-y-8">
//               {/* Hierarchy Inputs (Same as your code) */}
//               <div className="bg-gray-50 rounded-xl p-6">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><Building className="h-5 w-5 mr-2 text-blue-600" />Location Details</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   {/* HQ */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Headquarters</label>
//                     <select value={formData.hq ?? ''} onChange={(e) => handleHqChange(e.target.value ? parseInt(e.target.value) : null)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
//                         <option value="">Select HQ</option>
//                         {hqOptions.map(opt => (<option key={opt.id} value={opt.id}>{opt.name}</option>))}
//                     </select>
//                   </div>
//                   {/* Factory */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Factory <span className="text-red-500">*</span></label>
//                     <select value={formData.factory ?? ''} onChange={(e) => handleFactoryChange(e.target.value ? parseInt(e.target.value) : null)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" disabled={!formData.hq}>
//                         <option value="">Select Factory</option>
//                         {factoryOptions.map(opt => (<option key={opt.id} value={opt.id}>{opt.name}</option>))}
//                     </select>
//                   </div>
//                   {/* Department */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
//                     <select value={formData.department ?? ''} onChange={(e) => handleDepartmentChange(e.target.value ? parseInt(e.target.value) : null)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" disabled={!formData.factory}>
//                         <option value="">All Departments</option>
//                         {departmentOptions.map(opt => (<option key={opt.id} value={opt.id}>{opt.name}</option>))}
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               {/* Org Hierarchy Level 2 */}
//               <div className="bg-gray-50 rounded-xl p-6">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   {/* Line */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Line</label>
//                     <select value={formData.line ?? ''} onChange={(e) => handleLineChange(e.target.value ? parseInt(e.target.value) : null)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" disabled={!formData.department}>
//                         <option value="">All Lines</option>
//                         {lineOptions.map(opt => (<option key={opt.id} value={opt.id}>{opt.name}</option>))}
//                     </select>
//                   </div>
                  
//                   {/* Subline - VISUAL TOGGLE BASED ON AVAILABILITY */}
//                   <div className={isSublineVisible ? "block" : "hidden"}>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">SubLine</label>
//                     <select value={formData.subline ?? ''} onChange={(e) => handleSublineChange(e.target.value ? parseInt(e.target.value) : null)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
//                         <option value="">Select SubLine</option>
//                         {sublineOptions.map(opt => (<option key={opt.id} value={opt.id}>{opt.name}</option>))}
//                     </select>
//                   </div>
                  
//                   {/* Station */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Station</label>
//                     <select value={formData.station ?? ''} onChange={(e) => setFormData(prev => ({...prev, station: e.target.value ? parseInt(e.target.value) : null}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" disabled={!formData.line}>
//                         <option value="">All Stations</option>
//                         {stationOptions.map(opt => (<option key={opt.id} value={opt.id}>{opt.name}</option>))}
//                     </select>
//                   </div>

//                   {/* Filler div if subline is hidden to keep grid layout nice (optional) */}
//                   {!isSublineVisible && <div className="hidden md:block"></div>}

//                 </div>
//               </div>

//               {/* Metrics */}
//               <div className="bg-gray-50 rounded-xl p-6">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><BarChart3 className="h-5 w-5 mr-2 text-green-600" />General Metrics</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   <div><label className="block text-sm font-medium text-gray-700 mb-2">Month/Year</label><input type="month" value={formData.month_year} onChange={(e) => setFormData(prev => ({...prev, month_year: e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required /></div>
//                   <div><label className="block text-sm font-medium text-gray-700 mb-2">Total Stations</label><input type="number" min="0" value={formData.total_stations_ctq} onChange={(e) => setFormData(prev => ({...prev, total_stations_ctq: +e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
//                   <div><label className="block text-sm font-medium text-gray-700 mb-2">Attrition (%)</label><input type="number" step="0.01" value={formData.attrition_trend_ctq} onChange={(e) => setFormData(prev => ({...prev, attrition_trend_ctq: +e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
//                   <div><label className="block text-sm font-medium text-gray-700 mb-2">Absenteeism (%)</label><input type="number" step="0.01" value={formData.absentee_trend_ctq} onChange={(e) => setFormData(prev => ({...prev, absentee_trend_ctq: +e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
//                   <div><label className="block text-sm font-medium text-gray-700 mb-2">Buffer Req.</label><input type="number" min="0" value={formData.buffer_manpower_required_ctq} onChange={(e) => setFormData(prev => ({...prev, buffer_manpower_required_ctq: +e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
//                   <div><label className="block text-sm font-medium text-gray-700 mb-2">Buffer Avail.</label><input type="number" min="0" value={formData.buffer_manpower_availability_ctq} onChange={(e) => setFormData(prev => ({...prev, buffer_manpower_availability_ctq: +e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
//                     <div><label className="block text-sm font-medium text-gray-700 mb-2">Total Operators Required</label><input type="number" min="0" value={formData.operator_required_ctq} onChange={(e) => setFormData(prev => ({...prev, operator_required_ctq: +e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-green-50" /></div>
//                     <div><label className="block text-sm font-medium text-gray-700 mb-2">Total Operators Available</label><input type="number" min="0" value={formData.operator_availability_ctq} onChange={(e) => setFormData(prev => ({...prev, operator_availability_ctq: +e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-blue-50" /></div>
//                 </div>
//               </div>

//               {/* Skill Level Metrics */}
//               <div className="bg-gray-50 rounded-xl p-6">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><Layers className="h-5 w-5 mr-2 text-orange-600" />Manpower AvailableLevel (L1-L4)</h3>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//                     {['l1', 'l2', 'l3', 'l4'].map((level) => (
//                         <div key={level} className="space-y-2 border-r border-gray-200 pr-2 last:border-r-0">
//                             <h4 className="font-bold text-gray-600 text-center uppercase">{level}</h4>
//                             <div className="text-xs text-gray-500">Required</div>
//                             <input type="number" min="0" 
//                                 value={formData[`${level}_required` as keyof typeof formData] as number} 
//                                 onChange={(e) => setFormData(prev => ({...prev, [`${level}_required`]: +e.target.value}))} 
//                                 className="w-full px-3 py-1 border rounded" />
//                             <div className="text-xs text-gray-500">Available</div>
//                             <input type="number" min="0" 
//                                 value={formData[`${level}_available` as keyof typeof formData] as number} 
//                                 onChange={(e) => setFormData(prev => ({...prev, [`${level}_available`]: +e.target.value}))} 
//                                 className="w-full px-3 py-1 border rounded" />
//                         </div>
//                     ))}
//                 </div>
//               </div>

//               <div className="flex justify-end pt-6">
//                 <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg">Save Entry</button>
//               </div>
//             </form>
//           </div>
//         );

//       case 'upload':
//         return (
//           <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center max-w-3xl mx-auto mt-8">
//             <h2 className="text-2xl font-bold text-gray-800 mb-2">Bulk Upload Data</h2>
//             <p className="text-gray-600 mb-8">Download the template, fill in your data, and upload it back.</p>

//             {/* Step 1: Download */}
//             <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
//               <h4 className="font-bold text-blue-800 mb-2 flex items-center justify-center">
//                 <FileSpreadsheet className="h-5 w-5 mr-2" /> Step 1: Get the Template
//               </h4>
//               <p className="text-sm text-blue-600 mb-4">
//                 This template includes columns for Hierarchy, KPIs, and Skill Levels (L1-L4).
//               </p>
//               <button 
//                 onClick={handleDownloadTemplate}
//                 className="px-6 py-2 bg-white text-blue-700 font-bold rounded-lg border border-blue-200 shadow-sm hover:bg-blue-50 transition-all flex items-center mx-auto"
//               >
//                 <Download className="h-4 w-4 mr-2" /> Download Template.xlsx
//               </button>
//             </div>

//             {/* Step 2: Upload */}
//             <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
//               <h4 className="font-bold text-gray-700 mb-4">Step 2: Upload Filled File</h4>
              
//               <input 
//                 type="file" 
//                 accept=".xlsx, .xls" 
//                 onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
//                 className="mb-6 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
//               />

//               {uploadFile && (
//                 <div className="flex items-center text-sm text-green-600 font-medium mb-4 bg-green-50 px-4 py-2 rounded-full">
//                   <CheckCircle className="h-4 w-4 mr-2" />
//                   {uploadFile.name} selected
//                 </div>
//               )}

//               <button
//                 onClick={handleExcelUpload}
//                 disabled={!uploadFile || uploadLoading}
//                 className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center shadow-lg disabled:shadow-none transition-all"
//               >
//                 {uploadLoading ? (
//                   <>
//                     <Loader2 className="h-5 w-5 animate-spin mr-2" /> Uploading...
//                   </>
//                 ) : (
//                   <>
//                     <Upload className="h-5 w-5 mr-2" /> Upload Excel File
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         );

//       case 'data-list':
//         return (
//           <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Line / Station</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Req / Avail</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skill Gaps</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {advanceSettingsData.map((item) => (
//                     <tr key={item.id} className="hover:bg-gray-50">
//                       <td className="px-4 py-3 text-sm">
//                         <div className="font-medium text-gray-900">{allFactoriesMap[item.factory || 0]}</div>
//                         <div className="text-gray-500">{allDepartmentsMap[item.department || 0]}</div>
//                       </td>
//                       <td className="px-4 py-3 text-sm">
//                         <div className="text-gray-900 font-medium">{item.line ? (allLinesMap[item.line] || `Line ${item.line}`) : '-'}</div>
//                         <div className="text-xs text-gray-500">
//                             {item.subline ? (allSublinesMap[item.subline] || `Sub ${item.subline}`) : ''} 
//                             {item.station ? ` / ${allStationsMap[item.station] || 'Stn ' + item.station}` : ''}
//                         </div>
//                       </td>
//                       <td className="px-4 py-3 text-sm whitespace-nowrap">{formatDate(item.month_year)}</td>
//                       <td className="px-4 py-3 text-sm">
//                           <div className="flex space-x-2">
//                             <span className="text-blue-600 font-bold">R: {item.operator_required_ctq}</span>
//                             <span className="text-green-600 font-bold">A: {item.operator_availability_ctq}</span>
//                           </div>
//                       </td>
//                       <td className="px-4 py-3 text-sm text-xs text-gray-600">
//                          <div className="grid grid-cols-2 gap-x-2">
//                              <span>L1: {item.l1_required}/{item.l1_available}</span>
//                              <span>L2: {item.l2_required}/{item.l2_available}</span>
//                              <span>L3: {item.l3_required}/{item.l3_available}</span>
//                              <span>L4: {item.l4_required}/{item.l4_available}</span>
//                          </div>
//                       </td>
//                       <td className="px-4 py-3 text-sm">
//                         <button onClick={() => handleDelete(item.id!)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         );
//       default: return null;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
//         <div className="max-w-7xl mx-auto">
//             <h1 className="text-3xl font-bold text-gray-900 mb-6">Manpower Planning Dashboard</h1>
//             <div className="flex space-x-4 mb-6 border-b border-gray-200">
//                 {[
//                     { id: 'overview', label: 'Overview', icon: BarChart3 },
//                     { id: 'add-data', label: 'Add Data', icon: Plus },
//                     { id: 'upload', label: 'Bulk Upload', icon: Upload },
//                     { id: 'data-list', label: 'Records', icon: FileSpreadsheet }
//                 ].map(tab => (
//                     <button key={tab.id} onClick={() => setActiveTab(tab.id)} 
//                         className={`pb-2 px-4 flex items-center space-x-2 ${activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}>
//                         <tab.icon size={18} /> <span>{tab.label}</span>
//                     </button>
//                 ))}
//             </div>
//             {renderTabContent()}
//         </div>
//     </div>
//   );
// };

// export default AdvanceSettings;




import React, { useState, useEffect } from "react";
import { 
  Upload, Plus, Trash2, FileSpreadsheet, Users, 
  Calendar, BarChart3, Building, Layers, CheckCircle, 
  Loader2, Download, Edit, X // Added Edit and X icons
} from "lucide-react";

// --- API Configuration ---
const API_BASE_URL = "http://127.0.0.1:8000"; 

// --- Frontend Form Data Interface ---
interface AdvanceSettingsData {
  id?: number;
  hq: number | null;
  factory: number | null;
  department: number | null;
  line: number | null;
  subline: number | null;
  station: number | null;
  month_year: string;
  
  // KPIs
  total_stations_ctq: number;
  operator_required_ctq: number;
  operator_availability_ctq: number;
  buffer_manpower_required_ctq: number;
  buffer_manpower_availability_ctq: number;
  attrition_trend_ctq: number;
  absentee_trend_ctq: number;

  // Skill Levels
  l1_required: number; l1_available: number;
  l2_required: number; l2_available: number;
  l3_required: number; l3_available: number;
  l4_required: number; l4_available: number;
}

// --- API Payload/Response Interface ---
interface ApiAdvanceManpowerData {
    id: number; 
    hq: number | null; 
    factory: number; 
    department: number | null;
    line: number | null;
    subline: number | null;
    station: number | null;
    
    month: number; 
    year: number; 
    
    total_stations: number; 
    operators_required: number;
    operators_available: number; 
    buffer_manpower_required: number; 
    buffer_manpower_available: number;
    
    l1_required: number; l1_available: number;
    l2_required: number; l2_available: number;
    l3_required: number; l3_available: number;
    l4_required: number; l4_available: number;

    attrition_rate: string; 
    absenteeism_rate: string;
}

// --- Hierarchy Interfaces ---
interface StationNode { id: number; station_name: string; }
interface SublineNode { id: number; subline_name: string; stations?: StationNode[]; }
interface LineNode { 
    id: number; 
    line_name: string; 
    sublines?: SublineNode[]; 
    stations?: StationNode[]; 
}
interface DepartmentNode { id: number; department_name: string; lines?: LineNode[]; }

interface HierarchyStructure {
    hq: number; hq_name: string;
    factory: number; factory_name: string;
    structure_data: {
        departments: DepartmentNode[];
    };
}

interface DropdownOption { id: number; name: string; }

// --- Data Transformers ---
const apiToFrontend = (apiData: ApiAdvanceManpowerData): AdvanceSettingsData => ({
    id: apiData.id, 
    hq: apiData.hq, factory: apiData.factory, department: apiData.department,
    line: apiData.line, subline: apiData.subline, station: apiData.station,
    month_year: `${apiData.year}-${apiData.month.toString().padStart(2, '0')}`,
    
    total_stations_ctq: apiData.total_stations, 
    operator_required_ctq: apiData.operators_required,
    operator_availability_ctq: apiData.operators_available, 
    buffer_manpower_required_ctq: apiData.buffer_manpower_required,
    buffer_manpower_availability_ctq: apiData.buffer_manpower_available, 
    
    l1_required: apiData.l1_required, l1_available: apiData.l1_available,
    l2_required: apiData.l2_required, l2_available: apiData.l2_available,
    l3_required: apiData.l3_required, l3_available: apiData.l3_available,
    l4_required: apiData.l4_required, l4_available: apiData.l4_available,

    attrition_trend_ctq: parseFloat(apiData.attrition_rate),
    absentee_trend_ctq: parseFloat(apiData.absenteeism_rate),
});

const frontendToApi = (formData: Omit<AdvanceSettingsData, 'id'>) => {
    const [year, month] = formData.month_year.split('-').map(Number);
    return {
        hq: formData.hq, factory: formData.factory, department: formData.department,
        line: formData.line, subline: formData.subline, station: formData.station,
        month, year,
        total_stations: formData.total_stations_ctq, 
        operators_required: formData.operator_required_ctq,
        operators_available: formData.operator_availability_ctq, 
        buffer_manpower_required: formData.buffer_manpower_required_ctq,
        buffer_manpower_available: formData.buffer_manpower_availability_ctq, 
        
        l1_required: formData.l1_required, l1_available: formData.l1_available,
        l2_required: formData.l2_required, l2_available: formData.l2_available,
        l3_required: formData.l3_required, l3_available: formData.l3_available,
        l4_required: formData.l4_required, l4_available: formData.l4_available,

        attrition_rate: formData.attrition_trend_ctq.toFixed(2),
        absenteeism_rate: formData.absentee_trend_ctq.toFixed(2),
    };
};

const AdvanceSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [advanceSettingsData, setAdvanceSettingsData] = useState<AdvanceSettingsData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- Hierarchy State ---
  const [fullHierarchy, setFullHierarchy] = useState<HierarchyStructure[]>([]);
  
  // Dropdown Options State
  const [hqOptions, setHqOptions] = useState<DropdownOption[]>([]);
  const [factoryOptions, setFactoryOptions] = useState<DropdownOption[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<DropdownOption[]>([]);
  const [lineOptions, setLineOptions] = useState<DropdownOption[]>([]);
  const [sublineOptions, setSublineOptions] = useState<DropdownOption[]>([]);
  const [stationOptions, setStationOptions] = useState<DropdownOption[]>([]);

  // Display Maps
  const [allHqsMap, setAllHqsMap] = useState<Record<number, string>>({});
  const [allFactoriesMap, setAllFactoriesMap] = useState<Record<number, string>>({});
  const [allDepartmentsMap, setAllDepartmentsMap] = useState<Record<number, string>>({});
  const [allLinesMap, setAllLinesMap] = useState<Record<number, string>>({});
  const [allSublinesMap, setAllSublinesMap] = useState<Record<number, string>>({});
  const [allStationsMap, setAllStationsMap] = useState<Record<number, string>>({});

  // Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<number | null>(null);

  const initialFormData: Omit<AdvanceSettingsData, 'id'> = {
    hq: null, factory: null, department: null, 
    line: null, subline: null, station: null,
    month_year: `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`,
    total_stations_ctq: 0, operator_required_ctq: 0, operator_availability_ctq: 0,
    buffer_manpower_required_ctq: 0, buffer_manpower_availability_ctq: 0,
    l1_required: 0, l1_available: 0,
    l2_required: 0, l2_available: 0,
    l3_required: 0, l3_available: 0,
    l4_required: 0, l4_available: 0,
    attrition_trend_ctq: 0.00, absentee_trend_ctq: 0.00,
  };
  
  const [formData, setFormData] = useState<Omit<AdvanceSettingsData, 'id'>>(initialFormData);

  // --- Initial Load ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const dashboardRes = await fetch(`${API_BASE_URL}/advance-dashboard/`);
        const dashboardJson: ApiAdvanceManpowerData[] = await dashboardRes.json();
        setAdvanceSettingsData(dashboardJson.map(apiToFrontend));

        const hierarchyRes = await fetch(`${API_BASE_URL}/hierarchy-simple/`);
        const hierarchyJson: HierarchyStructure[] = await hierarchyRes.json();
        setFullHierarchy(hierarchyJson);

        const hMap: Record<number, string> = {};
        const fMap: Record<number, string> = {};
        const dMap: Record<number, string> = {};
        const lMap: Record<number, string> = {};
        const slMap: Record<number, string> = {};
        const stMap: Record<number, string> = {};

        const uniqueHqs = new Map<number, string>();
        
        hierarchyJson.forEach(item => {
             if(item.hq) {
                 hMap[item.hq] = item.hq_name;
                 uniqueHqs.set(item.hq, item.hq_name);
             }
             fMap[item.factory] = item.factory_name;
             item.structure_data.departments.forEach(dept => {
                 dMap[dept.id] = dept.department_name;
                 dept.lines?.forEach(line => {
                     lMap[line.id] = line.line_name;
                     line.stations?.forEach(stn => { stMap[stn.id] = stn.station_name; });
                     line.sublines?.forEach(sub => {
                         slMap[sub.id] = sub.subline_name;
                         sub.stations?.forEach(stn => { stMap[stn.id] = stn.station_name; });
                     });
                 });
             });
        });

        setHqOptions(Array.from(uniqueHqs).map(([id, name]) => ({ id, name })));
        setAllHqsMap(hMap); setAllFactoriesMap(fMap); setAllDepartmentsMap(dMap);
        setAllLinesMap(lMap); setAllSublinesMap(slMap); setAllStationsMap(stMap);

      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- Dropdown Logic ---
  const handleHqChange = (hqId: number | null) => {
    setFormData(prev => ({ ...prev, hq: hqId, factory: null, department: null, line: null, subline: null, station: null }));
    if (hqId) {
        const filtered = fullHierarchy.filter(item => item.hq === hqId);
        const uniqueFacs = [...new Map(filtered.map(item => [item.factory, { id: item.factory, name: item.factory_name }])).values()];
        setFactoryOptions(uniqueFacs);
    } else { setFactoryOptions([]); }
    setDepartmentOptions([]); setLineOptions([]); setSublineOptions([]); setStationOptions([]);
  };

  const handleFactoryChange = (factoryId: number | null) => {
    setFormData(prev => ({ ...prev, factory: factoryId, department: null, line: null, subline: null, station: null }));
    if (factoryId) {
        const structure = fullHierarchy.find(item => item.factory === factoryId && item.hq === formData.hq);
        if (structure) {
            setDepartmentOptions(structure.structure_data.departments.map(d => ({ id: d.id, name: d.department_name })));
        } else { setDepartmentOptions([]); }
    } else { setDepartmentOptions([]); }
    setLineOptions([]); setSublineOptions([]); setStationOptions([]);
  };

  const handleDepartmentChange = (deptId: number | null) => {
    setFormData(prev => ({ ...prev, department: deptId, line: null, subline: null, station: null }));
    if (deptId && formData.factory) {
        const structure = fullHierarchy.find(item => item.factory === formData.factory && item.hq === formData.hq);
        const dept = structure?.structure_data.departments.find(d => d.id === deptId);
        if (dept && dept.lines) {
            setLineOptions(dept.lines.map(l => ({ id: l.id, name: l.line_name })));
        } else { setLineOptions([]); }
    } else { setLineOptions([]); }
    setSublineOptions([]); setStationOptions([]);
  };

  const handleLineChange = (lineId: number | null) => {
    setFormData(prev => ({ ...prev, line: lineId, subline: null, station: null }));
    if (lineId && formData.department && formData.factory) {
        const structure = fullHierarchy.find(item => item.factory === formData.factory && item.hq === formData.hq);
        const dept = structure?.structure_data.departments.find(d => d.id === formData.department);
        const line = dept?.lines?.find(l => l.id === lineId);
        if (line && line.sublines && line.sublines.length > 0) {
            setSublineOptions(line.sublines.map(sl => ({ id: sl.id, name: sl.subline_name })));
        } else { setSublineOptions([]); }
        if (line && line.stations && line.stations.length > 0) {
            setStationOptions(line.stations.map(st => ({ id: st.id, name: st.station_name })));
        } else { setStationOptions([]); }
    } else {
        setSublineOptions([]); setStationOptions([]);
    }
  };

  const handleSublineChange = (sublineId: number | null) => {
    setFormData(prev => ({ ...prev, subline: sublineId, station: null }));
    if (formData.line && formData.department) {
        const structure = fullHierarchy.find(item => item.factory === formData.factory && item.hq === formData.hq);
        const dept = structure?.structure_data.departments.find(d => d.id === formData.department);
        const line = dept?.lines?.find(l => l.id === formData.line);

        if (sublineId) {
            const subline = line?.sublines?.find(sl => sl.id === sublineId);
            if (subline && subline.stations) {
                setStationOptions(subline.stations.map(st => ({ id: st.id, name: st.station_name })));
            } else { setStationOptions([]); }
        } else {
            if (line && line.stations) {
                 setStationOptions(line.stations.map(st => ({ id: st.id, name: st.station_name })));
            } else { setStationOptions([]); }
        }
    } else { setStationOptions([]); }
  };

  // --- EDIT HANDLER (The New Logic) ---
  const handleEdit = (item: AdvanceSettingsData) => {
    // 1. Prepare Form Data
    const { id, ...rest } = item;
    setEditingId(id!);
    setFormData(rest);

    // 2. Re-Populate Dropdowns synchronously based on existing Hierarchy
    // HQ Options are static, already set.
    
    // Factories
    if (item.hq) {
        const filtered = fullHierarchy.filter(h => h.hq === item.hq);
        const uniqueFacs = [...new Map(filtered.map(f => [f.factory, { id: f.factory, name: f.factory_name }])).values()];
        setFactoryOptions(uniqueFacs);
    }

    // Departments
    const structure = fullHierarchy.find(h => h.factory === item.factory && h.hq === item.hq);
    if (structure) {
        setDepartmentOptions(structure.structure_data.departments.map(d => ({ id: d.id, name: d.department_name })));
        
        // Lines
        const dept = structure.structure_data.departments.find(d => d.id === item.department);
        if (dept && dept.lines) {
            setLineOptions(dept.lines.map(l => ({ id: l.id, name: l.line_name })));

            // Sublines & Stations
            const line = dept.lines.find(l => l.id === item.line);
            if (line) {
                // Populate Sublines if exist
                if (line.sublines && line.sublines.length > 0) {
                    setSublineOptions(line.sublines.map(sl => ({ id: sl.id, name: sl.subline_name })));
                } else {
                    setSublineOptions([]);
                }

                // Populate Stations
                if (item.subline) {
                    // If subline selected, show subline stations
                    const sub = line.sublines?.find(sl => sl.id === item.subline);
                    if (sub && sub.stations) {
                        setStationOptions(sub.stations.map(st => ({ id: st.id, name: st.station_name })));
                    } else { setStationOptions([]); }
                } else {
                    // Show line stations
                    if (line.stations) {
                        setStationOptions(line.stations.map(st => ({ id: st.id, name: st.station_name })));
                    } else { setStationOptions([]); }
                }
            } else {
                setLineOptions([]); setSublineOptions([]); setStationOptions([]);
            }
        } else {
            setLineOptions([]); setSublineOptions([]); setStationOptions([]);
        }
    }

    // 3. Switch Tab
    setActiveTab('add-data');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialFormData);
    // Clear dynamic dropdowns
    setFactoryOptions([]); setDepartmentOptions([]); setLineOptions([]); setSublineOptions([]); setStationOptions([]);
  };

  // --- Submit Handler (Create & Update) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.factory) { alert("Factory is a required field."); return; }
    
    const apiPayload = frontendToApi(formData);
    
    try {
      let response;
      let resultData: ApiAdvanceManpowerData;

      if (editingId) {
        // --- UPDATE (PUT) ---
        response = await fetch(`${API_BASE_URL}/advance-dashboard/${editingId}/`, {
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(apiPayload),
        });
        if (!response.ok) {
            const errorData = await response.json(); throw new Error(JSON.stringify(errorData));
        }
        resultData = await response.json();
        
        // Update local state by index
        setAdvanceSettingsData(prev => prev.map(item => item.id === editingId ? apiToFrontend(resultData) : item));
        alert('Entry updated successfully!');
        handleCancelEdit(); // Reset form

      } else {
        // --- CREATE (POST) ---
        response = await fetch(`${API_BASE_URL}/advance-dashboard/`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(apiPayload),
        });
        if (!response.ok) {
            const errorData = await response.json(); throw new Error(JSON.stringify(errorData));
        }
        resultData = await response.json();
        
        // Append to local state
        setAdvanceSettingsData(prev => [...prev, apiToFrontend(resultData)]);
        setFormData(initialFormData);
        setFactoryOptions([]); setDepartmentOptions([]); setLineOptions([]); setSublineOptions([]); setStationOptions([]);
        alert('Data added successfully!');
      }

      setActiveTab('data-list');

    } catch (err: any) {
      alert(`Failed to save: ${err.message}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await fetch(`${API_BASE_URL}/advance-dashboard/${id}/`, { method: 'DELETE' });
        setAdvanceSettingsData(prev => prev.filter(item => item.id !== id));
      } catch (err: any) {
        alert(`Error: ${err.message}`);
      }
    }
  };

  const handleDownloadTemplate = () => {
    window.location.href = `${API_BASE_URL}/advance-dashboard/download-template/`;
  };

  const handleExcelUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploadLoading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);
    try {
      const response = await fetch(`${API_BASE_URL}/advance-dashboard/upload-data/`, { method: 'POST', body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || (result.errors && result.errors.join('\n')) || 'Upload failed');
      alert(`Upload successful!\nCreated: ${result.records_created}\nUpdated: ${result.records_updated}`);
      const dashboardRes = await fetch(`${API_BASE_URL}/advance-dashboard/`);
      const dashboardJson = await dashboardRes.json();
      setAdvanceSettingsData(dashboardJson.map(apiToFrontend));
      setActiveTab('data-list');
    } catch (err: any) {
      alert(`Upload failed:\n${err.message}`);
    } finally {
      setUploadLoading(false); setUploadFile(null);
    }
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  // --- Render ---
  const renderTabContent = () => {
    if (loading) return <div className="text-center p-12 text-gray-600">Loading system data...</div>;
    
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-between">
                    <div><p className="text-gray-500 text-sm">Total Records</p><p className="text-3xl font-bold text-gray-800">{advanceSettingsData.length}</p></div>
                    <div className="bg-blue-500 p-3 rounded-xl text-white"><FileSpreadsheet size={24} /></div>
                 </div>
                 <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-between">
                    <div><p className="text-gray-500 text-sm">Total Operators Req.</p><p className="text-3xl font-bold text-gray-800">{advanceSettingsData.reduce((a,b)=>a+b.operator_required_ctq,0)}</p></div>
                    <div className="bg-green-500 p-3 rounded-xl text-white"><Users size={24} /></div>
                 </div>
            </div>
          </div>
        );

      case 'add-data':
        const isSublineVisible = sublineOptions.length > 0;
        return (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    {editingId ? <><Edit className="h-6 w-6 mr-3 text-orange-600" />Edit Entry</> : <><Plus className="h-6 w-6 mr-3 text-blue-600" />Add New Entry</>}
                </h2>
                {editingId && (
                    <button onClick={handleCancelEdit} className="flex items-center text-red-500 hover:text-red-700 font-medium">
                        <X size={18} className="mr-1"/> Cancel Edit
                    </button>
                )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Hierarchy Inputs */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><Building className="h-5 w-5 mr-2 text-blue-600" />Location Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* HQ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Headquarters</label>
                    <select value={formData.hq ?? ''} onChange={(e) => handleHqChange(e.target.value ? parseInt(e.target.value) : null)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                        <option value="">Select HQ</option>
                        {hqOptions.map(opt => (<option key={opt.id} value={opt.id}>{opt.name}</option>))}
                    </select>
                  </div>
                  {/* Factory */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Factory <span className="text-red-500">*</span></label>
                    <select value={formData.factory ?? ''} onChange={(e) => handleFactoryChange(e.target.value ? parseInt(e.target.value) : null)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" disabled={!formData.hq}>
                        <option value="">Select Factory</option>
                        {factoryOptions.map(opt => (<option key={opt.id} value={opt.id}>{opt.name}</option>))}
                    </select>
                  </div>
                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <select value={formData.department ?? ''} onChange={(e) => handleDepartmentChange(e.target.value ? parseInt(e.target.value) : null)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" disabled={!formData.factory}>
                        <option value="">All Departments</option>
                        {departmentOptions.map(opt => (<option key={opt.id} value={opt.id}>{opt.name}</option>))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Org Hierarchy Level 2 */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Line */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Line</label>
                    <select value={formData.line ?? ''} onChange={(e) => handleLineChange(e.target.value ? parseInt(e.target.value) : null)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" disabled={!formData.department}>
                        <option value="">All Lines</option>
                        {lineOptions.map(opt => (<option key={opt.id} value={opt.id}>{opt.name}</option>))}
                    </select>
                  </div>
                  
                  {/* Subline */}
                  <div className={isSublineVisible ? "block" : "hidden"}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SubLine</label>
                    <select value={formData.subline ?? ''} onChange={(e) => handleSublineChange(e.target.value ? parseInt(e.target.value) : null)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                        <option value="">Select SubLine</option>
                        {sublineOptions.map(opt => (<option key={opt.id} value={opt.id}>{opt.name}</option>))}
                    </select>
                  </div>
                  
                  {/* Station */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Station</label>
                    <select value={formData.station ?? ''} onChange={(e) => setFormData(prev => ({...prev, station: e.target.value ? parseInt(e.target.value) : null}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" disabled={!formData.line}>
                        <option value="">All Stations</option>
                        {stationOptions.map(opt => (<option key={opt.id} value={opt.id}>{opt.name}</option>))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><BarChart3 className="h-5 w-5 mr-2 text-green-600" />General Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Month/Year</label><input type="month" value={formData.month_year} onChange={(e) => setFormData(prev => ({...prev, month_year: e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Total Stations</label><input type="number" min="0" value={formData.total_stations_ctq} onChange={(e) => setFormData(prev => ({...prev, total_stations_ctq: +e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Attrition (%)</label><input type="number" step="0.01" value={formData.attrition_trend_ctq} onChange={(e) => setFormData(prev => ({...prev, attrition_trend_ctq: +e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
                  {/* <div><label className="block text-sm font-medium text-gray-700 mb-2">Absenteeism (%)</label><input type="number" step="0.01" value={formData.absentee_trend_ctq} onChange={(e) => setFormData(prev => ({...prev, absentee_trend_ctq: +e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div> */}
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Buffer Req.</label><input type="number" min="0" value={formData.buffer_manpower_required_ctq} onChange={(e) => setFormData(prev => ({...prev, buffer_manpower_required_ctq: +e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Buffer Avail.</label><input type="number" min="0" value={formData.buffer_manpower_availability_ctq} onChange={(e) => setFormData(prev => ({...prev, buffer_manpower_availability_ctq: +e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Total Operators Required</label><input type="number" min="0" value={formData.operator_required_ctq} onChange={(e) => setFormData(prev => ({...prev, operator_required_ctq: +e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-green-50" /></div>
                    {/* <div><label className="block text-sm font-medium text-gray-700 mb-2">Total Operators Available</label><input type="number" min="0" value={formData.operator_availability_ctq} onChange={(e) => setFormData(prev => ({...prev, operator_availability_ctq: +e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-blue-50" /></div> */}
                </div>
              </div>

              {/* Skill Level Metrics */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><Layers className="h-5 w-5 mr-2 text-orange-600" />Manpower AvailableLevel (L1-L4)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {['l1', 'l2', 'l3', 'l4'].map((level) => (
                        <div key={level} className="space-y-2 border-r border-gray-200 pr-2 last:border-r-0">
                            <h4 className="font-bold text-gray-600 text-center uppercase">{level}</h4>
                            <div className="text-xs text-gray-500">Required</div>
                            <input type="number" min="0" 
                                value={formData[`${level}_required` as keyof typeof formData] as number} 
                                onChange={(e) => setFormData(prev => ({...prev, [`${level}_required`]: +e.target.value}))} 
                                className="w-full px-3 py-1 border rounded" />
                            {/* <div className="text-xs text-gray-500">Available</div> */}
                            {/* <input type="number" min="0" 
                                value={formData[`${level}_available` as keyof typeof formData] as number} 
                                onChange={(e) => setFormData(prev => ({...prev, [`${level}_available`]: +e.target.value}))} 
                                className="w-full px-3 py-1 border rounded" /> */}
                        </div>
                    ))}
                </div>
              </div>

              <div className="flex justify-end pt-6 space-x-3">
                {editingId && (
                     <button type="button" onClick={handleCancelEdit} className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300">Cancel</button>
                )}
                <button type="submit" className={`px-8 py-3 text-white font-semibold rounded-xl shadow-lg ${editingId ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                    {editingId ? 'Update Entry' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        );

      case 'upload':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center max-w-3xl mx-auto mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Bulk Upload Data</h2>
            <p className="text-gray-600 mb-8">Download the template, fill in your data, and upload it back.</p>

            <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
              <h4 className="font-bold text-blue-800 mb-2 flex items-center justify-center">
                <FileSpreadsheet className="h-5 w-5 mr-2" /> Step 1: Get the Template
              </h4>
              <button onClick={handleDownloadTemplate} className="px-6 py-2 bg-white text-blue-700 font-bold rounded-lg border border-blue-200 shadow-sm hover:bg-blue-50 transition-all flex items-center mx-auto">
                <Download className="h-4 w-4 mr-2" /> Download Template.xlsx
              </button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
              <h4 className="font-bold text-gray-700 mb-4">Step 2: Upload Filled File</h4>
              <input type="file" accept=".xlsx, .xls" onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)} className="mb-6 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
              <button onClick={handleExcelUpload} disabled={!uploadFile || uploadLoading} className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center shadow-lg disabled:shadow-none transition-all">
                {uploadLoading ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Uploading...</> : <><Upload className="h-5 w-5 mr-2" /> Upload Excel File</>}
              </button>
            </div>
          </div>
        );

      case 'data-list':
        return (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Line / Station</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Req / Avail</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skill Gaps</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {advanceSettingsData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900">{allFactoriesMap[item.factory || 0]}</div>
                        <div className="text-gray-500">{allDepartmentsMap[item.department || 0]}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="text-gray-900 font-medium">{item.line ? (allLinesMap[item.line] || `Line ${item.line}`) : '-'}</div>
                        <div className="text-xs text-gray-500">
                            {item.subline ? (allSublinesMap[item.subline] || `Sub ${item.subline}`) : ''} 
                            {item.station ? ` / ${allStationsMap[item.station] || 'Stn ' + item.station}` : ''}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">{formatDate(item.month_year)}</td>
                      <td className="px-4 py-3 text-sm">
                          <div className="flex space-x-2">
                            <span className="text-blue-600 font-bold">R: {item.operator_required_ctq}</span>
                            <span className="text-green-600 font-bold">A: {item.operator_availability_ctq}</span>
                          </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-xs text-gray-600">
                         <div className="grid grid-cols-2 gap-x-2">
                             <span>L1: {item.l1_required}/{item.l1_available}</span>
                             <span>L2: {item.l2_required}/{item.l2_available}</span>
                             <span>L3: {item.l3_required}/{item.l3_available}</span>
                             <span>L4: {item.l4_required}/{item.l4_available}</span>
                         </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center space-x-3">
                            <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900" title="Edit">
                                <Edit size={18} />
                            </button>
                            <button onClick={() => handleDelete(item.id!)} className="text-red-600 hover:text-red-900" title="Delete">
                                <Trash2 size={18} />
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Manpower Planning Dashboard</h1>
            <div className="flex space-x-4 mb-6 border-b border-gray-200">
                {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'add-data', label: editingId ? 'Edit Data' : 'Add Data', icon: editingId ? Edit : Plus },
                    { id: 'upload', label: 'Bulk Upload', icon: Upload },
                    { id: 'data-list', label: 'Records', icon: FileSpreadsheet }
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} 
                        className={`pb-2 px-4 flex items-center space-x-2 ${activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}>
                        <tab.icon size={18} /> <span>{tab.label}</span>
                    </button>
                ))}
            </div>
            {renderTabContent()}
        </div>
    </div>
  );
};

export default AdvanceSettings;