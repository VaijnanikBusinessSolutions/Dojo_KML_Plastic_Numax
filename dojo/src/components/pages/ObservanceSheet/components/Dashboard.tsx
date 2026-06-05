// import React, { useState, useEffect } from 'react';
// import { Users, Calendar, FileText, BarChart3 } from 'lucide-react';
// import AnnualPlanForm from './AnnualPlanForm';
// import AnnualPlanTable from './AnnualPlanTable';
// import ObservationSheet from './ObservationSheet'; // Assuming this is your 10-cycle form
// import CalendarView from './CalenderView'; 
// import { annualPlanApi } from '../lib/api';
// import type { AnnualPlan } from '../types'; // Make sure this type is defined

// type View = 'dashboard' | 'plan_form' | 'view_plans' | 'observation_sheet' | 'calendar_view';

// interface DashboardStats {
//   total: number;
//   completed: number;
//   pending: number;
// }


// export default function Dashboard() {
//   const [currentView, setCurrentView] = useState<View>('dashboard');
  
//   // --- CHANGE 1: Store the entire selected plan object ---
//   const [selectedPlan, setSelectedPlan] = useState<AnnualPlan | null>(null);
  
//   const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
//   const [stats, setStats] = useState<DashboardStats>({ total: 0, completed: 0, pending: 0 });
//   const [statsLoading, setStatsLoading] = useState(true);

//   useEffect(() => {
//     if (currentView === 'dashboard') {
//       const fetchStats = async () => {
//         try {
//           setStatsLoading(true);
//           const data = await annualPlanApi.getStats(); 
//           setStats(data);
//         } catch (error) {
//           console.error("Failed to fetch dashboard stats:", error);
//         } finally {
//           setStatsLoading(false);
//         }
//       };
//       fetchStats();
//     }
//   }, [currentView]);

//   const handleCreatePlanClick = () => {
//     setEditingPlanId(null);
//     setCurrentView('plan_form');
//   };
  
//   const handleEditClick = (planId: string) => {
//     setEditingPlanId(planId);
//     setCurrentView('plan_form');
//   };

//   // --- CHANGE 2: The handler now accepts the full 'plan' object ---
//   const handleObservationClick = (plan: AnnualPlan) => {
//     console.log("Plan selected for observation:", plan);
//     setSelectedPlan(plan); // Store the entire object in state
//     setCurrentView('observation_sheet');
//   };

//   const handleFormCompletion = () => {
//     setCurrentView('view_plans');
//   };

//   const handleObservationComplete = () => {
//     setCurrentView('view_plans');
//   };
  
//   const handleBackToDashboard = () => {
//     setCurrentView('dashboard');
//   };

  

//   // --- RENDER LOGIC ---

//   if (currentView === 'plan_form') {
//     return <AnnualPlanForm onBack={handleFormCompletion} planId={editingPlanId} />;
//   }
  
//   if (currentView === 'view_plans') {
//     return (
//       <AnnualPlanTable 
//         onBack={handleBackToDashboard} 
//         // This now correctly passes the full plan object to our handler
//         onObservationClick={handleObservationClick}
//         onEditClick={handleEditClick}
//       />
//     );
//   }
  
//   // --- CHANGE 3: Update the rendering logic for ObservationSheet ---
//   if (currentView === 'observation_sheet' && selectedPlan) {
//     return (
//       <ObservationSheet 
//         // Pass the full plan object as a prop
//         planData={selectedPlan} 
//         onBack={() => setCurrentView('view_plans')} 
//         onComplete={handleObservationComplete} 
//       />
//     );
//   }

//   if (currentView === 'calendar_view') {
//     return <CalendarView onBack={handleBackToDashboard} />;
//   }
  
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <header className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//           <h1 className="text-3xl font-bold text-gray-900">
//             Operator Observation System
//           </h1>
//           <p className="text-gray-600 mt-2">Annual Planning and Observation Management</p>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           <div
//             onClick={handleCreatePlanClick}
//             className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer group"
//           >
//             <div className="flex items-center space-x-4">
//               <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
//                 <Calendar className="h-6 w-6 text-blue-600" />
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900">Create Plan</h3>
//                 <p className="text-sm text-gray-600">New annual plan</p>
//               </div>
//             </div>
//           </div>

//           <div
//             onClick={() => setCurrentView('view_plans')}
//             className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer group"
//           >
//             <div className="flex items-center space-x-4">
//               <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
//                 <FileText className="h-6 w-6 text-green-600" />
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900">View Plans</h3>
//                 <p className="text-sm text-gray-600">Manage existing plans</p>
//               </div>
//             </div>
//           </div>

//           {/* --- THIS IS THE MODIFIED CARD --- */}
//           <div
//             onClick={() => setCurrentView('calendar_view')}
//             className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer group"
//           >
//             <div className="flex items-center space-x-4">
//               <div className="bg-orange-100 p-3 rounded-lg group-hover:bg-orange-200 transition-colors">
//                 <Calendar className="h-6 w-6 text-orange-600" />
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900">Calendar View</h3>
//                 <p className="text-sm text-gray-600">Visualize monthly plans</p>
//               </div>
//             </div>
//           </div>
//           {/* --- END OF MODIFIED CARD --- */}

//           <div className="bg-white p-6 rounded-xl shadow-sm border cursor-pointer group hover:shadow-md">
//             <div className="flex items-center space-x-4">
//               <div className="bg-purple-100 p-3 rounded-lg">
//                 <BarChart3 className="h-6 w-6 text-purple-600" />
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
//                 <p className="text-sm text-gray-600">View analytics</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm border p-6">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Overview</h2>
//           {statsLoading ? (
//              <div className="text-center py-4 text-gray-500">Loading stats...</div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div className="text-center">
//                 <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
//                 <div className="text-sm text-gray-600">Total Plans</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
//                 <div className="text-sm text-gray-600">Completed</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-3xl font-bold text-orange-600">{stats.pending}</div>
//                 <div className="text-sm text-gray-600">Pending</div>
//               </div>
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }


import React, { useState, useEffect } from 'react';
import { Users, Calendar, FileText, BarChart3 } from 'lucide-react';
import AnnualPlanForm from './AnnualPlanForm';
import AnnualPlanTable from './AnnualPlanTable';
import ObservationSheet from './ObservationSheet';
import CalendarView from './CalenderView';
import { annualPlanApi } from '../lib/api';
import type { AnnualPlan } from '../types';

// +++ ADDED +++
import axios from 'axios';
import TenCycleSheetTable from './TenCycleSheetTable';

// Add your API URL here
const API_BASE_URL = "http://172.25.0.51:8000";

// --- MODIFIED ---
type View = 'dashboard' | 'plan_form' | 'view_plans' | 'observation_sheet' | 'calendar_view' | 'reports';

interface DashboardStats {
  total: number;
  completed: number;
  pending: number;
}

