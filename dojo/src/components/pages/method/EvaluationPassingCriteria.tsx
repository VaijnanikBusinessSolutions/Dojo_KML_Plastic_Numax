import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit2, Trash2, Save, X, Check, AlertCircle } from 'lucide-react';

interface Level {
  id: number;
  level_id: number;
  level_name: string;
}

interface Department {
  id: number;
  department_id: number;
  department_name: string;
}

interface PassingCriteria {
  id?: number;
  level: number;
  department: number;
  percentage: string;
  level_name?: string;
  department_name?: string;
}

const EvaluationPassingCriteria: React.FC = () => {
  const [criteria, setCriteria] = useState<PassingCriteria[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [newCriteria, setNewCriteria] = useState<PassingCriteria>({
    level: 0,
    department: 0,
    percentage: '75.00'
  });

  const [editCriteria, setEditCriteria] = useState<PassingCriteria>({
    level: 0,
    department: 0,
    percentage: '75.00'
  });

  // Base API URL - adjust this to match your Django server
  const API_BASE = 'http://127.0.0.1:8000';

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [criteriaRes, levelsRes, departmentsRes] = await Promise.all([
        fetch(`${API_BASE}/evaluation-passing-criteria/`),
        fetch(`${API_BASE}/levels/`),
        fetch(`${API_BASE}/departments/`)
      ]);

      if (!criteriaRes.ok && criteriaRes.status !== 404) {
        throw new Error(`Failed to fetch criteria: ${criteriaRes.status}`);
      }
      if (!levelsRes.ok) {
        throw new Error(`Failed to fetch levels: ${levelsRes.status}`);
      }
      if (!departmentsRes.ok) {
        throw new Error(`Failed to fetch departments: ${departmentsRes.status}`);
      }

      const criteriaData = criteriaRes.ok ? await criteriaRes.json() : [];
      const levelsData = await levelsRes.json();
      const departmentsData = await departmentsRes.json();

      setCriteria(criteriaData);
      setLevels(levelsData);
      setDepartments(departmentsData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleAdd = async () => {
    try {
      setError(null);
      
      if (!newCriteria.level || !newCriteria.department || !newCriteria.percentage) {
        setError('Please fill in all fields');
        return;
      }

      if (parseFloat(newCriteria.percentage) < 0 || parseFloat(newCriteria.percentage) > 100) {
        setError('Percentage must be between 0 and 100');
        return;
      }

      const response = await fetch(`${API_BASE}/evaluation-passing-criteria/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add CSRF token if needed
          // 'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({
          level: newCriteria.level,
          department: newCriteria.department,
          percentage: parseFloat(newCriteria.percentage)
        }),
      });

      if (response.ok) {
        await fetchData();
        setIsAddingNew(false);
        setNewCriteria({ level: 0, department: 0, percentage: '75.00' });
        showSuccessMessage('Passing criteria added successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || `Failed to add criteria (Status: ${response.status})`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error adding criteria';
      setError(errorMessage);
      console.error('Error:', err);
    }
  };

  const handleEdit = async () => {
    try {
      setError(null);
      
      if (!editCriteria.level || !editCriteria.department || !editCriteria.percentage || !editingId) {
        setError('Please fill in all fields');
        return;
      }

      if (parseFloat(editCriteria.percentage) < 0 || parseFloat(editCriteria.percentage) > 100) {
        setError('Percentage must be between 0 and 100');
        return;
      }

      const response = await fetch(`${API_BASE}/evaluation-passing-criteria/${editingId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Add CSRF token if needed
          // 'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({
          level: editCriteria.level,
          department: editCriteria.department,
          percentage: parseFloat(editCriteria.percentage)
        }),
      });

      if (response.ok) {
        await fetchData();
        setEditingId(null);
        showSuccessMessage('Passing criteria updated successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || `Failed to update criteria (Status: ${response.status})`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating criteria';
      setError(errorMessage);
      console.error('Error:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this passing criteria?')) {
      return;
    }

    try {
      setError(null);
      
      const response = await fetch(`${API_BASE}/evaluation-passing-criteria/${id}/`, {
        method: 'DELETE',
        headers: {
          // Add CSRF token if needed
          // 'X-CSRFToken': getCookie('csrftoken'),
        },
      });

      if (response.ok || response.status === 204) {
        await fetchData();
        showSuccessMessage('Passing criteria deleted successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || `Failed to delete criteria (Status: ${response.status})`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting criteria';
      setError(errorMessage);
      console.error('Error:', err);
    }
  };

  const startEdit = (item: PassingCriteria) => {
    setEditingId(item.id || null);
    setEditCriteria({ ...item });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditCriteria({ level: 0, department: 0, percentage: '75.00' });
  };

  const getLevelName = (levelId: number) => {
    return levels.find(l => l.level_id === levelId)?.level_name || `Level ${levelId}`;
  };

  const getDepartmentName = (deptId: number) => {
    return departments.find(d => d.department_id === deptId)?.department_name || `Department ${deptId}`;
  };

  // Helper function to get CSRF token (uncomment if using Django CSRF)
  // const getCookie = (name: string) => {
  //   let cookieValue = null;
  //   if (document.cookie && document.cookie !== '') {
  //     const cookies = document.cookie.split(';');
  //     for (let i = 0; i < cookies.length; i++) {
  //       const cookie = cookies[i].trim();
  //       if (cookie.substring(0, name.length + 1) === (name + '=')) {
  //         cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
  //         break;
  //       }
  //     }
  //   }
  //   return cookieValue;
  // };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Evaluation Passing Criteria
          </h2>
          <p className="text-gray-600 mt-2">Manage passing percentages for different levels and departments</p>
        </div>
        <button
          onClick={() => setIsAddingNew(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <PlusCircle size={20} />
          <span>Add New Criteria</span>
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <Check className="text-green-500" size={20} />
          <span className="text-green-700">{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="text-red-500" size={20} />
          <span className="text-red-700">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Add New Form */}
      {isAddingNew && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Add New Passing Criteria</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
              <select
                value={newCriteria.level}
                onChange={(e) => setNewCriteria({ ...newCriteria, level: parseInt(e.target.value) })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>Select Level</option>
                {levels.map(level => (
                  <option key={level.id} value={level.level_id}>
                    {level.level_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={newCriteria.department}
                onChange={(e) => setNewCriteria({ ...newCriteria, department: parseInt(e.target.value) })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.department_id}>
                    {dept.department_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Passing Percentage</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={newCriteria.percentage}
                onChange={(e) => setNewCriteria({ ...newCriteria, percentage: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="75.00"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setIsAddingNew(false);
                setNewCriteria({ level: 0, department: 0, percentage: '75.00' });
                setError(null);
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <Save size={16} />
              <span>Save</span>
            </button>
          </div>
        </div>
      )}

      {/* Criteria Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Level</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Department</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Passing Percentage</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {criteria.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center space-y-3">
                      <AlertCircle size={48} className="text-gray-400" />
                      <p className="text-lg">No passing criteria found</p>
                      <p className="text-sm">Add your first criteria using the button above</p>
                    </div>
                  </td>
                </tr>
              ) : (
                criteria.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      {editingId === item.id ? (
                        <select
                          value={editCriteria.level}
                          onChange={(e) => setEditCriteria({ ...editCriteria, level: parseInt(e.target.value) })}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                          {levels.map(level => (
                            <option key={`edit-level-${level.id}`} value={level.level_id}>
                              {level.level_name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="font-medium text-gray-900">{getLevelName(item.level)}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === item.id ? (
                        <select
                          value={editCriteria.department}
                          onChange={(e) => setEditCriteria({ ...editCriteria, department: parseInt(e.target.value) })}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                          {departments.map(dept => (
                            <option key={`edit-dept-${dept.id}`} value={dept.department_id}>
                              {dept.department_name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-gray-900">{getDepartmentName(item.department)}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === item.id ? (
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={editCriteria.percentage}
                          onChange={(e) => setEditCriteria({ ...editCriteria, percentage: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {item.percentage}%
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center space-x-2">
                        {editingId === item.id ? (
                          <>
                            <button
                              onClick={handleEdit}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title="Save"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Cancel"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(item)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id!)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistics */}
      {criteria.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Total Criteria</h3>
            <p className="text-3xl font-bold">{criteria.length}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Average Passing %</h3>
            <p className="text-3xl font-bold">
              {(criteria.reduce((sum, c) => sum + parseFloat(c.percentage), 0) / criteria.length).toFixed(1)}%
            </p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Departments Covered</h3>
            <p className="text-3xl font-bold">
              {new Set(criteria.map(c => c.department)).size}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationPassingCriteria;