"use client";

import { useRouter } from 'next/navigation';
import CourseCreationForm from '@/components/admin/CourseCreationForm';

export default function CreateCoursePage() {
  const router = useRouter();

  const handleSuccess = (course: any) => {
    console.log('Course created successfully:', course);
    router.push('/admin/courses');
  };

  const handleCancel = () => {
    router.push('/admin/courses');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CourseCreationForm 
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}