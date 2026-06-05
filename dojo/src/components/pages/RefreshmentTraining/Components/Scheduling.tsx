// // import Select, { SingleValue } from 'react-select';
// import Select from "react-select";
// import type { SingleValue } from "react-select";
// import ConfirmModal from './modal';

// import CreatableSelect from 'react-select/creatable';

// import React, { useState, useEffect } from 'react';
// import { Plus, Edit2, Trash2, Save, X, Search, ChevronDown } from 'lucide-react';
// import EmployeeShowMore from './EmployeeShowMore';

// interface TrainingCategory {
//   id: string | number;
//   name: string;
// }
// interface TrainingTopic {
//   id: string | number;
//   category: any;
//   topic: string;
//   description: string;
// }
// interface Trainer {
//   id: string | number;
//   name: string;
// }
// interface Venue {
//   id: string | number;
//   name: string;
// }


// interface Employee {
//   id: string;        // emp_id
//   code: string;      // use emp_id for code
//   name: string;      // first_name + last_name
// }


// // what /schedules/ returns for employees
// interface BackendEmployee {
//   id?: string;           // may be absent if your serializer doesn’t include it
//   emp_id?: string;       // present for MasterTable PK
//   first_name?: string;
//   last_name?: string;
//   full_name?: string;    // if you later decide to include it
//   employee_code?: string;// if you later decide to include it
// }
// interface TrainingSession {
//   id: string | number;
//   training_category: TrainingCategory;
//   training_name: TrainingTopic;
//   trainer: Trainer;
//   venue: Venue;
//   status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
//   date: string;
//   time: string;
//   employees: BackendEmployee[];
// }

// const API_BASE = 'http://172.25.0.51:8000';

// // Validation helper for Trainer names
// const validateTrainerName = (name: string): string | null => {
//   const trimmedName = name.trim();
//   if (!trimmedName) {
//     return 'Trainer name cannot be empty.';
//   }
//   if (trimmedName === '0') {
//     return 'Trainer name cannot be "0".';
//   }
//   if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
//     return 'Trainer name can only contain letters and spaces.';
//   }
//   return null;
// };

// // Validation helper for Venue names
// const validateVenueName = (name: string): string | null => {
//   const trimmedName = name.trim();
//   if (!trimmedName) {
//     return 'Venue name cannot be empty.';
//   }
//   if (trimmedName === '0') {
//     return 'Venue name cannot be "0".';
//   }
//   if (!/^[a-zA-Z0-9\s]+$/.test(trimmedName)) {
//     return 'Venue name can only contain letters, numbers, and spaces.';
//   }
//   return null;
// };



// // NEW: Helper function to generate conditional styles for react-select
// const getSelectStyles = (hasError: boolean) => ({
//   control: (provided: any, state: any) => ({
//     ...provided,
//     borderColor: hasError ? '#ef4444' // Tailwind's red-500
//       : state.isFocused ? '#3b82f6' // Tailwind's blue-500
//       : '#d1d5db', // Tailwind's gray-300
//     boxShadow: hasError ? '0 0 0 1px #ef4444' // Red ring on error
//       : state.isFocused ? '0 0 0 1px #3b82f6' // Blue ring on focus
//       : 'none',
//     '&:hover': {
//       borderColor: hasError ? '#ef4444' // Keep red border on hover if error
//         : state.isFocused ? '#3b82f6'
//         : '#9ca3af', // Tailwind's gray-400
//     },
//   }),
// });


// const Scheduling: React.FC = () => {
//   // State
//   const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
//   const [trainingCategories, setTrainingCategories] = useState<TrainingCategory[]>([]);
//   const [trainingTopics, setTrainingTopics] = useState<TrainingTopic[]>([]);
//   const [trainers, setTrainers] = useState<Trainer[]>([]);
//   const [venues, setVenues] = useState<Venue[]>([]);
//   const [employees, setEmployees] = useState<Employee[]>([]);

//   const [showForm, setShowForm] = useState(false);
//   const [editingSession, setEditingSession] = useState<TrainingSession | null>(null);
//   const [employeeSearch, setEmployeeSearch] = useState('');
//   const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);

//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [sessionToDelete, setSessionToDelete] = useState<string | number | null>(null);

//   // For CreatableSelect input values
//   const [trainerInput, setTrainerInput] = useState('');
//   const [venueInput, setVenueInput] = useState('');

//   // NEW: State for form validation errors
//   const [formErrors, setFormErrors] = useState<{ trainer?: string; venue?: string }>({});


//   const trainerOptions = trainers.map(t => ({
//     value: t.id,
//     label: t.name
//   }));
//   const venueOptions = venues.map(v => ({
//     value: v.id,
//     label: v.name
//   }));

//   // FormData uses IDs or names for POST/PUT
//   const [formData, setFormData] = useState<{
//     trainingCategory: string | number;
//     trainingName: string | number;
//     trainer: string | number; // can be ID or name
//     venue: string | number;   // can be ID or name
//     date: string;
//     time: string;
//     // employees: number[];
//     employees: string[];
//     status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
//   }>({
//     trainingCategory: '',
//     trainingName: '',
//     trainer: '',
//     venue: '',
//     date: '',
//     time: '',
//     employees: [],
//     status: 'scheduled',
//   });

