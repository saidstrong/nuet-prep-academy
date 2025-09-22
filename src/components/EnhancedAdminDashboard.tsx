"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  BarChart3, Users, BookOpen, Settings, Shield, TrendingUp, 
  Activity, Target, Calendar, MessageCircle, Eye, Plus,
  Search, Filter, Download, RefreshCw, Bell, Crown, Zap
} from 'lucide-react';
import AdminOverview from './admin/AdminOverview';
import AdminCourseManagement from './admin/AdminCourseManagement';
import AdminUserManagement from './admin/AdminUserManagement';
import AdminAnalytics from './admin/AdminAnalytics';
import AdminSystemSettings from './admin/AdminSystemSettings';
import EnrollmentRequestManagement from './admin/EnrollmentRequestManagement';

export default function EnhancedAdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'users' | 'enrollment' | 'analytics' | 'settings'>('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalTutors: 0,
    totalStudents: 0,
    activeUsers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    courseCompletions: 0
  });

  useEffect(() => {
    if (session) {
      fetchAdminStats();
    }
  }, [session]);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-purple-100">Welcome back, {session?.user?.name}! Manage your platform.</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
            <p className="text-purple-100">Total Users</p>
          </div>
        </div>
      </div>

      {/* Quick Stats - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-slate-600">Total Users</p>
              <p className="text-xl font-bold text-slate-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-slate-600">Courses</p>
              <p className="text-xl font-bold text-slate-900">{stats.totalCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-slate-600">Revenue</p>
              <p className="text-xl font-bold text-slate-900">${stats.totalRevenue}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-slate-600">Active Users</p>
              <p className="text-xl font-bold text-slate-900">{stats.activeUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Tabs */}
      <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'courses', label: 'Courses', icon: BookOpen },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'enrollment', label: 'Enrollment', icon: MessageCircle },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <AdminOverview stats={stats} onRefresh={fetchAdminStats} />}
      {activeTab === 'courses' && <AdminCourseManagement />}
      {activeTab === 'users' && <AdminUserManagement />}
      {activeTab === 'enrollment' && <EnrollmentRequestManagement />}
      {activeTab === 'analytics' && <AdminAnalytics />}
      {activeTab === 'settings' && <AdminSystemSettings />}
    </div>
  );
}
