// DaysSection.tsx
import React, { useState, useEffect } from "react";
import { ojtApi } from "../../hooks/ServiceApis";
import { Calendar, Plus, Trash2, Edit, Save, X } from "lucide-react";

interface Day {
  id: number;
  name: string;
  department: number;
  level: number;
}

interface TransformedDay {
  id: number;
  name: string;
}

interface DaysSectionProps {
  selectedDepartment: number | null;
  selectedLevel: number | null;
}

const DaysSection: React.FC<DaysSectionProps> = ({
  selectedDepartment,
  selectedLevel
}) => {
  const [days, setDays] = useState<TransformedDay[]>([]);
  const [dayName, setDayName] = useState<string>("");
  const [editingDayId, setEditingDayId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch days when department & level selected
  useEffect(() => {
    if (selectedDepartment && selectedLevel) {
      fetchDays();
    } else {
      setDays([]);
    }
  }, [selectedDepartment, selectedLevel]);

  const fetchDays = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data: Day[] = await ojtApi.getDays(selectedDepartment!, selectedLevel!);
      const transformedData: TransformedDay[] = data.map(day => ({
        id: day.id,
        name: day.name
      }));
      setDays(transformedData);
    } catch (error) {
      console.error("Error fetching days:", error);
      setError("Failed to fetch days. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setDayName("");
    setEditingDayId(null);
  };

  const handleSubmit = async () => {
    if (!dayName.trim()) {
      alert("Please enter a day name");
      return;
    }
    
    if (!selectedDepartment || !selectedLevel) {
      alert("Please select a department and level first");
      return;
    }
    
    // Check for duplicate day names (excluding the current edited day)
    if (days.some(day => 
      day.id !== editingDayId && 
      day.name.toLowerCase() === dayName.trim().toLowerCase()
    )) {
      alert("A day with this name already exists");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (editingDayId) {
        // Update existing day
        await ojtApi.updateDay(editingDayId, {
          name: dayName.trim(),
          department: selectedDepartment,
          level: selectedLevel,
        });
        
        setDays(days.map(day => 
          day.id === editingDayId ? { ...day, name: dayName.trim() } : day
        ));
      } else {
        // Create new day
        const created = await ojtApi.createDay({
          name: dayName.trim(),
          department: selectedDepartment,
          level: selectedLevel,
        });
        
        // Handle different API response structures
        const transformedDay: TransformedDay = {
          id: created.id || Date.now(),
          name: created.day || created.name || dayName.trim()
        };
        
        setDays([...days, transformedDay]);
      }
      
      resetForm();
    } catch (error) {
      console.error("Error saving day:", error);
      setError(`Failed to ${editingDayId ? 'update' : 'add'} day. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditDay = (day: TransformedDay) => {
    setDayName(day.name);
    setEditingDayId(day.id);
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleDeleteDay = async (dayId: number) => {
    if (!window.confirm("Are you sure you want to delete this day?")) {
      return;
    }
    
    if (days.length <= 1) {
      alert("You cannot delete the last day");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      await ojtApi.deleteDay(dayId);
      setDays(days.filter(day => day.id !== dayId));
      
      // If we were editing the deleted day, reset the form
      if (editingDayId === dayId) {
        resetForm();
      }
    } catch (error) {
      console.error("Error deleting day:", error);
      setError("Failed to delete day. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-green-600" />
        Training Days
      </h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}
      
      <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
  <h4 className="font-semibold text-gray-700 mb-3">
    {editingDayId ? "Edit Day" : "Add New Day"}
  </h4>

  {/* Input field on first line */}
  <div className="mb-4">
    <input
      type="text"
      placeholder="Enter day name"
      value={dayName}
      onChange={(e) => setDayName(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      disabled={isLoading}
    />
  </div>

  {/* Buttons on second line */}
  <div className="flex gap-2">
    <button
      onClick={handleSubmit}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : editingDayId ? (
        <Save className="w-4 h-4" />
      ) : (
        <Plus className="w-4 h-4" />
      )}
      {editingDayId ? "Update" : "Add"}
    </button>

    {editingDayId && (
      <button
        onClick={handleCancelEdit}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <X className="w-4 h-4" />
        Cancel
      </button>
    )}
  </div>

  <h4 className="font-semibold text-gray-700 mt-4">Current Days: {days.length}</h4>
</div>

      
      {isLoading && !days.length ? (
        <div className="p-6 text-center">
          <div className="inline-block w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-500">Loading days...</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {!selectedDepartment || !selectedLevel ? (
            <div className="p-3 text-center text-gray-500 text-sm">
              Please select a department and level to view days
            </div>
          ) : days.length === 0 ? (
            <div className="p-3 text-center text-gray-500 text-sm">
              No days found for the selected department and level
            </div>
          ) : (
            days.map((day) => (
              <div key={day.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="font-medium text-gray-800 text-sm">{day.name}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditDay(day)}
                    disabled={isLoading}
                    className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors disabled:opacity-50"
                    title="Edit"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteDay(day.id)}
                    disabled={isLoading || days.length <= 1}
                    className={`p-1 rounded transition-colors ${
                      days.length <= 1 ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:bg-red-100'
                    } disabled:opacity-50`}
                    title={days.length <= 1 ? "Cannot delete the last day" : "Delete"}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DaysSection;