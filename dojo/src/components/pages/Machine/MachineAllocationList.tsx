// src/components/pages/Machine/MachineAllocationList.tsx
import React, { useEffect, useState } from 'react';
import AllocationTable from '../../organisms/Machine/AllocationTable/AllocationTable';
import {
  fetchMachineAllocations,
  deleteMachineAllocation,
} from './allocationApi';
import type { MachineAllocation } from './types';

const MachineAllocationList: React.FC = () => {
  const [allocations, setAllocations] = useState<MachineAllocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAllocations();
    // empty deps -> run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAllocations = async () => {
    setIsLoading(true);
    try {
      const allocs = await fetchMachineAllocations();
      setAllocations(allocs);
    } catch (err) {
      console.error('Failed to load allocations:', err);
      setAllocations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this allocation?')) return;
    try {
      await deleteMachineAllocation(id);
      // refresh list after delete
      await loadAllocations();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-violet-50/20">
      {/* Background Pattern (kept consistent with main page) */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(168,85,247,0.1),transparent_50%)]" />
      </div>

      <div className="relative container mx-auto px-4 py-8 pt-20">
        <div className="mb-8 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-purple-800 to-violet-600 bg-clip-text text-4xl font-bold text-transparent">
            Machine Allocation List
          </h1>
          <p className="text-lg text-gray-600">View and manage all machine allocations</p>
        </div>

        {/* Only the AllocationTable is rendered here */}
        <div className="flex flex-col gap-8">
          <AllocationTable
            allocations={allocations}
            isLoading={isLoading}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default MachineAllocationList;
