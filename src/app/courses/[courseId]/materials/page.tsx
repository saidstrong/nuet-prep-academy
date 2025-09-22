"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BookOpen, Download, Play, FileText, Image, Video, File } from 'lucide-react';

interface CourseMaterial {
  id: string;
  title: string;
  type: 'VIDEO' | 'DOCUMENT' | 'PRESENTATION' | 'IMAGE' | 'AUDIO';
  url: string;
  description?: string;
  duration?: number;
  size?: number;
  uploadedAt: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  materials: CourseMaterial[];
}

export default function CourseMaterialsPage({ params }: { params: { courseId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchCourseMaterials();
  }, [session, status, router, params.courseId]);

  const fetchCourseMaterials = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${params.courseId}/materials`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch course materials');
      }

      const data = await response.json();
      setCourse(data.course);
    } catch (err) {
      console.error('Error fetching course materials:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="w-5 h-5 text-red-500" />;
      case 'DOCUMENT':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'PRESENTATION':
        return <FileText className="w-5 h-5 text-purple-500" />;
      case 'IMAGE':
        return <Image className="w-5 h-5 text-green-500" />;
      case 'AUDIO':
        return <Play className="w-5 h-5 text-orange-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course materials...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Materials</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 text-blue-600 hover:text-blue-700 flex items-center"
          >
            ← Back to Course
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <BookOpen className="w-8 h-8 mr-3 text-blue-600" />
            Course Materials
          </h1>
          {course && (
            <p className="text-gray-600">{course.title}</p>
          )}
        </div>

        {/* Materials List */}
        {course && course.materials.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {course.materials.length} Material{course.materials.length !== 1 ? 's' : ''}
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {course.materials.map((material) => (
                <div key={material.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getMaterialIcon(material.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {material.title}
                      </h3>
                      
                      {material.description && (
                        <p className="text-gray-600 mb-3">{material.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="capitalize">{material.type.toLowerCase()}</span>
                        {material.duration && (
                          <span>{formatDuration(material.duration)}</span>
                        )}
                        {material.size && (
                          <span>{formatFileSize(material.size)}</span>
                        )}
                        <span>
                          Uploaded {new Date(material.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <div className="flex space-x-2">
                        <a
                          href={material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                          {material.type === 'VIDEO' ? (
                            <Play className="w-4 h-4" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          <span>
                            {material.type === 'VIDEO' ? 'Watch' : 'Download'}
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Materials Available</h3>
            <p className="text-gray-600 mb-6">
              This course doesn't have any materials uploaded yet.
            </p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back to Course
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
