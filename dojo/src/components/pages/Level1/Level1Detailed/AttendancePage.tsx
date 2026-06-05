
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar,
  UserX,
  CalendarClock,
  History,
} from 'lucide-react';
import toast from 'react-hot-toast';

import AttendanceMarking from '../attendancecomponents/AttendanceMarking';
import AbsentEmployeesList from '../attendancecomponents/AbsentEmployeesList';
import RescheduledSessionsList from '../attendancecomponents/RescheduledSessionsList';
import AttendanceHistory from '../attendancecomponents/AttendanceHistory';

type TabType = 'attendance' | 'absent' | 'rescheduled' | 'history';

const tabs = [
  { id: 'attendance' as TabType, label: 'Attendance', icon: Calendar, color: 'blue' },
  { id: 'absent' as TabType, label: 'Retraining Required', icon: UserX, color: 'red' },
  { id: 'rescheduled' as TabType, label: 'Rescheduled', icon: CalendarClock, color: 'purple' },
  { id: 'history' as TabType, label: 'History', icon: History, color: 'green-gradient' }, // ← changed key
] as const;

// Updated color mapping with custom gradient for History
const tabColors = {
  blue: 'bg-gradient-to-br from-blue-500 to-cyan-600  text-white',
  red: 'bg-gradient-to-r from-orange-500 to-red-600 text-white',
  purple: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
  'green-gradient':'bg-gradient-to-r from-emerald-500 to-teal-600  text-white', // ← your gradient
};

export default function AttendancePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('attendance');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const tab = searchParams.get('tab') as TabType;
    if (tab && ['attendance', 'absent', 'rescheduled', 'history'].includes(tab)) {
      setActiveTab(tab);
    } else {
      setSearchParams({ tab: 'attendance' });
    }
  }, [searchParams, setSearchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.success('Refreshed successfully!');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'attendance':
        return <AttendanceMarking onSuccess={handleRefresh} />;
      case 'absent':
        return <AbsentEmployeesList onSuccess={handleRefresh} />;
      case 'rescheduled':
        return <RescheduledSessionsList onSuccess={handleRefresh} />;
      case 'history':
        return <AttendanceHistory key={refreshKey} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Attendance Management System</h1>
            <p className="text-sm text-gray-600 mt-1">
              Comprehensive employee attendance tracking and management
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center gap-6 ">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-lg font-semibold text-sm transition-all transform hover:scale-105 shadow-md ${
                    isActive
                      ? tabColors[tab.color]
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div key={refreshKey}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}