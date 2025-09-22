"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { isAdminOrManager } from '@/lib/auth';
import {
  Plus, BookOpen, Users, Clock, Target, Edit2, Trash2, Eye,
  ChevronRight, Search, Filter, Star, PlayCircle, FileText,
  Presentation, Video, Link, Upload, Settings, MoreVertical
} from 'lucide-react';

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
  thumbnail?: string;
}

export default function CourseManagementPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Course form state
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    instructor: '',
    difficulty: 'BEGINNER' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
    estimatedHours: 1,
    price: 0,
    duration: '',
    maxStudents: 30,
    status: 'DRAFT' as 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  });

  useEffect(() => {
    if (session?.user?.role && isAdminOrManager(session.user.role)) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching courses...');
      const coursesRes = await fetch('/api/admin/courses-simple', { credentials: 'include' });

      console.log('📡 Response status:', coursesRes.status);
      console.log('📡 Response ok:', coursesRes.ok);

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        console.log('📚 Courses data received:', coursesData);
        console.log('📚 Courses array:', coursesData.courses);
        console.log('📚 Courses count:', coursesData.courses?.length || 0);
        setCourses(coursesData.courses || []);
      } else {
        const errorData = await coursesRes.json();
        console.error('❌ API Error:', errorData);
        alert(`Error fetching courses: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      alert('Error fetching courses. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      console.log('🚀 Creating course with data:', courseForm);
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(courseForm)
      });

      console.log('📡 Create response status:', response.status);
      console.log('📡 Create response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Course created successfully:', result);
        await fetchData();
        setShowCreateForm(false);
        setCourseForm({
          title: '',
          description: '',
          instructor: '',
          difficulty: 'BEGINNER',
          estimatedHours: 1,
          price: 0,
          duration: '',
          maxStudents: 30,
          status: 'DRAFT'
        });
        alert('Course created successfully!');
      } else {
        const error = await response.json();
        console.error('❌ Create course error:', error);
        alert(`Error: ${error.error || 'Failed to create course'}`);
      }
    } catch (error) {
      console.error('❌ Error creating course:', error);
      alert('Error creating course');
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
        credentials: 'include',
        body: JSON.stringify(courseForm)
      });

      if (response.ok) {
        await fetchData();
        setEditingCourse(null);
        setCourseForm({
          title: '',
          description: '',
          instructor: '',
          difficulty: 'BEGINNER',
          estimatedHours: 1,
          price: 0,
          duration: '',
          maxStudents: 30,
          status: 'DRAFT'
        });
        alert('Course updated successfully!');
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
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        await fetchData();
        if (selectedCourse?.id === courseId) {
          setSelectedCourse(null);
        }
        alert('Course deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || course.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'ARCHIVED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Left Sidebar - Course List */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Course
              </button>
            </div>

            {/* Search and Filter */}
            <div className="space-y-3">
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
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          {/* Course List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-3">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                    selectedCourse?.id === course.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{course.instructor}</p>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                          {course.difficulty}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                          {course.status}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span className="flex items-center">
                          <BookOpen className="w-3 h-3 mr-1" />
                          {course.totalTopics} topics
                        </span>
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {course.enrolledStudents} students
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {course.estimatedHours}h
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCourse(course);
                          setCourseForm({
                            title: course.title,
                            description: course.description,
                            instructor: course.instructor,
                            difficulty: course.difficulty,
                            estimatedHours: course.estimatedHours,
                            price: course.price,
                            duration: course.duration,
                            maxStudents: course.maxStudents,
                            status: course.status
                          });
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCourse(course.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Course Details or Create Form */}
        <div className="flex-1 flex flex-col">
          {showCreateForm || editingCourse ? (
            /* Course Creation/Edit Form */
            <div className="flex-1 p-6">
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingCourse ? 'Edit Course' : 'Create New Course'}
                  </h2>
                  <p className="text-gray-600">
                    {editingCourse ? 'Update course information' : 'Fill in the details to create a new course'}
                  </p>
                </div>

                <form onSubmit={editingCourse ? handleUpdateCourse : handleCreateCourse} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Course Title *</label>
                      <input
                        type="text"
                        value={courseForm.title}
                        onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instructor *</label>
                      <input
                        type="text"
                        value={courseForm.instructor}
                        onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      value={courseForm.description}
                      onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty *</label>
                      <select
                        value={courseForm.difficulty}
                        onChange={(e) => setCourseForm({ ...courseForm, difficulty: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Hours *</label>
                      <input
                        type="number"
                        value={courseForm.estimatedHours}
                        onChange={(e) => setCourseForm({ ...courseForm, estimatedHours: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price ($) *</label>
                      <input
                        type="number"
                        value={courseForm.price}
                        onChange={(e) => setCourseForm({ ...courseForm, price: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration *</label>
                      <input
                        type="text"
                        value={courseForm.duration}
                        onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                        placeholder="e.g., 4 weeks, 2 months"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Students *</label>
                      <input
                        type="number"
                        value={courseForm.maxStudents}
                        onChange={(e) => setCourseForm({ ...courseForm, maxStudents: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                      <select
                        value={courseForm.status}
                        onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setEditingCourse(null);
                        setCourseForm({
                          title: '',
                          description: '',
                          instructor: '',
                          difficulty: 'BEGINNER',
                          estimatedHours: 1,
                          price: 0,
                          duration: '',
                          maxStudents: 30,
                          status: 'DRAFT'
                        });
                      }}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {actionLoading ? 'Saving...' : (editingCourse ? 'Update Course' : 'Create Course')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : selectedCourse ? (
            /* Course Content Management - Google Classroom Style */
            <div className="flex-1 flex flex-col">
              {/* Course Header */}
              <div className="bg-white border-b border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedCourse.title}</h1>
                    <p className="text-gray-600 mb-4">{selectedCourse.description}</p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        {selectedCourse.enrolledStudents} students
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {selectedCourse.estimatedHours} hours
                      </span>
                      <span className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-2" />
                        {selectedCourse.totalTopics} topics
                      </span>
                      <span className="flex items-center">
                        <Target className="w-4 h-4 mr-2" />
                        {selectedCourse.totalTests} tests
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => router.push(`/admin/courses/${selectedCourse.id}/content`)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Content
                    </button>
                  </div>
                </div>
              </div>

              {/* Course Content Preview */}
              <div className="flex-1 p-6 bg-gray-50">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to build your course?</h3>
                    <p className="text-gray-600 mb-6">
                      Click "Manage Content" to start adding topics, materials, and tests to your course.
                    </p>
                    <button
                      onClick={() => router.push(`/admin/courses/${selectedCourse.id}/content`)}
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Start Building Course
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* No Course Selected */
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a course to manage</h3>
                <p className="text-gray-600 mb-6">
                  Choose a course from the left sidebar or create a new one to get started.
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Course
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
