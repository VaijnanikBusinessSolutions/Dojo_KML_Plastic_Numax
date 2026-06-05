

// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom"; // ✅ added
// import { ChevronRight, Download, FileText, History } from "lucide-react";

// const Report = () => {
//   const [isDownloading, setIsDownloading] = useState(false);
//   const [downloadSuccess, setDownloadSuccess] = useState(false);
//   const navigate = useNavigate(); // ✅ added

//   // const handleDownload = async () => {
//   //   try {
//   //     setIsDownloading(true);
//   //     setDownloadSuccess(false);

//   //     // Simulate download process
//   //     await new Promise((resolve) => setTimeout(resolve, 2000));

//   //     setDownloadSuccess(true);
//   //   } catch (error) {
//   //     console.error("Download error:", error);
//   //     alert("Failed to download the file. Please try again.");
//   //   } finally {
//   //     setIsDownloading(false);
//   //   }
//   // };

//   const handleDownload = async () => {
//       try {
//         setIsDownloading(true);
//         setDownloadSuccess(false);

//         // Call the API endpoint
//         const response = await fetch('http://127.0.0.1:8000/employees-excel/export_excel');

//         if (!response.ok) {
//           throw new Error('Network response was not ok');
//         }

//         // Get the file as a Blob
//         const blob = await response.blob();

//         // Create a temporary URL for the blob
//         const url = window.URL.createObjectURL(blob);

//         // Create a temporary link element
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = 'employees.xlsx'; // Set the desired filename

//         // Append link to the body and click it to trigger download
//         document.body.appendChild(a);
//         a.click();

//         // Clean up
//         window.URL.revokeObjectURL(url);
//         document.body.removeChild(a);

//         setDownloadSuccess(true);

//       } catch (error) {
//         console.error('Download error:', error);
//         alert('Failed to download the file. Please try again.');
//       } finally {
//         setIsDownloading(false);
//       }
//   };

//   // const handleNavigate = (path) => {
//   //   navigate(path); // ✅ updated to real navigation
//   // };
//   const handleNavigate = (path) => {
//     console.log(`Navigating to: ${path}`);
//     navigate(path, { state: { fromReport: true } });
//   };

//   useEffect(() => {
//     let timer;
//     if (downloadSuccess) {
//       timer = setTimeout(() => setDownloadSuccess(false), 4000);
//     }
//     return () => {
//       if (timer) clearTimeout(timer);
//     };
//   }, [downloadSuccess]);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
//       {/* Header */}
//       <div className="bg-white border-b border-slate-200 shadow-sm">
//         <div className="max-w-7xl mx-auto px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <div className="w-10 h-10 bg-gradient-to-r from-slate-400 to-blue-400 rounded-lg flex items-center justify-center">
//                 <FileText className="w-6 h-6 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">
//                   Employee Reports
//                 </h1>
//                 <p className="text-sm text-gray-600">
//                   Comprehensive employee data management
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-6 py-8">
//         {/* Success Toast */}
//         {downloadSuccess && (
//           <div
//             role="status"
//             aria-live="polite"
//             className="fixed top-4 right-4 z-50 bg-white border border-green-200 rounded-xl shadow-lg px-6 py-4 flex items-center space-x-3 animate-in slide-in-from-top-2"
//           >
//             <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
//               <svg
//                 className="w-5 h-5 text-green-600"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M5 13l4 4L19 7"
//                 />
//               </svg>
//             </div>
//             <div>
//               <p className="text-sm font-medium text-gray-900">
//                 Download completed!
//               </p>
//               <p className="text-xs text-gray-600">
//                 Master table exported successfully
//               </p>
//             </div>
//           </div>
//         )}

//         {/* Page Title */}
//         <div className="mb-8">
//           <h2 className="text-3xl font-bold text-gray-900 mb-2">
//             Reports Dashboard
//           </h2>
//           <p className="text-gray-600">
//             Access and manage your employee reports and data exports
//           </p>
//         </div>

//         {/* Report Cards Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
//           {/* Employee History Card */}
//           <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 overflow-hidden">
//             <div className="p-8">
//               <div className="flex items-start justify-between mb-6">
//                 <div className="w-12 h-12 bg-gradient-to-r from-slate-400 to-gray-500 rounded-xl flex items-center justify-center">
//                   <History className="w-6 h-6 text-white" />
//                 </div>
//                 <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
//               </div>

//               <h3 className="text-xl font-bold text-gray-900 mb-3">
//                 Employee History
//               </h3>
//               <p className="text-gray-600 mb-8 leading-relaxed">
//                 Complete record of all employee changes and updates. Track
//                 modifications, additions, and historical data points.
//               </p>

//               <button
//                 onClick={() => handleNavigate("/EmployeeHistorySearch")}
//                 className="w-full bg-gradient-to-r from-slate-400 to-gray-500 text-white px-6 py-4 rounded-xl font-semibold hover:from-slate-500 hover:to-gray-600 transition-all duration-200 flex items-center justify-center space-x-2 group/btn"
//               >
//                 <span>Access Report</span>
//                 <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-200" />
//               </button>
//             </div>
//           </div>

//           {/* Master Table Card */}
//           <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 overflow-hidden">
//             <div className="p-8">
//               <div className="flex items-start justify-between mb-6">
//                 <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-slate-400 rounded-xl flex items-center justify-center">
//                   <FileText className="w-6 h-6 text-white" />
//                 </div>
//                 <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
//               </div>

//               <h3 className="text-xl font-bold text-gray-900 mb-3">
//                 Master Table
//               </h3>
//               <p className="text-gray-600 mb-8 leading-relaxed">
//                 Current snapshot of all employee records. View comprehensive
//                 data or export to Excel for further analysis.
//               </p>

//               <div className="space-y-3">
//                 <button
//                   onClick={() => handleNavigate("/MasterTable")}
//                   className="w-full bg-slate-50 text-slate-600 px-6 py-4 rounded-xl font-semibold hover:bg-slate-100 transition-all duration-200 flex items-center justify-center space-x-2 group/btn"
//                 >
//                   <span>View Report</span>
//                   <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-200" />
//                 </button>

//                 <button
//                   onClick={handleDownload}
//                   disabled={isDownloading}
//                   className={`w-full px-6 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
//                     isDownloading
//                       ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                       : "bg-gradient-to-r from-blue-400 to-slate-400 text-white hover:from-blue-500 hover:to-slate-500"
//                   }`}
//                 >
//                   {isDownloading ? (
//                     <>
//                       <svg
//                         className="w-5 h-5 animate-spin"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                       >
//                         <circle
//                           className="opacity-25"
//                           cx="12"
//                           cy="12"
//                           r="10"
//                           stroke="currentColor"
//                           strokeWidth="4"
//                         />
//                         <path
//                           className="opacity-75"
//                           fill="currentColor"
//                           d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                         />
//                       </svg>
//                       <span>Downloading...</span>
//                     </>
//                   ) : (
//                     <>
//                       <Download className="w-5 h-5" />
//                       <span>Download Excel</span>
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* OJT Status Card */}
//           <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 overflow-hidden">
//             <div className="p-8">
//               <div className="flex items-start justify-between mb-6">
//                 <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-teal-400 rounded-xl flex items-center justify-center">
//                   <FileText className="w-6 h-6 text-white" />
//                 </div>
//                 <div className="w-2 h-2 bg-green-300 rounded-full"></div>
//               </div>

//               <h3 className="text-xl font-bold text-gray-900 mb-3">
//                 OJT Status
//               </h3>
//               <p className="text-gray-600 mb-8 leading-relaxed">
//                 Track and manage trainee On Job Training status.
//               </p>

//               <button
//                 onClick={() => handleNavigate("/ojt-status")}
//                 className="w-full bg-gradient-to-r from-green-400 to-teal-400 text-white px-6 py-4 rounded-xl font-semibold hover:from-green-500 hover:to-teal-500 transition-all duration-200 flex items-center justify-center space-x-2 group/btn"
//               >
//                 <span>Access OJT</span>
//                 <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-200" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Report;




import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Download, FileText, History, Users, CheckSquare, BarChart3 } from "lucide-react";

const Report = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const navigate = useNavigate();

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setDownloadSuccess(false);

      await new Promise((resolve) => setTimeout(resolve, 2000));
      setDownloadSuccess(true);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download the file. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (downloadSuccess) {
      timer = setTimeout(() => setDownloadSuccess(false), 4000);
    }
    return () => clearTimeout(timer);
  }, [downloadSuccess]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  Employee Reports
                </h1>
                <p className="text-sm text-gray-500">Advanced analytics & data management</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Success Toast */}
        {downloadSuccess && (
          <div
            role="status"
            aria-live="polite"
            className="fixed top-6 right-6 z-50 bg-white/90 backdrop-blur-md border border-emerald-200 rounded-2xl shadow-xl px-6 py-4 flex items-center space-x-3 animate-in slide-in-from-top-3 duration-500"
          >
            <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center animate-pulse">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Download Complete!</p>
              <p className="text-xs text-gray-600">Master table exported to Excel</p>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
            Reports Dashboard
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Unlock insights with real-time reports, historical data, and exportable analytics.
          </p>
        </section>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Employee History */}
          <div className="group relative bg-white/70 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <History className="w-7 h-7 text-white" />
                </div>
                <div className="w-3 h-3 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full animate-pulse" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">Employee History</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Full audit trail of employee lifecycle changes, edits, and historical snapshots.
              </p>

              <button
                onClick={() => handleNavigate("/EmployeeHistorySearch")}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-xl font-bold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-xl transform hover:scale-[1.02]"
              >
                <span>Explore History</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Master Table */}
          <div className="group relative bg-white/70 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">Master Table</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Complete employee database snapshot. Export to Excel for offline analysis.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => handleNavigate("/MasterTable")}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-4 rounded-xl font-bold hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-xl"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>View Live Data</span>
                </button>

                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className={`w-full px-6 py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 shadow-md ${
                    isDownloading
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                  }`}
                >
                  {isDownloading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>Export to Excel</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* OJT Status */}
          <div className="group relative bg-white/70 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full animate-pulse" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">OJT Status</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Monitor trainee progress and On-the-Job Training completion in real time.
              </p>

              <button
                onClick={() => handleNavigate("/ojt-status")}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-4 rounded-xl font-bold hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-xl"
              >
                <span>Track Trainees</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Tencycle status */}
          <div className="group relative bg-white/70 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckSquare className="w-7 h-7 text-white" />
                </div>
                <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">TenCycle Status</h3>
             <p className="text-gray-600 mb-8 leading-relaxed">
  Track employee performance across all levels with complete visibility into completion rates and pass/fail results.
</p>

              <button
                onClick={() => handleNavigate("/tencycle-status")}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-4 rounded-xl font-bold hover:from-purple-600 hover:to-pink-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-xl"
              >
                <span>View Compliance</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Skill Evaluation */}
          {/* <div className="group relative bg-white/70 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full animate-pulse" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">Skill Evaluation</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Assess operator competency, track skill growth, and identify training gaps.
              </p>

              <button
                onClick={() => handleNavigate("/skillevaluationslist")}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white px-6 py-4 rounded-xl font-bold hover:from-orange-600 hover:to-amber-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-xl"
              >
                <span>Evaluate Skills</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div> */}
        </div>
      </main>
    </div>
  );
};

export default Report;


