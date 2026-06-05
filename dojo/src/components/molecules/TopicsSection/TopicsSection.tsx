// TopicsSection.tsx
import React, { useState, useEffect } from "react";
import { ojtApi } from "../../hooks/ServiceApis";
import { FileText, Plus, Trash2, Edit3, Save, X } from "lucide-react";

interface Topic {
  id?: number;
  topic_id?: number;
  topic_name?: string;
  topic?: string;
  sl_no?: number;
  category?: string;
}

interface TransformedTopic {
  id: number;
  name: string;
  sl_no?: number;
  category?: string;
}

interface TopicsSectionProps {
  selectedDepartment: number | null;
  selectedLevel: number | null;
}

const TopicsSection: React.FC<TopicsSectionProps> = ({
  selectedDepartment,
  selectedLevel
}) => {
  const [topics, setTopics] = useState<TransformedTopic[]>([]);
  const [newTopic, setNewTopic] = useState<string>("");
  const [newTopicCategory, setNewTopicCategory] = useState<string>("");
  const [editingTopicId, setEditingTopicId] = useState<number | null>(null);
  const [isEditingTopic, setIsEditingTopic] = useState<boolean>(false);

  const categories = ['Technical Knowledge', 'Safety', 'Process', 'Quality', 'Production'];

  const getCategoryColor = (category: string) => {
    const colors = {
      'Technical Knowledge': 'bg-blue-100 text-blue-800 border-blue-200',
      'Safety': 'bg-red-100 text-red-800 border-red-200',
      'Process': 'bg-green-100 text-green-800 border-green-200',
      'Quality': 'bg-purple-100 text-purple-800 border-purple-200',
      'Production': 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Fetch topics when department & level selected
  useEffect(() => {
    if (selectedDepartment && selectedLevel) {
      fetchTopics();
    } else {
      setTopics([]);
    }
  }, [selectedDepartment, selectedLevel]);

  const fetchTopics = async () => {
    try {
      const data: Topic[] = await ojtApi.getTopics(selectedDepartment!, selectedLevel!);
      const transformedTopics: TransformedTopic[] = data.map((topic: Topic) => ({
        id: topic.id || topic.topic_id || 0,
        name: topic.topic || topic.topic_name || "",
        sl_no: topic.sl_no,
        category: topic.category
      }));
      setTopics(transformedTopics);
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  const handleAddTopic = async () => {
    if (!newTopic.trim() || !newTopicCategory.trim() || !selectedDepartment || !selectedLevel) {
      alert("Please fill in all fields and select a department and level");
      return;
    }
    
    try {
      const nextSlNo = topics.length > 0 ? Math.max(...topics.map(t => t.sl_no || 0)) + 1 : 1;
      
      const created = await ojtApi.createTopic({
        sl_no: nextSlNo,
        topic: newTopic,
        category: newTopicCategory,
        department: selectedDepartment,
        level: selectedLevel,
      });
      
      const transformedTopic: TransformedTopic = {
        id: created.id || created.topic_id || 0,
        name: created.topic || created.topic_name || "",
        sl_no: created.sl_no,
        category: created.category
      };
      
      setTopics([...topics, transformedTopic]);
      setNewTopic("");
      setNewTopicCategory("");
    } catch (error) {
      console.error("Error adding topic:", error);
    }
  };

  const handleEditTopic = (topic: TransformedTopic) => {
    setEditingTopicId(topic.id);
    setNewTopic(topic.name);
    setNewTopicCategory(topic.category || '');
    setIsEditingTopic(true);
  };

  const handleUpdateTopic = async () => {
    if (!newTopic.trim() || !newTopicCategory.trim() || !editingTopicId) {
      alert("Please fill in all fields");
      return;
    }
    
    try {
      const currentTopic = topics.find(t => t.id === editingTopicId);
      if (!currentTopic) {
        alert("Topic not found");
        return;
      }
      
      await ojtApi.updateTopic(editingTopicId, {
        sl_no: currentTopic.sl_no,
        topic: newTopic,
        category: newTopicCategory,
        department: selectedDepartment!,
        level: selectedLevel!,
      });
      
      setTopics(topics.map(t => 
        t.id === editingTopicId ? { ...t, name: newTopic, category: newTopicCategory } : t
      ));
      
      setNewTopic("");
      setNewTopicCategory("");
      setEditingTopicId(null);
      setIsEditingTopic(false);
    } catch (error) {
      console.error("Error updating topic:", error);
    }
  };

  const handleCancelEdit = () => {
    setNewTopic("");
    setNewTopicCategory("");
    setEditingTopicId(null);
    setIsEditingTopic(false);
  };

  const removeTrainingTopic = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this topic?")) {
      return;
    }
    
    try {
      await ojtApi.deleteTopic(id);
      setTopics(topics.filter(t => t.id !== id));
      
      if (editingTopicId === id) {
        handleCancelEdit();
      }
    } catch (error) {
      console.error("Error deleting topic:", error);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-600" />
        Quality Training Topics
      </h3>

      {/* Add/Edit Topic */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <h4 className="font-semibold text-gray-700 mb-3">
          {isEditingTopic ? 'Edit Topic' : 'Add New Topic'}
        </h4>
        <div className="space-y-3">
          <input
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="Enter topic description"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={newTopicCategory}
            onChange={(e) => setNewTopicCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={isEditingTopic ? handleUpdateTopic : handleAddTopic}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditingTopic ? (
                <>
                  <Save className="w-4 h-4" />
                  Update
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add
                </>
              )}
            </button>
            {isEditingTopic && (
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Existing Topics */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {!selectedDepartment || !selectedLevel ? (
          <div className="p-3 text-center text-gray-500 text-sm">
            Please select a department and level to view topics
          </div>
        ) : topics.length === 0 ? (
          <div className="p-3 text-center text-gray-500 text-sm">
            No topics found for the selected department and level
          </div>
        ) : (
          topics.map((topic) => (
            <div key={topic.id} className={`p-3 rounded-lg border ${editingTopicId === topic.id ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{topic.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {topic.sl_no && (
                      <span className="text-xs text-gray-500">SL: {topic.sl_no}</span>
                    )}
                    {topic.category && (
                      <span className={`inline-block px-1 py-0.5 rounded text-xs font-semibold ${getCategoryColor(topic.category)}`}>
                        {topic.category}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditTopic(topic)}
                    className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeTrainingTopic(topic.id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TopicsSection;