// src/components/pages/EmployeeHistorySearch/components/AttendanceCard.tsx
import React from 'react';
import type { Attendance } from '../types';

interface RescheduledSession {
  id: number;
  batch_id: string;
  original_day_number: number;
  original_date: string;
  rescheduled_date: string;
  rescheduled_time?: string;
  attendance_status: 'present' | 'absent';
}

interface AttendanceCardProps {
  attendanceByBatch: Record<string, Attendance[]>;
  rescheduledSessions?: RescheduledSession[];
}

const AttendanceCard: React.FC<AttendanceCardProps> = ({
  attendanceByBatch,
  rescheduledSessions = [],
}) => {
  return (
    <div className='bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-purple-100 hover:shadow-3xl transition-shadow duration-300 h-[520px] flex flex-col'>
      {/* Header */}
      <div className='flex items-center mb-6'>
        <div className='bg-gradient-to-r from-cyan-500 to-blue-500 p-3 rounded-2xl mr-4 shadow-lg'>
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className='text-2xl font-bold text-gray-800'>Attendance Record</h2>
      </div>

      <div className='flex-1 overflow-y-auto hide-scrollbar space-y-10'>
        {Object.keys(attendanceByBatch).length === 0 ? (
          <div className='flex items-center justify-center h-full text-gray-500 text-lg'>
            No attendance records found
          </div>
        ) : (
          Object.entries(attendanceByBatch).map(([batchId, records]) => {
            const batchRescheduled = rescheduledSessions
              .filter(s => s.batch_id === batchId)
              .sort((a, b) => a.original_day_number - b.original_day_number);

            // Count based on ORIGINAL attendance only
            const presentCount = records.filter(r => r.status === 'present').length;
            const absentCount = records.length - presentCount;

            return (
              <div key={batchId} className="space-y-10">

                {/* ORIGINAL ATTENDANCE — Show real status (Day 1 = Absent → Red Cross) */}
                <div>
                  <h4 className="font-bold text-lg text-gray-700 mb-3">Batch: {batchId}</h4>
                  <div className="overflow-hidden rounded-2xl border-2 border-purple-200 shadow-lg">
                    <div className="grid" style={{ gridTemplateColumns: `repeat(${records.length}, minmax(0, 1fr))` }}>
                      {records.map(record => (
                        <div
                          key={record.id}
                          className="bg-gradient-to-b from-purple-600 to-blue-600 text-white text-center p-3 border-r border-purple-500 last:border-r-0"
                        >
                          <div className="font-bold text-base">Day {record.day_number}</div>
                          <div className="text-xs text-purple-100 mt-1">
                            {new Date(record.attendance_date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        </div>
                      ))}

                      {/* Show ORIGINAL status only — no recovery logic */}
                      {records.map(record => (
                        <div
                          key={record.id}
                          className={`flex items-center justify-center p-4 border-t-2 border-r border-purple-200 last:border-r-0 ${
                            record.status === 'present' ? 'bg-green-50' : 'bg-red-50'
                          }`}
                        >
                          {record.status === 'present' ? (
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Present / Absent Count — Based on original only */}
              
                </div>

                {/* RESCHEDULED SESSIONS — Same Style, Shows Recovery */}
                {batchRescheduled.length > 0 && (
                  <div>
                    <h4 className="font-bold text-lg text-amber-800 mb-3 flex items-center gap-">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Rescheduled Sessions
                    </h4>

                    <div className="overflow-hidden rounded-2xl border-2 border-amber-300 shadow-lg">
                      <div className="grid" style={{ gridTemplateColumns: `repeat(${batchRescheduled.length}, minmax(0, 1fr))` }}>
                        {/* Original Day + Date */}
                        {batchRescheduled.map(s => (
                          <div
                            key={s.id}
                            className="bg-gradient-to-b from-amber-600 to-orange-600 text-white text-center p-3 border-r border-amber-500 last:border-r-0"
                          >
                            <div className="font-bold text-base">Day {s.original_day_number}</div>
                            <div className="text-xs text-amber-100 mt-1">
                              {/* {new Date(s.original_date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })} */}
                               <div className="text-xs text-amber-900 font-medium leading-tight">
                              {new Date(s.rescheduled_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                        
                            </div>
                            </div>
                          </div>
                        ))}

                        {/* Rescheduled Date + Time + Green Check */}
                        {batchRescheduled.map(s => (
                          <div
                            key={s.id}
                            className="flex flex-col items-center justify-center p-4  border-r border-amber-200 last:border-r-0 bg-green-50"
                          >
                          
                            <svg className="w-6 h-6 text-green-600 mt-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AttendanceCard;