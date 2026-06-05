// import React from 'react';
// import { Calendar, Bell, BookOpen, Users, BarChart3, Clock } from 'lucide-react';

// interface SidebarProps {
//   activeModule: string;
//   setActiveModule: (module: string) => void;
// }

// const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule }) => {
//   const menuItems = [
//     { id: 'scheduling', name: 'Scheduling', icon: Clock },
//     { id: 'calendar', name: 'Calendar Overview', icon: Calendar },
//     { id: 'notification', name: 'Notification', icon: Bell },
//     { id: 'training', name: 'Training', icon: Users },
//     { id: 'curriculum', name: 'Curriculum', icon: BookOpen },
//     { id: 'status', name: 'Status', icon: BarChart3 },
//   ];

//   return (
//     <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-gray-200">
//       <div className="p-6 border-b border-gray-200">
//         <h1 className="text-2xl font-bold text-gray-800">Training Module</h1>
//       </div>
      
//       <nav className="p-4 space-y-2">
//         {menuItems.map((item) => {
//           const Icon = item.icon;
//           return (
//             <button
//               key={item.id}
//               onClick={() => setActiveModule(item.id)}
//               className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
//                 activeModule === item.id
//                   ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
//                   : 'text-gray-600 hover:bg-gray-50'
//               }`}
//             >
//               <Icon className="w-5 h-5" />
//               <span className="font-medium">{item.name}</span>
//             </button>
//           );
//         })}
//       </nav>
//     </div>
//   );
// };

// export default Sidebar;


import React from 'react';
import { Calendar, Bell, BookOpen, Users, BarChart3, Clock } from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule }) => {
  const menuItems = [
    { id: 'scheduling', name: 'Scheduling', icon: Clock },
    { id: 'calendar', name: 'Calendar Overview', icon: Calendar },
    { id: 'notification', name: 'Notification', icon: Bell },
    { id: 'training', name: 'Training', icon: Users },
    { id: 'curriculum', name: 'Curriculum', icon: BookOpen },
    { id: 'status', name: 'Status', icon: BarChart3 },
  ];

  return (
    /* 
     * KEY CHANGE:
     * - Removed: `fixed left-0 top-0`
     * - Added: `sticky top-0 h-screen`
     * `sticky` keeps the sidebar in the normal document flow, preventing overlap.
     * `h-screen` ensures it takes up the full screen height within its flex container.
     */
    <div className="sticky top-0 h-screen w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">Training Module</h1>
      </div>
      
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeModule === item.id
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;


