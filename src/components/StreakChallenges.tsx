"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Target, 
  Trophy, 
  Clock, 
  Users,
  Award,
  Star,
  Calendar,
  Flame,
  Crown,
  Zap,
  Share2,
  CheckCircle
} from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'STREAK' | 'STUDY_DAYS' | 'WEEKEND_STREAK';
  target: number;
  reward: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  participants: number;
  icon: string;
  progress: number;
  isCompleted: boolean;
  progressPercentage: number;
}

export default function StreakChallenges() {
  const { data: session } = useSession();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChallenges = async () => {
      if (!session?.user) return;
      
      try {
        setLoading(true);
        const response = await fetch('/api/streak-challenges');
        const data = await response.json();
        
        if (data.success) {
          setChallenges(data.challenges);
        } else {
          setError(data.error || 'Failed to fetch challenges data');
        }
      } catch (error) {
        console.error('Failed to fetch challenges:', error);
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [session]);

  const getChallengeIcon = (icon: string) => {
    switch (icon) {
      case '🔥': return <Flame className="w-6 h-6 text-red-500" />;
      case '👑': return <Crown className="w-6 h-6 text-yellow-500" />;
      case '⚡': return <Zap className="w-6 h-6 text-blue-500" />;
      default: return <Target className="w-6 h-6 text-gray-500" />;
    }
  };

  const getChallengeTypeLabel = (type: string) => {
    switch (type) {
      case 'STREAK': return 'Streak Challenge';
      case 'STUDY_DAYS': return 'Study Days Challenge';
      case 'WEEKEND_STREAK': return 'Weekend Challenge';
      default: return 'Challenge';
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  const shareChallenge = async (challenge: Challenge) => {
    const shareText = `🎯 Join me in the "${challenge.title}" challenge on NUET Prep Academy! ${challenge.description} #StudyChallenge #NUETPrep`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: challenge.title,
          text: shareText,
          url: window.location.origin
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Challenge copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy to clipboard');
      }
    }
  };

  if (!session) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          Please sign in to view challenges.
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Target className="w-6 h-6 text-blue-500" />
          Streak Challenges
        </h2>
        <p className="text-gray-600 mb-4">
          Join special challenges to earn bonus rewards and compete with other students!
        </p>
      </div>

      {/* Active Challenges */}
      <div className="space-y-4">
        {challenges.filter(challenge => challenge.isActive).map((challenge) => (
          <div
            key={challenge.id}
            className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
              challenge.isCompleted 
                ? 'border-green-500 bg-green-50' 
                : 'border-blue-500'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {getChallengeIcon(challenge.icon)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    {challenge.title}
                    {challenge.isCompleted && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">{challenge.description}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                  <Award className="w-4 h-4" />
                  {challenge.reward} points
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  {challenge.participants} participants
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Progress: {challenge.progress}/{challenge.target}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {Math.round(challenge.progressPercentage)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    challenge.isCompleted 
                      ? 'bg-gradient-to-r from-green-500 to-green-600' 
                      : 'bg-gradient-to-r from-blue-500 to-blue-600'
                  }`}
                  style={{ width: `${challenge.progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Challenge Details */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {getTimeRemaining(challenge.endDate)}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {getChallengeTypeLabel(challenge.type)}
                </div>
              </div>
              
              <button
                onClick={() => shareChallenge(challenge)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>

            {/* Completion Message */}
            {challenge.isCompleted && (
              <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <Trophy className="w-5 h-5" />
                  <span className="font-medium">Challenge Completed!</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Congratulations! You've earned {challenge.reward} bonus points.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* No Active Challenges */}
      {challenges.filter(challenge => challenge.isActive).length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Challenges</h3>
          <p className="text-gray-600 mb-4">
            Check back soon for new challenges and competitions!
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">#StudyChallenge</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">#Competition</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">#Rewards</span>
          </div>
        </div>
      )}

      {/* Challenge Tips */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Challenge Tips
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
            <p className="text-gray-700">Join challenges early to maximize your chances of completion</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
            <p className="text-gray-700">Share challenges with friends to create study groups</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
            <p className="text-gray-700">Complete challenges to earn bonus points and special badges</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
            <p className="text-gray-700">Check back regularly for new challenges and seasonal events</p>
          </div>
        </div>
      </div>
    </div>
  );
}
