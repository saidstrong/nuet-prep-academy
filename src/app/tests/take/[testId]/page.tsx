"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Pause,
  Check,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Timer,
  BarChart3,
  FileText
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

interface Test {
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
}

interface Answer {
  questionId: string;
  answer: string;
  isCorrect?: boolean;
}

export default function TakeTest() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const testId = params.testId as string;

  const [test, setTest] = useState<Test | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'STUDENT') {
      router.push('/auth/signin');
      return;
    }

    fetchTest();
  }, [session, status, router, testId]);

  useEffect(() => {
    if (!isTestStarted || isTestSubmitted || isPaused) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTestStarted, isTestSubmitted, isPaused]);

  const fetchTest = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tests/take?testId=${testId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch test');
      }

      const data = await response.json();
      setTest(data.test);
      setTimeRemaining(data.test.duration * 60); // Convert minutes to seconds
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch test');
    } finally {
      setLoading(false);
    }
  };

  const startTest = () => {
    setIsTestStarted(true);
    setCurrentQuestionIndex(0);
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => {
      const existingIndex = prev.findIndex(a => a.questionId === questionId);
      if (existingIndex >= 0) {
        const newAnswers = [...prev];
        newAnswers[existingIndex] = { ...newAnswers[existingIndex], answer };
        return newAnswers;
      } else {
        return [...prev, { questionId, answer }];
      }
    });
  };

  const handleQuestionNavigation = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentQuestionIndex < (test?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (direction === 'prev' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleAutoSubmit = () => {
    setIsTestSubmitted(true);
    submitTest();
  };

  const handleSubmitTest = () => {
    setShowConfirmSubmit(true);
  };

  const confirmSubmit = () => {
    setIsTestSubmitted(true);
    submitTest();
    setShowConfirmSubmit(false);
  };

  const submitTest = async () => {
    try {
      const response = await fetch('/api/tests/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testId,
          answers,
          timeSpent: test!.duration * 60 - timeRemaining
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit test');
      }

      // Test submitted successfully
      router.push(`/tests/${testId}/results`);
    } catch (error) {
      console.error('Error submitting test:', error);
      setError('Failed to submit test. Please try again.');
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentAnswer = (questionId: string) => {
    return answers.find(a => a.questionId === questionId)?.answer || '';
  };

  const getQuestionStatus = (index: number) => {
    const question = test?.questions[index];
    if (!question) return 'unanswered';
    
    const answer = answers.find(a => a.questionId === question.id);
    if (!answer || !answer.answer) return 'unanswered';
    return 'answered';
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading test...</p>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Test</h2>
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

  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Not Found</h2>
            <p className="text-gray-600 mb-4">The test you're looking for doesn't exist or you don't have access to it.</p>
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

  if (!isTestStarted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Test Information */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{test.title}</h1>
                <p className="text-gray-600 text-lg">{test.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Course</h3>
                  <p className="text-gray-600">{test.topic.course.title}</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Topic</h3>
                  <p className="text-gray-600">{test.topic.title}</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Questions</h3>
                  <p className="text-gray-600">{test.questions.length}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Instructions</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>This test has <strong>{test.questions.length}</strong> questions</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Time limit: <strong>{test.duration} minutes</strong></span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Total points: <strong>{test.totalPoints}</strong></span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>You can navigate between questions using the navigation buttons</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Make sure to submit your test before time runs out</span>
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <button
                  onClick={startTest}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold flex items-center space-x-2 mx-auto"
                >
                  <Play className="w-5 h-5" />
                  <span>Start Test</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const totalQuestions = test.questions.length;
  const answeredQuestions = answers.filter(a => a.answer).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Test Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-16 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/student/dashboard')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{test.title}</h1>
                <p className="text-sm text-gray-600">{test.topic.course.title} • {test.topic.title}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Timer */}
              <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg">
                <Timer className="w-5 h-5 text-red-600" />
                <span className={`font-mono font-semibold ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>

              {/* Progress */}
              <div className="text-sm text-gray-600">
                {answeredQuestions}/{totalQuestions} answered
              </div>

              {/* Pause/Resume Button */}
              <button
                onClick={togglePause}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  isPaused 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                }`}
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>

              {/* Submit Button */}
              <button
                onClick={handleSubmitTest}
                disabled={isTestSubmitted}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Test
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Question Navigation Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-32">
                <h3 className="font-semibold text-gray-900 mb-4">Question Navigation</h3>
                <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
                  {test.questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        index === currentQuestionIndex
                          ? 'bg-blue-600 text-white'
                          : getQuestionStatus(index) === 'answered'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{Math.round((answeredQuestions / totalQuestions) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(answeredQuestions / totalQuestions) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow p-8">
                {/* Question Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-500">
                      Question {currentQuestionIndex + 1} of {totalQuestions}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      currentQuestion.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                      currentQuestion.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {currentQuestion.difficulty}
                    </span>
                    <span className="text-sm text-gray-500">
                      {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Question Text */}
                <div className="mb-8">
                  <h2 className="text-xl font-medium text-gray-900 mb-4">{currentQuestion.text}</h2>
                </div>

                {/* Question Options */}
                {currentQuestion.type === 'MULTIPLE_CHOICE' && currentQuestion.options && (
                  <div className="space-y-3 mb-8">
                    {currentQuestion.options.map((option, index) => (
                      <label
                        key={index}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          getCurrentAnswer(currentQuestion.id) === option
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          value={option}
                          checked={getCurrentAnswer(currentQuestion.id) === option}
                          onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                          getCurrentAnswer(currentQuestion.id) === option
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {getCurrentAnswer(currentQuestion.id) === option && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="text-gray-900">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'TRUE_FALSE' && (
                  <div className="space-y-3 mb-8">
                    {['TRUE', 'FALSE'].map((option) => (
                      <label
                        key={option}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          getCurrentAnswer(currentQuestion.id) === option
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          value={option}
                          checked={getCurrentAnswer(currentQuestion.id) === option}
                          onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                          getCurrentAnswer(currentQuestion.id) === option
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {getCurrentAnswer(currentQuestion.id) === option && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="text-gray-900">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Question Navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <button
                    onClick={() => handleQuestionNavigation('prev')}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <div className="text-sm text-gray-500">
                    {currentQuestionIndex + 1} of {totalQuestions}
                  </div>

                  <button
                    onClick={() => handleQuestionNavigation('next')}
                    disabled={currentQuestionIndex === totalQuestions - 1}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Submit Test?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to submit your test? You won't be able to change your answers after submission.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSubmit}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Submit Test
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
