"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Save, 
  X, 
  Plus, 
  Calendar, 
  Users, 
  DollarSign, 
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface CourseFormData {
  title: string;
  description: string;
  instructor: string;
  difficulty: string;
  estimatedHours: number;
  price: number;
  duration: string;
  maxStudents: number;
  status: string;
  enrollmentDeadline?: string;
  accessStartDate?: string;
  accessEndDate?: string;
  googleMeetLink?: string;
}

interface CourseCreationFormProps {
  onSuccess?: (courseId: string) => void;
  onCancel?: () => void;
}

export default function CourseCreationForm({ onSuccess, onCancel }: CourseCreationFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    instructor: '',
    difficulty: 'INTERMEDIATE',
    estimatedHours: 40,
    price: 50000,
    duration: '8 weeks',
    maxStudents: 30,
    status: 'DRAFT',
    enrollmentDeadline: '',
    accessStartDate: '',
    accessEndDate: '',
    googleMeetLink: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableInstructors, setAvailableInstructors] = useState<string[]>([]);

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const response = await fetch('/api/admin/courses/create');
      if (response.ok) {
        const data = await response.json();
        setAvailableInstructors(data.instructors || []);
      }
    } catch (error) {
      console.error('Error fetching instructors:', error);
      // Fallback instructors
      setAvailableInstructors([
        'Dr. Sarah Johnson',
        'Prof. Michael Chen',
        'Dr. Emily Rodriguez',
        'Prof. David Kim',
        'Dr. Lisa Wang'
      ]);
    }
  };

  const handleInputChange = (field: keyof CourseFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/courses/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess('Course created successfully!');
        
        if (onSuccess && result.course?.id) {
          onSuccess(result.course.id);
        } else {
          // Redirect to course builder or course list
          setTimeout(() => {
            router.push('/admin/courses');
          }, 2000);
        }
      } else {
        setError(result.error || 'Failed to create course');
      }
    } catch (error: any) {
      setError('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/admin/courses');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center space-x-3 mb-6">
        <BookOpen className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800">{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter course title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructor *
              </label>
              <select
                required
                value={formData.instructor}
                onChange={(e) => handleInputChange('instructor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select instructor</option>
                {availableInstructors.map((instructor) => (
                  <option key={instructor} value={instructor}>
                    {instructor}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level *
              </label>
              <select
                required
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe what students will learn in this course"
            />
          </div>
        </div>

        {/* Course Details */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Estimated Hours *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.estimatedHours}
                onChange={(e) => handleInputChange('estimatedHours', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Price (KZT) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration *
              </label>
              <input
                type="text"
                required
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 8 weeks, 3 months"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Max Students *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.maxStudents}
                onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Optional Settings */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Optional Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Enrollment Deadline
              </label>
              <input
                type="date"
                value={formData.enrollmentDeadline}
                onChange={(e) => handleInputChange('enrollmentDeadline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Access Start Date
              </label>
              <input
                type="date"
                value={formData.accessStartDate}
                onChange={(e) => handleInputChange('accessStartDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Access End Date
              </label>
              <input
                type="date"
                value={formData.accessEndDate}
                onChange={(e) => handleInputChange('accessEndDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Meet Link
              </label>
              <input
                type="url"
                value={formData.googleMeetLink}
                onChange={(e) => handleInputChange('googleMeetLink', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://meet.google.com/..."
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Create Course</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
