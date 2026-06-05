import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Table, CheckCircle, XCircle, Users, Target, BookOpen, Loader2 } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000';

interface QuestionHeader {
    id: number;
    text_preview: string;
    correct_index: number;
}

interface QuestionResult {
    is_correct: boolean;
    submitted_ans_index: number;
}

interface EmployeeResult {
    employee_id: string;
    employee_name: string;
    score_id: number;
    overall_marks: number;
    overall_percentage: number;
    question_results: QuestionResult[];
}

interface MatrixData {
    level_id: number;
    station_id: number;
    question_paper_name: string;
    question_headers: QuestionHeader[];
    employee_results: EmployeeResult[];
}

interface LocationState {
    levelId: number;
    stationId: number;
    levelName: string; // Passed from the selection page
    stationName: string; // Passed from the selection page
}

const ResultsMatrixView: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LocationState;

    const [matrixData, setMatrixData] = useState<MatrixData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const levelId = state?.levelId;
    const stationId = state?.stationId;

    useEffect(() => {
        if (!levelId || !stationId) {
            setError('Missing Level or Station ID in navigation state.');
            setLoading(false);
            return;
        }

        const fetchMatrixData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`${API_BASE_URL}/api/results/matrix/${levelId}/${stationId}/`);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `Failed to fetch matrix: ${response.status}`);
                }

                const data: MatrixData = await response.json();
                setMatrixData(data);

            } catch (err) {
                console.error('Error fetching matrix data:', err);
                setError(`Failed to load matrix: ${err instanceof Error ? err.message : 'Unknown error'}`);
            } finally {
                setLoading(false);
            }
        };

        fetchMatrixData();
    }, [levelId, stationId]);

    const handleViewIndividualSheet = (scoreId: number) => {
        navigate(`/answersheet/${scoreId}`, {
            state: {
                // You can optionally pass employee name/id here if you retrieved it from the matrix data
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-lg font-medium text-gray-600 ml-3">Building Matrix...</p>
            </div>
        );
    }

    if (error || !matrixData || matrixData.employee_results.length === 0) {
        return (
            <div className="min-h-screen p-8 bg-gray-50">
                <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-xl p-6 mt-10">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error or No Data</h2>
                    <p className="text-gray-700">{error || 'No employee results found for this Level and Station configuration.'}</p>
                    <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-6 border-b pb-4">
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                        <Table className="w-7 h-7 text-indigo-600" />
                        Skill Gap Matrix
                    </h1>
                    <p className="text-lg text-gray-600 mt-1">
                        Results for: 
                        <span className="font-semibold text-blue-700 ml-2">{state.levelName || `Level ${levelId}`}</span> | 
                        <span className="font-semibold text-green-700 ml-2">{state.stationName || `Station ${stationId}`}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Question Paper: {matrixData.question_paper_name}</p>
                </header>

                <div className="overflow-x-auto bg-white shadow-xl rounded-xl border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[200px]">
                                    <Users className="w-4 h-4 inline mr-2"/> Employee
                                </th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    % Score
                                </th>
                                {matrixData.question_headers.map((q, index) => (
                                    <th key={q.id} scope="col" className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[100px]">
                                        <div title={q.text_preview} className="cursor-help flex justify-center items-center">
                                            <Target className="w-3 h-3 text-indigo-400 mr-1"/> Q{index + 1}
                                        </div>
                                    </th>
                                ))}
                                <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    <BookOpen className="w-4 h-4 inline mr-1"/> Sheet
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {matrixData.employee_results.map((emp, empIndex) => (
                                <tr key={emp.employee_id} className="hover:bg-blue-50 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {emp.employee_name} ({emp.employee_id})
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-bold" style={{ color: emp.overall_percentage >= 80 ? '#059669' : emp.overall_percentage >= 50 ? '#f59e0b' : '#ef4444' }}>
                                        {emp.overall_percentage.toFixed(1)}%
                                    </td>
                                    {emp.question_results.map((qResult, qIndex) => (
                                        <td key={qIndex} className="px-4 py-3 whitespace-nowrap text-center">
                                            {qResult.is_correct ? (
                                                <CheckCircle className="w-5 h-5 text-green-500 mx-auto" title="Correct" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-500 mx-auto" title="Incorrect or Unanswered" />
                                            )}
                                        </td>
                                    ))}
                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                        {emp.score_id ? (
                                            <button 
                                                onClick={() => handleViewIndividualSheet(emp.score_id)}
                                                className="text-indigo-600 hover:text-indigo-900 text-xs font-medium"
                                            >
                                                View Sheet
                                            </button>
                                        ) : (
                                            <span className="text-gray-400 text-xs">N/A</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-6 text-right">
                    <button onClick={() => navigate(-1)} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResultsMatrixView;