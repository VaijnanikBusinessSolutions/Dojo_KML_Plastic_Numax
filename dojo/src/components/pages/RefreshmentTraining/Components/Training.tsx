import React, { useState, useEffect } from 'react';
import { CheckCircle, UserX, Edit2, Save, X, Calendar, Play, BookOpen } from 'lucide-react';

const API_BASE = 'http://172.25.0.51:8000';

interface TrainingCategory {
  id: number;
  name: string;
}

interface TrainingTopic {
  id: number;
  category: TrainingCategory;
  topic: string;
  description: string;
}

interface Trainer {
  id: number;
  name: string;
}

interface Venue {
  id: number;
  name: string;
}

// Employee shown inside a session (normalized)
interface SessionEmployee {
  id: string;            // emp_id
  employee_code: string; // emp_id
  full_name: string;     // first+last or emp_id
}

interface TrainingSession {
  id: number;
  training_category: TrainingCategory;
  training_name: TrainingTopic;
  trainer: Trainer;
  venue: Venue;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
  date: string;
  time: string;
  employees: SessionEmployee[];
}

interface EmployeeStatus {
  id: number;
  schedule: number;
  employee: string; // emp_id string
  status: 'present' | 'absent' | 'rescheduled';
  notes?: string;
  reschedule_date?: string;
  reschedule_time?: string;
  reschedule_reason?: string;
  updated_at: string;
}

// Editable state for a row
type EditableEmployeeStatus = Omit<EmployeeStatus, 'status' | 'updated_at'> & {
  status: EmployeeStatus['status'] | ''; // allow empty while editing
  updated_at?: string;
};

interface RescheduleLog {
  id: number;
  schedule: number;
  employee: string; // emp_id
  original_date: string;
  original_time: string;
  new_date: string;
  new_time: string;
  reason: string;
  created_at: string;
}

interface TrainingProps {
  setActiveModule: (module: string) => void;
  setSelectedCategoryId: (categoryId: number | string | null) => void;
  setSelectedTopicId: (topicId: number | string | null) => void;
}

