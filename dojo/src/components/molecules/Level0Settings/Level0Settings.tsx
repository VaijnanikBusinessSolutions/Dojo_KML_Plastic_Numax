import React, { useState, useEffect } from 'react';
import { FileText, Plus, RefreshCw, AlertCircle, CheckCircle, X } from 'lucide-react';
import { humanBodyCheckService } from '../../hooks/ServiceApis';

// Remove mock service - use the actual service from props
interface Question {
  id: number;
  question_text: string;
}

// Assume the service is passed or imported


const Level0Settings: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setIsLoading(true);
    setError('');
    try {
      const questionsData = await humanBodyCheckService.fetchQuestions();
      setQuestions(questionsData);
    } catch (err) {
      setError('Error loading questions. Please check if the server is running.');
      console.error('Error fetching questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newQuestion.trim()) {
      setError('Question text is required');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      await humanBodyCheckService.submitQuestion(newQuestion);
      setNewQuestion('');
      setSuccess('Question submitted successfully!');
      loadQuestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while submitting the question');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Level 0 Settings</h1>
          <p className="text-gray-600">Manage human body check questions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Question Section */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Add New Question
            </h3>

            {/* Notification messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-sm">{error}</span>
                  <button 
                    className="ml-2 text-red-600 hover:text-red-800 text-xs underline"
                    onClick={() => setError('')}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-sm">{success}</span>
                  <button 
                    className="ml-2 text-green-600 hover:text-green-800 text-xs underline"
                    onClick={() => setSuccess('')}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="space-y-3">
                <div>
                  <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text
                  </label>
                  <textarea
                    id="question"
                    rows={4}
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Enter your question here... (Ctrl+Enter to submit)"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {newQuestion.length}/500 characters
                  </p>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !newQuestion.trim()}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isSubmitting || !newQuestion.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Submit Question
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Questions List Section */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Existing Questions
              </h3>
              <button
                onClick={loadQuestions}
                disabled={isLoading}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  isLoading
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-3"></div>
                  <p className="text-gray-600 text-sm">Loading questions...</p>
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-sm">No questions found</p>
                  <p className="text-xs text-gray-400">Add your first question using the form</p>
                </div>
              ) : (
                questions.map((question, index) => (
                  <div key={question.id} className="p-3 rounded-lg border bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-xs">{question.id}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 text-sm leading-relaxed">{question.question_text}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Level0Settings;