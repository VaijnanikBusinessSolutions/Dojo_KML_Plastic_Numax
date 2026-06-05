// src/components/pages/EmployeeHistorySearch/components/OperatorSkillsCard.tsx
import React from 'react';
// import { OperatorSkill } from '../types';
import type { OperatorSkill } from '../types';

interface OperatorSkillsCardProps {
    skills: OperatorSkill[];
    onDownload: (skill: OperatorSkill) => void;
    downloadingId: string | null;
}

const OperatorSkillsCard: React.FC<OperatorSkillsCardProps> = ({ skills, onDownload, downloadingId }) => {
    return (
        <div className='bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-purple-100 hover:shadow-3xl transition-shadow duration-300 h-[450px] flex flex-col'>
            <div className='flex items-center mb-6'>
                <div className='bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-2xl mr-4 shadow-lg'>
                    <svg className='w-7 h-7 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' />
                    </svg>
                </div>
                <h2 className='text-2xl font-bold text-gray-800'>Operator Skills</h2>
            </div>
            <div className='flex-1 overflow-y-auto hide-scrollbar'>
                {skills.length > 0 ? (
                    <div className='space-y-4'>
                        {skills.map((skill) => (
                            <div key={skill.id} className='bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-2xl border-l-4 border-green-500 hover:shadow-lg transition-all duration-200'>
                                <h3 className='font-bold text-lg text-gray-800 mb-2'>{skill.station_name || "General Skill"}</h3>
                                <div className='flex justify-between text-base mb-1'>
                                    <span className='text-gray-600 font-medium'>Level:</span>
                                    <span className='font-bold text-purple-600'>{skill.level_name}</span>
                                </div>
                                <div className='mt-4 text-right'>
                                    {/* <button
                                        onClick={() => onDownload(skill)}
                                        disabled={downloadingId === `skill-${skill.id}`}
                                        className='inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-semibold rounded-xl shadow-md text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:bg-gray-400 transform transition-all duration-200 hover:scale-105'
                                    >
                                        {downloadingId === `skill-${skill.id}` ? (
                                            <>
                                                <svg className='animate-spin -ml-0.5 mr-2 h-4 w-4 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'><circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle><path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path></svg>
                                                Generating...
                                            </>
                                        ) : (
                                            'Download Certificate'
                                        )}
                                    </button> */}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className='flex items-center justify-center h-full text-gray-500 text-lg'>No operator skills recorded</div>
                )}
            </div>
        </div>
    );
};

export default OperatorSkillsCard;