"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Target, 
  Trophy, 
  BookOpen,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface ProgressData {
  courseId: string;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  totalTime: number; // in minutes
  completedTime: number; // in minutes
  currentStreak: number; // days
  longestStreak: number; // days
  lastActivity: string;
  completionRate: number;
  estimatedCompletion: string;
  achievements: Achievement[];
  weeklyProgress: WeeklyProgress[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
  points: number;
}

interface WeeklyProgress {
  week: string;
  lessonsCompleted: number;
  timeSpent: number;
  streak: number;
}

interface ProgressTrackerProps {
  courseId: string;
  onProgressUpdate?: (progress: ProgressData) => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  courseId,
  onProgressUpdate
}) => {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, [courseId]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${courseId}/progress`);
      const data = await response.json();
      
      if (data.success) {
        setProgress(data.progress);
        onProgressUpdate?.(data.progress);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    if (rate >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 7) return 'text-green-600';
    if (streak >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <LoadingSpinner text="Loading progress..." />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!progress) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-slate-600">No progress data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Course Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">
                Overall Progress
              </span>
              <span className={`text-sm font-bold ${getProgressColor(progress.completionRate)}`}>
                {progress.completionRate}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress.completionRate}%` }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {progress.completedLessons}/{progress.totalLessons}
              </div>
              <div className="text-sm text-slate-600">Lessons</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatTime(progress.completedTime)}
              </div>
              <div className="text-sm text-slate-600">Time Spent</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getStreakColor(progress.currentStreak)}`}>
                {progress.currentStreak}
              </div>
              <div className="text-sm text-slate-600">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {progress.achievements?.length || 0}
              </div>
              <div className="text-sm text-slate-600">Achievements</div>
            </div>
          </div>

          {/* Lesson Progress */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900">Lesson Progress</h4>
            <div className="space-y-2">
              {Array.from({ length: progress.totalLessons }).map((_, index) => {
                const isCompleted = index < progress.completedLessons;
                const isCurrent = index === progress.completedLessons;
                
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : isCurrent ? (
                        <Circle className="w-5 h-5 text-blue-500 fill-current" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-900">
                        Lesson {index + 1}
                      </div>
                      <div className="text-xs text-slate-500">
                        {isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Not started'}
                      </div>
                    </div>
                    {isCurrent && (
                      <Badge variant="secondary" className="text-xs">
                        Next
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      {progress.achievements && progress.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {progress.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200"
                >
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">
                      {achievement.title}
                    </div>
                    <div className="text-sm text-slate-600">
                      {achievement.description}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    +{achievement.points} pts
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Progress Chart */}
      {progress.weeklyProgress && progress.weeklyProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Weekly Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {progress.weeklyProgress.map((week, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div>
                    <div className="font-medium text-slate-900">{week.week}</div>
                    <div className="text-sm text-slate-600">
                      {week.lessonsCompleted} lessons • {formatTime(week.timeSpent)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-900">
                        {week.streak} day streak
                      </div>
                      <div className="text-xs text-slate-500">Best this week</div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">
                        {week.lessonsCompleted}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Next Steps</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <div>
                <div className="font-medium text-slate-900">
                  Continue with Lesson {progress.completedLessons + 1}
                </div>
                <div className="text-sm text-slate-600">
                  You're making great progress! Keep it up.
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-green-500" />
              <div>
                <div className="font-medium text-slate-900">
                  Estimated completion: {progress.estimatedCompletion}
                </div>
                <div className="text-sm text-slate-600">
                  Based on your current pace
                </div>
              </div>
            </div>
            <div className="pt-3">
              <Button className="w-full">
                Continue Learning
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressTracker;
