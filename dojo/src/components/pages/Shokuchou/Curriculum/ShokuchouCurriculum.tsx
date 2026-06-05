
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Upload, Folder, File } from 'lucide-react';
import axios from 'axios';

// ... your component code
// import Nav from "../../../../HomeNav/nav";

const API_BASE = 'http://127.0.0.1:8000';

// --- Sho Interfaces (Updated) ---
interface ShoMainTopic {
  id: number;
  title: string;
}

interface ShoSubtopic {
  id: number;
  title: string;
  sho_content: number;
}

interface ShoMaterial {
  id: number;
  description: string; // <-- Corrected field name
  training_file_url?: string | null; // <-- Added for direct download links
  url_link?: string | null;
  sho_subtopic: number;
}

// --- Delete Target Union Type ---
type ShoDeleteTarget =
  | { type: 'shoMainTopic'; id: number; name: string }
  | { type: 'shoSubtopic'; id: number; name: string }
  | { type: 'shoMaterial'; id: number; name: string }
  | null;


const ShokuchouCurriculum: React.FC = () => {
  // State for data, UI, and forms
  const [mainTopics, setMainTopics] = useState<ShoMainTopic[]>([]);
  const [subtopics, setSubtopics] = useState<ShoSubtopic[]>([]);
  const [materials, setMaterials] = useState<ShoMaterial[]>([]);
  const [selectedMainTopic, setSelectedMainTopic] = useState<ShoMainTopic | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<ShoSubtopic | null>(null);
  const [showMainTopicForm, setShowMainTopicForm] = useState(false);
  const [showSubtopicForm, setShowSubtopicForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingMainTopic, setEditingMainTopic] = useState<ShoMainTopic | null>(null);
  const [editingSubtopic, setEditingSubtopic] = useState<ShoSubtopic | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ShoDeleteTarget>(null);
  const [mainTopicForm, setMainTopicForm] = useState({ title: '' });
  const [subtopicForm, setSubtopicForm] = useState({ title: '' });
  const [uploadForm, setUploadForm] = useState({ description: '', uploadType: 'file' as 'file' | 'link', file: null as File | null, url_link: '' });

  // --- DATA FETCHING ---
  const fetchMainTopics = async () => {
    try {
      const { data } = await axios.get<ShoMainTopic[]>(`${API_BASE}/sho-content/`);
      setMainTopics(data);
      if (!selectedMainTopic && data.length > 0) {
        setSelectedMainTopic(data[0]);
      } else if (data.length === 0) {
        setSelectedMainTopic(null);
      }
    } catch (error) { console.error('Error fetching main topics:', error); }
  };

  const fetchSubtopics = async (mainTopicId: number) => {
    try {
      const { data } = await axios.get<ShoSubtopic[]>(`${API_BASE}/sho-subtopics/?sho_content_id=${mainTopicId}`);
      setSubtopics(data);
      if (data.length > 0) {
        setSelectedSubtopic(data[0]);
      } else {
        setSelectedSubtopic(null);
      }
    } catch (error) { console.error('Error fetching subtopics:', error); }
  };

  const fetchMaterials = async (subtopicId: number) => {
    try {
      const { data } = await axios.get<ShoMaterial[]>(`${API_BASE}/sho-materials/?sho_subtopic_id=${subtopicId}`);
      setMaterials(data);
    } catch (error) { console.error('Error fetching materials:', error); }
  };

  // --- EFFECT HOOKS ---
  useEffect(() => { fetchMainTopics(); }, []);
  useEffect(() => {
    if (selectedMainTopic) { fetchSubtopics(selectedMainTopic.id); } 
    else { setSubtopics([]); setSelectedSubtopic(null); }
  }, [selectedMainTopic]);
  useEffect(() => {
    if (selectedSubtopic) { fetchMaterials(selectedSubtopic.id); } 
    else { setMaterials([]); }
  }, [selectedSubtopic]);

  // --- CRUD HANDLERS ---
  const handleMainTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingMainTopic ? `${API_BASE}/sho-content/${editingMainTopic.id}/` : `${API_BASE}/sho-content/`;
    const method = editingMainTopic ? 'put' : 'post';
    try {
      await axios[method](url, mainTopicForm);
      await fetchMainTopics();
      setShowMainTopicForm(false); setEditingMainTopic(null); setMainTopicForm({ title: '' });
    } catch (error) { alert('Failed to save main topic.'); }
  };

  const handleEditMainTopic = (topic: ShoMainTopic) => {
    setEditingMainTopic(topic);
    setMainTopicForm({ title: topic.title });
    setShowMainTopicForm(true);
  };
  
  const handleSubtopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMainTopic) return;
    const payload = { ...subtopicForm, sho_content: selectedMainTopic.id };
    const url = editingSubtopic ? `${API_BASE}/sho-subtopics/${editingSubtopic.id}/` : `${API_BASE}/sho-subtopics/`;
    const method = editingSubtopic ? 'put' : 'post';
    try {
      await axios[method](url, payload);
      await fetchSubtopics(selectedMainTopic.id);
      setShowSubtopicForm(false); setEditingSubtopic(null); setSubtopicForm({ title: '' });
    } catch (error) { alert('Failed to save subtopic.'); }
  };

  const handleEditSubtopic = (topic: ShoSubtopic) => {
    setEditingSubtopic(topic);
    setSubtopicForm({ title: topic.title });
    setShowSubtopicForm(true);
  };
  
  const handleMaterialUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubtopic) return;
    const formData = new FormData();
    // ✅ FIX: Changed key to 'description' to match the serializer
    formData.append('description', uploadForm.description);
    formData.append('sho_subtopic', String(selectedSubtopic.id));
    
    if (uploadForm.uploadType === 'link') {
      formData.append('url_link', uploadForm.url_link);
    } else if (uploadForm.file) {
      formData.append('training_file', uploadForm.file);
    }
    
    try {
      await axios.post(`${API_BASE}/sho-materials/`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      await fetchMaterials(selectedSubtopic.id);
      setShowUploadForm(false);
      setUploadForm({ description: '', uploadType: 'file', file: null, url_link: '' });
    } catch (error) {
        console.error("Error response on upload:", error.response?.data);
        alert('Failed to upload material.');
    }
  };

  const openDeleteModal = (target: ShoDeleteTarget) => {
    setDeleteTarget(target);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    let url = '';
    switch (deleteTarget.type) {
      case 'shoMainTopic': url = `${API_BASE}/sho-content/${deleteTarget.id}/`; break;
      case 'shoSubtopic': url = `${API_BASE}/sho-subtopics/${deleteTarget.id}/`; break;
      case 'shoMaterial': url = `${API_BASE}/sho-materials/${deleteTarget.id}/`; break;
    }
    try {
      await axios.delete(url);
      if (deleteTarget.type === 'shoMainTopic') {
        await fetchMainTopics();
        if (selectedMainTopic?.id === deleteTarget.id) setSelectedMainTopic(null);
      }
      if (deleteTarget.type === 'shoSubtopic' && selectedMainTopic) {
        await fetchSubtopics(selectedMainTopic.id);
        if (selectedSubtopic?.id === deleteTarget.id) setSelectedSubtopic(null);
      }
      if (deleteTarget.type === 'shoMaterial' && selectedSubtopic) {
        await fetchMaterials(selectedSubtopic.id);
      }
    } catch (error) { alert('Failed to delete item.'); } finally {
      setShowDeleteModal(false); setDeleteTarget(null);
    }
  };

  const handleMaterialClick = (content: ShoMaterial) => {
    // ✅ FIX: Simplified and more reliable logic using the direct URL from the API
    if (content.training_file_url) {
      window.open(content.training_file_url, '_blank', 'noopener,noreferrer');
    } else if (content.url_link) {
      window.open(content.url_link, '_blank', 'noopener,noreferrer');
    } else {
      console.log('No file or URL found for material:', content);
      alert('No file or URL associated with this material.');
    }
  };

 
  const getFileIcon = (content: ShoMaterial, sizeClass = 'w-5 h-5') => {
    if (content.url_link) {
      return (
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
    }
    
    // ✅ FIX: Use the new training_file_url for determining the icon
    const filePath = content.training_file_url;

    if (filePath) {
      const extension = filePath.split('?')[0].split('.').pop()?.toLowerCase();

      if (extension === 'pdf') { /* return pdf svg */ }
      if (['mp4', 'mov', 'avi', 'mkv'].includes(extension || '')) { /* return video svg */ }
      if (['ppt', 'pptx'].includes(extension || '')) { /* return ppt svg */ }
      if (['doc', 'docx'].includes(extension || '')) { /* return docx svg */ }
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension || '')) { /* return image svg */ }
    }

    return <File className={`${sizeClass} text-gray-500`} />;
  };
    
  // --- JSX Rendering ---
  return (
    <>
      {/* <Nav /> */}
      <div className="flex h-[calc(100vh-56px)] mt-[56px]">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Main Topics</h2>
              <button onClick={() => setShowMainTopicForm(true)} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" /></button>
            </div>
            {showMainTopicForm && (
              <form onSubmit={handleMainTopicSubmit} className="space-y-3 bg-gray-50 p-4 rounded-lg mb-4">
                <input type="text" value={mainTopicForm.title} onChange={(e) => setMainTopicForm({ title: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="Main Topic Title" required />
                <div className="flex space-x-2"><button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-md">{editingMainTopic ? 'Update' : 'Add'}</button><button type="button" onClick={() => { setShowMainTopicForm(false); setEditingMainTopic(null); setMainTopicForm({ title: '' }); }} className="flex-1 bg-gray-300 py-2 rounded-md">Cancel</button></div>
              </form>
            )}
            <div className="space-y-2">
              {mainTopics.map((topic) => (
                <div key={topic.id} onClick={() => setSelectedMainTopic(topic)} className={`p-3 rounded-lg cursor-pointer ${selectedMainTopic?.id === topic.id ? 'bg-blue-50 border-2 border-blue-200' : 'hover:bg-gray-100'}`}>
                  <div className="flex items-center justify-between"><div className="flex items-center space-x-2"><Folder className="w-4 h-4 text-blue-600" /><h3 className="font-medium">{topic.title}</h3></div><div className="flex space-x-1"><button onClick={(e) => { e.stopPropagation(); handleEditMainTopic(topic); }} className="p-1"><Edit2 className="w-3 h-3" /></button><button onClick={(e) => { e.stopPropagation(); openDeleteModal({ type: 'shoMainTopic', id: topic.id, name: topic.title }); }} className="p-1 text-red-600"><Trash2 className="w-3 h-3" /></button></div></div>
                </div>
              ))}
            </div>
          </div>
          {selectedMainTopic && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Subtopics</h3>
                <button onClick={() => setShowSubtopicForm(true)} className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700"><Plus className="w-4 h-4" /></button>
              </div>
              {showSubtopicForm && (
                <form onSubmit={handleSubtopicSubmit} className="space-y-3 bg-gray-50 p-4 rounded-lg mb-4">
                  <input type="text" value={subtopicForm.title} onChange={(e) => setSubtopicForm({ title: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="Subtopic Title" required />
                  <div className="flex space-x-2"><button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-md">{editingSubtopic ? 'Update' : 'Add'}</button><button type="button" onClick={() => { setShowSubtopicForm(false); setEditingSubtopic(null); setSubtopicForm({ title: '' }); }} className="flex-1 bg-gray-300 py-2 rounded-md">Cancel</button></div>
                </form>
              )}
              <div className="space-y-2">
                {subtopics.map((subtopic) => (
                  <div key={subtopic.id} onClick={() => setSelectedSubtopic(subtopic)} className={`p-3 rounded-lg cursor-pointer ${selectedSubtopic?.id === subtopic.id ? 'bg-green-50 border-2 border-green-200' : 'hover:bg-gray-100'}`}>
                    <div className="flex items-center justify-between"><h4 className="font-medium">{subtopic.title}</h4><div className="flex space-x-1"><button onClick={(e) => { e.stopPropagation(); handleEditSubtopic(subtopic); }} className="p-1"><Edit2 className="w-3 h-3" /></button><button onClick={(e) => { e.stopPropagation(); openDeleteModal({ type: 'shoSubtopic', id: subtopic.id, name: subtopic.title }); }} className="p-1 text-red-600"><Trash2 className="w-3 h-3" /></button></div></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedSubtopic ? (
            <>
              <div className="flex items-center justify-between mb-6"><div><h3 className="text-2xl font-bold">{selectedSubtopic.title}</h3><p className="text-sm text-gray-500 mt-1">From Main Topic: {selectedMainTopic?.title}</p></div><div className="flex items-center space-x-3"><button onClick={() => setShowUploadForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"><Upload className="w-4 h-4" /><span>Upload Material</span></button></div></div>
              {showUploadForm && (
                <div className="bg-white rounded-lg shadow-md border p-6 mb-6">
                  <h4 className="text-lg font-semibold mb-4">Upload Content</h4>
                  <form onSubmit={handleMaterialUpload} className="space-y-4">
                    <input type="text" value={uploadForm.description} onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))} className="w-full p-2 border rounded" placeholder="Material Description" required />
                    <select value={uploadForm.uploadType} onChange={e => setUploadForm(prev => ({ ...prev, uploadType: e.target.value as any }))} className="w-full p-2 border rounded"><option value="file">File (Document, Video, Image)</option><option value="link">Web Link</option></select>
                    {uploadForm.uploadType === 'file' ? (<input type="file" onChange={e => setUploadForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))} className="w-full p-2 border rounded" required />) : (<input type="url" value={uploadForm.url_link} onChange={e => setUploadForm(prev => ({ ...prev, url_link: e.target.value }))} className="w-full p-2 border rounded" placeholder="https://example.com" required />)}
                    <div className="flex justify-end space-x-3"><button type="button" onClick={() => setShowUploadForm(false)} className="px-4 py-2 border rounded">Cancel</button><button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md">Upload</button></div>
                  </form>
                </div>
              )}
              <div>
                {materials.length > 0 ? (
                  <div className="space-y-3">
                    {materials.map((material) => (
                      <div key={material.id} className="bg-white rounded-lg shadow-sm border p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleMaterialClick(material)}>
                        <div className="flex items-center space-x-3">
                          {getFileIcon(material)}
                          <div>
                            {/* ✅ FIX: Displaying the corrected field name */}
                            <h4 className="font-medium">{material.description}</h4>
                          </div>
                        </div>
                        <button onClick={(e) => { 
                          e.stopPropagation(); 
                          // ✅ FIX: Using the corrected field name for the delete modal
                          openDeleteModal({ type: 'shoMaterial', id: material.id, name: material.description }); 
                        }} className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg"><Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium">No materials yet</h3><p className="text-gray-600 mb-4">Upload content for this subtopic.</p><button onClick={() => setShowUploadForm(true)} className="bg-blue-600 text-white px-6 py-3 rounded-lg">Upload Content</button></div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center h-full flex flex-col justify-center items-center"><Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium">No Topic Selected</h3><p className="text-gray-600">Select a main topic and a subtopic from the sidebar to view and add materials.</p></div>
          )}
        </div>
        {showDeleteModal && deleteTarget && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
              <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
              <p>Are you sure you want to delete "{deleteTarget.name}"?</p>
              <div className="mt-6 flex justify-end space-x-3"><button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border rounded">Cancel</button><button onClick={handleConfirmDelete} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button></div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ShokuchouCurriculum;
