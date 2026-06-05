// src/components/ExamResultsDashboard.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 1. Define the TypeScript type for a single result, matching your JSON structure
type ShokuchouExamResult = {
  id: number;
  employee: {
    // id: number;
    // pay_code: string;
    // name: string;
    // department: string;
    // section: string;
    emp_id: string;
    first_name: string;
    last_name: string;
    department: number;
    department_name: string;
    date_of_joining: string;
    birth_date: string;
    sex: string;
    email: string;
    phone: string;
  };
  sho_exam_name: string;
  sho_started_at: string;
  sho_submitted_at: string;
  sho_total_questions: number;
  sho_score: number;
  sho_duration_seconds: number | null;
  sho_pass_mark_percent: number;
  sho_passed: boolean;
  sho_remarks: string;
  sho_percentage: number; // comes from @property
};

// 2. The main component
const ShokuchouExamResult: React.FC = () => {
  const [results, setResults] = useState<ShokuchouExamResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This function fetches all the results from your API
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        // IMPORTANT: Add authentication headers if your endpoint is protected
        const token = localStorage.getItem('authToken');
        const headers = token ? { 'Authorization': `Token ${token}` } : {};
        
        const response = await axios.get<ShokuchouExamResult[]>(
          'http://127.0.0.1:8000/shokuchou/results/', // Your API endpoint
          { headers }
        );
        setResults(response.data);
      } catch (err) {
        console.error("Failed to fetch exam results:", err);
        setError("Could not load exam results. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []); // Empty dependency array means this runs once when the component mounts

  // --- Render Logic ---
  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-500">Loading Results...</div>
        </div>
    );
  }

  if (error) {
    return <div className="text-center p-10 text-red-600 bg-red-100 rounded-lg">{error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Shokuchou Exam Results Dashboard
        </h1>
        <p className="mt-1 text-md text-gray-600">
          A summary of all completed exam attempts.
        </p>
      </div>
      
      {results.length === 0 ? (
        <div className="text-center bg-white p-10 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-700">No Results Found</h3>
            <p className="text-gray-500 mt-2">There are no submitted exam results to display yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 3. Map over the results and render the card JSX directly inside */}
          {results.map((result) => {
            // Helper to format the date for each result
            const formattedDate = new Date(result.sho_submitted_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return (
              // This is the JSX from the old ResultCard component, now inside the map
              <div key={result.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden transition-shadow hover:shadow-xl">
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    {/* Employee Details Section */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {/* {result.employee.name.trim()} */}
                        {`${result.employee.first_name} ${result.employee.last_name}`}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {/* Pay Code: {result.employee.pay_code.trim()} */}
                          Emp ID: {result.employee.emp_id}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {/* {result.employee.department} / {result.employee.section} */}
                          {result.employee.department_name}
                      </p>
                    </div>

                    {/* Pass/Fail Badge Section */}
                    <div
                      className={`px-3 py-1 text-sm font-bold rounded-full ${
                        result.sho_passed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {result.sho_passed ? 'PASSED' : 'FAILED'}
                    </div>
                  </div>
                </div>

                {/* Exam Stats Footer */}
                <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-between items-center text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Score: </span>
                    <span>{result.sho_score} / {result.sho_total_questions}</span>
                  </div>
                  <div className="text-center">
                    <span className="font-semibold text-gray-700">Percentage: </span>
                    <span className={`font-bold ${result.sho_passed ? 'text-green-600' : 'text-red-600'}`}>
                      {result.sho_percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Date: </span>
                    <span>{formattedDate}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShokuchouExamResult;