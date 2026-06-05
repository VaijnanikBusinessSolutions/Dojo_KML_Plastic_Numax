import React, { useEffect, useState } from "react";
import { getDepartments, getStationSettings } from "../../hooks/ServiceApis";
import {
  Building,
  MapPin,
  AlertCircle,
  Eye,
  Package,
} from "lucide-react";

interface StationSetting {
  department_id: number;
  department_name: string;
  station_id: number;
  station_name: string;
  all_options: string[];
}

const StationConfiguration: React.FC = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState<number | "">("");
  const [stations, setStations] = useState<StationSetting[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch departments
  useEffect(() => {
    const loadData = async () => {
      try {
        const deptData = await getDepartments();
        setDepartments(deptData);
      } catch (err) {
        console.error("Error loading departments:", err);
        setError("Failed to load department data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedDept) return;

    const loadSettings = async () => {
      try {
        const data: StationSetting[] = await getStationSettings(selectedDept);
        
        // Process the API response to get unique stations
        const uniqueStations: Record<number, StationSetting> = {};
        
        data.forEach(item => {
          // Create or update station entry
          if (!uniqueStations[item.station_id]) {
            uniqueStations[item.station_id] = {
              ...item,
              all_options: [...item.all_options]
            };
          }
        });
        
        setStations(Object.values(uniqueStations));
      } catch (err) {
        console.error("Failed to load station settings:", err);
        setError("Failed to load station settings");
      }
    };

    loadSettings();
  }, [selectedDept]);

  const resetForm = () => {
    setSelectedDept("");
    setStations([]);
    setError(null);
  };

  const getSelectedDepartmentName = () => {
    if (!selectedDept || stations.length === 0) return "";
    return stations[0].department_name;
  };

  const getOptionColor = (option: string) => {
    const colors = {
      'CTQ': 'bg-blue-100 text-blue-800 border-blue-200',
      'PDI': 'bg-green-100 text-green-800 border-green-200',
      'OTHER': 'bg-gray-100 text-gray-800 border-gray-200',
      'MARU A': 'bg-purple-100 text-purple-800 border-purple-200',
      'CRITICAL': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[option as keyof typeof colors] || 'bg-orange-100 text-orange-800 border-orange-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Eye className="h-8 w-8 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Station Configuration
            </h1>
          </div>
          <p className="text-lg text-gray-600 ml-11">
            View station options for each department
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 backdrop-blur-sm">
          <div className="flex items-center mb-8">
            <Building className="h-7 w-7 text-indigo-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">
              Station Options Overview
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center px-6 py-3 bg-indigo-50 rounded-full">
                <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                <span className="text-indigo-700 font-medium">Loading departments...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Department Selection */}
              <div className="max-w-md">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <Building className="h-4 w-4 mr-2 text-gray-500" />
                  Select Department
                </label>
                <div className="relative">
                  <select
                    value={selectedDept}
                    onChange={(e) => {
                      setSelectedDept(e.target.value ? Number(e.target.value) : "");
                    }}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 appearance-none cursor-pointer transition-all duration-200 hover:border-gray-400"
                  >
                    <option value="">Choose a department...</option>
                    {departments.map((d) => (
                      <option key={d.department_id} value={d.department_id}>
                        {d.department_name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Stations Display - Only show when department is selected */}
              {selectedDept && stations.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center mb-6">
                    <Package className="h-6 w-6 text-indigo-600 mr-3" />
                    <h3 className="text-xl font-bold text-gray-800">
                      Stations in {getSelectedDepartmentName()}
                    </h3>
                    <span className="ml-3 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                      {stations.length} station{stations.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {stations.map(station => (
                      <div 
                        key={station.station_id} 
                        className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-center mb-4">
                          <MapPin className="h-5 w-5 mr-3 text-indigo-600" />
                          <h4 className="font-bold text-lg text-gray-900">{station.station_name}</h4>
                        </div>
                        
                        {station.all_options && station.all_options.length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-600 mb-3">
                              Configured Options ({station.all_options.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {station.all_options.map((option, index) => (
                                <div
                                  key={index}
                                  className={`px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all duration-200 ${getOptionColor(option)}`}
                                >
                                  {option}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <div className="w-12 h-12 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-medium">No options configured</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No stations message */}
              {selectedDept && stations.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">No stations found for this department</p>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
                  <span className="text-red-800 font-medium">{error}</span>
                </div>
              )}

              {/* Reset Button - Only show when department is selected */}
              {selectedDept && (
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-105"
                  >
                    <Package className="inline h-5 w-5 mr-2" />
                    View Another Department
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StationConfiguration;