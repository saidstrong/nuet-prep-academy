"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  BookOpen, 
  Clock, 
  Users, 
  DollarSign, 
  Star, 
  Search, 
  Filter,
  Eye,
  User,
  MessageCircle,
  Phone
} from 'lucide-react';
import EnrollmentRequestModal from './EnrollmentRequestModal';
import ManagerContactInfo from './ManagerContactInfo';

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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EnrollmentRequest {
  id: string;
  courseId: string;
  status: string;
  createdAt: string;
}

export default function StudentCourseBrowser() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollmentRequests, setEnrollmentRequests] = useState<EnrollmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'available' | 'registered'>('available');

  useEffect(() => {
    fetchCourses();
    if (session?.user) {
      fetchEnrollmentRequests();
    }
  }, [session]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
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

  const fetchEnrollmentRequests = async () => {
    try {
      const response = await fetch('/api/enrollment-requests');
      if (response.ok) {
        const data = await response.json();
        setEnrollmentRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching enrollment requests:', error);
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

  const getEnrollmentStatus = (courseId: string) => {
    const request = enrollmentRequests.find(req => req.courseId === courseId);
    return request ? request.status : null;
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || course.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty && course.isActive;
  });

  const registeredCourses = courses.filter(course => {
    const enrollmentStatus = getEnrollmentStatus(course.id);
    return enrollmentStatus === 'APPROVED';
  });

  const pendingCourses = courses.filter(course => {
    const enrollmentStatus = getEnrollmentStatus(course.id);
    return enrollmentStatus === 'PENDING';
  });

  const handleEnrollmentRequest = (course: Course) => {
    setSelectedCourse(course);
    setShowEnrollmentModal(true);
  };

  const handleEnrollmentSuccess = () => {
    fetchEnrollmentRequests();
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
        <p className="text-gray-600">
          Manage your course enrollments and browse available courses.
        </p>
        
        {/* Tabs */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('available')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'available'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Available Courses ({filteredCourses.length})
            </button>
            <button
              onClick={() => setActiveTab('registered')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'registered'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Registered Courses ({registeredCourses.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Search and Filter - Only for Available Courses */}
      {activeTab === 'available' && (
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
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
            <div className="sm:w-48">
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Contact Information */}
      <div className="mb-8">
        <ManagerContactInfo />
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(activeTab === 'available' ? filteredCourses : registeredCourses).map((course) => {
          const enrollmentStatus = getEnrollmentStatus(course.id);
          
          return (
            <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">{course.description}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    <span>Instructor: {course.instructor}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{course.estimatedHours} hours</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{course.enrolledStudents}/{course.maxStudents} students</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(course.difficulty)}`}>
                    {course.difficulty}
                  </span>
                  <div className="flex items-center text-lg font-semibold text-green-600">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {course.price}
                  </div>
                </div>

                {/* Enrollment Status */}
                {enrollmentStatus && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center text-sm">
                      <MessageCircle className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="text-blue-800">
                        Status: <span className="font-semibold capitalize">{enrollmentStatus.toLowerCase()}</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {activeTab === 'available' ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEnrollmentRequest(course)}
                      disabled={enrollmentStatus === 'PENDING' || enrollmentStatus === 'APPROVED'}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        enrollmentStatus === 'PENDING' 
                          ? 'bg-yellow-100 text-yellow-800 cursor-not-allowed'
                          : enrollmentStatus === 'APPROVED'
                          ? 'bg-green-100 text-green-800 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {enrollmentStatus === 'PENDING' 
                        ? 'Request Pending'
                        : enrollmentStatus === 'APPROVED'
                        ? 'Enrolled'
                        : 'Request Enrollment'
                      }
                    </button>
                    <button
                      onClick={() => window.open(`/courses/${course.id}`, '_blank')}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.open(`/courses/${course.id}/access`, '_blank')}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Access Course
                    </button>
                    <button
                      onClick={() => window.open(`/courses/${course.id}`, '_blank')}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {(activeTab === 'available' ? filteredCourses.length === 0 : registeredCourses.length === 0) && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'available' ? 'No courses found' : 'No registered courses'}
          </h3>
          <p className="text-gray-600">
            {activeTab === 'available' 
              ? (searchTerm || filterDifficulty !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No courses are currently available.')
              : 'You haven\'t enrolled in any courses yet. Browse available courses to get started.'
            }
          </p>
          {activeTab === 'registered' && (
            <button
              onClick={() => setActiveTab('available')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Available Courses
            </button>
          )}
        </div>
      )}

      {/* Enrollment Request Modal */}
      {selectedCourse && (
        <EnrollmentRequestModal
          isOpen={showEnrollmentModal}
          onClose={() => {
            setShowEnrollmentModal(false);
            setSelectedCourse(null);
          }}
          course={selectedCourse}
        />
      )}
    </div>
  );
}