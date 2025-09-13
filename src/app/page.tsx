"use client";
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import Reveal from '@/components/Reveal';
import { BookOpen, Users, Clock, Target, FileText, PlayCircle, Download } from 'lucide-react';

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
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  totalTopics: number;
  totalTests: number;
  enrolledStudents: number;
  createdAt: string;
  updatedAt: string;
}

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        // Filter out test courses and only show real NUET courses
        const realCourses = (data.courses || []).filter((course: Course) => 
          course.id.startsWith('course-') && 
          course.title !== 'Test' && 
          course.title !== 'SAID' &&
          course.description !== 'Test' &&
          course.description !== 'Said'
        );
        setCourses(realCourses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'text-green-600 bg-green-100';
      case 'INTERMEDIATE': return 'text-yellow-600 bg-yellow-100';
      case 'ADVANCED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMaterialTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FileText className="w-4 h-4" />;
      case 'VIDEO': return <PlayCircle className="w-4 h-4" />;
      case 'AUDIO': return <PlayCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <main>
      <Header />
      <Hero />
      <section className="container-section py-12">
        <div className="grid gap-6 sm:grid-cols-3">
          <Reveal>
            <div className="rounded-xl border border-slate-200 p-6 bg-white">
            <h3 className="font-semibold text-slate-900">Comprehensive NUET Preparation</h3>
            <p className="text-slate-600 mt-2">Complete curriculum covering Mathematics, Critical Thinking, and English sections of the NUET exam.</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-xl border border-slate-200 p-6 bg-white">
            <h3 className="font-semibold text-slate-900">Flexible Study Schedule</h3>
            <p className="text-slate-600 mt-2">Evening classes designed for high school students preparing for university entrance.</p>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="rounded-xl border border-slate-200 p-6 bg-white">
            <h3 className="font-semibold text-slate-900">Expert Instruction</h3>
            <p className="text-slate-600 mt-2">Learn from experienced educators with proven track records in NUET preparation.</p>
            </div>
          </Reveal>
        </div>
      </section>
      
      <section className="container-section py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">Available Courses</h2>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading courses...</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.length > 0 ? (
              courses.slice(0, 6).map((course, index) => (
                <Reveal key={course.id} delay={index * 0.1}>
                  <div className="rounded-xl border border-slate-200 p-6 bg-white hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-slate-900 mb-2">{course.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                        {course.difficulty}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-slate-500">
                        <Users className="w-4 h-4 mr-2" />
                        <span>by {course.instructor}</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-500 space-x-4">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {course.estimatedHours}h
                        </span>
                        <span className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-1" />
                          {course.totalTopics} topics
                        </span>
                        <span className="flex items-center">
                          <Target className="w-4 h-4 mr-1" />
                          {course.totalTests} tests
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                      <span>{course.duration}</span>
                      <span className="font-semibold text-slate-900">
                        {course.price === 0 ? 'Free' : `${course.price.toLocaleString()} ₸`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">
                        {course.enrolledStudents} enrolled
                      </span>
                      <a 
                        href={`/courses/${course.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View Details →
                      </a>
                    </div>
                  </div>
                </Reveal>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses available yet</h3>
                <p className="text-gray-600">Check back soon for new courses!</p>
              </div>
            )}
          </div>
        )}
        <div className="text-center mt-8">
          <a href="/courses" className="btn-primary">View All Courses</a>
        </div>
      </section>
      <Footer />
    </main>
  );
}

