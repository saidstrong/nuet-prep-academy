"use client";
import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, CheckCircle, XCircle, FileText, HelpCircle } from 'lucide-react';

interface QuestionCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionCreated: () => void;
  onQuestionUpdated: () => void;
  question?: Question | null;
  topics: Topic[];
}

interface Question {
  id: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topicId: string;
  points: number;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
}

interface Topic {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
}

interface QuestionFormData {
  text: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topicId: string;
  points: number;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export default function QuestionCreationModal({ 
  isOpen, 
  onClose, 
  onQuestionCreated, 
  onQuestionUpdated, 
  question, 
  topics 
}: QuestionCreationModalProps) {
  const [formData, setFormData] = useState<QuestionFormData>({
    text: '',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'MEDIUM',
    topicId: '',
    points: 1,
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!question;

  useEffect(() => {
    if (question) {
      setFormData({
        text: question.text,
        type: question.type,
        difficulty: question.difficulty,
        topicId: question.topicId,
        points: question.points,
        options: question.options || ['', '', '', ''],
        correctAnswer: question.correctAnswer || '',
        explanation: question.explanation || ''
      });
    } else {
      setFormData({
        text: '',
        type: 'MULTIPLE_CHOICE',
        difficulty: 'MEDIUM',
        topicId: '',
        points: 1,
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: ''
      });
    }
    setError('');
  }, [question]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    if (formData.options.length < 8) {
      setFormData(prev => ({ ...prev, options: [...prev.options, ''] }));
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, options: newOptions }));
      
      // Update correct answer if it was the removed option
      if (formData.correctAnswer === formData.options[index]) {
        setFormData(prev => ({ ...prev, correctAnswer: '' }));
      }
    }
  };

  const validateForm = () => {
    if (!formData.text.trim()) {
      setError('Question text is required');
      return false;
    }
    
    if (!formData.topicId) {
      setError('Please select a topic');
      return false;
    }
    
    if (formData.points < 1) {
      setError('Points must be at least 1');
      return false;
    }

    if (formData.type === 'MULTIPLE_CHOICE') {
      const validOptions = formData.options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        setError('Multiple choice questions must have at least 2 options');
        return false;
      }
      
      if (!formData.correctAnswer) {
        setError('Please select the correct answer');
        return false;
      }
    }

    if (formData.type === 'TRUE_FALSE' && !formData.correctAnswer) {
      setError('Please select the correct answer');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const url = isEditing 
        ? `/api/admin/test-questions/${question.id}`
        : '/api/admin/test-questions';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          options: formData.type === 'MULTIPLE_CHOICE' ? formData.options.filter(opt => opt.trim()) : undefined,
          correctAnswer: formData.type === 'MULTIPLE_CHOICE' || formData.type === 'TRUE_FALSE' ? formData.correctAnswer : undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'create'} question`);
      }

      if (isEditing) {
        onQuestionUpdated();
      } else {
        onQuestionCreated();
      }
      
      onClose();
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {getQuestionTypeIcon(formData.type)}
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Question' : 'Create New Question'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Question Type and Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Question Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                <option value="TRUE_FALSE">True/False</option>
                <option value="SHORT_ANSWER">Short Answer</option>
                <option value="ESSAY">Essay</option>
              </select>
            </div>

            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level *
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            <div>
              <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-2">
                Points *
              </label>
              <input
                type="number"
                id="points"
                name="points"
                value={formData.points}
                onChange={handleInputChange}
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Topic Selection */}
          <div>
            <label htmlFor="topicId" className="block text-sm font-medium text-gray-700 mb-2">
              Topic *
            </label>
            <select
              id="topicId"
              name="topicId"
              value={formData.topicId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select a topic</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.courseTitle} - {topic.title}
                </option>
              ))}
            </select>
          </div>

          {/* Question Text */}
          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
              Question Text *
            </label>
            <textarea
              id="text"
              name="text"
              value={formData.text}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your question here..."
            />
          </div>

          {/* Multiple Choice Options */}
          {formData.type === 'MULTIPLE_CHOICE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Answer Options *
              </label>
              <div className="space-y-3">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="correctAnswer"
                      value={option}
                      checked={formData.correctAnswer === option}
                      onChange={handleInputChange}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {formData.options.length < 8 && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Option</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* True/False Options */}
          {formData.type === 'TRUE_FALSE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Correct Answer *
              </label>
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="correctAnswer"
                    value="true"
                    checked={formData.correctAnswer === 'true'}
                    onChange={handleInputChange}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span>True</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="correctAnswer"
                    value="false"
                    checked={formData.correctAnswer === 'false'}
                    onChange={handleInputChange}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span>False</span>
                </label>
              </div>
            </div>
          )}

          {/* Explanation */}
          <div>
            <label htmlFor="explanation" className="block text-sm font-medium text-gray-700 mb-2">
              Explanation (Optional)
            </label>
            <textarea
              id="explanation"
              name="explanation"
              value={formData.explanation}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Explain why this answer is correct..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? 'Update Question' : 'Create Question'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
