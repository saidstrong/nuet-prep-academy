"use client";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BookOpen, Users, FileText, Clock, Eye, MessageCircle } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  status: string;
  topics: Topic[];
  enrollments: Enrollment[];
}

interface Topic {
  id: string;
  title: string;
  description: string;
  materials: Material[];
  tests: Test[];
}

interface Material {
  id: string;
  title: string;
  description: string;
  type: string;
  content: string;
  fileUrl?: string;
}

interface Test {
  id: string;
  title: string;
  description: string;
  type: string;
  duration: number;
  totalPoints: number;
  isActive: boolean;
  submissions: TestSubmission[];
}

interface Enrollment {
  id: string;
  student: {
    id: string;
    name: string;
    email: string;
    profile?: {
      phone?: string;
      whatsapp?: string;
    };
  };
  enrolledAt: string;
  status: string;
  paymentStatus: string;
}

interface TestSubmission {
  id: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  submittedAt: string;
  score?: number;
  maxScore: number;
  status: string;
}

export default function TutorPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'TUTOR') {
      router.push('/auth/signin');
      return;
    }

    fetchTutorCourses();
  }, [session, status, router]);

  const fetchTutorCourses = async () => {
    try {
      const response = await fetch('/api/tutor/courses');
      const data = await response.json();
      
      if (data.success) {
        setCourses(data.courses);
        if (data.courses.length > 0) {
          setSelectedCourse(data.courses[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching tutor courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <main>
        <Header />
        <div className="container-section py-16">
          <div className="text-center">Loading...</div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!session || session.user.role !== 'TUTOR') {
    return null;
  }

  const totalStudents = courses.reduce((sum, course) => sum + course.enrollments.length, 0);
  const totalTopics = courses.reduce((sum, course) => sum + course.topics.length, 0);
  const totalTests = courses.reduce((sum, course) => sum + course.topics.reduce((tSum, topic) => tSum + topic.tests.length, 0), 0);

  return (
    <main>
      <Header />
      <div className="container-section py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Tutor Panel</h1>
            <p className="text-slate-600">Manage your assigned courses and students</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Assigned Courses</p>
                  <p className="text-2xl font-bold text-slate-900">{courses.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Students</p>
                  <p className="text-2xl font-bold text-slate-900">{totalStudents}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Topics</p>
                  <p className="text-2xl font-bold text-slate-900">{totalTopics}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Course Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-medium text-slate-900 mb-4">Your Courses</h3>
                <div className="space-y-2">
                  {courses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => setSelectedCourse(course)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedCourse?.id === course.id
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-medium text-sm">{course.title}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {course.enrollments.length} students
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Course Content */}
            <div className="lg:col-span-3">
              {selectedCourse ? (
                <div className="space-y-6">
                  {/* Course Header */}
                  <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">{selectedCourse.title}</h2>
                        <p className="text-slate-600 mt-1">{selectedCourse.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-500">Duration</div>
                        <div className="font-medium">{selectedCourse.duration}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-slate-600">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{selectedCourse.enrollments.length} students enrolled</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>{selectedCourse.topics.length} topics</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{selectedCourse.topics.reduce((sum, topic) => sum + topic.tests.length, 0)} tests</span>
                      </div>
                    </div>
                  </div>

                  {/* Topics and Materials */}
                  <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                    <div className="border-b border-slate-200 p-6">
                      <h3 className="text-lg font-medium text-slate-900">Course Content</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {selectedCourse.topics.map((topic) => (
                          <div key={topic.id} className="border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-slate-900">{topic.title}</h4>
                              <button
                                onClick={() => setSelectedTopic(selectedTopic?.id === topic.id ? null : topic)}
                                className="text-primary hover:text-primary-dark text-sm"
                              >
                                {selectedTopic?.id === topic.id ? 'Hide' : 'View'} Details
                              </button>
                            </div>
                            <p className="text-sm text-slate-600 mb-3">{topic.description}</p>
                            
                            {selectedTopic?.id === topic.id && (
                              <div className="space-y-4 mt-4 pt-4 border-t border-slate-200">
                                {/* Materials */}
                                <div>
                                  <h5 className="font-medium text-slate-900 mb-2">Materials</h5>
                                  <div className="space-y-2">
                                    {topic.materials.map((material) => (
                                      <div key={material.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                                        <FileText className="w-4 h-4 text-slate-400" />
                                        <div className="flex-1">
                                          <div className="font-medium text-sm">{material.title}</div>
                                          <div className="text-xs text-slate-500">{material.type}</div>
                                        </div>
                                        <button className="text-primary hover:text-primary-dark text-sm">
                                          <Eye className="w-4 h-4" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Tests */}
                                <div>
                                  <h5 className="font-medium text-slate-900 mb-2">Tests & Exams</h5>
                                  <div className="space-y-2">
                                    {topic.tests.map((test) => (
                                      <div key={test.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                          <FileText className="w-4 h-4 text-slate-400" />
                                          <div>
                                            <div className="font-medium text-sm">{test.title}</div>
                                            <div className="text-xs text-slate-500">
                                              {test.type} • {test.duration} min • {test.totalPoints} points
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <span className="text-xs text-slate-500">
                                            {test.submissions.length} submissions
                                          </span>
                                          <button className="text-primary hover:text-primary-dark text-sm">
                                            <Eye className="w-4 h-4" />
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
                      </div>
                    </div>
                  </div>

                  {/* Students */}
                  <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                    <div className="border-b border-slate-200 p-6">
                      <h3 className="text-lg font-medium text-slate-900">Enrolled Students</h3>
                    </div>
                    <div className="p-6">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Student</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Enrolled</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-200">
                            {selectedCourse.enrollments.map((enrollment) => (
                              <tr key={enrollment.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div>
                                    <div className="text-sm font-medium text-slate-900">{enrollment.student.name}</div>
                                    <div className="text-sm text-slate-500">{enrollment.student.email}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                  <div>{enrollment.student.profile?.phone || 'N/A'}</div>
                                  <div>{enrollment.student.profile?.whatsapp || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                  {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    enrollment.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                    enrollment.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {enrollment.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex space-x-2">
                                    <button className="text-primary hover:text-primary-dark">
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button className="text-blue-600 hover:text-blue-800">
                                      <MessageCircle className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
                  <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No Course Selected</h3>
                  <p className="text-slate-500">Select a course from the sidebar to view its details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
