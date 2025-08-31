"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Users,
  TrendingUp,
  Target,
  Calendar,
  MessageCircle,
  Eye,
  BarChart3,
  FileText,
  PlayCircle,
  CheckCircle,
  Clock,
  Award,
  Bookmark,
  ArrowRight
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Course {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalTopics: number;
  completedTopics: number;
  totalTests: number;
  completedTests: number;
  lastAccessed: string;
}

interface Test {
  id: string;
  title: string;
  courseTitle: string;
  score: number;
  maxScore: number;
  status: string;
  submittedAt: string;
  duration: number;
}

interface Material {
  id: string;
  title: string;
  type: string;
  courseTitle: string;
  topicTitle: string;
  lastAccessed: string;
  isCompleted: boolean;
}

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'tests' | 'materials'>('overview');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'STUDENT') {
      router.push('/auth/signin');
      return;
    }

    fetchStudentData();
  }, [session, status, router]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);

      // Fetch student's data
      const [coursesResponse, testsResponse, materialsResponse] = await Promise.all([
        fetch('/api/student/courses'),
        fetch('/api/student/tests'),
        fetch('/api/student/materials')
      ]);

      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setCourses(coursesData.courses || []);
      }

      if (testsResponse.ok) {
        const testsData = await testsResponse.json();
        setTests(testsData.tests || []);
      }

      if (materialsResponse.ok) {
        const materialsData = await materialsResponse.json();
        setMaterials(materialsData.materials || []);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalCourses = () => courses.length;
  const getTotalTests = () => tests.length;
  const getAverageScore = () => {
    if (tests.length === 0) return 0;
    const totalScore = tests.reduce((sum, test) => sum + test.score, 0);
    const totalMax = tests.reduce((sum, test) => sum + test.maxScore, 0);
    return totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
  };
  const getCompletedMaterials = () => materials.filter(m => m.isCompleted).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXCELLENT': return 'bg-green-100 text-green-800';
      case 'GOOD': return 'bg-blue-100 text-blue-800';
      case 'SATISFACTORY': return 'bg-yellow-100 text-yellow-800';
      case 'PASSED': return 'bg-orange-100 text-orange-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMaterialTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FileText className="w-4 h-4" />;
      case 'VIDEO': return <PlayCircle className="w-4 h-4" />;
      case 'AUDIO': return <PlayCircle className="w-4 h-4" />;
      case 'LINK': return <Bookmark className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading student dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!session || session.user.role !== 'STUDENT') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
              <p className="text-gray-600">Welcome back, {session.user.name}! Track your progress and access your learning materials.</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/courses')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Browse Courses</span>
              </button>
              <button
                onClick={() => router.push('/chat')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                <p className="text-2xl font-semibold text-gray-900">{getTotalCourses()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <PlayCircle className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tests Taken</p>
                <p className="text-2xl font-semibold text-gray-900">{getTotalTests()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-semibold text-gray-900">{getAverageScore()}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Materials Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{getCompletedMaterials()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'courses', label: 'My Courses', icon: BookOpen },
                { id: 'tests', label: 'Test History', icon: PlayCircle },
                { id: 'materials', label: 'Learning Materials', icon: FileText }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Learning Progress</h3>

                {/* Recent Courses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Recent Courses</h4>
                    {courses.slice(0, 3).map((course) => (
                      <div key={course.id} className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600">{course.title}</span>
                        <span className="text-sm font-medium text-gray-900">{course.progress}%</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Recent Test Results</h4>
                    {tests.slice(0, 3).map((test) => (
                      <div key={test.id} className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600">{test.title}</span>
                        <span className="text-sm font-medium text-gray-900">{test.score}/{test.maxScore}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setActiveTab('courses')}
                      className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
                    >
                      <BookOpen className="w-6 h-6 text-blue-600 mb-2" />
                      <h5 className="font-medium text-blue-900">Continue Learning</h5>
                      <p className="text-sm text-blue-700">Resume your courses and track progress</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('tests')}
                      className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
                    >
                      <PlayCircle className="w-6 h-6 text-green-600 mb-2" />
                      <h5 className="font-medium text-green-900">Take Tests</h5>
                      <p className="text-sm text-green-700">Complete assessments and view results</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('materials')}
                      className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left"
                    >
                      <FileText className="w-6 h-6 text-purple-600 mb-2" />
                      <h5 className="font-medium text-purple-900">Study Materials</h5>
                      <p className="text-sm text-purple-700">Access PDFs, videos, and resources</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">My Enrolled Courses</h3>
                  <button
                    onClick={() => router.push('/courses')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Browse More Courses →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <div key={course.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="text-lg font-medium text-gray-900">{course.title}</h4>
                        <span className="text-sm text-gray-500">{course.progress}%</span>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Topics Progress</span>
                          <span className="font-medium">{course.completedTopics}/{course.totalTopics}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Tests Completed</span>
                          <span className="font-medium">{course.completedTests}/{course.totalTests}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-2" />
                          Last accessed: {new Date(course.lastAccessed).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/courses/${course.id}`)}
                          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Continue</span>
                        </button>
                        <button
                          onClick={() => router.push(`/courses/${course.id}/materials`)}
                          className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Materials</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {courses.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No courses enrolled yet</h3>
                    <p className="text-gray-600 mb-4">Start your learning journey by enrolling in courses.</p>
                    <button
                      onClick={() => router.push('/courses')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Browse Courses
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tests' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Test History & Performance</h3>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tests.map((test) => (
                          <tr key={test.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{test.title}</div>
                                <div className="text-sm text-gray-500">Duration: {test.duration} min</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {test.courseTitle}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {test.score}/{test.maxScore}
                              </div>
                              <div className="text-sm text-gray-500">
                                {Math.round((test.score / test.maxScore) * 100)}%
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(test.status)}`}>
                                {test.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(test.submittedAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => router.push(`/tests/${test.id}/results`)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View Results
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {tests.length === 0 && (
                    <div className="text-center py-12">
                      <PlayCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No tests taken yet</h3>
                      <p className="text-gray-600">Complete tests in your courses to see your results here.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'materials' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Learning Materials</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {materials.map((material) => (
                    <div key={material.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          {getMaterialTypeIcon(material.type)}
                          <span className="text-xs font-medium text-gray-500 uppercase">{material.type}</span>
                        </div>
                        {material.isCompleted && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>

                      <h4 className="text-lg font-medium text-gray-900 mb-2">{material.title}</h4>
                      <div className="text-sm text-gray-600 mb-4">
                        <div>{material.courseTitle}</div>
                        <div className="text-gray-500">{material.topicTitle}</div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>Last accessed: {new Date(material.lastAccessed).toLocaleDateString()}</span>
                      </div>

                      <button
                        onClick={() => router.push(`/materials/${material.id}`)}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>{material.isCompleted ? 'Review' : 'Study'}</span>
                      </button>
                    </div>
                  ))}
                </div>

                {materials.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No materials available yet</h3>
                    <p className="text-gray-600">Course materials will appear here once you enroll in courses.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