//   // Fetch all reference data on mount
//   useEffect(() => {
//     fetchCategories();
//     fetchAllTopics();
//     fetchTrainers();
//     fetchVenues();
//     fetchEmployees();
//     fetchSessions();
//   }, []);

//   const fetchAllTopics = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/curriculums/`);
//       if (res.ok) {
//         setTrainingTopics(await res.json());
//       }
//     } catch (error) {
//       console.error('Failed to fetch topics:', error);
//     }
//   };

//   const fetchCategories = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/training-categories/`);
//       if (res.ok) {
//         setTrainingCategories(await res.json());
//       } else {
//         alert('Failed to load training categories');
//       }
//     } catch {
//       alert('Error loading training categories');
//     }
//   };

//   const fetchTrainers = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/trainer_name/`);
//       if (res.ok) {
//         setTrainers(await res.json());
//       } else {
//         alert('Failed to load trainers');
//       }
//     } catch {
//       alert('Error loading trainers');
//     }
//   };

//   const fetchVenues = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/venues/`);
//       if (res.ok) {
//         setVenues(await res.json());
//       } else {
//         alert('Failed to load venues');
//       }
//     } catch {
//       alert('Error loading venues');
//     }
//   };


//   const fetchEmployees = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/mastertable/`);
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const raw = await res.json();

//       // DRF might return an array or a paginated object
//       const rows = Array.isArray(raw) ? raw : raw?.results ?? [];

//       const mapped: Employee[] = rows.map((emp: any) => {
//         const id = String(emp.emp_id); // PK
//         const name = [emp.first_name, emp.last_name].filter(Boolean).join(' ').trim() || id;
//         const code = id; // using emp_id as the visible code
//         return { id, name, code };
//       });

//       setEmployees(mapped);
//     } catch (error) {
//       console.error('Failed to fetch employees:', error);
//       setEmployees([]);
//     }
//   };

//   const fetchSessions = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/schedules/`);
//       if (res.ok) {
//         setTrainingSessions(await res.json());
//       } else {
//         alert('Failed to load training sessions');
//       }
//     } catch {
//       alert('Error loading training sessions');
//     }
//   };

//   const getFilteredEmployees = () => {
//     const q = employeeSearch.trim().toLowerCase();
//     if (!q) return employees;

//     return employees.filter(emp =>
//       (emp.name || '').toLowerCase().includes(q) ||
//       String(emp.code || '').toLowerCase().includes(q)
//     );
//   };

//   const handleEmployeeSelect = (id: string) => {
//     if (!formData.employees.map(String).includes(String(id))) {
//       setFormData(prev => ({ ...prev, employees: [...prev.employees, String(id)] }));
//     }
//     setEmployeeSearch('');
//     setShowEmployeeDropdown(false);
//   };

//   const handleEmployeeRemove = (id: string) => {
//     setFormData(prev => ({
//       ...prev,
//       employees: prev.employees.filter(eid => String(eid) !== String(id)),
//     }));
//   };

//   const resetForm = () => {
//     setFormData({
//       trainingCategory: '',
//       trainingName: '',
//       trainer: '',
//       venue: '',
//       date: '',
//       time: '',
//       employees: [],
//       status: 'scheduled',
//     });
//     setTrainerInput('');
//     setVenueInput('');
//     setShowForm(false);
//     setEditingSession(null);
//     setEmployeeSearch('');
//     setShowEmployeeDropdown(false);
//     setFormErrors({}); // Clear errors on reset
//   };

//   // ========== UPDATED `handleSubmit` WITH VALIDATION LOGIC ==========
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     // Clear previous errors before validating
//     setFormErrors({});
//     const currentErrors: { trainer?: string; venue?: string } = {};

//     // --- Validation Phase ---

//     // Validate a new Trainer name if one was typed
//     const isNewTrainer = formData.trainer && !trainers.some(t => String(t.id) === String(formData.trainer));
//     if (isNewTrainer) {
//       const trainerError = validateTrainerName(String(formData.trainer));
//       if (trainerError) {
//         currentErrors.trainer = trainerError;
//       }
//     }

//     // Validate a new Venue name if one was typed
//     const isNewVenue = formData.venue && !venues.some(v => String(v.id) === String(formData.venue));
//     if (isNewVenue) {
//       const venueError = validateVenueName(String(formData.venue));
//       if (venueError) {
//         currentErrors.venue = venueError;
//       }
//     }

//     // If there are validation errors, update state and stop submission
//     if (Object.keys(currentErrors).length > 0) {
//       setFormErrors(currentErrors);
//       return;
//     }

//     // Check for other required fields
//     if (
//       !formData.trainingCategory ||
//       !formData.trainingName ||
//       !formData.trainer ||
//       !formData.venue ||
//       !formData.date ||
//       !formData.time
//     ) {
//       alert('Please fill all required fields');
//       return;
//     }

//     // --- Submission Phase (if validation passed) ---

//     let trainerId = formData.trainer;
//     let venueId = formData.venue;

//     // If trainer is new and valid, create it
//     if (isNewTrainer) {
//       try {
//         const res = await fetch(`${API_BASE}/trainer_name/`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ name: String(formData.trainer).trim() }),
//         });
//         if (res.ok) {
//           const newTrainer = await res.json();
//           setTrainers(prev => [...prev, newTrainer]);
//           trainerId = newTrainer.id;
//         } else {
//           const errorData = await res.json();
//           alert(`Failed to create trainer: ${JSON.stringify(errorData)}`);
//           return;
//         }
//       } catch {
//         alert('Error creating trainer');
//         return;
//       }
//     }

//     // If venue is new and valid, create it
//     if (isNewVenue) {
//       try {
//         const res = await fetch(`${API_BASE}/venues/`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ name: String(formData.venue).trim() }),
//         });
//         if (res.ok) {
//           const newVenue = await res.json();
//           setVenues(prev => [...prev, newVenue]);
//           venueId = newVenue.id;
//         } else {
//           const errorData = await res.json();
//           alert(`Failed to create venue: ${JSON.stringify(errorData)}`);
//           return;
//         }
//       } catch {
//         alert('Error creating venue');
//         return;
//       }
//     }

//     const payload = {
//       training_category_id: formData.trainingCategory,
//       training_name_id: formData.trainingName,
//       trainer_id: trainerId,
//       venue_id: venueId,
//       status: formData.status,
//       date: formData.date,
//       time: formData.time,
//       employee_ids: formData.employees,
//     };

//     try {
//       let res;
//       if (editingSession) {
//         res = await fetch(`${API_BASE}/schedules/${editingSession.id}/`, {
//           method: 'PUT',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(payload),
//         });
//       } else {
//         res = await fetch(`${API_BASE}/schedules/`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(payload),
//         });
//       }

//       if (res.ok) {
//         await fetchSessions();
//         resetForm();
//       } else {
//         const errorData = await res.json();
//         alert(
//           (editingSession ? 'Failed to update' : 'Failed to create') +
//             ' training session. ' +
//             (errorData && typeof errorData === 'object' ? JSON.stringify(errorData) : '')
//         );
//       }
//     } catch {
//       alert('Error saving training session');
//     }
//   };

//   // When editing, extract IDs
//   const handleEdit = (session: TrainingSession) => {
//     setEditingSession(session);
//     setFormData({
//       trainingCategory: session.training_category?.id || '',
//       trainingName: session.training_name?.id || '',
//       trainer: session.trainer?.id || session.trainer?.name || '',
//       venue: session.venue?.id || session.venue?.name || '',
//       date: session.date,
//       time: session.time,
//       // employees: session.employees.map(emp => emp.id),
//         employees: session.employees.map((emp: any) => String(emp.emp_id ?? emp.id)),
//       status: session.status,
//     });
//     setTrainerInput('');
//     setVenueInput('');
//     setFormErrors({}); // Clear any previous errors
//     setShowForm(true);
//   };

//   const handleDelete = async (id: string | number) => {
//     setSessionToDelete(id);
//     setShowDeleteModal(true);
//   };

//   const confirmDelete = async () => {
//     if (!sessionToDelete) return;
//     try {
//       const res = await fetch(`${API_BASE}/schedules/${sessionToDelete}/`, { method: 'DELETE' });
//       if (res.ok) {
//         await fetchSessions();
//       } else {
//         alert('Failed to delete training session');
//       }
//     } catch {
//       alert('Error deleting training session');
//     } finally {
//       setShowDeleteModal(false);
//       setSessionToDelete(null);
//     }
//   };

//   // Helpers
//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'completed':
//         return 'bg-green-100 text-green-800';
//       case 'cancelled':
//         return 'bg-red-100 text-red-800';
//       case 'pending':
//         return 'bg-yellow-100 text-yellow-800';
//       default:
//         return 'bg-blue-100 text-blue-800';
//     }
//   };

//   return (
//     <div className="space-y-6 p-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-3xl font-bold text-gray-800">Training Scheduling</h2>
//         <button
//           onClick={() => setShowForm(true)}
//           className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
//         >
//           <Plus className="w-5 h-5" />
//           <span>Add Training</span>
//         </button>
//       </div>

//       {showForm && (
//         <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
//           <div className="flex justify-between items-center mb-6">
//             <h3 className="text-xl font-semibold text-gray-800">
//               {editingSession ? 'Edit Training' : 'Add New Training'}
//             </h3>
//             <button
//               onClick={resetForm}
//               className="text-gray-400 hover:text-gray-600"
//             >
//               <X className="w-6 h-6" />
//             </button>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {/* Training Category */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Training Category
//                 </label>
//                 <select
//                   value={formData.trainingCategory}
//                   onChange={e =>
//                     setFormData(prev => ({
//                       ...prev,
//                       trainingCategory: e.target.value,
//                       trainingName: '',
//                     }))
//                   }
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 >
//                   <option value="">Select Category</option>
//                   {trainingCategories.map(cat => (
//                     <option key={cat.id} value={cat.id}>
//                       {cat.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Training Name (Topic) */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Training Name
//                 </label>
//                 <select
//                   value={formData.trainingName}
//                   onChange={e =>
//                     setFormData(prev => ({
//                       ...prev,
//                       trainingName: e.target.value,
//                     }))
//                   }
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                   disabled={!formData.trainingCategory}
//                 >
//                   <option value="">Select Training</option>
//                   {trainingTopics
//                     .filter(topic => String(topic.category?.id) === String(formData.trainingCategory))
//                     .map(topic => (
//                       <option key={topic.id} value={topic.id}>
//                         {topic.topic}
//                       </option>
//                     ))}
//                 </select>
//               </div>

//               {/* Trainer */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Trainer
//                 </label>
//                 <CreatableSelect
//                   // --- MODIFICATION START ---
//                   styles={getSelectStyles(!!formErrors.trainer)}
//                   // --- MODIFICATION END ---
//                   options={trainerOptions}
//                   placeholder="Select or type to create a trainer..."
//                   value={
//                     trainerOptions.find(o => String(o.value) === String(formData.trainer)) ||
//                     (formData.trainer
//                       ? { label: String(formData.trainer), value: formData.trainer }
//                       : null)
//                   }
//                   onChange={opt => {
//                       setFormData(prev => ({
//                         ...prev,
//                         trainer: opt ? String(opt.value) : ''
//                       }));
//                       if (opt) setFormErrors(prev => ({...prev, trainer: undefined}));
//                     }
//                   }
//                   onInputChange={inputValue => setTrainerInput(inputValue)}
//                   inputValue={trainerInput}
//                   isClearable
//                   formatCreateLabel={inputValue => `Create "${inputValue}"`}
//                   classNamePrefix="react-select"
//                 />
//                 {formErrors.trainer && <p className="text-red-500 text-sm mt-1">{formErrors.trainer}</p>}
//               </div>

//               {/* Venue */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Venue
//                 </label>
//                 <CreatableSelect
//                   // --- MODIFICATION START ---
//                   styles={getSelectStyles(!!formErrors.venue)}
//                   // --- MODIFICATION END ---
//                   options={venueOptions}
//                   value={
//                     venueOptions.find(opt => String(opt.value) === String(formData.venue)) ||
//                     (formData.venue
//                       ? { label: String(formData.venue), value: formData.venue }
//                       : null)
//                   }
//                   onChange={selectedOption => {
//                       setFormData(prev => ({
//                         ...prev,
//                         venue: selectedOption ? String(selectedOption.value) : ''
//                       }));
//                       if (selectedOption) setFormErrors(prev => ({...prev, venue: undefined}));
//                     }
//                   }
//                   onInputChange={inputValue => setVenueInput(inputValue)}
//                   inputValue={venueInput}
//                   isClearable
//                   placeholder="Select or type to create a venue..."
//                   formatCreateLabel={inputValue => `Create "${inputValue}"`}
//                 />
//                 {formErrors.venue && <p className="text-red-500 text-sm mt-1">{formErrors.venue}</p>}
//               </div>

//               {/* Status */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Status
//                 </label>
//                 <select
//                   value={formData.status}
//                   onChange={e =>
//                     setFormData(prev => ({
//                       ...prev,
//                       status: e.target.value as any,
//                     }))
//                   }
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="scheduled">Scheduled</option>
//                   <option value="completed">Completed</option>
//                   <option value="cancelled">Cancelled</option>
//                   <option value="pending">Pending</option>
//                 </select>
//               </div>

//               {/* Date */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Date
//                 </label>
//                 <input
//                   type="date"
//                   value={formData.date}
//                   onChange={e =>
//                     setFormData(prev => ({
//                       ...prev,
//                       date: e.target.value,
//                     }))
//                   }
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>

//               {/* Time */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Time
//                 </label>
//                 <input
//                   type="time"
//                   value={formData.time}
//                   onChange={e =>
//                     setFormData(prev => ({
//                       ...prev,
//                       time: e.target.value,
//                     }))
//                   }
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>
//             </div>

//             {/* Employees Selection */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Add Employees
//               </label>

//               {/* Selected Employees */}
//               {formData.employees.length > 0 && (
//                 <div className="mb-3">
//                   <div className="flex flex-wrap gap-2">
//                     {formData.employees.map(empId => {
//                       // const emp = employees.find(e => e.id === empId);
//                       const emp = employees.find(e => String(e.id) === String(empId));
//                       return (
//                         <div
//                           key={empId}
//                           className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
//                         >
//                           <span>
//                             {emp?.name} (Code: {emp?.code})
//                           </span>
//                           <button
//                             type="button"
//                             onClick={() => handleEmployeeRemove(empId)}
//                             className="text-blue-600 hover:text-blue-800"
//                           >
//                             <X className="w-3 h-3" />
//                           </button>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}

//               {/* Employee Search Input */}
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                 <input
//                   type="text"
//                   value={employeeSearch}
//                   onChange={e => {
//                     setEmployeeSearch(e.target.value);
//                     setShowEmployeeDropdown(true);
//                   }}
//                   onFocus={() => setShowEmployeeDropdown(true)}
//                   placeholder="Search employee by name or code..."
//                   className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//                 <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />

//                 {showEmployeeDropdown && (
//                   <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
//                     {getFilteredEmployees()
//                       .filter(emp => !formData.employees.includes(emp.id))
//                       .map(employee => (
//                         <button
//                           key={employee.id}
//                           type="button"
//                           onClick={() => handleEmployeeSelect(employee.id)}
//                           className="w-full text-left px-4 py-2 hover:bg-gray-100"
//                         >
//                           <div className="font-medium">{employee.name}</div>
//                           <div className="text-sm text-gray-500">Code: {employee.code}</div>
//                         </button>
//                       ))}
//                     {getFilteredEmployees().filter(emp => !formData.employees.includes(emp.id)).length === 0 && (
//                       <div className="px-4 py-2 text-gray-500 text-sm">No employees found</div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Buttons */}
//             <div className="flex justify-end space-x-3">
//               <button
//                 type="button"
//                 onClick={resetForm}
//                 className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="bg-blue-600 text-white px-6 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700"
//               >
//                 <Save className="w-4 h-4" />
//                 <span>{editingSession ? 'Update' : 'Save'}</span>
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* Sessions Table */}
//       <div className="bg-white rounded-lg shadow-md overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Training Name
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Category
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Trainer & Venue
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Schedule
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Employees
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {trainingSessions.map(session => (
//                 <tr key={session.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
//                     {session.training_name?.topic || 'Unknown'}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     {session.training_category?.name || 'Unknown'}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     <div>{session.trainer?.name || 'Unknown'}</div>
//                     <div className="text-gray-500">{session.venue?.name || 'Unknown'}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     <div>{session.date}</div>
//                     <div className="text-gray-500">{session.time}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     {session.employees.length} Employees
//                     <div className="text-xs text-gray-500">
//                       {/* <EmployeeShowMore employees={session.employees} /> */}
//                     </div>
//                   </td>

//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.status)}`}>
//                       {session.status}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
//                     <button
//                       onClick={() => handleEdit(session)}
//                       className="text-blue-600 hover:text-blue-900"
//                       title="Edit"
//                     >
//                       <Edit2 className="w-4 h-4" />
//                     </button>
//                     <button
//                       onClick={() => handleDelete(session.id)}
//                       className="text-red-600 hover:text-red-900"
//                       title="Delete"
//                     >
//                       <Trash2 className="w-4 h-4" />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//               {trainingSessions.length === 0 && (
//                 <tr>
//                   <td colSpan={7} className="text-center py-6 text-gray-500">
//                     No training sessions scheduled.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//       {showDeleteModal && (
//         <ConfirmModal
//           title="Confirm Delete"
//           message="Are you sure you want to delete this training session?"
//           onConfirm={confirmDelete}
//           onCancel={() => {
//             setShowDeleteModal(false);
//             setSessionToDelete(null);
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default Scheduling;


import Select from "react-select";
import type { SingleValue } from "react-select";
import ConfirmModal from './modal';

import CreatableSelect from 'react-select/creatable';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Search, ChevronDown } from 'lucide-react';
import EmployeeShowMore from './EmployeeShowMore';

interface TrainingCategory {
  id: string | number;
  name: string;
}
interface TrainingTopic {
  id: string | number;
  category: any;
  topic: string;
  description: string;
}
interface Trainer {
  id: string | number;
  name: string;
}
interface Venue {
  id: string | number;
  name: string;
}


interface Employee {
  id: string;        // emp_id
  code: string;      // use emp_id for code
  name: string;      // first_name + last_name
}


// what /schedules/ returns for employees
interface BackendEmployee {
  id?: string;           // may be absent if your serializer doesn’t include it
  emp_id?: string;       // present for MasterTable PK
  first_name?: string;
  last_name?: string;
  full_name?: string;    // if you later decide to include it
  employee_code?: string;// if you later decide to include it
}
interface TrainingSession {
  id: string | number;
  training_category: TrainingCategory;
  training_name: TrainingTopic;
  trainer: Trainer;
  venue: Venue;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
  date: string;
  time: string;
  employees: BackendEmployee[];
}

const API_BASE = 'http://172.25.0.51:8000';

// Validation helper for Trainer names
const validateTrainerName = (name: string): string | null => {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return 'Trainer name cannot be empty.';
  }
  if (trimmedName === '0') {
    return 'Trainer name cannot be "0".';
  }
  if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
    return 'Trainer name can only contain letters and spaces.';
  }
  return null;
};

// Validation helper for Venue names
const validateVenueName = (name: string): string | null => {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return 'Venue name cannot be empty.';
  }
  if (trimmedName === '0') {
    return 'Venue name cannot be "0".';
  }
  if (!/^[a-zA-Z0-9\s]+$/.test(trimmedName)) {
    return 'Venue name can only contain letters, numbers, and spaces.';
  }
  return null;
};



// Helper function to generate conditional styles for react-select
const getSelectStyles = (hasError: boolean) => ({
  control: (provided: any, state: any) => ({
    ...provided,
    borderColor: hasError ? '#ef4444' // Tailwind's red-500
      : state.isFocused ? '#3b82f6' // Tailwind's blue-500
      : '#d1d5db', // Tailwind's gray-300
    boxShadow: hasError ? '0 0 0 1px #ef4444' // Red ring on error
      : state.isFocused ? '0 0 0 1px #3b82f6' // Blue ring on focus
      : 'none',
    '&:hover': {
      borderColor: hasError ? '#ef4444' // Keep red border on hover if error
        : state.isFocused ? '#3b82f6'
        : '#9ca3af', // Tailwind's gray-400
    },
  }),
});


