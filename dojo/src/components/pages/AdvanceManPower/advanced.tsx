// import React, { useState, useEffect } from "react";
// import CardProps from "./AdvanceCard/Cardprops";
// import Absenteeism from "./Graphs/Absenteeism/absenteeism";
// import AttritionTrendChart from "./Graphs/Attrition/attrition";
// import BufferManpowerAvailability from "./Graphs/BufferManpowerAvailability/BufferManpower";
// import OperatorStats from "./OperatorStats/OperatorStatsRedirect";
// import ManpowerTrendChart from "./Graphs/Manpower/Manpower";
// import ManpowerActions from "./ManpowerActions/ManpowerActions";
// import MyTable from "./Graphs/ActionPlanned/mytable";

// // --- Interfaces ---
// interface SelectOption {
//   id: number;
//   name: string;
// }

// interface Station { id: number; station_name: string; }
// // Updated: Stations can exist at Subline, Line, OR Department level
// interface Subline { id: number; subline_name: string; stations?: Station[]; }
// interface Line { id: number; line_name: string; sublines?: Subline[]; stations?: Station[]; }
// interface Department { id: number; department_name: string; lines?: Line[]; stations?: Station[]; }

// interface StructureData { hq_name: string; factory_name: string; departments: Department[]; }
// interface HierarchyNode {
//   structure_id: number;
//   structure_name: string;
//   hq: number;
//   hq_name: string;
//   factory: number;
//   factory_name: string;
//   structure_data: StructureData;
// }

// interface CardData {
//   id: number;
//   month: number;
//   year: number;
//   total_stations: number;
//   operators_required: number;
//   operators_available: number;
//   buffer_manpower_required: number;
//   buffer_manpower_available: number;
//   attrition_rate: string;
//   absenteeism_rate: string;
// }

// const Advance: React.FC = () => {
//   // --- HIERARCHY STATE ---
//   const [selectedHQ, setSelectedHQ] = useState<string>("");
//   const [selectedFactory, setSelectedFactory] = useState<string>("");
//   const [selectedDepartment, setSelectedDepartment] = useState<string>("");
//   const [selectedLine, setSelectedLine] = useState<string>("");
//   const [selectedSubline, setSelectedSubline] = useState<string>("");
//   const [selectedStation, setSelectedStation] = useState<string>("");

//   // --- DATA & OPTIONS ---
//   const [hierarchyData, setHierarchyData] = useState<HierarchyNode[]>([]);
  
//   const [hqOptions, setHqOptions] = useState<SelectOption[]>([]);
//   const [factoryOptions, setFactoryOptions] = useState<SelectOption[]>([]);
//   const [departmentOptions, setDepartmentOptions] = useState<SelectOption[]>([]);
//   const [lineOptions, setLineOptions] = useState<SelectOption[]>([]);
//   const [sublineOptions, setSublineOptions] = useState<SelectOption[]>([]);
//   const [stationOptions, setStationOptions] = useState<SelectOption[]>([]);

//   // --- DASHBOARD DATA STATE ---
//   const [cardData, setCardData] = useState<CardData | null>(null);
//   const [isCardDataLoading, setIsCardDataLoading] = useState<boolean>(false);
//   const [cardDataError, setCardDataError] = useState<string | null>(null);
//   const [stationType] = useState<string>("CTQ"); 

//   // 1. Fetch Hierarchy
//   useEffect(() => {
//     const fetchHierarchyData = async () => {
//       try {
//         const response = await fetch("http://127.0.0.1:8000/hierarchy-simple/");
//         if (!response.ok) throw new Error("Failed to fetch hierarchy");
//         const data: HierarchyNode[] = await response.json();
//         setHierarchyData(data);
//       } catch (error) {
//         console.error("Failed to fetch hierarchy data:", error);
//       }
//     };
//     fetchHierarchyData();
//   }, []);

//   // --- CASCADING LOGIC ---

//   // 2. Load HQs -> Auto Select First
//   useEffect(() => {
//     if (hierarchyData.length > 0) {
//       const uniqueHQs = new Map<number, string>();
//       hierarchyData.forEach(item => uniqueHQs.set(item.hq, item.hq_name));
//       const options = Array.from(uniqueHQs, ([id, name]) => ({ id, name }));
//       setHqOptions(options);

//       if (!selectedHQ && options.length > 0) {
//         setSelectedHQ(String(options[0].id));
//       }
//     }
//   }, [hierarchyData]);

//   // 3. HQ Selected -> Load Factories -> Auto Select First
//   useEffect(() => {
//     if (!selectedHQ) {
//       setFactoryOptions([]);
//       return;
//     }
//     const uniqueFactories = new Map<number, string>();
//     hierarchyData
//       .filter(item => item.hq === parseInt(selectedHQ))
//       .forEach(item => uniqueFactories.set(item.factory, item.factory_name));
    
//     const options = Array.from(uniqueFactories, ([id, name]) => ({ id, name }));
//     setFactoryOptions(options);

//     if (options.length > 0) {
//       // Only auto-select if not already selected or current selection is invalid
//       if (!selectedFactory || !options.find(o => String(o.id) === selectedFactory)) {
//         setSelectedFactory(String(options[0].id));
//       }
//     } else {
//       setSelectedFactory("");
//     }
//   }, [selectedHQ, hierarchyData]);

//   // 4. Factory Selected -> Load Departments
//   useEffect(() => {
//     if (!selectedFactory) {
//       setDepartmentOptions([]);
//       return;
//     }
//     const uniqueDepts = new Map<number, string>();
//     hierarchyData
//       .filter(item => item.hq === parseInt(selectedHQ) && item.factory === parseInt(selectedFactory))
//       .forEach(struct => {
//         struct.structure_data.departments.forEach(d => uniqueDepts.set(d.id, d.department_name));
//       });
    
//     const options = Array.from(uniqueDepts, ([id, name]) => ({ id, name }));
//     setDepartmentOptions(options);

//     if (selectedDepartment && !options.find(o => String(o.id) === selectedDepartment)) {
//       setSelectedDepartment("");
//     }
//   }, [selectedFactory, selectedHQ, hierarchyData]);

//   // 5. Department Selected -> Load Lines
//   useEffect(() => {
//     if (!selectedDepartment) {
//       setLineOptions([]);
//       setSelectedLine("");
//       return;
//     }
//     const uniqueLines = new Map<number, string>();
//     hierarchyData
//       .filter(item => item.hq === parseInt(selectedHQ) && item.factory === parseInt(selectedFactory))
//       .forEach(struct => {
//         struct.structure_data.departments
//           .filter(d => d.id === parseInt(selectedDepartment))
//           .forEach(dept => dept.lines?.forEach(l => uniqueLines.set(l.id, l.line_name)));
//       });

//     const options = Array.from(uniqueLines, ([id, name]) => ({ id, name }));
//     setLineOptions(options);
//     if (selectedLine && !options.find(o => String(o.id) === selectedLine)) setSelectedLine("");
//   }, [selectedDepartment, selectedFactory, selectedHQ, hierarchyData]);

//   // 6. Line Selected -> Load Sublines
//   useEffect(() => {
//     if (!selectedLine) {
//       setSublineOptions([]);
//       setSelectedSubline("");
//       return;
//     }
//     const uniqueSublines = new Map<number, string>();
//     hierarchyData
//       .filter(item => item.hq === parseInt(selectedHQ) && item.factory === parseInt(selectedFactory))
//       .forEach(struct => {
//         struct.structure_data.departments.forEach(dept => {
//           if (dept.id === parseInt(selectedDepartment)) {
//             dept.lines?.forEach(line => {
//               if (line.id === parseInt(selectedLine)) {
//                 line.sublines?.forEach(sub => uniqueSublines.set(sub.id, sub.subline_name));
//               }
//             });
//           }
//         });
//       });

//     const options = Array.from(uniqueSublines, ([id, name]) => ({ id, name }));
//     setSublineOptions(options);
//     if (selectedSubline && !options.find(o => String(o.id) === selectedSubline)) setSelectedSubline("");
//   }, [selectedLine, selectedDepartment, selectedFactory, selectedHQ, hierarchyData]);

//   // 7. Robust Station Loading
//   // This effectively says: "Load stations from the LOWEST selected parent"
//   useEffect(() => {
//     const uniqueStations = new Map<number, string>();

//     // Optimization: If no department selected, we likely don't want to show all stations (too many)
//     // But if you want to support Factory-level stations, remove this check.
//     if (!selectedFactory) {
//       setStationOptions([]);
//       return;
//     }

//     hierarchyData.forEach(struct => {
//         // 1. Match Factory
//         if(struct.factory !== parseInt(selectedFactory)) return;

//         struct.structure_data.departments.forEach(dept => {
//             // 2. Match Department (if selected)
//             if (selectedDepartment && dept.id !== parseInt(selectedDepartment)) return;

//             // CASE A: Department Selected, but NO Line Selected
//             // -> Load Stations directly attached to Department
//             if (!selectedLine) {
//                 dept.stations?.forEach(st => uniqueStations.set(st.id, st.station_name));
//                 return; // Don't go deeper
//             }

//             dept.lines?.forEach(line => {
//                 // 3. Match Line (if selected)
//                 if (selectedLine && line.id !== parseInt(selectedLine)) return;

//                 // CASE B: Line Selected, but NO Subline Selected
//                 // -> Load Stations directly attached to Line
//                 if (!selectedSubline) {
//                     line.stations?.forEach(st => uniqueStations.set(st.id, st.station_name));
//                     return; // Don't go deeper
//                 }

//                 // CASE C: Subline Selected
//                 // -> Load Stations attached to Subline
//                 line.sublines?.forEach(sub => {
//                     if (selectedSubline && sub.id !== parseInt(selectedSubline)) return;
//                     sub.stations?.forEach(st => uniqueStations.set(st.id, st.station_name));
//                 });
//             });
//         });
//     });

//     const options = Array.from(uniqueStations, ([id, name]) => ({ id, name }));
//     setStationOptions(options);

//     // Clear station selection if it's no longer in the available options
//     if (selectedStation && !options.find(o => String(o.id) === selectedStation)) {
//         setSelectedStation("");
//     }
//   }, [selectedSubline, selectedLine, selectedDepartment, selectedFactory, selectedHQ, hierarchyData]);


//   // --- FETCH CARD DATA ---
//   // useEffect(() => {
//   //   const fetchDashboardData = async () => {
//   //     if (!selectedFactory) {
//   //       setCardData(null);
//   //       return;
//   //     }

//   //     setIsCardDataLoading(true);
//   //     setCardDataError(null);

//   //     try {
//   //       const params = new URLSearchParams();
//   //       params.append('year', '2025'); 

//   //       if (selectedFactory) params.append("factory", selectedFactory);
//   //       if (selectedDepartment) params.append("department", selectedDepartment);
//   //       if (selectedLine) params.append("line", selectedLine);
//   //       if (selectedSubline) params.append("subline", selectedSubline);
//   //       if (selectedStation) params.append("station", selectedStation);

//   //       const url = `http://127.0.0.1:8000/chart/advance-card-stats/?${params.toString()}`;
        
//   //       const response = await fetch(url);
//   //       if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
//   //       const data = await response.json();
//   //       setCardData(data && data.length > 0 ? data[0] : null);
//   //     } catch (err) {
//   //       const message = err instanceof Error ? err.message : "An unknown error occurred";
//   //       setCardDataError(`Failed to fetch dashboard data: ${message}`);
//   //     } finally {
//   //       setIsCardDataLoading(false);
//   //     }
//   //   };

//   //   fetchDashboardData();
//   // }, [selectedFactory, selectedDepartment, selectedLine, selectedSubline, selectedStation]);


//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       // We need at least a Factory to fetch meaningful data
//       if (!selectedFactory) {
//         setCardData(null);
//         return;
//       }

//       setIsCardDataLoading(true);
//       setCardDataError(null);

//       try {
//         const params = new URLSearchParams();
        
//         // Pass Hierarchy Filters
//         // Ensure IDs are converted to strings safely
//         if (selectedHQ) params.append("hq", selectedHQ.toString());
//         if (selectedFactory) params.append("factory", selectedFactory.toString());
//         if (selectedDepartment) params.append("department", selectedDepartment.toString());
//         if (selectedLine) params.append("line", selectedLine.toString());
//         if (selectedSubline) params.append("subline", selectedSubline.toString());
//         if (selectedStation) params.append("station", selectedStation.toString());

//         // --- 1. USE THE SINGLE NEW URL ---
//         // This endpoint returns { total_stations, operators_required, operators_available, ... }
//         const url = `http://127.0.0.1:8000/chart/current-stats/?${params.toString()}`;

//         // --- 2. SINGLE FETCH ---
//         const response = await fetch(url);

//         if (!response.ok) throw new Error("Failed to fetch current stats");

//         const apiData = await response.json();

//         // --- 3. SET DATA DIRECTLY ---
//         // The API response matches your CardData interface structure.
//         setCardData({
//              ...apiData,
//              // If the new API doesn't return these specific fields yet, 
//              // you can provide defaults here to prevent UI errors:
//              attrition_rate: apiData.attrition_rate || "0",
//              absenteeism_rate: apiData.absenteeism_rate || "0"
//         });

//       } catch (err) {
//         const message = err instanceof Error ? err.message : "An unknown error occurred";
//         setCardDataError(`Failed to fetch dashboard data: ${message}`);
//       } finally {
//         setIsCardDataLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, [selectedHQ, selectedFactory, selectedDepartment, selectedLine, selectedSubline, selectedStation]);



//   // --- HELPERS ---
//   const getCardTitle = () => {
//     if (selectedStation) return "Station Stats";
//     if (selectedSubline) return "Subline Stats";
//     if (selectedLine) return "Line Stats";
//     if (selectedDepartment) return `Total ${stationType} Stations`;
//     return "Total Stations (Factory)";
//   };

//   const manpowerShortageActions = ["Buffer manpower planning", "Salary revision", "Special perks"];

//   const toNum = (val: string) => val ? parseInt(val) : null;

//   return (
//     <>
//       <div className="w-full min-h-screen p-2 sm:p-4 box-border pt-16 bg-gray-50">
//         <div className="w-full mx-auto flex flex-col px-2 sm:px-4">
          
//           {/* Header */}
//           <div className="bg-black mb-4 md:mb-6">
//             <h4 className="text-2xl md:text-3xl font-bold text-white py-5 text-center">
//               Advanced Manpower Planning Dashboard
//             </h4>
//           </div>

//           {/* Cascading Dropdowns - Full Width */}
//           <div className="w-full p-4 md:p-6 bg-white rounded-lg shadow-md mb-4 md:mb-6">
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">