export default function Dashboard() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedPlan, setSelectedPlan] = useState<AnnualPlan | null>(null);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  // +++ NEW STATE FOR REPORTS VIEW +++
  const [allSheets, setAllSheets] = useState<TenCycleSheet[]>([]);
  const [sheetsLoading, setSheetsLoading] = useState(true);
  const [sheetsError, setSheetsError] = useState<string | null>(null);
  const [editingSheetId, setEditingSheetId] = useState<number | null>(null);

  const [stats, setStats] = useState<DashboardStats>({ total: 0, completed: 0, pending: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (currentView === 'dashboard') {
      const fetchStats = async () => {
        try {
          setStatsLoading(true);
          const data = await annualPlanApi.getStats();
          setStats(data);
        } catch (error) {
          console.error("Failed to fetch dashboard stats:", error);
        } finally {
          setStatsLoading(false);
        }
      };
      fetchStats();
    }
  }, [currentView]);

  // +++ NEW useEffect TO FETCH DATA FOR REPORTS VIEW +++
  useEffect(() => {
    if (currentView === 'reports') {
      const fetchAllSheets = async () => {
        setSheetsLoading(true);
        setSheetsError(null);
        try {
          const response = await axios.get<TenCycleSheet[]>(`${API_BASE_URL}/ten-cycle-sheets/`);
          setAllSheets(response.data);
        } catch (error) {
          console.error("Failed to fetch sheet history:", error);
          setSheetsError("Could not load observation history. Please try again.");
        } finally {
          setSheetsLoading(false);
        }
      };
      fetchAllSheets();
    }
  }, [currentView]);

  const handleCreatePlanClick = () => {
    setEditingPlanId(null);
    setCurrentView('plan_form');
  };

  const handleEditClick = (planId: string) => {
    setEditingPlanId(planId);
    setCurrentView('plan_form');
  };

  const handleObservationClick = (plan: AnnualPlan) => {
    console.log("Plan selected for observation:", plan);
    setSelectedPlan(plan);
    setEditingSheetId(null); // Clear any sheet ID from reports view
    setCurrentView('observation_sheet');
  };

  const handleFormCompletion = () => {
    setCurrentView('view_plans');
  };

  // --- MODIFIED ---
  const handleObservationComplete = () => {
    // Go back to the correct previous screen
    if (editingSheetId) {
      setCurrentView('reports');
    } else {
      setCurrentView('view_plans');
    }
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  // +++ NEW HANDLERS for the reports table actions +++
  const handleViewSheet = (sheetId: number) => {
    console.log(`Viewing sheet from reports with ID: ${sheetId}`);
    setSelectedPlan(null); // Ensure no plan is selected
    setEditingSheetId(sheetId); // Set the ID of the sheet to be edited/viewed
    setCurrentView('observation_sheet');
  };

  const handleDeleteSheet = async (sheetId: number) => {
    if (window.confirm('Are you sure you want to permanently delete this observation sheet?')) {
      try {
        // await axios.delete(`${API_BASE_URL}/ten-cycle-sheets/${sheetId}/`);
        setAllSheets(currentSheets => currentSheets.filter(sheet => sheet.id !== sheetId));
        alert(`Sheet ${sheetId} deleted successfully.`);
      } catch (error) {
        console.error("Failed to delete sheet:", error);
        alert("Error: Could not delete the sheet.");
      }
    }
  };

  // --- RENDER LOGIC ---

  if (currentView === 'plan_form') {
    return <AnnualPlanForm onBack={handleFormCompletion} planId={editingPlanId} />;
  }

  if (currentView === 'view_plans') {
    return (
      <AnnualPlanTable
        onBack={handleBackToDashboard}
        onObservationClick={handleObservationClick}
        onEditClick={handleEditClick}
      />
    );
  }

  // --- MODIFIED: To handle opening the form from either Plans or Reports ---
  if (currentView === 'observation_sheet' && (selectedPlan || editingSheetId)) {
    return (
      <ObservationSheet
        planData={selectedPlan}
        sheetId={editingSheetId}
        onBack={() => editingSheetId ? setCurrentView('reports') : setCurrentView('view_plans')}
        onComplete={handleObservationComplete}
      />
    );
  }

  if (currentView === 'calendar_view') {
    return <CalendarView onBack={handleBackToDashboard} />;
  }
  
  // +++ NEW: Render logic for the Reports View +++
  if (currentView === 'reports') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <button onClick={handleBackToDashboard} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m15 18-6-6 6-6"/></svg>
            <span>Back to Dashboard</span>
          </button>
          <TenCycleSheetTable
            sheets={allSheets}
            loading={sheetsLoading}
            error={sheetsError}
            onView={handleViewSheet}
            onDelete={handleDeleteSheet}
          />
        </div>
      </div>
    );
  }

  // --- Default Dashboard View ---
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Operator Observation System
          </h1>
          <p className="text-gray-600 mt-2">Annual Planning and Observation Management</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div
            onClick={handleCreatePlanClick}
            className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Create Plan</h3>
                <p className="text-sm text-gray-600">New annual plan</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => setCurrentView('view_plans')}
            className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">View Plans</h3>
                <p className="text-sm text-gray-600">Manage existing plans</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => setCurrentView('calendar_view')}
            className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-orange-100 p-3 rounded-lg group-hover:bg-orange-200 transition-colors">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Calendar View</h3>
                <p className="text-sm text-gray-600">Visualize monthly plans</p>
              </div>
            </div>
          </div>
          
          {/* --- MODIFIED REPORTS CARD --- */}
          <div
            onClick={() => setCurrentView('reports')}
            className="bg-white p-6 rounded-xl shadow-sm border cursor-pointer group hover:shadow-md"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
                <p className="text-sm text-gray-600">View observation history</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Overview</h2>
          {statsLoading ? (
             <div className="text-center py-4 text-gray-500">Loading stats...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Plans</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}