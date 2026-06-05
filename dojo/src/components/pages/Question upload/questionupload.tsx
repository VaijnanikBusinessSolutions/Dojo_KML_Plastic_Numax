


// import React, { useState, useEffect, useMemo, useRef } from 'react';
// import axios from 'axios';
// // This modal component is assumed to be correct and is not changed.
// import TemplateQuestionBulkUploadModal from './bulkquestionupload';

// // Backend base URL
// const BACKEND_BASE_URL = 'http://172.25.0.51:8000';

// // API Client Setup
// const apiClient = axios.create({
//   baseURL: BACKEND_BASE_URL,
// });
// apiClient.interceptors.response.use(
//   response => response,
//   error => {
//     console.error("API Error:", error.response?.data || error.message);
//     return Promise.reject(error);
//   }
// );

// // --- TYPE DEFINITIONS TO PERFECTLY MATCH YOUR DJANGO API RESPONSE ---
// export interface QuestionPaper {
//   question_paper_id: number;
//   question_paper_name: string;
// }

// // This interface matches the JSON object your API sends back.
// // Your backend's `to_representation` can make the `*_image` fields full URLs.
// export interface Question {
//   id: number;
//   question_paper: number;
//   question: string;
//   question_image: string | null; // This will be the full URL from the backend
//   option_a: string | null;
//   option_a_image: string | null;
//   option_b: string | null;
//   option_b_image: string | null;
//   option_c: string | null;
//   option_c_image: string | null;
//   option_d: string | null;
//   option_d_image: string | null;
//   correct_answer: string | null;
// }

// // Payload for the text part of the form data
// type QuestionTextPayload = Omit<Question, 'id' | 'question_paper'>;

// // --- UI COMPONENTS (Icons & Notification) ---

// const Notification = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
//   useEffect(() => {
//     const timer = setTimeout(onClose, 4000);
//     return () => clearTimeout(timer);
//   }, [onClose]);
//   const bgColor = type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700';
//   return (
//     <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg border shadow-lg animate-slide-in ${bgColor}`} role="alert">
//       <strong className="font-bold">{type === 'success' ? 'Success!' : 'Error!'}</strong>
//       <span className="block sm:inline ml-2">{message}</span>
//       <button onClick={onClose} className="absolute top-0 bottom-0 right-0 px-4 py-3">
//         <svg className="fill-current h-6 w-6" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" /></svg>
//       </button>
//     </div>
//   );
// };

// const EditIcon = ({ className = "h-5 w-5" }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" /> </svg> );
// const DeleteIcon = ({ className = "h-5 w-5" }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /> </svg> );
// const BookIcon = ({ className = "h-6 w-6" }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m-5.747-8.995l11.494 0M4.753 12.747l14.494 0M4 6h16M4 18h16" /> </svg> );
// const TargetIcon = ({ className = "h-5 w-5" }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg> );
// const UploadCloudIcon = ({ className = "h-5 w-5" }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /> </svg> );
// const DocumentTextIcon = ({ className = "h-6 w-6" }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> </svg> );
// const SearchIcon = ({ className = "h-5 w-5" }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /> </svg> );
// const SparklesIcon = ({ className = "h-5 w-5" }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /> </svg> );
// const CheckCircleIcon = ({ className = "h-5 w-5" }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg> );

// const QuestionUpload: React.FC = () => {
//   const [questionPapers, setQuestionPapers] = useState<QuestionPaper[]>([]);
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [selectedQuestionPaperId, setSelectedQuestionPaperId] = useState<number | null>(null);
//   const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
//   const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isSearchFocused, setIsSearchFocused] = useState(false);
//   const [isLoading, setIsLoading] = useState({ papers: false, questions: false });
//   const searchRef = useRef<HTMLDivElement>(null);
//   const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
//   const [newlyAddedQuestionId, setNewlyAddedQuestionId] = useState<number | null>(null);
//   const questionListRefs = useRef<Map<number, HTMLLIElement | null>>(new Map());

//   useEffect(() => {
//     const fetchPapers = async () => {
//       setIsLoading(prev => ({ ...prev, papers: true }));
//       try {
//         const response = await apiClient.get<QuestionPaper[]>('/questionpapers/');
//         setQuestionPapers(response.data);
//       } catch (error) {
//         setNotification({ message: 'Could not load question papers.', type: 'error' });
//       } finally {
//         setIsLoading(prev => ({ ...prev, papers: false }));
//       }
//     };
//     fetchPapers();
//   }, []);

//   useEffect(() => {
//     if (!selectedQuestionPaperId) {
//       setQuestions([]);
//       return;
//     }
//     const fetchQuestions = async () => {
//       setIsLoading(prev => ({ ...prev, questions: true }));
//       try {
//         const response = await apiClient.get<Question[]>(`/template-questions/?question_paper=${selectedQuestionPaperId}`);
//         setQuestions(response.data);
//       } catch (error) {
//         setNotification({ message: 'Could not load questions.', type: 'error' });
//       } finally {
//         setIsLoading(prev => ({ ...prev, questions: false }));
//       }
//     };
//     fetchQuestions();
//   }, [selectedQuestionPaperId]);
  
//   useEffect(() => {
//     if (newlyAddedQuestionId) {
//       const node = questionListRefs.current.get(newlyAddedQuestionId);
//       node?.scrollIntoView({ behavior: 'smooth', block: 'center' });
//       const timer = setTimeout(() => setNewlyAddedQuestionId(null), 2500);
//       return () => clearTimeout(timer);
//     }
//   }, [newlyAddedQuestionId]);

//   const filteredQuestionPapers = useMemo(() => {
//     if (!searchTerm) return questionPapers;
//     return questionPapers.filter(paper =>
//       paper.question_paper_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       paper.question_paper_id.toString().includes(searchTerm)
//     );
//   }, [searchTerm, questionPapers]);

