"use client";
import { useState, useRef } from 'react';
import { X, Upload, FileText, Video, Link, File, CheckCircle, AlertCircle } from 'lucide-react';

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
  content: string;
  order: number;
  isPublished: boolean;
}

export default function MaterialCreationModal({
  isOpen,
  onClose,
  topicId,
  onMaterialCreated
}: MaterialCreationModalProps) {
  const [formData, setFormData] = useState<MaterialFormData>({
    title: '',
    description: '',
    type: 'PDF',
    content: '',
    order: 1,
    isPublished: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        return;
      }
      
      // Validate file type based on selected material type
      const validTypes: Record<string, string[]> = {
        PDF: ['application/pdf'],
        VIDEO: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
        AUDIO: ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac'],
        LINK: [],
        TEXT: []
      };

      if (validTypes[formData.type].length > 0 && !validTypes[formData.type].includes(file.type)) {
        setError(`Invalid file type for ${formData.type}. Please select a valid file.`);
        return;
      }

      setUploadedFile(file);
      setFormData(prev => ({
        ...prev,
        title: file.name.replace(/\.[^/.]+$/, '') || prev.title,
        fileName: file.name
      }));
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // First, upload file if present
      let fileUrl = '';
      if (uploadedFile && formData.type !== 'LINK' && formData.type !== 'TEXT') {
        const formDataFile = new FormData();
        formDataFile.append('file', uploadedFile);
        formDataFile.append('type', formData.type);
        
        const uploadResponse = await fetch('/api/materials/upload', {
          method: 'POST',
          body: formDataFile
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file');
        }

        const uploadResult = await uploadResponse.json();
        fileUrl = uploadResult.url;
      }

      // Create material record
      const materialData = {
        ...formData,
        topicId,
        url: fileUrl || formData.content,
        fileSize: uploadedFile?.size || null,
        fileName: uploadedFile?.name || null,
        mimeType: uploadedFile?.type || null
      };

      const response = await fetch('/api/materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(materialData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create material');
      }

      setSuccess('Material created successfully!');
      setFormData({
        title: '',
        description: '',
        type: 'PDF',
        content: '',
        order: 1,
        isPublished: false
      });
      setUploadedFile(null);
      setUploadProgress(0);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setTimeout(() => {
        onMaterialCreated();
        onClose();
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getMaterialTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FileText className="w-5 h-5" />;
      case 'VIDEO': return <Video className="w-5 h-5" />;
      case 'AUDIO': return <File className="w-5 h-5" />;
      case 'LINK': return <Link className="w-5 h-5" />;
      case 'TEXT': return <FileText className="w-5 h-5" />;
      default: return <File className="w-5 h-5" />;
    }
  };

  const getMaterialTypeDescription = (type: string) => {
    switch (type) {
      case 'PDF': return 'Upload a PDF document';
      case 'VIDEO': return 'Upload a video file (MP4, AVI, MOV, WMV)';
      case 'AUDIO': return 'Upload an audio file (MP3, WAV, M4A, AAC)';
      case 'LINK': return 'Provide a link to external content';
      case 'TEXT': return 'Write or paste text content';
      default: return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create New Material</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Material Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Material Type
            </label>
            <div className="grid grid-cols-5 gap-3">
              {(['PDF', 'VIDEO', 'AUDIO', 'LINK', 'TEXT'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type }))}
                  className={`p-3 border-2 rounded-lg flex flex-col items-center justify-center transition-colors ${
                    formData.type === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {getMaterialTypeIcon(type)}
                  <span className="text-xs mt-1 font-medium">{type}</span>
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {getMaterialTypeDescription(formData.type)}
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter material title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter material description"
            />
          </div>

          {/* File Upload or Content Input */}
          {(formData.type === 'PDF' || formData.type === 'VIDEO' || formData.type === 'AUDIO') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload File *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept={
                    formData.type === 'PDF' ? '.pdf' :
                    formData.type === 'VIDEO' ? '.mp4,.avi,.mov,.wmv' :
                    '.mp3,.wav,.m4a,.aac'
                  }
                  className="hidden"
                />
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Choose File
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Max file size: 50MB
                </p>
                {uploadedFile && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-700">
                      <strong>Selected:</strong> {uploadedFile.name}
                    </p>
                    <p className="text-xs text-green-600">
                      Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {formData.type === 'LINK' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL *
              </label>
              <input
                type="url"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>
          )}

          {formData.type === 'TEXT' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your text content here..."
              />
            </div>
          )}

          {/* Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Order
            </label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleInputChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Published Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Publish immediately (make visible to students)
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || (formData.type !== 'LINK' && formData.type !== 'TEXT' && !uploadedFile)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
