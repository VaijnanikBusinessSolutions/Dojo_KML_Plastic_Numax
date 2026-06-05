import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDepartments } from '../../hooks/ServiceApis';

interface LocationState {
  levelId?: number;
  levelName?: string;
}

interface Station {
  station_id: number;
  station_name: string;
  subline: number;
}

interface Subline {
  subline_id: number;
  subline_name: string;
  line: number;
  stations: Station[];
}

interface Line {
  line_id: number;
  line_name: string;
  department: number;
  sublines: Subline[];
}

interface Department {
  department_id: number;
  department_name: string;
  factory: number;
  lines: Line[];
}

const Level2: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { levelId, levelName } = (location.state as LocationState) || {};

  const [activeTab, setActiveTab] = useState(0);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await getDepartments();
        console.log('Departments:', data);
        setDepartments(data);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    fetchDepartments();
  }, []);

  // Predefined gradients
  const gradients = [
    'linear-gradient(90deg, #9c27b0, #673ab7)',
    'linear-gradient(90deg, #03a9f4, #00bcd4)',
    'linear-gradient(90deg, #4caf50, #8bc34a)',
    'linear-gradient(90deg, #ff9800, #f44336)',
    'linear-gradient(90deg, #1976d2, #303f9f)',
    'linear-gradient(90deg, #f44336, #e91e63)'
  ];

  const getGradientStyle = (index: number) => gradients[index % gradients.length];

  const activeDepartment = departments[activeTab];
  
  // Collect all stations from active department with their line and subline info
  const stationsWithHierarchy = activeDepartment
    ? activeDepartment.lines.flatMap((line: Line) =>
        line.sublines.flatMap((subline: Subline) =>
          subline.stations.map((station: Station) => ({
            ...station,
            line: {
              line_id: line.line_id,
              line_name: line.line_name
            },
            subline: {
              subline_id: subline.subline_id,
              subline_name: subline.subline_name
            },
            department: {
              department_id: activeDepartment.department_id,
              department_name: activeDepartment.department_name
            }
          }))
        )
      )
    : [];

  const handleStationClick = (stationWithHierarchy: any) => {
    navigate('/TrainingOptionsPage', {
      state: {
        // Station details
        stationId: stationWithHierarchy.station_id,
        stationName: stationWithHierarchy.station_name,
        
        // Subline details
        sublineId: stationWithHierarchy.subline.subline_id,
        sublineName: stationWithHierarchy.subline.subline_name,
        
        // Line details
        lineId: stationWithHierarchy.line.line_id,
        lineName: stationWithHierarchy.line.line_name,
        
        // Department details
        departmentId: stationWithHierarchy.department.department_id,
        departmentName: stationWithHierarchy.department.department_name,
        
        // Level details
        levelId: levelId,
        levelName: levelName,
      },
    });
  };

  return (
    <div className="p-4 scrollbar-hide">
    

      {/* Tabs for Departments */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {departments.map((dept, index) => (
            <button
              key={dept.department_id}
              onClick={() => setActiveTab(index)}
              className={`flex-1 whitespace-nowrap py-4 px-4 border-b-2 font-bold text-xl text-center ${
                activeTab === index
                  ? 'border-[#1c2a4d] text-[#1c2a4d]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {dept.department_name}
            </button>
          ))}
        </nav>
      </div>

      {/* Stations Grid */}
      <div className="mt-6">
        {stationsWithHierarchy.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {stationsWithHierarchy.map((station: any, index: number) => {
              const gradientStyle = getGradientStyle(index);

              return (
                <div
                  key={station.station_id}
                  className="p-6 w-full h-[100px] rounded-md shadow-sm bg-white cursor-pointer transition-all duration-300 hover:shadow-lg relative overflow-hidden group"
                  onClick={() => handleStationClick(station)}
                >
                  {/* Gradient left border */}
                  <div
                    className="absolute top-0 left-0 w-[6px] h-full rounded-l-md"
                    style={{ background: gradientStyle }}
                  ></div>

                  {/* Station Name */}
                  <div className="h-full flex flex-col z-10 relative">
                    <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-white transition-colors duration-300">
                      {station.station_name}
                    </h3>
                 
                  </div>

                  {/* Hover effect */}
                  <div
                    className="absolute inset-0 w-0 group-hover:w-full transition-all duration-500 ease-out z-0 opacity-0 group-hover:opacity-100"
                    style={{ background: gradientStyle }}
                  ></div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">No stations available</div>
        )}
      </div>
    </div>
  );
};

export default Level2;