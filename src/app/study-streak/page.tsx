"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Calendar, Flame, Trophy, Target, Clock, BookOpen } from 'lucide-react';

export default function StudyStreakPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [streakData, setStreakData] = useState({
    currentStreak: 7,
    longestStreak: 15,
    totalStudyTime: 45,
    weeklyGoal: 20,
    achievements: [
      { id: 1, title: 'First Week', description: 'Study for 7 consecutive days', earned: true },
      { id: 2, title: 'Dedicated Learner', description: 'Study for 30+ hours', earned: true },
      { id: 3, title: 'Perfect Week', description: 'Complete all weekly goals', earned: false }
    ]
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'STUDENT') {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Streak</h1>
          <p className="text-gray-600">Track your learning progress and maintain your study momentum</p>
        </div>

        {/* Current Streak Card */}
        <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Current Streak</h2>
              <div className="flex items-center space-x-2">
                <Flame className="w-8 h-8" />
                <span className="text-4xl font-bold">{streakData.currentStreak}</span>
                <span className="text-lg">days</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-orange-100">Longest Streak</p>
              <p className="text-2xl font-bold">{streakData.longestStreak} days</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Study Time</p>
                <p className="text-2xl font-bold text-gray-900">{streakData.totalStudyTime}h</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Weekly Goal</p>
                <p className="text-2xl font-bold text-gray-900">{streakData.weeklyGoal}h</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <Trophy className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Achievements</p>
                <p className="text-2xl font-bold text-gray-900">
                  {streakData.achievements.filter(a => a.earned).length}/{streakData.achievements.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Study Calendar
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 30 }, (_, i) => (
              <div
                key={i}
                className={`h-8 rounded flex items-center justify-center text-sm ${
                  i < streakData.currentStreak
                    ? 'bg-green-500 text-white'
                    : i === streakData.currentStreak
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2" />
            Achievements
          </h3>
          <div className="space-y-4">
            {streakData.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`flex items-center space-x-4 p-4 rounded-lg ${
                  achievement.earned ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  achievement.earned ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  <Trophy className={`w-6 h-6 ${achievement.earned ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold ${achievement.earned ? 'text-green-800' : 'text-gray-600'}`}>
                    {achievement.title}
                  </h4>
                  <p className={`text-sm ${achievement.earned ? 'text-green-600' : 'text-gray-500'}`}>
                    {achievement.description}
                  </p>
                </div>
                {achievement.earned && (
                  <span className="text-green-600 font-semibold">✓ Earned</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Study Tips */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Study Tips
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li>• Study at the same time each day to build a habit</li>
            <li>• Break your study sessions into manageable chunks</li>
            <li>• Take short breaks between study sessions</li>
            <li>• Set realistic daily goals to maintain your streak</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
