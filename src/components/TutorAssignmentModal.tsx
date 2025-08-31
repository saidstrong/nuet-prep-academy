"use client";
import { useState, useEffect } from 'react';
import { X, Plus, User, BookOpen, Users, CheckCircle } from 'lucide-react';

interface TutorAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  onTutorAssigned: () => void;
}

interface Tutor {
  id: string;
  name: string;
  email: string;
  assignedStudents: number;
  maxStudents: number;
}

interface AssignmentData {
  tutorId: string;
  maxStudents: number;
}

export default function TutorAssignmentModal({ isOpen, onClose, courseId, courseTitle, onTutorAssigned }: TutorAssignmentModalProps) {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState<AssignmentData>({
    tutorId: '',
    maxStudents: 40
  });

  useEffect(() => {
    if (isOpen) {
      fetchAvailableTutors();
    }
  }, [isOpen]);

  const fetchAvailableTutors = async () => {
    try {
      const response = await fetch('/api/admin/tutors/available');
      if (response.ok) {
        const data = await response.json();
        setTutors(data.tutors || []);
      }
    } catch (error) {
      console.error('Error fetching tutors:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxStudents' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/courses/assign-tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          tutorId: formData.tutorId,
          maxStudents: formData.maxStudents
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign tutor');
      }

      setSuccess('Tutor assigned successfully!');
      onTutorAssigned();
      
      // Reset form
      setFormData({
        tutorId: '',
        maxStudents: 40
      });
      
      // Close modal after success
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Assign Tutor to Course</h2>
            <p className="text-sm text-gray-600 mt-1">{courseTitle}</p>
          </div>
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

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>{success}</span>
            </div>
          )}

          {/* Tutor Selection */}
          <div>
            <label htmlFor="tutorId" className="block text-sm font-medium text-gray-700 mb-2">
              Select Tutor *
            </label>
            <select
              id="tutorId"
              name="tutorId"
              value={formData.tutorId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose a tutor...</option>
              {tutors.map((tutor) => (
                <option key={tutor.id} value={tutor.id}>
                  {tutor.name} ({tutor.email}) - {tutor.assignedStudents}/{tutor.maxStudents} students
                </option>
              ))}
            </select>
            
            {tutors.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                No available tutors found. Please create tutors first.
              </p>
            )}
          </div>

          {/* Max Students */}
          <div>
            <label htmlFor="maxStudents" className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Students for This Tutor
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                id="maxStudents"
                name="maxStudents"
                value={formData.maxStudents}
                onChange={handleInputChange}
                required
                min="1"
                max="100"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="40"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Maximum number of students this tutor can handle for this course
            </p>
          </div>

          {/* Selected Tutor Info */}
          {formData.tutorId && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Selected Tutor Information</h4>
              {(() => {
                const selectedTutor = tutors.find(t => t.id === formData.tutorId);
                if (!selectedTutor) return null;
                
                return (
                  <div className="space-y-2 text-sm text-blue-800">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span><strong>Name:</strong> {selectedTutor.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4" />
                      <span><strong>Current Load:</strong> {selectedTutor.assignedStudents}/{selectedTutor.maxStudents} students</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span><strong>Available Capacity:</strong> {selectedTutor.maxStudents - selectedTutor.assignedStudents} students</span>
                    </div>
                  </div>
                );
              })()}
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
              disabled={loading || !formData.tutorId}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Assign Tutor</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
