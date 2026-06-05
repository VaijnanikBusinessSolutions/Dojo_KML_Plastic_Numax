// // import React from 'react';
// import LineGraph from '../../LineGraph/linegraph';
// import React, { useState, useEffect } from 'react';


// interface TrainingProps {
//   hqId: string;
//   factoryId: string;
//   departmentId: string;
// }


// const Training: React.FC<TrainingProps> = ({ hqId, factoryId, departmentId }) => {
//     const [loading, setLoading] = useState<boolean>(true);
//     const [error, setError] = useState<string | null>(null);
//     const [labels, setLabels] = useState<string[]>([]);
//     const [data1, setData1] = useState<number[]>([]);
//     const [data2, setData2] = useState<number[]>([]);

//     // Sample data to use if API fails
    
    
//     useEffect(() => {
//         const fetchTrainingData = async () => {
//             try {
//                 setLoading(true);
//                 setError(null);
                
//                 // --- DYNAMIC API CALL ---
//                 // 1. Base URL for the operators chart data
//                 const baseUrl = 'http://172.25.0.51:8000/chart/operators/';

//                 // 2. Build query parameters based on the selected filters
//                 const params = new URLSearchParams();
//                 if (hqId) params.append('hq', hqId);
//                 if (factoryId) params.append('factory', factoryId);
//                 if (departmentId) params.append('department', departmentId);

//                 // 3. Construct the final URL
//                 const apiUrl = `${baseUrl}?${params.toString()}`;

//                 // 4. Fetch data from the live API
//                 const response = await fetch(apiUrl);
//                 if (!response.ok) {
//                     throw new Error(`API request failed with status ${response.status}`);
//                 }
//                 const data = await response.json();

//                 // If the API returns no data, show an empty state or message
//                 if (!data || data.length === 0) {
//                     setLabels([]);
//                     setData1([]);
//                     setData2([]);
//                     // Optional: You could set a specific message here
//                     // setError("No data available for the selected filters.");
//                     return; // Exit the function early
//                 }

//                 // The rest of the logic is the same, just using the live 'data'
//                 const sortedData = [...data].sort((a, b) =>
//                     new Date(a.month_year).getTime() - new Date(b.month_year).getTime()
//                 );

//                 const months = sortedData.map(item => {
//                     const date = new Date(item.month_year);
//                     const monthShort = date.toLocaleString('default', { month: 'short' });
//                     const yearShort = date.getFullYear().toString().slice(-2);
//                     return `${monthShort} ${yearShort}`;
//                 });
                
//                 // The serializer for this chart renames the fields
//                 const joined = sortedData.map(item => item.operators_joined);
//                 const trained = sortedData.map(item => item.operators_trained);
                
//                 setLabels(months);
//                 setData1(joined);
//                 setData2(trained);
                
//             } catch (err: any) {
//                 console.error("Error fetching training data:", err);
//                 setError(`Failed to load data: ${err.message}`);
//                 // Clear out old data on error
//                 setLabels([]);
//                 setData1([]);
//                 setData2([]);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchTrainingData();
//     }, [hqId, factoryId, departmentId]); // NEW: Dependency array ensures this runs on filter changes

//     if (loading) {
//         return (
//             <div className="w-full h-full flex items-center justify-center">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
//                     <p className="text-gray-500 text-sm mt-2">Loading data...</p>
//                 </div>
//             </div>
//         );
//     }
    
//     if (error) {
//         return (
//             <div className="w-full h-full flex items-center justify-center">
//                 <div className="text-center text-red-500">
//                     <p>{error}</p>
//                     <p className="text-sm text-gray-500">Showing sample data instead</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="w-full h-full">
//             <div className="bg-white h-full flex flex-col">
//                 <h3 className="text-lg font-medium text-gray-900 p-4 pb-2">Operators Training - Joined vs Trained</h3>
//                 <div className="flex-1 w-full px-2">
//                     <LineGraph
//                         labels={labels}
//                         data1={data1} 
//                         data2={data2}  
//                         area={true}
//                         showSecondLine={true}
//                         label1="Operators Joined"
//                         label2="Operators Trained"
//                         line1Color="#4f46e5"
//                         line2Color="#10b981"
//                         area1Color="rgba(79, 70, 229, 0.1)"
//                         area2Color="rgba(16, 185, 129, 0.1)"
//                         height="100%"
//                         maintainAspectRatio={false}
//                     />
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Training;



// import React, { useState, useEffect } from 'react';
// import LineGraph from '../../LineGraph/linegraph';

// interface TrainingProps {
//   hqId: string;
//   factoryId: string;
//   departmentId: string;
//   lineId: string;
//   sublineId: string;
//   stationId: string;
// }

// const Training: React.FC<TrainingProps> = ({ 
//   hqId, factoryId, departmentId, lineId, sublineId, stationId 
// }) => {
//     const [loading, setLoading] = useState<boolean>(true);
//     const [error, setError] = useState<string | null>(null);
    
//     // Labels ordered for Financial Year (Apr - Mar)
//     const [labels] = useState<string[]>([
//         "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"
//     ]);
//     const [data1, setData1] = useState<number[]>([]);
//     const [data2, setData2] = useState<number[]>([]);

//     useEffect(() => {
//         const fetchTrainingData = async () => {
//             try {
//                 setLoading(true);
//                 setError(null);
                
//                 const baseUrl = 'http://172.25.0.51:8000/chart/operators/';
//                 const params = new URLSearchParams();

//                 // --- DYNAMIC FINANCIAL YEAR CALCULATION ---
//                 const today = new Date();
//                 const currentMonth = today.getMonth(); // 0 = Jan, 11 = Dec
//                 const currentYear = today.getFullYear();
                
//                 // If we are in Jan, Feb, or Mar (0, 1, 2), the FY started last year.
//                 // Example: Jan 2026 belongs to FY 2025-2026 (Start Year 2025)
//                 // Example: Apr 2025 belongs to FY 2025-2026 (Start Year 2025)
//                 const fyStartYear = currentMonth < 3 ? currentYear - 1 : currentYear;

//                 params.append('year', fyStartYear.toString()); 
                
//                 if (hqId) params.append('hq', hqId);
//                 if (factoryId) params.append('factory', factoryId);
//                 if (departmentId) params.append('department', departmentId);
//                 if (lineId) params.append('line', lineId);
//                 if (sublineId) params.append('subline', sublineId);
//                 if (stationId) params.append('station', stationId);

//                 const response = await fetch(`${baseUrl}?${params.toString()}`);
//                 if (!response.ok) throw new Error('Failed to fetch data');
                
//                 const apiData = await response.json();

//                 // 1. Create empty arrays for 12 months filled with 0
//                 const filledJoined = new Array(12).fill(0);
//                 const filledTrained = new Array(12).fill(0);

//                 // 2. Map Data
//                 if (apiData && apiData.length > 0) {
//                     apiData.forEach((item: any) => {
//                         // Backend returns 'month' as integer 1-12
//                         const m = item.month; 
                        
//                         let chartIndex = -1;

//                         // Logic: Map Calendar Month (1-12) to Financial Year Index (0-11)
//                         // Apr(4) -> 0, Dec(12) -> 8
//                         // Jan(1) -> 9, Mar(3) -> 11
//                         if (m >= 4) {
//                             chartIndex = m - 4;
//                         } else {
//                             chartIndex = m + 8;
//                         }
                        
//                         // Safety check
//                         if (chartIndex >= 0 && chartIndex < 12) {
//                             filledJoined[chartIndex] = item.operators_joined;
//                             filledTrained[chartIndex] = item.operators_trained;
//                         }
//                     });
//                 }

//                 setData1(filledJoined);
//                 setData2(filledTrained);
                
//             } catch (err: any) {
//                 console.error(err);
//                 setError(err.message);
//                 setData1(new Array(12).fill(0));
//                 setData2(new Array(12).fill(0));
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchTrainingData();
//     }, [hqId, factoryId, departmentId, lineId, sublineId, stationId]); 

//     if (loading) return <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>;

