// src/components/pages/EmployeeHistorySearch/components/ExamResultsCard.tsx
import React from 'react';
// import { ExamResult } from '../types';
import type { ExamResult } from '../types';

interface ExamResultsCardProps {
    results: ExamResult[];
    onDownload: (result: ExamResult) => void;
    downloadingId: string | null;
}

const ExamResultsCard: React.FC<ExamResultsCardProps> = ({ results, onDownload, downloadingId }) => {
    return (
        <div className='bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-purple-100 hover:shadow-3xl transition-shadow duration-300 h-[450px] flex flex-col'>
            <div className='flex items-center mb-6'>
                <div className='bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-2xl mr-4 shadow-lg'>
                    <svg className='w-7 h-7 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' /></svg>
                </div>
                <h2 className='text-2xl font-bold text-gray-800'>Hanchou & Shokuchou Exam Results</h2>
            </div>
            <div className='flex-1 overflow-y-auto hide-scrollbar'>
                {results.length > 0 ? (
                    <div className='space-y-4'>
                        {results.map((result) => (
                            <div key={`${result.type}-${result.id}`} className='bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-2xl border-l-4 border-indigo-500 hover:shadow-lg transition-all duration-200'>
                                <div className='flex items-center justify-between mb-3'>
                                    <h3 className='font-bold text-lg text-gray-800'>{result.exam_name}</h3>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${result.type === 'hanchou' ? 'bg-indigo-100 text-indigo-800' : 'bg-purple-100 text-purple-800'}`}>{result.type.toUpperCase()}</span>
                                </div>
                                <div className='flex justify-between text-base mb-2'><span className='text-gray-600 font-medium'>Score:</span><span className='font-bold text-purple-600'>{result.score} / {result.total_questions} ({result.percentage.toFixed(1)}%)</span></div>
                                <div className='flex justify-between text-base mb-2'><span className='text-gray-600 font-medium'>Date:</span><span className='font-semibold'>{new Date(result.submitted_at).toLocaleDateString()}</span></div>
                                <div className='flex justify-between text-base mb-2'><span className='text-gray-600 font-medium'>Result:</span><span className={`font-bold text-lg ${result.passed ? "text-green-600" : "text-red-600"}`}>{result.passed ? "PASS" : "FAIL"}</span></div>
                                {result.passed && (
                                    <div className='mt-4 text-right'>
                                        {/* <button
                                            onClick={() => onDownload(result)}
                                            disabled={downloadingId === `${result.type}-${result.id}`}
                                            className='inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-semibold rounded-xl shadow-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:bg-gray-400 transform transition-all duration-200 hover:scale-105'
                                        >
                                            {downloadingId === `${result.type}-${result.id}` ? (
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
                    <div className='flex items-center justify-center h-full text-gray-500 text-lg'>No Hanchou or Shokuchou exam results found</div>
                )}
            </div>
        </div>
    );
};

export default ExamResultsCard;