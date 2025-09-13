"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  MessageCircle, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  User,
  Calendar,
  Clock,
  DollarSign,
  Shield,
  Star
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Course {
  id: string;
  title: string;
  price: number;
  duration: string;
  instructor: string;
  difficulty: string;
  maxStudents: number;
  enrolledStudents: number;
}

interface Tutor {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  rating: number;
  avatar?: string;
}

interface EnrollmentData {
  courseId: string;
  tutorId?: string;
  paymentMethod: 'KASPI' | 'CARD' | 'BANK_TRANSFER' | 'CONTACT_MANAGER';
  contactInfo?: {
    phone?: string;
    email?: string;
    notes?: string;
  };
}

interface EnhancedEnrollmentFlowProps {
  course: Course;
  onEnroll: (data: EnrollmentData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const EnhancedEnrollmentFlow: React.FC<EnhancedEnrollmentFlowProps> = ({
  course,
  onEnroll,
  onCancel,
  loading = false
}) => {
  const [step, setStep] = useState(1);
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData>({
    courseId: course.id,
    paymentMethod: 'CARD'
  });
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loadingTutors, setLoadingTutors] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      setLoadingTutors(true);
      const response = await fetch('/api/courses/tutors');
      const data = await response.json();
      
      if (data.success) {
        setTutors(data.tutors || []);
      }
    } catch (error) {
      console.error('Error fetching tutors:', error);
    } finally {
      setLoadingTutors(false);
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleTutorSelect = (tutorId: string) => {
    setEnrollmentData(prev => ({ ...prev, tutorId }));
  };

  const handlePaymentMethodSelect = (method: string) => {
    setEnrollmentData(prev => ({ ...prev, paymentMethod: method as any }));
  };

  const handleContactInfoChange = (field: string, value: string) => {
    setEnrollmentData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [field]: value
      }
    }));
  };

  const handleSubmit = () => {
    // Validate required fields
    const newErrors: Record<string, string> = {};
    
    if (enrollmentData.paymentMethod === 'CONTACT_MANAGER') {
      if (!enrollmentData.contactInfo?.phone) {
        newErrors.phone = 'Phone number is required';
      }
      if (!enrollmentData.contactInfo?.email) {
        newErrors.email = 'Email is required';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onEnroll(enrollmentData);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Choose Your Tutor</h2>
        <p className="text-slate-600">Select a tutor to guide you through this course</p>
      </div>

      {loadingTutors ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner text="Loading tutors..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tutors.map((tutor) => (
            <Card
              key={tutor.id}
              className={`cursor-pointer transition-all duration-200 ${
                enrollmentData.tutorId === tutor.id
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleTutorSelect(tutor.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{tutor.name}</h3>
                    <p className="text-sm text-slate-600 mb-2">{tutor.specialization}</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(tutor.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-slate-600">
                        {tutor.rating} ({tutor.experience})
                      </span>
                    </div>
                  </div>
                  {enrollmentData.tutorId === tutor.id && (
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleNext} disabled={!enrollmentData.tutorId}>
          Next: Payment
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Method</h2>
        <p className="text-slate-600">Choose how you'd like to pay for this course</p>
      </div>

      <div className="space-y-4">
        {[
          {
            id: 'KASPI',
            title: 'Kaspi Bank',
            description: 'Pay with Kaspi QR or Kaspi Red',
            icon: <Smartphone className="w-6 h-6" />,
            popular: true
          },
          {
            id: 'CARD',
            title: 'Credit/Debit Card',
            description: 'Visa, Mastercard, or other major cards',
            icon: <CreditCard className="w-6 h-6" />
          },
          {
            id: 'BANK_TRANSFER',
            title: 'Bank Transfer',
            description: 'Direct transfer to our bank account',
            icon: <Building2 className="w-6 h-6" />
          },
          {
            id: 'CONTACT_MANAGER',
            title: 'Contact Manager',
            description: 'Get in touch with our team for assistance',
            icon: <MessageCircle className="w-6 h-6" />
          }
        ].map((method) => (
          <Card
            key={method.id}
            className={`cursor-pointer transition-all duration-200 ${
              enrollmentData.paymentMethod === method.id
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:shadow-md'
            }`}
            onClick={() => handlePaymentMethodSelect(method.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-blue-600">{method.icon}</div>
                  <div>
                    <h3 className="font-semibold text-slate-900 flex items-center space-x-2">
                      {method.title}
                      {method.popular && (
                        <Badge variant="secondary" className="text-xs">
                          Popular
                        </Badge>
                      )}
                    </h3>
                    <p className="text-sm text-slate-600">{method.description}</p>
                  </div>
                </div>
                {enrollmentData.paymentMethod === method.id && (
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {enrollmentData.paymentMethod === 'CONTACT_MANAGER' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+7 (xxx) xxx-xx-xx"
              value={enrollmentData.contactInfo?.phone || ''}
              onChange={(e) => handleContactInfoChange('phone', e.target.value)}
              error={errors.phone}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="your@email.com"
              value={enrollmentData.contactInfo?.email || ''}
              onChange={(e) => handleContactInfoChange('email', e.target.value)}
              error={errors.email}
            />
            <Input
              label="Additional Notes (Optional)"
              type="text"
              placeholder="Any special requests or questions..."
              value={enrollmentData.contactInfo?.notes || ''}
              onChange={(e) => handleContactInfoChange('notes', e.target.value)}
            />
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleNext}>
          Next: Review
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const selectedTutor = tutors.find(t => t.id === enrollmentData.tutorId);
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Review & Confirm</h2>
          <p className="text-slate-600">Please review your enrollment details</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Course Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Course Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">Duration: {course.duration}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">Difficulty: {course.difficulty}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">Instructor: {course.instructor}</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">Price: {formatCurrency(course.price)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Tutor Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Selected Tutor</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTutor ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{selectedTutor.name}</h3>
                      <p className="text-sm text-slate-600">{selectedTutor.specialization}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(selectedTutor.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-slate-600">
                      {selectedTutor.rating} rating
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-slate-600">No tutor selected</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Course Fee</span>
                <span className="font-semibold">{formatCurrency(course.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Payment Method</span>
                <span className="font-semibold">
                  {enrollmentData.paymentMethod === 'KASPI' && 'Kaspi Bank'}
                  {enrollmentData.paymentMethod === 'CARD' && 'Credit/Debit Card'}
                  {enrollmentData.paymentMethod === 'BANK_TRANSFER' && 'Bank Transfer'}
                  {enrollmentData.paymentMethod === 'CONTACT_MANAGER' && 'Contact Manager'}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(course.price)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Alert variant="info">
          <Shield className="w-4 h-4" />
          <div>
            <h4 className="font-semibold">Secure Payment</h4>
            <p className="text-sm">
              Your payment information is encrypted and secure. We never store your payment details.
            </p>
          </div>
        </Alert>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                Complete Enrollment
                <CheckCircle className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= stepNumber
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div
                  className={`w-12 h-1 mx-2 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-8">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedEnrollmentFlow;
