// src/components/pages/EmployeeHistorySearch/components/ScoresCard.tsx
import React from 'react';
// import { Score } from '../types';
import type { Score } from '../types';

interface ScoresCardProps {
    scores: Score[];
    onDownload: (score: Score) => void;
    downloadingId: string | null;
}

const ScoresCard: React.FC<ScoresCardProps> = ({ scores, onDownload, downloadingId }) => {
    const isPassed = (score: Score) => typeof score.passed === 'boolean' ? score.passed : score.passed?.toLowerCase() === 'pass';

    return (
        <div className='bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-purple-100 hover:shadow-3xl transition-shadow duration-300 h-[450px] flex flex-col'>
            <div className='flex items-center mb-6'>
                <div className='bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-2xl mr-4 shadow-lg'>
                    <svg className='w-7 h-7 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>
                </div>
                <h2 className='text-2xl font-bold text-gray-800'>Scores & Assessments</h2>
            </div>
            <div className='flex-1 overflow-y-auto hide-scrollbar'>
                {scores.length > 0 ? (
                    <div className='space-y-4'>
                        {scores.map((score) => (
                            <div key={score.id} className='bg-gradient-to-r from-yellow-50 to-orange-50 p-5 rounded-2xl border-l-4 border-yellow-500 hover:shadow-lg transition-all duration-200'>
                                <h3 className='font-bold text-lg text-gray-800 mb-3'>{score.test_name || "Assessment"}</h3>
                                <div className='flex justify-between text-base mb-2'><span className='text-gray-600 font-medium'>Score:</span><span className='font-bold text-purple-600'>{score.marks} ({score.percentage.toFixed(1)}%)</span></div>
                                <div className='flex justify-between text-base mb-2'><span className='text-gray-600 font-medium'>Date:</span><span className='font-semibold'>{new Date(score.created_at).toLocaleDateString()}</span></div>
                                <div className='flex justify-between text-base mb-2'><span className='text-gray-600 font-medium'>Result:</span><span className={`font-bold text-lg ${isPassed(score) ? "text-green-600" : "text-red-600"}`}>{isPassed(score) ? "PASS" : "FAIL"}</span></div>
                                {isPassed(score) && (
                                    <div className='mt-4 text-right'>
                                        {/* <button
                                            onClick={() => onDownload(score)}
                                            disabled={downloadingId === `score-${score.id}`}
                                            className='inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-semibold rounded-xl shadow-md text-white bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 focus:outline-none focus:ring-4 focus:ring-yellow-300 disabled:bg-gray-400 transform transition-all duration-200 hover:scale-105'
                                        >
                                            {downloadingId === `score-${score.id}` ? (
                                                <>
                                                    <svg className='animate-spin -ml-0.5 mr-2 h-4 w-4 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'><circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle><path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path></svg>
                                                    Generating...
                                                </>
                                            ) : ( 'Download Certificate' )}
                                        </button> */}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className='flex items-center justify-center h-full text-gray-500 text-lg'>No assessment scores available</div>
                )}
            </div>
        </div>
    );
};

export default ScoresCard;