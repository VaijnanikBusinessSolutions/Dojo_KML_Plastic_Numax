import React, { useState, type ChangeEvent } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/shokuchou-questions/bulk-upload/';
const DOWNLOAD_TEMPLATE_URL = 'http://127.0.0.1:8000/shokuchou-questions/download-template/';

// --- ICONS ---
const UploadIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>);
const SuccessIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const ErrorIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);

// --- TYPE DEFINITIONS ---
interface UploadResult {
    status: string;
    created_count: number;
    error_count: number;
    errors: { row: number; errors: any }[];
    detail?: string; // For general server errors
}

interface BulkUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadSuccess: () => void;
}

const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ isOpen, onClose, onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'result'>('idle');
    const [result, setResult] = useState<UploadResult | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };
    
    const resetState = () => {
        setSelectedFile(null);
        setUploadState('idle');
        setResult(null);
    };
    
    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploadState('uploading');
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await axios.post<UploadResult>(API_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setResult(response.data);
            setUploadState('result');
            if (response.data.created_count > 0) {
              onUploadSuccess(); // Refresh the list in the parent component
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                setResult({ status: 'Upload Failed', created_count: 0, error_count: 1, errors: [], detail: error.response.data.detail });
            } else {
                setResult({ status: 'Upload Failed', created_count: 0, error_count: 1, errors: [], detail: 'An unknown error occurred.' });
            }
            setUploadState('result');
        }
    };

    if (!isOpen) return null;
    
    const renderErrorDetails = (errorData: any) => {
        if (typeof errorData === 'string') return errorData;
        if (Array.isArray(errorData)) return errorData.join(', ');
        if (typeof errorData === 'object' && errorData !== null) {
            return Object.entries(errorData)
              .map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`)
              .join('; ');
        }
        return 'Invalid data.';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Bulk Upload Questions</h2>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-800">&times;</button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {uploadState === 'idle' && (
                        <>
                            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg mb-6">
                                <h3 className="font-bold mb-2">Instructions</h3>
                                <ol className="list-decimal list-inside space-y-1 text-sm">
                                    <li>Download the required Excel template. Do not change the column headers.</li>
                                    <li>The file must contain a sheet named "Questions".</li>
                                    <li>Fill in your questions, ensuring the 'sho_correct_answer' matches one of the options exactly.</li>
                                    <li>Upload the completed file below.</li>
                                </ol>
                                <a href={DOWNLOAD_TEMPLATE_URL} 
                                    className="text-blue-600 hover:text-blue-800 font-semibold mt-3 inline-block">
                                    Download Template
                                </a>
                            </div>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                <UploadIcon />
                                <input type="file" id="file-upload" accept=".xlsx, .xls" onChange={handleFileChange} className="hidden" />
                                <label htmlFor="file-upload" className="mt-4 cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    Select Excel File
                                </label>
                                {selectedFile && <p className="mt-2 text-sm text-gray-500">{selectedFile.name}</p>}
                            </div>
                        </>
                    )}
                    {uploadState === 'uploading' && (
                        <div className="text-center py-12">
                            <p className="text-lg font-semibold text-gray-700">Uploading and processing...</p>
                            <p className="text-gray-500">Please wait.</p>
                        </div>
                    )}
                    {uploadState === 'result' && result && (
                        <div className="text-center">
                            {result.error_count === 0 && !result.detail ? <SuccessIcon /> : <ErrorIcon />}
                            <h3 className="text-2xl font-bold mt-4">
                                {result.detail ? "Upload Failed" : "Upload Complete"}
                            </h3>
                            <p className="text-gray-600 mt-2">{result.detail || result.status}</p>

                            <div className="flex justify-center gap-4 my-6 text-lg">
                                <span className="text-green-600 font-semibold">Created: {result.created_count}</span>
                                <span className="text-red-600 font-semibold">Errors: {result.error_count}</span>
                            </div>

                            {result.errors && result.errors.length > 0 && (
                                <div className="text-left mt-4 border-t pt-4">
                                    <h4 className="font-bold mb-2">Error Details:</h4>
                                    <ul className="space-y-2 bg-gray-50 p-3 rounded-md max-h-60 overflow-y-auto">
                                        {result.errors.map((err, index) => (
                                            <li key={index} className="text-sm border-b pb-1">
                                                <span className="font-bold text-red-700">Row {err.row}:</span> 
                                                <span className="text-gray-700 ml-2">{renderErrorDetails(err.errors)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-end items-center p-4 border-t gap-3 bg-gray-50 rounded-b-lg">
                    {uploadState === 'idle' ? (
                        <>
                           <button onClick={handleClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                           <button onClick={handleUpload} disabled={!selectedFile} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                               Upload File
                           </button>
                        </>
                    ) : (
                         <button onClick={resetState} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                           Upload Another File
                         </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkUploadModal;