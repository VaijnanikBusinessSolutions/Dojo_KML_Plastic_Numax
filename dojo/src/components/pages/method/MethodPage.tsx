
import React, { useState } from 'react';
import StationRequirementPage from './StationRequirementPage';
import ManagementSettings from './ManagementSettings';
import MasterTableSettings from './MasterTableSettings';
import OJTSettingsPanel from '../../molecules/OJTSettingsPanel/OJTSettingsPanel';
import AttendanceSystem from './AttendanceSystem'
import Level1Settings from '../Level1/Level1Settings/Level1method';
import StationSettings from '../../molecules/stationsetting/stationsetting';
import StationConfiguration from '../../molecules/StationConfiguration/StationConfiguration';
import StationManagementPage from './StationManagementPage';
import GeneralSettingsMethod from './GeneralSettings';
import Level0Settings from '../../molecules/Level0Settings/Level0Settings';
import AdvanceSettings from './AdvanceSettings';
import EvaluationPassingCriteria from './EvaluationPassingCriteria';
import OJTAssessmentToggle from './OJTSwitch';
import SkillMatrixSettings from './SkillMatrixSettings';
import RoleManagement from './RoleManagement';
import TenCyclePage from '../TenCycle/TenCycleMethodPage';
import Levels from './Levelsetting';



const tabs = [
  { key: 'management-settings', label: 'Management Review Dashboard Settings', icon: '👔' },
  { key: 'Advance-Settings', label: 'Manpower Dashboard Settings', icon: '👥' },
  { key: 'General-Settings', label: 'General Settings', icon: '🌐' },
  { key: 'Level0-Settings', label: 'Level 0 Settings', icon: '0️⃣' },
  { key: 'Level1-settings', label: 'Level 1 Settings', icon: '1️⃣' },
  { key: 'SkillMatrix-settings', label: 'Skill Matrix Settings', icon: '🎯' },
  { key: 'master-table-settings', label: 'Master Table Settings', icon: '📊' },
  { key: 'OJT-Settings', label: 'OJT Settings', icon: '🎓' },
  { key: 'AttendanceSystem', label: 'Attendance System', icon: '⏰' },
  { key: 'evaluation-passing-criteria', label: 'Passing Criteria', icon: '📈' },
  { key: 'Station-Management-Page', label: 'Station Management', icon: '🏭' },
  // { key: 'OJT-Switch', label: 'OJT Switch', icon: '🔀' },
  { key: 'RoleManagement', label: 'Role Management', icon: '👤' },
  { key: 'ten-cycle-method', label: '10 Cycle Settings', icon: '🔟'},
  // { key: 'Level-Settings', label: 'Level  Settings', icon: '🏷️'},



];

const MethodPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(tabs[0].key);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className=" mx-auto relative z-10">
        {/* Enhanced Header Section */}
        <div className="mb-10">
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">⚙️</span>
              </div>

            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
                Method Settings
              </h1>
              <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2"></div>
            </div>
          </div>
          <p className="text-slate-600 text-lg font-medium ml-16 opacity-80">
            Configure and manage various system settings with advanced controls
          </p>
        </div>

        {/* Main Content Card with Glass Morphism */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden relative">
          {/* Decorative top border */}
          <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          {/* Enhanced Tab Navigation */}
          <div className="bg-gradient-to-r from-white/90 via-slate-50/90 to-white/90 backdrop-blur-sm px-4 py-6 border-b border-slate-200/50">
            <div className="flex flex-wrap gap-2">
              {tabs.map((t, index) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`group px-6 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-500 ease-out transform hover:scale-105 hover:-translate-y-1 relative overflow-hidden shadow-lg ${activeTab === t.key
                    ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white shadow-2xl shadow-blue-500/30'
                    : 'bg-white/70 text-slate-700 hover:text-blue-700 hover:bg-white hover:shadow-xl border border-slate-200/50 hover:border-blue-300/50'
                    }`}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  {/* Animated background for active tab */}
                  {activeTab === t.key && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 opacity-20 animate-pulse"></div>
                      <div className="absolute inset-0 bg-white/10 animate-ping"></div>
                    </>
                  )}

                  {/* Tab content */}
                  <div className="relative z-10 flex items-center space-x-2">
                    <span className={`text-lg transform transition-transform duration-300 ${activeTab === t.key ? 'scale-110' : 'group-hover:scale-110'}`}>
                      {t.icon}
                    </span>
                    <span className="font-bold tracking-wide">{t.label}</span>
                  </div>

                  {/* Hover glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area with Advanced Styling */}
          <div className="p-8 md:p-12 bg-gradient-to-br from-white/50 via-slate-50/30 to-blue-50/40 min-h-[700px] relative">
            {/* Content background pattern */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: `radial-gradient(circle at 25px 25px, #64748b 2px, transparent 0), radial-gradient(circle at 75px 75px, #3b82f6 2px, transparent 0)`,
              backgroundSize: '100px 100px'
            }}></div>



            {/* Content with slide animation */}
            <div className="relative z-10 animate-slide-in">
              {activeTab === 'station-requirement' && <StationRequirementPage />}
              {activeTab === 'management-settings' && <ManagementSettings />}
              {activeTab === 'master-table-settings' && <MasterTableSettings />}
              {activeTab === 'OJT-Settings' && <OJTSettingsPanel />}
              {activeTab === 'AttendanceSystem' && <AttendanceSystem />}
              {activeTab === 'Level1-settings' && <Level1Settings />}
              {activeTab === 'Station-settings' && <StationSettings />}
              {activeTab === 'Station-Configuration' && <StationConfiguration />}
              {activeTab === 'Station-Management-Page' && <StationManagementPage />}
              {activeTab === 'General-Settings' && <GeneralSettingsMethod />}
              {activeTab === 'Level0-Settings' && <Level0Settings />}
              {activeTab === 'Advance-Settings' && <AdvanceSettings />}
              {activeTab === 'OJT-Switch' && <OJTAssessmentToggle />}
              {activeTab === 'SkillMatrix-settings' && <SkillMatrixSettings />}
              {activeTab === 'evaluation-passing-criteria' && <EvaluationPassingCriteria />}
              {activeTab === 'RoleManagement' && <RoleManagement />}
              {activeTab === 'ten-cycle-method' && <TenCyclePage />}
              {/* {activeTab === 'Level-Settings' && <Levels/>} */}
            </div>
          </div>
        </div>


      </div>

      <style>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(30px) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #2563eb, #7c3aed);
        }
      `}</style>
    </div>
  );
};

export default MethodPage;