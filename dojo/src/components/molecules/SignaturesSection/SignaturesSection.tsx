

// import React, { useState } from 'react';
// import { User, Save, Download, CheckCircle, XCircle } from 'lucide-react';
// import type { FormData } from '../../constants/types';

// interface SignaturesSectionProps {
//   formData: FormData;
//   handleInputChange: (section: string, field: string, value: string) => void;
//   handleSave: () => void;
//   handleDownloadPDF?: () => void;
// }

// const SignaturesSection: React.FC<SignaturesSectionProps> = ({
//   formData,
//   handleInputChange,
//   handleSave,
//   handleDownloadPDF
// }) => {
//   const [isSaving, setIsSaving] = useState(false);
//   const [showToast, setShowToast] = useState(false);
//   const [toastMessage, setToastMessage] = useState({ type: 'success', text: '' });

//   const handleSaveClick = async () => {
//     setIsSaving(true);
    
//     try {
//       await handleSave();
      
//       // Show success toast
//       setToastMessage({ type: 'success', text: 'Assessment saved successfully!' });
//       setShowToast(true);
      
//       // Hide toast after 3 seconds
//       setTimeout(() => setShowToast(false), 3000);
//     } catch (error) {
//       // Show error toast
//       setToastMessage({ type: 'error', text: 'Failed to save assessment. Please try again.' });
//       setShowToast(true);
//       setTimeout(() => setShowToast(false), 3000);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <div className="space-y-10">
//       {/* Toast Notification - Now at Bottom */}
//       {showToast && (
//         <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-300 animate-in slide-in-from-bottom ${
//           toastMessage.type === 'success' 
//             ? 'bg-green-500 text-white' 
//             : 'bg-red-500 text-white'
//         }`}>
//           {toastMessage.type === 'success' ? (
//             <CheckCircle className="w-5 h-5" />
//           ) : (
//             <XCircle className="w-5 h-5" />
//           )}
//           <span className="font-semibold">{toastMessage.text}</span>
//         </div>
//       )}

//       {/* Signatures & Approval */}
//       <div>
//         <div className="flex items-center gap-3 mb-6">
//           <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
//             <User className="w-5 h-5 text-white" />
//           </div>
//           <h2 className="text-2xl font-bold text-gray-800">Signatures & Approval</h2>
//         </div>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="space-y-2">
//             <label className="block text-sm font-semibold text-gray-700">Prepared By</label>
//             <input
//               type="text"
//               value={formData.signatures.preparedBy}
//               onChange={(e) => handleInputChange('signatures', 'preparedBy', e.target.value)}
//               className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
//               placeholder="Enter preparer name"
//             />
//           </div>

//           <div className="space-y-2">
//             <label className="block text-sm font-semibold text-gray-700">Approved By</label>
//             <input
//               type="text"
//               value={formData.signatures.approvedBy}
//               onChange={(e) => handleInputChange('signatures', 'approvedBy', e.target.value)}
//               className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
//               placeholder="Enter approver name"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Action Buttons */}
//       <div className="flex flex-col sm:flex-row gap-4 justify-center">
//         <button
//           onClick={handleSaveClick}
//           disabled={isSaving}
//           className={`flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
//             isSaving ? 'animate-pulse' : ''
//           }`}
//         >
//           {isSaving ? (
//             <>
//               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
//               Saving...
//             </>
//           ) : (
//             <>
//               <Save className="w-5 h-5" />
//               Save Assessment
//             </>
//           )}
//         </button>

//         <button
//           onClick={handleDownloadPDF}
//           className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
//         >
//           <Download className="w-5 h-5" />
//           Download PDF
//         </button>
//       </div>
//     </div>
//   );
// };

// export default SignaturesSection;




import React, { useState } from 'react';
import { User, Save, Download, CheckCircle, XCircle } from 'lucide-react';
import type { FormData } from '../../constants/types';

interface SignaturesSectionProps {
  formData: FormData;
  handleInputChange: (section: string, field: string, value: string) => void;
  handleSave: () => void;
  handleDownloadPDF?: () => void;
}

const SignaturesSection: React.FC<SignaturesSectionProps> = ({
  formData,
  handleInputChange,
  handleSave,
  handleDownloadPDF
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ type: 'success', text: '' });

  const handleSaveClick = async () => {
    setIsSaving(true);
    
    try {
      await handleSave();
      
      // Show success toast
      setToastMessage({ type: 'success', text: 'Assessment saved successfully!' });
      setShowToast(true);
      
      // Hide toast after 3 seconds
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      // Show error toast
      setToastMessage({ type: 'error', text: 'Failed to save assessment. Please try again.' });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Toast Notification - Now at Bottom */}
      {showToast && (
        <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-300 animate-in slide-in-from-bottom ${
          toastMessage.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {toastMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span className="font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* Signatures & Approval */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <User className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Signatures & Approval</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Prepared By</label>
            <input
              type="text"
              value={formData.signatures.preparedBy}
              onChange={(e) => handleInputChange('signatures', 'preparedBy', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
              placeholder="Enter preparer name"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Approved By</label>
            <input
              type="text"
              value={formData.signatures.approvedBy}
              onChange={(e) => handleInputChange('signatures', 'approvedBy', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
              placeholder="Enter approver name"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleSaveClick}
          disabled={isSaving}
          className={`flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
            isSaving ? 'animate-pulse' : ''
          }`}
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Assessment
            </>
          )}
        </button>

        <button
          onClick={handleDownloadPDF}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Download className="w-5 h-5" />
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default SignaturesSection;

