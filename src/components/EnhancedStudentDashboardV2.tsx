"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Users, TrendingUp, Target, Calendar, MessageCircle, Eye,
  BarChart3, FileText, PlayCircle, CheckCircle, Clock, Award, Bookmark,
  ArrowRight, Star, Flame, Trophy, Brain, Zap, Bell, Settings, ChevronRight,
  CalendarDays, Timer, BookMarked, Lightbulb, Rocket, Shield, Crown,
  Activity, Target as TargetIcon, Plus, RefreshCw, Download, Share2,
  Percent, Lock, Unlock, AlertCircle, CheckCircle2
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalTopics: number;
  completedTopics: number;
  totalTests: number;
  completedTests: number;
  lastAccessed: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedHours: number;
  instructor: string;
  nextDeadline?: string;
  grades?: {
    overall: number;
    topics: { [topicId: string]: number };
    tests: { [testId: string]: number };
  };
  accessControl?: {
    topics: { [topicId: string]: { isUnlocked: boolean; unlockDate?: string } };
    materials: { [materialId: string]: { isUnlocked: boolean; unlockDate?: string } };
    tests: { [testId: string]: { isUnlocked: boolean; unlockDate?: string } };
  };
}

interface Test {
  id: string;
  title: string;
  courseTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  status: string;
  submittedAt: string;
  duration: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  retakeAvailable: boolean;
  topicId: string;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  type: string;
  progress: number;
  target: number;
  reward: number;
  deadline: string;
  isActive: boolean;
}

interface LearningGoal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  category: 'STUDY_TIME' | 'COURSES_COMPLETED' | 'TESTS_TAKEN' | 'MATERIALS_READ';
  isCompleted: boolean;
}

export default function EnhancedStudentDashboardV2() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [courses, setCourses] = useState<Course[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [coursesRes, testsRes, challengesRes, goalsRes] = await Promise.all([
        fetch('/api/student/courses', { credentials: 'include' }),
        fetch('/api/student/tests', { credentials: 'include' }),
        fetch('/api/streak-challenges', { credentials: 'include' }),
        fetch('/api/gamification/goals', { credentials: 'include' })
      ]);

      if (coursesRes.ok) {
        const data = await coursesRes.json();
        setCourses(data.courses || []);
      }

      if (testsRes.ok) {
        const data = await testsRes.json();
        setTests(data.tests || []);
      }

      if (challengesRes.ok) {
        const data = await challengesRes.json();
        setChallenges(data.challenges || []);
      }

      if (goalsRes.ok) {
        const data = await goalsRes.json();
        setLearningGoals(data.goals || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalCourses = () => courses.length;
  const getTotalTests = () => tests.length;
  const getAverageScore = () => {
    if (tests.length === 0) return 0;
    const totalScore = tests.reduce((sum, test) => sum + (test.percentage || 0), 0);
    return Math.round(totalScore / tests.length);
  };
  const getActiveChallenges = () => challenges.filter(c => c.isActive).length;
  const getCompletedGoals = () => learningGoals.filter(g => g.isCompleted).length;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED': return 'bg-red-100 text-red-800';
      case 'EASY': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HARD': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {session?.user?.name}!</h1>
            <p className="text-blue-100">Ready to continue your learning journey?</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{getTotalCourses()}</div>
            <p className="text-blue-100">Active Courses</p>
          </div>
        </div>
      </div>

      {/* Quick Stats - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-slate-600">Courses</p>
              <p className="text-xl font-bold text-slate-900">{getTotalCourses()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Percent className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-slate-600">Avg Grade</p>
              <p className="text-xl font-bold text-slate-900">{getAverageScore()}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-slate-600">Challenges</p>
              <p className="text-xl font-bold text-slate-900">{getActiveChallenges()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Trophy className="w-5 h-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-slate-600">Goals</p>
              <p className="text-xl font-bold text-slate-900">{getCompletedGoals()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Tabs */}
      <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'courses', label: 'Courses', icon: BookOpen },
          { id: 'grades', label: 'Grades', icon: Percent },
          { id: 'challenges-goals', label: 'Challenges & Goals', icon: Target },
          { id: 'access', label: 'Access Control', icon: Lock }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Recent Courses</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {courses.slice(0, 3).map((course) => (
                    <div key={course.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">{course.title}</h4>
                          <p className="text-sm text-slate-600">{course.instructor || 'NUET Instructor'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-900">{course.progress || 0}%</div>
                        <div className="w-16 bg-slate-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${course.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Recent Test Results</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {tests.slice(0, 3).map((test) => (
                    <div key={test.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <PlayCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">{test.title}</h4>
                          <p className="text-sm text-slate-600">{test.courseTitle}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${getGradeColor(test.percentage)}`}>
                          {test.percentage}%
                        </div>
                        <div className="text-xs text-slate-500">{test.submittedAt}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">My Courses</h3>
            <button
              onClick={() => router.push('/courses')}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm"
            >
              Browse More Courses
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 mb-1">{course.title}</h4>
                      <p className="text-sm text-slate-600">{course.instructor || 'NUET Instructor'}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(course.difficulty || 'BEGINNER')}`}>
                      {course.difficulty || 'BEGINNER'}
                    </span>
                  </div>

                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">{course.description || 'No description available'}</p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Progress</span>
                      <span className="font-medium text-slate-900">{course.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress || 0}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">Topics:</span>
                        <span className="font-medium ml-1">{course.completedTopics || 0}/{course.totalTopics || 0}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Tests:</span>
                        <span className="font-medium ml-1">{course.completedTests || 0}/{course.totalTests || 0}</span>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-slate-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{course.estimatedHours || 0}h estimated</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/courses/${course.id}`)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      Continue
                    </button>
                    <button
                      onClick={() => router.push(`/courses/${course.id}/materials`)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium"
                    >
                      Materials
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'grades' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">My Grades</h3>
            <div className="text-sm text-slate-600">
              Overall Average: <span className="font-bold text-lg text-blue-600">{getAverageScore()}%</span>
            </div>
          </div>

          <div className="space-y-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-slate-900">{course.title}</h4>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {course.grades?.overall || 0}%
                      </div>
                      <div className="text-sm text-slate-600">Overall Grade</div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-slate-900 mb-3">Topic Grades</h5>
                      <div className="space-y-2">
                        {Object.entries(course.grades?.topics || {}).map(([topicId, grade]) => (
                          <div key={topicId} className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Topic {topicId}</span>
                            <span className={`text-sm font-medium ${getGradeColor(grade)}`}>
                              {grade}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-slate-900 mb-3">Test Grades</h5>
                      <div className="space-y-2">
                        {Object.entries(course.grades?.tests || {}).map(([testId, grade]) => (
                          <div key={testId} className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Test {testId}</span>
                            <span className={`text-sm font-medium ${getGradeColor(grade)}`}>
                              {grade}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'challenges-goals' && (
        <div className="space-y-6">
          {/* Challenges */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Active Challenges</h3>
              <button
                onClick={() => router.push('/challenges')}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm"
              >
                View All Challenges
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => (
                <div key={challenge.id} className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-slate-900">{challenge.name}</h4>
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Active
                      </span>
                    </div>

                    <p className="text-slate-600 text-sm mb-4">{challenge.description}</p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Progress</span>
                        <span className="font-medium text-slate-900">{challenge.progress}/{challenge.target}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Reward:</span>
                        <span className="font-medium text-green-600">+{challenge.reward} points</span>
                      </div>

                      <div className="flex items-center text-sm text-slate-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Deadline: {new Date(challenge.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
                      Participate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Goals */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Learning Goals</h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                Set New Goal
              </button>
            </div>

            <div className="space-y-4">
              {learningGoals.map((goal) => (
                <div key={goal.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900">{goal.title}</h4>
                      <p className="text-slate-600 text-sm">{goal.description}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      goal.isCompleted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {goal.isCompleted ? 'Completed' : 'In Progress'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Progress</span>
                      <span className="font-medium text-slate-900">{goal.current}/{goal.target} {goal.unit}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(goal.current / goal.target) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                      <span className="capitalize">{goal.category.replace('_', ' ').toLowerCase()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'access' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Access Control</h3>
            <div className="text-sm text-slate-600">
              Track when content becomes available
            </div>
          </div>

          <div className="space-y-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h4 className="text-lg font-semibold text-slate-900">{course.title}</h4>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Topics Access */}
                    <div>
                      <h5 className="font-medium text-slate-900 mb-3">Topics Access</h5>
                      <div className="space-y-2">
                        {Object.entries(course.accessControl?.topics || {}).map(([topicId, access]) => (
                          <div key={topicId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              {access.isUnlocked ? (
                                <Unlock className="w-5 h-5 text-green-600" />
                              ) : (
                                <Lock className="w-5 h-5 text-red-600" />
                              )}
                              <span className="text-sm font-medium text-slate-900">Topic {topicId}</span>
                            </div>
                            <div className="text-right">
                              {access.isUnlocked ? (
                                <span className="text-sm text-green-600">Available</span>
                              ) : (
                                <span className="text-sm text-red-600">
                                  Unlocks: {access.unlockDate ? new Date(access.unlockDate).toLocaleDateString() : 'TBD'}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tests Access */}
                    <div>
                      <h5 className="font-medium text-slate-900 mb-3">Tests Access</h5>
                      <div className="space-y-2">
                        {Object.entries(course.accessControl?.tests || {}).map(([testId, access]) => (
                          <div key={testId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              {access.isUnlocked ? (
                                <Unlock className="w-5 h-5 text-green-600" />
                              ) : (
                                <Lock className="w-5 h-5 text-red-600" />
                              )}
                              <span className="text-sm font-medium text-slate-900">Test {testId}</span>
                            </div>
                            <div className="text-right">
                              {access.isUnlocked ? (
                                <span className="text-sm text-green-600">Available</span>
                              ) : (
                                <span className="text-sm text-red-600">
                                  Unlocks: {access.unlockDate ? new Date(access.unlockDate).toLocaleDateString() : 'TBD'}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
