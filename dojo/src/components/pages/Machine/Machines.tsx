import React, { useEffect, useState } from 'react';
import MachineForm from '../../organisms/Machine/MachineForm/MachineForm';
import MachineList from '../../organisms/Machine/MachineList/MachineList';
import { LEVEL_CHOICES } from './types';
import type { Machine, Operation, Department } from './types';
import {
  fetchMachines,
  fetchOperations,
  createMachine,
  updateMachine,
  deleteMachine,
  fetchDepartments,
} from './machinesApi';
import { FiSettings, FiFilter } from 'react-icons/fi';

const MachinesPage: React.FC = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptFilter, setDeptFilter] = useState<number | ''>('');

  const [formData, setFormData] = useState<Partial<Machine>>({
    name: '',
    level: 1,
    process: '',
    department: undefined as unknown as number,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    init();
    window.scrollTo(0, 0);
  }, []);

  const init = async () => {
    setIsLoading(true);
    try {
      const [deps, ops] = await Promise.all([fetchDepartments(), fetchOperations()]);
      console.log("Fetched departments:", deps);
      console.log("Fetched operations:", ops);  
      setDepartments(deps);
      setOperations(ops);
      await loadMachines();
    } catch (err) {
      console.error('Init error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMachines = async (department?: number) => {
    setIsLoading(true);
    try {
      const params = department && !isNaN(department) ? { department_id: department } : undefined;
      const data = await fetchMachines(params);
      setMachines(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value === '' ? NaN : Number(e.target.value);
    setDeptFilter(isNaN(val) ? '' : val);
    loadMachines(isNaN(val) ? undefined : val);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'level' || name === 'department' ? Number(value) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') data.append(k, String(v));
    });
    if (imageFile) data.append('image', imageFile);

    try {
      if (editingId) await updateMachine(editingId, data);
      else await createMachine(data);
      resetForm();
      loadMachines(typeof deptFilter === 'number' ? deptFilter : undefined);
    } catch (err) {
      console.error('Error saving machine:', err);
    }
  };

  const handleEdit = (m: Machine) => {
    setFormData({
      name: m.name,
      level: m.level,
      process: m.process || '',
      department: m.department,
    });
    setEditingId(m.id);
    // Smooth scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this machine?')) return;
    try {
      await deleteMachine(id);
      loadMachines(typeof deptFilter === 'number' ? deptFilter : undefined);
    } catch (err) {
      console.error('Error deleting machine:', err);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', level: 1, process: '', department: undefined as unknown as number });
    setImageFile(null);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.1),transparent_50%)]"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8 pt-20">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-4xl font-bold text-transparent">
            Machine Management
          </h1>
          <p className="text-lg text-gray-600">
            Manage your industrial machines with ease
          </p>
        </div>

        {/* Department Filter - Uncommented and Enhanced */}
        <div className="mb-8 rounded-2xl border border-gray-200/60 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <FiFilter className="h-5 w-5 text-blue-600" />
              </div>
              <label htmlFor="deptFilter" className="text-base font-semibold text-gray-700">
                Filter by Department
              </label>
            </div>
            <div className="relative sm:w-80">
              <select
                id="deptFilter"
                value={deptFilter}
                onChange={handleFilterChange}
                className="block w-full appearance-none rounded-xl border-2 border-gray-200 bg-white px-4 py-3 pr-10 text-gray-900 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
              >
                <option value="">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col gap-8">
          <MachineForm
            formData={formData}
            imageFile={imageFile}
            operations={operations}
            departments={departments}
            isEditing={!!editingId}
            isSubmitting={isLoading}
            onInputChange={handleInputChange}
            onFileChange={handleFileChange}
            onSubmit={handleSubmit}
            onCancel={resetForm}
          />
          <MachineList
            machines={machines}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default MachinesPage;