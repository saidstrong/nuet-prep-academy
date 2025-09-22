"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, BookOpen, TrendingUp, Activity, Target, Calendar,
  MessageCircle, Eye, Plus, RefreshCw, ArrowRight, Star,
  Flame, Trophy, Brain, Zap, Bell, Crown, Shield, Settings
} from 'lucide-react';

interface AdminOverviewProps {
  stats: {
    totalUsers: number;
    totalCourses: number;
    totalTutors: number;
    totalStudents: number;
    activeUsers: number;
    totalRevenue: number;
    monthlyRevenue: number;
    courseCompletions: number;
  };
  onRefresh: () => void;
}

export default function AdminOverview({ stats, onRefresh }: AdminOverviewProps) {
  const router = useRouter();
  const [recentActivity, setRecentActivity] = useState([]);
  const [topCourses, setTopCourses] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      const [activityResponse, coursesResponse, usersResponse] = await Promise.all([
        fetch('/api/admin/recent-activity', { credentials: 'include' }),
        fetch('/api/admin/top-courses', { credentials: 'include' }),
        fetch('/api/admin/recent-users', { credentials: 'include' })
      ]);

      if (activityResponse.ok) {
        const data = await activityResponse.json();
        setRecentActivity(data.activities || []);
      }

      if (coursesResponse.ok) {
        const data = await coursesResponse.json();
        setTopCourses(data.courses || []);
      }

      if (usersResponse.ok) {
        const data = await usersResponse.json();
        setRecentUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching overview data:', error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment': return <Users className="w-4 h-4 text-green-600" />;
      case 'course_created': return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'completion': return <Trophy className="w-4 h-4 text-yellow-600" />;
      case 'payment': return <TrendingUp className="w-4 h-4 text-purple-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'enrollment': return 'bg-green-50 border-green-200';
      case 'course_created': return 'bg-blue-50 border-blue-200';
      case 'completion': return 'bg-yellow-50 border-yellow-200';
      case 'payment': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => router.push('/admin/courses')}
          className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 text-left transition-colors"
        >
          <BookOpen className="w-6 h-6 text-blue-600 mb-2" />
          <h5 className="font-medium text-blue-900">Manage Courses</h5>
          <p className="text-sm text-blue-700">Create and edit courses</p>
        </button>

        <button
          onClick={() => router.push('/admin/users')}
          className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 text-left transition-colors"
        >
          <Users className="w-6 h-6 text-green-600 mb-2" />
          <h5 className="font-medium text-green-900">Manage Users</h5>
          <p className="text-sm text-green-700">View and manage all users</p>
        </button>

        <button
          onClick={() => router.push('/admin/analytics')}
          className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 text-left transition-colors"
        >
          <TrendingUp className="w-6 h-6 text-purple-600 mb-2" />
          <h5 className="font-medium text-purple-900">View Analytics</h5>
          <p className="text-sm text-purple-700">Platform insights and reports</p>
        </button>

        <button
          onClick={() => router.push('/admin/settings')}
          className="p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 text-left transition-colors"
        >
          <Settings className="w-6 h-6 text-orange-600 mb-2" />
          <h5 className="font-medium text-orange-900">System Settings</h5>
          <p className="text-sm text-orange-700">Configure platform settings</p>
        </button>
      </div>

      {/* Recent Activity and Top Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
              <button
                onClick={onRefresh}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.slice(0, 5).map((activity: any, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${getActivityColor(activity.type)}`}>
                    <div className="flex items-start space-x-3">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{activity.message}</p>
                        <p className="text-xs text-slate-600">{new Date(activity.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Courses */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Top Performing Courses</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topCourses && topCourses.length > 0 ? (
                topCourses.slice(0, 5).map((course: any, index) => (
                  <div key={course.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">{course.title}</h4>
                        <p className="text-sm text-slate-600">{course.enrollmentCount} students</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-900">{course.completionRate}%</div>
                      <div className="text-xs text-slate-600">completion</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No courses available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Recent Users</h3>
            <button
              onClick={() => router.push('/admin/users')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {recentUsers && recentUsers.length > 0 ? (
                  recentUsers.slice(0, 5).map((user: any) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mr-4">
                            <Users className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{user.name}</div>
                            <div className="text-sm text-slate-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'TUTOR' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No users found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
