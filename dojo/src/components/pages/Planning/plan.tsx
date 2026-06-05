





// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';

// // ... (All your existing interfaces and constants remain the same) ...
// // ### Configure axios with base URL
// const api = axios.create({
//   baseURL: 'http://127.0.0.1:8000',
//   headers: { 'Content-Type': 'application/json' },
// });

// // ### Types & Constants
// type AggregatedPlan = { id?: number; [key: string]: any; };
// const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
// const OPERATORS = ['l1', 'l2', 'l3', 'l4'];
// const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);
// const DEPARTMENTS = [{ value: 'all', label: 'All' }, { value: 'ctq', label: 'CTQ' }, { value: 'pdi', 'label': 'PDI' }, { value: 'other', label: 'Other' }];
// const METRIC_TYPES = ['ctq', 'pdi', 'other'] as const;
// type MetricType = typeof METRIC_TYPES[number];

// // --- INTERFACES FOR COMPONENT STATE ---
// interface Station { station_id: number; station_name: string; }
// interface Subline { subline_id: number; subline_name: string; stations: Station[]; }
// interface Line { line_id: number; line_name: string; sublines: Subline[]; stations: Station[]; }
// interface Department { department_id: number; department_name: string; lines: Line[]; stations: Station[]; }
// interface FactoryStructure { factory_id: number; factory_name: string; hq: number; departments: Department[]; }
// interface HqOption { id: number; name: string; }

// // --- INTERFACES FOR NEW API RESPONSE PARSING ---
// interface ApiStation { id: number; station_name: string; }
// interface ApiSubline { id: number; subline_name: string; stations: ApiStation[]; }
// interface ApiLine { id: number; line_name: string; sublines: ApiSubline[]; stations: ApiStation[]; }
// interface ApiDepartment { id: number; department_name: string; lines: ApiLine[]; stations: ApiStation[]; }
// interface ApiStructureData { hq_name: string; factory_name: string; departments: ApiDepartment[]; }
// interface ApiHierarchyResponseItem {
//   structure_id: number;
//   structure_name: string;
//   hq: number;
//   hq_name: string;
//   factory: number;
//   factory_name: string;
//   structure_data: ApiStructureData;
// }


// // ... (All your reusable components like MessageModal, SelectField, etc. remain the same) ...
// const MessageModal = ({ message, type, onClose }: { message: string | null; type: 'success' | 'error'; onClose: () => void; }) => { if (!message) return null; const bgColor = type === 'success' ? 'bg-green-100' : 'bg-red-100'; const textColor = type === 'success' ? 'text-green-800' : 'text-red-800'; const borderColor = type === 'success' ? 'border-green-500' : 'border-red-500'; return ( <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50"> <div className={`rounded-xl shadow-lg p-6 max-w-sm w-full transition-all duration-300 transform scale-100 ${bgColor} border ${borderColor}`}> <div className="text-center"> <p className={`text-lg font-semibold ${textColor} mb-4 whitespace-pre-wrap`}>{message}</p> <button onClick={onClose} className="px-6 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"> OK </button> </div> </div> </div> ); };
// function SelectField({ id, label, value, onChange, options, disabled }: { id: string; label: string; value: string | number | null; onChange: (v: string) => void; options: { value: string | number; label: string; disabled?: boolean }[]; disabled?: boolean; }) { return ( <div className="group"> <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2">{label}</label> <select id={id} className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white hover:border-gray-300" value={value ?? ''} onChange={(e) => onChange(e.target.value)} disabled={disabled}> <option value="">Select {label}</option> {options.map((o, index) => (<option key={`${id}-${o.value}-${index}`} value={o.value} disabled={o.disabled}>{o.label}</option>))} </select> </div> ); }
// function InputCell({ name, value, onChange, className = "" }: { name: string; value: number; onChange: (name: string, value: number) => void; className?: string; }) { const [inputValue, setInputValue] = useState(value ? value.toString() : '0'); useEffect(() => { setInputValue(value ? value.toString() : '0'); }, [value]); const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { const newValue = e.target.value; setInputValue(newValue); if (newValue === '' || !isNaN(Number(newValue))) { onChange(name, newValue === '' ? 0 : Number(newValue)); } }; const handleBlur = () => { if (inputValue === '' || isNaN(Number(inputValue))) { setInputValue('0'); onChange(name, 0); } }; return <input type="text" value={inputValue} onChange={handleChange} onBlur={handleBlur} className={`w-full p-2 border border-gray-300 rounded text-center ${className}`} onFocus={(e) => e.target.select()} />; }
// function LargeInputCell({ name, value, onChange, className = "" }: { name: string; value: number; onChange: (name: string, value: number) => void; className?: string; }) { const [inputValue, setInputValue] = useState(value ? value.toString() : '0'); useEffect(() => { setInputValue(value ? value.toString() : '0'); }, [value]); const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { const newValue = e.target.value; setInputValue(newValue); if (newValue === '' || !isNaN(Number(newValue))) { onChange(name, newValue === '' ? 0 : Number(newValue)); } }; const handleBlur = () => { if (inputValue === '' || isNaN(Number(inputValue))) { setInputValue('0'); onChange(name, 0); } }; return <input type="text" value={inputValue} onChange={handleChange} onBlur={handleBlur} className={`w-full p-2 border border-gray-300 rounded text-base ${className}`} onFocus={(e) => e.target.select()} />; }
// const OverallPlanInputs = ({ data, onDataChange, viewLabel }: { data: AggregatedPlan, onDataChange: (name: string, value: number) => void, viewLabel: string }) => ( <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6"> <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">{viewLabel} - Overall Plan</h2> <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4"> <div> <h3 className="text-lg font-semibold text-gray-700 mb-2">Production Plan (Units)</h3> <div className="grid grid-cols-2 gap-4 items-center"> <label className="font-medium text-gray-600">Plan:</label> <LargeInputCell name="total_production_plan" value={data.total_production_plan ?? 0} onChange={onDataChange} /> <label className="font-medium text-gray-600">Actual:</label> <LargeInputCell name="total_production_actual" value={data.total_production_actual ?? 0} onChange={onDataChange} /> </div> </div> <div> <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Operators Required</h3> <div className="grid grid-cols-2 gap-4 items-center"> <label className="font-medium text-gray-600">Plan:</label> <LargeInputCell name="total_operators_required_plan" value={data.total_operators_required_plan ?? 0} onChange={onDataChange} /> <label className="font-medium text-gray-600">Actual:</label> <LargeInputCell name="total_operators_required_actual" value={data.total_operators_required_actual ?? 0} onChange={onDataChange} /> </div> </div> <div className="md:col-span-2"> <h3 className="text-lg font-semibold text-gray-700 mb-2">Manpower Availability</h3> <div className="grid grid-cols-4 gap-4 items-center"> <label className="font-medium text-gray-600">Starting Team (Available):</label> <LargeInputCell name="total_operators_available" value={data.total_operators_available ?? 0} onChange={onDataChange} /> </div> </div> </div> </div> );
// const MetricBreakdownTable = ({ metric, data, onDataChange }: { metric: MetricType, data: AggregatedPlan, onDataChange: (name: string, value: number) => void }) => { const displayedTotal = (type: 'plan' | 'actual') => OPERATORS.reduce((sum, op) => sum + (Number(data[`${metric}_${type}_${op}`] ?? 0)), 0); return ( <div className="bg-white rounded-lg shadow-md border border-gray-200 p-1 mb-6"> <h3 className="text-xl font-bold text-center text-white bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-t-md">{metric.toUpperCase()} Operator Bifurcation</h3> <div className="overflow-x-auto"> <table className="w-full"> <thead className="bg-gray-100"> <tr> <th className="p-3 text-left font-semibold text-gray-600">Type</th> {OPERATORS.map(op => <th key={op} className="p-3 text-center font-semibold text-gray-600">{op.toUpperCase()}</th>)} <th className="p-3 text-center font-semibold text-gray-600">Total</th> </tr> </thead> <tbody> <tr className="border-t"> <td className="p-3 font-medium text-gray-700 bg-blue-50">Plan</td> {OPERATORS.map(op => ( <td key={`p-${op}`} className="p-2 text-center bg-blue-50"><InputCell name={`${metric}_plan_${op}`} value={data[`${metric}_plan_${op}`] ?? 0} onChange={onDataChange} /></td> ))} <td className="p-3 text-center font-bold bg-blue-100 text-blue-800">{displayedTotal('plan')}</td> </tr> <tr className="border-t"> <td className="p-3 font-medium text-gray-700 bg-green-50">Actual</td> {OPERATORS.map(op => ( <td key={`a-${op}`} className="p-2 text-center bg-green-50"><InputCell name={`${metric}_actual_${op}`} value={data[`${metric}_actual_${op}`] ?? 0} onChange={onDataChange} /></td> ))} <td className="p-3 text-center font-bold bg-green-100 text-green-800">{displayedTotal('actual')}</td> </tr> </tbody> </table> </div> </div> );};
// const SummaryTable = ({ data, metrics }: { data: AggregatedPlan, metrics: MetricType[] }) => { const calcOperatorTotal = (op: string, type: 'plan' | 'actual') => metrics.reduce((s, m) => s + (Number(data[`${m}_${type}_${op}`] ?? 0)), 0); const grandTotal = (type: 'plan' | 'actual') => OPERATORS.reduce((s, op) => s + calcOperatorTotal(op, type), 0); const gap = (type: 'plan' | 'actual') => (Number(data[`total_operators_required_${type}`] ?? 0)) - grandTotal(type); return ( <div className="bg-white rounded-lg shadow-md border border-gray-200 p-1"> <h3 className="text-xl font-bold text-center text-white bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-t-md">Overall Summary</h3> <div className="overflow-x-auto"> <table className="w-full"> <thead className="bg-gray-100"> <tr> <th className="p-3 text-left font-semibold text-gray-600">Type</th> {OPERATORS.map(op => <th key={op} className="p-3 text-center font-semibold text-gray-600">{op.toUpperCase()} Total</th>)} <th className="p-3 text-center font-semibold text-gray-600">Grand Total</th> <th className="p-3 text-center font-semibold text-gray-600">Gap</th> </tr> </thead> <tbody> <tr className="border-t"> <td className="p-3 font-medium text-gray-700 bg-blue-50">Plan</td> {OPERATORS.map(op => <td key={`p-${op}`} className="p-3 text-center font-bold bg-purple-100 text-purple-800">{calcOperatorTotal(op, 'plan')}</td>)} <td className="p-3 text-center font-bold bg-purple-200 text-purple-900">{grandTotal('plan')}</td> <td className={`p-3 text-center font-bold ${gap('plan') !== 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{gap('plan')}</td> </tr> <tr className="border-t"> <td className="p-3 font-medium text-gray-700 bg-green-50">Actual</td> {OPERATORS.map(op => <td key={`a-${op}`} className="p-3 text-center font-bold bg-purple-100 text-purple-800">{calcOperatorTotal(op, 'actual')}</td>)} <td className="p-3 text-center font-bold bg-purple-200 text-purple-900">{grandTotal('actual')}</td> <td className={`p-3 text-center font-bold ${gap('actual') !== 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{gap('actual')}</td> </tr> </tbody> </table> </div> </div> );};

