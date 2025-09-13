"use client";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Plus, Users, BookOpen, DollarSign, Trash2, Edit, Eye } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  status: string;
  maxStudents: number;
  enrollments: any[];
  assignedTutors: any[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profile?: {
    phone?: string;
    whatsapp?: string;
  };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [tutors, setTutors] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || !['ADMIN', 'OWNER'].includes(session.user.role)) {
      router.push('/auth/signin');
      return;
    }

    fetchDashboardData();
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      // Fetch courses
      const coursesResponse = await fetch('/api/admin/courses', {
        credentials: 'include'
      });
      const coursesData = await coursesResponse.json();
      
      // Fetch tutors
      const tutorsResponse = await fetch('/api/admin/tutors', {
        credentials: 'include'
      });
      const tutorsData = await tutorsResponse.json();
      
      // Fetch students
      const studentsResponse = await fetch('/api/admin/students', {
        credentials: 'include'
      });
      const studentsData = await studentsResponse.json();

      if (coursesData.success) setCourses(coursesData.courses);
      if (tutorsData.success) setTutors(tutorsData.tutors);
      if (studentsData.success) setStudents(studentsData.students);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <main>
        <Header />
        <div className="container-section py-16">
          <div className="text-center">Loading...</div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!session || !['ADMIN', 'OWNER'].includes(session.user.role)) {
    return null;
  }

  const totalRevenue = courses.reduce((sum, course) => {
    const paidEnrollments = course.enrollments?.filter((e: any) => e.paymentStatus === 'COMPLETED') || [];
    return sum + (paidEnrollments.length * (course.price || 0));
  }, 0);

  const totalStudents = students.length;
  const totalTutors = tutors.length;
  const totalCourses = courses.length;

  return (
    <main>
      <Header />
      <div className="container-section py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
            <p className="text-slate-600">Manage your academy, courses, tutors, and students</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Students</p>
                  <p className="text-2xl font-bold text-slate-900">{totalStudents}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Tutors</p>
                  <p className="text-2xl font-bold text-slate-900">{totalTutors}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Courses</p>
                  <p className="text-2xl font-bold text-slate-900">{totalCourses}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-slate-900">{totalRevenue.toLocaleString()} ₸</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="border-b border-slate-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('courses')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'courses'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  Courses
                </button>
                <button
                  onClick={() => setActiveTab('tutors')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'tutors'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  Tutors
                </button>
                <button
                  onClick={() => setActiveTab('students')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'students'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  Students
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 mb-4">Recent Activity</h3>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-slate-600">No recent activity to display.</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button className="flex items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-primary hover:text-primary transition-colors">
                        <Plus className="w-5 h-5 mr-2" />
                        Create Course
                      </button>
                      <button className="flex items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-primary hover:text-primary transition-colors">
                        <Users className="w-5 h-5 mr-2" />
                        Add Tutor
                      </button>
                      <button className="flex items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-primary hover:text-primary transition-colors">
                        <BookOpen className="w-5 h-5 mr-2" />
                        Manage Materials
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Courses Tab */}
              {activeTab === 'courses' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-slate-900">All Courses</h3>
                    <button className="btn-primary flex items-center">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Course
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Course</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Students</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tutors</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {courses.map((course) => (
                          <tr key={course.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-slate-900">{course.title}</div>
                                <div className="text-sm text-slate-500">{course.description.substring(0, 50)}...</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              {course.price.toLocaleString()} ₸
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              {course.enrollments?.length || 0} / {course.maxStudents}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              {course.assignedTutors?.length || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                course.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                course.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {course.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button className="text-primary hover:text-primary-dark">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="text-blue-600 hover:text-blue-800">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-800">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tutors Tab */}
              {activeTab === 'tutors' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-slate-900">All Tutors</h3>
                    <button className="btn-primary flex items-center">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Tutor
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tutor</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned Courses</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Students</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {tutors.map((tutor) => (
                          <tr key={tutor.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-slate-900">{tutor.name}</div>
                                <div className="text-sm text-slate-500">{tutor.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              <div>{tutor.profile?.phone || 'N/A'}</div>
                              <div>{tutor.profile?.whatsapp || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              {/* Will be populated when we implement course assignments */}
                              0
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              {/* Will be populated when we implement student counting */}
                              0
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button className="text-primary hover:text-primary-dark">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="text-blue-600 hover:text-blue-800">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-800">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Students Tab */}
              {activeTab === 'students' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-slate-900">All Students</h3>
                    <button className="btn-primary flex items-center">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Student
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Student</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Enrolled Courses</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Payment Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {students.map((student) => (
                          <tr key={student.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-slate-900">{student.name}</div>
                                <div className="text-sm text-slate-500">{student.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              <div>{student.profile?.phone || 'N/A'}</div>
                              <div>{student.profile?.whatsapp || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              {/* Will be populated when we implement enrollment counting */}
                              0
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              {/* Will be populated when we implement payment status */}
                              N/A
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button className="text-primary hover:text-primary-dark">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="text-blue-600 hover:text-blue-800">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-800">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
