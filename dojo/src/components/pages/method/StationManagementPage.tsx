import React, { useState } from 'react';
import { Home, Settings, Sliders } from "lucide-react";
import StationSettings from "../../molecules/stationsetting/stationsetting";
import StationConfiguration from "../../molecules/StationConfiguration/StationConfiguration";
import StationRequirementPage from './StationRequirementPage';

const tabs = [
  { key: 'station-requirement', label: 'Station Requirement',icon: Home },
  // { key: 'station-settings', label: 'Station Settings', icon: Settings },
  { key: 'station-configuration', label: 'Station Configuration', icon: Sliders },

];

const StationManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(tabs[0].key);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Station Management</h1>
          <p className="text-lg text-gray-600">Monitor and configure station settings and configurations</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200 bg-white rounded-t-2xl shadow-sm">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`${activeTab === tab.key
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm rounded-t-lg transition-all duration-200 flex items-center space-x-2`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'station-requirement' && <StationRequirementPage />}
          {/* {activeTab === 'station-settings' && <StationSettings />} */}
          {activeTab === 'station-configuration' && <StationConfiguration />}

        </div>
      </div>
    </div>
  );
};

export default StationManagementPage;