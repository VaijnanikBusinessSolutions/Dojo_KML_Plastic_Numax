// import { useState, useEffect } from "react";
// import type { Employee } from "../../../constants/types";
// import { Button } from "../../atoms/Buttons/Button";

// interface EditEmployeeModalProps {
//     employee: EmployeeData;
//     onClose: () => void;
//     onSave: (updatedEmployee: Employee) => Promise<void>;
// }

// // Helper to format date strings for the <input type="date"> element
// const formatDateForInput = (dateString: string | Date | undefined): string => {
//     if (!dateString) return "";
//     try {
//         // Create a date object. Handles both 'YYYY-MM-DD' and full ISO strings
//         const date = new Date(dateString);
//         // Adjust for timezone offset to prevent the date from shifting by one day
//         const userTimezoneOffset = date.getTimezoneOffset() * 60000;
//         return new Date(date.getTime() - userTimezoneOffset).toISOString().split('T')[0];
//     } catch (error) {
//         console.error("Invalid date for formatting:", dateString);
//         return "";
//     }
// };

// export const EditEmployeeModal = ({ employee, onClose, onSave }: EditEmployeeModalProps) => {
//     const [formData, setFormData] = useState<Employee>(employee);
//     const [isSaving, setIsSaving] = useState(false);

//     useEffect(() => {
//         setFormData(employee);
//     }, [employee]);

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     };

//     const handleSave = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setIsSaving(true);
//         try {
//             // Your backend expects the department ID, not the name, for PUT requests.
//             // Let's create a copy of the form data and set 'department' to the employee's department ID.
//             const payload = { 
//                 ...formData,
//                 department: employee.department // Use the original department ID for the save payload
//             };
//             await onSave(payload);
//             onClose(); 
//         } catch (error) {
//             console.error("Failed to save employee:", error);
//             alert("Failed to save changes. Please try again.");
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 md:p-8 relative animate-fade-in-up">
//                 <button
//                     onClick={onClose}
//                     className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
//                     aria-label="Close modal"
//                 >
//                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                 </button>
//                 <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Employee</h2>

//                 <form onSubmit={handleSave} className="space-y-4">
//                     {/* --- Basic Info --- */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
//                             <input type="text" name="first_name" value={formData.first_name || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500" />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
//                             <input type="text" name="last_name" value={formData.last_name || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500" />
//                         </div>
//                     </div>
//                     {/* --- Contact Info --- */}
//                     <div>
//                         <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
//                         <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500" />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
//                         <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500" />
//                     </div>
                    
//                     {/* --- NEW: Date Fields --- */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-600 mb-1">Birth Date</label>
//                             <input type="date" name="birth_date" value={formatDateForInput(formData.birth_date)} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500" />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-600 mb-1">Join Date</label>
//                             <input type="date" name="date_of_joining" value={formatDateForInput(formData.date_of_joining)} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500" />
//                         </div>
//                     </div>
                    
//                     {/* --- NEW: Gender and Department --- */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
//                             <select name="sex" value={formData.sex || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 bg-white">
//                                 <option value="">Not Specified</option>
//                                 <option value="M">Male</option>
//                                 <option value="F">Female</option>
//                                 <option value="O">Other</option>
//                             </select>
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-600 mb-1">Department</label>
//                             {/* Department is read-only here. Making it editable would require fetching a list of departments */}
//                             <input type="text" name="department_name" value={formData.department_name || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100" readOnly />
//                         </div>
//                     </div>

//                     {/* --- Action Buttons --- */}
//                     <div className="flex justify-end gap-4 pt-4">
//                         <Button type="button" onClick={onClose} variant="secondary" className="px-6 py-2">
//                             Cancel
//                         </Button>
//                         <Button type="submit" variant="primary" className="px-6 py-2" disabled={isSaving}>
//                             {isSaving ? 'Saving...' : 'Save Changes'}
//                         </Button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };



import { useState, useEffect } from "react";
// I am defining the interface here based on your JSON response so you can copy it to your types file if needed
import { Button } from "../../atoms/Buttons/Button";

// --- TYPE DEFINITION BASED ON YOUR API JSON ---
export interface Employee {
    emp_id: string;
    first_name: string;
    last_name: string;
    department: number | null;      // The ID (e.g., 12)
    department_name?: string;       // The Name (e.g., "Quality")
    designation: string | null;     // (e.g., null or "Engineer")
    date_of_joining: string;
    birth_date: string;
    sex: string;
    email: string;
    phone: string;
}

interface EditEmployeeModalProps {
    employee: Employee;
    onClose: () => void;
    onSave: (updatedEmployee: Employee) => Promise<void>;
}

// Helper to format date strings for input
const formatDateForInput = (dateString: string | Date | undefined | null): string => {
    if (!dateString) return "";
    try {
        const date = new Date(dateString);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - userTimezoneOffset).toISOString().split('T')[0];
    } catch (error) {
        return "";
    }
};

export const EditEmployeeModal = ({ employee, onClose, onSave }: EditEmployeeModalProps) => {
    const [formData, setFormData] = useState<Employee>(employee);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData(employee);
    }, [employee]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // We pass the whole object back. 
            // Note: Since department_name is read-only, the ID (formData.department) remains unchanged.
            await onSave(formData);
            onClose(); 
        } catch (error) {
            console.error("Failed to save employee:", error);
            alert("Failed to save changes.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 md:p-8 relative animate-fade-in-up">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Employee Details</h2>

                <form onSubmit={handleSave} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                    
                    {/* --- Row 1: Employee ID (Read Only) & Designation --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Employee ID</label>
                            <input 
                                type="text" 
                                name="emp_id" 
                                value={formData.emp_id || ''} 
                                readOnly 
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Designation</label>
                            <input 
                                type="text" 
                                name="designation" 
                                value={formData.designation || ''} 
                                onChange={handleChange} 
                                placeholder="e.g. Engineer"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500" 
                            />
                        </div>
                    </div>

                    {/* --- Row 2: Names --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
                            <input type="text" name="first_name" value={formData.first_name || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
                            <input type="text" name="last_name" value={formData.last_name || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500" />
                        </div>
                    </div>

                    {/* --- Row 3: Contact --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                            <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                            <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500" />
                        </div>
                    </div>

                    {/* --- Row 4: Department & Gender --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Department</label>
                           
                            <input 
                                type="text" 
                                name="department_name" 
                                value={formData.department_name || ''} 
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed" 
                            />
                        </div> */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
                            <select name="sex" value={formData.sex || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 bg-white">
                                <option value="">Not Specified</option>
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                                <option value="O">Other</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* --- Row 5: Dates --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Birth Date</label>
                            <input type="date" name="birth_date" value={formatDateForInput(formData.birth_date)} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Join Date</label>
                            <input type="date" name="date_of_joining" value={formatDateForInput(formData.date_of_joining)} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <Button type="button" onClick={onClose} variant="secondary" className="px-6 py-2">
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" className="px-6 py-2" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};