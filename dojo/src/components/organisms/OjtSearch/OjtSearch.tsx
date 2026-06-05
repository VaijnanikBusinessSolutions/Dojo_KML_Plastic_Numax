// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { Search, X, User } from "lucide-react";
// import { API_ENDPOINTS } from "../../constants/api";

// // ✅ Types
// interface Employee {
//   emp_id: string;
//   first_name: string;
//   last_name: string;
//   department_name: string;
// }

// interface LocationState {
//   stationId?: number;
//   stationName?: string;
//   sublineId?: number;
//   sublineName?: string;
//   lineId?: number;
//   lineName?: string;
//   departmentId?: number;
//   departmentName?: string;
//   levelId?: number;
//   levelName?: string;
// }

// const OjtSearch: React.FC = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const {
//     stationId,
//     stationName,
//     sublineId,
//     sublineName,
//     lineId,
//     lineName,
//     departmentId,
//     departmentName,
//     levelId,
//     levelName,
//   } = (location.state as LocationState) || {};

//   const [query, setQuery] = useState("");
//   const [employees, setEmployees] = useState<Employee[]>([]);
//   const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
//   const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
//     null
//   );
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

//   const inputRef = useRef<HTMLInputElement>(null);
//   const suggestionsRef = useRef<HTMLDivElement>(null);

//   // ✅ Fetch Employees
//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const response = await fetch(
//           `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.EMPLOYEES}`
//         );
//         if (!response.ok)
//           throw new Error(`Error fetching employees: ${response.statusText}`);
//         const data: Employee[] = await response.json();
//         setEmployees(data);
//         setFilteredEmployees(data);
//       } catch (error: any) {
//         setError(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchEmployees();
//   }, []);

//   // ✅ Debounce Search
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (query.trim() && employees.length > 0) {
//         const filtered = employees.filter(
//           (emp) =>
//             `${emp.first_name} ${emp.last_name}`
//               .toLowerCase()
//               .includes(query.toLowerCase()) ||
//             emp.emp_id.toLowerCase().includes(query.toLowerCase())
//         );
//         setFilteredEmployees(filtered.slice(0, 10));
//         setShowSuggestions(true);
//       } else {
//         setFilteredEmployees([]);
//         setShowSuggestions(false);
//       }
//     }, 200);
//     return () => clearTimeout(timer);
//   }, [query, employees]);

//   // ✅ Close dropdown on outside click
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         suggestionsRef.current &&
//         !suggestionsRef.current.contains(event.target as Node) &&
//         inputRef.current &&
//         !inputRef.current.contains(event.target as Node)
//       ) {
//         setShowSuggestions(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // ✅ Navigate to OJT Form
//   // const handleNavigation = (employee: Employee) => {
//   //   navigate("/OJTForm", {
//   //     state: {
//   //       ...location.state,
//   //       employeeId: employee.emp_id,
//   //       employeeName: `${employee.first_name} ${employee.last_name}`,
//   //     },
//   //   });
//   // };

//   const handleNavigation = (employee: Employee) => {
//     const { nextpage } = location.state || {};

//     if (nextpage === "tencycle") {
//       navigate("/TenCyclePage", {
//         // Replace with your actual Ten Cycle page route
//         state: {
//           ...location.state,
//           employeeId: employee.emp_id,
//           employeeName: `${employee.first_name} ${employee.last_name}`,
//         },
//       });
//     } else {
//       navigate("/OJTForm", {
//         state: {
//           ...location.state,
//           employeeId: employee.emp_id,
//           employeeName: `${employee.first_name} ${employee.last_name}`,
//         },
//       });
//     }
//   };

//   // ✅ Select Employee
//   const handleEmployeeSelect = (employee: Employee) => {
//     setSelectedEmployee(employee);
//     setQuery(`${employee.first_name} ${employee.last_name}`);
//     setShowSuggestions(false);
//     handleNavigation(employee);
//   };

//   const clearSearch = () => {
//     setQuery("");
//     setSelectedEmployee(null);
//     setShowSuggestions(false);
//     inputRef.current?.focus();
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
//       {/* ✅ Floating Shapes Background */}
//       <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
//         <div className="absolute w-72 h-72 bg-blue-100 rounded-full top-10 left-10 opacity-30 animate-pulse"></div>
//         <div className="absolute w-56 h-56 bg-purple-100 rounded-full bottom-20 right-20 opacity-30 animate-pulse"></div>
//       </div>

//       <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
//         {/* ✅ Header */}
//         <div className="text-center mb-10">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
//             <User className="w-8 h-8 text-white" />
//           </div>
//           <h1 className="text-4xl font-bold gradient-text mb-2">
//             {/* OJT Training -  */}Select Employee
//           </h1>
//           <p className="text-lg text-gray-600">
//             Search for an employee to start their session
//             {/* OJT */}
//           </p>
//         </div>

//         {/* ✅ Location Info */}
//         {(departmentName ||
//           lineName ||
//           sublineName ||
//           stationName ||
//           levelName) && (
//           <div className="glass-card rounded-xl p-6 mb-8 shadow-lg">
//             <h2 className="text-lg font-semibold text-gray-700 mb-4">
//               Training Location
//             </h2>
//             <div className="flex flex-wrap gap-2">
//               {departmentName && (
//                 <span className="px-3 py-1 bg-blue-100 rounded-full">
//                   {departmentName}
//                 </span>
//               )}
//               {lineName && (
//                 <span className="px-3 py-1 bg-purple-100 rounded-full">
//                   {lineName}
//                 </span>
//               )}
//               {sublineName && (
//                 <span className="px-3 py-1 bg-indigo-100 rounded-full">
//                   {sublineName}
//                 </span>
//               )}
//               {stationName && (
//                 <span className="px-3 py-1 bg-green-100 rounded-full">
//                   {stationName}
//                 </span>
//               )}
//               {levelName && (
//                 <span className="px-3 py-1 bg-yellow-100 rounded-full">
//                   {levelName}
//                 </span>
//               )}
//             </div>
//           </div>
//         )}

//         {/* ✅ Error State */}
//         {error && (
//           <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
//             {error}
//           </div>
//         )}

//         {/* ✅ Search Box */}
//         <div className="glass-card rounded-xl p-6 shadow-lg relative">
//           <div className="relative mb-4">
//             <input
//               ref={inputRef}
//               type="text"
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               placeholder="Search by name or employee ID..."
//               className="w-full px-12 py-4 glass-input rounded-xl text-lg text-gray-800 placeholder-gray-500"
//               onFocus={() => query && setShowSuggestions(true)}
//             />
//             <Search className="absolute left-4 top-4 text-gray-400" size={22} />
//             {query && (
//               <button
//                 onClick={clearSearch}
//                 className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
//               >
//                 <X size={20} />
//               </button>
//             )}
//           </div>

//           {/* ✅ Suggestions Dropdown */}
//           {showSuggestions && (
//             <div
//               ref={suggestionsRef}
//               className="absolute w-full mt-2 bg-white rounded-xl shadow-lg max-h-80 overflow-y-auto z-50"
//             >
//               {loading ? (
//                 <div className="p-4 text-center text-gray-500">
//                   Loading employees...
//                 </div>
//               ) : filteredEmployees.length > 0 ? (
//                 filteredEmployees.map((employee) => (
//                   <div
//                     key={employee.emp_id}
//                     className="p-4 flex justify-between items-center hover:bg-indigo-50 cursor-pointer transition"
//                     onClick={() => handleEmployeeSelect(employee)}
//                   >
//                     <div>
//                       <div className="font-semibold text-gray-800">
//                         {employee.first_name} {employee.last_name}
//                       </div>
//                       <div className="text-sm text-gray-500">
//                         {employee.emp_id}
//                       </div>
//                     </div>
//                     <span className="text-sm text-gray-400">
//                       {employee.department_name}
//                     </span>
//                   </div>
//                 ))
//               ) : (
//                 <div className="p-4 text-center text-gray-500">
//                   No employees found
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OjtSearch;




import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, X, User } from "lucide-react";
import { API_ENDPOINTS } from "../../constants/api";

// ✅ Types
interface Employee {
  emp_id: string;
  first_name: string;
  last_name: string;
  department_name: string;
  date_of_joining: string;
}

interface LocationState {
  stationId?: number;
  stationName?: string;
  sublineId?: number;
  sublineName?: string;
  lineId?: number;
  lineName?: string;
  departmentId?: number;
  departmentName?: string;
  levelId?: number;
  levelName?: string;
}

const OjtSearch: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    stationId,
    stationName,
    sublineId,
    sublineName,
    lineId,
    lineName,
    departmentId,
    departmentName,
    levelId,
    levelName,
  } = (location.state as LocationState) || {};

  const [query, setQuery] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // ✅ Fetch Employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.EMPLOYEES}`
        );
        if (!response.ok)
          throw new Error(`Error fetching employees: ${response.statusText}`);
        const data: Employee[] = await response.json();
        setEmployees(data);
        setFilteredEmployees(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // ✅ Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim() && employees.length > 0) {
        const filtered = employees.filter(
          (emp) =>
            `${emp.first_name} ${emp.last_name}`
              .toLowerCase()
              .includes(query.toLowerCase()) ||
            emp.emp_id.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredEmployees(filtered.slice(0, 10));
        setShowSuggestions(true);
      } else {
        setFilteredEmployees([]);
        setShowSuggestions(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query, employees]);

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Navigate to OJT Form
  // const handleNavigation = (employee: Employee) => {
  //   navigate("/OJTForm", {
  //     state: {
  //       ...location.state,
  //       employeeId: employee.emp_id,
  //       employeeName: `${employee.first_name} ${employee.last_name}`,
  //     },
  //   });
  // };

  const handleNavigation = (employee: Employee) => {
    const { nextpage } = location.state || {};

    if (nextpage === "tencycle") {
      navigate("/TenCyclePage", {
        // Replace with your actual Ten Cycle page route
        state: {
          ...location.state,
          employeeId: employee.emp_id,
          employeeName: `${employee.first_name} ${employee.last_name}`,
        },
      });
    } else {
      navigate("/OJTForm", {
        state: {
          ...location.state,
          employeeId: employee.emp_id,
          employeeName: `${employee.first_name} ${employee.last_name}`,
        },
      });
    }
  };

  // ✅ Select Employee
  // const handleEmployeeSelect = (employee: Employee) => {
  //   setSelectedEmployee(employee);
  //   setQuery(`${employee.first_name} ${employee.last_name}`);
  //   setShowSuggestions(false);
  //   handleNavigation(employee);
  // };

//   const handleEmployeeSelect = async (employee: Employee) => {
//   setSelectedEmployee(employee);
//   setQuery(`${employee.first_name} ${employee.last_name}`);
//   setShowSuggestions(false);

//   try {
//     // ✅ Step 1: Check if retraining exists for this employee and current level/station
//     const retrainingCheckUrl = `${API_ENDPOINTS.BASE_URL}/retraining-sessions/?employee_id=${employee.emp_id}&evaluation_type=OJT&level_id=${levelId}&station_id=${stationId}&department_id=${departmentId}`;
//     console.log("🔍 Checking retraining URL:", retrainingCheckUrl);
//     const retrainingResponse = await fetch(retrainingCheckUrl);
//     const retrainingData = await retrainingResponse.json();

//     console.log("📦 Retraining response:", retrainingData);

//     const retrainingExists = Array.isArray(retrainingData) && retrainingData.some(
//       (r) => ["Pending", "Scheduled"].includes(r.status)
//     );

//     console.log("✅ retrainingExists:", retrainingExists);

//     // ✅ Step 2: Set attempt type and navigation
//     const nextPage = (location.state as any)?.nextpage;
//     const baseNavData = {
//       ...location.state,
//       employeeId: employee.emp_id,
//       employeeName: `${employee.first_name} ${employee.last_name}`,
//     };

//     if (nextPage === "tencycle") {
//       navigate("/TenCyclePage", { state: baseNavData });
//       return;
//     }

//     // ✅ Step 3: Navigate to OJT Form
//     if (retrainingExists) {
//       // retraining found → open blank OJT form with incremented attempt
//       console.log("🟢 Retraining session found — Opening new attempt mode");
//       navigate("/OJTForm", {
//         state: {
//           ...baseNavData,
//           isRetraining: true,
//           attemptMode: "new", // signal to create new blank record
//         },
//       });
//     } else {
//       // no retraining → open normal OJT
//       console.log("🔵 No retraining — Opening normal OJT");
//       navigate("/OJTForm", {
//         state: {
//           ...baseNavData,
//           isRetraining: false,
//           attemptMode: "existing",
//         },
//       });
//     }
//   } catch (error) {
//     console.error("Error checking retraining:", error);
//     // fallback → open normal OJT
//     navigate("/OJTForm", {
//       state: {
//         ...location.state,
//         employeeId: employee.emp_id,
//         employeeName: `${employee.first_name} ${employee.last_name}`,
//         isRetraining: false,
//         attemptMode: "existing",
//       },
//     });
//   }
// };


const handleEmployeeSelect = async (employee: Employee) => {
  setSelectedEmployee(employee);
  setQuery(`${employee.first_name} ${employee.last_name}`);
  setShowSuggestions(false);

  try {
    // ✅ Step 1: Identify the current page type
    const { nextpage } = location.state || {};
    const evaluationType = nextpage === "tencycle" ? "10 Cycle" : "OJT";

    // ✅ Step 2: Call retraining session API to check if retraining already exists
    const retrainingCheckUrl = `${API_ENDPOINTS.BASE_URL}/retraining-sessions/?employee_id=${employee.emp_id}&evaluation_type=${evaluationType}&level_id=${levelId}&station_id=${stationId}&department_id=${departmentId}`;
    console.log("🔍 Checking retraining URL:", retrainingCheckUrl);

    const retrainingResponse = await fetch(retrainingCheckUrl);
    const retrainingData = await retrainingResponse.json();

    console.log("📦 Retraining response:", retrainingData);

    // ✅ Step 3: Detect if any pending or scheduled retraining exists
    const retrainingExists =
      Array.isArray(retrainingData) &&
      retrainingData.some((r) =>
        ["Pending", "Scheduled"].includes(
          (r.status || "").toString().trim()
        )
      );

    console.log("✅ retrainingExists:", retrainingExists);

    // ✅ Step 4: Build navigation data
    const baseNavData = {
      ...location.state,
      employeeId: employee.emp_id,
      employeeName: `${employee.first_name} ${employee.last_name}`,
      doj: employee.date_of_joining,
    };

    // ✅ Step 5: Route based on evaluation type
    if (nextpage === "tencycle") {
      if (retrainingExists) {
        console.log("🟢 10 Cycle retraining found — Opening blank new attempt");
        navigate("/TenCyclePage", {
          state: {
            ...baseNavData,
            isRetraining: true,
            attemptMode: "new",
          },
        });
      } else {
        console.log("🔵 No retraining — Opening normal Ten Cycle");
        navigate("/TenCyclePage", {
          state: {
            ...baseNavData,
            isRetraining: false,
            attemptMode: "existing",
          },
        });
      }
    } else {
      // ✅ OJT case (unchanged)
      if (retrainingExists) {
        console.log("🟢 OJT retraining found — Opening blank new attempt");
        navigate("/OJTForm", {
          state: {
            ...baseNavData,
            isRetraining: true,
            attemptMode: "new",
          },
        });
      } else {
        console.log("🔵 No retraining — Opening normal OJT");
        navigate("/OJTForm", {
          state: {
            ...baseNavData,
            isRetraining: false,
            attemptMode: "existing",
          },
        });
      }
    }
  } catch (error) {
    console.error("Error checking retraining:", error);

    // ✅ Fallback — open normal form
    const { nextpage } = location.state || {};
    const baseNavData = {
      ...location.state,
      employeeId: employee.emp_id,
      employeeName: `${employee.first_name} ${employee.last_name}`,
      isRetraining: false,
      attemptMode: "existing",
    };

    if (nextpage === "tencycle") {
      navigate("/TenCyclePage", { state: baseNavData });
    } else {
      navigate("/OJTForm", { state: baseNavData });
    }
  }
};


   

  const clearSearch = () => {
    setQuery("");
    setSelectedEmployee(null);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* ✅ Floating Shapes Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute w-72 h-72 bg-blue-100 rounded-full top-10 left-10 opacity-30 animate-pulse"></div>
        <div className="absolute w-56 h-56 bg-purple-100 rounded-full bottom-20 right-20 opacity-30 animate-pulse"></div>
      </div>

      <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* ✅ Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">
            {/* OJT Training -  */}Select Employee
          </h1>
          <p className="text-lg text-gray-600">
            Search for an employee to start their session
            {/* OJT */}
          </p>
        </div>

        {/* ✅ Location Info */}
        {(departmentName ||
          lineName ||
          sublineName ||
          stationName ||
          levelName) && (
          <div className="glass-card rounded-xl p-6 mb-8 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Training Location
            </h2>
            <div className="flex flex-wrap gap-2">
              {departmentName && (
                <span className="px-3 py-1 bg-blue-100 rounded-full">
                  {departmentName}
                </span>
              )}
              {lineName && (
                <span className="px-3 py-1 bg-purple-100 rounded-full">
                  {lineName}
                </span>
              )}
              {sublineName && (
                <span className="px-3 py-1 bg-indigo-100 rounded-full">
                  {sublineName}
                </span>
              )}
              {stationName && (
                <span className="px-3 py-1 bg-green-100 rounded-full">
                  {stationName}
                </span>
              )}
              {levelName && (
                <span className="px-3 py-1 bg-yellow-100 rounded-full">
                  {levelName}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ✅ Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* ✅ Search Box */}
        <div className="glass-card rounded-xl p-6 shadow-lg relative">
          <div className="relative mb-4">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or employee ID..."
              className="w-full px-12 py-4 glass-input rounded-xl text-lg text-gray-800 placeholder-gray-500"
              onFocus={() => query && setShowSuggestions(true)}
            />
            <Search className="absolute left-4 top-4 text-gray-400" size={22} />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* ✅ Suggestions Dropdown */}
          {showSuggestions && (
            <div
              ref={suggestionsRef}
              className="absolute w-full mt-2 bg-white rounded-xl shadow-lg max-h-80 overflow-y-auto z-50"
            >
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  Loading employees...
                </div>
              ) : filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <div
                    key={employee.emp_id}
                    className="p-4 flex justify-between items-center hover:bg-indigo-50 cursor-pointer transition"
                    onClick={() => handleEmployeeSelect(employee)}
                  >
                    <div>
                      <div className="font-semibold text-gray-800">
                        {employee.first_name} {employee.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {employee.emp_id}
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">
                      {employee.department_name}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No employees found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OjtSearch;

