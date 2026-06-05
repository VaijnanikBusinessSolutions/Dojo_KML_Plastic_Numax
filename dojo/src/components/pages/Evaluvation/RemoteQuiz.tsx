



import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Constants
const INFO_TO_INDEX: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
const NAV_LEFT = "R52:6";
const NAV_RIGHT = "R52:3";
const OK = "R52:7";
const PAUSE = "RS5:9";
const RESUME = "RS5:12";
const API_BASE_URL = "http://127.0.0.1:8000";

// ---------- INTERFACES ----------
interface Option {
  text: string;
  imageUrl?: string | null;
}

interface Question {
  id: number;
  question_text: string;
  questionImageUrl?: string | null;
  options: Option[];
  correct_index: number;
  duration?: number;
}

interface LocationState {
  paperId: number;
  skillId?: number;
  levelId: number;
  stationId?: number;
  employee?: { id: string; name: string; pay_code: string; section: string; };
  employeeId?: string;
  test_name?: string;
  examMode?: string;
  allowedRemotes?: string[];
  departmentName?: string;
}

type AnswersMap = Record<string, (number | null)[]>;

const RemoteQuiz: React.FC = () => {
  /* ---------- STATE ---------- */
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswersMap>({});
  const [answeredRemotes, setAnsweredRemotes] = useState<Set<string>>(new Set());
  const [registeredRemotes, setRegisteredRemotes] = useState<Set<string>>(new Set());
  const [lastEventId, setLastEventId] = useState<number | null>(null);
  const [initialEventId, setInitialEventId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const isPausedRef = useRef(isPaused);
  const currentIndexRef = useRef(currentIndex);
  const questionsRef = useRef(questions);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const nextCalledRef = useRef(false);
  const submitCalledRef = useRef(false);

  /* ---------- DERIVED VALUES ---------- */
  const state = location.state as LocationState;
  const paperId = state?.paperId;
  const skillId = state?.skillId || state?.stationId;
  const levelId = state?.levelId;
  const testName = state?.test_name || `Remote_Group_Test_${new Date().toISOString().slice(0, 10)}`;
  const departmentName = state?.departmentName || "N/A";

  /* ---------- SYNC REFS ---------- */
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { questionsRef.current = questions; }, [questions]);

  /* ---------- FETCH QUESTIONS (CORRECTED) ---------- */
  useEffect(() => {
    if (!paperId || !skillId || !levelId) {
      setLoading(false);
      setErrorMessage("Invalid navigation state. Please start the quiz from the assignment page.");
      setTimeout(() => navigate("/assign-employees"), 3000);
      return;
    }

    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/questionpapers/${paperId}/questions/`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const quizDuration = data.duration && data.duration > 0 ? data.duration : 60;
        const questionsData = data.questions || [];

        if (!Array.isArray(questionsData) || questionsData.length === 0) {
          setErrorMessage("No questions are available for this quiz.");
          setQuestions([]);
          return;
        }

        const mapped: Question[] = questionsData
          .map((q: any, idx: number) => {
            const options: Option[] = [
              { text: q.option_a, imageUrl: q.option_a_image },
              { text: q.option_b, imageUrl: q.option_b_image },
              { text: q.option_c, imageUrl: q.option_c_image },
              { text: q.option_d, imageUrl: q.option_d_image },
            ]
            .filter((opt) => opt.text && opt.text.trim() !== "")
            .map(opt => ({
                text: opt.text,
                imageUrl: opt.imageUrl || null
            }));

            return {
              id: q.question_id || q.id || idx,
              question_text: q.question_text || q.text || q.question || "",
              questionImageUrl: q.question_image || null,
              options,
              correct_index: Number.isInteger(q.correct_answer_index ?? q.correct_index)
                ? (q.correct_answer_index ?? q.correct_index)
                : 0,
              duration: q.duration && q.duration > 0 ? q.duration : quizDuration,
            };
          })
          .filter(
            (q) => q.question_text && q.options.length >= 2 && q.correct_index < q.options.length
          );

        if (mapped.length === 0) {
          setErrorMessage("No valid questions found.");
        } else {
          setQuestions(mapped);
          setTimeLeft(mapped[0].duration ?? quizDuration);
        }
      } catch (e) {
        console.error("[ERROR] Failed to load questions:", e);
        setErrorMessage("Failed to load questions.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [paperId, skillId, levelId, navigate]);

  /* ---------- TIMER ---------- */
  useEffect(() => {
    if (loading || !questions.length || timeLeft === null || quizEnded) return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      if (isPausedRef.current) return;

      setTimeLeft((prev) => {
        if (prev === null || prev <= 0) return 0;

        const newVal = prev - 1;
        if (newVal <= 0) {
          if (currentIndexRef.current === questionsRef.current.length - 1) {
            setQuizEnded(true);
            submitQuiz();
            return 0;
          } else {
            goToNextQuestion();
            return questionsRef.current[currentIndexRef.current + 1]?.duration ?? 60;
          }
        }
        return newVal;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, questions.length, timeLeft, quizEnded]);

  /* ---------- NAVIGATION: GO TO NEXT QUESTION ---------- */
  const goToNextQuestion = () => {
    if (nextCalledRef.current) return;
    nextCalledRef.current = true;

    const nextIdx = currentIndexRef.current + 1;

    if (nextIdx >= questionsRef.current.length) {
      setQuizEnded(true);
      submitQuiz();
    } else {
      setCurrentIndex(nextIdx);
      setTimeLeft(questionsRef.current[nextIdx].duration ?? 60);
      setAnsweredRemotes(new Set());
    }

    setTimeout(() => {
      nextCalledRef.current = false;
    }, 300);
  };

  /* ---------- SUBMIT QUIZ ---------- */
  const submitQuiz = async () => {
    if (submitCalledRef.current || quizEnded) return;
    submitCalledRef.current = true;

    try {
      const answersData: Record<string, number[]> = {};
      Object.entries(answers).forEach(([remote, arr]) => {
        const clean = arr.map((a) => a ?? -1);
        if (!clean.every((v) => v === -1)) answersData[remote] = clean;
      });

      if (Object.keys(answersData).length === 0) {
        setErrorMessage("Answer at least one question before submitting.");
        setQuizEnded(false);
        submitCalledRef.current = false;
        return;
      }

      const payload = {
        department_name: departmentName,
        paper_id: paperId,
        skill_id: skillId,
        level_id: levelId,
        test_name: testName,
        answers: answersData,
      };

      const resp = await fetch(`${API_BASE_URL}/api/end-test/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt);
      }

      const results = await resp.json();
      navigate("/test-ended", {
        state: {
          paperId,
          answers,
          skillId,
          levelId,
          testName,
          examMode: "remote",
          results: results.grouped_results || results.results,
          departmentName,
        },
        replace:true,
      });
    } catch (e) {
      console.error("[ERROR] Submit failed:", e);
      setErrorMessage("Failed to submit. Check console.");
      setQuizEnded(false);
      submitCalledRef.current = false;
    }
  };

  /* ---------- POLL KEY EVENTS ---------- */
  useEffect(() => {
    if (loading || !questions.length || quizEnded) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/key-events/latest/`);
        if (!res.ok) return;
        const evt = await res.json();
        if (!evt?.id) return;

        if (initialEventId === null) {
          setInitialEventId(evt.id);
          setLastEventId(evt.id);
          return;
        }

        if (evt.id <= lastEventId!) return;
        setLastEventId(evt.id);

        const { key_id: rawId, info } = evt;
        if (!rawId || !info) return;
        const remoteId = String(rawId);

        if (info === PAUSE) {
          setIsPaused(true);
          return;
        }
        if (info === RESUME) {
          setIsPaused(false);
          return;
        }

        if (!registeredRemotes.has(remoteId)) {
          setRegisteredRemotes((s) => new Set(s).add(remoteId));
          if (info in INFO_TO_INDEX && !isPausedRef.current) {
            setAnswers((prev) => {
              const copy = { ...prev };
              if (!copy[remoteId]) copy[remoteId] = Array(questionsRef.current.length).fill(null);
              copy[remoteId][currentIndexRef.current] = INFO_TO_INDEX[info];
              return copy;
            });
            setAnsweredRemotes((s) => new Set(s).add(remoteId));
          }
        }

        if (!isPausedRef.current) {
          if (info === NAV_LEFT) {
            const newIdx = Math.max(0, currentIndexRef.current - 1);
            setCurrentIndex(newIdx);
            setTimeLeft(questionsRef.current[newIdx].duration ?? 60);
            setAnsweredRemotes(new Set());
            return;
          }

          if (info === NAV_RIGHT) {
            if (currentIndexRef.current < questionsRef.current.length - 1) {
              goToNextQuestion();
            }
            return;
          }
        }

        if (info in INFO_TO_INDEX && !isPausedRef.current) {
          setAnswers((prev) => {
            const copy = { ...prev };
            if (!copy[remoteId]) copy[remoteId] = Array(questionsRef.current.length).fill(null);
            if (copy[remoteId][currentIndexRef.current] === null) {
              copy[remoteId][currentIndexRef.current] = INFO_TO_INDEX[info];
              setAnsweredRemotes((s) => new Set(s).add(remoteId));
            }
            return copy;
          });
          return;
        }

        if (info === OK && !isPausedRef.current && !quizEnded) {
          const hasAnswers = Object.values(answers).some((arr) => arr.some((a) => a !== null));
          if (hasAnswers) {
            setQuizEnded(true);
            submitQuiz();
          } else {
            setErrorMessage("Answer at least one question.");
          }
        }
      } catch (e) {
        console.error("[POLL ERROR]", e);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [loading, questions, quizEnded, lastEventId, initialEventId, registeredRemotes]);

  /* ---------- RENDER ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-white text-xl font-semibold">Loading Quiz…</div>
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
          <div className="text-white text-xl font-semibold">No Questions</div>
          <div className="text-slate-300 mt-2 mb-4 max-w-md mx-auto">{errorMessage || "Unable to load questions."}</div>
          <button onClick={() => navigate("/assign-employees")} className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white">Back to Assignment</button>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const timeProgress = timeLeft !== null ? (timeLeft / (q.duration ?? 60)) * 100 : 0;
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, url: string | null | undefined) => {
    console.error(`[IMAGE ERROR] Failed to load image from URL: ${url}`);
    e.currentTarget.style.display = 'none'; // Hide the broken image element
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">Q</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Remote Group Quiz</h1>
                <div className="text-sm text-slate-300 truncate">Group Assessment • {departmentName}</div>
                <div className="text-xs text-green-400 mt-1">{registeredRemotes.size} Participant{registeredRemotes.size !== 1 ? "s" : ""}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-300 mb-1">Question</div>
              <div className="text-xl font-bold text-white">{currentIndex + 1} / {questions.length}</div>
            </div>
          </div>

          <div className="w-full bg-white/20 rounded-full h-2 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isPaused ? "bg-yellow-400" : "bg-red-400"} animate-pulse`} />
              <span className="text-white font-semibold">{isPaused ? "Paused" : `${timeLeft}s`}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-slate-300 text-sm">{answeredRemotes.size} answered</span>
            </div>
          </div>

          {!isPaused && timeLeft !== null && (
            <div className="w-full bg-white/20 rounded-full h-1 mt-2">
              <div className={`h-1 rounded-full transition-all duration-1000 ${timeLeft <= 10 ? "bg-red-500" : timeLeft <= 20 ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${timeProgress}%` }} />
            </div>
          )}
        </div>
      </header>

      {/* Question */}
      <main className="max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="mb-8">
            <div className="text-sm text-slate-300 mb-2">Question {currentIndex + 1}</div>
            <h2 className="text-2xl font-semibold text-white leading-relaxed">{q.question_text}</h2>
            
            {q.questionImageUrl && (
              <div className="mt-6 flex justify-center bg-black/20 rounded-xl p-2 border border-white/10">
                <img 
                  src={q.questionImageUrl} 
                  alt="Question visual aid" 
                  className="max-h-80 w-auto rounded-lg object-contain"
                  onError={(e) => handleImageError(e, q.questionImageUrl)}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {q.options.map((opt, i) => (
                <div key={i} className="group relative bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 rounded-xl p-5 transition-all duration-300 flex flex-col">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 group-hover:from-blue-500/30 group-hover:to-purple-600/30 rounded-lg flex items-center justify-center border border-white/20 group-hover:border-white/40 transition-all duration-300">
                      <span className="text-white font-bold text-lg">{String.fromCharCode(65 + i)}</span>
                    </div>
                    <div className="flex-1">
                      {opt.imageUrl ? (
                        <div className="mb-3 bg-black/20 rounded-lg overflow-hidden border border-white/10">
                           <img 
                             src={opt.imageUrl} 
                             alt={`Option ${String.fromCharCode(65 + i)}`}
                             className="w-full h-32 object-contain"
                             onError={(e) => handleImageError(e, opt.imageUrl)}
                           />
                        </div>
                      ) : null}
                      <div className={`text-white text-lg font-medium group-hover:text-blue-200 transition-colors duration-300 ${opt.imageUrl ? 'mt-2' : ''}`}>
                        {opt.text}
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <button onClick={submitQuiz} disabled={quizEnded} className={`px-6 py-3 rounded-lg text-white font-semibold ${quizEnded ? "bg-gray-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}>
              {quizEnded ? "Submitted" : "End & Submit All Answers"}
            </button>
          </div>

          {errorMessage && (
            <div className="mt-6 p-4 bg-red-900/50 border border-red-400/30 rounded-xl flex items-start space-x-3">
              <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div>
                <h3 className="text-sm font-medium text-red-300 mb-1">Notice</h3>
                <p className="text-sm text-red-400">{errorMessage}</p>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-400 rounded-full" /><span className="text-slate-300">Remote controlled</span></div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-400 rounded-full" /><span className="text-slate-300">Group quiz mode</span></div>
              </div>
              <div className="text-slate-400">Paper ID: {paperId} | Test: {testName}</div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed top-4 right-4 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
        <div className="text-center">
          <div className="text-lg font-bold text-white">{timeLeft ?? 0}</div>
          <div className="text-xs text-slate-300">seconds</div>
        </div>
      </div>
    </div>
  );
};

export default RemoteQuiz;


