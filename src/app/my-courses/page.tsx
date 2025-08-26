"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BookOpen, User, Calendar, Clock } from 'lucide-react';

interface EnrolledCourse {
  id: string;
  course: {
    id: string;
    title: string;
    description: string;
    price: number;
    duration: string;
  };
  tutor: {
    id: string;
    name: string;
    email: string;
  };
  enrolledAt: string;
  status: string;
}

export default function MyCoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    fetchEnrolledCourses();
  }, [session, status, router]);

  const fetchEnrolledCourses = async () => {
    try {
      const response = await fetch('/api/my-courses');
      if (response.ok) {
        const data = await response.json();
        setEnrolledCourses(data);
      }
    } catch (error) {
      console.error('Failed to fetch enrolled courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <main>
        <Header />
        <div className="container-section py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main>
      <Header />
      <div className="container-section py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-slate-900">My Courses</h1>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-slate-600">Loading your courses...</p>
            </div>
          ) : enrolledCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No courses yet</h3>
              <p className="text-slate-600 mb-6">You haven't enrolled in any courses yet.</p>
              <a href="/courses" className="btn-primary">Browse Courses</a>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enrolledCourses.map((enrollment) => (
                <div key={enrollment.id} className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {enrollment.course.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      enrollment.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800'
                        : enrollment.status === 'COMPLETED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {enrollment.status}
                    </span>
                  </div>
                  
                  <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                    {enrollment.course.description}
                  </p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4" />
                      <span>{enrollment.course.duration}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span>Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <User className="w-4 h-4" />
                      <span className="font-medium">Tutor:</span>
                      <span>{enrollment.tutor.name}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{enrollment.tutor.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
