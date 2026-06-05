// import React, { useEffect, useState } from 'react';
// import { useLocation, useNavigate, useParams } from 'react-router-dom';
// import { CheckCircle, XCircle, BookOpen, User, Loader2 } from 'lucide-react';

// const API_BASE_URL = 'http://172.25.0.51:8000';

// interface AnswerSheetQuestion {
//     id: number;
//     question_text: string;
//     options: string[];
//     correct_index: number;
//     employee_answer_index: number; // -1 if unanswered
//     is_correct: boolean;
// }

// interface AnswerSheetData {
//     test_name: string;
//     employee_name: string;
//     employee_id: string;

//     // ⭐ ADD THESE NEW FIELDS ⭐
//     question_paper_name: string;
//     department_name: string;
//     station_name: string;
//     level_name: string;
//     // -------------------------

//     questions: AnswerSheetQuestion[];
//     score_summary: {
//         total_questions: number;
//         correct_answers: number;
//         score: number;
//         percentage: number;
//         passed: boolean;
//     };
// }

// interface LocationState {
//     sessionName: string;
//     employeeId: string;
//     employeeName: string;
// }

// const AnswerSheetView: React.FC = () => {
//     const navigate = useNavigate();
//     const location = useLocation();
//     // const state = location.state as LocationState | undefined;

//     // ⭐ 1. USE useParams TO READ ID FROM URL ⭐
//     const { scoreId: scoreIdParam } = useParams<{ scoreId: string }>(); 
//     const scoreId = scoreIdParam ? parseInt(scoreIdParam) : null;

//     const [answerSheetData, setAnswerSheetData] = useState<AnswerSheetData | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     // const sessionName = state?.sessionName;
//     // const employeeId = state?.employeeId;
//     // const employeeName = state?.employeeName;
//     // ⭐ Extract additional data passed via state (optional but useful for display) ⭐
//     const employeeName = location.state?.employeeName || 'N/A';
//     const employeeId = location.state?.employeeId || 'N/A'; // Still useful for context

//     useEffect(() => {
//         // if (!sessionName || !employeeId) {
//         //     setError('Missing session or employee details. Returning to results.');
//         //     setLoading(false);
//         //     setTimeout(() => navigate('/quiz-results'), 3000);
//         //     return;
//         // }
//         if (!scoreId) { // Check for the presence of scoreId
//             setError('Missing unique Score ID in URL. Returning to results.');
//             setLoading(false);
//             setTimeout(() => navigate('/quiz-results'), 3000);
//             return;
//         }

//         const fetchAnswerSheet = async () => {
//             try {
//                 setLoading(true);
//                 setError(null);
                
//                 // IMPORTANT: You need to implement this new endpoint on your backend (Django/FastAPI)
//                 // const encodedSessionName = encodeURIComponent(sessionName);
//                 // const response = await fetch(`${API_BASE_URL}/api/answersheet/${encodedSessionName}/${employeeId}/`);
                

//                 // ⭐ 2. UPDATE API CALL TO USE scoreId ⭐
//                 // Backend URL should be updated to: /api/answersheet/<int:score_id>/
//                 const response = await fetch(`${API_BASE_URL}/api/answersheet/${scoreId}/`);

//                 if (!response.ok) {
//                     const errData = await response.json().catch(() => ({}));
//                     // throw new Error(errData.detail || `Failed to fetch answersheet: ${response.status}`);
//                     throw new Error(errData.error || `Failed to fetch answersheet for ID ${scoreId}: ${response.status}`);
//                 }
                
//                 const data: AnswerSheetData = await response.json();
//                 setAnswerSheetData(data);

//             } catch (err) {
//                 console.error('Error fetching answer sheet:', err);
//                 setError(`Failed to load answer sheet: ${err instanceof Error ? err.message : 'Unknown error'}`);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchAnswerSheet();
//     // }, [sessionName, employeeId, navigate]);
//     }, [scoreId, navigate]); // Depend on scoreId

