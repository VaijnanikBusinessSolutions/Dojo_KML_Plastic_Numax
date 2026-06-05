import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Home, User, Calendar, BookOpen, Award, Clock } from 'lucide-react';

// Define the interfaces as in your original code
interface SubTopic {
  id: number; // subtopic_id
  title: string; // subtopic_name
  day: number; // days_id
  day_name: string; // Days.day (e.g., "Day 1")
  level_name: string;
  description?: string;
}

interface GroupedSubTopics {
  [key: string]: SubTopic[];
}

const API_BASE = 'http://127.0.0.1:8000';

const Level1 = () => {
  const navigate = useNavigate();
  const [subtopics, setSubtopics] = useState<SubTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubtopics = async () => {
      try {
        const response = await fetch(`${API_BASE}/subtopics/?level=1`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const jsonData: SubTopic[] = await response.json();
        setSubtopics(jsonData);
        setLoading(false);
      } catch (error) {
        console.error('Fetch error:', error);
        setError('Failed to load subtopics');
        setLoading(false);
      }
    };

    fetchSubtopics();
  }, []);

  const groupSubtopicsByDay = (subtopicsToGroup: SubTopic[]): GroupedSubTopics => {
    const grouped: GroupedSubTopics = {};
    subtopicsToGroup.forEach((subtopic) => {
      const dayKey = subtopic.day_name || `Day ${subtopic.day}`;
      if (!grouped[dayKey]) {
        grouped[dayKey] = [];
      }
      grouped[dayKey].push(subtopic);
    });
    return grouped;
  };

  const handleLessonClick = (subtopic: SubTopic) => {
    const normalizedTitle = subtopic.title.toLowerCase();

    if (normalizedTitle === 'evaluation') {
      navigate('/ExamModeSelector', {
        state: {
          questionPaperId: 12,
          skillId: 1,
          levelId: 1,
          fromNavigation: true,
          skillName: 'General',
          levelName: 'Level 1',
          stationId: 103,
          stationName: 'General',
          departmentName: 'Assembly-DT',
        },
      });
    } else if (normalizedTitle === 'handover sheet' || normalizedTitle === 'handover') {
      navigate('/HandoverSheet');
    } else if (normalizedTitle === 'feedback form' || normalizedTitle === 'feedback') {
      navigate('/Level1/feedbackform');
    } else {
      navigate(`/level1/${subtopic.id}`);
    }
  };

  const getLessonStyle = (title: string) => {
    const normalizedTitle = title.toLowerCase();
    if (normalizedTitle === 'evaluation') {
      return {
        bg: 'bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500',
        text: 'text-red-700',
        icon: '📊',
        badge: 'bg-red-100 text-red-700'
      };
    } else if (normalizedTitle === 'handover sheet' || normalizedTitle === 'handover') {
      return {
        bg: 'bg-gradient-to-r from-amber-50 to-amber-100 border-l-4 border-amber-500',
        text: 'text-amber-700',
        icon: '📋',
        badge: 'bg-amber-100 text-amber-700'
      };
    } else if (normalizedTitle === 'feedback form' || normalizedTitle === 'feedback') {
      return {
        bg: 'bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500',
        text: 'text-blue-700',
        icon: '💬',
        badge: 'bg-blue-100 text-blue-700'
      };
    } else {
      return {
        bg: 'bg-gradient-to-r from-slate-50 to-slate-100 border-l-4 border-slate-400',
        text: 'text-slate-700',
        icon: '📚',
        badge: 'bg-slate-100 text-slate-700'
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <header className="bg-white shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => navigate(-1)}
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-sm">NL</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">NL Technologies Pvt.Ltd Pvt Ltd</h1>
                    <p className="text-xs text-gray-500">Training Management System</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Dojo 2.0
                </h2>
                <p className="text-xs text-gray-500">Professional Training Platform</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                  <Home className="w-5 h-5 text-gray-600" />
                </button>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className="w-full px-6 py-12 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Training Modules</h3>
              <p className="text-gray-500">Please wait while we prepare your learning experience...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <header className="bg-white shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => navigate(-1)}
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-sm">NL</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">NL Technologies Pvt.Ltd Pvt Ltd</h1>
                    <p className="text-xs text-gray-500">Training Management System</p>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Dojo 2.0
                </h2>
                <p className="text-xs text-gray-500">Professional Training Platform</p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                  <Home className="w-5 h-5 text-gray-600" />
                </button>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className="w-full px-6 py-12 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-semibold text-red-600 mb-2">Unable to Load Training Data</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Retry Loading
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const groupedSubtopics = groupSubtopicsByDay(subtopics);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12">
      {/* <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50 w-full">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4 flex-1">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">NL</span>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">NL Technologies Pvt.Ltd Pvt Ltd</h1>
                  <p className="text-xs text-gray-500">Training Management System</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 text-center">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Dojo 2.0
              </h2>
              <p className="text-xs text-gray-500">Professional Training Platform</p>
            </div>
            
            <div className="flex items-center space-x-3 flex-1 justify-end">
              <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                <Home className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header> */}

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200 w-full">
        <div className="w-full px-6 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">Basic DOJO Training</h1>
            </div>
            <p className="text-lg text-gray-600 mb-4">Comprehensive foundational training program</p>
          </div>
          {/* <button
            onClick={() => navigate("/level1/attendance")}
            className="absolute top-12 right-6 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md
                 hover:bg-indigo-700 focus:outline-none focus:ring-2
                 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
          >
            Mark Attendance
          </button> */}
          <div className='flex justify-end items-center w-full'>
            <button
              onClick={() => navigate("/level1/attendance")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg flex justify-end hover:bg-blue-700 transition-colors font-medium"
              // className="absolute top-12 right-6 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md
              //      hover:bg-indigo-700 focus:outline-none focus:ring-2
              //      focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                       >
              Mark Attendance
            </button>
           </div>
        </div>
      </div>

      {/* Training Content */}
      <div className="w-full px-6 py-6 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="space-y-12">
              {Object.keys(groupedSubtopics)
                .sort()
                .map((dayName, dayIndex) => {
                  const daySubtopics = groupedSubtopics[dayName];
                  return (
                    <div key={dayName} className="relative">
                      <div className="flex items-center mb-6">
                        <div className="flex-shrink-0 mr-8">
                          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <div className="text-center">
                              <div className="text-xl font-bold text-white">{dayIndex + 1}</div>
                              <div className="text-xs text-blue-100 font-medium">DAY</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">{dayName}</h2>
                          <p className="text-gray-600">
                            {daySubtopics.length} training modules • 
                            {dayIndex === 0 ? ' Foundation concepts' : ' Advanced topics & assessment'}
                          </p>
                          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mt-2"></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-28">
                        {daySubtopics.map((subtopic: SubTopic, index: number) => {
                          const style = getLessonStyle(subtopic.title);
                          return (
                            <div
                              key={subtopic.id}
                              className={`${style.bg} rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group`}
                              onClick={() => handleLessonClick(subtopic)}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                    <span className="text-xl">{style.icon}</span>
                                  </div>
                                  <div className="flex-1">
                                    <h3 className={`text-base font-bold ${style.text} group-hover:text-opacity-80 transition-colors`}>
                                      {subtopic.title}
                                    </h3>
                                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${style.badge} mt-1`}>
                                      Module {index + 1}
                                    </div>
                                  </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>
                              
                              {subtopic.description && (
                                <p className="text-gray-700 text-sm leading-relaxed">
                                  {subtopic.description}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-md border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Ready to Begin Your Training Journey?</h3>
            <p className="text-gray-600">
              Complete all modules to earn your Level 1 DOJO certification and advance to the next level.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Level1;