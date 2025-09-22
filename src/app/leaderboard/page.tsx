"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Trophy, Medal, Crown, Star, TrendingUp, Users } from 'lucide-react';

export default function LeaderboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [leaderboardData, setLeaderboardData] = useState({
    weekly: [
      { id: 1, name: 'Alice Johnson', points: 1250, streak: 12, avatar: null, rank: 1 },
      { id: 2, name: 'Bob Smith', points: 1180, streak: 10, avatar: null, rank: 2 },
      { id: 3, name: 'Carol Davis', points: 1100, streak: 9, avatar: null, rank: 3 },
      { id: 4, name: 'David Wilson', points: 980, streak: 8, avatar: null, rank: 4 },
      { id: 5, name: 'Eva Brown', points: 920, streak: 7, avatar: null, rank: 5 },
    ],
    monthly: [
      { id: 1, name: 'Alice Johnson', points: 4800, streak: 15, avatar: null, rank: 1 },
      { id: 2, name: 'Bob Smith', points: 4500, streak: 14, avatar: null, rank: 2 },
      { id: 3, name: 'Carol Davis', points: 4200, streak: 13, avatar: null, rank: 3 },
      { id: 4, name: 'David Wilson', points: 3900, streak: 12, avatar: null, rank: 4 },
      { id: 5, name: 'Eva Brown', points: 3600, streak: 11, avatar: null, rank: 5 },
    ],
    allTime: [
      { id: 1, name: 'Alice Johnson', points: 15600, streak: 25, avatar: null, rank: 1 },
      { id: 2, name: 'Bob Smith', points: 14200, streak: 23, avatar: null, rank: 2 },
      { id: 3, name: 'Carol Davis', points: 13800, streak: 22, avatar: null, rank: 3 },
      { id: 4, name: 'David Wilson', points: 12500, streak: 20, avatar: null, rank: 4 },
      { id: 5, name: 'Eva Brown', points: 11800, streak: 19, avatar: null, rank: 5 },
    ]
  });
  const [activeTab, setActiveTab] = useState('weekly');

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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-500 to-amber-700 text-white';
      default:
        return 'bg-white text-gray-900';
    }
  };

  const currentData = leaderboardData[activeTab as keyof typeof leaderboardData];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Trophy className="w-8 h-8 mr-3 text-yellow-500" />
            Leaderboard
          </h1>
          <p className="text-gray-600">Compete with other students and climb the rankings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Your Rank</p>
                <p className="text-2xl font-bold text-gray-900">#8</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <Star className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Your Points</p>
                <p className="text-2xl font-bold text-gray-900">850</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'weekly', label: 'This Week' },
                { id: 'monthly', label: 'This Month' },
                { id: 'allTime', label: 'All Time' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Leaderboard Content */}
          <div className="p-6">
            <div className="space-y-4">
              {currentData.map((student, index) => (
                <div
                  key={student.id}
                  className={`flex items-center space-x-4 p-4 rounded-lg ${getRankColor(student.rank)}`}
                >
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(student.rank)}
                  </div>
                  
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                    {student.avatar ? (
                      <img 
                        src={student.avatar} 
                        alt={student.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-gray-600">
                        {student.name.charAt(0)}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold">{student.name}</h3>
                    <p className="text-sm opacity-75">{student.streak} day streak</p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold">{student.points.toLocaleString()}</p>
                    <p className="text-sm opacity-75">points</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievement Badges</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Top Performer', description: 'Rank in top 10', earned: true },
              { name: 'Streak Master', description: '15+ day streak', earned: false },
              { name: 'Point Collector', description: '1000+ points', earned: true },
              { name: 'Consistent Learner', description: 'Study 30+ days', earned: false }
            ].map((badge, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg text-center ${
                  badge.earned ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                  badge.earned ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  <Trophy className={`w-6 h-6 ${badge.earned ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <h4 className={`font-semibold text-sm ${badge.earned ? 'text-green-800' : 'text-gray-600'}`}>
                  {badge.name}
                </h4>
                <p className={`text-xs ${badge.earned ? 'text-green-600' : 'text-gray-500'}`}>
                  {badge.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
