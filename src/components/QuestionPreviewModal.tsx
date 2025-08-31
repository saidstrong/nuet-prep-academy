"use client";
import { X, CheckCircle, XCircle, FileText, HelpCircle, Target, BookOpen } from 'lucide-react';

interface QuestionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
}

interface Question {
  id: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topicId: string;
  topicTitle: string;
  courseId: string;
  courseTitle: string;
  points: number;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  createdAt: string;
  updatedAt: string;
}

export default function QuestionPreviewModal({ isOpen, onClose, question }: QuestionPreviewModalProps) {
  if (!isOpen || !question) return null;

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'MULTIPLE_CHOICE':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'TRUE_FALSE':
        return <XCircle className="w-5 h-5 text-green-600" />;
      case 'SHORT_ANSWER':
        return <FileText className="w-5 h-5 text-purple-600" />;
      case 'ESSAY':
        return <HelpCircle className="w-5 h-5 text-orange-600" />;
      default:
        return <HelpCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-100 text-green-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'HARD':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'MULTIPLE_CHOICE':
        return 'Multiple Choice';
      case 'TRUE_FALSE':
        return 'True/False';
      case 'SHORT_ANSWER':
        return 'Short Answer';
      case 'ESSAY':
        return 'Essay';
      default:
        return type;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {getQuestionTypeIcon(question.type)}
            <h2 className="text-xl font-semibold text-gray-900">Question Preview</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Question Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <BookOpen className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Course</span>
              </div>
              <p className="text-sm text-gray-900">{question.courseTitle}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Topic</span>
              </div>
              <p className="text-sm text-gray-900">{question.topicTitle}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-gray-700">Points</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{question.points} pts</p>
            </div>
          </div>

          {/* Question Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Question Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getQuestionTypeIcon(question.type)}
                    <span className="text-sm text-gray-900">{getQuestionTypeLabel(question.type)}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getDifficultyColor(question.difficulty)}`}>
                    {question.difficulty}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Metadata</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>Created: {new Date(question.createdAt).toLocaleDateString()}</div>
                <div>Updated: {new Date(question.updatedAt).toLocaleDateString()}</div>
                <div>ID: {question.id}</div>
              </div>
            </div>
          </div>

          {/* Question Text */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Question</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-900 leading-relaxed">{question.text}</p>
            </div>
          </div>

          {/* Answer Options */}
          {question.type === 'MULTIPLE_CHOICE' && question.options && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Answer Options</h3>
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg border ${
                      option === question.correctAnswer 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        option === question.correctAnswer 
                          ? 'border-green-500 bg-green-500' 
                          : 'border-gray-300'
                      }`}>
                        {option === question.correctAnswer && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className={`text-sm ${
                        option === question.correctAnswer 
                          ? 'text-green-800 font-medium' 
                          : 'text-gray-700'
                      }`}>
                        {option}
                      </span>
                      {option === question.correctAnswer && (
                        <span className="text-xs text-green-600 font-medium">(Correct Answer)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* True/False Answer */}
          {question.type === 'TRUE_FALSE' && question.correctAnswer && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Correct Answer</h3>
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium capitalize">{question.correctAnswer}</span>
                </div>
              </div>
            </div>
          )}

          {/* Short Answer / Essay Instructions */}
          {(question.type === 'SHORT_ANSWER' || question.type === 'ESSAY') && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Answer Instructions</h3>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">
                    {question.type === 'SHORT_ANSWER' ? 'Short Answer' : 'Essay'} Question
                  </span>
                </div>
                <p className="text-blue-700 text-sm">
                  {question.type === 'SHORT_ANSWER' 
                    ? 'Students will provide a brief written response to this question.'
                    : 'Students will provide a detailed written response to this question.'
                  }
                </p>
              </div>
            </div>
          )}

          {/* Explanation */}
          {question.explanation && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Explanation</h3>
              <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                <p className="text-purple-800 text-sm leading-relaxed">{question.explanation}</p>
              </div>
            </div>
          )}

          {/* Student View Preview */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">How Students Will See This Question</h3>
            <div className="bg-gray-900 text-white p-6 rounded-lg">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Question {question.id.slice(-4)}</span>
                  <span className="text-sm text-gray-300">{question.points} points</span>
                </div>
                <p className="text-white leading-relaxed">{question.text}</p>
              </div>

              {question.type === 'MULTIPLE_CHOICE' && question.options && (
                <div className="space-y-2">
                  {question.options.map((option, index) => (
                    <label key={index} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded">
                      <input 
                        type="radio" 
                        name="preview" 
                        className="text-blue-500 focus:ring-blue-500"
                        disabled
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'TRUE_FALSE' && (
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded">
                    <input type="radio" name="preview" className="text-blue-500 focus:ring-blue-500" disabled />
                    <span className="text-sm">True</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded">
                    <input type="radio" name="preview" className="text-blue-500 focus:ring-blue-500" disabled />
                    <span className="text-sm">False</span>
                  </label>
                </div>
              )}

              {(question.type === 'SHORT_ANSWER' || question.type === 'ESSAY') && (
                <div>
                  <textarea
                    placeholder={`Enter your ${question.type === 'SHORT_ANSWER' ? 'short answer' : 'essay response'} here...`}
                    rows={question.type === 'SHORT_ANSWER' ? 3 : 6}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