//   const selectedPaperName = useMemo(() => {
//     return questionPapers.find(p => p.question_paper_id === selectedQuestionPaperId)?.question_paper_name || '';
//   }, [selectedQuestionPaperId, questionPapers]);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
//         setIsSearchFocused(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handlePaperSelect = (paper: QuestionPaper) => {
//     setSelectedQuestionPaperId(paper.question_paper_id);
//     setSearchTerm(paper.question_paper_name);
//     setIsSearchFocused(false);
//     setEditingQuestion(null);
//   };

//   const handleClearSelection = () => {
//     setSelectedQuestionPaperId(null);
//     setSearchTerm('');
//     setEditingQuestion(null);
//   };

//   const handleDelete = async (questionId: number) => {
//     if (window.confirm('Are you sure you want to delete this question?')) {
//       try {
//         await apiClient.delete(`/template-questions/${questionId}/`);
//         setQuestions(prev => prev.filter(q => q.id !== questionId));
//         setNotification({ message: 'Question deleted successfully.', type: 'success' });
//       } catch (error) {
//         setNotification({ message: 'Failed to delete the question.', type: 'error' });
//       }
//     }
//   };

//   const handleEdit = (question: Question) => {
//     setEditingQuestion(question);
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };
  
//   const handleFormSubmit = async (payload: {textData: QuestionTextPayload, fileData: Record<string, File | null>}) => {
//     if (!selectedQuestionPaperId) return;

//     const { textData, fileData } = payload;
//     const formData = new FormData();
    
//     formData.append('question_paper', String(selectedQuestionPaperId));
    
//     // Append all text/null data
//     Object.entries(textData).forEach(([key, value]) => {
//       // Don't append image URL placeholders or the ID field
//       if (key.endsWith('_image') || key === 'id') return;

//       if (value !== null && value !== undefined) {
//         formData.append(key, String(value));
//       }
//     });
    
//     // Append file data
//     Object.entries(fileData).forEach(([key, file]) => {
//       if (file) {
//         formData.append(key, file);
//       }
//     });

//     try {
//       let response;
//       if (editingQuestion) {
//         response = await apiClient.put<Question>(`/template-questions/${editingQuestion.id}/`, formData);
//         setQuestions(qs => qs.map(q => (q.id === response.data.id ? response.data : q)));
//         setNotification({ message: 'Question updated successfully!', type: 'success' });
//       } else {
//         response = await apiClient.post<Question>('/template-questions/', formData);
//         setQuestions(qs => [...qs, response.data]);
//         setNotification({ message: 'Question added successfully!', type: 'success' });
//         setNewlyAddedQuestionId(response.data.id);
//       }
//       setEditingQuestion(null);
//     } catch (error) {
//       setNotification({ message: 'Failed to save question.', type: 'error' });
//     }
//   };

//   const handleUploadSuccess = () => {
//     setNotification({ message: "Bulk upload successful! Refreshing list...", type: 'success' });
//     if (selectedQuestionPaperId) {
//       // Refetch questions
//       const fetchQuestions = async () => {
//         setIsLoading(prev => ({ ...prev, questions: true }));
//         try {
//           const response = await apiClient.get<Question[]>(`/template-questions/?question_paper=${selectedQuestionPaperId}`);
//           setQuestions(response.data);
//         } catch (error) {
//           setNotification({ message: 'Failed to refresh question list.', type: 'error' });
//         } finally {
//           setIsLoading(prev => ({ ...prev, questions: false }));
//         }
//       };
//       fetchQuestions();
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
//       {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
//       <div className="max-w-7xl mx-auto">
//         <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:gap-4">
//           <div className="flex items-center gap-3 mb-4 sm:mb-0">
//             <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-3 rounded-xl shadow-md">
//               <DocumentTextIcon className="h-7 w-7 text-white" />
//             </div>
//             <div>
//               <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Question Manager</h1>
//               <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
//                 <SparklesIcon className="h-4 w-4 text-yellow-500" /> Create and manage questions for your papers
//               </p>
//             </div>
//           </div>
//         </div>
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
//           <label htmlFor="question-paper-search" className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-2">
//             <DocumentTextIcon className="h-5 w-5 text-indigo-600" /> Select Question Paper
//           </label>
//           <p className="text-sm text-gray-500 mb-4">Search by name or ID to view or add questions</p>
//           <div ref={searchRef} className="relative">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon className="h-5 w-5 text-gray-400" /></div>
//             <input id="question-paper-search" type="text" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); if (selectedQuestionPaperId) handleClearSelection(); }} onFocus={() => setIsSearchFocused(true)} placeholder="Search for a question paper..." className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm" />
//             {searchTerm && (<button onClick={handleClearSelection} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>)}
//             {isSearchFocused && !selectedQuestionPaperId && (
//               <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
//                 {isLoading.papers ? <li className="px-4 py-3 text-gray-500 text-center">Loading...</li> : filteredQuestionPapers.length > 0 ? (
//                   filteredQuestionPapers.map(paper => (
//                     <li key={paper.question_paper_id} onClick={() => handlePaperSelect(paper)} className="px-4 py-3 cursor-pointer hover:bg-indigo-50 border-b last:border-0">
//                       <p className="font-medium text-gray-800">{paper.question_paper_name}</p>
//                       <p className="text-xs text-gray-500">ID: {paper.question_paper_id}</p>
//                     </li>
//                   ))
//                 ) : <li className="px-4 py-6 text-gray-500 text-center">No results found</li>}
//               </ul>
//             )}
//           </div>
//           {selectedQuestionPaperId && (
//             <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200 flex items-center justify-between">
//               <div className="flex items-center gap-2"><CheckCircleIcon className="h-5 w-5 text-green-600" /><span className="text-sm">Selected:</span><span className="font-semibold">{selectedPaperName}</span></div>
//               <button onClick={handleClearSelection} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Change</button>
//             </div>
//           )}
//         </div>
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2">
//             <QuestionForm
//               key={editingQuestion ? editingQuestion.id : 'new'}
//               existingQuestion={editingQuestion}
//               onSubmitSuccess={handleFormSubmit}
//               onCancel={() => setEditingQuestion(null)}
//               onBulkUploadClick={() => setIsUploadModalOpen(true)}
//               disabled={!selectedQuestionPaperId}
//             />
//           </div>
//           <div className="lg:col-span-1">
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//               <div className="flex justify-between items-center mb-4">
//                 <div className="flex items-center gap-2"><BookIcon className="h-5 w-5 text-white bg-green-500 p-1 rounded" /><h2 className="text-lg font-semibold">Questions</h2></div>
//                 <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full">{questions.length}</span>
//               </div>
//               <div className="h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar pr-2 -mr-2">
//                 {!selectedQuestionPaperId ? <div className="text-center text-gray-500 p-6">Select a paper to see questions.</div> : isLoading.questions ? <div className="text-center text-gray-500 p-6">Loading Questions...</div> : questions.length === 0 ? <div className="text-center text-gray-500 p-6">No questions yet for this paper.</div> : (
//                   <ul className="space-y-4">
//                     {questions.map((q, index) => {
//                       const availableOptions = (['a', 'b', 'c', 'd'] as const)
//                         .map(key => ({
//                           key,
//                           text: q[`option_${key}`],
//                           imageUrl: q[`option_${key}_image`],
//                         }))
//                         .filter(opt => opt.text || opt.imageUrl);
//                       return (
//                         <li key={q.id} ref={el => questionListRefs.current.set(q.id, el)} className={`bg-gray-50 border p-4 rounded-lg transition-all ${newlyAddedQuestionId === q.id ? 'new-item-highlight' : 'hover:shadow-md'}`}>
//                           <div className="flex flex-col gap-3">
//                             <div className="flex items-start gap-3">
//                               <span className="flex-shrink-0 flex items-center justify-center h-7 w-7 bg-indigo-600 text-white rounded-md font-medium text-sm">{index + 1}</span>
//                               <div className="flex-1">
//                                 <p className="text-gray-800 font-medium">{q.question}</p>
//                                 {q.question_image && <img src={q.question_image} alt={`Question ${index + 1}`} className="mt-2 max-w-full h-auto rounded-md max-h-48 object-contain" />}
//                               </div>
//                               <div className="flex items-center gap-1">
//                                 <button onClick={() => handleEdit(q)} className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-md"><EditIcon className="h-4 w-4" /></button>
//                                 <button onClick={() => handleDelete(q.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-md"><DeleteIcon className="h-4 w-4" /></button>
//                               </div>
//                             </div>
//                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-10">
//                               {availableOptions.map((opt, idx) => (
//                                 <div key={opt.key} className={`flex items-start gap-2 p-3 rounded-md border ${q.correct_answer === opt.text ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
//                                   <span className="font-medium text-gray-700">{String.fromCharCode(65 + idx)}:</span>
//                                   <div className="flex-1">
//                                     <p className="text-sm text-gray-600">{opt.text}</p>
//                                     {opt.imageUrl && <img src={opt.imageUrl} alt={`Option ${String.fromCharCode(65 + idx)}`} className="mt-1 max-w-[80px] h-auto rounded-md object-contain" />}
//                                   </div>
//                                   {q.correct_answer === opt.text && <CheckCircleIcon className="h-4 w-4 text-green-600" />}
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         </li>
//                       );
//                     })}
//                   </ul>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//         <TemplateQuestionBulkUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUploadSuccess={handleUploadSuccess} questionPaperId={selectedQuestionPaperId!} />
//         <style jsx>{`
//           .custom-scrollbar::-webkit-scrollbar { width: 8px; }
//           .custom-scrollbar::-webkit-scrollbar-track { background: #f3f4f6; border-radius: 4px; }
//           .custom-scrollbar::-webkit-scrollbar-thumb { background: #9ca3af; border-radius: 4px; }
//           .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6b7280; }
//           @keyframes highlight-fade { from { background-color: #d1fae5; transform: scale(1.02); } to { background-color: #f9fafb; transform: scale(1); } }
//           .new-item-highlight { animation: highlight-fade 2s ease-out; }
//           @keyframes slide-in-from-right { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
//           .animate-slide-in { animation: slide-in-from-right 0.5s ease-out forwards; }
//         `}</style>
//       </div>
//     </div>
//   );
// };

// // --- FINAL, CORRECTED QuestionForm Component ---
// interface QuestionFormProps {
//   existingQuestion: Question | null;
//   onSubmitSuccess: (payload: {textData: QuestionTextPayload, fileData: Record<string, File | null>}) => void;
//   onCancel: () => void;
//   onBulkUploadClick: () => void;
//   disabled: boolean;
// }


// const resolveImageUrl = (url: string | null) => {
//   if (!url) return '#';
//   // If the URL is already absolute (starts with http), return it as is.
//   if (url.startsWith('http://') || url.startsWith('https://')) {
//     return url;
//   }
//   // Otherwise, prepend the backend base URL.
//   // We remove a leading slash from the url if it exists to avoid double slashes 
//   // (though browsers usually handle double slashes fine, it's cleaner).
//   const cleanPath = url.startsWith('/') ? url.substring(1) : url;
//   return `${BACKEND_BASE_URL}/${cleanPath}`;
// };

// const QuestionForm: React.FC<QuestionFormProps> = ({ existingQuestion, onSubmitSuccess, onCancel, onBulkUploadClick, disabled }) => {
//   const isEditing = !!existingQuestion;
  

//   type FormOption = { text: string; imageFile: File | null };
//   const [questionText, setQuestionText] = useState('');
//   const [questionImageFile, setQuestionImageFile] = useState<File | null>(null);
//   const [options, setOptions] = useState<FormOption[]>([{ text: '', imageFile: null }, { text: '', imageFile: null }]);
//   const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | null>(null);

//   useEffect(() => {
//     if (existingQuestion) {
//       setQuestionText(existingQuestion.question);
//       setQuestionImageFile(null); // File inputs cannot be programmatically pre-filled

//       const existingOpts = [];
//       if (existingQuestion.option_a || existingQuestion.option_a_image) existingOpts.push({ text: existingQuestion.option_a || '', imageFile: null });
//       if (existingQuestion.option_b || existingQuestion.option_b_image) existingOpts.push({ text: existingQuestion.option_b || '', imageFile: null });
//       if (existingQuestion.option_c || existingQuestion.option_c_image) existingOpts.push({ text: existingQuestion.option_c || '', imageFile: null });
//       if (existingQuestion.option_d || existingQuestion.option_d_image) existingOpts.push({ text: existingQuestion.option_d || '', imageFile: null });
//       setOptions(existingOpts.length > 0 ? existingOpts : [{ text: '', imageFile: null }, { text: '', imageFile: null }]);

//       const correctIdx = existingOpts.findIndex(opt => opt.text === existingQuestion.correct_answer);
//       setCorrectAnswerIndex(correctIdx !== -1 ? correctIdx : null);
//     } else {
//       setQuestionText('');
//       setQuestionImageFile(null);
//       setOptions([{ text: '', imageFile: null }, { text: '', imageFile: null }]);
//       setCorrectAnswerIndex(null);
//     }
//   }, [existingQuestion]);

//   const handleOptionChange = (index: number, field: 'text' | 'image', value: string | File | null) => {
//     const newOptions = [...options];
//     if (field === 'text' && typeof value === 'string') newOptions[index].text = value;
//     else if (field === 'image' && (value instanceof File || value === null)) newOptions[index].imageFile = value;
//     setOptions(newOptions);
//   };

