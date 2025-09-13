"use client";

import { useState, useEffect } from 'react';
import { X, User, CreditCard, MessageCircle, CheckCircle, AlertCircle, Phone, Mail } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  instructor: string;
}

interface Tutor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  specialization?: string;
  rating?: number;
}

interface EnrollmentFlowProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (enrollmentData: any) => void;
  userEmail: string;
}

export default function EnrollmentFlow({ course, isOpen, onClose, onComplete, userEmail }: EnrollmentFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [availableTutors, setAvailableTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [tutorsLoading, setTutorsLoading] = useState(false);

  // Available tutors for NUET preparation
  const mockTutors: Tutor[] = [
    {
      id: 'tutor1',
      name: 'Said Amanzhol',
      email: 'said@nuetprep.academy',
      specialization: 'NUET Mathematics & Critical Thinking',
      rating: 4.9
    },
    {
      id: 'tutor2', 
      name: 'Amir Karimov',
      email: 'amir@nuetprep.academy',
      specialization: 'NUET English & Test Strategies',
      rating: 4.8
    },
    {
      id: 'tutor3',
      name: 'Expert Tutor',
      email: 'tutor@nuetprep.academy', 
      specialization: 'Comprehensive NUET Preparation',
      rating: 4.7
    }
  ];

  // Reset state when modal opens/closes and fetch tutors
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setSelectedTutor(null);
      setError(null);
      setEnrollmentId(null);
      fetchTutors();
    }
  }, [isOpen, course.id]);

  const fetchTutors = async () => {
    setTutorsLoading(true);
    try {
      const response = await fetch(`/api/courses/${course.id}/tutors`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setAvailableTutors(data.tutors || []);
      } else {
        // Fallback to mock tutors if API fails
        setAvailableTutors(mockTutors);
      }
    } catch (error) {
      console.error('Error fetching tutors:', error);
      // Fallback to mock tutors
      setAvailableTutors(mockTutors);
    } finally {
      setTutorsLoading(false);
    }
  };

  const handleTutorSelect = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setError(null);
    setCurrentStep(2);
  };

  const handleSubmitEnrollment = async () => {
    if (!selectedTutor) {
      setError('Please select a tutor before proceeding');
      return;
    }

    setLoading(true);
    setError(null);
    
    // Create enrollment request with PENDING status
    const enrollmentData = {
      courseId: course.id,
      tutorId: selectedTutor?.id,
      status: 'PENDING',
      paymentMethod: 'CONTACT_MANAGER',
      userEmail: userEmail
    };

    try {
      // Call enrollment API to create pending request
      const response = await fetch('/api/student/enroll-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(enrollmentData),
      });

      if (response.ok) {
        const data = await response.json();
        setEnrollmentId(data.enrollment?.id);
        setCurrentStep(3); // Show success step
        onComplete(data);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create enrollment request');
      }
    } catch (error: any) {
      console.error('Error creating enrollment request:', error);
      setError(error.message || 'Failed to create enrollment request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateWhatsAppLink = () => {
    const enrollmentRef = enrollmentId ? ` (Reference: ${enrollmentId})` : '';
    const message = `Hello! I would like to enroll in the course "${course.title}" with tutor ${selectedTutor?.name}.${enrollmentRef} Please provide payment details.`;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/77075214911?text=${encodedMessage}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Enroll in Course</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center p-4 border-b">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                <User className="w-4 h-4" />
              </div>
              <span className="ml-2 text-sm font-medium">Select Tutor</span>
            </div>
            <div className={`w-8 h-0.5 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="ml-2 text-sm font-medium">Payment</span>
            </div>
            <div className={`w-8 h-0.5 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                <CheckCircle className="w-4 h-4" />
              </div>
              <span className="ml-2 text-sm font-medium">Complete</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {currentStep === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Step 1: Select Your Tutor</h3>
              <p className="text-gray-600 mb-6">Choose the tutor who will guide you through this course.</p>
              
              {tutorsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading tutors...</span>
                </div>
              ) : availableTutors.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900 mb-2">No tutors available</h4>
                  <p className="text-sm text-gray-600">
                    Please contact the administrator to assign tutors to this course.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableTutors.map((tutor) => (
                    <div
                      key={tutor.id}
                      onClick={() => handleTutorSelect(tutor)}
                      className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedTutor?.id === tutor.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{tutor.name || 'No details'}</h4>
                          <p className="text-sm text-gray-600">
                            {tutor.specialization || 'NUET Preparation Specialist'}
                          </p>
                          <div className="flex items-center mt-1">
                            <span className="text-sm text-gray-500">{tutor.email || 'No email'}</span>
                          </div>
                        </div>
                        {selectedTutor?.id === tutor.id && (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-sm text-red-600">{error}</span>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Step 2: Review & Submit Request</h3>
              <p className="text-gray-600 mb-6">Review your enrollment details and submit your request.</p>
              
              {/* Course Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium mb-3">Enrollment Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Course:</span>
                    <span>{course.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Tutor:</span>
                    <span>{selectedTutor?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Duration:</span>
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Price:</span>
                    <span className="text-green-600 font-semibold">{course.price.toLocaleString()} ₸</span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Payment Process</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <MessageCircle className="w-6 h-6 text-blue-600 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-blue-800 mb-2">Contact Manager for Payment</h5>
                      <p className="text-sm text-blue-600 mb-3">
                        After submitting your request, you'll receive a WhatsApp link to contact our manager for payment details and course access.
                      </p>
                      <div className="flex items-center text-sm text-blue-700">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>WhatsApp: +7 707 521 49 11</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-sm text-red-600">{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back to Tutors
                </button>
                <button
                  onClick={handleSubmitEnrollment}
                  disabled={loading || !selectedTutor}
                  className="flex-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Submitting...' : 'Submit Enrollment Request'}
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Enrollment Request Submitted!</h3>
              <p className="text-gray-600 mb-6">
                Your enrollment request has been successfully submitted and is now being processed.
              </p>
              
              {/* Enrollment Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h4 className="font-medium mb-3">Request Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Course:</span>
                    <span>{course.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Tutor:</span>
                    <span>{selectedTutor?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span className="text-yellow-600 font-medium">Pending Payment</span>
                  </div>
                  {enrollmentId && (
                    <div className="flex justify-between">
                      <span className="font-medium">Reference:</span>
                      <span className="font-mono text-xs">{enrollmentId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-800 mb-3">Next Steps</h4>
                <div className="space-y-3 text-sm text-blue-700">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-xs font-bold">1</span>
                    </div>
                    <p>Contact our manager via WhatsApp to complete payment</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-xs font-bold">2</span>
                    </div>
                    <p>Receive course access after payment confirmation</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-xs font-bold">3</span>
                    </div>
                    <p>Start your NUET preparation journey!</p>
                  </div>
                </div>
              </div>

              {/* WhatsApp Button */}
              <div className="mb-6">
                <a
                  href={generateWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Contact Manager on WhatsApp
                </a>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
