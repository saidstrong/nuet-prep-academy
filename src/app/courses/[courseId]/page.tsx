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
import EnhancedEnrollmentFlow from '@/components/EnhancedEnrollmentFlow';
import CourseContentViewer from '@/components/CourseContentViewer';
import ProgressTracker from '@/components/ProgressTracker';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'progress'>('overview');

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

    // Open enrollment flow
    setShowEnrollmentFlow(true);
  };

  const handleEnrollmentComplete = async (enrollmentData: any) => {
    try {
      console.log('Processing enrollment:', enrollmentData);
      
      // Create enrollment in database
      const enrollmentResponse = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          courseId: enrollmentData.courseId,
          tutorId: enrollmentData.tutorId,
          paymentMethod: enrollmentData.paymentMethod,
          contactInfo: enrollmentData.contactInfo
        })
      });

      if (!enrollmentResponse.ok) {
        const errorData = await enrollmentResponse.json();
        throw new Error(errorData.message || 'Failed to create enrollment');
      }

      const enrollmentResult = await enrollmentResponse.json();
      console.log('Enrollment created:', enrollmentResult);

      // If payment method is not "CONTACT_MANAGER", process payment
      if (enrollmentData.paymentMethod !== 'CONTACT_MANAGER') {
        const paymentResponse = await fetch('/api/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            enrollmentId: enrollmentResult.enrollment.id,
            paymentMethod: enrollmentData.paymentMethod,
            amount: course?.price || 0
          })
        });

        if (!paymentResponse.ok) {
          const errorData = await paymentResponse.json();
          throw new Error(errorData.message || 'Payment failed');
        }

        const paymentResult = await paymentResponse.json();
        console.log('Payment processed:', paymentResult);
      }

      setShowEnrollmentFlow(false);
      setIsEnrolled(true);
      
      // Show success message
      alert('Enrollment successful! You can now access the course content.');
      
      // Switch to content tab to show the course materials
      setActiveTab('content');
      
    } catch (error) {
      console.error('Enrollment error:', error);
      alert(`Enrollment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

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
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Overview', icon: BookOpen },
                    { id: 'content', label: 'Content', icon: Target },
                    { id: 'progress', label: 'Progress', icon: Star }
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
            </div>
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

            {/* Course Content - Simplified */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Course Topics</h2>
              
              {topics.length > 0 ? (
                <div className="space-y-4">
                  {topics.map((topic, index) => (
                    <div key={topic.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{topic.title}</h3>
                          {topic.description && (
                            <p className="text-sm text-gray-600">{topic.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No topics available yet</h3>
                  <p className="text-gray-600">Course content is being prepared. Check back soon!</p>
                </div>
              )}
            </div>
                </>
              )}

              {activeTab === 'content' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <CourseContentViewer 
                    courseId={courseId}
                    onContentComplete={(contentId) => {
                      console.log('Content completed:', contentId);
                    }}
                    onQuizSubmit={(contentId, answers) => {
                      console.log('Quiz submitted:', contentId, answers);
                    }}
                  />
                </div>
              )}

              {activeTab === 'progress' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <ProgressTracker 
                    courseId={courseId}
                    onProgressUpdate={(progress) => {
                      console.log('Progress updated:', progress);
                    }}
                  />
                </div>
              )}
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
                    {course.price === 0 ? 'Enroll Free' : `Enroll for ${course.price} ₸`}
                  </button>
                  <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
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
      
      {/* Enhanced Enrollment Flow Modal */}
      {course && showEnrollmentFlow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <EnhancedEnrollmentFlow
              course={course}
              onEnroll={handleEnrollmentComplete}
              onCancel={() => setShowEnrollmentFlow(false)}
              loading={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