//               {/* HQ */}
//               <div>
//                 <label className="block font-medium text-gray-700 mb-1">Select HQ</label>
//                 <select
//                   className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
//                   value={selectedHQ}
//                   onChange={(e) => setSelectedHQ(e.target.value)}
//                 >
//                   {hqOptions.map(hq => (
//                     <option key={hq.id} value={hq.id}>{hq.name}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Factory */}
//               <div>
//                 <label className="block font-medium text-gray-700 mb-1">Select Factory</label>
//                 <select
//                   className="w-full p-2 border border-gray-300 rounded-md"
//                   value={selectedFactory}
//                   onChange={(e) => setSelectedFactory(e.target.value)}
//                   disabled={!selectedHQ || factoryOptions.length === 0}
//                 >
//                   {factoryOptions.map(f => (
//                     <option key={f.id} value={f.id}>{f.name}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Department */}
//               <div>
//                 <label className="block font-medium text-gray-700 mb-1">Select Department</label>
//                 <select
//                   className="w-full p-2 border border-gray-300 rounded-md"
//                   value={selectedDepartment}
//                   onChange={(e) => setSelectedDepartment(e.target.value)}
//                   disabled={!selectedFactory || departmentOptions.length === 0}
//                 >
//                   <option value="">All Departments</option>
//                   {departmentOptions.map(d => (
//                     <option key={d.id} value={d.id}>{d.name}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Line - Dynamic Placeholder */}
//               <div>
//                 <label className="block font-medium text-gray-700 mb-1">Select Line</label>
//                 <select
//                   className={`w-full p-2 border border-gray-300 rounded-md ${(!selectedDepartment || lineOptions.length === 0) ? 'bg-gray-100 text-gray-500' : ''}`}
//                   value={selectedLine}
//                   onChange={(e) => setSelectedLine(e.target.value)}
//                   disabled={!selectedDepartment || lineOptions.length === 0}
//                 >
//                   <option value="">
//                     {selectedDepartment && lineOptions.length === 0 
//                       ? "No Lines Available" 
//                       : "All Lines"}
//                   </option>
//                   {lineOptions.map(l => (
//                     <option key={l.id} value={l.id}>{l.name}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Subline - Dynamic Placeholder */}
//               <div>
//                 <label className="block font-medium text-gray-700 mb-1">Select Subline</label>
//                 <select
//                   className={`w-full p-2 border border-gray-300 rounded-md ${(!selectedLine || sublineOptions.length === 0) ? 'bg-gray-100 text-gray-500' : ''}`}
//                   value={selectedSubline}
//                   onChange={(e) => setSelectedSubline(e.target.value)}
//                   disabled={!selectedLine || sublineOptions.length === 0}
//                 >
//                   <option value="">
//                     {selectedLine && sublineOptions.length === 0 
//                       ? "No Sublines Available" 
//                       : "All Sublines"}
//                   </option>
//                   {sublineOptions.map(s => (
//                     <option key={s.id} value={s.id}>{s.name}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Station - Enabled if any parent is selected and has stations */}
//               <div>
//                 <label className="block font-medium text-gray-700 mb-1">Select Station</label>
//                 <select
//                   className={`w-full p-2 border border-gray-300 rounded-md ${(!selectedDepartment) ? 'bg-gray-100 text-gray-500' : ''}`}
//                   value={selectedStation}
//                   onChange={(e) => setSelectedStation(e.target.value)}
//                   // Enable if Dept is selected. Specific content depends on logic above.
//                   disabled={!selectedDepartment || stationOptions.length === 0}
//                 >
//                   <option value="">
//                      {selectedDepartment && stationOptions.length === 0 
//                       ? "No Stations Available" 
//                       : "All Stations"}
//                   </option>
//                   {stationOptions.map(st => (
//                     <option key={st.id} value={st.id}>{st.name}</option>
//                   ))}
//                 </select>
//               </div>

//             </div>
//           </div>

//           {/* Card Props */}
//           <div className="w-full mb-4 md:mb-6">
//             <CardProps
//               data={cardData}
//               loading={isCardDataLoading}
//               error={cardDataError}
//               subtopics={[
//                 { dataKey: "total_stations", displayText: getCardTitle() },
//                 { dataKey: "operators_required", displayText: "Operators Required" },
//                 { dataKey: "operators_available", displayText: "Operators Available" },
//                 { dataKey: "buffer_manpower_required", displayText: "Buffer Manpower Required" },
//                 { dataKey: "buffer_manpower_available", displayText: "Buffer Manpower Available" },
//               ]}
//               cardColors={["#1f1f1f", "#0056b3", "#0056b3", "#1f1f1f", "#1f1f1f"]}
//             />
//           </div>

//           {/* Graphs and Sidebar */}
//           <div className="w-full flex flex-col gap-3 md:gap-4">
//             <div className="flex flex-col lg:flex-row w-full gap-3 md:gap-4">
              
//               {/* Graphs Section */}
//               <div className="w-full lg:w-[70%] xl:w-[85%] flex flex-col gap-3 md:gap-4">
//                 <div className="flex flex-col sm:flex-row w-full gap-3 md:gap-4">
//                     <ManpowerTrendChart 
//                       hqId={toNum(selectedHQ)}
//                       factoryId={toNum(selectedFactory)} 
//                       departmentId={toNum(selectedDepartment)}
//                       lineId={toNum(selectedLine)}
//                       sublineId={toNum(selectedSubline)}
//                       stationId={toNum(selectedStation)}
//                     />
//                     <AttritionTrendChart 
//                       hqId={toNum(selectedHQ)}
//                       factoryId={toNum(selectedFactory)} 
//                       departmentId={toNum(selectedDepartment)}
//                       lineId={toNum(selectedLine)}
//                       sublineId={toNum(selectedSubline)}
//                       stationId={toNum(selectedStation)}
//                     />
//                 </div>