// const Plan = () => {
//   // --- STATE ---
//   const [timeView, setTimeView] = useState<'Monthly' | 'Weekly'>('Monthly');
//   const [monthLockMode, setMonthLockMode] = useState<'MONTHLY' | 'WEEKLY' | null>(null);
  
//   const [factoryStructures, setFactoryStructures] = useState<FactoryStructure[]>([]);
//   const [hqs, setHqs] = useState<HqOption[]>([]);

//   const [selectedHq, setSelectedHq] = useState<number | null>(null);
//   const [selectedFactory, setSelectedFactory] = useState<number | null>(null);
//   const [selectedDepartment, setSelectedDepartment] = useState<number | 'all' | null>(null);
//   const [selectedLine, setSelectedLine] = useState<number | 'all' | null>(null);
//   const [selectedSubline, setSelectedSubline] = useState<number | 'all' | null>(null);
//   const [selectedStation, setSelectedStation] = useState<number | 'all' | null>(null);
  
//   const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
//   const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<'all' | 'ctq' | 'pdi' | 'other'>('all');
  
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
//   const [currentPlan, setCurrentPlan] = useState<AggregatedPlan>({});
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);

//   // --- DROPDOWN HELPERS ---
//   const getHqs = () => hqs.map(h => ({ value: h.id, label: h.name }));

//   const getFactories = (): { value: number; label: string }[] => {
//     if (!selectedHq) return [];
//     return factoryStructures.filter(f => f.hq === selectedHq).map(f => ({ value: f.factory_id, label: f.factory_name }));
//   };

//   const getDepartments = (): { value: number | 'all'; label: string }[] => {
//     if (!selectedFactory) return [];
//     const factory = factoryStructures.find(f => f.factory_id === selectedFactory);
//     if (!factory?.departments?.length) return [];
//     return [{ value: 'all', label: 'All' }, ...(factory.departments.map(d => ({ value: d.department_id, label: d.department_name })))];
//   };

//   const getLines = (): { value: number | 'all'; label: string }[] => {
//     if (!selectedDepartment || selectedDepartment === 'all') return [];
//     const factory = factoryStructures.find(f => f.factory_id === selectedFactory);
//     const dept = factory?.departments.find(d => d.department_id === selectedDepartment);
//     if (!dept?.lines?.length) return [];
//     return [{ value: 'all', label: 'All' }, ...(dept.lines.map(l => ({ value: l.line_id, label: l.line_name })))];
//   };

//   const getSublines = (): { value: number | 'all'; label: string }[] => {
//     if (!selectedLine || selectedLine === 'all') return [];
//     const factory = factoryStructures.find(f => f.factory_id === selectedFactory);
//     const dept = factory?.departments.find(d => d.department_id === selectedDepartment);
//     const line = dept?.lines.find(l => l.line_id === selectedLine);
//     if (!line?.sublines?.length) return [];
//     return [{ value: 'all', label: 'All' }, ...(line.sublines.map(sl => ({ value: sl.subline_id, label: sl.subline_name })))];
//   };

//   const getStations = (): { value: number | 'all'; label: string }[] => {
//     if (!selectedDepartment || selectedDepartment === 'all') return [];
//     const factory = factoryStructures.find(f => f.factory_id === selectedFactory);
//     const dept = factory?.departments.find(d => d.department_id === selectedDepartment);
//     const line = dept?.lines.find(l => l.line_id === selectedLine);
//     const subline = line?.sublines.find(sl => sl.subline_id === selectedSubline);

//     let stations: Station[] = [];
//     if (selectedSubline && subline?.stations?.length) {
//       stations = subline.stations;
//     } else if (selectedLine && !selectedSubline && line?.stations?.length) {
//       stations = line.stations;
//     } else if (!selectedLine && dept?.stations?.length) {
//       stations = dept.stations;
//     }

//     if (!stations.length) return [];
//     return [{ value: 'all', label: 'All' }, ...stations.map(s => ({ value: s.station_id, label: s.station_name }))];
//   };
  
//   const getWeeksForMonth = (year: number, month: number): { value: string; label: string }[] => { const w = []; const first = new Date(year, month, 1); const last = new Date(year, month + 1, 0); let curr = new Date(first); curr.setDate(curr.getDate() - (curr.getDay() + 6) % 7); while (curr <= last) { const start = new Date(curr); w.push({ value: start.toISOString().split('T')[0], label: `Week of ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` }); curr.setDate(curr.getDate() + 7); } return w; };
//   const toYYYYMMDD = (date: Date) => new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split("T")[0];

//   // ### KEY CHANGE ###: Smarter logic to check for completion
//   const isContextComplete = useCallback(() => {
//     // Basic requirements: HQ, Factory, and Department must always be selected.
//     if (!selectedHq || !selectedFactory || !selectedDepartment) {
//       return false;
//     }

//     // It's incomplete if a level has options but nothing is selected yet.
//     // The `.length > 1` check is crucial: it means there are options *besides* "All".
//     if (getLines().length > 1 && !selectedLine) return false;
//     if (getSublines().length > 1 && !selectedSubline) return false;
//     if (getStations().length > 1 && !selectedStation) return false;
    
//     // If all checks pass, the context is complete.
//     return true;
//   }, [selectedHq, selectedFactory, selectedDepartment, selectedLine, selectedSubline, selectedStation]);


//   // --- DATA LOGIC ---
//   const fetchData = useCallback(async () => {
//     if (!isContextComplete()) return; // This will now work correctly
//     // ... (rest of the function is unchanged)
//     setIsLoading(true); setError(null); setCurrentPlan({}); setMonthLockMode(null);

//     const monthIndex = MONTHS.indexOf(selectedMonth);
//     const monthStartDate = new Date(selectedYear, monthIndex, 1);
    
//     const contextParams = {
//         Hq: selectedHq,
//         factory: selectedFactory,
//         department: selectedDepartment === 'all' ? null : selectedDepartment,
//         line: selectedLine === 'all' ? null : selectedLine,
//         subline: selectedSubline === 'all' ? null : selectedSubline,
//         station: selectedStation === 'all' ? null : selectedStation,
//     };

//     try {
//       const lockStatusRes = await api.get('/production-data/get-month-lock-status/', { params: { ...contextParams, target_date: toYYYYMMDD(monthStartDate) } });
//       const lockMode = lockStatusRes.data.lock_mode;
//       if (lockMode) { setMonthLockMode(lockMode); setTimeView(lockMode === 'MONTHLY' ? 'Monthly' : 'Weekly'); }

//       const dateRange = getSelectedDateRange();
//       const dataRes = await api.get('/production-data/get-plan-data/', { params: { ...contextParams, start_date: dateRange.startDate, end_date: dateRange.endDate } });
//       setCurrentPlan(dataRes.data || {});
//     } catch (err: any) {
//       if (err.response?.status === 404) {
//         setCurrentPlan({});
//         try {
//           const prevMonthDate = new Date(selectedYear, monthIndex - 1, 1);
//           const endingTeamRes = await api.get('/production-data/get-ending-team/', { params: { ...contextParams, target_date: toYYYYMMDD(prevMonthDate) } });
//           if (endingTeamRes.data?.ending_team > 0) {
//             setCurrentPlan(prev => ({ ...prev, total_operators_available: endingTeamRes.data.ending_team }));
//           }
//         } catch (autoFillErr) { console.log("Could not auto-fill starting team."); }
//       } else { setError('Failed to load plan data.'); }
//     } finally { setIsLoading(false); }
//   }, [isContextComplete, selectedHq, selectedFactory, selectedDepartment, selectedLine, selectedSubline, selectedStation, selectedMonth, selectedYear, selectedWeek, timeView]);
  
//   const getSelectedDateRange = () => {
//     const monthIndex = MONTHS.indexOf(selectedMonth);
//     let startDate, endDate;
//     if (timeView === 'Weekly' && selectedWeek) {
//         startDate = new Date(selectedWeek);
//         endDate = new Date(startDate);
//         endDate.setDate(startDate.getDate() + 6);
//     } else {
//         startDate = new Date(selectedYear, monthIndex, 1);
//         endDate = new Date(selectedYear, monthIndex + 1, 0);
//     }
//     return { startDate: toYYYYMMDD(startDate), endDate: toYYYYMMDD(endDate) };
//   };








//   // useEffect(() => {
//   //   const fetchAndProcessStructures = async () => {
//   //     setIsLoading(true);
//   //     try {
//   //       const response = await api.get<ApiHierarchyResponseItem[]>('/hierarchy-simple/');
//   //       const apiData = response.data;
        
//   //       const factoriesMap = new Map<number, FactoryStructure>();
//   //       const hqMap = new Map<number, string>();

//   //       apiData.forEach(item => {
//   //           if (item.hq && item.hq_name && !hqMap.has(item.hq)) { hqMap.set(item.hq, item.hq_name); }
//   //           if (!item.factory || !item.factory_name) return;

//   //           let factory = factoriesMap.get(item.factory);
//   //           if (!factory) {
//   //               factory = { factory_id: item.factory, factory_name: item.factory_name, hq: item.hq, departments: [] };
//   //               factoriesMap.set(item.factory, factory);
//   //           }

//   //           item.structure_data?.departments?.forEach(deptData => {
//   //               if (!deptData.id || !deptData.department_name) return;
//   //               let department = factory.departments.find(d => d.department_id === deptData.id);
//   //               if (!department) {
//   //                   department = { department_id: deptData.id, department_name: deptData.department_name, lines: [], stations: [] };
//   //                   factory.departments.push(department);
//   //               }

//   //               deptData.stations?.forEach(stationData => {
//   //                   if (!department.stations.some(s => s.station_id === stationData.id)) {
//   //                       department.stations.push({ station_id: stationData.id, station_name: stationData.station_name });
//   //                   }
//   //               });

//   //               deptData.lines?.forEach(lineData => {
//   //                   let line = department.lines.find(l => l.line_id === lineData.id);
//   //                   if (!line) {
//   //                       line = { line_id: lineData.id, line_name: lineData.line_name, sublines: [], stations: [] };
//   //                       department.lines.push(line);
//   //                   }
//   //               });
//   //           });
//   //       });

//   //       const nestedStructures = Array.from(factoriesMap.values());
//   //       setFactoryStructures(nestedStructures);
//   //       const uniqueHqs = Array.from(hqMap, ([id, name]) => ({ id, name }));
//   //       setHqs(uniqueHqs);

//   //       // ### KEY CHANGE ###: Set defaults to 'all' to make the form instantly usable
//   //       if (uniqueHqs.length > 0) {
//   //           const firstHqId = uniqueHqs[0].id;
//   //           setSelectedHq(firstHqId);
//   //           const firstFactory = nestedStructures.find(f => f.hq === firstHqId);
//   //           if (firstFactory) {
//   //               setSelectedFactory(firstFactory.factory_id);
//   //               // Set the rest to "all" to make the form complete initially
//   //               setSelectedDepartment('all');
//   //               setSelectedLine('all');
//   //               setSelectedSubline('all');
//   //               setSelectedStation('all');
//   //           }
//   //       }
//   //     } catch (err) { setError('Failed to load factory structure data.'); } 
//   //     finally { setIsLoading(false); }
//   //   };
//   //   fetchAndProcessStructures();
//   // }, []);


// // ... (keep all code above this useEffect the same) ...

//   useEffect(() => {
//     const fetchAndProcessStructures = async () => {
//       setIsLoading(true);
//       try {
//         const response = await api.get<ApiHierarchyResponseItem[]>('/hierarchy-simple/');
//         const apiData = response.data;
        
//         const factoriesMap = new Map<number, FactoryStructure>();
//         const hqMap = new Map<number, string>();

//         apiData.forEach(item => {
//             if (item.hq && item.hq_name && !hqMap.has(item.hq)) { hqMap.set(item.hq, item.hq_name); }
//             if (!item.factory || !item.factory_name) return;

//             let factory = factoriesMap.get(item.factory);
//             if (!factory) {
//                 factory = { factory_id: item.factory, factory_name: item.factory_name, hq: item.hq, departments: [] };
//                 factoriesMap.set(item.factory, factory);
//             }

//             item.structure_data?.departments?.forEach(deptData => {
//                 if (!deptData.id || !deptData.department_name) return;
//                 let department = factory.departments.find(d => d.department_id === deptData.id);
//                 if (!department) {
//                     department = { department_id: deptData.id, department_name: deptData.department_name, lines: [], stations: [] };
//                     factory.departments.push(department);
//                 }

//                 // Process stations directly under the department
//                 deptData.stations?.forEach(stationData => {
//                     if (!department.stations.some(s => s.station_id === stationData.id)) {
//                         department.stations.push({ station_id: stationData.id, station_name: stationData.station_name });
//                     }
//                 });

//                 // ### START OF FIX ###
//                 // Process lines and their nested children
//                 deptData.lines?.forEach(lineData => {
//                     let line = department.lines.find(l => l.line_id === lineData.id);
//                     if (!line) {
//                         line = { line_id: lineData.id, line_name: lineData.line_name, sublines: [], stations: [] };
//                         department.lines.push(line);
//                     }

//                     // Process stations directly under the line
//                     lineData.stations?.forEach(stationData => {
//                         if (!line.stations.some(s => s.station_id === stationData.id)) {
//                             line.stations.push({ station_id: stationData.id, station_name: stationData.station_name });
//                         }
//                     });

//                     // Process sublines under the line
//                     lineData.sublines?.forEach(sublineData => {
//                         let subline = line.sublines.find(sl => sl.subline_id === sublineData.id);
//                         if (!subline) {
//                             subline = { subline_id: sublineData.id, subline_name: sublineData.subline_name, stations: [] };
//                             line.sublines.push(subline);
//                         }
                        
//                         // Process stations under the subline
//                         sublineData.stations?.forEach(stationData => {
//                             if (!subline.stations.some(s => s.station_id === stationData.id)) {
//                                 subline.stations.push({ station_id: stationData.id, station_name: stationData.station_name });
//                             }
//                         });
//                     });
//                 });
//                 // ### END OF FIX ###
//             });
//         });

