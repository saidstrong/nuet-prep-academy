"use client";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/Header';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import EnhancedTutorDashboard from '@/components/EnhancedTutorDashboard';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  status: string;
  studentCount: number;
  topics: Topic[];
}

interface Topic {
  id: string;
  title: string;
  description?: string;
  order: number;
  materialsCount: number;
  testsCount: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
  enrolledAt: string;
  progress: number;
  lastActivity: string;
}

export default function TutorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'TUTOR') {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <ResponsiveLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </ResponsiveLayout>
      </div>
    );
  }

  if (!session || session.user.role !== 'TUTOR') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ResponsiveLayout>
        <EnhancedTutorDashboard />
      </ResponsiveLayout>
    </div>
  );
}
