// PassingCriteriaSection.tsx
import React, { useEffect, useState } from "react";
import { ojtApi } from "../../hooks/ServiceApis";
import { Target, Plus, Trash2, Save, Edit3, X } from "lucide-react";

// Define types for your data structures
interface Day {
  id: number;
  name: string;
}

interface PassingCriteria {
  id?: number;
  department: number;
  level: number;
  day: number | null; // null means applies to all days
  percentage: number;
}

interface PassingCriteriaSectionProps {
  selectedDepartment: number | null;
  selectedLevel: number | null;
}

const PassingCriteriaSection: React.FC<PassingCriteriaSectionProps> = ({
  selectedDepartment,
  selectedLevel
}) => {
  const [days, setDays] = useState<Day[]>([]);
  const [criteria, setCriteria] = useState<PassingCriteria[]>([]);
  const [newCriteriaDay, setNewCriteriaDay] = useState<string>("");
  const [newCriteriaPercentage, setNewCriteriaPercentage] = useState<number | "">("");
  const [editingCriteriaId, setEditingCriteriaId] = useState<number | null>(null);
  const [isEditingCriteria, setIsEditingCriteria] = useState<boolean>(false);

  // Fetch criteria when department & level selected
  useEffect(() => {
    if (selectedDepartment && selectedLevel) {
      fetchCriteria();
    } else {
      setCriteria([]);
      setDays([]);
      setNewCriteriaDay("");
      setNewCriteriaPercentage("");
    }
  }, [selectedDepartment, selectedLevel]);

  const fetchCriteria = async () => {
    try {
      // Load days first
      const dayData: Day[] = await ojtApi.getDays(selectedDepartment!, selectedLevel!);
      setDays(dayData);

      // Load existing criteria
      const existingCriteria = await ojtApi.getPassingCriteria(selectedDepartment!, selectedLevel!);
      setCriteria(existingCriteria);

      // Set the first day as default selection if days exist
      if (dayData.length > 0) {
        setNewCriteriaDay(dayData[0].id.toString());
      } else {
        setNewCriteriaDay("");
      }
    } catch (error) {
      console.error("Error fetching criteria:", error);
      setDays([]);
      setCriteria([]);
      setNewCriteriaDay("");
    }
  };

  const getDayName = (dayId: number | null): string => {
    if (dayId === null) return "All Days";
    const day = days.find(d => d.id === dayId);
    return day ? day.name : `Day ${dayId}`;
  };

  const handleAddCriteria = async () => {
    if (!selectedDepartment || !selectedLevel) {
      alert("Please select a department and level");
      return;
    }

    if (newCriteriaPercentage === "" || newCriteriaPercentage < 0 || newCriteriaPercentage > 100) {
      alert("Please enter a valid percentage between 0 and 100");
      return;
    }

    if (!newCriteriaDay) {
      alert("Please select a day");
      return;
    }

    try {
      const newCriteria: PassingCriteria = {
        department: selectedDepartment,
        level: selectedLevel,
        day: Number(newCriteriaDay),
        percentage: newCriteriaPercentage as number
      };

      const created = await ojtApi.createPassingCriteria(newCriteria);
      setCriteria([...criteria, created]);

      // Reset to first day if available
      if (days.length > 0) {
        setNewCriteriaDay(days[0].id.toString());
      }
      setNewCriteriaPercentage("");
    } catch (error) {
      console.error("Error adding criteria:", error);
      alert("Failed to add criteria");
    }
  };

  const handleEditCriteria = (criteriaItem: PassingCriteria) => {
    setEditingCriteriaId(criteriaItem.id!);
    setNewCriteriaDay(criteriaItem.day === null ? "" : criteriaItem.day.toString());
    setNewCriteriaPercentage(criteriaItem.percentage);
    setIsEditingCriteria(true);
  };

  const handleUpdateCriteria = async () => {
    if (!editingCriteriaId) {
      alert("No criteria selected for editing");
      return;
    }

    if (newCriteriaPercentage === "" || newCriteriaPercentage < 0 || newCriteriaPercentage > 100) {
      alert("Please enter a valid percentage between 0 and 100");
      return;
    }

    if (!newCriteriaDay) {
      alert("Please select a day");
      return;
    }

    try {
      const updatedCriteria: PassingCriteria = {
        department: selectedDepartment!,
        level: selectedLevel!,
        day: Number(newCriteriaDay),
        percentage: newCriteriaPercentage as number
      };

      await ojtApi.updatePassingCriteria(editingCriteriaId, updatedCriteria);

      setCriteria(criteria.map(c =>
        c.id === editingCriteriaId ? { ...c, day: updatedCriteria.day, percentage: updatedCriteria.percentage } : c
      ));

      // Reset to first day if available
      if (days.length > 0) {
        setNewCriteriaDay(days[0].id.toString());
      }
      setNewCriteriaPercentage("");
      setEditingCriteriaId(null);
      setIsEditingCriteria(false);
    } catch (error) {
      console.error("Error updating criteria:", error);
      alert("Failed to update criteria");
    }
  };

  const handleCancelEdit = () => {
    // Reset to first day if available
    if (days.length > 0) {
      setNewCriteriaDay(days[0].id.toString());
    } else {
      setNewCriteriaDay("");
    }
    setNewCriteriaPercentage("");
    setEditingCriteriaId(null);
    setIsEditingCriteria(false);
  };

  const removeCriteria = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this criteria?")) {
      return;
    }

    try {
      await ojtApi.deletePassingCriteria(id);
      setCriteria(criteria.filter(c => c.id !== id));

      if (editingCriteriaId === id) {
        handleCancelEdit();
      }
    } catch (error) {
      console.error("Error deleting criteria:", error);
      alert("Failed to delete criteria");
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-green-600" />
        Passing Criteria Configuration
      </h3>

      {/* Add/Edit Criteria */}
      <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
        <h4 className="font-semibold text-gray-700 mb-3">
          {isEditingCriteria ? 'Edit Criteria' : 'Add New Criteria'}
        </h4>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              value={newCriteriaDay}
              onChange={(e) => setNewCriteriaDay(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select a day</option>
              {days.map((day) => (
                <option key={day.id} value={day.id}>
                  {day.name}
                </option>
              ))}
            </select>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={newCriteriaPercentage}
                onChange={(e) => setNewCriteriaPercentage(e.target.value === "" ? "" : parseFloat(e.target.value))}
                placeholder="Passing percentage"
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <span className="absolute right-3 top-2 text-gray-400 text-sm">%</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={isEditingCriteria ? handleUpdateCriteria : handleAddCriteria}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {isEditingCriteria ? (
                <>
                  <Save className="w-4 h-4" />
                  Update
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add
                </>
              )}
            </button>
            {isEditingCriteria && (
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Existing Criteria */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {!selectedDepartment || !selectedLevel ? (
          <div className="p-3 text-center text-gray-500 text-sm">
            Please select a department and level to view criteria
          </div>
        ) : criteria.length === 0 ? (
          <div className="p-3 text-center text-gray-500 text-sm">
            No passing criteria found for the selected department and level
          </div>
        ) : (
          criteria.map((criteriaItem) => (
            <div
              key={criteriaItem.id}
              className={`p-3 rounded-lg border ${
                editingCriteriaId === criteriaItem.id
                  ? "bg-green-50 border-green-300"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    {getDayName(criteriaItem.day)} - {criteriaItem.percentage}% Required
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        criteriaItem.percentage >= 80
                          ? "bg-red-100 text-red-800 border border-red-200"
                          : criteriaItem.percentage >= 60
                          ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                          : "bg-green-100 text-green-800 border border-green-200"
                      }`}
                    >
                      {criteriaItem.percentage >= 80
                        ? "Strict"
                        : criteriaItem.percentage >= 60
                        ? "Moderate"
                        : "Lenient"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditCriteria(criteriaItem)}
                    className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeCriteria(criteriaItem.id!)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PassingCriteriaSection;
