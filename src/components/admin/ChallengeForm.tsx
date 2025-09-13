"use client";
import { useState, useEffect } from 'react';
import { Calendar, Users, Target, Zap, Award, Clock, X, AlertCircle, Plus, Trash2 } from 'lucide-react';

interface ChallengeFormProps {
  challenge?: any;
  events: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

interface Question {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  explanation?: string;
}

interface ChallengeData {
  name: string;
  description: string;
  type: 'INDIVIDUAL' | 'TEAM' | 'MIXED';
  startDate: string;
  endDate: string;
  eventId: string;
  maxParticipants: number;
  hasQuiz: boolean;
  quiz: {
    questions: Question[];
    totalPoints: number;
    passingScore: number;
  };
  rules: {
    timeLimit?: number;
    maxAttempts?: number;
    requiredScore?: number;
    teamSize?: number;
  };
  rewards: {
    points: number;
    badges: string[];
    achievements: string[];
    specialRewards: string[];
  };
}

export default function ChallengeForm({ challenge, events, onSubmit, onCancel, isEditing = false }: ChallengeFormProps) {
  const [formData, setFormData] = useState<ChallengeData>({
    name: '',
    description: '',
    type: 'INDIVIDUAL',
    startDate: '',
    endDate: '',
    eventId: '',
    maxParticipants: 100,
    hasQuiz: false,
    quiz: {
      questions: [],
      totalPoints: 0,
      passingScore: 70
    },
    rules: {
      timeLimit: 60,
      maxAttempts: 3,
      requiredScore: 70,
      teamSize: 4
    },
    rewards: {
      points: 100,
      badges: [],
      achievements: [],
      specialRewards: []
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (challenge && isEditing) {
      setFormData({
        name: challenge.name || '',
        description: challenge.description || '',
        type: challenge.type || 'INDIVIDUAL',
        startDate: challenge.startDate ? new Date(challenge.startDate).toISOString().slice(0, 16) : '',
        endDate: challenge.endDate ? new Date(challenge.endDate).toISOString().slice(0, 16) : '',
        eventId: challenge.eventId || '',
        maxParticipants: challenge.maxParticipants || 100,
        hasQuiz: challenge.hasQuiz || false,
        quiz: challenge.quiz || {
          questions: [],
          totalPoints: 0,
          passingScore: 70
        },
        rules: challenge.rules || {
          timeLimit: 60,
          maxAttempts: 3,
          requiredScore: 70,
          teamSize: 4
        },
        rewards: challenge.rewards || {
          points: 100,
          badges: [],
          achievements: [],
          specialRewards: []
        }
      });
    }
  }, [challenge, isEditing]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Challenge name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Challenge description is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (end <= start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (formData.maxParticipants < 1) {
      newErrors.maxParticipants = 'Max participants must be at least 1';
    }

    if (formData.rules.timeLimit && formData.rules.timeLimit < 1) {
      newErrors.timeLimit = 'Time limit must be at least 1 minute';
    }

    if (formData.rules.maxAttempts && formData.rules.maxAttempts < 1) {
      newErrors.maxAttempts = 'Max attempts must be at least 1';
    }

    if (formData.rules.requiredScore && (formData.rules.requiredScore < 0 || formData.rules.requiredScore > 100)) {
      newErrors.requiredScore = 'Required score must be between 0 and 100';
    }

    if (formData.rewards.points < 0) {
      newErrors.points = 'Points must be non-negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleRulesChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      rules: {
        ...prev.rules,
        [field]: value
      }
    }));
  };

  const handleRewardsChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      rewards: {
        ...prev.rewards,
        [field]: value
      }
    }));
  };

  const addRewardItem = (type: 'badges' | 'achievements' | 'specialRewards') => {
    const newItem = prompt(`Enter ${type.slice(0, -1)} name:`);
    if (newItem && newItem.trim()) {
      setFormData(prev => ({
        ...prev,
        rewards: {
          ...prev.rewards,
          [type]: [...prev.rewards[type], newItem.trim()]
        }
      }));
    }
  };

  const removeRewardItem = (type: 'badges' | 'achievements' | 'specialRewards', index: number) => {
    setFormData(prev => ({
      ...prev,
      rewards: {
        ...prev.rewards,
        [type]: prev.rewards[type].filter((_, i) => i !== index)
      }
    }));
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 10,
      explanation: ''
    };

    setFormData(prev => ({
      ...prev,
      quiz: {
        ...prev.quiz,
        questions: [...prev.quiz.questions, newQuestion],
        totalPoints: prev.quiz.totalPoints + newQuestion.points
      }
    }));
  };

  const updateQuestion = (questionId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      quiz: {
        ...prev.quiz,
        questions: prev.quiz.questions.map(q => {
          if (q.id === questionId) {
            const updatedQuestion = { ...q, [field]: value };
            
            // Recalculate total points if points changed
            if (field === 'points') {
              const oldPoints = q.points;
              const newPoints = value;
              const pointsDiff = newPoints - oldPoints;
              
              return {
                ...updatedQuestion,
                points: newPoints
              };
            }
            
            return updatedQuestion;
          }
          return q;
        })
      }
    }));

    // Recalculate total points
    setFormData(prev => ({
      ...prev,
      quiz: {
        ...prev.quiz,
        totalPoints: prev.quiz.questions.reduce((total, q) => total + q.points, 0)
      }
    }));
  };

  const removeQuestion = (questionId: string) => {
    setFormData(prev => {
      const questionToRemove = prev.quiz.questions.find(q => q.id === questionId);
      const newQuestions = prev.quiz.questions.filter(q => q.id !== questionId);
      
      return {
        ...prev,
        quiz: {
          ...prev.quiz,
          questions: newQuestions,
          totalPoints: newQuestions.reduce((total, q) => total + q.points, 0)
        }
      };
    });
  };

  const updateQuestionOption = (questionId: string, optionIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      quiz: {
        ...prev.quiz,
        questions: prev.quiz.questions.map(q => {
          if (q.id === questionId) {
            const newOptions = [...(q.options || [])];
            newOptions[optionIndex] = value;
            return { ...q, options: newOptions };
          }
          return q;
        })
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-4">Basic Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Challenge Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter challenge name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Challenge Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="INDIVIDUAL">Individual</option>
              <option value="TEAM">Team</option>
              <option value="MIXED">Mixed</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Describe the challenge objectives and requirements"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>
      </div>

      {/* Schedule */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-4">Schedule</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.startDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date & Time *
            </label>
            <input
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.endDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
          </div>
        </div>
      </div>

      {/* Event Association */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-4">Event Association</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Associated Event
            </label>
            <select
              value={formData.eventId}
              onChange={(e) => handleInputChange('eventId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">No event association</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name} ({event.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Participants
            </label>
            <input
              type="number"
              min="1"
              value={formData.maxParticipants}
              onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.maxParticipants ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.maxParticipants && <p className="text-red-500 text-sm mt-1">{errors.maxParticipants}</p>}
          </div>
        </div>
      </div>

      {/* Quiz Section */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Quiz Configuration</h4>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.hasQuiz}
              onChange={(e) => handleInputChange('hasQuiz', e.target.checked)}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <span className="text-sm font-medium text-gray-700">Include Quiz</span>
          </label>
        </div>

        {formData.hasQuiz && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.quiz.passingScore}
                  onChange={(e) => handleInputChange('quiz', {
                    ...formData.quiz,
                    passingScore: parseInt(e.target.value) || 70
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Quiz Points
                </label>
                <input
                  type="number"
                  value={formData.quiz.totalPoints}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
            </div>

            {/* Questions List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-gray-900">Quiz Questions</h5>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="bg-primary text-white px-3 py-1 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-1 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Question
                </button>
              </div>

              {formData.quiz.questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No questions added yet. Click "Add Question" to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.quiz.questions.map((question, index) => (
                    <div key={question.id} className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h6 className="font-medium text-gray-900">Question {index + 1}</h6>
                        <button
                          type="button"
                          onClick={() => removeQuestion(question.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        {/* Question Text */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Question Text *
                          </label>
                          <textarea
                            value={question.question}
                            onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Enter your question here..."
                          />
                        </div>

                        {/* Question Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Question Type
                          </label>
                          <select
                            value={question.type}
                            onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          >
                            <option value="multiple-choice">Multiple Choice</option>
                            <option value="true-false">True/False</option>
                            <option value="short-answer">Short Answer</option>
                          </select>
                        </div>

                        {/* Options for Multiple Choice */}
                        {question.type === 'multiple-choice' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Answer Options
                            </label>
                            <div className="space-y-2">
                              {question.options?.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500 w-6">
                                    {String.fromCharCode(65 + optionIndex)}.
                                  </span>
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => updateQuestionOption(question.id, optionIndex, e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Correct Answer */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Correct Answer *
                          </label>
                          {question.type === 'multiple-choice' ? (
                            <select
                              value={question.correctAnswer as string}
                              onChange={(e) => updateQuestion(question.id, 'correctAnswer', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                              <option value="">Select correct answer</option>
                              {question.options?.map((option, index) => (
                                <option key={index} value={String.fromCharCode(65 + index)}>
                                  {String.fromCharCode(65 + index)}. {option}
                                </option>
                              ))}
                            </select>
                          ) : question.type === 'true-false' ? (
                            <select
                              value={question.correctAnswer as string}
                              onChange={(e) => updateQuestion(question.id, 'correctAnswer', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                              <option value="">Select correct answer</option>
                              <option value="true">True</option>
                              <option value="false">False</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={question.correctAnswer as string}
                              onChange={(e) => updateQuestion(question.id, 'correctAnswer', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                              placeholder="Enter correct answer..."
                            />
                          )}
                        </div>

                        {/* Points */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Points
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={question.points}
                            onChange={(e) => updateQuestion(question.id, 'points', parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>

                        {/* Explanation */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Explanation (Optional)
                          </label>
                          <textarea
                            value={question.explanation || ''}
                            onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Explain why this is the correct answer..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Rules */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-4">Challenge Rules</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Limit (minutes)
            </label>
            <input
              type="number"
              min="1"
              value={formData.rules.timeLimit || ''}
              onChange={(e) => handleRulesChange('timeLimit', parseInt(e.target.value) || null)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.timeLimit ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="60"
            />
            {errors.timeLimit && <p className="text-red-500 text-sm mt-1">{errors.timeLimit}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Attempts
            </label>
            <input
              type="number"
              min="1"
              value={formData.rules.maxAttempts || ''}
              onChange={(e) => handleRulesChange('maxAttempts', parseInt(e.target.value) || null)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.maxAttempts ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="3"
            />
            {errors.maxAttempts && <p className="text-red-500 text-sm mt-1">{errors.maxAttempts}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Required Score (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.rules.requiredScore || ''}
              onChange={(e) => handleRulesChange('requiredScore', parseInt(e.target.value) || null)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.requiredScore ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="70"
            />
            {errors.requiredScore && <p className="text-red-500 text-sm mt-1">{errors.requiredScore}</p>}
          </div>

          {formData.type === 'TEAM' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Size
              </label>
              <input
                type="number"
                min="2"
                value={formData.rules.teamSize || ''}
                onChange={(e) => handleRulesChange('teamSize', parseInt(e.target.value) || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="4"
              />
            </div>
          )}
        </div>
      </div>

      {/* Rewards */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-4">Rewards</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Points Reward
            </label>
            <input
              type="number"
              min="0"
              value={formData.rewards.points}
              onChange={(e) => handleRewardsChange('points', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.points ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.points && <p className="text-red-500 text-sm mt-1">{errors.points}</p>}
          </div>

          {/* Badges */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Badges
              </label>
              <button
                type="button"
                onClick={() => addRewardItem('badges')}
                className="text-primary hover:text-primary-dark flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Badge
              </button>
            </div>
            <div className="space-y-2">
              {formData.rewards.badges.map((badge, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {badge}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeRewardItem('badges', index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Achievements
              </label>
              <button
                type="button"
                onClick={() => addRewardItem('achievements')}
                className="text-primary hover:text-primary-dark flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Achievement
              </button>
            </div>
            <div className="space-y-2">
              {formData.rewards.achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                    {achievement}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeRewardItem('achievements', index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Special Rewards */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Special Rewards
              </label>
              <button
                type="button"
                onClick={() => addRewardItem('specialRewards')}
                className="text-primary hover:text-primary-dark flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Reward
              </button>
            </div>
            <div className="space-y-2">
              {formData.rewards.specialRewards.map((reward, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                    {reward}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeRewardItem('specialRewards', index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              {isEditing ? 'Update Challenge' : 'Create Challenge'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
