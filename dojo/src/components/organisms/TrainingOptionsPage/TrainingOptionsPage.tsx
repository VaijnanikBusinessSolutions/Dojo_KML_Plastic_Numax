import { useState, useEffect, useRef } from "react";
import { CheckCircle, GraduationCap, CalendarCheck, Upload, X, FileText, Link, Trash2, Download, ImageIcon, Video, File } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { createTrainingContent, deleteTrainingContent, getTrainingContentsByLevelStation } from "../../hooks/ServiceApis";
import { API_ENDPOINTS } from "../../constants/api";

interface TrainingContent {
  id: string;
  level: number;
  level_name: string;
  station: number;
  station_name: string;
  content_name: string;
  file?: string;
  url?: string;
  updated_at: string;
}

interface LocationState {
  stationId?: number;
  stationName?: string;
  departmentName?: string;
  levelId?: number;
  levelName?: string;
  sublineId?: string,
  sublineName?: string,
  lineId?: string,
  lineName?: string,

  departmentId?: string,
}

const TrainingOptionsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    stationId,
    stationName,
    sublineId,
    sublineName,
    lineId,
    lineName,
    departmentId,
    departmentName,
    levelId,
    levelName
  } = (location.state as LocationState) || {};

  // Training Materials State
  const [trainingContents, setTrainingContents] = useState<TrainingContent[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<'file' | 'url'>('file');
  const [newMaterial, setNewMaterial] = useState<{
    content_name: string;
    file: File | null;
    url: string;
    level: number | null;
    station: number | null;
  }>({
    content_name: '',
    file: null,
    url: '',
    level: levelId || null,
    station: stationId || null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  console.log("Location State:", location.state);

  // Fetch level-wise training contents
  useEffect(() => {
    const fetchTrainingContents = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!levelId || !stationId) {
          console.warn('Missing levelId or stationId');
          setLoading(false);
          return;
        }

        const data = await getTrainingContentsByLevelStation(levelId, stationId);
        setTrainingContents(data);
      } catch (error) {
        console.error('Fetch error:', error);
        setError('Failed to load training contents');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainingContents();
  }, [levelId, stationId]);

  // Get file extension and type
  const getFileType = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase() || '';

    // Image extensions
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    if (imageExtensions.includes(extension)) return 'image';

    // Video extensions
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
    if (videoExtensions.includes(extension)) return 'video';

    // PDF
    if (extension === 'pdf') return 'pdf';

    // Document extensions
    const docExtensions = ['doc', 'docx', 'txt', 'rtf'];
    if (docExtensions.includes(extension)) return 'document';

    // Presentation extensions
    const pptExtensions = ['ppt', 'pptx'];
    if (pptExtensions.includes(extension)) return 'presentation';

    // 3D model extensions
    const modelExtensions = ['glb', 'gltf', 'obj', 'fbx'];
    if (modelExtensions.includes(extension)) return 'model';

    return 'file';
  };

  // Get appropriate icon for file type
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <ImageIcon className="w-6 h-6 text-purple-600" />;
      case 'video':
        return <Video className="w-6 h-6 text-purple-600" />;
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-500" />;
      case 'document':
        return <FileText className="w-6 h-6 text-blue-500" />;
      case 'presentation':
        return <FileText className="w-6 h-6 text-orange-500" />;
      case 'model':
        return <File className="w-6 h-6 text-green-500" />;
      default:
        return <FileText className="w-6 h-6 text-purple-600" />;
    }
  };

  // Get file URL for opening
  const getFileUrl = (filePath: string) => {
    if (filePath.startsWith('http')) return filePath;
    if (filePath.startsWith('/media/')) return `${API_ENDPOINTS.BASE_URL}${filePath}`;
    if (filePath.startsWith('media/')) return `${API_ENDPOINTS.BASE_URL}/${filePath}`;
    return `${API_ENDPOINTS.BASE_URL}/media/${filePath}`;
  };

  // Navigation handlers
  const handleEvaluationTestClick = () => {
    navigate("/ExamModeSelector", { state: { stationId, stationName, departmentName, levelId, levelName } });
  };

  const handleTenCycleClick = () => navigate("/OjtSearch", { state: {...location.state, nextpage:"tencycle"}});

  const  handleOJTClick = () => {
    navigate("/OjtSearch", { state: {...location.state, } });
  };

  // Training Material Handlers
  const handleUploadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newMaterial.content_name || !newMaterial.level || !newMaterial.station) {
      alert('Please fill all required fields');
      return;
    }

    if (uploadType === 'file' && !newMaterial.file) {
      alert('Please select a file to upload');
      return;
    }

    if (uploadType === 'url' && !newMaterial.url) {
      alert('Please enter a URL');
      return;
    }

    try {
      setUploadLoading(true);
      const formData = new FormData();

      formData.append('content_name', newMaterial.content_name);
      formData.append('level', newMaterial.level.toString());
      formData.append('station', newMaterial.station.toString());

      if (uploadType === 'file' && newMaterial.file) {
        formData.append('file', newMaterial.file);
      } else if (uploadType === 'url' && newMaterial.url) {
        formData.append('url', newMaterial.url);
      }

      const responseData = await createTrainingContent(formData);
      setTrainingContents([...trainingContents, responseData]);

      setNewMaterial({
        content_name: '',
        file: null,
        url: '',
        level: levelId || null,
        station: stationId || null
      });
      setShowUploadModal(false);
      alert('Training material uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('An error occurred while uploading. Please try again.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleMaterialClick = (content: TrainingContent) => {
    if (content.url) {
      window.open(content.url, '_blank', 'noopener,noreferrer');
    } else if (content.file) {
      const fileURL = getFileUrl(content.file);
      window.open(fileURL, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDeleteContent = async (contentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this training material?')) return;

    try {
      await deleteTrainingContent(contentId);
      setTrainingContents(trainingContents.filter(content => content.id !== contentId));
      alert('Training material deleted successfully!');
    } catch (error) {
      console.error('Error deleting material:', error);
      alert('An error occurred while deleting the material');
    }
  };

  // Render functions
  const renderTrainingOptions = () => (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl mx-auto mb-8 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Training Options</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className="flex flex-col items-center p-8 bg-white rounded-xl hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-300 group"
          onClick={handleEvaluationTestClick}
        >
          <div className="p-3 bg-blue-100 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
            <CheckCircle className="w-12 h-12 text-blue-600" />
          </div>
          <span className="text-gray-800 font-semibold text-lg text-center group-hover:text-blue-700 transition-colors">
            Evaluation Test
          </span>
          <p className="text-sm text-gray-500 mt-2 text-center">Assess your skills and knowledge</p>
        </div>

        <div
          className="flex flex-col items-center p-8 bg-white rounded-xl hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-green-300 group"
          onClick={handleOJTClick}
        >
          <div className="p-3 bg-green-100 rounded-full mb-4 group-hover:bg-green-200 transition-colors">
            <GraduationCap className="w-12 h-12 text-green-600" />
          </div>
          <span className="text-gray-800 font-semibold text-lg text-center group-hover:text-green-700 transition-colors">
            On-Job Training
          </span>
          <p className="text-sm text-gray-500 mt-2 text-center">Hands-on practical learning</p>
        </div>

        <div
          className="flex flex-col items-center p-8 bg-white rounded-xl hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-purple-300 group"
          onClick={handleTenCycleClick}
        >
          <div className="p-3 bg-purple-100 rounded-full mb-4 group-hover:bg-purple-200 transition-colors">
            <CalendarCheck className="w-12 h-12 text-purple-600" />
          </div>
          <span className="text-gray-800 font-semibold text-lg text-center group-hover:text-purple-700 transition-colors">
            Ten Cycle
          </span>
          <p className="text-sm text-gray-500 mt-2 text-center">Comprehensive training program</p>
        </div>
      </div>
    </div>
  );

  const renderTrainingMaterials = () => (
    <div className="bg-white p-8 rounded-2xl shadow-lg mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Training Materials</h3>
          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            {levelName && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">Level: {levelName}</span>
            )}
            {stationName && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">Station: {stationName}</span>
            )}
            {departmentName && (
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">Department: {departmentName}</span>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 flex items-center space-x-2 shadow-md hover:shadow-lg transition-all"
          disabled={!levelId || !stationId}
        >
          <Upload className="w-5 h-5" />
          <span>Upload Material</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading training materials...</p>
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-500 border-2 border-dashed border-red-300 rounded-2xl">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-10 h-10 text-red-500" />
          </div>
          <p className="text-lg font-semibold mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-red-600 hover:text-red-700 underline text-sm"
          >
            Try Again
          </button>
        </div>
      ) : trainingContents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainingContents.map((content) => {
            const fileType = content.file ? getFileType(content.file) : 'url';
            const fileExtension = content.file ? content.file.split('.').pop()?.toUpperCase() : 'URL';

            return (
              <div
                key={content.id}
                className="group relative p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-xl cursor-pointer transition-all duration-300"
                onClick={() => handleMaterialClick(content)}
              >
                <div className="flex items-start mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg mr-4 group-hover:bg-purple-200 transition-colors">
                    {content.file ? (
                      getFileIcon(fileType)
                    ) : (
                      <Link className="w-6 h-6 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-gray-800 font-semibold group-hover:text-purple-700 transition-colors line-clamp-2">
                      {content.content_name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">{content.station_name}</p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteContent(content.id, e)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete this material"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {content.file ? (
                      fileType === 'image' ? 'Image' :
                        fileType === 'video' ? 'Video' :
                          fileType === 'pdf' ? 'PDF' :
                            fileType === 'document' ? 'Document' :
                              fileType === 'presentation' ? 'Presentation' :
                                fileType === 'model' ? '3D Model' :
                                  `${fileExtension} File`
                    ) : (
                      'Web Link'
                    )}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(content.updated_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Download className="w-4 h-4 text-purple-600" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500 border-2 border-dashed border-gray-300 rounded-2xl">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-lg font-semibold mb-2">No training materials yet</p>
          <p className="text-sm text-gray-400 mb-4">
            {!levelId || !stationId ?
              'Level and station information required' :
              'Upload your first training material to get started'
            }
          </p>
          {levelId && stationId && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Upload Material
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 pt-20">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Training Options */}
        {renderTrainingOptions()}

        {/* Training Materials Section */}
        {renderTrainingMaterials()}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800">Upload Training Material</h2>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleUploadSubmit} className="p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content Name *
                    </label>
                    <input
                      type="text"
                      value={newMaterial.content_name}
                      onChange={(e) => setNewMaterial({ ...newMaterial, content_name: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="e.g., Equipment Diagram, Safety Procedure"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Type *
                    </label>
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => setUploadType('file')}
                        className={`flex-1 py-3 px-4 rounded-lg border transition-all ${uploadType === 'file'
                            ? 'bg-purple-100 border-purple-500 text-purple-700'
                            : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                          }`}
                      >
                        File Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadType('url')}
                        className={`flex-1 py-3 px-4 rounded-lg border transition-all ${uploadType === 'url'
                            ? 'bg-purple-100 border-purple-500 text-purple-700'
                            : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                          }`}
                      >
                        Web Link
                      </button>
                    </div>
                  </div>

                  {uploadType === 'file' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select File *
                      </label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => e.target.files && setNewMaterial({ ...newMaterial, file: e.target.files[0] })}
                        className="hidden"
                        required
                        accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.svg,.pdf,.doc,.docx,.ppt,.pptx,.glb,.gltf,.obj,.fbx,.mp4,.avi,.mov"
                      />
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 transition-colors"
                      >
                        {newMaterial.file ? (
                          <div className="text-green-600">
                            <FileText className="w-8 h-8 mx-auto mb-2" />
                            <p className="font-medium truncate">{newMaterial.file.name}</p>
                            <p className="text-xs text-gray-500">Click to change</p>
                          </div>
                        ) : (
                          <div className="text-gray-500">
                            <Upload className="w-8 h-8 mx-auto mb-2" />
                            <p>Click to select file</p>
                            <p className="text-xs">Images, PDF, DOC, PPT, 3D models, videos</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL *
                      </label>
                      <input
                        type="url"
                        value={newMaterial.url}
                        onChange={(e) => setNewMaterial({ ...newMaterial, url: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="https://example.com/training-material"
                        required
                      />
                    </div>
                  )}

                  {levelId && stationId && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Uploading to:</h4>
                      <div className="space-y-1 text-sm text-blue-700">
                        <p>Level: {levelName}</p>
                        <p>Station: {stationName}</p>
                        {departmentName && <p>Department: {departmentName}</p>}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    disabled={uploadLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all flex items-center space-x-2"
                    disabled={uploadLoading || !levelId || !stationId}
                  >
                    {uploadLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upload Material</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingOptionsPage;