


import React, { useState, useEffect, useCallback, useRef} from "react";
import { useLocation } from "react-router-dom";

const API_BASE_URL = "http://172.25.0.51:8000";

interface Employee {
  emp_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  department: number;
  department_name: string;
  date_of_joining: string;
  email: string;
  phone: string;
}

interface Topic {
  id: number;
  slno: number;
  cycle_topics: string;
  level: number;
  department: number;
  station: number;
  is_active: boolean;
  subtopics?: SubTopic[];
}

interface SubTopic {
  id: number;
  topic: number;
  sub_topic: string;
  score_required: number;
  is_active: boolean;
}

interface Day {
  id: number;
  day_name: string;
  sequence_order: number;
  level: number;
  department: number;
  station: number;
  is_active: boolean;
}

interface OperatorPerformanceEvaluation {
  id: number;
  employee: number;
  date: string;
  shift: string;
  department: number;
  station: number;
  level: number;
  line: string;
  process_name: string;
  operation_no: string;
  date_of_retraining_completed: string;
  prepared_by: string;
  checked_by: string;
  approved_by: string;
  is_completed: boolean;
  final_percentage: number;
  final_status: string;
}

interface EvaluationSubTopicMarks {
  id: number;
  employee: number;
  subtopic: number;
  day: number;
  mark_1: number | null;
  mark_2: number | null;
  mark_3: number | null;
  mark_4: number | null;
  mark_5: number | null;
  mark_6: number | null;
  mark_7: number | null;
  mark_8: number | null;
  mark_9: number | null;
  mark_10: number | null;
  total_score: number;
  max_possible_score: number;
}

interface EvaluationData {
  employee_code: string;
  employee_details: OperatorPerformanceEvaluation | null;
  evaluations: EvaluationSubTopicMarks[];
  per_day_results: Array<{
    day: string;
    score: number;
    possible_score: number;
    percentage: number;
    status: string;
  }>;
  total_score: number;
  total_possible_score: number;
  final_percentage: number;
  final_status: string;
}

interface LocationState {
  employeeId?: string;
  employeeName?: string;
  levelId?: number;
  departmentId?: number;
  stationId?: number;
  lineName?: string;
  processName?: string;
  departmentName?: string;
  stationName?: string;
}

const TenCyclePage: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subtopics, setSubtopics] = useState<SubTopic[]>([]);
  const [days, setDays] = useState<Day[]>([]);
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(
    null
  );
  const { employeeId, levelId, departmentId, stationId } = state || {};
  const [operatorEvaluation, setOperatorEvaluation] =
    useState<OperatorPerformanceEvaluation | null>(null);
  const [loading, setLoading] = useState(false);
  // const [selectedLevel, setSelectedLevel] = useState<number | null>(
  //   state?.levelId || null
  // );
  // const [selectedDepartment, setSelectedDepartment] = useState<number | null>(
  //   state?.departmentId || null
  // );
  // const [selectedStation, setSelectedStation] = useState<number | null>(
  //   state?.stationId || null
  // );
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [evaluationScores, setEvaluationScores] = useState<{
    [key: string]: string;
  }>({});
  const [dailyMetrics, setDailyMetrics] = useState<{ [key: string]: string }>(
    {}
  );
  const [passingCriteria, setPassingCriteria] = useState<number>(70);
  const [isDaySubmitted, setIsDaySubmitted] = useState<boolean>(false);
  const [completedDays, setCompletedDays] = useState<string[]>([]);
  const [day6Quality, setDay6Quality] = useState<number | null>(null);
  const [day6Productivity, setDay6Productivity] = useState<number | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  const isRetraining = state?.isRetraining ?? false;
  const attemptMode = state?.attemptMode ?? "existing"; // "new" for blank retraining
  const [attemptNumber, setAttemptNumber] = useState<number>(1);

  const [showAttemptsDropdown, setShowAttemptsDropdown] = useState(false);
const [previousAttempts, setPreviousAttempts] = useState<Array<{
  id: number;
  attempt_no: number;
  final_status: string;
  final_percentage: number;
  created_at: string;
}>>([]);
const [isViewOnlyMode, setIsViewOnlyMode] = useState(false);
const [viewingAttemptId, setViewingAttemptId] = useState<number | null>(null);
const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    line: state?.lineName || "",
    department: state?.departmentName || "",
    station: state?.stationName || "",
    process_name: "",
    shift: "",
    date: new Date().toISOString().split("T")[0],
    dateOfJoin: "",
    date_of_retraining_completed: "",
    prepared_by: "",
    checked_by: "",
    approved_by: "",
  });

  const fetchEmployee = useCallback(async (empId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/mastertable/by-employee-code/${empId}/`
      );
      if (response.ok) {
        const data = await response.json();
        setEmployee(data);
        if (data.date_of_joining) {
          setFormData((prev) => ({
            ...prev,
            dateOfJoin: data.date_of_joining,
          }));
        }
        return data;
      }
    } catch (error) {
      console.error("Error fetching employee:", error);
    }
    return null;
  }, []);

  const fetchConfiguration = useCallback(
    async (levelId: number, departmentId: number, stationId: number) => {
      try {
        const params = new URLSearchParams({
          level_id: levelId.toString(),
          department_id: departmentId.toString(),
          station_id: stationId.toString(),
        });

        const response = await fetch(
          `${API_BASE_URL}/tencycle-configuration/complete-configuration/?${params.toString()}`
        );
        if (response.ok) {
          const configData = await response.json();
          setDays(configData.days || []);
          setTopics(configData.topics || []);
          setPassingCriteria(
            configData.passing_criteria?.passing_percentage ?? 70
          );

          const allSubtopics: SubTopic[] = [];
          configData.topics?.forEach((topic: Topic) => {
            if (topic.subtopics) {
              allSubtopics.push(...topic.subtopics);
            }
          });
          setSubtopics(allSubtopics);

          if (configData.days && configData.days.length > 0) {
            setSelectedDay(configData.days[0].day_name);
          }
        }
      } catch (error) {
        console.error("Error fetching configuration:", error);
      }
    },
    []
  );


  const fetchMaxAttempts = useCallback(async (evaluationType: string) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/evaluation-type/by-params/?evaluation_type=${evaluationType}`
    );
    if (response.ok) {
      const data = await response.json();
      return data.max_attempts ?? 2; // default to 2 if not found
    }
  } catch (error) {
    console.error("Error fetching max attempts:", error);
  }
  return 2; // fallback
}, []);


const fetchAllAttempts = useCallback(
  async (empId: string, levelId: number, departmentId: number, stationId: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/operator-evaluations/by-employee-code/${empId}/?level_id=${levelId}&department_id=${departmentId}&station_id=${stationId}`
      );
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          // Filter out current attempt and sort by attempt_no descending
          const otherAttempts = data
            .filter((attempt: any) => attempt.attempt_no !== attemptNumber)
            .sort((a: any, b: any) => (b.attempt_no || 0) - (a.attempt_no || 0));
          setPreviousAttempts(otherAttempts);
        }
      }
    } catch (error) {
      console.error("Error fetching all attempts:", error);
    }
  },
  [attemptNumber]
);

// const fetchEvaluationData = useCallback(
//   async (
//     empId: string,
//     levelId: number,
//     departmentId: number,
//     stationId: number,
//     specificEvaluationId?: number 
//   ) => {
//     try {
//       const evalResponse = await fetch(
//         `${API_BASE_URL}/operator-evaluations/by-employee-code/${empId}/?level_id=${levelId}&department_id=${departmentId}&station_id=${stationId}`
//       );

//       let operatorEval: OperatorPerformanceEvaluation | null = null;

//       if (!evalResponse.ok) {
//         console.warn("Operator evaluations fetch failed:", evalResponse.status, evalResponse.statusText);
//         // set blank state if desired
//         setEvaluationData({
//           employee_code: empId,
//           employee_details: null,
//           evaluations: [],
//           per_day_results: [],
//           total_score: 0,
//           total_possible_score: 0,
//           final_percentage: 0,
//           final_status: "Not Evaluated",
//         });
//         return;
//       }

//       const evalData = await evalResponse.json();

//       // -----------------------
//       // Step 1: derive latestAttempt & latestEvaluation
//       // -----------------------
//       let latestAttempt = 1;
//       let latestEvaluation: any = null;

//       if (Array.isArray(evalData) && evalData.length > 0) {
//         const sorted = [...evalData].sort(
//           (a: any, b: any) => (b.attempt_no || 0) - (a.attempt_no || 0)
//         );
//         latestEvaluation = sorted[0];
//         latestAttempt = latestEvaluation?.attempt_no ?? 1;
//       }

//       // -----------------------
//       // Step 2: get maxAttempts
//       // -----------------------
//       const maxAttempts = await fetchMaxAttempts("10CYCLE");
//       // console.log("🎯 Max attempts allowed:", maxAttempts);

//       // -----------------------
//       // Step 3: compute which attempt to use
//       // -----------------------
//       let computedAttempt = latestAttempt;
//       if (latestEvaluation && !latestEvaluation.is_completed) {
//         computedAttempt = latestEvaluation.attempt_no;
//       } else if (isRetraining && attemptMode === "new") {
//         if (latestAttempt < maxAttempts) {
//           computedAttempt = latestAttempt + 1;
//         } else {
//           // alert(`⚠️ Maximum attempts (${maxAttempts}) reached. No new attempt can be created.`);
//           computedAttempt = latestAttempt;
//         }
//       } else {
//         computedAttempt = latestAttempt;
//       }

//       setAttemptNumber(computedAttempt);
//       // console.log("🧭 Attempt calc:", { latestAttempt, computedAttempt, isRetraining, attemptMode });

//       // -----------------------
//       // Step 4: find evaluation record for computedAttempt (if any)
//       // -----------------------
//       let evaluationForAttempt: any = null;
//       if (Array.isArray(evalData) && evalData.length > 0) {
//         evaluationForAttempt = evalData.find(
//           (ev: any) => Number(ev.attempt_no) === Number(computedAttempt)
//         ) ?? null;
//       }

//       if (evaluationForAttempt) {
//         operatorEval = evaluationForAttempt;
//         setOperatorEvaluation(evaluationForAttempt);

//         setFormData((prev) => ({
//           ...prev,
//           line: state?.lineName ?? prev.line,
//           department: state?.departmentName ?? prev.department,
//           station: state?.stationName ?? prev.station,
//           process_name: evaluationForAttempt?.process_name ?? prev.process_name,
//           shift: evaluationForAttempt?.shift ?? prev.shift,
//           date: evaluationForAttempt?.date ?? prev.date,
//           date_of_retraining_completed:
//             evaluationForAttempt?.date_of_retraining_completed ?? prev.date_of_retraining_completed,
//           prepared_by: evaluationForAttempt?.prepared_by ?? prev.prepared_by,
//           checked_by: evaluationForAttempt?.checked_by ?? prev.checked_by,
//           approved_by: evaluationForAttempt?.approved_by ?? prev.approved_by,
//         }));
//       } else {
//         // No record for the computed attempt (this is expected for a new/blank attempt)
//         setOperatorEvaluation(null);
//         operatorEval = null;
//       }

//       // If it's specifically retraining 'new' AND we've chosen a new attempt number, keep blank sheet
//       if (isRetraining && attemptMode === "new" && computedAttempt === latestAttempt + 1) {
//   console.log("⏭️ New retraining attempt — blank sheet (explicit new attempt)");
//   setEvaluationData(null);
//   setEvaluationScores({});
//   setDailyMetrics({});
//   setCompletedDays([]);
//   setFormData((prev) => ({
//     ...prev,
//     date: new Date().toISOString().split("T")[0],
//     shift: "",
//     date_of_retraining_completed: "",
//     prepared_by: "",
//     checked_by: "",
//     approved_by: "",
//   }));
//   return; // ❌ remove this line
// }


//       // -----------------------
//       // Step 5: pick evaluation id for marks fetch (if exists)
//       // -----------------------
//       const currentEvalId = evaluationForAttempt ? evaluationForAttempt.id : null;
//       // console.log("📦 currentEvalId chosen:", currentEvalId, "for attempt", computedAttempt);

//       if (currentEvalId) {
//         const marksResponse = await fetch(
//           `${API_BASE_URL}/evaluation-marks/by-employee-code/${empId}/?level_id=${levelId}&department_id=${departmentId}&station_id=${stationId}&evaluation_id=${currentEvalId}`
//         );

//         if (marksResponse.ok) {
//           const marksData = await marksResponse.json();
//           // console.log("✅ Marks API response:", marksData);

//           setEvaluationData({
//             employee_code: marksData.employee_code ?? empId,
//             employee_details: operatorEval,
//             evaluations: Array.isArray(marksData.evaluations) ? marksData.evaluations : [],
//             per_day_results: Array.isArray(marksData.per_day_results) ? marksData.per_day_results : [],
//             total_score: marksData.total_score ?? 0,
//             total_possible_score: marksData.total_possible_score ?? 0,
//             final_percentage:
//               marksData.final_percentage ??
//               (marksData.total_possible_score
//                 ? (marksData.total_score / marksData.total_possible_score) * 100
//                 : 0),
//             final_status: marksData.final_status ?? "Not Evaluated",
//           });
//         } else {
//           console.warn("Marks fetch failed:", marksResponse.status, marksResponse.statusText);
//           // set blank evaluationData to avoid undefined
//           setEvaluationData({
//             employee_code: empId,
//             employee_details: operatorEval,
//             evaluations: [],
//             per_day_results: [],
//             total_score: 0,
//             total_possible_score: 0,
//             final_percentage: 0,
//             final_status: "Not Evaluated",
//           });
//         }
//       } else {
//         // no previous attempt -> show blank data
//         setEvaluationData({
//           employee_code: empId,
//           employee_details: operatorEval,
//           evaluations: [],
//           per_day_results: [],
//           total_score: 0,
//           total_possible_score: 0,
//           final_percentage: 0,
//           final_status: "Not Evaluated",
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching evaluation data:", error);
//     }
//   },
//   // deps: include external references used inside callback
//   [fetchMaxAttempts, isRetraining, attemptMode, state]
// );

const fetchEvaluationData = useCallback(
  async (
    empId: string,
    levelId: number,
    departmentId: number,
    stationId: number,
    specificEvaluationId?: number 
  ) => {
    try {
      const evalResponse = await fetch(
        `${API_BASE_URL}/operator-evaluations/by-employee-code/${empId}/?level_id=${levelId}&department_id=${departmentId}&station_id=${stationId}`
      );

      let operatorEval: OperatorPerformanceEvaluation | null = null;

      if (!evalResponse.ok) {
        console.warn("Operator evaluations fetch failed:", evalResponse.status, evalResponse.statusText);
        setEvaluationData({
          employee_code: empId,
          employee_details: null,
          evaluations: [],
          per_day_results: [],
          total_score: 0,
          total_possible_score: 0,
          final_percentage: 0,
          final_status: "Not Evaluated",
        });
        return;
      }

      const evalData = await evalResponse.json();

      // -----------------------
      // Step 1: derive latestAttempt & latestEvaluation
      // -----------------------
      let latestAttempt = 1;
      let latestEvaluation: any = null;

      if (Array.isArray(evalData) && evalData.length > 0) {
        const sorted = [...evalData].sort(
          (a: any, b: any) => (b.attempt_no || 0) - (a.attempt_no || 0)
        );
        latestEvaluation = sorted[0];
        latestAttempt = latestEvaluation?.attempt_no ?? 1;
      }

      // -----------------------
      // Step 2: get maxAttempts
      // -----------------------
      const maxAttempts = await fetchMaxAttempts("10CYCLE");

      // -----------------------
      // Step 3: compute which attempt to use
      // -----------------------
      let computedAttempt = latestAttempt;

      // Check if the previous attempt was a PASS
      const isPreviousPass = latestEvaluation?.final_status === 'Pass';

      if (latestEvaluation && !latestEvaluation.is_completed) {
        // 1. If current evaluation is incomplete, resume it
        computedAttempt = latestEvaluation.attempt_no;
      } else if (isPreviousPass) {
        // 2. NEW FIX: If the last attempt Passed, DO NOT increment. Stay on the passed attempt.
        // This prevents creating Attempt 2 if Attempt 1 is already passed.
        console.log("✅ Previous attempt passed. Staying on Attempt", latestAttempt);
        computedAttempt = latestAttempt;
      } else if (isRetraining && attemptMode === "new") {
        // 3. Only increment if it was a failure (implied by failing check #2) AND max attempts not reached
        if (latestAttempt < maxAttempts) {
          computedAttempt = latestAttempt + 1;
        } else {
          computedAttempt = latestAttempt;
        }
      } else {
        // 4. Default to latest
        computedAttempt = latestAttempt;
      }

      setAttemptNumber(computedAttempt);

      // -----------------------
      // Step 4: find evaluation record for computedAttempt (if any)
      // -----------------------
      let evaluationForAttempt: any = null;
      if (Array.isArray(evalData) && evalData.length > 0) {
        evaluationForAttempt = evalData.find(
          (ev: any) => Number(ev.attempt_no) === Number(computedAttempt)
        ) ?? null;
      }

      if (evaluationForAttempt) {
        operatorEval = evaluationForAttempt;
        setOperatorEvaluation(evaluationForAttempt);

        setFormData((prev) => ({
          ...prev,
          line: state?.lineName ?? prev.line,
          department: state?.departmentName ?? prev.department,
          station: state?.stationName ?? prev.station,
          process_name: evaluationForAttempt?.process_name ?? prev.process_name,
          shift: evaluationForAttempt?.shift ?? prev.shift,
          date: evaluationForAttempt?.date ?? prev.date,
          date_of_retraining_completed:
            evaluationForAttempt?.date_of_retraining_completed ?? prev.date_of_retraining_completed,
          prepared_by: evaluationForAttempt?.prepared_by ?? prev.prepared_by,
          checked_by: evaluationForAttempt?.checked_by ?? prev.checked_by,
          approved_by: evaluationForAttempt?.approved_by ?? prev.approved_by,
        }));
      } else {
        setOperatorEvaluation(null);
        operatorEval = null;
      }

      // -----------------------
      // Step 5: Logic to wipe data for NEW attempt
      // -----------------------
      // Crucial: We check (computedAttempt === latestAttempt + 1). 
      // Since we blocked the increment above if passed, this condition will fail, 
      // preventing the "blank sheet" logic from running on a passed record.
      if (isRetraining && attemptMode === "new" && computedAttempt === latestAttempt + 1) {
        console.log("⏭️ New retraining attempt — blank sheet (explicit new attempt)");
        setEvaluationData(null);
        setEvaluationScores({});
        setDailyMetrics({});
        setCompletedDays([]);
        setFormData((prev) => ({
          ...prev,
          date: new Date().toISOString().split("T")[0],
          shift: "",
          date_of_retraining_completed: "",
          prepared_by: "",
          checked_by: "",
          approved_by: "",
        }));
        return; 
      }

      // -----------------------
      // Step 6: pick evaluation id for marks fetch (if exists)
      // -----------------------
      const currentEvalId = evaluationForAttempt ? evaluationForAttempt.id : null;

      if (currentEvalId) {
        const marksResponse = await fetch(
          `${API_BASE_URL}/evaluation-marks/by-employee-code/${empId}/?level_id=${levelId}&department_id=${departmentId}&station_id=${stationId}&evaluation_id=${currentEvalId}`
        );

        if (marksResponse.ok) {
          const marksData = await marksResponse.json();

          setEvaluationData({
            employee_code: marksData.employee_code ?? empId,
            employee_details: operatorEval,
            evaluations: Array.isArray(marksData.evaluations) ? marksData.evaluations : [],
            per_day_results: Array.isArray(marksData.per_day_results) ? marksData.per_day_results : [],
            total_score: marksData.total_score ?? 0,
            total_possible_score: marksData.total_possible_score ?? 0,
            final_percentage:
              marksData.final_percentage ??
              (marksData.total_possible_score
                ? (marksData.total_score / marksData.total_possible_score) * 100
                : 0),
            final_status: marksData.final_status ?? "Not Evaluated",
          });
        } else {
          console.warn("Marks fetch failed:", marksResponse.status, marksResponse.statusText);
          setEvaluationData({
            employee_code: empId,
            employee_details: operatorEval,
            evaluations: [],
            per_day_results: [],
            total_score: 0,
            total_possible_score: 0,
            final_percentage: 0,
            final_status: "Not Evaluated",
          });
        }
      } else {
        setEvaluationData({
          employee_code: empId,
          employee_details: operatorEval,
          evaluations: [],
          per_day_results: [],
          total_score: 0,
          total_possible_score: 0,
          final_percentage: 0,
          final_status: "Not Evaluated",
        });
      }
    } catch (error) {
      console.error("Error fetching evaluation data:", error);
    }
  },
  [fetchMaxAttempts, isRetraining, attemptMode, state]
);



  useEffect(() => {
    if (evaluationData && days.length > 0 && subtopics.length > 0) {
      const completed = days
        .filter((day) => {
          const activeSubtopics = subtopics.filter((sub) => sub.is_active);
          return activeSubtopics.every((sub) => {
            const evalItem = evaluationData.evaluations.find(
              (e) => e.subtopic === sub.id && e.day === day.id
            );
            if (!evalItem) return false;
            for (let i = 1; i <= 10; i++) {
              const key = `mark_${i}` as keyof EvaluationSubTopicMarks;
              if (evalItem[key] === null || evalItem[key] === undefined)
                return false;
            }
            return true;
          });
        })
        .map((d) => d.day_name);
      setCompletedDays(completed);
    }
  }, [evaluationData, days, subtopics]);

  useEffect(() => {
    if (evaluationData && selectedDay && days.length > 0) {
      const scores: { [key: string]: string } = {};
      const dayObj = days.find((d) => d.day_name === selectedDay);
      if (dayObj) {
        subtopics.forEach((sub) => {
          const evalItem = evaluationData.evaluations.find(
            (e) => e.subtopic === sub.id && e.day === dayObj.id
          );
          if (evalItem) {
            for (let i = 1; i <= 10; i++) {
              const key = `mark_${i}` as keyof EvaluationSubTopicMarks;
              const score = evalItem[key];
              if (score !== null && score !== undefined) {
                scores[`${sub.id}-${i - 1}`] = score.toString();
              }
            }
          }
        });
      }
      setEvaluationScores(scores);
    }
  }, [evaluationData, selectedDay, days, subtopics]);

  useEffect(() => {
    // Check if the required IDs are present
    if (!employeeId || !levelId || !departmentId || !stationId) {
      setLoading(false); // Stop loading if we don't have the info to fetch
      return;
    }

    const loadData = async () => {
      // FIX #3: Reset state when IDs change to prevent showing old data
      setLoading(true);
      setEmployee(null);
      setTopics([]);
      setSubtopics([]);
      setDays([]);
      setEvaluationData(null);
      setOperatorEvaluation(null);
      setEvaluationScores({});
      setCompletedDays([]);
      setSelectedDay("");

      // Now fetch new data
      await fetchEmployee(employeeId);
      await fetchConfiguration(levelId, departmentId, stationId);
      await fetchEvaluationData(employeeId, levelId, departmentId, stationId);
      setLoading(false);
    };

    loadData();
    // FIX #4: Use specific IDs in the dependency array for reliability
  }, [
    employeeId,
    levelId,
    departmentId,
    stationId,
    fetchEmployee,
    fetchConfiguration,
    fetchEvaluationData,
  ]);

  useEffect(() => {
    setIsDaySubmitted(!!(selectedDay && completedDays.includes(selectedDay)));
  }, [selectedDay, completedDays]);

  useEffect(() => {
    const fetchDailyMetrics = async () => {
      if (!selectedDay || !days.length || !operatorEvaluation) return;

      const dayObj = days.find((d) => d.day_name === selectedDay);
      if (!dayObj) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/tencycle-daily-metrics/?evaluation=${operatorEvaluation.id}&day=${dayObj.id}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const metrics = data[0];
            // Populate dailyMetrics state with fetched data
            setDailyMetrics({
              cycle_time_required:
                metrics.cycle_time_required?.toString() || "",
              cycle_time_actual_1:
                metrics.cycle_time_actual_1?.toString() || "",
              cycle_time_actual_2:
                metrics.cycle_time_actual_2?.toString() || "",
              cycle_time_actual_3:
                metrics.cycle_time_actual_3?.toString() || "",
              cycle_time_actual_4:
                metrics.cycle_time_actual_4?.toString() || "",
              cycle_time_actual_5:
                metrics.cycle_time_actual_5?.toString() || "",
              cycle_time_actual_6:
                metrics.cycle_time_actual_6?.toString() || "",
              cycle_time_actual_7:
                metrics.cycle_time_actual_7?.toString() || "",
              cycle_time_actual_8:
                metrics.cycle_time_actual_8?.toString() || "",
              cycle_time_actual_9:
                metrics.cycle_time_actual_9?.toString() || "",
              cycle_time_actual_10:
                metrics.cycle_time_actual_10?.toString() || "",
              quality_rate: metrics.quality_rate?.toString() || "",
              productivity: metrics.productivity?.toString() || "",
            });
          } else {
            // Clear metrics if no data found
            setDailyMetrics({});
          }
        }
      } catch (error) {
        console.error("Error fetching daily metrics:", error);
      }
    };

    fetchDailyMetrics();
  }, [selectedDay, days, operatorEvaluation]);

  useEffect(() => {
    const fetchDay6Metrics = async () => {
      if (
        !operatorEvaluation?.id ||
        !days.length ||
        completedDays.length !== 6
      ) {
        setMetricsLoading(false);
        return;
      }

      const sortedDays = [...days].sort(
        (a, b) => a.sequence_order - b.sequence_order
      );
      const lastDay = sortedDays[sortedDays.length - 1];

      if (!lastDay) {
        setMetricsLoading(false);
        return;
      }

      try {
        setMetricsLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/tencycle-daily-metrics/?evaluation=${operatorEvaluation.id}&day=${lastDay.id}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setDay6Quality(data[0].quality_rate);
            setDay6Productivity(data[0].productivity);
          }
        }
      } catch (error) {
        console.error("Error fetching Day 6 metrics:", error);
      } finally {
        setMetricsLoading(false);
      }
    };

    fetchDay6Metrics();
  }, [operatorEvaluation?.id, days, completedDays.length]);

  useEffect(() => {
    if (isRetraining && attemptMode === "new") {
      console.log("🆕 Starting blank retraining 10 Cycle attempt");
      setEvaluationData(null);
      setEvaluationScores({});
      setDailyMetrics({});
      setCompletedDays([]);
      setOperatorEvaluation(null);
      setFormData((prev) => ({
        ...prev,
        date: new Date().toISOString().split("T")[0],
        shift: "",
        date_of_retraining_completed: "",
        prepared_by: "",
        checked_by: "",
        approved_by: "",
      }));
    }
  }, [isRetraining, attemptMode]);

  // Close dropdown when clicking outside
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setShowAttemptsDropdown(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);


// Fetch all attempts when component loads
useEffect(() => {
  if (employeeId && levelId && departmentId && stationId && !isViewOnlyMode) {
    fetchAllAttempts(employeeId, levelId, departmentId, stationId);
  }
}, [employeeId, levelId, departmentId, stationId, fetchAllAttempts, isViewOnlyMode, attemptNumber]);



  const handleDayChange = (dayName: string) => {
    const sortedDays = [...days].sort(
      (a, b) => a.sequence_order - b.sequence_order
    );
    const selectedIndex = sortedDays.findIndex((d) => d.day_name === dayName);

    if (selectedIndex === 0) {
      setSelectedDay(dayName);
      setDailyMetrics({}); // Clear metrics when changing day
      return;
    }

    for (let i = 0; i < selectedIndex; i++) {
      if (!completedDays.includes(sortedDays[i].day_name)) {
        alert(`Please complete ${sortedDays[i].day_name} evaluation first.`);
        return;
      }
    }
    setSelectedDay(dayName);
    setDailyMetrics({}); // Clear metrics when changing day
  };

  const getScoreOptions = (scoreRequired: number) => {
    if (scoreRequired === 2) {
      return [0, 1, 2];
    } else if (scoreRequired === 10) {
      return [0, 5, 10];
    }
    return [];
  };

  const handleScoreChange = (
    subtopicId: number,
    cycleIndex: number,
    value: string
  ) => {
    setEvaluationScores((prev) => ({
      ...prev,
      [`${subtopicId}-${cycleIndex}`]: value,
    }));
  };

  const handleMetricsChange = (field: string, value: string) => {
    setDailyMetrics((prev) => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !state?.employeeId ||
      !selectedDay ||
      !levelId ||
      !departmentId ||
      !stationId
    ) {
      alert("Missing required data");
      return;
    }

    // ✅ Check that all scores are filled
    for (const sub of subtopics) {
      for (let i = 0; i < 10; i++) {
        if (!evaluationScores[`${sub.id}-${i}`]) {
          alert("Please fill in all scores before submitting");
          return;
        }
      }
    }

    setLoading(true);

    try {
      // ✅ Fetch max attempts from backend
      const maxAttempts = await fetchMaxAttempts("10CYCLE");
      if (attemptNumber > maxAttempts) {
        alert(
          `⚠️ Maximum number of attempts (${maxAttempts}) reached. You cannot submit further retraining.`
        );
        setLoading(false);
        return;
      }

      const dayObj = days.find((d) => d.day_name === selectedDay);
      if (!dayObj) {
        alert("Invalid day selection");
        setLoading(false);
        return;
      }

      const evalPayload = {
        employee: employee?.emp_id,
        date: formData.date,
        shift: formData.shift,
        department: departmentId,
        station: stationId,
        level: levelId,
        line: formData.line,
        process_name: formData.process_name,
        operation_no: "",
        date_of_retraining_completed:
          formData.date_of_retraining_completed || null,
        prepared_by: formData.prepared_by,
        checked_by: formData.checked_by,
        approved_by: formData.approved_by,
        is_completed: false,
        final_status: "Not Evaluated",
        attempt_no: attemptNumber,
      };

      let operatorEvalId = operatorEvaluation?.id;

      // ✅ STEP 1: Try to reuse an existing open attempt before creating a new one
      if (!operatorEvaluation) {
        const existingEvalResp = await fetch(
          `${API_BASE_URL}/operator-evaluations/by-employee-code/${employeeId}/?level_id=${levelId}&department_id=${departmentId}&station_id=${stationId}`
        );

        let existingEval = null;
        if (existingEvalResp.ok) {
          const allEvals = await existingEvalResp.json();
          existingEval = allEvals.find(
            (e: any) => e.attempt_no === attemptNumber && !e.is_completed
          );
        }

        if (existingEval) {
          // 🟢 Reuse existing attempt
          operatorEvalId = existingEval.id;
          setOperatorEvaluation(existingEval);
        } else {
          // 🟢 Create new evaluation only if necessary
          const resp = await fetch(`${API_BASE_URL}/operator-evaluations/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(evalPayload),
          });

          if (resp.ok) {
            const newEval = await resp.json();
            operatorEvalId = newEval.id;
            setOperatorEvaluation(newEval);
          } else {
            throw new Error("Failed to create operator evaluation");
          }
        }
      } else {
        operatorEvalId = operatorEvaluation.id;
      }

      // ✅ STEP 2: Save subtopic marks
      const saveMarksPromises = subtopics.map(async (sub) => {
        const marks: { [key: string]: number | null } = {};
        for (let i = 0; i < 10; i++) {
          const key = `${sub.id}-${i}`;
          const val = evaluationScores[key];
          marks[`mark_${i + 1}`] =
            val !== undefined && val !== "" ? parseInt(val) : null;
        }

        const markPayload = {
          employee: operatorEvalId,
          subtopic: sub.id,
          day: dayObj.id,
          ...marks,
        };

        const existingMark = evaluationData?.evaluations.find(
          (e) => e.subtopic === sub.id && e.day === dayObj.id
        );

        if (existingMark) {
          // 🟢 Update existing mark
          const res = await fetch(
            `${API_BASE_URL}/evaluation-marks/${existingMark.id}/`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(markPayload),
            }
          );
          return res.json();
        } else {
          // 🟢 Create new mark
          const res = await fetch(`${API_BASE_URL}/evaluation-marks/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(markPayload),
          });
          return res.json();
        }
      });

      await Promise.all(saveMarksPromises);

      // ✅ STEP 3: Save or update metrics for the current day
      const metricsPayload = {
        evaluation: operatorEvalId,
        day: dayObj.id,
        cycle_time_required: dailyMetrics["cycle_time_required"]
          ? parseFloat(dailyMetrics["cycle_time_required"])
          : null,
        cycle_time_actual_1: dailyMetrics["cycle_time_actual_1"]
          ? parseFloat(dailyMetrics["cycle_time_actual_1"])
          : null,
        cycle_time_actual_2: dailyMetrics["cycle_time_actual_2"]
          ? parseFloat(dailyMetrics["cycle_time_actual_2"])
          : null,
        cycle_time_actual_3: dailyMetrics["cycle_time_actual_3"]
          ? parseFloat(dailyMetrics["cycle_time_actual_3"])
          : null,
        cycle_time_actual_4: dailyMetrics["cycle_time_actual_4"]
          ? parseFloat(dailyMetrics["cycle_time_actual_4"])
          : null,
        cycle_time_actual_5: dailyMetrics["cycle_time_actual_5"]
          ? parseFloat(dailyMetrics["cycle_time_actual_5"])
          : null,
        cycle_time_actual_6: dailyMetrics["cycle_time_actual_6"]
          ? parseFloat(dailyMetrics["cycle_time_actual_6"])
          : null,
        cycle_time_actual_7: dailyMetrics["cycle_time_actual_7"]
          ? parseFloat(dailyMetrics["cycle_time_actual_7"])
          : null,
        cycle_time_actual_8: dailyMetrics["cycle_time_actual_8"]
          ? parseFloat(dailyMetrics["cycle_time_actual_8"])
          : null,
        cycle_time_actual_9: dailyMetrics["cycle_time_actual_9"]
          ? parseFloat(dailyMetrics["cycle_time_actual_9"])
          : null,
        cycle_time_actual_10: dailyMetrics["cycle_time_actual_10"]
          ? parseFloat(dailyMetrics["cycle_time_actual_10"])
          : null,
        quality_rate: dailyMetrics["quality_rate"]
          ? parseFloat(dailyMetrics["quality_rate"])
          : null,
        productivity: dailyMetrics["productivity"]
          ? parseFloat(dailyMetrics["productivity"])
          : null,
      };

      const existingMetricsResponse = await fetch(
        `${API_BASE_URL}/tencycle-daily-metrics/?evaluation=${operatorEvalId}&day=${dayObj.id}`
      );

      let existingMetrics = null;
      if (existingMetricsResponse.ok) {
        const metricsData = await existingMetricsResponse.json();
        if (Array.isArray(metricsData) && metricsData.length > 0) {
          existingMetrics = metricsData[0];
        }
      }

      if (existingMetrics) {
        // 🟢 Update metrics
        await fetch(
          `${API_BASE_URL}/tencycle-daily-metrics/${existingMetrics.id}/`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(metricsPayload),
          }
        );
      } else {
        // 🟢 Create new metrics
        await fetch(`${API_BASE_URL}/tencycle-daily-metrics/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(metricsPayload),
        });
      }

      alert(`${selectedDay} evaluation saved successfully!`);

      // ✅ Refresh data after submission
      await fetchEvaluationData(
        state.employeeId,
        levelId,
        departmentId,
        stationId
      );
    } catch (error) {
      console.error("Error saving evaluation:", error);
      alert("Error saving evaluation");
    } finally {
      setLoading(false);
    }
  };



  const calculateTotalForCycle = (cycleIndex: number) => {
    return subtopics.reduce((sum, sub) => {
      const val = evaluationScores[`${sub.id}-${cycleIndex}`];
      const num = val !== undefined && val !== "" ? parseInt(val) : 0;
      return sum + num;
    }, 0);
  };

  const isDaySelectable = (dayName: string) => {
    const sortedDays = [...days].sort(
      (a, b) => a.sequence_order - b.sequence_order
    );
    const dayIndex = sortedDays.findIndex((d) => d.day_name === dayName);
    if (dayIndex === 0) return true;
    for (let i = 0; i < dayIndex; i++) {
      if (!completedDays.includes(sortedDays[i].day_name)) return false;
    }
    return true;
  };

  const handleViewPreviousData = () => {
  setShowAttemptsDropdown(!showAttemptsDropdown);
};

const handleSelectAttempt = async (attempt: any) => {
  if (!employeeId || !levelId || !departmentId || !stationId) return;
  
  console.log("Selected attempt:", attempt); // Debug log
  
  setLoading(true);
  setShowAttemptsDropdown(false);
  setIsViewOnlyMode(true);
  setViewingAttemptId(attempt.id);
  
  // Fetch the evaluation data using the attempt's evaluation ID
  try {
    const evalResponse = await fetch(
      `${API_BASE_URL}/operator-evaluations/by-employee-code/${employeeId}/?level_id=${levelId}&department_id=${departmentId}&station_id=${stationId}`
    );
    
    if (evalResponse.ok) {
      const evalData = await evalResponse.json();
      
      // Find the exact evaluation record for this attempt number
      const selectedEval = evalData.find(
        (ev: any) => Number(ev.attempt_no) === Number(attempt.attempt_no)
      );
      
      if (selectedEval) {
        setAttemptNumber(selectedEval.attempt_no);
        setOperatorEvaluation(selectedEval);
        
        // Now fetch marks for this specific evaluation ID
        const marksResponse = await fetch(
          `${API_BASE_URL}/evaluation-marks/by-employee-code/${employeeId}/?level_id=${levelId}&department_id=${departmentId}&station_id=${stationId}&evaluation_id=${selectedEval.id}`
        );
        
        if (marksResponse.ok) {
          const marksData = await marksResponse.json();
          
          setEvaluationData({
            employee_code: marksData.employee_code ?? employeeId,
            employee_details: selectedEval,
            evaluations: Array.isArray(marksData.evaluations) ? marksData.evaluations : [],
            per_day_results: Array.isArray(marksData.per_day_results) ? marksData.per_day_results : [],
            total_score: marksData.total_score ?? 0,
            total_possible_score: marksData.total_possible_score ?? 0,
            final_percentage: marksData.final_percentage ?? 0,
            final_status: marksData.final_status ?? "Not Evaluated",
          });
          
          // Update form data with this attempt's data
          setFormData((prev) => ({
            ...prev,
            shift: selectedEval?.shift ?? prev.shift,
            date: selectedEval?.date ?? prev.date,
            date_of_retraining_completed: selectedEval?.date_of_retraining_completed ?? prev.date_of_retraining_completed,
            prepared_by: selectedEval?.prepared_by ?? prev.prepared_by,
            checked_by: selectedEval?.checked_by ?? prev.checked_by,
            approved_by: selectedEval?.approved_by ?? prev.approved_by,
          }));
        }
      }
    }
  } catch (error) {
    console.error("Error loading attempt:", error);
    alert("Failed to load attempt data");
  } finally {
    setLoading(false);
  }
};

const handleBackToCurrentAttempt = async () => {
  if (!employeeId || !levelId || !departmentId || !stationId) return;
  
  setLoading(true);
  setIsViewOnlyMode(false);
  setViewingAttemptId(null);
  
  // Reload current attempt data
  await fetchEvaluationData(employeeId, levelId, departmentId, stationId);
  await fetchAllAttempts(employeeId, levelId, departmentId, stationId);
  setLoading(false);
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-semibold text-slate-700">
            Loading evaluation data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 mb-8">
          {/* TOP BAR: Attempt Number + View Button */}
          <div className="flex justify-between items-center px-8 py-3 bg-blue-50 border-b border-blue-100">
            {/* Attempt Badge */}
<div className="flex items-center gap-3">
  {/* Back button FIRST */}
  {isViewOnlyMode && (
    <button
      onClick={handleBackToCurrentAttempt}
      className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Back to Current
    </button>
  )}
  
  {/* Attempt badge SECOND */}
  {attemptNumber ? (
    <span className={`text-sm font-semibold px-4 py-2 rounded-full shadow-sm ${
      isViewOnlyMode 
        ? 'bg-amber-100 text-amber-800 border border-amber-300' 
        : 'bg-blue-100 text-blue-800'
    }`}>
      {isViewOnlyMode ? `Viewing Attempt ${attemptNumber}` : `Attempt ${attemptNumber}`}
    </span>
  ) : (
    <span className="text-sm text-slate-500 italic">
      Loading attempt...
    </span>
  )}
</div>

            {/* View Previous Data Button with Dropdown */}
<div className="relative" ref={dropdownRef}>
  <button
    onClick={handleViewPreviousData}
    disabled={isViewOnlyMode || previousAttempts.length === 0}
    className={`flex items-center gap-2 font-semibold px-5 py-2 rounded-lg shadow-md transition-all duration-200 ${
      isViewOnlyMode || previousAttempts.length === 0
        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
        : 'bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white hover:scale-105'
    }`}
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    View Previous Data
    <svg className={`w-4 h-4 transition-transform ${showAttemptsDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {/* Dropdown Menu */}
  {showAttemptsDropdown && previousAttempts.length > 0 && (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 to-blue-600 px-4 py-3">
        <h3 className="text-white font-bold text-sm">Previous Evaluation Attempts</h3>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {previousAttempts.map((attempt) => (
          <button
            key={attempt.id}
            onClick={() => handleSelectAttempt(attempt)}
            className="w-full px-4 py-3 hover:bg-blue-50 transition-colors duration-150 border-b border-slate-100 last:border-b-0 text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">{attempt.attempt_no}</span>
                </div>
                <div>
                  <div className="font-semibold text-slate-800 text-sm">
                    Attempt {attempt.attempt_no}
                  </div>
                  {/* <div className="text-xs text-slate-500">
                    {new Date(attempt.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div> */}
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  attempt.final_status === 'Pass'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : attempt.final_status === 'Fail'
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}>
                  {attempt.final_status}
                </span>
                {attempt.final_percentage > 0 && (
                  <span className="text-xs font-semibold text-slate-600">
                    {attempt.final_percentage.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )}
</div>
          </div>

          {/* MAIN HEADER SECTION */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white px-8 py-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  10 Cycle Evaluation Check Fields
                </h2>
                <p className="text-blue-100 font-medium">
                  Level Assessment Form
                </p>
              </div>

              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <label
                  htmlFor="date"
                  className="block text-sm font-semibold text-blue-100 mb-2"
                >
                  Evaluation Date
                </label>
                <input
                  type="date"
                  name="date"
                  id="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="bg-white text-slate-800 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-300 focus:outline-none shadow-sm"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Employee Info */}
        {employee && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 mb-8">
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                <div className="w-1 h-6 bg-blue-500 rounded-full mr-3"></div>
                Trainee Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Trainee Name
                  </label>
                  <div className="bg-slate-50 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200">
                    {(employee.first_name || "") +
                      (employee.last_name ? " " + employee.last_name : "")}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Trainee ID
                  </label>
                  <div className="bg-slate-50 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200">
                    {employee.emp_id}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Date of Joining
                  </label>
                  <input
                    type="date"
                    name="dateOfJoin"
                    value={formData.dateOfJoin}
                    readOnly
                    className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-600 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Date of Retraining
                  </label>
                  <input
                    type="date"
                    name="date_of_retraining_completed"
                    value={formData.date_of_retraining_completed}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Station Name
                  </label>
                  <input
                    type="text"
                    name="station"
                    value={formData.station}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Day Selection & Evaluation Form */}
        {topics.length > 0 && days.length > 0 && subtopics.length > 0 && (
          <>
            {/* Day Selection */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 mb-8">
              <div className="px-8 py-6 bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 border-b border-slate-200">
                <div className="flex items-center justify-center space-x-6">
                  <label className="text-lg font-semibold text-slate-800">
                    Evaluation Day
                  </label>
                  <select
                    value={selectedDay}
                    onChange={(e) => handleDayChange(e.target.value)}
                    className="bg-white border-2 border-indigo-200 rounded-xl px-6 py-3 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none shadow-sm"
                  >
                    <option value="">Select Day...</option>
                    {days
                      .sort((a, b) => a.sequence_order - b.sequence_order)
                      .map((day) => {
                        const isSelectable = isDaySelectable(day.day_name);
                        const isCompleted = completedDays.includes(
                          day.day_name
                        );
                        return (
                          <option
                            key={day.id}
                            value={day.day_name}
                            disabled={!isSelectable}
                          >
                            {day.day_name} {isCompleted ? "✓" : ""}{" "}
                            {!isSelectable ? "(Locked)" : ""}
                          </option>
                        );
                      })}
                  </select>
                </div>
              </div>
            </div>

            {/* Evaluation Table */}
            {selectedDay && (
              <form onSubmit={handleSubmit}>
                <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 mb-8">
                  <div className="p-8">
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
                      <table className="w-full min-w-[1200px] table-fixed">
                        <thead className="bg-gradient-to-r from-slate-100 to-gray-100 border-b-2 border-slate-200">
                          <tr>
                            <th className="w-16 p-4 border-r border-slate-200 text-sm font-bold text-slate-700">
                              S.No.
                            </th>
                            <th className="w-60 p-4 border-r border-slate-200 text-sm font-bold text-slate-700 text-left">
                              Topic
                            </th>
                            <th className="w-80 p-4 border-r border-slate-200 text-sm font-bold text-slate-700 text-left">
                              Subtopic Description
                            </th>
                            <th className="w-20 p-4 border-r border-slate-200 text-sm font-bold text-slate-700">
                              Score
                            </th>
                            {[...Array(10)].map((_, i) => (
                              <th
                                key={`header-${i}`}
                                className="w-20 p-4 border-r border-slate-200 last:border-r-0 text-sm font-bold text-slate-700"
                              >
                                {i + 1}
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody>
                          {topics.map((topic, topicIndex) => {
                            const topicSubtopics = subtopics.filter(
                              (st) => st.topic === topic.id
                            );
                            return topicSubtopics.map(
                              (subtopic, subtopicIndex) => (
                                <tr
                                  key={subtopic.id}
                                  className={`border-b border-slate-200 transition-all duration-200 hover:bg-slate-50 ${
                                    (topicIndex * topicSubtopics.length +
                                      subtopicIndex) %
                                      2 ===
                                    0
                                      ? "bg-white"
                                      : "bg-slate-50/30"
                                  }`}
                                >
                                  {subtopicIndex === 0 && (
                                    <td
                                      rowSpan={topicSubtopics.length}
                                      className="w-16 p-4 border-r border-slate-200 text-center align-middle"
                                    >
                                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm mx-auto">
                                        <span className="text-sm font-bold text-white">
                                          {topic.slno}
                                        </span>
                                      </div>
                                    </td>
                                  )}

                                  {subtopicIndex === 0 && (
                                    <td
                                      rowSpan={topicSubtopics.length}
                                      className="w-60 p-4 border-r border-slate-200 align-middle"
                                    >
                                      <div className="text-sm font-semibold text-slate-800 leading-tight break-words">
                                        {topic.cycle_topics}
                                      </div>
                                    </td>
                                  )}

                                  <td className="w-80 p-4 border-r border-slate-200 align-top">
                                    <div className="text-sm text-slate-600 leading-relaxed break-words hyphens-auto">
                                      {subtopic.sub_topic}
                                    </div>
                                  </td>

                                  <td className="w-20 p-4 border-r border-slate-200 text-center align-top">
                                    <div
                                      className={`px-3 py-2 rounded-full text-sm font-bold shadow-sm inline-block ${
                                        subtopic.score_required === 10
                                          ? "bg-purple-100 text-purple-800 border border-purple-200"
                                          : "bg-indigo-100 text-indigo-800 border border-indigo-200"
                                      }`}
                                    >
                                      {subtopic.score_required}
                                    </div>
                                  </td>

                                  {[...Array(10)].map((_, i) => (
                                    <td
                                      key={`cycle-${i}-subtopic-${subtopic.id}`}
                                      className="w-20 p-4 border-r border-slate-200 last:border-r-0 text-center align-top"
                                    >
                                      <select
                                        value={
                                          evaluationScores[
                                            `${subtopic.id}-${i}`
                                          ] ?? ""
                                        }
                                        onChange={(e) =>
                                          handleScoreChange(
                                            subtopic.id,
                                            i,
                                            e.target.value
                                          )
                                        }
                                        disabled={isDaySubmitted}
                                        className={`w-full h-12 text-center rounded-lg text-sm font-medium shadow-sm transition-all duration-200 ${
                                          isDaySubmitted
                                            ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                                            : "bg-white border-2 border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none hover:border-slate-400 cursor-pointer"
                                        }`}
                                      >
                                        <option value="">-</option>
                                        {getScoreOptions(
                                          subtopic.score_required
                                        ).map((score) => (
                                          <option key={score} value={score}>
                                            {score}
                                          </option>
                                        ))}
                                      </select>
                                    </td>
                                  ))}
                                </tr>
                              )
                            );
                          })}

                          {/* Total Marks Row */}
                          <tr className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-slate-200">
                            <td className="w-16 p-4 border-r border-slate-200"></td>
                            <td className="w-60 p-4 border-r border-slate-200">
                              <span className="text-sm font-bold text-slate-800">
                                Marks
                              </span>
                            </td>
                            <td className="w-80 p-4 border-r border-slate-200">
                              <span className="text-sm font-semibold text-slate-600">
                                Out of{" "}
                                {subtopics.reduce(
                                  (sum, subtopic) =>
                                    sum + subtopic.score_required,
                                  0
                                )}
                              </span>
                            </td>
                            <td className="w-20 p-4 border-r border-slate-200"></td>
                            {[...Array(10)].map((_, i) => {
                              const total = calculateTotalForCycle(i);
                              const maxPossible = subtopics.reduce(
                                (sum, subtopic) =>
                                  sum + subtopic.score_required,
                                0
                              );
                              const percentage =
                                maxPossible > 0
                                  ? (total / maxPossible) * 100
                                  : 0;
                              const isPass = percentage >= passingCriteria;

                              return (
                                <td
                                  key={`total-${i}`}
                                  className="w-20 p-4 border-r border-slate-200 last:border-r-0 text-center"
                                >
                                  <div
                                    className={`px-3 py-2 rounded-lg text-sm font-bold shadow-sm border inline-block ${
                                      total === 0
                                        ? "bg-gray-100 text-gray-500 border-gray-200"
                                        : isPass
                                        ? "bg-green-100 text-green-800 border-green-200"
                                        : "bg-red-100 text-red-800 border-red-200"
                                    }`}
                                    title={`${percentage.toFixed(1)}% (${
                                      isPass ? "Pass" : "Fail"
                                    })`}
                                  >
                                    {total}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>

                          {/* Percentage Row */}
                          <tr className="bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border-b border-slate-200">
                            <td className="w-16 p-4 border-r border-slate-200"></td>
                            <td className="w-60 p-4 border-r border-slate-200">
                              <span className="text-sm font-bold text-slate-800">
                                %
                              </span>
                            </td>
                            <td className="w-80 p-4 border-r border-slate-200">
                              <span className="text-sm font-semibold text-slate-600">
                                Out of 100
                              </span>
                            </td>
                            <td className="w-20 p-4 border-r border-slate-200"></td>
                            {[...Array(10)].map((_, i) => {
                              const total = calculateTotalForCycle(i);
                              const maxPossible = subtopics.reduce(
                                (sum, subtopic) =>
                                  sum + subtopic.score_required,
                                0
                              );
                              const percentage =
                                maxPossible > 0
                                  ? (total / maxPossible) * 100
                                  : 0;

                              return (
                                <td
                                  key={`percent-${i}`}
                                  className="w-20 p-4 border-r border-slate-200 last:border-r-0 text-center"
                                >
                                  <div className="text-sm font-bold text-slate-700">
                                    {percentage.toFixed(1)}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>

                          {/* Total Percentage Row */}
                          <tr className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-b-2 border-slate-300">
                            <td className="w-16 p-4 border-r border-slate-200"></td>
                            <td
                              colSpan={2}
                              className="p-4 border-r border-slate-200"
                            >
                              <span className="text-sm font-bold text-slate-800">
                                Total %
                              </span>
                            </td>
                            <td className="w-20 p-4 border-r border-slate-200"></td>
                            <td colSpan={10} className="p-4">
                              <div className="text-center">
                                {(() => {
                                  // Check if all evaluation scores are filled
                                  const allScoresFilled = subtopics.every(
                                    (sub) => {
                                      for (let i = 0; i < 10; i++) {
                                        const val =
                                          evaluationScores[`${sub.id}-${i}`];
                                        if (
                                          val === undefined ||
                                          val === "" ||
                                          val === null
                                        ) {
                                          return false;
                                        }
                                      }
                                      return true;
                                    }
                                  );

                                  if (!allScoresFilled) {
                                    return (
                                      <span className="text-sm text-slate-500 italic">
                                        Complete all evaluations to see total
                                      </span>
                                    );
                                  }

                                  const totalScore = subtopics.reduce(
                                    (sum, sub) => {
                                      for (let i = 0; i < 10; i++) {
                                        const val =
                                          evaluationScores[`${sub.id}-${i}`];
                                        sum +=
                                          val !== undefined && val !== ""
                                            ? parseInt(val)
                                            : 0;
                                      }
                                      return sum;
                                    },
                                    0
                                  );
                                  const maxPossible =
                                    subtopics.reduce(
                                      (sum, subtopic) =>
                                        sum + subtopic.score_required,
                                      0
                                    ) * 10;
                                  const totalPercentage =
                                    maxPossible > 0
                                      ? (totalScore / maxPossible) * 100
                                      : 0;
                                  const isPass =
                                    totalPercentage >= passingCriteria;

                                  return (
                                    <span
                                      className={`px-6 py-2 rounded-lg text-base font-bold shadow-md border-2 inline-block ${
                                        isPass
                                          ? "bg-green-100 text-green-800 border-green-300"
                                          : "bg-red-100 text-red-800 border-red-300"
                                      }`}
                                    >
                                      {totalPercentage.toFixed(2)}% -{" "}
                                      {isPass ? "Pass" : "Fail"}
                                    </span>
                                  );
                                })()}
                              </div>
                            </td>
                          </tr>

                          {/* Cycle Time - Required Row */}
                          <tr className="bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 border-b border-slate-200">
                            <td
                              rowSpan={2}
                              className="w-16 p-4 border-r border-slate-200 text-center align-middle bg-yellow-100"
                            >
                              <span className="text-base font-bold text-slate-800">
                                A
                              </span>
                            </td>
                            <td
                              rowSpan={2}
                              className="w-60 p-4 border-r border-slate-200 align-middle"
                            >
                              <span className="text-sm font-bold text-slate-800">
                                Cycle Time
                              </span>
                            </td>
                            <td
                              colSpan={2}
                              className="p-4 border-r border-slate-200"
                            >
                              <span className="text-sm font-semibold text-slate-700">
                                Required
                              </span>
                            </td>
                            <td colSpan={10} className="p-4">
                              <input
                                type="number"
                                step="0.01"
                                value={
                                  dailyMetrics["cycle_time_required"] ?? ""
                                }
                                onChange={(e) =>
                                  handleMetricsChange(
                                    "cycle_time_required",
                                    e.target.value
                                  )
                                }
                                disabled={isDaySubmitted}
                                className={`w-full rounded-lg px-4 py-2 text-sm border ${
                                  isDaySubmitted
                                    ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-white border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                                }`}
                                placeholder="Enter required cycle time"
                              />
                            </td>
                          </tr>

                          {/* Cycle Time - Actual Row */}
                          <tr className="bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 border-b-2 border-slate-300">
                            <td className="w-80 p-4">
                              <span className="text-sm font-semibold text-slate-700">
                                Actual
                              </span>
                            </td>
                            <td className="w-80 p-4 border-r border-slate-200"></td>
                            {[...Array(10)].map((_, i) => (
                              <td
                                key={`cycle-time-actual-${i}`}
                                className="w-16 p-4 border-r border-slate-200 last:border-r-0 text-center"
                              >
                                <input
                                  type="number"
                                  step="0.01"
                                  value={
                                    dailyMetrics[
                                      `cycle_time_actual_${i + 1}`
                                    ] ?? ""
                                  }
                                  onChange={(e) =>
                                    handleMetricsChange(
                                      `cycle_time_actual_${i + 1}`,
                                      e.target.value
                                    )
                                  }
                                  disabled={isDaySubmitted}
                                  className={`w-full h-12 text-center rounded-lg text-sm font-medium shadow-sm transition-all duration-200 ${
                                    isDaySubmitted
                                      ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                                      : "bg-white border-2 border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none hover:border-slate-400"
                                  }`}
                                  placeholder="0"
                                />
                              </td>
                            ))}
                          </tr>

                          {/* Quality Rate Row */}
                          <tr className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-b-2 border-slate-300">
                            <td className="w-16 p-4 border-r border-slate-200 text-center bg-green-100">
                              <span className="text-base font-bold text-slate-800">
                                B
                              </span>
                            </td>
                            <td className="w-60 p-4 border-r border-slate-200">
                              <span className="text-sm font-bold text-slate-800">
                                Quality Rate
                              </span>
                            </td>
                            <td
                              colSpan={2}
                              className="p-4 border-r border-slate-200"
                            >
                              <span className="text-sm font-semibold text-slate-700">
                                Quality Rate should be more than 100%
                              </span>
                            </td>
                            <td colSpan={10} className="p-4">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={dailyMetrics["quality_rate"] ?? ""}
                                onChange={(e) =>
                                  handleMetricsChange(
                                    "quality_rate",
                                    e.target.value
                                  )
                                }
                                disabled={isDaySubmitted}
                                className={`w-full rounded-lg px-4 py-2 text-sm border ${
                                  isDaySubmitted
                                    ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-white border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                                }`}
                                placeholder="Enter quality rate percentage"
                              />
                            </td>
                          </tr>

                          {/* Productivity Row */}
                          <tr className="bg-gradient-to-r from-purple-50 via-violet-50 to-indigo-50 border-b-2 border-slate-300">
                            <td className="w-16 p-4 border-r border-slate-200 text-center bg-purple-100">
                              <span className="text-base font-bold text-slate-800">
                                C
                              </span>
                            </td>
                            <td className="w-60 p-4 border-r border-slate-200">
                              <span className="text-sm font-bold text-slate-800">
                                Productivity
                              </span>
                            </td>
                            <td
                              colSpan={2}
                              className="p-4 border-r border-slate-200"
                            >
                              <span className="text-sm font-semibold text-slate-700">
                                Productivity should be 100%
                              </span>
                            </td>
                            <td colSpan={10} className="p-4">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={dailyMetrics["productivity"] ?? ""}
                                onChange={(e) =>
                                  handleMetricsChange(
                                    "productivity",
                                    e.target.value
                                  )
                                }
                                disabled={isDaySubmitted}
                                className={`w-full rounded-lg px-4 py-2 text-sm border ${
                                  isDaySubmitted
                                    ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-white border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                                }`}
                                placeholder="Enter productivity percentage"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Signature Section */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 mb-8">
                  <div className="px-8 py-6 bg-white border-t border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                      <div className="w-1 h-6 bg-indigo-500 rounded-full mr-3"></div>
                      Authorization & Approval
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                        <label className="block text-sm font-bold text-slate-700 mb-3">
                          Checked By - Shop Guru
                        </label>
                        <input
                          type="text"
                          name="checked_by"
                          value={formData.checked_by}
                          onChange={handleInputChange}
                          className="w-full rounded-lg px-4 py-3 text-sm border bg-white border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                          placeholder="Enter name"
                        />
                      </div>

                      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                        <label className="block text-sm font-bold text-slate-700 mb-3">
                          Approved By - Section Head
                        </label>
                        <input
                          type="text"
                          name="approved_by"
                          value={formData.approved_by}
                          onChange={handleInputChange}
                          className="w-full rounded-lg px-4 py-3 text-sm border bg-white border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                          placeholder="Enter name"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
                  {isDaySubmitted ? (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                        <svg
                          className="w-8 h-8 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                      </div>
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-green-800 mb-2">
                          Evaluation Completed
                        </h3>
                        <p className="text-sm text-green-700 mb-4">
                          {selectedDay} evaluation has been successfully
                          submitted and cannot be modified.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading || !formData.date || !selectedDay}
                      className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 disabled:from-slate-400 disabled:via-slate-500 disabled:to-slate-600 text-white font-bold px-10 py-4 rounded-xl shadow-lg transition-all duration-300 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none active:scale-95"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          <span>Saving Evaluation...</span>
                        </div>
                      ) : (
                        <span className="text-lg">
                          Submit {selectedDay} Evaluation
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </form>
            )}
          </>
        )}

        {/* Final Summary - Only show after Day 6 is completed */}

        {/* Final Summary - Only show after Day 6 is completed */}
        {/* Final Summary - Only show after Day 6 is completed */}
        {/* Final Summary - Only show after Day 6 is completed */}
        {evaluationData &&
          evaluationData.evaluations &&
          evaluationData.evaluations.length > 0 &&
          // completedDays.length === 6 &&
          completedDays.length >= 5 &&
          operatorEvaluation && (
            <div className="mt-8 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
              <div className="px-8 py-6 bg-slate-50 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                  <div className="w-1 h-6 bg-green-500 rounded-full mr-3"></div>
                  Final Evaluation Summary
                </h3>

                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                  {(() => {
                    const sortedDays = [...days].sort(
                      (a, b) => a.sequence_order - b.sequence_order
                    );
                    const lastThreeDays = sortedDays.slice(-3);

                    const lastThreeDaysData = lastThreeDays.map((day) => {
                      const dayMarks = evaluationData.evaluations.filter(
                        (e) => e.day === day.id
                      );
                      let dayScore = 0;
                      let dayMaxScore = 0;

                      dayMarks.forEach((mark) => {
                        const subtopic = subtopics.find(
                          (st) => st.id === mark.subtopic
                        );
                        if (subtopic) {
                          for (let i = 1; i <= 10; i++) {
                            const markKey = `mark_${i}` as keyof typeof mark;
                            const markValue = mark[markKey];
                            if (markValue !== null && markValue !== undefined) {
                              dayScore += markValue;
                            }
                          }
                          dayMaxScore += subtopic.score_required * 10;
                        }
                      });

                      const percentage =
                        dayMaxScore > 0 ? (dayScore / dayMaxScore) * 100 : 0;
                      return {
                        dayName: day.day_name,
                        percentage: percentage,
                        passed: percentage >= passingCriteria,
                      };
                    });

                    const finalStatus = operatorEvaluation.final_status;
                    const finalPercentage =
                      operatorEvaluation.final_percentage || 0;

                    return (
                      <>
                        {/* Last 3 Days Performance */}
                        <div className="border-b border-slate-200 pb-4">
                          <h4 className="text-sm font-bold text-slate-700 mb-3">
                            Last 3 Days Performance (Minimum 70% Required)
                          </h4>
                          <div className="space-y-2">
                            {lastThreeDaysData.map((dayData, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center bg-slate-50 rounded-lg p-3"
                              >
                                <span className="text-sm font-medium text-slate-700">
                                  {dayData.dayName}
                                </span>
                                <div className="flex items-center gap-3">
                                  <span className="text-lg font-bold text-slate-900">
                                    {dayData.percentage.toFixed(1)}%
                                  </span>
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                                      dayData.passed
                                        ? "bg-green-100 text-green-800 border border-green-200"
                                        : "bg-red-100 text-red-800 border border-red-200"
                                    }`}
                                  >
                                    {dayData.passed ? "✓ Pass" : "✗ Fail"}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Day 6 Additional Metrics */}
                        <div className="border-b border-slate-200 pb-4">
                          <h4 className="text-sm font-bold text-slate-700 mb-3">
                            Day 6 Additional Requirements (At Time of
                            Submission)
                          </h4>
                          {metricsLoading ? (
                            <div className="text-sm text-slate-500 text-center py-4">
                              Loading Day 6 metrics...
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center bg-slate-50 rounded-lg p-3">
                                <span className="text-sm font-medium text-slate-700">
                                  Quality Rate (Must be &gt;98%)
                                </span>
                                <div className="flex items-center gap-3">
                                  <span className="text-lg font-bold text-slate-900">
                                    {day6Quality !== null
                                      ? `${day6Quality.toFixed(1)}%`
                                      : "Not Recorded"}
                                  </span>
                                  {day6Quality !== null && (
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        day6Quality > 98
                                          ? "bg-green-100 text-green-800 border border-green-200"
                                          : "bg-red-100 text-red-800 border border-red-200"
                                      }`}
                                    >
                                      {day6Quality > 98 ? "✓ Pass" : "✗ Fail"}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex justify-between items-center bg-slate-50 rounded-lg p-3">
                                <span className="text-sm font-medium text-slate-700">
                                  Productivity (Must be 100%)
                                </span>
                                <div className="flex items-center gap-3">
                                  <span className="text-lg font-bold text-slate-900">
                                    {day6Productivity !== null
                                      ? `${day6Productivity.toFixed(1)}%`
                                      : "Not Recorded"}
                                  </span>
                                  {day6Productivity !== null && (
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        day6Productivity === 100
                                          ? "bg-green-100 text-green-800 border border-green-200"
                                          : "bg-red-100 text-red-800 border border-red-200"
                                      }`}
                                    >
                                      {day6Productivity === 100
                                        ? "✓ Pass"
                                        : "✗ Fail"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Final Status */}
                        <div className="pt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-700">
                              Final Qualification Status
                            </span>
                            <span
                              className={`px-6 py-3 rounded-lg text-lg font-bold shadow-md border-2 ${
                                finalStatus === "Pass"
                                  ? "bg-green-100 text-green-800 border-green-300"
                                  : "bg-red-100 text-red-800 border-red-300"
                              }`}
                            >
                              {finalStatus}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="pt-4 border-t border-slate-200">
                          <div className="flex justify-between text-xs text-slate-600 mb-2">
                            <span className="font-medium">
                              Evaluation Progress
                            </span>
                            <span>
                              {completedDays.length}/{days.length} days
                              completed
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-3">
                            <div
                              className="bg-green-600 h-3 rounded-full transition-all duration-300"
                              style={{
                                width: `${
                                  (completedDays.length / days.length) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

        {/* Evaluation Criteria and Passing Criteria */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="px-8 py-6 bg-slate-50">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Evaluation Criteria */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-xl p-6">
                <h4 className="font-bold text-blue-800 text-center mb-4 text-lg">
                  Evaluation Criteria:
                </h4>
                <div className="space-y-3">
                  <div className="bg-white/80 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center">
                      <span className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        0
                      </span>
                      <span className="text-sm font-medium text-slate-800">
                        Not Following standard
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/80 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center">
                      <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        1
                      </span>
                      <span className="text-sm font-medium text-slate-800">
                        Following standard Partially
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/80 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center">
                      <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        2
                      </span>
                      <span className="text-sm font-medium text-slate-800">
                        Following standard Properly
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Evaluation Criteria Cycle Time */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-100 border-2 border-amber-200 rounded-xl p-6">
                <h4 className="font-bold text-amber-800 text-center mb-4 text-lg">
                  Evaluation Criteria Cycle Time
                </h4>
                <div className="space-y-3">
                  <div className="bg-white/80 rounded-lg p-3 border border-amber-200">
                    <div className="flex items-center">
                      <span className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        0
                      </span>
                      <span className="text-sm font-medium text-slate-800">
                        Not Following standard
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/80 rounded-lg p-3 border border-amber-200">
                    <div className="flex items-center">
                      <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        5
                      </span>
                      <span className="text-sm font-medium text-slate-800">
                        Following cycle time Partially
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/80 rounded-lg p-3 border border-amber-200">
                    <div className="flex items-center">
                      <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        10
                      </span>
                      <span className="text-sm font-medium text-slate-800">
                        Following cycle time Properly
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Passing Criteria */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 rounded-xl p-6">
                <h4 className="font-bold text-green-800 text-center mb-4 text-lg">
                  Passing Criteria:
                </h4>
                <div className="space-y-3">
                  <div className="bg-white/80 rounded-lg p-3 border border-green-200">
                    <div className="flex items-center justify-center">
                      <span className="text-sm font-bold text-green-800">
                        100% - Pass
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/80 rounded-lg p-3 border border-green-200">
                    <div className="flex items-center justify-center">
                      <span className="text-sm font-bold text-red-800">
                        Less than 100% - Fail
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/80 rounded-lg p-3 border border-green-200">
                    <div className="flex items-center justify-center">
                      <span className="text-sm font-bold text-orange-800">
                        Fail - Re-training
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Passing Criteria Note */}
            <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-6 shadow-sm">
              <h4 className="font-bold text-blue-900 mb-3 text-base">
                Overall Passing Criteria
              </h4>
              <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 leading-relaxed">
                  <strong>Note:</strong> To Qualify Operator should
                  score {}
                  <strong className="text-blue-800">
                    100%, score in 10 cycle check for last three days
                  </strong>{" "}
                  and{" "}
                  <strong className="text-blue-800">
                    quality rate more than 100%
                  </strong>{" "}
                  &{" "}
                  <strong className="text-blue-800">
                    Productivity should be 100% at 6th day
                  </strong>
                  .
                </p>
                <p className="text-sm text-blue-900 leading-relaxed mt-3">
                  If operator fails in any criteria above then re-evaluation to
                  be done after training for next 6 days. If pass the above
                  criteria then continue OJT and work. If fails, discontinue the
                  operator from work and decrease skill level.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenCyclePage;