//   const addOption = () => options.length < 4 && setOptions([...options, { text: '', imageFile: null }]);
//   const removeOption = (index: number) => {
//     if (options.length > 2) {
//       const newOptions = options.filter((_, i) => i !== index);
//       setOptions(newOptions);
//       if (correctAnswerIndex === index) setCorrectAnswerIndex(null);
//       else if (correctAnswerIndex !== null && correctAnswerIndex > index) setCorrectAnswerIndex(correctAnswerIndex - 1);
//     }
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (disabled || correctAnswerIndex === null || !options[correctAnswerIndex].text) {
//       alert('A correct answer must be selected, and it must have text.');
//       return;
//     }

//     const textPayload: QuestionTextPayload = {
//       question: questionText,
//       correct_answer: options[correctAnswerIndex].text,
//       option_a: options[0]?.text || null,
//       option_b: options[1]?.text || null,
//       option_c: options[2]?.text || null,
//       option_d: options[3]?.text || null,
//       question_image: null,
//       option_a_image: null,
//       option_b_image: null,
//       option_c_image: null,
//       option_d_image: null,
//     };

//     const filePayload = {
//       question_image: questionImageFile,
//       option_a_image: options[0]?.imageFile || null,
//       option_b_image: options[1]?.imageFile || null,
//       option_c_image: options[2]?.imageFile || null,
//       option_d_image: options[3]?.imageFile || null,
//     };

//     onSubmitSuccess({ textData: textPayload, fileData: filePayload });
//     if (!isEditing) {
//         setQuestionText(''); setQuestionImageFile(null); setOptions([{ text: '', imageFile: null }, { text: '', imageFile: null }]); setCorrectAnswerIndex(null);
//     }

//   };

//   return (
//     <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 ${disabled ? 'opacity-60' : ''}`}>
//       <fieldset disabled={disabled}>
//         <div className="flex justify-between items-center mb-4">
//           <div><h2 className="text-lg font-semibold">{isEditing ? 'Edit Question' : 'Add New Question'}</h2></div>
//           {!isEditing && <button type="button" onClick={onBulkUploadClick} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg"><UploadCloudIcon className="h-4 w-4" /> Bulk Upload</button>}
//         </div>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label htmlFor="question" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1"><EditIcon className="h-4 w-4" /> Question Text</label>
//             <textarea id="question" rows={3} value={questionText} onChange={e => setQuestionText(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="Enter question..." />
//             <label htmlFor="question_image" className="flex items-center gap-2 text-sm font-medium text-gray-700 mt-4 mb-1"><UploadCloudIcon className="h-4 w-4" /> Question Image (Optional)</label>
//             <input id="question_image" type="file" accept="image/*" onChange={e => setQuestionImageFile(e.target.files?.[0] || null)} className="w-full p-2 border border-gray-300 rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
//             {questionImageFile && <p className="mt-1 text-xs text-gray-600">Selected: {questionImageFile.name}</p>}
//             {isEditing && existingQuestion?.question_image && <div className="mt-2 text-xs">Current Image: <a href={existingQuestion.question_image} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{existingQuestion.question_image.split('/').pop()}</a> (Uploading a new file will replace it)</div>}
//           </div>
//           <div>
//             <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
//               <span className="flex items-center gap-2"><TargetIcon className="h-4 w-4" /> Answer Options</span>
//               <button type="button" onClick={addOption} disabled={options.length >= 4} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed">Add Option</button>
//             </label>
//             <div className="space-y-3">
//               {options.map((_, index) => (
//                 <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 border rounded-lg bg-gray-50">
//                   <span className="font-medium flex-shrink-0">{String.fromCharCode(65 + index)}</span>
//                   <div className="flex-1 w-full">
//                     <input type="text" value={options[index].text} onChange={(e) => handleOptionChange(index, 'text', e.target.value)} placeholder={`Option text...`} className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500" />
//                     <input type="file" accept="image/*" onChange={(e) => handleOptionChange(index, 'image', e.target.files?.[0] || null)} className="w-full mt-2 p-1 border text-xs rounded-md file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-100"/>
//                     {isEditing && existingQuestion?.[`option_${String.fromCharCode(97 + index)}_image` as keyof Question] && <div className="mt-1 text-xs">Current: <a href={existingQuestion[`option_${String.fromCharCode(97 + index)}_image` as keyof Question]!} target="_blank" rel="noreferrer" className="text-indigo-600">view</a></div>}
//                   </div>
//                   <div className="flex items-center gap-2 self-center sm:ml-auto">
//                     <input type="radio" id={`correct_${index}`} name="correctAnswer" checked={correctAnswerIndex === index} onChange={() => setCorrectAnswerIndex(index)} className="h-4 w-4 text-indigo-600"/>
//                     <label htmlFor={`correct_${index}`} className="text-xs">Correct</label>
//                     <button type="button" onClick={() => removeOption(index)} disabled={options.length <= 2} className="p-1 text-red-500 hover:text-red-700 disabled:opacity-30"><DeleteIcon className="h-4 w-4" /></button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//           <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
//             {isEditing && (<button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-lg">Cancel</button>)}
//             <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">{isEditing ? 'Update Question' : 'Save Question'}</button>
//           </div>
//         </form>
//       </fieldset>
//     </div>
//   );
// };

// export default QuestionUpload;




import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import TemplateQuestionBulkUploadModal from './bulkquestionupload';

// Backend base URL
const BACKEND_BASE_URL = 'http://172.25.0.51:8000';

// API Client Setup
const apiClient = axios.create({
  baseURL: BACKEND_BASE_URL,
});
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// --- TYPE DEFINITIONS ---
export interface QuestionPaper {
  question_paper_id: number;
  question_paper_name: string;
}

export interface Question {
  id: number;
  question_paper: number;
  question: string;
  question_image: string | null;
  option_a: string | null;
  option_a_image: string | null;
  option_b: string | null;
  option_b_image: string | null;
  option_c: string | null;
  option_c_image: string | null;
  option_d: string | null;
  option_d_image: string | null;
  correct_answer: string | null;
}

type QuestionTextPayload = Omit<Question, 'id' | 'question_paper'>;

// --- ICONS & NOTIFICATION (No changes here) ---
const Notification = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
  useEffect(() => { const timer = setTimeout(onClose, 4000); return () => clearTimeout(timer); }, [onClose]);
  const bgColor = type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700';
  return ( <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg border shadow-lg animate-slide-in ${bgColor}`} role="alert"> <strong className="font-bold">{type === 'success' ? 'Success!' : 'Error!'}</strong> <span className="block sm:inline ml-2">{message}</span> <button onClick={onClose} className="absolute top-0 bottom-0 right-0 px-4 py-3"> <svg className="fill-current h-6 w-6" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" /></svg> </button> </div> );
};
const EditIcon = ({ className = "h-5 w-5" }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" /> </svg> );
const DeleteIcon = ({ className = "h-5 w-5" }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /> </svg> );
const BookIcon = ({ className = "h-6 w-6" }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m-5.747-8.995l11.494 0M4.753 12.747l14.494 0M4 6h16M4 18h16" /> </svg> );
const TargetIcon = ({ className = "h-5 w-5" }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg> );
const UploadCloudIcon = ({ className = "h-5 w-5" }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /> </svg> );
const DocumentTextIcon = ({ className = "h-6 w-6" }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> </svg> );
const SearchIcon = ({ className = "h-5 w-5" }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /> </svg> );
const SparklesIcon = ({ className = "h-5 w-5" }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /> </svg> );
const CheckCircleIcon = ({ className = "h-5 w-5" }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg> );

// --- IMAGE URL RESOLVER (FIXED) ---
const resolveImageUrl = (url: string | null) => {
  if (!url) return '';
  
  let finalUrl = url;

  // 1. FIX: Detect double domain (e.g. http://172.25.0.51:8000http://172.25.0.51:8000)
  // This removes the first occurrence of the base URL if it appears twice.
  if (finalUrl.includes('http://172.25.0.51:8000http://172.25.0.51:8000')) {
    finalUrl = finalUrl.replace('http://172.25.0.51:8000http://172.25.0.51:8000', 'http://172.25.0.51:8000');
  }

  // 2. Fallback: If it's a relative path (doesn't start with http), add the base URL
  if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
    const cleanPath = finalUrl.startsWith('/') ? finalUrl.substring(1) : finalUrl;
    finalUrl = `${BACKEND_BASE_URL}/${cleanPath}`;
  }

  // 3. Last check: If URL looks like a local file path (C:\...), warn but try to serve
  // Browsers block local file paths, so this might still fail if the backend isn't serving via HTTP
  return finalUrl;
};

// --- MAIN COMPONENT ---
const QuestionUpload: React.FC = () => {
  const [questionPapers, setQuestionPapers] = useState<QuestionPaper[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionPaperId, setSelectedQuestionPaperId] = useState<number | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoading, setIsLoading] = useState({ papers: false, questions: false });
  const searchRef = useRef<HTMLDivElement>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [newlyAddedQuestionId, setNewlyAddedQuestionId] = useState<number | null>(null);
  const questionListRefs = useRef<Map<number, HTMLLIElement | null>>(new Map());

  // ... (Fetch logic remains same as original)
  useEffect(() => {
    const fetchPapers = async () => {
      setIsLoading(prev => ({ ...prev, papers: true }));
      try {
        const response = await apiClient.get<QuestionPaper[]>('/questionpapers/');
        setQuestionPapers(response.data);
      } catch (error) {
        setNotification({ message: 'Could not load question papers.', type: 'error' });
      } finally {
        setIsLoading(prev => ({ ...prev, papers: false }));
      }
    };
    fetchPapers();
  }, []);

  useEffect(() => {
    if (!selectedQuestionPaperId) {
      setQuestions([]);
      return;
    }
    const fetchQuestions = async () => {
      setIsLoading(prev => ({ ...prev, questions: true }));
      try {
        const response = await apiClient.get<Question[]>(`/template-questions/?question_paper=${selectedQuestionPaperId}`);
        setQuestions(response.data);
      } catch (error) {
        setNotification({ message: 'Could not load questions.', type: 'error' });
      } finally {
        setIsLoading(prev => ({ ...prev, questions: false }));
      }
    };
    fetchQuestions();
  }, [selectedQuestionPaperId]);
  
  // ... (Other effects and handlers remain same)
  useEffect(() => {
    if (newlyAddedQuestionId) {
      const node = questionListRefs.current.get(newlyAddedQuestionId);
      node?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const timer = setTimeout(() => setNewlyAddedQuestionId(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [newlyAddedQuestionId]);

  const filteredQuestionPapers = useMemo(() => {
    if (!searchTerm) return questionPapers;
    return questionPapers.filter(paper =>
      paper.question_paper_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.question_paper_id.toString().includes(searchTerm)
    );
  }, [searchTerm, questionPapers]);

  const selectedPaperName = useMemo(() => {
    return questionPapers.find(p => p.question_paper_id === selectedQuestionPaperId)?.question_paper_name || '';
  }, [selectedQuestionPaperId, questionPapers]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePaperSelect = (paper: QuestionPaper) => {
    setSelectedQuestionPaperId(paper.question_paper_id);
    setSearchTerm(paper.question_paper_name);
    setIsSearchFocused(false);
    setEditingQuestion(null);
  };

  const handleClearSelection = () => {
    setSelectedQuestionPaperId(null);
    setSearchTerm('');
    setEditingQuestion(null);
  };

  const handleDelete = async (questionId: number) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await apiClient.delete(`/template-questions/${questionId}/`);
        setQuestions(prev => prev.filter(q => q.id !== questionId));
        setNotification({ message: 'Question deleted successfully.', type: 'success' });
      } catch (error) {
        setNotification({ message: 'Failed to delete the question.', type: 'error' });
      }
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleFormSubmit = async (payload: {textData: QuestionTextPayload, fileData: Record<string, File | null>}) => {
    if (!selectedQuestionPaperId) return;

    const { textData, fileData } = payload;
    const formData = new FormData();
    formData.append('question_paper', String(selectedQuestionPaperId));
    
    Object.entries(textData).forEach(([key, value]) => {
      if (key.endsWith('_image') || key === 'id') return;
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    
    Object.entries(fileData).forEach(([key, file]) => {
      if (file) {
        formData.append(key, file);
      }
    });

    try {
      let response;
      if (editingQuestion) {
        response = await apiClient.put<Question>(`/template-questions/${editingQuestion.id}/`, formData);
        setQuestions(qs => qs.map(q => (q.id === response.data.id ? response.data : q)));
        setNotification({ message: 'Question updated successfully!', type: 'success' });
      } else {
        response = await apiClient.post<Question>('/template-questions/', formData);
        setQuestions(qs => [...qs, response.data]);
        setNotification({ message: 'Question added successfully!', type: 'success' });
        setNewlyAddedQuestionId(response.data.id);
      }
      setEditingQuestion(null);
    } catch (error) {
      setNotification({ message: 'Failed to save question.', type: 'error' });
    }
  };

  const handleUploadSuccess = () => {
    setNotification({ message: "Bulk upload successful! Refreshing list...", type: 'success' });
    if (selectedQuestionPaperId) {
      const fetchQuestions = async () => {
        setIsLoading(prev => ({ ...prev, questions: true }));
        try {
          const response = await apiClient.get<Question[]>(`/template-questions/?question_paper=${selectedQuestionPaperId}`);
          setQuestions(response.data);
        } catch (error) {
          setNotification({ message: 'Failed to refresh question list.', type: 'error' });
        } finally {
          setIsLoading(prev => ({ ...prev, questions: false }));
        }
      };
      fetchQuestions();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-3 rounded-xl shadow-md">
              <DocumentTextIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Question Manager</h1>
              <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                <SparklesIcon className="h-4 w-4 text-yellow-500" /> Create and manage questions for your papers
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <label htmlFor="question-paper-search" className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-2">
            <DocumentTextIcon className="h-5 w-5 text-indigo-600" /> Select Question Paper
          </label>
          <p className="text-sm text-gray-500 mb-4">Search by name or ID to view or add questions</p>
          <div ref={searchRef} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon className="h-5 w-5 text-gray-400" /></div>
            <input id="question-paper-search" type="text" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); if (selectedQuestionPaperId) handleClearSelection(); }} onFocus={() => setIsSearchFocused(true)} placeholder="Search for a question paper..." className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm" />
            {searchTerm && (<button onClick={handleClearSelection} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>)}
            {isSearchFocused && !selectedQuestionPaperId && (
              <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {isLoading.papers ? <li className="px-4 py-3 text-gray-500 text-center">Loading...</li> : filteredQuestionPapers.length > 0 ? (
                  filteredQuestionPapers.map(paper => (
                    <li key={paper.question_paper_id} onClick={() => handlePaperSelect(paper)} className="px-4 py-3 cursor-pointer hover:bg-indigo-50 border-b last:border-0">
                      <p className="font-medium text-gray-800">{paper.question_paper_name}</p>
                      <p className="text-xs text-gray-500">ID: {paper.question_paper_id}</p>
                    </li>
                  ))
                ) : <li className="px-4 py-6 text-gray-500 text-center">No results found</li>}
              </ul>
            )}
          </div>
          {selectedQuestionPaperId && (
            <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200 flex items-center justify-between">
              <div className="flex items-center gap-2"><CheckCircleIcon className="h-5 w-5 text-green-600" /><span className="text-sm">Selected:</span><span className="font-semibold">{selectedPaperName}</span></div>
              <button onClick={handleClearSelection} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Change</button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <QuestionForm
              key={editingQuestion ? editingQuestion.id : 'new'}
              existingQuestion={editingQuestion}
              onSubmitSuccess={handleFormSubmit}
              onCancel={() => setEditingQuestion(null)}
              onBulkUploadClick={() => setIsUploadModalOpen(true)}
              disabled={!selectedQuestionPaperId}
            />
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2"><BookIcon className="h-5 w-5 text-white bg-green-500 p-1 rounded" /><h2 className="text-lg font-semibold">Questions</h2></div>
                <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full">{questions.length}</span>
              </div>
              <div className="h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar pr-2 -mr-2">
                {!selectedQuestionPaperId ? <div className="text-center text-gray-500 p-6">Select a paper to see questions.</div> : isLoading.questions ? <div className="text-center text-gray-500 p-6">Loading Questions...</div> : questions.length === 0 ? <div className="text-center text-gray-500 p-6">No questions yet for this paper.</div> : (
                  <ul className="space-y-4">
                    {questions.map((q, index) => {
                      const availableOptions = (['a', 'b', 'c', 'd'] as const)
                        .map(key => ({
                          key,
                          text: q[`option_${key}`],
                          imageUrl: q[`option_${key}_image`],
                        }))
                        .filter(opt => opt.text || opt.imageUrl);
                      return (
                        <li key={q.id} ref={el => questionListRefs.current.set(q.id, el)} className={`bg-gray-50 border p-4 rounded-lg transition-all ${newlyAddedQuestionId === q.id ? 'new-item-highlight' : 'hover:shadow-md'}`}>
                          <div className="flex flex-col gap-3">
                            <div className="flex items-start gap-3">
                              <span className="flex-shrink-0 flex items-center justify-center h-7 w-7 bg-indigo-600 text-white rounded-md font-medium text-sm">{index + 1}</span>
                              <div className="flex-1">
                                <p className="text-gray-800 font-medium">{q.question}</p>
                                {q.question_image && <img src={resolveImageUrl(q.question_image)} alt={`Question ${index + 1}`} className="mt-2 max-w-full h-auto rounded-md max-h-48 object-contain" />}
                              </div>
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleEdit(q)} className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-md"><EditIcon className="h-4 w-4" /></button>
                                <button onClick={() => handleDelete(q.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-md"><DeleteIcon className="h-4 w-4" /></button>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-10">
                              {availableOptions.map((opt, idx) => (
                                <div key={opt.key} className={`flex items-start gap-2 p-3 rounded-md border ${q.correct_answer === opt.text ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                                  <span className="font-medium text-gray-700">{String.fromCharCode(65 + idx)}:</span>
                                  <div className="flex-1">
                                    <p className="text-sm text-gray-600">{opt.text}</p>
                                    {opt.imageUrl && <img src={resolveImageUrl(opt.imageUrl)} alt={`Option ${String.fromCharCode(65 + idx)}`} className="mt-1 max-w-[80px] h-auto rounded-md object-contain" />}
                                  </div>
                                  {q.correct_answer === opt.text && <CheckCircleIcon className="h-4 w-4 text-green-600" />}
                                </div>
                              ))}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
        <TemplateQuestionBulkUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUploadSuccess={handleUploadSuccess} questionPaperId={selectedQuestionPaperId!} />
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar { width: 8px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #f3f4f6; border-radius: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #9ca3af; border-radius: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6b7280; }
          @keyframes highlight-fade { from { background-color: #d1fae5; transform: scale(1.02); } to { background-color: #f9fafb; transform: scale(1); } }
          .new-item-highlight { animation: highlight-fade 2s ease-out; }
          @keyframes slide-in-from-right { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          .animate-slide-in { animation: slide-in-from-right 0.5s ease-out forwards; }
        `}</style>
      </div>
    </div>
  );
};

// --- CORRECTED QuestionForm Component ---
interface QuestionFormProps {
  existingQuestion: Question | null;
  onSubmitSuccess: (payload: {textData: QuestionTextPayload, fileData: Record<string, File | null>}) => void;
  onCancel: () => void;
  onBulkUploadClick: () => void;
  disabled: boolean;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ existingQuestion, onSubmitSuccess, onCancel, onBulkUploadClick, disabled }) => {
  const isEditing = !!existingQuestion;

  type FormOption = { text: string; imageFile: File | null };
  const [questionText, setQuestionText] = useState('');
  const [questionImageFile, setQuestionImageFile] = useState<File | null>(null);
  const [options, setOptions] = useState<FormOption[]>([{ text: '', imageFile: null }, { text: '', imageFile: null }]);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | null>(null);

  useEffect(() => {
    if (existingQuestion) {
      setQuestionText(existingQuestion.question);
      setQuestionImageFile(null);

      const existingOpts = [];
      if (existingQuestion.option_a || existingQuestion.option_a_image) existingOpts.push({ text: existingQuestion.option_a || '', imageFile: null });
      if (existingQuestion.option_b || existingQuestion.option_b_image) existingOpts.push({ text: existingQuestion.option_b || '', imageFile: null });
      if (existingQuestion.option_c || existingQuestion.option_c_image) existingOpts.push({ text: existingQuestion.option_c || '', imageFile: null });
      if (existingQuestion.option_d || existingQuestion.option_d_image) existingOpts.push({ text: existingQuestion.option_d || '', imageFile: null });
      setOptions(existingOpts.length > 0 ? existingOpts : [{ text: '', imageFile: null }, { text: '', imageFile: null }]);

      const correctIdx = existingOpts.findIndex(opt => opt.text === existingQuestion.correct_answer);
      setCorrectAnswerIndex(correctIdx !== -1 ? correctIdx : null);
    } else {
      setQuestionText('');
      setQuestionImageFile(null);
      setOptions([{ text: '', imageFile: null }, { text: '', imageFile: null }]);
      setCorrectAnswerIndex(null);
    }
  }, [existingQuestion]);

  const handleOptionChange = (index: number, field: 'text' | 'image', value: string | File | null) => {
    const newOptions = [...options];
    if (field === 'text' && typeof value === 'string') newOptions[index].text = value;
    else if (field === 'image' && (value instanceof File || value === null)) newOptions[index].imageFile = value;
    setOptions(newOptions);
  };

  const addOption = () => options.length < 4 && setOptions([...options, { text: '', imageFile: null }]);
  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      if (correctAnswerIndex === index) setCorrectAnswerIndex(null);
      else if (correctAnswerIndex !== null && correctAnswerIndex > index) setCorrectAnswerIndex(correctAnswerIndex - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || correctAnswerIndex === null || !options[correctAnswerIndex].text) {
      alert('A correct answer must be selected, and it must have text.');
      return;
    }

    const textPayload: QuestionTextPayload = {
      question: questionText,
      correct_answer: options[correctAnswerIndex].text,
      option_a: options[0]?.text || null,
      option_b: options[1]?.text || null,
      option_c: options[2]?.text || null,
      option_d: options[3]?.text || null,
      question_image: null,
      option_a_image: null,
      option_b_image: null,
      option_c_image: null,
      option_d_image: null,
    };

    const filePayload = {
      question_image: questionImageFile,
      option_a_image: options[0]?.imageFile || null,
      option_b_image: options[1]?.imageFile || null,
      option_c_image: options[2]?.imageFile || null,
      option_d_image: options[3]?.imageFile || null,
    };

    onSubmitSuccess({ textData: textPayload, fileData: filePayload });
    if (!isEditing) {
        setQuestionText(''); setQuestionImageFile(null); setOptions([{ text: '', imageFile: null }, { text: '', imageFile: null }]); setCorrectAnswerIndex(null);
    }
  };

  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 ${disabled ? 'opacity-60' : ''}`}>
      <fieldset disabled={disabled}>
        <div className="flex justify-between items-center mb-4">
          <div><h2 className="text-lg font-semibold">{isEditing ? 'Edit Question' : 'Add New Question'}</h2></div>
          {!isEditing && <button type="button" onClick={onBulkUploadClick} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg"><UploadCloudIcon className="h-4 w-4" /> Bulk Upload</button>}
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="question" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1"><EditIcon className="h-4 w-4" /> Question Text</label>
            <textarea id="question" rows={3} value={questionText} onChange={e => setQuestionText(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="Enter question..." />
            
            <label htmlFor="question_image" className="flex items-center gap-2 text-sm font-medium text-gray-700 mt-4 mb-1"><UploadCloudIcon className="h-4 w-4" /> Question Image (Optional)</label>
            <input id="question_image" type="file" accept="image/*" onChange={e => setQuestionImageFile(e.target.files?.[0] || null)} className="w-full p-2 border border-gray-300 rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            {questionImageFile && <p className="mt-1 text-xs text-gray-600">Selected: {questionImageFile.name}</p>}
            
            {/* FIXED IMAGE LINK */}
            {isEditing && existingQuestion?.question_image && (
              <div className="mt-2 text-xs">
                Current Image: <a 
                  href={resolveImageUrl(existingQuestion.question_image)} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-indigo-600 hover:underline font-medium"
                >
                  Click to View Image
                </a> 
                <span className="text-gray-500 ml-1">(Uploading new replaces this)</span>
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2"><TargetIcon className="h-4 w-4" /> Answer Options</span>
              <button type="button" onClick={addOption} disabled={options.length >= 4} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed">Add Option</button>
            </label>
            <div className="space-y-3">
              {options.map((_, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 border rounded-lg bg-gray-50">
                  <span className="font-medium flex-shrink-0">{String.fromCharCode(65 + index)}</span>
                  <div className="flex-1 w-full">
                    <input type="text" value={options[index].text} onChange={(e) => handleOptionChange(index, 'text', e.target.value)} placeholder={`Option text...`} className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500" />
                    <input type="file" accept="image/*" onChange={(e) => handleOptionChange(index, 'image', e.target.files?.[0] || null)} className="w-full mt-2 p-1 border text-xs rounded-md file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-100"/>
                    
                    {/* FIXED OPTION LINK */}
                    {isEditing && existingQuestion?.[`option_${String.fromCharCode(97 + index)}_image` as keyof Question] && (
                      <div className="mt-1 text-xs">
                        Current: <a 
                          href={resolveImageUrl(existingQuestion[`option_${String.fromCharCode(97 + index)}_image` as keyof Question])} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-indigo-600 hover:underline"
                        >
                          view image
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 self-center sm:ml-auto">
                    <input type="radio" id={`correct_${index}`} name="correctAnswer" checked={correctAnswerIndex === index} onChange={() => setCorrectAnswerIndex(index)} className="h-4 w-4 text-indigo-600"/>
                    <label htmlFor={`correct_${index}`} className="text-xs">Correct</label>
                    <button type="button" onClick={() => removeOption(index)} disabled={options.length <= 2} className="p-1 text-red-500 hover:text-red-700 disabled:opacity-30"><DeleteIcon className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            {isEditing && (<button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-lg">Cancel</button>)}
            <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">{isEditing ? 'Update Question' : 'Save Question'}</button>
          </div>
        </form>
      </fieldset>
    </div>
  );
};

export default QuestionUpload;