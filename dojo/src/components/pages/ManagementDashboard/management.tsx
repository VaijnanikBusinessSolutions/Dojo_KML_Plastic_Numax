// import React, { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import TrainingSummaryCard from "./Card/Cardprops";
// import Training from "./Graphs/OprTraining-JoinedvsTrained/train";
// import Plan from "./Graphs/NoOftrainingPlanvsActual/plan";
// import Defects from "./Graphs/ManRelatedDefectsTrend/defects";
// import DefectsRejected from "./Graphs/ManRelatedDefectsInternal/defectsRejected";
// import MyTable from "./Graphs/ActionPlanned/mytable";
// import MonthPlanning from "./Graphs/Manpoweravailability/ManPlanning";

// // --- Types ---
// interface SelectOption {
//   id: number;
//   name: string;
// }

// interface Station {
//   id: number;
//   station_name: string;
// }

// interface Subline {
//   id: number;
//   subline_name: string;
//   stations?: Station[];
// }

// interface Line {
//   id: number;
//   line_name: string;
//   sublines?: Subline[];
//   stations?: Station[];
// }

// interface Department {
//   id: number;
//   department_name: string;
//   lines?: Line[];
//   stations?: Station[];
// }

// interface StructureData {
//   hq_name: string;
//   factory_name: string;
//   departments: Department[];
// }

// interface HierarchyNode {
//   structure_id: number;
//   structure_name: string;
//   hq: number;
//   hq_name: string;
//   factory: number;
//   factory_name: string;
//   structure_data: StructureData;
// }

// const Management: React.FC = () => {
//   const location = useLocation();

//   // Selected values
//   const [selectedHQ, setSelectedHQ] = useState<string>("");
//   const [selectedFactory, setSelectedFactory] = useState<string>("");
//   const [selectedDepartment, setSelectedDepartment] = useState<string>("");
//   const [selectedLine, setSelectedLine] = useState<string>("");
//   const [selectedSubline, setSelectedSubline] = useState<string>("");
//   const [selectedStation, setSelectedStation] = useState<string>("");

//   // Full hierarchy data
//   const [hierarchyData, setHierarchyData] = useState<HierarchyNode[]>([]);

//   // Dropdown options
//   const [hqOptions, setHqOptions] = useState<SelectOption[]>([]);
//   const [factoryOptions, setFactoryOptions] = useState<SelectOption[]>([]);
//   const [departmentOptions, setDepartmentOptions] = useState<SelectOption[]>([]);
//   const [lineOptions, setLineOptions] = useState<SelectOption[]>([]);
//   const [sublineOptions, setSublineOptions] = useState<SelectOption[]>([]);
//   const [stationOptions, setStationOptions] = useState<SelectOption[]>([]);

//   // 1. Fetch hierarchy data
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

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, [location]);

//   // --- CASCADING EFFECTS ---

//   // 2. Data Loaded -> Set HQ Options & Auto-select First
//   useEffect(() => {
//     if (hierarchyData.length > 0) {
//       const uniqueHQs = new Map<number, string>();
//       hierarchyData.forEach((item) => uniqueHQs.set(item.hq, item.hq_name));
//       const options = Array.from(uniqueHQs, ([id, name]) => ({ id, name }));
//       setHqOptions(options);

//       if (!selectedHQ && options.length > 0) {
//         setSelectedHQ(String(options[0].id));
//       }
//     }
//   }, [hierarchyData]);

//   // 3. HQ Selected -> Set Factory Options & Auto-select First
//   useEffect(() => {
//     if (!selectedHQ) {
//       setFactoryOptions([]);
//       return;
//     }

//     const uniqueFactories = new Map<number, string>();
//     hierarchyData
//       .filter((item) => item.hq === parseInt(selectedHQ))
//       .forEach((item) => uniqueFactories.set(item.factory, item.factory_name));

//     const options = Array.from(uniqueFactories, ([id, name]) => ({ id, name }));
//     setFactoryOptions(options);

//     if (options.length > 0) {
//       const currentIsValid = options.find(o => String(o.id) === selectedFactory);
//       if (!currentIsValid) {
//         setSelectedFactory(String(options[0].id));
//       }
//     } else {
//       setSelectedFactory("");
//     }
//   }, [selectedHQ, hierarchyData]);

//   // 4. Factory Selected -> Set Department Options
//   useEffect(() => {
//     if (!selectedFactory) {
//       setDepartmentOptions([]);
//       return;
//     }

//     const relevant = hierarchyData.filter(
//       (item) =>
//         item.hq === parseInt(selectedHQ) &&
//         item.factory === parseInt(selectedFactory)
//     );

//     const uniqueDepts = new Map<number, string>();
//     relevant.forEach((struct) => {
//       struct.structure_data.departments.forEach((dept) => {
//         uniqueDepts.set(dept.id, dept.department_name);
//       });
//     });

//     const options = Array.from(uniqueDepts, ([id, name]) => ({ id, name }));
//     setDepartmentOptions(options);

//     if (selectedDepartment && !options.find(o => String(o.id) === selectedDepartment)) {
//       setSelectedDepartment("");
//     }
//   }, [selectedFactory, selectedHQ, hierarchyData]);

//   // 5. Department Selected -> Set Line Options
//   useEffect(() => {
//     if (!selectedDepartment || !selectedFactory || !selectedHQ) {
//       setLineOptions([]);
//       setSelectedLine("");
//       return;
//     }

//     const relevant = hierarchyData.filter(
//       (item) =>
//         item.hq === parseInt(selectedHQ) &&
//         item.factory === parseInt(selectedFactory)
//     );

//     const uniqueLines = new Map<number, string>();
//     relevant.forEach((struct) => {
//       struct.structure_data.departments
//         .filter((d) => d.id === parseInt(selectedDepartment))
//         .forEach((dept) => {
//           dept.lines?.forEach((line) => {
//             uniqueLines.set(line.id, line.line_name);
//           });
//         });
//     });

//     const options = Array.from(uniqueLines, ([id, name]) => ({ id, name }));
//     setLineOptions(options);

//     if (selectedLine && !options.find(o => String(o.id) === selectedLine)) {
//       setSelectedLine("");
//     }
//   }, [selectedDepartment, selectedFactory, selectedHQ, hierarchyData]);

//   // 6. Line Selected -> Set Subline Options
//   useEffect(() => {
//     if (!selectedLine) {
//       setSublineOptions([]);
//       setSelectedSubline("");
//       return;
//     }

//     const relevant = hierarchyData.filter(
//       (item) =>
//         item.hq === parseInt(selectedHQ) &&
//         item.factory === parseInt(selectedFactory)
//     );

//     const uniqueSublines = new Map<number, string>();
//     relevant.forEach((struct) => {
//       struct.structure_data.departments.forEach((dept) => {
//         if (dept.id === parseInt(selectedDepartment)) {
//           dept.lines?.forEach((line) => {
//             if (line.id === parseInt(selectedLine)) {
//               line.sublines?.forEach((sub) => {
//                 uniqueSublines.set(sub.id, sub.subline_name);
//               });
//             }
//           });
//         }
//       });
//     });

//     const options = Array.from(uniqueSublines, ([id, name]) => ({ id, name }));
//     setSublineOptions(options);

//     if (selectedSubline && !options.find(o => String(o.id) === selectedSubline)) {
//       setSelectedSubline("");
//     }
//   }, [selectedLine, selectedDepartment, selectedFactory, selectedHQ, hierarchyData]);

//   // 7. Robust Station Loading
//   useEffect(() => {
//     const uniqueStations = new Map<number, string>();

//     if (!selectedFactory) {
//       setStationOptions([]);
//       return;
//     }

//     hierarchyData.forEach(struct => {
//       if (struct.factory !== parseInt(selectedFactory)) return;

//       struct.structure_data.departments.forEach(dept => {
//         if (selectedDepartment && dept.id !== parseInt(selectedDepartment)) return;

//         if (!selectedLine) {
//           dept.stations?.forEach(st => uniqueStations.set(st.id, st.station_name));
//           return;
//         }

//         dept.lines?.forEach(line => {
//           if (selectedLine && line.id !== parseInt(selectedLine)) return;

//           if (!selectedSubline) {
//             line.stations?.forEach(st => uniqueStations.set(st.id, st.station_name));
//             return;
//           }

//           line.sublines?.forEach(sub => {
//             if (selectedSubline && sub.id !== parseInt(selectedSubline)) return;
//             sub.stations?.forEach(st => uniqueStations.set(st.id, st.station_name));
//           });
//         });
//       });
//     });