//         const nestedStructures = Array.from(factoriesMap.values());
//         setFactoryStructures(nestedStructures);
//         const uniqueHqs = Array.from(hqMap, ([id, name]) => ({ id, name }));
//         setHqs(uniqueHqs);
        
//         if (uniqueHqs.length > 0) {
//             const firstHqId = uniqueHqs[0].id;
//             setSelectedHq(firstHqId);
//             const firstFactory = nestedStructures.find(f => f.hq === firstHqId);
//             if (firstFactory) {
//                 setSelectedFactory(firstFactory.factory_id);
//                 setSelectedDepartment('all');
//                 setSelectedLine('all');
//                 setSelectedSubline('all');
//                 setSelectedStation('all');
//             }
//         }
//       } catch (err) { setError('Failed to load factory structure data.'); } 
//       finally { setIsLoading(false); }
//     };
//     fetchAndProcessStructures();
//   }, []);

// // ... (the rest of your component remains the same) ...







//   // ... (rest of the component is unchanged) ...
//   useEffect(() => { if (timeView === 'Weekly') { const monthIndex = MONTHS.indexOf(selectedMonth); const weeks = getWeeksForMonth(selectedYear, monthIndex); if (weeks.length > 0 && !selectedWeek) { setSelectedWeek(weeks[0].value); } else if (weeks.length === 0) { setSelectedWeek(null); } } else { setSelectedWeek(null); } }, [selectedMonth, selectedYear, timeView, selectedWeek]);
  
//   // ### KEY CHANGE ###: Ensure fetchData is called when isContextComplete becomes true
//   useEffect(() => { 
//     if (isContextComplete()) { 
//       fetchData(); 
//     }
//   }, [isContextComplete, fetchData]); // fetchData is already memoized with useCallback

//   const handleInputChange = (name: string, value: number) => setCurrentPlan(prev => ({ ...prev, [name]: value }));
//   const handleAttritionRateChange = (e: React.ChangeEvent<HTMLInputElement>) => { const v = e.target.value === '' ? 0 : parseFloat(e.target.value); if (!isNaN(v) && v >= 0 && v <= 100) setCurrentPlan(p => ({ ...p, attrition_rate: v })); };
  
//   const handleSave = async () => {
//     if (!isContextComplete()) { setError('Please select an option at all hierarchy levels.'); return; }
//     setIsSaving(true); setError(null);
//     try {
//         const { startDate, endDate } = getSelectedDateRange();
//         const payload = { 
//           ...currentPlan, 
//           id: currentPlan.id || null, 
//           start_date: startDate, 
//           end_date: endDate, 
//           entry_mode: timeView.toUpperCase(), 
//           Hq: selectedHq, // Django model expects 'Hq'
//           factory: selectedFactory, 
//           department: selectedDepartment === 'all' ? null : selectedDepartment, 
//           line: selectedLine === 'all' ? null : selectedLine, 
//           subline: selectedSubline === 'all' ? null : selectedSubline,
//           station: selectedStation === 'all' ? null : selectedStation,
//         };
//         const response = await api.post('/production-data/save-plan-entry/', payload);
//         if (response.status === 200 || response.status === 201) {
//             setSuccessMessage(`Successfully saved ${timeView} plan.`);
//             setCurrentPlan(response.data);
//             setMonthLockMode(response.data.entry_mode);
//         } else { throw new Error(`Server responded with status: ${response.status}`); }
//     } catch (err: any) {
//         let errorMessage = `Failed to save ${timeView} plan.`;
//         if (err.response) { errorMessage += `\nError: ${err.response.data.error || JSON.stringify(err.response.data)}`; } 
//         else { errorMessage += `\nError: ${err.message}`; }
//         setError(errorMessage);
//     } finally { setIsSaving(false); }
//   };

//   const metrics = selectedDepartmentFilter === 'all' ? [...METRIC_TYPES] : [selectedDepartmentFilter];
//   const dynamicDropdowns = [ 
//     { id: 'hq', label: 'HQ', value: selectedHq, onChange: (v: string) => { setSelectedHq(Number(v)); setSelectedFactory(null); setSelectedDepartment(null); setSelectedLine(null); setSelectedSubline(null); setSelectedStation(null); }, options: getHqs() },
//     { id: 'factory', label: 'Factory', value: selectedFactory, onChange: (v: string) => { setSelectedFactory(Number(v)); setSelectedDepartment(null); setSelectedLine(null); setSelectedSubline(null); setSelectedStation(null); }, options: getFactories() },
//     { id: 'department', label: 'Department', value: selectedDepartment, onChange: (v: string) => { setSelectedDepartment(v === 'all' ? 'all' : Number(v)); setSelectedLine(null); setSelectedSubline(null); setSelectedStation(null); }, options: getDepartments() },
//     { id: 'line', label: 'Line', value: selectedLine, onChange: (v: string) => { setSelectedLine(v === 'all' ? 'all' : Number(v)); setSelectedSubline(null); setSelectedStation(null); }, options: getLines() },
//     { id: 'subline', label: 'Subline', value: selectedSubline, onChange: (v:string) => { setSelectedSubline(v === 'all' ? 'all' : Number(v)); setSelectedStation(null); }, options: getSublines() },
//     { id: 'station', label: 'Station', value: selectedStation, onChange: (v: string) => setSelectedStation(v === 'all' ? 'all' : Number(v)), options: getStations() },
//   ];
//   const staticDropdowns = [ 
//     { id: 'departmentFilter', label: 'Metric Filter', value: selectedDepartmentFilter, onChange: (v: string) => setSelectedDepartmentFilter(v as any), options: DEPARTMENTS },
//     { id: 'year', label: 'Year', value: selectedYear, onChange: (v: string) => setSelectedYear(Number(v)), options: YEARS.map(y => ({ value: y, label: y.toString() })) }, 
//     { id: 'month', label: 'Month', value: selectedMonth, onChange: (v: string) => setSelectedMonth(v), options: MONTHS.map(m => ({ value: m, label: m })) }, 
//   ];
//   const viewLabel = timeView === 'Monthly' ? `${selectedMonth} ${selectedYear}` : selectedWeek ? `Week of ${new Date(selectedWeek).toLocaleDateString()}`: 'Weekly';

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="container mx-auto p-4 md:p-6 lg:p-8">
//         <div className="bg-white rounded-xl shadow-lg p-6">
//           <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-8 text-center">Production Plan Dashboard</h1>
//           <div className="flex justify-center mb-8 p-1 bg-gray-100 rounded-lg max-w-md mx-auto">
//             <button onClick={() => setTimeView('Monthly')} disabled={monthLockMode === 'WEEKLY'} className={`px-6 py-2 rounded-md font-semibold w-full transition-colors ${timeView === 'Monthly' ? 'bg-blue-600 text-white shadow' : 'text-gray-600'} ${monthLockMode === 'WEEKLY' ? 'opacity-50 cursor-not-allowed' : ''}`}>Monthly View</button>
//             <button onClick={() => setTimeView('Weekly')} disabled={monthLockMode === 'MONTHLY'} className={`px-6 py-2 rounded-md font-semibold w-full transition-colors ${timeView === 'Weekly' ? 'bg-blue-600 text-white shadow' : 'text-gray-600'} ${monthLockMode === 'MONTHLY' ? 'opacity-50 cursor-not-allowed' : ''}`}>Weekly View</button>
//           </div>
//           {monthLockMode && (<div className="text-center p-2 mb-4 bg-yellow-100 text-yellow-800 rounded-lg">This month has existing data in <strong>{monthLockMode.toLowerCase()}</strong> mode. The view is locked.</div>)}
//           <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8`}>
//             {dynamicDropdowns.map(d => <div key={d.id}><SelectField {...d} disabled={isLoading || (d.id !== 'hq' && !d.options.length)} /></div>)}
//             {staticDropdowns.map(s => <div key={s.id}><SelectField {...s} disabled={isLoading} /></div>)}
//             {timeView === 'Weekly' && (<div><SelectField id="week" label="Week" value={selectedWeek} onChange={v => setSelectedWeek(v)} options={getWeeksForMonth(selectedYear, MONTHS.indexOf(selectedMonth))} /></div>)}
//           </div>
          
//           {isContextComplete() ? (
//               isLoading ? <div className="text-center p-10 text-lg font-semibold text-gray-500">Loading Data...</div> : 
//               <>
//                 <OverallPlanInputs data={currentPlan} onDataChange={handleInputChange} viewLabel={viewLabel} />
//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
//                   {metrics.map(metric => ( <div key={metric} className="lg:col-span-1"><MetricBreakdownTable metric={metric} data={currentPlan} onDataChange={handleInputChange} /></div> ))}
//                 </div>
//                 <SummaryTable data={currentPlan} metrics={metrics} />
//                 <div className="mt-8 mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
//                   <h3 className="text-xl font-bold text-gray-800 mb-4">Additional Information</h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div><label htmlFor="attrition_rate" className="block text-sm font-medium text-gray-700 mb-2">Attrition Rate (%)</label><input type="number" id="attrition_rate" name="attrition_rate" value={currentPlan.attrition_rate ?? ''} onChange={handleAttritionRateChange} min="0" max="100" step="0.1" className="w-full p-2 border border-gray-300 rounded-lg text-base" onFocus={(e) => e.target.select()} /></div>
//                     <div><label htmlFor="absenteeism_rate" className="block text-sm font-medium text-gray-700 mb-2">Absenteeism Rate (%)</label><input type="number" id="absenteeism_rate" name="absenteeism_rate" value={currentPlan.absenteeism_rate ?? ''} onChange={(e) => handleInputChange(e.target.name, Number(e.target.value))} min="0" max="100" step="0.1" className="w-full p-2 border border-gray-300 rounded-lg text-base" onFocus={(e) => e.target.select()} /></div>
//                   </div>
//                 </div>
//                 <div className="flex justify-center mt-6"><button onClick={handleSave} disabled={isSaving || isLoading} className={`px-8 py-3 rounded-lg text-white font-semibold text-lg ${isSaving || isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'} transition-all duration-200`}>{isSaving ? 'Saving...' : `Save ${timeView} Plan`}</button></div>
//               </>
//             ) : <div className="text-center p-10 bg-gray-50 rounded-lg text-gray-600">Please select an option at all available hierarchy levels to view or edit data.</div>}
//         </div>
//       </div>
//       <MessageModal message={successMessage} type="success" onClose={() => setSuccessMessage(null)} />
//       <MessageModal message={error} type="error" onClose={() => setError(null)} />
//     </div>
//   );
// };
// export default Plan;





import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

// ### Configure axios with base URL
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: { 'Content-Type': 'application/json' },
});

// ### Types & Constants
type AggregatedPlan = { id?: number; [key: string]: any; };

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const OPERATORS = ['l1', 'l2', 'l3', 'l4'];
const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);
const DEPARTMENTS = [
  { value: 'all', label: 'All' }, 
  { value: 'ctq', label: 'CTQ' }, 
  { value: 'pdi', 'label': 'PDI' }, 
  { value: 'other', label: 'Other' }
];
const METRIC_TYPES = ['ctq', 'pdi', 'other'] as const;
type MetricType = typeof METRIC_TYPES[number];

// --- INTERFACES FOR COMPONENT STATE ---
interface Station { station_id: number; station_name: string; }
interface Subline { subline_id: number; subline_name: string; stations: Station[]; }
interface Line { line_id: number; line_name: string; sublines: Subline[]; stations: Station[]; }
interface Department { department_id: number; department_name: string; lines: Line[]; stations: Station[]; }
interface FactoryStructure { factory_id: number; factory_name: string; hq: number; departments: Department[]; }
interface HqOption { id: number; name: string; }

// --- INTERFACES FOR API RESPONSE PARSING ---
interface ApiStation { id: number; station_name: string; }
interface ApiSubline { id: number; subline_name: string; stations: ApiStation[]; }
interface ApiLine { id: number; line_name: string; sublines: ApiSubline[]; stations: ApiStation[]; }
interface ApiDepartment { id: number; department_name: string; lines: ApiLine[]; stations: ApiStation[]; }
interface ApiStructureData { hq_name: string; factory_name: string; departments: ApiDepartment[]; }
interface ApiHierarchyResponseItem {
  structure_id: number;
  structure_name: string;
  hq: number;
  hq_name: string;
  factory: number;
  factory_name: string;
  structure_data: ApiStructureData;
}

// --- REUSABLE COMPONENTS ---

const MessageModal = ({ message, type, onClose }: { message: string | null; type: 'success' | 'error'; onClose: () => void; }) => {
  if (!message) return null;
  const bgColor = type === 'success' ? 'bg-green-100' : 'bg-red-100';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const borderColor = type === 'success' ? 'border-green-500' : 'border-red-500';
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-xl shadow-lg p-6 max-w-sm w-full transition-all duration-300 transform scale-100 ${bgColor} border ${borderColor}`}>
        <div className="text-center">
          <p className={`text-lg font-semibold ${textColor} mb-4 whitespace-pre-wrap`}>{message}</p>
          <button onClick={onClose} className="px-6 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"> OK </button>
        </div>
      </div>
    </div>
  );
};

function SelectField({ id, label, value, onChange, options, disabled }: { id: string; label: string; value: string | number | null; onChange: (v: string) => void; options: { value: string | number; label: string; disabled?: boolean }[]; disabled?: boolean; }) {
  return (
    <div className="group">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <select
        id={id}
        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white hover:border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">{disabled ? "Not Available" : `Select ${label}`}</option>
        {options.map((o, index) => (
          <option key={`${id}-${o.value}-${index}`} value={o.value} disabled={o.disabled}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function InputCell({ name, value, onChange, className = "" }: { name: string; value: number; onChange: (name: string, value: number) => void; className?: string; }) {
  const [inputValue, setInputValue] = useState(value ? value.toString() : '0');
  useEffect(() => { setInputValue(value ? value.toString() : '0'); }, [value]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (newValue === '' || !isNaN(Number(newValue))) {
      onChange(name, newValue === '' ? 0 : Number(newValue));
    }
  };
  
  const handleBlur = () => {
    if (inputValue === '' || isNaN(Number(inputValue))) {
      setInputValue('0');
      onChange(name, 0);
    }
  };
  
  return <input type="text" value={inputValue} onChange={handleChange} onBlur={handleBlur} className={`w-full p-2 border border-gray-300 rounded text-center ${className}`} onFocus={(e) => e.target.select()} />;
}

function LargeInputCell({ name, value, onChange, className = "" }: { name: string; value: number; onChange: (name: string, value: number) => void; className?: string; }) {
  const [inputValue, setInputValue] = useState(value ? value.toString() : '0');
  useEffect(() => { setInputValue(value ? value.toString() : '0'); }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (newValue === '' || !isNaN(Number(newValue))) {
      onChange(name, newValue === '' ? 0 : Number(newValue));
    }
  };

  const handleBlur = () => {
    if (inputValue === '' || isNaN(Number(inputValue))) {
      setInputValue('0');
      onChange(name, 0);
    }
  };
  return <input type="text" value={inputValue} onChange={handleChange} onBlur={handleBlur} className={`w-full p-2 border border-gray-300 rounded text-base ${className}`} onFocus={(e) => e.target.select()} />;
}

const OverallPlanInputs = ({ data, onDataChange, viewLabel, calculatedTotals }: { data: AggregatedPlan, onDataChange: (name: string, value: number) => void, viewLabel: string, calculatedTotals: { plan: number; actual: number } }) => (
  <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">{viewLabel} - Overall Plan</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Production Plan (Units)</h3>
        <div className="grid grid-cols-2 gap-4 items-center">
          <label className="font-medium text-gray-600">Plan:</label>
          <LargeInputCell name="total_production_plan" value={data.total_production_plan ?? 0} onChange={onDataChange} />
          <label className="font-medium text-gray-600">Actual:</label>
          <LargeInputCell name="total_production_actual" value={data.total_production_actual ?? 0} onChange={onDataChange} />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Operators Required</h3>
        <div className="grid grid-cols-2 gap-4 items-center">
          <label className="font-medium text-gray-600">Plan (Auto):</label>
          <div className="w-full p-2 border border-blue-200 bg-blue-50 rounded text-base font-bold text-blue-800 text-center">
            {calculatedTotals.plan}
          </div>
          <label className="font-medium text-gray-600">Actual (Auto):</label>
          <div className="w-full p-2 border border-green-200 bg-green-50 rounded text-base font-bold text-green-800 text-center">
            {calculatedTotals.actual}
          </div>
        </div>
      </div>
      <div className="md:col-span-2">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Manpower Availability</h3>
        <div className="grid grid-cols-4 gap-4 items-center">
          <label className="font-medium text-gray-600">Starting Team (Available):</label>
          <LargeInputCell name="total_operators_available" value={data.total_operators_available ?? 0} onChange={onDataChange} />
        </div>
      </div>
    </div>
  </div>
);

const MetricBreakdownTable = ({ metric, data, onDataChange }: { metric: MetricType, data: AggregatedPlan, onDataChange: (name: string, value: number) => void }) => {
  const displayedTotal = (type: 'plan' | 'actual') => OPERATORS.reduce((sum, op) => sum + (Number(data[`${metric}_${type}_${op}`] ?? 0)), 0);
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-1 mb-6">
      <h3 className="text-xl font-bold text-center text-white bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-t-md">{metric.toUpperCase()} Operator Bifurcation</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left font-semibold text-gray-600">Type</th>
              {OPERATORS.map(op => <th key={op} className="p-3 text-center font-semibold text-gray-600">{op.toUpperCase()}</th>)}
              <th className="p-3 text-center font-semibold text-gray-600">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="p-3 font-medium text-gray-700 bg-blue-50">Plan</td>
              {OPERATORS.map(op => (
                <td key={`p-${op}`} className="p-2 text-center bg-blue-50"><InputCell name={`${metric}_plan_${op}`} value={data[`${metric}_plan_${op}`] ?? 0} onChange={onDataChange} /></td>
              ))}
              <td className="p-3 text-center font-bold bg-blue-100 text-blue-800">{displayedTotal('plan')}</td>
            </tr>
            <tr className="border-t">
              <td className="p-3 font-medium text-gray-700 bg-green-50">Actual</td>
              {OPERATORS.map(op => (
                <td key={`a-${op}`} className="p-2 text-center bg-green-50"><InputCell name={`${metric}_actual_${op}`} value={data[`${metric}_actual_${op}`] ?? 0} onChange={onDataChange} /></td>
              ))}
              <td className="p-3 text-center font-bold bg-green-100 text-green-800">{displayedTotal('actual')}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SummaryTable = ({ data, metrics }: { data: AggregatedPlan, metrics: MetricType[] }) => {
  const calcOperatorTotal = (op: string, type: 'plan' | 'actual') => metrics.reduce((s, m) => s + (Number(data[`${m}_${type}_${op}`] ?? 0)), 0);
  const grandTotal = (type: 'plan' | 'actual') => OPERATORS.reduce((s, op) => s + calcOperatorTotal(op, type), 0);
  const gap = (type: 'plan' | 'actual') => (Number(data[`total_operators_required_${type}`] ?? 0)) - grandTotal(type);
  
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-1">
      <h3 className="text-xl font-bold text-center text-white bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-t-md">Overall Summary</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left font-semibold text-gray-600">Type</th>
              {OPERATORS.map(op => <th key={op} className="p-3 text-center font-semibold text-gray-600">{op.toUpperCase()} Total</th>)}
              <th className="p-3 text-center font-semibold text-gray-600">Grand Total</th>
              <th className="p-3 text-center font-semibold text-gray-600">Gap</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="p-3 font-medium text-gray-700 bg-blue-50">Plan</td>
              {OPERATORS.map(op => <td key={`p-${op}`} className="p-3 text-center font-bold bg-purple-100 text-purple-800">{calcOperatorTotal(op, 'plan')}</td>)}
              <td className="p-3 text-center font-bold bg-purple-200 text-purple-900">{grandTotal('plan')}</td>
              <td className={`p-3 text-center font-bold ${gap('plan') !== 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{gap('plan')}</td>
            </tr>
            <tr className="border-t">
              <td className="p-3 font-medium text-gray-700 bg-green-50">Actual</td>
              {OPERATORS.map(op => <td key={`a-${op}`} className="p-3 text-center font-bold bg-purple-100 text-purple-800">{calcOperatorTotal(op, 'actual')}</td>)}
              <td className="p-3 text-center font-bold bg-purple-200 text-purple-900">{grandTotal('actual')}</td>
              <td className={`p-3 text-center font-bold ${gap('actual') !== 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{gap('actual')}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

const Plan = () => {
  // --- STATE ---
  const [timeView, setTimeView] = useState<'Monthly' | 'Weekly'>('Monthly');
  const [monthLockMode, setMonthLockMode] = useState<'MONTHLY' | 'WEEKLY' | null>(null);
  
  const [factoryStructures, setFactoryStructures] = useState<FactoryStructure[]>([]);
  const [hqs, setHqs] = useState<HqOption[]>([]);

  const [selectedHq, setSelectedHq] = useState<number | null>(null);
  const [selectedFactory, setSelectedFactory] = useState<number | null>(null);
  // UPDATED: Removed 'all' from type definitions for hierarchy
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [selectedSubline, setSelectedSubline] = useState<number | null>(null);
  const [selectedStation, setSelectedStation] = useState<number | null>(null);
  
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<'all' | 'ctq' | 'pdi' | 'other'>('all');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<AggregatedPlan>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // --- CALCULATION LOGIC ---
  const metricsForCalculation = useMemo(() => 
    selectedDepartmentFilter === 'all' ? [...METRIC_TYPES] : [selectedDepartmentFilter as MetricType]
  , [selectedDepartmentFilter]);

  const filteredTotals = useMemo(() => {
    const calc = (type: 'plan' | 'actual') => 
      metricsForCalculation.reduce((sum: number, m: MetricType) => 
        sum + OPERATORS.reduce((opSum: number, op: string) => opSum + (Number(currentPlan[`${m}_${type}_${op}`] ?? 0)), 0)
      , 0);
    return { plan: calc('plan'), actual: calc('actual') };
  }, [currentPlan, metricsForCalculation]);

  const grandTotals = useMemo(() => {
    const calc = (type: 'plan' | 'actual') => 
      METRIC_TYPES.reduce((sum: number, m: MetricType) => 
        sum + OPERATORS.reduce((opSum: number, op: string) => opSum + (Number(currentPlan[`${m}_${type}_${op}`] ?? 0)), 0)
      , 0);
    return { plan: calc('plan'), actual: calc('actual') };
  }, [currentPlan]);

  // --- DROPDOWN HELPERS (UPDATED: Removed "All" option) ---
  const getHqs = () => hqs.map(h => ({ value: h.id, label: h.name }));

  const getFactories = (): { value: number; label: string }[] => {
    if (!selectedHq) return [];
    return factoryStructures.filter(f => f.hq === selectedHq).map(f => ({ value: f.factory_id, label: f.factory_name }));
  };

  const getDepartments = (): { value: number; label: string }[] => {
    if (!selectedFactory) return [];
    const factory = factoryStructures.find(f => f.factory_id === selectedFactory);
    if (!factory?.departments?.length) return [];
    // UPDATED: No 'all' option
    return factory.departments.map(d => ({ value: d.department_id, label: d.department_name }));
  };

  const getLines = (): { value: number; label: string }[] => {
    if (!selectedDepartment) return [];
    const factory = factoryStructures.find(f => f.factory_id === selectedFactory);
    const dept = factory?.departments.find(d => d.department_id === selectedDepartment);
    if (!dept?.lines?.length) return [];
    // UPDATED: No 'all' option
    return dept.lines.map(l => ({ value: l.line_id, label: l.line_name }));
  };

  const getSublines = (): { value: number; label: string }[] => {
    if (!selectedLine) return [];
    const factory = factoryStructures.find(f => f.factory_id === selectedFactory);
    const dept = factory?.departments.find(d => d.department_id === selectedDepartment);
    const line = dept?.lines.find(l => l.line_id === selectedLine);
    if (!line?.sublines?.length) return [];
    // UPDATED: No 'all' option
    return line.sublines.map(sl => ({ value: sl.subline_id, label: sl.subline_name }));
  };

  const getStations = (): { value: number; label: string }[] => {
    if (!selectedDepartment) return [];
    const factory = factoryStructures.find(f => f.factory_id === selectedFactory);
    const dept = factory?.departments.find(d => d.department_id === selectedDepartment);
    const line = dept?.lines.find(l => l.line_id === selectedLine);
    const subline = line?.sublines.find(sl => sl.subline_id === selectedSubline);

    let stations: Station[] = [];
    if (selectedSubline && subline?.stations?.length) {
      stations = subline.stations;
    } else if (selectedLine && !selectedSubline && line?.stations?.length) {
      stations = line.stations;
    } else if (!selectedLine && dept?.stations?.length) {
      stations = dept.stations;
    }

    if (!stations.length) return [];
    // UPDATED: No 'all' option
    return stations.map(s => ({ value: s.station_id, label: s.station_name }));
  };
  
  const getWeeksForMonth = (year: number, month: number): { value: string; label: string }[] => { 
    const w = []; 
    const first = new Date(year, month, 1); 
    const last = new Date(year, month + 1, 0); 
    let curr = new Date(first); 
    // Start from the Sunday of the week containing the 1st
    curr.setDate(curr.getDate() - curr.getDay()); 

    while (curr <= last) { 
      const start = new Date(curr); 
      const mid = new Date(start);
      mid.setDate(mid.getDate() + 3); // Midpoint: Wednesday
      
      const midMonth = mid.getMonth();
      // ONLY include if the week's midpoint falls within the TARGET month
      if (midMonth === month) {
          const midMonthName = MONTHS[midMonth];
          
          // Calculate week number in midMonth (Sunday-based)
          const monthFirst = new Date(mid.getFullYear(), midMonth, 1);
          const firstSunday = new Date(monthFirst);
          firstSunday.setDate(firstSunday.getDate() - firstSunday.getDay());
          
          const firstMid = new Date(firstSunday);
          firstMid.setDate(firstMid.getDate() + 3);
          if (firstMid.getMonth() !== midMonth) {
              firstSunday.setDate(firstSunday.getDate() + 7);
          }
          
          const weekNum = Math.floor((mid.getTime() - firstSunday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

          w.push({ 
            value: toYYYYMMDD(start), 
            label: `${midMonthName} Week ${weekNum}` 
          }); 
      }
      curr.setDate(curr.getDate() + 7); 
    } 
    return w; 
  };
  
  const toYYYYMMDD = (date: Date) => new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split("T")[0];

  // ### UPDATED: Context Completeness Logic (Line-level planning) ###
  const isContextComplete = useCallback(() => {
    // Only HQ, Factory, Department, and Line are strictly required now.
    if (!selectedHq || !selectedFactory || !selectedDepartment || !selectedLine) return false;
    
    // Subline and Station are now optional for the plan to be visible.
    return true;
  }, [selectedHq, selectedFactory, selectedDepartment, selectedLine]);


  // --- DATA LOGIC ---
  const fetchData = useCallback(async () => {
    if (!isContextComplete()) return;
    
    setIsLoading(true); setError(null); setCurrentPlan({}); setMonthLockMode(null);

    const monthIndex = MONTHS.indexOf(selectedMonth);
    const monthStartDate = new Date(selectedYear, monthIndex, 1);
    
    // UPDATED: Passed strictly as IDs or null
    const contextParams = {
        Hq: selectedHq,
        factory: selectedFactory,
        department: selectedDepartment,
        line: selectedLine,
        subline: selectedSubline,
        station: selectedStation,
    };

    try {
      const lockStatusRes = await api.get('/production-data/get-month-lock-status/', { params: { ...contextParams, target_date: toYYYYMMDD(monthStartDate) } });
      const lockMode = lockStatusRes.data.lock_mode;
      if (lockMode) { setMonthLockMode(lockMode); setTimeView(lockMode === 'MONTHLY' ? 'Monthly' : 'Weekly'); }

      const dateRange = getSelectedDateRange();
      const dataRes = await api.get('/production-data/get-plan-data/', { params: { ...contextParams, start_date: dateRange.startDate, end_date: dateRange.endDate } });
      setCurrentPlan(dataRes.data || {});
    } catch (err: any) {
      if (err.response?.status === 404) {
        setCurrentPlan({});
        try {
          const prevMonthDate = new Date(selectedYear, monthIndex - 1, 1);
          const endingTeamRes = await api.get('/production-data/get-ending-team/', { params: { ...contextParams, target_date: toYYYYMMDD(prevMonthDate) } });
          if (endingTeamRes.data?.ending_team > 0) {
            setCurrentPlan(prev => ({ ...prev, total_operators_available: endingTeamRes.data.ending_team }));
          }
        } catch (autoFillErr) { console.log("Could not auto-fill starting team."); }
      } else { setError('Failed to load plan data.'); }
    } finally { setIsLoading(false); }
  }, [isContextComplete, selectedHq, selectedFactory, selectedDepartment, selectedLine, selectedSubline, selectedStation, selectedMonth, selectedYear, selectedWeek, timeView]);
  
  const getSelectedDateRange = () => {
    const monthIndex = MONTHS.indexOf(selectedMonth);
    let startDate, endDate;
    if (timeView === 'Weekly' && selectedWeek) {
        startDate = new Date(selectedWeek);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
    } else {
        startDate = new Date(selectedYear, monthIndex, 1);
        endDate = new Date(selectedYear, monthIndex + 1, 0);
    }
    return { startDate: toYYYYMMDD(startDate), endDate: toYYYYMMDD(endDate) };
  };

  useEffect(() => {
    const fetchAndProcessStructures = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<ApiHierarchyResponseItem[]>('/hierarchy-simple/');
        const apiData = response.data;
        
        const factoriesMap = new Map<number, FactoryStructure>();
        const hqMap = new Map<number, string>();

        apiData.forEach(item => {
            if (item.hq && item.hq_name && !hqMap.has(item.hq)) { hqMap.set(item.hq, item.hq_name); }
            if (!item.factory || !item.factory_name) return;

            let factory = factoriesMap.get(item.factory);
            if (!factory) {
                factory = { factory_id: item.factory, factory_name: item.factory_name, hq: item.hq, departments: [] };
                factoriesMap.set(item.factory, factory);
            }

            item.structure_data?.departments?.forEach(deptData => {
                if (!deptData.id || !deptData.department_name) return;
                let department = factory.departments.find(d => d.department_id === deptData.id);
                if (!department) {
                    department = { department_id: deptData.id, department_name: deptData.department_name, lines: [], stations: [] };
                    factory.departments.push(department);
                }

                deptData.stations?.forEach(stationData => {
                    if (!department.stations.some(s => s.station_id === stationData.id)) {
                        department.stations.push({ station_id: stationData.id, station_name: stationData.station_name });
                    }
                });

                deptData.lines?.forEach(lineData => {
                    let line = department.lines.find(l => l.line_id === lineData.id);
                    if (!line) {
                        line = { line_id: lineData.id, line_name: lineData.line_name, sublines: [], stations: [] };
                        department.lines.push(line);
                    }

                    lineData.stations?.forEach(stationData => {
                        if (!line.stations.some(s => s.station_id === stationData.id)) {
                            line.stations.push({ station_id: stationData.id, station_name: stationData.station_name });
                        }
                    });

                    lineData.sublines?.forEach(sublineData => {
                        let subline = line.sublines.find(sl => sl.subline_id === sublineData.id);
                        if (!subline) {
                            subline = { subline_id: sublineData.id, subline_name: sublineData.subline_name, stations: [] };
                            line.sublines.push(subline);
                        }
                        
                        sublineData.stations?.forEach(stationData => {
                            if (!subline.stations.some(s => s.station_id === stationData.id)) {
                                subline.stations.push({ station_id: stationData.id, station_name: stationData.station_name });
                            }
                        });
                    });
                });
            });
        });

        const nestedStructures = Array.from(factoriesMap.values());
        setFactoryStructures(nestedStructures);
        const uniqueHqs = Array.from(hqMap, ([id, name]) => ({ id, name }));
        setHqs(uniqueHqs);
        
        if (uniqueHqs.length > 0) {
            const firstHqId = uniqueHqs[0].id;
            setSelectedHq(firstHqId);
            const firstFactory = nestedStructures.find(f => f.hq === firstHqId);
            if (firstFactory) {
                setSelectedFactory(firstFactory.factory_id);
                // UPDATED: Initialize with null so user must select specific items
                setSelectedDepartment(null);
                setSelectedLine(null);
                setSelectedSubline(null);
                setSelectedStation(null);
            }
        }
      } catch (err) { setError('Failed to load factory structure data.'); } 
      finally { setIsLoading(false); }
    };
    fetchAndProcessStructures();
  }, []);

  useEffect(() => { if (timeView === 'Weekly') { const monthIndex = MONTHS.indexOf(selectedMonth); const weeks = getWeeksForMonth(selectedYear, monthIndex); if (weeks.length > 0 && !selectedWeek) { setSelectedWeek(weeks[0].value); } else if (weeks.length === 0) { setSelectedWeek(null); } } else { setSelectedWeek(null); } }, [selectedMonth, selectedYear, timeView, selectedWeek]);
  
  useEffect(() => { 
    if (isContextComplete()) { 
      fetchData(); 
    }
  }, [isContextComplete, fetchData]);

  const handleInputChange = (name: string, value: number) => setCurrentPlan(prev => ({ ...prev, [name]: value }));
  const handleAttritionRateChange = (e: React.ChangeEvent<HTMLInputElement>) => { const v = e.target.value === '' ? 0 : parseFloat(e.target.value); if (!isNaN(v) && v >= 0 && v <= 100) setCurrentPlan(p => ({ ...p, attrition_rate: v })); };
  
  const handleSave = async () => {
    if (!isContextComplete()) { setError('Please select an option at all hierarchy levels.'); return; }
    setIsSaving(true); setError(null);
    try {
        const { startDate, endDate } = getSelectedDateRange();
        // UPDATED: No need to check for 'all' anymore
        const payload = { 
          ...currentPlan, 
          id: currentPlan.id || null, 
          start_date: startDate, 
          end_date: endDate, 
          entry_mode: timeView.toUpperCase(), 
          Hq: selectedHq, 
          factory: selectedFactory, 
          department: selectedDepartment, 
          line: selectedLine, 
          subline: selectedSubline,
          station: selectedStation,
          // ALWAYS save the Grand Total to the database
          total_operators_required_plan: grandTotals.plan,
          total_operators_required_actual: grandTotals.actual,
        };
        const response = await api.post('/production-data/save-plan-entry/', payload);
        if (response.status === 200 || response.status === 201) {
            setSuccessMessage(`Successfully saved ${timeView} plan.`);
            setCurrentPlan(response.data);
            setMonthLockMode(response.data.entry_mode);
        } else { throw new Error(`Server responded with status: ${response.status}`); }
    } catch (err: any) {
        let errorMessage = `Failed to save ${timeView} plan.`;
        if (err.response) { errorMessage += `\nError: ${err.response.data.error || JSON.stringify(err.response.data)}`; } 
        else { errorMessage += `\nError: ${err.message}`; }
        setError(errorMessage);
    } finally { setIsSaving(false); }
  };

  const metrics = selectedDepartmentFilter === 'all' ? [...METRIC_TYPES] : [selectedDepartmentFilter];
  
  // UPDATED: Dynamic dropdowns now parse strings to numbers, no 'all' check needed
  const dynamicDropdowns = [ 
    { id: 'hq', label: 'HQ', value: selectedHq, onChange: (v: string) => { setSelectedHq(Number(v)); setSelectedFactory(null); setSelectedDepartment(null); setSelectedLine(null); setSelectedSubline(null); setSelectedStation(null); }, options: getHqs() },
    { id: 'factory', label: 'Factory', value: selectedFactory, onChange: (v: string) => { setSelectedFactory(Number(v)); setSelectedDepartment(null); setSelectedLine(null); setSelectedSubline(null); setSelectedStation(null); }, options: getFactories() },
    { id: 'department', label: 'Department', value: selectedDepartment, onChange: (v: string) => { setSelectedDepartment(Number(v)); setSelectedLine(null); setSelectedSubline(null); setSelectedStation(null); }, options: getDepartments() },
    { id: 'line', label: 'Line', value: selectedLine, onChange: (v: string) => { setSelectedLine(Number(v)); setSelectedSubline(null); setSelectedStation(null); }, options: getLines() },
    { id: 'subline', label: 'Subline', value: selectedSubline, onChange: (v:string) => { setSelectedSubline(Number(v)); setSelectedStation(null); }, options: getSublines() },
    { id: 'station', label: 'Station', value: selectedStation, onChange: (v: string) => setSelectedStation(Number(v)), options: getStations() },
  ];
  
  const staticDropdowns = [ 
    { id: 'departmentFilter', label: 'Metric Filter', value: selectedDepartmentFilter, onChange: (v: string) => setSelectedDepartmentFilter(v as any), options: DEPARTMENTS },
    { id: 'year', label: 'Year', value: selectedYear, onChange: (v: string) => setSelectedYear(Number(v)), options: YEARS.map(y => ({ value: y, label: y.toString() })) }, 
    { id: 'month', label: 'Month', value: selectedMonth, onChange: (v: string) => setSelectedMonth(v), options: MONTHS.map(m => ({ value: m, label: m })) }, 
  ];
  const viewLabel = useMemo(() => {
    if (timeView === 'Monthly') return `${selectedMonth} ${selectedYear}`;
    if (timeView === 'Weekly' && selectedWeek) {
        const weeks = getWeeksForMonth(selectedYear, MONTHS.indexOf(selectedMonth));
        const currentWeek = weeks.find(w => w.value === selectedWeek);
        return currentWeek ? `${currentWeek.label} - Overall Plan` : 'Weekly Plan';
    }
    return 'Weekly Plan';
  }, [timeView, selectedMonth, selectedYear, selectedWeek]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-8 text-center">Production Plan Dashboard</h1>
          <div className="flex justify-center mb-8 p-1 bg-gray-100 rounded-lg max-w-md mx-auto">
            <button onClick={() => setTimeView('Monthly')} disabled={monthLockMode === 'WEEKLY'} className={`px-6 py-2 rounded-md font-semibold w-full transition-colors ${timeView === 'Monthly' ? 'bg-blue-600 text-white shadow' : 'text-gray-600'} ${monthLockMode === 'WEEKLY' ? 'opacity-50 cursor-not-allowed' : ''}`}>Monthly View</button>
            <button onClick={() => setTimeView('Weekly')} disabled={monthLockMode === 'MONTHLY'} className={`px-6 py-2 rounded-md font-semibold w-full transition-colors ${timeView === 'Weekly' ? 'bg-blue-600 text-white shadow' : 'text-gray-600'} ${monthLockMode === 'MONTHLY' ? 'opacity-50 cursor-not-allowed' : ''}`}>Weekly View</button>
          </div>
          {monthLockMode && (<div className="text-center p-2 mb-4 bg-yellow-100 text-yellow-800 rounded-lg">This month has existing data in <strong>{monthLockMode.toLowerCase()}</strong> mode. The view is locked.</div>)}
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8`}>
            {dynamicDropdowns.map(d => <div key={d.id}><SelectField {...d} disabled={isLoading || (d.id !== 'hq' && !d.options.length)} /></div>)}
            {staticDropdowns.map(s => <div key={s.id}><SelectField {...s} disabled={isLoading} /></div>)}
            {timeView === 'Weekly' && (<div><SelectField id="week" label="Week" value={selectedWeek} onChange={v => setSelectedWeek(v)} options={getWeeksForMonth(selectedYear, MONTHS.indexOf(selectedMonth))} /></div>)}
          </div>
          
          {isContextComplete() ? (
              isLoading ? <div className="text-center p-10 text-lg font-semibold text-gray-500">Loading Data...</div> : 
              <>
                <OverallPlanInputs data={currentPlan} onDataChange={handleInputChange} viewLabel={viewLabel} calculatedTotals={filteredTotals} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  {metrics.map(metric => ( <div key={metric} className="lg:col-span-1"><MetricBreakdownTable metric={metric} data={currentPlan} onDataChange={handleInputChange} /></div> ))}
                </div>
                <SummaryTable data={currentPlan} metrics={metrics} />
                <div className="mt-8 mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Additional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label htmlFor="attrition_rate" className="block text-sm font-medium text-gray-700 mb-2">Attrition Rate (%)</label><input type="number" id="attrition_rate" name="attrition_rate" value={currentPlan.attrition_rate ?? ''} onChange={handleAttritionRateChange} min="0" max="100" step="0.1" className="w-full p-2 border border-gray-300 rounded-lg text-base" onFocus={(e) => e.target.select()} /></div>
                    <div><label htmlFor="absenteeism_rate" className="block text-sm font-medium text-gray-700 mb-2">Absenteeism Rate (%)</label><input type="number" id="absenteeism_rate" name="absenteeism_rate" value={currentPlan.absenteeism_rate ?? ''} onChange={(e) => handleInputChange(e.target.name, Number(e.target.value))} min="0" max="100" step="0.1" className="w-full p-2 border border-gray-300 rounded-lg text-base" onFocus={(e) => e.target.select()} /></div>
                  </div>
                </div>
                <div className="flex justify-center mt-6"><button onClick={handleSave} disabled={isSaving || isLoading} className={`px-8 py-3 rounded-lg text-white font-semibold text-lg ${isSaving || isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'} transition-all duration-200`}>{isSaving ? 'Saving...' : `Save ${timeView} Plan`}</button></div>
              </>
            ) : <div className="text-center p-10 bg-gray-50 rounded-lg text-gray-600">Please select an option at all available hierarchy levels to view or edit data.</div>}
        </div>
      </div>
      <MessageModal message={successMessage} type="success" onClose={() => setSuccessMessage(null)} />
      <MessageModal message={error} type="error" onClose={() => setError(null)} />
    </div>
  );
};
export default Plan;