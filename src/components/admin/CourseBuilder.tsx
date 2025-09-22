'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronUp, ChevronDown, Save, X, BookOpen, FileText, Video, Link, Upload } from 'lucide-react';

interface Question {
  id: string;
  questionText: string;
  type: 'singleChoice' | 'multipleChoice' | 'shortAnswer';
  options?: string[];
  correctOptions?: number[];
  correctAnswer?: string;
}

interface Test {
  id: string;
  name: string;
  questions: Question[];
}

interface MaterialBlock {
  id: string;
  type: 'text' | 'link' | 'file' | 'youtube';
  content: string;
  label?: string;
  file?: File;
  videoId?: string;
}

interface Material {
  id: string;
  name: string;
  blocks: MaterialBlock[];
}

interface Subtopic {
  id: string;
  name: string;
  subtopics: Subtopic[];
  tests: Test[];
  materials: Material[];
}

interface Topic {
  id: string;
  name: string;
  subtopics: Subtopic[];
  tests: Test[];
  materials: Material[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  difficulty: string;
  estimatedHours: number;
  price: number;
  duration: string;
  maxStudents: number;
  status: string;
  topics: Topic[];
}

interface CourseBuilderProps {
  course?: any; // Accept any course type and handle conversion internally
  onSave: (course: Course) => void;
  onCancel: () => void;
}

export default function CourseBuilder({ course, onSave, onCancel }: CourseBuilderProps) {
  const [courseData, setCourseData] = useState<Course>(() => {
    if (course) {
      return {
        ...course,
        topics: course.topics || []
      };
    }
    return {
      id: '',
      title: '',
      description: '',
      instructor: '',
      difficulty: 'BEGINNER',
      estimatedHours: 1,
      price: 0,
      duration: '',
      maxStudents: 10,
      status: 'DRAFT',
      topics: []
    };
  });

  const [editingTopic, setEditingTopic] = useState<string | null>(null);
  const [editingSubtopic, setEditingSubtopic] = useState<string | null>(null);
  const [newTopicName, setNewTopicName] = useState('');
  const [newSubtopicName, setNewSubtopicName] = useState('');
  const [showTestBuilder, setShowTestBuilder] = useState<{ topicId: string; subtopicId?: string } | null>(null);
  const [showMaterialBuilder, setShowMaterialBuilder] = useState<{ topicId: string; subtopicId?: string } | null>(null);

  const addTopic = () => {
    if (!newTopicName.trim()) return;
    
    const newTopic: Topic = {
      id: `topic-${Date.now()}`,
      name: newTopicName.trim(),
      subtopics: [],
      tests: [],
      materials: []
    };
    
    setCourseData(prev => ({
      ...prev,
      topics: [...prev.topics, newTopic]
    }));
    
    setNewTopicName('');
  };

  const updateTopic = (topicId: string, name: string) => {
    setCourseData(prev => ({
      ...prev,
      topics: prev.topics.map(topic => 
        topic.id === topicId ? { ...topic, name } : topic
      )
    }));
    setEditingTopic(null);
  };

  const deleteTopic = (topicId: string) => {
    setCourseData(prev => ({
      ...prev,
      topics: prev.topics.filter(topic => topic.id !== topicId)
    }));
  };

  const moveTopic = (topicId: string, direction: 'up' | 'down') => {
    setCourseData(prev => {
      const topics = [...prev.topics];
      const index = topics.findIndex(topic => topic.id === topicId);
      
      if (direction === 'up' && index > 0) {
        [topics[index], topics[index - 1]] = [topics[index - 1], topics[index]];
      } else if (direction === 'down' && index < topics.length - 1) {
        [topics[index], topics[index + 1]] = [topics[index + 1], topics[index]];
      }
      
      return { ...prev, topics };
    });
  };

  const addSubtopic = (topicId: string, parentSubtopicId?: string) => {
    if (!newSubtopicName.trim()) return;
    
    const newSubtopic: Subtopic = {
      id: `subtopic-${Date.now()}`,
      name: newSubtopicName.trim(),
      subtopics: [],
      tests: [],
      materials: []
    };
    
    setCourseData(prev => ({
      ...prev,
      topics: prev.topics.map(topic => {
        if (topic.id === topicId) {
          if (parentSubtopicId) {
            // Add to a specific subtopic
            return {
              ...topic,
              subtopics: topic.subtopics.map(subtopic => 
                subtopic.id === parentSubtopicId 
                  ? { ...subtopic, subtopics: [...subtopic.subtopics, newSubtopic] }
                  : subtopic
              )
            };
          } else {
            // Add to topic level
            return { ...topic, subtopics: [...topic.subtopics, newSubtopic] };
          }
        }
        return topic;
      })
    }));
    
    setNewSubtopicName('');
  };

  const updateSubtopic = (topicId: string, subtopicId: string, name: string) => {
    setCourseData(prev => ({
      ...prev,
      topics: prev.topics.map(topic => 
        topic.id === topicId 
          ? {
              ...topic,
              subtopics: topic.subtopics.map(subtopic => 
                subtopic.id === subtopicId ? { ...subtopic, name } : subtopic
              )
            }
          : topic
      )
    }));
    setEditingSubtopic(null);
  };

  const deleteSubtopic = (topicId: string, subtopicId: string) => {
    setCourseData(prev => ({
      ...prev,
      topics: prev.topics.map(topic => 
        topic.id === topicId 
          ? { ...topic, subtopics: topic.subtopics.filter(subtopic => subtopic.id !== subtopicId) }
          : topic
      )
    }));
  };

  const addTest = (topicId: string, subtopicId?: string) => {
    const newTest: Test = {
      id: `test-${Date.now()}`,
      name: 'New Test',
      questions: []
    };
    
    setCourseData(prev => ({
      ...prev,
      topics: prev.topics.map(topic => 
        topic.id === topicId 
          ? {
              ...topic,
              tests: subtopicId 
                ? topic.tests
                : [...topic.tests, newTest],
              subtopics: subtopicId 
                ? topic.subtopics.map(subtopic => 
                    subtopic.id === subtopicId 
                      ? { ...subtopic, tests: [...subtopic.tests, newTest] }
                      : subtopic
                  )
                : topic.subtopics
            }
          : topic
      )
    }));
  };

  const addMaterial = (topicId: string, subtopicId?: string) => {
    const newMaterial: Material = {
      id: `material-${Date.now()}`,
      name: 'New Material',
      blocks: []
    };
    
    setCourseData(prev => ({
      ...prev,
      topics: prev.topics.map(topic => 
        topic.id === topicId 
          ? {
              ...topic,
              materials: subtopicId 
                ? topic.materials
                : [...topic.materials, newMaterial],
              subtopics: subtopicId 
                ? topic.subtopics.map(subtopic => 
                    subtopic.id === subtopicId 
                      ? { ...subtopic, materials: [...subtopic.materials, newMaterial] }
                      : subtopic
                  )
                : topic.subtopics
            }
          : topic
      )
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {course ? 'Edit Course' : 'Create Course'}
            </h1>
            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onSave(courseData)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Course
              </button>
            </div>
          </div>

          {/* Course Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Title *
              </label>
              <input
                type="text"
                value={courseData.title}
                onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter course title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructor *
              </label>
              <input
                type="text"
                value={courseData.instructor}
                onChange={(e) => setCourseData(prev => ({ ...prev, instructor: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter instructor name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={courseData.description}
                onChange={(e) => setCourseData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Enter course description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={courseData.difficulty}
                onChange={(e) => setCourseData(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Topics Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Course Content</h2>
            <button
              onClick={() => setEditingTopic('new')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Topic
            </button>
          </div>

          {/* Add Topic Input */}
          {editingTopic === 'new' && (
            <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter topic name"
                  autoFocus
                />
                <button
                  onClick={addTopic}
                  className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setEditingTopic(null);
                    setNewTopicName('');
                  }}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Topics List */}
          <div className="space-y-4">
            {courseData.topics.map((topic, index) => (
              <TopicRow
                key={topic.id}
                topic={topic}
                index={index}
                totalTopics={courseData.topics.length}
                onUpdate={updateTopic}
                onDelete={deleteTopic}
                onMove={moveTopic}
                onAddSubtopic={addSubtopic}
                onAddTest={addTest}
                onAddMaterial={addMaterial}
                onUpdateSubtopic={updateSubtopic}
                onDeleteSubtopic={deleteSubtopic}
                onEditTest={() => setShowTestBuilder({ topicId: topic.id })}
                onEditMaterial={() => setShowMaterialBuilder({ topicId: topic.id })}
              />
            ))}
          </div>

          {courseData.topics.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No topics yet. Click "Add Topic" to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Test Builder Modal */}
      {showTestBuilder && (
        <TestBuilder
          topicId={showTestBuilder.topicId}
          subtopicId={showTestBuilder.subtopicId}
          onClose={() => setShowTestBuilder(null)}
          onSave={(test: Test) => {
            // Update the course data with the new test
            setCourseData(prev => ({
              ...prev,
              topics: prev.topics.map(topic => {
                if (topic.id === showTestBuilder.topicId) {
                  if (showTestBuilder.subtopicId) {
                    // Add test to subtopic
                    return {
                      ...topic,
                      subtopics: topic.subtopics.map(subtopic => 
                        subtopic.id === showTestBuilder.subtopicId 
                          ? { ...subtopic, tests: [...subtopic.tests, test] }
                          : subtopic
                      )
                    };
                  } else {
                    // Add test to topic
                    return { ...topic, tests: [...topic.tests, test] };
                  }
                }
                return topic;
              })
            }));
            setShowTestBuilder(null);
          }}
        />
      )}

      {/* Material Builder Modal */}
      {showMaterialBuilder && (
        <MaterialBuilder
          topicId={showMaterialBuilder.topicId}
          subtopicId={showMaterialBuilder.subtopicId}
          onClose={() => setShowMaterialBuilder(null)}
          onSave={(material: Material) => {
            // Update the course data with the new material
            setCourseData(prev => ({
              ...prev,
              topics: prev.topics.map(topic => {
                if (topic.id === showMaterialBuilder.topicId) {
                  if (showMaterialBuilder.subtopicId) {
                    // Add material to subtopic
                    return {
                      ...topic,
                      subtopics: topic.subtopics.map(subtopic => 
                        subtopic.id === showMaterialBuilder.subtopicId 
                          ? { ...subtopic, materials: [...subtopic.materials, material] }
                          : subtopic
                      )
                    };
                  } else {
                    // Add material to topic
                    return { ...topic, materials: [...topic.materials, material] };
                  }
                }
                return topic;
              })
            }));
            setShowMaterialBuilder(null);
          }}
        />
      )}
    </div>
  );
}

// Topic Row Component
interface TopicRowProps {
  topic: Topic;
  index: number;
  totalTopics: number;
  onUpdate: (topicId: string, name: string) => void;
  onDelete: (topicId: string) => void;
  onMove: (topicId: string, direction: 'up' | 'down') => void;
  onAddSubtopic: (topicId: string) => void;
  onAddTest: (topicId: string, subtopicId?: string) => void;
  onAddMaterial: (topicId: string, subtopicId?: string) => void;
  onUpdateSubtopic: (topicId: string, subtopicId: string, name: string) => void;
  onDeleteSubtopic: (topicId: string, subtopicId: string) => void;
  onEditTest: () => void;
  onEditMaterial: () => void;
}

function TopicRow({
  topic,
  index,
  totalTopics,
  onUpdate,
  onDelete,
  onMove,
  onAddSubtopic,
  onAddTest,
  onAddMaterial,
  onUpdateSubtopic,
  onDeleteSubtopic,
  onEditTest,
  onEditMaterial
}: TopicRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(topic.name);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showSubtopicInput, setShowSubtopicInput] = useState(false);
  const [newSubtopicName, setNewSubtopicName] = useState('');

  const handleSave = () => {
    if (editName.trim()) {
      onUpdate(topic.id, editName.trim());
      setIsEditing(false);
    }
  };

  const handleAddSubtopic = () => {
    if (newSubtopicName.trim()) {
      onAddSubtopic(topic.id);
      setNewSubtopicName('');
      setShowSubtopicInput(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg">
      {/* Topic Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onMove(topic.id, 'up')}
            disabled={index === 0}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMove(topic.id, 'down')}
            disabled={index === totalTopics - 1}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={handleSave}
                className="p-1 text-green-600 hover:bg-green-100 rounded"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditName(topic.name);
                }}
                className="p-1 text-gray-600 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <h3 className="font-medium text-gray-900">{topic.name}</h3>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(topic.id)}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </button>
            
            {showAddMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    setShowSubtopicInput(true);
                    setShowAddMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Subtopic
                </button>
                <button
                  onClick={() => {
                    onAddTest(topic.id);
                    setShowAddMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Test
                </button>
                <button
                  onClick={() => {
                    onAddMaterial(topic.id);
                    setShowAddMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Material
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Subtopic Input */}
      {showSubtopicInput && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newSubtopicName}
              onChange={(e) => setNewSubtopicName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter subtopic name"
              autoFocus
            />
            <button
              onClick={handleAddSubtopic}
              className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setShowSubtopicInput(false);
                setNewSubtopicName('');
              }}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Subtopics */}
      {topic.subtopics.map((subtopic) => (
        <SubtopicRow
          key={subtopic.id}
          subtopic={subtopic}
          topicId={topic.id}
          onUpdate={onUpdateSubtopic}
          onDelete={onDeleteSubtopic}
          onAddTest={onAddTest}
          onAddMaterial={onAddMaterial}
          onAddSubtopic={onAddSubtopic}
          onEditTest={onEditTest}
          onEditMaterial={onEditMaterial}
        />
      ))}

      {/* Tests */}
      {topic.tests.map((test) => (
        <div key={test.id} className="px-4 py-2 border-t border-gray-100 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-700">{test.name}</span>
              <span className="text-xs text-gray-500">({test.questions?.length || 0} questions)</span>
            </div>
            <button
              onClick={() => onEditTest()}
              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      {/* Materials */}
      {topic.materials.map((material) => (
        <div key={material.id} className="px-4 py-2 border-t border-gray-100 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-700">{material.name}</span>
              <span className="text-xs text-gray-500">({material.blocks?.length || 0} blocks)</span>
            </div>
            <button
              onClick={() => onEditMaterial()}
              className="p-1 text-green-600 hover:bg-green-100 rounded"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Subtopic Row Component
interface SubtopicRowProps {
  subtopic: Subtopic;
  topicId: string;
  onUpdate: (topicId: string, subtopicId: string, name: string) => void;
  onDelete: (topicId: string, subtopicId: string) => void;
  onAddTest: (topicId: string, subtopicId?: string) => void;
  onAddMaterial: (topicId: string, subtopicId?: string) => void;
  onAddSubtopic: (topicId: string, parentSubtopicId?: string) => void;
  onEditTest: () => void;
  onEditMaterial: () => void;
}

function SubtopicRow({
  subtopic,
  topicId,
  onUpdate,
  onDelete,
  onAddTest,
  onAddMaterial,
  onAddSubtopic,
  onEditTest,
  onEditMaterial
}: SubtopicRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(subtopic.name);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showSubtopicInput, setShowSubtopicInput] = useState(false);
  const [newSubtopicName, setNewSubtopicName] = useState('');

  const handleSave = () => {
    if (editName.trim()) {
      onUpdate(topicId, subtopic.id, editName.trim());
      setIsEditing(false);
    }
  };

  const handleAddSubtopic = () => {
    if (newSubtopicName.trim()) {
      onAddSubtopic(topicId, subtopic.id);
      setNewSubtopicName('');
      setShowSubtopicInput(false);
    }
  };

  return (
    <div className="ml-6 border-l-2 border-gray-200 pl-4">
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={handleSave}
                className="p-1 text-green-600 hover:bg-green-100 rounded"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditName(subtopic.name);
                }}
                className="p-1 text-gray-600 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <h4 className="text-sm font-medium text-gray-700">{subtopic.name}</h4>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(topicId, subtopic.id)}
            className="p-1 text-red-600 hover:bg-red-100 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="flex items-center px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </button>
            
            {showAddMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    setShowSubtopicInput(true);
                    setShowAddMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <BookOpen className="w-3 h-3 mr-2" />
                  Subtopic
                </button>
                <button
                  onClick={() => {
                    onAddTest(topicId, subtopic.id);
                    setShowAddMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <FileText className="w-3 h-3 mr-2" />
                  Test
                </button>
                <button
                  onClick={() => {
                    onAddMaterial(topicId, subtopic.id);
                    setShowAddMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <BookOpen className="w-3 h-3 mr-2" />
                  Material
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Subtopic Input */}
      {showSubtopicInput && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newSubtopicName}
              onChange={(e) => setNewSubtopicName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter subtopic name"
              autoFocus
            />
            <button
              onClick={handleAddSubtopic}
              className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setShowSubtopicInput(false);
                setNewSubtopicName('');
              }}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Nested Subtopics */}
      {subtopic.subtopics.map((nestedSubtopic) => (
        <SubtopicRow
          key={nestedSubtopic.id}
          subtopic={nestedSubtopic}
          topicId={topicId}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onAddTest={onAddTest}
          onAddMaterial={onAddMaterial}
          onAddSubtopic={onAddSubtopic}
          onEditTest={onEditTest}
          onEditMaterial={onEditMaterial}
        />
      ))}

      {/* Tests */}
      {subtopic.tests.map((test) => (
        <div key={test.id} className="ml-4 py-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-3 h-3 text-blue-600" />
              <span className="text-xs text-gray-600">{test.name}</span>
            </div>
            <button
              onClick={() => onEditTest()}
              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}

      {/* Materials */}
      {subtopic.materials.map((material) => (
        <div key={material.id} className="ml-4 py-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-3 h-3 text-green-600" />
              <span className="text-xs text-gray-600">{material.name}</span>
            </div>
            <button
              onClick={() => onEditMaterial()}
              className="p-1 text-green-600 hover:bg-green-100 rounded"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Placeholder components for Test and Material builders
function TestBuilder({ topicId, subtopicId, onClose, onSave }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4">Test Builder</h3>
        <p className="text-gray-600">Test builder implementation coming soon...</p>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({})}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function MaterialBuilder({ topicId, subtopicId, onClose, onSave }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4">Material Builder</h3>
        <p className="text-gray-600">Material builder implementation coming soon...</p>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({})}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
