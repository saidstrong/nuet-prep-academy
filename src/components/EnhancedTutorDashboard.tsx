"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Users, TrendingUp, Target, Calendar, MessageCircle, Eye,
  BarChart3, FileText, PlayCircle, CheckCircle, Clock, Award, Bookmark,
  ArrowRight, Star, Flame, Trophy, Brain, Zap, Bell, Settings, ChevronRight,
  CalendarDays, Timer, BookMarked, Lightbulb, Rocket, Shield, Crown,
  Activity, Target as TargetIcon, Plus, RefreshCw, Download, Share2,
  Percent, Lock, Unlock, AlertCircle, CheckCircle2, Edit, Trash2, User,
  Search, Filter, Download as DownloadIcon, Upload, Save, X, Check,
  Monitor, Smartphone, Tablet, Globe, Clock as ClockIcon, Calendar as CalendarIcon
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  status: string;
  studentCount: number;
  topics: Topic[];
  imageUrl?: string;
  accessPeriods?: {
    startDate: string;
    endDate: string;
    timezone: string;
  };
}

interface Topic {
  id: string;
  title: string;
  description?: string;
  order: number;
  materialsCount: number;
  testsCount: number;
  accessControl?: {
    isUnlocked: boolean;
    unlockDate?: string;
    lockDate?: string;
  };
}

interface Student {
  id: string;
  name: string;
  email: string;
  enrolledAt: string;
  progress: number;
  lastActivity: string;
  avatar?: string;
  grades?: {
    overall: number;
    topics: { [topicId: string]: number };
    tests: { [testId: string]: number };
  };
}

interface Test {
  id: string;
  title: string;
  courseId: string;
  topicId: string;
  questions: Question[];
  timeLimit: number;
  maxAttempts: number;
  accessControl?: {
    isUnlocked: boolean;
    unlockDate?: string;
    lockDate?: string;
  };
}

interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

export default function EnhancedTutorDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'students' | 'access-control' | 'tests'>('overview');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);

  useEffect(() => {
    if (session) {
      fetchTutorData();
    }
  }, [session]);

  const fetchTutorData = async () => {
    try {
      setLoading(true);
      
      const [coursesResponse, studentsResponse, testsResponse] = await Promise.all([
        fetch('/api/tutor/courses', { credentials: 'include' }),
        fetch('/api/tutor/students', { credentials: 'include' }),
        fetch('/api/tutor/tests', { credentials: 'include' })
      ]);

      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setCourses(coursesData.courses || []);
      }

      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        setStudents(studentsData.students || []);
      }

      if (testsResponse.ok) {
        const testsData = await testsResponse.json();
        setTests(testsData.tests || []);
      }
    } catch (error) {
      console.error('Error fetching tutor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalStudents = () => students.length;
  const getTotalCourses = () => courses.length;
  const getAverageProgress = () => {
    if (students.length === 0) return 0;
    const totalProgress = students.reduce((sum, student) => sum + student.progress, 0);
    return Math.round(totalProgress / students.length);
  };
  const getActiveStudents = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return students.filter(student => new Date(student.lastActivity) > oneWeekAgo).length;
  };

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
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800';
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
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Tutor Dashboard</h1>
            <p className="text-green-100">Welcome back, {session?.user?.name}! Manage your courses and students.</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{getTotalCourses()}</div>
            <p className="text-green-100">Active Courses</p>
          </div>
        </div>
      </div>

      {/* Quick Stats - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-slate-600">Courses</p>
              <p className="text-xl font-bold text-slate-900">{getTotalCourses()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-slate-600">Students</p>
              <p className="text-xl font-bold text-slate-900">{getTotalStudents()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-slate-600">Avg Progress</p>
              <p className="text-xl font-bold text-slate-900">{getAverageProgress()}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-slate-600">Active</p>
              <p className="text-xl font-bold text-slate-900">{getActiveStudents()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Tabs */}
      <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'courses', label: 'My Courses', icon: BookOpen },
          { id: 'students', label: 'Students', icon: Users },
          { id: 'access-control', label: 'Access Control', icon: Lock },
          { id: 'tests', label: 'Tests', icon: PlayCircle }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Recent Courses</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {courses.slice(0, 3).map((course) => (
                    <div key={course.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">{course.title}</h4>
                          <p className="text-sm text-slate-600">{course.studentCount} students</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(course.status)}`}>
                        {course.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Student Progress</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {students.slice(0, 3).map((student) => (
                    <div key={student.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">{student.name}</h4>
                          <p className="text-sm text-slate-600">{student.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-900">{student.progress}%</div>
                        <div className="w-16 bg-slate-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('courses')}
                  className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 text-left transition-colors"
                >
                  <BookOpen className="w-6 h-6 text-blue-600 mb-2" />
                  <h5 className="font-medium text-blue-900">Manage Courses</h5>
                  <p className="text-sm text-blue-700">View and edit your courses</p>
                </button>

                <button
                  onClick={() => setActiveTab('students')}
                  className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 text-left transition-colors"
                >
                  <Users className="w-6 h-6 text-green-600 mb-2" />
                  <h5 className="font-medium text-green-900">View Students</h5>
                  <p className="text-sm text-green-700">Monitor student progress</p>
                </button>

                <button
                  onClick={() => setActiveTab('access-control')}
                  className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 text-left transition-colors"
                >
                  <Lock className="w-6 h-6 text-purple-600 mb-2" />
                  <h5 className="font-medium text-purple-900">Access Control</h5>
                  <p className="text-sm text-purple-700">Manage content access</p>
                </button>

                <button
                  onClick={() => setActiveTab('tests')}
                  className="p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 text-left transition-colors"
                >
                  <PlayCircle className="w-6 h-6 text-orange-600 mb-2" />
                  <h5 className="font-medium text-orange-900">Manage Tests</h5>
                  <p className="text-sm text-orange-700">Create and edit tests</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">My Assigned Courses</h3>
            <button
              onClick={() => router.push('/tutor/courses')}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm"
            >
              Manage All Courses
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-slate-900 mb-1">{course.title}</h4>
                      <p className="text-sm text-slate-600 mb-2">{course.description}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(course.status)}`}>
                          {course.status}
                        </span>
                        <span className="text-xs text-slate-500">{course.duration}</span>
                      </div>
                    </div>
                    {course.imageUrl && (
                      <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center ml-4">
                        <img src={course.imageUrl} alt={course.title} className="w-12 h-12 object-cover rounded" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Students enrolled</span>
                      <span className="font-medium text-slate-900">{course.studentCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Topics</span>
                      <span className="font-medium text-slate-900">{course.topics.length}</span>
                    </div>
                    {course.accessPeriods && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Access Period</span>
                        <span className="font-medium text-slate-900">
                          {new Date(course.accessPeriods.startDate).toLocaleDateString()} - {new Date(course.accessPeriods.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/tutor/courses/${course.id}`)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCourse(course);
                        setShowAccessModal(true);
                      }}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium flex items-center justify-center space-x-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Access</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {courses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses assigned yet</h3>
              <p className="text-gray-600">You haven't been assigned to any courses yet. Contact the admin to get started.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'students' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">My Students</h3>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Enrolled</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Activity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                            {student.avatar ? (
                              <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{student.name}</div>
                            <div className="text-sm text-slate-500">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {new Date(student.enrolledAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-slate-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${student.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-slate-900">{student.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {new Date(student.lastActivity).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => router.push(`/tutor/students/${student.id}`)}
                            className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => router.push(`/chat?student=${student.id}`)}
                            className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>Chat</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {students.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No students yet</h3>
                <p className="text-gray-600">You don't have any students enrolled in your courses yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'access-control' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Access Control Management</h3>
            <p className="text-sm text-slate-600">Control when students can access topics, materials, and tests</p>
          </div>

          <div className="space-y-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-slate-900">{course.title}</h4>
                    <button
                      onClick={() => {
                        setSelectedCourse(course);
                        setShowAccessModal(true);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center space-x-2"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Manage Access</span>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {course.topics.map((topic) => (
                      <div key={topic.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {topic.accessControl?.isUnlocked ? (
                            <Unlock className="w-5 h-5 text-green-600" />
                          ) : (
                            <Lock className="w-5 h-5 text-red-600" />
                          )}
                          <div>
                            <h5 className="font-medium text-slate-900">{topic.title}</h5>
                            <p className="text-sm text-slate-600">{topic.materialsCount} materials, {topic.testsCount} tests</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {topic.accessControl?.isUnlocked ? (
                            <span className="text-sm text-green-600">Unlocked</span>
                          ) : (
                            <span className="text-sm text-red-600">
                              Locks: {topic.accessControl?.lockDate ? new Date(topic.accessControl.lockDate).toLocaleDateString() : 'Never'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'tests' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Test Management</h3>
            <button
              onClick={() => setShowTestModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Test</span>
            </button>
          </div>

          <div className="space-y-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h4 className="text-lg font-semibold text-slate-900">{course.title}</h4>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {course.topics.map((topic) => (
                      <div key={topic.id} className="border-l-4 border-blue-500 pl-4">
                        <h5 className="font-medium text-slate-900 mb-2">{topic.title}</h5>
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <span className="flex items-center">
                            <PlayCircle className="w-4 h-4 mr-1" />
                            {topic.testsCount} tests
                          </span>
                          <span className="flex items-center">
                            <FileText className="w-4 h-4 mr-1" />
                            {topic.materialsCount} materials
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
