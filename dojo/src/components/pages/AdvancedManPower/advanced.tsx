


import { useState, useEffect, useMemo } from "react";
// import Nav from "../HomeNav/nav";
import CardProps from "./AdvanceCard/Cardprops";
import Absenteeism from "./Graphs/Absenteeism/absenteeism";
import AttritionTrendChart from "./Graphs/Attrition/attrition";
import BufferManpowerAvailability from "./Graphs/BufferManpowerAvailability/BufferManpower";
import ManpowerTrendChart from "./Graphs/Manpower/Manpower";
import MonthPlanning from "./Graphs/MonthPlanning/MonthPlanning";
import OperatorStatsRedirect from "./OperatorStats/OperatorStatsRedirect";

// --- Interfaces for Component State ---
interface Station {
  station_id: number;
  station_name: string;
}

interface Subline {
  subline_id: number;
  subline_name: string;
  stations: Station[];
}

interface Line {
  line_id: number;
  line_name: string;
  sublines: Subline[];
  stations: Station[]; // Station can belong directly to a Line
}

interface Department {
  department_id: number;
  department_name: string;
  lines: Line[];
  stations: Station[]; // Station can belong directly to a Department
}

interface FactoryStructure {
  factory_id: number;
  factory_name: string;
  hq: number;
  departments: Department[];
}

interface HqOption {
  id: number;
  name: string;
}

// --- Interfaces for API Response Parsing ---
interface ApiStation {
  id: number;
  station_name: string;
}

interface ApiSubline {
  id: number;
  subline_name: string;
  stations: ApiStation[];
}

interface ApiLine {
  id: number;
  line_name: string;
  sublines: ApiSubline[];
  stations: ApiStation[];
}

interface ApiDepartment {
  id: number;
  department_name: string;
  lines: ApiLine[];
  stations: ApiStation[];
}

interface ApiStructureData {
  hq_name: string;
  factory_name: string;
  departments: ApiDepartment[];
}

interface ApiHierarchyResponseItem {
  structure_id: number;
  structure_name: string;
  hq: number;
  hq_name: string;
  factory: number;
  factory_name: string;
  structure_data: ApiStructureData;
}


interface PlanData {
  [key: string]: any;
}

interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

// --- Constants & Helper Functions ---
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const toYYYYMMDD = (date: Date) => new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split("T")[0];

const getFYLabel = (startYear: number) => `FY ${startYear}-${startYear + 1}`;

const getCurrentFYStartYear = () => {
  const now = new Date();
  return now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
};

const getActualYearForMonth = (monthName: string, fyStartYear: number) => {
  const monthIndex = MONTHS.indexOf(monthName);
  return monthIndex < 3 ? fyStartYear + 1 : fyStartYear;
};

const getWeeksForMonth = (year: number, month: string) => {
  const weeks: { value: string; label: string }[] = [];
  const monthIndex = MONTHS.indexOf(month);
  if (monthIndex < 0) return [];
  const actualYear = monthIndex < 3 ? year + 1 : year;

  const firstDayOfMonth = new Date(actualYear, monthIndex, 1);
  const lastDayOfMonth = new Date(actualYear, monthIndex + 1, 0);

  let currentWeekStart = new Date(firstDayOfMonth);
  currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay()); // Sunday start

  while (currentWeekStart <= lastDayOfMonth) {
    const weekStartDate = new Date(currentWeekStart);
    const mid = new Date(weekStartDate);
    mid.setDate(mid.getDate() + 3); // Wednesday midpoint

    const midMonthIndex = mid.getMonth();
    
    // ONLY include if the week's midpoint falls within the TARGET month
    if (midMonthIndex === monthIndex) {
        const midMonthName = MONTHS[midMonthIndex];

        // Calculate week number in midMonthName (Sunday-based)
        const monthFirst = new Date(mid.getFullYear(), midMonthIndex, 1);
        const firstSunday = new Date(monthFirst);
        firstSunday.setDate(firstSunday.getDate() - firstSunday.getDay());
        
        const firstMid = new Date(firstSunday);
        firstMid.setDate(firstMid.getDate() + 3);
        if (firstMid.getMonth() !== midMonthIndex) {
            firstSunday.setDate(firstSunday.getDate() + 7);
        }
        
        const weekNum = Math.floor((mid.getTime() - firstSunday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

        weeks.push({
          value: toYYYYMMDD(weekStartDate),
          label: `${midMonthName} Week ${weekNum}`
        });
    }
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  }
  return weeks;
};

const Advanced = () => {
  // --- State Declarations ---
  const [factoryStructures, setFactoryStructures] = useState<FactoryStructure[]>([]);
  const [hqs, setHqs] = useState<HqOption[]>([]);

  const [selectedHq, setSelectedHq] = useState<number | null>(null);
  const [selectedFactory, setSelectedFactory] = useState<number | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [selectedSubline, setSelectedSubline] = useState<number | null>(null);
  const [selectedStation, setSelectedStation] = useState<number | null>(null);

  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState({ factories: true, planData: false });
  const [error, setError] = useState<string | null>(null);
  const [timeView, setTimeView] = useState<'Monthly' | 'Weekly'>('Monthly');
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toLocaleString('default', { month: 'long' }));
  const [selectedYear, setSelectedYear] = useState<number>(getCurrentFYStartYear());
  const [monthLockMode, setMonthLockMode] = useState<'daily' | 'weekly' | 'monthly' | null>(null);
  const [isCheckingLock, setIsCheckingLock] = useState(false);

  // --- useEffects ---
  useEffect(() => {
    const fetchAndProcessStructures = async () => {
      try {
        const response = await fetch("http://172.25.0.51:8000/hierarchy-simple/");
        if (!response.ok) throw new Error("Failed to fetch factory structures");
        const apiData: ApiHierarchyResponseItem[] = await response.json();

        const factoriesMap = new Map<number, FactoryStructure>();
        const hqMap = new Map<number, string>();

        apiData.forEach(item => {
          // Populate unique HQs
          if (item.hq && item.hq_name && !hqMap.has(item.hq)) {
            hqMap.set(item.hq, item.hq_name);
          }

          if (!item.factory || !item.factory_name) return;

          // Get or create the Factory object
          let factory = factoriesMap.get(item.factory);
          if (!factory) {
            factory = {
              factory_id: item.factory,
              factory_name: item.factory_name,
              hq: item.hq,
              departments: [],
            };
            factoriesMap.set(item.factory, factory);
          }

          // Process departments from the nested structure_data
          item.structure_data?.departments?.forEach(deptData => {
            if (!deptData.id || !deptData.department_name) return;

            // Get or create the Department object
            let department = factory.departments.find(d => d.department_id === deptData.id);
            if (!department) {
              department = {
                department_id: deptData.id,
                department_name: deptData.department_name,
                lines: [],
                stations: [],
              };
              factory.departments.push(department);
            }

            // Add stations directly under the department, ensuring no duplicates
            deptData.stations?.forEach(stationData => {
              const stationExists = department.stations.some(s => s.station_id === stationData.id);
              if (!stationExists) {
                department.stations.push({
                  station_id: stationData.id,
                  station_name: stationData.station_name,
                });
              }
            });

            // Process lines under the department
            deptData.lines?.forEach(lineData => {
              if (!lineData.id || !lineData.line_name) return;

              let line = department.lines.find(l => l.line_id === lineData.id);
              if (!line) {
                line = {
                  line_id: lineData.id,
                  line_name: lineData.line_name,
                  sublines: [],
                  stations: []
                };
                department.lines.push(line);
              }

              // Add stations directly under the line
              lineData.stations?.forEach(stationData => {
                const stationExists = line.stations.some(s => s.station_id === stationData.id);
                if (!stationExists) {
                  line.stations.push({ station_id: stationData.id, station_name: stationData.station_name });
                }
              });

              // Process sublines under the line
              lineData.sublines?.forEach(sublineData => {
                if (!sublineData.id || !sublineData.subline_name) return;

                let subline = line.sublines.find(sl => sl.subline_id === sublineData.id);
                if (!subline) {
                  subline = {
                    subline_id: sublineData.id,
                    subline_name: sublineData.subline_name,
                    stations: []
                  };
                  line.sublines.push(subline);
                }

                // Add stations under the subline
                sublineData.stations?.forEach(stationData => {
                  const stationExists = subline.stations.some(s => s.station_id === stationData.id);
                  if (!stationExists) {
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

        // Set default dropdown values based on the first available data
        if (nestedStructures.length > 0) {
          const firstFactory = nestedStructures[0];
          setSelectedHq(firstFactory.hq);
          setSelectedFactory(firstFactory.factory_id);

          const firstDept = firstFactory.departments?.[0];
          if (firstDept) {
            setSelectedDepartment(firstDept.department_id);
            const firstLine = firstDept.lines?.[0];
            if (firstLine) {
              setSelectedLine(firstLine.line_id);
              // Subline and Station are deliberately NOT auto-selected
              // to support Line-level viewing by default.
              setSelectedSubline(null);
              setSelectedStation(null);
            }
          }
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error processing hierarchy");
      } finally {
        setLoading(prev => ({ ...prev, factories: false }));
      }
    };
    fetchAndProcessStructures();
  }, []);

  useEffect(() => {
    if (timeView === 'Weekly') {
      const weeks = getWeeksForMonth(selectedYear, selectedMonth);
      setSelectedWeek(weeks.length > 0 ? weeks[0].value : '');
    } else {
      setSelectedWeek('');
    }
  }, [selectedMonth, selectedYear, timeView]);

  useEffect(() => {
    const checkLockStatus = async () => {
      if (!selectedFactory || !selectedYear || !selectedMonth) {
        setMonthLockMode(null);
        return;
      }
      setIsCheckingLock(true);
      try {
        const monthIndex = MONTHS.indexOf(selectedMonth);
        const actualYear = getActualYearForMonth(selectedMonth, selectedYear);
        const targetDate = `${actualYear}-${String(monthIndex + 1).padStart(2, '0')}-01`;

        const params = new URLSearchParams({ factory: selectedFactory.toString(), target_date: targetDate });
        if (selectedHq) params.set('hq', selectedHq.toString());
        if (selectedDepartment) params.set('department', selectedDepartment.toString());
        if (selectedLine) params.set('line', selectedLine.toString());
        if (selectedSubline) params.set('subline', selectedSubline.toString());
        if (selectedStation) params.set('station', selectedStation.toString());

        const response = await fetch(`http://172.25.0.51:8000/production-data/get-month-lock-status/?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch lock status');

        const data = await response.json();
        const lockMode = data.lock_mode ? data.lock_mode.toLowerCase() : null;
        setMonthLockMode(lockMode);

        if (lockMode === 'monthly' && timeView !== 'Weekly') {
          setTimeView('Monthly');
        }
      } catch (err) {
        console.error("Error checking month lock status:", err);
        setMonthLockMode(null);
      } finally {
        setIsCheckingLock(false);
      }
    };
    checkLockStatus();
  }, [selectedHq, selectedFactory, selectedDepartment, selectedLine, selectedSubline, selectedStation, selectedYear, selectedMonth, timeView]);

  useEffect(() => {
    const fetchCardData = async () => {
      if (!selectedFactory) {
        setPlanData(null);
        return;
      }
      setLoading(prev => ({ ...prev, planData: true }));
      setError(null);
      let response: Response | undefined;
      try {
        const baseParams = new URLSearchParams({ factory: selectedFactory.toString() });
        if (selectedHq) baseParams.set('hq', selectedHq.toString());
        if (selectedDepartment) baseParams.set('department', selectedDepartment.toString());
        if (selectedLine) baseParams.set('line', selectedLine.toString());
        if (selectedSubline) baseParams.set('subline', selectedSubline.toString());
        if (selectedStation) baseParams.set('station', selectedStation.toString());

        if (timeView === 'Monthly') {
          const monthNumber = MONTHS.indexOf(selectedMonth) + 1;
          baseParams.set('month', String(monthNumber));
          baseParams.set('year', selectedYear.toString());  // Pass FY start year
          response = await fetch(`http://172.25.0.51:8000/production-data/monthly-summary/?${baseParams.toString()}`);
        } else if (timeView === 'Weekly' && selectedWeek) {
          baseParams.set('start_date', selectedWeek);
          response = await fetch(`http://172.25.0.51:8000/production-data/aggregated-weekly-data/?${baseParams.toString()}`);
        } else {
          setPlanData(null);
          setLoading(prev => ({ ...prev, planData: false }));
          return;
        }

        if (response && response.ok) {
          const data = await response.json();
          setPlanData(Object.keys(data).length > 0 ? data : null);
        } else if (response) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        setPlanData(null);
      } finally {
        setLoading(prev => ({ ...prev, planData: false }));
      }
    };
    fetchCardData();
  }, [selectedHq, selectedFactory, selectedDepartment, selectedLine, selectedSubline, selectedStation, selectedMonth, selectedYear, timeView, selectedWeek]);

  const dateRange = useMemo<DateRange>(() => {
    if (!selectedYear) return { startDate: null, endDate: null };
    if (timeView === 'Monthly') {
      return { startDate: `${selectedYear}-04-01`, endDate: `${selectedYear + 1}-03-31` };
    }
    if (timeView === 'Weekly') {
      if (!selectedMonth) return { startDate: null, endDate: null };
      const monthIndex = MONTHS.indexOf(selectedMonth);
      if (monthIndex < 0) return { startDate: null, endDate: null };
      const actualYear = getActualYearForMonth(selectedMonth, selectedYear);
      const startDate = `${actualYear}-${String(monthIndex + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(actualYear, monthIndex + 1, 0).getDate();
      const endDate = `${actualYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      return { startDate, endDate };
    }
    return { startDate: null, endDate: null };
  }, [timeView, selectedYear, selectedMonth]);

  const handleSelectChange = (type: string, value: string) => {
    const numValue = value ? parseInt(value) : null;
    switch (type) {
      case "hq": setSelectedHq(numValue); setSelectedFactory(null); setSelectedDepartment(null); setSelectedLine(null); setSelectedSubline(null); setSelectedStation(null); break;
      case "factory": setSelectedFactory(numValue); setSelectedDepartment(null); setSelectedLine(null); setSelectedSubline(null); setSelectedStation(null); break;
      case "department": setSelectedDepartment(numValue); setSelectedLine(null); setSelectedSubline(null); setSelectedStation(null); break;
      case "line": setSelectedLine(numValue); setSelectedSubline(null); setSelectedStation(null); break;
      case "subline": setSelectedSubline(numValue); setSelectedStation(null); break;
      case "station": setSelectedStation(numValue); break;
      case "month": setSelectedMonth(value); break;
      case "year": if (numValue) setSelectedYear(numValue); break;
      case "week": setSelectedWeek(value); break;
    }
  };

  const getOptions = (type: string) => {
    const factory = factoryStructures.find(f => f.factory_id === selectedFactory);
    const department = factory?.departments.find(d => d.department_id === selectedDepartment);
    const line = department?.lines.find(l => l.line_id === selectedLine);
    const subline = line?.sublines.find(sl => sl.subline_id === selectedSubline);

    switch (type) {
      case "hq": return hqs.map(h => ({ value: h.id, label: h.name }));
      case "factory": return selectedHq ? factoryStructures.filter(f => f.hq === selectedHq).map(f => ({ value: f.factory_id, label: f.factory_name })) : [];
      case "department": return factory?.departments.map(d => ({ value: d.department_id, label: d.department_name })) || [];
      case "line": return department?.lines.map(l => ({ value: l.line_id, label: l.line_name })) || [];
      case "subline": return line?.sublines.map(sl => ({ value: sl.subline_id, label: sl.subline_name })) || [];

      case "station":
        // This logic correctly checks for stations at the most specific level first
        if (selectedSubline && subline?.stations?.length) {
          return subline.stations.map(s => ({ value: s.station_id, label: s.station_name }));
        }
        if (selectedLine && !selectedSubline && line?.stations?.length) {
          return line.stations.map(s => ({ value: s.station_id, label: s.station_name }));
        }
        if (selectedDepartment && !selectedLine && department?.stations?.length) {
          return department.stations.map(s => ({ value: s.station_id, label: s.station_name }));
        }
        return [];

      case "month": return MONTHS.map(m => ({ value: m, label: m }));
      case "year": { 
        const currentFYStart = getCurrentFYStartYear(); 
        return Array.from({ length: 5 }, (_, i) => {
            const startYear = currentFYStart - i;
            return { value: startYear, label: getFYLabel(startYear) };
        });
      }
      case "week": return getWeeksForMonth(selectedYear, selectedMonth);
      default: return [];
    }
  };

  const renderSelect = (type: string, label: string) => {
    const options = getOptions(type);
    const valueMap: { [key: string]: string | number | null } = {
      hq: selectedHq, factory: selectedFactory, department: selectedDepartment,
      line: selectedLine, subline: selectedSubline, station: selectedStation,
      month: selectedMonth, year: selectedYear, week: selectedWeek
    };
    const value = valueMap[type] || "";

    // Determine if the dropdown should be disabled
    let isDisabled = false;
    if (type !== 'hq' && type !== 'month' && type !== 'year' && type !== 'week') {
      const parentMap: { [key: string]: number | null } = {
        factory: selectedHq,
        department: selectedFactory,
        line: selectedDepartment,
        subline: selectedLine,
        station: selectedDepartment, // Station depends on dept, line, or subline
      };
      isDisabled = !parentMap[type] || options.length === 0;
    } else {
      isDisabled = options.length === 0;
    }

    const icons: { [key: string]: string } = {
      hq: "🌐", factory: "🏭", department: "👥", line: "⚙️",
      subline: "🔗", station: "📍", month: "📅", year: "📆", week: "🗓️"
    };

    return (
      <div className="relative group">
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider"><span className="text-lg">{icons[type]}</span>{label}</label>
        <div className="relative">
          <select className="w-full appearance-none rounded-xl border-2 border-gray-200 bg-white py-3 pl-4 pr-10 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-purple-400 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-100 disabled:bg-gray-50 disabled:cursor-not-allowed" onChange={(e) => handleSelectChange(type, e.target.value)} value={String(value)} disabled={isDisabled}>
            <option value="">{isDisabled ? "Not Available" : `Choose ${label}`}</option>
            {options.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"><svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
        </div>
      </div>
    );
  };

  const bifurcationSubtopics = [{ dataKey: 'bifurcation_plan_l1', displayText: 'Bifurcation Plan L1' }, { dataKey: 'bifurcation_actual_l1', displayText: 'Bifurcation Actual L1' }, { dataKey: 'bifurcation_plan_l2', displayText: 'Bifurcation Plan L2' }, { dataKey: 'bifurcation_actual_l2', displayText: 'Bifurcation Actual L2' }, { dataKey: 'bifurcation_plan_l3', displayText: 'Bifurcation Plan L3' }, { dataKey: 'bifurcation_actual_l3', displayText: 'Bifurcation Actual L3' }, { dataKey: 'bifurcation_plan_l4', displayText: 'Bifurcation Plan L4' }, { dataKey: 'bifurcation_actual_l4', displayText: 'Bifurcation Actual L4' },];
  const bifurcationCardColors = ["#6695b4ff", "rgba(91, 130, 156, 1)", "#807eecff", "#625edbff", "#4adf8aff", "#2ab968ff", "#f85252ff", "#e43838ff"];

  return (
    <>
      {/* <Nav /> */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 shadow-xl"><h1 className="text-3xl md:text-4xl font-bold text-white text-center py-8">Advance Production Plan Dashboard</h1></div>
      <div className="bg-white shadow-xl border-b border-gray-100 p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-9 gap-3 sm:gap-4">
          <div className="xl:col-span-1">{renderSelect("hq", "HQ")}</div>
          <div className="xl:col-span-1">{renderSelect("factory", "Factory")}</div>
          <div className="xl:col-span-1">{renderSelect("department", "Department")}</div>
          <div className="xl:col-span-1">{renderSelect("line", "Line")}</div>
          <div className="xl:col-span-1">{renderSelect("subline", "Subline")}</div>
          <div className="xl:col-span-1">{renderSelect("station", "Station")}</div>
          <div className="xl:col-span-1 flex items-end">
            <div className="flex flex-col w-full mt-7">
              <div className="p-1 bg-gray-200 rounded-xl flex w-full">
                <button onClick={() => setTimeView('Monthly')} disabled={isCheckingLock} className={`w-1/2 py-2.5 rounded-lg text-sm font-semibold transition-colors ${timeView === 'Monthly' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-600'} disabled:bg-gray-300 disabled:cursor-not-allowed`}>Monthly</button>
                <button onClick={() => setTimeView('Weekly')} disabled={isCheckingLock || monthLockMode === 'monthly'} className={`w-1/2 py-2.5 rounded-lg text-sm font-semibold transition-colors ${timeView === 'Weekly' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-600'} disabled:bg-gray-300 disabled:cursor-not-allowed`}>Weekly</button>
              </div>
              {monthLockMode === 'monthly' && (<p className="text-xs text-purple-700 mt-2 text-center">Weekly view is disabled for this month.</p>)}
            </div>
          </div>
          <div className="xl:col-span-1">{renderSelect("year", "Year")}</div>
          <div className="xl:col-span-1">{renderSelect("month", "Month")}</div>
          {timeView === 'Weekly' && <div className="xl:col-span-1">{renderSelect("week", "Week")}</div>}
        </div>
      </div>

      {loading.factories ? (
        <div className="p-6 text-center text-gray-500">
          <p>Loading hierarchy...</p>
        </div>
      ) : selectedFactory && selectedYear && dateRange.startDate ? (
        <>
          <div className="p-6 bg-gray-50">
            <div className="mb-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <CardProps subtopics={bifurcationSubtopics} data={planData as Record<string, number>} loading={loading.planData} cardColors={bifurcationCardColors} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow min-h-[400px]">
                <ManpowerTrendChart selectedHqId={selectedHq} selectedFactoryId={selectedFactory} selectedDepartmentId={selectedDepartment} selectedLineId={selectedLine} selectedSublineId={selectedSubline} selectedStationId={selectedStation} startDate={dateRange.startDate} endDate={dateRange.endDate} timeView={timeView} selectedMonth={selectedMonth} selectedYear={selectedYear} />
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow min-h-[400px]">
                <OperatorStatsRedirect hqId={selectedHq} factoryId={selectedFactory} departmentId={selectedDepartment} lineId={selectedLine} sublineId={selectedSubline} stationId={selectedStation} selectedMonth={selectedMonth} selectedYear={selectedYear} selectedWeek={selectedWeek} />
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow min-h-[400px]">
                <AttritionTrendChart selectedHqId={selectedHq} selectedFactoryId={selectedFactory} selectedDepartmentId={selectedDepartment} selectedLineId={selectedLine} selectedSublineId={selectedSubline} selectedStationId={selectedStation} startDate={dateRange.startDate} endDate={dateRange.endDate} timeView={timeView} />
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow min-h-[400px]">
                <MonthPlanning hqId={selectedHq} factoryId={selectedFactory} departmentId={selectedDepartment} lineId={selectedLine} sublineId={selectedSubline} stationId={selectedStation} startDate={dateRange.startDate} endDate={dateRange.endDate} timeView={timeView} />
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow min-h-[400px]">
                <BufferManpowerAvailability selectedHqId={selectedHq} selectedFactoryId={selectedFactory} selectedDepartmentId={selectedDepartment} selectedLineId={selectedLine} selectedSublineId={selectedSubline} selectedStationId={selectedStation} startDate={timeView === 'Weekly' ? selectedWeek : `${selectedYear}-${String(MONTHS.indexOf(selectedMonth) + 1).padStart(2, '0')}-01`} endDate={dateRange.endDate} timeView={timeView} selectedMonth={selectedMonth} selectedYear={selectedYear} selectedWeek={selectedWeek} />
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow min-h-[400px]">
                <Absenteeism selectedHqId={selectedHq} selectedFactoryId={selectedFactory} selectedDepartmentId={selectedDepartment} selectedLineId={selectedLine} selectedSublineId={selectedSubline} selectedStationId={selectedStation} selectedMonth={selectedMonth} selectedYear={selectedYear} timeView={timeView} selectedWeek={selectedWeek} />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="p-6 text-center text-gray-500">
          <p>Please select filters to view data.</p>
          {error && <p className="text-red-500 mt-2">Error: {error}</p>}
        </div>
      )}
    </>
  );
};

export default Advanced;