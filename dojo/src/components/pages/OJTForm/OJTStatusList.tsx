

import { useState } from "react";
import Level2OJTStatusList from "./Level2OJTStatusList";  // ✅ correct casing

import Level3OJTStatusList from "./Level3OJTStatusList";
import ErrorBoundary from "./ErrorBoundary"; // 👈 create this

const LevelSelector = () => {
  const [selectedLevel, setSelectedLevel] = useState<string>("level2");

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Dropdown */}
      <div className="max-w-2xl mx-auto mb-6">
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select Level --</option>
          <option value="level2">Level 2</option>
          <option value="level3">Level 3</option>
        </select>
      </div>

      {/* Conditional Rendering with ErrorBoundary */}
      {selectedLevel === "level2" && <Level2OJTStatusList />}
      {selectedLevel === "level3" && (
        <ErrorBoundary>
          <Level3OJTStatusList />
        </ErrorBoundary>
      )}
    </div>
  );
};

export default LevelSelector;
