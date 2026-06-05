


import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// ===================================================================
// 1. TYPE DEFINITIONS
// ===================================================================
type ApiQuestion = {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
};

// type ApiEmployee = {
//   id: number;
//   name: string;
//   pay_code: string;
// };

type ApiEmployee = {
  emp_id: string;       // comes from backend
  first_name: string;
  last_name: string;
  department: number;
  department_name: string;
  date_of_joining: string;
  birth_date: string;
  sex: string;
  email: string;
  phone: string;
};


type UiQuestion = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
};

type ExamResultPayload = {
  // employee_id: number;
  employee_id: string;
  started_at: string;
  submitted_at: string;
  total_questions: number;
  score: number;
};

// Type for the full result object returned by the server after submission
type ApiResultResponse = {
  id: number;
  pass_mark_percent: number;
  passed: boolean;
  percentage: number;
};

interface ExamProps {
  examName?: string;
  onComplete: () => void;
}

// ===================================================================
// 2. MAIN COMPONENT
// ===================================================================
const HanchouExam: React.FC<ExamProps> = ({
  examName = 'Hanchou Skills Exam',
  onComplete,
}) => {
  // --- Data fetching state ---
  const [questions, setQuestions] = useState<UiQuestion[]>([]);
  const [employees, setEmployees] = useState<ApiEmployee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Exam flow state ---
  const [mode, setMode] = useState<'setup' | 'exam'>('setup');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});
  const [showScore, setShowScore] = useState<boolean>(false);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // ★ New state to hold the final result from the API
  const [apiResult, setApiResult] = useState<ApiResultResponse | null>(null);


  // ★ New state for the employee combobox
  const [employeeQuery, setEmployeeQuery] = useState('');
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const employeeComboboxRef = useRef<HTMLDivElement>(null);


  // const selectedEmployee = employees.find(e => e.id.toString() === selectedEmployeeId);
  const selectedEmployee = employees.find(e => e.emp_id === selectedEmployeeId);


  // ★ Filter employees based on the query for the combobox
  // const filteredEmployees = employeeQuery === ''
  //   ? employees
  //   : employees.filter(emp =>
  //       emp.name.toLowerCase().replace(/\s+/g, '').includes(employeeQuery.toLowerCase().replace(/\s+/g, '')) ||
  //       emp.pay_code.toLowerCase().includes(employeeQuery.toLowerCase())
  //     );
  const filteredEmployees = employeeQuery === ''
    ? employees
    : employees.filter(emp => {
        const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase().replace(/\s+/g, '');
        const query = employeeQuery.toLowerCase().replace(/\s+/g, '');
        return fullName.includes(query) || emp.emp_id.toLowerCase().includes(query);
      });



  // ★ Effect to handle closing the combobox when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (employeeComboboxRef.current && !employeeComboboxRef.current.contains(event.target as Node)) {
        setIsEmployeeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [employeeComboboxRef]);


  useEffect(() => {
    const API_BASE_URL = 'http://127.0.0.1:8000/'; // Ensure /api/ is in your URL if needed

    const transformApiQuestions = (apiData: ApiQuestion[]): UiQuestion[] => {
      return apiData.map(q => ({
        id: q.id,
        question: q.question,
        options: [q.option_a, q.option_b, q.option_c, q.option_d],
        correctAnswer: q.correct_answer,
      }));
    };

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        const headers = token ? { 'Authorization': `Token ${token}` } : {};

        const [questionsResponse, employeesResponse] = await Promise.all([
          axios.get<ApiQuestion[]>(`${API_BASE_URL}hanchou-questions/`, { headers }),
          // axios.get<ApiEmployee[]>(`${API_BASE_URL}/employees/`, { headers }),
          axios.get<ApiEmployee[]>(`${API_BASE_URL}mastertable/`, { headers }),
        ]);
        setQuestions(transformApiQuestions(questionsResponse.data));
        setEmployees(employeesResponse.data);
      } catch (err: any) {
        if (err.response && err.response.status === 401) {
            setError("Your session has expired. Please log in again.");
        } else {
            setError('Failed to load exam data. Please check the connection.');
        }
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);



    // ★ Handler for when an employee is selected from the combobox list
  // const handleSelectEmployee = (employee: ApiEmployee) => {
  //   setSelectedEmployeeId(employee.id.toString());
  //   setEmployeeQuery(`${employee.name.trim()} (${employee.pay_code.trim()})`);
  //   setIsEmployeeDropdownOpen(false);
  // };

  const handleSelectEmployee = (employee: ApiEmployee) => {
    setSelectedEmployeeId(employee.emp_id);
    setEmployeeQuery(`${employee.first_name} ${employee.last_name} (${employee.emp_id})`);
    setIsEmployeeDropdownOpen(false);
  };







  const handleStartExam = () => {
    if (!selectedEmployeeId || questions.length === 0) return;
    setCurrentQuestion(0);
    setUserAnswers({});
    setShowScore(false);
    setFinalScore(0);
    setApiResult(null); // Reset api result on new exam start
    setStartTime(new Date());
    setMode('exam');
  };

  const handleAnswerSelect = (selectedIndex: number): void => {
    setUserAnswers(prev => ({ ...prev, [currentQuestion]: selectedIndex }));
  };
  
  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleSubmitExam = async () => {
    setIsSubmitting(true);
    setApiResult(null);

    let score = 0;
    questions.forEach((question, questionIndex) => {
      const selectedAnswerIndex = userAnswers[questionIndex];
      if (selectedAnswerIndex !== undefined) {
        const selectedAnswerText = question.options[selectedAnswerIndex];
        if (selectedAnswerText === question.correctAnswer) {
          score++;
        }
      }
    });
    setFinalScore(score);

    const payload: ExamResultPayload = {
      // employee_id: parseInt(selectedEmployeeId, 10),
      // employee_id: selectedEmployeeId,  // use emp_id (string) instead of parseInt
      employee_id: selectedEmployeeId,
      started_at: startTime!.toISOString(),
      submitted_at: new Date().toISOString(),
      total_questions: questions.length,
      score: score,
    };

    try {
        const API_RESULT_URL = 'http://127.0.0.1:8000/hanchou/results/';
        const token = localStorage.getItem('authToken');
        const headers = token ? { 'Authorization': `Token ${token}` } : {};

        const response = await axios.post<ApiResultResponse>(API_RESULT_URL, payload, { headers });
        
        setApiResult(response.data);
    } catch(err: any) {
        console.error('Failed to submit result:', err.response?.data || err.message);
        alert('Error submitting results. Please notify an administrator.');
    } finally {
        setIsSubmitting(false);
        setShowScore(true);
    }
  };

  const getButtonClass = (index: number): string => {
    if (userAnswers[currentQuestion] === index) {
      return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 shadow-lg transform scale-[1.02]';
    }
    return 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-300 hover:shadow-md';
  };

  // ===================================================================
  // 3. RENDER LOGIC
  // ===================================================================

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Exam Data...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (mode === 'setup') {
    const canStart = Boolean(selectedEmployeeId && questions.length > 0);
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-white bg-opacity-90 backdrop-blur-sm p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Exam Setup</h2>
              <p className="text-gray-600">Configure your exam settings before starting</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* ▼▼▼ EMPLOYEE COMBOBOX START ▼▼▼ */}
              <div ref={employeeComboboxRef} className="relative bg-gray-50 rounded-xl p-6">
                <label htmlFor="employee" className="block text-sm font-semibold text-gray-700 mb-3">
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Select Employee
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="employee"
                    type="text"
                    onChange={e => {
                      setEmployeeQuery(e.target.value);
                      setSelectedEmployeeId(''); // Clear selection when user types
                      setIsEmployeeDropdownOpen(true);
                    }}
                    onFocus={() => setIsEmployeeDropdownOpen(true)}
                    value={employeeQuery}
                    placeholder="Search by name or pay code..."
                    autoComplete="off"
                    className="block w-full px-4 py-3 pr-10 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen)}
                  >
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                {isEmployeeDropdownOpen && (
                  <ul className="absolute z-20 w-[calc(100%-3rem)] mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map(emp => (
                        <li
                          // key={emp.id}
                          key={emp.emp_id}
                          className="text-gray-900 cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50"
                          onClick={() => handleSelectEmployee(emp)}
                        >
                          {/* <span className="block truncate">{emp.name.trim()} ({emp.pay_code.trim()})</span> */}
                          <span className="block truncate">
                            {emp.first_name} {emp.last_name} ({emp.emp_id})
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500 cursor-default select-none relative py-2 px-3">
                        No employees found.
                      </li>
                    )}
                  </ul>
                )}
              </div>
              {/* ▲▲▲ EMPLOYEE COMBOBOX END ▲▲▲ */}
              
              <div className="bg-gray-50 rounded-xl p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Exam Details
                  </span>
                </label>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="font-bold text-lg text-gray-800">{examName}</p>
                  <div className="flex items-center mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {questions.length} Questions
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end items-center gap-4 pt-6 border-t border-gray-200">
              <button 
                type="button" 
                onClick={onComplete} 
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Cancel
              </button>
              <button 
                onClick={handleStartExam} 
                disabled={!canStart} 
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Start Exam
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showScore) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-white bg-opacity-95 backdrop-blur-sm p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Exam Completed!</h2>
              {/* <p className="text-gray-600">
                Result for: <span className="font-semibold text-gray-800">{selectedEmployee?.name.trim() ?? '-'}</span>
              </p> */}
              <p className="text-gray-600">
                Result for:{" "}
                <span className="font-semibold text-gray-800">
                  {selectedEmployee
                    ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}`.trim()
                    : "-"}
                </span>
              </p>

            </div>
            
            {isSubmitting && (
              <div className="my-8 text-center">
                <div className="animate-pulse">
                  <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full animate-[loading_1.5s_ease-in-out_infinite]"></div>
                  </div>
                  <p className="text-gray-500 mt-4">Calculating and saving results...</p>
                </div>
              </div>
            )}

            {!isSubmitting && apiResult && (
              <div className="space-y-6">
                <div className={`p-6 rounded-xl text-white text-center transform transition-all duration-500
                                  ${apiResult.passed 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-green-200' 
                    : 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-200'
                  } shadow-xl`}
                >
                  <div className="text-4xl font-bold mb-2">
                    {apiResult.passed ? 'PASSED' : 'FAILED'}
                  </div>
                  <div className="text-lg opacity-90">
                    {apiResult.passed ? 'Congratulations!' : 'Better luck next time'}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-xl p-6 text-center transform transition-all duration-300 hover:scale-105">
                    <div className="text-3xl font-bold text-gray-800 mb-2">
                      {finalScore}/{questions.length}
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Questions Correct</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-6 text-center transform transition-all duration-300 hover:scale-105">
                    <div className={`text-3xl font-bold mb-2 ${
                      apiResult.passed ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {apiResult.percentage.toFixed(1)}%
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Your Score</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-6 text-center transform transition-all duration-300 hover:scale-105">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {apiResult.pass_mark_percent}%
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Passing Mark</p>
                  </div>
                </div>
              </div>
            )}
            
            {!isSubmitting && (
              <div className="mt-8 text-center">
                <button 
                  onClick={onComplete} 
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Finish & Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const isLastQuestion = currentQuestion === questions.length - 1;
  const isAnswerSelected = userAnswers[currentQuestion] !== undefined;
  const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-white bg-opacity-90 backdrop-blur-sm">
          {/* Header */}
          <div className="px-8 pt-8 pb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  Question {currentQuestion + 1} of {questions.length}
                </h2>
                {/* <p className="text-sm text-gray-600">
                  Candidate: <span className="font-semibold">{selectedEmployee?.name.trim() ?? '-'}</span>
                </p> */}
                <p className="text-sm text-gray-600">
                  Candidate:{" "}
                  <span className="font-semibold">
                    {selectedEmployee
                      ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}`.trim()
                      : "-"}
                  </span>
                </p>
              </div>
              <button 
                onClick={onComplete} 
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Exit
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          
          {/* Question Content */}
          <div className="px-8 pb-8">
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <p className="text-lg text-gray-800 font-medium leading-relaxed">
                {questions[currentQuestion].question}
              </p>
            </div>
            
            {/* Answer Options */}
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 transform hover:scale-[1.01] ${getButtonClass(index)}`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all ${
                      userAnswers[currentQuestion] === index 
                        ? 'border-white bg-white' 
                        : 'border-gray-400'
                    }`}>
                      {userAnswers[currentQuestion] === index && (
                        <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                      )}
                    </div>
                    <span className="font-medium">{option}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="mt-8 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {isAnswerSelected ? (
                  <span className="flex items-center text-green-600">
                    <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Answer selected
                  </span>
                ) : (
                  <span>Please select an answer</span>
                )}
              </div>
              
              {!isLastQuestion ? (
                <button 
                  onClick={handleNextQuestion} 
                  disabled={!isAnswerSelected} 
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center gap-2"
                >
                  Next Question
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              ) : (
                <button 
                  onClick={handleSubmitExam} 
                  disabled={!isAnswerSelected} 
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center gap-2"
                >
                  Submit Exam
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HanchouExam;