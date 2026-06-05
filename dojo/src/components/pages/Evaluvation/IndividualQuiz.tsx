import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, replace } from 'react-router-dom';

interface Question {
  id: number;
  question_text: string;
  question_image?: string | null; // URL for question image
  options: string[];
  option_images: (string | null)[]; // URLs for option images
  correct_index: number;
}

interface LocationState {
  paperId: number;
  skillId?: number;
  levelId: number;
  stationId?: number;
  employee?: {
    id: string;
    name: string;
    pay_code: string;
    section: string;
  };
  employeeId?: string;
  test_name?: string;
  examMode?: string;
  departmentName?: string;
}

const IndividualQuiz: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizEnded, setQuizEnded] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [totalTimeLeft, setTotalTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const paperId = state?.paperId;
  const skillId = state?.stationId;
  const levelId = state?.levelId;
  const employee = state?.employee;
  const employeeId = state?.employeeId || employee?.id;
  const testName = state?.test_name || `Individual_Test_${new Date().toISOString().slice(0, 10)}`;
  const examMode = state?.examMode || 'computer';
  const departmentName = state?.departmentName || 'Drum Brake';

  useEffect(() => {
    if (questions.length > 0) {
      setAnswers(Array(questions.length).fill(null));
      setTotalTimeLeft(questions.length * 30);
    }
  }, [questions]);

  useEffect(() => {
    setSelectedOption(answers[currentIndex] ?? null);
  }, [currentIndex, answers]);

  useEffect(() => {
    if (!paperId || !skillId || !levelId) {
      setLoading(false);
      setErrorMessage('Invalid navigation state. Please start the quiz from the assignment page.');
      setTimeout(() => navigate('/quiz-results' ,{replace:true}), 3000);
      return;
    }

    const fetchQuestions = async () => {
      try {
        const res = await fetch(`http://172.25.0.51:8000/questionpapers/${paperId}/questions/`);
        if (!res.ok) {
          throw new Error(`Failed to fetch questions: ${res.status}`);
        }
        const data = await res.json();
        const questionsData = data.questions || [];

        if (!Array.isArray(questionsData) || questionsData.length === 0) {
          setErrorMessage("No questions are available for this quiz. Please contact the administrator.");
          setQuestions([]);
          return;
        }

        const mapped: Question[] = questionsData
          .map((q: any, index: number) => ({
            id: q.question_id || q.id || index,
            question_text: q.question_text || q.text || q.question || "",
            question_image: q.question_image || null, // Add question image URL
            options: [
              q.option_a || q.options?.[0] || "",
              q.option_b || q.options?.[1] || "",
              q.option_c || q.options?.[2] || "",
              q.option_d || q.options?.[3] || "",
            ].filter(opt => opt && opt.trim() !== ""),
            option_images: [
              q.option_a_image || null,
              q.option_b_image || null,
              q.option_c_image || null,
              q.option_d_image || null,
            ].slice(0, 4), // Ensure option_images array aligns with options
            correct_index: Number.isInteger(q.correct_answer_index || q.correct_index)
              ? q.correct_answer_index || q.correct_index
              : 0,
          }))
          .filter(q => q.question_text && q.options.length >= 2 && q.correct_index < q.options.length);

        if (mapped.length === 0) {
          setErrorMessage('No valid questions found for this quiz. Please contact the administrator.');
        } else {
          setQuestions(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch questions:", err);
        setErrorMessage("Failed to load questions. Please check your connection or contact support.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [paperId, skillId, levelId, navigate]);

  useEffect(() => {
    if (quizEnded && !submitting) {
      const redirectTimer = setInterval(() => {
        setRedirectCountdown(prev => {
          if (prev <= 1) {
            clearInterval(redirectTimer);
            navigate('/quiz-results',{replace:true});
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(redirectTimer);
    }
  }, [quizEnded, submitting, navigate]);

  const getUnansweredQuestions = () => answers.map((answer, index) => (answer === null ? index : -1)).filter(index => index !== -1);

  const handleAutoSubmit = async () => {
    if (quizEnded || submitting) return;
    setSubmitting(true);
    setAutoSubmitted(true);

    const userAnswers = answers.map(answer => answer ?? -1);
    const payload = {
      employee_id: employeeId || null,
      test_name: testName,
      question_paper_id: paperId,
      skill_id: skillId,
      level_id: levelId,
      department_name: departmentName,
      answers: userAnswers,
    };

    console.log('Auto-submission payload:', payload);

    try {
      const response = await fetch('http://172.25.0.51:8000/submit-web-test/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setQuizEnded(true);
      } else {
        const errorData = await response.json();
        console.error('Auto-submission failed:', { status: response.status, error: errorData.error, traceback: errorData.traceback });
        setErrorMessage(errorData.error || 'Test time expired and auto-submission failed. Please contact support.');
        setAutoSubmitted(false);
      }
    } catch (err) {
      console.error('Network error during auto-submission:', err);
      setErrorMessage('A network error occurred during auto-submission. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (loading || !questions.length || quizEnded) return;
    const timer = setInterval(() => {
      setTotalTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, questions.length, quizEnded]);

  const handleSubmit = async () => {
    if (quizEnded || submitting) return;
    setSubmitting(true);
    setErrorMessage(null);

    const userAnswers = answers.map(answer => answer ?? -1);
    const payload = {
      employee_id: employeeId || null,
      test_name: testName,
      question_paper_id: paperId,
      skill_id: skillId,
      level_id: levelId,
      department_name: departmentName,
      answers: userAnswers,
    };

    console.log('Manual submission payload:', payload);

    try {
      const response = await fetch('http://172.25.0.51:8000/submit-web-test/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setQuizEnded(true);
      } else {
        const errorData = await response.json();
        console.error('Manual submission failed:', { status: response.status, error: errorData.error, traceback: errorData.traceback });
        setErrorMessage(errorData.error || 'Submission failed. Please try again.');
      }
    } catch (err) {
      console.error('Network error during submission:', err);
      setErrorMessage('A network error occurred during submission. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOptionSelect = (optionIndex: number) => {
    if (quizEnded) return;
    setSelectedOption(optionIndex);
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentIndex] = optionIndex;
      return newAnswers;
    });
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const handleNavigateToQuestion = (questionIndex: number) => {
    setCurrentIndex(questionIndex);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (quizEnded) {
    const answeredCount = answers.filter(answer => answer !== null).length;
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-lg w-full">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
            <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-4">
              {autoSubmitted ? 'Time Expired!' : 'Test Completed!'}
            </h2>
            <p className="text-slate-300 mb-6 text-lg">
              {autoSubmitted
                ? 'Your test time has expired and has been automatically submitted.'
                : 'Your test has been successfully submitted. Thank you for participating!'}
            </p>
            <div className="bg-white/5 rounded-xl p-6 mb-8 border border-white/10">
              <h3 className="text-white font-semibold mb-4">Test Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-left">
                  <div className="text-slate-400">Questions Answered</div>
                  <div className="text-white font-semibold text-xl">{answeredCount}/{questions.length}</div>
                </div>
                <div className="text-left">
                  <div className="text-slate-400">Completion Rate</div>
                  <div className="text-white font-semibold text-xl">
                    {questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0}%
                  </div>
                </div>
              </div>
              {employee && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="text-slate-400 text-sm">Participant</div>
                  <div className="text-white font-medium">{employee.name}</div>
                  <div className="text-slate-300 text-sm">{employee.pay_code} • {departmentName}</div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center gap-3 text-blue-400">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-sm">
                Redirecting to assign employees in {redirectCountdown} second{redirectCountdown !== 1 ? 's' : ''}...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl font-semibold">Loading Quiz...</div>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="text-red-400 text-2xl">!</div>
          </div>
          <div className="text-white text-xl font-semibold">No Questions Found</div>
          <div className="text-slate-300 mt-2 mb-4 max-w-md mx-auto">{errorMessage || 'Unable to load questions from server. Please check connection.'}</div>
          <button
            onClick={() => navigate('/assign-employees')}
            className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
          >
            Back to Assignment
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const answeredCount = answers.filter(answer => answer !== null).length;
  const unansweredQuestions = getUnansweredQuestions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-3 sm:p-4 lg:p-6">
      <header className="max-w-7xl mx-auto mb-6 sm:mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">Q</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-white">Individual Assessment</h1>
                <div className="text-sm text-slate-300 truncate">
                  {employee?.name || 'Participant'} - {employee?.pay_code || ''} • {departmentName}
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto">
              <div className="text-sm text-slate-300 mb-1">Question Progress</div>
              <div className="text-xl font-bold text-white">
                {currentIndex + 1} / {questions.length}
              </div>
              <div className="text-sm text-slate-300">
                Answered: {answeredCount} / {questions.length}
              </div>
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="w-full bg-white/20 rounded-full h-1 mt-2">
            <div
              className={`h-1 rounded-full transition-all duration-1000 ${
                totalTimeLeft <= 60 ? 'bg-red-500' : totalTimeLeft <= 120 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${(totalTimeLeft / (questions.length * 30)) * 100}%` }}
            />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/20">
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-2">
              <div className="text-sm text-slate-300">Question {currentIndex + 1}</div>
              {answers[currentIndex] !== null && (
                <div className="flex items-center gap-1 text-green-400 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Answered
                </div>
              )}
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white leading-relaxed">
              {currentQuestion.question_text}
            </h2>
            {currentQuestion.question_image && (
              <div className="mt-4">
                <img
                  src={currentQuestion.question_image}
                  alt="Question Image"
                  className="max-w-full h-auto rounded-lg border border-white/20"
                  style={{ maxHeight: '300px', objectFit: 'contain' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    console.error('Failed to load question image:', currentQuestion.question_image);
                  }}
                />
              </div>
            )}
          </div>
          <div className="grid gap-3 sm:gap-4">
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                onClick={() => handleOptionSelect(index)}
                onKeyPress={(e) => e.key === 'Enter' && handleOptionSelect(index)}
                role="button"
                tabIndex={0}
                aria-label={`Option ${String.fromCharCode(65 + index)}: ${option}`}
                className={`group relative cursor-pointer transition-all duration-300 ${
                  selectedOption === index
                    ? 'bg-blue-500/20 border-blue-400/60 shadow-lg shadow-blue-500/20'
                    : 'bg-white/5 hover:bg-white/10 border-white/20 hover:border-white/40'
                } border rounded-xl p-4 sm:p-6 ${quizEnded ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center border transition-all duration-300 flex-shrink-0 ${
                      selectedOption === index
                        ? 'bg-blue-500/40 border-blue-400/60 shadow-md'
                        : 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 group-hover:from-blue-500/30 group-hover:to-purple-600/30 border-white/20 group-hover:border-white/40'
                    }`}
                  >
                    <span
                      className={`font-bold text-sm sm:text-lg transition-colors duration-300 ${
                        selectedOption === index ? 'text-blue-200' : 'text-white'
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {currentQuestion.option_images[index] ? (
                      <img
                        src={currentQuestion.option_images[index]!}
                        alt={`Option ${String.fromCharCode(65 + index)}`}
                        className="max-w-full h-auto rounded-lg border border-white/20"
                        style={{ maxHeight: '150px', objectFit: 'contain' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          console.error('Failed to load option image:', currentQuestion.option_images[index]);
                        }}
                      />
                    ) : (
                      <div
                        className={`text-base sm:text-lg font-medium transition-colors duration-300 break-words ${
                          selectedOption === index ? 'text-blue-200' : 'text-white group-hover:text-blue-200'
                        }`}
                      >
                        {option}
                      </div>
                    )}
                  </div>
                  {selectedOption === index && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-green-400 text-xs sm:text-sm font-medium">Selected</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {unansweredQuestions.length > 0 && (
            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-amber-400 text-xs">!</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-amber-400 font-medium mb-2">
                    {unansweredQuestions.length} question{unansweredQuestions.length > 1 ? 's' : ''} remaining
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {unansweredQuestions.map((questionIndex) => (
                      <button
                        key={questionIndex}
                        onClick={() => handleNavigateToQuestion(questionIndex)}
                        className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-sm transition-colors"
                      >
                        Q{questionIndex + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {errorMessage && (
            <div className="mt-6 p-4 bg-red-900/50 border border-red-400/30 rounded-xl flex items-start space-x-3">
              <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-300 mb-1">Submission Error</h3>
                <p className="text-sm text-red-400">{errorMessage}</p>
              </div>
            </div>
          )}
          <div className="mt-6 sm:mt-8">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="flex-1 sm:flex-none px-4 py-3 sm:px-6 sm:py-3 bg-blue-500/20 hover:bg-blue-500/30 disabled:bg-gray-500/20 disabled:text-gray-500 text-blue-400 rounded-lg text-sm sm:text-base font-medium transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === questions.length - 1}
                  className="flex-1 sm:flex-none px-4 py-3 sm:px-6 sm:py-3 bg-blue-500/20 hover:bg-blue-500/30 disabled:bg-gray-500/20 disabled:text-gray-500 text-blue-400 rounded-lg text-sm sm:text-base font-medium transition-colors"
                >
                  Next
                </button>
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-3 bg-green-500/20 hover:bg-green-500/30 disabled:bg-gray-500/20 disabled:text-gray-500 text-green-400 rounded-lg text-sm sm:text-base font-medium transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  `Submit Test (${answeredCount}/${questions.length})`
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
      <div className="fixed top-3 right-3 sm:top-4 sm:right-4 bg-white/10 backdrop-blur-md rounded-xl p-2 sm:p-3 border border-white/20 z-10">
        <div className="text-center">
          <div
            className={`text-lg sm:text-xl font-bold transition-colors ${
              totalTimeLeft <= 60 ? 'text-red-400' : totalTimeLeft <= 120 ? 'text-yellow-400' : 'text-white'
            }`}
          >
            {formatTime(totalTimeLeft)}
          </div>
          <div className="text-xs text-slate-300">remaining</div>
        </div>
      </div>
    </div>
  );
};

export default IndividualQuiz;