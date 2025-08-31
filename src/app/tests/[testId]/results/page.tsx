"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import {
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  BookOpen,
  FileText,
  ArrowLeft,
  Eye,
  EyeOff,
  TrendingUp,
  Target,
  Award,
  AlertCircle
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Question {
  id: string;
  text: string;
  type: string;
  difficulty: string;
  points: number;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
}

interface TestResult {
  id: string;
  test: {
    id: string;
    title: string;
    description: string;
    duration: number;
    totalPoints: number;
    topic: {
      title: string;
      course: {
        title: string;
      };
    };
    questions: Question[];
  };
  score: number;
  maxScore: number;
  submittedAt: string;
  timeSpent: number;
  answers: {
    questionId: string;
    answer: string;
    isCorrect: boolean;
    pointsEarned: number;
  }[];
}

export default function TestResults() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const testId = params.testId as string;

  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExplanations, setShowExplanations] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'STUDENT') {
      router.push('/auth/signin');
      return;
    }

    fetchTestResult();
  }, [session, status, router, testId]);

  const fetchTestResult = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tests/${testId}/results`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch test results');
      }

      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch test results');
    } finally {
      setLoading(false);
    }
  };

  const getScorePercentage = () => {
    if (!result) return 0;
    return Math.round((result.score / result.maxScore) * 100);
  };

  const getScoreStatus = () => {
    const percentage = getScorePercentage();
    if (percentage >= 80) return { status: 'EXCELLENT', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage >= 70) return { status: 'GOOD', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (percentage >= 60) return { status: 'SATISFACTORY', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (percentage >= 50) return { status: 'PASSED', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { status: 'FAILED', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getScoreColor = () => {
    const percentage = getScorePercentage();
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getQuestionResult = (questionId: string) => {
    return result?.answers.find(a => a.questionId === questionId);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading test results...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!session || session.user.role !== 'STUDENT') {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Results</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/student/dashboard')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Results Not Found</h2>
            <p className="text-gray-600 mb-4">The test results you're looking for don't exist or you don't have access to them.</p>
            <button
              onClick={() => router.push('/student/dashboard')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const scoreStatus = getScoreStatus();
  const scoreColor = getScoreColor();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/student/dashboard')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Test Results</h1>
                <p className="text-gray-600">{result.test.title}</p>
              </div>
            </div>

            <button
              onClick={() => setShowExplanations(!showExplanations)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showExplanations ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showExplanations ? 'Hide' : 'Show'} Explanations</span>
            </button>
          </div>

          {/* Score Overview */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Complete!</h2>
              <p className="text-gray-600">Here's how you performed on this test</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Score */}
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Score</h3>
                <p className={`text-2xl font-bold ${scoreColor}`}>
                  {result.score}/{result.maxScore}
                </p>
                <p className="text-sm text-gray-600">{getScorePercentage()}%</p>
              </div>

              {/* Status */}
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Status</h3>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${scoreStatus.bg} ${scoreStatus.color}`}>
                  {scoreStatus.status}
                </span>
              </div>

              {/* Time Spent */}
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Time Spent</h3>
                <p className="text-xl font-semibold text-gray-900">{formatTime(result.timeSpent)}</p>
                <p className="text-sm text-gray-600">of {result.test.duration}m limit</p>
              </div>

              {/* Questions */}
              <div className="text-center">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-10 h-10 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Questions</h3>
                <p className="text-xl font-semibold text-gray-900">{result.test.questions.length}</p>
                <p className="text-sm text-gray-600">Total questions</p>
              </div>
            </div>

            {/* Performance Bar */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Performance</h3>
                <span className="text-sm text-gray-600">{getScorePercentage()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${scoreColor.replace('text-', 'bg-')}`}
                  style={{ width: `${getScorePercentage()}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Course Information */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Course</p>
                  <p className="font-medium text-gray-900">{result.test.topic.course.title}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Topic</p>
                  <p className="font-medium text-gray-900">{result.test.topic.title}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Submitted</p>
                  <p className="font-medium text-gray-900">
                    {new Date(result.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Question Review */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Question Review</h3>
              <p className="text-gray-600">Review your answers and see the correct responses</p>
            </div>

            <div className="divide-y divide-gray-200">
              {result.test.questions.map((question, index) => {
                const questionResult = getQuestionResult(question.id);
                const isCorrect = questionResult?.isCorrect || false;
                const pointsEarned = questionResult?.pointsEarned || 0;

                return (
                  <div key={question.id} className="p-6">
                    {/* Question Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-500">
                          Question {index + 1}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          question.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                          question.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {question.difficulty}
                        </span>
                        <span className="text-sm text-gray-500">
                          {question.points} point{question.points !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        {isCorrect ? (
                          <div className="flex items-center space-x-2 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">+{pointsEarned}</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-red-600">
                            <XCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">0</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Question Text */}
                    <div className="mb-4">
                      <h4 className="text-lg font-medium text-gray-900">{question.text}</h4>
                    </div>

                    {/* Options */}
                    {question.type === 'MULTIPLE_CHOICE' && question.options && (
                      <div className="space-y-2 mb-4">
                        {question.options.map((option, optionIndex) => {
                          const isSelected = questionResult?.answer === option;
                          const isCorrectOption = option === question.correctAnswer;
                          
                          let optionClass = "p-3 border-2 rounded-lg";
                          if (isCorrectOption) {
                            optionClass += " border-green-500 bg-green-50";
                          } else if (isSelected && !isCorrect) {
                            optionClass += " border-red-500 bg-red-50";
                          } else {
                            optionClass += " border-gray-200";
                          }

                          return (
                            <div key={optionIndex} className={optionClass}>
                              <div className="flex items-center space-x-3">
                                {isCorrectOption && <CheckCircle className="w-5 h-5 text-green-600" />}
                                {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600" />}
                                <span className={`font-medium ${
                                  isCorrectOption ? 'text-green-800' :
                                  isSelected && !isCorrect ? 'text-red-800' :
                                  'text-gray-700'
                                }`}>
                                  {option}
                                </span>
                                {isCorrectOption && <span className="text-sm text-green-600 font-medium">(Correct)</span>}
                                {isSelected && !isCorrect && <span className="text-sm text-red-600 font-medium">(Your Answer)</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {question.type === 'TRUE_FALSE' && (
                      <div className="space-y-2 mb-4">
                        {['TRUE', 'FALSE'].map((option) => {
                          const isSelected = questionResult?.answer === option;
                          const isCorrectOption = option === question.correctAnswer;
                          
                          let optionClass = "p-3 border-2 rounded-lg";
                          if (isCorrectOption) {
                            optionClass += " border-green-500 bg-green-50";
                          } else if (isSelected && !isCorrect) {
                            optionClass += " border-red-500 bg-red-50";
                          } else {
                            optionClass += " border-gray-200";
                          }

                          return (
                            <div key={option} className={optionClass}>
                              <div className="flex items-center space-x-3">
                                {isCorrectOption && <CheckCircle className="w-5 h-5 text-green-600" />}
                                {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600" />}
                                <span className={`font-medium ${
                                  isCorrectOption ? 'text-green-800' :
                                  isSelected && !isCorrect ? 'text-red-800' :
                                  'text-gray-700'
                                }`}>
                                  {option}
                                </span>
                                {isCorrectOption && <span className="text-sm text-green-600 font-medium">(Correct)</span>}
                                {isSelected && !isCorrect && <span className="text-sm text-red-600 font-medium">(Your Answer)</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Explanation */}
                    {showExplanations && question.explanation && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h5 className="font-medium text-blue-900 mb-2">Explanation</h5>
                        <p className="text-blue-800 text-sm">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => router.push('/student/dashboard')}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => router.push('/courses')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse More Courses
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
