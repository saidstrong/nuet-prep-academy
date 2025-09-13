"use client";
import { useState, useEffect } from 'react';
import {
  TrendingUp, Users, BookOpen, DollarSign, Target, Calendar,
  BarChart3, PieChart, Activity, Star, Clock, Award, Brain,
  Zap, Trophy, Crown, Shield, Eye, Download, RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    monthlyRevenue: number;
    totalUsers: number;
    activeUsers: number;
    totalCourses: number;
    courseCompletions: number;
    averageRating: number;
    totalHours: number;
  };
  revenue: {
    monthly: Array<{ month: string; revenue: number }>;
    daily: Array<{ date: string; revenue: number }>;
  };
  users: {
    growth: Array<{ month: string; users: number }>;
    byRole: Array<{ role: string; count: number }>;
    activity: Array<{ date: string; active: number }>;
  };
  courses: {
    topPerforming: Array<{
      id: string;
      title: string;
      enrollments: number;
      completions: number;
      revenue: number;
      rating: number;
    }>;
    completionRates: Array<{
      courseId: string;
      title: string;
      rate: number;
    }>;
  };
  engagement: {
    dailyActiveUsers: Array<{ date: string; users: number }>;
    sessionDuration: number;
    pageViews: Array<{ page: string; views: number }>;
  };
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'users' | 'courses' | 'engagement'>('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`, { 
        credentials: 'include' 
      });
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
        <p className="text-gray-600">Analytics data will appear here once you have some activity.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Analytics Dashboard</h3>
          <p className="text-sm text-slate-600">Platform insights and performance metrics</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'revenue', label: 'Revenue', icon: DollarSign },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'courses', label: 'Courses', icon: BookOpen },
          { id: 'engagement', label: 'Engagement', icon: Activity }
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
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(analytics.overview.totalRevenue)}</p>
                  <p className="text-sm text-green-600">+{formatCurrency(analytics.overview.monthlyRevenue)} this month</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <Users className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Users</p>
                  <p className="text-2xl font-bold text-slate-900">{formatNumber(analytics.overview.totalUsers)}</p>
                  <p className="text-sm text-blue-600">{formatNumber(analytics.overview.activeUsers)} active</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Courses</p>
                  <p className="text-2xl font-bold text-slate-900">{formatNumber(analytics.overview.totalCourses)}</p>
                  <p className="text-sm text-purple-600">{formatNumber(analytics.overview.courseCompletions)} completions</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                  <Star className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Average Rating</p>
                  <p className="text-2xl font-bold text-slate-900">{analytics.overview.averageRating.toFixed(1)}</p>
                  <p className="text-sm text-orange-600">{formatNumber(analytics.overview.totalHours)} hours watched</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h4 className="text-lg font-semibold text-slate-900 mb-4">Revenue Trend</h4>
              <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600">Revenue chart will be implemented here</p>
                </div>
              </div>
            </div>

            {/* User Growth Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h4 className="text-lg font-semibold text-slate-900 mb-4">User Growth</h4>
              <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600">User growth chart will be implemented here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h4 className="text-lg font-semibold text-slate-900 mb-4">Monthly Revenue</h4>
              <div className="space-y-3">
                {analytics.revenue.monthly.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{item.month}</span>
                    <span className="text-sm font-medium text-slate-900">{formatCurrency(item.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h4 className="text-lg font-semibold text-slate-900 mb-4">Daily Revenue</h4>
              <div className="space-y-3">
                {analytics.revenue.daily.slice(-7).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{item.date}</span>
                    <span className="text-sm font-medium text-slate-900">{formatCurrency(item.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h4 className="text-lg font-semibold text-slate-900 mb-4">Users by Role</h4>
              <div className="space-y-3">
                {analytics.users.byRole.map((role, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{role.role}</span>
                    <span className="text-sm font-medium text-slate-900">{formatNumber(role.count)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h4 className="text-lg font-semibold text-slate-900 mb-4">User Activity</h4>
              <div className="space-y-3">
                {analytics.users.activity.slice(-7).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{item.date}</span>
                    <span className="text-sm font-medium text-slate-900">{formatNumber(item.active)} active</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h4 className="text-lg font-semibold text-slate-900">Top Performing Courses</h4>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics.courses.topPerforming.map((course, index) => (
                  <div key={course.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <h5 className="font-medium text-slate-900">{course.title}</h5>
                        <p className="text-sm text-slate-600">{formatNumber(course.enrollments)} enrollments</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-900">{formatCurrency(course.revenue)}</div>
                      <div className="text-sm text-slate-600">{course.rating.toFixed(1)} ⭐</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'engagement' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h4 className="text-lg font-semibold text-slate-900 mb-4">Daily Active Users</h4>
              <div className="space-y-3">
                {analytics.engagement.dailyActiveUsers.slice(-7).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{item.date}</span>
                    <span className="text-sm font-medium text-slate-900">{formatNumber(item.users)} users</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h4 className="text-lg font-semibold text-slate-900 mb-4">Page Views</h4>
              <div className="space-y-3">
                {analytics.engagement.pageViews.map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{page.page}</span>
                    <span className="text-sm font-medium text-slate-900">{formatNumber(page.views)} views</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Engagement Metrics</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{analytics.engagement.sessionDuration}min</div>
                <div className="text-sm text-slate-600">Avg Session Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{formatNumber(analytics.overview.activeUsers)}</div>
                <div className="text-sm text-slate-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{analytics.overview.averageRating.toFixed(1)}</div>
                <div className="text-sm text-slate-600">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
