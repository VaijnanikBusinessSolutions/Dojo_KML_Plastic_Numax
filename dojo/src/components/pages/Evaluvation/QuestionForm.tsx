import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Trash2, BookOpen, Plus, Edit3, Target } from 'lucide-react';

interface Question {
  id: number;
  question_text: string;
  correct_index: number;
  options: string[];
}

interface QuestionPaper {
  id: number;
  name: string;
}

const QuestionForm: React.FC = () => {
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);

  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('Level 1');
  const [filteredPapers, setFilteredPapers] = useState<QuestionPaper[]>([]);
  const [selectedPaperId, setSelectedPaperId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/question-papers/')
      .then(res => res.json())
      .then(data => {
        setPapers(data);
      });
  }, []);

  useEffect(() => {
    const filtered = papers.filter(p => p.name.startsWith(selectedLevel));
    setFilteredPapers(filtered);
    setSelectedPaperId(null);
    setQuestions([]);
  }, [papers, selectedLevel]);

  useEffect(() => {
    if (selectedPaperId) {
      fetch(`http://127.0.0.1:8000/api/questions/?paper_id=${selectedPaperId}`)
        .then(res => res.json())
        .then(setQuestions);
    }
  }, [selectedPaperId]);

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSuccess(null);

    if (
      !selectedPaperId ||
      !questionText.trim() ||
      options.some(opt => !opt.trim()) ||
      correctIndex === null
    ) {
      setSuccess(false);
      setMessage('All fields are required and one correct option must be selected.');
      return;
    }

    const res = await fetch('http://127.0.0.1:8000/api/questions/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question_text: questionText,
        option_a: options[0],
        option_b: options[1],
        option_c: options[2],
        option_d: options[3],
        correct_index: correctIndex,
        question_paper: selectedPaperId,
      }),
    });

    if (res.ok) {
      setSuccess(true);
      setMessage('Question added successfully.');
      setQuestionText('');
      setOptions(['', '', '', '']);
      setCorrectIndex(null);
      const updated = await fetch(`http://127.0.0.1:8000/api/questions/?paper_id=${selectedPaperId}`);
      setQuestions(await updated.json());
    } else {
      const err = await res.json();
      setSuccess(false);
      setMessage('Error: ' + JSON.stringify(err));
    }
  };

  const handleDelete = async (id: number) => {
    const confirm = window.confirm('Are you sure you want to delete this question?');
    if (!confirm) return;

    const res = await fetch(`http://127.0.0.1:8000/api/questions/${id}/`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setQuestions(prev => prev.filter(q => q.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Question Bank Manager
          </h1>
          <p className="text-slate-600 text-lg">Create and manage your question papers with ease</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Add New Question</h2>
              </div>

              {/* Level Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Level 1', 'Level 2', 'Level 3', 'Level 4'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSelectedLevel(level)}
                      className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                        selectedLevel === level
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Paper Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Select Question Paper
                </label>
                <div className="relative">
                  <select
                    className="w-full appearance-none bg-white border-2 border-slate-200 rounded-xl px-4 py-3 pr-10 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-slate-700 font-medium"
                    value={selectedPaperId ?? ''}
                    onChange={(e) => setSelectedPaperId(Number(e.target.value))}
                  >
                    <option value="">Choose a paper...</option>
                    {filteredPapers.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Question Form */}
              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                    <Edit3 className="w-4 h-4" />
                    Question Text
                  </label>
                  <textarea
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none text-slate-700"
                    rows={3}
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Enter your question here..."
                  />
                </div>

                <div className="grid gap-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Target className="w-4 h-4" />
                    Answer Options
                  </label>
                  {options.map((opt, i) => (
                    <div key={i} className="relative">
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border-2 border-slate-200 hover:border-slate-300 transition-all duration-200">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            correctIndex === i 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            {String.fromCharCode(65 + i)}
                          </div>
                        </div>
                        <input
                          type="text"
                          className="flex-1 bg-transparent border-0 focus:outline-none text-slate-700 font-medium placeholder-slate-400"
                          value={opt}
                          onChange={(e) => handleOptionChange(i, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        />
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="correct"
                            checked={correctIndex === i}
                            onChange={() => setCorrectIndex(i)}
                            className="w-4 h-4 text-green-600 focus:ring-green-500 focus:ring-2"
                          />
                          <span className="text-sm font-medium text-slate-600">Correct</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                {message && (
                  <div className={`p-4 rounded-xl flex items-center gap-3 ${
                    success 
                      ? 'bg-green-50 border-2 border-green-200 text-green-800' 
                      : 'bg-red-50 border-2 border-red-200 text-red-800'
                  }`}>
                    {success ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="font-medium">{message}</span>
                  </div>
                )}

                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Save Question
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Questions List */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-xl">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Questions</h3>
              </div>

              {selectedPaperId ? (
                <div className="space-y-4">
                  <div className="text-center py-2">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-sm font-medium text-blue-800">
                        {questions.length} Questions
                      </span>
                    </div>
                  </div>

                  {questions.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500 font-medium">No questions yet</p>
                      <p className="text-sm text-slate-400">Add your first question above</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {questions.map((q, index) => (
                        <div key={q.id} className="group p-4 bg-gradient-to-r from-white to-slate-50 rounded-xl border-2 border-slate-100 hover:border-slate-200 transition-all duration-200">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-700 line-clamp-2 leading-relaxed">
                                {q.question_text}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDelete(q.id)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">Select a paper</p>
                  <p className="text-sm text-slate-400">Choose a question paper to view questions</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionForm;