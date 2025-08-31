"use client";
import { useState, useEffect } from 'react';
import { X, Plus, User, BookOpen, Users, CheckCircle, GraduationCap } from 'lucide-react';

interface StudentEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  onStudentEnrolled: () => void;
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  availableTutors: Tutor[];
}

interface Tutor {
  id: string;
  name: string;
  email: string;
  assignedStudents: number;
  maxStudents: number;
  experience: string;
}

interface EnrollmentData {
  courseId: string;
  tutorId: string;
  paymentMethod: 'KASPI' | 'CARD' | 'BANK_TRANSFER';
}

export default function StudentEnrollmentModal({ isOpen, onClose, studentId, studentName, onStudentEnrolled }: StudentEnrollmentModalProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setEnrollmentData] = useState<EnrollmentData>({
    courseId: '',
    tutorId: '',
    paymentMethod: 'KASPI'
  });

  useEffect(() => {
    if (isOpen) {
      fetchAvailableCourses();
    }
  }, [isOpen]);

  const fetchAvailableCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses/available-for-enrollment');
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEnrollmentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/students/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          courseId: formData.courseId,
          tutorId: formData.tutorId,
          paymentMethod: formData.paymentMethod
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to enroll student');
      }

      setSuccess('Student enrolled successfully!');
      onStudentEnrolled();
      
      // Reset form
      setEnrollmentData({
        courseId: '',
        tutorId: '',
        paymentMethod: 'KASPI'
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

  const selectedCourse = courses.find(c => c.id === formData.courseId);
  const selectedTutor = selectedCourse?.availableTutors.find(t => t.id === formData.tutorId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Enroll Student in Course</h2>
            <p className="text-sm text-gray-600 mt-1">Enrolling {studentName}</p>
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

          {/* Course Selection */}
          <div>
            <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-2">
              Select Course *
            </label>
            <select
              id="courseId"
              name="courseId"
              value={formData.courseId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose a course...</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title} - ${course.price} - {course.duration}
                </option>
              ))}
            </select>
            
            {courses.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                No available courses found. Please create courses and assign tutors first.
              </p>
            )}
          </div>

          {/* Tutor Selection */}
          {selectedCourse && (
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
                {selectedCourse.availableTutors.map((tutor) => (
                  <option key={tutor.id} value={tutor.id}>
                    {tutor.name} - {tutor.assignedStudents}/{tutor.maxStudents} students
                  </option>
                ))}
              </select>
              
              {selectedCourse.availableTutors.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  No available tutors for this course. Please assign tutors first.
                </p>
              )}
            </div>
          )}

          {/* Payment Method */}
          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method *
            </label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="KASPI">Kaspi</option>
              <option value="CARD">Bank Card</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
          </div>

          {/* Selected Course Info */}
          {selectedCourse && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Course Information</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span><strong>Course:</strong> {selectedCourse.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span><strong>Price:</strong> ${selectedCourse.price}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4" />
                  <span><strong>Duration:</strong> {selectedCourse.duration}</span>
                </div>
                <div className="text-xs text-blue-600 mt-2">
                  {selectedCourse.description.substring(0, 100)}...
                </div>
              </div>
            </div>
          )}

          {/* Selected Tutor Info */}
          {selectedTutor && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-green-900 mb-2">Tutor Information</h4>
              <div className="space-y-2 text-sm text-green-800">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span><strong>Name:</strong> {selectedTutor.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span><strong>Current Load:</strong> {selectedTutor.assignedStudents}/{selectedTutor.maxStudents} students</span>
                </div>
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4" />
                  <span><strong>Experience:</strong> {selectedTutor.experience}</span>
                </div>
              </div>
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
              disabled={loading || !formData.courseId || !formData.tutorId}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Enrolling...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Enroll Student</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
