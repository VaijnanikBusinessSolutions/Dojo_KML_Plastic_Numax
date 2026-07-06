// import React from 'react';
// import { FiPlus, FiEdit2, FiX, FiCheck, FiUsers, FiTool, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

// const AllocationForm = ({
//   formData,
//   departments,
//   machines,
//   employees,
//   isEditing,
//   isSubmitting,
//   isFetchingEmployees,
//   machineLevel,
//   onInputChange,
//   onSubmit,
//   onCancel,
// }) => {
//   // Helper function to determine if an employee is eligible
//   const isEmployeeEligible = (employee) => {
//     if (!machineLevel || !employee.level) return false;
//     return employee.level >= machineLevel;
//   };

//   // Group employees by eligibility
//   const eligibleEmployees = employees.filter(emp => isEmployeeEligible(emp));
//   const ineligibleEmployees = employees.filter(emp => !isEmployeeEligible(emp));

//   const getEmployeeDisplayName = (employee) => {
//     const status = isEmployeeEligible(employee) ? '✅ Approved' : '⏳ Pending';
//     return `${employee.employee_name || `Employee ${employee.id}`} (Level ${employee.level}) - ${status}`;
//   };

//   return (
//     <div className="relative overflow-hidden rounded-2xl border border-gray-200/60 bg-gradient-to-br from-white via-white to-gray-50/30 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
//       {/* Header with gradient background */}
//       <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
//         <div className="absolute inset-0 bg-black/5"></div>
//         <h2 className="relative flex items-center text-xl font-bold text-white">
//           {isEditing ? (
//             <>
//               <div className="mr-3 rounded-lg bg-white/20 p-2">
//                 <FiEdit2 className="h-5 w-5" />
//               </div>
//               Edit Allocation
//             </>
//           ) : (
//             <>
//               <div className="mr-3 rounded-lg bg-white/20 p-2">
//                 <FiPlus className="h-5 w-5" />
//               </div>
//               Create New Allocation
//             </>
//           )}
//         </h2>
//       </div>

//       <div className="p-8">
//         <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
//           {/* Department */}
//           <div className="group">
//             <label htmlFor="department" className="mb-3 flex items-center text-sm font-semibold text-gray-700 transition-colors group-focus-within:text-green-600">
//               <FiUsers className="mr-2 h-4 w-4" />
//               Department <span className="ml-1 text-red-500">*</span>
//             </label>
//             <div className="relative">
//               <select
//                 id="department"
//                 name="department"
//                 value={formData.department}
//                 onChange={onInputChange}
//                 className="block w-full appearance-none rounded-xl border-2 border-gray-200 bg-white px-4 py-3 pr-10 text-gray-900 shadow-sm transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/20"
//                 required
//               >
//                 <option value="">Select Department</option>
//                 {departments.map(d => (
//                   <option key={d.id} value={d.id}>{d.name}</option>
//                 ))}
//               </select>
//               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
//                 <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                 </svg>
//               </div>
//             </div>
//           </div>

//           {/* Machine */}
//           <div className="group">
//             <label htmlFor="machine" className="mb-3 flex items-center text-sm font-semibold text-gray-700 transition-colors group-focus-within:text-green-600">
//               <FiTool className="mr-2 h-4 w-4" />
//               Machine <span className="ml-1 text-red-500">*</span>
//             </label>
//             <div className="relative">
//               <select
//                 id="machine"
//                 name="machine"
//                 value={formData.machine}
//                 onChange={onInputChange}
//                 className="block w-full appearance-none rounded-xl border-2 border-gray-200 bg-white px-4 py-3 pr-10 text-gray-900 shadow-sm transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
//                 required
//                 disabled={!formData.department}
//               >
//                 <option value="">
//                   {!formData.department ? 'Select Department First' : 'Select Machine'}
//                 </option>
//                 {machines.map(m => (
//                   <option key={m.id} value={m.id}>
//                     {m.name} - Level {m.level}
//                   </option>
//                 ))}
//               </select>
//               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
//                 <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                 </svg>
//               </div>
//             </div>
//             {!formData.department && (
//               <p className="mt-2 text-xs text-amber-600">
//                 💡 Select a department first to see available machines
//               </p>
//             )}
//             {machineLevel && (
//               <div className="mt-2 flex items-center text-xs text-blue-600">
//                 <FiTool className="mr-1 h-3 w-3" />
//                 Required Level: {machineLevel}
//               </div>
//             )}
//           </div>

