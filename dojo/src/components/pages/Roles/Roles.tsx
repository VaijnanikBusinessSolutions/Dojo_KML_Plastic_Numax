// import React, { useState, useMemo } from 'react';
// import { Search, Filter, Plus, Mail, Phone, Building, Users, Shield, Star, Briefcase, MapPin } from 'lucide-react';

// interface Employee {
//   id: string;
//   firstName: string;
//   lastName: string;
//   employeeId: string;
//   email: string;
//   phoneNumber: string;
//   factory: string;
//   department: string;
//   role: string;
//   avatar?: string;
// }

// const sampleEmployees: Employee[] = [
//   {
//     id: '1',
//     firstName: 'John',
//     lastName: 'Doe',
//     employeeId: 'EMP001',
//     email: 'john.doe@company.com',
//     phoneNumber: '+1 (555) 123-4567',
//     factory: 'Factory A',
//     department: 'Engineering',
//     role: 'Senior Developer'
//   },
//   {
//     id: '2',
//     firstName: 'Jane',
//     lastName: 'Smith',
//     employeeId: 'EMP002',
//     email: 'jane.smith@company.com',
//     phoneNumber: '+1 (555) 234-5678',
//     factory: 'Factory B',
//     department: 'Marketing',
//     role: 'Marketing Manager'
//   },
//   {
//     id: '3',
//     firstName: 'Mike',
//     lastName: 'Johnson',
//     employeeId: 'EMP003',
//     email: 'mike.johnson@company.com',
//     phoneNumber: '+1 (555) 345-6789',
//     factory: 'Factory A',
//     department: 'Engineering',
//     role: 'Frontend Developer'
//   },
//   {
//     id: '4',
//     firstName: 'Sarah',
//     lastName: 'Williams',
//     employeeId: 'EMP004',
//     email: 'sarah.williams@company.com',
//     phoneNumber: '+1 (555) 456-7890',
//     factory: 'Factory C',
//     department: 'HR',
//     role: 'HR Specialist'
//   },
//   {
//     id: '5',
//     firstName: 'Robert',
//     lastName: 'Brown',
//     employeeId: 'EMP005',
//     email: 'robert.brown@company.com',
//     phoneNumber: '+1 (555) 567-8901',
//     factory: 'Factory B',
//     department: 'Operations',
//     role: 'Operations Manager'
//   },
//   {
//     id: '6',
//     firstName: 'Emily',
//     lastName: 'Davis',
//     employeeId: 'EMP006',
//     email: 'emily.davis@company.com',
//     phoneNumber: '+1 (555) 678-9012',
//     factory: 'Factory A',
//     department: 'Finance',
//     role: 'Financial Analyst'
//   },
//   {
//     id: '7',
//     firstName: 'David',
//     lastName: 'Wilson',
//     employeeId: 'EMP007',
//     email: 'david.wilson@company.com',
//     phoneNumber: '+1 (555) 789-0123',
//     factory: 'Factory C',
//     department: 'Engineering',
//     role: 'Backend Developer'
//   },
//   {
//     id: '8',
//     firstName: 'Lisa',
//     lastName: 'Martinez',
//     employeeId: 'EMP008',
//     email: 'lisa.martinez@company.com',
//     phoneNumber: '+1 (555) 890-1234',
//     factory: 'Factory B',
//     department: 'Quality Assurance',
//     role: 'QA Engineer'
//   }
// ];

// const EmployeeTable: React.FC = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedDepartment, setSelectedDepartment] = useState('');
//   const [selectedFactory, setSelectedFactory] = useState('');
//   const [selectedRole, setSelectedRole] = useState('');

//   // Get unique values for filter options
//   const departments = useMemo(() => 
//     [...new Set(sampleEmployees.map(emp => emp.department))].sort(),
//     []
//   );
  
//   const factories = useMemo(() => 
//     [...new Set(sampleEmployees.map(emp => emp.factory))].sort(),
//     []
//   );
  
//   const roles = useMemo(() => 
//     [...new Set(sampleEmployees.map(emp => emp.role))].sort(),
//     []
//   );

//   // Filter employees based on search and filters
//   const filteredEmployees = useMemo(() => {
//     return sampleEmployees.filter(employee => {
//       const matchesSearch = searchTerm === '' || 
//         employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
      
//       const matchesDepartment = selectedDepartment === '' || employee.department === selectedDepartment;
//       const matchesFactory = selectedFactory === '' || employee.factory === selectedFactory;
//       const matchesRole = selectedRole === '' || employee.role === selectedRole;
      
//       return matchesSearch && matchesDepartment && matchesFactory && matchesRole;
//     });
//   }, [searchTerm, selectedDepartment, selectedFactory, selectedRole]);

//   const clearFilters = () => {
//     setSearchTerm('');
//     setSelectedDepartment('');
//     setSelectedFactory('');
//     setSelectedRole('');
//   };

//   const getInitials = (firstName: string, lastName: string) => {
//     return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
//   };

//   const getDepartmentColor = (department: string) => {
//     const colors = {
//       'Engineering': 'bg-blue-100 text-blue-700 border-blue-200',
//       'Marketing': 'bg-purple-100 text-purple-700 border-purple-200',
//       'HR': 'bg-pink-100 text-pink-700 border-pink-200',
//       'Operations': 'bg-orange-100 text-orange-700 border-orange-200',
//       'Finance': 'bg-green-100 text-green-700 border-green-200',
//       'Quality Assurance': 'bg-indigo-100 text-indigo-700 border-indigo-200'
//     };
//     return colors[department as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200';
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
//       {/* Background Pattern */}
//       <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
//       <div className="relative z-10 p-4 md:p-6 lg:p-8">
//         <div className="max-w-7xl mx-auto">
//           {/* Header Section */}
//           <div className="mb-8">
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
//               <div className="text-center sm:text-left">
//                 <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
//                   <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
//                     <Users className="w-8 h-8 text-white" />
//                   </div>
//                   <div>
//                     <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
//                       Employee Directory
//                     </h1>
//                     <div className="flex items-center gap-2 mt-1">
//                       <Star className="w-4 h-4 text-yellow-500 fill-current" />
//                       <p className="text-gray-600 font-medium">Premium Role Management System</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <button className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl">
//                 <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
//                 <Plus className="relative w-5 h-5 mr-3" />
//                 <span className="relative">Add New Employee</span>
//               </button>
//             </div>
//           </div>

