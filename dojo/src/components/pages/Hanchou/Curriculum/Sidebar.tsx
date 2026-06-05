
// src/Curriculum/Sidebar.tsx
import React from 'react';
// Import the type definition from App.tsx for consistency
// import { ActiveModule } from '../hanchou';
import type { ActiveModule } from '../hanchou';

// --- Define the props for the Sidebar component ---
type SidebarProps = {
  activeModule: ActiveModule;
  setActiveModule: React.Dispatch<React.SetStateAction<ActiveModule>>;
};

const navigation = [
  // { name: 'Dashboard', module: 'dashboard' },
  { name: 'Han Curriculum', module: 'curriculum' },
  { name: 'MCQ Exam', module: 'exam' },
  { name: 'Add Question', module: 'AddQuestion' },
  { name: 'Results', module: 'results' },
];

const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule }) => {
  return (
    <aside className="fixed top-15 left-0 w-80 h-screen bg-gradient-to-b from-gray-50 to-white shadow-lg z-40 overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Hanchou Menu
        </h1>
      </div>

      <nav className="mt-6 px-4 pb-24">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <button
                // Ensure the module being set matches the ActiveModule type
                onClick={() => setActiveModule(item.module as ActiveModule)}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all duration-200 hover:shadow-sm group
                ${
                  activeModule === item.module
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span
                  className={`text-sm font-medium tracking-wide group-hover:font-semibold ${
                    activeModule === item.module ? 'text-white' : ''
                  }`}
                >
                  {item.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;