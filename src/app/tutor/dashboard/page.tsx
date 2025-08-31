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
  PlayCircle
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  status: string;
  studentCount: number;
  topics: Topic[];
}

interface Topic {
  id: string;
  title: string;
  description?: string;
  order: number;
  materialsCount: number;
  testsCount: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
  enrolledAt: string;
  progress: number;
  lastActivity: string;
}

export default function TutorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'students' | 'materials'>('overview');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'TUTOR') {
      router.push('/auth/signin');
      return;
    }

    fetchTutorData();
  }, [session, status, router]);

  const fetchTutorData = async () => {
    try {
      setLoading(true);
      
      // Fetch tutor's courses and students
      const [coursesResponse, studentsResponse] = await Promise.all([
        fetch('/api/tutor/courses'),
        fetch('/api/tutor/students')
      ]);

      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setCourses(coursesData.courses || []);
      }

      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        setStudents(studentsData.students || []);
      }
    } catch (error) {
      console.error('Error fetching tutor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalStudents = () => {
    return students.length;
  };

  const getTotalCourses = () => {
    return courses.length;
  };

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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading tutor dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!session || session.user.role !== 'TUTOR') {
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Tutor Dashboard</h1>
              <p className="text-gray-600">Welcome back, {session.user.name}! Manage your courses and students.</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/tutor/courses')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Manage Courses</span>
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
                <p className="text-sm font-medium text-gray-600">Active Courses</p>
                <p className="text-2xl font-semibold text-gray-900">{getTotalCourses()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <Users className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-semibold text-gray-900">{getTotalStudents()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                <p className="text-2xl font-semibold text-gray-900">{getAverageProgress()}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <Target className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Students</p>
                <p className="text-2xl font-semibold text-gray-900">{getActiveStudents()}</p>
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
                { id: 'students', label: 'My Students', icon: Users },
                { id: 'materials', label: 'Materials', icon: FileText }
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
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                
                {/* Recent Courses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Recent Courses</h4>
                    {courses.slice(0, 3).map((course) => (
                      <div key={course.id} className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600">{course.title}</span>
                        <span className="text-sm font-medium text-gray-900">{course.studentCount} students</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Student Progress</h4>
                    {students.slice(0, 3).map((student) => (
                      <div key={student.id} className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600">{student.name}</span>
                        <span className="text-sm font-medium text-gray-900">{student.progress}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">My Assigned Courses</h3>
                  <button
                    onClick={() => router.push('/tutor/courses')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View All →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <div key={course.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="text-lg font-medium text-gray-900">{course.title}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          course.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {course.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="w-4 h-4 mr-2" />
                          {course.studentCount} students enrolled
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-2" />
                          Duration: {course.duration}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <FileText className="w-4 h-4 mr-2" />
                          {course.topics.length} topics
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/tutor/courses/${course.id}`)}
                          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Details</span>
                        </button>
                        <button
                          onClick={() => router.push(`/tutor/courses/${course.id}/materials`)}
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No courses assigned yet</h3>
                    <p className="text-gray-600">You haven't been assigned to any courses yet. Contact the admin to get started.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'students' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">My Students</h3>
                  <button
                    onClick={() => router.push('/tutor/students')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View All →
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                <div className="text-sm text-gray-500">{student.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(student.enrolledAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${student.progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-900">{student.progress}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(student.lastActivity).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => router.push(`/tutor/students/${student.id}`)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                View
                              </button>
                              <button
                                onClick={() => router.push(`/chat?student=${student.id}`)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Chat
                              </button>
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

            {activeTab === 'materials' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Course Materials Overview</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <div key={course.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">{course.title}</h4>
                      
                      <div className="space-y-3">
                        {course.topics.map((topic) => (
                          <div key={topic.id} className="border-l-4 border-blue-500 pl-4">
                            <h5 className="font-medium text-gray-900 mb-2">{topic.title}</h5>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="flex items-center">
                                <FileText className="w-4 h-4 mr-1" />
                                {topic.materialsCount} materials
                              </span>
                              <span className="flex items-center">
                                <PlayCircle className="w-4 h-4 mr-1" />
                                {topic.testsCount} tests
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => router.push(`/tutor/courses/${course.id}/materials`)}
                        className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Manage Materials
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
