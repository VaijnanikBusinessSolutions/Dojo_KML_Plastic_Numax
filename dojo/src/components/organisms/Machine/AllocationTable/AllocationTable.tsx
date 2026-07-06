import React from 'react';
import { FiTrash2, FiList, FiCalendar, FiUser, FiTool, FiCheckCircle } from 'react-icons/fi';
import type { MachineAllocation } from '../../../pages/Machine/types';

type Props = {
  allocations: MachineAllocation[];
  isLoading: boolean;
  onDelete: (id: number) => void;
};

const AllocationTable: React.FC<Props> = ({ allocations, isLoading, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200/60 bg-gradient-to-br from-white via-white to-gray-50/30 shadow-lg backdrop-blur-sm">
      {/* Header with gradient background */}
      <div className="relative bg-gradient-to-r from-purple-600 to-violet-600 px-8 py-6">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative flex items-center justify-between">
          <h2 className="flex items-center text-xl font-bold text-white">
            <div className="mr-3 rounded-lg bg-white/20 p-2">
              <FiList className="h-5 w-5" />
            </div>
            Allocation Records
            <span className="ml-3 rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
              {allocations.length} {allocations.length === 1 ? 'allocation' : 'allocations'}
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
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
            <p className="text-lg font-medium text-gray-600">Loading allocations...</p>
            <p className="text-sm text-gray-500">Please wait while we fetch your data</p>
          </div>
        ) : allocations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-6 rounded-full bg-gray-100 p-6">
              <FiList className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-700">No Allocations Found</h3>
            <p className="mb-6 max-w-md text-center text-gray-500">
              Start by creating your first machine allocation using the form above. 
              Assign employees to machines and track their assignments.
            </p>
            <div className="rounded-lg bg-purple-50 px-4 py-2">
              <p className="text-sm font-medium text-purple-700">💡 Tip: Use the form above to create your first allocation</p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden overflow-hidden rounded-xl border border-gray-200 shadow-sm lg:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                      <div className="flex items-center gap-2">
                        <FiTool className="h-4 w-4" />
                        Machine
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                      <div className="flex items-center gap-2">
                        <FiUser className="h-4 w-4" />
                        Employee
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="h-4 w-4" />
                        Allocated At
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                      <div className="flex items-center gap-2">
                        <FiCheckCircle className="h-4 w-4" />
                        Status
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {allocations.map((a, index) => {
                    console.log("allo", allocations);
                    return (
                      <tr 
                        key={a.id} 
                        className="group transition-all duration-200 hover:bg-purple-50/50"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-blue-500 mr-3"></div>
                            <span className="text-sm font-semibold text-gray-900">{a.machine_name}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                              <FiUser className="h-4 w-4 text-gray-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{a.employee_name}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {new Date(a.allocated_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(a.approval_status)}`}>
                            <div className="h-1.5 w-1.5 rounded-full bg-current"></div>
                            {a.approval_status}
                          </span>
                          {a.is_temporary && (
                            <div className="mt-2 flex items-center gap-1">
                              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase">
                                Temporary
                              </span>
                              {a.access_date && (
                                <span className="text-xs text-amber-700 font-medium">
                                  Until {new Date(a.access_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(a.id);
                            }}
                            className="inline-flex items-center gap-2 rounded-lg border-2 border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition-all duration-200 hover:border-red-300 hover:bg-red-100 hover:scale-105"
                            title="Delete Allocation"
                          >
                            <FiTrash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="grid gap-4 lg:hidden">
              {allocations.map((a, index) => {
                console.log("allo", allocations);
                return (
                  <div
                    key={a.id}
                    className="animate-in fade-in-0 slide-in-from-bottom-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FiTool className="h-4 w-4 text-blue-600" />
                          <span className="font-semibold text-gray-900">{a.machine}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <FiUser className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-700">{a.employee}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <FiCalendar className="h-4 w-4 text-gray-500" />
                          <span className="text-xs text-gray-500">
                            {new Date(a.allocated_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${getStatusColor(a.approval_status)}`}>
                        <div className="h-1.5 w-1.5 rounded-full bg-current"></div>
                        {a.approval_status}
                      </span>
                    </div>
                    {a.is_temporary && (
                      <div className="mb-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 border border-amber-100">
                        <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase">
                          Temporary
                        </span>
                        {a.access_date && (
                          <span className="text-xs font-medium text-amber-700">
                            Expires: {new Date(a.access_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(a.id);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border-2 border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition-all duration-200 hover:border-red-300 hover:bg-red-100"
                      >
                        <FiTrash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AllocationTable;