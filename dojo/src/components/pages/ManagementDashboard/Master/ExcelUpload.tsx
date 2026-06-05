import React, { useState, ChangeEvent } from 'react';
import styles from './ExcelUpload.module.css';

interface ExcelUploadProps {
  onFileUpload: (file: File) => void;
}

const ExcelUpload: React.FC<ExcelUploadProps> = ({ onFileUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setUploadStatus('');
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      setUploadStatus('Please select a file first');
      return;
    }

    // Check if file is Excel
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase() || '';
    if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
      setUploadStatus('Please select an Excel file (.xlsx or .xls)');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Uploading...');

    // Here you would normally use a library like xlsx or a file reader
    // For now, we'll simulate the upload process
    setTimeout(() => {
      setIsUploading(false);
      setUploadStatus('File uploaded successfully! Data is being processed.');
      
      // Pass the file to the parent component
      onFileUpload(selectedFile);
      
      // Reset the file input
      setSelectedFile(null);
      const fileInput = document.getElementById('excel-upload') as HTMLInputElement | null;
      if (fileInput) {
        fileInput.value = '';
      }
    }, 1500);
  };

  return (
    <div className={styles.uploadContainer}>
      <h2>Import Plant Data from Excel</h2>
      
      <div className={styles.uploadControls}>
        <input
          type="file"
          id="excel-upload"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className={styles.fileInput}
        />
        <label htmlFor="excel-upload" className={styles.customFileInput}>
          Choose Excel File
        </label>
        
        <button 
          onClick={handleUpload} 
          disabled={isUploading || !selectedFile}
          className={styles.uploadButton}
        >
          {isUploading ? 'Processing...' : 'Upload & Import'}
        </button>
      </div>
      
      {selectedFile && (
        <div className={styles.fileInfo}>
          <span>Selected: {selectedFile.name}</span>
        </div>
      )}
      
      {uploadStatus && (
        <div className={`${styles.statusMessage} ${
          uploadStatus.includes('successfully') 
            ? styles.success 
            : uploadStatus.includes('Uploading') || uploadStatus.includes('Processing')
              ? styles.uploading 
              : styles.error
        }`}>
          {uploadStatus}
        </div>
      )}
      
      <div className={styles.helpText}>
        <p>Upload an Excel file with your plant data to automatically populate the form</p>
        <p>Supported formats: .xlsx, .xls</p>
        <p>Make sure your Excel follows the required template structure</p>
      </div>
    </div>
  );
};

export default ExcelUpload;