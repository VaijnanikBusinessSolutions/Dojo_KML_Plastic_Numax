import React, { useState, useEffect, useRef } from "react";
import type {
  AssessmentMode,
  TrainingTopic,
  FormData,
  QuantityEvaluation,
} from "../../constants/types";
import OJTHeader from "../../molecules/OJTHeader/OJTHeader";
import TraineeInfoForm from "../../molecules/TraineeInfoForm/TraineeInfoForm";
import QualityAssessmentForm from "../../molecules/QualityAssessmentForm/QualityAssessmentForm";
import QuantityAssessmentForm from "../../molecules/QuantityAssessmentForm/QuantityAssessmentForm";
import SignaturesSection from "../../molecules/SignaturesSection/SignaturesSection";
import { useLocation } from "react-router-dom";
import { ojtApi } from "../../hooks/ServiceApis";
import toast from "react-hot-toast";

interface Station {
  station_id: number;
  station_name: string;
  department_id: number;
}

const OJTForm: React.FC = () => {
  const location = useLocation();
  const locationState = location.state || {};
  const employeeId = locationState.employeeId;
  const isRetraining = locationState.isRetraining ?? false;
  const attemptMode = locationState.attemptMode ?? "existing";

  // NAVIGATION STATE
  const currentEmpId = locationState.employeeId;
  const currentLevelId = locationState.levelId;
  const currentDeptId = locationState.departmentId;
  const initialStationId = locationState.stationId || null;

  // LOCAL STATE
  const [assessmentMode, setAssessmentMode] = useState<AssessmentMode>("quality");
  const [assessmentModeLoaded, setAssessmentModeLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [stations, setStations] = useState<Station[]>([]);
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<number | null>(initialStationId);

  const [qualityTopics, setQualityTopics] = useState<TrainingTopic[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const [dayIdMapping, setDayIdMapping] = useState<Record<string, number>>({});

  const [scoreRanges, setScoreRanges] = useState<{
    min_score: number;
    max_score: number;
  } | null>(null);
  const [criteria, setCriteria] = useState<number[]>([]);
  const [quantityCriteria, setQuantityCriteria] = useState<any>(null);
  const [quantityScoreRange, setQuantityScoreRange] = useState<any[] | null>(null);

  const [existingOjtId, setExistingOjtId] = useState<number | null>(null);
  const [lastFilledDayIndex, setLastFilledDayIndex] = useState<number>(-1);
  const [quantityEvaluations, setQuantityEvaluations] = useState<QuantityEvaluation[]>([]);
  const [status, setStatus] = useState<string>("Pending");

  const [record, setRecord] = useState<any | null>(null);
  const [records, setRecords] = useState<any[]>([]);

  const [attemptNumber, setAttemptNumber] = useState<number>(1);
  const [maxAttempts, setMaxAttempts] = useState<number>(2);

  // ✅ NEW: States for viewing previous data (10 Cycle style)
  const [showAttemptsDropdown, setShowAttemptsDropdown] = useState(false);
  const [previousAttempts, setPreviousAttempts] = useState<any[]>([]);
  const [isViewOnlyMode, setIsViewOnlyMode] = useState(false);
  const [viewingAttemptId, setViewingAttemptId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<FormData>({
    traineeInfo: {
      name: locationState.employeeName || "",
      id: locationState.employeeId || "",
      empNo: locationState.employeeId || "",
      stationName: locationState.stationName || "",
      stationId: initialStationId,
      lineName: locationState.lineName || "",
      processName: locationState.sublineName || "",
      revisionDate: new Date().toISOString().split("T")[0],
      doi: locationState.doj || new Date().toISOString().split("T")[0],
      trainerName: "",
      trainerLine: locationState.lineName || "",
    },
    dailyScores: {},
    signatures: { preparedBy: "", approvedBy: "", engineerJudge: "" },
  });

  // ✅ Fetch Max Attempts Helper
  const fetchMaxAttempts = async (evaluationType: string) => {
    try {
      const response = await fetch(
        `http://172.25.0.51:8000/evaluation-type/by-params/?evaluation_type=${evaluationType}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.max_attempts ?? 2;
      }
    } catch (error) {
      console.error("Error fetching max attempts:", error);
    }
    return 2;
  };

  const fetchCurrentAttemptFromBackend = async (
    empId: string,
    levelId: number,
    deptId: number,
    stationId: number
  ) => {
    try {
      const response = await fetch(
        `http://172.25.0.51:8000/retraining-sessions/current-attempt/?employee_id=${empId}&level_id=${levelId}&department_id=${deptId}&station_id=${stationId}`
      );
      if (!response.ok) return 1;
      const data = await response.json();
      console.log("📊 Current attempt from backend:", data);
      return data.attempt_number ?? 1;
    } catch (e) {
      console.error("Error fetching attempt number", e);
      return 1;
    }
  };

  // ✅ Fetch All Attempts (for previous attempts list)
  const fetchAllAttempts = async (
    empId: string,
    levelId: number,
    departmentId: number,
    stationId: number,
    currentAttemptNo: number
  ) => {
    try {
      const data = await ojtApi.getQualityTraineeInfoList(
        empId,
        stationId,
        levelId,
        departmentId
      );

      console.log("[FETCH ALL ATTEMPTS] Raw data:", data);

      if (Array.isArray(data) && data.length > 0) {
        // ✅ CRITICAL: Filter to only current employee's records
        const employeeData = data.filter((attempt: any) => attempt.emp_id === empId);

        console.log("[FETCH ALL ATTEMPTS] Employee filtered data:", employeeData);

        // Filter out current attempt and sort by attempt_no descending
        const otherAttempts = employeeData
          .filter((attempt: any) => attempt.attempt_no !== currentAttemptNo)
          .sort((a: any, b: any) => (b.attempt_no || 0) - (a.attempt_no || 0));

        console.log("[FETCH ALL ATTEMPTS] Previous attempts:", otherAttempts);

        setPreviousAttempts(otherAttempts);
      }
    } catch (error) {
      console.error("Error fetching all attempts:", error);
    }
  };

  // FETCH ASSESSMENT MODE
  const fetchAssessmentMode = async () => {
    try {
      const data = await ojtApi.getAssessmentMode();
      setAssessmentMode(data.mode);
      setAssessmentModeLoaded(true);
    } catch (error) {
      console.error("Error fetching mode:", error);
      setAssessmentModeLoaded(true);
    }
  };

  // FETCH ALL STATIONS
  const fetchStations = async () => {
    try {
      const data = await ojtApi.getStations();
      setStations(data);
    } catch (error) {
      console.error("Error fetching stations:", error);
    }
  };

  // FILTER STATIONS BY DEPARTMENT
  useEffect(() => {
    if (currentDeptId && stations.length > 0) {
      const filtered = stations.filter((s) => s.department_id === currentDeptId);
      setFilteredStations(filtered);

      if (initialStationId && !filtered.find((s) => s.station_id === initialStationId)) {
        setSelectedStationId(null);
        setFormData((prev) => ({
          ...prev,
          traineeInfo: {
            ...prev.traineeInfo,
            stationId: null,
            stationName: "",
          },
        }));
      }
    }
  }, [currentDeptId, stations, initialStationId]);

  // FETCH LEVEL DATA (topics, days, criteria)
  const fetchLevelData = async () => {
    if (!currentDeptId || !currentLevelId) return;
    try {
      const [topicsRes, daysRes, scoreRes, critRes, qtyScoreRes, qtyCritRes] =
        await Promise.all([
          ojtApi.getTopics(currentDeptId, currentLevelId),
          ojtApi.getDays(currentDeptId, currentLevelId),
          ojtApi.getScoreRanges(currentDeptId, currentLevelId),
          ojtApi.getPassingCriteria(currentDeptId, currentLevelId),
          ojtApi.getQuantityScoreRanges(currentDeptId, currentLevelId),
          ojtApi.getQuantityPassingCriteria(currentDeptId, currentLevelId),
        ]);

      setQualityTopics(
        topicsRes.map((t: any) => ({
          id: t.id || t.topic_id,
          description: t.topic || t.topic_name,
          category: t.category || "Technical Knowledge",
        }))
      );

      const mapping: Record<string, number> = {};
      const dayNames = daysRes.map((d: any) => {
        const name = d.name || `Day-${d.id}`;
        mapping[name] = d.id;
        return name;
      });
      setDays(dayNames);
      setDayIdMapping(mapping);

      if (scoreRes?.length > 0) {
        setScoreRanges({
          min_score: scoreRes[0].min_score,
          max_score: scoreRes[0].max_score,
        });
      }
      if (critRes?.length > 0) {
        const sorted = critRes.sort((a: any, b: any) => a.day - b.day);
        setCriteria(sorted.map((c: any) => c.percentage));
      }
      setQuantityScoreRange(qtyScoreRes.length > 0 ? qtyScoreRes : null);
      if (qtyCritRes.length > 0) {
        setQuantityCriteria({
          production_passing_percentage: parseFloat(qtyCritRes[0].production_passing_percentage),
          rejection_passing_percentage: parseFloat(qtyCritRes[0].rejection_passing_percentage),
        });
      }
    } catch (error) {
      console.error("Error fetching level data:", error);
    }
  };

  // INITIAL LOAD
  useEffect(() => {
    const init = async () => {
      if (!currentEmpId || !currentLevelId || !currentDeptId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      await Promise.all([fetchStations(), fetchLevelData(), fetchAssessmentMode()]);

      const maxAttemptsData = await fetchMaxAttempts("OJT");
      setMaxAttempts(maxAttemptsData);

      setIsLoading(false);
    };
    init();
  }, [currentEmpId, currentLevelId, currentDeptId]);

  // ✅ Handle Retraining Blank Sheet
  useEffect(() => {
    if (isRetraining && attemptMode === "new") {
      console.log("🆕 Starting new retraining OJT attempt → blank sheet");
      setFormData((prev) => ({
        ...prev,
        dailyScores: {},
        traineeInfo: {
          ...prev.traineeInfo,
          name: locationState.employeeName || "",
          empNo: currentEmpId,
          id: currentEmpId,
          trainerName: "",
          revisionDate: new Date().toISOString().split("T")[0],
          doi: locationState.doj || new Date().toISOString().split("T")[0],
        },
        signatures: { preparedBy: "", approvedBy: "", engineerJudge: "" },
      }));
      setExistingOjtId(null);
      setLastFilledDayIndex(-1);
      setStatus("Pending");
      toast.success("New retraining attempt started (blank sheet)");
    }
  }, [isRetraining, attemptMode]);

  
    // ✅ FETCH OJT DATA
  useEffect(() => {
    const fetchOjtData = async () => {
      if (
        !assessmentModeLoaded ||
        !currentEmpId ||
        !currentLevelId ||
        selectedStationId === null
      ) {
        setExistingOjtId(null);
        setFormData((prev) => ({ ...prev, dailyScores: {} }));
        setLastFilledDayIndex(-1);
        return;
      }

      console.log("[FETCH OJT] Params:", {
        empId: currentEmpId,
        stationId: selectedStationId,
        levelId: currentLevelId,
        departmentId: currentDeptId,
      });

      try {
        // 1. Fetch All Existing Records for this employee
        const recordsData = await ojtApi.getQualityTraineeInfoList(
          currentEmpId,
          selectedStationId,
          currentLevelId,
          currentDeptId
        );

        // Filter to ONLY current employee
        const employeeRecords = recordsData.filter(
          (r: any) => r.emp_id === currentEmpId
        );

        setRecords(employeeRecords);

        // ---------------------------------------------------------
        // 🔥 LOGIC FIX: Determine Correct Attempt Number
        // ---------------------------------------------------------
        
        // Find the record with the highest attempt number
        const latestHistoryRecord = employeeRecords.reduce((prev: any, current: any) => {
          return (prev?.attempt_no || 0) > (current?.attempt_no || 0) ? prev : current;
        }, null);

        let targetAttempt = 1;

        if (latestHistoryRecord) {
          const lastStatus = latestHistoryRecord.status || "Pending"; 
          const lastAttemptNo = Number(latestHistoryRecord.attempt_no);

          // Rule 1: If the latest record is completely finished and FAILED, go to next.
          // Rule 2: If the latest record is PENDING (incomplete), stay on it.
          // Rule 3: Max attempts is 2.
          
          if (lastStatus === "Fail") {
             targetAttempt = lastAttemptNo + 1;
          } else {
             // It is Pending (incomplete) or Passed. Resume this attempt.
             targetAttempt = lastAttemptNo;
          }
        }

        // Hard Limit: Max 2 Attempts
        if (targetAttempt > 2) {
          targetAttempt = 2; // Or handle logic if they fail 2nd attempt (e.g. view only)
        }

        console.log(`📊 Logic Decision: Latest Status [${latestHistoryRecord?.status}], Target Attempt [${targetAttempt}]`);
        setAttemptNumber(targetAttempt);

        // ---------------------------------------------------------
        // 2. Load Data based on the Target Attempt
        // ---------------------------------------------------------

        // Try to find the record for our target attempt
        const recordToLoad = employeeRecords.find(
          (r: any) => Number(r.attempt_no) === Number(targetAttempt)
        );

        // IF NO RECORD (New Attempt 2, or Fresh Attempt 1) -> BLANK SHEET
        if (!recordToLoad) {
          console.log("➡ No record found for Attempt", targetAttempt, "→ Loading Blank Sheet");
          setExistingOjtId(null);
          setFormData((prev) => ({
            ...prev,
            dailyScores: {}, 
            traineeInfo: {
              ...prev.traineeInfo,
              name: locationState.employeeName || prev.traineeInfo.name,
              empNo: currentEmpId,
              id: currentEmpId,
              doi: locationState.doj || new Date().toISOString().split("T")[0],
              trainerName: "", 
              revisionDate: new Date().toISOString().split("T")[0],
            },
            signatures: { preparedBy: "", approvedBy: "", engineerJudge: "" },
          }));
          setLastFilledDayIndex(-1);
          setStatus("Pending");
          return;
        }

        // IF RECORD EXISTS (Resume Incomplete Attempt) -> PREFILL
        console.log("➡ Resuming Attempt", targetAttempt);
        setRecord(recordToLoad);
        setExistingOjtId(recordToLoad.id);

        const prefilled: Record<number, Record<string, string>> = {};

        recordToLoad.scores_data?.forEach((s: any) => {
          const dayName =
            Object.keys(dayIdMapping).find((k) => dayIdMapping[k] === s.day) ||
            `Day-${s.day}`;
          if (!prefilled[s.topic]) prefilled[s.topic] = {};
          prefilled[s.topic][dayName] = String(s.score);
        });

        const lastIdx = Math.max(
          -1,
          ...Object.values(prefilled).flatMap((obj) =>
            days.map((d, i) => (obj[d] ? i : -1))
          )
        );
        setLastFilledDayIndex(lastIdx);

        setFormData((prev) => ({
          ...prev,
          traineeInfo: {
            ...prev.traineeInfo,
            name: recordToLoad.trainee_name || prev.traineeInfo.name,
            id: recordToLoad.trainer_id || prev.traineeInfo.id,
            empNo: recordToLoad.emp_id || prev.traineeInfo.empNo,
            stationName: recordToLoad.station_name,
            stationId: recordToLoad.station,
            lineName: recordToLoad.line || prev.traineeInfo.lineName,
            processName: recordToLoad.subline || prev.traineeInfo.processName,
            revisionDate: recordToLoad.revision_date,
            doi: recordToLoad.doj,
            trainerName: recordToLoad.trainer_name || "",
          },
          dailyScores: prefilled,
          signatures: {
            preparedBy: recordToLoad.prepared_by || "",
            approvedBy: recordToLoad.approved_by || "",
            engineerJudge: recordToLoad.engineer_judge || "",
          },
        }));
      } catch (error) {
        console.error("[FETCH OJT] Error:", error);
        toast.error("Failed to load OJT data");
        setExistingOjtId(null);
        setFormData((prev) => ({ ...prev, dailyScores: {} }));
      }
    };

    if (assessmentMode === "quality") {
      fetchOjtData();
    }
  }, [
    assessmentMode,
    assessmentModeLoaded,
    currentEmpId,
    currentLevelId,
    currentDeptId,
    selectedStationId,
    dayIdMapping,
    days,
    isRetraining, // Rerun if these change
    attemptMode 
  ]);

  // ✅ Fetch all attempts when component loads
  useEffect(() => {
    if (
      currentEmpId &&
      currentLevelId &&
      currentDeptId &&
      selectedStationId &&
      !isViewOnlyMode &&
      attemptNumber
    ) {
      fetchAllAttempts(
        currentEmpId,
        currentLevelId,
        currentDeptId,
        selectedStationId,
        attemptNumber
      );
    }
  }, [currentEmpId, currentLevelId, currentDeptId, selectedStationId, isViewOnlyMode, attemptNumber]);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAttemptsDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Handle View Previous Data Button
  const handleViewPreviousData = () => {
    setShowAttemptsDropdown(!showAttemptsDropdown);
  };

  // ✅ Handle Select Attempt (10 Cycle style)
  const handleSelectAttempt = async (attempt: any) => {
    if (!currentEmpId || !currentLevelId || !currentDeptId || !selectedStationId) return;

    console.log("Selected attempt:", attempt);

    setIsLoading(true);
    setShowAttemptsDropdown(false);
    setIsViewOnlyMode(true);
    setViewingAttemptId(attempt.id);

    try {
      // Fetch the specific attempt data
      const recordsData = await ojtApi.getQualityTraineeInfoList(
        currentEmpId,
        selectedStationId,
        currentLevelId,
        currentDeptId
      );

      // ✅ Filter to only current employee's records
      const employeeRecords = recordsData.filter(
        (rec: any) => rec.emp_id === currentEmpId
      );

      const selectedRecord = employeeRecords.find(
        (rec: any) => Number(rec.attempt_no) === Number(attempt.attempt_no)
      );

      if (selectedRecord) {
        setAttemptNumber(selectedRecord.attempt_no);
        setRecord(selectedRecord);

        // Populate form with this attempt's data
        const prefilled: Record<number, Record<string, string>> = {};

        selectedRecord.scores_data?.forEach((s: any) => {
          const dayName =
            Object.keys(dayIdMapping).find((k) => dayIdMapping[k] === s.day) ||
            `Day-${s.day}`;
          if (!prefilled[s.topic]) prefilled[s.topic] = {};
          prefilled[s.topic][dayName] = String(s.score);
        });

        const lastIdx = Math.max(
          -1,
          ...Object.values(prefilled).flatMap((obj) =>
            days.map((d, i) => (obj[d] ? i : -1))
          )
        );
        setLastFilledDayIndex(lastIdx);

        setFormData({
          traineeInfo: {
            name: selectedRecord.trainee_name || formData.traineeInfo.name,
            id: selectedRecord.trainer_id || formData.traineeInfo.id,
            empNo: selectedRecord.emp_id || formData.traineeInfo.empNo,
            stationName: selectedRecord.station_name,
            stationId: selectedRecord.station,
            lineName: selectedRecord.line || formData.traineeInfo.lineName,
            processName: selectedRecord.subline || formData.traineeInfo.processName,
            revisionDate: selectedRecord.revision_date,
            doi: selectedRecord.doj,
            trainerName: selectedRecord.trainer_name || "",
            trainerLine: selectedRecord.line || formData.traineeInfo.trainerLine,
          },
          dailyScores: prefilled,
          signatures: {
            preparedBy: selectedRecord.prepared_by || "",
            approvedBy: selectedRecord.approved_by || "",
            engineerJudge: selectedRecord.engineer_judge || "",
          },
        });
      }
    } catch (error) {
      console.error("Error loading attempt:", error);
      toast.error("Failed to load attempt data");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Handle Back to Current Attempt
  const handleBackToCurrentAttempt = async () => {
    setIsLoading(true);
    setIsViewOnlyMode(false);
    setViewingAttemptId(null);

    try {
      // 🔥 1. ALWAYS get attempt from backend (truth)
      const backendAttempt = await fetchCurrentAttemptFromBackend(
        currentEmpId,
        currentLevelId,
        currentDeptId,
        selectedStationId
      );

      setAttemptNumber(backendAttempt);

      // 🔥 2. Load all saved attempts
      const recordsData = await ojtApi.getQualityTraineeInfoList(
        currentEmpId,
        selectedStationId,
        currentLevelId,
        currentDeptId
      );

      // ✅ Filter to only current employee's records
      const employeeRecords = recordsData.filter(
        (rec: any) => rec.emp_id === currentEmpId
      );

      const currentRecord = employeeRecords.find(
        (rec) => Number(rec.attempt_no) === Number(backendAttempt)
      );

      if (currentRecord) {
        // load saved data
        setRecord(currentRecord);

        const prefilled: Record<number, Record<string, string>> = {};

        currentRecord.scores_data?.forEach((s: any) => {
          const dayName =
            Object.keys(dayIdMapping).find((k) => dayIdMapping[k] === s.day) ||
            `Day-${s.day}`;
          if (!prefilled[s.topic]) prefilled[s.topic] = {};
          prefilled[s.topic][dayName] = String(s.score);
        });

        const lastIdx = Math.max(
          -1,
          ...Object.values(prefilled).flatMap((obj) =>
            days.map((d, i) => (obj[d] ? i : -1))
          )
        );
        setLastFilledDayIndex(lastIdx);

        setFormData((prev) => ({
          ...prev,
          traineeInfo: {
            ...prev.traineeInfo,
            name: currentRecord.trainee_name || prev.traineeInfo.name,
            id: currentRecord.trainer_id || prev.traineeInfo.id,
            empNo: currentRecord.emp_id || prev.traineeInfo.empNo,
            stationName: currentRecord.station_name,
            stationId: currentRecord.station,
            lineName: currentRecord.line || prev.traineeInfo.lineName,
            processName: currentRecord.subline || prev.traineeInfo.processName,
            revisionDate: currentRecord.revision_date,
            doi: currentRecord.doj,
            trainerName: currentRecord.trainer_name || "",
          },
          dailyScores: prefilled,
          signatures: {
            preparedBy: currentRecord.prepared_by || "",
            approvedBy: currentRecord.approved_by || "",
            engineerJudge: currentRecord.engineer_judge || "",
          },
        }));
      } else {
        // 🔥 Attempt exists logically but NOT saved → show blank sheet
        setRecord(null);
        setFormData((prev) => ({
          ...prev,
          dailyScores: {},
          traineeInfo: {
            ...prev.traineeInfo,
            name: locationState.employeeName || "",
            empNo: currentEmpId,
            id: currentEmpId,
            trainerName: "",
            revisionDate: new Date().toISOString().split("T")[0],
            doi: locationState.doj || new Date().toISOString().split("T")[0],
          },
          signatures: { preparedBy: "", approvedBy: "", engineerJudge: "" },
        }));
        setLastFilledDayIndex(-1);
      }

      await fetchAllAttempts(
        currentEmpId,
        currentLevelId,
        currentDeptId,
        selectedStationId,
        backendAttempt
      );
    } finally {
      setIsLoading(false);
    }
  };

  // HANDLE INPUT CHANGE
  const handleInputChange = (section: string, field: string, value: any) => {
    if (isViewOnlyMode) {
      toast.error("Cannot edit while viewing previous attempt");
      return;
    }

    if (section === "traineeInfo" && field === "stationId") {
      const station = filteredStations.find((s) => s.station_id === value);
      setSelectedStationId(value);
      setFormData((prev) => ({
        ...prev,
        traineeInfo: {
          ...prev.traineeInfo,
          stationId: value,
          stationName: station?.station_name || "",
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [section]: { ...prev[section as keyof FormData], [field]: value },
      }));
    }
  };

  const handleScoreChange = (
    topicId: number | string,
    day: string,
    value: string
  ) => {
    if (isViewOnlyMode) {
      toast.error("Cannot edit scores while viewing previous attempt");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      dailyScores: {
        ...prev.dailyScores,
        [topicId]: { ...prev.dailyScores[topicId], [day]: value },
      },
    }));
  };

  const preparePayload = () => {
    if (assessmentMode === "quality") {
      const scoresArray = Object.entries(formData.dailyScores).flatMap(
        ([topicId, dayScores]) =>
          Object.entries(dayScores)
            .map(([dayName, score]) => {
              const dayId = dayIdMapping[dayName];
              return dayId
                ? { topic: Number(topicId), day: dayId, score: Number(score) }
                : null;
            })
            .filter(Boolean)
      );

      return {
        trainee_name: formData.traineeInfo.name,
        trainer_id: formData.traineeInfo.id,
        emp_id: formData.traineeInfo.empNo,
        line: formData.traineeInfo.lineName,
        subline: formData.traineeInfo.processName,
        station: formData.traineeInfo.stationId,
        process_name: formData.traineeInfo.processName,
        revision_date: formData.traineeInfo.revisionDate,
        doj: formData.traineeInfo.doi,
        trainer_name: formData.traineeInfo.trainerName,
        level: currentLevelId,
        department: currentDeptId,
        prepared_by: formData.signatures.preparedBy,
        approved_by: formData.signatures.approvedBy,
        scores: scoresArray,
      };
    }
    return {};
  };

  const handleSubmit = async () => {
    if (isViewOnlyMode) {
      toast.error("❌ Cannot save while viewing previous attempt. Return to current attempt first.");
      return;
    }

    if (!formData.traineeInfo.stationId) {
      toast.error("Please select a station");
      return;
    }

    try {
      const payload = preparePayload();
      const result = await ojtApi.postOJTData(payload);
      toast.success("✅ Saved successfully!");
      setExistingOjtId(result.id);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Save failed");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur shadow-2xl rounded-3xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 p-5 rounded-xl border-2 border-indigo-200 mb-6 shadow-sm">
          {/* 🔹 Compact Top Bar with Back Button (10 Cycle Style) */}
          <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm rounded-t-2xl">
            {/* Left Section */}
            <div className="flex items-center gap-3">
              {/* Back Button (visible only in view mode) */}
              {isViewOnlyMode && (
                <button
                  onClick={handleBackToCurrentAttempt}
                  className="flex items-center gap-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg shadow-sm transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to Current
                </button>
              )}

              {/* Attempt Number */}
              <div className="bg-indigo-100 text-indigo-800 font-semibold px-4 py-1.5 rounded-full text-sm shadow-sm">
                Attempt {attemptNumber}
              </div>
            </div>

            {/* Right: View Previous Data Button */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={handleViewPreviousData}
                disabled={isViewOnlyMode || previousAttempts.length === 0}
                className={`flex items-center gap-2 font-medium px-4 py-2 rounded-lg shadow-sm transition-all duration-200 ${
                  isViewOnlyMode || previousAttempts.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                View Previous Data
                <svg
                  className={`w-4 h-4 transition-transform ${
                    showAttemptsDropdown ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown for Previous Attempts */}
              {showAttemptsDropdown && previousAttempts.length > 0 && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-blue-600 px-4 py-3">
                    <h3 className="text-white font-bold text-sm">
                      Previous OJT Attempts
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {previousAttempts.map((attempt) => (
                      <button
                        key={attempt.id}
                        onClick={() => handleSelectAttempt(attempt)}
                        className="w-full px-4 py-3 hover:bg-blue-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {attempt.attempt_no}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">
                                Attempt {attempt.attempt_no}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              attempt.status === "Pass"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : attempt.status === "Fail"
                                ? "bg-red-100 text-red-800 border border-red-200"
                                : "bg-gray-100 text-gray-800 border border-gray-200"
                            }`}
                          >
                            {attempt.status}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ✅ Header without attempt number */}
        <OJTHeader />

        <div className="p-8">
          {/* ✅ Form becomes read-only (dimmed) when viewing previous */}
          <div className={isViewOnlyMode ? "pointer-events-none opacity-60" : ""}>
            <TraineeInfoForm
              formData={formData}
              handleInputChange={handleInputChange}
              stations={filteredStations}
              selectedStationId={selectedStationId}
            />

            {assessmentMode === "quality" ? (
              <QualityAssessmentForm
                currentTopics={qualityTopics}
                days={days}
                formData={formData}
                handleScoreChange={handleScoreChange}
                scoreRanges={scoreRanges}
                lastFilledDayIndex={lastFilledDayIndex}
              />
            ) : (
              <QuantityAssessmentForm
                formData={formData}
                scoreRange={quantityScoreRange}
                handleInputChange={handleInputChange}
                quantityEvaluations={quantityEvaluations}
                handleQuantityEvaluationChange={() => {}}
                addEvaluationDay={() => {}}
                removeEvaluationDay={() => {}}
              />
            )}

            <SignaturesSection
              formData={formData}
              handleInputChange={handleInputChange}
              handleSave={handleSubmit}
              handleDownloadPDF={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OJTForm;