//           {/* Stats Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//             <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Total Employees</p>
//                   <p className="text-3xl font-bold text-gray-900">{sampleEmployees.length}</p>
//                 </div>
//                 <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
//                   <Users className="w-6 h-6 text-white" />
//                 </div>
//               </div>
//             </div>
//             <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Unique Roles</p>
//                   <p className="text-3xl font-bold text-emerald-600">{roles.length}</p>
//                 </div>
//                 <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl">
//                   <Shield className="w-6 h-6 text-white" />
//                 </div>
//               </div>
//             </div>
//             <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Departments</p>
//                   <p className="text-3xl font-bold text-purple-600">{departments.length}</p>
//                 </div>
//                 <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
//                   <Briefcase className="w-6 h-6 text-white" />
//                 </div>
//               </div>
//             </div>
//             <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Factories</p>
//                   <p className="text-3xl font-bold text-orange-600">{factories.length}</p>
//                 </div>
//                 <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl">
//                   <Building className="w-6 h-6 text-white" />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Search and Filter Section */}
//           <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-8 mb-8">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//               {/* Search Bar */}
//               <div className="lg:col-span-2">
//                 <div className="relative group">
//                   <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
//                   <div className="relative">
//                     <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6 group-hover:text-blue-500 transition-colors duration-200" />
//                     <input
//                       type="text"
//                       placeholder="Search by name or employee ID..."
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       className="w-full pl-12 pr-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 text-lg placeholder-gray-400 shadow-lg hover:shadow-xl"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Filter Options */}
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//                 <div className="group">
//                   <label className="block text-sm font-semibold text-gray-700 mb-3">
//                     <Building className="inline w-5 h-5 mr-2 text-blue-500" />
//                     Factory Location
//                   </label>
//                   <select
//                     value={selectedFactory}
//                     onChange={(e) => setSelectedFactory(e.target.value)}
//                     className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:border-blue-300"
//                   >
//                     <option value="">All Factories</option>
//                     {factories.map(factory => (
//                       <option key={factory} value={factory}>{factory}</option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="group">
//                   <label className="block text-sm font-semibold text-gray-700 mb-3">
//                     <Users className="inline w-5 h-5 mr-2 text-purple-500" />
//                     Department
//                   </label>
//                   <select
//                     value={selectedDepartment}
//                     onChange={(e) => setSelectedDepartment(e.target.value)}
//                     className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:border-purple-300"
//                   >
//                     <option value="">All Departments</option>
//                     {departments.map(dept => (
//                       <option key={dept} value={dept}>{dept}</option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="group">
//                   <label className="block text-sm font-semibold text-gray-700 mb-3">
//                     <Shield className="inline w-5 h-5 mr-2 text-emerald-500" />
//                     Role Position
//                   </label>
//                   <select
//                     value={selectedRole}
//                     onChange={(e) => setSelectedRole(e.target.value)}
//                     className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-300 focus:border-emerald-500 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:border-emerald-300"
//                   >
//                     <option value="">All Roles</option>
//                     {roles.map(role => (
//                       <option key={role} value={role}>{role}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               {/* Clear Filters & Results Count */}
//               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
//                     <Filter className="w-5 h-5 text-blue-600" />
//                   </div>
//                   <div className="text-lg font-semibold text-gray-700">
//                     Showing <span className="text-blue-600">{filteredEmployees.length}</span> of <span className="text-gray-900">{sampleEmployees.length}</span> employees
//                   </div>
//                 </div>
//                 {(searchTerm || selectedDepartment || selectedFactory || selectedRole) && (
//                   <button
//                     onClick={clearFilters}
//                     className="inline-flex items-center px-6 py-3 text-sm font-medium text-gray-600 hover:text-white bg-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 border-2 border-gray-300 hover:border-red-500 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
//                   >
//                     <Filter className="w-4 h-4 mr-2" />
//                     Clear All Filters
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Table Section */}
//           <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
//             <div className="w-full">
//               <table className="w-full table-fixed">
//                 <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
//                   <tr>
//                     <th className="w-[20%] px-4 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
//                       Employee Profile
//                     </th>
//                     <th className="w-[12%] px-3 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
//                       ID
//                     </th>
//                     <th className="w-[25%] px-3 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
//                       Contact Info
//                     </th>
//                     <th className="w-[12%] px-3 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
//                       Location
//                     </th>
//                     <th className="w-[15%] px-3 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
//                       Department
//                     </th>
//                     <th className="w-[16%] px-3 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
//                       Role
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-100">
//                   {filteredEmployees.map((employee) => (
//                     <tr key={employee.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group">
//                       <td className="px-4 py-6">
//                         <div className="flex items-center">
//                           <div className="flex-shrink-0 h-12 w-12 relative">
//                             <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
//                               <span className="text-white font-bold text-sm">
//                                 {getInitials(employee.firstName, employee.lastName)}
//                               </span>
//                             </div>
//                             <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-lg"></div>
//                           </div>
//                           <div className="ml-4 min-w-0">
//                             <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 truncate">
//                               {employee.firstName} {employee.lastName}
//                             </div>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-3 py-6">
//                         <div className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg border border-gray-300">
//                           <span className="text-xs font-bold text-gray-800 font-mono tracking-wider">{employee.employeeId}</span>
//                         </div>
//                       </td>
//                       <td className="px-3 py-6">
//                         <div className="space-y-2">
//                           <div className="flex items-center text-xs text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
//                             <div className="p-1 bg-blue-100 rounded-md mr-2 flex-shrink-0">
//                               <Mail className="w-3 h-3 text-blue-600" />
//                             </div>
//                             <span className="font-medium truncate">{employee.email}</span>
//                           </div>
//                           <div className="flex items-center text-xs text-gray-600">
//                             <div className="p-1 bg-green-100 rounded-md mr-2 flex-shrink-0">
//                               <Phone className="w-3 h-3 text-green-600" />
//                             </div>
//                             <span className="font-medium truncate">{employee.phoneNumber}</span>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-3 py-6">
//                         <div className="flex items-center">
//                           <MapPin className="w-4 h-4 text-orange-500 mr-1 flex-shrink-0" />
//                           <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-300 shadow-sm truncate">
//                             {employee.factory}
//                           </span>
//                         </div>
//                       </td>
//                       <td className="px-3 py-6">
//                         <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border shadow-sm truncate ${getDepartmentColor(employee.department)}`}>
//                           {employee.department}
//                         </span>
//                       </td>
//                       <td className="px-3 py-6">
//                         <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 border border-indigo-300 shadow-sm truncate">
//                           {employee.role}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Empty State */}
//             {filteredEmployees.length === 0 && (
//               <div className="text-center py-16">
//                 <div className="p-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl inline-block mb-6">
//                   <Users className="mx-auto h-16 w-16 text-gray-400" />
//                 </div>
//                 <h3 className="text-2xl font-bold text-gray-900 mb-2">No employees found</h3>
//                 <p className="text-lg text-gray-500 mb-6">
//                   {searchTerm || selectedDepartment || selectedFactory || selectedRole
//                     ? 'Try adjusting your search criteria or filters to find what you\'re looking for.'
//                     : 'Get started by adding your first employee to the system.'}
//                 </p>
//                 <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-xl">
//                   <Plus className="w-5 h-5 mr-3" />
//                   Add First Employee
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Footer */}
//           <div className="mt-12 text-center">
//             <div className="inline-flex items-center gap-4 px-8 py-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30 shadow-xl">
//               <div className="flex items-center gap-2">
//                 <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
//                   <Users className="w-5 h-5 text-white" />
//                 </div>
//                 <span className="text-lg font-bold text-gray-800">Employee Directory</span>
//               </div>
//               <div className="w-px h-6 bg-gray-300"></div>
//               <div className="text-sm text-gray-600">
//                 <span className="font-semibold text-blue-600">{sampleEmployees.length}</span> total employees across <span className="font-semibold text-purple-600">{factories.length}</span> locations
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EmployeeTable;



