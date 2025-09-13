"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, truncateText } from '@/lib/utils';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  ChevronRight, 
  Heart, 
  Bookmark,
  PlayCircle,
  Award
} from 'lucide-react';

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    instructor: string;
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    estimatedHours: number;
    price: number;
    duration: string;
    maxStudents: number;
    status: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    topics?: Array<{
      id: string;
      title: string;
      description: string;
      order: number;
    }>;
    enrollments?: Array<{
      id: string;
      status: string;
      enrolledAt: string;
    }>;
    totalTopics?: number;
    enrolledStudents?: number;
    completionRate?: number;
    rating?: number;
    reviews?: number;
  };
  onEnroll?: (courseId: string) => void;
  onFavorite?: (courseId: string) => void;
  onBookmark?: (courseId: string) => void;
  isFavorited?: boolean;
  isBookmarked?: boolean;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onEnroll,
  onFavorite,
  onBookmark,
  isFavorited = false,
  isBookmarked = false,
  showActions = true,
  variant = 'default'
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'INTERMEDIATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ADVANCED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return '🟢';
      case 'INTERMEDIATE':
        return '🟡';
      case 'ADVANCED':
        return '🔴';
      default:
        return '⚪';
    }
  };

  if (variant === 'compact') {
    return (
      <Card 
        className="group hover:shadow-lg transition-all duration-200 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={`/courses/${course.id}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <h3 className="font-semibold text-slate-900 truncate">
                    {course.title}
                  </h3>
                </div>
                <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                  {truncateText(course.description, 100)}
                </p>
                <div className="flex items-center space-x-4 text-xs text-slate-500">
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {course.duration}
                  </span>
                  <span className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {course.enrolledStudents || 0}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">
                  {formatCurrency(course.price)}
                </div>
                <Badge className={`text-xs ${getDifficultyColor(course.difficulty)}`}>
                  {course.difficulty}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  }

  if (variant === 'featured') {
    return (
      <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <Link href={`/courses/${course.id}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    Featured
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </CardTitle>
                <p className="text-slate-600 mt-1">
                  by {course.instructor}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(course.price)}
                </div>
                <div className="text-sm text-slate-500">
                  {course.duration}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-slate-700 mb-4 line-clamp-3">
              {course.description}
            </p>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {course.estimatedHours}h
                </span>
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {course.enrolledStudents || 0} students
                </span>
                <span className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  {course.totalTopics || 0} topics
                </span>
              </div>
              <Badge className={getDifficultyColor(course.difficulty)}>
                {getDifficultyIcon(course.difficulty)} {course.difficulty}
              </Badge>
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  }

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-200 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/courses/${course.id}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                {course.title}
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                by {course.instructor}
              </p>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              {showActions && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      onFavorite?.(course.id);
                    }}
                    className="p-2"
                  >
                    <Heart className={`w-4 h-4 ${isFavorited ? 'text-red-500 fill-current' : 'text-slate-400'}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      onBookmark?.(course.id);
                    }}
                    className="p-2"
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'text-blue-500 fill-current' : 'text-slate-400'}`} />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-slate-700 mb-4 line-clamp-3">
            {course.description}
          </p>
          
          <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {course.duration}
              </span>
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {course.enrolledStudents || 0}
              </span>
              <span className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1" />
                {course.totalTopics || 0} topics
              </span>
            </div>
            <Badge className={getDifficultyColor(course.difficulty)}>
              {getDifficultyIcon(course.difficulty)} {course.difficulty}
            </Badge>
          </div>

          {course.rating && (
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(course.rating || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-slate-600">
                {course.rating} ({course.reviews || 0} reviews)
              </span>
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-0">
          <div className="flex items-center justify-between w-full">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(course.price)}
            </div>
            {showActions && onEnroll && (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  onEnroll(course.id);
                }}
                className="group-hover:bg-blue-700 transition-colors"
              >
                Enroll Now
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
};

export default CourseCard;