const Training: React.FC<TrainingProps> = ({
  setActiveModule,
  setSelectedCategoryId,
  setSelectedTopicId,
}) => {
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [trainingCategories, setTrainingCategories] = useState<TrainingCategory[]>([]);
  const [employeeStatuses, setEmployeeStatuses] = useState<EmployeeStatus[]>([]);
  const [rescheduleLogs, setRescheduleLogs] = useState<RescheduleLog[]>([]);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
  const [editingStatuses, setEditingStatuses] = useState<{ [key: string]: EditableEmployeeStatus }>({});
  const [showRescheduleForm, setShowRescheduleForm] = useState<string | null>(null);
  const [trainingTopics, setTrainingTopics] = useState<TrainingTopic[]>([]);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: '', reason: '' });

  useEffect(() => {
    fetchSessions();
    fetchCategories();
    fetchTopics();
    fetchEmployeeStatuses();
    fetchRescheduleLogs();
  }, []);

  const fetchSessions = async () => {
    const res = await fetch(`${API_BASE}/schedules/`);
    if (!res.ok) {
      console.error('Failed to fetch sessions:', res.status);
      return;
    }
    const data = await res.json();

    // Normalize employees inside each session to have id/full_name/employee_code
    const normalized: TrainingSession[] = data.map((s: any) => ({
      ...s,
      employees: (s.employees || []).map((e: any) => {
        const id = String(e.emp_id ?? e.id ?? '');
        const full_name =
          [e.first_name, e.last_name].filter(Boolean).join(' ').trim() ||
          String(e.full_name || id);
        const employee_code = String(e.employee_code ?? e.emp_id ?? id);
        return { id, full_name, employee_code };
      }),
    }));

    setTrainingSessions(normalized);
  };

  const fetchCategories = async () => {
    const res = await fetch(`${API_BASE}/training-categories/`);
    if (res.ok) setTrainingCategories(await res.json());
  };

  const fetchTopics = async () => {
    const res = await fetch(`${API_BASE}/curriculums/`);
    if (res.ok) setTrainingTopics(await res.json());
  };

  const fetchEmployeeStatuses = async () => {
    const res = await fetch(`${API_BASE}/empattendances/`);
    if (res.ok) {
      const data = await res.json();
      // Ensure employee is string
      setEmployeeStatuses(
        data.map((d: any) => ({ ...d, employee: String(d.employee) }))
      );
    }
  };

  const fetchRescheduleLogs = async () => {
    const res = await fetch(`${API_BASE}/reschedule-logs/`);
    if (res.ok) {
      const data = await res.json();
      setRescheduleLogs(
        data.map((r: any) => ({ ...r, employee: String(r.employee) }))
      );
    }
  };

  // Attendance helpers
  const getEmployeeStatus = (sessionId: number, employeeId: string): EmployeeStatus | undefined => {
    return employeeStatuses.find(
      status => status.schedule === sessionId && String(status.employee) === String(employeeId)
    );
  };

  const handleStatusUpdate = async (
    sessionId: number,
    employeeId: string, // emp_id string
    newStatus: EmployeeStatus['status'],
    notes?: string
  ) => {
    const existing = getEmployeeStatus(sessionId, employeeId);
    const payload: any = {
      schedule: sessionId,
      employee: employeeId, // emp_id string
      status: newStatus,
      notes: notes || '',
    };

    if (newStatus === 'rescheduled') {
      payload.reschedule_date = rescheduleForm.date;
      payload.reschedule_time = rescheduleForm.time;
      payload.reschedule_reason = rescheduleForm.reason;
    }

    const url = existing ? `${API_BASE}/empattendances/${existing.id}/` : `${API_BASE}/empattendances/`;
    const method = existing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      await fetchEmployeeStatuses();
      await fetchRescheduleLogs();
    } else {
      const text = await res.text();
      alert('Failed to update attendance\n' + text);
    }
  };

  const handleReschedule = async (sessionId: number, employeeId: string) => {
    await handleStatusUpdate(sessionId, employeeId, 'rescheduled', rescheduleForm.reason);
    setShowRescheduleForm(null);
    setRescheduleForm({ date: '', time: '', reason: '' });
  };

  const startEditing = (sessionId: number, employeeId: string) => {
    const currentStatus = getEmployeeStatus(sessionId, employeeId);
    const key = `${sessionId}-${employeeId}`;
    if (currentStatus) {
      setEditingStatuses(prev => ({
        ...prev,
        [key]: { ...currentStatus, status: currentStatus.status },
      }));
    } else {
      setEditingStatuses(prev => ({
        ...prev,
        [key]: {
          id: 0,
          schedule: sessionId,
          employee: employeeId,
          status: '',
          notes: '',
        },
      }));
    }
  };

  const saveEdit = (sessionId: number, employeeId: string) => {
    const editKey = `${sessionId}-${employeeId}`;
    const editedStatus = editingStatuses[editKey];

    if (editedStatus) {
      if (editedStatus.status === '') {
        alert('Please select a status for the employee.');
        return;
      }

      if (editedStatus.status === 'rescheduled') {
        setShowRescheduleForm(editKey);
      } else {
        handleStatusUpdate(sessionId, employeeId, editedStatus.status as EmployeeStatus['status'], editedStatus.notes);
      }
    }
    setEditingStatuses(prev => {
      const next = { ...prev };
      delete next[editKey];
      return next;
    });
  };

  const cancelEdit = (sessionId: number, employeeId: string) => {
    const editKey = `${sessionId}-${employeeId}`;
    setEditingStatuses(prev => {
      const next = { ...prev };
      delete next[editKey];
      return next;
    });
  };

  const updateEditingStatus = (
    sessionId: number,
    employeeId: string,
    field: keyof EditableEmployeeStatus,
    value: any
  ) => {
    const key = `${sessionId}-${employeeId}`;
    setEditingStatuses(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const getStatusColor = (status: EmployeeStatus['status'] | '') => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-200';
      case 'absent': return 'bg-red-100 text-red-800 border-red-200';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case '': return 'bg-gray-100 text-gray-400 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColors = (status: TrainingSession['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: EmployeeStatus['status'] | '') => {
    switch (status) {
      case 'present': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'absent': return <UserX className="w-4 h-4 text-red-600" />;
      case 'rescheduled': return <Calendar className="w-4 h-4 text-yellow-600" />;
      default: return null;
    }
  };

  const getSessionProgress = (session: TrainingSession) => {
    const statuses = session.employees.map(emp => getEmployeeStatus(session.id, emp.id));
    const present = statuses.filter(s => s?.status === 'present').length;
    const absent = statuses.filter(s => s?.status === 'absent').length;
    const rescheduled = statuses.filter(s => s?.status === 'rescheduled').length;
    return { present, absent, rescheduled, total: session.employees.length };
  };

  const handleStartTraining = (session: TrainingSession) => {
    setSelectedCategoryId(session.training_category.id);
    setSelectedTopicId(session.training_name.id);
    setActiveModule('curriculum');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">Training Management</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Training Sessions List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Training Sessions</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {trainingSessions.map((session) => {
                const progress = getSessionProgress(session);
                return (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedSession?.id === session.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-800">{session.training_name.topic}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColors(session.status)}`}>
                        {session.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <div>{session.training_category.name}</div>
                      <div>{session.trainer.name}</div>
                      <div>{session.date} • {session.time}</div>
                    </div>
                    <div className="flex items-center space-x-4 text-xs">
                      <div className="text-green-600">✓ {progress.present}</div>
                      <div className="text-red-600">✗ {progress.absent}</div>
                      <div className="text-yellow-600">📅 {progress.rescheduled}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Status Management */}
        <div className="lg:col-span-2">
          {selectedSession ? (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{selectedSession.training_name.topic}</h3>
                      <p className="text-sm text-gray-600">{selectedSession.training_category.name}</p>
                      <p className="text-sm text-gray-600">{selectedSession.trainer.name} • {selectedSession.venue.name}</p>
                      <p className="text-sm text-gray-600">{selectedSession.date} • {selectedSession.time}</p>
                    </div>
                    <button
                      onClick={() => handleStartTraining(selectedSession)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4" />
                      <span>Start Training</span>
                    </button>
                  </div>
                  {/* Progress Summary */}
                  <div className="grid grid-cols-3 gap-4">
                    {(() => {
                      const progress = getSessionProgress(selectedSession);
                      return (
                        <>
                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{progress.present}</div>
                            <div className="text-sm text-green-800">Present</div>
                          </div>
                          <div className="bg-red-50 p-3 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">{progress.absent}</div>
                            <div className="text-sm text-red-800">Absent</div>
                          </div>
                          <div className="bg-yellow-50 p-3 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600">{progress.rescheduled}</div>
                            <div className="text-sm text-yellow-800">Rescheduled</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {selectedSession.employees.map((employee) => {
                      const status = getEmployeeStatus(selectedSession.id, employee.id);
                      const editKey = `${selectedSession.id}-${employee.id}`;
                      const isEditing = editingStatuses[editKey];

                      return (
                        <div key={employee.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(status?.status || '')}
                              <div>
                                <h4 className="font-medium text-gray-800">{employee.full_name}</h4>
                                <p className="text-sm text-gray-600">Code: {employee.employee_code}</p>
                              </div>
                            </div>
                            {isEditing ? (
                              <div className="flex items-center space-x-2">
                                <select
                                  value={isEditing.status}
                                  onChange={(e) => updateEditingStatus(selectedSession.id, employee.id, 'status', e.target.value)}
                                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                                >
                                  <option value="">-- Select Attendance --</option>
                                  <option value="present">Present</option>
                                  <option value="absent">Absent</option>
                                  <option value="rescheduled">Rescheduled</option>
                                </select>
                                <button
                                  onClick={() => saveEdit(selectedSession.id, employee.id)}
                                  disabled={!isEditing.status}
                                  className={`text-green-600 hover:text-green-800 ${!isEditing.status ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => cancelEdit(selectedSession.id, employee.id)}
                                  className="text-gray-600 hover:text-gray-800"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(status?.status || '')}`}>
                                  {status?.status || <span className="italic">Set Attendance</span>}
                                </span>
                                <button
                                  onClick={() => startEditing(selectedSession.id, employee.id)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>

                          {isEditing && (
                            <div className="mt-3">
                              <textarea
                                value={isEditing.notes || ''}
                                onChange={(e) => updateEditingStatus(selectedSession.id, employee.id, 'notes', e.target.value)}
                                placeholder="Add notes..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                rows={2}
                              />
                            </div>
                          )}

                          {status?.notes && !isEditing && (
                            <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              {status.notes}
                            </div>
                          )}

                          {/* Rescheduled Card */}
                          {status?.status === 'rescheduled' && !isEditing && (
                            <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <div className="flex items-center mb-2">
                                <Calendar className="w-5 h-5 text-yellow-600 mr-2" />
                                <span className="font-semibold text-yellow-800">Rescheduled</span>
                              </div>
                              <div className="text-sm text-gray-700">
                                <div>
                                  <span className="font-medium">New Date:</span>{' '}
                                  {status.reschedule_date ? <span>{status.reschedule_date}</span> : <span className="italic text-gray-400">Not specified</span>}
                                </div>
                                <div>
                                  <span className="font-medium">New Time:</span>{' '}
                                  {status.reschedule_time ? <span>{status.reschedule_time}</span> : <span className="italic text-gray-400">Not specified</span>}
                                </div>
                                <div>
                                  <span className="font-medium">Reason:</span>{' '}
                                  {status.reschedule_reason ? <span>{status.reschedule_reason}</span> : <span className="italic text-gray-400">Not specified</span>}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Reschedule Form */}
                          {showRescheduleForm === `${selectedSession.id}-${employee.id}` && (
                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <h5 className="font-medium text-yellow-800 mb-3">Reschedule Training</h5>
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
                                  <input
                                    type="date"
                                    value={rescheduleForm.date}
                                    onChange={(e) => setRescheduleForm(prev => ({ ...prev, date: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">New Time</label>
                                  <input
                                    type="time"
                                    value={rescheduleForm.time}
                                    onChange={(e) => setRescheduleForm(prev => ({ ...prev, time: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                  />
                                </div>
                              </div>
                              <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                                <textarea
                                  value={rescheduleForm.reason}
                                  onChange={(e) => setRescheduleForm(prev => ({ ...prev, reason: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                  rows={2}
                                  placeholder="Reason for rescheduling..."
                                />
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleReschedule(selectedSession.id, employee.id)}
                                  className="bg-yellow-600 text-white px-4 py-2 rounded-md text-sm hover:bg-yellow-700"
                                >
                                  Confirm Reschedule
                                </button>
                                <button
                                  onClick={() => setShowRescheduleForm(null)}
                                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-400"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No Training Selected</h3>
              <p className="text-gray-600">Select a training session from the left to manage participant status</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Training;