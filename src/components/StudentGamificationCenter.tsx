"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Trophy, Star, Award, TrendingUp, Target, Clock, Users, Medal, Crown, Zap,
  Flame, BookOpen, CheckCircle, PlayCircle, BarChart3, Calendar, Share2,
  UserPlus, Users2, Gift, CalendarDays, MessageCircle, Heart, Send, Plus,
  Settings, Bell, Eye, ChevronRight, ChevronLeft, Activity, Target as TargetIcon,
  BookMarked, Brain, Lightbulb, Rocket, Shield, Sword, Gem, Sparkles, X
} from 'lucide-react';
import ProgressTracking from '@/components/ProgressTracking';

interface UserProfile {
  points: {
    points: number;
    level: number;
    experience: number;
    streak: number;
    lastLogin: string;
  };
  badges: any[];
  achievements: any[];
  recentTransactions: any[];
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'INDIVIDUAL' | 'TEAM' | 'MIXED';
  startDate: string;
  endDate: string;
  hasQuiz: boolean;
  quiz?: {
    questions: any[];
    totalPoints: number;
    passingScore: number;
  };
  rules: any;
  rewards: any;
  isActive: boolean;
  event?: {
    name: string;
    type: string;
  };
  _count?: {
    submissions: number;
  };
}

interface Event {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  participations: any[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export default function StudentGamificationCenter() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, challengesRes, eventsRes] = await Promise.all([
        fetch('/api/gamification/profile'),
        fetch('/api/challenges'),
        fetch('/api/events')
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }

      if (challengesRes.ok) {
        const challengesData = await challengesRes.json();
        setChallenges(challengesData.challenges || []);
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData.events || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeClick = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    if (challenge.hasQuiz) {
      setShowQuizModal(true);
    } else {
      setShowChallengeModal(true);
    }
  };

  const handleQuizSubmit = async () => {
    if (!selectedChallenge || !selectedChallenge.quiz) return;

    try {
      const response = await fetch('/api/challenges/submit-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: selectedChallenge.id,
          answers: quizAnswers
        })
      });

      if (response.ok) {
        const result = await response.json();
        setQuizScore(result.submission.score);
        await fetchData(); // Refresh data
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Network error. Please try again.');
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-yellow-600';
    if (progress >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getLevelColor = (level: number) => {
    if (level >= 50) return 'from-purple-500 to-pink-500';
    if (level >= 30) return 'from-blue-500 to-purple-500';
    if (level >= 20) return 'from-green-500 to-blue-500';
    if (level >= 10) return 'from-yellow-500 to-orange-500';
    return 'from-gray-500 to-blue-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600">No gamification data available</p>
      </div>
    );
  }

  const { points } = profile;
  const nextLevelExp = (points.level * 1000) - points.experience;
  const progressToNextLevel = ((points.experience % 1000) / 1000) * 100;

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm border border-slate-200">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'challenges', label: 'Challenges', icon: Target },
          { id: 'achievements', label: 'Achievements', icon: Trophy },
          { id: 'events', label: 'Events', icon: Calendar },
          { id: 'progress', label: 'Progress', icon: TrendingUp }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Level Progress Card */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Level {points.level}</h3>
                <p className="text-blue-100">{points.experience} / {points.level * 1000} XP</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{points.points.toLocaleString()}</div>
                <p className="text-blue-100">Total Points</p>
              </div>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mb-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressToNextLevel}%` }}
              />
            </div>
            <p className="text-sm text-blue-100">
              {nextLevelExp} XP needed for next level
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Flame className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Study Streak</p>
                  <p className="text-2xl font-bold text-slate-900">{points.streak} days</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Badges Earned</p>
                  <p className="text-2xl font-bold text-slate-900">{profile.badges.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Achievements</p>
                  <p className="text-2xl font-bold text-slate-900">{profile.achievements.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Active Challenges</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {challenges.filter(c => c.isActive).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              {profile.recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {profile.recentTransactions.slice(0, 5).map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Plus className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{transaction.reason}</p>
                          <p className="text-sm text-slate-600">{transaction.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">+{transaction.points}</p>
                        <p className="text-sm text-slate-600">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600 text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'challenges' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Available Challenges</h3>
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Target className="w-4 h-4" />
              <span>{challenges.filter(c => c.isActive).length} active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.filter(c => c.isActive).map((challenge) => (
              <div
                key={challenge.id}
                className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleChallengeClick(challenge)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-slate-600">
                        {challenge.type}
                      </span>
                    </div>
                    {challenge.hasQuiz && (
                      <div className="flex items-center space-x-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        <Brain className="w-3 h-3" />
                        <span>Quiz</span>
                      </div>
                    )}
                  </div>
                  
                  <h4 className="font-semibold text-slate-900 mb-2">{challenge.name}</h4>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {challenge.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Rewards:</span>
                      <span className="font-medium text-green-600">
                        +{challenge.rewards?.points || 0} points
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Participants:</span>
                      <span className="font-medium text-slate-900">
                        {challenge._count?.submissions || 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Ends: {new Date(challenge.endDate).toLocaleDateString()}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {challenges.filter(c => c.isActive).length === 0 && (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Active Challenges</h3>
              <p className="text-slate-600">Check back later for new challenges!</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'progress' && (
        <ProgressTracking />
      )}

      {/* Challenge Modal */}
      {showChallengeModal && selectedChallenge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  {selectedChallenge.name}
                </h3>
                <button
                  onClick={() => setShowChallengeModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-slate-600">{selectedChallenge.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-medium text-slate-900 mb-2">Rewards</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Points:</span>
                      <span className="font-medium text-green-600">
                        +{selectedChallenge.rewards?.points || 0}
                      </span>
                    </div>
                    {selectedChallenge.rewards?.badges?.length > 0 && (
                      <div className="flex justify-between">
                        <span>Badges:</span>
                        <span className="font-medium">{selectedChallenge.rewards.badges.length}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-medium text-slate-900 mb-2">Rules</h4>
                  <div className="space-y-1 text-sm">
                    {selectedChallenge.rules?.timeLimit && (
                      <div className="flex justify-between">
                        <span>Time Limit:</span>
                        <span>{selectedChallenge.rules.timeLimit} min</span>
                      </div>
                    )}
                    {selectedChallenge.rules?.maxAttempts && (
                      <div className="flex justify-between">
                        <span>Max Attempts:</span>
                        <span>{selectedChallenge.rules.maxAttempts}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowChallengeModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowChallengeModal(false);
                    // Handle challenge participation
                  }}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                  Participate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuizModal && selectedChallenge && selectedChallenge.quiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  {selectedChallenge.name} - Quiz
                </h3>
                <button
                  onClick={() => {
                    setShowQuizModal(false);
                    setQuizAnswers({});
                    setQuizScore(null);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {quizScore === null ? (
                <div className="space-y-6">
                  {selectedChallenge.quiz.questions.map((question: any, index: number) => (
                    <div key={question.id} className="space-y-3">
                      <h4 className="font-medium text-slate-900">
                        Question {index + 1}: {question.question}
                      </h4>
                      
                      {question.type === 'multiple-choice' && question.options && (
                        <div className="space-y-2">
                          {question.options.map((option: string, optionIndex: number) => (
                            <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="radio"
                                name={question.id}
                                value={option}
                                onChange={(e) => setQuizAnswers({
                                  ...quizAnswers,
                                  [question.id]: e.target.value
                                })}
                                className="text-primary focus:ring-primary"
                              />
                              <span className="text-slate-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      
                      {question.type === 'true-false' && (
                        <div className="space-y-2">
                          {['True', 'False'].map((option) => (
                            <label key={option} className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="radio"
                                name={question.id}
                                value={option}
                                onChange={(e) => setQuizAnswers({
                                  ...quizAnswers,
                                  [question.id]: e.target.value
                                })}
                                className="text-primary focus:ring-primary"
                              />
                              <span className="text-slate-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      
                      {question.type === 'short-answer' && (
                        <input
                          type="text"
                          placeholder="Your answer..."
                          onChange={(e) => setQuizAnswers({
                            ...quizAnswers,
                            [question.id]: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      )}
                    </div>
                  ))}
                  
                  <div className="flex space-x-3 pt-6">
                    <button
                      onClick={() => {
                        setShowQuizModal(false);
                        setQuizAnswers({});
                      }}
                      className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleQuizSubmit}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                    >
                      Submit Quiz
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mb-4">
                    <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      Quiz Completed!
                    </h3>
                    <p className="text-lg font-medium text-green-600 mb-2">
                      Score: {quizScore}/{selectedChallenge.quiz.totalPoints}
                    </p>
                    <p className="text-slate-600">
                      {quizScore >= selectedChallenge.quiz.passingScore 
                        ? 'Congratulations! You passed the quiz!' 
                        : 'Keep studying and try again!'}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setShowQuizModal(false);
                      setQuizAnswers({});
                      setQuizScore(null);
                    }}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