//     const getOptionClass = (optionIndex: number, correctIndex: number, employeeIndex: number) => {
//         if (optionIndex === correctIndex) {
//             return 'bg-green-100 border-green-400 text-green-800'; // Correct Answer
//         }
//         if (optionIndex === employeeIndex && employeeIndex !== correctIndex) {
//             return 'bg-red-100 border-red-400 text-red-800'; // Incorrectly Selected Answer
//         }
//         return 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'; // Unselected or Neutral Option
//     };

//     const getOptionMarker = (optionIndex: number, correctIndex: number, employeeIndex: number) => {
//         if (optionIndex === correctIndex) return <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />;
//         if (optionIndex === employeeIndex && employeeIndex !== correctIndex) return <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />;
//         return <div className="w-5 h-5 flex items-center justify-center text-gray-500">{String.fromCharCode(65 + optionIndex)}</div>;
//     };


//     if (loading) {
//         return (
//             <div className="min-h-screen flex items-center justify-center bg-gray-50">
//                 <div className="flex flex-col items-center space-y-4">
//                     <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
//                     <p className="text-lg font-medium text-gray-600">Loading Answer Sheet...</p>
//                 </div>
//             </div>
//         );
//     }

//     if (error || !answerSheetData) {
//         return (
//             <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center">
//                 <div className="bg-red-50 border border-red-400 rounded-xl p-6 max-w-2xl mt-10">
//                     <h2 className="text-xl font-bold text-red-800 mb-4">Error</h2>
//                     <p className="text-red-700">{error || 'No data found.'}</p>
//                     <button onClick={() => navigate('/quiz-results')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
//                         Back to Results
//                     </button>
//                 </div>
//             </div>
//         );
//     }
    
//     const { total_questions, correct_answers, percentage, passed } = answerSheetData.score_summary;

//     return (
//         <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
//             <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-3xl p-6 sm:p-10 border border-gray-200">
                
//                 {/* Header */}
//                 <div className="mb-10 border-b pb-6 flex items-center justify-between">
//                     <div>
//                         <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 flex items-center gap-3">
//                             <BookOpen className="w-8 h-8 text-blue-600" />
//                             Answer Sheet Review
//                         </h1>
//                         {/* <p className="mt-2 text-xl text-gray-600">{answerSheetData.test_name}</p> */}
//                     </div>
//                     <div className="text-right">
//                         <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
//                             <User className="w-5 h-5 text-purple-600" />
//                             {/* {employeeName} */}
//                             {answerSheetData.employee_name || employeeName} {/* Use API data if available, fallback to state */}
//                         </div>
//                         {/* <p className="text-sm text-gray-500">Employee ID: {employeeId}</p> */}
//                         <p className="text-sm text-gray-500">Employee ID: {answerSheetData.employee_id || employeeId}</p>
//                     </div>
//                 </div>

//                 {/* ⭐ ADDED: CONTEXTUAL DETAILS SECTION ⭐ */}
//                 <div className="bg-gray-100 p-6 rounded-xl mb-8 border border-gray-200">
//                     <h3 className="text-lg font-bold text-gray-800 mb-4">Assessment Context</h3>
                    
//                     {/* Change grid-cols-3 to grid-cols-4 for cleaner layout */}
//                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm font-medium"> 
                        
//                         <div className="flex flex-col">
//                             <span className="text-gray-500">Question Paper</span>
//                             <span className="text-gray-900 text-lg font-semibold">{answerSheetData.question_paper_name}</span>
//                         </div>
                        
//                         <div className="flex flex-col">
//                             <span className="text-gray-500">Level</span>
//                             <span className="text-gray-900 text-lg font-semibold">{answerSheetData.level_name}</span> {/* ⭐ NEW DISPLAY ⭐ */}
//                         </div>

//                         <div className="flex flex-col">
//                             <span className="text-gray-500">Department</span>
//                             <span className="text-gray-900 text-lg font-semibold">{answerSheetData.department_name}</span>
//                         </div>

//                         <div className="flex flex-col">
//                             <span className="text-gray-500">Station / Skill</span>
//                             <span className="text-gray-900 text-lg font-semibold">{answerSheetData.station_name}</span>
//                         </div>
                        
//                     </div>
//                 </div>
//                 {/* ------------------------------------------- */}

//                 {/* Score Summary */}
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
//                     <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-center">
//                         <p className="text-sm font-medium text-blue-600">Total Questions</p>
//                         <p className="text-2xl font-bold text-gray-900">{total_questions}</p>
//                     </div>
//                     <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-center">
//                         <p className="text-sm font-medium text-green-600">Correct Answers</p>
//                         <p className="text-2xl font-bold text-gray-900">{correct_answers}</p>
//                     </div>
//                     <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 text-center">
//                         <p className="text-sm font-medium text-purple-600">Score Percentage</p>
//                         <p className="text-2xl font-bold text-gray-900">{percentage.toFixed(1)}%</p>
//                     </div>
//                     <div className="p-4 rounded-xl border text-center" style={{ backgroundColor: passed ? '#ecfdf5' : '#fef2f2', borderColor: passed ? '#a7f3d0' : '#fecaca' }}>
//                         <p className="text-sm font-medium" style={{ color: passed ? '#059669' : '#ef4444' }}>Result</p>
//                         <p className="text-2xl font-bold" style={{ color: passed ? '#059669' : '#ef4444' }}>{passed ? 'PASSED' : 'FAILED'}</p>
//                     </div>
//                 </div>

//                 {/* Question List */}
//                 <div className="space-y-12">
//                     {answerSheetData.questions.map((q, index) => (
//                         <div key={q.id} className="p-6 bg-white border border-gray-200 rounded-xl shadow-lg">
//                             <div className="flex items-start justify-between mb-4">
//                                 <h3 className="text-xl font-semibold text-gray-900">
//                                     Q{index + 1}. {q.question_text}
//                                 </h3>
//                                 <div className={`px-3 py-1 rounded-full text-sm font-bold ${q.is_correct ? 'bg-green-50 text-green-700 border border-green-300' : q.employee_answer_index === -1 ? 'bg-gray-50 text-gray-600 border border-gray-300' : 'bg-red-50 text-red-700 border border-red-300'}`}>
//                                     {q.is_correct ? 'Correct' : q.employee_answer_index === -1 ? 'Unanswered' : 'Incorrect'}
//                                 </div>
//                             </div>

//                             <div className="space-y-3 mt-5">
//                                 {q.options.map((option, optIndex) => (
//                                     <div
//                                         key={optIndex}
//                                         className={`flex items-center p-4 rounded-lg border-2 transition-all ${getOptionClass(optIndex, q.correct_index, q.employee_answer_index)}`}
//                                     >
//                                         {getOptionMarker(optIndex, q.correct_index, q.employee_answer_index)}
//                                         <p className="ml-3 font-medium text-base flex-1">
//                                             {option}
//                                         </p>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     ))}
//                 </div>

//                 {/* Footer Button */}
//                 <div className="mt-10 pt-6 border-t text-center">
//                     <button 
//                         onClick={() => navigate('/quiz-results')} 
//                         className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg"
//                     >
//                         Return to Results Dashboard
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AnswerSheetView;




import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, XCircle, BookOpen, User, Loader2, Image as ImageIcon } from 'lucide-react';

const API_BASE_URL = 'http://172.25.0.51:8000';

// ⭐ 1. MODIFIED INTERFACES TO SUPPORT IMAGES
interface OptionData {
    text: string;
    image_url: string | null;
}

interface AnswerSheetQuestion {
    id: number;
    question_text: string;
    question_image_url: string | null; // Added for question image
    options: OptionData[]; // Changed from string[] to OptionData[]
    correct_index: number;
    employee_answer_index: number;
    is_correct: boolean;
}

interface AnswerSheetData {
    test_name: string;
    employee_name: string;
    employee_id: string;
    question_paper_name: string;
    department_name: string;
    station_name: string;
    level_name: string;
    questions: AnswerSheetQuestion[];
    score_summary: {
        total_questions: number;
        correct_answers: number;
        score: number;
        percentage: number;
        passed: boolean;
    };
}

