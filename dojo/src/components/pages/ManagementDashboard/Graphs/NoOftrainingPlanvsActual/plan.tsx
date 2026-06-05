// import React, { useEffect, useState } from "react";
// import BarChart from "../../Barchart/barchart";

// interface PlanProps {
//   hqId?: string;
//   factoryId?: string;
//   departmentId?: string;
//   lineId?: string;
//   sublineId?: string;
//   stationId?: string;
// }

// const API_BASE_URL = "http://172.25.0.51:8000";

// const Plan: React.FC<PlanProps> = ({ 
//   hqId, factoryId, departmentId, lineId, sublineId, stationId 
// }) => {
//   const [plannedData, setPlannedData] = useState<number[]>([]);
//   const [actualData, setActualData] = useState<number[]>([]);
  
//   // CHANGED: Labels ordered from April to March (Financial Year)
//   const [labels] = useState<string[]>([
//     "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar" 
//   ]);
  
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
  
//   useEffect(() => {
//     const fetchTrainingData = async () => {
//       try {
//         setLoading(true);
//         setError(null);
        
//         const params = new URLSearchParams();
//         params.append('year', '2025'); 

//         if (hqId) params.append('hq', hqId);
//         if (factoryId) params.append('factory', factoryId);
//         if (departmentId) params.append('department', departmentId);
//         if (lineId) params.append('line', lineId);
//         if (sublineId) params.append('subline', sublineId);
//         if (stationId) params.append('station', stationId);
        
//         const response = await fetch(`${API_BASE_URL}/chart/training-plans/?${params.toString()}`);
        
//         if (!response.ok) {
//             throw new Error("Failed to fetch data");
//         }
        
//         const apiData = await response.json();

//         // Zero-Filling Logic
//         const filledPlans = new Array(12).fill(0);
//         const filledActual = new Array(12).fill(0);

//         if (apiData && apiData.length > 0) {
//           apiData.forEach((item: any) => {
//             const date = new Date(item.month_year);
//             const calendarMonth = date.getMonth(); // 0 = Jan, 1 = Feb, etc.
            
//             // CHANGED: Map Calendar Month to Financial Year Index
//             // Apr (3) -> Index 0
//             // Dec (11) -> Index 8
//             // Jan (0) -> Index 9
//             // Mar (2) -> Index 11
            
//             let chartIndex = calendarMonth - 3;
//             if (chartIndex < 0) {
//                 chartIndex += 12;
//             }

//             filledPlans[chartIndex] = item.training_plans;
//             filledActual[chartIndex] = item.trainings_actual;
//           });
//         }

//         setPlannedData(filledPlans);
//         setActualData(filledActual);

//       } catch (err) {
//         console.error("Error fetching training data:", err);
//         setError("Failed to load training data");
//         setPlannedData(new Array(12).fill(0));
//         setActualData(new Array(12).fill(0));
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTrainingData();
//   }, [hqId, factoryId, departmentId, lineId, sublineId, stationId]); 

//   const title = "No of Trainings Plan vs Actual";
  
//   return (
//     <div className="bg-white rounded-lg overflow-hidden h-full flex flex-col">
//       <div className="p-4 border-b border-gray-200">
//         <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
//       </div>
//       <div className="p-2 flex-1">
//         {loading ? (
//           <div className="w-full h-full flex items-center justify-center">
//             <p className="text-gray-500">Loading data...</p>
//           </div>
//         ) : (
//           <div className="w-full h-full">
//             <BarChart
//               key={`${hqId}-${factoryId}-${stationId}`} 
//               labels={labels}
//               data1={plannedData}
//               data2={actualData}
//               groupLabels={["Plan", "Actual"]}  
//               title=""
//               color1="rgba(52, 152, 219, 0.8)"
//               color2="rgba(13, 32, 160, 0.8)" 
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Plan;



// ============================================
// 1. Plan.tsx - Training Plans vs Actual
// ============================================
import React, { useEffect, useState } from "react";
import BarChart from "../../Barchart/barchart";

interface PlanProps {
  hqId?: string;
  factoryId?: string;
  departmentId?: string;
  lineId?: string;
  sublineId?: string;
  stationId?: string;
  financialYear: string; // NEW
}

const API_BASE_URL = "http://172.25.0.51:8000";

const Plan: React.FC<PlanProps> = ({
  hqId,
  factoryId,
  departmentId,
  lineId,
  sublineId,
  stationId,
  financialYear, // NEW
}) => {
  const [plannedData, setPlannedData] = useState<number[]>([]);
  const [actualData, setActualData] = useState<number[]>([]);

  const [labels] = useState<string[]>([
    "Apr", "May", "Jun", "Jul", "Aug", "Sep",
    "Oct", "Nov", "Dec", "Jan", "Feb", "Mar",
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrainingData = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();

        // Use selected financial year
        let fyStartYear: number;
        if (financialYear) {
          fyStartYear = parseInt(financialYear);
        } else {
          const today = new Date();
          const currentMonth = today.getMonth();
          const currentYear = today.getFullYear();
          fyStartYear = currentMonth < 3 ? currentYear - 1 : currentYear;
        }

        params.append("year", fyStartYear.toString());

        if (hqId) params.append("hq", hqId);
        if (factoryId) params.append("factory", factoryId);
        if (departmentId) params.append("department", departmentId);
        if (lineId) params.append("line", lineId);
        if (sublineId) params.append("subline", sublineId);
        if (stationId) params.append("station", stationId);

        const url = `${API_BASE_URL}/chart/training-plans/?${params.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const apiData = await response.json();

        const filledPlans = new Array(12).fill(0);
        const filledActual = new Array(12).fill(0);

        apiData.forEach((item: any) => {
          const m = item.month || parseInt(item.month_year.split("-")[1], 10);

          if (isNaN(m) || m < 1 || m > 12) {
            console.warn("Invalid month:", item.month_year);
            return;
          }

          // Map calendar month to FY index
          const chartIndex = m >= 4 ? m - 4 : m + 8;

          if (chartIndex >= 0 && chartIndex < 12) {
            filledPlans[chartIndex] = Number(item.training_plans) || 0;
            filledActual[chartIndex] = Number(item.trainings_actual) || 0;
          }
        });

        setPlannedData(filledPlans);
        setActualData(filledActual);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError("Failed to load training data");
        setPlannedData(new Array(12).fill(0));
        setActualData(new Array(12).fill(0));
      } finally {
        setLoading(false);
      }
    };

    fetchTrainingData();
  }, [hqId, factoryId, departmentId, lineId, sublineId, stationId, financialYear]);

  return (
    <div className="bg-white rounded-lg overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">
          No of Trainings Plan vs Actual
          {financialYear && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              (FY {financialYear}-{parseInt(financialYear) + 1})
            </span>
          )}
        </h3>
      </div>
      <div className="p-2 flex-1">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : error ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <div className="w-full h-full">
            <BarChart
              key={`${hqId || ''}-${factoryId || ''}-${departmentId || ''}-${lineId || ''}-${sublineId || ''}-${stationId || ''}-${financialYear}`}
              labels={labels}
              data1={plannedData}
              data2={actualData}
              groupLabels={["Plan", "Actual"]}
              title=""
              color1="rgba(52, 152, 219, 0.8)"
              color2="rgba(13, 32, 160, 0.8)"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Plan;