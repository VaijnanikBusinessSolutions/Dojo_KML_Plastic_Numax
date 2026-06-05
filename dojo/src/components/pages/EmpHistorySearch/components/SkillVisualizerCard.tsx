// src/components/pages/EmployeeHistorySearch/components/SkillVisualizerCard.tsx
import React, { useState, useEffect } from "react";
// import { OperatorSkill } from "../types";
import type { OperatorSkill } from "../types";
import SkillGauge from "./SkillGauge";

interface SkillVisualizerCardProps { skills: OperatorSkill[]; }

const getSkillLevelDetails = (levelString?: string) => {
    if (!levelString) return { numeric: 0 };
    const match = levelString.match(/\d+/);
    return { numeric: match ? parseInt(match[0], 10) : 0 };
};

const SkillVisualizerCard: React.FC<SkillVisualizerCardProps> = ({ skills }) => {
    const [selectedSkill, setSelectedSkill] = useState<OperatorSkill | null>(null);

    useEffect(() => {
        setSelectedSkill(skills.length > 0 ? skills[0] : null);
    }, [skills]);
    
    const handleSkillChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const skillId = parseInt(e.target.value, 10);
        setSelectedSkill(skills.find((s) => s.id === skillId) || null);
    };

    const currentSkillDetails = getSkillLevelDetails(selectedSkill?.level_name);

    return (
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-purple-100 hover:shadow-3xl transition-shadow duration-300 h-[450px] flex flex-col">
            <div className="flex justify-between items-start gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-2xl shadow-lg flex-shrink-0">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Skill Level Visualizer</h2>
                </div>
                {skills.length > 0 && selectedSkill && (
                    <select
                        id="skill-selector"
                        value={selectedSkill.id}
                        onChange={handleSkillChange}
                        className="px-4 py-2.5 bg-purple-50 border-2 border-purple-200 rounded-xl shadow-md text-base font-medium text-purple-700 focus:ring-4 focus:ring-purple-300 focus:border-transparent max-w-xs transition-all duration-200"
                    >
                        {skills.map((skill) => <option key={skill.id} value={skill.id}>{skill.station_name}</option>)}
                    </select>
                )}
            </div>
            <div className="flex-grow">
                {skills.length > 0 ? (
                    <SkillGauge level={currentSkillDetails.numeric} />
                 ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 text-lg">No skills available to visualize</div>
                 )}
            </div>
        </div>
    );
};

export default SkillVisualizerCard;