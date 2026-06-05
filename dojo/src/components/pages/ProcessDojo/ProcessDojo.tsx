import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLevels } from '../../hooks/ServiceApis';

interface Level {
  level_id?: number;
  level_name?: string;
  name: string;
  subheading: string;
}

interface ApiLevel {
  level_id: number;
  level_name: string;
  days: Array<{
    days_id: number;
    day: string;
  }>;
  topics: Array<{
    topic_id: number;
    topic_name: string;
    subtopics: any[];
  }>;
}

const ProcessDojo: React.FC = () => {
  const navigate = useNavigate();
  const [apiLevels, setApiLevels] = useState<ApiLevel[]>([]);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const data = await getLevels();
        console.log('Levels:', data);
        setApiLevels(data);
      } catch (error) {
        console.error('Error fetching levels:', error);
      }
    };

    fetchLevels();
  }, []);

  const [levels] = useState<Level[]>([
    {
      name: 'Level 0',
      subheading: '',
    },
    {
      name: 'Level 1',
      subheading: 'Basic Training DOJO',
    },
    {
      name: 'Level 2',
      subheading: '',
    },
    {
      name: 'Level 3',
      subheading: '',
    },
    {
      name: 'Level 4',
      subheading: '',
    },
    {
      name: 'Multiskilling',
      subheading: '',
    },
    {
      name: 'Refresher Training',
      subheading: '',
    },
    {
      name: 'HANCHOU',
      subheading: '',
    },
    {
      name: 'SHOKU CHOU',
      subheading: '',
    },
  ]);

  // Function to find API level data by level name
  const findApiLevelData = (levelName: string) => {
    return apiLevels.find(apiLevel => 
      apiLevel.level_name.toLowerCase() === levelName.toLowerCase()
    );
  };

  const handleClick = (level: Level) => {
    let route = '';
    let stateData = {};

    // Find corresponding API data for levels 1-4
    const apiLevelData = findApiLevelData(level.name);

    if (apiLevelData) {
      stateData = {
        levelId: apiLevelData.level_id,
        levelName: apiLevelData.level_name
      };
    }
    

    // Route mapping
    switch (level.name) {
      case 'Level 0':
        route = '/Level0';
        break;
      case 'Level 1':
        route = '/Level1';
        break;
      case 'Level 2':
        route = '/Levelwise';
        break;
      case 'Level 3':
        route = '/Levelwise';
        break;
      case 'Level 4':
        route = '/Levelwise';
        break;
      case 'Multiskilling':
        route = '/allocation';
        break;
      case 'Refresher Training':
        route = '/refreshment';
        break;
      case 'HANCHOU':
        route = '/Hanchou';
        break;
      case 'SHOKU CHOU':
        route = '/Shokuchou';
        break;
      default:
        route = '/UnderDevelopment';
    }

    // Navigate with state data
    navigate(route, { state: stateData });
  };

  const getGradientStyle = (index: number) => {
    const gradients = [
      'linear-gradient(90deg, #9c27b0, #673ab7)',      // purple
      'linear-gradient(90deg, #03a9f4, #00bcd4)',      // light-blue
      'linear-gradient(90deg, #4caf50, #8bc34a)',      // light-green
      'linear-gradient(90deg, #ff9800, #f44336)',      // orange
      'linear-gradient(90deg, #1976d2, #303f9f)',      // dark-blue
      'linear-gradient(90deg, #f44336, #e91e63)'       // red
    ];

    return gradients[index % gradients.length];
  };

  return (
    <div>
      <div className="mx-auto px-4 py-8 pt-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((level, index) => {
            const gradientStyle = getGradientStyle(index);

            return (
              <div
                key={index}
                onClick={() => handleClick(level)}
                className={`
                  bg-white border border-gray-200 rounded-lg cursor-pointer 
                  shadow-md hover:shadow-lg transition-all duration-300 
                  h-[220px] w-full flex flex-col
                  relative overflow-hidden
                  group
                `}
              >
                {/* Gradient border top */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ background: gradientStyle }}
                ></div>

                <div className="p-5 flex-1 flex flex-col">
                  {level.subheading && (
                    <h3 className="text-2xl font-bold text-[#1c2a4d] mb-1 group-hover:text-white transition-colors duration-300 z-10">
                      {level.subheading}
                    </h3>
                  )}
                  <h3 className="text-2xl font-bold text-gray-600 group-hover:text-white transition-colors duration-300 z-10">
                    {level.name}
                  </h3>
                </div>

                {/* Hover overlay effect - using the same gradient */}
                <div
                  className="absolute inset-0 w-0 group-hover:w-full transition-all duration-500 ease-out z-0 opacity-0 group-hover:opacity-100"
                  style={{ background: gradientStyle }}
                ></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProcessDojo;