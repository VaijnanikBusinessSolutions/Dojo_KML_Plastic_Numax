// import { useState, useEffect } from 'react';

// interface Employee {
//   emp_id: string;
//   first_name: string;
//   last_name: string;
//   department: string | null;
//   date_of_joining: string;
//   skills: any[];
// }

// interface Department {
//   department_id: number;
//   department_name: string;
// }

// interface Station {
//   station_id: number;
//   station_name: string;
// }

// interface Level {
//   level_id: number;
//   level_name: string;
// }

// // Updated interface to match the nested hierarchy structure
// interface HierarchyDepartment {
//   department_id: number;
//   department_name: string;
//   lines: {
//     line_id: number;
//     line_name: string;
//     sublines: {
//       subline_id: number;
//       subline_name: string;
//       stations: Station[];
//     }[];
//     stations: Station[];
//   }[];
//   sublines: {
//     subline_id: number;
//     subline_name: string;
//     stations: Station[];
//   }[];
//   stations: Station[];
// }

// interface AddSkillProps {
//   employeeID: string;
//   employee: Employee;
// }

// const API_BASE_URL = 'http://172.25.0.51:8000';

// const AddSkill = ({ employeeID, employee }: AddSkillProps) => {
//   const [showForm, setShowForm] = useState(false);
//   const [formData, setFormData] = useState({
//     departmentId: null as number | null,
//     stationId: null as number | null,
//     hierarchyId: null as number | null,
//     skillLevel: '',
//     startDate: '',
//     remarks: ''
//   });

//   const [departments, setDepartments] = useState<Department[]>([]);
//   const [levels, setLevels] = useState<Level[]>([]);
//   const [filteredStations, setFilteredStations] = useState<Station[]>([]);
//   const [hierarchyStructures, setHierarchyStructures] = useState<any[]>([]);

//   const [isLoading, setIsLoading] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   // Fetch initial data when form is shown
//   useEffect(() => {
//     if (!showForm) return;

//     const fetchData = async () => {
//       setIsLoading(true);
//       setError('');

//       try {
//         const [levelsRes, departmentsRes, hierarchyRes] = await Promise.all([
//           fetch(`${API_BASE_URL}/levels/`),
//           fetch(`${API_BASE_URL}/departments/`),
//           fetch(`${API_BASE_URL}/hierarchy-structures/`)
//         ]);

//         if (!levelsRes.ok || !departmentsRes.ok || !hierarchyRes.ok) {
//           throw new Error('Failed to fetch required data');
//         }

//         const [levelsData, departmentsData, hierarchyData] = await Promise.all([
//           levelsRes.json(),
//           departmentsRes.json(),
//           hierarchyRes.json()
//         ]);

//         console.log("📋 Levels:", levelsData);
//         console.log("🏢 Departments:", departmentsData);
//         console.log("🏗️ Hierarchy:", hierarchyData);

//         setLevels(levelsData);
//         setDepartments(departmentsData);
//         setHierarchyStructures(hierarchyData);

//       } catch (err) {
//         console.error("❌ Fetch Error:", err);
//         setError(err instanceof Error ? err.message : 'Failed to fetch data');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, [showForm]);

//   // Filter stations when department changes - using the correct hierarchy API
//   useEffect(() => {
//     if (!formData.departmentId) {
//       setFilteredStations([]);
//       return;
//     }

//     const fetchDepartmentStations = async () => {
//       try {
//         const response = await fetch(`${API_BASE_URL}/hierarchy/by-department/?department_id=${formData.departmentId}`);
//         if (!response.ok) {
//           throw new Error('Failed to fetch department hierarchy');
//         }

//         const hierarchyData: HierarchyDepartment = await response.json();
//         console.log("🏗️ Department hierarchy:", hierarchyData);

//         // Extract all stations from the nested structure
//         const allStations: Station[] = [];

//         // Stations directly under department
//         if (hierarchyData.stations) {
//           allStations.push(...hierarchyData.stations);
//         }

//         // Stations under sublines (not under lines)
//         if (hierarchyData.sublines) {
//           hierarchyData.sublines.forEach(subline => {
//             if (subline.stations) {
//               allStations.push(...subline.stations);
//             }
//           });
//         }

//         // Stations under lines
//         if (hierarchyData.lines) {
//           hierarchyData.lines.forEach(line => {
//             // Stations directly under line
//             if (line.stations) {
//               allStations.push(...line.stations);
//             }

//             // Stations under sublines of this line
//             if (line.sublines) {
//               line.sublines.forEach(subline => {
//                 if (subline.stations) {
//                   allStations.push(...subline.stations);
//                 }
//               });
//             }
//           });
//         }

//         // Remove duplicates based on station_id
//         const uniqueStations = allStations.filter((station, index, self) =>
//           index === self.findIndex(s => s.station_id === station.station_id)
//         );

//         setFilteredStations(uniqueStations);
//         console.log("🔍 Filtered stations for department", formData.departmentId, ":", uniqueStations);

//       } catch (err) {
//         console.error("❌ Error fetching department stations:", err);
//         setError('Failed to load stations for selected department');
//         setFilteredStations([]);
//       }
//     };

//     fetchDepartmentStations();
//   }, [formData.departmentId]);

//   const handleChange = (field: string, value: string | number | null) => {
//     setFormData(prev => {
//       const newData = { ...prev, [field]: value };

//       if (field === 'departmentId') {
//         newData.stationId = null;
//         newData.hierarchyId = null;
//       } else if (field === 'stationId') {
//         // Find the hierarchy structure for this department + station combination
//         const hierarchy = hierarchyStructures.find(h =>
//           h.department === formData.departmentId && h.station === value
//         );
//         newData.hierarchyId = hierarchy ? hierarchy.structure_id : null;
//         console.log("🎯 Selected hierarchy:", hierarchy);
//       }

//       return newData;
//     });
//   };

//   const handleSave = async () => {
//     const { departmentId, stationId, skillLevel, startDate } = formData;

//     if (!departmentId || !stationId || !skillLevel || !startDate) {
//       setError('Please fill all required fields');
//       return;
//     }

//     // The check for a hierarchy object can be removed as it's no longer being sent.

//     setIsSubmitting(true);
//     setError('');

//     try {
//       const payload = { // Create a clean payload object
//         employee: employeeID,
//         department: departmentId,   // ✅ CORRECTED: Send departmentId
//         station: stationId,         // ✅ CORRECTED: Send stationId
//         skill_level: skillLevel,    // This is now an ID because of Step 1
//         start_date: startDate,
//         remarks: formData.remarks,
//         status: 'scheduled'
//       };

//       console.log("💾 Saving skill with corrected data:", payload);

//       const response = await fetch(`${API_BASE_URL}/multiskilling/`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload) // Send the corrected payload
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         console.error("❌ Save error:", errorData);
//         // Display a more user-friendly error from the backend if available
//         const errorMessages = Object.entries(errorData)
//           .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
//           .join('; ');
//         throw new Error(errorMessages || 'Failed to save skill');
//       }

//       // ... rest of the function is fine

//       const result = await response.json();
//       console.log("✅ Save success:", result);

//       setSuccess('Skill added successfully!');
//       resetForm();
//     } catch (err) {
//       console.error("❌ Save error:", err);
//       setError(err instanceof Error ? err.message : 'Failed to save skill');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       departmentId: null,
//       stationId: null,
//       hierarchyId: null,
//       skillLevel: '',
//       startDate: '',
//       remarks: ''
//     });
//     setShowForm(false);
//     setTimeout(() => setSuccess(''), 3000);
//   };

//   const getSelectedDepartmentName = () => {
//     if (!formData.departmentId) return '';
//     const dept = departments.find(d => d.department_id === formData.departmentId);
//     return dept ? dept.department_name : '';
//   };

//   const getSelectedStationName = () => {
//     if (!formData.stationId) return '';
//     const station = filteredStations.find(s => s.station_id === formData.stationId);
//     return station ? station.station_name : '';
//   };

//   return (
//     <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-100 overflow-hidden">
//       {!showForm ? (
//         <div className="p-8 text-center">
//           <div className="mb-4">
//             <h3 className="text-xl font-bold text-gray-800 mb-2">Ready to Add a New Skill?</h3>
//             <p className="text-gray-600 mb-6">Expand {employee.first_name}'s capabilities with new skill allocations</p>
//           </div>
//           <button
//             onClick={() => setShowForm(true)}
//             className="bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center mx-auto"
//           >
//             <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//             </svg>
//             Add New Skill
//           </button>
//         </div>
//       ) : (
//         <div className="p-8">
//           <div className="mb-6">
//             <div className="flex items-center">
//               <div className="bg-gradient-to-r from-purple-500 to-red-600 p-2 rounded-full mr-3">
//                 <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
//                 </svg>
//               </div>
//               <h3 className="text-2xl font-bold text-gray-800">Skill Allocation Form</h3>
//             </div>
//             <p className="text-gray-600 mt-2 ml-10">Assign a new skill to {employee.first_name} {employee.last_name}</p>
//           </div>

//           {error && (
//             <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
//               <p>{error}</p>
//             </div>
//           )}

//           {success && (
//             <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
//               <p>{success}</p>
//             </div>
//           )}

//           {isLoading ? (
//             <div className="flex justify-center items-center py-12">
//               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
//             </div>
//           ) : (
//             <div className="space-y-6">
//               {/* Department Selection */}
//               <div className="space-y-2">
//                 <label className="flex items-center text-sm font-semibold text-gray-700">
//                   <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                   </svg>
//                   Department *
//                 </label>
//                 <select
//                   value={formData.departmentId || ''}
//                   onChange={(e) => handleChange('departmentId', e.target.value ? Number(e.target.value) : null)}
//                   className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 font-medium"
//                   required
//                 >
//                   <option value="">Select department...</option>
//                   {departments.map((dept) => (
//                     <option key={dept.department_id} value={dept.department_id}>
//                       {dept.department_name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Station Selection */}
//               <div className="space-y-2">
//                 <label className="flex items-center text-sm font-semibold text-gray-700">
//                   <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
//                   </svg>
//                   Station (Skill) *
//                 </label>
//                 <select
//                   value={formData.stationId || ''}
//                   onChange={(e) => handleChange('stationId', e.target.value ? Number(e.target.value) : null)}
//                   className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 font-medium"
//                   required
//                   disabled={!formData.departmentId}
//                 >
//                   <option value="">Select station...</option>
//                   {filteredStations.map((station) => (
//                     <option key={station.station_id} value={station.station_id}>
//                       {station.station_name}
//                     </option>
//                   ))}
//                 </select>
//                 {!formData.departmentId && (
//                   <p className="text-sm text-gray-500 italic">Please select a department first</p>
//                 )}
//                 {formData.departmentId && filteredStations.length === 0 && (
//                   <p className="text-sm text-orange-600 italic">No stations found for this department</p>
//                 )}
//               </div>

//               {/* Skill Level Selection */}
//               <div className="space-y-2">
//                 <label className="flex items-center text-sm font-semibold text-gray-700">
//                   <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
//                   </svg>
//                   Target Skill Level *
//                 </label>
//                 <select
//                   value={formData.skillLevel}
//                   onChange={(e) => handleChange('skillLevel', e.target.value)}
//                   className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all duration-300 font-medium"
//                   required
//                 >
//                   <option value="">Select target level...</option>
//                   {levels.map((level) => (
//                     <option key={level.level_id} value={level.level_id}>
//                       {level.level_name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Start Date */}
//               <div className="space-y-2">
//                 <label className="flex items-center text-sm font-semibold text-gray-700">
//                   <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                   </svg>
//                   Start Date *
//                 </label>
//                 <input
//                   type="date"
//                   value={formData.startDate}
//                   onChange={(e) => handleChange('startDate', e.target.value)}
//                   className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-300 focus:border-red-500 transition-all duration-300 font-medium"
//                   required
//                 />
//               </div>

//               {/* Remarks */}
//               <div className="space-y-2">
//                 <label className="flex items-center text-sm font-semibold text-gray-700">
//                   <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                   </svg>
//                   Remarks (optional)
//                 </label>
//                 <textarea
//                   placeholder="Add any additional remarks, requirements, or special instructions..."
//                   value={formData.remarks}
//                   onChange={(e) => handleChange('remarks', e.target.value)}
//                   className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-300 font-medium resize-none"
//                   rows={4}
//                 />
//               </div>

//               {/* Summary Section */}
//               {(formData.departmentId || formData.stationId || formData.skillLevel) && (
//                 <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-l-4 border-blue-500">
//                   <h4 className="font-semibold text-gray-800 mb-2">Assignment Summary:</h4>
//                   <div className="space-y-1 text-sm text-gray-700">
//                     <p><span className="font-medium">Employee:</span> {employee.first_name} {employee.last_name} ({employee.emp_id})</p>
//                     {formData.departmentId && (
//                       <p><span className="font-medium">Department:</span> {getSelectedDepartmentName()}</p>
//                     )}
//                     {formData.stationId && (
//                       <p><span className="font-medium">Station:</span> {getSelectedStationName()}</p>
//                     )}
//                     {formData.skillLevel && (
//                       <p><span className="font-medium">Target Level:</span> {formData.skillLevel}</p>
//                     )}
//                     {formData.startDate && (
//                       <p><span className="font-medium">Start Date:</span> {new Date(formData.startDate).toLocaleDateString()}</p>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* Action Buttons */}
//               <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
//                 <button
//                   onClick={resetForm}
//                   disabled={isSubmitting}
//                   className="px-8 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 flex items-center justify-center disabled:opacity-50"
//                 >
//                   <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSave}
//                   disabled={isSubmitting || isLoading || !formData.departmentId || !formData.stationId || !formData.skillLevel || !formData.startDate}
//                   className="bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
//                 >
//                   {isSubmitting ? (
//                     <>
//                       <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                       Saving...
//                     </>
//                   ) : (
//                     <>
//                       <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                       </svg>
//                       Save Allocation
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default AddSkill;



// FILE: src/components/addSkill/addSkill.tsx

import { useState, useEffect } from 'react';

// Interfaces (copied for context, no changes needed here)
interface Employee {
  emp_id: string;
  first_name: string;
  last_name: string;
  department: string | null;
  date_of_joining: string;
  skills: any[];
}

interface Department {
  department_id: number;
  department_name: string;
}

interface Station {
  station_id: number;
  station_name: string;
}

interface Level {
  level_id: number;
  level_name: string;
}

interface HierarchyDepartment {
  department_id: number;
  department_name: string;
  lines: {
    line_id: number;
    line_name: string;
    sublines: {
      subline_id: number;
      subline_name: string;
      stations: Station[];
    }[];
    stations: Station[];
  }[];
  sublines: {
    subline_id: number;
    subline_name: string;
    stations: Station[];
  }[];
  stations: Station[];
}

// --- CHANGE 1: UPDATE THE PROPS INTERFACE ---
// Add the 'onSkillAdded' callback function to the props.
interface AddSkillProps {
  employeeID: string;
  employee: Employee;
  onSkillAdded: () => void; // This is the crucial addition!
}

const API_BASE_URL = 'http://172.25.0.51:8000';

