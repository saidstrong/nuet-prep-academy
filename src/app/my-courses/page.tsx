"use client";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BookOpen, Users, FileText, Clock, Eye, MessageCircle, Play, CheckCircle } from 'lucide-react';

interface EnrolledCourse {
  id: string;
  course: {
    id: string;
    title: string;
    description: string;
    duration: string;
    topics: Topic[];
  };
  tutor: {
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

interface Topic {
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
  type: string;
  content: string;
  fileUrl?: string;
  order: number;
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

interface TestSubmission {
  id: string;
  submittedAt: string;
  score?: number;
  maxScore: number;
  status: string;
}

export default function MyCoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<EnrolledCourse | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchEnrolledCourses();
  }, [session, status, router]);

  const fetchEnrolledCourses = async () => {
    try {
      const response = await fetch('/api/student/enrolled-courses');
      const data = await response.json();
      
      if (data.success) {
        setEnrolledCourses(data.courses);
        if (data.courses.length > 0) {
          setSelectedCourse(data.courses[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGroupMembers = (course: EnrolledCourse) => {
    // This would be populated from the API with actual group members
    return [
      { id: '1', name: course.tutor.name, role: 'Tutor', email: course.tutor.email },
      // Other students would be added here
    ];
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

  if (!session) {
    return null;
  }

  return (
    <main>
      <Header />
      <div className="container-section py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">My Courses</h1>
            <p className="text-slate-600">Access your enrolled courses, materials, and tests</p>
          </div>

          {enrolledCourses.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Courses Yet</h3>
              <p className="text-slate-500 mb-6">You haven't enrolled in any courses yet.</p>
              <button
                onClick={() => router.push('/courses')}
                className="btn-primary"
              >
                Browse Available Courses
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Course Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-medium text-slate-900 mb-4">Your Courses</h3>
                  <div className="space-y-2">
                    {enrolledCourses.map((enrollment) => (
                      <button
                        key={enrollment.id}
                        onClick={() => setSelectedCourse(enrollment)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedCourse?.id === enrollment.id
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-medium text-sm">{enrollment.course.title}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          Tutor: {enrollment.tutor.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {enrollment.course.topics.length} topics
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
                          <h2 className="text-2xl font-bold text-slate-900">{selectedCourse.course.title}</h2>
                          <p className="text-slate-600 mt-1">{selectedCourse.course.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-500">Duration</div>
                          <div className="font-medium">{selectedCourse.course.duration}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-slate-600">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>Tutor: {selectedCourse.tutor.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4" />
                          <span>{selectedCourse.course.topics.length} topics</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>Enrolled: {new Date(selectedCourse.enrolledAt).toLocaleDateString()}</span>
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
                          {selectedCourse.course.topics.map((topic) => (
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
                                    <h5 className="font-medium text-slate-900 mb-2">Learning Materials</h5>
                                    <div className="space-y-2">
                                      {topic.materials.map((material) => (
                                        <div key={material.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                                          <FileText className="w-4 h-4 text-slate-400" />
                                          <div className="flex-1">
                                            <div className="font-medium text-sm">{material.title}</div>
                                            <div className="text-xs text-slate-500">{material.type}</div>
                                          </div>
                                          <button className="text-primary hover:text-primary-dark text-sm">
                                            <Play className="w-4 h-4" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Tests */}
                                  <div>
                                    <h5 className="font-medium text-slate-900 mb-2">Tests & Exams</h5>
                                    <div className="space-y-2">
                                      {topic.tests.map((test) => {
                                        const submission = test.submissions.find(s => s.id); // This would be the student's submission
                                        return (
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
                                              {submission ? (
                                                <span className="text-xs text-green-600 flex items-center">
                                                  <CheckCircle className="w-3 h-3 mr-1" />
                                                  Completed
                                                </span>
                                              ) : (
                                                <button className="text-primary hover:text-primary-dark text-sm">
                                                  <Play className="w-4 h-4" />
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Group Members */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                      <div className="border-b border-slate-200 p-6">
                        <h3 className="text-lg font-medium text-slate-900">Your Learning Group</h3>
                      </div>
                      <div className="p-6">
                        <div className="space-y-3">
                          {getGroupMembers(selectedCourse).map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                  <Users className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <div className="font-medium text-sm">{member.name}</div>
                                  <div className="text-xs text-slate-500">{member.role}</div>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button className="text-primary hover:text-primary-dark text-sm">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="text-blue-600 hover:text-blue-800 text-sm">
                                  <MessageCircle className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
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
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