//     return (
//         <div className="w-full h-full bg-white flex flex-col">
//             <h3 className="text-lg font-medium text-gray-900 p-4 pb-2">Operators Training</h3>
//             <div className="flex-1 w-full px-2">
//                 <LineGraph
//                     labels={labels}
//                     data1={data1} 
//                     data2={data2}  
//                     area={true}
//                     showSecondLine={true}
//                     label1="Operators Joined"
//                     label2="Operators Trained"
//                     line1Color="#46b1f0ff"
//                     line2Color="#1c126eff"
//                     area1Color="rgba(79, 70, 229, 0.1)"
//                     area2Color="rgba(16, 185, 129, 0.1)"
//                     maintainAspectRatio={false}
//                 />
//             </div>
//         </div>
//     );
// };

// export default Training;



import React, { useState, useEffect } from 'react';
import LineGraph from '../../LineGraph/linegraph';

interface TrainingProps {
  hqId: string;
  factoryId: string;
  departmentId: string;
  lineId: string;
  sublineId: string;
  stationId: string;
  financialYear: string; // NEW: Receive selected financial year from parent
}

const Training: React.FC<TrainingProps> = ({ 
  hqId, factoryId, departmentId, lineId, sublineId, stationId, financialYear 
}) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    // Labels ordered for Financial Year (Apr - Mar)
    const [labels] = useState<string[]>([
        "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"
    ]);
    const [data1, setData1] = useState<number[]>([]);
    const [data2, setData2] = useState<number[]>([]);

    useEffect(() => {
        const fetchTrainingData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const baseUrl = 'http://172.25.0.51:8000/chart/operators/';
                const params = new URLSearchParams();

                // --- USE SELECTED FINANCIAL YEAR ---
                // If financialYear prop is provided, use it; otherwise calculate current FY
                let fyStartYear: number;
                
                if (financialYear) {
                    // Use the selected financial year from dropdown
                    fyStartYear = parseInt(financialYear);
                } else {
                    // Fallback: Calculate current financial year
                    const today = new Date();
                    const currentMonth = today.getMonth(); // 0 = Jan, 11 = Dec
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

                // 1. Create empty arrays for 12 months filled with 0
                const filledJoined = new Array(12).fill(0);
                const filledTrained = new Array(12).fill(0);

                // 2. Map Data
                if (apiData && apiData.length > 0) {
                    apiData.forEach((item: any) => {
                        // Backend returns 'month' as integer 1-12
                        const m = item.month; 
                        
                        let chartIndex = -1;

                        // Logic: Map Calendar Month (1-12) to Financial Year Index (0-11)
                        // Apr(4) -> 0, May(5) -> 1, ..., Dec(12) -> 8
                        // Jan(1) -> 9, Feb(2) -> 10, Mar(3) -> 11
                       if (m >= 4 && m <= 12) {
            chartIndex = m - 4;
        } else if (m >= 1 && m <= 3) {
            chartIndex = m + 8;
        }
                        
                        // Safety check
                        if (chartIndex >= 0 && chartIndex < 12) {
                            filledJoined[chartIndex] = item.operators_joined || 0;
                            filledTrained[chartIndex] = item.operators_trained || 0;
                        }
                    });
                }

                setData1(filledJoined);
                setData2(filledTrained);
                
            } catch (err: any) {
                console.error('Error fetching training data:', err);
                setError(err.message);
                setData1(new Array(12).fill(0));
                setData2(new Array(12).fill(0));
            } finally {
                setLoading(false);
            }
        };

        fetchTrainingData();
    }, [hqId, factoryId, departmentId, lineId, sublineId, stationId, financialYear]); // Added financialYear to dependencies

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                    <div className="animate-pulse">Loading training data...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full text-red-500">
                <div className="text-center">
                    <p>Error loading data</p>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-white flex flex-col">
            <h3 className="text-lg font-medium text-gray-900 p-4 pb-2">
                Operators Training
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
                    label1="Operators Joined"
                    label2="Operators Trained"
                    line1Color="#46b1f0ff"
                    line2Color="#1c126eff"
                    area1Color="rgba(79, 70, 229, 0.1)"
                    area2Color="rgba(16, 185, 129, 0.1)"
                    maintainAspectRatio={false}
                />
            </div>
        </div>
    );
};

export default Training;