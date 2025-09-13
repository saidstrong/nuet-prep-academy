"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Plus, Search, Filter, Edit, Trash2, Eye, Users,
  Calendar, DollarSign, Target, Lock, Unlock, Settings, Download,
  Upload, Save, X, Check, AlertCircle, Clock, Star, TrendingUp
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  status: string;
  studentCount: number;
  tutorId: string;
  tutorName: string;
  createdAt: string;
  updatedAt: string;
  topics: Topic[];
  accessControl?: {
    isUnlocked: boolean;
    unlockDate?: string;
    lockDate?: string;
  };
}

interface Topic {
  id: string;
  title: string;
  description?: string;
  order: number;
  materialsCount: number;
  testsCount: number;
}

export default function AdminCourseManagement() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/courses', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.tutorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCourses.length === filteredCourses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(filteredCourses.map(course => course.id));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedCourses.length === 0) return;

    try {
      const response = await fetch('/api/admin/courses/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseIds: selectedCourses,
          action: action
        })
      });

      if (response.ok) {
        await fetchCourses();
        setSelectedCourses([]);
        setShowBulkActions(false);
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Course Management</h3>
          <p className="text-sm text-slate-600">Manage all courses, tutors, and access controls</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => router.push('/admin/courses/create')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Course</span>
          </button>
          <button
            onClick={() => router.push('/admin/courses/import')}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <button className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCourses.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-blue-900">
                {selectedCourses.length} course{selectedCourses.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('ACTIVATE')}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('ARCHIVE')}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
              >
                Archive
              </button>
              <button
                onClick={() => handleBulkAction('DELETE')}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedCourses([])}
                className="px-3 py-1 border border-slate-300 text-slate-700 rounded text-sm hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Courses Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCourses.length === filteredCourses.length && filteredCourses.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tutor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredCourses.map((course) => (
                <tr key={course.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(course.id)}
                      onChange={() => handleCourseSelect(course.id)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">{course.title}</div>
                        <div className="text-sm text-slate-500">{course.topics.length} topics</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{course.tutorName}</div>
                    <div className="text-sm text-slate-500">ID: {course.tutorId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-slate-400 mr-1" />
                      <span className="text-sm text-slate-900">{course.studentCount}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">${course.price}</div>
                    <div className="text-sm text-slate-500">{course.duration}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(course.status)}`}>
                      {course.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => router.push(`/admin/courses/${course.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => router.push(`/admin/courses/${course.id}/edit`)}
                        className="text-green-600 hover:text-green-900"
                        title="Edit Course"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => router.push(`/admin/courses/${course.id}/access-control`)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Access Control"
                      >
                        <Lock className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this course?')) {
                            // Handle delete
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'ALL' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Get started by creating your first course.'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredCourses.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-700">
            Showing {filteredCourses.length} of {courses.length} courses
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-slate-300 rounded text-sm hover:bg-slate-50">
              Previous
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
              1
            </button>
            <button className="px-3 py-1 border border-slate-300 rounded text-sm hover:bg-slate-50">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
