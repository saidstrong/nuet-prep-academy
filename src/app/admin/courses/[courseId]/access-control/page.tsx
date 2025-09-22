"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Shield, CheckCircle, XCircle } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface CourseAccess {
  id: string;
  userId: string;
  courseId: string;
  accessLevel: 'READ' | 'WRITE' | 'ADMIN';
  grantedAt: string;
  user: User;
}

export default function CourseAccessControlPage({ params }: { params: { courseId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [accessList, setAccessList] = useState<CourseAccess[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || !['ADMIN', 'OWNER', 'MANAGER'].includes(session.user.role)) {
      router.push('/auth/signin');
      return;
    }

    fetchData();
  }, [session, status, router, params.courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseResponse = await fetch(`/api/admin/courses/${params.courseId}`, {
        credentials: 'include'
      });

      if (!courseResponse.ok) {
        throw new Error('Failed to fetch course');
      }

      const courseData = await courseResponse.json();
      setCourse(courseData.course);

      // Fetch access list (mock data for now)
      setAccessList([
        {
          id: '1',
          userId: 'user-1',
          courseId: params.courseId,
          accessLevel: 'ADMIN',
          grantedAt: '2024-01-15T10:00:00Z',
          user: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'TUTOR'
          }
        },
        {
          id: '2',
          userId: 'user-2',
          courseId: params.courseId,
          accessLevel: 'WRITE',
          grantedAt: '2024-01-16T14:30:00Z',
          user: {
            id: 'user-2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'TUTOR'
          }
        }
      ]);

      // Fetch available users
      const usersResponse = await fetch('/api/admin/users', {
        credentials: 'include'
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGrantAccess = async (userId: string, accessLevel: string) => {
    try {
      // Mock implementation - in real app, call API
      const newAccess: CourseAccess = {
        id: Date.now().toString(),
        userId,
        courseId: params.courseId,
        accessLevel: accessLevel as any,
        grantedAt: new Date().toISOString(),
        user: users.find(u => u.id === userId)!
      };

      setAccessList([...accessList, newAccess]);
    } catch (err) {
      console.error('Error granting access:', err);
    }
  };

  const handleRevokeAccess = async (accessId: string) => {
    try {
      // Mock implementation - in real app, call API
      setAccessList(accessList.filter(access => access.id !== accessId));
    } catch (err) {
      console.error('Error revoking access:', err);
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'WRITE':
        return 'bg-yellow-100 text-yellow-800';
      case 'READ':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading access control...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Access Control</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 text-blue-600 hover:text-blue-700 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Shield className="w-8 h-8 mr-3 text-blue-600" />
            Access Control
          </h1>
          {course && (
            <p className="text-gray-600">Manage access permissions for: {course.title}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Access List */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Current Access
              </h2>
            </div>
            
            <div className="p-6">
              {accessList.length > 0 ? (
                <div className="space-y-4">
                  {accessList.map((access) => (
                    <div key={access.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-600">
                            {access.user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{access.user.name}</h3>
                          <p className="text-sm text-gray-500">{access.user.email}</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getAccessLevelColor(access.accessLevel)}`}>
                            {access.accessLevel}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRevokeAccess(access.id)}
                        className="text-red-600 hover:text-red-700 p-2"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No access permissions granted yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Grant Access */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Grant Access
              </h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select User
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Choose a user...</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email}) - {user.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Access Level
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="READ">Read Only</option>
                    <option value="WRITE">Read & Write</option>
                    <option value="ADMIN">Full Access</option>
                  </select>
                </div>

                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Grant Access
                </button>
              </div>

              {/* Access Level Descriptions */}
              <div className="mt-6 space-y-3">
                <h3 className="font-semibold text-gray-900">Access Levels:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span><strong>Read:</strong> View course content only</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                    <span><strong>Write:</strong> Edit course content and materials</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span><strong>Admin:</strong> Full course management access</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
