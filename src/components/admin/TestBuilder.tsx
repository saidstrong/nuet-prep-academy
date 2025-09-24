"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Clock, 
  Target, 
  BookOpen,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';

interface Question {
  id: string;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE' | 'SHORT_ANSWER' | 'ESSAY' | 'TRUE_FALSE';
  options: string[];
  correctAnswer: string | number[];
  points: number;
  order: number;
  explanation?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  timeLimit?: number; // in seconds
  tags?: string[];
}

interface Test {
  id?: string;
  title: string;
  description: string;
  duration: number; // in minutes
  totalPoints: number;
  passingScore: number; // percentage
  maxAttempts: number;
  isActive: boolean;
  isRandomized: boolean;
  showResults: boolean;
  allowReview: boolean;
  questions: Question[];
  instructions?: string;
  prerequisites?: string[];
}

interface TestBuilderProps {
  topicId: string;
  topicTitle: string;
  courseTitle: string;
  onSave: (test: Test) => void;
  onCancel: () => void;
  existingTest?: Test;
}

export default function TestBuilder({ 
  topicId, 
  topicTitle, 
  courseTitle, 
  onSave, 
  onCancel, 
  existingTest 
}: TestBuilderProps) {
  const [test, setTest] = useState<Test>(existingTest || {
    title: '',
    description: '',
    duration: 60,
    totalPoints: 100,
    passingScore: 70,
    maxAttempts: 3,
    isActive: true,
    isRandomized: false,
    showResults: true,
    allowReview: true,
    questions: [],
    instructions: '',
    prerequisites: []
  });

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionForm, setQuestionForm] = useState<Partial<Question>>({
    question: '',
    type: 'MULTIPLE_CHOICE',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 10,
    order: 1,
    explanation: '',
    difficulty: 'MEDIUM',
    timeLimit: 60,
    tags: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (existingTest) {
      setTest(existingTest);
    }
  }, [existingTest]);

  const addQuestion = () => {
    setQuestionForm({
      question: '',
      type: 'MULTIPLE_CHOICE',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 10,
      order: test.questions.length + 1,
      explanation: '',
      difficulty: 'MEDIUM',
      timeLimit: 60,
      tags: []
    });
    setEditingQuestion(null);
    setShowQuestionForm(true);
  };

  const editQuestion = (question: Question) => {
    setQuestionForm({
      ...question,
      options: [...question.options]
    });
    setEditingQuestion(question);
    setShowQuestionForm(true);
  };

  const saveQuestion = () => {
    if (!questionForm.question?.trim()) {
      setError('Question text is required');
      return;
    }

    if (questionForm.type === 'MULTIPLE_CHOICE' || questionForm.type === 'SINGLE_CHOICE') {
      if (!questionForm.options?.some(opt => opt.trim())) {
        setError('At least one option is required for multiple choice questions');
        return;
      }
    }

    if (!questionForm.correctAnswer) {
      setError('Correct answer is required');
      return;
    }

    const newQuestion: Question = {
      id: editingQuestion?.id || `q-${Date.now()}`,
      question: questionForm.question,
      type: questionForm.type as Question['type'],
      options: questionForm.options || [],
      correctAnswer: questionForm.correctAnswer,
      points: questionForm.points || 10,
      order: questionForm.order || test.questions.length + 1,
      explanation: questionForm.explanation,
      difficulty: questionForm.difficulty as Question['difficulty'],
      timeLimit: questionForm.timeLimit,
      tags: questionForm.tags || []
    };

    if (editingQuestion) {
      setTest(prev => ({
        ...prev,
        questions: prev.questions.map(q => q.id === editingQuestion.id ? newQuestion : q)
      }));
    } else {
      setTest(prev => ({
        ...prev,
        questions: [...prev.questions, newQuestion]
      }));
    }

    setShowQuestionForm(false);
    setEditingQuestion(null);
    setError('');
  };

  const deleteQuestion = (questionId: string) => {
    setTest(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const moveQuestion = (questionId: string, direction: 'up' | 'down') => {
    const questions = [...test.questions];
    const index = questions.findIndex(q => q.id === questionId);
    
    if (direction === 'up' && index > 0) {
      [questions[index], questions[index - 1]] = [questions[index - 1], questions[index]];
    } else if (direction === 'down' && index < questions.length - 1) {
      [questions[index], questions[index + 1]] = [questions[index + 1], questions[index]];
    }

    setTest(prev => ({
      ...prev,
      questions: questions.map((q, i) => ({ ...q, order: i + 1 }))
    }));
  };

  const duplicateQuestion = (question: Question) => {
    const newQuestion: Question = {
      ...question,
      id: `q-${Date.now()}`,
      order: test.questions.length + 1
    };
    setTest(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const handleSaveTest = async () => {
    if (!test.title.trim()) {
      setError('Test title is required');
      return;
    }

    if (test.questions.length === 0) {
      setError('At least one question is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/courses/tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicId,
          ...test,
          totalPoints: test.questions.reduce((sum, q) => sum + q.points, 0)
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess('Test saved successfully!');
        setTimeout(() => {
          onSave(result.test);
        }, 1500);
      } else {
        setError(result.error || 'Failed to save test');
      }
    } catch (error: any) {
      setError('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'MULTIPLE_CHOICE': return '☑️';
      case 'SINGLE_CHOICE': return '☑️';
      case 'SHORT_ANSWER': return '📝';
      case 'ESSAY': return '📄';
      case 'TRUE_FALSE': return '✅';
      default: return '❓';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'HARD': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Test Builder</h1>
          <p className="text-gray-600">
            {courseTitle} → {topicTitle}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveTest}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Test</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800">{success}</span>
        </div>
      )}

      {/* Test Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Title *
            </label>
            <input
              type="text"
              value={test.title}
              onChange={(e) => setTest(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter test title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={test.description}
              onChange={(e) => setTest(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe what this test covers"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructions
            </label>
            <textarea
              value={test.instructions || ''}
              onChange={(e) => setTest(prev => ({ ...prev, instructions: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Special instructions for students"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Duration (minutes)
              </label>
              <input
                type="number"
                value={test.duration}
                onChange={(e) => setTest(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Target className="w-4 h-4 inline mr-1" />
                Passing Score (%)
              </label>
              <input
                type="number"
                value={test.passingScore}
                onChange={(e) => setTest(prev => ({ ...prev, passingScore: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Attempts
            </label>
            <input
              type="number"
              value={test.maxAttempts}
              onChange={(e) => setTest(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={test.isActive}
                onChange={(e) => setTest(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Test is active</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={test.isRandomized}
                onChange={(e) => setTest(prev => ({ ...prev, isRandomized: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Randomize question order</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={test.showResults}
                onChange={(e) => setTest(prev => ({ ...prev, showResults: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Show results immediately</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={test.allowReview}
                onChange={(e) => setTest(prev => ({ ...prev, allowReview: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Allow answer review</span>
            </label>
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Questions ({test.questions.length})
          </h2>
          <button
            onClick={addQuestion}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>

        {test.questions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No questions added yet. Click "Add Question" to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {test.questions.map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm font-medium text-gray-500">
                        Q{index + 1}
                      </span>
                      <span className="text-lg">{getQuestionTypeIcon(question.type)}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty}
                      </span>
                      <span className="text-sm text-gray-500">
                        {question.points} points
                      </span>
                      {question.timeLimit && (
                        <span className="text-sm text-gray-500">
                          {question.timeLimit}s
                        </span>
                      )}
                    </div>
                    <p className="text-gray-900 mb-2">{question.question}</p>
                    {question.options.length > 0 && (
                      <div className="ml-4 space-y-1">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="text-sm text-gray-600">
                            {String.fromCharCode(65 + optIndex)}. {option}
                          </div>
                        ))}
                      </div>
                    )}
                    {question.explanation && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                        <strong>Explanation:</strong> {question.explanation}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => moveQuestion(question.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveQuestion(question.id, 'down')}
                      disabled={index === test.questions.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => duplicateQuestion(question)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => editQuestion(question)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteQuestion(question.id)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Question Form Modal */}
      {showQuestionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text *
                </label>
                <textarea
                  value={questionForm.question || ''}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, question: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your question"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Type
                  </label>
                  <select
                    value={questionForm.type}
                    onChange={(e) => setQuestionForm(prev => ({ 
                      ...prev, 
                      type: e.target.value as Question['type'],
                      options: e.target.value === 'MULTIPLE_CHOICE' || e.target.value === 'SINGLE_CHOICE' 
                        ? ['', '', '', ''] 
                        : []
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                    <option value="SINGLE_CHOICE">Single Choice</option>
                    <option value="SHORT_ANSWER">Short Answer</option>
                    <option value="ESSAY">Essay</option>
                    <option value="TRUE_FALSE">True/False</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={questionForm.difficulty}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, difficulty: e.target.value as Question['difficulty'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              {(questionForm.type === 'MULTIPLE_CHOICE' || questionForm.type === 'SINGLE_CHOICE') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Answer Options
                  </label>
                  {questionForm.options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-500 w-6">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(questionForm.options || [])];
                          newOptions[index] = e.target.value;
                          setQuestionForm(prev => ({ ...prev, options: newOptions }));
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correct Answer *
                </label>
                {questionForm.type === 'MULTIPLE_CHOICE' || questionForm.type === 'SINGLE_CHOICE' ? (
                  <select
                    value={questionForm.correctAnswer as string}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, correctAnswer: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select correct answer</option>
                    {questionForm.options?.map((option, index) => (
                      <option key={index} value={option}>
                        {String.fromCharCode(65 + index)}. {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={questionForm.correctAnswer as string}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, correctAnswer: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter correct answer"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points
                  </label>
                  <input
                    type="number"
                    value={questionForm.points}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Limit (seconds)
                  </label>
                  <input
                    type="number"
                    value={questionForm.timeLimit}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Explanation (optional)
                </label>
                <textarea
                  value={questionForm.explanation || ''}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, explanation: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Explain why this is the correct answer"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowQuestionForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveQuestion}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingQuestion ? 'Update Question' : 'Add Question'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}