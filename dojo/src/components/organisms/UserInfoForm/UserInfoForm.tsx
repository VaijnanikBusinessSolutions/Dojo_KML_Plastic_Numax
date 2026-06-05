// import React, { useState } from 'react';
// import {
//   User,
//   Mail,
//   Phone,
//   IdCard,
//   Building2,
//   Briefcase,
//   Calendar,
// } from 'lucide-react';
// import { Input } from '../../atoms/Inputs/Inputs';
// import SelectField from '../../atoms/Select/select';
// import { saveUserInfo } from '../../hooks/ServiceApis';
// import { PhotoUpload } from '../../molecules/PhotoUpload/PhotoUpload';
// import { ProgressBar } from '../../atoms/ProgressBarPercentage/ProgressBarPercentage';
// import { FormActions } from '../../molecules/FormAction/FormAction';
// import { StatusAlert } from '../../molecules/StatusAlert/StatusAlert';
// import { useNavigate } from 'react-router-dom';

// interface UserInfo {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNumber: string;
//   sex: string;
//   photo: File | null;
//   dateOfBirth: string | null;
//   aadharNumber: string;
//   employmentType: 'contractual' | 'permanent' | '';
//   hasExperience: boolean;
//   experienceYears: string;
//   companyOfExperience: string;
// }

// export const UserInfoForm: React.FC = () => {
//   const navigate = useNavigate();

//   const initialUserInfo: UserInfo = {
//     firstName: '',
//     lastName: '',
//     email: '',
//     phoneNumber: '',
//     sex: 'M',
//     photo: null,
//     dateOfBirth: null,
//     aadharNumber: '',
//     employmentType: '',
//     hasExperience: false,
//     experienceYears: '',
//     companyOfExperience: '',
//   };

//   const [userInfo, setUserInfo] = useState<UserInfo>(initialUserInfo);
//   const [errors, setErrors] = useState<Partial<Record<keyof UserInfo, string>>>({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [formStatus, setFormStatus] = useState<'idle' | 'success' | 'error' | 'submitting'>('idle');
//   const [submitError, setSubmitError] = useState<string | null>(null);
//   const [photoPreview, setPhotoPreview] = useState<string | null>(null);

//   // 🔹 Validation Regex
//   const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+){0,2}$/;
//   const repeatingDigitsRegex = /^(\d)\1+$/;
//   const companyNameRegex = /^[A-Za-z0-9\s]+$/;

//   const handleInputChange = (field: keyof UserInfo, value: any) => {
//     setUserInfo((prev) => ({ ...prev, [field]: value }));

//     // clear field error live
//     if (errors[field]) {
//       setErrors((prev) => {
//         const newErrors = { ...prev };
//         delete newErrors[field];
//         return newErrors;
//       });
//     }
//   };

//   const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0] || null;
//     if (!file) return;

//     if (!file.type.startsWith('image/')) {
//       setErrors((prev) => ({ ...prev, photo: 'Please select an image file.' }));
//       return;
//     }
//     if (file.size > 5 * 1024 * 1024) {
//       setErrors((prev) => ({ ...prev, photo: 'Image must be less than 5MB.' }));
//       return;
//     }

//     handleInputChange('photo', file);

//     const reader = new FileReader();
//     reader.onload = () => setPhotoPreview(reader.result as string);
//     reader.readAsDataURL(file);
//   };

//   const validateForm = (): boolean => {
//     const newErrors: Partial<Record<keyof UserInfo, string>> = {};

//     // ✅ First Name
//     const trimmedFirstName = userInfo.firstName.trim();
//     if (!trimmedFirstName) {
//       newErrors.firstName = "First Name is required.";
//     } else if (trimmedFirstName.length < 3) { // 👇 NEW VALIDATION
//       newErrors.firstName = "First Name must be at least 3 characters long.";
//     } else if (!nameRegex.test(trimmedFirstName)) {
//       newErrors.firstName = "Only alphabets and spaces are allowed.";
//     }