import React, { useState, useMemo, useEffect } from "react";
import type { RootState } from "../../../store/store";
import {
  Search,
  Filter,
  Plus,
  Mail,
  Building,
  Users,
  Shield,
  Star,
  Briefcase,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { useSelector } from "react-redux";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employeeid: string;
  email: string;
  factory: string;
  department: string;
  role_name: string;
  hq?: string;
}

interface Role {
  id: number;
  name: string;
}

interface Factory {
  id: number;
  factory_name: string;
}

interface Department {
  id: number;
  department_name: string;
}

interface Hq {
  id: number;
  name: string;
}

const EmployeeTable: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [hqs, setHqs] = useState<Hq[]>([]);
  const [loading, setLoading] = useState(true);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedFactory, setSelectedFactory] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    employeeid: "",
    email: "",
    role: "",
    factory: "",
    department: "",
    password: "",
    confirmPassword: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesRes, factoriesRes, departmentsRes, hqsRes, usersRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/roles/", {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch("http://127.0.0.1:8000/factories/", {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch("http://127.0.0.1:8000/departments/", {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch("http://127.0.0.1:8000/hq/", {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch("http://127.0.0.1:8000/users/", {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
        ]);

        if (rolesRes.ok) setRoles(await rolesRes.json());
        if (factoriesRes.ok) setFactories(await factoriesRes.json());
        if (departmentsRes.ok) setDepartments(await departmentsRes.json());
        if (hqsRes.ok) setHqs(await hqsRes.json());
        if (usersRes.ok) {
          const users = await usersRes.json();
          const formattedUsers = users.map((u: any) => ({
            id: String(u.id),
            first_name: u.first_name,
            last_name: u.last_name,
            employeeid: u.employeeid,
            email: u.email,
            role_name: u.role_name || "", 
            factory: u.factory?.factory_name || u.factory || "",
            department: u.department?.department_name || u.department || "",
            hq: u.hq?.name || u.hq || "",
          }));
          setEmployees(formattedUsers);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchData();
    }
  }, [accessToken]);

  const uniqueDepartments = useMemo(
    () =>
      [...new Set(employees.map((emp) => emp.department))]
        .filter(Boolean)
        .sort(),
    [employees]
  );

  const uniqueFactories = useMemo(
    () =>
      [...new Set(employees.map((emp) => emp.factory))].filter(Boolean).sort(),
    [employees]
  );

  const uniqueRoles = useMemo(
    () => [...new Set(employees.map((emp) => emp.role_name))].filter(Boolean).sort(),
    [employees]
  );

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch =
        searchTerm === "" ||
        employee.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employeeid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${employee.first_name} ${employee.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        employee.role_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment =
        selectedDepartment === "" || employee.department === selectedDepartment;
      const matchesFactory =
        selectedFactory === "" || employee.factory === selectedFactory;
      const matchesRole =
        selectedRole === "" || employee.role_name === selectedRole;

      return (
        matchesSearch && matchesDepartment && matchesFactory && matchesRole
      );
    });
  }, [employees, searchTerm, selectedDepartment, selectedFactory, selectedRole]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDepartment("");
    setSelectedFactory("");
    setSelectedRole("");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          employeeid: formData.employeeid,
          email: formData.email,
          role: formData.role,
          factory: formData.factory,
          department: formData.department,
          password: formData.password,
          hq: "HQ1",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const formattedUser: Employee = {
          id: data.id ? String(data.id) : formData.employeeid,
          first_name: data.first_name || formData.first_name,
          last_name: data.last_name || formData.last_name,
          employeeid: data.employeeid || formData.employeeid,
          email: data.email || formData.email,
          role_name: data.role_name || formData.role,
          factory: data.factory?.factory_name || data.factory || formData.factory,
          department:
            data.department?.department_name || data.department || formData.department,
          hq: data.hq?.name || data.hq || "HQ1",
        };

        setEmployees((prev) => [...prev, formattedUser]);

        setIsModalOpen(false);
        setFormData({
          first_name: "",
          last_name: "",
          employeeid: "",
          email: "",
          role: "",
          factory: "",
          department: "",
          password: "",
          confirmPassword: "",
        });

        alert("Employee added successfully!");
      } else {
        alert("Error: " + JSON.stringify(data.errors || data));
      }
    } catch (error) {
      console.error("Error adding employee:", error);
      alert("Something went wrong while adding employee.");
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  const getDepartmentColor = (department: string) => {
    const colors: Record<string, string> = {
      Engineering: "bg-blue-100 text-blue-700 border-blue-200",
      Marketing: "bg-purple-100 text-purple-700 border-purple-200",
      HR: "bg-pink-100 text-pink-700 border-pink-200",
      Operations: "bg-orange-100 text-orange-700 border-orange-200",
      Finance: "bg-green-100 text-green-700 border-green-200",
      "Quality Assurance": "bg-indigo-100 text-indigo-700 border-indigo-200",
    };
    return colors[department] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>

      <div className="relative z-10 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                      Employee Directory
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <p className="text-gray-600 font-medium">
                        Premium Role Management System
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                <Plus className="relative w-5 h-5 mr-3" />
                <span className="relative">Add New Employee</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Employees
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {employees.length}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Unique Roles
                  </p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {uniqueRoles.length}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Departments
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {uniqueDepartments.length}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Factories</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {uniqueFactories.length}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl">
                  <Building className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-8 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="lg:col-span-2">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6 group-hover:text-blue-500 transition-colors duration-200" />
                    <input
                      type="text"
                      placeholder="Search by name or employee ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 text-lg placeholder-gray-400 shadow-lg hover:shadow-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Building className="inline w-5 h-5 mr-2 text-blue-500" />
                    Factory Location
                  </label>
                  <select
                    value={selectedFactory}
                    onChange={(e) => setSelectedFactory(e.target.value)}
                    className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:border-blue-300"
                  >
                    <option value="">All Factories</option>
                    {factories.map((factory,index) => (
                      <option key={factory.id ?? factory.factory_name ?? index} value={factory.factory_name}>
                        {factory.factory_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Users className="inline w-5 h-5 mr-2 text-purple-500" />
                    Department
                  </label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:border-purple-300"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept,index) => (
                      <option key={dept.id ?? dept.department_name ?? index} value={dept.department_name}>
                        {dept.department_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Shield className="inline w-5 h-5 mr-2 text-emerald-500" />
                    Role Position
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-300 focus:border-emerald-500 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:border-emerald-300"
                  >
                    <option value="">All Roles</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.name}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
                    <Filter className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-lg font-semibold text-gray-700">
                    Showing{" "}
                    <span className="text-blue-600">
                      {filteredEmployees.length}
                    </span>{" "}
                    of <span className="text-gray-900">{employees.length}</span>{" "}
                    employees
                  </div>
                </div>
                {(searchTerm ||
                  selectedDepartment ||
                  selectedFactory ||
                  selectedRole) && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-6 py-3 text-sm font-medium text-gray-600 hover:text-white bg-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 border-2 border-gray-300 hover:border-red-500 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Employee Profile
                    </th>
                    <th className="px-6 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Factory
                    </th>
                    <th className="px-6 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Role
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredEmployees.map((employee) => (
                    <tr
                      key={employee.employeeid}

                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group"
                    >
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 relative">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                              <span className="text-white font-bold text-sm">
                                {getInitials(
                                  employee.first_name,
                                  employee.last_name
                                )}
                              </span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-lg"></div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                              {employee.first_name} {employee.last_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg border border-gray-300">
                          <span className="text-xs font-bold text-gray-800 font-mono tracking-wider">
                            {employee.employeeid}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center text-sm text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                          <div className="p-1 bg-blue-100 rounded-md mr-2">
                            <Mail className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="font-medium">{employee.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-300 shadow-sm">
                          {employee.factory}
                        </span>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border shadow-sm ${getDepartmentColor(
                            employee.department
                          )}`}
                        >
                          {employee.department}
                        </span>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 border border-indigo-300 shadow-sm">
                          {employee.role_name}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredEmployees.length === 0 && (
              <div className="text-center py-16">
                <div className="p-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl inline-block mb-6">
                  <Users className="mx-auto h-16 w-16 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No employees found
                </h3>
                <p className="text-lg text-gray-500 mb-6">
                  {searchTerm ||
                  selectedDepartment ||
                  selectedFactory ||
                  selectedRole
                    ? "Try adjusting your search criteria or filters to find what you're looking for."
                    : "Get started by adding your first employee to the system."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900">Add New User</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formErrors.first_name
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {formErrors.first_name && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.first_name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formErrors.last_name
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {formErrors.last_name && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.last_name}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="employeeid"
                  value={formData.employeeid}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.employeeid ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {formErrors.employeeid && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.employeeid}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  autoComplete="off"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.role ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
                {formErrors.role && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.role}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Factory <span className="text-red-500">*</span>
                </label>
                <select
                  name="factory"
                  value={formData.factory}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.factory ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Factory</option>
                  {factories.map((factory,index) => (
                    <option key={factory.id ?? factory.factory_name ?? index} value={factory.factory_name}>
                      {factory.factory_name}
                    </option>
                  ))}
                </select>
                {formErrors.factory && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.factory}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.department ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept,index) => (
                    <option key={dept.id ?? dept.department_name ?? index} value={dept.department_name}>
                      {dept.department_name}
                    </option>
                  ))}
                </select>
                {formErrors.department && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.department}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    autoComplete="new-password"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12 ${
                      formErrors.password ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    autoComplete="new-password"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12 ${
                      formErrors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTable;