// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Check, X, Plus, Save, User, Edit, XCircle } from 'lucide-react';
// import { Button } from '../../atoms/Buttons/Button';

// import type { AddItemFormProps, CheckSheetContainerProps, CheckSheetHeaderProps, HumanBodyCheckSheetProps, InfoItemProps, UserInfoCardProps, SheetAnswer, CheckDataResponse } from '../../constants/types';
// import { humanBodyCheckService } from '../../hooks/ServiceApis';

// // Interfaces for dynamic questions
// interface Question {
//   id: number;
//   question_text: string;
// }

// interface CheckItem {
//   question_id?: number;
//   description: string;
//   status: 'pass' | 'fail' | '';
// }

// interface DynamicCheckData {
//   [key: string]: CheckItem;
// }

// // --- PROP TYPES FOR COMPONENTS ---

// interface StatusToggleButtonProps {
//   status: 'pass' | 'fail' | '';
//   onClick: () => void;
//   disabled?: boolean;
// }

// interface CheckItemRowProps {
//   id: string;
//   item: CheckItem;
//   onStatusChange: (id: string, status: 'pass' | 'fail' | '') => void;
//   isReadOnly: boolean;
// }

// interface CheckTableHeaderProps {
//   onAllPassClick: () => void;
//   isReadOnly: boolean;
// }

// interface CheckTableProps {
//   checkData: DynamicCheckData;
//   onStatusChange: (id: string, status: 'pass' | 'fail' | '') => void;
//   showAddForm: boolean;
//   newItem: string;
//   onNewItemChange: (value: string) => void;
//   onAddItem: () => void;
//   onCancelAdd: () => void;
//   onAllPassClick: () => void;
//   isReadOnly: boolean;
// }

// interface ActionBarProps {
//   onAddNew: () => void;
//   onSave: () => void;
//   onEdit: () => void;
//   onCancelEdit: () => void;
//   showAddForm: boolean;
//   isExisting: boolean;
//   isEditMode: boolean;
//   isReadOnly: boolean;
//   loading: boolean;
// }


// // --- ATOMIC & LAYOUT COMPONENTS ---

// const CheckSheetHeader: React.FC<CheckSheetHeaderProps> = ({ title }) => (
//   <header className="bg-gray-100 border-b-2 border-gray-800 p-4">
//     <h1 className="text-xl font-bold text-center">{title}</h1>
//   </header>
// );

// const UserInfoCard: React.FC<UserInfoCardProps> = ({ userDetails, tempId }) => {
//   const { firstName, email, phoneNumber } = userDetails;

//   return (
//     <section className="bg-gray-50 p-4 border border-black">
//       <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
//         <User className="w-5 h-5 mr-2 text-blue-600" />
//         User Information
//       </h3>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div className="space-y-2">
//           <InfoItem label="Name" value={`${firstName}`} />
//           <InfoItem
//             label="Temp ID"
//             value={tempId}
//             valueClassName="font-mono bg-gray-100 px-2 py-1 rounded"
//           />
//         </div>
//         <div className="space-y-2">
//           <InfoItem label="Email" value={email} valueClassName="break-all" />
//           <InfoItem label="Phone" value={phoneNumber} />
//         </div>
//       </div>
//     </section>
//   );
// };

// const InfoItem: React.FC<InfoItemProps> = ({ label, value, valueClassName = '' }) => (
//   <div className="flex items-start">
//     <span className="text-gray-600 font-medium w-24">{label}:</span>
//     <span className={`text-gray-800 ${valueClassName}`}>{value}</span>
//   </div>
// );

// const CheckTableHeader: React.FC<CheckTableHeaderProps> = ({ onAllPassClick, isReadOnly }) => (
//   <header className="grid grid-cols-12 border-b-2 border-gray-800 bg-gray-50">
//     <div className="col-span-1 p-3 border-r-2 border-gray-800 font-semibold text-center">Sr No</div>
//     <div className="col-span-9 p-3 border-r-2 border-gray-800 font-semibold text-center">Description</div>
//     <div className="col-span-2 p-3 font-semibold text-center flex items-center justify-center gap-4">
//       <span>✓ / ✗</span>
//       <div>
//          <button
//             onClick={onAllPassClick}
//             disabled={isReadOnly}
//             title={isReadOnly ? "Click 'Edit' to make changes" : "Mark all items as Pass"}
//             className="px-2 py-1 text-xs font-bold text-white bg-green-500 rounded hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
//           >
//             ALL ✓
//           </button>
//       </div>
//     </div>
//   </header>
// );

// const CheckItemRow: React.FC<CheckItemRowProps> = ({ id, item, onStatusChange, isReadOnly }) => {
//   const getStatusColor = (status: 'pass' | 'fail' | '') => {
//     if (status === 'pass') return 'bg-green-100 border-green-300';
//     if (status === 'fail') return 'bg-red-100 border-red-300';
//     return 'bg-gray-50 border-gray-300';
//   };

//   const handleToggleStatus = () => {
//     if (isReadOnly) return;
//     let nextStatus: 'pass' | 'fail' | '' = '';
//     if (item.status === '') nextStatus = 'pass';
//     else if (item.status === 'pass') nextStatus = 'fail';
//     else nextStatus = '';
//     onStatusChange(id, nextStatus);
//   };

//   return (
//     <article className={`grid grid-cols-12 border-b border-gray-300 ${getStatusColor(item.status)}`}>
//       <div className="col-span-1 p-3 border-r-2 border-gray-800 text-center font-medium">{id}</div>
//       <div className="col-span-9 p-3 border-r-2 border-gray-800">
//         <span className="text-sm">{item.description}</span>
//       </div>
//       <div className="col-span-2 p-3 flex justify-center items-center">
//         <StatusToggleButton
//           status={item.status}
//           onClick={handleToggleStatus}
//           disabled={isReadOnly}
//         />
//       </div>
//     </article>
//   );
// };

// const StatusToggleButton: React.FC<StatusToggleButtonProps> = ({ status, onClick, disabled = false }) => {
//   const getButtonClasses = () => {
//     const baseClasses = 'p-3 rounded border-2 transition-colors w-16 h-12 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed';
//     if (status === 'pass') return `${baseClasses} bg-green-500 border-green-500 text-white`;
//     if (status === 'fail') return `${baseClasses} bg-red-500 border-red-500 text-white`;
//     return `${baseClasses} bg-white border-gray-300 hover:border-blue-500`;
//   };

//   return (
//     <button onClick={onClick} className={getButtonClasses()} disabled={disabled}>
//       {status === 'pass' && <Check className="w-5 h-5" />}
//       {status === 'fail' && <X className="w-5 h-5" />}
//       {status === '' && <span className="text-gray-400">-</span>}
//     </button>
//   );
// };

// const AddItemForm: React.FC<AddItemFormProps> = ({ newItem, onNewItemChange, onAdd, onCancel }) => (
//   <form className="grid grid-cols-12 border-b border-gray-300 bg-blue-50" onSubmit={(e) => { e.preventDefault(); onAdd(); }}>
//     <div className="col-span-1 p-3 border-r-2 border-gray-800 text-center">+</div>
//     <div className="col-span-9 p-3 border-r-2 border-gray-800">
//       <input
//         type="text"
//         value={newItem}
//         onChange={(e) => onNewItemChange(e.target.value)}
//         placeholder="Enter new check item..."
//         className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//         onKeyPress={(e) => e.key === 'Enter' && onAdd()}
//         autoFocus
//         required
//       />
//     </div>
//     <div className="col-span-2 p-3 flex justify-center gap-2">
//       <Button onClick={onAdd} variant="primary" size="sm" className="bg-green-500 hover:bg-green-600 text-white" type="button">Add</Button>
//       <Button onClick={onCancel} variant="secondary" size="sm" className="bg-gray-500 hover:bg-gray-600 text-white" type="button">Cancel</Button>
//     </div>
//   </form>
// );

// const CheckTable: React.FC<CheckTableProps> = ({
//   checkData,
//   onStatusChange,
//   showAddForm,
//   newItem,
//   onNewItemChange,
//   onAddItem,
//   onCancelAdd,
//   onAllPassClick,
//   isReadOnly,
// }) => (
//   <section className="check-table">
//     <CheckTableHeader onAllPassClick={onAllPassClick} isReadOnly={isReadOnly} />
//     {Object.entries(checkData).map(([id, item]) => (
//       <CheckItemRow key={id} id={id} item={item} onStatusChange={onStatusChange} isReadOnly={isReadOnly} />
//     ))}
//     {showAddForm && <AddItemForm newItem={newItem} onNewItemChange={onNewItemChange} onAdd={onAddItem} onCancel={onCancelAdd} />}
//   </section>
// );

// const ActionBar: React.FC<ActionBarProps> = ({
//   onSave,
//   onEdit,
//   onCancelEdit,
//   isExisting,
//   isEditMode,
//   isReadOnly,
//   loading
// }) => (
//   <footer className="mt-6 p-2 flex justify-end items-center gap-4">
//     {isExisting && !isEditMode && (
//       <Button
//         onClick={onEdit}
//         // variant="secondary"
//         className="flex items-center gap-2 bg-blue-500  text-white"
//       >
//         <Edit className="w-4 h-4" />
//         Edit
//       </Button>
//     )}
//     {isEditMode && (
//        <Button
//         onClick={onCancelEdit}
//         // variant="secondary"
//         className="flex items-center gap-2 bg-gray-500 text-white"
//       >
//         <XCircle className="w-4 h-4" />
//         Cancel
//       </Button>
//     )}
//     <Button
//       onClick={onSave}
//       variant="primary"
//       className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
//       disabled={isReadOnly}
//       loading={loading}
//       title={isReadOnly ? "Click 'Edit' to enable saving" : "Save check data"}
//     >
//       <Save className="w-4 h-4" />
//       {isExisting ? 'Update Data' : 'Save Data'}
//     </Button>
//   </footer>
// );

// const CheckSheetContainer: React.FC<CheckSheetContainerProps> = ({ children }) => (
//   <div className="max-w-4xl mx-auto p-6 bg-white">
//     <div className="border-2 border-gray-800 rounded-lg overflow-hidden">
//       {children}
//     </div>
//   </div>
// );


// // --- CUSTOM HOOKS ---

// const useCheckData = (tempId: string) => {
//   const [checkData, setCheckData] = useState<DynamicCheckData>({});
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [isExisting, setIsExisting] = useState<boolean>(false);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string>('');
//   const [originalData, setOriginalData] = useState<DynamicCheckData>({});

//   useEffect(() => {
//     const fetchQuestionsAndData = async () => {
//       setLoading(true);
//       setError('');
//       try {
//         const questionsData = await humanBodyCheckService.fetchQuestions();
//         setQuestions(questionsData);

//         const initialCheckData: DynamicCheckData = {};
//         questionsData.forEach((question, index) => {
//           const id = (index + 1).toString();
//           initialCheckData[id] = { question_id: question.id, description: question.question_text, status: '' };
//         });

//         if (tempId) {
//           const responseData: CheckDataResponse[] = await humanBodyCheckService.fetchCheckDataByTempId(tempId);
//           if (responseData && responseData.length > 0) {
//             const existingCheck = responseData[0];
//             if (Array.isArray(existingCheck.sheet_answers) && existingCheck.sheet_answers.length > 0) {
//               setIsExisting(true);
//               const questionIdToKeyMap = Object.entries(initialCheckData).reduce((acc, [key, item]) => {
//                 if (item.question_id) acc[item.question_id] = key;
//                 return acc;
//               }, {} as Record<number, string>);
//               existingCheck.sheet_answers.forEach((answer: SheetAnswer) => {
//                 const localKey = questionIdToKeyMap[answer.question];
//                 if (localKey && initialCheckData[localKey]) {
//                   const statusValue = (answer.answer === 'pass' || answer.answer === 'fail') ? answer.answer : '';
//                   initialCheckData[localKey].status = statusValue;
//                 }
//               });
//             }
//           }
//         }
//         setCheckData(initialCheckData);
//         setOriginalData(JSON.parse(JSON.stringify(initialCheckData)));
//       } catch (err) {
//         setError('Failed to fetch questions or check data. Please try again.');
//         console.error('Failed to fetch data', err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchQuestionsAndData();
//   }, [tempId]);

//   const updateCheckStatus = (id: string, status: 'pass' | 'fail' | '') => {
//     setCheckData(prev => ({ ...prev, [id]: { ...prev[id], status } }));
//   };

//   const addNewCheck = (description: string) => {
//     if (description.trim()) {
//       const existingIds = Object.keys(checkData).map(id => parseInt(id));
//       const newId = (Object.keys(checkData).length > 0 ? Math.max(...existingIds) : 0) + 1;
//       setCheckData(prev => ({ ...prev, [newId.toString()]: { description, status: '' } }));
//     }
//   };

//   const setAllToPass = () => {
//     setCheckData(prev => {
//       const allPassData = Object.entries(prev).reduce((acc, [id, item]) => {
//         acc[id] = { ...item, status: 'pass' };
//         return acc;
//       }, {} as DynamicCheckData);
//       return allPassData;
//     });
//   };

//   const revertChanges = () => {
//     setCheckData(originalData);
//   };

//   return {
//     checkData,
//     questions,
//     isExisting,
//     loading,
//     error,
//     updateCheckStatus,
//     addNewCheck,
//     setAllToPass,
//     revertChanges,
//     setOriginalData,
//   };
// };

// const useSaveCheckData = () => {
//   const [saving, setSaving] = useState<boolean>(false);
//   const navigate = useNavigate();

//   const saveCheckData = async (tempId: string, checkData: DynamicCheckData, isExisting: boolean, onSaveSuccess?: () => void) => {
//     setSaving(true);
//     try {
//       const payload = { temp_id: tempId, checkData: checkData };
//       if (isExisting) {
//         // IMPORTANT: Assumes you have an updateCheckData method in your service
//         await humanBodyCheckService.updateCheckData(payload);
//         alert('Data updated successfully!');
//       } else {
//         await humanBodyCheckService.saveCheckData(payload);
//         alert('Data saved successfully!');
//         setTimeout(() => navigate('/PassedUsersTable'), 1500);
//       }
//       if (onSaveSuccess) onSaveSuccess();
//     } catch (error: unknown) {
//       const message = error instanceof Error ? error.message : 'Unknown error';
//       alert(`Error: ${message}`);
//     } finally {
//       setSaving(false);
//     }
//   };

//   return { saveCheckData, saving };
// };


// // --- MAIN COMPONENT ---

// const HumanBodyCheckSheet: React.FC<HumanBodyCheckSheetProps> = ({ tempId, userDetails, onNext }) => {
//   const [newItem, setNewItem] = useState<string>('');
//   const [showAddForm, setShowAddForm] = useState<boolean>(false);
//   const [isEditMode, setIsEditMode] = useState<boolean>(false);

//   const {
//     checkData,
//     isExisting,
//     loading,
//     error,
//     updateCheckStatus,
//     addNewCheck,
//     setAllToPass,
//     revertChanges,
//     setOriginalData,
//   } = useCheckData(tempId);

//   const { saveCheckData, saving } = useSaveCheckData();

//   // This single boolean determines if the form fields should be interactive.
//   const isReadOnly = isExisting && !isEditMode;

//   const handleEdit = () => {
//     setIsEditMode(true);
//   };

//   const handleCancelEdit = () => {
//     revertChanges();
//     setIsEditMode(false);
//   };

//   const handleAddNewItem = () => {
//     addNewCheck(newItem);
//     setNewItem('');
//     setShowAddForm(false);
//   };

//   const handleSaveData = () => {
//     const onSaveSuccess = () => {
//       if (isExisting) {
//         setIsEditMode(false);
//         // Update the "original" data to this new saved state.
//         // This ensures that if the user edits again, "Cancel" will revert to this state.
//         setOriginalData(JSON.parse(JSON.stringify(checkData)));
//       }
//       if (onNext) onNext();
//     };
//     saveCheckData(tempId, checkData, isExisting, onSaveSuccess);
//   };

//   if (loading) {
//     return (
//       <CheckSheetContainer>
//         <div className="p-8 text-center"><p>Loading questions and check data...</p></div>
//       </CheckSheetContainer>
//     );
//   }

//   if (error) {
//     return (
//       <CheckSheetContainer>
//         <div className="p-8 text-center text-red-600"><p>{error}</p></div>
//       </CheckSheetContainer>
//     );
//   }

//   return (
//     <CheckSheetContainer>
//       <CheckSheetHeader title="Human Body Check Point (Level-0)" />
//       <UserInfoCard userDetails={userDetails} tempId={tempId} />
//       <CheckTable
//         checkData={checkData}
//         onStatusChange={updateCheckStatus}
//         showAddForm={showAddForm}
//         newItem={newItem}
//         onNewItemChange={setNewItem}
//         onAddItem={handleAddNewItem}
//         onCancelAdd={() => setShowAddForm(false)}
//         onAllPassClick={() => { if (!isReadOnly) setAllToPass(); }}
//         isReadOnly={isReadOnly}
//       />
//       <ActionBar
//         onAddNew={() => setShowAddForm(true)}
//         onSave={handleSaveData}
//         onEdit={handleEdit}
//         onCancelEdit={handleCancelEdit}
//         showAddForm={showAddForm}
//         isExisting={isExisting}
//         isEditMode={isEditMode}
//         isReadOnly={isReadOnly}
//         loading={saving}
//       />
//     </CheckSheetContainer>
//   );
// };

// export default HumanBodyCheckSheet;




import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Plus, Save, User, Edit, XCircle, RotateCcw } from 'lucide-react';
import { Button } from '../../atoms/Buttons/Button';

import type { AddItemFormProps, CheckSheetContainerProps, CheckSheetHeaderProps, HumanBodyCheckSheetProps, InfoItemProps, UserInfoCardProps, SheetAnswer, CheckDataResponse } from '../../constants/types';
import { humanBodyCheckService } from '../../hooks/ServiceApis';

// Interfaces for dynamic questions
interface Question {
  id: number;
  question_text: string;
}

interface CheckItem {
  question_id?: number;
  description: string;
  status: 'pass' | 'fail' | '';
}

interface DynamicCheckData {
  [key: string]: CheckItem;
}

// --- PROP TYPES FOR COMPONENTS ---

interface StatusToggleButtonProps {
  status: 'pass' | 'fail' | '';
  onClick: () => void;
  disabled?: boolean;
}

interface CheckItemRowProps {
  id: string;
  item: CheckItem;
  onStatusChange: (id: string, status: 'pass' | 'fail' | '') => void;
  isReadOnly: boolean;
}

interface CheckTableHeaderProps {
  onCycleStatus: () => void;
  globalStatus: 'pass' | 'fail' | 'mixed' | 'empty';
  isReadOnly: boolean;
}

interface CheckTableProps {
  checkData: DynamicCheckData;
  onStatusChange: (id: string, status: 'pass' | 'fail' | '') => void;
  showAddForm: boolean;
  newItem: string;
  onNewItemChange: (value: string) => void;
  onAddItem: () => void;
  onCancelAdd: () => void;
  onCycleStatus: () => void;
  isReadOnly: boolean;
}

interface ActionBarProps {
  onAddNew: () => void;
  onSave: () => void;
  onEdit: () => void;
  onCancelEdit: () => void;
  showAddForm: boolean;
  isExisting: boolean;
  isEditMode: boolean;
  isReadOnly: boolean;
  loading: boolean;
}


// --- ATOMIC & LAYOUT COMPONENTS ---

const CheckSheetHeader: React.FC<CheckSheetHeaderProps> = ({ title }) => (
  <header className="bg-gray-100 border-b-2 border-gray-800 p-4">
    <h1 className="text-xl font-bold text-center">{title}</h1>
  </header>
);

const UserInfoCard: React.FC<UserInfoCardProps> = ({ userDetails, tempId }) => {
  const { firstName, email, phoneNumber } = userDetails;

  return (
    <section className="bg-gray-50 p-4 border border-black">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
        <User className="w-5 h-5 mr-2 text-blue-600" />
        User Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <InfoItem label="Name" value={`${firstName}`} />
          <InfoItem
            label="Temp ID"
            value={tempId}
            valueClassName="font-mono bg-gray-100 px-2 py-1 rounded"
          />
        </div>
        <div className="space-y-2">
          <InfoItem label="Email" value={email} valueClassName="break-all" />
          <InfoItem label="Phone" value={phoneNumber} />
        </div>
      </div>
    </section>
  );
};

const InfoItem: React.FC<InfoItemProps> = ({ label, value, valueClassName = '' }) => (
  <div className="flex items-start">
    <span className="text-gray-600 font-medium w-24">{label}:</span>
    <span className={`text-gray-800 ${valueClassName}`}>{value}</span>
  </div>
);

const CheckTableHeader: React.FC<CheckTableHeaderProps> = ({ onCycleStatus, globalStatus, isReadOnly }) => {
  
  // Determine Button Appearance based on current state
  const getButtonConfig = () => {
    // If currently all pass, next click makes them fail (Show Red/Cross)
    if (globalStatus === 'pass') {
      return { 
        text: 'ALL ✗', 
        classes: 'bg-red-500 hover:bg-red-600', 
        title: 'Mark all as Fail' 
      };
    }
    // If currently all fail, next click makes them empty (Show Gray/Clear)
    if (globalStatus === 'fail') {
      return { 
        text: 'CLEAR', 
        classes: 'bg-gray-500 hover:bg-gray-600', 
        title: 'Clear all selections' 
      };
    }
    // If empty or mixed, next click makes them pass (Show Green/Check)
    return { 
      text: 'ALL ✓', 
      classes: 'bg-green-500 hover:bg-green-600', 
      title: 'Mark all as Pass' 
    };
  };

  const config = getButtonConfig();

  return (
    <header className="grid grid-cols-12 border-b-2 border-gray-800 bg-gray-50">
      <div className="col-span-1 p-3 border-r-2 border-gray-800 font-semibold text-center">Sr No</div>
      <div className="col-span-9 p-3 border-r-2 border-gray-800 font-semibold text-center">Description</div>
      <div className="col-span-2 p-3 font-semibold text-center flex items-center justify-center gap-4">
        <span>✓ / ✗</span>
        <div>
           <button
              onClick={onCycleStatus}
              disabled={isReadOnly}
              title={isReadOnly ? "Edit to change" : config.title}
              className={`px-2 py-1 text-xs font-bold text-white rounded transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${config.classes}`}
            >
              {config.text}
            </button>
        </div>
      </div>
    </header>
  );
};