//     const options = Array.from(uniqueStations, ([id, name]) => ({ id, name }));
//     setStationOptions(options);

//     if (selectedStation && !options.find(o => String(o.id) === selectedStation)) {
//       setSelectedStation("");
//     }
//   }, [selectedSubline, selectedLine, selectedDepartment, selectedFactory, selectedHQ, hierarchyData]);


//   return (
//     <>
//       <div className="w-full min-h-screen p-2 sm:p-4 box-border pt-16 bg-gray-50">
//         <div className="w-full mx-auto flex flex-col px-2 sm:px-4">

//           {/* Header */}
//           <div className="bg-black mb-4 md:mb-6">
//             <h4 className="text-2xl md:text-3xl font-bold text-white py-5 text-center">
//               Management Review Dashboard
//             </h4>
//           </div>

//           {/* Cascading Dropdowns */}
//           <div className="w-full p-4 md:p-6 bg-white rounded-lg shadow-md mb-4 md:mb-6">
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">

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

//               <div>
//                 <label className="block font-medium text-gray-700 mb-1">Select Factory</label>
//                 <select
//                   className="w-full p-2 border border-gray-300 rounded-md"
//                   value={selectedFactory}
//                   onChange={(e) => setSelectedFactory(e.target.value)}
//                   disabled={!selectedHQ}
//                 >
//                   {factoryOptions.map(f => (
//                     <option key={f.id} value={f.id}>{f.name}</option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block font-medium text-gray-700 mb-1">Select Department</label>
//                 <select
//                   className="w-full p-2 border border-gray-300 rounded-md"
//                   value={selectedDepartment}
//                   onChange={(e) => setSelectedDepartment(e.target.value)}
//                   disabled={!selectedFactory}
//                 >
//                   <option value="">All Departments</option>
//                   {departmentOptions.map(d => (
//                     <option key={d.id} value={d.id}>{d.name}</option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block font-medium text-gray-700 mb-1">Select Line</label>
//                 <select
//                   className={`w-full p-2 border border-gray-300 rounded-md ${(!selectedDepartment || lineOptions.length === 0) ? 'bg-gray-100 text-gray-500' : ''}`}
//                   value={selectedLine}
//                   onChange={(e) => setSelectedLine(e.target.value)}
//                   disabled={!selectedDepartment || lineOptions.length === 0}
//                 >
//                   <option value="">
//                     {selectedDepartment && lineOptions.length === 0 ? "No Lines Available" : "All Lines"}
//                   </option>
//                   {lineOptions.map(l => (
//                     <option key={l.id} value={l.id}>{l.name}</option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block font-medium text-gray-700 mb-1">Select Subline</label>
//                 <select
//                   className={`w-full p-2 border border-gray-300 rounded-md ${(!selectedLine || sublineOptions.length === 0) ? 'bg-gray-100 text-gray-500' : ''}`}
//                   value={selectedSubline}
//                   onChange={(e) => setSelectedSubline(e.target.value)}
//                   disabled={!selectedLine || sublineOptions.length === 0}
//                 >
//                   <option value="">
//                     {selectedLine && sublineOptions.length === 0 ? "No Sublines Available" : "All Sublines"}
//                   </option>
//                   {sublineOptions.map(s => (
//                     <option key={s.id} value={s.id}>{s.name}</option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block font-medium text-gray-700 mb-1">Select Station</label>
//                 <select
//                   className={`w-full p-2 border border-gray-300 rounded-md ${(!selectedDepartment) ? 'bg-gray-100 text-gray-500' : ''}`}
//                   value={selectedStation}
//                   onChange={(e) => setSelectedStation(e.target.value)}
//                   disabled={!selectedDepartment || stationOptions.length === 0}
//                 >
//                   <option value="">
//                     {selectedDepartment && stationOptions.length === 0 ? "No Stations Available" : "All Stations"}
//                   </option>
//                   {stationOptions.map(st => (
//                     <option key={st.id} value={st.id}>{st.name}</option>
//                   ))}
//                 </select>
//               </div>

//             </div>
//           </div>

//           {/* Graphs and Summary Cards */}
//           <div className="w-full flex flex-col gap-3 md:gap-4">
//             <div className="flex flex-col lg:flex-row w-full gap-3 md:gap-4">

