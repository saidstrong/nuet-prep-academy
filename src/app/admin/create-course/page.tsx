"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CourseCreationForm from '@/components/admin/CourseCreationForm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CreateCoursePage() {
  const router = useRouter();
  const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);

  const handleSuccess = (courseId: string) => {
    setCreatedCourseId(courseId);
    // Optionally redirect to course builder or course management
    setTimeout(() => {
      router.push(`/admin/courses/${courseId}`);
    }, 2000);
  };

  const handleCancel = () => {
    router.push('/admin/courses');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <a href="/admin" className="hover:text-gray-900">Admin</a>
            <span>/</span>
            <a href="/admin/courses" className="hover:text-gray-900">Courses</a>
            <span>/</span>
            <span className="text-gray-900">Create Course</span>
          </nav>
          
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600 mt-2">Create a new course for your students</p>
        </div>

        <CourseCreationForm 
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
      
      <Footer />
    </div>
  );
}
