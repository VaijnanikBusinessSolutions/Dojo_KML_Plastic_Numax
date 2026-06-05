// import React, { useEffect, useState } from 'react';
// import { Building, User as UserIcon, Calendar } from 'lucide-react';
// import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
// import { Input } from '../../atoms/Inputs/Inputs';
// import { Icon } from '../../atoms/LucidIcons/LucidIcons';
// import SelectField from '../../atoms/Select/select';
// import axios from 'axios';
// import { API_ENDPOINTS } from '../../constants/api';

// interface OrientationFields {
//   emp_id: string;
//   date_of_joining: string;
//   department: string;
// }

// interface Department {
//   id: number;
//   name: string;
// }

// interface OrientationFormProps {
//   orientationFields: OrientationFields;
//   setOrientationFields: (fields: OrientationFields) => void;
//   error?: string;
// }

// export const OrientationForm: React.FC<OrientationFormProps> = ({
//   orientationFields,
//   setOrientationFields,
//   error
// }) => {
//   const [departments, setDepartments] = useState<Department[]>([]);
//   const [loading, setLoading] = useState(false);

//   // Fetch departments on component mount
//   useEffect(() => {
//     const fetchDepartments = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.DEPARTMENT}`);
//         console.log(response.data)
//         if (Array.isArray(response.data)) {
//           const deptData: Department[] = response.data.map((dept: any) => ({
//             id: dept.department_id,
//             name: dept.department_name
//           }));
//           setDepartments(deptData);
//         }
//       } catch (error) {
//         console.error('Error fetching departments:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDepartments();
//   }, []);

//   const handleInputChange = (field: keyof OrientationFields, value: string) => {
//     setOrientationFields({ ...orientationFields, [field]: value });
//   };

//   const departmentOptions = [
//     { value: '', label: loading ? 'Loading...' : 'Select Department' },
//     ...departments.map(dept => ({ value: dept.id.toString(), label: dept.name }))
//   ];

//   return (
//     <div>
//       <h4 className="text-lg font-medium text-gray-900 mb-4">Additional Employee Details</h4>
//       {error && <ErrorMessage message={error} />}
//       <div className="space-y-4">
//          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <SelectField
//             label="Department"
//             id="department"
//             options={departmentOptions}
//             value={orientationFields.department || ''}
//             onChange={(e) => handleInputChange('department', e.target.value)}
//             icon={<Icon icon={Building} className="text-gray-400" />}
//             required
//           />
//         </div>
//         {/* Employee ID & Date of Joining */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <Input
//             label="Employee ID"
//             type="text"
//             id="empId"
//             value={orientationFields.emp_id}
//             onChange={(e) => handleInputChange('emp_id', e.target.value)}
//             placeholder="Enter employee ID"
//             required
//             icon={<Icon icon={UserIcon} className="text-gray-400" />}
//           />

//           <Input
//             label="Date of Joining"
//             type="date"
//             id="dateOfJoining"
//             value={orientationFields.date_of_joining}
//             onChange={(e) => handleInputChange('date_of_joining', e.target.value)}
//             required
//             icon={<Icon icon={Calendar} className="text-gray-400" />}
//           />
//         </div>

//         {/* Department Dropdown */}
       
//       </div>
//     </div>
//   );
// };


import React, { useEffect, useState } from 'react';
// ADDED: Briefcase icon
import { Building, User as UserIcon, Calendar, Briefcase } from 'lucide-react';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import { Input } from '../../atoms/Inputs/Inputs';
import { Icon } from '../../atoms/LucidIcons/LucidIcons';
import SelectField from '../../atoms/Select/select';
import axios from 'axios';
import { API_ENDPOINTS } from '../../constants/api';

interface OrientationFields {
  emp_id: string;
  date_of_joining: string;
  department: string;
  // ADDED: Designation (optional)
  designation?: string;
}

interface Department {
  id: number;
  name: string;
}

interface OrientationFormProps {
  orientationFields: OrientationFields;
  setOrientationFields: (fields: OrientationFields) => void;
  error?: string;
}

export const OrientationForm: React.FC<OrientationFormProps> = ({
  orientationFields,
  setOrientationFields,
  error
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.DEPARTMENT}`);
        if (Array.isArray(response.data)) {
          const deptData: Department[] = response.data.map((dept: any) => ({
            id: dept.department_id,
            name: dept.department_name
          }));
          setDepartments(deptData);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  // Helper to handle input changes
  const handleInputChange = (field: keyof OrientationFields, value: string) => {
    setOrientationFields({ ...orientationFields, [field]: value });
  };

  const departmentOptions = [
    { value: '', label: loading ? 'Loading...' : 'Select Department' },
    ...departments.map(dept => ({ value: dept.id.toString(), label: dept.name }))
  ];

  return (
    <div>
      <h4 className="text-lg font-medium text-gray-900 mb-4">Additional Employee Details</h4>
      {error && <ErrorMessage message={error} />}
      
      <div className="space-y-4">
        
        {/* Row 1: Department & Designation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Department (Optional)" // UPDATED: Changed label
            id="department"
            options={departmentOptions}
            value={orientationFields.department || ''}
            onChange={(e) => handleInputChange('department', e.target.value)}
            icon={<Icon icon={Building} className="text-gray-400" />}
            // UPDATED: Removed the 'required' prop
          />

          {/* ADDED: Designation Input */}
          <Input
            label="Designation (Optional)"
            type="text"
            id="designation"
            value={orientationFields.designation || ''}
            onChange={(e) => handleInputChange('designation', e.target.value)}
            placeholder="e.g. Software Engineer"
            icon={<Icon icon={Briefcase} className="text-gray-400" />}
          />
        </div>

        {/* Row 2: Employee ID & Date of Joining */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Employee ID"
            type="text"
            id="empId"
            value={orientationFields.emp_id}
            onChange={(e) => handleInputChange('emp_id', e.target.value)}
            placeholder="Enter employee ID"
            required
            icon={<Icon icon={UserIcon} className="text-gray-400" />}
          />

          <Input
            label="Date of Joining"
            type="date"
            id="dateOfJoining"
            value={orientationFields.date_of_joining}
            onChange={(e) => handleInputChange('date_of_joining', e.target.value)}
            required
            icon={<Icon icon={Calendar} className="text-gray-400" />}
          />
        </div>
       
      </div>
    </div>
  );
};