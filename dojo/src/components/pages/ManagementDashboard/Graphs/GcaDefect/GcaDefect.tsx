import React, { useEffect, useState } from "react";
import BarChart from "../../Barchart/barchart";

// 1. Define Props
interface GcaDefectsProps {
  hqId?: string;
  factoryId?: string;
  departmentId?: string;
  lineId?: string;
  sublineId?: string;
  stationId?: string;
}

const API_BASE_URL = "http://127.0.0.1:8000";

const GcaDefects: React.FC<GcaDefectsProps> = ({
  hqId, factoryId, departmentId, lineId, sublineId, stationId
}) => {
  // State for data
  const [gcaData, setGcaData] = useState<number[]>([]);
  
  // Standard 12-Month Labels
  const [labels] = useState<string[]>([
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGcaData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build URL Params
        const params = new URLSearchParams();
        params.append('year', '2025'); // Force 2025
        
        if (hqId) params.append('hq', hqId);
        if (factoryId) params.append('factory', factoryId);
        if (departmentId) params.append('department', departmentId);
        if (lineId) params.append('line', lineId);
        if (sublineId) params.append('subline', sublineId);
        if (stationId) params.append('station', stationId);

        const response = await fetch(`${API_BASE_URL}/chart/gca-defects/?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const apiData = await response.json();

        // --- ZERO FILLING LOGIC ---
        const filledGca = new Array(12).fill(0);

        if (apiData && apiData.length > 0) {
          apiData.forEach((item: any) => {
            // "2025-10" -> Index 9
            const date = new Date(item.month_year);
            const monthIndex = date.getMonth(); 
            
            filledGca[monthIndex] = item.gca_defects;
          });
        }

        setGcaData(filledGca);

      } catch (err) {
        console.error("Error fetching GCA defects:", err);
        setError("Failed to load data");
        setGcaData(new Array(12).fill(0));
      } finally {
        setLoading(false);
      }
    };

    fetchGcaData();
  }, [hqId, factoryId, departmentId, lineId, sublineId, stationId]);

  const title = "GCA Defects";

  return (
    <div className="bg-white rounded-lg overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="p-2 flex-1">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-500">Loading data...</p>
          </div>
        ) : (
          <div className="w-full h-full">
             {/* Key forces re-render on filter change */}
            <BarChart
              key={`${hqId}-${factoryId}-${stationId}`}
              labels={labels}
              data1={gcaData}
              data2={[]} // Empty array for 2nd bar (Single Bar Mode)
              groupLabels={["GCA Defects", ""]} // Only label the first one
              title=""
              color1="rgba(68, 148, 239, 0.8)" // Red color for defects
              color2="transparent"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GcaDefects;