
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, Calendar } from 'lucide-react';
import { employeeApi, annualPlanApi } from '../lib/api';
import type { Employee } from '../types';

interface AnnualPlanFormProps {
  onBack: () => void;
  planId: string | null;
}

const getTodayDateString = () => new Date().toISOString().split('T')[0];

export default function AnnualPlanForm({ onBack, planId }: AnnualPlanFormProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const isEditMode = !!planId;

  const [formData, setFormData] = useState({
    emp_id: '',
    supervisor_name: '',
    plan_date: getTodayDateString(),
  });
  
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditMode);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await employeeApi.getAll();
        setEmployees(data);
      } catch (error) {
        console.error('Error loading employees:', error);
      }
    };
    loadEmployees();
  }, []);

  useEffect(() => {
    if (isEditMode && planId) {
      const fetchPlanData = async () => {
        setPageLoading(true);
        try {
          const data = await annualPlanApi.getById(planId);
          setFormData({
            // --- FIX #1: Use the correct primary key 'emp_id' ---
            emp_id: data.employee.emp_id, 
            supervisor_name: data.supervisor_name,
            plan_date: data.plan_date,
          });
        } catch (error) {
          console.error('Error loading plan data:', error);
          setMessage('Error loading plan data. Please go back and try again.');
        } finally {
          setPageLoading(false);
        }
      };
      fetchPlanData();
    }
  }, [planId, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      if (isEditMode && planId) {
        await annualPlanApi.update(planId, formData);
        setMessage('Annual plan updated successfully!');
      } else {
        await annualPlanApi.create(formData);
        setMessage('Annual plan created successfully!');
      }
      setTimeout(() => onBack(), 1500);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message;
      setMessage(`Error saving plan: ${JSON.stringify(errorMessage)}`);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-700">Loading plan details...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button onClick={onBack} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Plans List</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit' : 'Create'} Annual Plan</h1>
            <p className="text-gray-600 mt-1">{isEditMode ? 'Update the details for this plan.' : 'Set up a new operator observation plan.'}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="emp_id" className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  Select Employee
                </label>
                <select
                  id="emp_id"
                  name="emp_id"
                  value={formData.emp_id}
                  onChange={handleChange}
                  required
                  disabled={isEditMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100"
                >
                  <option value="">Choose an employee...</option>
                  {employees.map((employee) => (
                    // --- FIX #2: Use 'emp_id' for both key and value ---
                    <option key={employee.emp_id} value={employee.emp_id}>
                      {employee.emp_id} - {employee.first_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="supervisor_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Supervisor Name
                </label>
                <input
                  id="supervisor_name"
                  name="supervisor_name"
                  type="text"
                  value={formData.supervisor_name}
                  onChange={handleChange}
                  required
                  placeholder="Enter supervisor name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="plan_date" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Select Plan Date
                </label>
                <input
                  id="plan_date"
                  name="plan_date"
                  type="date"
                  value={formData.plan_date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-lg text-center ${message.includes('Error') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>{message}</div>
            )}

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button type="button" onClick={onBack} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Plan')}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}