//     // ✅ Last Name
//     if (userInfo.lastName && !nameRegex.test(userInfo.lastName.trim())) {
//       newErrors.lastName = "Only alphabets and up to two spaces are allowed.";
//     }

//     // ✅ Email
//     if (userInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email)) {
//       newErrors.email = "Please enter a valid email address.";
//     }

//     // // ✅ Phone Number
//     // if (!userInfo.phoneNumber.trim()) {
//     //   newErrors.phoneNumber = "Phone Number is required.";
//     // } else {
//     //   const cleanedPhone = userInfo.phoneNumber.replace(/\D/g, "");
//     //   if (!/^\d{10,15}$/.test(cleanedPhone)) {
//     //     newErrors.phoneNumber = "Enter a valid phone number (10–15 digits).";
//     //   } else if (repeatingDigitsRegex.test(cleanedPhone)) {
//     //     newErrors.phoneNumber = "Invalid phone number (repeated digits).";
//     //   }
//     // }

//     // if (userInfo.aadharNumber.trim()) {
//     //   const cleanedAadhar = userInfo.aadharNumber.replace(/\s/g, "");
//     //   if (!/^\d{12}$/.test(cleanedAadhar)) {
//     //     newErrors.aadharNumber = "Aadhaar must contain exactly 12 digits.";
//     //   } else if (repeatingDigitsRegex.test(cleanedAadhar)) {
//     //     newErrors.aadharNumber = "Invalid Aadhaar number (repeated digits).";
//     //   }
//     // }


//     if (!userInfo.phoneNumber.trim()) {
//       newErrors.phoneNumber = "Phone Number is required.";
//     } else {
//       const phoneInput = userInfo.phoneNumber.trim();
//       // Regex to check for only digits and an optional leading '+'
//       const validPhoneCharsRegex = /^\+?\d+$/;

//       // 1. First, check if the input contains any invalid characters (like '.', '-', ' ', etc.)
//       if (!validPhoneCharsRegex.test(phoneInput)) {
//         newErrors.phoneNumber = "Phone number can only contain digits (0-9) and an optional leading '+' sign.";
//       } else {
//         // 2. Now that we know the characters are valid, we can check the length and for repeating digits.
//         const cleanedPhone = phoneInput.replace('+', ''); // Just remove the '+' for length check
        
//         if (cleanedPhone.length < 10 || cleanedPhone.length > 15) {
//           newErrors.phoneNumber = "Enter a valid phone number (10-15 digits).";
//         } else if (repeatingDigitsRegex.test(cleanedPhone)) {
//           newErrors.phoneNumber = "Invalid phone number (all repeating digits).";
//         }
//       }
//     }


    







//     // ✅ Experience
//     if (userInfo.hasExperience) {
//       // 👇 *** CHANGE STARTS HERE *** 👇
//       if (!userInfo.experienceYears.trim()) {
//         newErrors.experienceYears = "Experience years are required.";
//       } else if (parseFloat(userInfo.experienceYears) < 0) {
//         newErrors.experienceYears = "Experience years cannot be negative.";
//       }
//       // 👆 *** CHANGE ENDS HERE *** 👆

