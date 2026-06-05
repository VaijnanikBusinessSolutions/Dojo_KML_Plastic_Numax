import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Crown, Star, CheckCircle, FileText, TrendingUp, Brain, ExternalLink, Play } from "lucide-react";

interface TrainingContent {
  id: number;
  description: string;
  training_file?: string;
  url_link?: string;
}

// CORRECTED: Interface updated to include the 'level' field for filtering
interface QuestionPaper {
  id: number;
  name: string;
  level: number;
}

// This interface is the TARGET shape for our data, which the JSX uses.
interface Question {
  id: number;
  question_text: string;
  correct_index: number;
  options: string[];
}

const Level4Component: React.FC = () => {
  const [trainingContents, setTrainingContents] = useState<TrainingContent[]>([]);
  const [questionPapers, setQuestionPapers] = useState<QuestionPaper[]>([]);
  const [selectedPaperId, setSelectedPaperId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {

    fetch("http://127.0.0.1:8000/levelwise-training-contents/")
      .then(res => res.json())
      .then(data => {
        const level4Contents = data
          .filter((item: any) => item.level === 4) // Filter for Level 4
          .map((item: any) => ({
            id: item.id,
            description: item.content_name,
            training_file: item.file,
            url_link: item.url,
          }));
        setTrainingContents(level4Contents);
    });

    // CORRECTED: Use the correct endpoint for question papers
    fetch("http://127.0.0.1:8000/questionpapers/")
      .then(res => res.json())
      .then((data) => {
        // CORRECTED: Map the API response fields to our component's interface
        const formattedPapers = data.map((p: any) => ({
            id: p.question_paper_id,
            name: p.question_paper_name,
            level: p.level,
        }));
        // CORRECTED: Filter by the 'level' field for Level 4
        const level4Papers = formattedPapers.filter((p: QuestionPaper) => p.level === 4);
        setQuestionPapers(level4Papers);
      })
      .catch(() => setQuestionPapers([]));
  }, []);

  useEffect(() => {
    if (!selectedPaperId) {
      setQuestions([]);
      return;
    }
    // CORRECTED: Use the correct endpoint and query parameter for questions
    fetch(`http://127.0.0.1:8000/template-questions/?question_paper=${selectedPaperId}`)
      .then(res => res.json())
      .then((data) => {
        // CORRECTED: Transform the question data to match the component's 'Question' interface
        const formatted = data.map((q: any) => {
            const getCorrectIndex = (answer: string): number => {
                switch (answer.toLowerCase()) {
                    case 'a': return 0;
                    case 'b': return 1;
                    case 'c': return 2;
                    case 'd': return 3;
                    default: return -1;
                }
            };

            return {
                id: q.id,
                question_text: q.question,
                options: [q.option_a, q.option_b, q.option_c, q.option_d],
                correct_index: getCorrectIndex(q.correct_answer),
            };
        });
        setQuestions(formatted);
      })
      .catch(() => setQuestions([]));
  }, [selectedPaperId]);

  const handleMaterialClick = (content: TrainingContent) => {
    let url = content.url_link || content.training_file || "";
    if (url && !url.startsWith("http")) {
      url = `http://127.0.0.1:8000${url}`;
    }
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-indigo-600/10 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full shadow-lg">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Level 4 Evaluation Test
              </h2>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
              Achieve excellence with expert-level mastery assessments and ultimate challenges
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">Expert</span>
              <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm font-medium">Master Level</span>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">Excellence</span>
            </div>
          </div>
        </div>

        {/* Training Material Section */}
        <div className='relative'>
          <div className='absolute inset-0 bg-gradient-to-r from-violet-100/50 to-indigo-100/50 rounded-3xl blur-2xl'></div>
          <div className='relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/30'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='p-2 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-lg shadow-lg'>
                <FileText className='w-6 h-6 text-white' />
              </div>
              <h3 className='text-2xl font-bold text-gray-800'>
                Training Materials
              </h3>
              <div className='flex-1 h-px bg-gradient-to-r from-violet-200 to-transparent'></div>
              <span className='text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full'>
                {trainingContents.length} Resources
              </span>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {trainingContents.map((content, index) => (
                <div
                  key={content.id}
                  className='group relative bg-white/80 backdrop-blur-sm rounded-xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 ease-out shadow-lg hover:shadow-2xl border border-white/50 hover:border-violet-200/50 hover:bg-gradient-to-br hover:from-white hover:to-violet-50/30'
                  onClick={() => handleMaterialClick(content)}
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <div className='absolute inset-0 bg-gradient-to-r from-violet-400/0 to-indigo-400/0 group-hover:from-violet-400/10 group-hover:to-indigo-400/10 rounded-xl transition-all duration-300 blur-xl'></div>
                  <div className='relative z-10'>
                    <div className='flex items-start gap-4'>
                      <div className='flex-shrink-0 p-3 bg-gradient-to-r from-violet-100 to-indigo-100 rounded-lg group-hover:from-violet-200 group-hover:to-indigo-200 transition-all duration-300 shadow-md'>
                        {content.training_file ? (
                          <FileText className='w-6 h-6 text-violet-600' />
                        ) : (
                          <ExternalLink className='w-6 h-6 text-indigo-600' />
                        )}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h4 className='font-semibold text-gray-800 group-hover:text-violet-700 transition-colors duration-300 leading-tight'>
                          {content.description}
                        </h4>
                        <div className='flex items-center gap-2 mt-2'>
                          <span className='text-xs px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 rounded-full font-medium'>
                            {content.training_file
                              ? "File Resource"
                              : "Web Link"}
                          </span>
                          <Play className='w-3 h-3 text-gray-400 group-hover:text-violet-500 transition-colors' />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-200/30 to-indigo-200/30 rounded-2xl blur-xl"></div>
          <div className="relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Level 4 Progress</h3>
                  <p className="text-sm text-gray-600">Expert mastery and excellence</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-violet-600" />
                <span className="text-sm font-medium text-gray-700">
                  {questionPapers.length} Test Suite{questionPapers.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-100/50 to-purple-100/50 rounded-3xl blur-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/30">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg shadow-lg">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Assessment Center</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-violet-200 to-transparent"></div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-violet-50 to-purple-50 px-4 py-2 rounded-full border border-violet-200">
                <Crown className="w-4 h-4 text-violet-600" />
                <span className="text-sm font-medium text-violet-700">
                  {questionPapers.length} Available
                </span>
              </div>
            </div>

            {questionPapers.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative mb-6">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-200 to-indigo-200 rounded-full flex items-center justify-center shadow-lg">
                    <Star className="w-12 h-12 text-purple-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">4</span>
                  </div>
                </div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">No Level 4 Tests Available</h4>
                <p className="text-gray-600 max-w-md mx-auto">
                  Level 4 assessments are currently being prepared. Check back soon for expert-level challenges!
                </p>
                <div className="mt-6 px-6 py-3 bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 rounded-full inline-block font-medium">
                  Coming Soon
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {questionPapers.map((paper, index) => (
                  <div key={paper.id} className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:border-violet-300/50">
                    <button className="w-full text-left p-6 flex justify-between items-center font-semibold text-gray-800 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 transition-all duration-300" onClick={() => setSelectedPaperId(selectedPaperId === paper.id ? null : paper.id)}>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="p-3 bg-gradient-to-r from-violet-100 to-purple-100 rounded-lg group-hover:from-violet-200 group-hover:to-purple-200 transition-all shadow-md">
                            <FileText className="w-6 h-6 text-violet-600" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-white font-bold text-xs">4</span>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800">{paper.name}</h4>
                          <p className="text-sm text-gray-600">Expert Level Assessment</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-700">
                            {selectedPaperId === paper.id ? 'Hide' : 'Show'} Questions
                          </div>
                          <div className="text-xs text-gray-500">
                            {selectedPaperId === paper.id && questions.length > 0 ? `${questions.length} Question${questions.length !== 1 ? 's' : ''}` : 'Click to expand'}
                          </div>
                        </div>
                        <div className="p-2 bg-gradient-to-r from-violet-100 to-purple-100 rounded-full group-hover:from-violet-200 group-hover:to-purple-200 transition-all">
                          {selectedPaperId === paper.id ? <ChevronUp className="w-5 h-5 text-violet-600" /> : <ChevronDown className="w-5 h-5 text-violet-600" />}
                        </div>
                      </div>
                    </button>

                    {selectedPaperId === paper.id && (
                      <div className="border-t border-violet-200/50 bg-gradient-to-br from-violet-50/80 to-purple-50/80 backdrop-blur-sm p-6 space-y-6">
                        {questions.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-violet-200 to-purple-200 rounded-full flex items-center justify-center shadow-lg">
                              <FileText className="w-8 h-8 text-violet-600" />
                            </div>
                            <h5 className="font-semibold text-gray-800 mb-2">Loading or No Questions Found</h5>
                            <p className="text-gray-600">This test paper may be empty or is being prepared.</p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {questions.map((q, qIndex) => (
                              <div key={q.id} className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md border border-white/50 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-start gap-4">
                                  <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                                      {qIndex + 1}
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800 mb-4 text-lg leading-relaxed">
                                      {q.question_text}
                                    </h4>
                                    <div className="grid gap-3">
                                      {q.options.map((opt, optIndex) => (
                                        <div key={optIndex} className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 ${
                                          optIndex === q.correct_index
                                            ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-800 shadow-sm"
                                            : "bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-50/80 hover:border-gray-300"
                                        }`}>
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                                            optIndex === q.correct_index
                                              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                                              : "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700"
                                          }`}>
                                            {String.fromCharCode(65 + optIndex)}
                                          </div>
                                          <span className="flex-1 font-medium">{opt}</span>
                                          {optIndex === q.correct_index && (
                                            <div className="flex items-center gap-2">
                                              <CheckCircle className="w-5 h-5 text-green-500" />
                                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                                Correct
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
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

export default Level4Component;