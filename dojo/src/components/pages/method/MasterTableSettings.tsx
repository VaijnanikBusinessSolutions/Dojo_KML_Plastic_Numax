// import React, { useState, useEffect, useMemo } from "react";
// import { Upload, Plus, Trash2, FileSpreadsheet, Users, Mail, Phone, Calendar, User, Building2, Pencil, Search } from "lucide-react";

// // --- TYPE DEFINITIONS ---
// interface EmployeeData {
//   emp_id: string;
//   first_name: string;
//   last_name: string;
//   department: number | null;
//   department_name?: string;
//   date_of_joining: string;
//   birth_date: string;
//   sex: string;
//   email: string;
//   phone: string;
// }

// interface Department {
//   department_id: number;
//   department_name: string;
// }

// interface EditEmployeeModalProps {
//     employee: EmployeeData;
//     onClose: () => void;
//     onSave: (updatedEmployee: EmployeeData) => Promise<void>;
//     departments: Department[];
// }

// // --- HELPER FUNCTIONS & CHILD COMPONENTS ---

// const formatDateForInput = (dateString: string | Date | undefined): string => {
//     if (!dateString) return "";
//     try {
//         const date = new Date(dateString);
//         const userTimezoneOffset = date.getTimezoneOffset() * 60000;
//         return new Date(date.getTime() - userTimezoneOffset).toISOString().split('T')[0];
//     } catch (error) {
//         console.error("Invalid date for formatting:", dateString);
//         return "";
//     }
// };

// const EditEmployeeModal = ({ employee, onClose, onSave, departments }: EditEmployeeModalProps) => {
//     const [formData, setFormData] = useState<EmployeeData>(employee);
//     const [isSaving, setIsSaving] = useState(false);
    
//     useEffect(() => { setFormData(employee); }, [employee]);
    
//     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { 
//         const { name, value } = e.target; 
//         setFormData(prev => ({ ...prev, [name]: name === 'department' ? (value ? parseInt(value) : null) : value })); 
//     };
    
//     const handleSave = async (e: React.FormEvent) => { 
//         e.preventDefault(); 
//         setIsSaving(true); 
//         try { 
//             await onSave(formData); 
//             onClose(); 
//         } catch (error) { 
//             console.error("Failed to save employee:", error); 
//         } finally { 
//             setIsSaving(false); 
//         } 
//     };

//     return ( 
//         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"> 
//             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 md:p-8 relative transition-transform transform-gpu animate-fade-in-up"> 
//                 <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors" aria-label="Close modal"> 
//                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> 
//                 </button> 
//                 <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Employee Details</h2> 
//                 <form onSubmit={handleSave} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2"> 
                    
//                     {/* ADDED: Read-only Employee ID Field */}
//                     <div>
//                         <label className="block text-sm font-medium text-gray-600 mb-1">Employee ID</label>
//                         <input 
//                             type="text" 
//                             name="emp_id" 
//                             value={formData.emp_id || ''} 
//                             disabled
//                             className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed" 
//                         />
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
//                         <div> 
//                             <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label> 
//                             <input type="text" name="first_name" value={formData.first_name || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" /> 
//                         </div> 
//                         <div> 
//                             <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label> 
//                             <input type="text" name="last_name" value={formData.last_name || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" /> 
//                         </div> 
//                     </div> 
//                     <div>
//                         <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
//                         <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
//                     </div> 
//                     <div>
//                         <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
//                         <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
//                     </div> 
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
//                         <div>
//                             <label className="block text-sm font-medium text-gray-600 mb-1">Birth Date</label>
//                             <input type="date" name="birth_date" value={formatDateForInput(formData.birth_date)} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
//                         </div> 
//                         <div>
//                             <label className="block text-sm font-medium text-gray-600 mb-1">Join Date</label>
//                             <input type="date" name="date_of_joining" value={formatDateForInput(formData.date_of_joining)} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
//                         </div> 
//                     </div> 
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
//                         <div> 
//                             <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label> 
//                             <select name="sex" value={formData.sex || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"> 
//                                 <option value="">Not Specified</option><option value="M">Male</option><option value="F">Female</option><option value="O">Other</option> 
//                             </select> 
//                         </div> 
//                         <div> 
//                             <label className="block text-sm font-medium text-gray-600 mb-1">Department</label> 
//                             <select name="department" value={formData.department || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"> 
//                                 <option value="">Select Department</option> 
//                                 {departments.map(dept => (<option key={dept.department_id} value={dept.department_id}>{dept.department_name}</option>))} 
//                             </select> 
//                         </div> 
//                     </div> 
//                     <div className="flex justify-end gap-4 pt-4"> 
//                         <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors">Cancel</button> 
//                         <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</button> 
//                     </div> 
//                 </form> 
//             </div> 
//         </div> 
//     );
// };


// // --- MAIN COMPONENT ---
// const MasterTableSettings: React.FC = () => {
//   const [activeTab, setActiveTab] = useState('overview');
//   const [employeeData, setEmployeeData] = useState<EmployeeData[]>([]);
//   const [departments, setDepartments] = useState<Department[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [uploadFile, setUploadFile] = useState<File | null>(null);
//   const [uploadLoading, setUploadLoading] = useState(false);
//   const [editingEmployee, setEditingEmployee] = useState<EmployeeData | null>(null);
  
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedDepartment, setSelectedDepartment] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const ITEMS_PER_PAGE = 10;

