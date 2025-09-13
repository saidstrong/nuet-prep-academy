"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Trophy, 
  Medal, 
  Crown,
  Star,
  Users,
  Calendar,
  Flame,
  TrendingUp,
  Award,
  Share2,
  Filter
} from 'lucide-react';

interface LeaderboardStudent {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  currentStreak: number;
  longestStreak: number;
  weeklyStudyDays: number;
  monthlyStudyDays: number;
  totalStudyDays: number;
  rankingScore: number;
  rank: number;
  isCurrentUser: boolean;
}

interface LeaderboardData {
  period: string;
  students: LeaderboardStudent[];
  currentUserPosition: number | null;
  totalStudents: number;
  currentUser: LeaderboardStudent | null;
}

export default function StreakLeaderboard() {
  const { data: session } = useSession();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const periods = [
    { value: 'all', label: 'Current Streak', icon: Flame },
    { value: 'week', label: 'This Week', icon: Calendar },
    { value: 'month', label: 'This Month', icon: TrendingUp }
  ];

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!session?.user) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/streak-leaderboard?period=${selectedPeriod}&limit=20`);
        const data = await response.json();
        
        if (data.success) {
          setLeaderboardData(data.leaderboard);
        } else {
          setError(data.error || 'Failed to fetch leaderboard data');
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [session, selectedPeriod]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600">{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2: return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3: return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
      default: return 'bg-white border-gray-200';
    }
  };

  const getScoreLabel = (period: string) => {
    switch (period) {
      case 'week': return 'Study Days';
      case 'month': return 'Study Days';
      default: return 'Day Streak';
    }
  };

  const getScoreValue = (student: LeaderboardStudent, period: string) => {
    switch (period) {
      case 'week': return student.weeklyStudyDays;
      case 'month': return student.monthlyStudyDays;
      default: return student.currentStreak;
    }
  };

  const shareAchievement = async (student: LeaderboardStudent) => {
    const shareText = `🔥 I'm on a ${student.currentStreak}-day study streak! Join me on NUET Prep Academy and let's learn together! #StudyStreak #NUETPrep`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Study Streak Achievement',
          text: shareText,
          url: window.location.origin
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Achievement copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy to clipboard');
      }
    }
  };

  if (!session) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          Please sign in to view the leaderboard.
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

  if (!leaderboardData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          No leaderboard data available.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Streak Leaderboard
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            {leaderboardData.totalStudents} students
          </div>
        </div>

        {/* Period Filter */}
        <div className="flex gap-2 mb-6">
          {periods.map((period) => {
            const Icon = period.icon;
            return (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedPeriod === period.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {period.label}
              </button>
            );
          })}
        </div>

        {/* Current User Position */}
        {leaderboardData.currentUserPosition && leaderboardData.currentUser && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  {leaderboardData.currentUserPosition}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Your Position</h3>
                  <p className="text-sm text-gray-600">
                    {getScoreValue(leaderboardData.currentUser, selectedPeriod)} {getScoreLabel(selectedPeriod)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => shareAchievement(leaderboardData.currentUser!)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Top {leaderboardData.students.length} Students
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {leaderboardData.students.map((student) => (
            <div
              key={student.id}
              className={`p-4 flex items-center justify-between ${getRankColor(student.rank)} ${
                student.isCurrentUser ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8">
                  {getRankIcon(student.rank)}
                </div>
                
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {student.avatar ? (
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-600">
                      {student.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    {student.name}
                    {student.isCurrentUser && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        You
                      </span>
                    )}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      {student.currentStreak} day streak
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      Best: {student.longestStreak} days
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {student.totalStudyDays} total days
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {getScoreValue(student, selectedPeriod)}
                </div>
                <div className="text-sm text-gray-600">
                  {getScoreLabel(selectedPeriod)}
                </div>
                {student.rank <= 3 && (
                  <button
                    onClick={() => shareAchievement(student)}
                    className="mt-2 flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
                  >
                    <Share2 className="w-3 h-3" />
                    Share
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {leaderboardData.students.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p>No students with active streaks yet.</p>
            <p className="text-sm mt-2">Be the first to start a study streak!</p>
          </div>
        )}
      </div>

      {/* Motivational Message */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Keep Going!
        </h3>
        <p className="text-gray-700 mb-4">
          Every day of study counts! Whether you're at the top of the leaderboard or just getting started, 
          consistency is the key to success. Share your achievements and motivate others to join the learning journey.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">#StudyStreak</span>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">#NUETPrep</span>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">#LearningTogether</span>
        </div>
      </div>
    </div>
  );
}
