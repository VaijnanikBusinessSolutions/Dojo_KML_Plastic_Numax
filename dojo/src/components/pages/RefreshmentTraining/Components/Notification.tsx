import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Clock, Users, MapPin } from 'lucide-react';

interface TrainingSession {
  id: string;
  training_name?: { topic: string };
  trainingName?: string;
  trainer?: { name: string };
  venue?: { name: string };
  date: string;
  time: string;
  employees: any[];
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
}

const Notification: React.FC = () => {
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [currentWeek, setCurrentWeek] = useState<TrainingSession[]>([]);
  const [currentMonth, setCurrentMonth] = useState<TrainingSession[]>([]);

  useEffect(() => {
    fetchSessionsFromBackend();
  }, []);

  const fetchSessionsFromBackend = async () => {
    try {
      const res = await fetch('http://172.25.0.51:8000/schedules/'); 
      if (res.ok) {
        const data = await res.json();
        setTrainingSessions(data);
        filterSessionsByTime(data);
      } else {
        setTrainingSessions([]);
      }
    } catch (error) {
      setTrainingSessions([]);
    }
  };

  const filterSessionsByTime = (sessions: TrainingSession[]) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const thisWeek = sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= startOfWeek && sessionDate <= endOfWeek;
    });

    const thisMonth = sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= startOfMonth && sessionDate <= endOfMonth;
    });

    setCurrentWeek(thisWeek);
    setCurrentMonth(thisMonth);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUpcomingTrainings = () => {
    const now = new Date();
    return trainingSessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate > now && session.status === 'scheduled';
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getName = (field: any) =>
  typeof field === 'object' && field !== null && 'name' in field
    ? field.name
    : typeof field === 'string'
      ? field
      : '';

const TrainingCard: React.FC<{ session: TrainingSession }> = ({ session }) => (
  <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-800">
          {session.training_name?.topic || session.trainingName}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          with {getName(session.trainer)}
        </p>
      </div>
      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(session.status)}`}>
        {session.status}
      </span>
    </div>
    <div className="space-y-2 text-sm text-gray-600">
      <div className="flex items-center space-x-2">
        <Calendar className="w-4 h-4" />
        <span>{formatDate(session.date)}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Clock className="w-4 h-4" />
        <span>{session.time}</span>
      </div>
      <div className="flex items-center space-x-2">
        <MapPin className="w-4 h-4" />
        <span>{getName(session.venue)}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Users className="w-4 h-4" />
        <span>{session.employees.length} participants</span>
      </div>
    </div>
  </div>
);


  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Bell className="w-8 h-8 text-blue-600" />
        <h2 className="text-3xl font-bold text-gray-800">Notifications</h2>
      </div>

      {/* Upcoming Trainings Alert */}
      {getUpcomingTrainings().length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-800">Upcoming Trainings</h3>
          </div>
          <p className="text-blue-700">
            You have {getUpcomingTrainings().length} upcoming training session(s) scheduled.
          </p>
        </div>
      )}

      {/* This Week's Trainings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">This Week's Trainings</h3>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {currentWeek.length} training{currentWeek.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {currentWeek.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentWeek.map((session) => (
              <TrainingCard key={session.id} session={session} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No trainings scheduled for this week</p>
          </div>
        )}
      </div>

      {/* This Month's Trainings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">This Month's Trainings</h3>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            {currentMonth.length} training{currentMonth.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {currentMonth.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentMonth.map((session) => (
                <TrainingCard key={session.id} session={session} />
              ))}
            </div>
            
            {/* Monthly Summary */}
            <div className="border-t pt-4 mt-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Monthly Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {currentMonth.filter(s => s.status === 'scheduled').length}
                  </div>
                  <div className="text-sm text-blue-800">Scheduled</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {currentMonth.filter(s => s.status === 'completed').length}
                  </div>
                  <div className="text-sm text-green-800">Completed</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {currentMonth.filter(s => s.status === 'pending').length}
                  </div>
                  <div className="text-sm text-yellow-800">Pending</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {currentMonth.filter(s => s.status === 'cancelled').length}
                  </div>
                  <div className="text-sm text-red-800">Cancelled</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No trainings scheduled for this month</p>
          </div>
        )}
    </div>
      </div>
  );
};

export default Notification;


