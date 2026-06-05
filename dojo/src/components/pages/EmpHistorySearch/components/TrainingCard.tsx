// src/components/pages/EmployeeHistorySearch/components/TrainingCard.tsx
import React from 'react';
// import { ScheduledTraining } from '../types';
import type { ScheduledTraining } from '../types';

interface TrainingCardProps {
    trainings: ScheduledTraining[];
}

const TrainingCard: React.FC<TrainingCardProps> = ({ trainings }) => {
    const statusStyles: { [key: string]: string } = {
        scheduled: 'bg-blue-100 text-blue-800 border-blue-300',
        completed: 'bg-green-100 text-green-800 border-green-300',
        cancelled: 'bg-red-100 text-red-800 border-red-300',
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    };

    return (
        <div className='bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-purple-100 hover:shadow-3xl transition-shadow duration-300 h-[450px] flex flex-col'>
            <div className='flex items-center mb-6'>
                <div className='bg-gradient-to-r from-red-500 to-pink-500 p-3 rounded-2xl mr-4 shadow-lg'>
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h2 className='text-2xl font-bold text-gray-800'>Scheduled Trainings</h2>
            </div>
            <div className='flex-1 overflow-y-auto hide-scrollbar'>
                {trainings.length > 0 ? (
                    <div className='space-y-5'>
                        {trainings.map((training) => (
                            <div key={training.id} className='bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-2xl border-l-4 border-red-500 hover:shadow-lg transition-all duration-200'>
                                <h3 className='font-bold text-xl text-gray-800 mb-4'>{training.topic}</h3>
                                <div className='space-y-3 text-base'>
                                    <div className='flex justify-between items-center'><span className='text-gray-600 font-medium'>Category:</span><span className='font-semibold text-purple-700 bg-purple-100 px-3 py-1 rounded-full text-sm'>{training.category_name}</span></div>
                                    <div className='flex justify-between items-center'><span className='text-gray-600 font-medium'>Venue:</span><span className='font-semibold text-gray-800 text-right'>{training.venue_name || 'N/A'}</span></div>
                                    <div className='flex justify-between items-center'><span className='text-gray-600 font-medium'>Date:</span><span className='font-semibold text-gray-800'>{new Date(training.date).toLocaleDateString()}</span></div>
                                    <div className='flex justify-between items-center'><span className='text-gray-600 font-medium'>Status:</span><span className={`px-3 py-1.5 text-sm font-bold rounded-full capitalize border-2 ${statusStyles[training.status.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>{training.status}</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className='flex items-center justify-center h-full text-gray-500 text-lg'>No trainings scheduled</div>
                )}
            </div>
        </div>
    );
};

export default TrainingCard;