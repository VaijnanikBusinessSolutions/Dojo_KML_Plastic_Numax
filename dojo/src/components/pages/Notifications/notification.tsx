import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Bell, Check, CheckCheck, AlertCircle, Info, Clock, User, BookOpen, Calendar, RefreshCw, Trash2, Zap } from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  recipient_name?: string;
  employee_name?: string;
  level_name?: string;
  is_read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  time_ago: string;
  is_recent: boolean;
  metadata?: Record<string, any>;
}

interface NotificationStats {
  total_count: number;
  unread_count: number;
  read_count: number;
  recent_count: number;
  by_type: Record<string, number>;
  by_priority: Record<string, number>;
}

// --- CONSTANTS ---
const API_BASE_URL = 'http://127.0.0.1:8000'; // Standardized base URL

const NOTIFICATION_TYPES = {
  EMPLOYEE_REGISTRATION: "employee_registration",
  LEVEL_EXAM_COMPLETED: "level_exam_completed",
  TRAINING_RESCHEDULE: "training_reschedule",
  REFRESHER_TRAINING_SCHEDULED: "refresher_training_scheduled",
  REFRESHER_TRAINING_COMPLETED: "refresher_training_completed",
  BENDING_TRAINING_ADDED: "bending_training_added",
  SYSTEM_ALERT: "system_alert",
  TRAINING_SCHEDULED: "training_scheduled",
  TRAINING_COMPLETED: "training_completed",
  HANCHOU_EXAM_COMPLETED: "hanchou_exam_completed",
  SHOKUCHOU_EXAM_COMPLETED: "shokuchou_exam_completed",
  TEN_CYCLE_EVALUATION_COMPLETED: "ten_cycle_evaluation_completed",
  OJT_COMPLETED: "ojt_completed",
  MACHINE_ALLOCATED: "machine_allocated",
  TEST_ASSIGNED: "test_assigned",
  EVALUATION_COMPLETED: "evaluation_completed",
  RETRAINING_SCHEDULED: "retraining_scheduled",
  RETRAINING_COMPLETED: "retraining_completed",
  HUMAN_BODY_CHECK_COMPLETED: "human_body_check_completed",
  MILESTONE_REACHED: "milestone_reached"
} as const;


