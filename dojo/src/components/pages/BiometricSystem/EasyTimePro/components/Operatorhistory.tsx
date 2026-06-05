import React, { useEffect, useState } from 'react';
import { 
  FiCalendar, FiCpu, FiUser, FiActivity, FiGrid, FiList, FiClock, FiAlertCircle
} from 'react-icons/fi';
import * as API from '../api'; // Import your API helper

// Interface matches your Backend Serializer
interface DailyRecord {
  id: number;
  employee_code: string;
  employee_name: string;
  device_name: string;
  first_punch: string;
  last_punch: string;
  date: string;
}

interface Props {
    isAuthorized: boolean; // We keep this prop in case you want to show/hide sensitive data later
}

const OperatorHistory: React.FC<Props> = ({ isAuthorized }) => {
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  
  // View Mode: 'grid' or 'table'
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');

  // Filters
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [searchId, setSearchId] = useState('');

  // --- FETCH DATA FROM BACKEND ---
  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      // Calls the new API Endpoint we created
      const data = await API.getOperatorHistory(selectedDate);
      console.log('datafrom backeend :',data);
      setRecords(data.logs);
    } catch (err) {
      console.error("Failed to fetch history", err);
      // Optional: setRecords([]) on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedDate]);

  // --- FILTERING LOGIC ---
  const uniqueMachines = Array.from(new Set(records.map(r => r.device_name)));

  const filteredRecords = records.filter(r => {
    const matchesMachine = selectedMachine === '' || r.device_name === selectedMachine;
    const matchesId = searchId === '' || 
                      r.employee_code.toLowerCase().includes(searchId.toLowerCase()) || 
                      r.employee_name.toLowerCase().includes(searchId.toLowerCase());
    return matchesMachine && matchesId;
  });

  const groupedRecords = uniqueMachines.reduce((acc, machine) => {
    const machineRecords = filteredRecords.filter(r => r.device_name === machine);
    if (machineRecords.length > 0) {
      acc[machine] = machineRecords;
    }
    return acc;
  }, {} as Record<string, DailyRecord[]>);

  // --- RENDER ---
  return (
    <div className="bg-gray-50 min-h-[500px]">
      
      {/* HEADER & CONTROLS */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-700 flex items-center gap-2">
            <FiCpu className="text-blue-600" /> Daily Shift Reports
          </h2>
          <p className="text-xs text-gray-400 mt-1">Aggregated Start/End times per machine.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
            
            {/* View Switcher */}
            <div className="flex bg-gray-100 p-1 rounded-lg mr-2">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}><FiGrid /></button>
                <button onClick={() => setViewMode('table')} className={`p-2 rounded-md transition ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}><FiList /></button>
            </div>

            {/* Date Picker */}
            <div className="relative">
                <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                <input 
                    type="date" 
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-gray-700 font-medium text-sm"
                />
            </div>
            
            {/* Search */}
            <div className="relative">
                <FiUser className="absolute left-3 top-3 text-gray-400" />
                <input 
                    placeholder="Search Operator..." 
                    value={searchId}
                    onChange={e => setSearchId(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-100 outline-none w-40 text-sm"
                />
            </div>
        </div>
      </div>

      {/* CONTENT */}
      {isLoading ? (
         <div className="text-center py-20 text-gray-400 animate-pulse flex flex-col items-center">
             <FiActivity className="animate-spin mb-2" size={24}/> Loading daily logs...
         </div>
      ) : filteredRecords.length === 0 ? (
         <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
            <p>No machine activity found for {selectedDate}.</p>
         </div>
      ) : (
        <>
            {/* GRID VIEW */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.keys(groupedRecords).map((machineName) => (
                        <div key={machineName} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                            <div className="bg-gradient-to-r from-gray-50 to-white p-3 border-b border-gray-100 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><FiActivity /></div>
                                    <h3 className="font-bold text-gray-800 text-sm">{machineName}</h3>
                                </div>
                                <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{groupedRecords[machineName].length} Ops</span>
                            </div>
                            <div className="p-3 flex-1 space-y-2">
                                {groupedRecords[machineName].map((record) => (
                                    <div key={record.id} className="flex items-center justify-between p-2 rounded-lg border border-gray-50 hover:border-blue-100 hover:bg-blue-50/20 transition">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold border border-indigo-100">
                                                {record.employee_code.substring(0,2)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-700 leading-tight">{record.employee_name}</p>
                                                <p className="text-[10px] text-gray-400 font-mono">{record.employee_code}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 justify-end text-xs font-mono text-gray-600 bg-green-50 px-1.5 py-0.5 rounded text-green-700 font-bold">
                                                {record.first_punch}
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-mono mt-1">
                                                to {record.last_punch}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* TABLE VIEW */}
            {viewMode === 'table' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500">
                            <tr>
                                <th className="px-6 py-3">Operator</th>
                                <th className="px-6 py-3">Machine</th>
                                <th className="px-6 py-3 text-center">Start</th>
                                <th className="px-6 py-3 text-center">End</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {filteredRecords.map((record) => (
                                <tr key={record.id} className="hover:bg-blue-50/30">
                                    <td className="px-6 py-3 font-medium text-gray-700">{record.employee_name} <span className="text-gray-400 text-xs">({record.employee_code})</span></td>
                                    <td className="px-6 py-3"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{record.device_name}</span></td>
                                    <td className="px-6 py-3 text-center font-mono text-green-600">{record.first_punch}</td>
                                    <td className="px-6 py-3 text-center font-mono text-blue-600">{record.last_punch}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
      )}
    </div>
  );
};

export default OperatorHistory;