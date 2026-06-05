import React, { useEffect, useState } from "react";
import { getDepartments, saveStationSettings } from "../../hooks/ServiceApis";
import {
  Building,
  MapPin,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import type { StationSettingPayload } from "../../constants/types";

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
  lines: Line[];
}

const StationSettings: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<number | "">("");
  const [selectedStation, setSelectedStation] = useState<number | "">("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkOptions = ["CTQ", "PDI", "OTHER", "MARU A", "CRITICAL"];

  // Fetch departments and stations
  useEffect(() => {
    const loadData = async () => {
      try {
        const deptData: Department[] = await getDepartments();
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

  const resetForm = () => {
    setSelectedDept("");
    setSelectedStation("");
    setSelectedOptions([]);
    setMessage(null);
    setError(null);
  };

  const handleOptionChange = (option: string) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter(item => item !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

 const handleSave = async () => {
  setError(null);
  setMessage(null);

  if (!selectedDept || !selectedStation) {
    setError("Please select Department and Station");
    return;
  }

  if (selectedOptions.length === 0) {
    setError("Please select at least one option");
    return;
  }

  try {
    setSubmitting(true);

    const payload: StationSettingPayload = {
      department_id: selectedDept as number,
      station_id: selectedStation as number,
      options: selectedOptions
    };

    const response = await saveStationSettings(payload);

    if (response.ok) {
      setMessage("Station settings saved successfully");
    } else {
      const errorData = await response.json();
      setError("Failed to save settings: " + JSON.stringify(errorData));
    }
  } catch (err) {
    console.error(err);
    setError("Failed to save settings");
  } finally {
    setSubmitting(false);
  }
};


  const getStations = () => {
    const dept = departments.find((d) => d.department_id === selectedDept);
    if (!dept) return [];

    // Extract all stations from all sublines in all lines
    const stations: Station[] = [];
    dept.lines.forEach(line => {
      line.sublines.forEach(subline => {
        stations.push(...subline.stations);
      });
    });

    return stations;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Station Settings
          </h1>
          <p className="text-lg text-gray-600">
            Configure department and station details
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <Building className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">
              Update Station Settings
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-600">Loading...</div>
          ) : (
            <div className="space-y-6">
              {/* Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Department */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Building className="h-4 w-4 mr-2 text-gray-500" />
                    Department
                  </label>
                  <select
                    value={selectedDept}
                    onChange={(e) => {
                      setSelectedDept(e.target.value ? Number(e.target.value) : "");
                      setSelectedStation("");
                      setSelectedOptions([]);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.department_id} value={d.department_id}>
                        {d.department_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Station */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    Station
                  </label>
                  <select
                    value={selectedStation}
                    onChange={(e) => {
                      setSelectedStation(e.target.value ? Number(e.target.value) : "");
                      setSelectedOptions([]);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500"
                    disabled={!selectedDept}
                  >
                    <option value="">Select Station</option>
                    {getStations().map((st) => (
                      <option key={st.station_id} value={st.station_id}>
                        {st.station_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Checkboxes - Only show when both department and station are selected */}
              {selectedDept && selectedStation && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Select Options (You can select multiple)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {checkOptions.map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedOptions.includes(option)}
                          onChange={() => handleOptionChange(option)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Selected: {selectedOptions.join(", ") || "None"}
                  </p>
                </div>
              )}

              {/* Success / Error */}
              {message && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">{message}</span>
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-red-800 font-medium">{error}</span>
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition"
                >
                  <RotateCcw className="inline h-5 w-5 mr-2" />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={submitting || !selectedDept || !selectedStation || selectedOptions.length === 0}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition transform hover:scale-105 shadow-lg disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full inline-block"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="inline h-5 w-5 mr-2" />
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StationSettings;