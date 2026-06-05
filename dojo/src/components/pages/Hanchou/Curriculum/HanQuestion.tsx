

// import React, { useState, useEffect, FormEvent } from 'react';
import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';

// --- MODIFIED: Import the dedicated modal for Hanchou questions ---
import HanchouBulkUploadModal from './HanchouBulkUploadModal'; 

// --- TYPE DEFINITION ---
export interface ApiQuestion {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
}

// --- API CONFIGURATION ---
const API_URL = 'http://127.0.0.1:8000/hanchou-questions/';

// --- ICONS ---
const EditIcon = ({ className = "h-5 w-5" }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" /></svg>);
const DeleteIcon = ({ className = "h-5 w-5" }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const BookIcon = ({ className = "h-6 w-6" }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m-5.747-8.995l11.494 0M4.753 12.747l14.494 0M4 6h16M4 18h16" /></svg>);
const TargetIcon = ({ className = "h-5 w-5" }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const UploadCloudIcon = ({ className = "h-5 w-5" }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>);


// --- MAIN PAGE COMPONENT ---
const HanQuestionPage: React.FC = () => {
    const [questions, setQuestions] = useState<ApiQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [listError, setListError] = useState<string | null>(null);
    const [editingQuestion, setEditingQuestion] = useState<ApiQuestion | null>(null);

    // --- MODIFIED: State to manage the modal ---
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    
    // --- MODIFIED: Made fetchQuestions a reusable function ---
    const fetchQuestions = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get<ApiQuestion[]>(API_URL);
            setQuestions(response.data);
            setListError(null);
        } catch (err) {
            setListError('Failed to fetch questions.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    const handleDelete = async (questionId: number) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return;
        
        const originalQuestions = [...questions];
        setQuestions(questions.filter(q => q.id !== questionId));
        try {
            await axios.delete(`${API_URL}${questionId}/`);
        } catch (error) {
            setQuestions(originalQuestions);
            alert('Failed to delete question. Please try again.');
        }
    };

    const handleEdit = (question: ApiQuestion) => {
        setEditingQuestion(question);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFormSubmit = (submittedQuestion: ApiQuestion) => {
        if (editingQuestion) {
            setQuestions(questions.map(q => q.id === submittedQuestion.id ? submittedQuestion : q));
        } else {
            setQuestions([...questions, submittedQuestion]);
        }
        setEditingQuestion(null);
    };

    const handleCancelEdit = () => {
        setEditingQuestion(null);
    };

    // --- MODIFIED: Handler for successful uploads ---
    const handleUploadSuccess = () => {
        setIsUploadModalOpen(false);
        fetchQuestions();
    };

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left Column: Form */}
                <div className="lg:col-span-3">
                    <QuestionForm 
                        key={editingQuestion ? editingQuestion.id : 'new'}
                        existingQuestion={editingQuestion}
                        onSubmitSuccess={handleFormSubmit}
                        onCancel={handleCancelEdit}
                        // --- MODIFIED: Pass the click handler to the form ---
                        onBulkUploadClick={() => setIsUploadModalOpen(true)}
                    />
                </div>
                {/* Right Column: Question List */}
                <div className="lg:col-span-2">
                   <div className="bg-white p-6 rounded-xl shadow-lg h-full">
                        <div className="flex justify-between items-center mb-4">
                             <div className="flex items-center gap-3">
                                <div className="bg-green-100 p-2 rounded-lg">
                                  <BookIcon className="h-6 w-6 text-green-600"/>
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">Hanchou Questions</h2>
                             </div>
                             <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                                {questions.length} Questions
                            </span>
                        </div>
                        <div className="mt-4 pr-2 -mr-2 h-[75vh] overflow-y-auto">
                            {isLoading && <p>Loading...</p>}
                            {listError && <p className="text-red-500">{listError}</p>}
                            {!isLoading && questions.length === 0 && (
                                <p className="text-center text-gray-500 pt-16">No questions found. Add one using the form.</p>
                            )}
                            <ul className="space-y-3">
                                {questions.map((q, index) => (
                                    <li key={q.id} className="bg-gray-50 border border-gray-200 p-3 rounded-lg shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <p className="text-gray-800 pr-4">
                                                <span className="font-bold text-gray-500 mr-2">{index + 1}.</span>
                                                {q.question}
                                            </p>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <button onClick={() => handleEdit(q)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors"><EditIcon className="h-4 w-4"/></button>
                                                <button onClick={() => handleDelete(q.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"><DeleteIcon className="h-4 w-4"/></button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                   </div>
                </div>
            </div>
            {/* --- MODIFIED: Render the modal --- */}
            <HanchouBulkUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUploadSuccess={handleUploadSuccess}
            />
        </div>
    );
};

// --- FORM COMPONENT ---
interface QuestionFormProps {
    existingQuestion: ApiQuestion | null;
    onSubmitSuccess: (question: ApiQuestion) => void;
    onCancel: () => void;
    // --- MODIFIED: Add prop for the click handler ---
    onBulkUploadClick: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ existingQuestion, onSubmitSuccess, onCancel, onBulkUploadClick }) => {
    const isEditing = !!existingQuestion;
    const [formData, setFormData] = useState({ question: '', options: ['', '', '', ''], correctAnswerIndex: null as number | null });
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        if (existingQuestion) {
            const options = [existingQuestion.option_a, existingQuestion.option_b, existingQuestion.option_c, existingQuestion.option_d];
            const correctIndex = options.findIndex(opt => opt === existingQuestion.correct_answer);
            setFormData({
                question: existingQuestion.question,
                options: options,
                correctAnswerIndex: correctIndex !== -1 ? correctIndex : null,
            });
        } else {
            // Reset form when switching from edit to new
            setFormData({ question: '', options: ['', '', '', ''], correctAnswerIndex: null });
        }
    }, [existingQuestion]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, question: e.target.value }));
    };

    const handleOptionChange = (index: number, value: string) => {
        const updatedOptions = [...formData.options];
        updatedOptions[index] = value;
        setFormData(prev => ({ ...prev, options: updatedOptions }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);
        if (!formData.question.trim() || formData.options.some(opt => !opt.trim()) || formData.correctAnswerIndex === null) {
            setFormError('All fields are required, and a correct answer must be selected.');
            return;
        }
        const payload = {
            question: formData.question,
            option_a: formData.options[0],
            option_b: formData.options[1],
            option_c: formData.options[2],
            option_d: formData.options[3],
            correct_answer: formData.options[formData.correctAnswerIndex],
        };
        setIsSaving(true);
        try {
            const response = isEditing && existingQuestion
                ? await axios.put<ApiQuestion>(`${API_URL}${existingQuestion.id}/`, payload)
                : await axios.post<ApiQuestion>(API_URL, payload);

            if (response.data) {
                onSubmitSuccess(response.data);
                if (!isEditing) {
                    setFormData({ question: '', options: ['', '', '', ''], correctAnswerIndex: null });
                }
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                 setFormError(error.response.data.detail || 'An error occurred. Please check your data.');
            } else {
                 setFormError('An unexpected error occurred.');
            }
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
         <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
            {/* --- MODIFIED: Header now includes the upload button --- */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-xl font-bold text-gray-800">
                    {isEditing ? 'Edit Hanchou Question' : 'Add New Hanchou Question'}
                </h2>
                {!isEditing && (
                    <button
                        type="button"
                        onClick={onBulkUploadClick}
                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm px-3 py-2 rounded-lg transition-colors"
                    >
                        <UploadCloudIcon className="h-4 w-4" />
                        Bulk Upload
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="question" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                     <EditIcon className="h-4 w-4 text-gray-400" />
                     Question Text
                  </label>
                  <textarea
                    id="question"
                    name="question"
                    rows={4}
                    value={formData.question}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your question here..."
                  />
                </div>
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <TargetIcon className="h-4 w-4 text-gray-400"/>
                        Answer Options
                    </label>
                    <div className="space-y-3 mt-1">
                        {formData.options.map((option, index) => (
                           <div key={index} className="flex items-center justify-between p-2 pl-4 border border-gray-300 bg-white rounded-lg shadow-sm">
                               <span className="flex items-center justify-center h-7 w-7 rounded-full bg-gray-200 text-gray-600 font-bold mr-3 text-sm">
                                 {String.fromCharCode(65 + index)}
                               </span>
                               <input
                                   type="text"
                                   value={option}
                                   onChange={(e) => handleOptionChange(index, e.target.value)}
                                   required
                                   className="w-full border-none focus:ring-0 p-1 bg-transparent"
                                   placeholder={`Option ${String.fromCharCode(65 + index)}`}
                               />
                               <div className="flex items-center ml-4">
                                  <input
                                      type="radio"
                                      id={`correct_${index}`}
                                      name="correctAnswer"
                                      checked={formData.correctAnswerIndex === index}
                                      onChange={() => setFormData(prev => ({...prev, correctAnswerIndex: index}))}
                                      className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                                  />
                                  <label htmlFor={`correct_${index}`} className="ml-2 text-sm text-gray-600">Correct</label>
                               </div>
                           </div>
                        ))}
                    </div>
                </div>
                {formError && <p className="text-red-600 bg-red-50 p-3 rounded-md text-sm">{formError}</p>}
                <div className="flex items-center justify-end gap-3 pt-4">
                    {isEditing && (
                        <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors">
                            Cancel
                        </button>
                    )}
                    <button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 w-full sm:w-auto">
                        {isSaving ? 'Saving...' : (isEditing ? 'Update Question' : 'Save Question')}
                    </button>
                </div>
            </form>
         </div>
    );
};

export default HanQuestionPage;