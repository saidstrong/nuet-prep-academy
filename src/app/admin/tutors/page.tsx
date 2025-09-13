"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  User, 
  Mail, 
  Phone, 
  BookOpen,
  Users,
  Star,
  MoreVertical
} from 'lucide-react';

interface Tutor {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  profile?: {
    phone?: string;
    specialization?: string;
    experience?: string;
    bio?: string;
  };
  assignedCourses?: Course[];
}

interface Course {
  id: string;
  title: string;
  status: string;
}

export default function TutorManagementPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Tutor form state
  const [tutorForm, setTutorForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    bio: ''
  });

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchTutors();
    } else {
      router.push('/auth/signin');
    }
  }, [session, router]);

  const fetchTutors = async () => {
    try {
      const response = await fetch('/api/admin/tutors', { credentials: 'include' });
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

  const handleCreateTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const response = await fetch('/api/admin/tutors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...tutorForm,
          role: 'TUTOR'
        })
      });

      if (response.ok) {
        await fetchTutors();
        setShowAddForm(false);
        setTutorForm({ name: '', email: '', phone: '', specialization: '', experience: '', bio: '' });
      } else {
        const error = await response.json();
        alert(`Failed to create tutor: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating tutor:', error);
      alert('Network error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTutor) return;

    setActionLoading(true);

    try {
      const response = await fetch(`/api/admin/tutors/${editingTutor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(tutorForm)
      });

      if (response.ok) {
        await fetchTutors();
        setEditingTutor(null);
        setTutorForm({ name: '', email: '', phone: '', specialization: '', experience: '', bio: '' });
      } else {
        const error = await response.json();
        alert(`Failed to update tutor: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating tutor:', error);
      alert('Network error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTutor = async (tutorId: string) => {
    if (!confirm('Are you sure you want to delete this tutor?')) return;

    setActionLoading(true);

    try {
      const response = await fetch(`/api/admin/tutors/${tutorId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        await fetchTutors();
      } else {
        const error = await response.json();
        alert(`Failed to delete tutor: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting tutor:', error);
      alert('Network error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const startEdit = (tutor: Tutor) => {
    setEditingTutor(tutor);
    setTutorForm({
      name: tutor.name,
      email: tutor.email,
      phone: tutor.profile?.phone || '',
      specialization: tutor.profile?.specialization || '',
      experience: tutor.profile?.experience || '',
      bio: tutor.profile?.bio || ''
    });
  };

  const filteredTutors = tutors.filter(tutor =>
    tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tutor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tutor.profile?.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tutors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tutor Management</h1>
              <p className="mt-2 text-gray-600">Manage tutors and their course assignments</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Tutor
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tutors by name, email, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Tutors List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Tutors ({filteredTutors.length})
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredTutors.map((tutor) => (
              <div key={tutor.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900">{tutor.name}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-1" />
                          {tutor.email}
                        </div>
                        {tutor.profile?.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-1" />
                            {tutor.profile.phone}
                          </div>
                        )}
                      </div>
                      {tutor.profile?.specialization && (
                        <p className="text-sm text-blue-600 mt-1">
                          {tutor.profile.specialization}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {tutor.assignedCourses?.length || 0} courses
                      </div>
                      <div className="text-xs text-gray-500">
                        Joined {new Date(tutor.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => startEdit(tutor)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit tutor"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTutor(tutor.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete tutor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTutors.length === 0 && (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tutors found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first tutor'}
              </p>
            </div>
          )}
        </div>

        {/* Add/Edit Tutor Modal */}
        {(showAddForm || editingTutor) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">
                  {editingTutor ? 'Edit Tutor' : 'Add New Tutor'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingTutor(null);
                    setTutorForm({ name: '', email: '', phone: '', specialization: '', experience: '', bio: '' });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <form onSubmit={editingTutor ? handleUpdateTutor : handleCreateTutor} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                    <input
                      type="text"
                      value={tutorForm.name}
                      onChange={(e) => setTutorForm({ ...tutorForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={tutorForm.email}
                      onChange={(e) => setTutorForm({ ...tutorForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={tutorForm.phone}
                      onChange={(e) => setTutorForm({ ...tutorForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+7 707 123 45 67"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                    <input
                      type="text"
                      value={tutorForm.specialization}
                      onChange={(e) => setTutorForm({ ...tutorForm, specialization: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., NUET Mathematics, English, Critical Thinking"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                  <input
                    type="text"
                    value={tutorForm.experience}
                    onChange={(e) => setTutorForm({ ...tutorForm, experience: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 5 years teaching experience"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={tutorForm.bio}
                    onChange={(e) => setTutorForm({ ...tutorForm, bio: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of the tutor's background and expertise..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingTutor(null);
                      setTutorForm({ name: '', email: '', phone: '', specialization: '', experience: '', bio: '' });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading ? 'Saving...' : (editingTutor ? 'Update Tutor' : 'Create Tutor')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}