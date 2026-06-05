
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { FiCheck, FiX, FiClock, FiCheckCircle, FiXCircle, FiCpu, FiUser, FiActivity } from 'react-icons/fi';

// interface Machine {
//   id: number;
//   name: string;
//   image: string;
//   level: number;
//   process: string;
//   created_at: string;
//   updated_at: string;
// }

// interface MachineAllocation {
//   id: number;
//   machine: Machine;
//   employee: string;
//   allocated_at: string;
//   approval_status: string;
//   employee_name: string;
// }

// const ApprovalList: React.FC = () => {
//   const [allocations, setAllocations] = useState<MachineAllocation[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchAllocations = async () => {
//       try {
//         const response = await axios.get('http://127.0.0.1:8000/allocations/');
//         setAllocations(response.data);
//       } catch (err) {
//         setError('Failed to fetch machine allocations');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAllocations();
//   }, []);

//   const handleApproval = async (id: number, status: 'approved' | 'rejected') => {
//     try {
//       await axios.put(`http://127.0.0.1:8000/machine-allocation-approval/${id}/set-status/`, {
//         approval_status: status
//       });

//       setAllocations(prev =>
//         prev.map(allocation =>
//           allocation.id === id ? { ...allocation, approval_status: status } : allocation
//         )
//       );
//     } catch (err) {
//       console.error('Failed to update approval status', err);
//       alert('Failed to update approval status');
//     }
//   };

//   if (loading) {
//     return (
//       <>
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 flex justify-center items-center">
//           <div className="text-center">
//             <div className="relative">
//               <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200"></div>
//               <div className="absolute top-0 left-0 animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
//             </div>
//             <p className="mt-4 text-gray-600 font-medium">Loading approvals...</p>
//           </div>
//         </div>
//       </>
//     );
//   }

//   if (error) {
//     return (
//       <>
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 flex justify-center items-center px-4">
//           <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-red-100">
//             <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
//               <FiXCircle className="w-8 h-8 text-red-600" />
//             </div>
//             <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">Error Occurred</h3>
//             <p className="text-gray-600 text-center">{error}</p>
//           </div>
//         </div>
//       </>
//     );
//   }

//   const pendingCount = allocations.filter(a => a.approval_status === 'pending').length;
//   const approvedCount = allocations.filter(a => a.approval_status === 'approved').length;
//   const rejectedCount = allocations.filter(a => a.approval_status === 'rejected').length;

//   return (
//     <>
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
//         <div className="container mx-auto px-4 py-8 pt-20">
//           {/* Header */}
//           <div className="text-center mb-10">
//             <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
//               Machine Allocation Approvals
//             </h1>
//             <p className="text-2xl text-gray-600">Review and manage machine allocation requests</p>
//           </div>

//           {/* Stats Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//             <div className="relative group">
//               <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
//               <div className="relative bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-gray-600 text-sm font-medium">Pending</p>
//                     <p className="text-3xl font-bold text-gray-800 mt-1">{pendingCount}</p>
//                   </div>
//                   <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl">
//                     <FiClock className="w-6 h-6 text-white" />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="relative group">
//               <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
//               <div className="relative bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-gray-600 text-sm font-medium">Approved</p>
//                     <p className="text-3xl font-bold text-gray-800 mt-1">{approvedCount}</p>
//                   </div>
//                   <div className="p-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl">
//                     <FiCheckCircle className="w-6 h-6 text-white" />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="relative group">
//               <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
//               <div className="relative bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-gray-600 text-sm font-medium">Rejected</p>
//                     <p className="text-3xl font-bold text-gray-800 mt-1">{rejectedCount}</p>
//                   </div>
//                   <div className="p-3 bg-gradient-to-r from-red-400 to-pink-400 rounded-xl">
//                     <FiXCircle className="w-6 h-6 text-white" />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Table */}
//           <div className="relative">
//             <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-20"></div>
//             <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
//                     <tr>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                         <div className="flex items-center">
//                           <FiCpu className="mr-2 text-blue-600" />
//                           Machine
//                         </div>
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                         <div className="flex items-center">
//                           <FiUser className="mr-2 text-purple-600" />
//                           Employee
//                         </div>
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                         <div className="flex items-center">
//                           <FiActivity className="mr-2 text-indigo-600" />
//                           Process
//                         </div>
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                         Allocated At
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                         Status
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {allocations.map((allocation) => (
//                       <tr key={allocation.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200">
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center">
//                             <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
//                               <FiCpu className="h-5 w-5 text-white" />
//                             </div>
//                             <div className="ml-4">
//                               <div className="text-sm font-medium text-gray-900">{allocation.machine.name}</div>
//                               <div className="text-xs text-gray-500">Level {allocation.machine.level}</div>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center">
//                             <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
//                               <FiUser className="h-5 w-5 text-white" />
//                             </div>
//                             <div className="ml-4">
//                               <div className="text-sm text-gray-900">{allocation.employee_name}</div>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
//                             {allocation.machine.process}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm text-gray-900">
//                             {new Date(allocation.allocated_at).toLocaleDateString()}
//                           </div>
//                           <div className="text-xs text-gray-500">
//                             {new Date(allocation.allocated_at).toLocaleTimeString()}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
//                             ${allocation.approval_status === 'approved'
//                               ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200'
//                               : allocation.approval_status === 'rejected'
//                               ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200'
//                               : 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200'}`}>
//                             <span className={`w-2 h-2 mr-2 rounded-full
//                               ${allocation.approval_status === 'approved'
//                                 ? 'bg-green-500'
//                                 : allocation.approval_status === 'rejected'
//                                 ? 'bg-red-500'
//                                 : 'bg-yellow-500 animate-pulse'}`}>
//                             </span>
//                             {allocation.approval_status.charAt(0).toUpperCase() + allocation.approval_status.slice(1)}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           {allocation.approval_status === 'pending' && (
//                             <div className="flex space-x-2">
//                               <button
//                                 onClick={() => handleApproval(allocation.id, 'approved')}
//                                 className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all duration-200 shadow-md hover:shadow-lg"
//                               >
//                                 <FiCheck className="mr-1.5" />
//                                 Approve
//                               </button>
//                               <button
//                                 onClick={() => handleApproval(allocation.id, 'rejected')}
//                                 className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:from-red-600 hover:to-pink-600 focus:outline-none focus:ring-4 focus:ring-red-200 transition-all duration-200 shadow-md hover:shadow-lg"
//                               >
//                                 <FiX className="mr-1.5" />
//                                 Reject
//                               </button>
//                             </div>
//                           )}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ApprovalList;



import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiCheck, FiX, FiClock, FiCheckCircle, FiXCircle, FiCpu, FiUser, FiActivity } from 'react-icons/fi';

interface Machine {
  id: number;
  name: string;
  image: string;
  level: number;
  process: {
    station_name?: string;
  }
  created_at: string;
  updated_at: string;
}

interface MachineAllocation {
  id: number;
  machine: Machine;
  employee: string;
  allocated_at: string;
  approval_status: string;
  employee_name: string;
  machine_name: string;
  machine_level: string;
}

const ApprovalList: React.FC = () => {
  const [allocations, setAllocations] = useState<MachineAllocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllocations = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/allocations/');
        setAllocations(response.data);
      } catch (err) {
        setError('Failed to fetch machine allocations');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllocations();
  }, []);

  const handleApproval = async (id: number, status: 'approved' | 'rejected') => {
    try {
      await axios.put(`http://127.0.0.1:8000/machine-allocation-approval/${id}/set-status/`, {
        approval_status: status
      });

      setAllocations(prev =>
        prev.map(allocation =>
          allocation.id === id ? { ...allocation, approval_status: status } : allocation
        )
      );
    } catch (err) {
      console.error('Failed to update approval status', err);
      alert('Failed to update approval status');
    }
  };

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 flex justify-center items-center">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200"></div>
              <div className="absolute top-0 left-0 animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Loading approvals...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 flex justify-center items-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-red-100">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <FiXCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">Error Occurred</h3>
            <p className="text-gray-600 text-center">{error}</p>
          </div>
        </div>
      </>
    );
  }

  const pendingCount = allocations.filter(a => a.approval_status === 'pending').length;
  const approvedCount = allocations.filter(a => a.approval_status === 'approved').length;
  const rejectedCount = allocations.filter(a => a.approval_status === 'rejected').length;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8 pt-20">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Machine Allocation Approvals
            </h1>
            <p className="text-2xl text-gray-600">Review and manage machine allocation requests</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Pending</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{pendingCount}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl">
                    <FiClock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Approved</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{approvedCount}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl">
                    <FiCheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Rejected</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{rejectedCount}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-red-400 to-pink-400 rounded-xl">
                    <FiXCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center">
                          <FiCpu className="mr-2 text-blue-600" />
                          Machine
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center">
                          <FiUser className="mr-2 text-purple-600" />
                          Employee
                        </div>
                      </th>
                      {/* <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center">
                          <FiActivity className="mr-2 text-indigo-600" />
                          Process
                        </div>
                      </th> */}
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Allocated At
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allocations.map((allocation) => (
                      <tr key={allocation.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                              <FiCpu className="h-5 w-5 text-white" />
                            </div>
                            <div className="ml-4">
                              {/* <div className="text-sm font-medium text-gray-900">{allocation.machine.name}</div> */}
                              <div className="text-sm font-medium text-gray-900">{allocation.machine_name}</div>
                              {/* <div className="text-xs text-gray-500">Level {allocation.machine.level}</div> */}
                              <div className="text-xs text-gray-500">Level {allocation.machine_level}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                              <FiUser className="h-5 w-5 text-white" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm text-gray-900">{allocation.employee_name}</div>
                            </div>
                          </div>
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {allocation.machine.process?.station_name}
                          </span>
                        </td> */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(allocation.allocated_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(allocation.allocated_at).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                            ${allocation.approval_status === 'approved'
                              ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200'
                              : allocation.approval_status === 'rejected'
                              ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200'
                              : 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200'}`}>
                            <span className={`w-2 h-2 mr-2 rounded-full
                              ${allocation.approval_status === 'approved'
                                ? 'bg-green-500'
                                : allocation.approval_status === 'rejected'
                                ? 'bg-red-500'
                                : 'bg-yellow-500 animate-pulse'}`}>
                            </span>
                            {allocation.approval_status.charAt(0).toUpperCase() + allocation.approval_status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {allocation.approval_status === 'pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleApproval(allocation.id, 'approved')}
                                className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all duration-200 shadow-md hover:shadow-lg"
                              >
                                <FiCheck className="mr-1.5" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleApproval(allocation.id, 'rejected')}
                                className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:from-red-600 hover:to-pink-600 focus:outline-none focus:ring-4 focus:ring-red-200 transition-all duration-200 shadow-md hover:shadow-lg"
                              >
                                <FiX className="mr-1.5" />
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApprovalList;