const Scheduling: React.FC = () => {
  // State
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [trainingCategories, setTrainingCategories] = useState<TrainingCategory[]>([]);
  const [trainingTopics, setTrainingTopics] = useState<TrainingTopic[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState<TrainingSession | null>(null);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | number | null>(null);

  // For CreatableSelect input values
  const [trainerInput, setTrainerInput] = useState('');
  const [venueInput, setVenueInput] = useState('');

  // State for form validation errors for all fields
  const [formErrors, setFormErrors] = useState<{
    trainingCategory?: string;
    trainingName?: string;
    trainer?: string;
    venue?: string;
    date?: string;
    time?: string;
  }>({});


  const trainerOptions = trainers.map(t => ({
    value: t.id,
    label: t.name
  }));
  const venueOptions = venues.map(v => ({
    value: v.id,
    label: v.name
  }));

  // FormData uses IDs or names for POST/PUT
  const [formData, setFormData] = useState<{
    trainingCategory: string | number;
    trainingName: string | number;
    trainer: string | number; // can be ID or name
    venue: string | number;   // can be ID or name
    date: string;
    time: string;
    employees: string[];
    status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
  }>({
    trainingCategory: '',
    trainingName: '',
    trainer: '',
    venue: '',
    date: '',
    time: '',
    employees: [],
    status: 'scheduled',
  });

  // Fetch all reference data on mount
  useEffect(() => {
    fetchCategories();
    fetchAllTopics();
    fetchTrainers();
    fetchVenues();
    fetchEmployees();
    fetchSessions();
  }, []);

  const fetchAllTopics = async () => {
    try {
      const res = await fetch(`${API_BASE}/curriculums/`);
      if (res.ok) {
        setTrainingTopics(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/training-categories/`);
      if (res.ok) {
        setTrainingCategories(await res.json());
      } else {
        alert('Failed to load training categories');
      }
    } catch {
      alert('Error loading training categories');
    }
  };

  const fetchTrainers = async () => {
    try {
      const res = await fetch(`${API_BASE}/trainer_name/`);
      if (res.ok) {
        setTrainers(await res.json());
      } else {
        alert('Failed to load trainers');
      }
    } catch {
      alert('Error loading trainers');
    }
  };

  const fetchVenues = async () => {
    try {
      const res = await fetch(`${API_BASE}/venues/`);
      if (res.ok) {
        setVenues(await res.json());
      } else {
        alert('Failed to load venues');
      }
    } catch {
      alert('Error loading venues');
    }
  };


  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_BASE}/mastertable/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();
      const rows = Array.isArray(raw) ? raw : raw?.results ?? [];
      const mapped: Employee[] = rows.map((emp: any) => {
        const id = String(emp.emp_id);
        const name = [emp.first_name, emp.last_name].filter(Boolean).join(' ').trim() || id;
        const code = id;
        return { id, name, code };
      });
      setEmployees(mapped);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      setEmployees([]);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_BASE}/schedules/`);
      if (res.ok) {
        setTrainingSessions(await res.json());
      } else {
        alert('Failed to load training sessions');
      }
    } catch {
      alert('Error loading training sessions');
    }
  };

  const getFilteredEmployees = () => {
    const q = employeeSearch.trim().toLowerCase();
    if (!q) return employees;

    return employees.filter(emp =>
      (emp.name || '').toLowerCase().includes(q) ||
      String(emp.code || '').toLowerCase().includes(q)
    );
  };

  const handleEmployeeSelect = (id: string) => {
    if (!formData.employees.map(String).includes(String(id))) {
      setFormData(prev => ({ ...prev, employees: [...prev.employees, String(id)] }));
    }
    setEmployeeSearch('');
    setShowEmployeeDropdown(false);
  };

  const handleEmployeeRemove = (id: string) => {
    setFormData(prev => ({
      ...prev,
      employees: prev.employees.filter(eid => String(eid) !== String(id)),
    }));
  };

  const resetForm = () => {
    setFormData({
      trainingCategory: '',
      trainingName: '',
      trainer: '',
      venue: '',
      date: '',
      time: '',
      employees: [],
      status: 'scheduled',
    });
    setTrainerInput('');
    setVenueInput('');
    setShowForm(false);
    setEditingSession(null);
    setEmployeeSearch('');
    setShowEmployeeDropdown(false);
    setFormErrors({}); // Clear errors on reset
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // --- Validation Phase ---
    const currentErrors: typeof formErrors = {};

    if (!formData.trainingCategory) {
      currentErrors.trainingCategory = "Training Category is required.";
    }
    if (!formData.trainingName) {
      currentErrors.trainingName = "Training Name is required.";
    }
    if (!formData.date) {
      currentErrors.date = "Date is required.";
    }
    if (!formData.time) {
      currentErrors.time = "Time is required.";
    }

    if (!formData.trainer) {
      currentErrors.trainer = "Trainer is required.";
    } else {
      const isNewTrainer = !trainers.some(t => String(t.id) === String(formData.trainer));
      if (isNewTrainer) {
        const trainerError = validateTrainerName(String(formData.trainer));
        if (trainerError) {
          currentErrors.trainer = trainerError;
        }
      }
    }

    if (!formData.venue) {
      currentErrors.venue = "Venue is required.";
    } else {
      const isNewVenue = !venues.some(v => String(v.id) === String(formData.venue));
      if (isNewVenue) {
        const venueError = validateVenueName(String(formData.venue));
        if (venueError) {
          currentErrors.venue = venueError;
        }
      }
    }
    
    if (Object.keys(currentErrors).length > 0) {
      setFormErrors(currentErrors);
      return;
    }
    
    // --- Submission Phase (if validation passed) ---
    let trainerId = formData.trainer;
    let venueId = formData.venue;
    const isNewTrainer = !trainers.some(t => String(t.id) === String(formData.trainer));
    const isNewVenue = !venues.some(v => String(v.id) === String(formData.venue));

    if (isNewTrainer) {
      try {
        const res = await fetch(`${API_BASE}/trainer_name/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: String(formData.trainer).trim() }),
        });
        if (res.ok) {
          const newTrainer = await res.json();
          setTrainers(prev => [...prev, newTrainer]);
          trainerId = newTrainer.id;
        } else {
          const errorData = await res.json();
          alert(`Failed to create trainer: ${JSON.stringify(errorData)}`);
          return;
        }
      } catch {
        alert('Error creating trainer');
        return;
      }
    }

    if (isNewVenue) {
      try {
        const res = await fetch(`${API_BASE}/venues/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: String(formData.venue).trim() }),
        });
        if (res.ok) {
          const newVenue = await res.json();
          setVenues(prev => [...prev, newVenue]);
          venueId = newVenue.id;
        } else {
          const errorData = await res.json();
          alert(`Failed to create venue: ${JSON.stringify(errorData)}`);
          return;
        }
      } catch {
        alert('Error creating venue');
        return;
      }
    }

    const payload = {
      training_category_id: formData.trainingCategory,
      training_name_id: formData.trainingName,
      trainer_id: trainerId,
      venue_id: venueId,
      status: formData.status,
      date: formData.date,
      time: formData.time,
      employee_ids: formData.employees,
    };

    try {
      const res = editingSession
        ? await fetch(`${API_BASE}/schedules/${editingSession.id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch(`${API_BASE}/schedules/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

      if (res.ok) {
        await fetchSessions();
        resetForm();
      } else {
        const errorData = await res.json();
        alert(
          `${editingSession ? 'Failed to update' : 'Failed to create'} training session. ${
            errorData && typeof errorData === 'object' ? JSON.stringify(errorData) : ''
          }`
        );
      }
    } catch {
      alert('Error saving training session');
    }
  };

  const handleEdit = (session: TrainingSession) => {
    setEditingSession(session);
    setFormData({
      trainingCategory: session.training_category?.id || '',
      trainingName: session.training_name?.id || '',
      trainer: session.trainer?.id || session.trainer?.name || '',
      venue: session.venue?.id || session.venue?.name || '',
      date: session.date,
      time: session.time,
      employees: session.employees.map((emp: any) => String(emp.emp_id ?? emp.id)),
      status: session.status,
    });
    setTrainerInput('');
    setVenueInput('');
    setFormErrors({});
    setShowForm(true);
  };

  const handleDelete = async (id: string | number) => {
    setSessionToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!sessionToDelete) return;
    try {
      const res = await fetch(`${API_BASE}/schedules/${sessionToDelete}/`, { method: 'DELETE' });
      if (res.ok) {
        await fetchSessions();
      } else {
        alert('Failed to delete training session');
      }
    } catch {
      alert('Error deleting training session');
    } finally {
      setShowDeleteModal(false);
      setSessionToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Training Scheduling</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Training</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              {editingSession ? 'Edit Training' : 'Add New Training'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Training Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Training Category
                </label>
                <select
                  value={formData.trainingCategory}
                  onChange={e => {
                    setFormData(prev => ({
                      ...prev,
                      trainingCategory: e.target.value,
                      trainingName: '',
                    }));
                    if (formErrors.trainingCategory) {
                      setFormErrors(prev => ({...prev, trainingCategory: undefined}));
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    formErrors.trainingCategory 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  required
                >
                  <option value="">Select Category</option>
                  {trainingCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {formErrors.trainingCategory && <p className="text-red-500 text-sm mt-1">{formErrors.trainingCategory}</p>}
              </div>

              {/* Training Name (Topic) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Training Name
                </label>
                <select
                  value={formData.trainingName}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, trainingName: e.target.value }));
                    if (formErrors.trainingName) {
                      setFormErrors(prev => ({...prev, trainingName: undefined}));
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    formErrors.trainingName 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  required
                  disabled={!formData.trainingCategory}
                >
                  <option value="">Select Training</option>
                  {trainingTopics
                    .filter(topic => String(topic.category?.id) === String(formData.trainingCategory))
                    .map(topic => (
                      <option key={topic.id} value={topic.id}>
                        {topic.topic}
                      </option>
                    ))}
                </select>
                {formErrors.trainingName && <p className="text-red-500 text-sm mt-1">{formErrors.trainingName}</p>}
              </div>

              {/* Trainer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trainer
                </label>
                <CreatableSelect
                  styles={getSelectStyles(!!formErrors.trainer)}
                  options={trainerOptions}
                  placeholder="Select or type to create a trainer..."
                  value={
                    trainerOptions.find(o => String(o.value) === String(formData.trainer)) ||
                    (formData.trainer ? { label: String(formData.trainer), value: formData.trainer } : null)
                  }
                  onChange={opt => {
                      setFormData(prev => ({ ...prev, trainer: opt ? String(opt.value) : '' }));
                      if (formErrors.trainer) setFormErrors(prev => ({...prev, trainer: undefined}));
                    }
                  }
                  onInputChange={inputValue => setTrainerInput(inputValue)}
                  inputValue={trainerInput}
                  isClearable
                  formatCreateLabel={inputValue => `Create "${inputValue}"`}
                  classNamePrefix="react-select"
                />
                {formErrors.trainer && <p className="text-red-500 text-sm mt-1">{formErrors.trainer}</p>}
              </div>

              {/* Venue */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue
                </label>
                <CreatableSelect
                  styles={getSelectStyles(!!formErrors.venue)}
                  options={venueOptions}
                  value={
                    venueOptions.find(opt => String(opt.value) === String(formData.venue)) ||
                    (formData.venue ? { label: String(formData.venue), value: formData.venue } : null)
                  }
                  onChange={opt => {
                      setFormData(prev => ({ ...prev, venue: opt ? String(opt.value) : '' }));
                      if (formErrors.venue) setFormErrors(prev => ({...prev, venue: undefined}));
                    }
                  }
                  onInputChange={inputValue => setVenueInput(inputValue)}
                  inputValue={venueInput}
                  isClearable
                  placeholder="Select or type to create a venue..."
                  formatCreateLabel={inputValue => `Create "${inputValue}"`}
                />
                {formErrors.venue && <p className="text-red-500 text-sm mt-1">{formErrors.venue}</p>}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, date: e.target.value }));
                    if (formErrors.date) {
                      setFormErrors(prev => ({...prev, date: undefined}));
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    formErrors.date 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  required
                />
                {formErrors.date && <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>}
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, time: e.target.value }));
                    if (formErrors.time) {
                      setFormErrors(prev => ({...prev, time: undefined}));
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    formErrors.time 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  required
                />
                {formErrors.time && <p className="text-red-500 text-sm mt-1">{formErrors.time}</p>}
              </div>
            </div>

            {/* Employees Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Employees
              </label>
              {formData.employees.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {formData.employees.map(empId => {
                      const emp = employees.find(e => String(e.id) === String(empId));
                      return (
                        <div
                          key={empId}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                        >
                          <span>{emp?.name} (Code: {emp?.code})</span>
                          <button
                            type="button"
                            onClick={() => handleEmployeeRemove(empId)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={employeeSearch}
                  onChange={e => {
                    setEmployeeSearch(e.target.value);
                    setShowEmployeeDropdown(true);
                  }}
                  onFocus={() => setShowEmployeeDropdown(true)}
                  onBlur={() => setTimeout(() => setShowEmployeeDropdown(false), 200)}
                  placeholder="Search employee by name or code..."
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                {showEmployeeDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {getFilteredEmployees()
                      .filter(emp => !formData.employees.includes(emp.id))
                      .map(employee => (
                        <button
                          key={employee.id}
                          type="button"
                          onClick={() => handleEmployeeSelect(employee.id)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-sm text-gray-500">Code: {employee.code}</div>
                        </button>
                      ))}
                    {getFilteredEmployees().filter(emp => !formData.employees.includes(emp.id)).length === 0 && (
                      <div className="px-4 py-2 text-gray-500 text-sm">No employees found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700"
              >
                <Save className="w-4 h-4" />
                <span>{editingSession ? 'Update' : 'Save'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sessions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Training Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trainer & Venue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trainingSessions.map(session => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{session.training_name?.topic || 'Unknown'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.training_category?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{session.trainer?.name || 'Unknown'}</div>
                    <div className="text-gray-500">{session.venue?.name || 'Unknown'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{session.date}</div>
                    <div className="text-gray-500">{session.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {session.employees.length} Employees
                    {/* <EmployeeShowMore employees={session.employees} /> */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.status)}`}>{session.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onClick={() => handleEdit(session)} className="text-blue-600 hover:text-blue-900" title="Edit"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(session.id)} className="text-red-600 hover:text-red-900" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {trainingSessions.length === 0 && (
                <tr><td colSpan={7} className="text-center py-6 text-gray-500">No training sessions scheduled.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showDeleteModal && (
        <ConfirmModal
          title="Confirm Delete"
          message="Are you sure you want to delete this training session?"
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setSessionToDelete(null);
          }}
        />
      )}
    </div>
  );
};

export default Scheduling;