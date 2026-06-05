

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, FileText, Trash2, Circle, Search } from 'lucide-react'; // Added Search
import { annualPlanApi } from '../lib/api';
import type { AnnualPlan } from '../types';
import { format, parseISO } from 'date-fns';

interface AnnualPlanTableProps {
  onBack: () => void;
  // --- MODIFIED: Change the type from 'string' to 'AnnualPlan' ---
  onObservationClick: (plan: AnnualPlan) => void;
  onEditClick: (planId: string) => void;
}

export default function AnnualPlanTable({ onBack, onObservationClick, onEditClick }: AnnualPlanTableProps) {
  const [plans, setPlans] = useState<AnnualPlan[]>([]);
  // --- START OF ADDED CODE ---
  const [filteredPlans, setFilteredPlans] = useState<AnnualPlan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  // --- END OF ADDED CODE ---
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  // --- START OF ADDED CODE ---
  useEffect(() => {
    if (!searchTerm) {
      setFilteredPlans(plans);
      return;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    const results = plans.filter((plan) => {
      const nameMatch = plan.employee.full_name.toLowerCase().includes(lowercasedFilter);
      const codeMatch = plan.employee.employee_code.toLowerCase().includes(lowercasedFilter);
      return nameMatch || codeMatch;
    });
    setFilteredPlans(results);
  }, [searchTerm, plans]);
  // --- END OF ADDED CODE ---

  const loadPlans = async () => {
    setLoading(true);
    try {
      const data = await annualPlanApi.getAll();
      setPlans(data);
      // --- ADDED LINE ---
      setFilteredPlans(data);
    } catch (error) {
      console.error('Error loading plans:', error);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (window.confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      try {
        await annualPlanApi.delete(planId);
        // --- MODIFIED LINE (to update master list) ---
        setPlans(currentPlans => currentPlans.filter(p => p.id !== planId));
      } catch (error) {
        console.error('Failed to delete plan:', error);
        alert('Could not delete the plan. Please try again.');
      }
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'planned': default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button onClick={onBack} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Annual Plans Overview</h1>
              <p className="text-gray-600 mt-1">Manage and track operator observation plans</p>
            </div>
            {/* --- START OF ADDED CODE --- */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Search by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* --- END OF ADDED CODE --- */}
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Employee</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Employee_code</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Supervisor</th>
                      {/* <th className="text-left py-3 px-4 font-semibold text-gray-900">Month / Year</th> */}
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Plan Date</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900">Status</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900">Plan</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900">Actual</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* --- MODIFIED LINE (use filteredPlans) --- */}
                    {filteredPlans.map((plan) => (
                      <tr key={plan.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">{plan.employee.first_name}</div>
                          <div className="text-sm text-gray-500">{plan.employee.department}</div>
                        </td>
                        <td>
                          <div className="text-sm text-gray-500">{plan.employee.emp_id}</div>
                        </td>
                        <td className="py-4 px-4 text-gray-700">{plan.supervisor_name}</td>
                        {/* <td className="py-4 px-4 text-gray-700">{plan.month} {plan.year}</td> */}
                        <td className="py-4 px-4 text-gray-700">
                          {format(new Date(plan.plan_date), 'dd MMM yyyy')}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusStyles(plan.status)}`}>
                            {plan.status_display}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Circle className="h-4 w-4 mx-auto text-gray-500" />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Circle
                            className={`h-4 w-4 mx-auto ${plan.status === 'completed' ? 'text-black' : 'text-gray-300'}`}
                            fill={plan.status === 'completed' ? 'currentColor' : 'none'}
                          />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex justify-center items-center space-x-2">
                            <button onClick={() => onEditClick(plan.id)} disabled={plan.status === 'completed'} className="p-2 text-gray-500 rounded-lg hover:bg-gray-200 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title={plan.status === 'completed' ? 'Cannot edit a completed plan' : 'Edit Plan'}><Edit className="h-4 w-4" /></button>
                            <button
                              onClick={() => onObservationClick(plan)}
                              className="p-2 text-blue-600 rounded-lg hover:bg-blue-100 hover:text-blue-800 transition-colors"
                              // Add a dynamic title based on whether the sheet exists
                              title={plan.tencycle_sheet ? "View Observation Sheet" : "Create Observation Sheet"}
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDeletePlan(plan.id)} className="p-2 text-red-500 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors" title="Delete Plan"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* --- MODIFIED LINE (for no results message) --- */}
                {filteredPlans.length === 0 && !loading && (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm ? `No plans found for "${searchTerm}".` : "No annual plans created yet."}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}