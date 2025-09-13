'use client';

import { useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Save, X, CheckCircle, Circle, FileText, Edit2 } from 'lucide-react';

interface Question {
  id: string;
  questionText: string;
  type: 'singleChoice' | 'multipleChoice' | 'shortAnswer';
  options?: string[];
  correctOptions?: number[];
  correctAnswer?: string;
}

interface Test {
  id: string;
  name: string;
  questions: Question[];
}

interface TestBuilderProps {
  test?: Test;
  topicId: string;
  subtopicId?: string;
  onClose: () => void;
  onSave: (test: Test) => void;
}

export default function TestBuilder({ test, topicId, subtopicId, onClose, onSave }: TestBuilderProps) {
  const [testData, setTestData] = useState<Test>(test || {
    id: `test-${Date.now()}`,
    name: 'New Test',
    questions: []
  });

  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<'singleChoice' | 'multipleChoice' | 'shortAnswer'>('singleChoice');
  const [newQuestionOptions, setNewQuestionOptions] = useState<string[]>(['']);
  const [newQuestionCorrectAnswer, setNewQuestionCorrectAnswer] = useState('');
  const [newQuestionCorrectOptions, setNewQuestionCorrectOptions] = useState<number[]>([]);

  const addQuestion = () => {
    if (!newQuestionText.trim()) return;

    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      questionText: newQuestionText.trim(),
      type: newQuestionType,
      options: newQuestionType !== 'shortAnswer' ? newQuestionOptions.filter(opt => opt.trim()) : undefined,
      correctOptions: newQuestionType !== 'shortAnswer' ? newQuestionCorrectOptions : undefined,
      correctAnswer: newQuestionType === 'shortAnswer' ? newQuestionCorrectAnswer : undefined
    };

    setTestData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));

    // Reset form
    setNewQuestionText('');
    setNewQuestionType('singleChoice');
    setNewQuestionOptions(['']);
    setNewQuestionCorrectAnswer('');
    setNewQuestionCorrectOptions([]);
    setEditingQuestion(null);
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setTestData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      )
    }));
  };

  const deleteQuestion = (questionId: string) => {
    setTestData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const moveQuestion = (questionId: string, direction: 'up' | 'down') => {
    setTestData(prev => {
      const questions = [...prev.questions];
      const index = questions.findIndex(q => q.id === questionId);
      
      if (direction === 'up' && index > 0) {
        [questions[index], questions[index - 1]] = [questions[index - 1], questions[index]];
      } else if (direction === 'down' && index < questions.length - 1) {
        [questions[index], questions[index + 1]] = [questions[index + 1], questions[index]];
      }
      
      return { ...prev, questions };
    });
  };

  const addOption = (questionId: string) => {
    updateQuestion(questionId, {
      options: [...(testData.questions.find(q => q.id === questionId)?.options || []), '']
    });
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = testData.questions.find(q => q.id === questionId);
    if (!question?.options) return;

    const newOptions = [...question.options];
    newOptions[optionIndex] = value;
    updateQuestion(questionId, { options: newOptions });
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = testData.questions.find(q => q.id === questionId);
    if (!question?.options || question.options.length <= 1) return;

    const newOptions = question.options.filter((_, index) => index !== optionIndex);
    const newCorrectOptions = question.correctOptions?.filter(opt => opt !== optionIndex)
      .map(opt => opt > optionIndex ? opt - 1 : opt) || [];
    
    updateQuestion(questionId, { 
      options: newOptions,
      correctOptions: newCorrectOptions
    });
  };

  const toggleCorrectOption = (questionId: string, optionIndex: number) => {
    const question = testData.questions.find(q => q.id === questionId);
    if (!question?.correctOptions) return;

    const newCorrectOptions = question.correctOptions.includes(optionIndex)
      ? question.correctOptions.filter(opt => opt !== optionIndex)
      : [...question.correctOptions, optionIndex];
    
    updateQuestion(questionId, { correctOptions: newCorrectOptions });
  };

  const handleSave = () => {
    if (!testData.name.trim()) {
      alert('Please enter a test name');
      return;
    }

    if (testData.questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    onSave(testData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <input
              type="text"
              value={testData.name}
              onChange={(e) => setTestData(prev => ({ ...prev, name: e.target.value }))}
              className="text-xl font-semibold bg-transparent border-none outline-none w-full"
              placeholder="Enter test name"
            />
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Test
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Questions List */}
          <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Questions ({testData.questions.length})</h3>
              
              {/* Add Question Button */}
              <button
                onClick={() => setEditingQuestion('new')}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors mb-4"
              >
                <Plus className="w-5 h-5 mx-auto mb-2" />
                Add Question
              </button>

              {/* New Question Form */}
              {editingQuestion === 'new' && (
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 mb-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question Text *
                      </label>
                      <textarea
                        value={newQuestionText}
                        onChange={(e) => setNewQuestionText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Enter your question"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question Type *
                      </label>
                      <select
                        value={newQuestionType}
                        onChange={(e) => {
                          setNewQuestionType(e.target.value as any);
                          if (e.target.value === 'shortAnswer') {
                            setNewQuestionOptions(['']);
                            setNewQuestionCorrectOptions([]);
                          } else {
                            setNewQuestionCorrectAnswer('');
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="singleChoice">Single Choice</option>
                        <option value="multipleChoice">Multiple Choice</option>
                        <option value="shortAnswer">Short Answer</option>
                      </select>
                    </div>

                    {/* Options for choice questions */}
                    {newQuestionType !== 'shortAnswer' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Answer Options *
                        </label>
                        <div className="space-y-2">
                          {newQuestionOptions.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...newQuestionOptions];
                                  newOptions[index] = e.target.value;
                                  setNewQuestionOptions(newOptions);
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder={`Option ${index + 1}`}
                              />
                              <button
                                onClick={() => {
                                  const newOptions = newQuestionOptions.filter((_, i) => i !== index);
                                  setNewQuestionOptions(newOptions);
                                }}
                                className="p-2 text-red-600 hover:bg-red-100 rounded"
                                disabled={newQuestionOptions.length <= 1}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => setNewQuestionOptions([...newQuestionOptions, ''])}
                            className="flex items-center px-3 py-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Option
                          </button>
                        </div>

                        {/* Correct Answer Selection */}
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Correct Answer{newQuestionType === 'multipleChoice' ? 's' : ''} *
                          </label>
                          <div className="space-y-2">
                            {newQuestionOptions.map((option, index) => (
                              <label key={index} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type={newQuestionType === 'singleChoice' ? 'radio' : 'checkbox'}
                                  name="correctAnswer"
                                  checked={newQuestionCorrectOptions.includes(index)}
                                  onChange={() => {
                                    if (newQuestionType === 'singleChoice') {
                                      setNewQuestionCorrectOptions([index]);
                                    } else {
                                      const newCorrect = newQuestionCorrectOptions.includes(index)
                                        ? newQuestionCorrectOptions.filter(opt => opt !== index)
                                        : [...newQuestionCorrectOptions, index];
                                      setNewQuestionCorrectOptions(newCorrect);
                                    }
                                  }}
                                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{option || `Option ${index + 1}`}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Correct Answer for short answer */}
                    {newQuestionType === 'shortAnswer' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Correct Answer *
                        </label>
                        <input
                          type="text"
                          value={newQuestionCorrectAnswer}
                          onChange={(e) => setNewQuestionCorrectAnswer(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter the correct answer"
                        />
                      </div>
                    )}

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => {
                          setEditingQuestion(null);
                          setNewQuestionText('');
                          setNewQuestionType('singleChoice');
                          setNewQuestionOptions(['']);
                          setNewQuestionCorrectAnswer('');
                          setNewQuestionCorrectOptions([]);
                        }}
                        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={addQuestion}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Add Question
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-3">
                {testData.questions.map((question, index) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    index={index}
                    totalQuestions={testData.questions.length}
                    onUpdate={updateQuestion}
                    onDelete={deleteQuestion}
                    onMove={moveQuestion}
                    onAddOption={addOption}
                    onUpdateOption={updateOption}
                    onRemoveOption={removeOption}
                    onToggleCorrectOption={toggleCorrectOption}
                  />
                ))}
              </div>

              {testData.questions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No questions yet. Click "Add Question" to get started.</p>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="w-1/2 p-6 bg-gray-50 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <div className="space-y-6">
              {testData.questions.map((question, index) => (
                <div key={question.id} className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">
                    {index + 1}. {question.questionText}
                  </h4>
                  
                  {question.type === 'shortAnswer' ? (
                    <div>
                      <input
                        type="text"
                        placeholder="Your answer..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Correct answer: {question.correctAnswer}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {question.options?.map((option, optionIndex) => (
                        <label key={optionIndex} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type={question.type === 'singleChoice' ? 'radio' : 'checkbox'}
                            name={`question-${question.id}`}
                            disabled
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm text-gray-700">{option}</span>
                          {question.correctOptions?.includes(optionIndex) && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Question Card Component
interface QuestionCardProps {
  question: Question;
  index: number;
  totalQuestions: number;
  onUpdate: (questionId: string, updates: Partial<Question>) => void;
  onDelete: (questionId: string) => void;
  onMove: (questionId: string, direction: 'up' | 'down') => void;
  onAddOption: (questionId: string) => void;
  onUpdateOption: (questionId: string, optionIndex: number, value: string) => void;
  onRemoveOption: (questionId: string, optionIndex: number) => void;
  onToggleCorrectOption: (questionId: string, optionIndex: number) => void;
}

function QuestionCard({
  question,
  index,
  totalQuestions,
  onUpdate,
  onDelete,
  onMove,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
  onToggleCorrectOption
}: QuestionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(question.questionText);

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate(question.id, { questionText: editText.trim() });
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onMove(question.id, 'up')}
            disabled={index === 0}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMove(question.id, 'down')}
            disabled={index === totalQuestions - 1}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(question.id)}
            className="p-1 text-red-600 hover:bg-red-100 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
            autoFocus
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditText(question.questionText);
              }}
              className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-900 mb-3">{question.questionText}</p>
          
          {question.type === 'shortAnswer' ? (
            <div>
              <input
                type="text"
                placeholder="Your answer..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                Correct: {question.correctAnswer}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {question.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <input
                    type={question.type === 'singleChoice' ? 'radio' : 'checkbox'}
                    name={`question-${question.id}`}
                    disabled
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700 flex-1">{option}</span>
                  {question.correctOptions?.includes(optionIndex) && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                </div>
              ))}
              
              <button
                onClick={() => onAddOption(question.id)}
                className="flex items-center text-xs text-blue-600 hover:text-blue-700 mt-2"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Option
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
