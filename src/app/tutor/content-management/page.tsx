"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  FileText,
  Video,
  Link,
  File,
  Headphones,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  BookOpen,
  Clock,
  CheckCircle,
  PlayCircle,
  ExternalLink,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MaterialCreationModal from '@/components/MaterialCreationModal';

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

export default function ContentManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'TUTOR') {
      router.push('/auth/signin');
      return;
    }

    fetchTopics();
  }, [session, status, router]);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tutor/courses');
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const courses = await response.json();
      
      // Fetch topics for each course
      const topicsData: Topic[] = [];
      for (const course of courses) {
        const topicsResponse = await fetch(`/api/admin/courses/${course.id}/topics`);
        if (topicsResponse.ok) {
          const courseTopics = await topicsResponse.json();
          for (const topic of courseTopics) {
            const materialsResponse = await fetch(`/api/materials?topicId=${topic.id}`);
            if (materialsResponse.ok) {
              const materials = await materialsResponse.json();
              topic.materials = materials;
            }
          }
          topicsData.push(...courseTopics);
        }
      }

      setTopics(topicsData.sort((a, b) => a.order - b.order));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch topics');
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialCreated = () => {
    fetchTopics();
  };

  const handleMaterialEdit = (material: Material) => {
    setEditingMaterial(material);
    setIsMaterialModalOpen(true);
  };

  const handleMaterialDelete = async (materialId: string) => {
    if (!confirm('Are you sure you want to delete this material? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/materials/${materialId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete material');
      }

      fetchTopics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete material');
    }
  };

  const toggleMaterialPublish = async (material: Material) => {
    try {
      const response = await fetch(`/api/materials/${material.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPublished: !material.isPublished
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update material');
      }

      fetchTopics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update material');
    }
  };

  const reorderMaterial = async (material: Material, direction: 'up' | 'down') => {
    try {
      const newOrder = direction === 'up' ? material.order - 1 : material.order + 1;
      
      const response = await fetch(`/api/materials/${material.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order: newOrder
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder material');
      }

      fetchTopics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder material');
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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

  if (!session || session.user.role !== 'TUTOR') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Management</h1>
          <p className="text-gray-600">Manage your course materials, upload files, and organize content for your students.</p>
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
          <div className="space-y-8">
            {topics.map((topic) => (
              <div key={topic.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        Topic {topic.order}: {topic.title}
                      </h2>
                      <p className="text-blue-100 text-sm mt-1">
                        Course: {topic.course.title}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTopic(topic);
                        setIsMaterialModalOpen(true);
                      }}
                      className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Material</span>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {topic.materials && topic.materials.length > 0 ? (
                    <div className="space-y-4">
                      {topic.materials
                        .sort((a, b) => a.order - b.order)
                        .map((material, index) => (
                          <div
                            key={material.id}
                            className={`border rounded-lg p-4 ${
                              material.isPublished ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                <div className="flex-shrink-0 mt-1">
                                  {getMaterialIcon(material.type)}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h3 className="text-lg font-medium text-gray-900">
                                      {material.title}
                                    </h3>
                                    {material.isPublished ? (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Published
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        <Clock className="w-3 h-3 mr-1" />
                                        Draft
                                      </span>
                                    )}
                                  </div>
                                  
                                  {material.description && (
                                    <p className="text-gray-600 text-sm mb-2">{material.description}</p>
                                  )}
                                  
                                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span>Order: {material.order}</span>
                                    {material.fileSize && (
                                      <span>Size: {formatFileSize(material.fileSize)}</span>
                                    )}
                                    <span>Created: {formatDate(material.createdAt)}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2 ml-4">
                                {/* Reorder buttons */}
                                <button
                                  onClick={() => reorderMaterial(material, 'up')}
                                  disabled={index === 0}
                                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Move up"
                                >
                                  <ArrowUp className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => reorderMaterial(material, 'down')}
                                  disabled={index === topic.materials.length - 1}
                                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Move down"
                                >
                                  <ArrowDown className="w-4 h-4" />
                                </button>
                                
                                {/* Publish/Unpublish button */}
                                <button
                                  onClick={() => toggleMaterialPublish(material)}
                                  className={`p-2 rounded-md transition-colors ${
                                    material.isPublished
                                      ? 'text-yellow-600 hover:bg-yellow-100'
                                      : 'text-green-600 hover:bg-green-100'
                                  }`}
                                  title={material.isPublished ? 'Unpublish' : 'Publish'}
                                >
                                  {material.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                                
                                {/* Edit button */}
                                <button
                                  onClick={() => handleMaterialEdit(material)}
                                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                                  title="Edit material"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                
                                {/* Delete button */}
                                <button
                                  onClick={() => handleMaterialDelete(material.id)}
                                  className="p-2 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                                  title="Delete material"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p>No materials added yet.</p>
                      <p className="text-sm">Click "Add Material" to get started.</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Material Creation/Edit Modal */}
      {isMaterialModalOpen && selectedTopic && (
        <MaterialCreationModal
          isOpen={isMaterialModalOpen}
          onClose={() => {
            setIsMaterialModalOpen(false);
            setSelectedTopic(null);
            setEditingMaterial(null);
          }}
          topicId={selectedTopic.id}
          onMaterialCreated={handleMaterialCreated}
        />
      )}

      <Footer />
    </div>
  );
}
