// import React, { useState, useEffect } from 'react';
// import LineGraph from '../../LineGraph/linegraph';

// interface MonthPlanningProps {
//     hqId: string;
//     factoryId: string;
//     departmentId: string;
//     lineId: string;
//     sublineId: string;
//     stationId: string;
// }

// const MonthPlanning: React.FC<MonthPlanningProps> = ({
//     hqId, factoryId, departmentId, lineId, sublineId, stationId
// }) => {
//     const [loading, setLoading] = useState<boolean>(true);
//     const [error, setError] = useState<string | null>(null);

//     // CHANGED: Labels ordered from April to March (Financial Year)
//     const [labels, setLabels] = useState<string[]>([
//         "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"
//     ]);
//     const [data1, setData1] = useState<number[]>([]); // Required
//     const [data2, setData2] = useState<number[]>([]); // Available

//     useEffect(() => {
//         const fetchPlanningData = async () => {
//             try {
//                 setLoading(true);
//                 setError(null);

//                 const baseUrl = 'http://172.25.0.51:8000/chart/month-planning/';
//                 const params = new URLSearchParams();

//                 // --- ENSURE WE GET 2025 DATA ---
//                 params.append('year', '2025');

//                 // Hierarchy Filters
//                 if (hqId) params.append('hq', hqId);
//                 if (factoryId) params.append('factory', factoryId);
//                 if (departmentId) params.append('department', departmentId);
//                 if (lineId) params.append('line', lineId);
//                 if (sublineId) params.append('subline', sublineId);
//                 if (stationId) params.append('station', stationId);

//                 const response = await fetch(`${baseUrl}?${params.toString()}`);
//                 if (!response.ok) throw new Error('Failed to fetch data');

//                 const apiData = await response.json();

//                 // --- LOGIC TO FILL MISSING MONTHS WITH ZEROS ---

//                 // 1. Create empty arrays for 12 months filled with 0
//                 const filledRequired = new Array(12).fill(0);
//                 const filledAvailable = new Array(12).fill(0);

//                 // 2. Loop through API data and place values in the correct month index
//                 if (apiData && apiData.length > 0) {
//                     apiData.forEach((item: any) => {
//                         const date = new Date(item.month_year);
//                         const calendarMonth = date.getMonth(); // 0 = Jan, ... 11 = Dec

//                         // CHANGED: Map Calendar Month to Financial Year Index
//                         // Apr (3) -> Index 0
//                         // Jan (0) -> Index 9

//                         let chartIndex = calendarMonth - 3;
//                         if (chartIndex < 0) {
//                             chartIndex += 12;
//                         }

//                         // Mapping backend fields to arrays
//                         filledRequired[chartIndex] = item.manpower_required;
//                         filledAvailable[chartIndex] = item.manpower_available;
//                     });
//                 }

//                 // 3. Update State
//                 setData1(filledRequired);
//                 setData2(filledAvailable);

//             } catch (err: any) {
//                 console.error(err);
//                 setError(err.message);
//                 setData1(new Array(12).fill(0));
//                 setData2(new Array(12).fill(0));
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchPlanningData();
//     }, [hqId, factoryId, departmentId, lineId, sublineId, stationId]);

//     if (loading) return <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>;

//     return (
//         <div className="w-full h-full bg-white flex flex-col">
//             <h3 className="text-lg font-medium text-gray-900 p-4 pb-2">Manpower Availability - Required vs Available</h3>
//             <div className="flex-1 w-full px-2">
//                 <LineGraph
//                     labels={labels}
//                     data1={data1}
//                     data2={data2}
//                     area={true}
//                     showSecondLine={true}
//                     label1="Manpower Required"
//                     label2="Manpower Available"
//                     line1Color="#46b1f0ff"
//                     line2Color="#1c126eff"
//                     area1Color="rgba(79, 70, 229, 0.1)"
//                     area2Color="rgba(16, 160, 185, 0.1)"
//                     height="100%"
//                     maintainAspectRatio={false}
//                 />
//             </div>
//         </div>
//     );
// };

// export default MonthPlanning;




// ============================================
// 4. MonthPlanning.tsx - Manpower Availability
// ============================================
import React, { useState, useEffect } from 'react';
import LineGraph from '../../LineGraph/linegraph';

interface MonthPlanningProps {
  hqId: string;
  factoryId: string;
  departmentId: string;
  lineId: string;
  sublineId: string;
  stationId: string;
  financialYear: string; // NEW
}

const MonthPlanning: React.FC<MonthPlanningProps> = ({
  hqId, factoryId, departmentId, lineId, sublineId, stationId, financialYear
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [labels, setLabels] = useState<string[]>([
    "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"
  ]);
  const [data1, setData1] = useState<number[]>([]);
  const [data2, setData2] = useState<number[]>([]);

  useEffect(() => {
    const fetchPlanningData = async () => {
      try {
        setLoading(true);
        setError(null);

        const baseUrl = 'http://172.25.0.51:8000/chart/month-planning/';
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

        const response = await fetch(`${baseUrl}?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch data');

        const apiData = await response.json();

        const filledRequired = new Array(12).fill(0);
        const filledAvailable = new Array(12).fill(0);

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
              filledRequired[chartIndex] = item.manpower_required || 0;
              filledAvailable[chartIndex] = item.manpower_available || 0;
            }
          });
        }

        setData1(filledRequired);
        setData2(filledAvailable);

      } catch (err: any) {
        console.error(err);
        setError(err.message);
        setData1(new Array(12).fill(0));
        setData2(new Array(12).fill(0));
      } finally {
        setLoading(false);
      }
    };

    fetchPlanningData();
  }, [hqId, factoryId, departmentId, lineId, sublineId, stationId, financialYear]);

  if (loading) return <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>;

  return (
    <div className="w-full h-full bg-white flex flex-col">
      <h3 className="text-lg font-medium text-gray-900 p-4 pb-2">
        Manpower Availability - Required vs Available
        {financialYear && (
          <span className="text-sm font-normal text-gray-500 ml-2">
            (FY {financialYear}-{parseInt(financialYear) + 1})
          </span>
        )}
      </h3>
      <div className="flex-1 w-full px-2">
        <LineGraph
          labels={labels}
          data1={data1}
          data2={data2}
          area={true}
          showSecondLine={true}
          label1="Manpower Required"
          label2="Manpower Available"
          line1Color="#46b1f0ff"
          line2Color="#1c126eff"
          area1Color="rgba(79, 70, 229, 0.1)"
          area2Color="rgba(16, 160, 185, 0.1)"
          height="100%"
          maintainAspectRatio={false}
        />
      </div>
    </div>
  );
};

export default MonthPlanning;