const CheckItemRow: React.FC<CheckItemRowProps> = ({ id, item, onStatusChange, isReadOnly }) => {
  const getStatusColor = (status: 'pass' | 'fail' | '') => {
    if (status === 'pass') return 'bg-green-100 border-green-300';
    if (status === 'fail') return 'bg-red-100 border-red-300';
    return 'bg-gray-50 border-gray-300';
  };

  const handleToggleStatus = () => {
    if (isReadOnly) return;
    let nextStatus: 'pass' | 'fail' | '' = '';
    if (item.status === '') nextStatus = 'pass';
    else if (item.status === 'pass') nextStatus = 'fail';
    else nextStatus = '';
    onStatusChange(id, nextStatus);
  };

  return (
    <article className={`grid grid-cols-12 border-b border-gray-300 ${getStatusColor(item.status)}`}>
      <div className="col-span-1 p-3 border-r-2 border-gray-800 text-center font-medium">{id}</div>
      <div className="col-span-9 p-3 border-r-2 border-gray-800">
        <span className="text-sm">{item.description}</span>
      </div>
      <div className="col-span-2 p-3 flex justify-center items-center">
        <StatusToggleButton
          status={item.status}
          onClick={handleToggleStatus}
          disabled={isReadOnly}
        />
      </div>
    </article>
  );
};

const StatusToggleButton: React.FC<StatusToggleButtonProps> = ({ status, onClick, disabled = false }) => {
  const getButtonClasses = () => {
    const baseClasses = 'p-3 rounded border-2 transition-colors w-16 h-12 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed';
    if (status === 'pass') return `${baseClasses} bg-green-500 border-green-500 text-white`;
    if (status === 'fail') return `${baseClasses} bg-red-500 border-red-500 text-white`;
    return `${baseClasses} bg-white border-gray-300 hover:border-blue-500`;
  };

  return (
    <button onClick={onClick} className={getButtonClasses()} disabled={disabled}>
      {status === 'pass' && <Check className="w-5 h-5" />}
      {status === 'fail' && <X className="w-5 h-5" />}
      {status === '' && <span className="text-gray-400">-</span>}
    </button>
  );
};

const AddItemForm: React.FC<AddItemFormProps> = ({ newItem, onNewItemChange, onAdd, onCancel }) => (
  <form className="grid grid-cols-12 border-b border-gray-300 bg-blue-50" onSubmit={(e) => { e.preventDefault(); onAdd(); }}>
    <div className="col-span-1 p-3 border-r-2 border-gray-800 text-center">+</div>
    <div className="col-span-9 p-3 border-r-2 border-gray-800">
      <input
        type="text"
        value={newItem}
        onChange={(e) => onNewItemChange(e.target.value)}
        placeholder="Enter new check item..."
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        onKeyPress={(e) => e.key === 'Enter' && onAdd()}
        autoFocus
        required
      />
    </div>
    <div className="col-span-2 p-3 flex justify-center gap-2">
      <Button onClick={onAdd} variant="primary" size="sm" className="bg-green-500 hover:bg-green-600 text-white" type="button">Add</Button>
      <Button onClick={onCancel} variant="secondary" size="sm" className="bg-gray-500 hover:bg-gray-600 text-white" type="button">Cancel</Button>
    </div>
  </form>
);

const CheckTable: React.FC<CheckTableProps> = ({
  checkData,
  onStatusChange,
  showAddForm,
  newItem,
  onNewItemChange,
  onAddItem,
  onCancelAdd,
  onCycleStatus,
  isReadOnly,
}) => {
  
  // Calculate global status for the header button
  const globalStatus = useMemo(() => {
    const values = Object.values(checkData);
    if (values.length === 0) return 'empty';
    if (values.every(item => item.status === 'pass')) return 'pass';
    if (values.every(item => item.status === 'fail')) return 'fail';
    if (values.every(item => item.status === '')) return 'empty';
    return 'mixed';
  }, [checkData]);

  return (
    <section className="check-table">
      <CheckTableHeader 
        onCycleStatus={onCycleStatus} 
        globalStatus={globalStatus} 
        isReadOnly={isReadOnly} 
      />
      {Object.entries(checkData).map(([id, item]) => (
        <CheckItemRow key={id} id={id} item={item} onStatusChange={onStatusChange} isReadOnly={isReadOnly} />
      ))}
      {showAddForm && <AddItemForm newItem={newItem} onNewItemChange={onNewItemChange} onAdd={onAddItem} onCancel={onCancelAdd} />}
    </section>
  );
};

const ActionBar: React.FC<ActionBarProps> = ({
  onSave,
  onEdit,
  onCancelEdit,
  isExisting,
  isEditMode,
  isReadOnly,
  loading
}) => (
  <footer className="mt-6 p-2 flex justify-end items-center gap-4">
    {isExisting && !isEditMode && (
      <Button
        onClick={onEdit}
        // variant="secondary"
        className="flex items-center gap-2 bg-blue-500  text-white"
      >
        <Edit className="w-4 h-4" />
        Edit
      </Button>
    )}
    {isEditMode && (
       <Button
        onClick={onCancelEdit}
        // variant="secondary"
        className="flex items-center gap-2 bg-gray-500 text-white"
      >
        <XCircle className="w-4 h-4" />
        Cancel
      </Button>
    )}
    <Button
      onClick={onSave}
      variant="primary"
      className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
      disabled={isReadOnly}
      loading={loading}
      title={isReadOnly ? "Click 'Edit' to enable saving" : "Save check data"}
    >
      <Save className="w-4 h-4" />
      {isExisting ? 'Update Data' : 'Save Data'}
    </Button>
  </footer>
);

const CheckSheetContainer: React.FC<CheckSheetContainerProps> = ({ children }) => (
  <div className="max-w-4xl mx-auto p-6 bg-white">
    <div className="border-2 border-gray-800 rounded-lg overflow-hidden">
      {children}
    </div>
  </div>
);


// --- CUSTOM HOOKS ---

const useCheckData = (tempId: string) => {
  const [checkData, setCheckData] = useState<DynamicCheckData>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isExisting, setIsExisting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [originalData, setOriginalData] = useState<DynamicCheckData>({});

  useEffect(() => {
    const fetchQuestionsAndData = async () => {
      setLoading(true);
      setError('');
      try {
        const questionsData = await humanBodyCheckService.fetchQuestions();
        setQuestions(questionsData);

        const initialCheckData: DynamicCheckData = {};
        questionsData.forEach((question, index) => {
          const id = (index + 1).toString();
          initialCheckData[id] = { question_id: question.id, description: question.question_text, status: '' };
        });

        if (tempId) {
          const responseData: CheckDataResponse[] = await humanBodyCheckService.fetchCheckDataByTempId(tempId);
          if (responseData && responseData.length > 0) {
            const existingCheck = responseData[0];
            if (Array.isArray(existingCheck.sheet_answers) && existingCheck.sheet_answers.length > 0) {
              setIsExisting(true);
              const questionIdToKeyMap = Object.entries(initialCheckData).reduce((acc, [key, item]) => {
                if (item.question_id) acc[item.question_id] = key;
                return acc;
              }, {} as Record<number, string>);
              existingCheck.sheet_answers.forEach((answer: SheetAnswer) => {
                const localKey = questionIdToKeyMap[answer.question];
                if (localKey && initialCheckData[localKey]) {
                  const statusValue = (answer.answer === 'pass' || answer.answer === 'fail') ? answer.answer : '';
                  initialCheckData[localKey].status = statusValue;
                }
              });
            }
          }
        }
        setCheckData(initialCheckData);
        setOriginalData(JSON.parse(JSON.stringify(initialCheckData)));
      } catch (err) {
        setError('Failed to fetch questions or check data. Please try again.');
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestionsAndData();
  }, [tempId]);

  const updateCheckStatus = (id: string, status: 'pass' | 'fail' | '') => {
    setCheckData(prev => ({ ...prev, [id]: { ...prev[id], status } }));
  };

  const addNewCheck = (description: string) => {
    if (description.trim()) {
      const existingIds = Object.keys(checkData).map(id => parseInt(id));
      const newId = (Object.keys(checkData).length > 0 ? Math.max(...existingIds) : 0) + 1;
      setCheckData(prev => ({ ...prev, [newId.toString()]: { description, status: '' } }));
    }
  };

  /**
   * Cycle Status:
   * 1. If currently All Pass -> Switch to All Fail
   * 2. If currently All Fail -> Switch to All Empty
   * 3. Else (Mixed or Empty) -> Switch to All Pass
   */
  const cycleAllStatus = () => {
    setCheckData(prev => {
      const allValues = Object.values(prev);
      if (allValues.length === 0) return prev;

      const isAllPass = allValues.every(item => item.status === 'pass');
      const isAllFail = allValues.every(item => item.status === 'fail');

      let nextStatus: 'pass' | 'fail' | '' = 'pass'; // Default next state is Pass

      if (isAllPass) {
        nextStatus = 'fail';
      } else if (isAllFail) {
        nextStatus = '';
      }
      
      const newCheckData = Object.entries(prev).reduce((acc, [id, item]) => {
        acc[id] = { ...item, status: nextStatus };
        return acc;
      }, {} as DynamicCheckData);
      
      return newCheckData;
    });
  };

  const revertChanges = () => {
    setCheckData(originalData);
  };

  return {
    checkData,
    questions,
    isExisting,
    loading,
    error,
    updateCheckStatus,
    addNewCheck,
    cycleAllStatus,
    revertChanges,
    setOriginalData,
  };
};

const useSaveCheckData = () => {
  const [saving, setSaving] = useState<boolean>(false);
  const navigate = useNavigate();

  const saveCheckData = async (tempId: string, checkData: DynamicCheckData, isExisting: boolean, onSaveSuccess?: () => void) => {
    setSaving(true);
    try {
      const payload = { temp_id: tempId, checkData: checkData };
      if (isExisting) {
        await humanBodyCheckService.updateCheckData(payload);
        alert('Data updated successfully!');
      } else {
        await humanBodyCheckService.saveCheckData(payload);
        alert('Data saved successfully!');
        setTimeout(() => navigate('/PassedUsersTable'), 1500);
      }
      if (onSaveSuccess) onSaveSuccess();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert(`Error: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  return { saveCheckData, saving };
};


// --- MAIN COMPONENT ---

const HumanBodyCheckSheet: React.FC<HumanBodyCheckSheetProps> = ({ tempId, userDetails, onNext }) => {
  const [newItem, setNewItem] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const {
    checkData,
    isExisting,
    loading,
    error,
    updateCheckStatus,
    addNewCheck,
    cycleAllStatus,
    revertChanges,
    setOriginalData,
  } = useCheckData(tempId);

  const { saveCheckData, saving } = useSaveCheckData();

  // This single boolean determines if the form fields should be interactive.
  const isReadOnly = isExisting && !isEditMode;

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    revertChanges();
    setIsEditMode(false);
  };

  const handleAddNewItem = () => {
    addNewCheck(newItem);
    setNewItem('');
    setShowAddForm(false);
  };

  const handleSaveData = () => {
    const onSaveSuccess = () => {
      if (isExisting) {
        setIsEditMode(false);
        setOriginalData(JSON.parse(JSON.stringify(checkData)));
      }
      if (onNext) onNext();
    };
    saveCheckData(tempId, checkData, isExisting, onSaveSuccess);
  };

  if (loading) {
    return (
      <CheckSheetContainer>
        <div className="p-8 text-center"><p>Loading questions and check data...</p></div>
      </CheckSheetContainer>
    );
  }

  if (error) {
    return (
      <CheckSheetContainer>
        <div className="p-8 text-center text-red-600"><p>{error}</p></div>
      </CheckSheetContainer>
    );
  }

  return (
    <CheckSheetContainer>
      <CheckSheetHeader title="Human Body Check Point (Level-0)" />
      <UserInfoCard userDetails={userDetails} tempId={tempId} />
      <CheckTable
        checkData={checkData}
        onStatusChange={updateCheckStatus}
        showAddForm={showAddForm}
        newItem={newItem}
        onNewItemChange={setNewItem}
        onAddItem={handleAddNewItem}
        onCancelAdd={() => setShowAddForm(false)}
        onCycleStatus={() => { if (!isReadOnly) cycleAllStatus(); }}
        isReadOnly={isReadOnly}
      />
      <ActionBar
        onAddNew={() => setShowAddForm(true)}
        onSave={handleSaveData}
        onEdit={handleEdit}
        onCancelEdit={handleCancelEdit}
        showAddForm={showAddForm}
        isExisting={isExisting}
        isEditMode={isEditMode}
        isReadOnly={isReadOnly}
        loading={saving}
      />
    </CheckSheetContainer>
  );
};

export default HumanBodyCheckSheet;