import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Users, Clock } from 'lucide-react';

interface TrainingSession {
  id: string;
  training_name?: { topic: string };
  trainer?: { name: string };
  venue?: { name: string };
  date: string;
  time: string;
  employees: any[];
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
}

const CalendarOverview: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    fetchSessionsFromBackend();
  }, []);

  const fetchSessionsFromBackend = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/schedules/'); 
      if (res.ok) {
        setTrainingSessions(await res.json());
      }
    } catch (error) {
      setTrainingSessions([]);
    }
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
    setSelectedDate(null); // Reset selected date when navigating months
  };

  const getDayTrainings = (day: number) => {
    const dayString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return trainingSessions.filter(session => session.date === dayString);
  };

  const getSelectedDateTrainings = () => {
    if (!selectedDate) return [];
    return trainingSessions.filter(session => session.date === selectedDate);
  };

  const handleDateClick = (day: number) => {
    const dayString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dayString);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    const totalCells = Math.ceil((daysInMonth + firstDayOfMonth) / 7) * 7;

    // Empty cells for previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-24 border border-gray-200 bg-gray-50"></div>
      );
    }

    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayTrainings = getDayTrainings(day);
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
      const dayString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = selectedDate === dayString;

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`h-24 border border-gray-200 p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
            isSelected ? 'bg-blue-50 border-blue-300' : ''
          } ${isToday ? 'bg-yellow-50 border-yellow-300' : ''}`}
        >
          <div className={`text-sm font-medium ${isToday ? 'text-yellow-800' : 'text-gray-700'}`}>
            {day}
          </div>
          <div className="mt-1 space-y-1">
            {dayTrainings.slice(0, 2).map((session) => (
              <div
                key={session.id}
                className={`text-xs px-2 py-1 rounded text-white truncate ${getStatusColor(session.status)}`}
                title={`${session.training_name?.topic ?? ''} - ${session.trainer?.name ?? ''}`}
              >
                {session.training_name?.topic ?? ''}
              </div>
            ))}
            {dayTrainings.length > 2 && (
              <div className="text-xs text-gray-500">
                +{dayTrainings.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    // Empty cells for next month
    const remainingCells = totalCells - (daysInMonth + firstDayOfMonth);
    for (let i = 0; i < remainingCells; i++) {
      days.push(
        <div key={`empty-next-${i}`} className="h-24 border border-gray-200 bg-gray-50"></div>
      );
    }

    return days;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Calendar Overview</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-xl font-semibold text-gray-700 min-w-48 text-center">
            {currentMonth}
          </h3>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="grid grid-cols-7 bg-gray-50">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {renderCalendarDays()}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              {selectedDate ? `Trainings on ${selectedDate}` : 'Select a date'}
            </h4>
            
            {selectedDate ? (
              <div className="space-y-3">
                {getSelectedDateTrainings().length > 0 ? (
                  getSelectedDateTrainings().map((session) => (
                    <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{session.training_name?.topic ?? ''}</h5>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full text-white ${getStatusColor(session.status)}`}>
                          {session.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{session.time}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{session.trainer?.name ?? ''}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{session.venue?.name ?? ''}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{session.employees.length} participants</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No trainings scheduled for this date</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Click on a date to view training details</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Training Status Legend</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600">Scheduled</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-600">Cancelled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarOverview;
