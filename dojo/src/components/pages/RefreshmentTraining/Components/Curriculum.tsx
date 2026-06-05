import React, { useState, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, Upload, Grid3X3, List, File, Image,
  Link as LinkIcon, X, BookOpen, Folder
} from 'lucide-react';
import ConfirmModal from './modal';

const API_BASE = 'http://127.0.0.1:8000';

interface TrainingCategory {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

interface TrainingTopic {
  id: number;
  category: TrainingCategory;
  category_id: number;
  topic: string;
  description: string;
  created_at: string;
}

interface UploadedFile {
  id: number;
  curriculum: number;
  content_name: string;
  content_type: 'document' | 'image' | 'link';
  file?: string | null;
  link?: string | null;
  uploaded_at: string;
}

interface CurriculumProps {
  selectedCategoryId: number | string | null;
  selectedTopicId: number | string | null;
  setSelectedCategoryId: (categoryId: number | string | null) => void;
  setSelectedTopicId: (topicId: number | string | null) => void;
}

type DeleteTarget =
  | { type: 'category'; id: number; name: string }
  | { type: 'topic'; id: number; name: string }
  | { type: 'file'; id: number; name: string }
  | null;

const Curriculum: React.FC<CurriculumProps> = ({
  selectedCategoryId: propSelectedCategoryId,
  selectedTopicId: propSelectedTopicId,
  setSelectedCategoryId: setPropSelectedCategoryId,
  setSelectedTopicId: setPropSelectedTopicId,
}) => {
  // Modal state for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  // ... rest of your state
  const [pendingTopicId, setPendingTopicId] = useState<number | string | null>(null);
  const [categories, setCategories] = useState<TrainingCategory[]>([]);
  const [topics, setTopics] = useState<TrainingTopic[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<TrainingCategory | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<TrainingTopic | null>(null);

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingCategory, setEditingCategory] = useState<TrainingCategory | null>(null);
  const [editingTopic, setEditingTopic] = useState<TrainingTopic | null>(null);

  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [topicForm, setTopicForm] = useState({ topic: '', description: '' });
  const [uploadForm, setUploadForm] = useState({
    content_name: '',
    content_type: 'document' as 'document' | 'image' | 'link',
    file: null as File | null,
    link: '',
  });

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Sync selectedCategory with propSelectedCategoryId (on refresh or prop change)
  useEffect(() => {
    if (propSelectedCategoryId != null && categories.length > 0) {
      const cat = categories.find(c => c.id === propSelectedCategoryId) || null;
      setSelectedCategory(cat);
    }
  }, [propSelectedCategoryId, categories]);

  // Fetch topics when selectedCategory changes
  useEffect(() => {
    if (selectedCategory) {
      fetchTopics(selectedCategory.id);
      setPropSelectedCategoryId(selectedCategory.id);
    } else {
      setTopics([]);
      setSelectedTopic(null);
      setPropSelectedTopicId(null);
    }
  }, [selectedCategory]);

  // When propSelectedTopicId changes (from Training), store it in pendingTopicId
  useEffect(() => {
    if (propSelectedTopicId != null) {
      setPendingTopicId(propSelectedTopicId);
    }
  }, [propSelectedTopicId]);

  // Sync selectedTopic with pendingTopicId and topics after topics load
  useEffect(() => {
    if (topics.length === 0) return;
    if (pendingTopicId != null) {
      const topicId = typeof pendingTopicId === 'string' ? parseInt(pendingTopicId) : pendingTopicId;
      const matchedTopic = topics.find(t => t.id === topicId);
      if (matchedTopic) {
        setSelectedTopic(matchedTopic);
        setPropSelectedTopicId(matchedTopic.id);
      } else if (topics.length > 0) {
        setSelectedTopic(topics[0]);
        setPropSelectedTopicId(topics[0].id);
      }
      setPendingTopicId(null);
    } else if (!selectedTopic && topics.length > 0) {
      setSelectedTopic(topics[0]);
      setPropSelectedTopicId(topics[0].id);
    }
  }, [topics]);

  // Fetch files when selectedTopic changes
  useEffect(() => {
    if (selectedTopic) {
      fetchFiles(selectedTopic.id);
      setPropSelectedTopicId(selectedTopic.id);
    } else {
      setUploadedFiles([]);
    }
  }, [selectedTopic]);

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/training-categories/`);
      if (res.ok) {
        const data: TrainingCategory[] = await res.json();
        setCategories(data);
        if (propSelectedCategoryId == null && data.length > 0) {
          setSelectedCategory(data[0]);
          setPropSelectedCategoryId(data[0].id);
        }
      } else {
        console.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch topics filtered by category from backend
  const fetchTopics = async (categoryId: number) => {
    try {
      const res = await fetch(`${API_BASE}/curriculums/?category_id=${categoryId}`);
      if (res.ok) {
        const data: TrainingTopic[] = await res.json();
        setTopics(data);
        setSelectedTopic(null);
        setUploadedFiles([]);
        if (propSelectedTopicId != null) {
          const matched = data.find(t => t.id === propSelectedTopicId);
          if (matched) {
            setSelectedTopic(matched);
            setPropSelectedTopicId(matched.id);
            return;
          }
        }
        if (data.length > 0) {
          setSelectedTopic(data[0]);
          setPropSelectedTopicId(data[0].id);
        } else {
          setPropSelectedTopicId(null);
        }
      } else {
        console.error('Failed to fetch topics');
        setTopics([]);
        setSelectedTopic(null);
        setUploadedFiles([]);
        setPropSelectedTopicId(null);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
      setTopics([]);
      setSelectedTopic(null);
      setUploadedFiles([]);
      setPropSelectedTopicId(null);
    }
  };

  // Fetch files for selected topic
  const fetchFiles = async (topicId: number) => {
    try {
      const res = await fetch(`${API_BASE}/curriculum-contents/?curriculum=${topicId}`);
      if (res.ok) {
        const data = await res.json();
        setUploadedFiles(data);
      } else {
        console.error('Failed to fetch files');
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  // Category CRUD
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      const res = await fetch(`${API_BASE}/training-categories/${editingCategory.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm),
      });
      if (res.ok) {
        await fetchCategories();
        setEditingCategory(null);
        setShowCategoryForm(false);
        setCategoryForm({ name: '', description: '' });
      } else {
        console.error('Failed to update category');
      }
    } else {
      const res = await fetch(`${API_BASE}/training-categories/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm),
      });
      if (res.ok) {
        const newCategory = await res.json();
        setCategories((prev) => [...prev, newCategory]);
        setSelectedCategory(newCategory);
        setPropSelectedCategoryId(newCategory.id);
        setShowCategoryForm(false);
        setCategoryForm({ name: '', description: '' });
      } else {
        console.error('Failed to add category');
      }
    }
  };

  const handleEditCategory = (category: TrainingCategory) => {
    setEditingCategory(category);
    setCategoryForm({ name: category.name, description: category.description });
    setShowCategoryForm(true);
  };

  // OPEN MODAL for delete category
  const handleAskDeleteCategory = (category: TrainingCategory) => {
    setDeleteTarget({ type: 'category', id: category.id, name: category.name });
    setShowDeleteModal(true);
  };

  // Topic CRUD
  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    if (editingTopic) {
      const res = await fetch(`${API_BASE}/curriculums/${editingTopic.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicForm.topic,
          description: topicForm.description,
          category_id: selectedCategory.id,
        }),
      });
      if (res.ok) {
        const updatedTopic = await res.json();
        setTopics((prev) => prev.map((t) => (t.id === updatedTopic.id ? updatedTopic : t)));
        setEditingTopic(null);
        setShowTopicForm(false);
        setTopicForm({ topic: '', description: '' });
      } else {
        console.error('Failed to update topic');
      }
    } else {
      const res = await fetch(`${API_BASE}/curriculums/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicForm.topic,
          description: topicForm.description,
          category_id: selectedCategory.id,
        }),
      });
      if (res.ok) {
        const newTopic = await res.json();
        setTopics((prev) => [...prev, newTopic]);
        setSelectedTopic(newTopic);
        setPropSelectedTopicId(newTopic.id);
        setShowTopicForm(false);
        setTopicForm({ topic: '', description: '' });
      } else {
        console.error('Failed to add topic');
      }
    }
  };

  const handleEditTopic = (topic: TrainingTopic) => {
    setEditingTopic(topic);
    setTopicForm({ topic: topic.topic, description: topic.description });
    setShowTopicForm(true);
  };

  // OPEN MODAL for delete topic
  const handleAskDeleteTopic = (topic: TrainingTopic) => {
    setDeleteTarget({ type: 'topic', id: topic.id, name: topic.topic });
    setShowDeleteModal(true);
  };

  // File CRUD
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopic) return;
    const formData = new FormData();
    formData.append('curriculum', String(selectedTopic.id));
    formData.append('content_name', uploadForm.content_name);
    formData.append('content_type', uploadForm.content_type);
    if (uploadForm.content_type === 'link') {
      formData.append('link', uploadForm.link);
    } else if (uploadForm.file) {
      formData.append('file', uploadForm.file);
    }
    const res = await fetch(`${API_BASE}/curriculum-contents/`, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      fetchFiles(selectedTopic.id);
      setShowUploadForm(false);
      setUploadForm({ content_name: '', content_type: 'document', file: null, link: '' });
    } else {
      console.error('Failed to upload file');
    }
  };

  // OPEN MODAL for delete file
  const handleAskDeleteFile = (file: UploadedFile) => {
    setDeleteTarget({ type: 'file', id: file.id, name: file.content_name });
    setShowDeleteModal(true);
  };

  // Modal Confirm Logic
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'category') {
      const res = await fetch(`${API_BASE}/training-categories/${deleteTarget.id}/`, { method: 'DELETE' });
      if (res.ok) {
        await fetchCategories();
        if (selectedCategory?.id === deleteTarget.id) {
          setSelectedCategory(null);
          setPropSelectedCategoryId(null);
          setTopics([]);
          setSelectedTopic(null);
          setPropSelectedTopicId(null);
        }
      } else {
        console.error('Failed to delete category');
      }
    } else if (deleteTarget.type === 'topic') {
      const res = await fetch(`${API_BASE}/curriculums/${deleteTarget.id}/`, { method: 'DELETE' });
      if (res.ok) {
        setTopics((prev) => prev.filter((t) => t.id !== deleteTarget.id));
        if (selectedTopic?.id === deleteTarget.id) {
          setSelectedTopic(null);
          setPropSelectedTopicId(null);
        }
      } else {
        console.error('Failed to delete topic');
      }
    } else if (deleteTarget.type === 'file') {
      const res = await fetch(`${API_BASE}/curriculum-contents/${deleteTarget.id}/`, { method: 'DELETE' });
      if (res.ok && selectedTopic) {
        fetchFiles(selectedTopic.id);
      } else {
        console.error('Failed to delete file');
      }
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  // Helpers
  const getTopicFiles = (topicId: number) =>
    uploadedFiles.filter((file) => file.curriculum === topicId);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-5 h-5" />;
      case 'link':
        return <LinkIcon className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* <div className="h-screen flex flex-col"> */}

        {/* 1. New Header */}
        <header className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800">
          Curriculum
        </h1>
    </header>
      <div className="flex flex-1 overflow-hidden">

    
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">

        {/* Categories */}
        <div className="p-6 border-b border-gray-200">
          {/* <h1 className="text-xl font-semibold text-gray-800">Curriculum</h1> */}

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Training Categories</h2>
            <button
              onClick={() => setShowCategoryForm(true)}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {showCategoryForm && (
            <form onSubmit={handleCategorySubmit} className="space-y-3 bg-gray-50 p-4 rounded-lg mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  {editingCategory ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryForm(false);
                    setEditingCategory(null);
                    setCategoryForm({ name: '', description: '' });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedCategory?.id === category.id
                    ? 'bg-blue-50 border-2 border-blue-200'
                    : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                onClick={() => {
                  setSelectedCategory(category);
                  setPropSelectedCategoryId(category.id);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Folder className="w-4 h-4 text-blue-600" />
                      <h3 className="font-medium text-gray-800">{category.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCategory(category);
                      }}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAskDeleteCategory(category);
                      }}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Topics */}
        {selectedCategory && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Topics</h3>
              <button
                onClick={() => setShowTopicForm(true)}
                className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {showTopicForm && (
              <form onSubmit={handleTopicSubmit} className="space-y-3 bg-gray-50 p-4 rounded-lg mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topic Name
                  </label>
                  <input
                    type="text"
                    value={topicForm.topic}
                    onChange={(e) => setTopicForm((prev) => ({ ...prev, topic: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={topicForm.description}
                    onChange={(e) => setTopicForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                  >
                    {editingTopic ? 'Update' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTopicForm(false);
                      setEditingTopic(null);
                      setTopicForm({ topic: '', description: '' });
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            <div className="space-y-2">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedTopic?.id === topic.id
                      ? 'bg-green-50 border-2 border-green-200'
                      : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  onClick={() => {
                    setSelectedTopic(topic);
                    setPropSelectedTopicId(topic.id);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{topic.topic}</h4>
                      <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTopic(topic);
                        }}
                        className="text-green-600 hover:text-green-800 p-1"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAskDeleteTopic(topic);
                        }}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {selectedTopic ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{selectedTopic.topic}</h3>
                  <p className="text-gray-600 mt-1">{selectedTopic.description}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Category: {selectedCategory?.name}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex bg-gray-200 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => setShowUploadForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload</span>
                  </button>
                </div>
              </div>
              {showUploadForm && (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">Upload Content</h4>
                    <button
                      onClick={() => setShowUploadForm(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <form onSubmit={handleFileUpload} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Content Name
                        </label>
                        <input
                          type="text"
                          value={uploadForm.content_name}
                          onChange={(e) => setUploadForm((prev) => ({ ...prev, content_name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Content Type
                        </label>
                        <select
                          value={uploadForm.content_type}
                          onChange={(e) => setUploadForm((prev) => ({
                            ...prev,
                            content_type: e.target.value as any,
                            file: null,
                            link: '',
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="document">Document | Videos</option>
                          <option value="image">Image</option>
                          <option value="link">Web Link</option>
                        </select>
                      </div>
                    </div>
                    {uploadForm.content_type === 'link' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          URL
                        </label>
                        <input
                          type="url"
                          value={uploadForm.link}
                          onChange={(e) => setUploadForm((prev) => ({ ...prev, link: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://example.com"
                          required
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          File
                        </label>
                        <input
                          type="file"
                          onChange={(e) => setUploadForm((prev) => ({
                            ...prev,
                            file: e.target.files?.[0] || null,
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          accept={uploadForm.content_type === 'image' ? 'image/*' : '*/*'}
                          required
                        />
                      </div>
                    )}
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowUploadForm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                      >
                        Upload
                      </button>
                    </div>
                  </form>
                </div>
              )}
              <div className="space-y-4">
                {uploadedFiles.length > 0 ? (
                  viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {uploadedFiles.map((file) => (
                        <div key={file.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              {getFileIcon(file.content_type)}
                              <h4 className="font-medium text-gray-800 break-words text-sm">{file.content_name}</h4>
                            </div>
                            <button
                              onClick={() => handleAskDeleteFile(file)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            Type: {file.content_type.charAt(0).toUpperCase() + file.content_type.slice(1)}
                          </div>
                          {file.content_type === 'link' ? (
                            <a
                              href={file.link || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm truncate block"
                            >
                              {file.link}
                            </a>
                          ) : (
                            file.file && (
                              <a
                                href={file.file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm truncate block"
                              >
                                {file.file.split('/').pop()}
                              </a>
                            )
                          )}
                          <div className="text-xs text-gray-400 mt-2">
                            Uploaded: {new Date(file.uploaded_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {uploadedFiles.map((file) => (
                        <div key={file.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getFileIcon(file.content_type)}
                            <div>
                              <h4 className="font-medium text-gray-800">{file.content_name}</h4>
                              <div className="text-sm text-gray-500">
                                {file.content_type.charAt(0).toUpperCase() + file.content_type.slice(1)} • {new Date(file.uploaded_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAskDeleteFile(file)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="text-center py-12">
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No content uploaded yet</h3>
                    <p className="text-gray-600 mb-4">Upload documents, images, or web links for this topic</p>
                    <button
                      onClick={() => setShowUploadForm(true)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                    >
                      Upload Content
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : selectedCategory ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No topic selected</h3>
              <p className="text-gray-600">Select a topic from the left sidebar or create a new one</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No category selected</h3>
              <p className="text-gray-600">Select a category from the left sidebar or create a new one</p>
            </div>
          )}
        </div>
      </div>
       </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <ConfirmModal
          title={`Delete ${deleteTarget.type.charAt(0).toUpperCase() + deleteTarget.type.slice(1)}`}
          message={`Are you sure you want to delete "${deleteTarget.name}"?`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default Curriculum;
