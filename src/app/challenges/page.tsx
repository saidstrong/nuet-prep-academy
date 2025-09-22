"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Target, Trophy, Clock, Users, Star, CheckCircle, Lock } from 'lucide-react';

export default function ChallengesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [challenges, setChallenges] = useState([
    {
      id: 1,
      title: 'Daily Study Challenge',
      description: 'Study for at least 2 hours every day for a week',
      difficulty: 'Easy',
      points: 100,
      duration: '7 days',
      participants: 1247,
      completed: false,
      progress: 3,
      maxProgress: 7,
      locked: false,
      category: 'Study Habits'
    },
    {
      id: 2,
      title: 'Quiz Master',
      description: 'Complete 10 quizzes with 80% or higher score',
      difficulty: 'Medium',
      points: 250,
      duration: '14 days',
      participants: 892,
      completed: false,
      progress: 6,
      maxProgress: 10,
      locked: false,
      category: 'Knowledge'
    },
    {
      id: 3,
      title: 'Streak Champion',
      description: 'Maintain a 15-day study streak',
      difficulty: 'Hard',
      points: 500,
      duration: '15 days',
      participants: 456,
      completed: false,
      progress: 0,
      maxProgress: 15,
      locked: true,
      category: 'Consistency'
    },
    {
      id: 4,
      title: 'Course Completer',
      description: 'Complete 3 full courses',
      difficulty: 'Medium',
      points: 300,
      duration: '30 days',
      participants: 678,
      completed: true,
      progress: 3,
      maxProgress: 3,
      locked: false,
      category: 'Achievement'
    }
  ]);

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Study Habits':
        return <Target className="w-5 h-5" />;
      case 'Knowledge':
        return <Star className="w-5 h-5" />;
      case 'Consistency':
        return <Clock className="w-5 h-5" />;
      case 'Achievement':
        return <Trophy className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Target className="w-8 h-8 mr-3 text-blue-600" />
            Challenges
          </h1>
          <p className="text-gray-600">Take on challenges to earn points and improve your learning</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Active Challenges</p>
                <p className="text-2xl font-bold text-gray-900">
                  {challenges.filter(c => !c.completed && !c.locked).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <Trophy className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {challenges.filter(c => c.completed).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <Star className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Points</p>
                <p className="text-2xl font-bold text-gray-900">
                  {challenges.filter(c => c.completed).reduce((sum, c) => sum + c.points, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Participants</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.max(...challenges.map(c => c.participants))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className={`bg-white rounded-lg shadow-sm overflow-hidden ${
                challenge.locked ? 'opacity-60' : ''
              }`}
            >
              {/* Challenge Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(challenge.category)}
                    <span className="text-sm font-medium text-gray-600">{challenge.category}</span>
                  </div>
                  {challenge.locked && (
                    <Lock className="w-5 h-5 text-gray-400" />
                  )}
                  {challenge.completed && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {challenge.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {challenge.description}
                </p>

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                  <span className="flex items-center">
                    <Trophy className="w-4 h-4 mr-1" />
                    {challenge.points} pts
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {challenge.duration}
                  </span>
                </div>
              </div>

              {/* Progress Section */}
              <div className="p-6">
                {!challenge.completed && !challenge.locked && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{challenge.progress}/{challenge.maxProgress}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(challenge.progress / challenge.maxProgress) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-1" />
                    {challenge.participants.toLocaleString()} participants
                  </div>

                  <button
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      challenge.completed
                        ? 'bg-green-100 text-green-800 cursor-default'
                        : challenge.locked
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    disabled={challenge.completed || challenge.locked}
                  >
                    {challenge.completed
                      ? 'Completed'
                      : challenge.locked
                      ? 'Locked'
                      : challenge.progress > 0
                      ? 'Continue'
                      : 'Start Challenge'
                    }
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Challenge Tips */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Challenge Tips
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li>• Start with easier challenges to build momentum</li>
            <li>• Focus on one challenge at a time for better results</li>
            <li>• Check your progress regularly to stay motivated</li>
            <li>• Complete challenges to unlock harder ones</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
