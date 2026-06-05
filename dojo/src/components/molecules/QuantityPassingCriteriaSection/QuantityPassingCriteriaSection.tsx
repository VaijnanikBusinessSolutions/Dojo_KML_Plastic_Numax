// QuantityPassingCriteriaSection.tsx
import React, { useEffect, useState } from "react";
import { ojtApi } from "../../hooks/ServiceApis";
import { Target, Save, Edit3, X, Trash2, Plus } from "lucide-react";

interface QuantityPassingCriteria {
  id?: number;
  department: number;
  level: number;
  production_passing_percentage: number;
  rejection_passing_percentage: number;
}

interface Props {
  selectedDepartment: number | null;
  selectedLevel: number | null;
}

const QuantityPassingCriteriaSection: React.FC<Props> = ({
  selectedDepartment,
  selectedLevel,
}) => {
  const [criteria, setCriteria] = useState<QuantityPassingCriteria | null>(null);
  const [production, setProduction] = useState<number | "">("");
  const [rejection, setRejection] = useState<number | "">("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (selectedDepartment && selectedLevel) {
      fetchCriteria();
    } else {
      setCriteria(null);
      setProduction("");
      setRejection("");
    }
  }, [selectedDepartment, selectedLevel]);

  const fetchCriteria = async () => {
    try {
      const data = await ojtApi.getQuantityPassingCriteria(
        selectedDepartment!,
        selectedLevel!
      );

      if (data && data.length > 0) {
        const first = data[0]; // one record per department+level
        setCriteria(first);
        setProduction(first.production_passing_percentage);
        setRejection(first.rejection_passing_percentage);
      } else {
        setCriteria(null);
        setProduction("");
        setRejection("");
      }
    } catch (error) {
      console.error("Error fetching quantity criteria:", error);
      setCriteria(null);
    }
  };

  const handleSave = async () => {
    if (!selectedDepartment || !selectedLevel) {
      alert("Please select a department and level first");
      return;
    }

    if (production === "" || rejection === "") {
      alert("Please enter both production and rejection percentages");
      return;
    }

    const newData: QuantityPassingCriteria = {
      department: selectedDepartment,
      level: selectedLevel,
      production_passing_percentage: production as number,
      rejection_passing_percentage: rejection as number,
    };

    try {
      if (criteria?.id) {
        const updated = await ojtApi.updateQuantityPassingCriteria(
          criteria.id,
          newData
        );
        setCriteria(updated);
      } else {
        const created = await ojtApi.createQuantityPassingCriteria(newData);
        setCriteria(created);
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving quantity criteria:", error);
      alert("Failed to save criteria");
    }
  };

  const handleDelete = async () => {
    if (!criteria?.id) return;
    if (!window.confirm("Are you sure you want to delete this criteria?")) return;

    try {
      await ojtApi.deleteQuantityPassingCriteria(criteria.id);
      setCriteria(null);
      setProduction("");
      setRejection("");
    } catch (error) {
      console.error("Error deleting quantity criteria:", error);
      alert("Failed to delete criteria");
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-blue-600" />
        Quantity Passing Criteria
      </h3>

      {!selectedDepartment || !selectedLevel ? (
        <div className="p-3 text-center text-gray-500 text-sm">
          Please select a department and level
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={production}
                onChange={(e) =>
                  setProduction(e.target.value === "" ? "" : parseFloat(e.target.value))
                }
                disabled={!isEditing && !!criteria}
                placeholder="Production Passing %"
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-2 text-gray-400 text-sm">%</span>
            </div>

            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={rejection}
                onChange={(e) =>
                  setRejection(e.target.value === "" ? "" : parseFloat(e.target.value))
                }
                disabled={!isEditing && !!criteria}
                placeholder="Rejection Passing %"
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-2 text-gray-400 text-sm">%</span>
            </div>
          </div>

          <div className="flex gap-2">
            {criteria ? (
              isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4" /> Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )
            ) : (
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Create
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuantityPassingCriteriaSection;
