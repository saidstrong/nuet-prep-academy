"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  TrendingUp, Calendar, Clock, BookOpen, Target, BarChart3,
  Activity, Zap, Flame, Star, Trophy, Award, CheckCircle,
  ArrowUp, ArrowDown, Minus
} from 'lucide-react';

interface ProgressData {
  weeklyProgress: {
    date: string;
    points: number;
    studyTime: number;
    testsTaken: number;
    materialsCompleted: number;
  }[];
  monthlyStats: {
    totalPoints: number;
    totalStudyTime: number;
    testsTaken: number;
    materialsCompleted: number;
    averageScore: number;
    streakDays: number;
  };
  goals: {
    id: string;
    title: string;
    target: number;
    current: number;
    unit: string;
    deadline: string;
    completed: boolean;
  }[];
  achievements: {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: string;
    points: number;
  }[];
}

export default function ProgressTracking() {
  const { data: session } = useSession();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    if (session) {
      fetchProgressData();
    }
  }, [session, selectedPeriod]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/gamification/progress?period=${selectedPeriod}`);
      if (response.ok) {
        const data = await response.json();
        setProgressData(data);
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600">No progress data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Progress Tracking</h3>
        <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm border border-slate-200">
          {[
            { id: 'week', label: 'Week' },
            { id: 'month', label: 'Month' },
            { id: 'year', label: 'Year' }
          ].map((period) => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period.id as any)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === period.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Monthly Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Points</p>
              <p className="text-2xl font-bold text-slate-900">
                {progressData.monthlyStats.totalPoints.toLocaleString()}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <ArrowUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+12%</span>
              <span className="text-slate-600 ml-1">from last month</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Study Time</p>
              <p className="text-2xl font-bold text-slate-900">
                {Math.round(progressData.monthlyStats.totalStudyTime / 60)}h
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <ArrowUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+8%</span>
              <span className="text-slate-600 ml-1">from last month</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Average Score</p>
              <p className="text-2xl font-bold text-slate-900">
                {progressData.monthlyStats.averageScore}%
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <ArrowUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+5%</span>
              <span className="text-slate-600 ml-1">from last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h4 className="text-lg font-semibold text-slate-900">Weekly Progress</h4>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {progressData.weeklyProgress.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 text-sm text-slate-600">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm font-medium text-slate-900">
                      {day.points} points
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-slate-600">
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {Math.round(day.studyTime / 60)}m
                  </span>
                  <span className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    {day.materialsCompleted}
                  </span>
                  <span className="flex items-center">
                    <Target className="w-4 h-4 mr-1" />
                    {day.testsTaken}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Goals Tracking */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h4 className="text-lg font-semibold text-slate-900">Learning Goals</h4>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {progressData.goals.map((goal) => {
              const percentage = getProgressPercentage(goal.current, goal.target);
              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {goal.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Target className="w-5 h-5 text-slate-400" />
                      )}
                      <div>
                        <h5 className="font-medium text-slate-900">{goal.title}</h5>
                        <p className="text-sm text-slate-600">
                          {goal.current} / {goal.target} {goal.unit}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${getProgressColor(percentage)}`}>
                        {Math.round(percentage)}%
                      </p>
                      <p className="text-xs text-slate-500">
                        Due: {new Date(goal.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(percentage)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h4 className="text-lg font-semibold text-slate-900">Recent Achievements</h4>
        </div>
        <div className="p-6">
          {progressData.achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {progressData.achievements.slice(0, 6).map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-slate-900">{achievement.name}</h5>
                    <p className="text-sm text-slate-600">{achievement.description}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">+{achievement.points}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-600 text-center py-4">No achievements unlocked yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
