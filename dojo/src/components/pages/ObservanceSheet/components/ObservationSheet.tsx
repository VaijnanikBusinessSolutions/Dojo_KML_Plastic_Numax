


import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Make sure this URL matches your Django development server
const API_BASE_URL = "http://172.25.0.51:8000";

// --- INTERFACES ---
export interface Employee {
  emp_id: string;
  first_name: string;
  department?: { id: number; name: string };
  line?: { id: number; name: string };
  level?: { id: number; name: string };
}

export interface AnnualPlan {
  id: string;
  employee: Employee;
  supervisor_name: string;
  plan_date: string;
  status: 'planned' | 'in_progress' | 'completed';
  status_display: string;
}

export interface Station {
  id: number;
  station_name: string;
}

export interface Line {
  id: number;
  line_name: string;
  stations: Station[];
}

export interface Department {
  id: number;
  department_name: string;
  lines: Line[];
}

export interface HierarchyData {
  structure_id: number;
  structure_name: string;
  structure_data: {
    departments: Department[];
  };
}

// --- PROPS INTERFACE ---
interface ObservationSheetProps {
  planData: AnnualPlan;
  sheetId: number | null; // <-- ADD THIS: ID of the sheet to edit, or null if creating new
  onBack: () => void;
  onComplete: () => void;
}

// --- MAIN COMPONENT ---
const ObservationSheet = ({ planData, sheetId, onBack, onComplete }: ObservationSheetProps) => {
  const navigate = useNavigate();
  const { employee } = planData;

  // State for data and loading
  const [hierarchy, setHierarchy] = useState<HierarchyData | null>(null);
  const [loadingHierarchy, setLoadingHierarchy] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingPreviousData, setLoadingPreviousData] = useState(false);

  // State for dropdown options
  const [availableLines, setAvailableLines] = useState<Line[]>([]);
  const [availableStations, setAvailableStations] = useState<Station[]>([]);

  // State for selected IDs - this is the source of truth for dropdowns
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | ''>(employee.department?.id || '');
  const [selectedLineId, setSelectedLineId] = useState<number | ''>(employee.line?.id || '');
  const [selectedStationId, setSelectedStationId] = useState<number | ''>('');

  // Operator info
  const operatorId = employee.emp_id;
  const employeeName = employee.first_name;
  const levelId = employee.level?.id;

  // Main form state
  const [entry, setEntry] = useState({
    operator_name: employeeName || "",
    operator_id: operatorId || "",
    line: employee.line?.name || "",
    station: "",
    part_name: "", sop_no: "", production_engineer_name: "", qa_engineer_name: "",
    checked_by: "", verified_by: "", reviewed_by: "", approved_by: "",
    q1: "pass", q2: "pass", q3: "pass", q4: "pass",
    a_q1: "pass", a_q2: "pass", a_q3: "pass", a_q4: "pass", a_q5: "pass",
    general_points_a: "pass",
    cycle_1: null as number | null, cycle_2: null as number | null,
    cycle_3: null as number | null, cycle_4: null as number | null,
    cycle_5: null as number | null, cycle_6: null as number | null,
    cycle_7: null as number | null, cycle_8: null as number | null,
    cycle_9: null as number | null, cycle_10: null as number | null,
    cycle_time_spec: null as number | null, avg_cycle_time: null as number | null,
    result_marking_b: "pass", cross_inspection_c: null as number | null,
    skill_level: "", observation_total: "", pass_score: "100%",
    overall_result: "pass", remark: "",
  });

  // Fetch Hierarchy Data on component mount
  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        setLoadingHierarchy(true);
        const response = await axios.get<HierarchyData[]>(`${API_BASE_URL}/hierarchy-simple/`);
        if (response.data && response.data.length > 0) {
          setHierarchy(response.data[0]);
        } else {
          setError("Hierarchy structure not found.");
        }
      } catch (err) {
        console.error("Failed to fetch hierarchy", err);
        setError("Failed to load organizational structure. Cannot select Line/Station.");
      } finally {
        setLoadingHierarchy(false);
      }
    };
    fetchHierarchy();
  }, []);

  // --- CHAINED DROPDOWN LOGIC ---
  // 1. When Department changes, update available Lines
  useEffect(() => {
    if (selectedDepartmentId && hierarchy) {
      const selectedDept = hierarchy.structure_data.departments.find(
        (dept) => dept.id === selectedDepartmentId
      );
      setAvailableLines(selectedDept ? selectedDept.lines : []);
      setSelectedLineId('');
      setAvailableStations([]);
      setSelectedStationId('');
    } else {
      setAvailableLines([]);
    }
  }, [selectedDepartmentId, hierarchy]);

  // 2. When Line changes, update available Stations
  useEffect(() => {
    if (selectedLineId && availableLines.length > 0) {
      const selectedLine = availableLines.find((line) => line.id === selectedLineId);
      setAvailableStations(selectedLine ? selectedLine.stations : []);
      setEntry(prev => ({ ...prev, line: selectedLine?.line_name || "" }));
      setSelectedStationId('');
    } else {
      setAvailableStations([]);
    }
  }, [selectedLineId, availableLines]);

  // 3. When Station changes, update form and load previous data
  useEffect(() => {
    const selectedStation = availableStations.find(s => s.id === selectedStationId);
    const stationName = selectedStation?.station_name || "";

    setEntry(prev => ({ ...prev, station: stationName }));

    if (selectedStationId) {
      loadPreviousDataForStation(selectedStationId);
    } else {
      resetFormFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStationId, availableStations]);

  // Pre-populate dropdowns from employee data after hierarchy has loaded
  useEffect(() => {
    if (hierarchy && employee.department?.id && !selectedDepartmentId) {
      setSelectedDepartmentId(employee.department.id);
    }
    if (hierarchy && availableLines.length > 0 && employee.line?.id && !selectedLineId) {
      setSelectedLineId(employee.line.id);
    }
  }, [hierarchy, employee, availableLines.length, selectedDepartmentId, selectedLineId]);

  // --- CALCULATION LOGIC ---
  const calculateAvgCycleTimeAndResult = useCallback((entryData: typeof entry) => {
    const cycleValues = [
      entryData.cycle_1, entryData.cycle_2, entryData.cycle_3, entryData.cycle_4, entryData.cycle_5,
      entryData.cycle_6, entryData.cycle_7, entryData.cycle_8, entryData.cycle_9, entryData.cycle_10,
    ].filter((val): val is number => val !== null && !isNaN(val));
    if (cycleValues.length !== 10) return { avg_cycle_time: null, result_marking_b: "fail" };
    const avgTime = cycleValues.reduce((sum, val) => sum + val, 0) / cycleValues.length;
    const cycleSpec = entryData.cycle_time_spec;
    const resultMarking = cycleSpec !== null && avgTime <= cycleSpec ? "pass" : "fail";
    return { avg_cycle_time: parseFloat(avgTime.toFixed(2)), result_marking_b: resultMarking };
  }, []);

  const calculateScores = useCallback((entryData: typeof entry) => {
    const generalPointQuestions = [entryData.a_q1, entryData.a_q2, entryData.a_q3, entryData.a_q4, entryData.a_q5];
    const anyGeneralPointFail = generalPointQuestions.some((q) => q === "fail");
    const generalPointsA = anyGeneralPointFail ? "fail" : "pass";
    const aPoints = generalPointsA === "pass" ? 1 : 0;
    const bPoints = entryData.result_marking_b === "pass" ? 1 : 0;
    const cPoints = entryData.cross_inspection_c === 5 ? 1 : 0;
    const totalPoints = aPoints + bPoints + cPoints;
    const observationTotal = totalPoints === 3 ? "pass" : "fail";
    const passScore = totalPoints === 3 ? "100%" : "0%";
    const overallResult = totalPoints === 3 ? "pass" : "fail";
    return { general_points_a: generalPointsA, observation_total: observationTotal, pass_score: passScore, overall_result: overallResult };
  }, []);

  // --- FORM HANDLING AND DATA FETCHING ---
  // Replace your entire old handleEntryChange function with this new one.



  useEffect(() => {
    // This hook's only job is to load data if we are in EDIT mode.
    // The `if (sheetId)` check is what activates "Edit Mode".
    if (sheetId) {
      const fetchSheetForEdit = async () => {
        // Set loading and clear old errors
        setLoadingHierarchy(true); // Reuse a loading state
        setError('');

        try {
          // Step 1: Fetch the specific sheet using its ID
          const response = await axios.get(`${API_BASE_URL}/ten-cycle-sheets/${sheetId}/`);
          const sheetToEdit = response.data;
          const entryData = sheetToEdit.entries[0];

          if (!entryData) {
            setError("Could not load sheet details. The entry data is missing.");
            return;
          }

          // Step 2: Set the dropdown selections based on the fetched data
          setSelectedDepartmentId(sheetToEdit.department.id);
          setSelectedLineId(sheetToEdit.line.id);

          // This is a small trick: We need to wait for the stations list to update
          // before we can select a station from it. A tiny delay is enough.
          setTimeout(() => setSelectedStationId(sheetToEdit.station.id), 100);

          // Step 3: Populate the entire form state with the fetched data
          // These helpers convert the API data (true/false) to our form data ("pass"/"fail")
          const convert = (val: boolean) => (val ? "pass" : "fail");
          const pFloat = (val: any) => (val !== null ? parseFloat(val) : null);
          const pInt = (val: any) => (val !== null ? parseInt(val, 10) : null);

          setEntry({
            operator_name: sheetToEdit.employee.first_name || "",
            operator_id: sheetToEdit.employee.emp_id || "",
            line: sheetToEdit.line.line_name || "",
            station: sheetToEdit.station.station_name || "",
            part_name: sheetToEdit.part_name || "",
            sop_no: sheetToEdit.sop_no || "",
            production_engineer_name: sheetToEdit.production_engineer_name || "",
            qa_engineer_name: sheetToEdit.qa_engineer_name || "",
            checked_by: sheetToEdit.checked_by || "",
            verified_by: sheetToEdit.verified_by || "",
            reviewed_by: sheetToEdit.reviewed_by || "",
            approved_by: sheetToEdit.approved_by || "",
            q1: convert(entryData.q1), q2: convert(entryData.q2),
            q3: convert(entryData.q3), q4: convert(entryData.q4),
            a_q1: convert(entryData.a_q1), a_q2: convert(entryData.a_q2),
            a_q3: convert(entryData.a_q3), a_q4: convert(entryData.a_q4),
            a_q5: convert(entryData.a_q5),
            general_points_a: convert(entryData.general_points_a),
            cycle_1: pFloat(entryData.cycle_1), cycle_2: pFloat(entryData.cycle_2),
            cycle_3: pFloat(entryData.cycle_3), cycle_4: pFloat(entryData.cycle_4),
            cycle_5: pFloat(entryData.cycle_5), cycle_6: pFloat(entryData.cycle_6),
            cycle_7: pFloat(entryData.cycle_7), cycle_8: pFloat(entryData.cycle_8),
            cycle_9: pFloat(entryData.cycle_9), cycle_10: pFloat(entryData.cycle_10),
            cycle_time_spec: pFloat(entryData.cycle_time_spec),
            avg_cycle_time: pFloat(entryData.avg_cycle_time),
            result_marking_b: convert(entryData.result_marking_b),
            cross_inspection_c: pInt(entryData.cross_inspection_c),
            skill_level: entryData.skill_level || "",
            observation_total: entryData.observation_total || "",
            pass_score: entryData.pass_score || "",
            overall_result: entryData.overall_result || "",
            remark: entryData.remark || "",
          });

        } catch (err) {
          console.error("Failed to fetch sheet for editing", err);
          setError("Failed to load the selected observation sheet. Please go back and try again.");
        } finally {
          setLoadingHierarchy(false);
        }
      };

      fetchSheetForEdit();
    }
    // This dependency array `[sheetId]` is crucial. It tells React:
    // "Only run this effect if the sheetId prop changes."
    // So, it runs once when the component mounts with a sheetId.
  }, [sheetId]);




  const handleEntryChange = useCallback((field: keyof typeof entry, value: any) => {
    setEntry((prev) => {
      let newEntry;

      const numericFields = [
        "cycle_1", "cycle_2", "cycle_3", "cycle_4", "cycle_5",
        "cycle_6", "cycle_7", "cycle_8", "cycle_9", "cycle_10",
        "cycle_time_spec",
      ];
      const integerFields = ["cross_inspection_c"];

      // Logic for numeric fields (e.g., 12.3)
      if (numericFields.includes(field)) {
        const parsedValue = value === "" ? null : parseFloat(value);
        newEntry = { ...prev, [field]: isNaN(parsedValue) ? null : parsedValue };

        // Logic for integer fields (e.g., 5)
      } else if (integerFields.includes(field)) {
        const parsedValue = value === "" ? null : parseInt(value, 10);
        newEntry = { ...prev, [field]: isNaN(parsedValue) ? null : parsedValue };

        // --- THIS IS THE NEW, CRUCIAL PART ---
        // Logic for all other fields (text, selects, etc.)
      } else {
        newEntry = { ...prev, [field]: value };
      }

      // The calculation logic can now run on the correctly updated newEntry object
      const cycleTimeCalcFields = [...numericFields];
      if (cycleTimeCalcFields.includes(field)) {
        Object.assign(newEntry, calculateAvgCycleTimeAndResult(newEntry));
      }

      const scoreCalcFields = ["a_q1", "a_q2", "a_q3", "a_q4", "a_q5", "result_marking_b", "cross_inspection_c"];
      if (scoreCalcFields.includes(field) || cycleTimeCalcFields.includes(field)) {
        Object.assign(newEntry, calculateScores(newEntry));
      }

      return newEntry;
    });
  }, [calculateAvgCycleTimeAndResult, calculateScores]);

  const convertToBoolean = (value: string) => value === "pass";

  const fetchLatestEntry = useCallback(async (employeePayCode: string, stationId: number) => {
    if (!selectedLineId || !selectedDepartmentId || !levelId) return null;
    try {
      setLoadingPreviousData(true);
      const params = new URLSearchParams({ employee_pay_code: employeePayCode, station_id: stationId.toString(), line_id: selectedLineId.toString(), department: selectedDepartmentId.toString(), level: levelId.toString() }).toString();
      const response = await axios.get(`${API_BASE_URL}/ten-cycle-sheets/latest_entry/?${params}`);
      return response.data?.data || null;
    } catch (err: any) {
      if (err.response?.status === 404) console.log("No previous data found for this station.");
      else { console.error("Error fetching latest entry:", err); setError(`Failed to load previous data: ${err.message}`); }
      return null;
    } finally {
      setLoadingPreviousData(false);
    }
  }, [selectedDepartmentId, selectedLineId, levelId]);

  const resetFormFields = useCallback(() => {
    setEntry((prev) => ({
      ...prev, part_name: "", sop_no: "", production_engineer_name: "", qa_engineer_name: "", checked_by: "", verified_by: "", reviewed_by: "", approved_by: "",
      q1: "pass", q2: "pass", q3: "pass", q4: "pass", a_q1: "pass", a_q2: "pass", a_q3: "pass", a_q4: "pass", a_q5: "pass",
      general_points_a: "pass", cycle_1: null, cycle_2: null, cycle_3: null, cycle_4: null, cycle_5: null, cycle_6: null, cycle_7: null, cycle_8: null, cycle_9: null, cycle_10: null,
      cycle_time_spec: null, avg_cycle_time: null, result_marking_b: "pass", cross_inspection_c: null, skill_level: "", observation_total: "", pass_score: "100%", overall_result: "pass", remark: "",
    }));
  }, []);

  // Corrected Version - Replace your old function with this

  const loadPreviousDataForStation = useCallback(async (stationId: number) => {
    if (!operatorId) {
      resetFormFields();
      return;
    }

    const existingSheet = await fetchLatestEntry(operatorId, stationId);

    // CORRECTED LOGIC: If no data is found, simply stop. DO NOT reset the form.
    if (!existingSheet || !existingSheet.entries?.length) {
      console.log("No previous data found for this station. The form will NOT be reset.");

      return;
    }

    // This part below only runs if previous data WAS found.
    const convert = (val: boolean) => (val ? "pass" : "fail");
    const pFloat = (val: string | null) => (val !== null ? parseFloat(val) : null);
    const pInt = (val: string | null) => (val !== null ? parseInt(val, 10) : null);
    const entryData = existingSheet.entries[0];

    setEntry((prev) => {
      const newState = {
        ...prev,
        production_engineer_name: existingSheet.production_engineer_name || "",
        qa_engineer_name: existingSheet.qa_engineer_name || "",
        part_name: existingSheet.part_name || "",
        sop_no: existingSheet.sop_no || "",
        checked_by: existingSheet.checked_by || "",
        verified_by: existingSheet.verified_by || "",
        reviewed_by: existingSheet.reviewed_by || "",
        approved_by: existingSheet.approved_by || "",
        q1: convert(entryData.q1), q2: convert(entryData.q2), q3: convert(entryData.q3), q4: convert(entryData.q4),
        a_q1: convert(entryData.a_q1), a_q2: convert(entryData.a_q2), a_q3: convert(entryData.a_q3), a_q4: convert(entryData.a_q4), a_q5: convert(entryData.a_q5),
        cycle_1: pFloat(entryData.cycle_1), cycle_2: pFloat(entryData.cycle_2), cycle_3: pFloat(entryData.cycle_3), cycle_4: pFloat(entryData.cycle_4), cycle_5: pFloat(entryData.cycle_5), cycle_6: pFloat(entryData.cycle_6),
        cycle_7: pFloat(entryData.cycle_7), cycle_8: pFloat(entryData.cycle_8), cycle_9: pFloat(entryData.cycle_9), cycle_10: pFloat(entryData.cycle_10),
        cycle_time_spec: pFloat(entryData.cycle_time_spec),
        cross_inspection_c: pInt(entryData.cross_inspection_c),
        skill_level: entryData.skill_level || "",
        remark: entryData.remark || "",
      };
      Object.assign(newState, calculateAvgCycleTimeAndResult(newState as any));
      Object.assign(newState, calculateScores(newState as any));
      return newState;
    });
  }, [operatorId, fetchLatestEntry, resetFormFields, calculateAvgCycleTimeAndResult, calculateScores]);
  // Replace your entire handleSubmit function with this one

  const handleSubmit = async () => {
    // --- STEP 1: VALIDATION ---
    // All validation checks happen first, before we try to submit.

    console.log("--- SUBMIT BUTTON CLICKED ---");
    console.log("State at the moment of submission:", entry);

    // 1a. Dropdown validation (from before)
    if (!selectedDepartmentId || !selectedLineId || !selectedStationId) {
      alert("Please select a Department, Line, and Station.");
      return; // Stop the function
    }

    // --- START: NEW VALIDATION FOR REQUIRED TEXT FIELDS ---
    // 1b. Check for fields that are required by your backend model
    const requiredModelFields: { key: keyof typeof entry; label: string }[] = [
      { key: 'production_engineer_name', label: 'Production Engineer Name' },
      { key: 'qa_engineer_name', label: 'QA Engineer Name' },
      // Add any other fields here that your backend *requires* (has no `blank=True`)
    ];

    for (const field of requiredModelFields) {
      // This checks for an empty string (''), null, or undefined
      if (!entry[field.key]) {
        alert(`Error: The "${field.label}" field is required and cannot be empty.`);
        return; // Stop the function
      }
    }
    // --- END: NEW VALIDATION FOR REQUIRED TEXT FIELDS ---

    // 1c. Numeric and cycle time validation (from before)
    const cycleFields: (keyof typeof entry)[] = ["cycle_1", "cycle_2", "cycle_3", "cycle_4", "cycle_5", "cycle_6", "cycle_7", "cycle_8", "cycle_9", "cycle_10"];
    if (cycleFields.some(field => entry[field] === null)) {
      alert("Please fill in all 10 cycle times.");
      return; // Stop the function
    }
    if (entry.cross_inspection_c === null) {
      alert("Please enter the Cross Inspection value!");
      return; // Stop the function
    }
    if (entry.cycle_time_spec === null) {
      alert("Please enter the Cycle Time Specification!");
      return; // Stop the function
    }

    // --- STEP 2: SUBMISSION ---
    // If all the checks above passed, we can now proceed to submit the data.

    setSaving(true);

    const sheetData = {
      annual_plan: planData.id,
      employee: operatorId,
      department: selectedDepartmentId,
      line: selectedLineId,
      station: selectedStationId,
      level: levelId || 1,
      production_engineer_name: entry.production_engineer_name,
      qa_engineer_name: entry.qa_engineer_name,
      date: new Date().toISOString().split("T")[0],
      part_name: entry.part_name,
      sop_no: entry.sop_no,
      checked_by: entry.checked_by,
      verified_by: entry.verified_by,
      reviewed_by: entry.reviewed_by,
      approved_by: entry.approved_by,
      entries: [{
        s_no: "1",
        q1: convertToBoolean(entry.q1),
        q2: convertToBoolean(entry.q2),
        q3: convertToBoolean(entry.q3),
        q4: convertToBoolean(entry.q4),
        a_q1: convertToBoolean(entry.a_q1),
        a_q2: convertToBoolean(entry.a_q2),
        a_q3: convertToBoolean(entry.a_q3),
        a_q4: convertToBoolean(entry.a_q4),
        a_q5: convertToBoolean(entry.a_q5),
        general_points_a: convertToBoolean(entry.general_points_a),
        cycle_1: entry.cycle_1, cycle_2: entry.cycle_2, cycle_3: entry.cycle_3,
        cycle_4: entry.cycle_4, cycle_5: entry.cycle_5, cycle_6: entry.cycle_6,
        cycle_7: entry.cycle_7, cycle_8: entry.cycle_8, cycle_9: entry.cycle_9,
        cycle_10: entry.cycle_10,
        cycle_time_spec: entry.cycle_time_spec?.toString() || "",
        avg_cycle_time: entry.avg_cycle_time,
        result_marking_b: convertToBoolean(entry.result_marking_b),
        cross_inspection_c: entry.cross_inspection_c,
        skill_level: entry.skill_level,
        observation_total: entry.observation_total,
        pass_score: entry.pass_score,
        overall_result: entry.overall_result,
        remark: entry.remark,
      }],
    };

    try {
      if (sheetId) {
        // --- UPDATE LOGIC (EDIT MODE) ---
        await axios.put(`${API_BASE_URL}/ten-cycle-sheets/${sheetId}/`, sheetData, {
          headers: { "Content-Type": "application/json" }
        });
        alert("Sheet updated successfully!");
      } else {
        // --- CREATE LOGIC (NEW SHEET MODE) ---
        await axios.post(`${API_BASE_URL}/ten-cycle-sheets/`, sheetData, {
          headers: { "Content-Type": "application/json" }
        });
        alert("Data submitted successfully!");
      }
      onComplete(); // Call the completion callback in both cases
    } catch (err: any) {
      console.error("Submission error:", err);
      const errorData = err.response?.data;
      alert(errorData ? JSON.stringify(errorData) : "Failed to submit data. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const departments = hierarchy?.structure_data.departments || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8">
            <h1 className="text-4xl font-bold text-white mb-2">10 CYCLE CHECK MONITORING SHEET</h1>
          </div>
        </div>

        {/* Error and Loading Indicators */}
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}
        {loadingPreviousData && <div className="bg-blue-100 border-blue-400 text-blue-700 px-4 py-3 rounded mb-6 flex items-center">Loading previous data...</div>}

        {/* Operator & Process Information Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4"><h4 className="text-white font-semibold text-lg">Operator & Process Information</h4></div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Operator Name</label>
              <input type="text" value={entry.operator_name} className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Operator ID</label>
              <input type="text" value={entry.operator_id} className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
              <select value={selectedDepartmentId} onChange={(e) => setSelectedDepartmentId(Number(e.target.value))} className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white" disabled={loadingHierarchy}>
                <option value="">{loadingHierarchy ? "Loading..." : "Select Department"}</option>
                {departments.map((dept) => <option key={dept.id} value={dept.id}>{dept.department_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Line *</label>
              <select value={selectedLineId} onChange={(e) => setSelectedLineId(Number(e.target.value))} className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white" disabled={!selectedDepartmentId}>
                <option value="">Select Line</option>
                {availableLines.map((line) => <option key={line.id} value={line.id}>{line.line_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Station *</label>
              <select value={selectedStationId} onChange={(e) => setSelectedStationId(Number(e.target.value))} className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white" disabled={!selectedLineId || loadingPreviousData}>
                <option value="">Select Station</option>
                {availableStations.map((station) => <option key={station.id} value={station.id}>{station.station_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Part Name</label>
              <input type="text" value={entry.part_name} onChange={(e) => handleEntryChange("part_name", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Enter part name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SOP No. (OI No)</label>
              <input type="text" value={entry.sop_no} onChange={(e) => handleEntryChange("sop_no", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Enter SOP/OI number" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Production Engineer Name</label>
              <input type="text" value={entry.production_engineer_name} onChange={(e) => handleEntryChange("production_engineer_name", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Enter production engineer" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">QA Engineer Name</label>
              <input type="text" value={entry.qa_engineer_name} onChange={(e) => handleEntryChange("qa_engineer_name", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Enter QA engineer" />
            </div>
          </div>
        </div>

        {/* Assessment & Monitoring Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4"><h4 className="text-white font-semibold text-lg">Assessment & Monitoring</h4></div>
          <div className="p-6">
            {/* Questions Marking */}
            <div className="mb-6"><h5 className="text-lg font-semibold text-gray-800 mb-4">Questions Marking</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[{ key: "q1", label: "Q1: Is SOP Available?" }, { key: "q2", label: "Q2: Do you understand SOP?" }, { key: "q3", label: "Q3: Are you adhering SOP?" }, { key: "q4", label: "Q4: Do you know operation cycle time?" }].map(({ key, label }) => (
                  <div key={key} className="bg-yellow-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                    <select value={entry[key as keyof typeof entry]} onChange={(e) => handleEntryChange(key as keyof typeof entry, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
                      <option value="pass">✓ Pass</option><option value="fail">✗ Fail</option>
                    </select>
                  </div>))}
              </div>
            </div>
            {/* General Points Marking */}
            <div className="mb-6"><h5 className="text-lg font-semibold text-gray-800 mb-4">A - General Points Marking</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[{ key: "a_q1", label: "A1: Safety Compliance" }, { key: "a_q2", label: "A2: Tool Handling" }, { key: "a_q3", label: "A3: Workplace Organization (5S)" }, { key: "a_q4", label: "A4: Material Handling" }, { key: "a_q5", label: "A5: Defect Reporting" }].map(({ key, label }) => (
                  <div key={key} className="bg-green-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                    <select value={entry[key as keyof typeof entry]} onChange={(e) => handleEntryChange(key as keyof typeof entry, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
                      <option value="pass">✓ Pass</option><option value="fail">✗ Fail</option>
                    </select>
                  </div>))}
              </div>
            </div>
            {/* Result of Point A */}
            <div className="mb-6"><h5 className="text-lg font-semibold text-gray-800 mb-4">Result Marking A</h5>
              <div className="bg-gray-50 p-4 rounded-lg max-w-md">
                <div className="text-lg font-semibold mb-2">Status: <span className={entry.general_points_a === 'pass' ? 'text-green-600' : 'text-red-600'}>{entry.general_points_a === 'pass' ? '✓ Pass' : '✗ Fail'}</span></div>
                <p className="text-sm text-gray-600">A will be 'Fail' if any of its five points (A1-A5) is marked 'Fail'.</p>
              </div>
            </div>
            {/* Cycle Time Recording */}
            <div className="mb-6"><h5 className="text-lg font-semibold text-gray-800 mb-4">B - Cycle Time Recording (10 Cycles)</h5>
              <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3">
                {[...Array(10)].map((_, i) => (<div key={i} className="bg-blue-50 p-3 rounded-lg text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cycle {i + 1}</label>
                  <input type="number" step="0.1" value={entry[`cycle_${i + 1}` as keyof typeof entry] ?? ''} onChange={(e) => handleEntryChange(`cycle_${i + 1}` as keyof typeof entry, e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm text-center" min="0" />
                </div>))}
              </div>
            </div>
            {/* Time Specs and Results B & C */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Cycle Time Spec (sec) *</label><input type="number" step="0.1" value={entry.cycle_time_spec ?? ''} onChange={(e) => handleEntryChange("cycle_time_spec", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" min="0" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Average Cycle Time</label><input type="text" value={entry.avg_cycle_time ?? ''} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Result Marking B</label><div className={`w-full px-3 py-2 border rounded-md ${entry.result_marking_b === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{entry.result_marking_b === 'pass' ? '✓ Pass' : '✗ Fail'}</div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">C - Cross Inspection (5=Pass) *</label><input type="number" value={entry.cross_inspection_c ?? ''} onChange={(e) => handleEntryChange("cross_inspection_c", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" min="0" max="5" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Skill Level</label><select value={entry.skill_level} onChange={(e) => handleEntryChange("skill_level", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"><option value="">Select Level</option><option value="Level-1">Level-1</option><option value="Level-2">Level-2</option><option value="Level-3">Level-3</option><option value="Level-4">Level-4</option></select></div>
            </div>
            {/* Summary and Sign-off */}
            <div className="bg-gray-50 p-6 rounded-lg"><h6 className="font-semibold text-gray-800 mb-4">Results & Summary</h6>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className={`p-4 rounded-lg ${entry.observation_total === 'pass' ? 'bg-green-100' : 'bg-red-100'}`}><label className="block text-sm font-medium text-gray-700 mb-1">Observation Total (A+B+C)</label><div className={`text-lg font-semibold ${entry.observation_total === 'pass' ? 'text-green-800' : 'text-red-800'}`}>{entry.observation_total === 'pass' ? '✓ Pass' : '✗ Fail'}</div></div>
                <div className="bg-blue-100 p-4 rounded-lg"><label className="block text-sm font-medium text-gray-700 mb-1">Pass Score %</label><div className="text-lg font-semibold text-blue-800">{entry.pass_score}</div></div>
                <div className={`p-4 rounded-lg ${entry.overall_result === 'pass' ? 'bg-green-100' : 'bg-red-100'}`}><label className="block text-sm font-medium text-gray-700 mb-1">Overall Result</label><div className={`text-lg font-semibold ${entry.overall_result === 'pass' ? 'text-green-800' : 'text-red-800'}`}>{entry.overall_result.toUpperCase()}</div></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Checked by</label><input type="text" value={entry.checked_by} onChange={(e) => handleEntryChange("checked_by", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Checked by..." /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Verified by</label><input type="text" value={entry.verified_by} onChange={(e) => handleEntryChange("verified_by", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Verified by..." /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Reviewed by</label><input type="text" value={entry.reviewed_by} onChange={(e) => handleEntryChange("reviewed_by", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Reviewed by..." /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Approved by</label><input type="text" value={entry.approved_by} onChange={(e) => handleEntryChange("approved_by", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Approved by..." /></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label><textarea value={entry.remark} onChange={(e) => handleEntryChange("remark", e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Enter remarks..." /></div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button onClick={onBack} className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600" disabled={saving}>Back</button>
          <button onClick={handleSubmit} disabled={saving} className={`px-8 py-3 font-semibold rounded-lg ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}>{saving ? "Submitting..." : "Submit Entry"}</button>
        </div>
      </div>
    </div>
  );
};

export default ObservationSheet;











