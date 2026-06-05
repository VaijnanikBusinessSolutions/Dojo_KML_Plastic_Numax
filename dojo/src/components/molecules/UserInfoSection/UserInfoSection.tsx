// import React from 'react';
// import { User as UserIcon, Mail, Phone, Calendar, CreditCard, Briefcase, Award, Building } from 'lucide-react';
// import type { User } from '../../constants/types';
// import { Input } from '../../atoms/Inputs/Inputs';
// import { Icon } from '../../atoms/LucidIcons/LucidIcons';

// interface UserInfoSectionProps {
//   user: User;
//   emailValue: string;
//   onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
// }

// export const UserInfoSection: React.FC<UserInfoSectionProps> = ({  user,
//   // --- CHANGE 2: Destructure the new props ---
//   emailValue,
//   onEmailChange
// }) => {
//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//     });
//   };

//   return (
//     <div>
//       <h4 className="text-lg font-medium text-gray-900 mb-4">User Information</h4>
//       <div className="space-y-8 p-4 bg-gray-50 rounded-lg">
//         {/* Basic Information */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//           <Input
//             label="Full Name"
//             type="text"
//             id="fullName"
//             value={`${user.first_name} ${user.last_name}`}
//             onChange={() => {}}
//             icon={<Icon icon={UserIcon} className="text-gray-400" />}
//             disabled
//           />
//           <Input
//             label="Temp ID"
//             type="text"
//             id="tempId"
//             value={user.temp_id}
//             onChange={() => {}}
//             icon={<Icon icon={UserIcon} className="text-gray-400" />}
//             disabled
//           />
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//           {/* --- CHANGE 3: Wire up the email input to the new props --- */}
//           <Input
//             label="Email"
//             type="email"
//             id="email"
//             value={emailValue}      // Use the state value from the parent
//             onChange={onEmailChange} // Use the handler function from the parent
//             icon={<Icon icon={Mail} className="text-gray-400" />}
//             // No 'disabled' prop here, so it's editable
//           />
//           <Input
//             label="Phone Number"
//             type="text"
//             id="phoneNumber"
//             value={user.phone_number}
//             onChange={() => {}}
//             icon={<Icon icon={Phone} className="text-gray-400" />}
//             disabled
//           />
//         </div>

//         {/* Identity and Employment */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//           <Input
//             label="Aadhar Number"
//             type="text"
//             id="aadharNumber"
//             value={user.aadharNumber || 'N/A'}
//             onChange={() => {}}
//             icon={<Icon icon={CreditCard} className="text-gray-400" />}
//             disabled
//           />
//           <Input
//             label="Created Date"
//             type="text"
//             id="createdDate"
//             value={formatDate(user.created_at)}
//             onChange={() => {}}
//             icon={<Icon icon={Calendar} className="text-gray-400" />}
//             disabled
//           />
//         </div>

//         {/* Employment Type */}
//         <div>
//           <label className="font-medium text-gray-700 mb-4 block">Employment Type:</label>
//           <div className="flex items-center gap-6">
//             <label className="flex items-center gap-2">
//               <input
//                 type="radio"
//                 name="employmentTypeDisplay"
//                 value="contractual"
//                 checked={user.employment_type === 'contractual'}
//                 onChange={() => {}}
//                 disabled
//                 className="opacity-60"
//               />
//               <span className={user.employment_type === 'contractual' ? 'text-gray-900 font-medium' : 'text-gray-500'}>
//                 Contractual
//               </span>
//             </label>
//             <label className="flex items-center gap-2">
//               <input
//                 type="radio"
//                 name="employmentTypeDisplay"
//                 value="permanent"
//                 checked={user.employment_type === 'permanent'}
//                 onChange={() => {}}
//                 disabled
//                 className="opacity-60"
//               />
//               <span className={user.employment_type === 'permanent' ? 'text-gray-900 font-medium' : 'text-gray-500'}>
//                 Permanent
//               </span>
//             </label>
//             {!user.employment_type && (
//               <span className="text-gray-500 italic">Not specified</span>
//             )}
//           </div>
//         </div>

//         {/* Experience Section */}
//         <div>
//           <label className="flex items-center gap-2 mb-4">
//             <input
//               type="checkbox"
//               checked={user.hasExperience}
//               onChange={() => {}}
//               disabled
//               className="opacity-60"
//             />
//             <span className={user.hasExperience ? 'text-gray-900 font-medium' : 'text-gray-500'}>
//               Have Experience?
//             </span>
//           </label>

//           {user.hasExperience && (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               <Input
//                 label="Years of Experience"
//                 type="text"
//                 id="experienceYears"
//                 value={user.experienceYears ? String(user.experienceYears) : 'N/A'}
//                 onChange={() => {}}
//                 icon={<Icon icon={Award} className="text-gray-400" />}
//                 disabled
//               />
//               <Input
//                 label="Company of Experience"
//                 type="text"
//                 id="companyOfExperience"
//                 value={user.companyOfExperience || 'N/A'}
//                 onChange={() => {}}
//                 icon={<Icon icon={Building} className="text-gray-400" />}
//                 disabled
//               />
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };



import React, { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Phone, Calendar, CreditCard, Award, Building } from 'lucide-react';
import type { User } from '../../constants/types';
import { Icon } from '../../atoms/LucidIcons/LucidIcons';

// --- CHANGE 1: Define the shape of our form data (camelCase for consistency) ---
interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  aadharNumber: string;
  employmentType: string;
  hasExperience: boolean;
  experienceYears: number;
  companyOfExperience: string;
}

// --- CHANGE 2: Update the props interface ---
interface UserInfoSectionProps {
  user: User;
  onFormUpdate: (updatedData: UserFormData) => void;
}

export const UserInfoSection: React.FC<UserInfoSectionProps> = ({ user, onFormUpdate }) => {
  // --- CHANGE 3: Create internal state to manage the form ---
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    aadharNumber: '',
    employmentType: 'contractual',
    hasExperience: false,
    experienceYears: 0,
    companyOfExperience: '',
  });

  // --- CHANGE 4: Use useEffect to populate the form with initial user data ---
  useEffect(() => {
    if (user) {
      const initialFormData: UserFormData = {
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phoneNumber: user.phone_number || '',
        aadharNumber: user.aadharNumber || '',
        employmentType: user.employment_type || 'contractual',
        hasExperience: user.hasExperience || false,
        experienceYears: user.experienceYears || 0,
        companyOfExperience: user.companyOfExperience || '',
      };
      setFormData(initialFormData);
      onFormUpdate(initialFormData); // Send initial state to parent
    }
  }, [user]); // This runs only when the user prop changes

  // --- CHANGE 5: A single, powerful handler for all inputs ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    const isCheckbox = type === 'checkbox' && e.target instanceof HTMLInputElement;
    const newFormData = {
      ...formData,
      [name]: isCheckbox ? e.target.checked : value,
    };

    setFormData(newFormData);
    onFormUpdate(newFormData); // Notify the parent of the change
  };

  return (
    <div>
      <h4 className="text-lg font-medium text-gray-900 mb-4">User Information</h4>
      <div className="space-y-6 p-4 bg-gray-50 rounded-lg">
        {/* --- CHANGE 6: Update all inputs to be editable and controlled --- */}
        
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
            <input id="firstName" name="firstName" type="text" value={formData.firstName} onChange={handleChange} className="mt-1 input-field" />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
            <input id="lastName" name="lastName" type="text" value={formData.lastName} onChange={handleChange} className="mt-1 input-field" />
          </div>
        </div>
        
        {/* Temp ID (disabled) */}
        <div>
          <label htmlFor="tempId" className="block text-sm font-medium text-gray-700">Temp ID</label>
          <input id="tempId" name="tempId" type="text" value={user.temp_id || ''} readOnly disabled className="mt-1 input-field bg-gray-200 cursor-not-allowed" />
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="mt-1 input-field" />
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input id="phoneNumber" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} className="mt-1 input-field" />
          </div>
        </div>

        {/* Identity */}
        <div>
          <label htmlFor="aadharNumber" className="block text-sm font-medium text-gray-700">Aadhar Number</label>
          <input id="aadharNumber" name="aadharNumber" type="text" value={formData.aadharNumber} onChange={handleChange} className="mt-1 input-field" />
        </div>

        {/* Employment Type */}
        <div>
          <label htmlFor="employmentType" className="font-medium text-gray-700 mb-2 block">Employment Type</label>
          <select id="employmentType" name="employmentType" value={formData.employmentType} onChange={handleChange} className="mt-1 input-field">
            <option value="contractual">Contractual</option>
            <option value="permanent">Permanent</option>
          </select>
        </div>

        {/* Experience Section */}
        <div className="border-t pt-4">
          <label className="flex items-center gap-2 mb-4">
            <input type="checkbox" id="hasExperience" name="hasExperience" checked={formData.hasExperience} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded"/>
            <span className="font-medium text-gray-900">Has Prior Experience?</span>
          </label>

          {formData.hasExperience && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700">Years of Experience</label>
                <input id="experienceYears" name="experienceYears" type="number" value={formData.experienceYears} onChange={handleChange} className="mt-1 input-field" />
              </div>
              <div>
                <label htmlFor="companyOfExperience" className="block text-sm font-medium text-gray-700">Previous Company</label>
                <input id="companyOfExperience" name="companyOfExperience" type="text" value={formData.companyOfExperience} onChange={handleChange} className="mt-1 input-field" />
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};