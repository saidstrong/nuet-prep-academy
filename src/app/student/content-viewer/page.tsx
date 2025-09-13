"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  FileText,
  Video,
  Link,
  File,
  Headphones,
  PlayCircle,
  ExternalLink,
  CheckCircle,
  Clock,
  Eye,
  Download,
  ChevronDown,
  ChevronRight,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Material {
  id: string;
  title: string;
  description: string;
  type: 'PDF' | 'VIDEO' | 'AUDIO' | 'LINK' | 'TEXT';
  url: string;
  content: string;
  order: number;
  isPublished: boolean;
  fileSize: number;
  fileName: string;
  mimeType: string;
  createdAt: string;
  progress?: {
    id: string;
    status: string;
    timeSpent: number;
    lastAccessed: string;
    completedAt: string | null;
  } | null;
  topic: {
    id: string;
    title: string;
    order: number;
    course: {
      id: string;
      title: string;
    };
  };
}

interface Topic {
  id: string;
  title: string;
  description: string;
  order: number;
  materials: Material[];
  course: {
    id: string;
    title: string;
  };
}

interface Course {
  id: string;
  title: string;
  description: string;
  topics: Topic[];
}

export default function ContentViewerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'STUDENT') {
      router.push('/auth/signin');
      return;
    }

    fetchEnrolledCourses();
  }, [session, status, router]);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/student/enrolled-courses');
      
      if (!response.ok) {
        throw new Error('Failed to fetch enrolled courses');
      }

      const enrolledCourses = await response.json();
      
      // Fetch topics and materials for each course
      const coursesWithContent: Course[] = [];
      for (const enrollment of enrolledCourses) {
        const course = enrollment.course;
        const topicsResponse = await fetch(`/api/admin/courses/${course.id}/topics`);
        
        if (topicsResponse.ok) {
          const topics = await topicsResponse.json();
          
          // Fetch materials for each topic
          for (const topic of topics) {
            const materialsResponse = await fetch(`/api/materials?topicId=${topic.id}&includeProgress=true`);
            if (materialsResponse.ok) {
              const materials = await materialsResponse.json();
              // Filter only published materials
              topic.materials = materials.filter((m: Material) => m.isPublished);
            }
          }
          
          course.topics = topics;
          coursesWithContent.push(course);
        }
      }

      setCourses(coursesWithContent);
      
      // Auto-select first course if available
      if (coursesWithContent.length > 0) {
        setSelectedCourse(coursesWithContent[0]);
        // Auto-expand first topic
        if (coursesWithContent[0].topics.length > 0) {
          setExpandedTopics(new Set([coursesWithContent[0].topics[0].id]));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch courses');
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

  const handleMaterialClick = (material: Material) => {
    setSelectedMaterial(material);
    setIsMaterialModalOpen(true);
    
    // Update progress to "IN_PROGRESS"
    updateMaterialProgress(material.id, 'IN_PROGRESS');
  };

  const updateMaterialProgress = async (materialId: string, status: string) => {
    try {
      await fetch('/api/materials/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          materialId,
          status
        }),
      });
      
      // Refresh courses to show updated progress
      fetchEnrolledCourses();
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const markMaterialComplete = async (materialId: string) => {
    try {
      await fetch('/api/materials/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          materialId,
          status: 'COMPLETED'
        }),
      });
      
      // Refresh courses to show updated progress
      fetchEnrolledCourses();
    } catch (error) {
      console.error('Failed to mark complete:', error);
    }
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FileText className="w-5 h-5" />;
      case 'VIDEO': return <Video className="w-5 h-5" />;
      case 'AUDIO': return <Headphones className="w-5 h-5" />;
      case 'LINK': return <ExternalLink className="w-5 h-5" />;
      case 'TEXT': return <FileText className="w-5 h-5" />;
      default: return <File className="w-5 h-5" />;
    }
  };

  const getProgressIcon = (progress: any) => {
    if (!progress) return <Clock className="w-4 h-4 text-gray-400" />;
    
    switch (progress.status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'IN_PROGRESS':
        return <PlayCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getProgressText = (progress: any) => {
    if (!progress) return 'Not started';
    
    switch (progress.status) {
      case 'COMPLETED':
        return 'Completed';
      case 'IN_PROGRESS':
        return 'In progress';
      default:
        return 'Not started';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimeSpent = (seconds: number) => {
    if (seconds === 0) return '0s';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes === 0) return `${remainingSeconds}s`;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'STUDENT') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Content</h1>
          <p className="text-gray-600">Access your course materials, track your progress, and continue learning.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Course Navigation Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">My Courses</h2>
                <div className="space-y-2">
                  {courses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => setSelectedCourse(course)}
                      className={`w-full text-left p-3 rounded-md transition-colors ${
                        selectedCourse?.id === course.id
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="font-medium">{course.title}</div>
                      <div className="text-sm text-gray-500">
                        {course.topics.length} topics, {course.topics.reduce((acc, topic) => acc + topic.materials.length, 0)} materials
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
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedCourse.title}</h2>
                    {selectedCourse.description && (
                      <p className="text-gray-600 mb-4">{selectedCourse.description}</p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{selectedCourse.topics.length}</div>
                        <div className="text-blue-700">Topics</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedCourse.topics.reduce((acc, topic) => acc + topic.materials.length, 0)}
                        </div>
                        <div className="text-green-700">Materials</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {selectedCourse.topics.reduce((acc, topic) => 
                            acc + topic.materials.filter(m => m.progress?.status === 'COMPLETED').length, 0
                          )}
                        </div>
                        <div className="text-purple-700">Completed</div>
                      </div>
                    </div>
                  </div>

                  {/* Topics and Materials */}
                  <div className="space-y-4">
                    {selectedCourse.topics.map((topic) => (
                      <div key={topic.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <button
                          onClick={() => toggleTopicExpansion(topic.id)}
                          className="w-full px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <BookOpen className="w-5 h-5 text-gray-600" />
                            <div className="text-left">
                              <h3 className="font-semibold text-gray-900">
                                Topic {topic.order}: {topic.title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {topic.materials.length} materials
                              </p>
                            </div>
                          </div>
                          {expandedTopics.has(topic.id) ? (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          )}
                        </button>

                        {expandedTopics.has(topic.id) && (
                          <div className="p-6 border-t border-gray-200">
                            {topic.materials.length > 0 ? (
                              <div className="space-y-3">
                                {topic.materials.map((material) => (
                                  <div
                                    key={material.id}
                                    className="border rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                                    onClick={() => handleMaterialClick(material)}
                                  >
                                    <div className="flex items-start space-x-3">
                                      <div className="flex-shrink-0 mt-1">
                                        {getMaterialIcon(material.type)}
                                      </div>
                                      
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-2">
                                          <h4 className="font-medium text-gray-900">
                                            {material.title}
                                          </h4>
                                          {getProgressIcon(material.progress)}
                                          <span className="text-sm text-gray-500">
                                            {getProgressText(material.progress)}
                                          </span>
                                        </div>
                                        
                                        {material.description && (
                                          <p className="text-sm text-gray-600 mb-2">{material.description}</p>
                                        )}
                                        
                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                          {material.fileSize && (
                                            <span>Size: {formatFileSize(material.fileSize)}</span>
                                          )}
                                          {material.progress?.timeSpent && material.progress.timeSpent > 0 && (
                                            <span>Time: {formatTimeSpent(material.progress.timeSpent)}</span>
                                          )}
                                          <span>Type: {material.type}</span>
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center space-x-2">
                                        {material.progress?.status === 'IN_PROGRESS' && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              markMaterialComplete(material.id);
                                            }}
                                            className="p-2 text-green-600 hover:bg-green-100 rounded-md transition-colors"
                                            title="Mark as complete"
                                          >
                                            <CheckCircle className="w-4 h-4" />
                                          </button>
                                        )}
                                        
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleMaterialClick(material);
                                          }}
                                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                                          title="View material"
                                        >
                                          <Eye className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p>No materials available yet.</p>
                                <p className="text-sm">Check back later for content.</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p>Select a course to view content.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Material Viewer Modal */}
      {isMaterialModalOpen && selectedMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedMaterial.title}</h2>
                <p className="text-gray-600">
                  Topic: {selectedMaterial.topic.title} • Course: {selectedMaterial.topic.course.title}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsMaterialModalOpen(false);
                  setSelectedMaterial(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {selectedMaterial.description && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedMaterial.description}</p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Content</h3>
                
                {selectedMaterial.type === 'PDF' && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center space-x-3 mb-4">
                      <FileText className="w-6 h-6 text-red-600" />
                      <div>
                        <p className="font-medium">{selectedMaterial.fileName || 'Document'}</p>
                        <p className="text-sm text-gray-500">
                          {selectedMaterial.fileSize ? formatFileSize(selectedMaterial.fileSize) : 'Unknown size'}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <a
                        href={selectedMaterial.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View PDF</span>
                      </a>
                      <a
                        href={selectedMaterial.url}
                        download
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                )}

                {selectedMaterial.type === 'VIDEO' && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center space-x-3 mb-4">
                      <Video className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="font-medium">{selectedMaterial.fileName || 'Video'}</p>
                        <p className="text-sm text-gray-500">
                          {selectedMaterial.fileSize ? formatFileSize(selectedMaterial.fileSize) : 'Unknown size'}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <a
                        href={selectedMaterial.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>Play Video</span>
                      </a>
                      <a
                        href={selectedMaterial.url}
                        download
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                )}

                {selectedMaterial.type === 'AUDIO' && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center space-x-3 mb-4">
                      <Headphones className="w-6 h-6 text-purple-600" />
                      <div>
                        <p className="font-medium">{selectedMaterial.fileName || 'Audio'}</p>
                        <p className="text-sm text-gray-500">
                          {selectedMaterial.fileSize ? formatFileSize(selectedMaterial.fileSize) : 'Unknown size'}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <a
                        href={selectedMaterial.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center space-x-2"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>Play Audio</span>
                      </a>
                      <a
                        href={selectedMaterial.url}
                        download
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                )}

                {selectedMaterial.type === 'LINK' && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center space-x-3 mb-4">
                      <ExternalLink className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-medium">External Link</p>
                        <p className="text-sm text-gray-500 break-all">{selectedMaterial.url}</p>
                      </div>
                    </div>
                    <a
                      href={selectedMaterial.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Visit Link</span>
                    </a>
                  </div>
                )}

                {selectedMaterial.type === 'TEXT' && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: selectedMaterial.content }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsMaterialModalOpen(false);
                    setSelectedMaterial(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {selectedMaterial.progress?.status !== 'COMPLETED' && (
                  <button
                    onClick={() => {
                      markMaterialComplete(selectedMaterial.id);
                      setIsMaterialModalOpen(false);
                      setSelectedMaterial(null);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark as Complete</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
