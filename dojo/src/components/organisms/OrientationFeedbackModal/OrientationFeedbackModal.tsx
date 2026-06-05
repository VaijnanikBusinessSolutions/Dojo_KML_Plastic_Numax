

import React, { useState, useEffect } from 'react';
import type { OrientationFeedbackModalProps, User } from '../../constants/types';
import { API_ENDPOINTS } from '../../constants/api';
import { ModalHeader } from '../../molecules/ModalHeader/ModalHeader';
import { UserInfoSection } from '../../molecules/UserInfoSection/UserInfoSection';
import { OrientationForm } from '../../molecules/OrientationForm/OrientationForm';
import { ModalFooter } from '../../molecules/ModalFooter/ModalFooter';

// Define the shape of the user form data
interface UserFormData {
  firstName: string;
  lastName: string;
  // REMOVED: designation is no longer here, it is in OrientationFields now.
  email: string;
  phoneNumber: string;
  aadharNumber: string;
  employmentType: string;
  hasExperience: boolean;
  experienceYears: number;
  companyOfExperience: string;
}

export const OrientationFeedbackModal: React.FC<OrientationFeedbackModalProps> = ({
  user,
  onClose,
  onSave
}) => {
  // --- STATE FOR THE ORIENTATION FORM ---
  // designation lives here now
  const [orientationFields, setOrientationFields] = useState({
    emp_id: '',
    department: '',
    date_of_joining: '',
    designation: '', 
  });
  
  // --- STATE FOR THE USER INFO FORM ---
  const [userInfo, setUserInfo] = useState<UserFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset state when the user prop changes
  useEffect(() => {
    setOrientationFields({ emp_id: '', department: '', date_of_joining: '' , designation: ''});
    setUserInfo(null);
    setError(undefined);
    setShowSuccess(false);
  }, [user]);

  // --- HANDLER TO RECEIVE DATA FROM UserInfoSection ---
  const handleUserInfoUpdate = (updatedData: UserFormData) => {
    setUserInfo(updatedData);
  };
  
  // --- UNIFIED SAVE FUNCTION ---
  const handleSave = async () => {
    // 1. VALIDATION
    if (!orientationFields.emp_id  || !orientationFields.date_of_joining) {
      setError('Please fill out Employee ID and Date of Joining.');
      setTimeout(() => setError(undefined), 5000);
      return;
    }

    // 2. VALIDATION
    const finalFirstName = userInfo?.firstName || user.first_name;
    
    if (!finalFirstName) {
      setError('First Name is required.');
      setTimeout(() => setError(undefined), 5000);
      return;
    }

    setLoading(true);
    setError(undefined);

    // 3. PAYLOAD CONSTRUCTION
    const finalPayload = {
      // Required Fields from Orientation Form
      emp_id: orientationFields.emp_id,
      department: orientationFields.department || '', 
      date_of_joining: orientationFields.date_of_joining,
      
      // ADDED: Designation (Read directly from orientationFields)
      designation: orientationFields.designation ?? '',

      // Fields from User Info Form (or fallbacks)
      first_name: finalFirstName,
      last_name: userInfo?.lastName ?? user.last_name ?? '',
      email: userInfo?.email ?? user.email ?? '',
      phone: userInfo?.phoneNumber ?? user.phone ?? '',
      aadhar_number: userInfo?.aadharNumber ?? '', 
      employment_type: userInfo?.employmentType ?? '',
      
      has_experience: userInfo?.hasExperience ?? false,
      experience_years: userInfo?.experienceYears ?? 0,
      company_of_experience: userInfo?.companyOfExperience ?? '',
      
      sex: user.sex, 
    };

    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.EMPLOYEES}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      });

      if (response.ok) {
        await fetch(`${API_ENDPOINTS.BASE_URL}/user-body-checks/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ temp_id: user.temp_id })
        });

        setShowSuccess(true);
        setTimeout(() => {
          onSave();
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(`Error: ${JSON.stringify(errorData)}`);
        setTimeout(() => setError(undefined), 5000);
      }
    } catch (error) {
      setError(`Network error: ${error}`);
      setTimeout(() => setError(undefined), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-3xl animate-slideUp">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500 ring-1 ring-white/10">
            
            {/* Header */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="relative bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-blue-500/10 backdrop-blur-xl border-b border-white/20">
                <div className="px-8 py-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent animate-shimmer">
                        Orientation Feedback
                      </h2>
                      <p className="mt-2 text-blue-100/80 text-sm">
                        Complete the employee onboarding process
                      </p>
                    </div>
                    <button onClick={onClose} className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 group backdrop-blur-sm">
                      <svg className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="max-h-[calc(90vh-200px)] overflow-y-auto custom-scrollbar">
              <div className="p-8 space-y-6">
                
                {/* Success Message */}
                {showSuccess && (
                  <div className="animate-slideDown">
                    <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-2xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-emerald-700 font-medium">Orientation feedback saved successfully!</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="animate-shake">
                    <div className="bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/30 rounded-2xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-red-700 text-sm">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* User Info Section */}
                <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Employee Information</h3>
                  </div>
                  <UserInfoSection user={user} onFormUpdate={handleUserInfoUpdate} />
                </div>

                {/* Orientation Form Section */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-indigo-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Orientation Details <span className="text-red-500 text-sm">*Required</span></h3>
                  </div>
                  <OrientationForm orientationFields={orientationFields} setOrientationFields={setOrientationFields} error={error} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 px-8 py-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Emp ID & DOJ are required to save.</p>
                <div className="flex gap-3">
                  <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300">Cancel</button>
                  <button onClick={handleSave} disabled={loading} className="px-6 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group">
                    <span className={`flex items-center gap-2 ${loading ? 'opacity-0' : ''}`}>
                      Add To Mastertable
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </span>
                    {loading && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); } 20%, 40%, 60%, 80% { transform: translateX(2px); } }
        @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .animate-shimmer { animation: shimmer 3s linear infinite; background-size: 2000px 100%; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 100px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #6366f1, #8b5cf6); border-radius: 100px; border: 2px solid #f1f5f9; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, #4f46e5, #7c3aed); }
      `}</style>
    </>
  );
};

export default OrientationFeedbackModal;