// --- CHANGE 2: ACCEPT THE NEW PROP IN THE COMPONENT SIGNATURE ---
const AddSkill = ({ employeeID, employee, onSkillAdded }: AddSkillProps) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    departmentId: null as number | null,
    stationId: null as number | null,
    hierarchyId: null as number | null,
    skillLevel: '',
    startDate: '',
    remarks: ''
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [hierarchyStructures, setHierarchyStructures] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  // --- CHANGE 3: REMOVE THE REDUNDANT INTERNAL SUCCESS STATE ---
  // const [success, setSuccess] = useState(''); // This is no longer needed

  // Fetch initial data when form is shown
  useEffect(() => {
    if (!showForm) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError('');

      try {
        const [levelsRes, departmentsRes, hierarchyRes] = await Promise.all([
          fetch(`${API_BASE_URL}/levels/`),
          fetch(`${API_BASE_URL}/departments/`),
          fetch(`${API_BASE_URL}/hierarchy-structures/`)
        ]);

        if (!levelsRes.ok || !departmentsRes.ok || !hierarchyRes.ok) {
          throw new Error('Failed to fetch required data');
        }

        const [levelsData, departmentsData, hierarchyData] = await Promise.all([
          levelsRes.json(),
          departmentsRes.json(),
          hierarchyRes.json()
        ]);

        setLevels(levelsData);
        setDepartments(departmentsData);
        setHierarchyStructures(hierarchyData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [showForm]);

  // Filter stations when department changes
  useEffect(() => {
    if (!formData.departmentId) {
      setFilteredStations([]);
      return;
    }

    const fetchDepartmentStations = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/hierarchy/by-department/?department_id=${formData.departmentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch department hierarchy');
        }
        const hierarchyData: HierarchyDepartment = await response.json();
        const allStations: Station[] = [];
        if (hierarchyData.stations) allStations.push(...hierarchyData.stations);
        if (hierarchyData.sublines) {
          hierarchyData.sublines.forEach(subline => {
            if (subline.stations) allStations.push(...subline.stations);
          });
        }
        if (hierarchyData.lines) {
          hierarchyData.lines.forEach(line => {
            if (line.stations) allStations.push(...line.stations);
            if (line.sublines) {
              line.sublines.forEach(subline => {
                if (subline.stations) allStations.push(...subline.stations);
              });
            }
          });
        }
        const uniqueStations = allStations.filter((station, index, self) =>
          index === self.findIndex(s => s.station_id === station.station_id)
        );
        setFilteredStations(uniqueStations);
      } catch (err) {
        setError('Failed to load stations for selected department');
        setFilteredStations([]);
      }
    };

    fetchDepartmentStations();
  }, [formData.departmentId]);

  const handleChange = (field: string, value: string | number | null) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'departmentId') {
        newData.stationId = null;
        newData.hierarchyId = null;
      } else if (field === 'stationId') {
        const hierarchy = hierarchyStructures.find(h =>
          h.department === formData.departmentId && h.station === value
        );
        newData.hierarchyId = hierarchy ? hierarchy.structure_id : null;
      }
      return newData;
    });
  };

  const handleSave = async () => {
    const { departmentId, stationId, skillLevel, startDate } = formData;
    if (!departmentId || !stationId || !skillLevel || !startDate) {
      setError('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        employee: employeeID,
        department: departmentId,
        station: stationId,
        skill_level: skillLevel,
        start_date: startDate,
        remarks: formData.remarks,
        status: 'scheduled'
      };

      const response = await fetch(`${API_BASE_URL}/multiskilling/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessages = Object.entries(errorData)
          .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
          .join('; ');
        throw new Error(errorMessages || 'Failed to save skill');
      }

      // --- CHANGE 4: CALL THE PARENT'S CALLBACK FUNCTION ON SUCCESS ---
      onSkillAdded(); // This will trigger the notification in EmployeeSearch.tsx

      resetForm();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save skill');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      departmentId: null,
      stationId: null,
      hierarchyId: null,
      skillLevel: '',
      startDate: '',
      remarks: ''
    });
    setShowForm(false);
    // No need to manage success state here anymore
  };

  const getSelectedDepartmentName = () => {
    if (!formData.departmentId) return '';
    const dept = departments.find(d => d.department_id === formData.departmentId);
    return dept ? dept.department_name : '';
  };

  const getSelectedStationName = () => {
    if (!formData.stationId) return '';
    const station = filteredStations.find(s => s.station_id === formData.stationId);
    return station ? station.station_name : '';
  };
  
  const getSelectedLevelName = () => {
      if (!formData.skillLevel) return '';
      const level = levels.find(l => l.level_id === Number(formData.skillLevel));
      return level ? level.level_name : '';
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-100 overflow-hidden">
      {!showForm ? (
        <div className="p-8 text-center">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Ready to Add a New Skill?</h3>
            <p className="text-gray-600 mb-6">Expand {employee.first_name}'s capabilities with new skill allocations</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center mx-auto"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Skill
          </button>
        </div>
      ) : (
        <div className="p-8">
          <div className="mb-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-purple-500 to-red-600 p-2 rounded-full mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Skill Allocation Form</h3>
            </div>
            <p className="text-gray-600 mt-2 ml-10">Assign a new skill to {employee.first_name} {employee.last_name}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* --- CHANGE 5: REMOVE THE SUCCESS MESSAGE Jsx --- */}
          {/* {success && ( ... )} has been removed */}

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Department Selection */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" > <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /> </svg>
                  Department *
                </label>
                <select value={formData.departmentId || ''} onChange={(e) => handleChange('departmentId', e.target.value ? Number(e.target.value) : null)} className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 font-medium" required >
                  <option value="">Select department...</option>
                  {departments.map((dept) => (
                    <option key={dept.department_id} value={dept.department_id}>
                      {dept.department_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Station Selection */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" > <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /> </svg>
                  Station (Skill) *
                </label>
                <select value={formData.stationId || ''} onChange={(e) => handleChange('stationId', e.target.value ? Number(e.target.value) : null)} className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 font-medium" required disabled={!formData.departmentId} >
                  <option value="">Select station...</option>
                  {filteredStations.map((station) => (
                    <option key={station.station_id} value={station.station_id}>
                      {station.station_name}
                    </option>
                  ))}
                </select>
                {!formData.departmentId && (
                  <p className="text-sm text-gray-500 italic">Please select a department first</p>
                )}
                {formData.departmentId && filteredStations.length === 0 && (
                  <p className="text-sm text-orange-600 italic">No stations found for this department</p>
                )}
              </div>

              {/* Skill Level Selection */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" > <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /> </svg>
                  Target Skill Level *
                </label>
                <select value={formData.skillLevel} onChange={(e) => handleChange('skillLevel', e.target.value)} className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all duration-300 font-medium" required >
                  <option value="">Select target level...</option>
                  {levels.map((level) => (
                    <option key={level.level_id} value={level.level_id}>
                      {level.level_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Other inputs remain the same... */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700"> <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" > <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> </svg> Start Date * </label>
                <input type="date" value={formData.startDate} onChange={(e) => handleChange('startDate', e.target.value)} className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-300 focus:border-red-500 transition-all duration-300 font-medium" required />
              </div>
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700"> <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" > <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /> </svg> Remarks (optional) </label>
                <textarea placeholder="Add any additional remarks, requirements, or special instructions..." value={formData.remarks} onChange={(e) => handleChange('remarks', e.target.value)} className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-300 font-medium resize-none" rows={4} />
              </div>

              {/* Summary Section */}
              {(formData.departmentId || formData.stationId || formData.skillLevel) && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-l-4 border-blue-500">
                  <h4 className="font-semibold text-gray-800 mb-2">Assignment Summary:</h4>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p><span className="font-medium">Employee:</span> {employee.first_name} {employee.last_name} ({employee.emp_id})</p>
                    {formData.departmentId && (<p><span className="font-medium">Department:</span> {getSelectedDepartmentName()}</p>)}
                    {formData.stationId && (<p><span className="font-medium">Station:</span> {getSelectedStationName()}</p>)}
                    {formData.skillLevel && (<p><span className="font-medium">Target Level:</span> {getSelectedLevelName()}</p>)}
                    {formData.startDate && (<p><span className="font-medium">Start Date:</span> {new Date(formData.startDate).toLocaleDateString()}</p>)}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                <button onClick={resetForm} disabled={isSubmitting} className="px-8 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 flex items-center justify-center disabled:opacity-50">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={isSubmitting || isLoading || !formData.departmentId || !formData.stationId || !formData.skillLevel || !formData.startDate} className="bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" >
                  {isSubmitting ? ( <><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> Saving... </> ) : ( <><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Save Allocation </> )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddSkill;