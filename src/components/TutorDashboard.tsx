"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  BookOpen, 
  Users, 
  Clock, 
  Calendar, 
  Video, 
  FileText, 
  TestTube,
  Edit,
  Eye,
  Settings,
  MessageCircle,
  Phone,
  Link,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter
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
  enrolledStudents: number;
  status: string;
  enrollmentDeadline?: string;
  accessStartDate?: string;
  accessEndDate?: string;
  googleMeetLink?: string;
  topics: Topic[];
  createdAt: string;
  updatedAt: string;
}

interface Topic {
  id: string;
  title: string;
  description: string;
  order: number;
  materials: Material[];
  tests: Test[];
  subtopics: Subtopic[];
}

interface Subtopic {
  id: string;
  title: string;
  description: string;
  order: number;
  materials: Material[];
  tests: Test[];
}

interface Material {
  id: string;
  title: string;
  description: string;
  type: string;
  url?: string;
  order: number;
}

interface Test {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalPoints: number;
  isActive: boolean;
}

export default function TutorDashboard() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'materials' | 'tests' | 'settings'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMeetLink, setEditingMeetLink] = useState(false);
  const [newMeetLink, setNewMeetLink] = useState('');

  useEffect(() => {
    fetchTutorCourses();
  }, []);

  const fetchTutorCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tutor/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching tutor courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMeetLink = async (courseId: string) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleMeetLink: newMeetLink
        }),
      });

      if (response.ok) {
        await fetchTutorCourses();
        setEditingMeetLink(false);
        setNewMeetLink('');
        alert('Google Meet link updated successfully');
      } else {
        alert('Failed to update Google Meet link');
      }
    } catch (error) {
      console.error('Error updating meet link:', error);
      alert('Failed to update Google Meet link');
    }
  };

  const updateDeadline = async (courseId: string, deadline: string) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enrollmentDeadline: deadline
        }),
      });

      if (response.ok) {
        await fetchTutorCourses();
        alert('Deadline updated successfully');
      } else {
        alert('Failed to update deadline');
      }
    } catch (error) {
      console.error('Error updating deadline:', error);
      alert('Failed to update deadline');
    }
  };

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tutor Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {session?.user?.name}! Manage your assigned courses and students.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Assigned Courses</p>
              <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {courses.reduce((sum, course) => sum + course.enrolledStudents, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Materials</p>
              <p className="text-2xl font-bold text-gray-900">
                {courses.reduce((sum, course) => 
                  sum + course.topics.reduce((topicSum, topic) => 
                    topicSum + topic.materials.length + topic.subtopics.reduce((subSum, sub) => 
                      subSum + sub.materials.length, 0), 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TestTube className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tests</p>
              <p className="text-2xl font-bold text-gray-900">
                {courses.reduce((sum, course) => 
                  sum + course.topics.reduce((topicSum, topic) => 
                    topicSum + topic.tests.length + topic.subtopics.reduce((subSum, sub) => 
                      subSum + sub.tests.length, 0), 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-6">
        {filteredCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Course Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-3">{course.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {course.enrolledStudents}/{course.maxStudents} students
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(course.difficulty)}`}>
                      {course.difficulty}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {course.estimatedHours} hours
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCourse(selectedCourse?.id === course.id ? null : course)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {selectedCourse?.id === course.id ? 'Hide Details' : 'View Details'}
                </button>
              </div>

              {/* Course Management Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Google Meet Link */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-900">Google Meet Link</h4>
                    <button
                      onClick={() => {
                        setEditingMeetLink(true);
                        setNewMeetLink(course.googleMeetLink || '');
                      }}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                  {course.googleMeetLink ? (
                    <a
                      href={course.googleMeetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 break-all"
                    >
                      {course.googleMeetLink}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-500">No link set</p>
                  )}
                </div>

                {/* Enrollment Deadline */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-yellow-900">Enrollment Deadline</h4>
                    <button
                      onClick={() => {
                        const newDeadline = prompt('Enter new deadline (YYYY-MM-DDTHH:MM):', course.enrollmentDeadline || '');
                        if (newDeadline) {
                          updateDeadline(course.id, newDeadline);
                        }
                      }}
                      className="text-yellow-600 hover:text-yellow-700"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-yellow-800">
                    {course.enrollmentDeadline ? formatDate(course.enrollmentDeadline) : 'No deadline set'}
                  </p>
                </div>

                {/* Access Period */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Access Period</h4>
                  <div className="text-sm text-green-800">
                    <p>Start: {course.accessStartDate ? formatDate(course.accessStartDate) : 'Not set'}</p>
                    <p>End: {course.accessEndDate ? formatDate(course.accessEndDate) : 'Not set'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Details */}
            {selectedCourse?.id === course.id && (
              <div className="p-6">
                {/* Navigation Tabs */}
                <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                  {[
                    { id: 'overview', label: 'Overview', icon: Eye },
                    { id: 'students', label: 'Students', icon: Users },
                    { id: 'materials', label: 'Materials', icon: FileText },
                    { id: 'tests', label: 'Tests', icon: TestTube },
                    { id: 'settings', label: 'Settings', icon: Settings }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Course Overview</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Topics ({course.topics.length})</h5>
                        <div className="space-y-2">
                          {course.topics.map((topic) => (
                            <div key={topic.id} className="p-3 bg-gray-50 rounded-lg">
                              <h6 className="font-medium text-gray-900">{topic.title}</h6>
                              <p className="text-sm text-gray-600">{topic.description}</p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                <span>{topic.materials.length} materials</span>
                                <span>{topic.tests.length} tests</span>
                                <span>{topic.subtopics.length} subtopics</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Course Statistics</h5>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Materials:</span>
                            <span className="font-medium">
                              {course.topics.reduce((sum, topic) => 
                                sum + topic.materials.length + topic.subtopics.reduce((subSum, sub) => 
                                  subSum + sub.materials.length, 0), 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Tests:</span>
                            <span className="font-medium">
                              {course.topics.reduce((sum, topic) => 
                                sum + topic.tests.length + topic.subtopics.reduce((subSum, sub) => 
                                  subSum + sub.tests.length, 0), 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Enrollment Rate:</span>
                            <span className="font-medium">
                              {Math.round((course.enrolledStudents / course.maxStudents) * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'students' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Enrolled Students</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600">
                        Student management features will be available here. 
                        You can view student progress, send messages, and track completion.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'materials' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Course Materials</h4>
                    <div className="space-y-4">
                      {course.topics.map((topic) => (
                        <div key={topic.id} className="border border-gray-200 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-3">{topic.title}</h5>
                          <div className="space-y-2">
                            {topic.materials.map((material) => (
                              <div key={material.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center space-x-2">
                                  <FileText className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm text-gray-900">{material.title}</span>
                                  <span className="text-xs text-gray-500">({material.type})</span>
                                </div>
                                <button className="text-blue-600 hover:text-blue-700">
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            {topic.subtopics.map((subtopic) => (
                              <div key={subtopic.id} className="ml-4">
                                <h6 className="text-sm font-medium text-gray-700 mb-2">{subtopic.title}</h6>
                                <div className="space-y-1">
                                  {subtopic.materials.map((material) => (
                                    <div key={material.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                      <div className="flex items-center space-x-2">
                                        <FileText className="w-3 h-3 text-gray-500" />
                                        <span className="text-xs text-gray-900">{material.title}</span>
                                        <span className="text-xs text-gray-500">({material.type})</span>
                                      </div>
                                      <button className="text-blue-600 hover:text-blue-700">
                                        <Eye className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'tests' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Course Tests</h4>
                    <div className="space-y-4">
                      {course.topics.map((topic) => (
                        <div key={topic.id} className="border border-gray-200 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-3">{topic.title}</h5>
                          <div className="space-y-2">
                            {topic.tests.map((test) => (
                              <div key={test.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                <div>
                                  <span className="text-sm font-medium text-gray-900">{test.title}</span>
                                  <div className="text-xs text-gray-500">
                                    {test.duration} min • {test.totalPoints} points
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    test.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {test.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                  <button className="text-blue-600 hover:text-blue-700">
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Course Settings</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600">
                        Advanced course settings and configuration options will be available here.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses assigned</h3>
          <p className="text-gray-600">
            {searchTerm 
              ? 'No courses match your search criteria.'
              : 'You have not been assigned to any courses yet.'
            }
          </p>
        </div>
      )}

      {/* Edit Meet Link Modal */}
      {editingMeetLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Google Meet Link</h3>
            <input
              type="url"
              value={newMeetLink}
              onChange={(e) => setNewMeetLink(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  if (selectedCourse) {
                    updateMeetLink(selectedCourse.id);
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update
              </button>
              <button
                onClick={() => {
                  setEditingMeetLink(false);
                  setNewMeetLink('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
