"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Users, Clock, Target, Search, Filter, Star,
  PlayCircle, FileText, Award, CheckCircle, Plus, Eye
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedHours: number;
  isActive: boolean;
  totalTopics: number;
  totalTests: number;
  enrolledStudents: number;
  rating: number;
  isEnrolled: boolean;
}

export default function StudentCourseBrowser() {
  const { data: session } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [enrolling, setEnrolling] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchCourses();
    }
  }, [session]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
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

  const handleEnroll = async (courseId: string) => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    try {
      setEnrolling(courseId);
      const response = await fetch('/api/student/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId })
      });

      if (response.ok) {
        // Update the course to show as enrolled
        setCourses(prev => prev.map(course => 
          course.id === courseId 
            ? { ...course, isEnrolled: true, enrolledStudents: course.enrolledStudents + 1 }
            : course
        ));
        alert('Successfully enrolled in course!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to enroll in course');
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('Network error. Please try again.');
    } finally {
      setEnrolling(null);
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

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || course.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty && course.isActive;
  });

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
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Courses</h1>
        <p className="text-gray-600">Discover and enroll in courses to start your learning journey</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses by title, instructor, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Difficulties</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">by {course.instructor}</p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getDifficultyColor(course.difficulty)}`}>
                  {course.difficulty}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{course.estimatedHours}h estimated</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{course.enrolledStudents} students</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <FileText className="w-4 h-4 mr-2" />
                    <span>{course.totalTopics} topics</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <PlayCircle className="w-4 h-4 mr-2" />
                    <span>{course.totalTests} tests</span>
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" />
                  <span>{course.rating.toFixed(1)} rating</span>
                </div>
              </div>

              <div className="flex space-x-2">
                {course.isEnrolled ? (
                  <button
                    onClick={() => router.push('/student/dashboard')}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Go to Course</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleEnroll(course.id)}
                    disabled={enrolling === course.id}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {enrolling === course.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    <span>{enrolling === course.id ? 'Enrolling...' : 'Enroll Now'}</span>
                  </button>
                )}
                <button
                  onClick={() => router.push(`/courses/${course.id}`)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}