//           {/* Employee */}
//           <div className="group">
//             <label htmlFor="employee" className="mb-3 flex items-center text-sm font-semibold text-gray-700 transition-colors group-focus-within:text-green-600">
//               <FiUsers className="mr-2 h-4 w-4" />
//               Employee <span className="ml-1 text-red-500">*</span>
//             </label>
//             <div className="relative">
//               <select
//                 id="employee"
//                 name="employee"
//                 value={formData.employee}
//                 onChange={onInputChange}
//                 className="block w-full appearance-none rounded-xl border-2 border-gray-200 bg-white px-4 py-3 pr-10 text-gray-900 shadow-sm transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
//                 required
//                 disabled={!formData.machine || isFetchingEmployees}
//               >
//                 <option value="">
//                   {isFetchingEmployees 
//                     ? 'Loading employees...' 
//                     : !formData.machine 
//                       ? 'Select Machine First' 
//                       : 'Select Employee'
//                   }
//                 </option>
                
//                 {/* All Employees - Simple list without grouping */}
//                 {!isFetchingEmployees && employees.map(e => (
//                   <option key={e.id} value={e.id}>
//                     {e.employee_name || e.name || `Employee ${e.employee_code || e.id}`} (Level {e.level})
//                   </option>
//                 ))}
//               </select>
//               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
//                 {isFetchingEmployees ? (
//                   <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-200 border-t-green-600"></div>
//                 ) : (
//                   <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                   </svg>
//                 )}
//               </div>
//             </div>
//             {!formData.machine && !isFetchingEmployees && (
//               <p className="mt-2 text-xs text-amber-600">
//                 💡 Select a machine first to see available employees
//               </p>
//             )}
            
//             {/* Show approval status info */}
//             {formData.employee && !isFetchingEmployees && (
//               <div className="mt-2 space-y-1">
//                 {(() => {
//                   const selectedEmployee = employees.find(e => e.id.toString() === formData.employee.toString());
//                   if (!selectedEmployee) return null;
                  
//                   const employeeName = selectedEmployee.employee_name || selectedEmployee.name || `Employee ${selectedEmployee.employee_code || selectedEmployee.id}`;
//                   const isEligible = isEmployeeEligible(selectedEmployee);
//                   return (
//                     <div className={`flex items-center text-xs ${isEligible ? 'text-green-600' : 'text-amber-600'}`}>
//                       {isEligible ? (
//                         <>
//                           <FiCheckCircle className="mr-1 h-3 w-3" />
//                           {employeeName} will be auto-approved (Level {selectedEmployee.level} ≥ Required {machineLevel})
//                         </>
//                       ) : (
//                         <>
//                           <FiAlertCircle className="mr-1 h-3 w-3" />
//                           {employeeName} will be pending approval (Level {selectedEmployee.level} &lt; Required {machineLevel})
//                         </>
//                       )}
//                     </div>
//                   );
//                 })()}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Level Requirements Info */}
//         {machineLevel && (
//           <div className="mt-6 rounded-xl bg-blue-50 border border-blue-200 p-4">
//             <div className="flex items-start">
//               <FiTool className="mt-0.5 mr-2 h-4 w-4 text-blue-600 flex-shrink-0" />
//               <div className="text-sm text-blue-800">
//                 <p className="font-semibold mb-1">Level Requirements:</p>
//                 <p>
//                   • Employees with level <span className="font-semibold">{machineLevel} or higher</span> will be <span className="text-green-600 font-semibold">automatically approved</span>
//                 </p>
//                 <p>
//                   • Employees with level <span className="font-semibold">below {machineLevel}</span> will have <span className="text-amber-600 font-semibold">pending status</span> until they level up
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Action Buttons */}
//         <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
//           {isEditing && (
//             <button
//               type="button"
//               onClick={onCancel}
//               className="group inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
//               disabled={isSubmitting}
//             >
//               <FiX className="h-4 w-4 transition-transform group-hover:scale-110" />
//               Cancel
//             </button>
//           )}
//           <button
//             type="button"
//             onClick={onSubmit}
//             className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-500/30 disabled:cursor-not-allowed disabled:opacity-50"
//             disabled={isSubmitting || isFetchingEmployees}
//           >
//             {isSubmitting ? (
//               <>
//                 <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
//                 {isEditing ? 'Updating...' : 'Creating...'}
//               </>
//             ) : (
//               <>
//                 <FiCheck className="h-4 w-4 transition-transform group-hover:scale-110" />
//                 {isEditing ? 'Update Allocation' : 'Create Allocation'}
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AllocationForm;


import { FC, useMemo, ChangeEvent } from 'react';
import { FiPlus, FiEdit2, FiX, FiCheck, FiUsers, FiTool, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

// --- TYPE DEFINITIONS ---
type FormData = {
  department: string;
  machine: string;
  employee: string;
  is_temporary?: boolean;
  access_date?: string;
};

type Department = {
  id: number | string;
  name: string;
};

type Machine = {
  id: number | string;
  name: string;
  level: number;
  department?: number | string; // CHANGED: Property name updated to match your API
};

type Employee = {
  id: number | string;
  employee_name?: string;
  name?: string;
  employee_code?: string;
  level: number;
  station_name?: string;
};

type AllocationFormProps = {
  formData: FormData;
  departments: Department[];
  machines: Machine[];
  employees: Employee[];
  isEditing: boolean;
  isSubmitting: boolean;
  isFetchingEmployees: boolean;
  machineLevel: number | null;
  onInputChange: (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

const AllocationForm: FC<AllocationFormProps> = ({
  formData,
  departments,
  machines,
  employees,
  isEditing,
  isSubmitting,
  isFetchingEmployees,
  machineLevel,
  onInputChange,
  onSubmit,
  onCancel,
}) => {
  const isEmployeeEligible = (employee: Employee) => {
    if (!machineLevel || !employee.level) return false;
    return employee.level >= machineLevel;
  };

  const getEmployeeDisplayName = (emp: Employee, isEligible: boolean) => {
    const name = emp.employee_name || emp.name || `Employee ${emp.employee_code || emp.id}`;
    const station = emp.station_name ? ` - ${emp.station_name}` : '';
    return `${name} (Level ${emp.level})${station}`;
  };

  const eligibleEmployees = employees.filter(isEmployeeEligible);
  const pendingEmployees = employees.filter(e => !isEmployeeEligible(e));

  const filteredMachines = useMemo(() => {
    if (!formData.department) {
      return [];
    }
    if (!machines) {
        return [];
    }

    return machines.filter((machine) => {
      // CHANGED: Use `machine.department` to match your API property name
      return machine && machine.department && machine.department.toString() === formData.department.toString();
    });
  }, [formData.department, machines]);

  const handleDepartmentChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onInputChange(e);
    onInputChange({ target: { name: 'machine', value: '' } } as ChangeEvent<HTMLSelectElement>);
    onInputChange({ target: { name: 'employee', value: '' } } as ChangeEvent<HTMLSelectElement>);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200/60 bg-gradient-to-br from-white via-white to-gray-50/30 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
        <div className="absolute inset-0 bg-black/5"></div>
        <h2 className="relative flex items-center text-xl font-bold text-white">
          {isEditing ? (
            <><div className="mr-3 rounded-lg bg-white/20 p-2"><FiEdit2 className="h-5 w-5" /></div> Edit Allocation</>
          ) : (
            <><div className="mr-3 rounded-lg bg-white/20 p-2"><FiPlus className="h-5 w-5" /></div> Create New Allocation</>
          )}
        </h2>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Department */}
          <div className="group">
            <label htmlFor="department" className="mb-3 flex items-center text-sm font-semibold text-gray-700 transition-colors group-focus-within:text-green-600">
              <FiUsers className="mr-2 h-4 w-4" /> Department <span className="ml-1 text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleDepartmentChange}
                className="block w-full appearance-none rounded-xl border-2 border-gray-200 bg-white px-4 py-3 pr-10 text-gray-900 shadow-sm transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/20"
                required
              >
                <option value="">Select Department</option>
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

          {/* Machine */}
          <div className="group">
            <label htmlFor="machine" className="mb-3 flex items-center text-sm font-semibold text-gray-700 transition-colors group-focus-within:text-green-600">
              <FiTool className="mr-2 h-4 w-4" /> Machine <span className="ml-1 text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="machine"
                name="machine"
                value={formData.machine}
                onChange={onInputChange}
                className="block w-full appearance-none rounded-xl border-2 border-gray-200 bg-white px-4 py-3 pr-10 text-gray-900 shadow-sm transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                required
                disabled={!formData.department}
              >
                <option value="">
                  {!formData.department ? 'Select Department First' : 'Select Machine'}
                </option>
                {filteredMachines.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} - Level {m.level}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {!formData.department && (
              <p className="mt-2 text-xs text-amber-600">💡 Select a department first to see available machines</p>
            )}
            {machineLevel && (
              <div className="mt-2 flex items-center text-xs text-blue-600">
                <FiTool className="mr-1 h-3 w-3" /> Required Level: {machineLevel}
              </div>
            )}
          </div>

          {/* Employee */}
          <div className="group">
            <label htmlFor="employee" className="mb-3 flex items-center text-sm font-semibold text-gray-700 transition-colors group-focus-within:text-green-600">
              <FiUsers className="mr-2 h-4 w-4" /> Employee <span className="ml-1 text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="employee"
                name="employee"
                value={formData.employee}
                onChange={onInputChange}
                className="block w-full appearance-none rounded-xl border-2 border-gray-200 bg-white px-4 py-3 pr-10 text-gray-900 shadow-sm transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                required
                disabled={!formData.machine || isFetchingEmployees}
              >
                <option value="">
                  {isFetchingEmployees ? 'Loading employees...' : !formData.machine ? 'Select Machine First' : 'Select Employee'}
                </option>
                {!isFetchingEmployees && eligibleEmployees.length > 0 && (
                  <optgroup label="Eligible Employees">
                    {eligibleEmployees.map(e => (
                      <option key={e.id} value={e.id}>
                        {getEmployeeDisplayName(e, true)}
                      </option>
                    ))}
                  </optgroup>
                )}
                {!isFetchingEmployees && pendingEmployees.length > 0 && (
                  <optgroup label="Pending/Ineligible Employees">
                    {pendingEmployees.map(e => (
                      <option key={e.id} value={e.id}>
                        {getEmployeeDisplayName(e, false)}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                {isFetchingEmployees ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-200 border-t-green-600"></div>
                ) : (
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>
            </div>
            {!formData.machine && !isFetchingEmployees && (
              <p className="mt-2 text-xs text-amber-600">💡 Select a machine first to see available employees</p>
            )}
            {formData.employee && !isFetchingEmployees && (
              <div className="mt-2 space-y-1">
                {(() => {
                  const selectedEmployee = employees.find(e => e.id.toString() === formData.employee.toString());
                  if (!selectedEmployee) return null;

                  const employeeName = selectedEmployee.employee_name || selectedEmployee.name || `Employee ${selectedEmployee.employee_code || selectedEmployee.id}`;
                  const isEligible = isEmployeeEligible(selectedEmployee);
                  return (
                    <div className={`flex items-center text-xs ${isEligible ? 'text-green-600' : 'text-amber-600'}`}>
                      {isEligible ? (
                        <><FiCheckCircle className="mr-1 h-3 w-3" />{employeeName} will be auto-approved (Level {selectedEmployee.level} ≥ Required {machineLevel})</>
                      ) : (
                        <><FiAlertCircle className="mr-1 h-3 w-3" />{employeeName} will be pending approval (Level {selectedEmployee.level} &lt; Required {machineLevel})</>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Temporary Access Section */}
        <div className={`mt-6 rounded-xl border p-5 transition-all duration-300 ${formData.is_temporary ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_temporary"
                name="is_temporary"
                checked={formData.is_temporary || false}
                onChange={onInputChange}
                className="h-5 w-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <label htmlFor="is_temporary" className="ml-3 flex items-center text-sm font-semibold text-gray-700">
                <FiAlertCircle className="mr-2 h-4 w-4 text-amber-500" />
                Temporary Access
              </label>
            </div>
            
            {formData.is_temporary && (
              <div className="flex-1 animate-in fade-in slide-in-from-left-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <label htmlFor="access_date" className="text-sm font-medium text-gray-700 sm:w-auto">
                    Expiry Date: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="access_date"
                    name="access_date"
                    value={formData.access_date || ''}
                    onChange={onInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required={formData.is_temporary}
                    className="flex-1 rounded-lg border-2 border-amber-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Level Requirements Info */}
        {machineLevel && (
          <div className="mt-6 rounded-xl bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-start">
              <FiTool className="mt-0.5 mr-2 h-4 w-4 text-blue-600 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Level Requirements:</p>
                <p>• Employees with level <span className="font-semibold">{machineLevel} or higher</span> will be <span className="text-green-600 font-semibold">automatically approved</span></p>
                <p>• Employees with level <span className="font-semibold">below {machineLevel}</span> will have <span className="text-amber-600 font-semibold">pending status</span> until they level up</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          {isEditing && (
            <button
              type="button"
              onClick={onCancel}
              className="group inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
            >
              <FiX className="h-4 w-4 transition-transform group-hover:scale-110" /> Cancel
            </button>
          )}
          <button
            type="button"
            onClick={onSubmit}
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting || isFetchingEmployees}
          >
            {isSubmitting ? (
              <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>{isEditing ? 'Updating...' : 'Creating...'}</>
            ) : (
              <><FiCheck className="h-4 w-4 transition-transform group-hover:scale-110" />{isEditing ? 'Update Allocation' : 'Create Allocation'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllocationForm;