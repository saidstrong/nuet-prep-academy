"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Flame, 
  Trophy, 
  Calendar, 
  Target,
  Award,
  TrendingUp,
  Clock,
  Star,
  Crown,
  Gem,
  Zap,
  Share2
} from 'lucide-react';

interface StreakMilestone {
  name: string;
  icon: string;
  days: number;
}

interface StreakData {
  current: number;
  longest: number;
  weekly: number;
  monthly: number;
  totalStudyDays: number;
  milestones: {
    current: StreakMilestone[];
    longest: StreakMilestone[];
  };
  nextMilestone: {
    days: number;
    daysRemaining: number;
    name: string;
  } | null;
  recentActivity: {
    date: string;
    day: string;
    hasActivity: boolean;
    isToday: boolean;
  }[];
}

export default function StudyStreakDashboard() {
  const { data: session } = useSession();
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStreakData = async () => {
      if (!session?.user) return;
      
      try {
        setLoading(true);
        const response = await fetch('/api/study-streak');
        const data = await response.json();
        
        if (data.success) {
          setStreakData(data.streak);
        } else {
          setError(data.error || 'Failed to fetch streak data');
        }
      } catch (error) {
        console.error('Failed to fetch streak data:', error);
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchStreakData();
  }, [session]);

  const getStreakIcon = (streak: number) => {
    if (streak >= 100) return <Gem className="w-8 h-8 text-purple-600" />;
    if (streak >= 60) return <Crown className="w-8 h-8 text-yellow-600" />;
    if (streak >= 30) return <Star className="w-8 h-8 text-blue-600" />;
    if (streak >= 14) return <Trophy className="w-8 h-8 text-green-600" />;
    if (streak >= 7) return <Zap className="w-8 h-8 text-orange-600" />;
    return <Flame className="w-8 h-8 text-red-600" />;
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 100) return 'from-purple-500 to-pink-500';
    if (streak >= 60) return 'from-yellow-500 to-orange-500';
    if (streak >= 30) return 'from-blue-500 to-purple-500';
    if (streak >= 14) return 'from-green-500 to-blue-500';
    if (streak >= 7) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-pink-500';
  };

  const getMilestoneIcon = (icon: string) => {
    switch (icon) {
      case '🔥': return <Flame className="w-4 h-4" />;
      case '⚡': return <Zap className="w-4 h-4" />;
      case '🏆': return <Trophy className="w-4 h-4" />;
      case '👑': return <Crown className="w-4 h-4" />;
      case '🌟': return <Star className="w-4 h-4" />;
      case '💎': return <Gem className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  const shareStreak = async () => {
    if (!streakData) return;
    
    const shareText = `🔥 I'm on a ${streakData.current}-day study streak! My longest streak is ${streakData.longest} days. Join me on NUET Prep Academy and let's learn together! #StudyStreak #NUETPrep`;
    
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
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Streak achievement copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy to clipboard');
      }
    }
  };

  if (!session) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          Please sign in to view your study streak.
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

  if (!streakData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          No streak data available.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Streak Display */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-500" />
          Study Streak
        </h2>
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-orange-400 to-red-500 mb-4">
            {getStreakIcon(streakData.current)}
          </div>
          <h3 className="text-4xl font-bold text-gray-900 mb-2">{streakData.current}</h3>
          <p className="text-lg text-gray-600">Days in a row!</p>
          {streakData.current > 0 && (
            <p className="text-sm text-green-600 mt-2 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4" />
              Keep it up! 🔥
            </p>
          )}
          {streakData.current > 0 && (
            <button
              onClick={shareStreak}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Share2 className="w-4 h-4" />
              Share Achievement
            </button>
          )}
        </div>

        {/* Streak Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <Trophy className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900">{streakData.longest}</p>
            <p className="text-xs text-blue-600">Longest Streak</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <Calendar className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-900">{streakData.weekly}</p>
            <p className="text-xs text-green-600">This Week</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-900">{streakData.monthly}</p>
            <p className="text-xs text-purple-600">This Month</p>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <Clock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-900">{streakData.totalStudyDays}</p>
            <p className="text-xs text-orange-600">Total Days</p>
          </div>
        </div>

        {/* Next Milestone */}
        {streakData.nextMilestone && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">Next Milestone</h4>
                <p className="text-sm text-gray-600">{streakData.nextMilestone.name}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{streakData.nextMilestone.daysRemaining}</p>
                <p className="text-xs text-gray-600">days to go</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${((streakData.nextMilestone.days - streakData.nextMilestone.daysRemaining) / streakData.nextMilestone.days) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity Calendar */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Recent Activity
        </h3>
        
        <div className="grid grid-cols-7 gap-2">
          {streakData.recentActivity.map((day, index) => (
            <div 
              key={index}
              className={`text-center p-2 rounded-lg ${
                day.hasActivity 
                  ? 'bg-green-100 text-green-800' 
                  : day.isToday 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600'
              }`}
            >
              <div className="text-xs font-medium">{day.day}</div>
              <div className="text-xs mt-1">
                {day.hasActivity ? '✓' : day.isToday ? 'Today' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achieved Milestones */}
      {streakData.milestones.current.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Achieved Milestones
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {streakData.milestones.current.map((milestone, index) => (
              <div 
                key={index}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{milestone.icon}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{milestone.name}</h4>
                    <p className="text-sm text-gray-600">{milestone.days} days streak</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Streak Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Streak Tips
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
            <p className="text-gray-700">Study for at least 15 minutes every day to maintain your streak</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
            <p className="text-gray-700">Complete materials or take tests to count as study activity</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
            <p className="text-gray-700">Set daily reminders to help build consistent study habits</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
            <p className="text-gray-700">Even short study sessions count - consistency is key!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
