import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, FileText, ExternalLink, Play, Award, CheckCircle, Book } from "lucide-react";

interface TrainingContent {
  id: string;
  description: string;
  training_file?: string;
  url_link?: string;
  content_type: string;
}

// CORRECTED: Interface updated to include the 'level' field
interface QuestionPaper {
  id: number;
  name: string;
  level: number; 
}

// This interface is the TARGET shape for our data, which is fine.
interface Question {
  id: number;
  question_text: string;
  correct_index: number;
  options: string[];
}

const Level1Component: React.FC = () => {
  const [trainingContents, setTrainingContents] = useState<TrainingContent[]>([]);
  const [questionPapers, setQuestionPapers] = useState<QuestionPaper[]>([]);
  const [selectedPaperId, setSelectedPaperId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    // Fetch training contents (assumed to be correct)
    fetch("http://127.0.0.1:8000/training-contents/")
      .then(res => res.json())
      .then(setTrainingContents);

    // Fetch question papers from the new endpoint
    fetch("http://127.0.0.1:8000/questionpapers/")
      .then(res => res.json())
      .then((data) => {
        // CORRECTED: Map the API response to match our component's interface
        const formattedPapers: QuestionPaper[] = data.map((p: any) => ({
          id: p.question_paper_id,
          name: p.question_paper_name,
          level: p.level, // Also map the level field
        }));
        
        // CORRECTED: Filter papers using the reliable 'level' field instead of the name
        const level1Papers = formattedPapers.filter((p: QuestionPaper) => p.level === 1);
        setQuestionPapers(level1Papers);
      });
  }, []);

  useEffect(() => {
    // Clear old questions if no paper is selected
    if (!selectedPaperId) {
        setQuestions([]);
        return;
    }

    if (selectedPaperId) {
      // CORRECTED: Use the correct endpoint and query parameter for filtering questions
      fetch(`http://127.0.0.1:8000/template-questions/?question_paper=${selectedPaperId}`)
        .then(res => res.json())
        .then((data) => {
          // CORRECTED: Transform the incoming question data to match the 'Question' interface
          const formattedQuestions = data.map((q: any) => {
            // Helper to convert 'a', 'b', 'c', 'd' to an index 0, 1, 2, 3
            const getCorrectIndex = (answer: string): number => {
                switch(answer.toLowerCase()) {
                    case 'a': return 0;
                    case 'b': return 1;
                    case 'c': return 2;
                    case 'd': return 3;
                    default: return -1; // Default case for safety
                }
            };

            return {
              id: q.id,
              question_text: q.question, // map 'question' to 'question_text'
              options: [q.option_a, q.option_b, q.option_c, q.option_d], // create options array
              correct_index: getCorrectIndex(q.correct_answer), // convert correct answer to index
            };
          });
          setQuestions(formattedQuestions);
        });
    }
  }, [selectedPaperId]);

  const handleMaterialClick = (content: TrainingContent) => {
    let url = content.url_link || content.training_file || "";
    if (url && !url.startsWith("http")) {
      url = url.startsWith("/media/") ? `http://127.0.0.1:8000${url}` : `http://127.0.0.1:8000/media/${url}`;
    }
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg">
                <Book className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Level 1 Training
              </h2>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Begin your journey with foundational concepts and essential skills
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Beginner</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Foundation</span>
            </div>
          </div>
        </div>

        {/* Training Material Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/50 to-teal-100/50 rounded-3xl blur-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Training Materials</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-emerald-200 to-transparent"></div>
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {trainingContents.length} Resources
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainingContents.map((content, index) => (
                <div
                  key={content.id}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 ease-out shadow-lg hover:shadow-2xl border border-white/50 hover:border-emerald-200/50 hover:bg-gradient-to-br hover:from-white hover:to-emerald-50/30"
                  onClick={() => handleMaterialClick(content)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 to-teal-400/0 group-hover:from-emerald-400/10 group-hover:to-teal-400/10 rounded-xl transition-all duration-300 blur-xl"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 p-3 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg group-hover:from-emerald-200 group-hover:to-teal-200 transition-all duration-300 shadow-md">
                        {content.training_file ? (
                          <FileText className="w-6 h-6 text-emerald-600" />
                        ) : (
                          <ExternalLink className="w-6 h-6 text-teal-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors duration-300 leading-tight">
                          {content.description}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 rounded-full font-medium">
                            {content.training_file ? 'File Resource' : 'Web Link'}
                          </span>
                          <Play className="w-3 h-3 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Evaluation Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-100/50 to-pink-100/50 rounded-3xl blur-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Evaluation Test - Level 1</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-transparent"></div>
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {questionPapers.length} Test{questionPapers.length !== 1 ? 's' : ''}
              </span>
            </div>

            {questionPapers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-lg">
                  <Award className="w-10 h-10 text-gray-500" />
                </div>
                <p className="text-gray-500 text-lg">No question papers found for Level 1.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questionPapers.map((paper, index) => (
                  <div key={paper.id} 
                       className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                       style={{ animationDelay: `${index * 150}ms` }}>
                    <button
                      className="w-full text-left p-6 flex justify-between items-center font-semibold text-gray-800 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 group"
                      onClick={() => setSelectedPaperId(selectedPaperId === paper.id ? null : paper.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg group-hover:from-purple-200 group-hover:to-pink-200 transition-all">
                          <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="text-lg">{paper.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {selectedPaperId === paper.id ? 'Hide' : 'Show'} Questions
                        </span>
                        <div className="p-1 bg-gray-100 rounded-full group-hover:bg-purple-100 transition-colors">
                          {selectedPaperId === paper.id ? (
                            <ChevronUp className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                      </div>
                    </button>

                    {selectedPaperId === paper.id && (
                      <div className="border-t border-gray-200/50 bg-gradient-to-br from-slate-50/80 to-gray-50/80 backdrop-blur-sm p-6 space-y-6">
                        {questions.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <div className="w-16 h-16 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center">
                              <FileText className="w-8 h-8 text-gray-400" />
                            </div>
                            Loading questions or none found...
                          </div>
                        ) : (
                          questions.map((q, qIndex) => (
                            <div key={q.id} 
                                 className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md border border-white/50 hover:shadow-lg transition-all duration-300"
                                 style={{ animationDelay: `${qIndex * 100}ms` }}>
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                  {qIndex + 1}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 mb-4 text-lg leading-relaxed">
                                    {q.question_text}
                                  </h4>
                                  <div className="grid gap-3">
                                    {q.options.map((opt, optIndex) => (
                                      <div key={optIndex} 
                                           className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                                             optIndex === q.correct_index
                                               ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800"
                                               : "bg-gray-50/80 border-gray-200 text-gray-700 hover:bg-gray-100/80"
                                           }`}>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                                          optIndex === q.correct_index
                                            ? "bg-green-500 text-white"
                                            : "bg-gray-300 text-gray-600"
                                        }`}>
                                          {String.fromCharCode(65 + optIndex)}
                                        </div>
                                        <span className="flex-1">{opt}</span>
                                        {optIndex === q.correct_index && (
                                          <CheckCircle className="w-5 h-5 text-green-500" />
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Level1Component;