


// import { useState, useEffect, useMemo } from "react";
// import { ErrorMessage } from "../../molecules/ErrorMessage/ErrorMessage";
// import { Button } from "../../atoms/Buttons/Button";
// import axios from "axios";
// import { API_ENDPOINTS } from "../../constants/api";
// import { EditEmployeeModal } from "./EditEmployeeModal";
// import { DeleteConfirmationModal } from "./DeleteConformationModal";

// // --- Type Definition ---
// export interface Employee {
//     emp_id: string;
//     first_name: string;
//     last_name: string;
//     date_of_joining: string;
//     birth_date: string | null;
//     sex: 'M' | 'F' | 'O' | null;
//     email: string;
//     designation: string | null; 
//     phone: string;
//     department: { department_id: number; department_name: string } | null;
//     current_line: { line_id: number; line_name: string } | null;
//     current_station: { station_id: number; station_name: string } | null;
// }

// // --- Sub-components ---
// const PageHeader = ({ title }: { title: string }) => (<h1 className="text-3xl md:text-5xl font-bold mb-6 md:mb-8 text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{title}</h1>);
// const LoadingState = () => (<div className="flex items-center justify-center min-h-[400px]"><div className="text-center"><div className="inline-flex items-center justify-center w-16 h-16 mb-4"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div></div><p className="text-lg text-gray-600">Loading employee data...</p></div></div>);
// const FilterSelect = ({ value, onChange, options, className = "" }: { value: string; onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void; options: string[]; className?: string; }) => (<select value={value} onChange={onChange} className={`px-4 py-3 rounded-xl border-2 border-purple-200 bg-white text-sm md:text-base w-full md:w-auto outline-none shadow-lg hover:border-purple-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-300 ${className}`}> {options.map((option) => (<option key={option} value={option}>{option}</option>))} </select>);
// const SearchInput = ({ value, onChange, placeholder }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string; }) => (<div className="relative"><input type="text" value={value} onChange={onChange} placeholder={placeholder} className="w-full px-4 py-3 pl-12 rounded-xl border-2 border-blue-200 bg-white text-sm md:text-base outline-none shadow-lg hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300" /><svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>);

// // --- 1. CORRECTED FilterControls COMPONENT ---
// const FilterControls = ({
//     selectedDepartment, onDepartmentChange, departmentOptions,
//     selectedLine, onLineChange, lineOptions,
//     selectedStation, onStationChange, stationOptions,
//     selectedSex, onSexChange, sexOptions,
//     searchQuery, onSearchChange
// }: any) => (
//     <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-2xl shadow-xl mb-6 md:mb-8">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
//             <div className="flex flex-col md:flex-row gap-4 md:col-span-2">
//                 <FilterSelect value={selectedDepartment} onChange={onDepartmentChange} options={departmentOptions} />
//                 <FilterSelect value={selectedLine} onChange={onLineChange} options={lineOptions} />
//                 <FilterSelect value={selectedStation} onChange={onStationChange} options={stationOptions} />
//                 <FilterSelect value={selectedSex} onChange={onSexChange} options={sexOptions} />
//             </div>
//             <div className="w-full">
//                 <SearchInput value={searchQuery} onChange={onSearchChange} placeholder="Search name, ID, location..." />
//             </div>
//         </div>
//     </div>
// );