//   const [formData, setFormData] = useState<EmployeeData>({ emp_id: '', first_name: '', last_name: '', department: null, date_of_joining: '', birth_date: '', sex: '', email: '', phone: '' });
//   const API_BASE_URL = 'http://127.0.0.1:8000';
//   const tabs = [ { id: 'overview', name: 'Overview', icon: Users }, { id: 'add-data', name: 'Add Employee', icon: Plus }, { id: 'upload', name: 'Upload Excel', icon: Upload }, { id: 'employee-list', name: 'Employee Records', icon: FileSpreadsheet }, ];
  
//   const formFields = [ 
//       { id: 'emp_id', label: 'Employee ID', type: 'text', required: true, icon: User }, 
//       { id: 'first_name', label: 'First Name', type: 'text', required: true, icon: User }, 
//       { id: 'last_name', label: 'Last Name', type: 'text', required: false, icon: User }, 
//       { id: 'department', label: 'Department', type: 'select', required: true, icon: Building2 }, 
//       { id: 'date_of_joining', label: 'Join Date', type: 'date', required: true, icon: Calendar }, 
//       { id: 'birth_date', label: 'Birth Date', type: 'date', required: false, icon: Calendar }, 
//       { id: 'sex', label: 'Gender', type: 'select', required: false, icon: User, options: [ { value: 'M', label: 'Male' }, { value: 'F', label: 'Female' }, { value: 'O', label: 'Other' } ] }, 
//       { id: 'email', label: 'Email Address', type: 'email', required: false, icon: Mail }, 
//       { id: 'phone', label: 'Phone Number', type: 'tel', required: false, icon: Phone }, 
//     ];

//   const fetchEmployees = async () => { setLoading(true); try { const response = await fetch(`${API_BASE_URL}/mastertable/`); if (!response.ok) throw new Error('Failed to fetch employees'); const data = await response.json(); setEmployeeData(data); } catch (error) { console.error('Error fetching employees:', error); alert('Failed to load employees.'); } finally { setLoading(false); } };
//   const fetchDepartments = async () => { try { const response = await fetch(`${API_BASE_URL}/departments/`); if (!response.ok) throw new Error('Failed to fetch departments'); const data = await response.json(); setDepartments(data); } catch (error) { console.error('Error fetching departments:', error); setDepartments([]); } };
//   useEffect(() => { fetchEmployees(); fetchDepartments(); }, []);

//   const handleSubmit = async () => {
//     const requiredFields = formFields.filter(field => field.required);
//     for (const field of requiredFields) { if (!formData[field.id as keyof EmployeeData]) { alert(`Please fill in ${field.label}`); return; } }
//     setLoading(true);
//     try {
//       const submitFormData = new FormData();
//       Object.entries(formData).forEach(([key, value]) => { if (value !== null && value !== '') { submitFormData.append(key, String(value)); } });
//       const response = await fetch(`${API_BASE_URL}/mastertable/`, { method: 'POST', body: submitFormData, });
//       if (!response.ok) { const errorData = await response.json(); let errorMessage = 'Failed to add employee:\n' + Object.entries(errorData).map(([k, v]) => `${k}: ${(v as string[]).join(', ')}`).join('\n'); throw new Error(errorMessage); }
//       setFormData({ emp_id: '', first_name: '', last_name: '', department: null, date_of_joining: '', birth_date: '', sex: '', email: '', phone: '' });
//       await fetchEmployees();
//       alert('Employee added successfully!');
//       setActiveTab('employee-list');
//     } catch (error: any) { alert(error.message || 'Failed to add employee.'); } finally { setLoading(false); }
//   };

//   const handleUpdateEmployee = async (updatedData: EmployeeData) => {
//     try {
//       // FIX: Only remove department_name (read-only frontend helper).
//       // Keep emp_id in the payload because the serializer expects it.
//       const { department_name, ...payload } = updatedData;
      
//       const response = await fetch(`${API_BASE_URL}/mastertable/${updatedData.emp_id}/`, { 
//           method: 'PUT', 
//           headers: { 'Content-Type': 'application/json' }, 
//           body: JSON.stringify(payload) 
//       });

//       if (!response.ok) { 
//           const errorData = await response.json(); 
//           let errorMessage = 'Failed to update employee:\n' + Object.keys(errorData).map(key => `${key}: ${Array.isArray(errorData[key]) ? errorData[key].join(', ') : errorData[key]}`).join('\n'); 
//           throw new Error(errorMessage); 
//       }
//       alert('Employee updated successfully!');
//       await fetchEmployees();
//     } catch (error: any) { 
//         console.error('Update error:', error); 
//         alert(error.message || 'An unknown error occurred during update.'); 
//         throw error; 
//     }
//   };

//   const handleDelete = async (empId: string) => {
//     if (window.confirm('Are you sure you want to delete this employee?')) {
//       setLoading(true);
//       try { const response = await fetch(`${API_BASE_URL}/mastertable/${empId}/`, { method: 'DELETE' }); if (!response.ok) throw new Error('Failed to delete employee'); await fetchEmployees(); alert('Employee deleted successfully!'); } 
//       catch (error) { alert('Failed to delete employee. Please try again.'); } 
//       finally { setLoading(false); }
//     }
//   };

//   const handleExcelUpload = async () => {
//     if (!uploadFile) { alert('Please select a file to upload'); return; }
//     setUploadLoading(true);
//     try {
//       const formDataObj = new FormData();
//       formDataObj.append('file', uploadFile);
//       const response = await fetch(`${API_BASE_URL}/mastertable/upload_excel/`, { method: 'POST', body: formDataObj });
//       const data = await response.json();
//       if (response.ok) {
//         let successMessage = `✅ Upload Completed!\n\n📊 Summary:\n• Created: ${data.created_count || 0}\n• Updated: ${data.updated_count || 0}`;
//         if (data.error_count > 0) {
//           successMessage += `\n• Errors: ${data.error_count}\n\n❌ Error Details:\n` + data.errors.map((e: any) => `Row ${e.row}: ${e.error}`).join('\n');
//         }
//         alert(successMessage);
//         await fetchEmployees();
//       } else {
//         throw new Error(data.error || 'Upload failed. Please check the file format.');
//       }
//     } catch (error: any) {
//       alert(`❌ Upload Failed: ${error.message}`);
//     } finally {
//       setUploadLoading(false);
//       setUploadFile(null);
//       const fileInput = document.getElementById('excel-upload') as HTMLInputElement;
//       if (fileInput) fileInput.value = '';
//     }
//   };

//   const handleDownloadTemplate = async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/mastertable/download_template/`);
//       if (!response.ok) throw new Error('Failed to download template');
//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = 'employee_template.xlsx';
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       window.URL.revokeObjectURL(url);
//       alert('✅ Template downloaded successfully!');
//     } catch (error: any) {
//       alert('❌ Template Download Failed!');
//     }
//   };

//   const handleInputChange = (field: keyof EmployeeData, value: string) => { setFormData(prev => ({ ...prev, [field]: field === 'department' ? (value ? parseInt(value) : null) : value })); };
//   const formatDate = (dateString: string) => { if (!dateString) return 'N/A'; try { return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); } catch (e) { return dateString; } };
//   const getDepartmentName = (departmentId: number | null) => { if (!departmentId) return 'N/A'; const dept = departments.find(d => d.department_id === departmentId); return dept ? dept.department_name : 'Unknown'; };
//   const getGenderDisplay = (sex: string) => ({'M': 'Male', 'F': 'Female', 'O': 'Other'}[sex] || 'N/A');
//   const getDepartmentStats = () => { const counts = employeeData.reduce((acc, emp) => { const deptName = emp.department_name || getDepartmentName(emp.department); acc[deptName] = (acc[deptName] || 0) + 1; return acc; }, {} as Record<string, number>); return Object.entries(counts).map(([department, count]) => ({ department, count })); };
//   const getOverviewStats = () => { const total = employeeData.length; const deptCount = new Set(employeeData.map(e => e.department)).size; return [ { title: 'Total Employees', value: total, icon: Users, color: 'bg-blue-500' }, { title: 'Departments', value: deptCount, icon: Building2, color: 'bg-green-500' }, { title: 'Male', value: employeeData.filter(e => e.sex === 'M').length, icon: User, color: 'bg-purple-500' }, { title: 'Female', value: employeeData.filter(e => e.sex === 'F').length, icon: User, color: 'bg-pink-500' }, ]; };

//   const filteredEmployees = useMemo(() => {
//     let filtered = employeeData;
//     if (searchQuery) { 
//         const q = searchQuery.toLowerCase(); 
//         filtered = filtered.filter(emp => emp.first_name.toLowerCase().includes(q) || emp.last_name.toLowerCase().includes(q) || (emp.email || '').toLowerCase().includes(q) || emp.emp_id.toLowerCase().includes(q)); 
//     }
//     if (selectedDepartment) { filtered = filtered.filter(emp => emp.department === parseInt(selectedDepartment, 10)); }
//     return filtered;
//   }, [employeeData, searchQuery, selectedDepartment]);

//   const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
//   const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case 'overview':
//         return ( <div className="space-y-8"> <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"> {getOverviewStats().map((stat, index) => { const Icon = stat.icon; return ( <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p><p className="text-3xl font-bold text-gray-900">{stat.value}</p></div><div className={`${stat.color} p-3 rounded-xl`}><Icon className="h-6 w-6 text-white" /></div></div></div> ); })} </div> <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"> <h3 className="text-xl font-semibold text-gray-800 mb-4">Department Distribution</h3> <div className="space-y-3"> {getDepartmentStats().map((dept, index) => ( <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"> <div className="flex items-center"><div className="bg-blue-100 p-2 rounded-lg mr-3"><Building2 className="h-4 w-4 text-blue-600" /></div><span className="font-medium text-gray-800">{dept.department}</span></div> <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full">{dept.count}</span> </div> ))} </div> </div> <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"> <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Additions</h3> <div className="space-y-4"> {employeeData.slice(-3).map((employee, index) => ( <div key={index} className="flex items-center p-4 bg-gray-50 rounded-xl"> <div className="bg-green-100 p-2 rounded-lg mr-4"><User className="h-5 w-5 text-green-600" /></div> <div><p className="font-medium text-gray-800">{`${employee.first_name} ${employee.last_name}`.trim()}</p><p className="text-sm text-gray-600">{getDepartmentName(employee.department)} • {employee.emp_id}</p></div> </div> ))} </div> </div> </div> </div> );
//       case 'add-data':
//         return ( <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"> <div className="flex items-center mb-6"><Plus className="h-6 w-6 text-blue-600 mr-3" /><h2 className="text-2xl font-bold text-gray-800">Add New Employee</h2></div> <div className="space-y-6"> <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {formFields.map((field) => { const Icon = field.icon; return ( <div key={field.id} className="space-y-2"> <label htmlFor={field.id} className="flex items-center text-sm font-medium text-gray-700 mb-2"><Icon className="h-4 w-4 mr-2 text-gray-500" />{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</label> {field.type === 'select' ? ( <select id={field.id} value={formData[field.id as keyof EmployeeData] as string || ''} onChange={(e) => handleInputChange(field.id as keyof EmployeeData, e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"> <option value="">Select {field.label}</option> {field.id === 'department' ? departments.map((dept) => (<option key={dept.department_id} value={dept.department_id}>{dept.department_name}</option>)) : field.options?.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))} </select> ) : ( <input id={field.id} type={field.type} value={formData[field.id as keyof EmployeeData] as string || ''} onChange={(e) => handleInputChange(field.id as keyof EmployeeData, e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={`Enter ${field.label.toLowerCase()}`} /> )} </div> ); })} </div> <div className="flex justify-end pt-6"> <button onClick={handleSubmit} disabled={loading} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg disabled:opacity-50"> {loading ? 'Adding...' : <><Plus className="inline h-5 w-5 mr-2" />Add Employee</>} </button> </div> </div> </div> );
//       case 'upload':
//         return ( <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"> <div className="flex items-center mb-6"><Upload className="h-6 w-6 text-green-600 mr-3" /><h2 className="text-2xl font-bold text-gray-800">Upload Employee Excel Data</h2></div> <div className="space-y-6"> <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-400"> <FileSpreadsheet className="h-16 w-16 text-gray-400 mx-auto mb-4" /> <div><label htmlFor="excel-upload" className="block text-lg font-medium text-gray-700">Choose Excel File</label><p className="text-sm text-gray-500">.xlsx or .xls</p><input id="excel-upload" type="file" accept=".xlsx,.xls" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-500 mt-4 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" /></div> </div> <div className="flex space-x-4 justify-center"> <button onClick={handleExcelUpload} disabled={!uploadFile || uploadLoading} className="inline-flex items-center px-8 py-3 text-base font-medium rounded-xl text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 shadow-lg disabled:opacity-50"> {uploadLoading ? 'Uploading...' : <><Upload className="h-5 w-5 mr-2" />Upload</>} </button> <button onClick={handleDownloadTemplate} className="inline-flex items-center px-6 py-3 text-base font-medium rounded-xl bg-gray-600 text-white hover:bg-gray-700 shadow-lg"><FileSpreadsheet className="h-5 w-5 mr-2" />Template</button> </div> {uploadFile && <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4 flex items-center"><FileSpreadsheet className="h-5 w-5 text-green-600 mr-2" /><span className="text-green-800 font-medium">{uploadFile.name}</span></div>} </div> </div> );
//       case 'employee-list':
//         return ( <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"> <div className="p-6 border-b border-gray-200"> <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"> <div className="flex items-center"><FileSpreadsheet className="h-6 w-6 text-purple-600 mr-3" /><h2 className="text-2xl font-bold text-gray-800">Employee Records</h2><span className="ml-3 bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">{employeeData.length} total</span></div> <div className="flex flex-col sm:flex-row gap-4"> <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"/></div> <select value={selectedDepartment} onChange={(e) => { setSelectedDepartment(e.target.value); setCurrentPage(1); }} className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"><option value="">All Departments</option>{departments.map(dept => (<option key={dept.department_id} value={dept.department_id}>{dept.department_name}</option>))}</select> </div> </div> </div> {loading ? (<div className="text-center py-12"><p className="text-gray-600">Loading...</p></div>) : paginatedEmployees.length > 0 ? ( <> <div className="overflow-x-auto"> <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">ID</th><th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Name</th><th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Department</th><th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Join Date</th><th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Contact</th><th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead> <tbody className="bg-white divide-y divide-gray-200"> {paginatedEmployees.map((employee) => ( <tr key={employee.emp_id} className="hover:bg-gray-50"> <td className="px-6 py-4"><div className="flex items-center"><User className="h-4 w-4 text-gray-400 mr-2" /><span className="text-sm font-medium text-gray-900">{employee.emp_id}</span></div></td> <td className="px-6 py-4 text-sm font-semibold text-gray-900">{`${employee.first_name} ${employee.last_name}`}</td> <td className="px-6 py-4 text-sm text-gray-500">{getDepartmentName(employee.department)}</td> <td className="px-6 py-4 text-sm text-gray-500">{formatDate(employee.date_of_joining)}</td> <td className="px-6 py-4"><div className="text-sm text-gray-900">{employee.email || <span className="text-gray-400 italic">No Email</span>}</div><div className="text-sm text-gray-500">{employee.phone || 'N/A'}</div></td> <td className="px-6 py-4"><div className="flex items-center space-x-2"><button onClick={() => setEditingEmployee(employee)} className="p-2 rounded-lg text-blue-700 bg-blue-100 hover:bg-blue-200"><Pencil className="h-4 w-4" /></button><button onClick={() => handleDelete(employee.emp_id)} disabled={loading} className="p-2 rounded-lg text-red-700 bg-red-100 hover:bg-red-200"><Trash2 className="h-4 w-4" /></button></div></td> </tr>))} </tbody> </table> </div> <div className="p-4 flex items-center justify-between border-t border-gray-200"> <p className="text-sm text-gray-700">Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>-<span>{Math.min(currentPage * ITEMS_PER_PAGE, filteredEmployees.length)}</span> of <span>{filteredEmployees.length}</span></p> <div className="flex items-center gap-2"><button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium border rounded-lg disabled:opacity-50">Prev</button><span className="text-sm">Page {currentPage} of {totalPages}</span><button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium border rounded-lg disabled:opacity-50">Next</button></div> </div> </> ) : ( <div className="text-center py-12"><Search className="h-16 w-16 text-gray-400 mx-auto mb-4" /><p className="text-xl font-medium text-gray-900 mb-2">No matching employees found</p><p className="text-gray-500">Try adjusting your search or filter criteria.</p></div> )} </div> );
//       default: return null;
//     }
//   };

//   return ( <div className="min-h-screen bg-gray-50"> <div className="container mx-auto px-4 py-8"> <div className="mb-8"><h1 className="text-4xl font-bold text-gray-900 mb-2">Master Table Settings</h1><p className="text-lg text-gray-600">Manage employee data and records efficiently</p></div> <div className="mb-8"><div className="border-b border-gray-200 bg-white rounded-t-2xl shadow-sm"><nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">{tabs.map((tab) => {const Icon = tab.icon; return (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`${activeTab === tab.id ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm rounded-t-lg flex items-center space-x-2`}><Icon className="h-5 w-5" /><span>{tab.name}</span></button>);})}</nav></div></div> <div className="tab-content">{renderTabContent()}</div> </div> {editingEmployee && (<EditEmployeeModal employee={editingEmployee} onClose={() => setEditingEmployee(null)} onSave={handleUpdateEmployee} departments={departments} />)} </div> );
// };

// export default MasterTableSettings;



import React, { useState, useEffect, useMemo } from "react";
// ADDED: Briefcase icon
import { Upload, Plus, Trash2, FileSpreadsheet, Users, Mail, Phone, Calendar, User, Building2, Pencil, Search, Briefcase } from "lucide-react";

// --- TYPE DEFINITIONS ---
interface EmployeeData {
  emp_id: string;
  first_name: string;
  last_name: string;
  // ADDED: Designation field (optional)
  designation?: string;
  department: number | null;
  department_name?: string;
  date_of_joining: string;
  birth_date: string;
  sex: string;
  email: string;
  phone: string;
}

interface Department {
  department_id: number;
  department_name: string;
}

interface EditEmployeeModalProps {
    employee: EmployeeData;
    onClose: () => void;
    onSave: (updatedEmployee: EmployeeData) => Promise<void>;
    departments: Department[];
}

// --- HELPER FUNCTIONS & CHILD COMPONENTS ---

const formatDateForInput = (dateString: string | Date | undefined): string => {
    if (!dateString) return "";
    try {
        const date = new Date(dateString);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - userTimezoneOffset).toISOString().split('T')[0];
    } catch (error) {
        console.error("Invalid date for formatting:", dateString);
        return "";
    }
};

