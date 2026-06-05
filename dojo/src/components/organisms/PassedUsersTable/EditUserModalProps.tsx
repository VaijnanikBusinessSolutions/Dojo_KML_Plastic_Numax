import React, { useState, useEffect } from 'react';
import type { User } from '../../constants/types';
import { API_ENDPOINTS } from '../../constants/api';

// Interface defining the component's props
interface EditUserModalProps {
  user: User | null;
  isLoading: boolean;
  onClose: () => void;
  onSave: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, isLoading, onClose, onSave }) => {
  // The internal state for the form
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    sex: 'M',
    dateOfBirth: '',
    aadharNumber: '',
    employmentType: 'contractual',
    hasExperience: false,
    experienceYears: 0,
    companyOfExperience: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState(false);

  // Map user data to form state
  useEffect(() => {
    if (user && !isLoading) {
      setFormData({
        firstName:         user.first_name || '',
        lastName:          user.last_name || '',
        email:             user.email || '',
        phoneNumber:       user.phone_number || '',
        sex:               user.sex || 'M',
        employmentType:    user.employment_type || 'contractual',
        dateOfBirth:       user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        aadharNumber:      user.aadharNumber || '',
        hasExperience:     user.hasExperience || false,
        experienceYears:   user.experienceYears || 0,
        companyOfExperience: user.companyOfExperience || '',
      });
    }
  }, [user, isLoading]);

  // Handles changes for all input types
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handles the form submission
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Cannot save, user data is missing.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/users/${user.temp_id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = Object.keys(errorData).map(key => `${key}: ${errorData[key]}`).join(' ');
        throw new Error(errorMessage || 'Failed to save user data.');
      }

      setSuccessMessage(true);
      setTimeout(() => {
        onSave();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gradient-to-br from-gray-900/90 via-slate-800/90 to-gray-900/90 
                   backdrop-blur-md z-50 animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex justify-center items-center z-50 p-4 pointer-events-none">
        <div className="pointer-events-auto animate-slideUp">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden
                          ring-1 ring-black/5">
            
            {/* Header */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                      <span className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </span>
                      Edit User Details
                    </h2>
                    <p className="mt-1 text-blue-100 text-sm">Update employee information</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 
                               backdrop-blur-sm transition-all duration-300 group"
                  >
                    <svg className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-180px)] custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col justify-center items-center h-64 space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-indigo-600 rounded-full animate-spin 
                                    border-t-transparent absolute inset-0"></div>
                  </div>
                  <p className="text-gray-600 animate-pulse">Loading user details...</p>
                </div>
              ) : (
                <form onSubmit={handleSave} className="space-y-6">
                  {/* Success Message */}
                  {successMessage && (
                    <div className="animate-slideDown bg-green-50 border border-green-200 rounded-2xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-green-700 font-medium">User details saved successfully!</p>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="animate-shake bg-red-50 border border-red-200 rounded-2xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-red-700 text-sm">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Personal Information Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg 
                                     flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </span>
                      Personal Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* First Name */}
                      <div className="group">
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <input 
                          type="text" 
                          name="firstName" 
                          id="firstName" 
                          value={formData.firstName} 
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl 
                                   focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                   hover:border-indigo-400 transition-all duration-200
                                   bg-white/50 backdrop-blur-sm"
                        />
                      </div>

                      {/* Last Name */}
                      <div className="group">
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input 
                          type="text" 
                          name="lastName" 
                          id="lastName" 
                          value={formData.lastName} 
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl 
                                   focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                   hover:border-indigo-400 transition-all duration-200
                                   bg-white/50 backdrop-blur-sm"
                        />
                      </div>

                      {/* Email */}
                      <div className="md:col-span-2 group">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input 
                          type="email" 
                          name="email" 
                          id="email" 
                          value={formData.email} 
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl 
                                   focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                   hover:border-indigo-400 transition-all duration-200
                                   bg-white/50 backdrop-blur-sm"
                        />
                      </div>

                      {/* Phone Number */}
                      <div className="group">
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input 
                          type="tel" 
                          name="phoneNumber" 
                          id="phoneNumber" 
                          value={formData.phoneNumber} 
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl 
                                   focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                   hover:border-indigo-400 transition-all duration-200
                                   bg-white/50 backdrop-blur-sm"
                        />
                      </div>

                      {/* Aadhar Number */}
                      <div className="group">
                        <label htmlFor="aadharNumber" className="block text-sm font-medium text-gray-700 mb-1">
                          Aadhar Number
                        </label>
                        <input 
                          type="text" 
                          name="aadharNumber" 
                          id="aadharNumber" 
                          value={formData.aadharNumber} 
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl 
                                   focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                   hover:border-indigo-400 transition-all duration-200
                                   bg-white/50 backdrop-blur-sm"
                        />
                      </div>

                      {/* Date of Birth */}
                      <div className="group">
                        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                          Date of Birth
                        </label>
                        <input 
                          type="date" 
                          name="dateOfBirth" 
                          id="dateOfBirth" 
                          value={formData.dateOfBirth} 
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl 
                                   focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                   hover:border-indigo-400 transition-all duration-200
                                   bg-white/50 backdrop-blur-sm"
                        />
                      </div>

                      {/* Sex */}
                      <div className="group">
                        <label htmlFor="sex" className="block text-sm font-medium text-gray-700 mb-1">
                          Gender
                        </label>
                        <select 
                          name="sex" 
                          id="sex" 
                          value={formData.sex} 
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl 
                                   focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                   hover:border-indigo-400 transition-all duration-200
                                   bg-white/50 backdrop-blur-sm cursor-pointer"
                        >
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                          <option value="O">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Employment Information Section */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg 
                                     flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </span>
                      Employment Details
                    </h3>

                    {/* Employment Type */}
                    <div className="mb-4">
                      <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700 mb-1">
                        Employment Type
                      </label>
                      <select 
                        name="employmentType" 
                        id="employmentType" 
                        value={formData.employmentType} 
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl 
                                 focus:ring-2 focus:ring-purple-500 focus:border-transparent
                                 hover:border-purple-400 transition-all duration-200
                                 bg-white/50 backdrop-blur-sm cursor-pointer"
                      >
                        <option value="contractual">Contractual</option>
                        <option value="permanent">Permanent</option>
                      </select>
                    </div>

                    {/* Experience Checkbox */}
                    <div className="flex items-center p-4 bg-white/50 rounded-xl border border-purple-200 
                                  hover:bg-white/70 transition-all duration-200">
                      <input 
                        type="checkbox" 
                        name="hasExperience" 
                        id="hasExperience" 
                        checked={formData.hasExperience} 
                        onChange={handleChange}
                        className="h-5 w-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 
                                 cursor-pointer"
                      />
                      <label htmlFor="hasExperience" className="ml-3 text-sm font-medium text-gray-700 cursor-pointer">
                        Has Prior Experience?
                      </label>
                    </div>

                    {/* Experience Fields */}
                    {formData.hasExperience && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-slideDown">
                        <div className="group">
                          <label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700 mb-1">
                            Years of Experience
                          </label>
                          <input 
                            type="number" 
                            name="experienceYears" 
                            id="experienceYears" 
                            value={formData.experienceYears} 
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl 
                                     focus:ring-2 focus:ring-purple-500 focus:border-transparent
                                     hover:border-purple-400 transition-all duration-200
                                     bg-white/50 backdrop-blur-sm"
                          />
                        </div>

                        <div className="group">
                          <label htmlFor="companyOfExperience" className="block text-sm font-medium text-gray-700 mb-1">
                            Previous Company
                          </label>
                          <input 
                            type="text" 
                            name="companyOfExperience" 
                            id="companyOfExperience" 
                            value={formData.companyOfExperience} 
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl 
                                     focus:ring-2 focus:ring-purple-500 focus:border-transparent
                                     hover:border-purple-400 transition-all duration-200
                                     bg-white/50 backdrop-blur-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4">
                    <button 
                      type="button" 
                      onClick={onClose}
                      className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl
                               hover:bg-gray-200 hover:shadow-md transform hover:-translate-y-0.5
                               transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSaving}
                      className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 
                               text-white font-medium rounded-xl hover:from-indigo-700 
                               hover:to-purple-700 shadow-lg hover:shadow-xl 
                               transform hover:-translate-y-0.5 transition-all duration-200
                               disabled:opacity-50 disabled:cursor-not-allowed 
                               disabled:transform-none relative overflow-hidden group"
                    >
                      <span className={`flex items-center gap-2 ${isSaving ? 'opacity-0' : ''}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
                        </svg>
                        Save Changes
                      </span>
                      {isSaving && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" 
                                    stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" 
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes slideDown {
          from { 
            opacity: 0;
            transform: translateY(-10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 100px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #6366f1, #a855f7);
          border-radius: 100px;
          border: 2px solid #f1f5f9;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #4f46e5, #9333ea);
        }
      `}</style>
    </>
  );
};

export default EditUserModal;

