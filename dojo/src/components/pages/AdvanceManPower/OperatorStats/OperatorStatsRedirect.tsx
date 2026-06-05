


// import React, { useState, useEffect } from 'react';

// // Standard Interface for what we display
// type OperatorStats = {
//   id: number;
//   level: number;
//   operator_required: number;
//   operator_available: number;
// };

// // New Interface matching the new API
// type ApiData = {
//   l1_required: number;
//   l1_available: number;
//   l2_required: number;
//   l2_available: number;
//   l3_required: number;
//   l3_available: number;
//   l4_required: number;
//   l4_available: number;
// };

// type Employee = {
//   id: number;
//   name: string;
//   level: number;
//   advancementDate?: string;
// };

// interface Props {
//   hqId: number | null;
//   factoryId: number | null;
//   departmentId: number | null;
//   lineId: number | null;
//   sublineId: number | null;
//   stationId: number | null;
//   selectedYear?: number;
//   selectedMonth?: string; // Added this so we can filter by month
// }

// const API_BASE_URL = "http://127.0.0.1:8000";

// const OperatorStatsRedirect: React.FC<Props> = ({ 
//   hqId, factoryId, departmentId, lineId, sublineId, stationId, selectedYear, selectedMonth 
// }) => {
//   const [data, setData] = useState<OperatorStats[]>([]);
//   const [employees, setEmployees] = useState<Employee[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [selected, setSelected] = useState<OperatorStats | null>(null);

//   useEffect(() => {
//     if (!factoryId) {
//         setData([]);
//         return;
//     }

//     setLoading(true);

//     const params = new URLSearchParams();
//     params.append('year', selectedYear ? selectedYear.toString() : new Date().getFullYear().toString());
//     if (selectedMonth) params.append('month', selectedMonth);

//     // All Logic
//     if (hqId) params.append('hq', hqId.toString());
//     if (factoryId) params.append('factory', factoryId.toString());
//     if (departmentId) params.append('department', departmentId.toString());
//     if (lineId) params.append('line', lineId.toString());
//     if (sublineId) params.append('subline', sublineId.toString());
//     if (stationId) params.append('station', stationId.toString());

//     // Call NEW Endpoint
//     const url = `${API_BASE_URL}/chart/bifurcation-stats/?${params.toString()}`;
    
//     fetch(url)
//       .then((res) => {
//         if (!res.ok) throw new Error('Failed to fetch');
//         return res.json();
//       })
//       .then((apiData: ApiData) => {
//         // Transform the flat object into an array for rendering
//         const transformedData: OperatorStats[] = [];
        
//         for (let i = 1; i <= 4; i++) {
//           // Dynamic key access (l1_required, l2_required...)
//           const reqKey = `l${i}_required` as keyof ApiData;
//           const availKey = `l${i}_available` as keyof ApiData;
          
//           const required = apiData[reqKey] || 0;
//           const available = apiData[availKey] || 0;

//           // Only show levels that have data defined (or always show if you prefer)
//           // Here I am showing if either req or avail > 0 to avoid empty boxes
//           // OR you can just show all 4 always. Let's show all 4 to be consistent.
//           transformedData.push({
//             id: i,
//             level: i,
//             operator_required: required,
//             operator_available: available,
//           });
//         }
        
//         setData(transformedData);
//       })
//       .catch((err) => {
//         console.error("Error fetching bifurcation data:", err);
//         setData([]);
//       })
//       .finally(() => setLoading(false));
//   }, [hqId, factoryId, departmentId, lineId, sublineId, stationId, selectedYear, selectedMonth]);

//   const fetchEmployees = async (level: number) => {
//     try {
//       // You might need to update this API too if it needs hierarchy filtering!
//       const res = await fetch(`${API_BASE_URL}/employees/?level=${level}`);
//       const emps = await res.json();
//       setEmployees(emps);
//     } catch (err) {
//       console.error('Failed to fetch employees:', err);
//       setEmployees([]);
//     }
//   };

//   const handleClick = (stat: OperatorStats) => {
//     setSelected(stat);
//     fetchEmployees(stat.level);
//   };

//   const getStatus = (available: number, required: number) => {
//     if (required === 0 && available > 0) return { text: 'Surplus', color: '#948dffff' };
//     if (required === 0) return { text: 'Optimal', color: '#12c53b' }; // Or Gray if 0/0
//     if (available === required) return { text: 'Optimal', color: '#12c53b' };
//     if (available > required) return { text: 'Surplus', color: '#948dffff' };
//     if (available / required >= 0.95) return { text: 'Near Optimal', color: '#e6e603' };
//     return { text: 'Shortage', color: '#ee583e' };
//   };

//   if (loading) return <div className="text-center p-8">Loading...</div>;

//   return (
//     <div className="min-h-[300px] bg-white rounded-2xl shadow-lg p-4">
//       <h2 className="text-center text-lg font-bold text-gray-700 mb-4">
//         Operators Required VS Available 
//       </h2>

//       <div className="space-y-3">
//         {data.length === 0 && !loading && (
//             <p className="text-center text-gray-500 pt-8">No data available.</p>
//         )}
//         {data.map((stat) => {
//           const status = getStatus(stat.operator_available, stat.operator_required);
//           return (
//             <div
//               key={stat.id}
//               className="flex gap-2 cursor-pointer justify-center"
//               onClick={() => handleClick(stat)}
//             >
//               {/* Plan Box */}
//               <div
//                 className="rounded-lg p-3 text-center shadow-md flex-1 max-w-[120px] transition-transform hover:scale-105"
//                 style={{ backgroundColor: status.color }}
//               >
//                 <h3 className="text-xl font-bold text-white">{stat.operator_required}</h3>
//                 <p className="text-xs text-white opacity-90">L{stat.level} Plan</p>
//               </div>
              
//               {/* Actual Box */}
//               <div
//                 className="rounded-lg p-3 text-center shadow-md flex-1 max-w-[120px] transition-transform hover:scale-105"
//                 style={{ backgroundColor: status.color }}
//               >
//                 <h3 className="text-xl font-bold text-white">{stat.operator_available}</h3>
//                 <p className="text-xs text-white opacity-90">L{stat.level} Actual</p>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Modal Pop-up Logic (Same as before) */}
//       {selected && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={() => setSelected(null)}>
//           <div
//             className="bg-white p-6 rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto relative shadow-2xl"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <button onClick={() => setSelected(null)} className="absolute top-2 right-4 text-2xl text-gray-500 hover:text-gray-800">&times;</button>
//             <h3 className="text-lg font-bold mb-4 text-center text-gray-800">
//               L{selected.level} Operator Details
//             </h3>
//             <div className="flex justify-between mb-6 gap-4">
//               <div className="w-1/2 text-center bg-blue-50 rounded-lg p-3">
//                 <p className="font-bold text-2xl text-blue-700">{selected.operator_required}</p>
//                 <p className="text-xs text-blue-600 uppercase tracking-wide">Required</p>
//               </div>
//               <div className="w-1/2 text-center bg-green-50 rounded-lg p-3">
//                 <p className="font-bold text-2xl text-green-700">{selected.operator_available}</p>
//                 <p className="text-xs text-green-600 uppercase tracking-wide">Available</p>
//               </div>
//             </div>
//             <div className="mb-4 text-center">
//                 <span className="px-3 py-1 rounded-full text-sm font-medium text-white" style={{backgroundColor: getStatus(selected.operator_available, selected.operator_required).color}}>
//                     Status: {getStatus(selected.operator_available, selected.operator_required).text}
//                 </span>
//             </div>
            
//             <h4 className="font-bold text-sm mb-2 text-gray-700">Employee List:</h4>
//             <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
//               {employees.length === 0 ? (
//                 <p className="text-sm text-center text-gray-400 italic">No employees found for this level.</p>
//               ) : (
//                 employees.map((emp) => (
//                   <div key={emp.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-center">
//                     <p className="font-semibold text-gray-800">{emp.name}</p>
//                     {emp.advancementDate && <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">{emp.advancementDate}</span>}
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default OperatorStatsRedirect;







import React, { useState, useEffect } from 'react';

// 1. Standard Interface for what your UI expects
type OperatorStats = {
  id: number;
  level: number;
  operator_required: number;
  operator_available: number;
};

// 2. New Interface matching the Django API Response
type ApiData = {
  l1_required: number;
  l1_available: number;
  l2_required: number;
  l2_available: number;
  l3_required: number;
  l3_available: number;
  l4_required: number;
  l4_available: number;
};

type Employee = {
  id: number;
  name: string;
  level: number;
  advancementDate?: string;
  // Optional: Add card_no if you want to display it, but keeping your UI interface
};

interface Props {
  hqId: number | null;
  factoryId: number | null;
  departmentId: number | null;
  lineId: number | null;
  sublineId: number | null;
  stationId: number | null;
  selectedYear?: number;
  selectedMonth?: string;
}

const API_BASE_URL = "http://127.0.0.1:8000";

const OperatorStatsRedirect: React.FC<Props> = ({ 
  hqId, factoryId, departmentId, lineId, sublineId, stationId, selectedYear, selectedMonth 
}) => {
  const [data, setData] = useState<OperatorStats[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<OperatorStats | null>(null);
    const displayFY = selectedYear 
    ? `${selectedYear}-${(selectedYear + 1).toString().slice(-2)}`
    : (() => {
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();
        const fyStart = month < 3 ? year - 1 : year;
        return `${fyStart}-${(fyStart + 1).toString().slice(-2)}`;
      })();

  useEffect(() => {
    // Logic update: Allow fetch even if factoryId is missing, dependent on your needs. 
    // Keeping your original check if you prefer:
    // if (!factoryId) { setData([]); return; }

    setLoading(true);

    const params = new URLSearchParams();
    // Add Date Filters
    if (selectedYear) params.append('year', selectedYear.toString());
    if (selectedMonth) params.append('month', selectedMonth);

    // Add Hierarchy Filters
    if (hqId) params.append('hq', hqId.toString());
    if (factoryId) params.append('factory', factoryId.toString());
    if (departmentId) params.append('department', departmentId.toString());
    if (lineId) params.append('line', lineId.toString());
    if (sublineId) params.append('subline', sublineId.toString());
    if (stationId) params.append('station', stationId.toString());

    // LOGIC CHANGE: Call the new Bifurcation Endpoint
    const url = `${API_BASE_URL}/chart/bifurcation-statslive/?${params.toString()}`;
    
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((apiData: ApiData) => {
        // LOGIC CHANGE: Map the flat API response to your Array State
        const transformedData: OperatorStats[] = [];
        
        for (let i = 1; i <= 4; i++) {
          const reqKey = `l${i}_required` as keyof ApiData;
          const availKey = `l${i}_available` as keyof ApiData;
          
          const required = apiData[reqKey] || 0;
          const available = apiData[availKey] || 0;

          transformedData.push({
            id: i,
            level: i,
            operator_required: required,
            operator_available: available,
          });
        }
        
        setData(transformedData);
      })
      .catch((err) => {
        console.error("Error fetching bifurcation data:", err);
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [hqId, factoryId, departmentId, lineId, sublineId, stationId, selectedYear, selectedMonth]);

  const fetchEmployees = async (level: number) => {
    try {
      // We pass the filters here too, so the drill-down matches the dashboard context
      const params = new URLSearchParams();
      params.append('level', level.toString());
      if (hqId) params.append('hq', hqId.toString());
      if (factoryId) params.append('factory', factoryId.toString());
      if (departmentId) params.append('department', departmentId.toString());
      if (lineId) params.append('line', lineId.toString());
      if (stationId) params.append('station', stationId.toString());

      // You might need to create this view to list specific names, 
      // e.g., /employees/by-level/
      const res = await fetch(`${API_BASE_URL}/employees/by-level/?${params.toString()}`);
      const emps = await res.json();
      setEmployees(emps);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      setEmployees([]);
    }
  };

  const handleClick = (stat: OperatorStats) => {
    setSelected(stat);
    fetchEmployees(stat.level);
  };

  const getStatus = (available: number, required: number) => {
    if (required === 0 && available > 0) return { text: 'Surplus', color: '#948dffff' };
    if (required === 0) return { text: 'Optimal', color: '#12c53b' }; 
    if (available === required) return { text: 'Optimal', color: '#12c53b' };
    if (available > required) return { text: 'Surplus', color: '#948dffff' };
    if (available / required >= 0.95) return { text: 'Near Optimal', color: '#e6e603' };
    return { text: 'Shortage', color: '#ee583e' };
  };

  if (loading && data.length === 0) return <div className="text-center p-8">Loading...</div>;

  return (
    <div className="min-h-[300px] bg-white rounded-2xl shadow-lg p-4">
      <h2 className="text-center text-lg font-bold text-gray-700 mb-4">
        Operators Required VS Availabled– FY {displayFY} 
      </h2>

      <div className="space-y-3">
        {data.length === 0 && !loading && (
            <p className="text-center text-gray-500 pt-8">No data available.</p>
        )}
        {data.map((stat) => {
          const status = getStatus(stat.operator_available, stat.operator_required);
          return (
            <div
              key={stat.id}
              className="flex gap-2 cursor-pointer justify-center"
              onClick={() => handleClick(stat)}
            >
              {/* Plan Box - PRESERVED UI */}
              <div
                className="rounded-lg p-3 text-center shadow-md flex-1 max-w-[120px] transition-transform hover:scale-105"
                style={{ backgroundColor: status.color }}
              >
                <h3 className="text-xl font-bold text-white">{stat.operator_required}</h3>
                <p className="text-xs text-white opacity-90">L{stat.level} Plan</p>
              </div>
              
              {/* Actual Box - PRESERVED UI */}
              <div
                className="rounded-lg p-3 text-center shadow-md flex-1 max-w-[120px] transition-transform hover:scale-105"
                style={{ backgroundColor: status.color }}
              >
                <h3 className="text-xl font-bold text-white">{stat.operator_available}</h3>
                <p className="text-xs text-white opacity-90">L{stat.level} Actual</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Pop-up Logic - PRESERVED UI */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={() => setSelected(null)}>
          <div
            className="bg-white p-6 rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setSelected(null)} className="absolute top-2 right-4 text-2xl text-gray-500 hover:text-gray-800">&times;</button>
            <h3 className="text-lg font-bold mb-4 text-center text-gray-800">
              L{selected.level} Operator Details
            </h3>
            <div className="flex justify-between mb-6 gap-4">
              <div className="w-1/2 text-center bg-blue-50 rounded-lg p-3">
                <p className="font-bold text-2xl text-blue-700">{selected.operator_required}</p>
                <p className="text-xs text-blue-600 uppercase tracking-wide">Required</p>
              </div>
              <div className="w-1/2 text-center bg-green-50 rounded-lg p-3">
                <p className="font-bold text-2xl text-green-700">{selected.operator_available}</p>
                <p className="text-xs text-green-600 uppercase tracking-wide">Available</p>
              </div>
            </div>
            <div className="mb-4 text-center">
                <span className="px-3 py-1 rounded-full text-sm font-medium text-white" style={{backgroundColor: getStatus(selected.operator_available, selected.operator_required).color}}>
                    Status: {getStatus(selected.operator_available, selected.operator_required).text}
                </span>
            </div>
            
            <h4 className="font-bold text-sm mb-2 text-gray-700">Employee List:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {employees.length === 0 ? (
                <p className="text-sm text-center text-gray-400 italic">No employees found for this level.</p>
              ) : (
                employees.map((emp, idx) => (
                  <div key={emp.id || idx} className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-center">
                    <p className="font-semibold text-gray-800">{emp.name}</p>
                    {emp.advancementDate && <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">{emp.advancementDate}</span>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorStatsRedirect;




