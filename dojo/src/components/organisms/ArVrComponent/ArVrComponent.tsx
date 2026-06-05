import { useState, useEffect, useRef } from "react";
import axios from "axios";

interface TrainingContent {
  id: string;
  description: string;
  arvr_file?: string;  // Changed from arvr_file
  url_link?: string;
  // subtopic_content removed since it's not in the new model
}

export default function ArVrComponent() {
  const [trainingContents, setTrainingContents] = useState<TrainingContent[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<'file' | 'link'>('file');
  const [newMaterial, setNewMaterial] = useState<{
    description: string;
    file: File | null;
    url: string;
  }>({ description: '', file: null, url: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');

  // Fetch AR/VR training contents on component mount
  useEffect(() => {
    const fetchArVrContents = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://127.0.0.1:8000/arvr-content/');
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const data: TrainingContent[] = await response.json();
        console.log(data)
        // Filter for AR/VR related content or use all content
        setTrainingContents(data);
        setLoading(false);
      } catch (error) {
        console.error('Fetch error:', error);
        setError('Failed to load AR/VR contents');
        setLoading(false);
      }
    };

    fetchArVrContents();
  }, []);

 const handleUploadSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!newMaterial.description || (uploadType === 'file' && !newMaterial.file) || (uploadType === 'link' && !newMaterial.url)) {
    alert('Please fill all required fields');
    return;
  }

  try {
    setUploadLoading(true);
    const formData = new FormData();
    formData.append('description', newMaterial.description);

    if (uploadType === 'file' && newMaterial.file) {
      formData.append('arvr_file', newMaterial.file);  // Changed from arvr_file
    } else if (uploadType === 'link' && newMaterial.url) {
      formData.append('url_link', newMaterial.url);
    }
  
    // Use axios instead of fetch for better FormData handling
    const response = await axios.post('http://127.0.0.1:8000/arvr-content/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status === 201) {
      const newContent: TrainingContent = response.data;
      setTrainingContents([...trainingContents, newContent]);
      setNewMaterial({ description: '', file: null, url: '' });
      setShowUploadModal(false);
      alert('AR/VR Material uploaded successfully!');
    } else {
      console.error('Upload failed:', response.data);
      alert('Failed to upload material. Please try again.');
    }
  } catch (error) {
    console.error('Upload error:', error);
    alert('An error occurred while uploading. Please try again.');
  } finally {
    setUploadLoading(false);
  }
};

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setNewMaterial({ ...newMaterial, file: e.target.files[0] });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

const handleMaterialClick = (content: TrainingContent) => {
  console.log('Clicked AR/VR material:', content);

  if (content.url_link) {
    console.log('Opening URL link:', content.url_link);
    window.open(content.url_link, '_blank', 'noopener,noreferrer');
  } else if (content.arvr_file) {  // Changed from arvr_file
    let fileURL;

    if (content.arvr_file.startsWith('http')) {
      fileURL = content.arvr_file;
    } else if (content.arvr_file.startsWith('/media/')) {
      fileURL = `http://127.0.0.1:8000${content.arvr_file}`;
    } else if (content.arvr_file.startsWith('media/')) {
      fileURL = `http://127.0.0.1:8000/${content.arvr_file}`;
    } else {
      fileURL = `http://127.0.0.1:8000/media/${content.arvr_file}`;
    }

    console.log('Opening file URL:', fileURL);

    fetch(fileURL, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          window.open(fileURL, '_blank', 'noopener,noreferrer');
        } else {
          console.error('File not found at:', fileURL);
          alert(`File not found at: ${fileURL}\nPlease check if the file exists and the media URL is configured correctly.`);
        }
      })
      .catch(error => {
        console.error('Error checking file:', error);
        window.open(fileURL, '_blank', 'noopener,noreferrer');
      });
  } else {
    console.log('No file or URL found for material:', content);
    alert('No file or URL associated with this material.');
  }
};

  const getFileTypeFromUrl = (url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase();

    if (!extension) return 'File';

    if (extension === 'pdf') return 'PDF';
    if (['mp4', 'mov', 'avi', 'mkv'].includes(extension)) return 'Video';
    if (['ppt', 'pptx'].includes(extension)) return 'Presentation';
    if (['doc', 'docx'].includes(extension)) return 'Document';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension)) return 'Image';
    if (['glb', 'gltf', 'obj', 'fbx'].includes(extension)) return '3D Model';
    if (['apk', 'ipa'].includes(extension)) return 'AR/VR App';

    return 'File';
  };

  const getFileIcon = (content: TrainingContent, sizeClass = 'w-5 h-5') => {
    if (content.url_link) {
      return (
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
    }

    if (content.arvr_file) {
      const extension = content.arvr_file.split('.').pop()?.toLowerCase();

      if (['glb', 'gltf', 'obj', 'fbx'].includes(extension || '')) {
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      }

      if (['apk', 'ipa'].includes(extension || '')) {
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      }

      if (extension === 'pdf') {
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      }

      if (['mp4', 'mov', 'avi', 'mkv'].includes(extension || '')) {
        return (
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      }

      return (
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }

    return null;
  };

 const handleDeleteContent = async (contentId: string) => {
  if (!window.confirm('Are you sure you want to delete this AR/VR material?')) {
    return;
  }

  try {
    const response = await axios.delete(`http://127.0.0.1:8000/arvr-content/${contentId}/`);  // Updated endpoint

    if (response.status === 204) {
      setTrainingContents(trainingContents.filter(content => content.id !== contentId));
      alert('AR/VR Material deleted successfully');
    } else {
      alert('Failed to delete material');
    }
  } catch (error) {
    console.error('Error deleting material:', error);
    alert('An error occurred while deleting the material');
  }
};
  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {trainingContents.map((content) => (
        <div
          key={content.id}
          className="group flex flex-col p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200 hover:shadow-sm"
          onClick={() => handleMaterialClick(content)}
        >
          <div className="flex items-center mb-3">
            <div className="mr-3 flex-shrink-0">
              {getFileIcon(content)}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-gray-800 hover:text-blue-600 block font-medium truncate">
                {content.description}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteContent(content.id);
              }}
              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
              title="Delete this material"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-auto">
            {content.arvr_file ? 
              `File: ${getFileTypeFromUrl(content.arvr_file)}` : 
              'Web Link'
            }
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-2">
      {trainingContents.map((content) => (
        <div
          key={content.id}
          className="group flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200 hover:shadow-sm"
        >
          <div className="mr-3 flex-shrink-0">
            {getFileIcon(content)}
          </div>
          <div 
            className="flex-1 min-w-0"
            onClick={() => handleMaterialClick(content)}
          >
            <span className="text-gray-800 hover:text-blue-600 block font-medium truncate">
              {content.description}
            </span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-gray-500">
                {content.arvr_file ? 
                  `File: ${getFileTypeFromUrl(content.arvr_file)}` : 
                  'Web Link'
                }
              </span>
              {content.arvr_file && (
                <span className="text-xs text-gray-400" title={content.arvr_file}>
                  • {content.arvr_file.split('/').pop()}
                </span>
              )}
              {content.url_link && (
                <span className="text-xs text-gray-400" title={content.url_link}>
                  • {content.url_link.length > 30 ? content.url_link.substring(0, 30) + '...' : content.url_link}
                </span>
              )}
            </div>
          </div>
          <div className="ml-2 flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteContent(content.id);
              }}
              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
              title="Delete this material"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div>Loading AR/VR contents...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">AR/VR Training Materials</h1>
        <p className="text-gray-600">Upload and manage AR/VR training resources including 3D models, applications, and documentation</p>
      </div>

      {/* Content Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Training Materials Section */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium text-gray-800">AR/VR Materials</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Upload AR/VR Material</span>
            </button>
            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewType('grid')}
                className={`p-2 ${viewType === 'grid' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700'}`}
                title="Grid view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewType('list')}
                className={`p-2 ${viewType === 'list' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700'}`}
                title="List view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {trainingContents.length > 0 ? (
          <>
            {viewType === 'grid' && renderGridView()}
            {viewType === 'list' && renderListView()}
          </>
        ) : (
          <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-lg mb-2">No AR/VR materials uploaded yet</p>
            <p>Click "Upload AR/VR Material" to add 3D models, applications, and other resources</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 text-purple-800">Upload AR/VR Material</h2>

              <form onSubmit={handleUploadSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Material Description *
                    </label>
                    <input
                      type="text"
                      value={newMaterial.description}
                      onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                      className="w-full p-2 border rounded focus:ring-purple-500 focus:border-purple-500"
                      placeholder="e.g., 3D Engine Model, AR Assembly Guide"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Type *
                    </label>
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => setUploadType('file')}
                        className={`px-4 py-2 rounded ${uploadType === 'file' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
                      >
                        File Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadType('link')}
                        className={`px-4 py-2 rounded ${uploadType === 'link' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
                      >
                        Web Link
                      </button>
                    </div>
                  </div>

                  {uploadType === 'file' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select File *
                      </label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        required={uploadType === 'file'}
                        accept=".glb,.gltf,.obj,.fbx,.apk,.ipa,.pdf,.ppt,.pptx,.doc,.docx,.mp4,.mov,.avi,.mkv"
                      />
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={triggerFileInput}
                          className="px-4 py-2 bg-gray-200 rounded-l hover:bg-gray-300"
                        >
                          Choose File
                        </button>
                        <div className="flex-1 p-2 border border-l-0 rounded-r bg-gray-50 text-sm text-gray-500 truncate">
                          {newMaterial.file ? newMaterial.file.name : 'No file selected'}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Supported: 3D Models (GLB, GLTF, OBJ, FBX), Apps (APK, IPA), Documents (PDF, PPT, DOC), Videos (MP4, MOV, AVI, MKV)
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL *
                      </label>
                      <input
                        type="url"
                        value={newMaterial.url}
                        onChange={(e) => setNewMaterial({ ...newMaterial, url: e.target.value })}
                        className="w-full p-2 border rounded focus:ring-purple-500 focus:border-purple-500"
                        placeholder="https://example.com/ar-experience"
                        required={uploadType === 'link'}
                      />
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    disabled={uploadLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                    disabled={uploadLoading}
                  >
                    {uploadLoading ? 'Uploading...' : 'Upload Material'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}