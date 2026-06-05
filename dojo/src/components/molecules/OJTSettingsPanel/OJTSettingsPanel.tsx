// OJTSettingsPanel.tsx
import React, { useEffect, useState } from "react";
import { getDepartments, getLevels } from "../../hooks/ServiceApis";
import { Settings } from "lucide-react";
import TopicsSection from "../TopicsSection/TopicsSection";
import DaysSection from "../DaysSection/DaysSection";
import ScoreRangesSection from "../ScoreRangesSection/ScoreRangesSection";
import PassingCriteriaSection from "../PassingCriteriaSection/PassingCriteriaSection";
import QuantityScoreRangesSection from "../QuantityScoreRangesSection/QuantityScoreRangesSection";
import QuantityPassingCriteriaSection from "../QuantityPassingCriteriaSection/QuantityPassingCriteriaSection";
import { ojtApi } from "../../hooks/ServiceApis"; // make sure this is imported
import type { AssessmentMode } from "../../constants/types";

interface Department {
  department_id: number;
  department_name: string;
}

interface Level {
  level_id: number;
  level_name: string;
}

interface TransformedDepartment {
  id: number;
  name: string;
}

interface TransformedLevel {
  id: number;
  name: string;
}

const OJTSettingsPanel: React.FC = () => {
  const [departments, setDepartments] = useState<TransformedDepartment[]>([]);
  const [levels, setLevels] = useState<TransformedLevel[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const [assessmentMode, setAssessmentMode] = useState<AssessmentMode>('quality');

  // Fetch departments and levels
  useEffect(() => {
    const loadData = async () => {
      try {
        const deptData: Department[] = await getDepartments();
        const levelData: Level[] = await getLevels();

        setDepartments(
          deptData.map((dept) => ({ id: dept.department_id, name: dept.department_name }))
        );
        setLevels(
          levelData.map((level) => ({ id: level.level_id, name: level.level_name }))
        );
      } catch (error) {
        console.error("Error loading departments or levels:", error);
      }
    };
    loadData();
  }, []);

  // Fetch assessment mode
  useEffect(() => {
    const fetchAssessmentMode = async () => {
      try {
        const data = await ojtApi.getAssessmentMode();
        setAssessmentMode(data.mode);
        console.log("Current assessment mode:", data.mode);
      } catch (error) {
        console.error("Error fetching assessment mode:", error);
      }
    };
    fetchAssessmentMode();
  }, []);

  return (
    <div className="bg-gradient-to-r from-gray-50 to-slate-100 border-b border-gray-200 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Form Customization</h2>
        </div>

        {/* Department & Level Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-4 bg-white rounded-xl shadow border border-gray-200">
            <h4 className="font-semibold text-gray-700 mb-2">Select Department</h4>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={selectedDepartment || ""}
              onChange={(e) => setSelectedDepartment(Number(e.target.value) || null)}
            >
              <option value="">Choose Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="p-4 bg-white rounded-xl shadow border border-gray-200">
            <h4 className="font-semibold text-gray-700 mb-2">Select Level</h4>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={selectedLevel || ""}
              onChange={(e) => setSelectedLevel(Number(e.target.value) || null)}
            >
              <option value="">Choose Level</option>
              {levels.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  {lvl.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Conditional Configuration Sections */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {assessmentMode === "quality" ? (
              <>
                <TopicsSection
                  selectedDepartment={selectedDepartment}
                  selectedLevel={selectedLevel}
                />
                <DaysSection
                  selectedDepartment={selectedDepartment}
                  selectedLevel={selectedLevel}
                />
                <ScoreRangesSection
                  selectedDepartment={selectedDepartment}
                  selectedLevel={selectedLevel}
                />
                <PassingCriteriaSection
                  selectedDepartment={selectedDepartment}
                  selectedLevel={selectedLevel}
                />
              </>
            ) : (
              <>
                <QuantityScoreRangesSection
                  selectedDepartment={selectedDepartment}
                  selectedLevel={selectedLevel}
                />
                <QuantityPassingCriteriaSection
                  selectedDepartment={selectedDepartment}
                  selectedLevel={selectedLevel}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OJTSettingsPanel;
