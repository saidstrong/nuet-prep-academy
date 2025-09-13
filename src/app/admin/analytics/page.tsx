"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER')) {
      router.push('/auth/signin');
      return;
    }
    
    setLoading(false);
  }, [session, status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Analytics Dashboard</h1>
          <p className="text-slate-600">
            Comprehensive insights into your academy's performance, student progress, and financial metrics.
          </p>
        </div>

        <AnalyticsDashboard />
      </main>

      <Footer />
    </div>
  );
}
