import React, { useEffect, useState } from 'react';
import AllocationForm from '../../organisms/Machine/AllocationForm/AllocationForm';
import AllocationTable from '../../organisms/Machine/AllocationTable/AllocationTable';
import {
  fetchMachineAllocations,
  createMachineAllocation,
  updateMachineAllocation,
  deleteMachineAllocation,
  fetchEligibleEmployees,
  fetchEmployees,
} from './allocationApi';
import { fetchMachines, fetchDepartments } from './machinesApi';
import type {
  MachineAllocation,
  Machine,
  SkillMatrix,
  MachineAllocationRequest,
  Department,
} from './types';

const MachineAllocationsPage: React.FC = () => {
  const [allocations, setAllocations] = useState<MachineAllocation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [employees, setEmployees] = useState<SkillMatrix[]>([]);
  const [formData, setFormData] = useState<{ department: number | ''; machine: number | ''; employee: string | '' }>({
    department: '',
    machine: '',
    employee: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingEmployees, setIsFetchingEmployees] = useState(false);

  // Get machine level for level comparison
  const machineLevel = machines.find(m => m.id === formData.machine)?.level;

  useEffect(() => {
    init();
  }, []);

  // Department change -> fetch machines for department
  useEffect(() => {
    const dep = Number(formData.department);
    if (dep) {
      fetchMachines({ department_id: dep })
        .then(setMachines)
        .catch(console.error);
      setFormData(prev => ({ ...prev, machine: '', employee: '' }));
    } else {
      setMachines([]);
      setFormData(prev => ({ ...prev, machine: '', employee: '' }));
    }
  }, [formData.department]);

  const init = async () => {
    setIsLoading(true);
    try {
      const [deps, allocs, emps] = await Promise.all([
        fetchDepartments(), 
        fetchMachineAllocations(), 
        fetchEmployees()
      ]);
      setDepartments(deps);
      setAllocations(allocs);
      setEmployees(emps);
    } catch (err) {
      console.error('Init error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        value === ''
          ? ''
          : name === 'employee'
          ? value               // keep employee as string
          : Number(value),      // convert department & machine to numbers
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const departmentId = Number(formData.department);
      const machineId = Number(formData.machine);
      const employeeId = formData.employee;
      
      if (!departmentId || !machineId || !employeeId) {
        throw new Error('Department, Machine and Employee are required');
      }

      const payload: MachineAllocationRequest = {
        machine: machineId,
        department: departmentId,
        employee: employeeId,
      };
      
      if (editingId) {
        await updateMachineAllocation(editingId, payload);
      } else {
        await createMachineAllocation(payload);
      }

      // Success path - refresh the list
      resetForm();
      const updatedAllocations = await fetchMachineAllocations();
      setAllocations(updatedAllocations);
      console.log('Allocation saved successfully!');
      
    } catch (err) {
      console.error('Error saving allocation:', err);
      
      // Even if there's an error, try to refresh the list
      // because the allocation might have been saved despite the error
      try {
        console.log('Attempting to refresh allocations despite error...');
        const updatedAllocations = await fetchMachineAllocations();
        setAllocations(updatedAllocations);
        
        // Reset form if allocation was actually saved
        if (updatedAllocations.length > allocations.length) {
          resetForm();
          console.log('Allocation was saved despite error - list updated');
        }
      } catch (refreshError) {
        console.error('Failed to refresh allocations:', refreshError);
      }
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this allocation?')) return;
    
    try {
      await deleteMachineAllocation(id);
      const allocs = await fetchMachineAllocations();
      setAllocations(allocs || []);
    } catch (error) {
      console.error('Error deleting allocation:', error);
    }
  };

  const handleManualRefresh = async () => {
    try {
      setIsLoading(true);
      const updatedAllocations = await fetchMachineAllocations();
      setAllocations(updatedAllocations);
      console.log('Allocations refreshed successfully');
    } catch (error) {
      console.error('Manual refresh failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ department: '', machine: '', employee: '' });
    setEditingId(null);
  };

  // Auto-refresh every 30 seconds to catch status updates
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!isLoading) {
        try {
          const updatedAllocations = await fetchMachineAllocations();
          setAllocations(updatedAllocations);
        } catch (error) {
          console.error('Auto-refresh failed:', error);
        }
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-violet-50/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.1),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(168,85,247,0.1),transparent_50%)]"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8 pt-20">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-purple-800 to-violet-600 bg-clip-text text-4xl font-bold text-transparent">
            Machine Allocations
          </h1>
          <p className="text-lg text-gray-600">
            Assign employees to machines and track allocations
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col gap-8">
          <AllocationForm
            formData={formData}
            departments={departments}
            machines={machines}
            employees={employees}
            isEditing={!!editingId}
            isSubmitting={isLoading}
            isFetchingEmployees={isFetchingEmployees}
            machineLevel={machineLevel}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onCancel={resetForm}
          />

          <AllocationTable 
            allocations={allocations} 
            isLoading={isLoading} 
            onDelete={handleDelete}
            onRefresh={handleManualRefresh}
          />
        </div>
      </div>
    </div>
  );
};

export default MachineAllocationsPage;