// --- COMPONENT ---
const AppNotification: React.FC = () => {
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'recent'>('all');
  const [isConnected, setIsConnected] = useState(false);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- HELPER FUNCTIONS ---
  const isRecentNotification = (dateString: string): boolean => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    return diffInHours <= 24;
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // --- DATA FETCHING & PROCESSING ---
  const fetchNotifications = useCallback(async () => {
    // Only show full loader on first load, not background polls
    if (!pollIntervalRef.current) {
      setLoading(true);
    }
    
    try {
      // 1. Get local state of read/deleted notifications
      const readNotifications: number[] = JSON.parse(localStorage.getItem('readNotifications') || '[]');
      const deletedNotifications: number[] = JSON.parse(localStorage.getItem('deletedNotifications') || '[]');
      console.log('🔍 LocalStorage state:', { read: readNotifications, deleted: deletedNotifications });

      // 2. Fetch all relevant notifications from the API
      const params = new URLSearchParams();
      Object.values(NOTIFICATION_TYPES).forEach(type => params.append('notification_type', type));
      
      const response = await fetch(`${API_BASE_URL}/notifications/?${params}`);

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📡 Full API Response:', data);
      const rawNotifications = data.results || data || [];

      // 3. Process the raw data: filter out deleted, then map and apply local read status
      const processedNotifications = rawNotifications
        .filter((notif: any) => !deletedNotifications.includes(notif.id)) // CRITICAL: Filter based on local state
        .map((notif: any): Notification => ({
          ...notif,
          is_read: readNotifications.includes(notif.id) || notif.is_read,
          time_ago: formatTimeAgo(notif.created_at),
          is_recent: isRecentNotification(notif.created_at)
        }));

      console.log(`✅ Processed and loaded ${processedNotifications.length} notifications.`);
      setAllNotifications(processedNotifications);
      setIsConnected(true);
      setError(null);

    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError('Failed to connect to the notification service.');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- LIFECYCLE HOOKS ---
  useEffect(() => {
    fetchNotifications(); // Initial fetch
    
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    
    const intervalId = setInterval(fetchNotifications, 30000); // Poll every 30s
    pollIntervalRef.current = intervalId;

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [fetchNotifications]);

  useEffect(() => {
    // This effect calculates stats whenever the main notification list changes
    const total_count = allNotifications.length;
    const unread_count = allNotifications.filter(n => !n.is_read).length;
    const recent_count = allNotifications.filter(n => n.is_recent).length;

    const by_type = allNotifications.reduce((acc, n) => {
      acc[n.notification_type] = (acc[n.notification_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const by_priority = allNotifications.reduce((acc, n) => {
      acc[n.priority] = (acc[n.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setStats({
      total_count,
      unread_count,
      read_count: total_count - unread_count,
      recent_count,
      by_type,
      by_priority,
    });
  }, [allNotifications]);


  // --- USER ACTIONS ---
  const toggleReadStatus = async (notificationId: number) => {
    const notification = allNotifications.find(n => n.id === notificationId);
    if (!notification) return;

    const newReadState = !notification.is_read;

    setAllNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, is_read: newReadState } : n))
    );

    const readIds: number[] = JSON.parse(localStorage.getItem('readNotifications') || '[]');
    if (newReadState) {
      if (!readIds.includes(notificationId)) {
        localStorage.setItem('readNotifications', JSON.stringify([...readIds, notificationId]));
      }
    } else {
      localStorage.setItem('readNotifications', JSON.stringify(readIds.filter(id => id !== notificationId)));
    }

    if (isConnected) {
      try {
        await fetch(`${API_BASE_URL}/notifications/${notificationId}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_read: newReadState }),
        });
      } catch (err) { console.error('Server sync error for read status:', err); }
    }
  };

  const markAllAsRead = async () => {
    setAllNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    const allIds = allNotifications.map(n => n.id);
    localStorage.setItem('readNotifications', JSON.stringify(allIds));

    if (isConnected) {
      try {
        await fetch(`${API_BASE_URL}/notifications/mark_all_read/`, { method: 'POST' });
      } catch (err) { console.error('Server mark all read error:', err); }
    }
  };
  
  const deleteNotification = async (notificationId: number) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    
    setAllNotifications(prev => prev.filter(notif => notif.id !== notificationId));

    const deletedIds: number[] = JSON.parse(localStorage.getItem('deletedNotifications') || '[]');
    if (!deletedIds.includes(notificationId)) {
      localStorage.setItem('deletedNotifications', JSON.stringify([...deletedIds, notificationId]));
    }
    
    const readIds: number[] = JSON.parse(localStorage.getItem('readNotifications') || '[]');
    if (readIds.includes(notificationId)) {
      localStorage.setItem('readNotifications', JSON.stringify(readIds.filter(id => id !== notificationId)));
    }

    if (isConnected) {
      try {
        await fetch(`${API_BASE_URL}/notifications/${notificationId}/`, { method: 'DELETE' });
      } catch (err) { console.error('Server delete error:', err); }
    }
  };

  const deleteAllNotifications = async () => {
    if (!window.confirm('Are you sure you want to delete ALL notifications? This cannot be undone.')) return;

    const allIds = allNotifications.map(n => n.id);
    localStorage.setItem('deletedNotifications', JSON.stringify(allIds));
    localStorage.removeItem('readNotifications');
    setAllNotifications([]);

    if (isConnected) {
      try {
        await fetch(`${API_BASE_URL}/notifications/delete_all/`, { method: 'POST' });
      } catch (err) { console.error('Server delete all error:', err); }
    }
  };

  const resetLocalState = () => {
    if (window.confirm('This will clear all locally stored "read" and "deleted" history for notifications. This is useful for debugging if notifications seem to be missing. Continue?')) {
        localStorage.removeItem('readNotifications');
        localStorage.removeItem('deletedNotifications');
        fetchNotifications();
    }
  };

  // --- DERIVED STATE & DISPLAY HELPERS ---
  const filteredNotifications = allNotifications.filter(notif => {
    if (filter === 'unread') return !notif.is_read;
    if (filter === 'recent') return notif.is_recent;
    return true; // 'all'
  });

  const getNotificationIcon = (type: string) => { /* ... Unchanged ... */ };
  const getPriorityColor = (priority: string) => { /* ... Unchanged ... */ };
  const getNotificationTypeDisplay = (type: string) => { /* ... Unchanged ... */ };

  // --- RENDER ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-blue-900">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Bell className="w-8 h-8 text-white" />
              <h2 className="text-2xl font-bold text-white">Notifications</h2>
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} title={isConnected ? 'Connected' : 'Disconnected'} />
            </div>

            <div className="flex items-center space-x-3">
              <button onClick={resetLocalState} className="flex items-center space-x-2 px-3 py-2 text-sm text-yellow-100 bg-yellow-600 bg-opacity-75 rounded-lg hover:bg-opacity-100 transition" title="Clear local read/deleted state and refetch">
                <Zap className="w-4 h-4" />
                <span>Reset State</span>
              </button>
              {stats && stats.unread_count > 0 && (
                <button onClick={markAllAsRead} className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-100 bg-blue-700 bg-opacity-50 rounded-lg hover:bg-opacity-75 transition">
                  <CheckCheck className="w-4 h-4" />
                  <span>Mark all as read</span>
                </button>
              )}
              {stats && stats.total_count > 0 && (
                <button onClick={deleteAllNotifications} className="flex items-center space-x-2 px-3 py-2 text-sm text-red-100 bg-red-700 bg-opacity-50 rounded-lg hover:bg-opacity-75 transition">
                  <Trash2 className="w-4 h-4" />
                  <span>Delete all</span>
                </button>
              )}
            </div>
          </div>
          {stats && (
            <div className="flex items-center space-x-6 mt-4 text-sm text-blue-100">
              <span className="flex items-center space-x-1"><span className="w-2 h-2 bg-blue-300 rounded-full"></span><span>{stats.total_count} Total</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 bg-red-400 rounded-full"></span><span>{stats.unread_count} Unread</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 bg-green-400 rounded-full"></span><span>{stats.recent_count} Recent</span></span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-100 text-red-700 border-l-4 border-red-400"><div className="flex items-center space-x-2"><AlertCircle className="w-5 h-5" /><span>{error}</span></div></div>
        )}

        {/* Filter Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {(['all', 'unread', 'recent'] as const).map((filterType) => (
              <button key={filterType} onClick={() => setFilter(filterType)} className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${filter === filterType ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                {filterType}
                {filterType === 'unread' && stats && stats.unread_count > 0 && (<span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">{stats.unread_count}</span>)}
              </button>
            ))}
          </nav>
        </div>

        {/* Notification List */}
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div key={notification.id} className={`p-6 transition-all duration-200 relative group ${notification.is_read ? 'bg-white' : 'bg-blue-50'} hover:bg-blue-100`}>
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 p-2 rounded-full border ${getPriorityColor(notification.priority)}`}>{getNotificationIcon(notification.notification_type)}</div>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => !notification.is_read && toggleReadStatus(notification.id)}>
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg font-semibold ${notification.is_read ? 'text-gray-700' : 'text-gray-900'}`}>{notification.title}</h3>
                      {!notification.is_read && <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0" />}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center space-x-1"><Clock className="w-3 h-3" /><span>{notification.time_ago}</span></span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>{notification.priority.toUpperCase()}</span>
                        <span className="text-gray-400">{getNotificationTypeDisplay(notification.notification_type)}</span>
                      </div>
                      {notification.employee_name && (<span className="text-xs text-gray-500 flex items-center space-x-1"><User className="w-3 h-3" /><span>{notification.employee_name}</span></span>)}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button onClick={(e) => { e.stopPropagation(); toggleReadStatus(notification.id); }} className={`p-2 rounded-full transition-colors ${notification.is_read ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' : 'text-blue-500 hover:text-blue-700 hover:bg-blue-100'}`} title={notification.is_read ? 'Mark as unread' : 'Mark as read'}>
                      {notification.is_read ? <Check className="w-4 h-4" /> : <CheckCheck className="w-4 h-4" />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }} className="p-2 rounded-full text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
              <p className="text-sm">
                {filter === 'unread' ? "You're all caught up!" : filter === 'recent' ? "No notifications in the last 24 hours." : "There are no notifications to display."}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {isConnected ? (<span className="flex items-center space-x-1 text-green-600"><div className="w-2 h-2 bg-green-500 rounded-full"></div><span>Live updates enabled</span></span>) : (<span className="flex items-center space-x-1 text-red-600"><div className="w-2 h-2 bg-red-500 rounded-full"></div><span>Offline - showing cached data</span></span>)}
            </div>
            <button onClick={fetchNotifications} className="inline-flex items-center space-x-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppNotification;