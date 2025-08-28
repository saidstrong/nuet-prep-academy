"use client";
import { useState, useEffect, useRef } from 'react';
import { X, Clock, CheckCircle, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  type: string;
  order: number;
  options: {
    id: string;
    text: string;
    order: number;
  }[];
}

interface Test {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalPoints: number;
  questions: Question[];
}

interface TestTakingModalProps {
  isOpen: boolean;
  onClose: () => void;
  test: Test;
  onTestComplete: (submission: any) => void;
}

export default function TestTakingModal({ isOpen, onClose, test, onTestComplete }: TestTakingModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(test.duration * 60); // Convert to seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isOpen, timeRemaining]);

  const handleAutoSubmit = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    handleSubmitTest();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitTest = async () => {
    setIsSubmitting(true);
    
    try {
      const answersArray = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId,
      }));

      const timeSpent = (test.duration * 60) - timeRemaining;

      const response = await fetch('/api/tests/take', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testId: test.id,
          answers: answersArray,
          timeSpent,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onTestComplete(data.submission);
        onClose();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to submit test');
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('An error occurred while submitting the test');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion = test.questions[currentQuestionIndex];
  const answeredQuestions = Object.keys(answers).length;
  const progressPercentage = (answeredQuestions / test.questions.length) * 100;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">{test.title}</h3>
              <p className="text-slate-600 text-sm">{test.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress and Timer */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-red-600">
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <div className="text-sm text-slate-600">
                {answeredQuestions} of {test.questions.length} questions answered
              </div>
            </div>
            <div className="text-sm text-slate-600">
              {test.totalPoints} points total
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3 bg-slate-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Question Navigation */}
        <div className="border-b border-slate-200 p-4 bg-slate-50">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
            
            <div className="text-sm text-slate-600">
              Question {currentQuestionIndex + 1} of {test.questions.length}
            </div>
            
            <button
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === test.questions.length - 1}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Question Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="mb-6">
            <h4 className="text-lg font-medium text-slate-900 mb-4">
              {currentQuestion.text}
            </h4>
            
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option.id}
                    checked={answers[currentQuestion.id] === option.id}
                    onChange={() => handleAnswerSelect(currentQuestion.id, option.id)}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-slate-700">{option.text}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-6 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              {answeredQuestions === test.questions.length ? (
                <span className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  All questions answered
                </span>
              ) : (
                <span className="flex items-center text-amber-600">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {test.questions.length - answeredQuestions} questions remaining
                </span>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmSubmit(true)}
                disabled={isSubmitting || answeredQuestions < test.questions.length}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Test'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Confirm Submission</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to submit your test? You cannot change your answers after submission.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Review Again
              </button>
              <button
                onClick={() => {
                  setShowConfirmSubmit(false);
                  handleSubmitTest();
                }}
                className="flex-1 btn-primary"
              >
                Submit Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