//                 <div className="flex flex-col sm:flex-row w-full gap-3 md:gap-4">
//                     <BufferManpowerAvailability 
//                       hqId={toNum(selectedHQ)}
//                       factoryId={toNum(selectedFactory)} 
//                       departmentId={toNum(selectedDepartment)}
//                       lineId={toNum(selectedLine)}
//                       sublineId={toNum(selectedSubline)}
//                       stationId={toNum(selectedStation)}
//                     />
//                     <Absenteeism 
//                       hqId={toNum(selectedHQ)}
//                       factoryId={toNum(selectedFactory)} 
//                       departmentId={toNum(selectedDepartment)}
//                       lineId={toNum(selectedLine)}
//                       sublineId={toNum(selectedSubline)}
//                       stationId={toNum(selectedStation)}
//                     />
//                 </div>
//               </div>

//               {/* Sidebar - Operator Stats and Actions */}
//               <div className="w-full lg:w-[30%] xl:w-[25%] flex flex-col gap-3 md:gap-4">
//                   <OperatorStats 
//                     hqId={toNum(selectedHQ)}
//                     factoryId={toNum(selectedFactory)} 
//                     departmentId={toNum(selectedDepartment)}
//                     lineId={toNum(selectedLine)}
//                     sublineId={toNum(selectedSubline)}
//                     stationId={toNum(selectedStation)}
//                   />
//                   {/* <ManpowerActions 
//                     title="Actions Planned for Manpower Shortage" 
//                     data={manpowerShortageActions} 
//                   /> */}
//                   <MyTable/>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Advance;



import React, { useState, useEffect } from "react";
import CardProps from "./AdvanceCard/Cardprops";
import Absenteeism from "./Graphs/Absenteeism/absenteeism";
import AttritionTrendChart from "./Graphs/Attrition/attrition";
import BufferManpowerAvailability from "./Graphs/BufferManpowerAvailability/BufferManpower";
import OperatorStats from "./OperatorStats/OperatorStatsRedirect";
import ManpowerTrendChart from "./Graphs/Manpower/Manpower";
import ManpowerActions from "./ManpowerActions/ManpowerActions";
import MyTable from "./Graphs/ActionPlanned/mytable";

// ... (Keep all your existing interfaces) ...

interface SelectOption {
  id: number;
  name: string;
}

interface Station { id: number; station_name: string; }
interface Subline { id: number; subline_name: string; stations?: Station[]; }
interface Line { id: number; line_name: string; sublines?: Subline[]; stations?: Station[]; }
interface Department { id: number; department_name: string; lines?: Line[]; stations?: Station[]; }
interface StructureData { hq_name: string; factory_name: string; departments: Department[]; }
interface HierarchyNode {
  structure_id: number;
  structure_name: string;
  hq: number;
  hq_name: string;
  factory: number;
  factory_name: string;
  structure_data: StructureData;
}

interface CardData {
  id: number;
  month: number;
  year: number;
  total_stations: number;
  operators_required: number;
  operators_available: number;
  buffer_manpower_required: number;
  buffer_manpower_available: number;
  attrition_rate: string;
  absenteeism_rate: string;
}

// **NEW: Financial Year Options Generator**
const generateFinancialYearOptions = () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth(); // 0-11
  const currentYear = currentDate.getFullYear();
  
  // Determine current FY start year
  const currentFYStart = currentMonth < 3 ? currentYear - 1 : currentYear;
  
  const options = [];
  
  // Generate 5 years: 2 past, current, 2 future
  for (let i = -2; i <= 2; i++) {
    const fyStart = currentFYStart + i;
    const fyEnd = fyStart + 1;
    options.push({
      value: fyStart,
      label: `FY ${fyStart}-${fyEnd.toString().slice(-2)}` // e.g., "FY 2024-25"
    });
  }
  
  return options;
};

const Advance: React.FC = () => {
  // --- HIERARCHY STATE ---
  const [selectedHQ, setSelectedHQ] = useState<string>("");
  const [selectedFactory, setSelectedFactory] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedLine, setSelectedLine] = useState<string>("");
  const [selectedSubline, setSelectedSubline] = useState<string>("");
  const [selectedStation, setSelectedStation] = useState<string>("");

  // **NEW: Financial Year State**
  const [selectedFY, setSelectedFY] = useState<number>(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    return currentMonth < 3 ? now.getFullYear() - 1 : now.getFullYear();
  });

  const [fyOptions] = useState(generateFinancialYearOptions());

  // --- DATA & OPTIONS ---
  const [hierarchyData, setHierarchyData] = useState<HierarchyNode[]>([]);
  
  const [hqOptions, setHqOptions] = useState<SelectOption[]>([]);
  const [factoryOptions, setFactoryOptions] = useState<SelectOption[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<SelectOption[]>([]);
  const [lineOptions, setLineOptions] = useState<SelectOption[]>([]);
  const [sublineOptions, setSublineOptions] = useState<SelectOption[]>([]);
  const [stationOptions, setStationOptions] = useState<SelectOption[]>([]);

  // --- DASHBOARD DATA STATE ---
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [isCardDataLoading, setIsCardDataLoading] = useState<boolean>(false);
  const [cardDataError, setCardDataError] = useState<string | null>(null);
  const [stationType] = useState<string>("CTQ"); 

  // ... (Keep all your existing useEffect hooks for hierarchy) ...

  // 1. Fetch Hierarchy
  useEffect(() => {
    const fetchHierarchyData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/hierarchy-simple/");
        if (!response.ok) throw new Error("Failed to fetch hierarchy");
        const data: HierarchyNode[] = await response.json();
        setHierarchyData(data);
      } catch (error) {
        console.error("Failed to fetch hierarchy data:", error);
      }
    };
    fetchHierarchyData();
  }, []);

  // 2-7: Keep all your existing cascading dropdown logic...
  useEffect(() => {
    if (hierarchyData.length > 0) {
      const uniqueHQs = new Map<number, string>();
      hierarchyData.forEach(item => uniqueHQs.set(item.hq, item.hq_name));
      const options = Array.from(uniqueHQs, ([id, name]) => ({ id, name }));
      setHqOptions(options);
      if (!selectedHQ && options.length > 0) {
        setSelectedHQ(String(options[0].id));
      }
    }
  }, [hierarchyData]);

  useEffect(() => {
    if (!selectedHQ) {
      setFactoryOptions([]);
      return;
    }
    const uniqueFactories = new Map<number, string>();
    hierarchyData
      .filter(item => item.hq === parseInt(selectedHQ))
      .forEach(item => uniqueFactories.set(item.factory, item.factory_name));
    
    const options = Array.from(uniqueFactories, ([id, name]) => ({ id, name }));
    setFactoryOptions(options);

    if (options.length > 0) {
      if (!selectedFactory || !options.find(o => String(o.id) === selectedFactory)) {
        setSelectedFactory(String(options[0].id));
      }
    } else {
      setSelectedFactory("");
    }
  }, [selectedHQ, hierarchyData]);

  useEffect(() => {
    if (!selectedFactory) {
      setDepartmentOptions([]);
      return;
    }
    const uniqueDepts = new Map<number, string>();
    hierarchyData
      .filter(item => item.hq === parseInt(selectedHQ) && item.factory === parseInt(selectedFactory))
      .forEach(struct => {
        struct.structure_data.departments.forEach(d => uniqueDepts.set(d.id, d.department_name));
      });
    
    const options = Array.from(uniqueDepts, ([id, name]) => ({ id, name }));
    setDepartmentOptions(options);

    if (selectedDepartment && !options.find(o => String(o.id) === selectedDepartment)) {
      setSelectedDepartment("");
    }
  }, [selectedFactory, selectedHQ, hierarchyData]);

  useEffect(() => {
    if (!selectedDepartment) {
      setLineOptions([]);
      setSelectedLine("");
      return;
    }
    const uniqueLines = new Map<number, string>();
    hierarchyData
      .filter(item => item.hq === parseInt(selectedHQ) && item.factory === parseInt(selectedFactory))
      .forEach(struct => {
        struct.structure_data.departments
          .filter(d => d.id === parseInt(selectedDepartment))
          .forEach(dept => dept.lines?.forEach(l => uniqueLines.set(l.id, l.line_name)));
      });

    const options = Array.from(uniqueLines, ([id, name]) => ({ id, name }));
    setLineOptions(options);
    if (selectedLine && !options.find(o => String(o.id) === selectedLine)) setSelectedLine("");
  }, [selectedDepartment, selectedFactory, selectedHQ, hierarchyData]);

  useEffect(() => {
    if (!selectedLine) {
      setSublineOptions([]);
      setSelectedSubline("");
      return;
    }
    const uniqueSublines = new Map<number, string>();
    hierarchyData
      .filter(item => item.hq === parseInt(selectedHQ) && item.factory === parseInt(selectedFactory))
      .forEach(struct => {
        struct.structure_data.departments.forEach(dept => {
          if (dept.id === parseInt(selectedDepartment)) {
            dept.lines?.forEach(line => {
              if (line.id === parseInt(selectedLine)) {
                line.sublines?.forEach(sub => uniqueSublines.set(sub.id, sub.subline_name));
              }
            });
          }
        });
      });

    const options = Array.from(uniqueSublines, ([id, name]) => ({ id, name }));
    setSublineOptions(options);
    if (selectedSubline && !options.find(o => String(o.id) === selectedSubline)) setSelectedSubline("");
  }, [selectedLine, selectedDepartment, selectedFactory, selectedHQ, hierarchyData]);

  useEffect(() => {
    const uniqueStations = new Map<number, string>();

    if (!selectedFactory) {
      setStationOptions([]);
      return;
    }

    hierarchyData.forEach(struct => {
        if(struct.factory !== parseInt(selectedFactory)) return;

        struct.structure_data.departments.forEach(dept => {
            if (selectedDepartment && dept.id !== parseInt(selectedDepartment)) return;

            if (!selectedLine) {
                dept.stations?.forEach(st => uniqueStations.set(st.id, st.station_name));
                return;
            }

            dept.lines?.forEach(line => {
                if (selectedLine && line.id !== parseInt(selectedLine)) return;

                if (!selectedSubline) {
                    line.stations?.forEach(st => uniqueStations.set(st.id, st.station_name));
                    return;
                }

                line.sublines?.forEach(sub => {
                    if (selectedSubline && sub.id !== parseInt(selectedSubline)) return;
                    sub.stations?.forEach(st => uniqueStations.set(st.id, st.station_name));
                });
            });
        });
    });

    const options = Array.from(uniqueStations, ([id, name]) => ({ id, name }));
    setStationOptions(options);

    if (selectedStation && !options.find(o => String(o.id) === selectedStation)) {
        setSelectedStation("");
    }
  }, [selectedSubline, selectedLine, selectedDepartment, selectedFactory, selectedHQ, hierarchyData]);

  // **UPDATED: Fetch Card Data - Now includes selectedFY dependency**
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!selectedFactory) {
        setCardData(null);
        return;
      }

      setIsCardDataLoading(true);
      setCardDataError(null);

      try {
        const params = new URLSearchParams();
        
        // **Add FY Year Parameter**
        params.append("year", selectedFY.toString());
        
        if (selectedHQ) params.append("hq", selectedHQ.toString());
        if (selectedFactory) params.append("factory", selectedFactory.toString());
        if (selectedDepartment) params.append("department", selectedDepartment.toString());
        if (selectedLine) params.append("line", selectedLine.toString());
        if (selectedSubline) params.append("subline", selectedSubline.toString());
        if (selectedStation) params.append("station", selectedStation.toString());

        const url = `http://127.0.0.1:8000/chart/current-stats/?${params.toString()}`;
        const response = await fetch(url);

        if (!response.ok) throw new Error("Failed to fetch current stats");

        const apiData = await response.json();

        setCardData({
             ...apiData,
             attrition_rate: apiData.attrition_rate || "0",
             absenteeism_rate: apiData.absenteeism_rate || "0"
        });

      } catch (err) {
        const message = err instanceof Error ? err.message : "An unknown error occurred";
        setCardDataError(`Failed to fetch dashboard data: ${message}`);
      } finally {
        setIsCardDataLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedHQ, selectedFactory, selectedDepartment, selectedLine, selectedSubline, selectedStation, selectedFY]); // **Added selectedFY**

  // --- HELPERS ---
  const getCardTitle = () => {
    if (selectedStation) return "Station Stats";
    if (selectedSubline) return "Subline Stats";
    if (selectedLine) return "Line Stats";
    if (selectedDepartment) return `Total ${stationType} Stations`;
    return "Total Stations (Factory)";
  };

  const manpowerShortageActions = ["Buffer manpower planning", "Salary revision", "Special perks"];

  const toNum = (val: string) => val ? parseInt(val) : null;

  return (
    <>
      <div className="w-full min-h-screen p-2 sm:p-4 box-border pt-16 bg-gray-50">
        <div className="w-full mx-auto flex flex-col px-2 sm:px-4">
          
          {/* Header */}
          <div className="bg-black mb-4 md:mb-6">
            <h4 className="text-2xl md:text-3xl font-bold text-white py-5 text-center">
              Advanced Manpower Planning Dashboard
            </h4>
          </div>

       

          {/* Cascading Dropdowns - Full Width */}
          <div className="w-full p-4 md:p-6 bg-white rounded-lg shadow-md mb-4 md:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">

              {/* HQ */}
              <div>
                <label className="block font-medium text-gray-700 mb-1">Select HQ</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  value={selectedHQ}
                  onChange={(e) => setSelectedHQ(e.target.value)}
                >
                  {hqOptions.map(hq => (
                    <option key={hq.id} value={hq.id}>{hq.name}</option>
                  ))}
                </select>
              </div>

              {/* Factory */}
              <div>
                <label className="block font-medium text-gray-700 mb-1">Select Factory</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={selectedFactory}
                  onChange={(e) => setSelectedFactory(e.target.value)}
                  disabled={!selectedHQ || factoryOptions.length === 0}
                >
                  {factoryOptions.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block font-medium text-gray-700 mb-1">Select Department</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  disabled={!selectedFactory || departmentOptions.length === 0}
                >
                  <option value="">All Departments</option>
                  {departmentOptions.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Line */}
              <div>
                <label className="block font-medium text-gray-700 mb-1">Select Line</label>
                <select
                  className={`w-full p-2 border border-gray-300 rounded-md ${(!selectedDepartment || lineOptions.length === 0) ? 'bg-gray-100 text-gray-500' : ''}`}
                  value={selectedLine}
                  onChange={(e) => setSelectedLine(e.target.value)}
                  disabled={!selectedDepartment || lineOptions.length === 0}
                >
                  <option value="">
                    {selectedDepartment && lineOptions.length === 0 
                      ? "No Lines Available" 
                      : "All Lines"}
                  </option>
                  {lineOptions.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              {/* Subline */}
              <div>
                <label className="block font-medium text-gray-700 mb-1">Select Subline</label>
                <select
                  className={`w-full p-2 border border-gray-300 rounded-md ${(!selectedLine || sublineOptions.length === 0) ? 'bg-gray-100 text-gray-500' : ''}`}
                  value={selectedSubline}
                  onChange={(e) => setSelectedSubline(e.target.value)}
                  disabled={!selectedLine || sublineOptions.length === 0}
                >
                  <option value="">
                    {selectedLine && sublineOptions.length === 0 
                      ? "No Sublines Available" 
                      : "All Sublines"}
                  </option>
                  {sublineOptions.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Station */}
              <div>
                <label className="block font-medium text-gray-700 mb-1">Select Station</label>
                <select
                  className={`w-full p-2 border border-gray-300 rounded-md ${(!selectedDepartment) ? 'bg-gray-100 text-gray-500' : ''}`}
                  value={selectedStation}
                  onChange={(e) => setSelectedStation(e.target.value)}
                  disabled={!selectedDepartment || stationOptions.length === 0}
                >
                  <option value="">
                     {selectedDepartment && stationOptions.length === 0 
                      ? "No Stations Available" 
                      : "All Stations"}
                  </option>
                  {stationOptions.map(st => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
              </div>

                 <div className="mb-4 pb-4 border-b border-gray-200">
              <label className="block font-medium text-gray-700 mb-2 text-base">
                Select Financial Year
              </label>
            <select
                className="px-4 py-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium text-gray-700 shadow-sm"
                value={selectedFY}
                onChange={(e) => setSelectedFY(parseInt(e.target.value))}
              >
                {fyOptions.map(fy => (
                  <option key={fy.value} value={fy.value}>
                    {fy.label}
                  </option>
                ))}
              </select>
            </div>

            </div>
          </div>

          {/* Card Props */}
          <div className="w-full mb-4 md:mb-6">
            <CardProps
              data={cardData}
              loading={isCardDataLoading}
              error={cardDataError}
              subtopics={[
                { dataKey: "total_stations", displayText: getCardTitle() },
                { dataKey: "operators_required", displayText: "Operators Required" },
                { dataKey: "operators_available", displayText: "Operators Available" },
                { dataKey: "buffer_manpower_required", displayText: "Buff Manpower Required" },
                { dataKey: "buffer_manpower_available", displayText: "Buff Manpower Available" },
              ]}
              cardColors={["#1f1f1f", "#0056b3", "#0056b3", "#1f1f1f", "#1f1f1f"]}
            />
          </div>

          {/* **UPDATED: Graphs - Now pass selectedYear prop** */}
          <div className="w-full flex flex-col gap-3 md:gap-4">
            <div className="flex flex-col lg:flex-row w-full gap-3 md:gap-4">
              
              <div className="w-full lg:w-[70%] xl:w-[85%] flex flex-col gap-3 md:gap-4">
                <div className="flex flex-col sm:flex-row w-full gap-3 md:gap-4">
                    <ManpowerTrendChart 
                      hqId={toNum(selectedHQ)}
                      factoryId={toNum(selectedFactory)} 
                      departmentId={toNum(selectedDepartment)}
                      lineId={toNum(selectedLine)}
                      sublineId={toNum(selectedSubline)}
                      stationId={toNum(selectedStation)}
                      selectedYear={selectedFY}
                    />
                    <AttritionTrendChart 
                      hqId={toNum(selectedHQ)}
                      factoryId={toNum(selectedFactory)} 
                      departmentId={toNum(selectedDepartment)}
                      lineId={toNum(selectedLine)}
                      sublineId={toNum(selectedSubline)}
                      stationId={toNum(selectedStation)}
                      selectedYear={selectedFY}
                    />
                </div>

                <div className="flex flex-col sm:flex-row w-full gap-3 md:gap-4">
                    <BufferManpowerAvailability 
                      hqId={toNum(selectedHQ)}
                      factoryId={toNum(selectedFactory)} 
                      departmentId={toNum(selectedDepartment)}
                      lineId={toNum(selectedLine)}
                      sublineId={toNum(selectedSubline)}
                      stationId={toNum(selectedStation)}
                      selectedYear={selectedFY}
                    />
                    <Absenteeism 
                      hqId={toNum(selectedHQ)}
                      factoryId={toNum(selectedFactory)} 
                      departmentId={toNum(selectedDepartment)}
                      lineId={toNum(selectedLine)}
                      sublineId={toNum(selectedSubline)}
                      stationId={toNum(selectedStation)}
                      selectedYear={selectedFY}
                    />
                </div>
              </div>

              <div className="w-full lg:w-[30%] xl:w-[25%] flex flex-col gap-3 md:gap-4">
                  <OperatorStats 
                    hqId={toNum(selectedHQ)}
                    factoryId={toNum(selectedFactory)} 
                    departmentId={toNum(selectedDepartment)}
                    lineId={toNum(selectedLine)}
                    sublineId={toNum(selectedSubline)}
                    stationId={toNum(selectedStation)}
                  />
                  <MyTable/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Advance;