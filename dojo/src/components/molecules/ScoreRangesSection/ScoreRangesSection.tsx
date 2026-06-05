// ScoreRangesSection.tsx
import React, { useState, useEffect } from "react";
import { ojtApi } from "../../hooks/ServiceApis";
import { Target, Plus, Trash2, Edit, Save, X } from "lucide-react";

interface ScoreRange {
  id?: number;
  score_range_id?: number;
  min_score?: number;
  max_score?: number;
  department?: number;
  level?: number;
}

interface TransformedScoreRange {
  id: number;
  min_score: number;
  max_score: number;
  department: number;
  level: number;
}

interface ScoreRangesSectionProps {
  selectedDepartment: number | null;
  selectedLevel: number | null;
}

const ScoreRangesSection: React.FC<ScoreRangesSectionProps> = ({
  selectedDepartment,
  selectedLevel,
}) => {
  const [scoreRanges, setScoreRanges] = useState<TransformedScoreRange[]>([]);
  const [minScore, setMinScore] = useState<string>("");
  const [maxScore, setMaxScore] = useState<string>("");
  const [editingScoreRangeId, setEditingScoreRangeId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Fetch score ranges when department & level selected
  useEffect(() => {
    if (selectedDepartment && selectedLevel) {
      fetchScoreRanges();
    } else {
      setScoreRanges([]);
    }
    resetForm();
  }, [selectedDepartment, selectedLevel]);

  const fetchScoreRanges = async () => {
    try {
      const data: ScoreRange[] = await ojtApi.getScoreRanges(
        selectedDepartment!,
        selectedLevel!
      );

      console.log(data)



      const transformedScoreRanges: TransformedScoreRange[] = data.map((range: any) => ({
        id: range.id || range.score_range_id,
        min_score: range.min_score,
        max_score: range.max_score,
        department: range.department || selectedDepartment!,
        level: range.level || selectedLevel!,
      }));

      setScoreRanges(transformedScoreRanges);
    } catch (error) {
      console.error("Error fetching score ranges:", error);
    }
  };

  const resetForm = () => {
    setMinScore("");
    setMaxScore("");
    setEditingScoreRangeId(null);
    setIsEditing(false);
  };

  const validateInputs = (
    min: string,
    max: string
  ): { isValid: boolean; minScore: number; maxScore: number } => {
    if (!min.trim() || !max.trim() || !selectedDepartment || !selectedLevel) {
      alert("Please select a department, level, and enter both min and max scores");
      return { isValid: false, minScore: 0, maxScore: 0 };
    }

    const minScoreValue = parseInt(min);
    const maxScoreValue = parseInt(max);

    if (isNaN(minScoreValue) || isNaN(maxScoreValue) || minScoreValue < 0 || maxScoreValue <= 0) {
      alert("Please enter valid numbers for min and max scores");
      return { isValid: false, minScore: 0, maxScore: 0 };
    }

    if (minScoreValue >= maxScoreValue) {
      alert("Max score must be greater than min score");
      return { isValid: false, minScore: 0, maxScore: 0 };
    }

    return { isValid: true, minScore: minScoreValue, maxScore: maxScoreValue };
  };

  const handleSaveScoreRange = async () => {
    const { isValid, minScore: minScoreValue, maxScore: maxScoreValue } =
      validateInputs(minScore, maxScore);
    if (!isValid) return;

    try {
      if (isEditing && editingScoreRangeId) {
        // Update existing score range
        await ojtApi.updateScoreRange(editingScoreRangeId, {
          min_score: minScoreValue,
          max_score: maxScoreValue,
          department: selectedDepartment!,
          level: selectedLevel!,
        });

        setScoreRanges(
          scoreRanges.map((range) =>
            range.id === editingScoreRangeId
              ? { ...range, min_score: minScoreValue, max_score: maxScoreValue }
              : range
          )
        );
      } else {
        // Create new score range
        const created = await ojtApi.createScoreRange({
          min_score: minScoreValue,
          max_score: maxScoreValue,
          department: selectedDepartment!,
          level: selectedLevel!,
        });

        const transformedScoreRange: TransformedScoreRange = {
          id: created.id || created.score_range_id,
          min_score: created.min_score,
          max_score: created.max_score,
          department: created.department || selectedDepartment!,
          level: created.level || selectedLevel!,
        };

        setScoreRanges([...scoreRanges, transformedScoreRange]);
      }

      resetForm();
    } catch (error) {
      console.error("Error saving score range:", error);
    }
  };

  const handleEditScoreRange = (range: TransformedScoreRange) => {
    setMinScore(range.min_score.toString());
    setMaxScore(range.max_score.toString());
    setEditingScoreRangeId(range.id);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleDeleteScoreRange = async (rangeId: number) => {
    if (!window.confirm("Are you sure you want to delete this score range?")) {
      return;
    }

    try {
      await ojtApi.deleteScoreRange(rangeId);
      setScoreRanges(scoreRanges.filter((range) => range.id !== rangeId));

      // If we were editing the deleted item, reset the form
      if (editingScoreRangeId === rangeId) {
        resetForm();
      }
    } catch (error) {
      console.error("Error deleting score range:", error);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-orange-600" />
        Score Ranges
      </h3>
      <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
        <h4 className="font-semibold text-gray-700 mb-3">
          {isEditing ? "Edit Range" : "Add New Range"}
          {isEditing && <span className="ml-2 text-sm text-orange-600">(Editing)</span>}
        </h4>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <input
            type="number"
            placeholder="Min score"
            value={minScore}
            onChange={(e) => setMinScore(e.target.value)}
            min="0"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="number"
            placeholder="Max score"
            value={maxScore}
            onChange={(e) => setMaxScore(e.target.value)}
            min={minScore ? parseInt(minScore) + 1 : 1}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSaveScoreRange}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex-1 justify-center"
          >
            {isEditing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isEditing ? "Save Changes" : "Add Range"}
          </button>
          {isEditing && (
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {!selectedDepartment || !selectedLevel ? (
          <div className="p-3 text-center text-gray-500 text-sm">
            Please select a department and level to view score ranges
          </div>
        ) : scoreRanges.length === 0 ? (
          <div className="p-3 text-center text-gray-500 text-sm">
            No score ranges found for the selected department and level
          </div>
        ) : (
          scoreRanges.map((range) => (
            <div
              key={range.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-800 text-sm">
                  {range.min_score != null && range.max_score != null
                    ? `${range.min_score} - ${range.max_score}`
                    : "Invalid range"}
                </span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEditScoreRange(range)}
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                  title="Edit"
                  disabled={isEditing && editingScoreRangeId === range.id}
                >
                  <Edit className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDeleteScoreRange(range.id)}
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
  );
};

export default ScoreRangesSection;
