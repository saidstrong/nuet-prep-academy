"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Trophy,
  Star,
  Award,
  TrendingUp,
  Target,
  Clock,
  Users,
  Medal,
  Crown,
  Zap,
  BookOpen,
  CheckCircle,
  PlayCircle,
  BarChart3,
  Calendar,
  Flame
} from 'lucide-react';

interface UserPoints {
  id: string;
  points: number;
  level: number;
  experience: number;
  streak: number;
  lastLogin: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
}

interface UserBadge {
  id: string;
  earnedAt: string;
  badge: Badge;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
}

interface UserAchievement {
  id: string;
  earnedAt: string;
  achievement: Achievement;
}

interface PointTransaction {
  id: string;
  points: number;
  reason: string;
  category: string;
  createdAt: string;
}

interface LeaderboardEntry {
  id: string;
  rank: number;
  score: number;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface GamificationData {
  points: UserPoints;
  badges: UserBadge[];
  achievements: UserAchievement[];
  recentTransactions: PointTransaction[];
  leaderboards: {
    points: LeaderboardEntry[];
    courseCompletion: LeaderboardEntry[];
    testScores: LeaderboardEntry[];
    studyTime: LeaderboardEntry[];
    streak: LeaderboardEntry[];
  };
}

export default function GamificationDashboard() {
  const { data: session } = useSession();
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'achievements' | 'leaderboards'>('overview');

  useEffect(() => {
    if (session?.user?.id) {
      fetchGamificationData();
    }
  }, [session]);

  const fetchGamificationData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/gamification/profile');
      if (response.ok) {
        const data = await response.json();
        setGamificationData(data);
      }
    } catch (error) {
      console.error('Error fetching gamification data:', error);
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

  if (!gamificationData) {
    return (
      <div className="text-center py-8">
        <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600">No gamification data available</p>
      </div>
    );
  }

  const { points, badges, achievements, recentTransactions, leaderboards } = gamificationData;
  const nextLevelExp = (points.level * 1000) - points.experience;
  const progressToNextLevel = ((points.experience % 1000) / 1000) * 100;

  const getBadgeIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      trophy: Trophy,
      star: Star,
      award: Award,
      crown: Crown,
      zap: Zap,
      fire: Flame,
      book: BookOpen,
      check: CheckCircle,
      play: PlayCircle,
      chart: BarChart3,
      calendar: Calendar,
      flame: Flame
    };
    return iconMap[iconName.toLowerCase()] || Trophy;
  };

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      COURSE_COMPLETION: 'bg-blue-100 text-blue-800',
      TEST_PERFORMANCE: 'bg-green-100 text-green-800',
      STUDY_TIME: 'bg-purple-100 text-purple-800',
      STREAK: 'bg-orange-100 text-orange-800',
      SOCIAL: 'bg-pink-100 text-pink-800',
      SPECIAL: 'bg-indigo-100 text-indigo-800'
    };
    return colorMap[category] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Gamification Dashboard</h2>
        <div className="flex space-x-2">
          {(['overview', 'badges', 'achievements', 'leaderboards'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Points</p>
                  <p className="text-2xl font-bold text-slate-900">{points.points.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Level</p>
                  <p className="text-2xl font-bold text-slate-900">{points.level}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Experience</p>
                  <p className="text-2xl font-bold text-slate-900">{points.experience.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Flame className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Streak</p>
                  <p className="text-2xl font-bold text-slate-900">{points.streak} days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Level Progress</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Level {points.level}</span>
                <span className="text-sm text-slate-500">{points.experience % 1000} / 1000 XP</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div 
                  className="bg-primary h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${progressToNextLevel}%` }}
                />
              </div>
              <p className="text-sm text-slate-600">
                {nextLevelExp} XP needed for Level {points.level + 1}
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentTransactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      transaction.points > 0 ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm text-slate-700">{transaction.reason}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${
                      transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.points > 0 ? '+' : ''}{transaction.points}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Badges</h3>
            {badges.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No badges earned yet</p>
                <p className="text-sm text-slate-500">Complete courses, tests, and study to earn badges!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((userBadge) => {
                  const IconComponent = getBadgeIcon(userBadge.badge.icon);
                  return (
                    <div key={userBadge.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">{userBadge.badge.name}</h4>
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(userBadge.badge.category)}`}>
                            {userBadge.badge.category.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{userBadge.badge.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-primary">+{userBadge.badge.points} pts</span>
                        <span className="text-xs text-slate-500">
                          {new Date(userBadge.earnedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Achievements</h3>
            {achievements.length === 0 ? (
              <div className="text-center py-8">
                <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No achievements unlocked yet</p>
                <p className="text-sm text-slate-500">Keep learning and progressing to unlock achievements!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((userAchievement) => {
                  const IconComponent = getBadgeIcon(userAchievement.achievement.icon);
                  return (
                    <div key={userAchievement.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <IconComponent className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">{userAchievement.achievement.name}</h4>
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(userAchievement.achievement.category)}`}>
                            {userAchievement.achievement.category.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{userAchievement.achievement.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-600">+{userAchievement.achievement.points} pts</span>
                        <span className="text-xs text-slate-500">
                          {new Date(userAchievement.earnedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leaderboards Tab */}
      {activeTab === 'leaderboards' && (
        <div className="space-y-6">
          {/* Points Leaderboard */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Points Leaderboard</h3>
            <div className="space-y-3">
              {leaderboards.points.slice(0, 10).map((entry, index) => (
                <div key={entry.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100">
                      {index === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                      {index === 1 && <Medal className="w-4 h-4 text-slate-400" />}
                      {index === 2 && <Medal className="w-4 h-4 text-amber-600" />}
                      {index > 2 && <span className="text-sm font-medium text-slate-600">{index + 1}</span>}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{entry.user.name}</p>
                      <p className="text-sm text-slate-500">{entry.user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{entry.score.toLocaleString()}</p>
                    <p className="text-sm text-slate-500">points</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Course Completion Leaderboard */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Course Completion Leaderboard</h3>
            <div className="space-y-3">
              {leaderboards.courseCompletion.slice(0, 10).map((entry, index) => (
                <div key={entry.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100">
                      {index === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                      {index === 1 && <Medal className="w-4 h-4 text-slate-400" />}
                      {index === 2 && <Medal className="w-4 h-4 text-amber-600" />}
                      {index > 2 && <span className="text-sm font-medium text-slate-600">{index + 1}</span>}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{entry.user.name}</p>
                      <p className="text-sm text-slate-500">{entry.user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{entry.score}</p>
                    <p className="text-sm text-slate-500">courses</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Streak Leaderboard */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Daily Streak Leaderboard</h3>
            <div className="space-y-3">
              {leaderboards.streak.slice(0, 10).map((entry, index) => (
                <div key={entry.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100">
                      {index === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                      {index === 1 && <Medal className="w-4 h-4 text-slate-400" />}
                      {index === 2 && <Medal className="w-4 h-4 text-amber-600" />}
                      {index > 2 && <span className="text-sm font-medium text-slate-600">{index + 1}</span>}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{entry.user.name}</p>
                      <p className="text-sm text-slate-500">{entry.user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{entry.score}</p>
                    <p className="text-sm text-slate-500">days</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
