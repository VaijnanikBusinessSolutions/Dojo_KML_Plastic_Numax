// src/Curriculum/ShoSidebar.tsx
import React from 'react';

// 1. IMPORT the ActiveModule type from the App.tsx file
//    (Adjust the relative path '../App' if your file structure is different)
// import { ActiveModule } from '../Shokuchou';
import type { ActiveModule } from '../Shokuchou';

// 2. Define the props for this component for type safety
type ShoSidebarProps = {
  activeModule: ActiveModule;
  setActiveModule: React.Dispatch<React.SetStateAction<ActiveModule>>;
};

const navigation = [
  { name: 'Shokuchou Curriculum', module: 'curriculum' },
  { name: 'MCQ Exam', module: 'exam' },
  { name: 'Add Question', module: 'AddQuestion' },
  { name: 'Results', module: 'results' },
];

const ShoSidebar: React.FC<ShoSidebarProps> = ({ activeModule, setActiveModule }) => {
  return (
    <aside className="sticky top-10 left-0 w-80 h-screen bg-gradient-to-b from-gray-50 to-white shadow-lg z-40 overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Shokuchou Menu</h1>
      </div>
      <nav className="mt-6 px-4 pb-24">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => setActiveModule(item.module as ActiveModule)}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all duration-200 hover:shadow-sm group
                ${
                  activeModule === item.module
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default ShoSidebar;
