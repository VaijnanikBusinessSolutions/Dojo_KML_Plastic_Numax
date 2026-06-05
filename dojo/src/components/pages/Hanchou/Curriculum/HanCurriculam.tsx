
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Upload, Folder, Link as LinkIcon, File, Image, X } from 'lucide-react';
import axios from 'axios';
// import Nav from "../../../../HomeNav/nav";

const API_BASE = 'http://127.0.0.1:8000';

// Interfaces for your data models
interface MainTopic { id: number; title: string; }
interface Subtopic { id: number; title: string; han_content: number; }
// interface Material { id: number; description: string; training_file?: string | null; url_link?: string | null; han_subtopic: number; }
interface Material {
  id: number;
  description: string;
  training_file?: string | null; // You can keep this for type safety, but it won't be used
  training_file_url?: string | null; // <-- ADD THIS FIELD
  url_link?: string | null;
  han_subtopic: number;
}
type DeleteTarget = | { type: 'mainTopic'; id: number; name: string } | { type: 'subtopic'; id: number; name: string } | { type: 'material'; id: number; name: string } | null;


const HanCurriculum: React.FC = () => {
  // State for data, UI, and forms
  const [mainTopics, setMainTopics] = useState<MainTopic[]>([]);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMainTopic, setSelectedMainTopic] = useState<MainTopic | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<Subtopic | null>(null);
  const [showMainTopicForm, setShowMainTopicForm] = useState(false);
  const [showSubtopicForm, setShowSubtopicForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingMainTopic, setEditingMainTopic] = useState<MainTopic | null>(null);
  const [editingSubtopic, setEditingSubtopic] = useState<Subtopic | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [mainTopicForm, setMainTopicForm] = useState({ title: '' });
  const [subtopicForm, setSubtopicForm] = useState({ title: '' });
  const [uploadForm, setUploadForm] = useState({ description: '', uploadType: 'file' as 'file' | 'link', file: null as File | null, url_link: '' });

  // --- DATA FETCHING ---
  const fetchMainTopics = async () => {
    try {
      const { data } = await axios.get<MainTopic[]>(`${API_BASE}/han-content/`);
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
      const { data } = await axios.get<Subtopic[]>(`${API_BASE}/han-subtopics/?han_content_id=${mainTopicId}`);
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
      const { data } = await axios.get<Material[]>(`${API_BASE}/han-materials/?han_subtopic_id=${subtopicId}`);
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
    const url = editingMainTopic ? `${API_BASE}/han-content/${editingMainTopic.id}/` : `${API_BASE}/han-content/`;
    const method = editingMainTopic ? 'put' : 'post';
    try {
      await axios[method](url, mainTopicForm);
      await fetchMainTopics();
      setShowMainTopicForm(false); setEditingMainTopic(null); setMainTopicForm({ title: '' });
    } catch (error) { alert('Failed to save main topic.'); }
  };

  const handleEditMainTopic = (topic: MainTopic) => {
    setEditingMainTopic(topic);
    setMainTopicForm({ title: topic.title });
    setShowMainTopicForm(true);
  };
  
  const handleSubtopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMainTopic) return;
    const payload = { ...subtopicForm, han_content: selectedMainTopic.id };
    const url = editingSubtopic ? `${API_BASE}/han-subtopics/${editingSubtopic.id}/` : `${API_BASE}/han-subtopics/`;
    const method = editingSubtopic ? 'put' : 'post';
    try {
      await axios[method](url, payload);
      await fetchSubtopics(selectedMainTopic.id);
      setShowSubtopicForm(false); setEditingSubtopic(null); setSubtopicForm({ title: '' });
    } catch (error) { alert('Failed to save subtopic.'); }
  };

  const handleEditSubtopic = (topic: Subtopic) => {
    setEditingSubtopic(topic);
    setSubtopicForm({ title: topic.title });
    setShowSubtopicForm(true);
  };
  
  // const handleMaterialUpload = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!selectedSubtopic) return;
  //   const formData = new FormData();
  //   formData.append('description', uploadForm.description);
  //   formData.append('han_subtopic', String(selectedSubtopic.id));
  //   if (uploadForm.uploadType === 'link') formData.append('url_link', uploadForm.url_link);
  //   else if (uploadForm.file) formData.append('training_file', uploadForm.file);
  //   try {
  //     await axios.post(`${API_BASE}/han-materials/`, formData);
  //     await fetchMaterials(selectedSubtopic.id);
  //     setShowUploadForm(false);
  //     setUploadForm({ description: '', uploadType: 'file', file: null, url_link: '' });
  //   } catch (error) { alert('Failed to upload material.'); }
  // };

  const openDeleteModal = (target: DeleteTarget) => {
    setDeleteTarget(target);
    setShowDeleteModal(true);
  };





const handleMaterialUpload = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedSubtopic) return;

  const formData = new FormData();
  formData.append("description", uploadForm.description);
  formData.append("han_subtopic", String(selectedSubtopic.id));

  if (uploadForm.uploadType === "link") {
    formData.append("url_link", uploadForm.url_link);
  } else if (uploadForm.file) {
    formData.append("training_file", uploadForm.file);
  }

  try {
    const response = await axios.post(`${API_BASE}/han-materials/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const newMaterial = response.data;

    // ✅ immediately update UI with backend response
    setMaterials((prev) => [...prev, newMaterial]);

    // ✅ still refresh full list from backend (keeps things in sync)
    await fetchMaterials(selectedSubtopic.id);

    setShowUploadForm(false);
    setUploadForm({
      description: "",
      uploadType: "file",
      file: null,
      url_link: "",
    });
  } catch (error) {
    console.error(error);
    alert("Failed to upload material.");
  }
};



  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    let url = '';
    switch (deleteTarget.type) {
      case 'mainTopic': url = `${API_BASE}/han-content/${deleteTarget.id}/`; break;
      case 'subtopic': url = `${API_BASE}/han-subtopics/${deleteTarget.id}/`; break;
      case 'material': url = `${API_BASE}/han-materials/${deleteTarget.id}/`; break;
    }
    try {
      await axios.delete(url);
      if (deleteTarget.type === 'mainTopic') {
        await fetchMainTopics();
        if (selectedMainTopic?.id === deleteTarget.id) setSelectedMainTopic(null);
      }
      if (deleteTarget.type === 'subtopic' && selectedMainTopic) {
        await fetchSubtopics(selectedMainTopic.id);
        if (selectedSubtopic?.id === deleteTarget.id) setSelectedSubtopic(null);
      }
      if (deleteTarget.type === 'material' && selectedSubtopic) {
        await fetchMaterials(selectedSubtopic.id);
      }
    } catch (error) { alert('Failed to delete item.'); } finally {
      setShowDeleteModal(false); setDeleteTarget(null);
    }
  };

  // const handleMaterialClick = (content: Material) => {
  //   // console.log('Clicked material:', content); // Debug log

  //   if (content.url_link) {
  //     // console.log('Opening URL link:', content.url_link);
  //     // Open external links in new tab
  //     window.open(content.url_link, '_blank', 'noopener,noreferrer');
  //   } else if (content.training_file) {
  //     // For uploaded files, construct the full media URL and open in new tab
  //     let fileURL;

  //     if (content.training_file.startsWith('http')) {
  //       fileURL = content.training_file;
  //     } else if (content.training_file.startsWith('/media/')) {
  //       fileURL = `http://127.0.0.1:8000${content.training_file}`;
  //     } else if (content.training_file.startsWith('media/')) {
  //       fileURL = `http://127.0.0.1:8000/${content.training_file}`;
  //     } else {
  //       fileURL = `http://127.0.0.1:8000/media/${content.training_file}`;
  //     }

  //     console.log('Opening file URL:', fileURL);

  //     // First try to fetch the URL to check if it exists
  //     fetch(fileURL, { method: 'HEAD' })
  //       .then(response => {
  //         if (response.ok) {
  //           window.open(fileURL, '_blank', 'noopener,noreferrer');
  //         } else {
  //           console.error('File not found at:', fileURL);
  //           alert(`File not found at: ${fileURL}\nPlease check if the file exists and the media URL is configured correctly.`);
  //         }
  //       })
  //       .catch(error => {
  //         console.error('Error checking file:', error);
  //         // Still try to open it in case of CORS issues with HEAD request
  //         window.open(fileURL, '_blank', 'noopener,noreferrer');
  //       });
  //   } else {
  //     console.log('No file or URL found for material:', content);
  //     alert('No file or URL associated with this material.');
  //   }
  // };



  // In HanCurriculum.tsx

const handleMaterialClick = (content: Material) => {
    // Priority 1: Check for the direct file URL from the API
    if (content.training_file_url) {
      console.log('Opening file URL from API:', content.training_file_url);
      window.open(content.training_file_url, '_blank', 'noopener,noreferrer');
    } 
    // Priority 2: Check for an external web link
    else if (content.url_link) {
      console.log('Opening external URL link:', content.url_link);
      window.open(content.url_link, '_blank', 'noopener,noreferrer');
    } 
    // Fallback if neither exists
    else {
      console.log('No file or URL found for material:', content);
      alert('No file or URL associated with this material.');
    }
};

 
  // const getFileIcon = (content: Material, sizeClass = 'w-5 h-5') => {
  //   if (content.url_link) {
  //     return (
  //       <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  //       </svg>
  //     );
  //   }

  //   if (content.training_file) {
  //     const extension = content.training_file.split('.').pop()?.toLowerCase();

  //     if (extension === 'pdf') {
  //       return (
  //         <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  //         </svg>
  //       );
  //     }

  //     if (['mp4', 'mov', 'avi', 'mkv'].includes(extension || '')) {
  //       return (
  //         <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  //         </svg>
  //       );
  //     }

  //     if (['ppt', 'pptx'].includes(extension || '')) {
  //       return (
  //         <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  //         </svg>
  //       );
  //     }

  //     if (['doc', 'docx'].includes(extension || '')) {
  //       return (
  //         <svg className={`${sizeClass} text-blue-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  //         </svg>
  //       );
  //     }


  //     if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension || '')) {
  //       return (
  //         <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm4 12l3.2-4.2a1 1 0 011.6 0l2.4 3.2 1.6-2.1a1 1 0 011.6 0L21 17H5z" />
  //         </svg>
  //       );
  //     }
  //   }
  // }



  // In HanCurriculum.tsx

const getFileIcon = (content: Material, sizeClass = 'w-5 h-5') => {
    if (content.url_link) {
      // This part is fine, return the link icon
      return (
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
    }
    
    // Use the new training_file_url field to determine the icon
    const filePath = content.training_file_url || content.training_file;

    if (filePath) {
      // Strip query parameters before getting the extension
      const extension = filePath.split('?')[0].split('.').pop()?.toLowerCase();
      
      // ... the rest of your SVG logic remains the same ...
      // (pdf check, mp4 check, etc.)

      if (extension === 'pdf') { /* ... return pdf svg ... */ }
      if (['mp4', 'mov', 'avi', 'mkv'].includes(extension || '')) { /* ... return video svg ... */ }
      if (['ppt', 'pptx'].includes(extension || '')) { /* ... return ppt svg ... */ }
      if (['doc', 'docx'].includes(extension || '')) { /* ... return docx svg ... */ }
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension || '')) { /* ... return image svg ... */ }
    }
    
    // Return a default file icon if no match
    return <File className={`${sizeClass} text-gray-500`} />;
};
    

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
                  <div className="flex items-center justify-between"><div className="flex items-center space-x-2"><Folder className="w-4 h-4 text-blue-600" /><h3 className="font-medium">{topic.title}</h3></div><div className="flex space-x-1"><button onClick={(e) => { e.stopPropagation(); handleEditMainTopic(topic); }} className="p-1"><Edit2 className="w-3 h-3" /></button><button onClick={(e) => { e.stopPropagation(); openDeleteModal({ type: 'mainTopic', id: topic.id, name: topic.title }); }} className="p-1 text-red-600"><Trash2 className="w-3 h-3" /></button></div></div>
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
                    <div className="flex items-center justify-between"><h4 className="font-medium">{subtopic.title}</h4><div className="flex space-x-1"><button onClick={(e) => { e.stopPropagation(); handleEditSubtopic(subtopic); }} className="p-1"><Edit2 className="w-3 h-3" /></button><button onClick={(e) => { e.stopPropagation(); openDeleteModal({ type: 'subtopic', id: subtopic.id, name: subtopic.title }); }} className="p-1 text-red-600"><Trash2 className="w-3 h-3" /></button></div></div>
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
                        <div className="flex items-center space-x-3">{getFileIcon(material)}<div><h4 className="font-medium">{material.description}</h4></div></div>
                        <button onClick={(e) => { e.stopPropagation(); openDeleteModal({ type: 'material', id: material.id, name: material.description }); }} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
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


export default HanCurriculum;   



