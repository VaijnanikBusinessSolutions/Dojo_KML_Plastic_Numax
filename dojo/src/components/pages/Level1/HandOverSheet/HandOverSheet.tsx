


// import React, { useState, useMemo, useEffect } from "react";

// // --- 1. UPDATED INTERFACES ---
// interface Station { id: number; station_name: string; }
// interface Line { id: number; line_name: string; stations: Station[]; }
// interface Department { id: number; department_name: string; lines: Line[]; stations: Station[]; }
// interface HierarchyStructure { structure_id: number; structure_name: string; structure_data: { departments: Department[] }; }
// interface ApiScoreData { id: number; employee_details: string; skill_name: string; marks: number; percentage: number; created_at: string; }

// // This interface matches the response from your new, safe `/mastertable-handover-details/{emp_id}/` endpoint
// interface EmployeeMasterData {
//   emp_id: string;
//   first_name: string;
//   last_name: string;
//   department: { department_id: number, department_name: string } | null;
//   current_line: { line_id: number, line_name: string } | null;
//   current_station: { station_id: number, station_name: string } | null;
// }

// // This interface holds the data for the form, including the new display-only fields
// interface HandoverFormData {
//   name: string;
//   currentDepartment: string;
//   currentLine: string; // NEW display field
//   currentStation: string; // NEW display field
//   industrialExperience: string;
//   kpaplExperience: string;
//   distributedDepartment: string;
//   selectedLineId: string;
//   selectedStationId: string;
//   handoverDate: string;
//   contractorName: string;
//   pAndAName: string;
//   qaHodName: string;
//   isTrainingCompleted: "yes" | "no" | "";
//   gojoInchargeName: string;
// }

// interface HandOverFormModalProps {
//   hierarchy: HierarchyStructure[];
//   onClose: () => void;
//   onSubmit: (formData: HandoverFormData) => void;
//   employeeDetails: EmployeeMasterData | null;
//   isLoading: boolean;
//   error: string | null;
//   initialFormData: HandoverFormData | null;
//   isEditing: boolean;
// }

// // --- Modal Component ---
// const HandOverFormModal: React.FC<HandOverFormModalProps> = ({ hierarchy, onClose, onSubmit, employeeDetails, isLoading, error, initialFormData, isEditing }) => {
//     const [formData, setFormData] = useState<HandoverFormData>( initialFormData || { name: "", currentDepartment: "", currentLine: "", currentStation: "", industrialExperience: "", kpaplExperience: "", distributedDepartment: "", selectedLineId: "", selectedStationId: "", handoverDate: new Date().toISOString().split("T")[0], contractorName: "", pAndAName: "", qaHodName: "", isTrainingCompleted: "", gojoInchargeName: "" });
//     const [lineOptions, setLineOptions] = useState<Line[]>([]);
//     const [stationOptions, setStationOptions] = useState<Station[]>([]);
//     useEffect(() => { if (initialFormData) { setFormData(initialFormData); } }, [initialFormData]);
//     useEffect(() => { if (formData.distributedDepartment) { let selectedDept: Department | undefined; for (const structure of hierarchy) { selectedDept = structure.structure_data.departments.find(d => d.department_name === formData.distributedDepartment); if (selectedDept) break; } if (selectedDept) { setLineOptions(selectedDept.lines); setStationOptions(selectedDept.stations); } else { setLineOptions([]); setStationOptions([]); } if (initialFormData?.distributedDepartment !== formData.distributedDepartment) { setFormData(prev => ({ ...prev, selectedLineId: "", selectedStationId: "" })); } } }, [formData.distributedDepartment, hierarchy, initialFormData]);
//     useEffect(() => { if (formData.selectedLineId) { const selectedLine = lineOptions.find(l => String(l.id) === formData.selectedLineId); if (selectedLine && selectedLine.stations.length > 0) { setStationOptions(selectedLine.stations); } if (initialFormData?.selectedLineId !== formData.selectedLineId) { setFormData(prev => ({ ...prev, selectedStationId: "" })); } } }, [formData.selectedLineId, lineOptions, initialFormData]);
//     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { const { name, value } = e.target; setFormData((prevData) => ({ ...prevData, [name]: value })); };
//     const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(formData); };
    
//     const modalStyles: { [key: string]: React.CSSProperties } = {
//         backdrop: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(17, 24, 39, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
//         content: { backgroundColor: "white", padding: "30px 40px", borderRadius: "20px", width: "100%", maxWidth: "1500px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", position: "relative", display: "flex", flexDirection: "column" },
//         closeButton: { position: "absolute", top: "15px", right: "20px", background: "transparent", border: "none", fontSize: "28px", cursor: "pointer", color: "#9ca3af" },
//         header: { textAlign: "center", marginBottom: "30px", borderBottom: "1px solid #e5e7eb", paddingBottom: "20px" },
//         title: { fontSize: "22px", fontWeight: "700", color: "#1f2937" },
//         formGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" },
//         formField: { display: "flex", flexDirection: "column" as const },
//         label: { marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#374151" },
//         input: { padding: "10px 12px", fontSize: "14px", border: "1px solid #d1d5db", borderRadius: "8px", outline: "none", transition: "all 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" },
//         readOnlyInput: { backgroundColor: "#f3f4f6", cursor: "not-allowed", color: "#4b5563" },
//         submitButton: { gridColumn: "1 / -1", marginTop: "20px", padding: "12px 20px", fontSize: "16px", fontWeight: "600", color: "#ffffff", background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)", border: "none", borderRadius: "10px", cursor: "pointer", transition: "all 0.2s ease", boxShadow: "0 4px 10px rgba(124, 58, 237, 0.2)" },
//         updateButton: { background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", boxShadow: "0 4px 10px rgba(16, 185, 129, 0.2)" },
//         centeredStatus: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", color: "#6b7280" }
//     };

//     return (
//         <div style={modalStyles.backdrop} onClick={onClose}>
//             <div style={modalStyles.content} onClick={(e) => e.stopPropagation()}>
//                 <button style={modalStyles.closeButton} onClick={onClose}>&times;</button>
//                 <div style={modalStyles.header}> <h2 style={modalStyles.title}>{isEditing ? "Edit Dojo Handover" : "Dojo Handover Form"}</h2> </div>
//                 {isLoading && <div style={modalStyles.centeredStatus}>Loading Details...</div>}
//                 {error && <div style={{ ...modalStyles.centeredStatus, color: "red" }}>{error}</div>}
//                 {!isLoading && !error && employeeDetails && (
//                     <form onSubmit={handleSubmit}>
//                         <div style={modalStyles.formGrid}>
//                             <div style={{ ...modalStyles.formField, gridColumn: 'span 2' }}>
//                                 <label style={modalStyles.label}>Name</label>
//                                 <input type="text" style={{ ...modalStyles.input, ...modalStyles.readOnlyInput }} value={formData.name} readOnly />
//                             </div>
//                             <div style={modalStyles.formField}>
//                                 <label style={modalStyles.label}>Current Department</label>
//                                 <input type="text" style={{ ...modalStyles.input, ...modalStyles.readOnlyInput }} value={formData.currentDepartment} readOnly />
//                             </div>
//                             <div style={modalStyles.formField}>
//                                 <label style={modalStyles.label}>Current Line</label>
//                                 <input type="text" style={{ ...modalStyles.input, ...modalStyles.readOnlyInput }} value={formData.currentLine} readOnly />
//                             </div>
//                             <div style={modalStyles.formField}>
//                                 <label style={modalStyles.label}>Current Station</label>
//                                 <input type="text" style={{ ...modalStyles.input, ...modalStyles.readOnlyInput }} value={formData.currentStation} readOnly />
//                             </div>
//                             <div style={{ gridColumn: '1 / -1', height: '1px', backgroundColor: '#e5e7eb', margin: '5px 0' }}></div>
//                             <div style={modalStyles.formField}><label style={modalStyles.label}>Industrial Experience</label><input type="text" name="industrialExperience" value={formData.industrialExperience} onChange={handleChange} style={modalStyles.input} required /></div>
//                             <div style={modalStyles.formField}><label style={modalStyles.label}>KPAPL Experience</label><input type="text" name="kpaplExperience" value={formData.kpaplExperience} onChange={handleChange} style={modalStyles.input} required /></div>
//                             <div style={modalStyles.formField}><label style={modalStyles.label}>Distributed Department</label><select name="distributedDepartment" value={formData.distributedDepartment} onChange={handleChange} style={modalStyles.input as React.CSSProperties} required><option value="" disabled>Select department</option>{hierarchy.flatMap(s => s.structure_data.departments).map((dept) => (<option key={dept.id} value={dept.department_name}>{dept.department_name}</option>))}</select></div>
//                             <div style={modalStyles.formField}><label style={modalStyles.label}>Line (Optional)</label><select name="selectedLineId" value={formData.selectedLineId} onChange={handleChange} style={modalStyles.input as React.CSSProperties} disabled={!formData.distributedDepartment}><option value="">-- None --</option>{lineOptions.map((line) => (<option key={line.id} value={line.id}>{line.line_name}</option>))}</select></div>
//                             <div style={modalStyles.formField}><label style={modalStyles.label}>Station (Optional)</label><select name="selectedStationId" value={formData.selectedStationId} onChange={handleChange} style={modalStyles.input as React.CSSProperties} disabled={stationOptions.length === 0}><option value="">-- None --</option>{stationOptions.map((station) => (<option key={station.id} value={station.id}>{station.station_name}</option>))}</select></div>
//                             <div style={modalStyles.formField}><label style={modalStyles.label}>Date</label><input type="date" name="handoverDate" style={modalStyles.input} value={formData.handoverDate} onChange={handleChange} required /></div>
//                             <div style={modalStyles.formField}><label style={modalStyles.label}>Contractor Name</label><input type="text" name="contractorName" style={modalStyles.input} value={formData.contractorName} onChange={handleChange} required /></div>
//                             <div style={modalStyles.formField}><label style={modalStyles.label}>P & A Name</label><input type="text" name="pAndAName" style={modalStyles.input} value={formData.pAndAName} onChange={handleChange} required /></div>
//                             <div style={modalStyles.formField}><label style={modalStyles.label}>QA HOD Name</label><input type="text" name="qaHodName" style={modalStyles.input} value={formData.qaHodName} onChange={handleChange} required /></div>
//                             <div style={modalStyles.formField}><label style={modalStyles.label}>Training Completed?</label><select name="isTrainingCompleted" value={formData.isTrainingCompleted} style={modalStyles.input as React.CSSProperties} onChange={handleChange} required><option value="" disabled>Select</option><option value="yes">Yes</option><option value="no">No</option></select></div>
//                             <div style={modalStyles.formField}><label style={modalStyles.label}>Dojo Incharge</label><input type="text" name="gojoInchargeName" style={modalStyles.input} value={formData.gojoInchargeName} onChange={handleChange} required /></div>
//                         </div>
//                         <button type="submit" style={{ ...modalStyles.submitButton, ...(isEditing ? modalStyles.updateButton : {}) }}>{isEditing ? "Update Handover" : "Submit Handover"}</button>
//                     </form>
//                 )}
//             </div>
//         </div>
//     );
// };

// // --- Main Page Component ---
// const HandOverSheet: React.FC = () => {
//     const [scores, setScores] = useState<ApiScoreData[]>([]);
//     const [loading, setLoading] = useState<boolean>(true);
//     const [error, setError] = useState<string | null>(null);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [selectedMonth, setSelectedMonth] = useState("");
//     const [hoveredCard, setHoveredCard] = useState<number | null>(null);
//     const [employeesWithHandover, setEmployeesWithHandover] = useState<Set<string>>(new Set());
//     const [hierarchy, setHierarchy] = useState<HierarchyStructure[]>([]);

//     const [employeeDetailsMap, setEmployeeDetailsMap] = useState<{ [key: string]: EmployeeMasterData }>({});
//     const [refreshKey, setRefreshKey] = useState(0);

//     const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//     const [selectedScore, setSelectedScore] = useState<ApiScoreData | null>(null);
//     const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
//     const [modalError, setModalError] = useState<string | null>(null);
//     const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState<EmployeeMasterData | null>(null);
//     const [initialFormData, setInitialFormData] = useState<HandoverFormData | null>(null);
//     const [isEditingMode, setIsEditingMode] = useState<boolean>(false);

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 setLoading(true);
//                 const [scoresResponse, handoversResponse, hierarchyResponse] = await Promise.all([
//                     fetch("http://127.0.0.1:8000/scores/passed/level-1/"),
//                     fetch("http://127.0.0.1:8000/handovers/"),
//                     fetch("http://127.0.0.1:8000/hierarchy-simple/"),
//                 ]);

//                 if (!scoresResponse.ok) throw new Error("Scores API failed");
//                 if (!handoversResponse.ok) throw new Error("Handovers API failed");
//                 if (!hierarchyResponse.ok) throw new Error("Hierarchy API failed");

//                 const scoresData: ApiScoreData[] = await scoresResponse.json();
//                 const handoversData: { employee: string }[] = await handoversResponse.json();
//                 const hierarchyData: HierarchyStructure[] = await hierarchyResponse.json();

//                 setScores(scoresData);
//                 setHierarchy(hierarchyData);
//                 setEmployeesWithHandover(new Set(handoversData.map((h) => h.employee)));
//                 setError(null);
//             } catch (err) {
//                 if (err instanceof Error) setError(`Failed to fetch data: ${err.message}`);
//                 else setError("An unknown error occurred.");
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchData();
//     }, [refreshKey]);

//     useEffect(() => {
//         if (scores.length === 0) return;
//         const fetchEmployeeDetails = async () => {
//             const empIds = scores.map(score => score.employee_details.split("(").pop()?.replace(")", "")).filter(Boolean) as string[];
//             const promises = empIds.map(id => fetch(`http://127.0.0.1:8000/mastertable-handover-details/${id}/`).then(res => res.ok ? res.json() : null));
//             try {
//                 const results = await Promise.all(promises);
//                 const detailsMap: { [key: string]: EmployeeMasterData } = {};
//                 results.forEach(detail => { if (detail && detail.emp_id) { detailsMap[detail.emp_id] = detail; } });
//                 setEmployeeDetailsMap(detailsMap);
//             } catch (error) { console.error("Failed to fetch some employee details:", error); }
//         };
//         fetchEmployeeDetails();
//     }, [scores]);

//     const uniqueMonths = useMemo(() => { const m = new Set<string>(); scores.forEach(s => m.add(s.created_at.substring(0, 7))); return Array.from(m).sort().reverse(); }, [scores]);
//     useEffect(() => { if (uniqueMonths.length > 0 && !selectedMonth) { setSelectedMonth(uniqueMonths[0]); } }, [uniqueMonths, selectedMonth]);
//     const filteredEmployees = useMemo(() => { let e = [...scores]; if (selectedMonth && selectedMonth !== "all") { e = e.filter(emp => emp.created_at.startsWith(selectedMonth)); } if (searchTerm.trim() !== "") { const l = searchTerm.toLowerCase(); e = e.filter(emp => emp.employee_details.toLowerCase().includes(l)); } return e.sort((a, b) => b.percentage - a.percentage); }, [scores, selectedMonth, searchTerm]);

//     const handleOpenModal = async (score: ApiScoreData) => {
//         const empId = score?.employee_details?.split('(')?.pop()?.replace(')', '') || null;
//         if (!empId) { alert("Error: Could not find a valid Employee ID."); return; }

//         setIsModalOpen(true);
//         setSelectedScore(score);
//         setIsModalLoading(true);
//         setModalError(null);
//         setSelectedEmployeeDetails(null);
//         setInitialFormData(null);

//         try {
//             const response = await fetch(`http://127.0.0.1:8000/mastertable-handover-details/${empId}/`);
//             if (!response.ok) throw new Error("Failed to fetch employee details for handover");
//             const data: EmployeeMasterData = await response.json();
//             setSelectedEmployeeDetails(data);

//             const handResp = await fetch(`http://127.0.0.1:8000/handovers/${empId}/`);
//             const baseFormData = { name: `${data.first_name} ${data.last_name}`, currentDepartment: data.department?.department_name || "N/A", currentLine: data.current_line?.line_name || "N/A", currentStation: data.current_station?.station_name || "N/A", handoverDate: new Date().toISOString().split("T")[0], industrialExperience: "", kpaplExperience: "", contractorName: "", pAndAName: "", qaHodName: "", isTrainingCompleted: "" as const, gojoInchargeName: "" };

//             if (handResp.ok) {
//                 setIsEditingMode(true);
//                 const handData = await handResp.json();
//                 const deptId = handData.distributed_department_after_dojo;
//                 let deptName = "";
//                 if (deptId) { for (const s of hierarchy) { const d = s.structure_data.departments.find(d => d.id === deptId); if (d) { deptName = d.department_name; break; } } }
//                 setInitialFormData({ ...baseFormData, industrialExperience: handData.industrial_experience || "", kpaplExperience: handData.kpapl_experience || "", distributedDepartment: deptName, selectedLineId: handData.allocated_line || "", selectedStationId: handData.allocated_station || "", handoverDate: handData.handover_date || baseFormData.handoverDate, contractorName: handData.contractor_name || "", pAndAName: handData.p_and_a_name || "", qaHodName: handData.qa_hod_name || "", isTrainingCompleted: handData.is_training_completed ? "yes" : "no", gojoInchargeName: handData.gojo_incharge_name || "" });
//             } else {
//                 setIsEditingMode(false);
//                 setInitialFormData({ ...baseFormData, distributedDepartment: "", selectedLineId: "", selectedStationId: "" });
//             }
//         } catch (err) {
//             if (err instanceof Error) setModalError(err.message); else setModalError("An unknown error occurred.");
//         } finally {
//             setIsModalLoading(false);
//         }
//     };
    
//     const handleCloseModal = () => { setIsModalOpen(false); setSelectedScore(null); setSelectedEmployeeDetails(null); setModalError(null); setInitialFormData(null); setIsEditingMode(false); };

//     const handleFormSubmit = async (formData: HandoverFormData) => {
//         if (!selectedEmployeeDetails) { alert("Error: Employee details not loaded."); return; }
//         const payload = { emp_id: selectedEmployeeDetails.emp_id, industrial_experience: formData.industrialExperience, kpapl_experience: formData.kpaplExperience, required_department_at_handover: formData.currentDepartment, distributed_department_name: formData.distributedDepartment, line_id: formData.selectedLineId || null, station_id: formData.selectedStationId || null, handover_date: formData.handoverDate, contractor_name: formData.contractorName, p_and_a_name: formData.pAndAName, qa_hod_name: formData.qaHodName, is_training_completed: formData.isTrainingCompleted === 'yes', gojo_incharge_name: formData.gojoInchargeName };
//         const method = isEditingMode ? "PUT" : "POST";
//         const url = isEditingMode ? `http://127.0.0.1:8000/handovers/${selectedEmployeeDetails.emp_id}/` : "http://127.0.0.1:8000/handovers/";
//         try {
//             const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
//             if (!response.ok) { const errorData = await response.json(); const errorMessage = Object.values(errorData).flat().join(" ") || `Server error`; throw new Error(errorMessage); }
//             alert(`Handover form ${isEditingMode ? 'updated' : 'submitted'} successfully!`);
//             handleCloseModal();
//             setRefreshKey(prevKey => prevKey + 1);
//         } catch (error) { if (error instanceof Error) alert(`Error: ${error.message}`); else alert("An unknown error occurred."); }
//     };

//     const formatDate = (dateString: string): string => new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
//     const formatMonthForDisplay = (monthStr: string): string => { const [year, month] = monthStr.split("-"); return new Date(Number(year), Number(month) - 1).toLocaleString("en-US", { month: "long", year: "numeric" }); };
//     const getScoreBarWidth = (percentage: number): string => `${percentage}%`;
//     const styles: { [key: string]: React.CSSProperties } = { container: { minHeight: "100vh", backgroundColor: "#ffffffff", padding: "40px 20px" }, header: { textAlign: "center" as const, marginBottom: "50px" }, title: { fontSize: "32px", fontWeight: "800", background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "10px" }, subtitle: { fontSize: "18px", color: "#6b7280", fontWeight: "400" }, controlsContainer: { maxWidth: "1000px", margin: "0 auto 40px", display: "flex", gap: "20px", justifyContent: "space-between" }, searchInput: { flex: 1, padding: "12px 16px", fontSize: "16px", border: "1px solid #e5e7eb", borderRadius: "12px", outline: "none", transition: "all 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }, monthSelect: { padding: "12px 16px", fontSize: "16px", border: "1px solid #e5e7eb", borderRadius: "12px", backgroundColor: "white", cursor: "pointer", outline: "none", transition: "all 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }, resultsContainer: { maxWidth: "1000px", margin: "0 auto" }, noResults: { textAlign: "center", padding: "50px", backgroundColor: "#ffffff", borderRadius: "16px", color: "#6b7280", fontSize: "18px", boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)" }, resultCard: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "30px", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)", border: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: "25px", transition: "all 0.3s ease" }, resultCardHover: { boxShadow: "0 10px 25px rgba(124, 58, 237, 0.1)", borderColor: "#e0e7ff", transform: "translateY(-2px)" }, rankCircle: { width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "700", flexShrink: 0, boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)" }, mainInfo: { flex: 1 }, name: { fontSize: "20px", fontWeight: "700", color: "#1f2937", marginBottom: "8px" }, details: { display: "flex", gap: "15px", color: "#6b7280", fontSize: "14px", marginBottom: "15px", flexWrap: "wrap" as const, alignItems: "center" }, scoreSection: { marginTop: "15px" }, scoreBar: { width: "100%", height: "10px", backgroundColor: "#f3f4f6", borderRadius: "10px", overflow: "hidden", marginBottom: "8px" }, scoreProgress: { height: "100%", background: "linear-gradient(90deg, #7c3aed 0%, #2563eb 100%)", borderRadius: "10px", transition: "width 1s ease", boxShadow: "0 2px 4px rgba(124, 58, 237, 0.2)" }, scoreText: { display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#6b7280" }, badge: { display: "inline-block", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", backgroundColor: "#f3f4f6", color: "#4b5563", border: "1px solid #e5e7eb" }, statusPill: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", backgroundColor: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" }, detailsButton: { padding: "10px 20px", fontSize: "14px", fontWeight: "600", color: "#ffffff", background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)", border: "none", borderRadius: "10px", cursor: "pointer", transition: "all 0.2s ease", boxShadow: "0 4px 10px rgba(124, 58, 237, 0.2)" }, editButton: { background: "#6b7280", boxShadow: "0 4px 10px rgba(107, 114, 128, 0.2)" }, handoverSubmittedBadge: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", backgroundColor: "#dbeafe", color: "#1e40af", border: "1px solid #bfdbfe" } };
    
//     if (loading) return <div style={{ ...styles.container, textAlign: "center", fontSize: "20px" }}>Loading...</div>;
//     if (error) return <div style={{ ...styles.container, textAlign: "center", fontSize: "20px", color: "red" }}>Error: {error}</div>;

//     return (
//         <div style={styles.container}>
//             <div style={styles.header}><h1 style={styles.title}>Level 1 Passed Users</h1><p style={styles.subtitle}>Employee Assessment Outcomes</p></div>
//             <div style={styles.controlsContainer}><input type="text" placeholder="Search by Employee ID or Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} /><select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={styles.monthSelect}><option value="all">All Months</option>{uniqueMonths.map((month) => (<option key={month} value={month}>{formatMonthForDisplay(month)}</option>))}</select></div>
//             <div style={styles.resultsContainer}>
//                 {filteredEmployees.length > 0 ? (
//                     filteredEmployees.map((score, index) => {
//                         const empId = score.employee_details.split("(").pop()?.replace(")", "") || null;
//                         const hasHandover = empId ? employeesWithHandover.has(empId) : false;
//                         const details = empId ? employeeDetailsMap[empId] : null;
//                         return (
//                             <div key={score.id} style={{ ...styles.resultCard, ...(hoveredCard === score.id ? styles.resultCardHover : {}) }} onMouseEnter={() => setHoveredCard(score.id)} onMouseLeave={() => setHoveredCard(null)}>
//                                 <div style={styles.rankCircle}>{index + 1}</div>
//                                 <div style={styles.mainInfo}>
//                                     <h3 style={styles.name}>{score.employee_details}</h3>
//                                     <div style={styles.details}>
//                                         <span style={styles.badge}>Dept: {details?.department?.department_name || '...'}</span>
//                                         <span>•</span>
//                                         <span style={styles.badge}>Line: {details?.current_line?.line_name || 'N/A'}</span>
//                                         <span>•</span>
//                                         <span style={styles.badge}>Station: {details?.current_station?.station_name || 'N/A'}</span>
//                                     </div>
//                                     <div style={styles.details}><span style={styles.badge}>{score.skill_name}</span><span>•</span><span>{formatDate(score.created_at)}</span><span>•</span><span style={styles.statusPill}><span>✓</span><span>Passed</span></span>{hasHandover && (<><span>•</span><span style={styles.handoverSubmittedBadge}><span>✓</span><span>Handover Submitted</span></span></>)}</div>
//                                     <div style={styles.scoreSection}><div style={styles.scoreBar}><div style={{ ...styles.scoreProgress, width: getScoreBarWidth(score.percentage) }} /></div><div style={styles.scoreText}><span style={{ fontWeight: "600", color: "#4b5563" }}>Score: {score.percentage.toFixed(1)}%</span><span>Minimum Required: 80%</span></div></div>
//                                 </div>
//                                 <button style={{ ...styles.detailsButton, ...(hasHandover ? styles.editButton : {}) }} onClick={() => handleOpenModal(score)}>{hasHandover ? "Edit Handover" : "Create Handover"}</button>
//                             </div>
//                         );
//                     })
//                 ) : (
//                     <div style={styles.noResults}><p>No employees found matching your criteria.</p></div>
//                 )}
//             </div>
//             {isModalOpen && selectedScore && ( <HandOverFormModal scoreData={selectedScore} hierarchy={hierarchy} onClose={handleCloseModal} onSubmit={handleFormSubmit} isLoading={isModalLoading} error={modalError} employeeDetails={selectedEmployeeDetails} initialFormData={initialFormData} isEditing={isEditingMode} /> )}
//         </div>
//     );
// };

// export default HandOverSheet;



// import React, { useState, useMemo, useEffect } from "react";

// // --- 1. INTERFACES ---
// interface Station { id: number; station_name: string; }
// interface Line { id: number; line_name: string; stations: Station[]; }
// interface Department { id: number; department_name: string; lines: Line[]; stations: Station[]; }
// interface HierarchyStructure { structure_id: number; structure_name: string; structure_data: { departments: Department[] }; }
// interface ApiScoreData { id: number; employee_details: string; skill_name: string; marks: number; percentage: number; created_at: string; }

// interface EmployeeMasterData {
//   emp_id: string;
//   first_name: string;
//   last_name: string;
//   department: { department_id: number, department_name: string } | null;
//   current_line: { line_id: number, line_name: string } | null;
//   current_station: { station_id: number, station_name: string } | null;
// }

// interface HandoverFormData {
//   name: string;
//   currentDepartment: string;
//   currentLine: string;
//   currentStation: string;
//   industrialExperience: string;
//   kpaplExperience: string;
//   distributedDepartment: string;
//   selectedLineId: string;
//   selectedStationId: string;
//   handoverDate: string;
//   contractorName: string;
//   pAndAName: string;
//   qaHodName: string;
//   isTrainingCompleted: "yes" | "no" | "";
//   gojoInchargeName: string;
// }

// interface HandOverFormModalProps {
//   scoreData?: ApiScoreData;
//   hierarchy: HierarchyStructure[];
//   onClose: () => void;
//   onSubmit: (formData: HandoverFormData) => void;
//   employeeDetails: EmployeeMasterData | null;
//   isLoading: boolean;
//   error: string | null;
//   initialFormData: HandoverFormData | null;
//   isEditing: boolean;
// }

// // --- 2. MODAL COMPONENT ---
// const HandOverFormModal: React.FC<HandOverFormModalProps> = ({ hierarchy, onClose, onSubmit, employeeDetails, isLoading, error, initialFormData, isEditing }) => {
//     const [formData, setFormData] = useState<HandoverFormData>( initialFormData || { name: "", currentDepartment: "", currentLine: "", currentStation: "", industrialExperience: "", kpaplExperience: "", distributedDepartment: "", selectedLineId: "", selectedStationId: "", handoverDate: new Date().toISOString().split("T")[0], contractorName: "", pAndAName: "", qaHodName: "", isTrainingCompleted: "", gojoInchargeName: "" });
//     const [lineOptions, setLineOptions] = useState<Line[]>([]);
//     const [stationOptions, setStationOptions] = useState<Station[]>([]);
    
//     useEffect(() => { if (initialFormData) { setFormData(initialFormData); } }, [initialFormData]);
    
//     // --- AUTO- POPULATE OPTIONS ---
//     // This watches formData.distributedDepartment. 
//     // When the Parent passes a department name, this runs and fills the lineOptions.
//     useEffect(() => { 
//         if (formData.distributedDepartment) { 
//             let selectedDept: Department | undefined; 
//             for (const structure of hierarchy) { 
//                 selectedDept = structure.structure_data.departments.find(d => d.department_name === formData.distributedDepartment); 
//                 if (selectedDept) break; 
//             } 
//             if (selectedDept) { 
//                 setLineOptions(selectedDept.lines); 
//                 setStationOptions(selectedDept.stations); 
//             } else { 
//                 setLineOptions([]); 
//                 setStationOptions([]); 
//             } 
            
//             // Only reset if the department ACTUALLY changed from initial
//             if (initialFormData?.distributedDepartment !== formData.distributedDepartment) { 
//                 // Don't reset if we are just loading the form for the first time
//                 if(formData.distributedDepartment !== initialFormData?.distributedDepartment) {
//                      setFormData(prev => ({ ...prev, selectedLineId: "", selectedStationId: "" }));
//                 }
//             } 
//         } 
//     }, [formData.distributedDepartment, hierarchy, initialFormData]);
    
//     useEffect(() => { 
//         if (formData.selectedLineId) { 
//             const selectedLine = lineOptions.find(l => String(l.id) === formData.selectedLineId); 
//             if (selectedLine && selectedLine.stations.length > 0) { setStationOptions(selectedLine.stations); } 
//             if (initialFormData?.selectedLineId !== formData.selectedLineId) { 
//                  if(formData.selectedLineId !== initialFormData?.selectedLineId) {
//                     setFormData(prev => ({ ...prev, selectedStationId: "" })); 
//                  }
//             } 
//         } 
//     }, [formData.selectedLineId, lineOptions, initialFormData]);

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { const { name, value } = e.target; setFormData((prevData) => ({ ...prevData, [name]: value })); };
//     const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(formData); };
    
//     const modalStyles: { [key: string]: React.CSSProperties } = {
//         backdrop: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(17, 24, 39, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
//         content: { backgroundColor: "white", padding: "30px 40px", borderRadius: "20px", width: "100%", maxWidth: "1500px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", position: "relative", display: "flex", flexDirection: "column" },
//         closeButton: { position: "absolute", top: "15px", right: "20px", background: "transparent", border: "none", fontSize: "28px", cursor: "pointer", color: "#9ca3af" },
//         header: { textAlign: "center", marginBottom: "30px", borderBottom: "1px solid #e5e7eb", paddingBottom: "20px" },
//         title: { fontSize: "22px", fontWeight: "700", color: "#1f2937" },
//         formGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" },
//         formField: { display: "flex", flexDirection: "column" as const },
//         label: { marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#374151" },
//         input: { padding: "10px 12px", fontSize: "14px", border: "1px solid #d1d5db", borderRadius: "8px", outline: "none", transition: "all 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" },
//         readOnlyInput: { backgroundColor: "#f3f4f6", cursor: "not-allowed", color: "#4b5563" },
//         submitButton: { gridColumn: "1 / -1", marginTop: "20px", padding: "12px 20px", fontSize: "16px", fontWeight: "600", color: "#ffffff", background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)", border: "none", borderRadius: "10px", cursor: "pointer", transition: "all 0.2s ease", boxShadow: "0 4px 10px rgba(124, 58, 237, 0.2)" },
//         // Style fix: Explicitly define border to avoid conflicts
//         updateButton: { background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", boxShadow: "0 4px 10px rgba(16, 185, 129, 0.2)" },
//         centeredStatus: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", color: "#6b7280" }
//     };

//     // Fix for style warning: Don't spread conditional styles if they conflict.
//     const buttonStyle = isEditing 
//         ? { ...modalStyles.submitButton, ...modalStyles.updateButton }
//         : { ...modalStyles.submitButton };

//     return (
//         <div style={modalStyles.backdrop} onClick={onClose}>
//             <div style={modalStyles.content} onClick={(e) => e.stopPropagation()}>
//                 <button style={modalStyles.closeButton} onClick={onClose}>&times;</button>
//                 <div style={modalStyles.header}> <h2 style={modalStyles.title}>{isEditing ? "Edit Dojo Handover" : "Dojo Handover Form"}</h2> </div>
//                 {isLoading && <div style={modalStyles.centeredStatus}>Loading Details...</div>}
//                 {error && <div style={{ ...modalStyles.centeredStatus, color: "red" }}>{error}</div>}
//                 {!isLoading && !error && employeeDetails && (
//                     <form onSubmit={handleSubmit}>
//                         <div style={modalStyles.formGrid}>
//                             <div style={{ ...modalStyles.formField, gridColumn: 'span 2' }}>
//                                 <label style={modalStyles.label}>Name</label>
//                                 <input type="text" style={{ ...modalStyles.input, ...modalStyles.readOnlyInput }} value={formData.name} readOnly />
//                             </div>
//                             <div style={modalStyles.formField}>
//                                 <label style={modalStyles.label}>Current Department</label>
//                                 <input type="text" style={{ ...modalStyles.input, ...modalStyles.readOnlyInput }} value={formData.currentDepartment} readOnly />
//                             </div>
//                             <div style={modalStyles.formField}>
//                                 <label style={modalStyles.label}>Current Line</label>
//                                 <input type="text" style={{ ...modalStyles.input, ...modalStyles.readOnlyInput }} value={formData.currentLine} readOnly />
//                             </div>
//                             <div style={modalStyles.formField}>
//                                 <label style={modalStyles.label}>Current Station</label>
//                                 <input type="text" style={{ ...modalStyles.input, ...modalStyles.readOnlyInput }} value={formData.currentStation} readOnly />
//                             </div>
//                             <div style={{ gridColumn: '1 / -1', height: '1px', backgroundColor: '#e5e7eb', margin: '5px 0' }}></div>
//                             <div style={modalStyles.formField}><label style={modalStyles.label}>Industrial Experience</label><input type="text" name="industrialExperience" value={formData.industrialExperience} onChange={handleChange} style={modalStyles.input} required /></div>
//                             <div style={modalStyles.formField}><label style={modalStyles.label}>KPAPL Experience</label><input type="text" name="kpaplExperience" value={formData.kpaplExperience} onChange={handleChange} style={modalStyles.input} required /></div>
                            
//                             <div style={modalStyles.formField}>
//                                 <label style={modalStyles.label}>Distributed Department</label>
//                                 <select name="distributedDepartment" value={formData.distributedDepartment} onChange={handleChange} style={modalStyles.input as React.CSSProperties} required>
//                                     <option value="" disabled>Select department</option>
//                                     {hierarchy.flatMap(s => s.structure_data.departments).map((dept) => (<option key={dept.id} value={dept.department_name}>{dept.department_name}</option>))}
//                                 </select>
//                             </div>
                            
//                             <div style={modalStyles.formField}>
//                                 <label style={modalStyles.label}>Line (Optional)</label>
//                                 <select name="selectedLineId" value={formData.selectedLineId} onChange={handleChange} style={modalStyles.input as React.CSSProperties} disabled={!formData.distributedDepartment}>
//                                     <option value="">-- None --</option>
//                                     {lineOptions.map((line) => (<option key={line.id} value={line.id}>{line.line_name}</option>))}
//                                 </select>
//                             </div>
                            
//                             <div style={modalStyles.formField}>
//                                 <label style={modalStyles.label}>Station (Optional)</label>
//                                 <select name="selectedStationId" value={formData.selectedStationId} onChange={handleChange} style={modalStyles.input as React.CSSProperties} disabled={stationOptions.length === 0}>
//                                     <option value="">-- None --</option>
//                                     {stationOptions.map((station) => (<option key={station.id} value={station.id}>{station.station_name}</option>))}
//                                 </select>
//                             </div>
                            
//                             <div style={modalStyles.formField}><label style={modalStyles.label}>Date</label><input type="date" name="handoverDate" style={modalStyles.input} value={formData.handoverDate} onChange={handleChange} required /></div>
//                             <div style={modalStyles.formField}><label style={modalStyles.label}>Contractor Name</label><input type="text" name="contractorName" style={modalStyles.input} value={formData.contractorName} onChange={handleChange} required /></div>
//                             <div style={modalStyles.formField}><label style={modalStyles.label}>P & A Name</label><input type="text" name="pAndAName" style={modalStyles.input} value={formData.pAndAName} onChange={handleChange} required /></div>
//                             <div style={modalStyles.formField}><label style={modalStyles.label}>QA HOD Name</label><input type="text" name="qaHodName" style={modalStyles.input} value={formData.qaHodName} onChange={handleChange} required /></div>
//                             <div style={modalStyles.formField}><label style={modalStyles.label}>Training Completed?</label><select name="isTrainingCompleted" value={formData.isTrainingCompleted} style={modalStyles.input as React.CSSProperties} onChange={handleChange} required><option value="" disabled>Select</option><option value="yes">Yes</option><option value="no">No</option></select></div>
//                             <div style={modalStyles.formField}><label style={modalStyles.label}>Dojo Incharge</label><input type="text" name="gojoInchargeName" style={modalStyles.input} value={formData.gojoInchargeName} onChange={handleChange} required /></div>
//                         </div>
//                         <button type="submit" style={buttonStyle}>{isEditing ? "Update Handover" : "Submit Handover"}</button>
//                     </form>
//                 )}
//             </div>
//         </div>
//     );
// };

// // --- 3. MAIN PAGE COMPONENT ---
// const HandOverSheet: React.FC = () => {
//     // Data States
//     const [scores, setScores] = useState<ApiScoreData[]>([]);
//     const [loading, setLoading] = useState<boolean>(true);
//     const [error, setError] = useState<string | null>(null);
//     const [employeesWithHandover, setEmployeesWithHandover] = useState<Set<string>>(new Set());
//     const [hierarchy, setHierarchy] = useState<HierarchyStructure[]>([]);
//     const [employeeDetailsMap, setEmployeeDetailsMap] = useState<{ [key: string]: EmployeeMasterData }>({});
//     const [refreshKey, setRefreshKey] = useState(0);

//     // UI States
//     const [searchTerm, setSearchTerm] = useState("");
//     const [selectedMonth, setSelectedMonth] = useState("");
//     const [hoveredCard, setHoveredCard] = useState<number | null>(null);
//     const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

//     // Modal States
//     const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//     const [selectedScore, setSelectedScore] = useState<ApiScoreData | null>(null);
//     const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
//     const [modalError, setModalError] = useState<string | null>(null);
//     const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState<EmployeeMasterData | null>(null);
//     const [initialFormData, setInitialFormData] = useState<HandoverFormData | null>(null);
//     const [isEditingMode, setIsEditingMode] = useState<boolean>(false);

//     // --- DATA FETCHING ---
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 setLoading(true);
//                 const [scoresResponse, handoversResponse, hierarchyResponse] = await Promise.all([
//                     fetch("http://127.0.0.1:8000/scores/passed/level-1/"),
//                     fetch("http://127.0.0.1:8000/handovers/"),
//                     fetch("http://127.0.0.1:8000/hierarchy-simple/"),
//                 ]);

//                 if (!scoresResponse.ok) throw new Error("Scores API failed");
//                 if (!handoversResponse.ok) throw new Error("Handovers API failed");
//                 if (!hierarchyResponse.ok) throw new Error("Hierarchy API failed");

//                 const scoresData: ApiScoreData[] = await scoresResponse.json();
//                 const hierarchyData: HierarchyStructure[] = await hierarchyResponse.json();
//                 const handoversRawData = await handoversResponse.json();

//                 const validHandoverIds = handoversRawData.map((h: any) => {
//                     const foundId = h.employee_id || h.emp_id || h.employee || h.id;
//                     return foundId ? String(foundId) : "";
//                 }).filter((id: string) => id !== "");

//                 setEmployeesWithHandover(new Set(validHandoverIds));
//                 setScores(scoresData);
//                 setHierarchy(hierarchyData);
//                 setError(null);
//             } catch (err) {
//                 if (err instanceof Error) setError(`Failed to fetch data: ${err.message}`);
//                 else setError("An unknown error occurred.");
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchData();
//     }, [refreshKey]);

//     useEffect(() => {
//         if (scores.length === 0) return;
//         const fetchEmployeeDetails = async () => {
//             const empIds = scores.map(score => score.employee_details.split("(").pop()?.replace(")", "")).filter(Boolean) as string[];
//             const uniqueIds = Array.from(new Set(empIds));
//             const promises = uniqueIds.map(id => fetch(`http://127.0.0.1:8000/mastertable-handover-details/${id}/`).then(res => res.ok ? res.json() : null));
//             try {
//                 const results = await Promise.all(promises);
//                 const detailsMap: { [key: string]: EmployeeMasterData } = {};
//                 results.forEach(detail => { if (detail && detail.emp_id) { detailsMap[detail.emp_id] = detail; } });
//                 setEmployeeDetailsMap(detailsMap);
//             } catch (error) { console.error("Failed to fetch some employee details:", error); }
//         };
//         fetchEmployeeDetails();
//     }, [scores]);

//     const uniqueMonths = useMemo(() => { const m = new Set<string>(); scores.forEach(s => m.add(s.created_at.substring(0, 7))); return Array.from(m).sort().reverse(); }, [scores]);
//     useEffect(() => { if (uniqueMonths.length > 0 && !selectedMonth) { setSelectedMonth(uniqueMonths[0]); } }, [uniqueMonths, selectedMonth]);
    
//     // --- FILTERING ---
//     const baseFilteredEmployees = useMemo(() => { 
//         let e = [...scores]; 
//         if (selectedMonth && selectedMonth !== "all") { e = e.filter(emp => emp.created_at.startsWith(selectedMonth)); } 
//         if (searchTerm.trim() !== "") { const l = searchTerm.toLowerCase(); e = e.filter(emp => emp.employee_details.toLowerCase().includes(l)); } 
//         return e.sort((a, b) => b.percentage - a.percentage); 
//     }, [scores, selectedMonth, searchTerm]);

//     const pendingEmployees = useMemo(() => {
//         return baseFilteredEmployees.filter(score => {
//             const empId = score.employee_details.split("(").pop()?.replace(")", "");
//             return empId && !employeesWithHandover.has(empId);
//         });
//     }, [baseFilteredEmployees, employeesWithHandover]);

//     const completedEmployees = useMemo(() => {
//         return baseFilteredEmployees.filter(score => {
//             const empId = score.employee_details.split("(").pop()?.replace(")", "");
//             return empId && employeesWithHandover.has(empId);
//         });
//     }, [baseFilteredEmployees, employeesWithHandover]);

//     const displayList = activeTab === 'pending' ? pendingEmployees : completedEmployees;

//     // --- MODAL LOGIC (FIXED) ---
//     const handleOpenModal = async (score: ApiScoreData) => {
//         const empId = score?.employee_details?.split('(')?.pop()?.replace(')', '') || null;
//         if (!empId) { alert("Error: Could not find a valid Employee ID."); return; }

//         setIsModalOpen(true);
//         setSelectedScore(score);
//         setIsModalLoading(true);
//         setModalError(null);
//         setSelectedEmployeeDetails(null);
//         setInitialFormData(null);

//         try {
//             const response = await fetch(`http://127.0.0.1:8000/mastertable-handover-details/${empId}/`);
//             if (!response.ok) throw new Error("Failed to fetch employee details for handover");
//             const data: EmployeeMasterData = await response.json();
//             setSelectedEmployeeDetails(data);

//             const handResp = await fetch(`http://127.0.0.1:8000/handovers/employee/${empId}/`);
            
//             const baseFormData = { name: `${data.first_name} ${data.last_name}`, currentDepartment: data.department?.department_name || "N/A", currentLine: data.current_line?.line_name || "N/A", currentStation: data.current_station?.station_name || "N/A", handoverDate: new Date().toISOString().split("T")[0], industrialExperience: "", kpaplExperience: "", contractorName: "", pAndAName: "", qaHodName: "", isTrainingCompleted: "" as const, gojoInchargeName: "" };

//             if (handResp.ok) {
//                 // EDIT MODE
//                 setIsEditingMode(true);
//                 const handData = await handResp.json();
                
//                 // --- FIX: Find Department Name from ID ---
//                 const deptId = handData.distributed_department_after_dojo;
//                 let foundDeptName = "";
//                 if (deptId) { 
//                     const targetDept = hierarchy.flatMap(s => s.structure_data.departments).find(d => d.id === deptId);
//                     if (targetDept) foundDeptName = targetDept.department_name;
//                 }

//                 setInitialFormData({ 
//                     ...baseFormData, 
//                     industrialExperience: handData.industrial_experience || "", 
//                     kpaplExperience: handData.kpapl_experience || "", 
//                     distributedDepartment: foundDeptName, // Pass Name so Modal loads options
//                     selectedLineId: handData.allocated_line ? String(handData.allocated_line) : "", 
//                     selectedStationId: handData.allocated_station ? String(handData.allocated_station) : "", 
//                     handoverDate: handData.handover_date || baseFormData.handoverDate, 
//                     contractorName: handData.contractor_name || "", 
//                     pAndAName: handData.p_and_a_name || "", 
//                     qaHodName: handData.qa_hod_name || "", 
//                     isTrainingCompleted: handData.is_training_completed ? "yes" : "no", 
//                     gojoInchargeName: handData.gojo_incharge_name || "" 
//                 });
//             } else {
//                 // CREATE MODE
//                 setIsEditingMode(false);
//                 setInitialFormData({ ...baseFormData, distributedDepartment: "", selectedLineId: "", selectedStationId: "" });
//             }
//         } catch (err) {
//             if (err instanceof Error) setModalError(err.message); else setModalError("An unknown error occurred.");
//         } finally {
//             setIsModalLoading(false);
//         }
//     };
    
//     const handleCloseModal = () => { setIsModalOpen(false); setSelectedScore(null); setSelectedEmployeeDetails(null); setModalError(null); setInitialFormData(null); setIsEditingMode(false); };

//     const handleFormSubmit = async (formData: HandoverFormData) => {
//         if (!selectedEmployeeDetails) { alert("Error: Employee details not loaded."); return; }
        
//         const payload = { 
//             emp_id: selectedEmployeeDetails.emp_id, 
//             industrial_experience: formData.industrialExperience, 
//             kpapl_experience: formData.kpaplExperience, 
//             required_department_at_handover: formData.currentDepartment, 
//             distributed_department_name: formData.distributedDepartment, 
//             line_id: formData.selectedLineId || null, 
//             station_id: formData.selectedStationId || null, 
//             handover_date: formData.handoverDate, 
//             contractor_name: formData.contractorName, 
//             p_and_a_name: formData.pAndAName, 
//             qa_hod_name: formData.qaHodName, 
//             is_training_completed: formData.isTrainingCompleted === 'yes', 
//             gojo_incharge_name: formData.gojoInchargeName 
//         };

//         const url = isEditingMode 
//             ? `http://127.0.0.1:8000/handovers/employee/${selectedEmployeeDetails.emp_id}/` 
//             : "http://127.0.0.1:8000/handovers/";
            
//         const method = isEditingMode ? "PUT" : "POST";
        
//         try {
//             const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
//             if (!response.ok) { const errorData = await response.json(); const errorMessage = Object.values(errorData).flat().join(" ") || `Server error`; throw new Error(errorMessage); }
//             alert(`Handover form ${isEditingMode ? 'updated' : 'submitted'} successfully!`);
//             handleCloseModal();
//             setRefreshKey(prevKey => prevKey + 1);
//         } catch (error) { if (error instanceof Error) alert(`Error: ${error.message}`); else alert("An unknown error occurred."); }
//     };

//     const formatDate = (dateString: string): string => new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
//     const formatMonthForDisplay = (monthStr: string): string => { const [year, month] = monthStr.split("-"); return new Date(Number(year), Number(month) - 1).toLocaleString("en-US", { month: "long", year: "numeric" }); };
//     const getScoreBarWidth = (percentage: number): string => `${percentage}%`;

//     const styles: { [key: string]: React.CSSProperties } = { 
//         container: { minHeight: "100vh", backgroundColor: "#ffffffff", padding: "40px 20px" }, 
//         header: { textAlign: "center", marginBottom: "30px" }, 
//         title: { fontSize: "32px", fontWeight: "800", background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "10px" }, 
//         subtitle: { fontSize: "18px", color: "#6b7280", fontWeight: "400" }, 
//         controlsContainer: { maxWidth: "1000px", margin: "0 auto 20px", display: "flex", gap: "20px", justifyContent: "space-between" }, 
//         searchInput: { flex: 1, padding: "12px 16px", fontSize: "16px", border: "1px solid #e5e7eb", borderRadius: "12px", outline: "none", transition: "all 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }, 
//         monthSelect: { padding: "12px 16px", fontSize: "16px", border: "1px solid #e5e7eb", borderRadius: "12px", backgroundColor: "white", cursor: "pointer", outline: "none", transition: "all 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }, 
//         tabContainer: { maxWidth: "1000px", margin: "0 auto 30px", display: "flex", borderBottom: "1px solid #e5e7eb" }, 
//         tabButton: { flex: 1, padding: "15px", border: "none", background: "none", fontSize: "16px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s", color: "#6b7280", borderBottom: "3px solid transparent", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }, 
//         activeTab: { color: "#2563eb", borderBottom: "3px solid #2563eb" }, 
//         tabCount: { fontSize: "12px", padding: "2px 8px", borderRadius: "10px", backgroundColor: "#f3f4f6", color: "#6b7280" }, 
//         activeTabCount: { backgroundColor: "#dbeafe", color: "#1e40af" }, 
//         resultsContainer: { maxWidth: "1000px", margin: "0 auto" }, 
//         noResults: { textAlign: "center", padding: "60px", backgroundColor: "#ffffff", borderRadius: "16px", color: "#6b7280", fontSize: "18px", boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb" }, 
//         resultCard: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "30px", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)", border: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: "25px", transition: "all 0.3s ease" }, 
//         resultCardHover: { boxShadow: "0 10px 25px rgba(124, 58, 237, 0.1)", borderColor: "#e0e7ff", transform: "translateY(-2px)" }, 
//         rankCircle: { width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "700", flexShrink: 0, boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)" }, 
//         rankCircleGray: { width: "56px", height: "56px", borderRadius: "50%", background: "#9ca3af", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "700", flexShrink: 0 }, 
//         mainInfo: { flex: 1 }, 
//         name: { fontSize: "20px", fontWeight: "700", color: "#1f2937", marginBottom: "8px" }, 
//         details: { display: "flex", gap: "15px", color: "#6b7280", fontSize: "14px", marginBottom: "15px", flexWrap: "wrap", alignItems: "center" }, 
//         scoreSection: { marginTop: "15px" }, 
//         scoreBar: { width: "100%", height: "10px", backgroundColor: "#f3f4f6", borderRadius: "10px", overflow: "hidden", marginBottom: "8px" }, 
//         scoreProgress: { height: "100%", background: "linear-gradient(90deg, #7c3aed 0%, #2563eb 100%)", borderRadius: "10px", transition: "width 1s ease", boxShadow: "0 2px 4px rgba(124, 58, 237, 0.2)" }, 
//         scoreText: { display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#6b7280" }, 
//         badge: { display: "inline-block", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", backgroundColor: "#f3f4f6", color: "#4b5563", border: "1px solid #e5e7eb" }, 
//         statusPill: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", backgroundColor: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" }, 
//         detailsButton: { padding: "10px 20px", fontSize: "14px", fontWeight: "600", color: "#ffffff", background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)", border: "none", borderRadius: "10px", cursor: "pointer", transition: "all 0.2s ease", boxShadow: "0 4px 10px rgba(124, 58, 237, 0.2)" }, 
//         editButton: { background: "#ffffff", color: "#4b5563", border: "1px solid #d1d5db", boxShadow: "none" }, 
//         handoverSubmittedBadge: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", backgroundColor: "#dbeafe", color: "#1e40af", border: "1px solid #bfdbfe" } 
//     };
    
//     if (loading) return <div style={{ ...styles.container, textAlign: "center", fontSize: "20px" }}>Loading...</div>;
//     if (error) return <div style={{ ...styles.container, textAlign: "center", fontSize: "20px", color: "red" }}>Error: {error}</div>;

//     return (
//         <div style={styles.container}>
//             <div style={styles.header}><h1 style={styles.title}>Level 1 Assessment Outcomes</h1><p style={styles.subtitle}>Manage employee handover and allocation</p></div>
//             <div style={styles.controlsContainer}><input type="text" placeholder="Search by Employee ID or Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} /><select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={styles.monthSelect}><option value="all">All Months</option>{uniqueMonths.map((month) => (<option key={month} value={month}>{formatMonthForDisplay(month)}</option>))}</select></div>
//             <div style={styles.tabContainer}>
//                 <button style={{...styles.tabButton, ...(activeTab === 'pending' ? styles.activeTab : {})}} onClick={() => setActiveTab('pending')}>Pending Actions <span style={{...styles.tabCount, ...(activeTab === 'pending' ? styles.activeTabCount : {})}}>{pendingEmployees.length}</span></button>
//                 <button style={{...styles.tabButton, ...(activeTab === 'completed' ? styles.activeTab : {})}} onClick={() => setActiveTab('completed')}>Handover Completed <span style={{...styles.tabCount, ...(activeTab === 'completed' ? styles.activeTabCount : {})}}>{completedEmployees.length}</span></button>
//             </div>
//             <div style={styles.resultsContainer}>
//                 {displayList.length > 0 ? (
//                     displayList.map((score, index) => {
//                         const empId = score.employee_details.split("(").pop()?.replace(")", "") || null;
//                         const details = empId ? employeeDetailsMap[empId] : null;
//                         const isPending = activeTab === 'pending';
//                         return (
//                             <div key={score.id} style={{ ...styles.resultCard, ...(hoveredCard === score.id ? styles.resultCardHover : {}) }} onMouseEnter={() => setHoveredCard(score.id)} onMouseLeave={() => setHoveredCard(null)}>
//                                 <div style={isPending ? styles.rankCircle : styles.rankCircleGray}>{index + 1}</div>
//                                 <div style={styles.mainInfo}>
//                                     <h3 style={styles.name}>{score.employee_details}</h3>
//                                     <div style={styles.details}>
//                                         <span style={styles.badge}>Dept: {details?.department?.department_name || '...'}</span>
//                                         <span>•</span>
//                                         <span style={styles.badge}>Current: {details?.current_line?.line_name || 'N/A'} / {details?.current_station?.station_name || 'N/A'}</span>
//                                     </div>
//                                     <div style={styles.details}><span style={styles.badge}>{score.skill_name}</span><span>•</span><span>{formatDate(score.created_at)}</span><span>•</span><span style={styles.statusPill}><span>✓</span><span>Passed</span></span>{!isPending && (<><span>•</span><span style={styles.handoverSubmittedBadge}><span>✓</span><span>Handover Submitted</span></span></>)}</div>
//                                     <div style={styles.scoreSection}><div style={styles.scoreBar}><div style={{ ...styles.scoreProgress, width: getScoreBarWidth(score.percentage) }} /></div><div style={styles.scoreText}><span style={{ fontWeight: "600", color: "#4b5563" }}>Score: {score.percentage.toFixed(1)}%</span></div></div>
//                                 </div>
//                                 <button style={{ ...styles.detailsButton, ...(!isPending ? styles.editButton : {}) }} onClick={() => handleOpenModal(score)}>{isPending ? "Create Handover" : "Edit Details"}</button>
//                             </div>
//                         );
//                     })
//                 ) : (
//                     <div style={styles.noResults}><p>{activeTab === 'pending' ? "All caught up! No pending handovers for this selection." : "No completed handovers found for this selection."}</p></div>
//                 )}
//             </div>
//             {isModalOpen && selectedScore && ( <HandOverFormModal scoreData={selectedScore} hierarchy={hierarchy} onClose={handleCloseModal} onSubmit={handleFormSubmit} isLoading={isModalLoading} error={modalError} employeeDetails={selectedEmployeeDetails} initialFormData={initialFormData} isEditing={isEditingMode} /> )}
//         </div>
//     );
// };

// export default HandOverSheet;



import React, { useState, useMemo, useEffect } from "react";

// --- 1. INTERFACES ---
interface Station { id: number; station_name: string; }
interface Line { id: number; line_name: string; stations: Station[]; }
interface Department { id: number; department_name: string; lines: Line[]; stations: Station[]; }
interface HierarchyStructure { structure_id: number; structure_name: string; structure_data: { departments: Department[] }; }
interface ApiScoreData { id: number; employee_details: string; skill_name: string; marks: number; percentage: number; created_at: string; }

interface EmployeeMasterData {
  emp_id: string;
  first_name: string;
  last_name: string;
  department: { department_id: number, department_name: string } | null;
  current_line: { line_id: number, line_name: string } | null;
  current_station: { station_id: number, station_name: string } | null;
}

interface HandoverFormData {
  name: string;
  currentDepartment: string;
  currentLine: string;
  currentStation: string;
  industrialExperience: string;
  kpaplExperience: string;
  distributedDepartment: string;
  selectedLineId: string;
  selectedStationId: string;
  handoverDate: string;
  contractorName: string;
  pAndAName: string;
  qaHodName: string;
  isTrainingCompleted: "yes" | "no" | "";
  gojoInchargeName: string;
}

interface HandOverFormModalProps {
  scoreData?: ApiScoreData;
  hierarchy: HierarchyStructure[];
  onClose: () => void;
  onSubmit: (formData: HandoverFormData) => void;
  employeeDetails: EmployeeMasterData | null;
  isLoading: boolean;
  error: string | null;
  initialFormData: HandoverFormData | null;
  isEditing: boolean;
}

// --- 2. MODAL COMPONENT (FIXED LOGIC) ---
const HandOverFormModal: React.FC<HandOverFormModalProps> = ({ hierarchy, onClose, onSubmit, employeeDetails, isLoading, error, initialFormData, isEditing }) => {
    
    // Initialize state
    const [formData, setFormData] = useState<HandoverFormData>({ 
        name: "", currentDepartment: "", currentLine: "", currentStation: "", 
        industrialExperience: "", kpaplExperience: "", distributedDepartment: "", 
        selectedLineId: "", selectedStationId: "", handoverDate: new Date().toISOString().split("T")[0], 
        contractorName: "", pAndAName: "", qaHodName: "", isTrainingCompleted: "", gojoInchargeName: "" 
    });

    const [lineOptions, setLineOptions] = useState<Line[]>([]);
    const [stationOptions, setStationOptions] = useState<Station[]>([]);
    
    // --- 1. INITIALIZATION EFFECT (RUNS ONCE ON OPEN) ---
    useEffect(() => {
        if (initialFormData) {
            setFormData(initialFormData);

            // CRITICAL FIX: Load options IMMEDIATELY based on the incoming data
            if (initialFormData.distributedDepartment) {
                const selectedDept = hierarchy
                    .flatMap(s => s.structure_data.departments)
                    .find(d => d.department_name === initialFormData.distributedDepartment);

                if (selectedDept) {
                    setLineOptions(selectedDept.lines);
                    setStationOptions(selectedDept.stations);

                    // If a line is also selected, ensure its stations are loaded if the structure differs
                    // (Usually dept.stations covers it, but if line has specific stations):
                    if (initialFormData.selectedLineId) {
                        const selectedLine = selectedDept.lines.find(l => String(l.id) === initialFormData.selectedLineId);
                        if (selectedLine && selectedLine.stations.length > 0) {
                            setStationOptions(selectedLine.stations);
                        }
                    }
                }
            }
        }
    }, [initialFormData, hierarchy]);

    // --- 2. USER INTERACTION EFFECT (RUNS WHEN USER CHANGES DEPARTMENT) ---
    const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newDeptName = e.target.value;
        
        // Find new department data
        const selectedDept = hierarchy
            .flatMap(s => s.structure_data.departments)
            .find(d => d.department_name === newDeptName);

        // Update Options
        if (selectedDept) {
            setLineOptions(selectedDept.lines);
            setStationOptions(selectedDept.stations);
        } else {
            setLineOptions([]);
            setStationOptions([]);
        }

        // Update Form Data (and clear Line/Station selections)
        setFormData(prev => ({
            ...prev,
            distributedDepartment: newDeptName,
            selectedLineId: "",   // Reset Line
            selectedStationId: "" // Reset Station
        }));
    };

    // --- 3. USER INTERACTION EFFECT (RUNS WHEN USER CHANGES LINE) ---
    const handleLineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLineId = e.target.value;

        // Find selected line to update station options
        const selectedLine = lineOptions.find(l => String(l.id) === newLineId);
        
        if (selectedLine && selectedLine.stations.length > 0) {
            setStationOptions(selectedLine.stations);
        } else {
            // Fallback to department stations if line has no specific stations
            // (Or keep existing if logic dictates)
        }

        setFormData(prev => ({
            ...prev,
            selectedLineId: newLineId,
            selectedStationId: "" // Reset Station when Line changes
        }));
    };

    // Generic handler for text inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { 
        const { name, value } = e.target; 
        setFormData((prevData) => ({ ...prevData, [name]: value })); 
    };

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(formData); };
    
    // Styles
    const modalStyles: { [key: string]: React.CSSProperties } = {
        backdrop: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(17, 24, 39, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
        content: { backgroundColor: "white", padding: "30px 40px", borderRadius: "20px", width: "100%", maxWidth: "1500px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", position: "relative", display: "flex", flexDirection: "column" },
        closeButton: { position: "absolute", top: "15px", right: "20px", background: "transparent", border: "none", fontSize: "28px", cursor: "pointer", color: "#9ca3af" },
        header: { textAlign: "center", marginBottom: "30px", borderBottom: "1px solid #e5e7eb", paddingBottom: "20px" },
        title: { fontSize: "22px", fontWeight: "700", color: "#1f2937" },
        formGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" },
        formField: { display: "flex", flexDirection: "column" as const },
        label: { marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#374151" },
        input: { padding: "10px 12px", fontSize: "14px", border: "1px solid #d1d5db", borderRadius: "8px", outline: "none", transition: "all 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" },
        readOnlyInput: { backgroundColor: "#f3f4f6", cursor: "not-allowed", color: "#4b5563" },
        submitButton: { gridColumn: "1 / -1", marginTop: "20px", padding: "12px 20px", fontSize: "16px", fontWeight: "600", color: "#ffffff", background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)", border: "none", borderRadius: "10px", cursor: "pointer", transition: "all 0.2s ease", boxShadow: "0 4px 10px rgba(124, 58, 237, 0.2)" },
        updateButton: { background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", boxShadow: "0 4px 10px rgba(16, 185, 129, 0.2)" },
        centeredStatus: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", color: "#6b7280" }
    };

    const buttonStyle = isEditing ? { ...modalStyles.submitButton, ...modalStyles.updateButton } : { ...modalStyles.submitButton };

    return (
        <div style={modalStyles.backdrop} onClick={onClose}>
            <div style={modalStyles.content} onClick={(e) => e.stopPropagation()}>
                <button style={modalStyles.closeButton} onClick={onClose}>&times;</button>
                <div style={modalStyles.header}> <h2 style={modalStyles.title}>{isEditing ? "Edit Dojo Handover" : "Dojo Handover Form"}</h2> </div>
                {isLoading && <div style={modalStyles.centeredStatus}>Loading Details...</div>}
                {error && <div style={{ ...modalStyles.centeredStatus, color: "red" }}>{error}</div>}
                {!isLoading && !error && employeeDetails && (
                    <form onSubmit={handleSubmit}>
                        <div style={modalStyles.formGrid}>
                            {/* Read Only Fields */}
                            <div style={{ ...modalStyles.formField, gridColumn: 'span 2' }}><label style={modalStyles.label}>Name</label><input type="text" style={{ ...modalStyles.input, ...modalStyles.readOnlyInput }} value={formData.name} readOnly /></div>
                            <div style={modalStyles.formField}><label style={modalStyles.label}>Current Department</label><input type="text" style={{ ...modalStyles.input, ...modalStyles.readOnlyInput }} value={formData.currentDepartment} readOnly /></div>
                            <div style={modalStyles.formField}><label style={modalStyles.label}>Current Line</label><input type="text" style={{ ...modalStyles.input, ...modalStyles.readOnlyInput }} value={formData.currentLine} readOnly /></div>
                            <div style={modalStyles.formField}><label style={modalStyles.label}>Current Station</label><input type="text" style={{ ...modalStyles.input, ...modalStyles.readOnlyInput }} value={formData.currentStation} readOnly /></div>
                            <div style={{ gridColumn: '1 / -1', height: '1px', backgroundColor: '#e5e7eb', margin: '5px 0' }}></div>
                            
                            {/* Text Inputs */}
                            <div style={modalStyles.formField}><label style={modalStyles.label}>Industrial Experience</label><input type="text" name="industrialExperience" value={formData.industrialExperience} onChange={handleChange} style={modalStyles.input} required /></div>
                            <div style={modalStyles.formField}><label style={modalStyles.label}>KPAPL Experience</label><input type="text" name="kpaplExperience" value={formData.kpaplExperience} onChange={handleChange} style={modalStyles.input} required /></div>
                            
                            {/* Dropdowns with Special Handlers */}
                            <div style={modalStyles.formField}>
                                <label style={modalStyles.label}>Distributed Department</label>
                                <select name="distributedDepartment" value={formData.distributedDepartment} onChange={handleDepartmentChange} style={modalStyles.input as React.CSSProperties} required>
                                    <option value="" disabled>Select department</option>
                                    {hierarchy.flatMap(s => s.structure_data.departments).map((dept) => (<option key={dept.id} value={dept.department_name}>{dept.department_name}</option>))}
                                </select>
                            </div>
                            
                            <div style={modalStyles.formField}>
                                <label style={modalStyles.label}>Line (Optional)</label>
                                <select name="selectedLineId" value={formData.selectedLineId} onChange={handleLineChange} style={modalStyles.input as React.CSSProperties} disabled={!formData.distributedDepartment}>
                                    <option value="">-- None --</option>
                                    {lineOptions.map((line) => (<option key={line.id} value={line.id}>{line.line_name}</option>))}
                                </select>
                            </div>
                            
                            <div style={modalStyles.formField}>
                                <label style={modalStyles.label}>Station (Optional)</label>
                                <select name="selectedStationId" value={formData.selectedStationId} onChange={handleChange} style={modalStyles.input as React.CSSProperties} disabled={stationOptions.length === 0}>
                                    <option value="">-- None --</option>
                                    {stationOptions.map((station) => (<option key={station.id} value={station.id}>{station.station_name}</option>))}
                                </select>
                            </div>
                            
                            {/* Remaining Fields */}
                            <div style={modalStyles.formField}><label style={modalStyles.label}>Date</label><input type="date" name="handoverDate" style={modalStyles.input} value={formData.handoverDate} onChange={handleChange} required /></div>
                            <div style={modalStyles.formField}><label style={modalStyles.label}>Contractor Name</label><input type="text" name="contractorName" style={modalStyles.input} value={formData.contractorName} onChange={handleChange} required /></div>
                            <div style={modalStyles.formField}><label style={modalStyles.label}>P & A Name</label><input type="text" name="pAndAName" style={modalStyles.input} value={formData.pAndAName} onChange={handleChange} required /></div>
                            <div style={modalStyles.formField}><label style={modalStyles.label}>QA HOD Name</label><input type="text" name="qaHodName" style={modalStyles.input} value={formData.qaHodName} onChange={handleChange} required /></div>
                            <div style={modalStyles.formField}><label style={modalStyles.label}>Training Completed?</label><select name="isTrainingCompleted" value={formData.isTrainingCompleted} style={modalStyles.input as React.CSSProperties} onChange={handleChange} required><option value="" disabled>Select</option><option value="yes">Yes</option><option value="no">No</option></select></div>
                            <div style={modalStyles.formField}><label style={modalStyles.label}>Dojo Incharge</label><input type="text" name="gojoInchargeName" style={modalStyles.input} value={formData.gojoInchargeName} onChange={handleChange} required /></div>
                        </div>
                        <button type="submit" style={buttonStyle}>{isEditing ? "Update Handover" : "Submit Handover"}</button>
                    </form>
                )}
            </div>
        </div>
    );
};

// --- 3. MAIN PAGE COMPONENT (FIXED PARENT LOGIC) ---
const HandOverSheet: React.FC = () => {
    const [scores, setScores] = useState<ApiScoreData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [employeesWithHandover, setEmployeesWithHandover] = useState<Set<string>>(new Set());
    const [hierarchy, setHierarchy] = useState<HierarchyStructure[]>([]);
    const [employeeDetailsMap, setEmployeeDetailsMap] = useState<{ [key: string]: EmployeeMasterData }>({});
    const [refreshKey, setRefreshKey] = useState(0);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedScore, setSelectedScore] = useState<ApiScoreData | null>(null);
    const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
    const [modalError, setModalError] = useState<string | null>(null);
    const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState<EmployeeMasterData | null>(null);
    const [initialFormData, setInitialFormData] = useState<HandoverFormData | null>(null);
    const [isEditingMode, setIsEditingMode] = useState<boolean>(false);

    // --- DATA FETCHING ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [scoresResponse, handoversResponse, hierarchyResponse] = await Promise.all([
                    fetch("http://127.0.0.1:8000/scores/passed/level-1/"),
                    fetch("http://127.0.0.1:8000/handovers/"),
                    fetch("http://127.0.0.1:8000/hierarchy-simple/"),
                ]);

                if (!scoresResponse.ok) throw new Error("Scores API failed");
                if (!handoversResponse.ok) throw new Error("Handovers API failed");
                if (!hierarchyResponse.ok) throw new Error("Hierarchy API failed");

                const scoresData: ApiScoreData[] = await scoresResponse.json();
                const hierarchyData: HierarchyStructure[] = await hierarchyResponse.json();
                const handoversRawData = await handoversResponse.json();

                const validHandoverIds = handoversRawData.map((h: any) => {
                    const foundId = h.employee_id || h.emp_id || h.employee || h.id;
                    return foundId ? String(foundId) : "";
                }).filter((id: string) => id !== "");

                setEmployeesWithHandover(new Set(validHandoverIds));
                setScores(scoresData);
                setHierarchy(hierarchyData);
                setError(null);
            } catch (err) {
                if (err instanceof Error) setError(`Failed to fetch data: ${err.message}`);
                else setError("An unknown error occurred.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [refreshKey]);

    useEffect(() => {
        if (scores.length === 0) return;
        const fetchEmployeeDetails = async () => {
            const empIds = scores.map(score => score.employee_details.split("(").pop()?.replace(")", "")).filter(Boolean) as string[];
            const uniqueIds = Array.from(new Set(empIds));
            const promises = uniqueIds.map(id => fetch(`http://127.0.0.1:8000/mastertable-handover-details/${id}/`).then(res => res.ok ? res.json() : null));
            try {
                const results = await Promise.all(promises);
                const detailsMap: { [key: string]: EmployeeMasterData } = {};
                results.forEach(detail => { if (detail && detail.emp_id) { detailsMap[detail.emp_id] = detail; } });
                setEmployeeDetailsMap(detailsMap);
            } catch (error) { console.error("Failed to fetch some employee details:", error); }
        };
        fetchEmployeeDetails();
    }, [scores]);

    const uniqueMonths = useMemo(() => { const m = new Set<string>(); scores.forEach(s => m.add(s.created_at.substring(0, 7))); return Array.from(m).sort().reverse(); }, [scores]);
    useEffect(() => { if (uniqueMonths.length > 0 && !selectedMonth) { setSelectedMonth(uniqueMonths[0]); } }, [uniqueMonths, selectedMonth]);
    
    // --- FILTERING ---
    const baseFilteredEmployees = useMemo(() => { 
        let e = [...scores]; 
        if (selectedMonth && selectedMonth !== "all") { e = e.filter(emp => emp.created_at.startsWith(selectedMonth)); } 
        if (searchTerm.trim() !== "") { const l = searchTerm.toLowerCase(); e = e.filter(emp => emp.employee_details.toLowerCase().includes(l)); } 
        return e.sort((a, b) => b.percentage - a.percentage); 
    }, [scores, selectedMonth, searchTerm]);

    const pendingEmployees = useMemo(() => {
        return baseFilteredEmployees.filter(score => {
            const empId = score.employee_details.split("(").pop()?.replace(")", "");
            return empId && !employeesWithHandover.has(empId);
        });
    }, [baseFilteredEmployees, employeesWithHandover]);

    const completedEmployees = useMemo(() => {
        return baseFilteredEmployees.filter(score => {
            const empId = score.employee_details.split("(").pop()?.replace(")", "");
            return empId && employeesWithHandover.has(empId);
        });
    }, [baseFilteredEmployees, employeesWithHandover]);

    const displayList = activeTab === 'pending' ? pendingEmployees : completedEmployees;

    // --- MODAL OPEN LOGIC (UPDATED) ---
    const handleOpenModal = async (score: ApiScoreData) => {
        const empId = score?.employee_details?.split('(')?.pop()?.replace(')', '') || null;
        if (!empId) { alert("Error: Could not find a valid Employee ID."); return; }

        setIsModalOpen(true);
        setSelectedScore(score);
        setIsModalLoading(true);
        setModalError(null);
        setSelectedEmployeeDetails(null);
        setInitialFormData(null);

        try {
            const response = await fetch(`http://127.0.0.1:8000/mastertable-handover-details/${empId}/`);
            if (!response.ok) throw new Error("Failed to fetch employee details for handover");
            const data: EmployeeMasterData = await response.json();
            setSelectedEmployeeDetails(data);

            const handResp = await fetch(`http://127.0.0.1:8000/handovers/employee/${empId}/`);
            
            const baseFormData = { name: `${data.first_name} ${data.last_name}`, currentDepartment: data.department?.department_name || "N/A", currentLine: data.current_line?.line_name || "N/A", currentStation: data.current_station?.station_name || "N/A", handoverDate: new Date().toISOString().split("T")[0], industrialExperience: "", kpaplExperience: "", contractorName: "", pAndAName: "", qaHodName: "", isTrainingCompleted: "" as const, gojoInchargeName: "" };

            if (handResp.ok) {
                // EDIT MODE
                setIsEditingMode(true);
                const handData = await handResp.json();
                
                // IMPORTANT: Ensure type compatibility when searching
                const deptId = handData.distributed_department_after_dojo;
                let foundDeptName = "";
                
                if (deptId) { 
                    const targetDept = hierarchy
                        .flatMap(s => s.structure_data.departments)
                        .find(d => String(d.id) === String(deptId)); // Strict String Comparison
                    
                    if (targetDept) foundDeptName = targetDept.department_name;
                }

                setInitialFormData({ 
                    ...baseFormData, 
                    industrialExperience: handData.industrial_experience || "", 
                    kpaplExperience: handData.kpapl_experience || "", 
                    distributedDepartment: foundDeptName, 
                    selectedLineId: handData.allocated_line ? String(handData.allocated_line) : "", 
                    selectedStationId: handData.allocated_station ? String(handData.allocated_station) : "", 
                    handoverDate: handData.handover_date || baseFormData.handoverDate, 
                    contractorName: handData.contractor_name || "", 
                    pAndAName: handData.p_and_a_name || "", 
                    qaHodName: handData.qa_hod_name || "", 
                    isTrainingCompleted: handData.is_training_completed ? "yes" : "no", 
                    gojoInchargeName: handData.gojo_incharge_name || "" 
                });
            } else {
                // CREATE MODE
                setIsEditingMode(false);
                setInitialFormData({ ...baseFormData, distributedDepartment: "", selectedLineId: "", selectedStationId: "" });
            }
        } catch (err) {
            if (err instanceof Error) setModalError(err.message); else setModalError("An unknown error occurred.");
        } finally {
            setIsModalLoading(false);
        }
    };
    
    const handleCloseModal = () => { setIsModalOpen(false); setSelectedScore(null); setSelectedEmployeeDetails(null); setModalError(null); setInitialFormData(null); setIsEditingMode(false); };

    const handleFormSubmit = async (formData: HandoverFormData) => {
        if (!selectedEmployeeDetails) { alert("Error: Employee details not loaded."); return; }
        
        const payload = { 
            emp_id: selectedEmployeeDetails.emp_id, 
            industrial_experience: formData.industrialExperience, 
            kpapl_experience: formData.kpaplExperience, 
            required_department_at_handover: formData.currentDepartment, 
            distributed_department_name: formData.distributedDepartment, 
            line_id: formData.selectedLineId || null, 
            station_id: formData.selectedStationId || null, 
            handover_date: formData.handoverDate, 
            contractor_name: formData.contractorName, 
            p_and_a_name: formData.pAndAName, 
            qa_hod_name: formData.qaHodName, 
            is_training_completed: formData.isTrainingCompleted === 'yes', 
            gojo_incharge_name: formData.gojoInchargeName 
        };

        const url = isEditingMode 
            ? `http://127.0.0.1:8000/handovers/employee/${selectedEmployeeDetails.emp_id}/` 
            : "http://127.0.0.1:8000/handovers/";
            
        const method = isEditingMode ? "PUT" : "POST";
        
        try {
            const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            if (!response.ok) { const errorData = await response.json(); const errorMessage = Object.values(errorData).flat().join(" ") || `Server error`; throw new Error(errorMessage); }
            alert(`Handover form ${isEditingMode ? 'updated' : 'submitted'} successfully!`);
            handleCloseModal();
            setRefreshKey(prevKey => prevKey + 1);
        } catch (error) { if (error instanceof Error) alert(`Error: ${error.message}`); else alert("An unknown error occurred."); }
    };

    const formatDate = (dateString: string): string => new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const formatMonthForDisplay = (monthStr: string): string => { const [year, month] = monthStr.split("-"); return new Date(Number(year), Number(month) - 1).toLocaleString("en-US", { month: "long", year: "numeric" }); };
    const getScoreBarWidth = (percentage: number): string => `${percentage}%`;

    const styles: { [key: string]: React.CSSProperties } = { 
        container: { minHeight: "100vh", backgroundColor: "#ffffffff", padding: "40px 20px" }, 
        header: { textAlign: "center", marginBottom: "30px" }, 
        title: { fontSize: "32px", fontWeight: "800", background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "10px" }, 
        subtitle: { fontSize: "18px", color: "#6b7280", fontWeight: "400" }, 
        controlsContainer: { maxWidth: "1000px", margin: "0 auto 20px", display: "flex", gap: "20px", justifyContent: "space-between" }, 
        searchInput: { flex: 1, padding: "12px 16px", fontSize: "16px", border: "1px solid #e5e7eb", borderRadius: "12px", outline: "none", transition: "all 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }, 
        monthSelect: { padding: "12px 16px", fontSize: "16px", border: "1px solid #e5e7eb", borderRadius: "12px", backgroundColor: "white", cursor: "pointer", outline: "none", transition: "all 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }, 
        tabContainer: { maxWidth: "1000px", margin: "0 auto 30px", display: "flex", borderBottom: "1px solid #e5e7eb" }, 
        tabButton: { flex: 1, padding: "15px", border: "none", background: "none", fontSize: "16px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s", color: "#6b7280", borderBottom: "3px solid transparent", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }, 
        activeTab: { color: "#2563eb", borderBottom: "3px solid #2563eb" }, 
        tabCount: { fontSize: "12px", padding: "2px 8px", borderRadius: "10px", backgroundColor: "#f3f4f6", color: "#6b7280" }, 
        activeTabCount: { backgroundColor: "#dbeafe", color: "#1e40af" }, 
        resultsContainer: { maxWidth: "1000px", margin: "0 auto" }, 
        noResults: { textAlign: "center", padding: "60px", backgroundColor: "#ffffff", borderRadius: "16px", color: "#6b7280", fontSize: "18px", boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb" }, 
        resultCard: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "30px", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)", border: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: "25px", transition: "all 0.3s ease" }, 
        resultCardHover: { boxShadow: "0 10px 25px rgba(124, 58, 237, 0.1)", borderColor: "#e0e7ff", transform: "translateY(-2px)" }, 
        rankCircle: { width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "700", flexShrink: 0, boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)" }, 
        rankCircleGray: { width: "56px", height: "56px", borderRadius: "50%", background: "#9ca3af", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "700", flexShrink: 0 }, 
        mainInfo: { flex: 1 }, 
        name: { fontSize: "20px", fontWeight: "700", color: "#1f2937", marginBottom: "8px" }, 
        details: { display: "flex", gap: "15px", color: "#6b7280", fontSize: "14px", marginBottom: "15px", flexWrap: "wrap", alignItems: "center" }, 
        scoreSection: { marginTop: "15px" }, 
        scoreBar: { width: "100%", height: "10px", backgroundColor: "#f3f4f6", borderRadius: "10px", overflow: "hidden", marginBottom: "8px" }, 
        scoreProgress: { height: "100%", background: "linear-gradient(90deg, #7c3aed 0%, #2563eb 100%)", borderRadius: "10px", transition: "width 1s ease", boxShadow: "0 2px 4px rgba(124, 58, 237, 0.2)" }, 
        scoreText: { display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#6b7280" }, 
        badge: { display: "inline-block", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", backgroundColor: "#f3f4f6", color: "#4b5563", border: "1px solid #e5e7eb" }, 
        statusPill: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", backgroundColor: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" }, 
        detailsButton: { padding: "10px 20px", fontSize: "14px", fontWeight: "600", color: "#ffffff", background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)", border: "none", borderRadius: "10px", cursor: "pointer", transition: "all 0.2s ease", boxShadow: "0 4px 10px rgba(124, 58, 237, 0.2)" }, 
        editButton: { background: "#ffffff", color: "#4b5563", border: "1px solid #d1d5db", boxShadow: "none" }, 
        handoverSubmittedBadge: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", backgroundColor: "#dbeafe", color: "#1e40af", border: "1px solid #bfdbfe" } 
    };
    
    if (loading) return <div style={{ ...styles.container, textAlign: "center", fontSize: "20px" }}>Loading...</div>;
    if (error) return <div style={{ ...styles.container, textAlign: "center", fontSize: "20px", color: "red" }}>Error: {error}</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}><h1 style={styles.title}>Level 1 Assessment Outcomes</h1><p style={styles.subtitle}>Manage employee handover and allocation</p></div>
            <div style={styles.controlsContainer}><input type="text" placeholder="Search by Employee ID or Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} /><select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={styles.monthSelect}><option value="all">All Months</option>{uniqueMonths.map((month) => (<option key={month} value={month}>{formatMonthForDisplay(month)}</option>))}</select></div>
            <div style={styles.tabContainer}>
                <button style={{...styles.tabButton, ...(activeTab === 'pending' ? styles.activeTab : {})}} onClick={() => setActiveTab('pending')}>Pending Actions <span style={{...styles.tabCount, ...(activeTab === 'pending' ? styles.activeTabCount : {})}}>{pendingEmployees.length}</span></button>
                <button style={{...styles.tabButton, ...(activeTab === 'completed' ? styles.activeTab : {})}} onClick={() => setActiveTab('completed')}>Handover Completed <span style={{...styles.tabCount, ...(activeTab === 'completed' ? styles.activeTabCount : {})}}>{completedEmployees.length}</span></button>
            </div>
            <div style={styles.resultsContainer}>
                {displayList.length > 0 ? (
                    displayList.map((score, index) => {
                        const empId = score.employee_details.split("(").pop()?.replace(")", "") || null;
                        const details = empId ? employeeDetailsMap[empId] : null;
                        const isPending = activeTab === 'pending';
                        return (
                            <div key={score.id} style={{ ...styles.resultCard, ...(hoveredCard === score.id ? styles.resultCardHover : {}) }} onMouseEnter={() => setHoveredCard(score.id)} onMouseLeave={() => setHoveredCard(null)}>
                                <div style={isPending ? styles.rankCircle : styles.rankCircleGray}>{index + 1}</div>
                                <div style={styles.mainInfo}>
                                    <h3 style={styles.name}>{score.employee_details}</h3>
                                    <div style={styles.details}>
                                        <span style={styles.badge}>Dept: {details?.department?.department_name || '...'}</span>
                                        <span>•</span>
                                        <span style={styles.badge}>Current: {details?.current_line?.line_name || 'N/A'} / {details?.current_station?.station_name || 'N/A'}</span>
                                    </div>
                                    <div style={styles.details}><span style={styles.badge}>{score.skill_name}</span><span>•</span><span>{formatDate(score.created_at)}</span><span>•</span><span style={styles.statusPill}><span>✓</span><span>Passed</span></span>{!isPending && (<><span>•</span><span style={styles.handoverSubmittedBadge}><span>✓</span><span>Handover Submitted</span></span></>)}</div>
                                    <div style={styles.scoreSection}><div style={styles.scoreBar}><div style={{ ...styles.scoreProgress, width: getScoreBarWidth(score.percentage) }} /></div><div style={styles.scoreText}><span style={{ fontWeight: "600", color: "#4b5563" }}>Score: {score.percentage.toFixed(1)}%</span></div></div>
                                </div>
                                <button style={{ ...styles.detailsButton, ...(!isPending ? styles.editButton : {}) }} onClick={() => handleOpenModal(score)}>{isPending ? "Create Handover" : "Edit Details"}</button>
                            </div>
                        );
                    })
                ) : (
                    <div style={styles.noResults}><p>{activeTab === 'pending' ? "All caught up! No pending handovers for this selection." : "No completed handovers found for this selection."}</p></div>
                )}
            </div>
            {isModalOpen && selectedScore && ( <HandOverFormModal scoreData={selectedScore} hierarchy={hierarchy} onClose={handleCloseModal} onSubmit={handleFormSubmit} isLoading={isModalLoading} error={modalError} employeeDetails={selectedEmployeeDetails} initialFormData={initialFormData} isEditing={isEditingMode} /> )}
        </div>
    );
};

export default HandOverSheet;