"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Users, Clock, CheckCircle, XCircle, DollarSign, 
  MessageCircle, Calendar, User, BookOpen, Phone
} from 'lucide-react';
import Header from '@/components/Header';

interface EnrollmentRequest {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  paymentMethod: string;
  enrolledAt: string;
  updatedAt: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  course: {
    id: string;
    title: string;
    price: number;
  };
  tutor: {
    id: string;
    name: string;
    email: string;
  };
}

export default function EnrollmentRequestsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<EnrollmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  useEffect(() => {
    if (session) {
      fetchEnrollmentRequests();
    }
  }, [session]);

  const fetchEnrollmentRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/enrollment-requests', { credentials: 'include' });
      
      if (response.ok) {
        const data = await response.json();
        setEnrollments(data.enrollments || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch enrollment requests');
      }
    } catch (error) {
      console.error('Error fetching enrollment requests:', error);
      setError('Failed to fetch enrollment requests');
    } finally {
      setLoading(false);
    }
  };

  const updateEnrollmentStatus = async (id: string, status: string, paymentStatus?: string) => {
    try {
      const response = await fetch(`/api/admin/enrollment-requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          status,
          paymentStatus: paymentStatus || 'PAID'
        }),
      });

      if (response.ok) {
        // Refresh the list
        fetchEnrollmentRequests();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update enrollment status');
      }
    } catch (error) {
      console.error('Error updating enrollment status:', error);
      alert('Failed to update enrollment status');
    }
  };

  const generateWhatsAppLink = (enrollment: EnrollmentRequest) => {
    const message = `Hello! Student ${enrollment.student.name} (${enrollment.student.email}) wants to enroll in "${enrollment.course.title}" with tutor ${enrollment.tutor.name}. Course price: $${enrollment.course.price}. Please confirm payment and enrollment.`;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/77001234567?text=${encodedMessage}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'ACTIVE': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment => 
    filter === 'ALL' || enrollment.status === filter
  );

  if (!session) {
    if (typeof window !== 'undefined') {
      router.push('/auth/signin');
    }
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchEnrollmentRequests}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Enrollment Requests</h1>
          <p className="text-gray-600">Manage student enrollment requests and payments</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            {[
              { key: 'ALL', label: 'All Requests', count: enrollments.length },
              { key: 'PENDING', label: 'Pending', count: enrollments.filter(e => e.status === 'PENDING').length },
              { key: 'APPROVED', label: 'Approved', count: enrollments.filter(e => e.status === 'APPROVED').length },
              { key: 'REJECTED', label: 'Rejected', count: enrollments.filter(e => e.status === 'REJECTED').length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Enrollment Requests List */}
        <div className="space-y-4">
          {filteredEnrollments.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No enrollment requests</h3>
              <p className="text-gray-600">No enrollment requests match your current filter.</p>
            </div>
          ) : (
            filteredEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Student Info */}
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{enrollment.student.name}</h3>
                        <p className="text-sm text-gray-600">{enrollment.student.email}</p>
                      </div>
                    </div>

                    {/* Course Info */}
                    <div className="flex items-center space-x-3 mb-3">
                      <BookOpen className="w-5 h-5 text-gray-400" />
                      <div>
                        <h4 className="font-medium text-gray-900">{enrollment.course.title}</h4>
                        <p className="text-sm text-gray-600">Tutor: {enrollment.tutor.name}</p>
                      </div>
                    </div>

                    {/* Status and Payment */}
                    <div className="flex items-center space-x-4 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                        {enrollment.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(enrollment.paymentStatus)}`}>
                        Payment: {enrollment.paymentStatus}
                      </span>
                      <span className="text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        ${enrollment.course.price}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      Requested: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-6">
                    {enrollment.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => updateEnrollmentStatus(enrollment.id, 'APPROVED')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateEnrollmentStatus(enrollment.id, 'REJECTED')}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    
                    <a
                      href={generateWhatsAppLink(enrollment)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 flex items-center justify-center"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}