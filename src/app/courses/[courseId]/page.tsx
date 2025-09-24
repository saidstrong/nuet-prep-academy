"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  BookOpen, Users, Clock, Star, Target, Calendar, DollarSign, 
  Heart, Bookmark, ArrowLeft, Share2
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EnrollmentRequestModal from '@/components/EnrollmentRequestModal';
// Removed unused imports

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
  totalMaterials: number;
  totalTests: number;
  enrolledStudents: number;
  completionRate: number;
  thumbnail?: string;
  rating?: number;
  reviews?: number;
}

interface Topic {
  id: string;
  title: string;
  description: string;
  order: number;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [course, setCourse] = useState<Course | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showEnrollmentFlow, setShowEnrollmentFlow] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview'>('overview');

  const courseId = params.courseId as string;

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${courseId}`, { credentials: 'include' });
      
      if (response.ok) {
        const data = await response.json();
        setCourse(data.course);
        setTopics(data.topics || []);
        setIsEnrolled(data.isEnrolled || false);
        setIsFavorite(data.isFavorite || false);
        setIsBookmarked(data.isBookmarked || false);
      } else if (response.status === 404) {
        setError('Course not found');
      } else {
        setError('Failed to load course details');
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Double-check session status
    if (!session.user || !session.user.id) {
      alert('Your session is invalid. Please sign in again.');
      router.push('/auth/signin');
      return;
    }

    // Open enrollment request modal
    setShowEnrollmentFlow(true);
  };

  // Enrollment is now handled through enrollment request modal

  const handleToggleFavorite = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    try {
      const response = await fetch('/api/courses/favorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ courseId, isFavorite: !isFavorite }),
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleToggleBookmark = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    try {
      const response = await fetch('/api/courses/bookmark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ courseId, isBookmarked: !isBookmarked }),
      });

      if (response.ok) {
        setIsBookmarked(!isBookmarked);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
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

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return '🟢';
      case 'INTERMEDIATE': return '🟡';
      case 'ADVANCED': return '🔴';
      default: return '⚪';
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
            <p className="text-gray-600 mb-8">{error || 'The course you are looking for does not exist.'}</p>
            <button
              onClick={() => router.push('/courses')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Courses
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/courses')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Overview Only - No Content Access Before Enrollment */}
            {/* Tab Content */}
            {activeTab === 'overview' && (
              <>
                {/* Course Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                      {getDifficultyIcon(course.difficulty)} {course.difficulty}
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                      <Star className="w-4 h-4 fill-current text-yellow-400 mr-1" />
                      <span>{course.rating || 4.5}</span>
                      <span className="ml-1">({course.reviews || 0} reviews)</span>
                    </div>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-2" />
                    <span>by {course.instructor}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleToggleFavorite}
                    className={`p-2 rounded-full transition-colors ${
                      isFavorite 
                        ? 'bg-red-100 text-red-500' 
                        : 'bg-gray-100 text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={handleToggleBookmark}
                    className={`p-2 rounded-full transition-colors ${
                      isBookmarked 
                        ? 'bg-blue-100 text-blue-500' 
                        : 'bg-gray-100 text-gray-400 hover:text-blue-500'
                    }`}
                  >
                    <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Course Stats - Simplified */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{course.totalTopics}</div>
                  <div className="text-sm text-gray-500">Topics</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{course.estimatedHours}h</div>
                  <div className="text-sm text-gray-500">Duration</div>
                </div>
              </div>
            </div>

            {/* Course Information - No Content Access Before Enrollment */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Course Information</h2>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Course Structure</span>
                  </div>
                  <p className="text-sm text-blue-800">
                    This course includes {course.totalTopics} topics with comprehensive materials, 
                    interactive tests, and hands-on exercises. Content will be available after enrollment approval.
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">Learning Experience</span>
                  </div>
                  <p className="text-sm text-green-800">
                    Learn from experienced instructors with {course.estimatedHours} hours of content, 
                    including live sessions and personalized support.
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-yellow-900">Access Requirements</span>
                  </div>
                  <p className="text-sm text-yellow-800">
                    Course content is only accessible after enrollment approval by our managers. 
                    Contact us to begin your learning journey.
                  </p>
                </div>
              </div>
            </div>
                </>
              )}

              {/* Content access removed - only available after enrollment approval */}
            </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {course.price === 0 ? 'Free' : `$${course.price}`}
                </div>
                <div className="text-sm text-gray-500">{course.duration}</div>
              </div>

              {(session?.user.role === 'ADMIN' || session?.user.role === 'MANAGER') ? (
                <div className="space-y-3">
                  <button
                    onClick={() => router.push(`/admin/courses/${courseId}/content`)}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Manage Course
                  </button>
                  <button
                    onClick={() => router.push(`/admin/courses/${courseId}`)}
                    className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              ) : isEnrolled ? (
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/student/dashboard')}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Continue Learning
                  </button>
                  <button 
                    onClick={() => router.push('/my-courses')}
                    className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    View Progress
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleEnroll}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Enroll for {course.title}
                  </button>
                  <button 
                    onClick={() => {
                      const courseUrl = window.location.href;
                      navigator.clipboard.writeText(courseUrl).then(() => {
                        alert('Course link copied to clipboard!');
                      }).catch(() => {
                        // Fallback for older browsers
                        const textArea = document.createElement('textarea');
                        textArea.value = courseUrl;
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                        alert('Course link copied to clipboard!');
                      });
                    }}
                    className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Share2 className="w-4 h-4 inline mr-2" />
                    Share Course
                  </button>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">What you'll learn</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Complete course curriculum
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    {course.totalTopics} comprehensive topics
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Expert instruction from {course.instructor}
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Certificate of completion
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Students enrolled</span>
                  <span>{course.enrolledStudents}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                  <span>Course level</span>
                  <span className="capitalize">{course.difficulty.toLowerCase()}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                  <span>Last updated</span>
                  <span>{new Date(course.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      
      {/* Enrollment Request Modal */}
      {course && showEnrollmentFlow && (
        <EnrollmentRequestModal
          isOpen={showEnrollmentFlow}
          onClose={() => setShowEnrollmentFlow(false)}
          course={course}
        />
      )}
    </div>
  );
}
