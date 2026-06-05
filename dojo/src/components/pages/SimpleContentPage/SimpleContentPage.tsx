import { useState, useRef } from "react";
import { Upload, X, Trash2 } from "lucide-react";

interface ContentItem {
    id: string;
    name: string;
    file?: File;
    url?: string;
    uploadedAt: string;
}

const SimpleContentPage = () => {
    const [contents, setContents] = useState<ContentItem[]>([
        {
            id: '1',
            name: 'Safety Training Manual',
            file: new File([''], 'safety-manual.pdf', { type: 'application/pdf' }),
            uploadedAt: '2024-01-15T10:30:00Z'
        },
        {
            id: '2',
            name: 'Equipment Operation Guide',
            url: 'https://example.com/equipment-guide',
            uploadedAt: '2024-01-20T14:15:00Z'
        },
        {
            id: '3',
            name: 'Emergency Procedures',
            file: new File([''], 'emergency-procedures.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
            uploadedAt: '2024-01-25T09:45:00Z'
        },
        {
            id: '4',
            name: 'Training Video - Part 1',
            file: new File([''], 'training-video-part1.mp4', { type: 'video/mp4' }),
            uploadedAt: '2024-02-01T16:20:00Z'
        },
        {
            id: '5',
            name: 'Quality Standards Documentation',
            url: 'https://example.com/quality-standards',
            uploadedAt: '2024-02-05T11:10:00Z'
        },
        {
            id: '6',
            name: 'Machine Calibration Checklist',
            file: new File([''], 'calibration-checklist.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
            uploadedAt: '2024-02-10T13:30:00Z'
        }
    ]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadType, setUploadType] = useState<'file' | 'url'>('file');
    const [newContent, setNewContent] = useState({
        name: '',
        file: null as File | null,
        url: ''
    });
    const [uploadLoading, setUploadLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadSubmit = async () => {
        if (!newContent.name) {
            alert('Please enter a content name');
            return;
        }

        if (uploadType === 'file' && !newContent.file) {
            alert('Please select a file to upload');
            return;
        }

        if (uploadType === 'url' && !newContent.url) {
            alert('Please enter a URL');
            return;
        }

        try {
            setUploadLoading(true);

            await new Promise(resolve => setTimeout(resolve, 1000));

            const newItem: ContentItem = {
                id: Date.now().toString(),
                name: newContent.name,
                file: uploadType === 'file' ? newContent.file || undefined : undefined,
                url: uploadType === 'url' ? newContent.url : undefined,
                uploadedAt: new Date().toISOString()
            };

            setContents([...contents, newItem]);
            setNewContent({ name: '', file: null, url: '' });
            setShowUploadModal(false);
            alert('Content uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            alert('An error occurred while uploading. Please try again.');
        } finally {
            setUploadLoading(false);
        }
    };

    const handleContentClick = (content: ContentItem) => {
        if (content.url) {
            window.open(content.url, '_blank', 'noopener,noreferrer');
        } else if (content.file) {
            const fileURL = URL.createObjectURL(content.file);
            window.open(fileURL, '_blank');
        }
    };

    const handleDeleteContent = (contentId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this content?')) return;
        setContents(contents.filter(content => content.id !== contentId));
        alert('Content deleted successfully!');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 relative">
            {/* Floating background elements like MethodPage */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className=" mx-auto relative z-10">
                {/* Header styled like MethodPage */}
                <div className="mb-10">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Upload className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
                                Content Management
                            </h1>
                            <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2"></div>
                        </div>
                    </div>
                    <p className="text-slate-600 text-lg font-medium ml-16 opacity-80">
                        Manage, upload, and organize your training materials seamlessly
                    </p>
                </div>

                <div className="flex items-center justify-end mb-4">

                    <button
                        type="button"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
                    >
                        Upload
                    </button>
                </div>


                {/* Content Card with glass morphism */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden relative">
                    <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                    <div className="p-8 md:p-12 bg-gradient-to-br from-white/50 via-slate-50/30 to-blue-50/40 relative min-h-[600px]">
                        {/* List */}
                        <div className="space-y-4 animate-slide-in relative z-10">
                            {contents.map((content) => (
                                <div
                                    key={content.id}
                                    className="bg-white/70 backdrop-blur-md p-6 rounded-xl border border-gray-200 hover:shadow-xl cursor-pointer transition-all duration-300 group"
                                >
                                    <div className="flex justify-between items-center">
                                        {/* Left: Content Name */}
                                        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                            {content.name}
                                        </h3>

                                        {/* Right: Link + Delete */}
                                        <div className="flex items-center gap-3">
                                            {content.url ? (
                                                <a
                                                    href={content.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    Open
                                                </a>
                                            ) : content.file ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const fileURL = URL.createObjectURL(content.file!);
                                                        window.open(fileURL, "_blank");
                                                    }}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    Open
                                                </button>
                                            ) : null}

                                            <button
                                                onClick={(e) => handleDeleteContent(content.id, e)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Optional: uploaded date under row */}
                                    <p className="mt-2 text-sm text-gray-500">
                                        Uploaded: {new Date(content.uploadedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}

                        </div>
                    </div>
                </div>

                {/* Upload Modal (kept same styles as before) */}
                {showUploadModal && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
                        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md">
                            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-800">Upload Content</h2>
                                <button
                                    onClick={() => setShowUploadModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Form remains unchanged */}
                                {/* ... same as your existing code ... */}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(30px) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
        }

        .animate-slide-in {
          animation: slide-in 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
        </div>
    );
};

export default SimpleContentPage;
