import React, { useState, useEffect, type ChangeEvent } from 'react';
import axios from 'axios';

// --- API URLs ---
const BASE_API_URL = 'http://172.25.0.51:8000';
const UPLOAD_API_URL = `${BASE_API_URL}/template-questions/bulk-upload/`;
const DOWNLOAD_TEMPLATE_URL = `${BASE_API_URL}/template-questions/download-template/`;
const QUESTION_PAPER_DETAIL_URL = `${BASE_API_URL}/questionpapers/`;

// --- TYPE DEFINITIONS ---
interface UploadResult {
  status: string;
  created_count: number;
  error_count: number;
  errors: { row: number; errors: any }[];
  detail?: string;
}

interface RelName {
  id: number;
  name: string;
}

interface QuestionPaperDetails {
  id: number;
  question_paper_name: string;
  department: RelName;
  line: RelName;
  subline: RelName;
  station: RelName;
  level: RelName;
}

interface TemplateQuestionBulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  questionPaperId: number;
}

const TemplateQuestionBulkUploadModal: React.FC<TemplateQuestionBulkUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  questionPaperId,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'result'>('idle');
  const [result, setResult] = useState<UploadResult | null>(null);
  const [paperDetails, setPaperDetails] = useState<QuestionPaperDetails | null>(null);

  useEffect(() => {
    if (isOpen && questionPaperId) {
      axios
        .get<QuestionPaperDetails>(`${QUESTION_PAPER_DETAIL_URL}${questionPaperId}/`)
        .then((res) => setPaperDetails(res.data))
        .catch((err) => console.error('Failed to fetch question paper details', err));
    }
  }, [isOpen, questionPaperId]);

  const buildDownloadUrl = () => {
    return `${DOWNLOAD_TEMPLATE_URL}?question_paper_id=${questionPaperId}`;
  };

  const formatErrorObject = (errors: any): string => {
    if (typeof errors === 'string') {
      return errors;
    }
    return Object.entries(errors)
      .map(([field, messages]) => {
        const messageStr = Array.isArray(messages) ? messages.join(', ') : String(messages);
        return `${field}: ${messageStr}`;
      })
      .join(' | ');
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      console.log('Excel file selected:', e.target.files[0].name);
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
    if (!selectedFile || !questionPaperId) return;
    
    console.log('=== STARTING UPLOAD ===');
    console.log('Excel file:', selectedFile.name);
    
    setUploadState('uploading');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('question_paper_id', String(questionPaperId));

    console.log('FormData created with Excel file only (images are embedded)');

    try {
      const response = await axios.post<UploadResult>(UPLOAD_API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      console.log('Upload response:', response.data);
      setResult(response.data);
      
      if (response.data.created_count > 0) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data as UploadResult;
        if (errorData.status && errorData.errors) {
          setResult(errorData);
        } else {
          const detail = (errorData as any)?.detail || 'An unexpected error occurred during upload.';
          setResult({
            status: 'Upload Failed',
            created_count: 0,
            error_count: 1,
            errors: [],
            detail,
          });
        }
      } else {
        setResult({
          status: 'Upload Failed',
          created_count: 0,
          error_count: 1,
          errors: [],
          detail: 'A network error occurred. Please check your connection.',
        });
      }
    } finally {
      setUploadState('result');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Bulk Upload Template Questions</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-800 text-3xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {uploadState === 'idle' && (
            <>
              <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg mb-6">
                <h3 className="font-bold mb-2">Instructions for: {paperDetails?.question_paper_name}</h3>

                {paperDetails && (
                  <p className="text-sm mb-3">
                    <b>Level:</b> {paperDetails.level?.name} | <b>Department:</b> {paperDetails.department?.name} | <b>Line:</b> {paperDetails.line?.name} | <b>Subline:</b> {paperDetails.subline?.name} | <b>Station:</b> {paperDetails.station?.name}
                  </p>
                )}

                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li><b>Download the template</b> below - it has all the required columns</li>
                  <li><b>Fill in your questions:</b>
                    <ul className="ml-6 mt-1 space-y-1 list-disc">
                      <li>Type question text in the "Question" column</li>
                      <li>Type option text in "Option A", "Option B", etc.</li>
                      <li>Enter correct answer (must match one of the options)</li>
                    </ul>
                  </li>
                  <li><b>Add images directly in Excel:</b>
                    <ul className="ml-6 mt-1 space-y-1 list-disc">
                      <li>Right-click on any "*_image" cell (e.g., "Option A Image")</li>
                      <li>Select <b>Insert → Pictures</b></li>
                      <li>Choose image from your computer</li>
                      <li>Resize if needed by dragging corners</li>
                    </ul>
                  </li>
                  <li><b>You can mix text and images</b> - some options can be text, others can be images</li>
                  <li><b>Save the Excel file</b> and upload it below</li>
                  <li><b>No separate image files needed!</b> Images are embedded in Excel</li>
                </ol>

                <div className="mt-4 bg-green-50 border border-green-200 p-3 rounded">
                  <div className="flex items-start">
                    <span className="text-green-600 mr-2">💡</span>
                    <div className="text-sm text-green-800">
                      <b>Pro Tip:</b> To insert an image in Excel:
                      <ol className="mt-1 space-y-1 list-decimal ml-4">
                        <li>Click on the cell where you want the image</li>
                        <li>Go to Insert tab → Pictures → This Device</li>
                        <li>Choose your image and click Insert</li>
                        <li>Drag the image to fit within the cell</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <a
                  href={buildDownloadUrl()}
                  className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold"
                >
                  📥 Download Template
                </a>
              </div>

              {/* Excel File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <input
                  id="template-upload-input"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="template-upload-input"
                  className="cursor-pointer inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  Choose Excel File
                </label>
                <p className="mt-2 text-xs text-gray-500">
                  Upload your filled Excel file with embedded images
                </p>
                {selectedFile ? (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center justify-center">
                      <svg className="h-5 w-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium text-green-800">
                        {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-sm text-gray-500">
                    No file selected yet
                  </div>
                )}
              </div>
            </>
          )}

          {uploadState === 'uploading' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin h-12 w-12 border-4 border-blue-300 border-t-blue-600 rounded-full"></div>
              <p className="mt-4 text-lg font-medium text-gray-700">Uploading and processing...</p>
              <p className="mt-2 text-sm text-gray-500">
                Extracting embedded images from Excel file
              </p>
            </div>
          )}

          {uploadState === 'result' && result && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-md ${
                  result.status.toLowerCase().includes('fail')
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-green-50 text-green-800 border border-green-200'
                }`}
              >
                <div className="flex items-center">
                  {result.status.toLowerCase().includes('fail') ? (
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  <div className="font-semibold">{result.status}</div>
                </div>
                {result.detail && <div className="text-sm mt-1 ml-7">{result.detail}</div>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-md border border-green-200">
                  <div className="text-sm text-green-600 font-medium">Questions Created</div>
                  <div className="text-3xl font-bold text-green-700 mt-1">{result.created_count}</div>
                </div>
                <div className="bg-red-50 p-4 rounded-md border border-red-200">
                  <div className="text-sm text-red-600 font-medium">Errors</div>
                  <div className="text-3xl font-bold text-red-700 mt-1">{result.error_count}</div>
                </div>
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
                  <div className="font-semibold text-yellow-800 mb-2">⚠️ Row Errors</div>
                  <ul className="text-sm text-yellow-800 space-y-2 max-h-48 overflow-auto">
                    {result.errors.map((e, idx) => (
                      <li key={idx} className="py-1">
                        <b>Row {e.row}:</b> {formatErrorObject(e.errors)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={resetState}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Upload Another File
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {uploadState === 'idle' && (
          <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
            <button 
              onClick={handleClose} 
              className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile}
              className={`px-6 py-2 rounded-md text-white font-medium ${
                selectedFile 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {selectedFile ? 'Upload & Process' : 'Select File First'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateQuestionBulkUploadModal;