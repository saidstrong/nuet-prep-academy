"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Plus, BookOpen, Users, Clock, Target, Edit2, Trash2, Eye,
  ChevronRight, ChevronDown, Search, Filter, Star, PlayCircle, 
  FileText, Presentation, Video, Link, Upload, Settings, MoreVertical,
  Save, X, ArrowLeft, FolderOpen, TestTube, FileImage, Music
} from 'lucide-react';

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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  totalTopics: number;
  totalTests: number;
  enrolledStudents: number;
  completionRate: number;
}

interface Topic {
  id: string;
  title: string;
  description: string;
  order: number;
  courseId: string;
  materials: Material[];
  tests: Test[];
  subtopics: Subtopic[];
}

interface Subtopic {
  id: string;
  title: string;
  description: string;
  order: number;
  topicId: string;
  materials: Material[];
  tests: Test[];
}

interface Material {
  id: string;
  title: string;
  description: string;
  type: 'PDF' | 'VIDEO' | 'AUDIO' | 'LINK' | 'PRESENTATION' | 'TEXT';
  url?: string;
  content?: string;
  order: number;
  topicId?: string;
  subtopicId?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Test {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalPoints: number;
  topicId?: string;
  subtopicId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CourseContentPage({ params }: { params: { courseId: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [expandedSubtopics, setExpandedSubtopics] = useState<Set<string>>(new Set());

  // Form states
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [showSubtopicForm, setShowSubtopicForm] = useState(false);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [showTestForm, setShowTestForm] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editingSubtopic, setEditingSubtopic] = useState<Subtopic | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editingTest, setEditingTest] = useState<Test | null>(null);

  const [topicForm, setTopicForm] = useState({
    title: '',
    description: '',
    order: 0
  });

  const [subtopicForm, setSubtopicForm] = useState({
    topicId: '',
    title: '',
    description: '',
    order: 0
  });

  const [materialForm, setMaterialForm] = useState({
    topicId: '',
    subtopicId: '',
    title: '',
    description: '',
    type: 'TEXT' as 'PDF' | 'VIDEO' | 'AUDIO' | 'LINK' | 'PRESENTATION' | 'TEXT',
    url: '',
    content: '',
    order: 0
  });

  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [testForm, setTestForm] = useState({
    topicId: '',
    subtopicId: '',
    title: '',
    description: '',
    duration: 60,
    totalPoints: 100,
    order: 0
  });

  // Form submission handlers
  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const response = await fetch('/api/admin/courses/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: params.courseId,
          ...topicForm
        })
      });

      if (response.ok) {
        await fetchData();
        setShowTopicForm(false);
        setEditingTopic(null);
        setTopicForm({ title: '', description: '', order: 0 });
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to create topic'}`);
      }
    } catch (error) {
      console.error('Error creating topic:', error);
      alert('Error creating topic');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubtopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const response = await fetch('/api/admin/courses/subtopics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...subtopicForm
        })
      });

      if (response.ok) {
        await fetchData();
        setShowSubtopicForm(false);
        setEditingSubtopic(null);
        setSubtopicForm({ topicId: '', title: '', description: '', order: 0 });
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to create subtopic'}`);
      }
    } catch (error) {
      console.error('Error creating subtopic:', error);
      alert('Error creating subtopic');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMaterialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const response = await fetch('/api/admin/courses/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...materialForm
        })
      });

      if (response.ok) {
        await fetchData();
        setShowMaterialForm(false);
        setEditingMaterial(null);
        setMaterialForm({ 
          topicId: '', 
          subtopicId: '', 
          title: '', 
          description: '', 
          type: 'TEXT', 
          url: '', 
          content: '', 
          order: 0 
        });
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to create material'}`);
      }
    } catch (error) {
      console.error('Error creating material:', error);
      alert('Error creating material');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const response = await fetch('/api/admin/courses/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testForm
        })
      });

      if (response.ok) {
        await fetchData();
        setShowTestForm(false);
        setEditingTest(null);
        setTestForm({ 
          topicId: '', 
          subtopicId: '', 
          title: '', 
          description: '', 
          duration: 30, 
          totalPoints: 100, 
          order: 0 
        });
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to create test'}`);
      }
    } catch (error) {
      console.error('Error creating test:', error);
      alert('Error creating test');
    } finally {
      setActionLoading(false);
    }
  };

  // File upload handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-set the title if not already set
      if (!materialForm.title) {
        setMaterialForm(prev => ({ ...prev, title: file.name.split('.')[0] }));
      }
      // Auto-set the type based on file extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      let type = 'TEXT';
      if (extension === 'pdf') type = 'PDF';
      else if (['mp4', 'avi', 'mov', 'wmv'].includes(extension || '')) type = 'VIDEO';
      else if (['mp3', 'wav', 'aac', 'ogg'].includes(extension || '')) type = 'AUDIO';
      else if (['ppt', 'pptx'].includes(extension || '')) type = 'PRESENTATION';
      setMaterialForm(prev => ({ ...prev, type: type as any }));
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', materialForm.type);

    const response = await fetch('/api/materials/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('File upload failed');
    }

    const result = await response.json();
    return result.url;
  };

  const handleMaterialSubmitWithFile = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setIsUploading(true);

    try {
      let fileUrl = materialForm.url || materialForm.content;

      // Upload file if one is selected
      if (selectedFile) {
        setUploadProgress(0);
        fileUrl = await uploadFile(selectedFile);
        setUploadProgress(100);
      }

      const response = await fetch('/api/admin/courses/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...materialForm,
          url: fileUrl,
          content: fileUrl,
          fileName: selectedFile?.name || '',
          fileSize: selectedFile?.size || 0,
          mimeType: selectedFile?.type || '',
          isPublished: true
        })
      });

      if (response.ok) {
        await fetchData();
        setShowMaterialForm(false);
        setEditingMaterial(null);
        setSelectedFile(null);
        setUploadProgress(0);
        setMaterialForm({ 
          topicId: '', 
          subtopicId: '', 
          title: '', 
          description: '', 
          type: 'TEXT', 
          url: '', 
          content: '', 
          order: 0 
        });
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to create material'}`);
      }
    } catch (error) {
      console.error('Error creating material:', error);
      alert('Error creating material');
    } finally {
      setActionLoading(false);
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchData();
    }
  }, [session, params.courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching course content for courseId:', params.courseId);
      
      const [courseRes, topicsRes, subtopicsRes, materialsRes, testsRes] = await Promise.all([
        fetch(`/api/admin/courses/${params.courseId}`),
        fetch('/api/admin/courses/topics-simple'),
        fetch('/api/admin/courses/subtopics-simple'),
        fetch('/api/admin/courses/materials-simple'),
        fetch('/api/admin/courses/tests-simple')
      ]);

      console.log('📡 Course response status:', courseRes.status);
      console.log('📡 Course response ok:', courseRes.ok);

      if (courseRes.ok) {
        const courseData = await courseRes.json();
        console.log('✅ Course data received:', courseData);
        setCourse(courseData.course);
      } else {
        const errorData = await courseRes.json();
        console.error('❌ Course fetch failed:', errorData);
      }

      if (topicsRes.ok) {
        const topicsData = await topicsRes.json();
        setTopics(topicsData.topics.filter((topic: Topic) => topic.courseId === params.courseId));
      }

      if (subtopicsRes.ok) {
        const subtopicsData = await subtopicsRes.json();
        setSubtopics(subtopicsData.subtopics);
      }

      if (materialsRes.ok) {
        const materialsData = await materialsRes.json();
        setMaterials(materialsData.materials);
      }

      if (testsRes.ok) {
        const testsData = await testsRes.json();
        setTests(testsData.tests);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTopicExpansion = (topicId: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

  const toggleSubtopicExpansion = (subtopicId: string) => {
    const newExpanded = new Set(expandedSubtopics);
    if (newExpanded.has(subtopicId)) {
      newExpanded.delete(subtopicId);
    } else {
      newExpanded.add(subtopicId);
    }
    setExpandedSubtopics(newExpanded);
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FileText className="w-4 h-4" />;
      case 'VIDEO': return <PlayCircle className="w-4 h-4" />;
      case 'AUDIO': return <Music className="w-4 h-4" />;
      case 'LINK': return <Link className="w-4 h-4" />;
      case 'PRESENTATION': return <Presentation className="w-4 h-4" />;
      case 'TEXT': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getMaterialColor = (type: string) => {
    switch (type) {
      case 'PDF': return 'text-red-600 bg-red-50';
      case 'VIDEO': return 'text-blue-600 bg-blue-50';
      case 'AUDIO': return 'text-purple-600 bg-purple-50';
      case 'LINK': return 'text-green-600 bg-green-50';
      case 'PRESENTATION': return 'text-orange-600 bg-orange-50';
      case 'TEXT': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course content...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h2>
          <button
            onClick={() => router.push('/admin/courses')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/courses')}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-gray-600">Course Content Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowTopicForm(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Topic
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Course Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Topics</p>
                  <p className="text-2xl font-bold text-gray-900">{topics.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Materials</p>
                  <p className="text-2xl font-bold text-gray-900">{materials.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TestTube className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tests</p>
                  <p className="text-2xl font-bold text-gray-900">{tests.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Students</p>
                  <p className="text-2xl font-bold text-gray-900">{course.enrolledStudents}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Topics List */}
          <div className="space-y-4">
            {topics.map((topic) => (
              <div key={topic.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Topic Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => toggleTopicExpansion(topic.id)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        {expandedTopics.has(topic.id) ? 
                          <ChevronDown className="w-5 h-5" /> : 
                          <ChevronRight className="w-5 h-5" />
                        }
                      </button>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{topic.title}</h3>
                        {topic.description && (
                          <p className="text-gray-600 mt-1">{topic.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSubtopicForm({ ...subtopicForm, topicId: topic.id });
                          setShowSubtopicForm(true);
                        }}
                        className="flex items-center px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Subtopic
                      </button>
                      <button
                        onClick={() => {
                          setMaterialForm({ ...materialForm, topicId: topic.id, subtopicId: '' });
                          setShowMaterialForm(true);
                        }}
                        className="flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Material
                      </button>
                      <button
                        onClick={() => {
                          setTestForm({ ...testForm, topicId: topic.id, subtopicId: '' });
                          setShowTestForm(true);
                        }}
                        className="flex items-center px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Test
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedTopics.has(topic.id) && (
                  <div className="p-6 bg-gray-50">
                    {/* Subtopics */}
                    {subtopics.filter(subtopic => subtopic.topicId === topic.id).map((subtopic) => (
                      <div key={subtopic.id} className="mb-4 bg-white rounded-lg border border-gray-200">
                        <div className="p-4 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => toggleSubtopicExpansion(subtopic.id)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                {expandedSubtopics.has(subtopic.id) ? 
                                  <ChevronDown className="w-4 h-4" /> : 
                                  <ChevronRight className="w-4 h-4" />
                                }
                              </button>
                              <div>
                                <h4 className="font-medium text-gray-900">{subtopic.title}</h4>
                                {subtopic.description && (
                                  <p className="text-sm text-gray-600">{subtopic.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => {
                                  setMaterialForm({ ...materialForm, topicId: '', subtopicId: subtopic.id });
                                  setShowMaterialForm(true);
                                }}
                                className="flex items-center px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Material
                              </button>
                              <button
                                onClick={() => {
                                  setTestForm({ ...testForm, topicId: '', subtopicId: subtopic.id });
                                  setShowTestForm(true);
                                }}
                                className="flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Test
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Subtopic Content */}
                        {expandedSubtopics.has(subtopic.id) && (
                          <div className="p-4 space-y-3">
                            {/* Materials */}
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Materials</h5>
                              <div className="space-y-2">
                                {materials.filter(material => material.subtopicId === subtopic.id).map((material) => (
                                  <div key={material.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                      <div className={`p-2 rounded-lg ${getMaterialColor(material.type)}`}>
                                        {getMaterialIcon(material.type)}
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-900">{material.title}</p>
                                        <p className="text-sm text-gray-600">{material.type}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <button className="p-1 text-gray-400 hover:text-blue-600">
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button className="p-1 text-gray-400 hover:text-red-600">
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Tests */}
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Tests</h5>
                              <div className="space-y-2">
                                {tests.filter(test => test.subtopicId === subtopic.id).map((test) => (
                                  <div key={test.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                      <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                        <TestTube className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-900">{test.title}</p>
                                        <p className="text-sm text-gray-600">{test.duration}min • {test.totalPoints}pts</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <button className="p-1 text-gray-400 hover:text-blue-600">
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button className="p-1 text-gray-400 hover:text-red-600">
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Topic Materials */}
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Materials</h5>
                      <div className="space-y-2">
                        {materials.filter(material => material.topicId === topic.id && !material.subtopicId).map((material) => (
                          <div key={material.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${getMaterialColor(material.type)}`}>
                                {getMaterialIcon(material.type)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{material.title}</p>
                                <p className="text-sm text-gray-600">{material.type}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <button className="p-1 text-gray-400 hover:text-blue-600">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-red-600">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Topic Tests */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Tests</h5>
                      <div className="space-y-2">
                        {tests.filter(test => test.topicId === topic.id && !test.subtopicId).map((test) => (
                          <div key={test.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                <TestTube className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{test.title}</p>
                                <p className="text-sm text-gray-600">{test.duration}min • {test.totalPoints}pts</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <button className="p-1 text-gray-400 hover:text-blue-600">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-red-600">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {topics.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No topics yet</h3>
                <p className="text-gray-600 mb-6">Start building your course by adding topics and content.</p>
                <button
                  onClick={() => setShowTopicForm(true)}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add First Topic
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Topic Form Modal */}
      {showTopicForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingTopic ? 'Edit Topic' : 'Add New Topic'}
            </h3>
            <form onSubmit={handleTopicSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={topicForm.title}
                    onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={topicForm.description}
                    onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    value={topicForm.order}
                    onChange={(e) => setTopicForm({ ...topicForm, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowTopicForm(false);
                    setEditingTopic(null);
                    setTopicForm({ title: '', description: '', order: 0 });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : (editingTopic ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subtopic Form Modal */}
      {showSubtopicForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingSubtopic ? 'Edit Subtopic' : 'Add New Subtopic'}
            </h3>
            <form onSubmit={handleSubtopicSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={subtopicForm.title}
                    onChange={(e) => setSubtopicForm({ ...subtopicForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={subtopicForm.description}
                    onChange={(e) => setSubtopicForm({ ...subtopicForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    value={subtopicForm.order}
                    onChange={(e) => setSubtopicForm({ ...subtopicForm, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowSubtopicForm(false);
                    setEditingSubtopic(null);
                    setSubtopicForm({ topicId: '', title: '', description: '', order: 0 });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : (editingSubtopic ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Material Form Modal */}
      {showMaterialForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">
              {editingMaterial ? 'Edit Material' : 'Add New Material'}
            </h3>
            <form onSubmit={handleMaterialSubmitWithFile}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={materialForm.title}
                    onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={materialForm.type}
                    onChange={(e) => setMaterialForm({ ...materialForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="TEXT">Text</option>
                    <option value="PDF">PDF</option>
                    <option value="VIDEO">Video</option>
                    <option value="AUDIO">Audio</option>
                    <option value="LINK">Link</option>
                    <option value="PRESENTATION">Presentation</option>
                  </select>
                </div>

                {/* File Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf,.mp4,.avi,.mov,.wmv,.mp3,.wav,.aac,.ogg,.ppt,.pptx,.doc,.docx,.txt"
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-sm text-gray-600">
                        {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                      </span>
                      <span className="text-xs text-gray-500">
                        PDF, Video, Audio, Presentation, or Text files
                      </span>
                    </label>
                  </div>
                  
                  {selectedFile && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-800">{selectedFile.name}</span>
                        <span className="text-xs text-green-600">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      {isUploading && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-green-600 mt-1 block">
                            Uploading... {uploadProgress}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={materialForm.description}
                    onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                {/* URL/Content - only show if no file selected or type is LINK */}
                {(materialForm.type === 'LINK' || !selectedFile) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {materialForm.type === 'LINK' ? 'URL' : 'Content/URL (optional)'}
                    </label>
                    <input
                      type="text"
                      value={materialForm.url || materialForm.content}
                      onChange={(e) => setMaterialForm({ 
                        ...materialForm, 
                        url: e.target.value,
                        content: e.target.value 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={materialForm.type === 'LINK' ? 'https://example.com' : 'Enter content or URL'}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    value={materialForm.order}
                    onChange={(e) => setMaterialForm({ ...materialForm, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowMaterialForm(false);
                    setEditingMaterial(null);
                    setSelectedFile(null);
                    setUploadProgress(0);
                    setMaterialForm({ 
                      topicId: '', 
                      subtopicId: '', 
                      title: '', 
                      description: '', 
                      type: 'TEXT', 
                      url: '', 
                      content: '', 
                      order: 0 
                    });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || isUploading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : actionLoading ? 'Saving...' : (editingMaterial ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Test Form Modal */}
      {showTestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingTest ? 'Edit Test' : 'Add New Test'}
            </h3>
            <form onSubmit={handleTestSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={testForm.title}
                    onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={testForm.description}
                    onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={testForm.duration}
                      onChange={(e) => setTestForm({ ...testForm, duration: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Points
                    </label>
                    <input
                      type="number"
                      value={testForm.totalPoints}
                      onChange={(e) => setTestForm({ ...testForm, totalPoints: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    value={testForm.order}
                    onChange={(e) => setTestForm({ ...testForm, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowTestForm(false);
                    setEditingTest(null);
                    setTestForm({ 
                      topicId: '', 
                      subtopicId: '', 
                      title: '', 
                      description: '', 
                      duration: 30, 
                      totalPoints: 100, 
                      order: 0 
                    });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : (editingTest ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
