import React from 'react';
import MachineCard from '../../../molecules/Machine/MachineCard/MachineCard';
import type { Machine } from '../../../pages/Machine/types';
import { FiGrid, FiBox } from 'react-icons/fi';

type Props = {
  machines: Machine[];
  isLoading: boolean;
  onEdit: (m: Machine) => void;
  onDelete: (id: number) => void;
};

const MachineList: React.FC<Props> = ({ machines, isLoading, onEdit, onDelete }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200/60 bg-gradient-to-br from-white via-white to-gray-50/30 shadow-lg backdrop-blur-sm">
      {/* Header with gradient background */}
      <div className="relative bg-gradient-to-r from-gray-700 to-gray-800 px-8 py-6">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative flex items-center justify-between">
          <h2 className="flex items-center text-xl font-bold text-white">
            <div className="mr-3 rounded-lg bg-white/20 p-2">
              <FiGrid className="h-5 w-5" />
            </div>
            Machine Collection
            <span className="ml-3 rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
              {machines.length} {machines.length === 1 ? 'machine' : 'machines'}
            </span>
          </h2>
          {isLoading && (
            <div className="flex items-center gap-2 text-white/80">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
              <span className="text-sm font-medium">Loading...</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            <p className="text-lg font-medium text-gray-600">Loading machines...</p>
            <p className="text-sm text-gray-500">Please wait while we fetch your data</p>
          </div>
        ) : machines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-6 rounded-full bg-gray-100 p-6">
              <FiBox className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-700">No Machines Found</h3>
            <p className="mb-6 max-w-md text-center text-gray-500">
              Get started by creating your first machine using the form above. 
              You can add images, set levels, and assign processes.
            </p>
            <div className="rounded-lg bg-blue-50 px-4 py-2">
              <p className="text-sm font-medium text-blue-700">💡 Tip: Fill out the form above to add your first machine</p>
            </div>
          </div>
        ) : (
          <>
            {/* Grid Header */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{machines.length}</span> machine{machines.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Responsive Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {machines.map((machine, index) => (
                <div
                  key={machine.id}
                  className="animate-in fade-in-0 slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <MachineCard 
                    machine={machine} 
                    onEdit={onEdit} 
                    onDelete={onDelete} 
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MachineList;