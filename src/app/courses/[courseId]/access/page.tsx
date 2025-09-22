"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  BookOpen, Users, Clock, Star, Target, Calendar, DollarSign, 
  PlayCircle, FileText, TestTube, User, MessageCircle, Phone,
  CheckCircle, Lock, Unlock, ArrowLeft, Eye, Download
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
  googleMeetLink?: string;
  enrollmentDeadline?: string;
  accessStartDate?: string;
  accessEndDate?: string;
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
  type: 'PDF' | 'VIDEO' | 'AUDIO' | 'LINK' | 'PRESENTATION' | 'DOCUMENT';
  url?: string;
  order: number;
  isUnlocked: boolean;
  unlockDate?: string;
}

interface Test {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalPoints: number;
  isActive: boolean;
  isUnlocked: boolean;
  unlockDate?: string;
}

interface Tutor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  specialization?: string;
}

export default function CourseAccessPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [course, setCourse] = useState<Course | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'members'>('overview');
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  const courseId = params.courseId as string;

  useEffect(() => {
    if (courseId && session) {
      fetchCourseData();
    }
  }, [courseId, session]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      // Check enrollment status
      const enrollmentResponse = await fetch(`/api/enrollments/check/${courseId}`, {
        credentials: 'include'
      });
      
      if (enrollmentResponse.ok) {
        const enrollmentData = await enrollmentResponse.json();
        setIsEnrolled(enrollmentData.isEnrolled);
        
        if (!enrollmentData.isEnrolled) {
          setError('You are not enrolled in this course. Please request enrollment first.');
          return;
        }
      } else {
        setError('Unable to verify enrollment status.');
        return;
      }

      // Fetch course details
      const courseResponse = await fetch(`/api/courses/${courseId}`, { 
        credentials: 'include' 
      });
      
      if (courseResponse.ok) {
        const courseData = await courseResponse.json();
        setCourse(courseData.course);
        setTopics(courseData.topics || []);
      } else {
        setError('Failed to load course details');
        return;
      }

      // Fetch tutors
      const tutorsResponse = await fetch('/api/tutors');
      if (tutorsResponse.ok) {
        const tutorsData = await tutorsResponse.json();
        setTutors(tutorsData.tutors || []);
      }

    } catch (error) {
      console.error('Error fetching course data:', error);
      setError('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = (topicId: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-red-900 mb-2">Access Denied</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => router.push('/student/dashboard')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Course Not Found</h2>
            <p className="text-gray-600">The course you're looking for doesn't exist.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Course Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <button
                  onClick={() => router.push('/student/dashboard')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
              </div>
              <p className="text-gray-600 mb-4">{course.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {course.instructor}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(course.difficulty)}`}>
                  {course.difficulty}
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {course.estimatedHours} hours
                </span>
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {course.enrolledStudents} students
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">${course.price}</div>
              <div className="text-sm text-gray-500">Course Fee</div>
            </div>
          </div>

          {/* Google Meet Link */}
          {course.googleMeetLink && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Live Sessions</span>
                </div>
                <a
                  href={course.googleMeetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Join Meeting
                </a>
              </div>
            </div>
          )}

          {/* Access Period */}
          {(course.accessStartDate || course.accessEndDate) && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">Access Period</span>
              </div>
              <div className="text-sm text-yellow-800">
                {course.accessStartDate && (
                  <p>Start: {formatDate(course.accessStartDate)}</p>
                )}
                {course.accessEndDate && (
                  <p>End: {formatDate(course.accessEndDate)}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BookOpen },
                { id: 'content', label: 'Course Content', icon: Target },
                { id: 'members', label: 'Course Members', icon: Users }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
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
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{course.totalTopics}</div>
                  <div className="text-sm text-gray-600">Topics</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{course.totalMaterials}</div>
                  <div className="text-sm text-gray-600">Materials</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{course.totalTests}</div>
                  <div className="text-sm text-gray-600">Tests</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-4">
              {topics.map((topic) => (
                <div key={topic.id} className="bg-white rounded-lg shadow-sm">
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleTopic(topic.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">{topic.order}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{topic.title}</h4>
                          <p className="text-sm text-gray-600">{topic.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{topic.materials.length} materials</span>
                        <span>{topic.tests.length} tests</span>
                        <span>{topic.subtopics.length} subtopics</span>
                      </div>
                    </div>
                  </div>

                  {expandedTopics.has(topic.id) && (
                    <div className="border-t border-gray-200 p-4">
                      {/* Materials */}
                      {topic.materials.length > 0 && (
                        <div className="mb-4">
                          <h5 className="font-medium text-gray-900 mb-2">Materials</h5>
                          <div className="space-y-2">
                            {topic.materials.map((material) => (
                              <div key={material.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center space-x-2">
                                  <FileText className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm text-gray-900">{material.title}</span>
                                  <span className="text-xs text-gray-500">({material.type})</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {material.isUnlocked ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Lock className="w-4 h-4 text-gray-400" />
                                  )}
                                  <button className="text-blue-600 hover:text-blue-700">
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tests */}
                      {topic.tests.length > 0 && (
                        <div className="mb-4">
                          <h5 className="font-medium text-gray-900 mb-2">Tests</h5>
                          <div className="space-y-2">
                            {topic.tests.map((test) => (
                              <div key={test.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div>
                                  <span className="text-sm font-medium text-gray-900">{test.title}</span>
                                  <div className="text-xs text-gray-500">
                                    {test.duration} min • {test.totalPoints} points
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {test.isUnlocked ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Lock className="w-4 h-4 text-gray-400" />
                                  )}
                                  <button className="text-blue-600 hover:text-blue-700">
                                    <TestTube className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Subtopics */}
                      {topic.subtopics.map((subtopic) => (
                        <div key={subtopic.id} className="ml-4 border-l-2 border-gray-200 pl-4">
                          <h6 className="font-medium text-gray-700 mb-2">{subtopic.title}</h6>
                          <div className="space-y-2">
                            {subtopic.materials.map((material) => (
                              <div key={material.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center space-x-2">
                                  <FileText className="w-3 h-3 text-gray-500" />
                                  <span className="text-xs text-gray-900">{material.title}</span>
                                  <span className="text-xs text-gray-500">({material.type})</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {material.isUnlocked ? (
                                    <CheckCircle className="w-3 h-3 text-green-500" />
                                  ) : (
                                    <Lock className="w-3 h-3 text-gray-400" />
                                  )}
                                  <button className="text-blue-600 hover:text-blue-700">
                                    <Eye className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Members</h3>
              
              {/* Tutors */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Tutors</h4>
                <div className="space-y-3">
                  {tutors.map((tutor) => (
                    <div key={tutor.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {tutor.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{tutor.name}</div>
                          <div className="text-sm text-gray-600">{tutor.email}</div>
                          {tutor.specialization && (
                            <div className="text-xs text-blue-600">{tutor.specialization}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {tutor.phone && (
                          <a
                            href={`tel:${tutor.phone}`}
                            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        )}
                        {tutor.whatsapp && (
                          <a
                            href={`https://wa.me/${tutor.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Students */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Students ({course.enrolledStudents})</h4>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Student list will be available here</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