//               {/* Graphs Section */}
//               <div className="w-full lg:w-[70%] xl:w-[75%] flex flex-col gap-3 md:gap-4">
                
//                 {/* Row 1: Training & Plan */}
//                 <div className="flex flex-col sm:flex-row w-full gap-3 md:gap-4">
//                   <div className="flex-1 min-w-0 h-100 sm:h-[260px] shadow-lg rounded-lg overflow-hidden bg-white p-1">
//                     <Training
//                       hqId={selectedHQ}
//                       factoryId={selectedFactory}
//                       departmentId={selectedDepartment}
//                       lineId={selectedLine}
//                       sublineId={selectedSubline}
//                       stationId={selectedStation}
//                     />
//                   </div>
//                   <div className="flex-1 min-w-0 h-100 sm:h-[260px] shadow-lg rounded-lg overflow-hidden bg-white p-1">
//                     <Plan
//                       hqId={selectedHQ}
//                       factoryId={selectedFactory}
//                       departmentId={selectedDepartment}
//                       lineId={selectedLine}
//                       sublineId={selectedSubline}
//                       stationId={selectedStation}
//                     />
//                   </div>
//                 </div>

//                 {/* Row 2: Defects & DefectsRejected */}
//                 <div className="flex flex-col sm:flex-row w-full gap-3 md:gap-4">
//                   <div className="flex-1 min-w-0 h-60 sm:h-[260px] shadow-lg rounded-lg overflow-hidden bg-white p-1">
//                     <Defects
//                       hqId={selectedHQ}
//                       factoryId={selectedFactory}
//                       departmentId={selectedDepartment}
//                       lineId={selectedLine}
//                       sublineId={selectedSubline}
//                       stationId={selectedStation}
//                     />
//                   </div>
//                   <div className="flex-1 min-w-0 h-60 sm:h-[260px] shadow-lg rounded-lg overflow-hidden bg-white p-1">
//                     <DefectsRejected
//                       hqId={selectedHQ}
//                       factoryId={selectedFactory}
//                       departmentId={selectedDepartment}
//                       lineId={selectedLine}
//                       sublineId={selectedSubline}
//                       stationId={selectedStation}
//                     />
//                   </div>
//                 </div>

//                 {/* Row 3: MonthPlanning & MyTable (Aligned side-by-side) */}
//                 <div className="flex flex-col sm:flex-row w-full gap-3 md:gap-4">
//                   <div className="flex-1 min-w-0 h-60 sm:h-[260px] shadow-lg rounded-lg overflow-hidden bg-white p-1">
//                     <MonthPlanning
//                       hqId={selectedHQ}
//                       factoryId={selectedFactory}
//                       departmentId={selectedDepartment}
//                       lineId={selectedLine}
//                       sublineId={selectedSubline}
//                       stationId={selectedStation}
//                     />
//                   </div>
//                   <div  className="flex-1 min-w-0 h-60 sm:h-[260px] shadow-lg rounded-lg overflow-hidden bg-white p-1" style={{ overflowY: "auto" }}
// >
//                     <MyTable />
//                   </div>
//                 </div>
//               </div>

//               {/* Summary Cards */}
//               <div className="w-full lg:w-[30%] xl:w-[25%] flex flex-col gap-3 md:gap-12">
//                 <TrainingSummaryCard
//                   title="Training Summary"
//                   getUrl="http://127.0.0.1:8000/current-month/training-data/"
//                   hqId={selectedHQ}
//                   factoryId={selectedFactory}
//                   departmentId={selectedDepartment}
//                   lineId={selectedLine}
//                   sublineId={selectedSubline}
//                   stationId={selectedStation}
//                   cardColors={["#3498db", "#3498db", "#8e44ad", "#8e44ad"]}
//                   subtopics={[
//                     { dataKey: "new_operators_joined", displayText: "New Operators Joined" },
//                     { dataKey: "new_operators_trained", displayText: "New Opr. Trained" },
//                     { dataKey: "total_training_plans", displayText: "Total Trainings Plan" },
//                     { dataKey: "total_trainings_actual", displayText: "Total Trainings Act" }
//                   ]}
//                 />

//                 <TrainingSummaryCard
//                   title="Man Related Defects"
//                   getUrl="http://127.0.0.1:8000/current-month/defects-data/"
//                   hqId={selectedHQ}
//                   factoryId={selectedFactory}
//                   departmentId={selectedDepartment}
//                   lineId={selectedLine}
//                   sublineId={selectedSubline}
//                   stationId={selectedStation}
//                   cardColors={["#143555", "#143555", "#6c6714", "#6c6714", "#5d255d", "#5d255d"]}
//                   subtopics={[
//                     { dataKey: "total_defects_msil", displayText: "Total Defects at MSIL" },
//                     { dataKey: "ctq_defects_msil", displayText: "CTQ Defects at MSIL" },
//                     { dataKey: "total_defects_tier1", displayText: "Total Defects at Tier-1" },
//                     { dataKey: "ctq_defects_tier1", displayText: "CTQ Defects at Tier-1" },
//                     { dataKey: "total_internal_rejection", displayText: "Total Internal Rejection" },
//                     { dataKey: "ctq_internal_rejection", displayText: "CTQ Internal Rejection" }
//                   ]}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Management;


import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import TrainingSummaryCard from "./Card/Cardprops";
import Training from "./Graphs/OprTraining-JoinedvsTrained/train";
import Plan from "./Graphs/NoOftrainingPlanvsActual/plan";
import Defects from "./Graphs/ManRelatedDefectsTrend/defects";
import DefectsRejected from "./Graphs/ManRelatedDefectsInternal/defectsRejected";
import MyTable from "./Graphs/ActionPlanned/mytable";
import MonthPlanning from "./Graphs/Manpoweravailability/ManPlanning";

// --- Types ---
interface SelectOption {
  id: number;
  name: string;
}

interface Station {
  id: number;
  station_name: string;
}

interface Subline {
  id: number;
  subline_name: string;
  stations?: Station[];
}

interface Line {
  id: number;
  line_name: string;
  sublines?: Subline[];
  stations?: Station[];
}

interface Department {
  id: number;
  department_name: string;
  lines?: Line[];
  stations?: Station[];
}

interface StructureData {
  hq_name: string;
  factory_name: string;
  departments: Department[];
}

interface HierarchyNode {
  structure_id: number;
  structure_name: string;
  hq: number;
  hq_name: string;
  factory: number;
  factory_name: string;
  structure_data: StructureData;
}

interface FinancialYear {
  value: string;
  label: string;
}

const Management: React.FC = () => {
  const location = useLocation();

  // Selected values
  const [selectedHQ, setSelectedHQ] = useState<string>("");
  const [selectedFactory, setSelectedFactory] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedLine, setSelectedLine] = useState<string>("");
  const [selectedSubline, setSelectedSubline] = useState<string>("");
  const [selectedStation, setSelectedStation] = useState<string>("");
  const [selectedFinancialYear, setSelectedFinancialYear] = useState<string>("");

  // Full hierarchy data
  const [hierarchyData, setHierarchyData] = useState<HierarchyNode[]>([]);

  // Dropdown options
  const [hqOptions, setHqOptions] = useState<SelectOption[]>([]);
  const [factoryOptions, setFactoryOptions] = useState<SelectOption[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<SelectOption[]>([]);
  const [lineOptions, setLineOptions] = useState<SelectOption[]>([]);
  const [sublineOptions, setSublineOptions] = useState<SelectOption[]>([]);
  const [stationOptions, setStationOptions] = useState<SelectOption[]>([]);
  const [financialYearOptions, setFinancialYearOptions] = useState<FinancialYear[]>([]);

  // Generate Financial Year Options
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // 1-12
    
    // Determine current financial year start
    const currentFYStart = currentMonth >= 4 ? currentYear : currentYear - 1;
    
    // Generate options for past 5 years and future 2 years
    const fyOptions: FinancialYear[] = [];
    for (let i = -2; i <= 1; i++) {
      const fyStart = currentFYStart + i;
      const fyEnd = fyStart + 1;
      fyOptions.push({
        value: fyStart.toString(),
        label: ` FY ${fyStart}- ${fyEnd}`
      });
    }
    
    setFinancialYearOptions(fyOptions);
    
    // Set current financial year as default
    setSelectedFinancialYear(currentFYStart.toString());
  }, []);

  // 1. Fetch hierarchy data
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // --- CASCADING EFFECTS ---
  // 2. Data Loaded -> Set HQ Options & Auto-select First
  useEffect(() => {
    if (hierarchyData.length > 0) {
      const uniqueHQs = new Map<number, string>();
      hierarchyData.forEach((item) => uniqueHQs.set(item.hq, item.hq_name));
      const options = Array.from(uniqueHQs, ([id, name]) => ({ id, name }));
      setHqOptions(options);
      if (!selectedHQ && options.length > 0) {
        setSelectedHQ(String(options[0].id));
      }
    }
  }, [hierarchyData]);

  // 3. HQ Selected -> Set Factory Options & Auto-select First
  useEffect(() => {
    if (!selectedHQ) {
      setFactoryOptions([]);
      return;
    }
    const uniqueFactories = new Map<number, string>();
    hierarchyData
      .filter((item) => item.hq === parseInt(selectedHQ))
      .forEach((item) => uniqueFactories.set(item.factory, item.factory_name));
    const options = Array.from(uniqueFactories, ([id, name]) => ({ id, name }));
    setFactoryOptions(options);
    if (options.length > 0) {
      const currentIsValid = options.find(o => String(o.id) === selectedFactory);
      if (!currentIsValid) {
        setSelectedFactory(String(options[0].id));
      }
    } else {
      setSelectedFactory("");
    }
  }, [selectedHQ, hierarchyData]);

  // 4. Factory Selected -> Set Department Options
  useEffect(() => {
    if (!selectedFactory) {
      setDepartmentOptions([]);
      return;
    }
    const relevant = hierarchyData.filter(
      (item) =>
        item.hq === parseInt(selectedHQ) &&
        item.factory === parseInt(selectedFactory)
    );
    const uniqueDepts = new Map<number, string>();
    relevant.forEach((struct) => {
      struct.structure_data.departments.forEach((dept) => {
        uniqueDepts.set(dept.id, dept.department_name);
      });
    });
    const options = Array.from(uniqueDepts, ([id, name]) => ({ id, name }));
    setDepartmentOptions(options);
    if (selectedDepartment && !options.find(o => String(o.id) === selectedDepartment)) {
      setSelectedDepartment("");
    }
  }, [selectedFactory, selectedHQ, hierarchyData]);

  // 5. Department Selected -> Set Line Options
  useEffect(() => {
    if (!selectedDepartment || !selectedFactory || !selectedHQ) {
      setLineOptions([]);
      setSelectedLine("");
      return;
    }
    const relevant = hierarchyData.filter(
      (item) =>
        item.hq === parseInt(selectedHQ) &&
        item.factory === parseInt(selectedFactory)
    );
    const uniqueLines = new Map<number, string>();
    relevant.forEach((struct) => {
      struct.structure_data.departments
        .filter((d) => d.id === parseInt(selectedDepartment))
        .forEach((dept) => {
          dept.lines?.forEach((line) => {
            uniqueLines.set(line.id, line.line_name);
          });
        });
    });
    const options = Array.from(uniqueLines, ([id, name]) => ({ id, name }));
    setLineOptions(options);
    if (selectedLine && !options.find(o => String(o.id) === selectedLine)) {
      setSelectedLine("");
    }
  }, [selectedDepartment, selectedFactory, selectedHQ, hierarchyData]);

  // 6. Line Selected -> Set Subline Options
  useEffect(() => {
    if (!selectedLine) {
      setSublineOptions([]);
      setSelectedSubline("");
      return;
    }
    const relevant = hierarchyData.filter(
      (item) =>
        item.hq === parseInt(selectedHQ) &&
        item.factory === parseInt(selectedFactory)
    );
    const uniqueSublines = new Map<number, string>();
    relevant.forEach((struct) => {
      struct.structure_data.departments.forEach((dept) => {
        if (dept.id === parseInt(selectedDepartment)) {
          dept.lines?.forEach((line) => {
            if (line.id === parseInt(selectedLine)) {
              line.sublines?.forEach((sub) => {
                uniqueSublines.set(sub.id, sub.subline_name);
              });
            }
          });
        }
      });
    });
    const options = Array.from(uniqueSublines, ([id, name]) => ({ id, name }));
    setSublineOptions(options);
    if (selectedSubline && !options.find(o => String(o.id) === selectedSubline)) {
      setSelectedSubline("");
    }
  }, [selectedLine, selectedDepartment, selectedFactory, selectedHQ, hierarchyData]);

  // 7. Robust Station Loading
  useEffect(() => {
    const uniqueStations = new Map<number, string>();
    if (!selectedFactory) {
      setStationOptions([]);
      return;
    }
    hierarchyData.forEach(struct => {
      if (struct.factory !== parseInt(selectedFactory)) return;
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

  return (
    <>
      <div className="w-full min-h-screen p-2 sm:p-4 box-border pt-16 bg-gray-50">
        <div className="w-full mx-auto flex flex-col px-2 sm:px-4">
          {/* Header */}
          <div className="bg-black mb-4 md:mb-6">
            <h4 className="text-2xl md:text-3xl font-bold text-white py-5 text-center">
              Management Review Dashboard
            </h4>
          </div>

          {/* Cascading Dropdowns */}
          <div className="w-full p-4 md:p-6 bg-white rounded-lg shadow-md mb-4 md:mb-6">
            {/* Financial Year Selection - Full Width Row */}
          

            {/* Hierarchy Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
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
              <div>
                <label className="block font-medium text-gray-700 mb-1">Select Factory</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={selectedFactory}
                  onChange={(e) => setSelectedFactory(e.target.value)}
                  disabled={!selectedHQ}
                >
                  {factoryOptions.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Select Department</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  disabled={!selectedFactory}
                >
                  <option value="">All Departments</option>
                  {departmentOptions.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Select Line</label>
                <select
                  className={`w-full p-2 border border-gray-300 rounded-md ${(!selectedDepartment || lineOptions.length === 0) ? 'bg-gray-100 text-gray-500' : ''}`}
                  value={selectedLine}
                  onChange={(e) => setSelectedLine(e.target.value)}
                  disabled={!selectedDepartment || lineOptions.length === 0}
                >
                  <option value="">
                    {selectedDepartment && lineOptions.length === 0 ? "No Lines Available" : "All Lines"}
                  </option>
                  {lineOptions.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Select Subline</label>
                <select
                  className={`w-full p-2 border border-gray-300 rounded-md ${(!selectedLine || sublineOptions.length === 0) ? 'bg-gray-100 text-gray-500' : ''}`}
                  value={selectedSubline}
                  onChange={(e) => setSelectedSubline(e.target.value)}
                  disabled={!selectedLine || sublineOptions.length === 0}
                >
                  <option value="">
                    {selectedLine && sublineOptions.length === 0 ? "No Sublines Available" : "All Sublines"}
                  </option>
                  {sublineOptions.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Select Station</label>
                <select
                  className={`w-full p-2 border border-gray-300 rounded-md ${(!selectedDepartment) ? 'bg-gray-100 text-gray-500' : ''}`}
                  value={selectedStation}
                  onChange={(e) => setSelectedStation(e.target.value)}
                  disabled={!selectedDepartment || stationOptions.length === 0}
                >
                  <option value="">
                    {selectedDepartment && stationOptions.length === 0 ? "No Stations Available" : "All Stations"}
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
                className="w-full sm:w-auto  p-2 border border-blue-400 rounded-md focus:ring-2 focus:ring-blue-500 text-base font-medium bg-blue-50"
                value={selectedFinancialYear}
                onChange={(e) => setSelectedFinancialYear(e.target.value)}
              >
                {financialYearOptions.map(fy => (
                  <option key={fy.value} value={fy.value}>{fy.label}</option>
                ))}
              </select>
            </div>
            </div>
          </div>

          {/* Graphs and Summary Cards */}
          <div className="w-full flex flex-col gap-3 md:gap-4">
            <div className="flex flex-col lg:flex-row w-full gap-3 md:gap-4">
              {/* Graphs Section */}
              <div className="w-full lg:w-[70%] xl:w-[75%] flex flex-col gap-3 md:gap-4">
                {/* Row 1: Training & Plan */}
                <div className="flex flex-col sm:flex-row w-full gap-3 md:gap-4">
                  <div className="flex-1 min-w-0 h-100 sm:h-[260px] shadow-lg rounded-lg overflow-hidden bg-white p-1">
                    <Training
                      hqId={selectedHQ}
                      factoryId={selectedFactory}
                      departmentId={selectedDepartment}
                      lineId={selectedLine}
                      sublineId={selectedSubline}
                      stationId={selectedStation}
                      financialYear={selectedFinancialYear}
                    />
                  </div>
                  <div className="flex-1 min-w-0 h-100 sm:h-[260px] shadow-lg rounded-lg overflow-hidden bg-white p-1">
                    <Plan
                      hqId={selectedHQ}
                      factoryId={selectedFactory}
                      departmentId={selectedDepartment}
                      lineId={selectedLine}
                      sublineId={selectedSubline}
                      stationId={selectedStation}
                      financialYear={selectedFinancialYear}
                    />
                  </div>
                </div>
                {/* Row 2: Defects & DefectsRejected */}
                <div className="flex flex-col sm:flex-row w-full gap-3 md:gap-4">
                  <div className="flex-1 min-w-0 h-60 sm:h-[260px] shadow-lg rounded-lg overflow-hidden bg-white p-1">
                    <Defects
                      hqId={selectedHQ}
                      factoryId={selectedFactory}
                      departmentId={selectedDepartment}
                      lineId={selectedLine}
                      sublineId={selectedSubline}
                      stationId={selectedStation}
                      financialYear={selectedFinancialYear}
                    />
                  </div>
                  <div className="flex-1 min-w-0 h-60 sm:h-[260px] shadow-lg rounded-lg overflow-hidden bg-white p-1">
                    <DefectsRejected
                      hqId={selectedHQ}
                      factoryId={selectedFactory}
                      departmentId={selectedDepartment}
                      lineId={selectedLine}
                      sublineId={selectedSubline}
                      stationId={selectedStation}
                      financialYear={selectedFinancialYear}
                    />
                  </div>
                </div>
                {/* Row 3: MonthPlanning & MyTable */}
                <div className="flex flex-col sm:flex-row w-full gap-3 md:gap-4">
                  <div className="flex-1 min-w-0 h-60 sm:h-[260px] shadow-lg rounded-lg overflow-hidden bg-white p-1">
                    <MonthPlanning
                      hqId={selectedHQ}
                      factoryId={selectedFactory}
                      departmentId={selectedDepartment}
                      lineId={selectedLine}
                      sublineId={selectedSubline}
                      stationId={selectedStation}
                      financialYear={selectedFinancialYear}
                    />
                  </div>
                  <div className="flex-1 min-w-0 h-60 sm:h-[260px] shadow-lg rounded-lg overflow-hidden bg-white p-1" style={{ overflowY: "auto" }}>
                    <MyTable />
                  </div>
                </div>
              </div>
              {/* Summary Cards */}
              <div className="w-full lg:w-[30%] xl:w-[25%] flex flex-col gap-3 md:gap-12">
                <TrainingSummaryCard
                  title="Training Summary"
                  getUrl="http://127.0.0.1:8000/current-month/training-data/"
                  hqId={selectedHQ}
                  factoryId={selectedFactory}
                  departmentId={selectedDepartment}
                  lineId={selectedLine}
                  sublineId={selectedSubline}
                  stationId={selectedStation}
                  cardColors={["#3498db", "#3498db", "#8e44ad", "#8e44ad"]}
                  subtopics={[
                    { dataKey: "new_operators_joined", displayText: "New Operators Joined" },
                    { dataKey: "new_operators_trained", displayText: "New Opr. Trained" },
                    { dataKey: "total_training_plans", displayText: "Total Trainings Plan" },
                    { dataKey: "total_trainings_actual", displayText: "Total Trainings Act" }
                  ]}
                />
                <TrainingSummaryCard
                  title="Man Related Defects"
                  getUrl="http://127.0.0.1:8000/current-month/defects-data/"
                  hqId={selectedHQ}
                  factoryId={selectedFactory}
                  departmentId={selectedDepartment}
                  lineId={selectedLine}
                  sublineId={selectedSubline}
                  stationId={selectedStation}
                  cardColors={["#143555", "#143555", "#6c6714", "#6c6714", "#5d255d", "#5d255d"]}
                  subtopics={[
                    { dataKey: "total_defects_msil", displayText: "Total Defects at MSIL" },
                    { dataKey: "ctq_defects_msil", displayText: "CTQ Defects at MSIL" },
                    { dataKey: "total_defects_tier1", displayText: "Total Defects at Tier-1" },
                    { dataKey: "ctq_defects_tier1", displayText: "CTQ Defects at Tier-1" },
                    { dataKey: "total_internal_rejection", displayText: "Total Internal Rejection" },
                    { dataKey: "ctq_internal_rejection", displayText: "CTQ Internal Rejection" }
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Management;