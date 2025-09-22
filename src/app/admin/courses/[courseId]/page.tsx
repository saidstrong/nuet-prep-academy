"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { isAdminOrManager } from '@/lib/auth';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  Video, 
  Headphones, 
  Link, 
  Clock, 
  Target,
  ChevronDown,
  ChevronRight,
  Users,
  DollarSign,
  Calendar
} from 'lucide-react';
import TopicCreationModal from '@/components/TopicCreationModal';
import MaterialCreationModal from '@/components/MaterialCreationModal';
import TestCreationModal from '@/components/TestCreationModal';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  status: string;
  maxStudents: number;
  enrolledStudents: number;
  topics: Topic[];
  createdAt: string;
  updatedAt: string;
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
  type: 'PDF' | 'VIDEO' | 'AUDIO' | 'LINK' | 'TEXT';
  url?: string;
  content?: string;
  order: number;
}

interface Test {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalPoints: number;
  isActive: boolean;
}

export default function CourseManagementPage({ params }: { params: { courseId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  
  // UI states
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || !isAdminOrManager(session.user.role)) {
      router.push('/auth/signin');
      return;
    }

    fetchCourseData();
  }, [session, status, router]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/courses/${params.courseId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch course data');
      }

      const data = await response.json();
      setCourse(data.course);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const toggleTopicExpansion = (topicId: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

  const handleTopicCreated = () => {
    fetchCourseData();
  };

  const handleMaterialCreated = () => {
    fetchCourseData();
  };

  const handleTestCreated = () => {
    fetchCourseData();
  };

  const openMaterialModal = (topicId: string) => {
    setSelectedTopicId(topicId);
    setIsMaterialModalOpen(true);
  };

  const openTestModal = (topicId: string) => {
    setSelectedTopicId(topicId);
    setIsTestModalOpen(true);
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'VIDEO':
        return <Video className="w-4 h-4 text-blue-500" />;
      case 'AUDIO':
        return <Headphones className="w-4 h-4 text-green-500" />;
      case 'LINK':
        return <Link className="w-4 h-4 text-purple-500" />;
      case 'TEXT':
        return <FileText className="w-4 h-4 text-gray-500" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button
            onClick={fetchCourseData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-xl">Course not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course?.title || 'Loading...'}</h1>
              <p className="text-gray-600 mt-2">{course?.description || ''}</p>
            </div>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Course Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Enrolled Students</p>
                <p className="text-2xl font-bold text-gray-900">{course?.enrolledStudents || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Topics</p>
                <p className="text-2xl font-bold text-gray-900">{course?.topics?.length || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Price</p>
                <p className="text-2xl font-bold text-gray-900">${course?.price || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Duration</p>
                <p className="text-2xl font-bold text-gray-900">{course?.duration || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content Management */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Course Content</h2>
              <button
                onClick={() => setIsTopicModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Topic</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {!course?.topics || course.topics.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No topics yet</h3>
                <p className="text-gray-600 mb-4">Start building your course by adding the first topic.</p>
                <button
                  onClick={() => setIsTopicModalOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add First Topic
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {course?.topics && course.topics
                  .sort((a, b) => a.order - b.order)
                  .map((topic) => (
                    <div key={topic.id} className="border border-gray-200 rounded-lg">
                      {/* Topic Header */}
                      <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => toggleTopicExpansion(topic.id)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              {expandedTopics.has(topic.id) ? (
                                <ChevronDown className="w-5 h-5" />
                              ) : (
                                <ChevronRight className="w-5 h-5" />
                              )}
                            </button>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {topic.order}. {topic.title}
                              </h3>
                              {topic.description && (
                                <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                              {topic.materials.length} materials, {topic.tests.length} tests
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Topic Content (when expanded) */}
                      {expandedTopics.has(topic.id) && (
                        <div className="p-4 space-y-4">
                          {/* Materials Section */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-md font-medium text-gray-900">Materials</h4>
                              <button
                                onClick={() => openMaterialModal(topic.id)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                              >
                                <Plus className="w-4 h-4" />
                                <span>Add Material</span>
                              </button>
                            </div>
                            
                            {topic.materials.length === 0 ? (
                              <p className="text-gray-500 text-sm italic">No materials yet</p>
                            ) : (
                              <div className="space-y-2">
                                {topic.materials
                                  .sort((a, b) => a.order - b.order)
                                  .map((material) => (
                                    <div key={material.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                                      {getMaterialIcon(material.type)}
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{material.title}</p>
                                        {material.description && (
                                          <p className="text-xs text-gray-600">{material.description}</p>
                                        )}
                                      </div>
                                      <span className="text-xs text-gray-500">#{material.order}</span>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>

                          {/* Tests Section */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-md font-medium text-gray-900">Tests</h4>
                              <button
                                onClick={() => openTestModal(topic.id)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                              >
                                <Plus className="w-4 h-4" />
                                <span>Add Test</span>
                              </button>
                            </div>
                            
                            {topic.tests.length === 0 ? (
                              <p className="text-gray-500 text-sm italic">No tests yet</p>
                            ) : (
                              <div className="space-y-2">
                                {topic.tests.map((test) => (
                                  <div key={test.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                                    <Target className="w-4 h-4 text-blue-500" />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-900">{test.title}</p>
                                      {test.description && (
                                        <p className="text-xs text-gray-600">{test.description}</p>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                      <span className="flex items-center space-x-1">
                                        <Clock className="w-3 h-3" />
                                        <span>{test.duration}m</span>
                                      </span>
                                      <span className="flex items-center space-x-1">
                                        <Target className="w-3 h-3" />
                                        <span>{test.totalPoints}pts</span>
                                      </span>
                                      <span className={`px-2 py-1 rounded-full text-xs ${
                                        test.isActive 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        {test.isActive ? 'Active' : 'Inactive'}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <TopicCreationModal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        courseId={course?.id || ''}
        onTopicCreated={handleTopicCreated}
      />

      <MaterialCreationModal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        topicId={selectedTopicId}
        onMaterialCreated={handleMaterialCreated}
      />

      <TestCreationModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        topicId={selectedTopicId}
        onTestCreated={handleTestCreated}
      />
    </div>
  );
}
