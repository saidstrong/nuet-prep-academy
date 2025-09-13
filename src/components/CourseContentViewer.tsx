"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Skeleton } from '@/components/ui/Skeleton';
import { 
  BookOpen, 
  Play, 
  FileText, 
  Video, 
  Download, 
  CheckCircle, 
  Clock,
  Star,
  MessageCircle,
  Bookmark,
  Share2
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface CourseContent {
  id: string;
  type: 'video' | 'text' | 'pdf' | 'quiz' | 'assignment';
  title: string;
  description: string;
  duration?: number; // in minutes
  isCompleted?: boolean;
  isLocked?: boolean;
  order: number;
  thumbnail?: string;
  url?: string;
  questions?: QuizQuestion[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface CourseContentViewerProps {
  courseId: string;
  onContentComplete?: (contentId: string) => void;
  onQuizSubmit?: (contentId: string, answers: Record<string, number>) => void;
}

const CourseContentViewer: React.FC<CourseContentViewerProps> = ({
  courseId,
  onContentComplete,
  onQuizSubmit
}) => {
  const [content, setContent] = useState<CourseContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<CourseContent | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    fetchCourseContent();
  }, [courseId]);

  const fetchCourseContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${courseId}/content`);
      const data = await response.json();
      
      if (data.success) {
        setContent(data.content);
        if (data.content.length > 0) {
          setSelectedContent(data.content[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching course content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'text':
        return <FileText className="w-5 h-5" />;
      case 'pdf':
        return <FileText className="w-5 h-5" />;
      case 'quiz':
        return <BookOpen className="w-5 h-5" />;
      case 'assignment':
        return <FileText className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'text':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pdf':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'quiz':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'assignment':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const handleContentComplete = (contentId: string) => {
    setContent(prev => prev.map(item => 
      item.id === contentId 
        ? { ...item, isCompleted: true }
        : item
    ));
    onContentComplete?.(contentId);
  };

  const handleQuizAnswer = (questionId: string, answerIndex: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleQuizSubmit = () => {
    if (selectedContent) {
      onQuizSubmit?.(selectedContent.id, quizAnswers);
      setQuizSubmitted(true);
      handleContentComplete(selectedContent.id);
    }
  };

  const renderContent = () => {
    if (!selectedContent) return null;

    switch (selectedContent.type) {
      case 'video':
        return (
          <div className="space-y-4">
            <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <Play className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg font-medium">Video Content</p>
                <p className="text-sm opacity-75">{selectedContent.title}</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-slate-600">{selectedContent.description}</p>
              <Button onClick={() => handleContentComplete(selectedContent.id)}>
                Mark as Complete
              </Button>
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold mb-4">{selectedContent.title}</h2>
              <div className="text-slate-700 leading-relaxed">
                {selectedContent.description}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-500">
                Estimated reading time: {selectedContent.duration || 5} minutes
              </p>
              <Button onClick={() => handleContentComplete(selectedContent.id)}>
                Mark as Complete
              </Button>
            </div>
          </div>
        );

      case 'quiz':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">{selectedContent.title}</h2>
              <p className="text-slate-600">{selectedContent.description}</p>
            </div>
            
            {selectedContent.questions?.map((question, index) => (
              <Card key={question.id}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Question {index + 1}: {question.question}
                  </h3>
                  <div className="space-y-3">
                    {question.options.map((option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-slate-50"
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={optionIndex}
                          checked={quizAnswers[question.id] === optionIndex}
                          onChange={() => handleQuizAnswer(question.id, optionIndex)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="flex-1">{option}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-500">
                {Object.keys(quizAnswers).length} of {selectedContent.questions?.length || 0} questions answered
              </p>
              <Button 
                onClick={handleQuizSubmit}
                disabled={Object.keys(quizAnswers).length !== (selectedContent.questions?.length || 0)}
              >
                Submit Quiz
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600">Content type not supported yet</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Content List */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Course Content</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {content.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedContent(item)}
                  className={`w-full text-left p-4 border-b last:border-b-0 transition-colors ${
                    selectedContent?.id === item.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'hover:bg-slate-50'
                  } ${item.isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={item.isLocked}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getContentIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-slate-900 truncate">
                          {item.title}
                        </h4>
                        {item.isCompleted && (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getContentTypeColor(item.type)}`}
                        >
                          {item.type}
                        </Badge>
                        {item.duration && (
                          <span className="text-xs text-slate-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {item.duration}m
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Viewer */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">
                  {selectedContent?.title || 'Select content to view'}
                </CardTitle>
                {selectedContent && (
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={getContentTypeColor(selectedContent.type)}>
                      {selectedContent.type}
                    </Badge>
                    {selectedContent.duration && (
                      <span className="text-sm text-slate-500 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {selectedContent.duration} minutes
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Bookmark className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {selectedContent ? (
              renderContent()
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600">Select content from the sidebar to view</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CourseContentViewer;
