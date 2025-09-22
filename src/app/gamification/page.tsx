"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Trophy, Star, Target, Flame, Award, TrendingUp, Users, BookOpen } from 'lucide-react';

export default function GamificationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [gamificationData, setGamificationData] = useState({
    userStats: {
      level: 12,
      xp: 2450,
      xpToNext: 500,
      totalPoints: 12500,
      streak: 7,
      badges: 8,
      rank: 15
    },
    achievements: [
      { id: 1, title: 'First Steps', description: 'Complete your first course', earned: true, points: 100 },
      { id: 2, title: 'Quiz Master', description: 'Score 90%+ on 10 quizzes', earned: true, points: 250 },
      { id: 3, title: 'Streak Champion', description: 'Study for 15 consecutive days', earned: false, points: 500 },
      { id: 4, title: 'Knowledge Seeker', description: 'Complete 5 courses', earned: true, points: 300 },
      { id: 5, title: 'Early Bird', description: 'Study before 8 AM for 7 days', earned: false, points: 200 },
      { id: 6, title: 'Night Owl', description: 'Study after 10 PM for 7 days', earned: false, points: 200 }
    ],
    leaderboard: [
      { rank: 1, name: 'Alice Johnson', level: 25, points: 15600 },
      { rank: 2, name: 'Bob Smith', level: 23, points: 14200 },
      { rank: 3, name: 'Carol Davis', level: 22, points: 13800 },
      { rank: 4, name: 'David Wilson', level: 20, points: 12500 },
      { rank: 5, name: 'Eva Brown', level: 19, points: 11800 }
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

  const getLevelProgress = () => {
    return (gamificationData.userStats.xp / (gamificationData.userStats.xp + gamificationData.userStats.xpToNext)) * 100;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Trophy className="w-8 h-8 mr-3 text-yellow-500" />
            Gamification Hub
          </h1>
          <p className="text-gray-600">Track your progress, earn achievements, and compete with others</p>
        </div>

        {/* User Stats Overview */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Level {gamificationData.userStats.level}</h2>
              <p className="text-blue-100">Keep learning to level up!</p>
            </div>
            <div className="text-right">
              <p className="text-blue-100">Rank</p>
              <p className="text-3xl font-bold">#{gamificationData.userStats.rank}</p>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>{gamificationData.userStats.xp} XP</span>
              <span>{gamificationData.userStats.xp + gamificationData.userStats.xpToNext} XP</span>
            </div>
            <div className="w-full bg-blue-800 rounded-full h-3">
              <div
                className="bg-white h-3 rounded-full transition-all duration-300"
                style={{ width: `${getLevelProgress()}%` }}
              ></div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{gamificationData.userStats.totalPoints.toLocaleString()}</p>
              <p className="text-blue-100 text-sm">Total Points</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{gamificationData.userStats.streak}</p>
              <p className="text-blue-100 text-sm">Day Streak</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{gamificationData.userStats.badges}</p>
              <p className="text-blue-100 text-sm">Badges</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <Flame className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900">{gamificationData.userStats.streak}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <Award className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Achievements</p>
                <p className="text-2xl font-bold text-gray-900">
                  {gamificationData.achievements.filter(a => a.earned).length}/{gamificationData.achievements.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <Star className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Total Points</p>
                <p className="text-2xl font-bold text-gray-900">{gamificationData.userStats.totalPoints.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Global Rank</p>
                <p className="text-2xl font-bold text-gray-900">#{gamificationData.userStats.rank}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Achievements */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Achievements
            </h3>
            <div className="space-y-4">
              {gamificationData.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`flex items-center space-x-4 p-4 rounded-lg ${
                    achievement.earned ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    achievement.earned ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    <Award className={`w-6 h-6 ${achievement.earned ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${achievement.earned ? 'text-green-800' : 'text-gray-600'}`}>
                      {achievement.title}
                    </h4>
                    <p className={`text-sm ${achievement.earned ? 'text-green-600' : 'text-gray-500'}`}>
                      {achievement.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${achievement.earned ? 'text-green-600' : 'text-gray-500'}`}>
                      {achievement.points} pts
                    </p>
                    {achievement.earned && (
                      <span className="text-green-600 text-sm">✓ Earned</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              Top Performers
            </h3>
            <div className="space-y-3">
              {gamificationData.leaderboard.map((player) => (
                <div
                  key={player.rank}
                  className={`flex items-center space-x-4 p-3 rounded-lg ${
                    player.rank <= 3 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center w-8">
                    {player.rank === 1 ? (
                      <Trophy className="w-6 h-6 text-yellow-500" />
                    ) : player.rank === 2 ? (
                      <Trophy className="w-6 h-6 text-gray-400" />
                    ) : player.rank === 3 ? (
                      <Trophy className="w-6 h-6 text-amber-600" />
                    ) : (
                      <span className="text-gray-500 font-bold">#{player.rank}</span>
                    )}
                  </div>
                  
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-600">
                      {player.name.charAt(0)}
                    </span>
                  </div>

                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{player.name}</h4>
                    <p className="text-sm text-gray-500">Level {player.level}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{player.points.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">points</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gamification Tips */}
        <div className="mt-8 bg-purple-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Gamification Tips
          </h3>
          <ul className="space-y-2 text-purple-800">
            <li>• Complete daily challenges to earn bonus XP</li>
            <li>• Maintain your study streak to unlock special rewards</li>
            <li>• Participate in leaderboards to compete with other students</li>
            <li>• Collect achievements to showcase your learning journey</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
