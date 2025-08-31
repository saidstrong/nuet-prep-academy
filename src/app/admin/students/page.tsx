"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  BookOpen, 
  Target, 
  TrendingUp,
  Phone,
  MessageCircle,
  GraduationCap,
  Goal
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StudentCreationModal from '@/components/StudentCreationModal';
import StudentEnrollmentModal from '@/components/StudentEnrollmentModal';

interface Student {
  id: string;
  name: string;
  email: string;
  role: string;
  enrolledCourses: string[];
  totalEnrollments: number;
  profile?: {
    phone?: string;
    whatsapp?: string;
    bio?: string;
    experience?: string;
  };
}

export default function StudentManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/auth/signin');
      return;
    }

    fetchStudents();
  }, [session, status, router]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentCreated = () => {
    fetchStudents();
  };

  const handleStudentEnrolled = () => {
    fetchStudents();
  };

  const viewStudentDetails = (student: Student) => {
    setSelectedStudent(student);
    setShowStudentDetails(true);
  };

  const closeStudentDetails = () => {
    setShowStudentDetails(false);
    setSelectedStudent(null);
  };

  const openEnrollmentModal = (student: Student) => {
    setSelectedStudent(student);
    setIsEnrollmentModalOpen(true);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading student management...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Management</h1>
              <p className="text-gray-600">Manage students, view profiles, and handle enrollments</p>
            </div>
            <button
              onClick={() => setIsStudentModalOpen(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Student</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Users className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-semibold text-gray-900">{students.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Enrollments</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {students.reduce((total, student) => total + student.totalEnrollments, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <Target className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Enrolled Students</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {students.filter(student => student.totalEnrollments > 0).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Courses/Student</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {students.length > 0 
                    ? Math.round(students.reduce((total, student) => total + student.totalEnrollments, 0) / students.length * 10) / 10
                    : 0
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Students</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled Courses</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Enrollments</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {student.profile?.phone && (
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Phone className="w-4 h-4" />
                            <span className="text-xs">{student.profile.phone}</span>
                          </div>
                        )}
                        {student.profile?.whatsapp && (
                          <div className="flex items-center space-x-1 text-gray-500">
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-xs">{student.profile.whatsapp}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.enrolledCourses.length} courses
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.totalEnrollments}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => viewStudentDetails(student)}
                        className="text-blue-600 hover:text-blue-900 mr-3 flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      <button 
                        onClick={() => openEnrollmentModal(student)}
                        className="text-green-600 hover:text-green-900 mr-3 flex items-center space-x-1"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Enroll</span>
                      </button>
                      <button className="text-red-600 hover:text-red-900 flex items-center space-x-1">
                        <Trash2 className="w-4 h-4" />
                        <span>Remove</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {students.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No students yet</h3>
              <p className="text-gray-600 mb-4">Start building your student base by adding the first student.</p>
              <button
                onClick={() => setIsStudentModalOpen(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Add First Student
              </button>
            </div>
          )}
        </div>
      </div>
      
      <Footer />

      {/* Student Creation Modal */}
      <StudentCreationModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onStudentCreated={handleStudentCreated}
      />

      {/* Student Enrollment Modal */}
      {selectedStudent && (
        <StudentEnrollmentModal
          isOpen={isEnrollmentModalOpen}
          onClose={() => setIsEnrollmentModalOpen(false)}
          studentId={selectedStudent.id}
          studentName={selectedStudent.name}
          onStudentEnrolled={handleStudentEnrolled}
        />
      )}

      {/* Student Details Modal */}
      {showStudentDetails && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Student Details</h2>
              <button
                onClick={closeStudentDetails}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{selectedStudent.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{selectedStudent.email}</p>
                  </div>
                  {selectedStudent.profile?.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-sm text-gray-900">{selectedStudent.profile.phone}</p>
                    </div>
                  )}
                  {selectedStudent.profile?.whatsapp && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
                      <p className="text-sm text-gray-900">{selectedStudent.profile.whatsapp}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedStudent.profile?.bio && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <p className="text-sm text-gray-900">{selectedStudent.profile.bio}</p>
                </div>
              )}

              {selectedStudent.profile?.experience && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Experience</label>
                  <p className="text-sm text-gray-900">{selectedStudent.profile.experience}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-blue-900">Enrolled Courses</div>
                  <div className="text-2xl font-bold text-blue-600">{selectedStudent.enrolledCourses.length}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-green-900">Total Enrollments</div>
                  <div className="text-2xl font-bold text-green-600">{selectedStudent.totalEnrollments}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