const EditEmployeeModal = ({ employee, onClose, onSave, departments }: EditEmployeeModalProps) => {
    const [formData, setFormData] = useState<EmployeeData>(employee);
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => { setFormData(employee); }, [employee]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { 
        const { name, value } = e.target; 
        setFormData(prev => ({ ...prev, [name]: name === 'department' ? (value ? parseInt(value) : null) : value })); 
    };
    
    const handleSave = async (e: React.FormEvent) => { 
        e.preventDefault(); 
        setIsSaving(true); 
        try { 
            await onSave(formData); 
            onClose(); 
        } catch (error) { 
            console.error("Failed to save employee:", error); 
        } finally { 
            setIsSaving(false); 
        } 
    };

    return ( 
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"> 
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 md:p-8 relative transition-transform transform-gpu animate-fade-in-up"> 
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors" aria-label="Close modal"> 
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> 
                </button> 
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Employee Details</h2> 
                <form onSubmit={handleSave} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2"> 
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Employee ID</label>
                        <input 
                            type="text" 
                            name="emp_id" 
                            value={formData.emp_id || ''} 
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed" 
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
                        <div> 
                            <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label> 
                            <input type="text" name="first_name" value={formData.first_name || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" /> 
                        </div> 
                        <div> 
                            <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label> 
                            <input type="text" name="last_name" value={formData.last_name || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" /> 
                        </div> 
                    </div> 

                    {/* ADDED: Designation Field in Edit Modal */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Designation</label>
                        <input 
                            type="text" 
                            name="designation" 
                            placeholder="e.g. Software Engineer"
                            value={formData.designation || ''} 
                            onChange={handleChange} 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                        <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                    </div> 
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                        <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                    </div> 
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Birth Date</label>
                            <input type="date" name="birth_date" value={formatDateForInput(formData.birth_date)} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                        </div> 
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Join Date</label>
                            <input type="date" name="date_of_joining" value={formatDateForInput(formData.date_of_joining)} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                        </div> 
                    </div> 
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
                        <div> 
                            <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label> 
                            <select name="sex" value={formData.sex || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"> 
                                <option value="">Not Specified</option><option value="M">Male</option><option value="F">Female</option><option value="O">Other</option> 
                            </select> 
                        </div> 
                        <div> 
                            <label className="block text-sm font-medium text-gray-600 mb-1">Department</label> 
                            <select name="department" value={formData.department || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"> 
                                <option value="">Select Department</option> 
                                {departments.map(dept => (<option key={dept.department_id} value={dept.department_id}>{dept.department_name}</option>))} 
                            </select> 
                        </div> 
                    </div> 
                    <div className="flex justify-end gap-4 pt-4"> 
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors">Cancel</button> 
                        <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</button> 
                    </div> 
                </form> 
            </div> 
        </div> 
    );
};


// --- MAIN COMPONENT ---
const MasterTableSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [employeeData, setEmployeeData] = useState<EmployeeData[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeData | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // UPDATED: Added designation to initial state
  const [formData, setFormData] = useState<EmployeeData>({ 
      emp_id: '', 
      first_name: '', 
      last_name: '', 
      designation: '', 
      department: null, 
      date_of_joining: '', 
      birth_date: '', 
      sex: '', 
      email: '', 
      phone: '' 
  });

  const API_BASE_URL = 'http://127.0.0.1:8000';
  const tabs = [ { id: 'overview', name: 'Overview', icon: Users }, { id: 'add-data', name: 'Add Employee', icon: Plus }, { id: 'upload', name: 'Upload Excel', icon: Upload }, { id: 'employee-list', name: 'Employee Records', icon: FileSpreadsheet }, ];
  
  // UPDATED: Added designation to formFields array
  const formFields = [ 
      { id: 'emp_id', label: 'Employee ID', type: 'text', required: true, icon: User }, 
      { id: 'first_name', label: 'First Name', type: 'text', required: true, icon: User }, 
      { id: 'last_name', label: 'Last Name', type: 'text', required: false, icon: User }, 
      // Added designation field here
      { id: 'designation', label: 'Designation', type: 'text', required: false, icon: Briefcase },
      { id: 'department', label: 'Department', type: 'select', required: true, icon: Building2 }, 
      { id: 'date_of_joining', label: 'Join Date', type: 'date', required: true, icon: Calendar }, 
      { id: 'birth_date', label: 'Birth Date', type: 'date', required: false, icon: Calendar }, 
      { id: 'sex', label: 'Gender', type: 'select', required: false, icon: User, options: [ { value: 'M', label: 'Male' }, { value: 'F', label: 'Female' }, { value: 'O', label: 'Other' } ] }, 
      { id: 'email', label: 'Email Address', type: 'email', required: false, icon: Mail }, 
      { id: 'phone', label: 'Phone Number', type: 'tel', required: false, icon: Phone }, 
    ];

  const fetchEmployees = async () => { setLoading(true); try { const response = await fetch(`${API_BASE_URL}/mastertable/`); if (!response.ok) throw new Error('Failed to fetch employees'); const data = await response.json(); setEmployeeData(data); } catch (error) { console.error('Error fetching employees:', error); alert('Failed to load employees.'); } finally { setLoading(false); } };
  const fetchDepartments = async () => { try { const response = await fetch(`${API_BASE_URL}/departments/`); if (!response.ok) throw new Error('Failed to fetch departments'); const data = await response.json(); setDepartments(data); } catch (error) { console.error('Error fetching departments:', error); setDepartments([]); } };
  useEffect(() => { fetchEmployees(); fetchDepartments(); }, []);

  const handleSubmit = async () => {
    const requiredFields = formFields.filter(field => field.required);
    for (const field of requiredFields) { if (!formData[field.id as keyof EmployeeData]) { alert(`Please fill in ${field.label}`); return; } }
    setLoading(true);
    try {
      const submitFormData = new FormData();
      Object.entries(formData).forEach(([key, value]) => { if (value !== null && value !== '') { submitFormData.append(key, String(value)); } });
      const response = await fetch(`${API_BASE_URL}/mastertable/`, { method: 'POST', body: submitFormData, });
      if (!response.ok) { const errorData = await response.json(); let errorMessage = 'Failed to add employee:\n' + Object.entries(errorData).map(([k, v]) => `${k}: ${(v as string[]).join(', ')}`).join('\n'); throw new Error(errorMessage); }
      // UPDATED: Reset form state includes designation
      setFormData({ emp_id: '', first_name: '', last_name: '', designation: '', department: null, date_of_joining: '', birth_date: '', sex: '', email: '', phone: '' });
      await fetchEmployees();
      alert('Employee added successfully!');
      setActiveTab('employee-list');
    } catch (error: any) { alert(error.message || 'Failed to add employee.'); } finally { setLoading(false); }
  };

  const handleUpdateEmployee = async (updatedData: EmployeeData) => {
    try {
      const { department_name, ...payload } = updatedData;
      
      const response = await fetch(`${API_BASE_URL}/mastertable/${updatedData.emp_id}/`, { 
          method: 'PUT', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(payload) 
      });

      if (!response.ok) { 
          const errorData = await response.json(); 
          let errorMessage = 'Failed to update employee:\n' + Object.keys(errorData).map(key => `${key}: ${Array.isArray(errorData[key]) ? errorData[key].join(', ') : errorData[key]}`).join('\n'); 
          throw new Error(errorMessage); 
      }
      alert('Employee updated successfully!');
      await fetchEmployees();
    } catch (error: any) { 
        console.error('Update error:', error); 
        alert(error.message || 'An unknown error occurred during update.'); 
        throw error; 
    }
  };

  const handleDelete = async (empId: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setLoading(true);
      try { const response = await fetch(`${API_BASE_URL}/mastertable/${empId}/`, { method: 'DELETE' }); if (!response.ok) throw new Error('Failed to delete employee'); await fetchEmployees(); alert('Employee deleted successfully!'); } 
      catch (error) { alert('Failed to delete employee. Please try again.'); } 
      finally { setLoading(false); }
    }
  };

  const handleExcelUpload = async () => {
    if (!uploadFile) { alert('Please select a file to upload'); return; }
    setUploadLoading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('file', uploadFile);
      const response = await fetch(`${API_BASE_URL}/mastertable/upload_excel/`, { method: 'POST', body: formDataObj });
      const data = await response.json();
      if (response.ok) {
        let successMessage = `✅ Upload Completed!\n\n📊 Summary:\n• Created: ${data.created_count || 0}\n• Updated: ${data.updated_count || 0}`;
        if (data.error_count > 0) {
          successMessage += `\n• Errors: ${data.error_count}\n\n❌ Error Details:\n` + data.errors.map((e: any) => `Row ${e.row}: ${e.error}`).join('\n');
        }
        alert(successMessage);
        await fetchEmployees();
      } else {
        throw new Error(data.error || 'Upload failed. Please check the file format.');
      }
    } catch (error: any) {
      alert(`❌ Upload Failed: ${error.message}`);
    } finally {
      setUploadLoading(false);
      setUploadFile(null);
      const fileInput = document.getElementById('excel-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/mastertable/download_template/`);
      if (!response.ok) throw new Error('Failed to download template');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'employee_template.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      alert('✅ Template downloaded successfully!');
    } catch (error: any) {
      alert('❌ Template Download Failed!');
    }
  };

  const handleInputChange = (field: keyof EmployeeData, value: string) => { setFormData(prev => ({ ...prev, [field]: field === 'department' ? (value ? parseInt(value) : null) : value })); };
  const formatDate = (dateString: string) => { if (!dateString) return 'N/A'; try { return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); } catch (e) { return dateString; } };
  const getDepartmentName = (departmentId: number | null) => { if (!departmentId) return 'N/A'; const dept = departments.find(d => d.department_id === departmentId); return dept ? dept.department_name : 'Unknown'; };
  const getGenderDisplay = (sex: string) => ({'M': 'Male', 'F': 'Female', 'O': 'Other'}[sex] || 'N/A');
  const getDepartmentStats = () => { const counts = employeeData.reduce((acc, emp) => { const deptName = emp.department_name || getDepartmentName(emp.department); acc[deptName] = (acc[deptName] || 0) + 1; return acc; }, {} as Record<string, number>); return Object.entries(counts).map(([department, count]) => ({ department, count })); };
  const getOverviewStats = () => { const total = employeeData.length; const deptCount = new Set(employeeData.map(e => e.department)).size; return [ { title: 'Total Employees', value: total, icon: Users, color: 'bg-blue-500' }, { title: 'Departments', value: deptCount, icon: Building2, color: 'bg-green-500' }, { title: 'Male', value: employeeData.filter(e => e.sex === 'M').length, icon: User, color: 'bg-purple-500' }, { title: 'Female', value: employeeData.filter(e => e.sex === 'F').length, icon: User, color: 'bg-pink-500' }, ]; };

  const filteredEmployees = useMemo(() => {
    let filtered = employeeData;
    if (searchQuery) { 
        const q = searchQuery.toLowerCase(); 
        filtered = filtered.filter(emp => emp.first_name.toLowerCase().includes(q) || emp.last_name.toLowerCase().includes(q) || (emp.email || '').toLowerCase().includes(q) || emp.emp_id.toLowerCase().includes(q)); 
    }
    if (selectedDepartment) { filtered = filtered.filter(emp => emp.department === parseInt(selectedDepartment, 10)); }
    return filtered;
  }, [employeeData, searchQuery, selectedDepartment]);

  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return ( <div className="space-y-8"> <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"> {getOverviewStats().map((stat, index) => { const Icon = stat.icon; return ( <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p><p className="text-3xl font-bold text-gray-900">{stat.value}</p></div><div className={`${stat.color} p-3 rounded-xl`}><Icon className="h-6 w-6 text-white" /></div></div></div> ); })} </div> <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"> <h3 className="text-xl font-semibold text-gray-800 mb-4">Department Distribution</h3> <div className="space-y-3"> {getDepartmentStats().map((dept, index) => ( <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"> <div className="flex items-center"><div className="bg-blue-100 p-2 rounded-lg mr-3"><Building2 className="h-4 w-4 text-blue-600" /></div><span className="font-medium text-gray-800">{dept.department}</span></div> <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full">{dept.count}</span> </div> ))} </div> </div> <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"> <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Additions</h3> <div className="space-y-4"> {employeeData.slice(-3).map((employee, index) => ( <div key={index} className="flex items-center p-4 bg-gray-50 rounded-xl"> <div className="bg-green-100 p-2 rounded-lg mr-4"><User className="h-5 w-5 text-green-600" /></div> <div><p className="font-medium text-gray-800">{`${employee.first_name} ${employee.last_name}`.trim()}</p><p className="text-sm text-gray-600">{getDepartmentName(employee.department)} • {employee.emp_id}</p></div> </div> ))} </div> </div> </div> </div> );
      case 'add-data':
        return ( <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"> <div className="flex items-center mb-6"><Plus className="h-6 w-6 text-blue-600 mr-3" /><h2 className="text-2xl font-bold text-gray-800">Add New Employee</h2></div> <div className="space-y-6"> <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {formFields.map((field) => { const Icon = field.icon; return ( <div key={field.id} className="space-y-2"> <label htmlFor={field.id} className="flex items-center text-sm font-medium text-gray-700 mb-2"><Icon className="h-4 w-4 mr-2 text-gray-500" />{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</label> {field.type === 'select' ? ( <select id={field.id} value={formData[field.id as keyof EmployeeData] as string || ''} onChange={(e) => handleInputChange(field.id as keyof EmployeeData, e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"> <option value="">Select {field.label}</option> {field.id === 'department' ? departments.map((dept) => (<option key={dept.department_id} value={dept.department_id}>{dept.department_name}</option>)) : field.options?.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))} </select> ) : ( <input id={field.id} type={field.type} value={formData[field.id as keyof EmployeeData] as string || ''} onChange={(e) => handleInputChange(field.id as keyof EmployeeData, e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={`Enter ${field.label.toLowerCase()}`} /> )} </div> ); })} </div> <div className="flex justify-end pt-6"> <button onClick={handleSubmit} disabled={loading} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg disabled:opacity-50"> {loading ? 'Adding...' : <><Plus className="inline h-5 w-5 mr-2" />Add Employee</>} </button> </div> </div> </div> );
      case 'upload':
        return ( <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"> <div className="flex items-center mb-6"><Upload className="h-6 w-6 text-green-600 mr-3" /><h2 className="text-2xl font-bold text-gray-800">Upload Employee Excel Data</h2></div> <div className="space-y-6"> <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-400"> <FileSpreadsheet className="h-16 w-16 text-gray-400 mx-auto mb-4" /> <div><label htmlFor="excel-upload" className="block text-lg font-medium text-gray-700">Choose Excel File</label><p className="text-sm text-gray-500">.xlsx or .xls</p><input id="excel-upload" type="file" accept=".xlsx,.xls" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-500 mt-4 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" /></div> </div> <div className="flex space-x-4 justify-center"> <button onClick={handleExcelUpload} disabled={!uploadFile || uploadLoading} className="inline-flex items-center px-8 py-3 text-base font-medium rounded-xl text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 shadow-lg disabled:opacity-50"> {uploadLoading ? 'Uploading...' : <><Upload className="h-5 w-5 mr-2" />Upload</>} </button> <button onClick={handleDownloadTemplate} className="inline-flex items-center px-6 py-3 text-base font-medium rounded-xl bg-gray-600 text-white hover:bg-gray-700 shadow-lg"><FileSpreadsheet className="h-5 w-5 mr-2" />Template</button> </div> {uploadFile && <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4 flex items-center"><FileSpreadsheet className="h-5 w-5 text-green-600 mr-2" /><span className="text-green-800 font-medium">{uploadFile.name}</span></div>} </div> </div> );
      case 'employee-list':
        return ( <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"> <div className="p-6 border-b border-gray-200"> <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"> <div className="flex items-center"><FileSpreadsheet className="h-6 w-6 text-purple-600 mr-3" /><h2 className="text-2xl font-bold text-gray-800">Employee Records</h2><span className="ml-3 bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">{employeeData.length} total</span></div> <div className="flex flex-col sm:flex-row gap-4"> <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"/></div> <select value={selectedDepartment} onChange={(e) => { setSelectedDepartment(e.target.value); setCurrentPage(1); }} className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"><option value="">All Departments</option>{departments.map(dept => (<option key={dept.department_id} value={dept.department_id}>{dept.department_name}</option>))}</select> </div> </div> </div> {loading ? (<div className="text-center py-12"><p className="text-gray-600">Loading...</p></div>) : paginatedEmployees.length > 0 ? ( <> <div className="overflow-x-auto"> <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">ID</th><th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Name & Designation</th><th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Department</th><th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Join Date</th><th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Contact</th><th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead> <tbody className="bg-white divide-y divide-gray-200"> {paginatedEmployees.map((employee) => ( <tr key={employee.emp_id} className="hover:bg-gray-50"> <td className="px-6 py-4"><div className="flex items-center"><User className="h-4 w-4 text-gray-400 mr-2" /><span className="text-sm font-medium text-gray-900">{employee.emp_id}</span></div></td> 
             
             {/* UPDATED: Display Name and Designation */}
             <td className="px-6 py-4">
                 <div className="text-sm font-semibold text-gray-900">{`${employee.first_name} ${employee.last_name}`}</div>
                 {employee.designation && <div className="text-xs text-gray-500 mt-0.5">{employee.designation}</div>}
             </td>
             
             <td className="px-6 py-4 text-sm text-gray-500">{getDepartmentName(employee.department)}</td> <td className="px-6 py-4 text-sm text-gray-500">{formatDate(employee.date_of_joining)}</td> <td className="px-6 py-4"><div className="text-sm text-gray-900">{employee.email || <span className="text-gray-400 italic">No Email</span>}</div><div className="text-sm text-gray-500">{employee.phone || 'N/A'}</div></td> <td className="px-6 py-4"><div className="flex items-center space-x-2"><button onClick={() => setEditingEmployee(employee)} className="p-2 rounded-lg text-blue-700 bg-blue-100 hover:bg-blue-200"><Pencil className="h-4 w-4" /></button><button onClick={() => handleDelete(employee.emp_id)} disabled={loading} className="p-2 rounded-lg text-red-700 bg-red-100 hover:bg-red-200"><Trash2 className="h-4 w-4" /></button></div></td> </tr>))} </tbody> </table> </div> <div className="p-4 flex items-center justify-between border-t border-gray-200"> <p className="text-sm text-gray-700">Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>-<span>{Math.min(currentPage * ITEMS_PER_PAGE, filteredEmployees.length)}</span> of <span>{filteredEmployees.length}</span></p> <div className="flex items-center gap-2"><button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium border rounded-lg disabled:opacity-50">Prev</button><span className="text-sm">Page {currentPage} of {totalPages}</span><button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium border rounded-lg disabled:opacity-50">Next</button></div> </div> </> ) : ( <div className="text-center py-12"><Search className="h-16 w-16 text-gray-400 mx-auto mb-4" /><p className="text-xl font-medium text-gray-900 mb-2">No matching employees found</p><p className="text-gray-500">Try adjusting your search or filter criteria.</p></div> )} </div> );
      default: return null;
    }
  };

  return ( <div className="min-h-screen bg-gray-50"> <div className="container mx-auto px-4 py-8"> <div className="mb-8"><h1 className="text-4xl font-bold text-gray-900 mb-2">Master Table Settings</h1><p className="text-lg text-gray-600">Manage employee data and records efficiently</p></div> <div className="mb-8"><div className="border-b border-gray-200 bg-white rounded-t-2xl shadow-sm"><nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">{tabs.map((tab) => {const Icon = tab.icon; return (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`${activeTab === tab.id ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm rounded-t-lg flex items-center space-x-2`}><Icon className="h-5 w-5" /><span>{tab.name}</span></button>);})}</nav></div></div> <div className="tab-content">{renderTabContent()}</div> </div> {editingEmployee && (<EditEmployeeModal employee={editingEmployee} onClose={() => setEditingEmployee(null)} onSave={handleUpdateEmployee} departments={departments} />)} </div> );
};

export default MasterTableSettings;