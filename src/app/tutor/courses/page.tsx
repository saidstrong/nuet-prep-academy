"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  FileText, 
  PlayCircle,
  Eye,
  BarChart3,
  MessageCircle,
  ArrowLeft
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

export default function TutorCoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCourseDetails, setShowCourseDetails] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'TUTOR') {
      router.push('/auth/signin');
      return;
    }

    fetchCourses();
  }, [session, status, router]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tutor/courses');
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

  const viewCourseDetails = (course: Course) => {
    setSelectedCourse(course);
    setShowCourseDetails(true);
  };

  const closeCourseDetails = () => {
    setShowCourseDetails(false);
    setSelectedCourse(null);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading courses...</p>
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/tutor/dashboard')}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
                <p className="text-gray-600">Manage your assigned courses and view student progress</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/tutor/dashboard')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard</span>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-semibold text-gray-900">{courses.length}</p>
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
                <p className="text-2xl font-semibold text-gray-900">
                  {courses.reduce((total, course) => total + course.studentCount, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FileText className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Topics</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {courses.reduce((total, course) => total + course.topics.length, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  course.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {course.status}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 mr-2" />
                  <span className="font-medium">{course.studentCount}</span> students enrolled
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  Duration: <span className="font-medium">{course.duration}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <FileText className="w-4 h-4 mr-2" />
                  <span className="font-medium">{course.topics.length}</span> topics
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <PlayCircle className="w-4 h-4 mr-2" />
                  <span className="font-medium">
                    {course.topics.reduce((total, topic) => total + topic.testsCount, 0)}
                  </span> tests available
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => viewCourseDetails(course)}
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
      
      <Footer />

      {/* Course Details Modal */}
      {showCourseDetails && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Course Details: {selectedCourse.title}</h2>
              <button
                onClick={closeCourseDetails}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Course Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Course Information</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <p className="text-sm text-gray-900">{selectedCourse.description}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Duration</label>
                      <p className="text-sm text-gray-900">{selectedCourse.duration}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Price</label>
                      <p className="text-sm text-gray-900">${selectedCourse.price}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        selectedCourse.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedCourse.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Statistics</h3>
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-blue-900">Enrolled Students</div>
                      <div className="text-2xl font-bold text-blue-600">{selectedCourse.studentCount}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-green-900">Total Topics</div>
                      <div className="text-2xl font-bold text-green-600">{selectedCourse.topics.length}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Topics */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Course Topics</h3>
                <div className="space-y-4">
                  {selectedCourse.topics.map((topic) => (
                    <div key={topic.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          Topic {topic.order}: {topic.title}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                      {topic.description && (
                        <p className="text-sm text-gray-600">{topic.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => router.push(`/tutor/courses/${selectedCourse.id}/materials`)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Manage Materials
                </button>
                <button
                  onClick={() => router.push(`/tutor/courses/${selectedCourse.id}/students`)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  View Students
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