//       if (!userInfo.companyOfExperience.trim()) {
//         newErrors.companyOfExperience = "Company name is required.";
//       } else if (!companyNameRegex.test(userInfo.companyOfExperience)) {
//         newErrors.companyOfExperience =
//           'Company name can only contain letters, numbers, and spaces.';
//       }
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // 🔹 Submit Handler
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!validateForm()) {
//       console.log('❌ Validation failed:', errors);
//       return;
//     }

//     console.log('✅ Validation passed, submitting...');
//     setFormStatus('submitting');
//     setIsSubmitting(true);
//     setSubmitError(null);
//     setErrors({});

//     const formData = new FormData();
//     formData.append('firstName', userInfo.firstName);
//     formData.append('lastName', userInfo.lastName);
//     formData.append('email', userInfo.email || '');
//     formData.append('phoneNumber', userInfo.phoneNumber);
//     formData.append('sex', userInfo.sex);
//     formData.append('dateOfBirth', userInfo.dateOfBirth || '');
//     formData.append('aadharNumber', userInfo.aadharNumber.replace(/\s/g, ''));
//     formData.append('employment_type', userInfo.employmentType || '');
//     formData.append('hasExperience', String(userInfo.hasExperience));
//     formData.append('experienceYears', userInfo.experienceYears || '');
//     formData.append('companyOfExperience', userInfo.companyOfExperience || '');
//     if (userInfo.photo instanceof File) formData.append('photo', userInfo.photo);

//     try {
//       const response = await saveUserInfo(formData);
//       if (!response.ok) {
//         const errorData = await response.json();
//         console.error('❌ Backend error response:', errorData);

//         if (response.status === 400 && typeof errorData === 'object') {
//           const formattedErrors: Partial<Record<keyof UserInfo, string>> = {};
//           Object.keys(errorData).forEach((key) => {
//             const msgs = errorData[key];
//             if (Array.isArray(msgs) && msgs.length > 0) {
//               formattedErrors[key as keyof UserInfo] = msgs[0];
//             }
//           });
//           setErrors(formattedErrors);
//           setFormStatus('error');
//           setSubmitError('Please correct the highlighted fields.');
//         } else {
//           setFormStatus('error');
//           setSubmitError('Unexpected error occurred.');
//         }
//         return;
//       }

//       console.log('✅ Form submitted successfully!');
//       setFormStatus('success');
//       setTimeout(() => navigate('/TempEmployeeSearch'), 2000);
//     } catch (error: unknown) {
//       console.error('❌ Submission failed:', error);
//       setFormStatus('error');
//       setSubmitError('Network or server error.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleReset = () => {
//     setUserInfo(initialUserInfo);
//     setErrors({});
//     setPhotoPreview(null);
//     setSubmitError(null);
//     setFormStatus('idle');
//   };

//   return (
//     <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
//       {/* Add smooth transitions styles */}
//       <style>{`
//         .radio-group label {
//           transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//         }
//         .radio-group label:hover {
//           transform: translateX(2px);
//         }
//         .radio-group input[type="radio"] {
//           transition: all 0.2s ease;
//         }
//         .radio-group input[type="radio"]:checked {
//           box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
//         }
//         .form-radio, .form-checkbox {
//           transition: all 0.2s ease;
//         }
//         .form-radio:checked, .form-checkbox:checked {
//           animation: pulse 0.3s ease;
//         }
//         @keyframes pulse {
//           0% { transform: scale(1); }
//           50% { transform: scale(1.1); }
//           100% { transform: scale(1); }
//         }
//       `}</style>

//       <div className="max-w-4xl mx-auto">
//         <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl border border-white/50 overflow-hidden">
//           <ProgressBar progress={33} />

//           <form onSubmit={handleSubmit} noValidate className="p-10">
//             <div className="space-y-10">
//               {/* Personal Info */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                 <Input
//                   label="First Name"
//                   placeholder="Enter your first name"
//                   type="text"
//                   id="firstName"
//                   value={userInfo.firstName}
//                   onChange={(e) => handleInputChange('firstName', e.target.value)}
//                   required
//                   error={errors.firstName}
//                   icon={<User />}
//                 />
//                 <Input
//                   label="Last Name"
//                   placeholder="Enter your last name"
//                   type="text"
//                   id="lastName"
//                   value={userInfo.lastName}
//                   onChange={(e) => handleInputChange('lastName', e.target.value)}
//                   error={errors.lastName}
//                   icon={<User />}
//                 />
//               </div>

//               {/* Contact Info */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                 <Input
//                   label="Email Address"
//                   type="email"
//                   placeholder="example@email.com"
//                   id="email"
//                   value={userInfo.email}
//                   onChange={(e) => handleInputChange('email', e.target.value)}
//                   error={errors.email}
//                   icon={<Mail />}
//                 />
//                 <Input
//                   label="Phone Number"
//                   type="tel"
//                   placeholder="Enter your number"
//                   id="phoneNumber"
//                   value={userInfo.phoneNumber}
//                   onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
//                   required
//                   error={errors.phoneNumber}
//                   icon={<Phone />}
//                 />

//               </div>

//               {/* Demographics - Gender as Radio Buttons */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Gender <span className="text-red-500">*</span>
//                   </label>
//                   <div className="radio-group flex gap-4">
//                     <label className="flex items-center gap-2 cursor-pointer py-2 px-3 rounded-lg hover:bg-gray-50 transition-all">
//                       <input
//                         type="radio"
//                         name="gender"
//                         value="M"
//                         checked={userInfo.sex === 'M'}
//                         onChange={(e) => handleInputChange('sex', e.target.value)}
//                         className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
//                       />
//                       <span className="text-gray-700">Male</span>
//                     </label>
//                     <label className="flex items-center gap-2 cursor-pointer py-2 px-3 rounded-lg hover:bg-gray-50 transition-all">
//                       <input
//                         type="radio"
//                         name="gender"
//                         value="F"
//                         checked={userInfo.sex === 'F'}
//                         onChange={(e) => handleInputChange('sex', e.target.value)}
//                         className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
//                       />
//                       <span className="text-gray-700">Female</span>
//                     </label>
//                     <label className="flex items-center gap-2 cursor-pointer py-2 px-3 rounded-lg hover:bg-gray-50 transition-all">
//                       <input
//                         type="radio"
//                         name="gender"
//                         value="O"
//                         checked={userInfo.sex === 'O'}
//                         onChange={(e) => handleInputChange('sex', e.target.value)}
//                         className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
//                       />
//                       <span className="text-gray-700">Other</span>
//                     </label>
//                   </div>
//                   {errors.sex && <p className="text-red-500 text-sm mt-1">{errors.sex}</p>}
//                 </div>

//                 <Input
//                   label="Date of Birth"
//                   type="date"
//                   id="dateOfBirth"
//                   value={userInfo.dateOfBirth || ''}
//                   onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
//                   error={errors.dateOfBirth}
//                   icon={<Calendar />}
//                 />
//               </div>

//               {/* Aadhaar + Photo */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
//                 <Input
//                   label="Aadhaar Number"
//                   type="text"
//                   id="aadharNumber"
//                   placeholder="XXXX XXXX XXXX"
//                   value={userInfo.aadharNumber}
//                   onChange={(e) => handleInputChange('aadharNumber', e.target.value)}
//                   error={errors.aadharNumber}
//                   icon={<IdCard />}
//                 />
//                 <PhotoUpload
//                   photoPreview={photoPreview}
//                   error={errors.photo}
//                   onChange={handlePhotoChange}
//                   currentFileName={userInfo.photo?.name}
//                 />
//               </div>

//               {/* Employment Type */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type:</label>
//                 <div className="radio-group flex gap-6">
//                   <label className="flex items-center gap-2 cursor-pointer py-2 px-3 rounded-lg hover:bg-gray-50 transition-all">
//                     <input
//                       type="radio"
//                       name="employmentType"
//                       value="contractual"
//                       checked={userInfo.employmentType === 'contractual'}
//                       onChange={(e) => handleInputChange('employmentType', e.target.value)}
//                       className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
//                     />
//                     <span className="text-gray-700">Contractual</span>
//                   </label>
//                   <label className="flex items-center gap-2 cursor-pointer py-2 px-3 rounded-lg hover:bg-gray-50 transition-all">
//                     <input
//                       type="radio"
//                       name="employmentType"
//                       value="permanent"
//                       checked={userInfo.employmentType === 'permanent'}
//                       onChange={(e) => handleInputChange('employmentType', e.target.value)}
//                       className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
//                     />
//                     <span className="text-gray-700">Permanent</span>
//                   </label>
//                 </div>
//               </div>

//               {/* Experience Section */}
//               <div>
//                 <label className="flex items-center gap-2 cursor-pointer w-fit py-2 px-3 rounded-lg hover:bg-gray-50 transition-all">
//                   <input
//                     type="checkbox"
//                     checked={userInfo.hasExperience}
//                     onChange={(e) => handleInputChange('hasExperience', e.target.checked)}
//                     className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
//                   />
//                   <span className="font-medium text-gray-700">Have Work Experience?</span>
//                 </label>

//                 {userInfo.hasExperience && (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 border-t pt-6 transition-all duration-300 ease-in-out">
//                     <Input
//                       label="Years of Experience"
//                       type="number"
//                       id="experienceYears"
//                       min="0" // Good for accessibility and spinner behavior
//                       value={userInfo.experienceYears}
//                       // 1. Add onKeyDown to prevent typing invalid characters
//                       onKeyDown={(e) => {
//                         if (['e', 'E', '+', '-'].includes(e.key)) {
//                           e.preventDefault();
//                         }
//                       }}
//                       // 2. Modify onChange to handle edge cases like pasting
//                       onChange={(e) => {
//                         const value = e.target.value;
//                         // Allow clearing the input, but block any negative values
//                         if (value === '' || parseFloat(value) >= 0) {
//                           handleInputChange('experienceYears', value);
//                         }
//                       }}
//                       required
//                       error={errors.experienceYears}
//                       icon={<Briefcase />}
//                     />
//                     <Input
//                       label="Company of Experience"
//                       type="text"
//                       id="companyOfExperience"
//                       value={userInfo.companyOfExperience}
//                       onChange={(e) => handleInputChange('companyOfExperience', e.target.value)}
//                       required
//                       error={errors.companyOfExperience}
//                       icon={<Building2 />}
//                     />
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Global Error Message */}
//             {formStatus === 'error' && submitError && (
//               <div className="mt-6 text-center text-red-600 font-medium animate-pulse">{submitError}</div>
//             )}

//             <FormActions onReset={handleReset} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
//           </form>

//           {formStatus === 'success' && (
//             <StatusAlert
//               type="success"
//               title="Profile Created!"
//               message="Redirecting you to the employee list..."
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };




import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  IdCard,
  Building2,
  Briefcase,
  Calendar,
} from 'lucide-react';
import { Input } from '../../atoms/Inputs/Inputs';
import { saveUserInfo } from '../../hooks/ServiceApis';
import { PhotoUpload } from '../../molecules/PhotoUpload/PhotoUpload';
import { ProgressBar } from '../../atoms/ProgressBarPercentage/ProgressBarPercentage';
import { FormActions } from '../../molecules/FormAction/FormAction';
import { StatusAlert } from '../../molecules/StatusAlert/StatusAlert';
import { useNavigate } from 'react-router-dom';

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  sex: string;
  photo: File | null;
  dateOfBirth: string | null;
  aadharNumber: string;
  employmentType: 'contractual' | 'permanent' | '';
  hasExperience: boolean;
  experienceYears: string;
  companyOfExperience: string;
}

export const UserInfoForm: React.FC = () => {
  const navigate = useNavigate();

  const initialUserInfo: UserInfo = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    sex: 'M',
    photo: null,
    dateOfBirth: null,
    aadharNumber: '',
    employmentType: '',
    hasExperience: false,
    experienceYears: '',
    companyOfExperience: '',
  };

  const [userInfo, setUserInfo] = useState<UserInfo>(initialUserInfo);
  const [errors, setErrors] = useState<Partial<Record<keyof UserInfo, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'success' | 'error' | 'submitting'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // 🔹 Validation Regex (Only used for First Name now)
  const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+){0,2}$/;

  const handleInputChange = (field: keyof UserInfo, value: any) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }));

    // clear field error live
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    // We keep basic file type checks to ensure image preview works, 
    // but these can be removed if you want zero validation here too.
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, photo: 'Please select an image file.' }));
      return;
    }
    
    handleInputChange('photo', file);

    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserInfo, string>> = {};

    // ✅ First Name (The ONLY required validation)
    const trimmedFirstName = userInfo.firstName.trim();
    if (!trimmedFirstName) {
      newErrors.firstName = "First Name is required.";
    } else if (trimmedFirstName.length < 3) {
      newErrors.firstName = "First Name must be at least 3 characters long.";
    } else if (!nameRegex.test(trimmedFirstName)) {
      newErrors.firstName = "Only alphabets and spaces are allowed.";
    }

    // ❌ ALL OTHER VALIDATIONS REMOVED
    // Last Name, Email, Phone, Experience, etc. will accept any input.

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🔹 Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      console.log('❌ Validation failed:', errors);
      return;
    }

    console.log('✅ Validation passed, submitting...');
    setFormStatus('submitting');
    setIsSubmitting(true);
    setSubmitError(null);
    setErrors({});

    const formData = new FormData();
    formData.append('firstName', userInfo.firstName);
    formData.append('lastName', userInfo.lastName);
    formData.append('email', userInfo.email || '');
    formData.append('phoneNumber', userInfo.phoneNumber);
    formData.append('sex', userInfo.sex);
    formData.append('dateOfBirth', userInfo.dateOfBirth || '');
    formData.append('aadharNumber', userInfo.aadharNumber); // Removed whitespace stripping to allow raw input
    formData.append('employment_type', userInfo.employmentType || '');
    formData.append('hasExperience', String(userInfo.hasExperience));
    formData.append('experienceYears', userInfo.experienceYears || '');
    formData.append('companyOfExperience', userInfo.companyOfExperience || '');
    if (userInfo.photo instanceof File) formData.append('photo', userInfo.photo);

    try {
      const response = await saveUserInfo(formData);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Backend error response:', errorData);

        if (response.status === 400 && typeof errorData === 'object') {
          const formattedErrors: Partial<Record<keyof UserInfo, string>> = {};
          Object.keys(errorData).forEach((key) => {
            const msgs = errorData[key];
            if (Array.isArray(msgs) && msgs.length > 0) {
              formattedErrors[key as keyof UserInfo] = msgs[0];
            }
          });
          setErrors(formattedErrors);
          setFormStatus('error');
          setSubmitError('Please correct the highlighted fields.');
        } else {
          setFormStatus('error');
          setSubmitError('Unexpected error occurred.');
        }
        return;
      }

      console.log('✅ Form submitted successfully!');
      setFormStatus('success');
      setTimeout(() => navigate('/TempEmployeeSearch'), 2000);
    } catch (error: unknown) {
      console.error('❌ Submission failed:', error);
      setFormStatus('error');
      setSubmitError('Network or server error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setUserInfo(initialUserInfo);
    setErrors({});
    setPhotoPreview(null);
    setSubmitError(null);
    setFormStatus('idle');
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <style>{`
        .radio-group label {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .radio-group label:hover {
          transform: translateX(2px);
        }
        .radio-group input[type="radio"] {
          transition: all 0.2s ease;
        }
        .radio-group input[type="radio"]:checked {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .form-radio, .form-checkbox {
          transition: all 0.2s ease;
        }
        .form-radio:checked, .form-checkbox:checked {
          animation: pulse 0.3s ease;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl border border-white/50 overflow-hidden">
          <ProgressBar progress={33} />

          <form onSubmit={handleSubmit} noValidate className="p-10">
            <div className="space-y-10">
              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input
                  label="First Name"
                  placeholder="Enter your first name"
                  type="text"
                  id="firstName"
                  value={userInfo.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required 
                  error={errors.firstName}
                  icon={<User />}
                />
                <Input
                  label="Last Name"
                  placeholder="Enter your last name"
                  type="text"
                  id="lastName"
                  value={userInfo.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  error={errors.lastName}
                  icon={<User />}
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="example@email.com"
                  id="email"
                  value={userInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={errors.email}
                  icon={<Mail />}
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="Enter your number"
                  id="phoneNumber"
                  value={userInfo.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  error={errors.phoneNumber}
                  icon={<Phone />}
                />
              </div>

              {/* Demographics - Gender */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender 
                  </label>
                  <div className="radio-group flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer py-2 px-3 rounded-lg hover:bg-gray-50 transition-all">
                      <input
                        type="radio"
                        name="gender"
                        value="M"
                        checked={userInfo.sex === 'M'}
                        onChange={(e) => handleInputChange('sex', e.target.value)}
                        className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">Male</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer py-2 px-3 rounded-lg hover:bg-gray-50 transition-all">
                      <input
                        type="radio"
                        name="gender"
                        value="F"
                        checked={userInfo.sex === 'F'}
                        onChange={(e) => handleInputChange('sex', e.target.value)}
                        className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">Female</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer py-2 px-3 rounded-lg hover:bg-gray-50 transition-all">
                      <input
                        type="radio"
                        name="gender"
                        value="O"
                        checked={userInfo.sex === 'O'}
                        onChange={(e) => handleInputChange('sex', e.target.value)}
                        className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">Other</span>
                    </label>
                  </div>
                  {errors.sex && <p className="text-red-500 text-sm mt-1">{errors.sex}</p>}
                </div>

                <Input
                  label="Date of Birth"
                  type="date"
                  id="dateOfBirth"
                  value={userInfo.dateOfBirth || ''}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  error={errors.dateOfBirth}
                  icon={<Calendar />}
                />
              </div>

              {/* Aadhaar + Photo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <Input
                  label="Aadhaar Number"
                  type="text"
                  id="aadharNumber"
                  placeholder="XXXX XXXX XXXX"
                  value={userInfo.aadharNumber}
                  onChange={(e) => handleInputChange('aadharNumber', e.target.value)}
                  error={errors.aadharNumber}
                  icon={<IdCard />}
                />
                {/* <PhotoUpload
                  photoPreview={photoPreview}
                  error={errors.photo}
                  onChange={handlePhotoChange}
                  currentFileName={userInfo.photo?.name}
                /> */}
                <div>
                <label className="flex items-center gap-2 cursor-pointer w-fit py-2 px-3 rounded-lg hover:bg-gray-50 transition-all">
                  <input
                    type="checkbox"
                    checked={userInfo.hasExperience}
                    onChange={(e) => handleInputChange('hasExperience', e.target.checked)}
                    className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="font-medium text-gray-700">Have Work Experience?</span>
                </label>

                {userInfo.hasExperience && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 border-t pt-6 transition-all duration-300 ease-in-out">
                    <Input
                      label="Years of Experience"
                      type="number"
                      id="experienceYears"
                      min="0"
                      value={userInfo.experienceYears}
                      onChange={(e) => handleInputChange('experienceYears', e.target.value)}
                      error={errors.experienceYears}
                      icon={<Briefcase />}
                    />
                    <Input
                      label="Company of Experience"
                      type="text"
                      id="companyOfExperience"
                      value={userInfo.companyOfExperience}
                      onChange={(e) => handleInputChange('companyOfExperience', e.target.value)}
                      error={errors.companyOfExperience}
                      icon={<Building2 />}
                    />
                  </div>
                )}
              </div>
              </div>

              {/* Employment Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type:</label>
                <div className="radio-group flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer py-2 px-3 rounded-lg hover:bg-gray-50 transition-all">
                    <input
                      type="radio"
                      name="employmentType"
                      value="contractual"
                      checked={userInfo.employmentType === 'contractual'}
                      onChange={(e) => handleInputChange('employmentType', e.target.value)}
                      className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Contractual</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer py-2 px-3 rounded-lg hover:bg-gray-50 transition-all">
                    <input
                      type="radio"
                      name="employmentType"
                      value="permanent"
                      checked={userInfo.employmentType === 'permanent'}
                      onChange={(e) => handleInputChange('employmentType', e.target.value)}
                      className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Permanent</span>
                  </label>
                </div>
              </div>

              {/* Experience Section */}
              
            </div>

            {/* Global Error Message */}
            {formStatus === 'error' && submitError && (
              <div className="mt-6 text-center text-red-600 font-medium animate-pulse">{submitError}</div>
            )}

            <FormActions onReset={handleReset} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </form>

          {formStatus === 'success' && (
            <StatusAlert
              type="success"
              title="Profile Created!"
              message="Redirecting you to the employee list..."
            />
          )}
        </div>
      </div>
    </div>
  );
};