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
  Mail,
  Phone,
  MessageCircle
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TutorCreationModal from '@/components/TutorCreationModal';

interface Tutor {
  id: string;
  name: string;
  email: string;
  role: string;
  assignedCourses: string[];
  totalStudents: number;
  profile?: {
    bio?: string;
    phone?: string;
    whatsapp?: string;
    experience?: string;
  };
}

export default function TutorManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTutorModalOpen, setIsTutorModalOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [showTutorDetails, setShowTutorDetails] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/auth/signin');
      return;
    }

    fetchTutors();
  }, [session, status, router]);

  const fetchTutors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/tutors');
      if (response.ok) {
        const data = await response.json();
        setTutors(data.tutors || []);
      }
    } catch (error) {
      console.error('Error fetching tutors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTutorCreated = () => {
    fetchTutors();
  };

  const viewTutorDetails = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setShowTutorDetails(true);
  };

  const closeTutorDetails = () => {
    setShowTutorDetails(false);
    setSelectedTutor(null);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading tutor management...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Tutor Management</h1>
              <p className="text-gray-600">Manage tutors, view performance, and assign courses</p>
            </div>
            <button
              onClick={() => setIsTutorModalOpen(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Tutor</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Users className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tutors</p>
                <p className="text-2xl font-semibold text-gray-900">{tutors.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Courses</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {tutors.reduce((total, tutor) => total + tutor.assignedCourses.length, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Target className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {tutors.reduce((total, tutor) => total + tutor.totalStudents, 0)}
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
                <p className="text-sm font-medium text-gray-600">Avg Students/Tutor</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {tutors.length > 0 
                    ? Math.round(tutors.reduce((total, tutor) => total + tutor.totalStudents, 0) / tutors.length)
                    : 0
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tutors Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Tutors</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Courses</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Students</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tutors.map((tutor) => (
                  <tr key={tutor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tutor.name}</div>
                        <div className="text-sm text-gray-500">{tutor.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {tutor.profile?.phone && (
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Phone className="w-4 h-4" />
                            <span className="text-xs">{tutor.profile.phone}</span>
                          </div>
                        )}
                        {tutor.profile?.whatsapp && (
                          <div className="flex items-center space-x-1 text-gray-500">
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-xs">{tutor.profile.whatsapp}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tutor.assignedCourses.length} courses
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tutor.totalStudents} students
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => viewTutorDetails(tutor)}
                        className="text-blue-600 hover:text-blue-900 mr-3 flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      <button className="text-green-600 hover:text-green-900 mr-3 flex items-center space-x-1">
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
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

          {tutors.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tutors yet</h3>
              <p className="text-gray-600 mb-4">Start building your teaching team by adding the first tutor.</p>
              <button
                onClick={() => setIsTutorModalOpen(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Add First Tutor
              </button>
            </div>
          )}
        </div>
      </div>
      
      <Footer />

      {/* Tutor Creation Modal */}
      <TutorCreationModal
        isOpen={isTutorModalOpen}
        onClose={() => setIsTutorModalOpen(false)}
        onTutorCreated={handleTutorCreated}
      />

      {/* Tutor Details Modal */}
      {showTutorDetails && selectedTutor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Tutor Details</h2>
              <button
                onClick={closeTutorDetails}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{selectedTutor.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{selectedTutor.email}</p>
                  </div>
                  {selectedTutor.profile?.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-sm text-gray-900">{selectedTutor.profile.phone}</p>
                    </div>
                  )}
                  {selectedTutor.profile?.whatsapp && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
                      <p className="text-sm text-gray-900">{selectedTutor.profile.whatsapp}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedTutor.profile?.experience && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teaching Experience</label>
                  <p className="text-sm text-gray-900">{selectedTutor.profile.experience}</p>
                </div>
              )}

              {selectedTutor.profile?.bio && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <p className="text-sm text-gray-900">{selectedTutor.profile.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-blue-900">Assigned Courses</div>
                  <div className="text-2xl font-bold text-blue-600">{selectedTutor.assignedCourses.length}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-green-900">Total Students</div>
                  <div className="text-2xl font-bold text-green-600">{selectedTutor.totalStudents}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
