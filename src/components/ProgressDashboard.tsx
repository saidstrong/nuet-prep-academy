"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  Target, 
  TrendingUp, 
  Award,
  Calendar,
  BarChart3,
  CheckCircle,
  PlayCircle
} from 'lucide-react';

interface CourseProgress {
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  enrollmentDate: string;
  completionPercentage: number;
  totalMaterials: number;
  completedMaterials: number;
  totalTests: number;
  completedTests: number;
  totalTimeSpent: number;
  averageTestScore: number;
  estimatedTimeRemaining: number;
  lastActivity: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED';
}

interface ProgressData {
  courses: CourseProgress[];
  overall: {
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    totalTimeSpent: number;
    averageCompletion: number;
  };
}

export default function ProgressDashboard() {
  const { data: session } = useSession();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!session?.user) return;
      
      try {
        setLoading(true);
        const response = await fetch('/api/progress');
        const data = await response.json();
        
        if (data.success) {
          setProgressData(data.progress);
        } else {
          setError(data.error || 'Failed to fetch progress data');
        }
      } catch (error) {
        console.error('Failed to fetch progress:', error);
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [session]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-100';
      case 'NOT_STARTED': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'IN_PROGRESS': return <PlayCircle className="w-4 h-4" />;
      case 'NOT_STARTED': return <Target className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getMilestoneBadges = (course: CourseProgress) => {
    const badges = [];
    
    if (course.completionPercentage >= 25) {
      badges.push({ name: 'Getting Started', icon: '🎯', color: 'bg-blue-100 text-blue-800' });
    }
    if (course.completionPercentage >= 50) {
      badges.push({ name: 'Halfway There', icon: '⚡', color: 'bg-yellow-100 text-yellow-800' });
    }
    if (course.completionPercentage >= 75) {
      badges.push({ name: 'Almost Done', icon: '🔥', color: 'bg-orange-100 text-orange-800' });
    }
    if (course.completionPercentage === 100) {
      badges.push({ name: 'Course Master', icon: '🏆', color: 'bg-green-100 text-green-800' });
    }
    if (course.averageTestScore >= 90) {
      badges.push({ name: 'Test Ace', icon: '🎓', color: 'bg-purple-100 text-purple-800' });
    }
    
    return badges;
  };

  if (!session) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          Please sign in to view your progress.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-red-600">
          {error}
        </div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          No progress data available.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Learning Overview
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Courses</p>
                <p className="text-2xl font-bold text-blue-900">{progressData.overall.totalCourses}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-900">{progressData.overall.completedCourses}</p>
              </div>
              <Trophy className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-900">{progressData.overall.inProgressCourses}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Study Time</p>
                <p className="text-2xl font-bold text-purple-900">{formatTime(progressData.overall.totalTimeSpent)}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-medium text-gray-700">{progressData.overall.averageCompletion}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressData.overall.averageCompletion}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Course Progress Cards */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Course Progress
        </h3>
        
        {progressData.courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No courses enrolled yet.</p>
            <p className="text-sm text-gray-400 mt-2">Enroll in courses to start tracking your progress!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {progressData.courses.map((course) => (
              <div key={course.courseId} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">{course.courseTitle}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{course.courseDescription}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                    {getStatusIcon(course.status)}
                    {course.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm font-medium text-gray-700">{course.completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${course.completionPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Course Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{course.completedMaterials}</p>
                    <p className="text-xs text-gray-600">of {course.totalMaterials} materials</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{course.completedTests}</p>
                    <p className="text-xs text-gray-600">of {course.totalTests} tests</p>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(course.totalTimeSpent)} studied</span>
                  </div>
                  {course.averageTestScore > 0 && (
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      <span>{course.averageTestScore}% avg score</span>
                    </div>
                  )}
                </div>

                {/* Milestone Badges */}
                {getMilestoneBadges(course).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {getMilestoneBadges(course).map((badge, index) => (
                      <span 
                        key={index}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}
                      >
                        <span>{badge.icon}</span>
                        {badge.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
