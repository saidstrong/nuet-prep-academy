"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Plus, Edit, Trash2, Eye, BookOpen, Users, Clock, Target,
  FileText, PlayCircle, Calendar, Award, Settings, Search,
  Filter, Download, Upload, Save, X, CheckCircle, AlertCircle,
  ChevronDown, ChevronRight
} from 'lucide-react';
import TestBuilder from './TestBuilder';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedHours: number;
  price: number;
  duration: string;
  maxStudents: number;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
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
  courseId: string;
  title: string;
  description: string;
  order: number;
  isCompleted: boolean;
  materials: Material[];
  subtopics: Subtopic[];
}

interface Subtopic {
  id: string;
  topicId: string;
  title: string;
  description: string;
  order: number;
  isCompleted: boolean;
  materials: Material[];
  tests: Test[];
}

interface Material {
  id: string;
  topicId?: string;
  subtopicId?: string;
  title: string;
  description?: string;
  type: 'PDF' | 'VIDEO' | 'AUDIO' | 'LINK' | 'PRESENTATION';
  url?: string;
  content?: string;
  order: number;
  fileSize?: number;
  fileName?: string;
  mimeType?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Test {
  id: string;
  topicId?: string;
  subtopicId?: string;
  title: string;
  description: string;
  duration: number;
  totalPoints: number;
  isActive: boolean;
  createdAt: string;
  topic?: {
    id: string;
    title: string;
    course: {
      id: string;
      title: string;
    };
  };
  subtopic?: {
    id: string;
    title: string;
    topic: {
      id: string;
      title: string;
      course: {
        id: string;
        title: string;
      };
    };
  };
}

export default function CourseManagement() {
  const { data: session } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [showSubtopicForm, setShowSubtopicForm] = useState(false);
  const [showTestForm, setShowTestForm] = useState(false);
  const [showTestBuilder, setShowTestBuilder] = useState(false);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editingSubtopic, setEditingSubtopic] = useState<Subtopic | null>(null);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [expandedSubtopics, setExpandedSubtopics] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  // Form states
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    instructor: '',
    difficulty: 'BEGINNER' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
    estimatedHours: 1,
    price: 0,
    duration: '',
    maxStudents: 30,
    status: 'ACTIVE' as 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED',
    enrollmentDeadline: '',
    accessStartDate: '',
    accessEndDate: '',
    googleMeetLink: ''
  });

  const [topicForm, setTopicForm] = useState({
    courseId: '',
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

  const [testForm, setTestForm] = useState({
    topicId: '',
    subtopicId: '',
    title: '',
    description: '',
    duration: 60,
    totalPoints: 100
  });
  const [testBuilderData, setTestBuilderData] = useState({
    topicId: '',
    subtopicId: '',
    test: null as any
  });

  const [materialForm, setMaterialForm] = useState({
    topicId: '',
    subtopicId: '',
    title: '',
    description: '',
    type: 'PDF' as 'PDF' | 'VIDEO' | 'AUDIO' | 'LINK' | 'PRESENTATION',
    url: '',
    file: null as File | null,
    order: 0
  });

  const [formErrors, setFormErrors] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Initialize all states with empty arrays to prevent undefined errors
      setCourses([]);
      setTopics([]);
      setSubtopics([]);
      setTests([]);
      
      const [coursesRes, topicsRes, subtopicsRes, testsRes] = await Promise.all([
        fetch('/api/admin/courses'),
        fetch('/api/admin/courses/topics'),
        fetch('/api/admin/courses/subtopics'),
        fetch('/api/admin/courses/tests')
      ]);

      if (coursesRes.ok) {
        const data = await coursesRes.json();
        setCourses(Array.isArray(data.courses) ? data.courses : []);
      } else {
        console.error('Failed to fetch courses:', coursesRes.status);
        setCourses([]);
      }

      if (topicsRes.ok) {
        const data = await topicsRes.json();
        setTopics(Array.isArray(data.topics) ? data.topics : []);
      } else {
        console.error('Failed to fetch topics:', topicsRes.status);
        setTopics([]);
      }

      if (subtopicsRes.ok) {
        const data = await subtopicsRes.json();
        setSubtopics(Array.isArray(data.subtopics) ? data.subtopics : []);
      } else {
        console.error('Failed to fetch subtopics:', subtopicsRes.status);
        setSubtopics([]);
      }

      if (testsRes.ok) {
        const data = await testsRes.json();
        setTests(Array.isArray(data.tests) ? data.tests : []);
      } else {
        console.error('Failed to fetch tests:', testsRes.status);
        setTests([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Ensure all states are arrays even on error
      setCourses([]);
      setTopics([]);
      setSubtopics([]);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    
    console.log('Form data:', courseForm);
    console.log('Form validation:', {
      title: courseForm.title,
      description: courseForm.description,
      instructor: courseForm.instructor,
      difficulty: courseForm.difficulty,
      estimatedHours: courseForm.estimatedHours,
      price: courseForm.price,
      duration: courseForm.duration,
      maxStudents: courseForm.maxStudents,
      status: courseForm.status
    });
    
    // Validate required fields
    const errors = {
      title: !courseForm.title,
      description: !courseForm.description,
      instructor: !courseForm.instructor,
      difficulty: !courseForm.difficulty,
      estimatedHours: !courseForm.estimatedHours,
      price: !courseForm.price,
      duration: !courseForm.duration,
      maxStudents: !courseForm.maxStudents,
      status: !courseForm.status
    };
    
    setFormErrors(errors);
    
    if (Object.values(errors).some(error => error)) {
      console.log('Missing fields:', errors);
      alert('Please fill in all required fields. Missing fields are highlighted in red.');
      return;
    }

    try {
      const courseData = {
        title: courseForm.title.trim(),
        description: courseForm.description.trim(),
        instructor: courseForm.instructor.trim(),
        difficulty: courseForm.difficulty,
        estimatedHours: courseForm.estimatedHours,
        price: courseForm.price,
        duration: courseForm.duration.trim(),
        maxStudents: courseForm.maxStudents,
        status: courseForm.status
      };

      console.log('Sending course data:', courseData);

      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData)
      });

      if (response.ok) {
        await fetchData();
        setShowCourseForm(false);
        setCourseForm({ title: '', description: '', instructor: '', difficulty: 'BEGINNER', estimatedHours: 1, price: 0, duration: '', maxStudents: 30, status: 'ACTIVE' });
        setFormErrors({});
                  } else {
              const error = await response.json();
              console.error('API Error:', error);
              alert(`Failed to create course: ${error.details || error.error || 'Unknown error'}`);
            }
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Network error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm)
      });

      if (response.ok) {
        await fetchData();
        setEditingCourse(null);
        setShowCourseForm(false);
        setCourseForm({ title: '', description: '', instructor: '', difficulty: 'BEGINNER', estimatedHours: 1, price: 0, duration: '', maxStudents: 30, status: 'ACTIVE' });
        setFormErrors({});
      }
    } catch (error) {
      console.error('Error updating course:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };


  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/courses/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topicForm)
      });

      if (response.ok) {
        await fetchData();
        setShowTopicForm(false);
        setTopicForm({ courseId: '', title: '', description: '', order: 0 });
      }
    } catch (error) {
      console.error('Error creating topic:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/courses/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testForm)
      });

      if (response.ok) {
        await fetchData();
        setShowTestForm(false);
        setTestForm({ topicId: '', subtopicId: '', title: '', description: '', duration: 60, totalPoints: 100 });
      } else {
        const error = await response.json();
        alert(`Failed to create test: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating test:', error);
      alert('Network error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopic) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/courses/topics/${editingTopic.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topicForm)
      });

      if (response.ok) {
        await fetchData();
        setEditingTopic(null);
        setShowTopicForm(false);
        setTopicForm({ courseId: '', title: '', description: '', order: 0 });
      } else {
        const error = await response.json();
        alert(`Failed to update topic: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating topic:', error);
      alert('Network error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('Are you sure you want to delete this topic?')) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/courses/topics/${topicId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchData();
      } else {
        const error = await response.json();
        alert(`Failed to delete topic: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting topic:', error);
      alert('Network error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTest) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/courses/tests/${editingTest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testForm)
      });

      if (response.ok) {
        await fetchData();
        setEditingTest(null);
        setShowTestForm(false);
        setTestForm({ topicId: '', subtopicId: '', title: '', description: '', duration: 60, totalPoints: 100 });
      } else {
        const error = await response.json();
        alert(`Failed to update test: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating test:', error);
      alert('Network error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this test?')) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/courses/tests/${testId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchData();
      } else {
        const error = await response.json();
        alert(`Failed to delete test: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting test:', error);
      alert('Network error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenTestBuilder = (topicId: string, subtopicId?: string) => {
    setTestBuilderData({
      topicId,
      subtopicId: subtopicId || '',
      test: null
    });
    setShowTestBuilder(true);
  };

  const handleTestBuilderSave = async (testData: any) => {
    try {
      setActionLoading(true);
      
      // Create the test first
      const testResponse = await fetch('/api/admin/courses/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: testBuilderData.topicId,
          subtopicId: testBuilderData.subtopicId || null,
          title: testData.name,
          description: `Test with ${testData.questions?.length || 0} questions`,
          duration: 60,
          totalPoints: (testData.questions?.length || 0) * 10
        })
      });

      if (!testResponse.ok) {
        const error = await testResponse.json();
        throw new Error(error.error || 'Failed to create test');
      }

      const { test } = await testResponse.json();

      // Create questions for the test
      for (const question of testData.questions) {
        await fetch('/api/admin/test-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: question.questionText,
            type: question.type === 'singleChoice' ? 'MULTIPLE_CHOICE' : 
                  question.type === 'multipleChoice' ? 'MULTIPLE_CHOICE' : 'SHORT_ANSWER',
            difficulty: 'MEDIUM',
            topicId: testBuilderData.topicId,
            points: 10,
            options: question.options || [],
            correctAnswer: question.type === 'shortAnswer' ? question.correctAnswer : 
                          question.options?.[question.correctOptions?.[0]] || '',
            explanation: 'No explanation provided'
          })
        });
      }

      setShowTestBuilder(false);
      setTestBuilderData({ topicId: '', subtopicId: '', test: null });
      fetchData();
      alert('Test created successfully!');
    } catch (error) {
      console.error('Error saving test:', error);
      alert('Error saving test');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!materialForm.topicId && !materialForm.subtopicId) || !materialForm.title || !materialForm.type) {
      setFormErrors({ 
        parent: (!materialForm.topicId && !materialForm.subtopicId), 
        title: !materialForm.title, 
        type: !materialForm.type 
      });
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch('/api/admin/courses/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(materialForm)
      });

      if (response.ok) {
        const data = await response.json();
        setTopics(topics.map(topic => 
          topic.id === materialForm.topicId 
            ? { ...topic, materials: [...(topic.materials || []), data.material] }
            : topic
        ));
        setShowMaterialForm(false);
        setMaterialForm({ topicId: '', subtopicId: '', title: '', description: '', type: 'PDF', url: '', file: null, order: 0 });
        setFormErrors({});
        alert('Material created successfully!');
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

  const handleUpdateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial || !materialForm.topicId || !materialForm.title || !materialForm.url) {
      setFormErrors({ topicId: !materialForm.topicId, title: !materialForm.title, url: !materialForm.url });
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/courses/materials/${editingMaterial.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(materialForm)
      });

      if (response.ok) {
        const data = await response.json();
        setTopics(topics.map(topic => 
          topic.id === materialForm.topicId 
            ? { 
                ...topic, 
                materials: topic.materials?.map(m => m.id === editingMaterial.id ? data.material : m) || []
              }
            : topic
        ));
        setShowMaterialForm(false);
        setEditingMaterial(null);
        setMaterialForm({ topicId: '', subtopicId: '', title: '', description: '', type: 'PDF', url: '', file: null, order: 0 });
        setFormErrors({});
        alert('Material updated successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to update material'}`);
      }
    } catch (error) {
      console.error('Error updating material:', error);
      alert('Error updating material');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMaterial = async (materialId: string, topicId: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/courses/materials/${materialId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTopics(topics.map(topic => 
          topic.id === topicId 
            ? { ...topic, materials: topic.materials?.filter(m => m.id !== materialId) || [] }
            : topic
        ));
        alert('Material deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to delete material'}`);
      }
    } catch (error) {
      console.error('Error deleting material:', error);
      alert('Error deleting material');
    } finally {
      setActionLoading(false);
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

  const handleCreateSubtopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subtopicForm.topicId || !subtopicForm.title) {
      setFormErrors({ topicId: !subtopicForm.topicId, title: !subtopicForm.title });
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch('/api/admin/courses/subtopics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subtopicForm)
      });

      if (response.ok) {
        const data = await response.json();
        setSubtopics([...subtopics, data.subtopic]);
        setShowSubtopicForm(false);
        setSubtopicForm({ topicId: '', title: '', description: '', order: 0 });
        setFormErrors({});
        alert('Subtopic created successfully!');
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

  const handleUpdateSubtopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubtopic || !subtopicForm.topicId || !subtopicForm.title) {
      setFormErrors({ topicId: !subtopicForm.topicId, title: !subtopicForm.title });
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/courses/subtopics/${editingSubtopic.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subtopicForm)
      });

      if (response.ok) {
        const data = await response.json();
        setSubtopics(subtopics.map(s => s.id === editingSubtopic.id ? data.subtopic : s));
        setShowSubtopicForm(false);
        setEditingSubtopic(null);
        setSubtopicForm({ topicId: '', title: '', description: '', order: 0 });
        setFormErrors({});
        alert('Subtopic updated successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to update subtopic'}`);
      }
    } catch (error) {
      console.error('Error updating subtopic:', error);
      alert('Error updating subtopic');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubtopic = async (subtopicId: string) => {
    if (!confirm('Are you sure you want to delete this subtopic?')) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/courses/subtopics/${subtopicId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSubtopics(subtopics.filter(s => s.id !== subtopicId));
        alert('Subtopic deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to delete subtopic'}`);
      }
    } catch (error) {
      console.error('Error deleting subtopic:', error);
      alert('Error deleting subtopic');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCourses = (courses || []).filter(course => {
    if (!course) return false;
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || course.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600">Create and manage courses with nested content structure</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCourseForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Difficulties</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Course List with Hierarchical Content Management */}
      {!selectedCourse ? (
        <div className="space-y-4">
          {Array.isArray(filteredCourses) && filteredCourses.length > 0 ? filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Course Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-gray-600 mb-3">{course.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {course.instructor}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(course.difficulty)}`}>
                        {course.difficulty}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {course.estimatedHours || 0}h
                      </span>
                      <span className="flex items-center">
                        <Target className="w-4 h-4 mr-1" />
                        {course.totalTopics || 0} topics
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingCourse(course);
                        setCourseForm({
                          title: course.title,
                          description: course.description,
                          instructor: course.instructor,
                          difficulty: course.difficulty,
                          estimatedHours: course.estimatedHours,
                          price: course.price || 0,
                          duration: course.duration || '',
                          maxStudents: course.maxStudents || 30,
                          status: course.status || 'ACTIVE'
                        });
                        setShowCourseForm(true);
                      }}
                      className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                    >
                      <Edit className="w-4 h-4 inline mr-1" />
                      Edit Course
                    </button>
                    <button
                      onClick={() => setSelectedCourse(course)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      Manage Content
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4 inline mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new course.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCourseForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Course
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Course Content Management View */
        <div className="space-y-6">
          {/* Back Button and Course Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedCourse(null)}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
                Back to Courses
              </button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedCourse?.title}</h2>
                <p className="text-gray-600">{selectedCourse?.description}</p>
              </div>
            </div>
          </div>

          {/* Topics Management */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Course Topics</h3>
                <button
                  onClick={() => {
                    setTopicForm({ courseId: selectedCourse?.id || '', title: '', description: '', order: 0 });
                    setShowTopicForm(true);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Add Topic
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {Array.isArray(topics) && topics.filter(topic => topic.courseId === selectedCourse?.id).map((topic) => (
                  <div key={topic.id} className="border border-gray-200 rounded-lg">
                    {/* Topic Header */}
                    <div className="p-4 bg-gray-50 rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleTopicExpansion(topic.id)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {expandedTopics.has(topic.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                          <div>
                            <h4 className="font-medium text-gray-900">{topic.title}</h4>
                            <p className="text-sm text-gray-600">{topic.description}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingTopic(topic);
                              setTopicForm({
                                courseId: topic.courseId,
                                title: topic.title,
                                description: topic.description,
                                order: topic.order
                              });
                              setShowTopicForm(true);
                            }}
                            className="px-2 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTopic(topic.id)}
                            className="px-2 py-1 text-xs border border-red-300 text-red-700 rounded hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Topic Content */}
                    {expandedTopics.has(topic.id) && (
                      <div className="p-4 space-y-4">
                        {/* Materials Section */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-sm font-medium text-gray-700">Materials</h5>
                            <button
                              onClick={() => {
                                setMaterialForm({ 
                                  topicId: topic.id, 
                                  subtopicId: '',
                                  title: '', 
                                  description: '',
                                  type: 'PDF', 
                                  url: '', 
                                  file: null,
                                  order: 0
                                });
                                setShowMaterialForm(true);
                              }}
                              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              <Plus className="w-3 h-3 inline mr-1" />
                              Add Material
                            </button>
                          </div>
                          <div className="space-y-2">
                            {Array.isArray(topic.materials) && topic.materials.length > 0 ? topic.materials.map((material) => (
                              <div key={material.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center space-x-2">
                                  <FileText className="w-4 h-4 text-gray-500" />
                                  <div>
                                    <span className="text-sm text-gray-900">{material.title}</span>
                                    <span className="text-xs text-gray-500 ml-2">({material.type})</span>
                                    {material.description && (
                                      <p className="text-xs text-gray-500 mt-1">{material.description}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => {
                                      setEditingMaterial(material);
                                      setMaterialForm({
                                        topicId: material.topicId || '',
                                        subtopicId: material.subtopicId || '',
                                        title: material.title,
                                        description: material.description || '',
                                        type: material.type,
                                        url: material.url || '',
                                        file: null,
                                        order: material.order
                                      });
                                      setShowMaterialForm(true);
                                    }}
                                    className="px-2 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMaterial(material.id, topic.id)}
                                    className="px-2 py-1 text-xs border border-red-300 text-red-700 rounded hover:bg-red-50"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )) : (
                              <p className="text-sm text-gray-500 italic">No materials added yet</p>
                            )}
                          </div>
                        </div>

                        {/* Subtopics Section */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-sm font-medium text-gray-700">Subtopics</h5>
                            <button
                              onClick={() => {
                                setSubtopicForm({
                                  topicId: topic.id,
                                  title: '',
                                  description: '',
                                  order: 0
                                });
                                setShowSubtopicForm(true);
                              }}
                              className="px-2 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700"
                            >
                              <Plus className="w-3 h-3 inline mr-1" />
                              Add Subtopic
                            </button>
                          </div>
                          <div className="space-y-2">
                            {Array.isArray(subtopics) && subtopics.filter(subtopic => subtopic.topicId === topic.id).map((subtopic) => (
                              <div key={subtopic.id} className="border border-gray-200 rounded-lg">
                                {/* Subtopic Header */}
                                <div className="p-3 bg-orange-50 rounded-t-lg">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => toggleSubtopicExpansion(subtopic.id)}
                                        className="text-gray-500 hover:text-gray-700"
                                      >
                                        {expandedSubtopics.has(subtopic.id) ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                      </button>
                                      <div>
                                        <span className="text-sm font-medium text-gray-900">{subtopic.title}</span>
                                        {subtopic.description && (
                                          <p className="text-xs text-gray-600">{subtopic.description}</p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex space-x-1">
                                      <button
                                        onClick={() => {
                                          setEditingSubtopic(subtopic);
                                          setSubtopicForm({
                                            topicId: subtopic.topicId,
                                            title: subtopic.title,
                                            description: subtopic.description || '',
                                            order: subtopic.order
                                          });
                                          setShowSubtopicForm(true);
                                        }}
                                        className="px-2 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteSubtopic(subtopic.id)}
                                        className="px-2 py-1 text-xs border border-red-300 text-red-700 rounded hover:bg-red-50"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Expanded Subtopic Content */}
                                {expandedSubtopics.has(subtopic.id) && (
                                  <div className="p-3 space-y-3">
                                    {/* Subtopic Materials */}
                                    <div>
                                      <div className="flex items-center justify-between mb-2">
                                        <h6 className="text-xs font-medium text-gray-600">Materials</h6>
                                        <button
                                          onClick={() => {
                                            setMaterialForm({ 
                                              topicId: '',
                                              subtopicId: subtopic.id,
                                              title: '', 
                                              description: '',
                                              type: 'PDF', 
                                              url: '', 
                                              file: null,
                                              order: 0
                                            });
                                            setShowMaterialForm(true);
                                          }}
                                          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                          <Plus className="w-3 h-3 inline mr-1" />
                                          Add Material
                                        </button>
                                      </div>
                                      <div className="space-y-1">
                                        {Array.isArray(subtopic.materials) && subtopic.materials.length > 0 ? subtopic.materials.map((material) => (
                                          <div key={material.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <div className="flex items-center space-x-2">
                                              <FileText className="w-3 h-3 text-gray-500" />
                                              <div>
                                                <span className="text-xs text-gray-900">{material.title}</span>
                                                <span className="text-xs text-gray-500 ml-1">({material.type})</span>
                                                {material.description && (
                                                  <p className="text-xs text-gray-500">{material.description}</p>
                                                )}
                                              </div>
                                            </div>
                                            <div className="flex space-x-1">
                                              <button
                                                onClick={() => {
                                                  setEditingMaterial(material);
                                                  setMaterialForm({
                                                    topicId: material.topicId || '',
                                                    subtopicId: material.subtopicId || '',
                                                    title: material.title,
                                                    description: material.description || '',
                                                    type: material.type,
                                                    url: material.url || '',
                                                    file: null,
                                                    order: material.order
                                                  });
                                                  setShowMaterialForm(true);
                                                }}
                                                className="px-1 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                                              >
                                                Edit
                                              </button>
                                              <button
                                                onClick={() => handleDeleteMaterial(material.id, material.topicId || material.subtopicId || '')}
                                                className="px-1 py-1 text-xs border border-red-300 text-red-700 rounded hover:bg-red-50"
                                              >
                                                Delete
                                              </button>
                                            </div>
                                          </div>
                                        )) : (
                                          <p className="text-xs text-gray-500 italic">No materials added yet</p>
                                        )}
                                      </div>
                                    </div>

                                    {/* Subtopic Tests */}
                                    <div>
                                      <div className="flex items-center justify-between mb-2">
                                        <h6 className="text-xs font-medium text-gray-600">Tests</h6>
                                        <button
                                          onClick={() => handleOpenTestBuilder(subtopic.topicId, subtopic.id)}
                                          className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                                        >
                                          <Plus className="w-3 h-3 inline mr-1" />
                                          Add Test
                                        </button>
                                      </div>
                                      <div className="space-y-1">
                                        {subtopic.tests && subtopic.tests.length > 0 ? subtopic.tests.map((test) => (
                                          <div key={test.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <div className="flex items-center space-x-2">
                                              <PlayCircle className="w-3 h-3 text-gray-500" />
                                              <div>
                                                <span className="text-xs text-gray-900">{test.title}</span>
                                                <span className="text-xs text-gray-500 ml-1">({test.duration}min, {test.totalPoints}pts)</span>
                                              </div>
                                            </div>
                                            <div className="flex space-x-1">
                                              <button
                                                onClick={() => {
                                                  setEditingTest(test);
                                                  setTestForm({
                                                    topicId: test.topicId || '',
                                                    subtopicId: test.subtopicId || '',
                                                    title: test.title,
                                                    description: test.description,
                                                    duration: test.duration,
                                                    totalPoints: test.totalPoints
                                                  });
                                                  setShowTestForm(true);
                                                }}
                                                className="px-1 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                                              >
                                                Edit
                                              </button>
                                              <button
                                                onClick={() => handleDeleteTest(test.id)}
                                                className="px-1 py-1 text-xs border border-red-300 text-red-700 rounded hover:bg-red-50"
                                              >
                                                Delete
                                              </button>
                                            </div>
                                          </div>
                                        )) : (
                                          <p className="text-xs text-gray-500 italic">No tests added yet</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                            {Array.isArray(subtopics) && subtopics.filter(subtopic => subtopic.topicId === topic.id).length === 0 && (
                              <p className="text-sm text-gray-500 italic">No subtopics added yet</p>
                            )}
                          </div>
                        </div>

                        {/* Tests Section */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-sm font-medium text-gray-700">Tests</h5>
                            <button
                              onClick={() => handleOpenTestBuilder(topic.id)}
                              className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                            >
                              <Plus className="w-3 h-3 inline mr-1" />
                              Add Test
                            </button>
                          </div>
                          <div className="space-y-2">
                            {tests.filter(test => test.topicId === topic.id).map((test) => (
                              <div key={test.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center space-x-2">
                                  <PlayCircle className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm text-gray-900">{test.title}</span>
                                  <span className="text-xs text-gray-500">({test.duration}min, {test.totalPoints}pts)</span>
                                </div>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => {
                                      setEditingTest(test);
                                      setTestForm({
                                        topicId: test.topicId || '',
                                        subtopicId: test.subtopicId || '',
                                        title: test.title,
                                        description: test.description,
                                        duration: test.duration,
                                        totalPoints: test.totalPoints
                                      });
                                      setShowTestForm(true);
                                    }}
                                    className="px-2 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTest(test.id)}
                                    className="px-2 py-1 text-xs border border-red-300 text-red-700 rounded hover:bg-red-50"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            ))}
                            {tests.filter(test => test.topicId === topic.id).length === 0 && (
                              <p className="text-sm text-gray-500 italic">No tests added yet</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {Array.isArray(topics) && topics.filter(topic => topic.courseId === selectedCourse?.id).length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <FileText className="mx-auto h-8 w-8 text-gray-400" />
                    <h4 className="mt-2 text-sm font-medium text-gray-900">No topics yet</h4>
                    <p className="mt-1 text-sm text-gray-500">Add your first topic to get started.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Course Form Modal */}
      {showCourseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </h3>
              <button
                onClick={() => {
                  setShowCourseForm(false);
                  setEditingCourse(null);
                  setCourseForm({ title: '', description: '', instructor: '', difficulty: 'BEGINNER', estimatedHours: 1, price: 0, duration: '', maxStudents: 30, status: 'ACTIVE', enrollmentDeadline: '', accessStartDate: '', accessEndDate: '', googleMeetLink: '' });
        setFormErrors({});
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={editingCourse ? handleUpdateCourse : handleCreateCourse} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                <input
                  type="text"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  rows={2}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
                <input
                  type="text"
                  value={courseForm.instructor}
                  onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.instructor ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter instructor name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={courseForm.difficulty}
                  onChange={(e) => setCourseForm({ ...courseForm, difficulty: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
                <input
                  type="number"
                  value={courseForm.estimatedHours}
                  onChange={(e) => setCourseForm({ ...courseForm, estimatedHours: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  placeholder="Enter estimated hours"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₸)</label>
                <input
                  type="number"
                  value={courseForm.price}
                  onChange={(e) => setCourseForm({ ...courseForm, price: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  placeholder="Enter course price"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input
                  type="text"
                  value={courseForm.duration}
                  onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 3 months, 6 weeks"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
                <input
                  type="number"
                  value={courseForm.maxStudents}
                  onChange={(e) => setCourseForm({ ...courseForm, maxStudents: parseInt(e.target.value) || 30 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  placeholder="Enter maximum students"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={courseForm.status}
                  onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Deadline</label>
                <input
                  type="datetime-local"
                  value={courseForm.enrollmentDeadline}
                  onChange={(e) => setCourseForm({ ...courseForm, enrollmentDeadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Set enrollment deadline"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Access Start Date</label>
                <input
                  type="datetime-local"
                  value={courseForm.accessStartDate}
                  onChange={(e) => setCourseForm({ ...courseForm, accessStartDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="When students can start accessing"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Access End Date</label>
                <input
                  type="datetime-local"
                  value={courseForm.accessEndDate}
                  onChange={(e) => setCourseForm({ ...courseForm, accessEndDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="When students lose access"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Meet Link</label>
                <input
                  type="url"
                  value={courseForm.googleMeetLink}
                  onChange={(e) => setCourseForm({ ...courseForm, googleMeetLink: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                />
              </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Saving...' : (editingCourse ? 'Update Course' : 'Create Course')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCourseForm(false);
                    setEditingCourse(null);
                    setCourseForm({ title: '', description: '', instructor: '', difficulty: 'BEGINNER', estimatedHours: 1, price: 0, duration: '', maxStudents: 30, status: 'ACTIVE', enrollmentDeadline: '', accessStartDate: '', accessEndDate: '', googleMeetLink: '' });
        setFormErrors({});
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Topic Form Modal */}
      {showTopicForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingTopic ? 'Edit Topic' : 'Add New Topic'}
              </h3>
              <button
                onClick={() => {
                  setShowTopicForm(false);
                  setEditingTopic(null);
                  setTopicForm({ courseId: '', title: '', description: '', order: 0 });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={editingTopic ? handleUpdateTopic : handleCreateTopic} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select
                  value={topicForm.courseId}
                  onChange={(e) => setTopicForm({ ...topicForm, courseId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic Title</label>
                <input
                  type="text"
                  value={topicForm.title}
                  onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={topicForm.description}
                  onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <input
                  type="number"
                  value={topicForm.order}
                  onChange={(e) => setTopicForm({ ...topicForm, order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Saving...' : (editingTopic ? 'Update Topic' : 'Create Topic')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTopicForm(false);
                    setEditingTopic(null);
                    setTopicForm({ courseId: '', title: '', description: '', order: 0 });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingTest ? 'Edit Test' : 'Add New Test'}
              </h3>
              <button
                onClick={() => {
                  setShowTestForm(false);
                  setEditingTest(null);
                  setTestForm({ topicId: '', subtopicId: '', title: '', description: '', duration: 60, totalPoints: 100 });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={editingTest ? handleUpdateTest : handleCreateTest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                <select
                  value={testForm.topicId}
                  onChange={(e) => setTestForm({ ...testForm, topicId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a topic</option>
                  {Array.isArray(topics) && topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>{topic.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Title</label>
                <input
                  type="text"
                  value={testForm.title}
                  onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={testForm.description}
                  onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={testForm.duration}
                    onChange={(e) => setTestForm({ ...testForm, duration: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Points</label>
                  <input
                    type="number"
                    value={testForm.totalPoints}
                    onChange={(e) => setTestForm({ ...testForm, totalPoints: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Saving...' : (editingTest ? 'Update Test' : 'Create Test')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTestForm(false);
                    setEditingTest(null);
                    setTestForm({ topicId: '', subtopicId: '', title: '', description: '', duration: 60, totalPoints: 100 });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Material Form Modal */}
      {showMaterialForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingMaterial ? 'Edit Material' : 'Add New Material'}
              </h3>
              <button
                onClick={() => {
                  setShowMaterialForm(false);
                  setEditingMaterial(null);
                  setMaterialForm({ topicId: '', subtopicId: '', title: '', description: '', type: 'PDF', url: '', file: null, order: 0 });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={editingMaterial ? handleUpdateMaterial : handleCreateMaterial} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent</label>
                <select
                  value={materialForm.topicId || materialForm.subtopicId}
                  onChange={(e) => {
                    if (e.target.value.startsWith('topic-')) {
                      setMaterialForm({ ...materialForm, topicId: e.target.value.replace('topic-', ''), subtopicId: '' });
                    } else if (e.target.value.startsWith('subtopic-')) {
                      setMaterialForm({ ...materialForm, subtopicId: e.target.value.replace('subtopic-', ''), topicId: '' });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a parent</option>
                  <optgroup label="Topics">
                    {topics.map((topic) => (
                      <option key={topic.id} value={`topic-${topic.id}`}>{topic.title}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Subtopics">
                    {Array.isArray(subtopics) && subtopics.map((subtopic) => (
                      <option key={subtopic.id} value={`subtopic-${subtopic.id}`}>{subtopic.title}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Material Title</label>
                <input
                  type="text"
                  value={materialForm.title}
                  onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={materialForm.type}
                  onChange={(e) => setMaterialForm({ ...materialForm, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="PDF">PDF</option>
                  <option value="VIDEO">Video</option>
                  <option value="AUDIO">Audio</option>
                  <option value="LINK">Link</option>
                  <option value="PRESENTATION">Presentation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={materialForm.description}
                  onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {(materialForm.type === 'PDF' || materialForm.type === 'PRESENTATION') ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {materialForm.type === 'PRESENTATION' ? 'Upload Presentation File' : 'Upload PDF File'}
                  </label>
                  <input
                    type="file"
                    accept={materialForm.type === 'PRESENTATION' ? '.pptx,.ppt' : '.pdf'}
                    onChange={(e) => setMaterialForm({ ...materialForm, file: e.target.files?.[0] || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {materialForm.file && (
                    <p className="text-sm text-gray-600 mt-1">Selected: {materialForm.file.name}</p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                  <input
                    type="url"
                    value={materialForm.url}
                    onChange={(e) => setMaterialForm({ ...materialForm, url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <input
                  type="number"
                  value={materialForm.order}
                  onChange={(e) => setMaterialForm({ ...materialForm, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Saving...' : (editingMaterial ? 'Update Material' : 'Create Material')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMaterialForm(false);
                    setEditingMaterial(null);
                    setMaterialForm({ topicId: '', subtopicId: '', title: '', description: '', type: 'PDF', url: '', file: null, order: 0 });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingSubtopic ? 'Edit Subtopic' : 'Add New Subtopic'}
              </h3>
              <button
                onClick={() => {
                  setShowSubtopicForm(false);
                  setEditingSubtopic(null);
                  setSubtopicForm({ topicId: '', title: '', description: '', order: 0 });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={editingSubtopic ? handleUpdateSubtopic : handleCreateSubtopic} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                <select
                  value={subtopicForm.topicId}
                  onChange={(e) => setSubtopicForm({ ...subtopicForm, topicId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a topic</option>
                  {Array.isArray(topics) && topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>{topic.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtopic Title</label>
                <input
                  type="text"
                  value={subtopicForm.title}
                  onChange={(e) => setSubtopicForm({ ...subtopicForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={subtopicForm.description}
                  onChange={(e) => setSubtopicForm({ ...subtopicForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <input
                  type="number"
                  value={subtopicForm.order}
                  onChange={(e) => setSubtopicForm({ ...subtopicForm, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Saving...' : (editingSubtopic ? 'Update Subtopic' : 'Create Subtopic')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSubtopicForm(false);
                    setEditingSubtopic(null);
                    setSubtopicForm({ topicId: '', title: '', description: '', order: 0 });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
              )}

        {/* TestBuilder Modal */}
        {showTestBuilder && (
          <TestBuilder
            test={testBuilderData.test}
            topicId={testBuilderData.topicId}
            subtopicId={testBuilderData.subtopicId}
            onClose={() => setShowTestBuilder(false)}
            onSave={handleTestBuilderSave}
          />
        )}

    </div>
  );
}