// const TableHeader = ({ columns }: { columns: Array<{ key: string; header: string }> }) => (<thead><tr className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">{columns.map(col => (<th key={col.key} className="p-4 text-center text-sm md:text-base font-semibold border-r border-purple-500 last:border-r-0">{col.header}</th>))}</tr></thead>);
// // const MobileTableRow = ({ employee, columns, onEdit, onDelete }: { employee: Employee; columns: Array<{ key: string; header: string }>; onEdit: (employee: Employee) => void; onDelete: (employee: Employee) => void; }) => (<tr className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 even:bg-gradient-to-r even:from-purple-50/50 even:to-blue-50/50 border-b border-purple-100 last:border-b-0 transition-all duration-300">{columns.map(col => (<td key={`${employee.emp_id}-${col.key}`} className="border-r border-purple-100 p-3 text-center text-sm last:border-r-0">{col.key === 'emp_id' && employee.emp_id}{col.key === 'name' && `${employee.first_name || ''} ${employee.last_name || ''}`.trim()}{col.key === 'location' && (<div className="text-xs text-left"><div><strong>Dept:</strong> {employee.department?.department_name || 'N/A'}</div><div><strong>Line:</strong> {employee.current_line?.line_name || 'N/A'}</div><div><strong>Station:</strong> {employee.current_station?.station_name || 'N/A'}</div></div>)}{col.key === 'sex' && (employee.sex === 'M' ? 'Male' : employee.sex === 'F' ? 'Female' : 'N/A')}</td>))}<td className="border-r border-purple-100 p-3 text-center text-sm last:border-r-0"><div className="flex flex-col gap-2"><Button onClick={() => onEdit(employee)} variant="tertiary" className="text-purple-600 hover:text-purple-800 font-semibold text-xs px-2 py-1">Edit</Button><Button onClick={() => onDelete(employee)} variant="tertiary" className="text-red-600 hover:text-red-800 font-semibold text-xs px-2 py-1">Delete</Button></div></td></tr>);
// const MobileTableRow = ({ employee, columns, onEdit, onDelete }: { employee: Employee; columns: Array<{ key: string; header: string }>; onEdit: (employee: Employee) => void; onDelete: (employee: Employee) => void; }) => (<tr className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 even:bg-gradient-to-r even:from-purple-50/50 even:to-blue-50/50 border-b border-purple-100 last:border-b-0 transition-all duration-300">{columns.map(col => (<td key={`${employee.emp_id}-${col.key}`} className="border-r border-purple-100 p-3 text-center text-sm last:border-r-0">{col.key === 'emp_id' && employee.emp_id}{col.key === 'name' && `${employee.first_name || ''} ${employee.last_name || ''}`.trim()}{col.key === 'location' && (<div className="text-xs text-left"><div><strong>Desig:</strong> {employee.designation || 'N/A'}</div><div><strong>Dept:</strong> {employee.department?.department_name || 'N/A'}</div><div><strong>Line:</strong> {employee.current_line?.line_name || 'N/A'}</div><div><strong>Station:</strong> {employee.current_station?.station_name || 'N/A'}</div></div>)}{col.key === 'sex' && (employee.sex === 'M' ? 'Male' : employee.sex === 'F' ? 'Female' : 'N/A')}</td>))}<td className="border-r border-purple-100 p-3 text-center text-sm last:border-r-0"><div className="flex flex-col gap-2"><Button onClick={() => onEdit(employee)} variant="tertiary" className="text-purple-600 hover:text-purple-800 font-semibold text-xs px-2 py-1">Edit</Button><Button onClick={() => onDelete(employee)} variant="tertiary" className="text-red-600 hover:text-red-800 font-semibold text-xs px-2 py-1">Delete</Button></div></td></tr>);
// // const DesktopTableRow = ({ employee, onEdit, onDelete }: { employee: Employee; onEdit: (employee: Employee) => void; onDelete: (employee: Employee) => void; }) => (<tr className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 even:bg-gradient-to-r even:from-purple-50/50 even:to-blue-50/50 border-b border-purple-100 last:border-b-0 transition-all duration-300"><td className="border-r border-purple-100 p-4 text-center text-sm md:text-base font-medium text-purple-700">{employee.emp_id}</td><td className="border-r border-purple-100 p-4 text-center text-sm md:text-base">{`${employee.first_name || ''} ${employee.last_name || ''}`.trim()}</td><td className="border-r border-purple-100 p-4 text-center text-sm md:text-base"><span className="text-purple-700 text-sm">{employee.department?.department_name || 'N/A'}</span></td><td className="border-r border-purple-100 p-4 text-center text-sm md:text-base">{employee.current_line?.line_name || 'N/A'}</td><td className="border-r border-purple-100 p-4 text-center text-sm md:text-base">{employee.current_station?.station_name || 'N/A'}</td><td className="border-r border-purple-100 p-4 text-center text-sm md:text-base">{new Date(employee.date_of_joining).toLocaleDateString()}</td><td className="border-r border-purple-100 p-4 text-center text-sm md:text-base"><span className={`text-sm ${employee.sex === 'M' ? 'text-blue-700' : employee.sex === 'F' ? 'text-purple-700' : 'text-gray-700'}`}>{employee.sex === 'M' ? 'Male' : employee.sex === 'F' ? 'Female' : 'N/A'}</span></td><td className="border-r border-purple-100 p-4 text-center text-sm md:text-base text-blue-600">{employee.email}</td><td className="border-r border-purple-100 p-4 text-center text-sm md:text-base last:border-r-0">{employee.phone}</td><td className="p-4 text-center text-sm md:text-base"><div className="flex justify-center items-center gap-2"><Button onClick={() => onEdit(employee)} variant="tertiary" className="text-purple-600 hover:text-purple-800 font-semibold px-3 py-1">Edit</Button><Button onClick={() => onDelete(employee)} variant="tertiary" className="text-red-600 hover:text-red-800 font-semibold px-3 py-1">Delete</Button></div></td></tr>);
// const DesktopTableRow = ({ employee, onEdit, onDelete }: { employee: Employee; onEdit: (employee: Employee) => void; onDelete: (employee: Employee) => void; }) => (<tr className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 even:bg-gradient-to-r even:from-purple-50/50 even:to-blue-50/50 border-b border-purple-100 last:border-b-0 transition-all duration-300"><td className="border-r border-purple-100 p-4 text-center text-sm md:text-base font-medium text-purple-700">{employee.emp_id}</td><td className="border-r border-purple-100 p-4 text-center text-sm md:text-base">{`${employee.first_name || ''} ${employee.last_name || ''}`.trim()}</td><td className="border-r border-purple-100 p-4 text-center text-sm md:text-base">{employee.designation || 'N/A'}</td><td className="border-r border-purple-100 p-4 text-center text-sm md:text-base"><span className="text-purple-700 text-sm">{employee.department?.department_name || 'N/A'}</span></td><td className="border-r border-purple-100 p-4 text-center text-sm md:text-base">{employee.current_line?.line_name || 'N/A'}</td><td className="border-r border-purple-100 p-4 text-center text-sm md:text-base">{employee.current_station?.station_name || 'N/A'}</td><td className="border-r border-purple-100 p-4 text-center text-sm md:text-base">{new Date(employee.date_of_joining).toLocaleDateString()}</td><td className="border-r border-purple-100 p-4 text-center text-sm md:text-base"><span className={`text-sm ${employee.sex === 'M' ? 'text-blue-700' : employee.sex === 'F' ? 'text-purple-700' : 'text-gray-700'}`}>{employee.sex === 'M' ? 'Male' : employee.sex === 'F' ? 'Female' : 'N/A'}</span></td><td className="border-r border-purple-100 p-4 text-center text-sm md:text-base text-blue-600">{employee.email}</td><td className="border-r border-purple-100 p-4 text-center text-sm md:text-base last:border-r-0">{employee.phone}</td><td className="p-4 text-center text-sm md:text-base"><div className="flex justify-center items-center gap-2"><Button onClick={() => onEdit(employee)} variant="tertiary" className="text-purple-600 hover:text-purple-800 font-semibold px-3 py-1">Edit</Button><Button onClick={() => onDelete(employee)} variant="tertiary" className="text-red-600 hover:text-red-800 font-semibold px-3 py-1">Delete</Button></div></td></tr>);
// // const DesktopTableColumns = [{ key: 'emp_id', header: 'Employee ID' }, { key: 'name', header: 'Name' }, { key: 'department', header: 'Department' }, { key: 'current_line', header: 'Line' }, { key: 'current_station', header: 'Station' }, { key: 'date_of_joining', header: 'Join Date' }, { key: 'sex', header: 'Gender' }, { key: 'email', header: 'Email' }, { key: 'phone', header: 'Phone' }, { key: 'actions', header: 'Actions' }];
// const DesktopTableColumns = [{ key: 'emp_id', header: 'Employee ID' }, { key: 'name', header: 'Name' }, { key: 'designation', header: 'Designation' }, { key: 'department', header: 'Department' }, { key: 'current_line', header: 'Line' }, { key: 'current_station', header: 'Station' }, { key: 'date_of_joining', header: 'Join Date' }, { key: 'sex', header: 'Gender' }, { key: 'email', header: 'Email' }, { key: 'phone', header: 'Phone' }, { key: 'actions', header: 'Actions' }];
// // const EmployeeTable = ({ employees, isMobile, onEdit, onDelete }: { employees: Employee[]; isMobile: boolean; onEdit: (employee: Employee) => void; onDelete: (employee: Employee) => void; }) => { const mobileColumns = [{ key: 'emp_id', header: 'Emp ID' }, { key: 'name', header: 'Name' }, { key: 'location', header: 'Location' }, { key: 'sex', header: 'Gender' }, { key: 'actions', header: 'Actions' }]; return (<div className="mt-4 md:mt-6 w-full rounded-2xl overflow-hidden shadow-2xl bg-white"><div className="overflow-x-auto"><table className="w-full border-collapse font-sans"><TableHeader columns={isMobile ? mobileColumns : DesktopTableColumns} /><tbody>{employees.map((emp) => (isMobile ? (<MobileTableRow key={`mobile-${emp.emp_id}`} employee={emp} columns={mobileColumns} onEdit={onEdit} onDelete={onDelete} />) : (<DesktopTableRow key={`desktop-${emp.emp_id}`} employee={emp} onEdit={onEdit} onDelete={onDelete} />)))}</tbody></table></div></div>); };
// const EmployeeTable = ({ employees, isMobile, onEdit, onDelete }: { employees: Employee[]; isMobile: boolean; onEdit: (employee: Employee) => void; onDelete: (employee: Employee) => void; }) => { const mobileColumns = [{ key: 'emp_id', header: 'Emp ID' }, { key: 'name', header: 'Name' }, { key: 'location', header: 'Location' }, { key: 'sex', header: 'Gender' }, { key: 'actions', header: 'Actions' }]; return (<div className="mt-4 md:mt-6 w-full rounded-2xl overflow-hidden shadow-2xl bg-white"><div className="overflow-x-auto"><table className="w-full border-collapse font-sans"><TableHeader columns={isMobile ? mobileColumns : DesktopTableColumns} /><tbody>{employees.map((emp) => (isMobile ? (<MobileTableRow key={`mobile-${emp.emp_id}`} employee={emp} columns={mobileColumns} onEdit={onEdit} onDelete={onDelete} />) : (<DesktopTableRow key={`desktop-${emp.emp_id}`} employee={emp} onEdit={onEdit} onDelete={onDelete} />)))}</tbody></table></div></div>); };

// // --- Main Component ---
// const MasterTable = () => {
//     const [employees, setEmployees] = useState<Employee[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");
//     const [isMobile, setIsMobile] = useState(false);
//     const [searchQuery, setSearchQuery] = useState("");
//     const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
//     const [selectedSex, setSelectedSex] = useState("All Genders");
//     const [selectedLine, setSelectedLine] = useState("All Lines");
//     const [selectedStation, setSelectedStation] = useState("All Stations");
//     const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
//     const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
//     const [deleteStep, setDeleteStep] = useState(0);

//     const loadEmployees = async () => {
//         try {
//             setLoading(true);
//             const url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.EMPLOYEES_UI_LIST}`;
//             const response = await axios.get(url);
//             setEmployees(response.data);
//             setError("");
//         } catch (err: any) {
//             console.error('Error loading employees:', err);
//             setError(err.message || "Failed to load employee data");
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         loadEmployees();
//     }, []);

//     useEffect(() => {
//         const checkScreenSize = () => setIsMobile(window.innerWidth < 1024);
//         checkScreenSize();
//         window.addEventListener('resize', checkScreenSize);
//         return () => window.removeEventListener('resize', checkScreenSize);
//     }, []);
    
//     // --- 2. ADDED useEffects TO RESET CHILD FILTERS ---
//     useEffect(() => {
//         setSelectedLine("All Lines");
//     }, [selectedDepartment]);

