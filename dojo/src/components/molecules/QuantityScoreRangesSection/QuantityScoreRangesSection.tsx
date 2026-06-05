// QuantityScoreRangesSection.tsx
import React, { useState, useEffect } from "react";
import { Target, Plus, Trash2, Edit, Save, X } from "lucide-react";
import { ojtApi } from "../../hooks/ServiceApis";

interface QuantityScoreSetup {
  id?: number;
  department?: number;
  level?: number;
  score_type?: 'production' | 'rejection';
  min_value?: number;
  max_value?: number;
  marks?: number;
}

interface TransformedQuantityScoreSetup {
  id: number;
  department: number;
  level: number;
  score_type: 'production' | 'rejection';
  min_value: number;
  max_value: number;
  marks: number;
}

interface QuantityScoreRangesSectionProps {
  selectedDepartment: number | null;
  selectedLevel: number | null;
}

const QuantityScoreRangesSection: React.FC<QuantityScoreRangesSectionProps> = ({
  selectedDepartment,
  selectedLevel,
}) => {
  const [quantityScoreSetups, setQuantityScoreSetups] = useState<
    TransformedQuantityScoreSetup[]
  >([]);

  // form states
  const [scoreType, setScoreType] = useState<'production' | 'rejection'>('production');
  const [minValue, setMinValue] = useState<string>("");
  const [maxValue, setMaxValue] = useState<string>("");
  const [marks, setMarks] = useState<string>("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Fetch score setups when department & level selected
  useEffect(() => {
    if (selectedDepartment && selectedLevel) {
      fetchQuantityScoreSetups();
    } else {
      setQuantityScoreSetups([]);
    }
    resetForm();
  }, [selectedDepartment, selectedLevel]);

  const fetchQuantityScoreSetups = async () => {
    try {
      const data: QuantityScoreSetup[] =
        await ojtApi.getQuantityScoreRanges(selectedDepartment!, selectedLevel!);

      const transformed: TransformedQuantityScoreSetup[] = data.map((setup: any) => ({
        id: setup.id,
        score_type: setup.score_type,
        min_value: parseFloat(setup.min_value), // Convert string to number
        max_value: parseFloat(setup.max_value), // Convert string to number
        marks: setup.marks,
        department: setup.department || selectedDepartment!,
        level: setup.level || selectedLevel!,
      }));

      setQuantityScoreSetups(transformed);
    } catch (error) {
      console.error("Error fetching quantity score setups:", error);
    }
  };

  const resetForm = () => {
    setScoreType('production');
    setMinValue("");
    setMaxValue("");
    setMarks("");
    setEditingId(null);
    setIsEditing(false);
  };

const validateInputs = (): {
  isValid: boolean;
  minValue: number;
  maxValue: number;
  marks: number;
} => {
  if (
    !minValue.trim() ||
    !maxValue.trim() ||
    !marks.trim() ||
    !selectedDepartment ||
    !selectedLevel
  ) {
    alert("Please fill all fields and select department/level");
    return { isValid: false, minValue: 0, maxValue: 0, marks: 0 };
  }

  const minVal = parseFloat(minValue);
  const maxVal = parseFloat(maxValue);
  const marksVal = parseInt(marks);

  if (isNaN(minVal) || isNaN(maxVal) || isNaN(marksVal)) {
    alert("Please enter valid numbers for all fields");
    return { isValid: false, minValue: 0, maxValue: 0, marks: 0 };
  }

  // ✅ allow (0,0) but otherwise enforce min < max
  if (!(minVal === 0 && maxVal === 0) && minVal >= maxVal) {
    alert("Max value must be greater than Min value (except when both are 0)");
    return { isValid: false, minValue: 0, maxValue: 0, marks: 0 };
  }

  if (marksVal < 0) {
    alert("Marks must be a positive number");
    return { isValid: false, minValue: 0, maxValue: 0, marks: 0 };
  }

  return { isValid: true, minValue: minVal, maxValue: maxVal, marks: marksVal };
};

  const handleSave = async () => {
    const { isValid, minValue, maxValue, marks } = validateInputs();
    if (!isValid) return;

    try {
      if (isEditing && editingId) {
        // Update
        await ojtApi.updateQuantityScoreRange(editingId, {
          score_type: scoreType,
          min_value: minValue,
          max_value: maxValue,
          marks: marks,
          department: selectedDepartment!,
          level: selectedLevel!,
        });

        setQuantityScoreSetups(
          quantityScoreSetups.map((setup) =>
            setup.id === editingId
              ? {
                  ...setup,
                  score_type: scoreType,
                  min_value: minValue,
                  max_value: maxValue,
                  marks: marks,
                }
              : setup
          )
        );
      } else {
        // Create
        const created = await ojtApi.createQuantityScoreRange({
          score_type: scoreType,
          min_value: minValue,
          max_value: maxValue,
          marks: marks,
          department: selectedDepartment!,
          level: selectedLevel!,
        });

        const transformed: TransformedQuantityScoreSetup = {
          id: created.id,
          score_type: created.score_type,
          min_value: parseFloat(created.min_value), // Convert string to number
          max_value: parseFloat(created.max_value), // Convert string to number
          marks: created.marks,
          department: created.department,
          level: created.level,
        };

        setQuantityScoreSetups([...quantityScoreSetups, transformed]);
      }
      resetForm();
    } catch (error) {
      console.error("Error saving quantity score setup:", error);
    }
  };

  const handleEdit = (setup: TransformedQuantityScoreSetup) => {
    setScoreType(setup.score_type);
    setMinValue(setup.min_value.toString());
    setMaxValue(setup.max_value.toString());
    setMarks(setup.marks.toString());
    setEditingId(setup.id);
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this score setup?")) return;

    try {
      await ojtApi.deleteQuantityScoreRange(id);
      setQuantityScoreSetups(quantityScoreSetups.filter((s) => s.id !== id));
      if (editingId === id) resetForm();
    } catch (error) {
      console.error("Error deleting quantity score setup:", error);
    }
  };

  // Group setups by score type for display
  const productionSetups = quantityScoreSetups.filter(s => s.score_type === 'production');
  const rejectionSetups = quantityScoreSetups.filter(s => s.score_type === 'rejection');

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-green-600" />
        Quantity Score Setup
      </h3>

      {/* form */}
      <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200">
        <h4 className="font-semibold text-gray-700 mb-3">
          {isEditing ? "Edit Score Setup" : "Add New Score Setup"}
          {isEditing && <span className="ml-2 text-sm text-green-600">(Editing)</span>}
        </h4>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <select
            value={scoreType}
            onChange={(e) => setScoreType(e.target.value as 'production' | 'rejection')}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="production">Production</option>
            <option value="rejection">Rejection</option>
          </select>
          <input
            type="number"
            placeholder="Marks"
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
          <input
            type="number"
            placeholder="Min Value"
            value={minValue}
            onChange={(e) => setMinValue(e.target.value)}
            className="px-3 py-2 border rounded-lg"
            step="0.01"
          />
          <input
            type="number"
            placeholder="Max Value"
            value={maxValue}
            onChange={(e) => setMaxValue(e.target.value)}
            className="px-3 py-2 border rounded-lg"
            step="0.01"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex-1 justify-center"
          >
            {isEditing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isEditing ? "Save Changes" : "Add Setup"}
          </button>
          {isEditing && (
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Display sections for Production and Rejection */}
      {!selectedDepartment || !selectedLevel ? (
        <div className="p-3 text-center text-gray-500 text-sm">
          Please select a department and level to view quantity score setups
        </div>
      ) : (
        <div className="space-y-6">
          {/* Production Section */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-3">For Production %</h4>
            <div className="space-y-2">
              {productionSetups.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-2">
                  No production score setups found
                </div>
              ) : (
                productionSetups
                  .sort((a, b) => b.marks - a.marks) // Sort by marks descending
                  .map((setup) => (
                    <div
                      key={setup.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200"
                    >
                      <div className="flex items-center gap-4 text-sm text-gray-800">
                        <span className="font-medium">
                          {setup.min_value.toFixed(2)} - {setup.max_value.toFixed(2)}%
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-semibold">
                          {setup.marks} marks
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(setup)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(setup.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Rejection Section */}
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <h4 className="font-bold text-red-800 mb-3">For Rejections</h4>
            <div className="space-y-2">
              {rejectionSetups.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-2">
                  No rejection score setups found
                </div>
              ) : (
                rejectionSetups
                  .sort((a, b) => b.marks - a.marks) // Sort by marks descending
                  .map((setup) => (
                    <div
                      key={setup.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200"
                    >
                      <div className="flex items-center gap-4 text-sm text-gray-800">
                        <span className="font-medium">
                          {setup.min_value.toFixed(2)} - {setup.max_value.toFixed(2)}
                        </span>
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded font-semibold">
                          {setup.marks} marks
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(setup)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(setup.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuantityScoreRangesSection;