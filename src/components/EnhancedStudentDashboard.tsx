"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Users, TrendingUp, Target, Calendar, MessageCircle, Eye,
  BarChart3, FileText, PlayCircle, CheckCircle, Clock, Award, Bookmark,
  ArrowRight, Star, Flame, Trophy, Brain, Zap, Bell, Settings, ChevronRight,
  CalendarDays, Timer, BookMarked, Lightbulb, Rocket, Shield, Crown,
  Activity, Target as TargetIcon, Plus, RefreshCw, Download, Share2
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
}

interface Test {
  id: string;
  title: string;
  courseTitle: string;
  score: number;
  maxScore: number;
  status: string;
  submittedAt: string;
  duration: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  retakeAvailable: boolean;
}

interface Material {
  id: string;
  title: string;
  type: string;
  courseTitle: string;
  topicTitle: string;
  lastAccessed: string;
  isCompleted: boolean;
  estimatedTime: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
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

interface StudyEvent {
  id: string;
  title: string;
  type: 'TEST' | 'DEADLINE' | 'LIVE_SESSION' | 'ASSIGNMENT';
  date: string;
  time: string;
  course: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  isCompleted: boolean;
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

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt: string;
  category: string;
}

export default function EnhancedStudentDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [courses, setCourses] = useState<Course[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [studyEvents, setStudyEvents] = useState<StudyEvent[]>([]);
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [coursesRes, testsRes, materialsRes, challengesRes, eventsRes, goalsRes, achievementsRes] = await Promise.all([
        fetch('/api/student/courses', { credentials: 'include' }),
        fetch('/api/student/tests', { credentials: 'include' }),
        fetch('/api/student/materials', { credentials: 'include' }),
        fetch('/api/streak-challenges', { credentials: 'include' }),
        fetch('/api/events', { credentials: 'include' }),
        fetch('/api/gamification/goals', { credentials: 'include' }),
        fetch('/api/gamification/achievements', { credentials: 'include' })
      ]);

      if (coursesRes.ok) {
        const data = await coursesRes.json();
        setCourses(data.courses || []);
      }

      if (testsRes.ok) {
        const data = await testsRes.json();
        setTests(data.tests || []);
      }

      if (materialsRes.ok) {
        const data = await materialsRes.json();
        setMaterials(data.materials || []);
      }

      if (challengesRes.ok) {
        const data = await challengesRes.json();
        setChallenges(data.challenges || []);
      }

      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setStudyEvents(data.events || []);
      }

      if (goalsRes.ok) {
        const data = await goalsRes.json();
        setLearningGoals(data.goals || []);
      }

      if (achievementsRes.ok) {
        const data = await achievementsRes.json();
        setAchievements(data.achievements || []);
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
    const totalScore = tests.reduce((sum, test) => sum + (test.score || 0), 0);
    const totalMax = tests.reduce((sum, test) => sum + (test.maxScore || 100), 0);
    return totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
  };
  const getCompletedMaterials = () => materials.filter(m => m.isCompleted).length;
  const getActiveChallenges = () => challenges.filter(c => c.isActive).length;
  const getUpcomingEvents = () => studyEvents.filter(e => new Date(e.date) >= new Date()).length;

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'LOW': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'TEST': return <PlayCircle className="w-4 h-4" />;
      case 'DEADLINE': return <Clock className="w-4 h-4" />;
      case 'LIVE_SESSION': return <Users className="w-4 h-4" />;
      case 'ASSIGNMENT': return <FileText className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getMaterialTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FileText className="w-4 h-4" />;
      case 'VIDEO': return <PlayCircle className="w-4 h-4" />;
      case 'AUDIO': return <PlayCircle className="w-4 h-4" />;
      case 'LINK': return <Bookmark className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Courses</p>
              <p className="text-2xl font-bold text-slate-900">{getTotalCourses()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Avg Score</p>
              <p className="text-2xl font-bold text-slate-900">{getAverageScore()}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Challenges</p>
              <p className="text-2xl font-bold text-slate-900">{getActiveChallenges()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Upcoming</p>
              <p className="text-2xl font-bold text-slate-900">{getUpcomingEvents()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm border border-slate-200">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'courses', label: 'My Courses', icon: BookOpen },
          { id: 'schedule', label: 'Schedule', icon: Calendar },
          { id: 'challenges', label: 'Challenges', icon: Target },
          { id: 'goals', label: 'Goals', icon: Trophy },
          { id: 'materials', label: 'Materials', icon: FileText }
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
                <h3 className="text-lg font-semibold text-slate-900">Upcoming Events</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {studyEvents.slice(0, 3).map((event) => (
                    <div key={event.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          {getEventTypeIcon(event.type)}
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">{event.title}</h4>
                          <p className="text-sm text-slate-600">{event.course}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-900">{event.date}</div>
                        <div className="text-sm text-slate-600">{event.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('courses')}
                  className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 text-left transition-colors"
                >
                  <BookOpen className="w-6 h-6 text-blue-600 mb-2" />
                  <h5 className="font-medium text-blue-900">Continue Learning</h5>
                  <p className="text-sm text-blue-700">Resume your courses</p>
                </button>

                <button
                  onClick={() => setActiveTab('challenges')}
                  className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 text-left transition-colors"
                >
                  <Target className="w-6 h-6 text-green-600 mb-2" />
                  <h5 className="font-medium text-green-900">Join Challenges</h5>
                  <p className="text-sm text-green-700">Earn points and badges</p>
                </button>

                <button
                  onClick={() => setActiveTab('materials')}
                  className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 text-left transition-colors"
                >
                  <FileText className="w-6 h-6 text-purple-600 mb-2" />
                  <h5 className="font-medium text-purple-900">Study Materials</h5>
                  <p className="text-sm text-purple-700">Access resources</p>
                </button>

                <button
                  onClick={() => setActiveTab('goals')}
                  className="p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 text-left transition-colors"
                >
                  <Trophy className="w-6 h-6 text-orange-600 mb-2" />
                  <h5 className="font-medium text-orange-900">Set Goals</h5>
                  <p className="text-sm text-orange-700">Track your progress</p>
                </button>
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
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
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

      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Study Schedule</h3>
            <div className="flex items-center space-x-2">
              <button className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50">
                <Settings className="w-4 h-4" />
              </button>
              <button className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="p-6">
              <div className="space-y-4">
                {studyEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        {getEventTypeIcon(event.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">{event.title}</h4>
                        <p className="text-sm text-slate-600">{event.course}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-900">{event.date}</div>
                      <div className="text-sm text-slate-600">{event.time}</div>
                      <span className={`text-xs font-medium ${getPriorityColor(event.priority)}`}>
                        {event.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'challenges' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Active Challenges</h3>
            <button
              onClick={() => router.push('/challenges')}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
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
      )}

      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Learning Goals</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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
      )}

      {activeTab === 'materials' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Learning Materials</h3>
            <div className="flex items-center space-x-2">
              <button className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50">
                <Download className="w-4 h-4" />
              </button>
              <button className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((material) => (
              <div key={material.id} className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {getMaterialTypeIcon(material.type)}
                      <span className="text-xs font-medium text-slate-500 uppercase">{material.type}</span>
                    </div>
                    {material.isCompleted && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>

                  <h4 className="text-lg font-semibold text-slate-900 mb-2">{material.title}</h4>
                  <div className="text-sm text-slate-600 mb-4">
                    <div className="font-medium">{material.courseTitle}</div>
                    <div className="text-slate-500">{material.topicTitle}</div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Estimated time:</span>
                      <span className="font-medium text-slate-900">{material.estimatedTime} min</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Priority:</span>
                      <span className={`font-medium ${getPriorityColor(material.priority)}`}>
                        {material.priority}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Last accessed: {new Date(material.lastAccessed).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                    {material.isCompleted ? 'Review' : 'Study'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
