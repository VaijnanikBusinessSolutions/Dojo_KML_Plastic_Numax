import { useState } from "react";
import Level2Component from "./Level2component/Level2component";
import Level1Component from "./Level1Component/Level1Component";
import Level3Component from "./Level3Component/Level3Component";
import Level4Component from "./Level4Component/Level4Component";

const tabs = [
  { name: "L1", component: <Level1Component /> },
  { name: "L2", component: <Level2Component /> },
  { name: "L3", component: <Level3Component/> },
  { name: "L4", component: <Level4Component/> },
];

const DojoDetail = () => {
  const [activeTab, setActiveTab] = useState("L1");

  const currentTab = tabs.find((tab) => tab.name === activeTab);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 ">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent pb-4">
              Dojo Training Levels
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Master your skills through progressive training levels designed for continuous improvement
            </p>
          </div>

          {/* Enhanced Tabs Container */}
          <div className="relative mb-8">
            {/* Background blur effect */}
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl"></div>
            
            {/* Tabs */}
            <div className="relative flex p-2 bg-gradient-to-r from-white/90 to-gray-50/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20">
              {tabs.map((tab, index) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`
                    group relative flex-1 px-8 py-4 font-semibold text-lg transition-all duration-300 ease-out
                    rounded-xl transform hover:scale-105 active:scale-95
                    ${activeTab === tab.name
                      ? "text-white shadow-lg shadow-blue-500/25 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700"
                      : "text-gray-600 hover:text-gray-800 bg-white/50 hover:bg-white/80 shadow-sm hover:shadow-md border border-gray-200/50 hover:border-gray-300/50"}
                  `}
                >
                  {/* Active tab glow effect */}
                  {activeTab === tab.name && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-xl"></div>
                  )}
                  
                  {/* Tab content */}
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <span className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      activeTab === tab.name 
                        ? "bg-white shadow-lg" 
                        : "bg-gray-400 group-hover:bg-gray-600"
                    }`}></span>
                    {tab.name}
                  </span>
                  
                  {/* Tab indicator */}
                  {activeTab === tab.name && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full shadow-lg"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="relative">
            {/* Content background with glassmorphism */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-gray-50/60 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30"></div>
            
            {/* Content */}
            <div className="relative p-8 rounded-3xl min-h-[500px] overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-indigo-400/10 to-pink-400/10 rounded-full blur-2xl"></div>
              
              {/* Content wrapper with smooth transitions */}
              <div className="relative z-10 transform transition-all duration-500 ease-out">
                {currentTab?.component || (
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-3xl text-gray-500">?</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">No Content Available</h3>
                      <p className="text-gray-600">No content found for level {activeTab}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mt-8 flex justify-center">
            <div className="flex gap-2">
              {tabs.map((tab, index) => (
                <div
                  key={tab.name}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    activeTab === tab.name
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/50"
                      : "bg-gray-300"
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DojoDetail;