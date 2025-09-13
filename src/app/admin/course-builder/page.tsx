'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CourseBuilder from '@/components/admin/CourseBuilder';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  difficulty: string;
  estimatedHours: number;
  price: number;
  duration: string;
  maxStudents: number;
  status: string;
  topics: any[];
}

export default function CourseBuilderPage() {
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we have a course ID in the URL params
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('courseId');
    
    if (courseId) {
      // Load existing course
      fetchCourse(courseId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCourse = async (courseId: string) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`);
      if (response.ok) {
        const courseData = await response.json();
        setCourse(courseData);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (courseData: Course) => {
    try {
      const url = course ? `/api/admin/courses/${course.id}` : '/api/admin/courses';
      const method = course ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        alert(course ? 'Course updated successfully!' : 'Course created successfully!');
        router.push('/admin/courses');
      } else {
        const errorData = await response.json();
        alert(`Failed to save course: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Failed to save course. Please try again.');
    }
  };

  const handleCancel = () => {
    router.push('/admin/courses');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <CourseBuilder
      course={course || undefined}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
