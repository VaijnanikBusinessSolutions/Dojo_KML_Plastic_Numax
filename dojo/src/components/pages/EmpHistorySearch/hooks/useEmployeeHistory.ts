// src/components/pages/EmployeeHistorySearch/hooks/useEmployeeHistory.ts
import { useState, useMemo } from "react";
import type { MasterEmployee, EmployeeCardDetails, Attendance, ExamResult } from "../types";
// IMPORT THE MOCK DATA
import { mockEmployeeList, mockEmployeeDetails } from "../mockData";

// ★★★ THIS IS THE SWITCH ★★★
// Set this to true to use local mock data, false to use the real API
const USE_MOCK_DATA = false;

const simulateNetworkDelay = (duration: number) => new Promise(resolve => setTimeout(resolve, duration));

export const useEmployeeHistory = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [filteredEmployees, setFilteredEmployees] = useState<MasterEmployee[]>([]);
	const [employeeDetails, setEmployeeDetails] = useState<EmployeeCardDetails | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	// const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
	// 	const term = e.target.value;
	// 	setSearchTerm(term);
	// 	setEmployeeDetails(null);

	// 	if (term.trim().length < 2) {
	// 		setFilteredEmployees([]);
	// 		setError(term.length ? "Type at least 2 characters" : "");
	// 		return;
	// 	}

	// 	setIsLoading(true);
	// 	setError("");

    //     if (USE_MOCK_DATA) {
    //         // --- MOCK LOGIC ---
    //         await simulateNetworkDelay(500); // Simulate network latency
    //         const q = term.toLowerCase();
	// 		const filtered = mockEmployeeList.filter((emp) => {
	// 			const fullName = `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim().toLowerCase();
	// 			return fullName.includes(q) || emp.emp_id.toLowerCase().includes(q);
	// 		});
    //         setFilteredEmployees(filtered);
    //         if (filtered.length === 0) {
    //             setError("No matching employees found");
    //         }
    //         setIsLoading(false);
    //     } else {
    //         // --- REAL API LOGIC ---
    //         try {
    //             const response = await fetch(`http://172.25.0.51:8000/mastertable/`, {
    //                 headers: { Accept: "application/json" },
    //             });
    //             if (!response.ok) throw new Error("Error fetching employees");

    //             const raw = await response.json();
    //             const list: MasterEmployee[] = Array.isArray(raw) ? raw : (raw.results ?? []);
    //             const q = term.toLowerCase();
    //             const filtered = list.filter((emp) => {
    //                 const fullName = `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim().toLowerCase();
    //                 return fullName.includes(q) || emp.emp_id.includes(q);
    //             });

    //             setFilteredEmployees(filtered);
    //             if (filtered.length === 0) {
    //                 setError("No matching employees found");
    //             }
    //         } catch (err) {
    //             setError("Error fetching employees");
    //             setFilteredEmployees([]);
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     }
	// };

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const term = e.target.value;
		setSearchTerm(term);
		setEmployeeDetails(null);

		if (term.trim().length < 2) {
			setFilteredEmployees([]);
			setError(term.length ? "Type at least 2 characters" : "");
			return;
		}

		setIsLoading(true);
		setError("");

        if (USE_MOCK_DATA) {
            // --- MOCK LOGIC ---
            await simulateNetworkDelay(500); 
            const q = term.toLowerCase();
			const filtered = mockEmployeeList.filter((emp) => {
				const fullName = `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim().toLowerCase();
				
                // ★★★ FIX 1: Convert emp_id to String() before checking ★★★
                const empId = String(emp.emp_id).toLowerCase();
				
                return fullName.includes(q) || empId.includes(q);
			});
            setFilteredEmployees(filtered);
            if (filtered.length === 0) {
                setError("No matching employees found");
            }
            setIsLoading(false);
        } else {
            // --- REAL API LOGIC ---
            try {
                const response = await fetch(`http://172.25.0.51:8000/mastertable/`, {
                    headers: { Accept: "application/json" },
                });
                if (!response.ok) throw new Error("Error fetching employees");

                const raw = await response.json();
                const list: MasterEmployee[] = Array.isArray(raw) ? raw : (raw.results ?? []);
                
                const q = term.toLowerCase();
                const filtered = list.filter((emp) => {
                    const fullName = `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim().toLowerCase();
                    
                    // ★★★ FIX 2: Convert emp_id to String() before checking ★★★
                    // This ensures it works even if the DB sends numbers (e.g., 1001)
                    const empId = String(emp.emp_id).toLowerCase();

                    return fullName.includes(q) || empId.includes(q);
                });

                setFilteredEmployees(filtered);
                if (filtered.length === 0) {
                    setError("No matching employees found");
                }
            } catch (err) {
                console.error(err); // Good for debugging
                setError("Error fetching employees");
                setFilteredEmployees([]);
            } finally {
                setIsLoading(false);
            }
        }
	};


	const handleEmployeeSelect = async (employee: MasterEmployee) => {
		setIsLoading(true);
		setError("");
		const displayName = [employee.first_name, employee.last_name].filter(Boolean).join(" ");
		setSearchTerm(displayName || employee.emp_id);
		setFilteredEmployees([]);

        if (USE_MOCK_DATA) {
            // --- MOCK LOGIC ---
            await simulateNetworkDelay(800);
            // In a real mock, you might have different details for different employees.
            // For this example, we always return the same detailed profile.
            setEmployeeDetails(mockEmployeeDetails);
            setIsLoading(false);
        } else {
            // --- REAL API LOGIC ---
            try {
                const response = await fetch(
                    `http://172.25.0.51:8000/employee-card-details/?card_no=${employee.emp_id}`
                );
                if (!response.ok) throw new Error("Error fetching employee details");
                
                const data = await response.json();
                setEmployeeDetails(data);
            } catch (err) {
                setError("Error fetching employee details");
                setEmployeeDetails(null);
            } finally {
                setIsLoading(false);
            }
        }
	};

	const attendanceByBatch = useMemo(() => {
		if (!employeeDetails?.attendance) return {};
		return employeeDetails.attendance.reduce((acc, record) => {
			const batchId = record.batch;
			if (!acc[batchId]) acc[batchId] = [];
			acc[batchId].push(record);
			acc[batchId].sort((a, b) => a.day_number - b.day_number);
			return acc;
		}, {} as Record<string, Attendance[]>);
	}, [employeeDetails?.attendance]);

	const allExamResults = useMemo((): ExamResult[] => {
		if (!employeeDetails) return [];
		const hanchou = employeeDetails.hanchou_results.map(r => ({ ...r, type: 'hanchou' as const }));
		const shokuchou = employeeDetails.shokuchou_results.map(r => ({ ...r, type: 'shokuchou' as const }));
		return [...hanchou, ...shokuchou].sort(
			(a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
		);
	}, [employeeDetails]);

	return {
		searchTerm,
		filteredEmployees,
		employeeDetails,
		isLoading,
		error,
		handleSearch,
		handleEmployeeSelect,
		attendanceByBatch,
		allExamResults,
	};
};





// //This custom hook encapsulates all state management and data fetching logic.


// // src/components/pages/EmployeeHistorySearch/hooks/useEmployeeHistory.ts
// import { useState, useMemo } from "react";
// // import { MasterEmployee, EmployeeCardDetails, Attendance, ExamResult } from "../types";
// import type { MasterEmployee, EmployeeCardDetails, Attendance, ExamResult } from "../types";

// export const useEmployeeHistory = () => {
// 	const [searchTerm, setSearchTerm] = useState("");
// 	const [filteredEmployees, setFilteredEmployees] = useState<MasterEmployee[]>([]);
// 	const [employeeDetails, setEmployeeDetails] = useState<EmployeeCardDetails | null>(null);
// 	const [isLoading, setIsLoading] = useState(false);
// 	const [error, setError] = useState("");

// 	const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
// 		const term = e.target.value;
// 		setSearchTerm(term);
// 		setEmployeeDetails(null);

// 		if (term.trim().length < 2) {
// 			setFilteredEmployees([]);
// 			setError(term.length ? "Type at least 2 characters" : "");
// 			return;
// 		}

// 		try {
// 			setIsLoading(true);
// 			setError("");
// 			const response = await fetch(`http://172.25.0.51:8000/mastertable/`, {
// 				headers: { Accept: "application/json" },
// 			});
// 			if (!response.ok) throw new Error("Error fetching employees");

// 			const raw = await response.json();
// 			const list: MasterEmployee[] = Array.isArray(raw) ? raw : (raw.results ?? []);
// 			const q = term.toLowerCase();
// 			const filtered = list.filter((emp) => {
// 				const fullName = `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim().toLowerCase();
// 				return fullName.includes(q) || emp.emp_id.includes(q);
// 			});

// 			setFilteredEmployees(filtered);
// 			if (filtered.length === 0) {
// 				setError("No matching employees found");
// 			}
// 		} catch (err) {
// 			setError("Error fetching employees");
// 			setFilteredEmployees([]);
// 		} finally {
// 			setIsLoading(false);
// 		}
// 	};

// 	const handleEmployeeSelect = async (employee: MasterEmployee) => {
// 		setIsLoading(true);
// 		setError("");
// 		const displayName = [employee.first_name, employee.last_name].filter(Boolean).join(" ");
// 		setSearchTerm(displayName || employee.emp_id);
// 		setFilteredEmployees([]);

// 		try {
// 			const response = await fetch(
// 				`http://172.25.0.51:8000/employee-card-details/?card_no=${employee.emp_id}`
// 			);
// 			if (!response.ok) throw new Error("Error fetching employee details");
			
// 			const data = await response.json();
// 			setEmployeeDetails(data);
// 		} catch (err) {
// 			setError("Error fetching employee details");
// 			setEmployeeDetails(null);
// 		} finally {
// 			setIsLoading(false);
// 		}
// 	};

// 	const attendanceByBatch = useMemo(() => {
// 		if (!employeeDetails?.attendance) return {};
// 		return employeeDetails.attendance.reduce((acc, record) => {
// 			const batchId = record.batch;
// 			if (!acc[batchId]) acc[batchId] = [];
// 			acc[batchId].push(record);
// 			acc[batchId].sort((a, b) => a.day_number - b.day_number);
// 			return acc;
// 		}, {} as Record<string, Attendance[]>);
// 	}, [employeeDetails?.attendance]);

// 	const allExamResults = useMemo((): ExamResult[] => {
// 		if (!employeeDetails) return [];
// 		const hanchou = employeeDetails.hanchou_results.map(r => ({ ...r, type: 'hanchou' as const }));
// 		const shokuchou = employeeDetails.shokuchou_results.map(r => ({ ...r, type: 'shokuchou' as const }));
// 		return [...hanchou, ...shokuchou].sort(
// 			(a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
// 		);
// 	}, [employeeDetails]);

// 	return {
// 		searchTerm,
// 		filteredEmployees,
// 		employeeDetails,
// 		isLoading,
// 		error,
// 		handleSearch,
// 		handleEmployeeSelect,
// 		attendanceByBatch,
// 		allExamResults,
// 	};
// };