const AnswerSheetView: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { scoreId: scoreIdParam } = useParams<{ scoreId: string }>();
    const scoreId = scoreIdParam ? parseInt(scoreIdParam) : null;

    const [answerSheetData, setAnswerSheetData] = useState<AnswerSheetData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const employeeName = location.state?.employeeName || 'N/A';
    const employeeId = location.state?.employeeId || 'N/A';

    useEffect(() => {
        if (!scoreId) {
            setError('Missing unique Score ID in URL. Returning to results.');
            setLoading(false);
            setTimeout(() => navigate('/quiz-results'), 3000);
            return;
        }

        const fetchAnswerSheet = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`${API_BASE_URL}/api/answersheet/${scoreId}/`);

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.error || `Failed to fetch answersheet for ID ${scoreId}: ${response.status}`);
                }
                
                const data: AnswerSheetData = await response.json();
                setAnswerSheetData(data);

            } catch (err) {
                console.error('Error fetching answer sheet:', err);
                setError(`Failed to load answer sheet: ${err instanceof Error ? err.message : 'Unknown error'}`);
            } finally {
                setLoading(false);
            }
        };

        fetchAnswerSheet();
    }, [scoreId, navigate]);

    const getOptionClass = (optionIndex: number, correctIndex: number, employeeIndex: number) => {
        if (optionIndex === correctIndex) return 'bg-green-100 border-green-400 text-green-800';
        if (optionIndex === employeeIndex && employeeIndex !== correctIndex) return 'bg-red-100 border-red-400 text-red-800';
        return 'bg-gray-50 border-gray-300 text-gray-700';
    };

    const getOptionMarker = (optionIndex: number, correctIndex: number, employeeIndex: number) => {
        if (optionIndex === correctIndex) return <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />;
        if (optionIndex === employeeIndex && employeeIndex !== correctIndex) return <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />;
        return <div className="w-5 h-5 flex items-center justify-center font-mono text-gray-500">{String.fromCharCode(65 + optionIndex)}</div>;
    };

    // ⭐ 2. ADDED IMAGE ERROR HANDLER FOR DEBUGGING
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const target = e.currentTarget;
        console.error("Failed to load image:", target.src);
        target.style.display = 'none'; // Hide broken image element
        
        // Find the next sibling, which should be the placeholder div, and display it
        const placeholder = target.nextElementSibling as HTMLElement | null;
        if (placeholder && placeholder.classList.contains('image-placeholder')) {
            placeholder.style.display = 'flex';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-lg font-medium text-gray-600">Loading Answer Sheet...</p>
                </div>
            </div>
        );
    }

    if (error || !answerSheetData) {
        return (
            <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center">
                <div className="bg-red-50 border border-red-400 rounded-xl p-6 max-w-2xl mt-10">
                    <h2 className="text-xl font-bold text-red-800 mb-4">Error</h2>
                    <p className="text-red-700">{error || 'No data found.'}</p>
                    <button onClick={() => navigate('/quiz-results')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        Back to Results
                    </button>
                </div>
            </div>
        );
    }
    
    const { total_questions, correct_answers, percentage, passed } = answerSheetData.score_summary;

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-3xl p-6 sm:p-10 border border-gray-200">
                
                <header className="mb-10 border-b pb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 flex items-center gap-3">
                            <BookOpen className="w-8 h-8 text-blue-600" />
                            Answer Sheet Review
                        </h1>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                            <User className="w-5 h-5 text-purple-600" />
                            {answerSheetData.employee_name || employeeName}
                        </div>
                        <p className="text-sm text-gray-500">Employee ID: {answerSheetData.employee_id || employeeId}</p>
                    </div>
                </header>

                <section className="bg-gray-100 p-6 rounded-xl mb-8 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Assessment Context</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-2 text-sm font-medium">
                        <div className="flex flex-col"><span className="text-gray-500">Question Paper</span><span className="text-gray-900 text-base md:text-lg font-semibold">{answerSheetData.question_paper_name}</span></div>
                        <div className="flex flex-col"><span className="text-gray-500">Level</span><span className="text-gray-900 text-base md:text-lg font-semibold">{answerSheetData.level_name}</span></div>
                        <div className="flex flex-col"><span className="text-gray-500">Department</span><span className="text-gray-900 text-base md:text-lg font-semibold">{answerSheetData.department_name}</span></div>
                        <div className="flex flex-col"><span className="text-gray-500">Station / Skill</span><span className="text-gray-900 text-base md:text-lg font-semibold">{answerSheetData.station_name}</span></div>
                    </div>
                </section>

                <section className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-center"><p className="text-sm font-medium text-blue-600">Total Questions</p><p className="text-2xl font-bold text-gray-900">{total_questions}</p></div>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-center"><p className="text-sm font-medium text-green-600">Correct</p><p className="text-2xl font-bold text-gray-900">{correct_answers}</p></div>
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 text-center"><p className="text-sm font-medium text-purple-600">Percentage</p><p className="text-2xl font-bold text-gray-900">{percentage.toFixed(1)}%</p></div>
                    <div className="p-4 rounded-xl border text-center" style={{ backgroundColor: passed ? '#ecfdf5' : '#fef2f2', borderColor: passed ? '#a7f3d0' : '#fecaca' }}><p className="text-sm font-medium" style={{ color: passed ? '#059669' : '#ef4444' }}>Result</p><p className="text-2xl font-bold uppercase" style={{ color: passed ? '#059669' : '#ef4444' }}>{passed ? 'Passed' : 'Failed'}</p></div>
                </section>

                <main className="space-y-12">
                    {answerSheetData.questions.map((q, index) => (
                        <div key={q.id} className="p-4 sm:p-6 bg-white border border-gray-200 rounded-2xl shadow-lg">
                            <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-3">
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex-1">
                                    Q{index + 1}. {q.question_text}
                                </h3>
                                <div className={`px-3 py-1 rounded-full text-sm font-bold flex-shrink-0 ${q.is_correct ? 'bg-green-100 text-green-800' : q.employee_answer_index === -1 ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-800'}`}>
                                    {q.is_correct ? 'Correct' : q.employee_answer_index === -1 ? 'Unanswered' : 'Incorrect'}
                                </div>
                            </div>
                            
                            {/* ⭐ 3. ADDED QUESTION IMAGE DISPLAY */}
                            {q.question_image_url && (
                                <div className="my-4 p-2 border rounded-lg bg-gray-50 flex justify-center">
                                    <img src={q.question_image_url} alt={`Question ${index + 1}`} className="max-h-64 object-contain rounded-md" onError={handleImageError} />
                                    <div className="image-placeholder hidden h-64 w-full bg-gray-100 rounded-md items-center justify-center text-gray-400">
                                        <ImageIcon className="w-10 h-10 mr-2" /> Image not available
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3 mt-5">
                                {/* ⭐ 4. MODIFIED OPTIONS MAPPING TO HANDLE IMAGES */}
                                {q.options.map((option, optIndex) => (
                                    <div
                                        key={optIndex}
                                        className={`flex items-start p-3 sm:p-4 rounded-lg border-2 transition-all ${getOptionClass(optIndex, q.correct_index, q.employee_answer_index)}`}
                                    >
                                        <div className="mt-1">{getOptionMarker(optIndex, q.correct_index, q.employee_answer_index)}</div>
                                        <div className="ml-3 flex-1">
                                            {option.image_url && (
                                                <div className="mb-2 p-2 border rounded-md bg-white">
                                                    <img src={option.image_url} alt={`Option ${String.fromCharCode(65 + optIndex)}`} className="max-h-40 w-full object-contain rounded" onError={handleImageError} />
                                                    <div className="image-placeholder hidden h-40 w-full bg-gray-100 rounded-md items-center justify-center text-gray-400">
                                                        <ImageIcon className="w-8 h-8 mr-2" /> Image not available
                                                    </div>
                                                </div>
                                            )}
                                            <p className="font-medium text-base">
                                                {option.text}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </main>

                <footer className="mt-10 pt-6 border-t text-center">
                    <button 
                        onClick={() => navigate('/quiz-results')} 
                        className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg"
                    >
                        Return to Results Dashboard
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default AnswerSheetView;