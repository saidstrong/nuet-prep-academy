"use client";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import EnhancedStudentDashboardV2 from '@/components/EnhancedStudentDashboardV2';

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <ResponsiveLayout>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading student dashboard...</p>
          </div>
        </ResponsiveLayout>
      </div>
    );
  }

  if (!session || session.user.role !== 'STUDENT') {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ResponsiveLayout>
        <EnhancedStudentDashboardV2 />
      </ResponsiveLayout>
    </div>
  );
}