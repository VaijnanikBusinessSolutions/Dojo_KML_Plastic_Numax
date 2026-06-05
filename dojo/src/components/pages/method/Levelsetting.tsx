import React, { useState, useEffect } from "react";
import axios from "axios";

interface Level {
  level_id: number;
  level_name: string;
}

const Levels: React.FC = () => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [formValue, setFormValue] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = "http://127.0.0.1:8000/levels/"; // 🔗 Update if your API runs elsewhere

  // Fetch all levels
  const fetchLevels = async () => {
    try {
      setLoading(true);
      const res = await axios.get<Level[]>(API_URL);
      setLevels(res.data);
    } catch (error) {
      console.error("Error fetching levels:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  // Save (Create or Update)
  const handleSave = async () => {
    if (!formValue.trim()) return;

    try {
      if (editId) {
        // Update existing
        await axios.put(`${API_URL}${editId}/`, { level_name: formValue });
      } else {
        // Create new
        await axios.post(API_URL, { level_name: formValue });
      }
      fetchLevels(); // refresh
    } catch (error) {
      console.error("Error saving level:", error);
    }

    setFormValue("");
    setEditId(null);
  };

  // Edit handler
  const handleEdit = (level: Level) => {
    setEditId(level.level_id);
    setFormValue(level.level_name);
  };

  // Delete handler
  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_URL}${id}/`);
      setLevels((prev) => prev.filter((lvl) => lvl.level_id !== id));
    } catch (error) {
      console.error("Error deleting level:", error);
    }
  };

  // Cancel edit
  const handleCancel = () => {
    setFormValue("");
    setEditId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Level Management
          </h1>
          <p className="text-gray-600">Create, edit, and manage your levels</p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-white/20">
          {/* Add / Edit form */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {editId ? "Edit Level" : "Add New Level"}
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  className="w-full px-5 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
                  placeholder="Enter level name..."
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSave()}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
              </div>
              <button
                onClick={handleSave}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  editId
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-orange-200"
                    : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-200"
                }`}
              >
                {editId ? "Update Level" : "Add Level"}
              </button>
              {editId && (
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Levels table */}
          <div className="overflow-hidden rounded-2xl border-2 border-gray-100 shadow-inner">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Level Name
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : levels.length > 0 ? (
                  levels.map((level, index) => (
                    <tr
                      key={level.level_id}
                      className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-semibold text-sm">
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-800 font-medium">
                          {level.level_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(level)}
                            className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-sm font-medium rounded-lg hover:from-amber-500 hover:to-orange-500 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(level.level_id)}
                            className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <svg
                          className="w-16 h-16 text-gray-300 mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        <p className="text-gray-500 font-medium">No levels found</p>
                        <p className="text-gray-400 text-sm mt-1">
                          Add your first level to get started
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Stats */}
          {levels.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Total Levels:{" "}
                <span className="font-semibold text-purple-600">
                  {levels.length}
                </span>
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Active</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Levels;
