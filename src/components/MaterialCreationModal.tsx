"use client";
import { useState } from 'react';
import { X, Plus, FileText, Link, Video, Headphones, File, List } from 'lucide-react';

interface MaterialCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: string;
  onMaterialCreated: () => void;
}

interface MaterialFormData {
  title: string;
  description: string;
  type: 'PDF' | 'VIDEO' | 'AUDIO' | 'LINK' | 'TEXT';
  url: string;
  content: string;
  order: number;
}

export default function MaterialCreationModal({ isOpen, onClose, topicId, onMaterialCreated }: MaterialCreationModalProps) {
  const [formData, setFormData] = useState<MaterialFormData>({
    title: '',
    description: '',
    type: 'PDF',
    url: '',
    content: '',
    order: 1
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/courses/materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          topicId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create material');
      }

      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        type: 'PDF',
        url: '',
        content: '',
        order: 1
      });
      
      onMaterialCreated();
      onClose();
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <File className="w-5 h-5" />;
      case 'VIDEO':
        return <Video className="w-5 h-5" />;
      case 'AUDIO':
        return <Headphones className="w-5 h-5" />;
      case 'LINK':
        return <Link className="w-5 h-5" />;
      case 'TEXT':
        return <FileText className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Material</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Material Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Material Title *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter material title"
              />
            </div>
          </div>

          {/* Material Type and Order Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Material Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Material Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="PDF">PDF Document</option>
                <option value="VIDEO">Video</option>
                <option value="AUDIO">Audio</option>
                <option value="LINK">External Link</option>
                <option value="TEXT">Text Content</option>
              </select>
            </div>

            {/* Material Order */}
            <div>
              <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
                Material Order *
              </label>
              <div className="relative">
                <List className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  id="order"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1"
                />
              </div>
            </div>
          </div>

          {/* Material Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Material Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe this material"
            />
          </div>

          {/* URL Field (for PDF, Video, Audio, Link) */}
          {formData.type !== 'TEXT' && (
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                {formData.type === 'PDF' && 'PDF File URL'}
                {formData.type === 'VIDEO' && 'Video URL'}
                {formData.type === 'AUDIO' && 'Audio URL'}
                {formData.type === 'LINK' && 'External Link URL'}
              </label>
              <div className="relative">
                {getMaterialIcon(formData.type)}
                <input
                  type="url"
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={
                    formData.type === 'PDF' ? 'https://example.com/document.pdf' :
                    formData.type === 'VIDEO' ? 'https://youtube.com/watch?v=...' :
                    formData.type === 'AUDIO' ? 'https://example.com/audio.mp3' :
                    'https://example.com'
                  }
                />
              </div>
            </div>
          )}

          {/* Content Field (for TEXT type) */}
          {formData.type === 'TEXT' && (
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Text Content *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter the text content for this material..."
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Material</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
