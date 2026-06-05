import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, BookOpen, Clock, Users, Edit, FileQuestion, Grid, List, Trash2, Upload, Eye, FileText, Link, Presentation, Video, Image, Home, CheckCircle, XCircle, ChevronDown } from 'lucide-react';

const API_BASE = "http://127.0.0.1:8000";

// --- INTERFACES ---
interface TabData { id: string; title: string; content: string; }
interface TrainingContent { id: number; description: string; training_file?: string | null; url_link?: string | null; subtopiccontent: number; }
interface SubtopicContent { subtopiccontent_id: number; subtopic: number; content: string; }
interface Option { id?: number; option_text: string; is_correct: boolean; }
interface Question { id: number; question_text: string; options: Option[]; }

export default function Level1Detailed() {
  const { id } = useParams();
  const navigate = useNavigate();
  // --- STATE DECLARATIONS ---
  const [activeTab, setActiveTab] = useState<string>("tab1");
  const [trainingContents, setTrainingContents] = useState<TrainingContent[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<"file" | "link">("file");
  const [newMaterial, setNewMaterial] = useState<{ description: string; file: File | null; url: string }>({ description: "", file: null, url: "" });
  const [subtopicContents, setSubtopicContents] = useState<SubtopicContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const subtopicId = id ? parseInt(id, 10) : 1;

  // MCQ STATE
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: number]: { selectedOptionId: number | undefined; isCorrect: boolean } }>({});
  const [showResults, setShowResults] = useState(false);
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null); // State to track expanded question

  // MODAL STATE
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [questionFormData, setQuestionFormData] = useState<{ question_text: string, options: Omit<Option, 'id'>[] }>({
    question_text: "",
    options: [{ option_text: "", is_correct: false }, { option_text: "", is_correct: false }],
  });

  // --- DERIVED STATE & CONSTANTS ---
  const detailTabs: TabData[] = subtopicContents.map((c, i) => ({ id: `tab${i + 1}`, title: c.content, content: c.content }));
  const activeTabData = detailTabs.find((tab) => tab.id === activeTab) || detailTabs[0];
  const isMCQTab = activeTabData?.title?.toUpperCase() === "MCQ";

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchSubtopicContents = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/subtopic-contents/?subtopic=${subtopicId}`);
        if (!res.ok) throw new Error("Network response was not ok");
        const data: SubtopicContent[] = await res.json();
        if (!data.length) { navigate("/lesson-details/1", { replace: true }); return; }
        setSubtopicContents(data);
        setLoading(false);
      } catch (err) { console.error(err); setError("Failed to load lesson contents"); setLoading(false); }
    };
    fetchSubtopicContents();
  }, [subtopicId, navigate]);

  useEffect(() => {
    const fetchTrainingContents = async () => {
      if (subtopicContents.length === 0 || isMCQTab) return;
      const activeTabIndex = parseInt(activeTab.replace("tab", ""), 10) - 1;
      const current = subtopicContents[activeTabIndex];
      if (!current) return;
      try {
        const response = await fetch(`${API_BASE}/training-contents/?subtopiccontent=${current.subtopiccontent_id}`);
        if (!response.ok) throw new Error("Failed to fetch training contents");
        const data: TrainingContent[] = await response.json();
        setTrainingContents(data);
      } catch (error) { console.error("Error fetching training contents:", error); setTrainingContents([]); }
    };
    fetchTrainingContents();
  }, [activeTab, subtopicContents, isMCQTab]);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (isMCQTab) {
        const activeTabIndex = parseInt(activeTab.replace("tab", ""), 10) - 1;
        const current = subtopicContents[activeTabIndex];
        if (!current) return;
        try {
          const res = await fetch(`${API_BASE}/questions/?subtopiccontent=${current.subtopiccontent_id}`);
          if (!res.ok) throw new Error("Failed to fetch questions");
          const data: Question[] = await res.json();
          setQuestions(data);
        } catch (error) { console.error("Error fetching questions:", error); setQuestions([]); }
      }
    };
    if (subtopicContents.length > 0) fetchQuestions();
  }, [isMCQTab, activeTab, subtopicContents]);

  // --- EVENT HANDLERS ---
  const onTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setQuizMode(false);
    setShowResults(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setExpandedQuestionId(null); // Reset expanded question on tab change
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeTabIndex = parseInt(activeTab.replace("tab", ""), 10) - 1;
    const current = subtopicContents[activeTabIndex];
    if (!current) { alert("No subtopic content selected"); return; }
    if (!newMaterial.description) { alert("Please add a description"); return; }
    const formData = new FormData();
    formData.append("description", newMaterial.description);
    formData.append("subtopiccontent", String(current.subtopiccontent_id));
    if (uploadType === "file") {
      if (!newMaterial.file) { alert("Please select a file"); return; }
      formData.append("training_file", newMaterial.file);
    } else {
      if (!newMaterial.url) { alert("Please provide a URL"); return; }
      formData.append("url_link", newMaterial.url);
    }
    try {
      setUploadLoading(true);
      const res = await fetch(`${API_BASE}/training-contents/`, { method: "POST", body: formData });
      if (!res.ok) { const err = await res.text(); console.error(err); alert("Failed to upload material"); return; }
      const created: TrainingContent = await res.json();
      setTrainingContents((prev) => [...prev, created]);
      setNewMaterial({ description: "", file: null, url: "" });
      setShowUploadModal(false);
      alert("Material uploaded successfully!");
    } catch (err) { console.error(err); alert("An error occurred while uploading."); } finally { setUploadLoading(false); }
  };
  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    // Reset the form state to its initial values
    setNewMaterial({ description: "", file: null, url: "" });
    setUploadType("file"); // Reset upload type to default
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.length) setNewMaterial({ ...newMaterial, file: e.target.files[0] }); };
  const triggerFileInput = () => fileInputRef.current?.click();
  const handleMaterialClick = (content: TrainingContent) => { if (content.url_link) window.open(content.url_link, "_blank", "noopener,noreferrer"); else if (content.training_file) window.open(content.training_file, "_blank", "noopener,noreferrer"); };
  const handleDeleteContent = async (contentId: number) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`${API_BASE}/training-contents/${contentId}/`);
      setTrainingContents(prev => prev.filter(c => c.id !== contentId));
      alert("Material deleted successfully");
    } catch (error) { alert("Failed to delete content"); }
  };

  // --- MCQ HANDLERS ---
  const handleStartAssessment = () => { setShowResults(false); setCurrentQuestionIndex(0); setSelectedAnswers({}); setQuizMode(true); };
  const handleAnswerSelect = (questionId: number, selectedOption: Option) => setSelectedAnswers(prev => ({ ...prev, [questionId]: { selectedOptionId: selectedOption.id, isCorrect: selectedOption.is_correct } }));
  const handleNextQuestion = () => { if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(prev => prev + 1); };
  const handleFinishAssessment = () => setShowResults(true);
  const handleReturnToManager = () => { setShowResults(false); setQuizMode(false); setCurrentQuestionIndex(0); setSelectedAnswers({}); };
  const handleQuestionClick = (questionId: number) => { setExpandedQuestionId(prevId => prevId === questionId ? null : questionId); }; // Handler to toggle accordion

  // --- QUESTION CRUD HANDLERS ---
  const handleOpenAddModal = () => { setEditingQuestion(null); setQuestionFormData({ question_text: "", options: [{ option_text: "", is_correct: false }, { option_text: "", is_correct: false }] }); setShowQuestionModal(true); };
  const handleOpenEditModal = (question: Question) => { setEditingQuestion(question); setQuestionFormData({ question_text: question.question_text, options: question.options.map(({ id, ...rest }) => rest) }); setShowQuestionModal(true); };
  const handleDeleteQuestion = async (questionId: number) => { if (!window.confirm("Are you sure?")) return; try { await axios.delete(`${API_BASE}/questions/${questionId}/`); setQuestions(prev => prev.filter(q => q.id !== questionId)); } catch (error) { alert("Failed to delete question."); } };
  const handleQuestionFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionFormData.question_text.trim() || questionFormData.options.some(opt => !opt.option_text.trim()) || !questionFormData.options.some(opt => opt.is_correct)) { alert("Please fill all fields and select a correct answer."); return; }
    const activeTabIndex = parseInt(activeTab.replace("tab", ""), 10) - 1;
    const currentSubtopicContent = subtopicContents[activeTabIndex];
    const payload = { ...questionFormData, subtopiccontent: currentSubtopicContent.subtopiccontent_id };
    if (editingQuestion) {
      try { const response = await axios.put(`${API_BASE}/questions/${editingQuestion.id}/`, payload); setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? response.data : q)); setShowQuestionModal(false); } catch (error) { alert("Failed to update question."); }
    } else {
      try { const response = await axios.post(`${API_BASE}/questions/`, payload); setQuestions(prev => [...prev, response.data]); setShowQuestionModal(false); } catch (error) { alert("Failed to add question."); }
    }
  };
  const handleQuestionTextChange = (e: React.ChangeEvent<HTMLInputElement>) => setQuestionFormData({ ...questionFormData, question_text: e.target.value });
  const handleOptionTextChange = (index: number, value: string) => { const opts = [...questionFormData.options]; opts[index].option_text = value; setQuestionFormData({ ...questionFormData, options: opts }); };
  const handleCorrectOptionChange = (index: number) => { const opts = questionFormData.options.map((opt, i) => ({ ...opt, is_correct: i === index })); setQuestionFormData({ ...questionFormData, options: opts }); };
  const handleAddOption = () => setQuestionFormData({ ...questionFormData, options: [...questionFormData.options, { option_text: "", is_correct: false }] });
  const handleRemoveOption = (index: number) => { if (questionFormData.options.length <= 2) return; const opts = questionFormData.options.filter((_, i) => i !== index); setQuestionFormData({ ...questionFormData, options: opts }); };

  // --- HELPER & RENDER FUNCTIONS ---
  const getFileTypeFromUrl = (url: string): string => { const ext = url.split(".").pop()?.toLowerCase() || ""; if (ext === "pdf") return "PDF"; if (["mp4", "mov", "avi"].includes(ext)) return "Video"; if (["ppt", "pptx"].includes(ext)) return "Presentation"; if (["doc", "docx"].includes(ext)) return "Document"; if (["jpg", "jpeg", "png", "gif"].includes(ext)) return "Image"; return "File"; };
  const getFileIcon = (content: TrainingContent) => { if (content.url_link) return <Link className="w-6 h-6 text-blue-500" />; if (content.training_file) { const type = getFileTypeFromUrl(content.training_file); if (type === "PDF") return <FileText className="w-6 h-6 text-red-500" />; if (type === "Video") return <Video className="w-6 h-6 text-purple-500" />; if (type === "Presentation") return <Presentation className="w-6 h-6 text-orange-500" />; if (type === "Image") return <Image className="w-6 h-6 text-green-500" />; } return <FileText className="w-6 h-6 text-gray-500" />; };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {trainingContents.map(content => (
        <div key={content.id} className="group bg-white rounded-xl border p-6 hover:shadow-lg transition-all cursor-pointer" onClick={() => handleMaterialClick(content)}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center flex-1">
              <div className="p-3 bg-gray-50 rounded-lg mr-4 group-hover:bg-blue-50">{getFileIcon(content)}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-700">{content.description}</h3>
                <p className="text-sm text-gray-500 mt-1">{content.training_file ? `File: ${getFileTypeFromUrl(content.training_file)}` : "Web Link"}</p>
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); handleDeleteContent(content.id); }} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">{content.training_file ? getFileTypeFromUrl(content.training_file) : "Link"}</span>
            <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-3">
      {trainingContents.map(content => (
        <div key={content.id} className="group bg-white rounded-lg border p-4 hover:shadow-md transition-all cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1 min-w-0" onClick={() => handleMaterialClick(content)}>
              <div className="p-2 bg-gray-50 rounded-lg mr-4 group-hover:bg-blue-50">{getFileIcon(content)}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-700">{content.description}</h3>
                <span className="text-sm text-gray-400 truncate">{content.training_file || content.url_link}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => handleMaterialClick(content)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-500"><Eye className="w-4 h-4" /></button>
              <button onClick={(e) => { e.stopPropagation(); handleDeleteContent(content.id); }} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) { return (<div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div></div>); }
  if (error) { return (<div className="flex h-screen items-center justify-center text-red-600 font-semibold">Error: {error}</div>); }

  // --- MAIN RENDER ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="flex h-screen w-full">
        <div className="w-80 bg-white shadow-lg border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200"><div className="flex items-center space-x-3 mb-2"><BookOpen className="w-6 h-6 text-blue-600" /><h2 className="text-xl font-bold text-gray-900">Lesson Contents</h2></div></div>
          <nav className="p-6 flex-1 overflow-y-auto">
            <div className="space-y-3">
              {detailTabs.map((tab, index) => (<button key={tab.id} onClick={() => onTabClick(tab.id)} className={`w-full p-4 text-left rounded-xl transition-all duration-200 flex items-center group ${activeTab === tab.id ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"}`}> <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 text-sm font-bold ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-blue-100 text-blue-600 group-hover:bg-blue-200"}`}>{index + 1}</div> <div className="flex-1"><span className="font-semibold text-sm block">{tab.title.length > 20 ? tab.title.slice(0, 20) + '...' : tab.title}</span><span className={`text-xs ${activeTab === tab.id ? "text-blue-100" : "text-gray-500"}`}>Module {index + 1}</span></div> </button>))}
            </div>
          </nav>
        </div>

        <div className="flex-1 overflow-auto bg-gray-50 w-full">
          <div className="p-8">
            <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900 mb-2">{activeTabData?.title || "Loading..."}</h1></div>

            {isMCQTab ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <div className="flex justify-between items-center mb-8 border-b pb-4"><div><h2 className="text-2xl font-bold text-gray-900">Question Manager</h2><p className="text-sm text-gray-500">View, add, edit, or delete questions.</p></div><button onClick={handleOpenAddModal} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"><FileQuestion className="w-4 h-4" /><span>Add Question</span></button></div>
                {showResults ? (
                  <div className="text-center"><h3 className="text-3xl font-bold text-gray-800">Assessment Complete!</h3><p className="text-6xl font-bold my-6 text-blue-600">{Object.values(selectedAnswers).filter(a => a.isCorrect).length} / {questions.length}</p><button onClick={handleReturnToManager} className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">Return to Manager</button></div>
                ) : quizMode ? (
                  <div>
                    {questions.length > 0 && (() => { const question = questions[currentQuestionIndex]; const answerState = selectedAnswers[question.id]; return (<div><p className="text-lg font-semibold text-gray-800 mb-4">{currentQuestionIndex + 1}. {question.question_text}</p><div className="space-y-3">{question.options.map(option => (<button key={option.id} onClick={() => handleAnswerSelect(question.id, option)} disabled={!!answerState} className={`block w-full text-left p-4 rounded-lg border-2 transition-all ${!!answerState ? 'cursor-not-allowed' : 'cursor-pointer'} ${answerState?.selectedOptionId === option.id ? (answerState.isCorrect ? 'bg-green-100 border-green-500 text-green-800' : 'bg-red-100 border-red-500 text-red-800') : 'bg-white hover:bg-gray-100 border-gray-200'}`}><span className="font-medium">{option.option_text}</span></button>))}</div><div className="mt-8 flex justify-between items-center"><span className="text-sm font-semibold text-gray-600">Question {currentQuestionIndex + 1} of {questions.length}</span>{currentQuestionIndex < questions.length - 1 ? (<button onClick={handleNextQuestion} disabled={!answerState} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400">Next</button>) : (<button onClick={handleFinishAssessment} disabled={!answerState} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400">Finish</button>)}</div></div>); })()}
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-semibold text-gray-800">Existing Questions ({questions.length})</h3><button onClick={handleStartAssessment} disabled={questions.length === 0} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed">Start Assessment</button></div>
                    {questions.length > 0 ? (
                      <div className="space-y-3">{questions.map((question, index) => {
                        const isExpanded = expandedQuestionId === question.id;
                        return (
                          <div key={question.id} className="border rounded-lg bg-gray-50/50 overflow-hidden transition-all">
                            <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-100/70" onClick={() => handleQuestionClick(question.id)}>
                              <p className="font-semibold text-gray-800 flex-1 pr-4">{index + 1}. {question.question_text}</p>
                              <div className="flex items-center space-x-2 flex-shrink-0">
                                <button onClick={(e) => { e.stopPropagation(); handleOpenEditModal(question); }} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-full" title="Edit"><Edit className="w-4 h-4" /></button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(question.id); }} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                              </div>
                            </div>
                            {isExpanded && (
                              <div className="bg-white px-4 pb-4 pt-2">
                                <div className="pl-6 border-l-2 border-blue-200 space-y-2">
                                  <h4 className="text-sm font-bold text-gray-500 mb-2">Options:</h4>
                                  {question.options.map(option => (
                                    <div key={option.id} className={`flex items-center text-sm ${option.is_correct ? 'text-green-700 font-semibold' : 'text-gray-600'}`}>
                                      {option.is_correct ? <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" /> : <XCircle className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />}
                                      <span>{option.option_text}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                      </div>
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed rounded-lg"><p className="text-gray-500">No questions have been added yet.</p><p className="text-sm text-gray-400 mt-2">Click "Add Question" to get started.</p></div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6"><div><h2 className="text-2xl font-bold text-gray-900">Training Materials</h2><p className="text-gray-600 mt-1">Resources for this module</p></div><div className="flex items-center space-x-4"><button onClick={() => setShowUploadModal(true)} className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm"><Upload className="w-4 h-4" /><span>Upload Material</span></button><div className="flex bg-white rounded-lg border border-gray-200 p-1"><button onClick={() => setViewType("grid")} className={`p-2 rounded-md ${viewType === "grid" ? "bg-blue-600 text-white" : "text-gray-600"}`}><Grid className="w-4 h-4" /></button><button onClick={() => setViewType("list")} className={`p-2 rounded-md ${viewType === "list" ? "bg-blue-600 text-white" : "text-gray-600"}`}><List className="w-4 h-4" /></button></div></div></div>
                {trainingContents.length > 0 ? (<>{viewType === "grid" ? renderGridView() : renderListView()}</>) : (<div className="bg-white rounded-xl border-2 border-dashed p-16 text-center"><h3 className="text-xl font-bold text-gray-900">No Materials Yet</h3><p className="text-gray-600 mt-2">Upload the first training material for this module.</p></div>)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b"><h2 className="text-2xl font-bold text-gray-900">Upload New Material</h2><p className="text-gray-600 mt-1">Add a new resource to this lesson</p></div>
            <form onSubmit={handleUploadSubmit} className="p-6">
              <div className="space-y-6">
                <div><label className="block text-sm font-semibold text-gray-900 mb-2">Description *</label><input type="text" value={newMaterial.description} onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg" required /></div>
                <div><label className="block text-sm font-semibold text-gray-900 mb-3">Upload Type *</label><div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => setUploadType("file")} className={`p-4 rounded-xl border-2 ${uploadType === "file" ? "border-blue-600 bg-blue-50" : "border-gray-200"}`}><FileText className="w-6 h-6 mx-auto mb-2" /><div className="font-semibold">File Upload</div></button><button type="button" onClick={() => setUploadType("link")} className={`p-4 rounded-xl border-2 ${uploadType === "link" ? "border-blue-600 bg-blue-50" : "border-gray-200"}`}><Link className="w-6 h-6 mx-auto mb-2" /><div className="font-semibold">Web Link</div></button></div></div>
                {uploadType === "file" ? (<div><label className="block text-sm font-semibold text-gray-900 mb-2">Select File *</label><input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" /><div onClick={triggerFileInput} className="w-full p-6 border-2 border-dashed rounded-lg cursor-pointer"><div className="text-center"><Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" /><div className="font-medium">{newMaterial.file ? newMaterial.file.name : "Click to choose file"}</div></div></div></div>) : (<div><label className="block text-sm font-semibold text-gray-900 mb-2">URL *</label><input type="url" value={newMaterial.url} onChange={(e) => setNewMaterial({ ...newMaterial, url: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg" required /></div>)}
              </div>
              <div className="mt-8 flex justify-end space-x-3"><button type="button" onClick={() => setShowUploadModal(false)} className="px-6 py-3 bg-gray-100 rounded-lg" disabled={uploadLoading}>Cancel</button><button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg" disabled={uploadLoading}>{uploadLoading ? "Uploading..." : "Upload"}</button></div>
            </form>
          </div>
        </div>
      )} */}


      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b"><h2 className="text-2xl font-bold text-gray-900">Upload New Material</h2><p className="text-gray-600 mt-1">Add a new resource to this lesson</p></div>
            <form onSubmit={handleUploadSubmit} className="p-6">
              <div className="space-y-6">
                
                {/* --- CHANGE HERE --- */}
                <div><label className="block text-sm font-semibold text-gray-900 mb-2">Description <span className="text-red-500">*</span></label><input type="text" value={newMaterial.description} onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg" required /></div>
                
                {/* --- AND HERE --- */}
                <div><label className="block text-sm font-semibold text-gray-900 mb-3">Upload Type <span className="text-red-500">*</span></label><div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => setUploadType("file")} className={`p-4 rounded-xl border-2 ${uploadType === "file" ? "border-blue-600 bg-blue-50" : "border-gray-200"}`}><FileText className="w-6 h-6 mx-auto mb-2" /><div className="font-semibold">File Upload</div></button><button type="button" onClick={() => setUploadType("link")} className={`p-4 rounded-xl border-2 ${uploadType === "link" ? "border-blue-600 bg-blue-50" : "border-gray-200"}`}><Link className="w-6 h-6 mx-auto mb-2" /><div className="font-semibold">Web Link</div></button></div></div>
                
                {uploadType === "file" ? (
                  // --- AND HERE ---
                  <div><label className="block text-sm font-semibold text-gray-900 mb-2">Select File <span className="text-red-500">*</span></label><input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" /><div onClick={triggerFileInput} className="w-full p-6 border-2 border-dashed rounded-lg cursor-pointer"><div className="text-center"><Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" /><div className="font-medium">{newMaterial.file ? newMaterial.file.name : "Click to choose file"}</div></div></div></div>
                ) : (
                  // --- AND HERE ---
                  <div><label className="block text-sm font-semibold text-gray-900 mb-2">URL <span className="text-red-500">*</span></label><input type="url" value={newMaterial.url} onChange={(e) => setNewMaterial({ ...newMaterial, url: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg" required /></div>
                )}

              </div>
              <div className="mt-8 flex justify-end space-x-3"><button type="button" onClick={handleCloseUploadModal} className="px-6 py-3 bg-gray-100 rounded-lg" disabled={uploadLoading}>Cancel</button><button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg" disabled={uploadLoading}>{uploadLoading ? "Uploading..." : "Upload"}</button></div>
            </form>
          </div>
        </div>
      )}

      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b"><h2 className="text-2xl font-bold">{editingQuestion ? "Edit Question" : "Add New Question"}</h2></div>
            <form onSubmit={handleQuestionFormSubmit} className="p-6">
              <div className="space-y-6"><div><label className="block text-sm font-semibold text-gray-900 mb-2">Question *</label><input type="text" value={questionFormData.question_text} onChange={handleQuestionTextChange} className="w-full p-3 border border-gray-300 rounded-lg" required /></div><div><label className="block text-sm font-semibold text-gray-900 mb-2">Options *</label><div className="space-y-3">{questionFormData.options.map((option, index) => (<div key={index} className="flex items-center space-x-3"><input type="radio" name="correct_option" checked={option.is_correct} onChange={() => handleCorrectOptionChange(index)} className="h-5 w-5 text-blue-600" /><input type="text" value={option.option_text} onChange={(e) => handleOptionTextChange(index, e.target.value)} className="flex-grow p-3 border border-gray-300 rounded-lg" required /><button type="button" onClick={() => handleRemoveOption(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-full disabled:opacity-50" disabled={questionFormData.options.length <= 2}><Trash2 className="w-5 h-5" /></button></div>))}</div><button type="button" onClick={handleAddOption} className="mt-4 text-sm font-semibold text-blue-600 hover:underline">+ Add another option</button></div></div>
              <div className="mt-8 flex justify-end space-x-3"><button type="button" onClick={() => setShowQuestionModal(false)} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">Cancel</button><button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">{editingQuestion ? "Save Changes" : "Save Question"}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



