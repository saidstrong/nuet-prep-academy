"use client";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import EnhancedChatInterface from '@/components/EnhancedChatInterface';
import GroupManagement from '@/components/GroupManagement';
import { MessageCircle, Users } from 'lucide-react';

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'chat' | 'groups'>('chat');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-slate-50">
        <Header />
        <ResponsiveLayout>
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-slate-600 font-medium">Loading messages...</p>
            </div>
          </div>
        </ResponsiveLayout>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Header />
      <ResponsiveLayout>
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm border border-slate-200">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Messages</span>
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'groups'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Groups</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'chat' && <EnhancedChatInterface />}
          {activeTab === 'groups' && <GroupManagement />}
        </div>
      </ResponsiveLayout>
    </main>
  );
}
