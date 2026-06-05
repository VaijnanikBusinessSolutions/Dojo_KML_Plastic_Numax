import React from 'react';
import { format } from 'date-fns';
import { Eye, Trash2, FileText } from 'lucide-react';

// --- TYPE DEFINITIONS ---
// These types match the JSON data you provided.

interface TenCycleEntry {
  id: number;
  s_no: string;
  q1: boolean;
  // ... add other entry fields if needed for display
  overall_result: string;
  skill_level: string;
  remark: string;
}

export interface TenCycleSheet {
  id: number;
  employee: string; // This is the employee's emp_id
  station: number;
  line: number;
  department: number;
  level: number;
  production_engineer_name: string;
  qa_engineer_name: string;
  date: string; // e.g., "2025-10-15"
  part_name: string;
  sop_no: string;
  entries: TenCycleEntry[];
}

// --- COMPONENT PROPS ---
interface TenCycleSheetTableProps {
  sheets: TenCycleSheet[];
  loading: boolean;
  error: string | null;
  onView: (sheetId: number) => void;
  onDelete: (sheetId: number) => void;
}


// --- MAIN COMPONENT ---
export default function TenCycleSheetTable({ sheets, loading, error, onView, onDelete }: TenCycleSheetTableProps) {
  
  // Helper function to get Tailwind CSS classes for the status badge
  const getStatusStyles = (status: string) => {
    const lowercasedStatus = status.toLowerCase();
    switch (lowercasedStatus) {
      case 'pass':
        return 'bg-green-100 text-green-800';
      case 'fail':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // --- RENDER LOGIC ---

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">Loading sheets...</span>
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">{error}</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="px-6 py-4 border-b">
        <h1 className="text-2xl font-bold text-gray-900">10 Cycle Sheet History</h1>
        <p className="text-gray-600 mt-1">A log of all completed observation sheets.</p>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Employee ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Part Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">QA Engineer</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Overall Result</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sheets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto text-gray-300" />
                    <p className="mt-2">No observation sheets found.</p>
                  </td>
                </tr>
              ) : (
                sheets.map((sheet) => {
                  // Safely get the result from the first entry, if it exists
                  const overallResult = sheet.entries[0]?.overall_result || 'N/A';
                  
                  return (
                    <tr key={sheet.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-gray-700">
                        {format(new Date(sheet.date), 'dd MMM yyyy')}
                      </td>
                      <td className="py-4 px-4 font-mono text-sm text-gray-600">{sheet.employee}</td>
                      <td className="py-4 px-4 text-gray-900 font-medium">{sheet.part_name || '-'}</td>
                      <td className="py-4 px-4 text-gray-700">{sheet.qa_engineer_name}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusStyles(overallResult)}`}>
                          {overallResult}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex justify-center items-center space-x-2">
                          <button
                            onClick={() => onView(sheet.id)}
                            className="p-2 text-blue-600 rounded-lg hover:bg-blue-100 hover:text-blue-800 transition-colors"
                            title="View/Edit Sheet"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onDelete(sheet.id)}
                            className="p-2 text-red-500 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors"
                            title="Delete Sheet"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}