//     useEffect(() => {
//         setSelectedStation("All Stations");
//     }, [selectedDepartment, selectedLine]);

//     const handleDepartmentChange = (event: React.ChangeEvent<HTMLSelectElement>) => setSelectedDepartment(event.target.value);
//     // const handleDesignationChange = (event: React.ChangeEvent<HTMLSelectElement>) => setSelectedDesignation(event.target.value); 
//     const handleSexChange = (event: React.ChangeEvent<HTMLSelectElement>) => setSelectedSex(event.target.value);
//     const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value);
//     const handleLineChange = (event: React.ChangeEvent<HTMLSelectElement>) => setSelectedLine(event.target.value);
//     const handleStationChange = (event: React.ChangeEvent<HTMLSelectElement>) => setSelectedStation(event.target.value);

//     const handleOpenEditModal = (employee: Employee) => setEditingEmployee(employee);
//     const handleCloseEditModal = () => setEditingEmployee(null);
//     const handleInitiateDelete = (employee: Employee) => { setDeletingEmployee(employee); setDeleteStep(1); };
//     const handleCancelDelete = () => { setDeletingEmployee(null); setDeleteStep(0); };
//     const handleAdvanceToDeleteStep2 = () => setDeleteStep(2);
    
//     const handleSaveChanges = async (updatedEmployeeData: any) => {
//         if (!editingEmployee) return;
//         try {
//             const url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.EMPLOYEE_DETAIL(editingEmployee.emp_id)}`;
//             const payload = { ...updatedEmployeeData, department: updatedEmployeeData.department?.department_id ?? updatedEmployeeData.department };
//             await axios.put(url, payload);
//             await loadEmployees();
//             handleCloseEditModal();
//         } catch (error) { console.error("Failed to update employee:", error); throw error; }
//     };

//     const handleFinalDelete = async () => {
//         if (!deletingEmployee) return;
//         try {
//             const url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.EMPLOYEE_DETAIL(deletingEmployee.emp_id)}`;
//             await axios.delete(url);
//             setEmployees(prev => prev.filter(emp => emp.emp_id !== deletingEmployee.emp_id));
//             handleCancelDelete();
//         } catch (error) { console.error("Failed to delete employee:", error); alert("Could not delete the employee."); throw error; }
//     };

//     // --- 3. UPDATED OPTION GENERATION LOGIC ---
//     const departmentOptions = useMemo(() => ["All Departments", ...Array.from(new Set(employees.map(emp => emp.department?.department_name).filter((d): d is string => !!d)))], [employees]);
//     const sexOptions = ["All Genders", "Male", "Female", "Other"];

//     const lineOptions = useMemo(() => {
//         if (selectedDepartment === "All Departments") return ["All Lines"];
//         const linesInDept = employees
//             .filter(emp => emp.department?.department_name === selectedDepartment)
//             .map(emp => emp.current_line?.line_name)
//             .filter((l): l is string => !!l);
//         return ["All Lines", ...Array.from(new Set(linesInDept))];
//     }, [employees, selectedDepartment]);

//     const stationOptions = useMemo(() => {
//         let relevantEmployees = employees;
//         if (selectedDepartment !== "All Departments") {
//             relevantEmployees = relevantEmployees.filter(emp => emp.department?.department_name === selectedDepartment);
//         }
//         if (selectedLine !== "All Lines") {
//             relevantEmployees = relevantEmployees.filter(emp => emp.current_line?.line_name === selectedLine);
//         }
//         if (relevantEmployees.length === 0) return ["All Stations"];
//         const stationsInScope = relevantEmployees.map(emp => emp.current_station?.station_name).filter((s): s is string => !!s);
//         return ["All Stations", ...Array.from(new Set(stationsInScope))];
//     }, [employees, selectedDepartment, selectedLine]);

//     // --- 4. UPDATED FINAL FILTERING LOGIC ---
//     const filteredEmployees = useMemo(() => employees.filter(emp => {
//         const departmentMatch = selectedDepartment === "All Departments" || emp.department?.department_name === selectedDepartment;
//         const lineMatch = selectedLine === "All Lines" || emp.current_line?.line_name === selectedLine;
//         const stationMatch = selectedStation === "All Stations" || emp.current_station?.station_name === selectedStation;
//         const sexMatch = selectedSex === "All Genders" || (selectedSex === "Male" && emp.sex === 'M') || (selectedSex === "Female" && emp.sex === 'F') || (selectedSex === "Other" && (emp.sex === 'O' || !emp.sex));
        
//         if (!departmentMatch || !sexMatch || !lineMatch || !stationMatch) return false;

//         const q = searchQuery.trim().toLowerCase();
//         if (!q) return true;
        
//         const haystack = [ `${emp.first_name || ''} ${emp.last_name || ''}`, emp.emp_id, emp.email, emp.phone, emp.department?.department_name, emp.current_line?.line_name, emp.current_station?.station_name ].filter(Boolean).join(" ").toLowerCase();
//         return haystack.includes(q);
//     }), [employees, selectedDepartment, selectedLine, selectedStation, selectedSex, searchQuery]);

//     if (loading) return <LoadingState />;
//     if (error) return (<div className="min-h-[400px] flex items-center justify-center p-8"><div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"><div className="text-center"><div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4"><svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><ErrorMessage message={error} /><Button onClick={loadEmployees} variant="primary" className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 ...">Retry</Button></div></div></div>);

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
//             <div className="w-full px-4 md:px-8 py-4 md:py-8">
//                 <PageHeader title="Employee Master" />
//                 <FilterControls 
//                     selectedDepartment={selectedDepartment} onDepartmentChange={handleDepartmentChange} departmentOptions={departmentOptions}
//                     selectedLine={selectedLine} onLineChange={handleLineChange} lineOptions={lineOptions}
//                     selectedStation={selectedStation} onStationChange={handleStationChange} stationOptions={stationOptions}
//                     selectedSex={selectedSex} onSexChange={handleSexChange} sexOptions={sexOptions}
//                     searchQuery={searchQuery} onSearchChange={handleSearchChange} 
//                 />
//                 <div className="mb-4 flex items-center justify-between"><p className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{filteredEmployees.length} {filteredEmployees.length === 1 ? 'Employee' : 'Employees'} Found</p><Button onClick={loadEmployees} variant="secondary" className="bg-white ..."><svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>Refresh</Button></div>
//                 <EmployeeTable employees={filteredEmployees} isMobile={isMobile} onEdit={handleOpenEditModal} onDelete={handleInitiateDelete} />
//                 {editingEmployee && (<EditEmployeeModal employee={editingEmployee} onClose={handleCloseEditModal} onSave={handleSaveChanges} />)}
//                 {deletingEmployee && (<DeleteConfirmationModal employee={deletingEmployee} step={deleteStep} onClose={handleCancelDelete} onConfirmStep1={handleAdvanceToDeleteStep2} onConfirmFinal={handleFinalDelete} />)}
//                 {filteredEmployees.length === 0 && (<div className="text-center mt-12 p-8"><div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full mb-6"><svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><p className="text-xl text-gray-600 mb-6">No employees found matching your criteria.</p><Button onClick={() => { setSelectedDepartment("All Departments"); setSelectedLine("All Lines"); setSelectedStation("All Stations"); setSelectedSex("All Genders"); setSearchQuery(""); }} variant="secondary" className="bg-gradient-to-r from-purple-600 to-blue-600 ...">Clear All Filters</Button></div>)}
//             </div>
//         </div>
//     );
// };

// export default MasterTable;



import { useState, useEffect, useMemo } from "react";
import { ErrorMessage } from "../../molecules/ErrorMessage/ErrorMessage";
import { Button } from "../../atoms/Buttons/Button";
import axios from "axios";
import { API_ENDPOINTS } from "../../constants/api";
import { EditEmployeeModal } from "./EditEmployeeModal";
import { DeleteConfirmationModal } from "./DeleteConformationModal";

// --- Type Definition ---
export interface Employee {
    emp_id: string;
    first_name: string;
    last_name: string;
    date_of_joining: string;
    birth_date: string | null;
    sex: 'M' | 'F' | 'O' | null;
    email: string;
    designation: string | null; 
    phone: string;
    department: { department_id: number; department_name: string } | null;
    current_line: { line_id: number; line_name: string } | null;
    current_station: { station_id: number; station_name: string } | null;
}

// --- Sub-components ---
const PageHeader = ({ title }: { title: string }) => (<h1 className="text-3xl md:text-5xl font-bold mb-6 md:mb-8 text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{title}</h1>);

const LoadingState = () => (<div className="flex items-center justify-center min-h-[400px]"><div className="text-center"><div className="inline-flex items-center justify-center w-16 h-16 mb-4"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div></div><p className="text-lg text-gray-600">Loading employee data...</p></div></div>);

const FilterSelect = ({ value, onChange, options, className = "" }: { value: string; onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void; options: string[]; className?: string; }) => (
    <select value={value} onChange={onChange} className={`px-4 py-3 rounded-xl border-2 border-purple-200 bg-white text-sm md:text-base w-full md:w-auto outline-none shadow-lg hover:border-purple-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-300 ${className}`}> 
        {/* The (options || []) part prevents crashes if options is undefined */}
        {(options || []).map((option) => (<option key={option} value={option}>{option}</option>))} 
    </select>
);

const SearchInput = ({ value, onChange, placeholder }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string; }) => (<div className="relative"><input type="text" value={value} onChange={onChange} placeholder={placeholder} className="w-full px-4 py-3 pl-12 rounded-xl border-2 border-blue-200 bg-white text-sm md:text-base outline-none shadow-lg hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300" /><svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>);

const FilterControls = ({
    selectedDepartment, onDepartmentChange, departmentOptions,
    selectedLine, onLineChange, lineOptions,
    selectedStation, onStationChange, stationOptions,
    selectedSex, onSexChange, sexOptions,
    searchQuery, onSearchChange
}: any) => (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-2xl shadow-xl mb-6 md:mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="flex flex-col md:flex-row gap-4 md:col-span-2">
                <FilterSelect value={selectedDepartment} onChange={onDepartmentChange} options={departmentOptions} />
                <FilterSelect value={selectedLine} onChange={onLineChange} options={lineOptions} />
                <FilterSelect value={selectedStation} onChange={onStationChange} options={stationOptions} />
                <FilterSelect value={selectedSex} onChange={onSexChange} options={sexOptions} />
            </div>
            <div className="w-full">
                <SearchInput value={searchQuery} onChange={onSearchChange} placeholder="Search name, ID, location..." />
            </div>
        </div>
    </div>
);

const TableHeader = ({ columns }: { columns: Array<{ key: string; header: string }> }) => (<thead><tr className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">{columns.map(col => (<th key={col.key} className="p-4 text-center text-sm md:text-base font-semibold border-r border-purple-500 last:border-r-0">{col.header}</th>))}</tr></thead>);

const MobileTableRow = ({ employee, columns, onEdit, onDelete }: { employee: Employee; columns: Array<{ key: string; header: string }>; onEdit: (employee: Employee) => void; onDelete: (employee: Employee) => void; }) => (<tr className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 even:bg-gradient-to-r even:from-purple-50/50 even:to-blue-50/50 border-b border-purple-100 last:border-b-0 transition-all duration-300">{columns.map(col => (<td key={`${employee.emp_id}-${col.key}`} className="border-r border-purple-100 p-3 text-center text-sm last:border-r-0">{col.key === 'emp_id' && employee.emp_id}{col.key === 'name' && `${employee.first_name || ''} ${employee.last_name || ''}`.trim()}{col.key === 'location' && (<div className="text-xs text-left"><div><strong>Desig:</strong> {employee.designation || 'N/A'}</div><div><strong>Dept:</strong> {employee.department?.department_name || 'N/A'}</div><div><strong>Line:</strong> {employee.current_line?.line_name || 'N/A'}</div><div><strong>Station:</strong> {employee.current_station?.station_name || 'N/A'}</div></div>)}{col.key === 'sex' && (employee.sex === 'M' ? 'Male' : employee.sex === 'F' ? 'Female' : 'N/A')}</td>))}<td className="border-r border-purple-100 p-3 text-center text-sm last:border-r-0"><div className="flex flex-col gap-2">
    <Button onClick={() => onEdit(employee)} variant="tertiary" className="text-purple-600 hover:text-purple-800 font-semibold text-xs px-2 py-1">Edit</Button>
    <Button onClick={() => onDelete(employee)} variant="tertiary" className="text-red-600 hover:text-red-800 font-semibold text-xs px-2 py-1">Delete</Button>
    </div></td></tr>);

const DesktopTableRow = ({ employee, onEdit, onDelete }: { employee: Employee; onEdit: (employee: Employee) => void; onDelete: (employee: Employee) => void; }) => (<tr className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 even:bg-gradient-to-r even:from-purple-50/50 even:to-blue-50/50 border-b border-purple-100 last:border-b-0 transition-all duration-300"><td className="border-r border-purple-100 p-4 text-center text-sm md:text-base font-medium text-purple-700">{employee.emp_id}</td><td className="border-r border-purple-100 p-4 text-center text-sm md:text-base">{`${employee.first_name || ''} ${employee.last_name || ''}`.trim()}</td><td className="border-r border-purple-100 p-4 text-center text-sm md:text-base">{employee.designation || 'N/A'}</td><td className="border-r border-purple-100 p-4 text-center text-sm md:text-base"><span className="text-purple-700 text-sm">{employee.department?.department_name || 'N/A'}</span></td><td className="border-r border-purple-100 p-4 text-center text-sm md:text-base">{employee.current_line?.line_name || 'N/A'}</td><td className="border-r border-purple-100 p-4 text-center text-sm md:text-base">{employee.current_station?.station_name || 'N/A'}</td><td className="border-r border-purple-100 p-4 text-center text-sm md:text-base">{new Date(employee.date_of_joining).toLocaleDateString()}</td><td className="border-r border-purple-100 p-4 text-center text-sm md:text-base"><span className={`text-sm ${employee.sex === 'M' ? 'text-blue-700' : employee.sex === 'F' ? 'text-purple-700' : 'text-gray-700'}`}>{employee.sex === 'M' ? 'Male' : employee.sex === 'F' ? 'Female' : 'N/A'}</span></td><td className="border-r border-purple-100 p-4 text-center text-sm md:text-base text-blue-600">{employee.email}</td><td className="border-r border-purple-100 p-4 text-center text-sm md:text-base last:border-r-0">{employee.phone}</td>
<td className="p-4 text-center text-sm md:text-base"><div className="flex justify-center items-center gap-2"><Button onClick={() => onEdit(employee)} variant="tertiary" className="text-purple-600 hover:text-purple-800 font-semibold px-3 py-1">Edit</Button><Button onClick={() => onDelete(employee)} variant="tertiary" className="text-red-600 hover:text-red-800 font-semibold px-3 py-1">Delete</Button></div></td>
</tr>);

const DesktopTableColumns = [{ key: 'emp_id', header: 'Employee ID' }, { key: 'name', header: 'Name' }, { key: 'designation', header: 'Designation' }, { key: 'department', header: 'Department' }, { key: 'current_line', header: 'Line' }, { key: 'current_station', header: 'Station' }, { key: 'date_of_joining', header: 'Join Date' }, { key: 'sex', header: 'Gender' }, { key: 'email', header: 'Email' }, { key: 'phone', header: 'Phone' }, { key: 'actions', header: 'Actions' } ];

const EmployeeTable = ({ employees, isMobile, onEdit, onDelete }: { employees: Employee[]; isMobile: boolean; onEdit: (employee: Employee) => void; onDelete: (employee: Employee) => void; }) => { const mobileColumns = [{ key: 'emp_id', header: 'Emp ID' }, { key: 'name', header: 'Name' }, { key: 'location', header: 'Location' }, { key: 'sex', header: 'Gender' },  { key: 'actions', header: 'Actions' }]; return (<div className="mt-4 md:mt-6 w-full rounded-2xl overflow-hidden shadow-2xl bg-white"><div className="overflow-x-auto"><table className="w-full border-collapse font-sans"><TableHeader columns={isMobile ? mobileColumns : DesktopTableColumns} /><tbody>{employees.map((emp) => (isMobile ? (<MobileTableRow key={`mobile-${emp.emp_id}`} employee={emp} columns={mobileColumns} onEdit={onEdit} onDelete={onDelete} />) : (<DesktopTableRow key={`desktop-${emp.emp_id}`} employee={emp} onEdit={onEdit} onDelete={onDelete} />)))}</tbody></table></div></div>); };

const PaginationControls = ({ currentPage, totalItems, itemsPerPage, onPageChange }: { currentPage: number; totalItems: number; itemsPerPage: number; onPageChange: (page: number) => void;}) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    const handlePrev = () => onPageChange(currentPage - 1);
    const handleNext = () => onPageChange(currentPage + 1);

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white border-t border-gray-200 rounded-b-2xl shadow-lg">
            <div>
                <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of{' '}
                    <span className="font-medium">{totalItems}</span> results
                </p>
            </div>
            <div className="flex items-center gap-2">
                 <Button onClick={handlePrev} disabled={currentPage === 1} variant="secondary">
                    Previous
                </Button>
                <span className="text-sm text-gray-500 font-semibold">
                    Page {currentPage} of {totalPages}
                </span>
                <Button onClick={handleNext} disabled={currentPage === totalPages} variant="secondary">
                    Next
                </Button>
            </div>
        </div>
    );
};


// --- Main Component ---
const MasterTable = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isMobile, setIsMobile] = useState(false);
    
    // Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
    const [selectedSex, setSelectedSex] = useState("All Genders");
    const [selectedLine, setSelectedLine] = useState("All Lines");
    const [selectedStation, setSelectedStation] = useState("All Stations");

    // Modal State
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
    const [deleteStep, setDeleteStep] = useState(0);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 25;

    const loadEmployees = async () => {
        try {
            setLoading(true);
            const url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.EMPLOYEES_UI_LIST}`;
            const response = await axios.get(url);
            setEmployees(response.data);
            setError("");
        } catch (err: any) {
            console.error('Error loading employees:', err);
            setError(err.message || "Failed to load employee data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEmployees();
    }, []);

    useEffect(() => {
        const checkScreenSize = () => setIsMobile(window.innerWidth < 1024);
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);
    
    useEffect(() => {
        setSelectedLine("All Lines");
        setCurrentPage(1); 
    }, [selectedDepartment]);

    useEffect(() => {
        setSelectedStation("All Stations");
        setCurrentPage(1); 
    }, [selectedDepartment, selectedLine]);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedSex]);

    const handleDepartmentChange = (event: React.ChangeEvent<HTMLSelectElement>) => setSelectedDepartment(event.target.value);
    const handleSexChange = (event: React.ChangeEvent<HTMLSelectElement>) => setSelectedSex(event.target.value);
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value);
    const handleLineChange = (event: React.ChangeEvent<HTMLSelectElement>) => setSelectedLine(event.target.value);
    const handleStationChange = (event: React.ChangeEvent<HTMLSelectElement>) => setSelectedStation(event.target.value);
    const handleOpenEditModal = (employee: Employee) => setEditingEmployee(employee);
    const handleCloseEditModal = () => setEditingEmployee(null);
    const handleInitiateDelete = (employee: Employee) => { setDeletingEmployee(employee); setDeleteStep(1); };
    const handleCancelDelete = () => { setDeletingEmployee(null); setDeleteStep(0); };
    const handleAdvanceToDeleteStep2 = () => setDeleteStep(2);
    
    const handleSaveChanges = async (updatedEmployeeData: any) => {
        if (!editingEmployee) return;
        try {
            const url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.EMPLOYEE_DETAIL(editingEmployee.emp_id)}`;
            const payload = { ...updatedEmployeeData, department: updatedEmployeeData.department?.department_id ?? updatedEmployeeData.department };
            await axios.put(url, payload);
            await loadEmployees();
            handleCloseEditModal();
        } catch (error) { console.error("Failed to update employee:", error); throw error; }
    };

    const handleFinalDelete = async (deleteBiometric: boolean) => {
        if (!deletingEmployee) return;
        try {
            const url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.EMPLOYEE_DETAIL(deletingEmployee.emp_id)}` + (deleteBiometric ? "?delete_biometric=true" : "");
            await axios.delete(url);
            setEmployees(prev => prev.filter(emp => emp.emp_id !== deletingEmployee.emp_id));
            handleCancelDelete();
        } catch (error) { console.error("Failed to delete employee:", error); alert("Could not delete the employee."); throw error; }
    };

    const departmentOptions = useMemo(() => ["All Departments", ...Array.from(new Set(employees.map(emp => emp.department?.department_name).filter((d): d is string => !!d)))], [employees]);
    
    const sexOptions = ["All Genders", "Male", "Female", "Other"];

    const lineOptions = useMemo(() => {
        if (selectedDepartment === "All Departments") return ["All Lines"];
        const linesInDept = employees
            .filter(emp => emp.department?.department_name === selectedDepartment)
            .map(emp => emp.current_line?.line_name)
            .filter((l): l is string => !!l);
        return ["All Lines", ...Array.from(new Set(linesInDept))];
    }, [employees, selectedDepartment]);

    const stationOptions = useMemo(() => {
        if (selectedDepartment === "All Departments" && selectedLine === "All Lines") {
             return ["All Stations"];
        }
        let relevantEmployees = employees;
        if (selectedDepartment !== "All Departments") {
            relevantEmployees = relevantEmployees.filter(emp => emp.department?.department_name === selectedDepartment);
        }
        if (selectedLine !== "All Lines") {
            relevantEmployees = relevantEmployees.filter(emp => emp.current_line?.line_name === selectedLine);
        }
        if (relevantEmployees.length === 0) return ["All Stations"];
        const stationsInScope = relevantEmployees.map(emp => emp.current_station?.station_name).filter((s): s is string => !!s);
        return ["All Stations", ...Array.from(new Set(stationsInScope))];
    }, [employees, selectedDepartment, selectedLine]);


    const filteredEmployees = useMemo(() => employees
        .filter(emp => {
            const departmentMatch = selectedDepartment === "All Departments" || emp.department?.department_name === selectedDepartment;
            const lineMatch = selectedLine === "All Lines" || emp.current_line?.line_name === selectedLine;
            const stationMatch = selectedStation === "All Stations" || emp.current_station?.station_name === selectedStation;
            const sexMatch = selectedSex === "All Genders" || (selectedSex === "Male" && emp.sex === 'M') || (selectedSex === "Female" && emp.sex === 'F') || (selectedSex === "Other" && (emp.sex === 'O' || !emp.sex));
            
            if (!departmentMatch || !sexMatch || !lineMatch || !stationMatch) return false;

            const q = searchQuery.trim().toLowerCase();
            if (!q) return true;
            
            const haystack = [ `${emp.first_name || ''} ${emp.last_name || ''}`, emp.emp_id, emp.email, emp.phone, emp.department?.department_name, emp.current_line?.line_name, emp.current_station?.station_name ].filter(Boolean).join(" ").toLowerCase();
            return haystack.includes(q);
        })
        .sort((a, b) => new Date(b.date_of_joining).getTime() - new Date(a.date_of_joining).getTime()), 
    [employees, selectedDepartment, selectedLine, selectedStation, selectedSex, searchQuery]);

    const paginatedEmployees = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredEmployees.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredEmployees, currentPage]);

    if (loading) return <LoadingState />;
    if (error) return (<div className="min-h-[400px] flex items-center justify-center p-8"><div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"><div className="text-center"><div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4"><svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><ErrorMessage message={error} /><Button onClick={loadEmployees} variant="primary" className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 ...">Retry</Button></div></div></div>);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
            <div className="w-full px-4 md:px-8 py-4 md:py-8">
                <PageHeader title="Employee Master" />
                <FilterControls 
                    selectedDepartment={selectedDepartment} onDepartmentChange={handleDepartmentChange} departmentOptions={departmentOptions}
                    selectedLine={selectedLine} onLineChange={handleLineChange} lineOptions={lineOptions}
                    selectedStation={selectedStation} onStationChange={handleStationChange} stationOptions={stationOptions}
                    selectedSex={selectedSex} onSexChange={handleSexChange} sexOptions={sexOptions}
                    searchQuery={searchQuery} onSearchChange={handleSearchChange} 
                />
                <div className="mb-4 flex items-center justify-between"><p className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{filteredEmployees.length} {filteredEmployees.length === 1 ? 'Employee' : 'Employees'} Found</p><Button onClick={loadEmployees} variant="secondary" className="bg-white ..."><svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>Refresh</Button></div>
                
                <EmployeeTable employees={paginatedEmployees} isMobile={isMobile} onEdit={handleOpenEditModal} onDelete={handleInitiateDelete} />
                
                <PaginationControls 
                    currentPage={currentPage}
                    totalItems={filteredEmployees.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                />
                
                {editingEmployee && (<EditEmployeeModal employee={editingEmployee} onClose={handleCloseEditModal} onSave={handleSaveChanges} />)}
                {deletingEmployee && (<DeleteConfirmationModal employee={deletingEmployee} step={deleteStep} onClose={handleCancelDelete} onConfirmStep1={handleAdvanceToDeleteStep2} onConfirmFinal={handleFinalDelete} />)}
                
                {filteredEmployees.length === 0 && !loading && (<div className="text-center mt-12 p-8"><div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full mb-6"><svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><p className="text-xl text-gray-600 mb-6">No employees found matching your criteria.</p><Button onClick={() => { setSelectedDepartment("All Departments"); setSelectedLine("All Lines"); setSelectedStation("All Stations"); setSelectedSex("All Genders"); setSearchQuery(""); }} variant="secondary" className="bg-gradient-to-r from-purple-600 to-blue-600 ...">Clear All Filters</Button></div>)}
            </div>
        </div>
    );
};

export default MasterTable;