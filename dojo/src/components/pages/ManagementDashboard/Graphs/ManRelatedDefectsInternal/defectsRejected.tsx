// import React, { useEffect, useState } from "react";
// import LineGraph from "../../LineGraph/linegraph";

// // 1. Define Props
// interface DefectsRejectedProps {
//   hqId?: string;
//   factoryId?: string;
//   departmentId?: string;
//   lineId?: string;
//   sublineId?: string;
//   stationId?: string;
// }

// const API_BASE_URL = "http://172.25.0.51:8000";

// const DefectsRejected: React.FC<DefectsRejectedProps> = ({
//   hqId, factoryId, departmentId, lineId, sublineId, stationId
// }) => {
//     // Default to 0s
//     const [data1, setData1] = useState<number[]>([]);
//     const [data2, setData2] = useState<number[]>([]);
    
//     // CHANGED: Labels ordered from April to March (Financial Year)
//     const [labels] = useState<string[]>([
//         "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"
//     ]);

//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         const fetchRejectionData = async () => {
//             try {
//                 setLoading(true);
//                 setError(null);
                
//                 // Build URL Params
//                 const params = new URLSearchParams();
//                 params.append('year', '2025'); // Force 2025
                
//                 if (hqId) params.append('hq', hqId);
//                 if (factoryId) params.append('factory', factoryId);
//                 if (departmentId) params.append('department', departmentId);
//                 if (lineId) params.append('line', lineId);
//                 if (sublineId) params.append('subline', sublineId);
//                 if (stationId) params.append('station', stationId);

//                 const response = await fetch(`${API_BASE_URL}/chart/internal-rejection/?${params.toString()}`);
                
//                 if (!response.ok) {
//                     throw new Error("Failed to fetch data");
//                 }

//                 const apiData = await response.json();

//                 // --- ZERO FILLING LOGIC ---
//                 const filledTotal = new Array(12).fill(0);
//                 const filledCtq = new Array(12).fill(0);

//                 if (apiData && apiData.length > 0) {
//                     apiData.forEach((item: any) => {
//                         const date = new Date(item.month_year);
//                         const calendarMonth = date.getMonth(); // 0 = Jan, 1 = Feb...
                        
//                         // CHANGED: Map Calendar Month to Financial Year Index
//                         // Apr (3) -> Index 0
//                         // Jan (0) -> Index 9
                        
//                         let chartIndex = calendarMonth - 3;
//                         if (chartIndex < 0) {
//                             chartIndex += 12;
//                         }
                        
//                         filledTotal[chartIndex] = item.total_internal_rejection;
//                         filledCtq[chartIndex] = item.ctq_internal_rejection;
//                     });
//                 }

//                 setData1(filledTotal);
//                 setData2(filledCtq);

//             } catch (err: any) {
//                 console.error("Error fetching rejection data:", err);
//                 setError("Failed to load data");
//                 setData1(new Array(12).fill(0));
//                 setData2(new Array(12).fill(0));
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchRejectionData();
//     }, [hqId, factoryId, departmentId, lineId, sublineId, stationId]);

//     const title = "Total Rejections - MSIL";

//     return (
//         <div style={{ width: "100%", height: "100%", margin: "auto", display: "flex", flexDirection: "column" }}>
//             <h5 style={{
//                 color: "black",
//                 margin: "0",
//                 padding: "10px 15px",
//                 fontSize: "16px",
//                 fontFamily: "Arial, sans-serif",
//                 fontWeight: "bold"
//             }}>
//                 {title}
//             </h5>

//             <div style={{ flex: 1, padding: "0 10px 10px 10px", minHeight: "0" }}>
//                 {loading ? (
//                     <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
//                         <p style={{ color: "#6b7280" }}>Loading rejection data...</p>
//                     </div>
//                 ) : (
//                     // Added key to force refresh
//                     <LineGraph
//                         key={`${hqId}-${factoryId}-${stationId}`}
//                         labels={labels}
//                         data1={data1}
//                         data2={data2}
//                         area={true}
//                         showSecondLine={true}
//                         line1Color="#46b1f0ff"
//                         line2Color="#1c126eff"
//                         area1Color="rgba(79, 70, 229, 0.1)"
//                         area2Color="rgba(16, 160, 185, 0.1)"
//                         label1="Total Internal Rejection"
//                         label2="CTQ Internal Rejection"
//                         maintainAspectRatio={false}
//                     />
//                 )}
//             </div>
//         </div>
//     );
// };

// export default DefectsRejected; 



import React, { useEffect, useState } from "react";
import LineGraph from "../../LineGraph/linegraph";

interface DefectsRejectedProps {
  hqId?: string;
  factoryId?: string;
  departmentId?: string;
  lineId?: string;
  sublineId?: string;
  stationId?: string;
  financialYear: string; // NEW
}

const API_BASE_URL = "http://172.25.0.51:8000";

const DefectsRejected: React.FC<DefectsRejectedProps> = ({
  hqId, factoryId, departmentId, lineId, sublineId, stationId, financialYear
}) => {
  const [data1, setData1] = useState<number[]>([]);
  const [data2, setData2] = useState<number[]>([]);
  
  const [labels] = useState<string[]>([
    "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRejectionData = async () => {
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

        params.append('year', fyStartYear.toString());
        
        if (hqId) params.append('hq', hqId);
        if (factoryId) params.append('factory', factoryId);
        if (departmentId) params.append('department', departmentId);
        if (lineId) params.append('line', lineId);
        if (sublineId) params.append('subline', sublineId);
        if (stationId) params.append('station', stationId);

        const response = await fetch(`${API_BASE_URL}/chart/internal-rejection/?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const apiData = await response.json();

        const filledTotal = new Array(12).fill(0);
        const filledCtq = new Array(12).fill(0);

        if (apiData && apiData.length > 0) {
          apiData.forEach((item: any) => {
            const m = item.month || parseInt(item.month_year.split('-')[1], 10);

            if (isNaN(m) || m < 1 || m > 12) {
              console.warn("Invalid month:", item.month_year);
              return;
            }

            // Map calendar month to FY index
            const chartIndex = m >= 4 ? m - 4 : m + 8;

            if (chartIndex >= 0 && chartIndex < 12) {
              filledTotal[chartIndex] = item.total_internal_rejection || 0;
              filledCtq[chartIndex] = item.ctq_internal_rejection || 0;
            }
          });
        }

        setData1(filledTotal);
        setData2(filledCtq);

      } catch (err: any) {
        console.error("Error fetching rejection data:", err);
        setError("Failed to load data");
        setData1(new Array(12).fill(0));
        setData2(new Array(12).fill(0));
      } finally {
        setLoading(false);
      }
    };

    fetchRejectionData();
  }, [hqId, factoryId, departmentId, lineId, sublineId, stationId, financialYear]);

  return (
    <div style={{ width: "100%", height: "100%", margin: "auto", display: "flex", flexDirection: "column" }}>
      <h5 style={{
        color: "black",
        margin: "0",
        padding: "10px 15px",
        fontSize: "16px",
        fontFamily: "Arial, sans-serif",
        fontWeight: "bold"
      }}>
        Total Rejections - MSIL
        {financialYear && (
          <span style={{ fontSize: "14px", fontWeight: "normal", color: "#6b7280", marginLeft: "8px" }}>
            (FY {financialYear}-{parseInt(financialYear) + 1})
          </span>
        )}
      </h5>

      <div style={{ flex: 1, padding: "0 10px 10px 10px", minHeight: "0" }}>
        {loading ? (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "#6b7280" }}>Loading rejection data...</p>
          </div>
        ) : (
          <LineGraph
            key={`${hqId}-${factoryId}-${stationId}-${financialYear}`}
            labels={labels}
            data1={data1}
            data2={data2}
            area={true}
            showSecondLine={true}
            line1Color="#46b1f0ff"
            line2Color="#1c126eff"
            area1Color="rgba(79, 70, 229, 0.1)"
            area2Color="rgba(16, 160, 185, 0.1)"
            label1="Total Internal Rejection"
            label2="CTQ Internal Rejection"
            maintainAspectRatio={false}
          />
        )}
      </div>
    </div>
  );
};

export default DefectsRejected;
