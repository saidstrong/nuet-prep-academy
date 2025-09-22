"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Users, Clock, Star, PlayCircle, FileText, 
  Presentation, Video, Link, Search, Filter, ChevronRight,
  Award, Target, Calendar, DollarSign, Eye, Heart, Bookmark
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedHours: number;
  price: number;
  duration: string;
  maxStudents: number;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  totalTopics: number;
  totalMaterials: number;
  totalTests: number;
  enrolledStudents: number;
  completionRate: number;
  thumbnail?: string;
  rating?: number;
  reviews?: number;
}

export default function CoursesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterPrice, setFilterPrice] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCourses();
    if (session) {
      fetchUserPreferences();
    }
  }, [session]);

  const fetchUserPreferences = async () => {
    // Only fetch preferences if user is a student
    if (!session || session.user.role !== 'STUDENT') {
      return;
    }

    try {
      const [favoritesRes, bookmarksRes] = await Promise.all([
        fetch('/api/student/favorites', { credentials: 'include' }),
        fetch('/api/student/bookmarks', { credentials: 'include' })
      ]);

      if (favoritesRes.ok) {
        const favoritesData = await favoritesRes.json();
        const favoritesArray = favoritesData.favorites && Array.isArray(favoritesData.favorites) 
          ? favoritesData.favorites.map((f: any) => f.courseId) 
          : [];
        setFavorites(new Set(favoritesArray));
      }

      if (bookmarksRes.ok) {
        const bookmarksData = await bookmarksRes.json();
        const bookmarksArray = bookmarksData.bookmarks && Array.isArray(bookmarksData.bookmarks) 
          ? bookmarksData.bookmarks.map((b: any) => b.courseId) 
          : [];
        setBookmarks(new Set(bookmarksArray));
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching student courses...');
      const response = await fetch('/api/courses', { credentials: 'include' });
      
      console.log('📡 Student courses response status:', response.status);
      console.log('📡 Student courses response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📚 Student courses data received:', data);
        console.log('📚 Student courses array:', data.courses);
        console.log('📚 Student courses count:', data.courses?.length || 0);
        
        // Filter out test courses and only show real NUET courses
        const realCourses = (data.courses || []).filter((course: Course) => 
          course.id.startsWith('course-') && 
          course.title !== 'Test' && 
          course.title !== 'SAID' &&
          course.description !== 'Test' &&
          course.description !== 'Said'
        );
        
        setCourses(realCourses);
      } else {
        const errorData = await response.json();
        console.error('❌ Student courses API Error:', errorData);
      }
    } catch (error) {
      console.error('❌ Error fetching student courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || course.difficulty === filterDifficulty;
    const matchesPrice = filterPrice === 'all' || 
                        (filterPrice === 'free' && course.price === 0) ||
                        (filterPrice === 'paid' && course.price > 0);
    return matchesSearch && matchesDifficulty && matchesPrice && course.status === 'ACTIVE';
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewCourse = (courseId: string) => {
    router.push(`/courses/${courseId}`);
  };

  const handleToggleFavorite = async (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    const isCurrentlyFavorite = favorites.has(courseId);
    
    try {
      const response = await fetch('/api/courses/favorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          courseId, 
          isFavorite: !isCurrentlyFavorite 
        }),
      });

      if (response.ok) {
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          if (isCurrentlyFavorite) {
            newFavorites.delete(courseId);
          } else {
            newFavorites.add(courseId);
          }
          return newFavorites;
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleToggleBookmark = async (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    const isCurrentlyBookmarked = bookmarks.has(courseId);
    
    try {
      const response = await fetch('/api/courses/bookmark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          courseId, 
          isBookmarked: !isCurrentlyBookmarked 
        }),
      });

      if (response.ok) {
        setBookmarks(prev => {
          const newBookmarks = new Set(prev);
          if (isCurrentlyBookmarked) {
            newBookmarks.delete(courseId);
          } else {
            newBookmarks.add(courseId);
          }
          return newBookmarks;
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return '🟢';
      case 'INTERMEDIATE': return '🟡';
      case 'ADVANCED': return '🔴';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Amazing Courses
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Learn from the best instructors and advance your skills
            </p>
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search courses, instructors, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg rounded-lg text-gray-900 focus:ring-4 focus:ring-blue-300 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
              <select
                value={filterPrice}
                onChange={(e) => setFilterPrice(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Prices</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">Try adjusting your search or filters to find more courses.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group cursor-pointer"
                onClick={() => router.push(`/courses/${course.id}`)}
              >
                {/* Course Thumbnail */}
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                      {getDifficultyIcon(course.difficulty)} {course.difficulty}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <button 
                      onClick={(e) => handleToggleFavorite(course.id, e)}
                      className={`p-2 rounded-full transition-colors ${
                        favorites.has(course.id) 
                          ? 'bg-red-500 bg-opacity-80 hover:bg-opacity-100' 
                          : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                      }`}
                    >
                      <Heart className={`w-5 h-5 text-white ${favorites.has(course.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">{course.rating || 4.5}</span>
                        <span className="text-sm opacity-75">({course.reviews || 0} reviews)</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {course.price === 0 ? 'Free' : `${course.price.toLocaleString()} ₸`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-6">
                  <div className="mb-3">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{course.description}</p>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Users className="w-4 h-4 mr-2" />
                      <span>by {course.instructor}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {course.estimatedHours}h
                      </span>
                      <span className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {course.totalTopics} topics
                      </span>
                      <span className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        {course.totalMaterials || 0} materials
                      </span>
                      <span className="flex items-center">
                        <Target className="w-4 h-4 mr-1" />
                        {course.totalTests} tests
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{course.enrolledStudents} enrolled</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={() => handleViewCourse(course.id)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Course
                      </button>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={(e) => handleToggleFavorite(course.id, e)}
                          className={`p-2 transition-colors ${
                            favorites.has(course.id) 
                              ? 'text-red-500' 
                              : 'text-gray-400 hover:text-red-500'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${favorites.has(course.id) ? 'fill-current' : ''}`} />
                        </button>
                        <button 
                          onClick={(e) => handleToggleBookmark(course.id, e)}
                          className={`p-2 transition-colors ${
                            bookmarks.has(course.id) 
                              ? 'text-blue-500' 
                              : 'text-gray-400 hover:text-blue-500'
                          }`}
                        >
                          <Bookmark className={`w-5 h-5 ${bookmarks.has(course.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to start learning?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of students who are already advancing their skills
            </p>
            {!session ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/auth/signup')}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Get Started Free
                </button>
                <button
                  onClick={() => router.push('/auth/signin')}
                  className="px-8 py-3 border border-white text-white rounded-lg hover:bg-white hover:text-gray-900 transition-colors"
                >
                  Sign In
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push('/my-courses')}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View My Courses
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}