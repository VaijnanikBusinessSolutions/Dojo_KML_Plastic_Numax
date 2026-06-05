import { useState, useEffect } from 'react';
import { Target, TrendingUp } from 'lucide-react';
import { ojtApi } from '../../hooks/ServiceApis';


type AssessmentMode = 'quality' | 'quantity';

const OJTAssessmentToggle = () => {
    const [assessmentMode, setAssessmentMode] = useState<AssessmentMode>('quality');
    const [loading, setLoading] = useState<boolean>(false);

    // Fetch current mode on component mount
    useEffect(() => {
        fetchCurrentMode();
    }, []);

    const fetchCurrentMode = async (): Promise<void> => {
        try {
            const data = await ojtApi.getAssessmentMode();
            setAssessmentMode(data.mode);
        } catch (error) {
            console.error('Error fetching assessment mode:', error);
        }
    };

    const handleAssessmentModeChange = async (newMode: AssessmentMode) => {
        if (newMode === assessmentMode) return;
        
        setLoading(true);
        try {
            const data = await ojtApi.toggleAssessmentMode(newMode);
            setAssessmentMode(data.mode);
            console.log(data.message);
        } catch (error) {
            console.error('Error updating assessment mode:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-green-100">
            <h1 className="text-3xl font-bold mb-6">OJT Assessment Mode Switch</h1>
            
            {loading && (
                <div className="mb-4 text-sm text-gray-600">
                    Switching mode...
                </div>
            )}

            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full p-2 border border-gray-300 shadow-md">
                <button
                    onClick={() => handleAssessmentModeChange("quality")}
                    disabled={loading}
                    className={`px-6 py-3 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                        assessmentMode === "quality"
                            ? "bg-white text-blue-600 shadow-lg transform scale-105"
                            : "text-gray-600 hover:text-gray-900 hover:bg-white/10"
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <Target className="w-4 h-4" />
                    Quality-Based
                </button>

                <button
                    onClick={() => handleAssessmentModeChange("quantity")}
                    disabled={loading}
                    className={`px-6 py-3 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                        assessmentMode === "quantity"
                            ? "bg-white text-green-600 shadow-lg transform scale-105"
                            : "text-gray-600 hover:text-gray-900 hover:bg-white/10"
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <TrendingUp className="w-4 h-4" />
                    Quantity-Based
                </button>
            </div>

     
         
        </div>
    );
};

export default OJTAssessmentToggle;