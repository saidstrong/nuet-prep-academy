"use client";
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TestChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  const createChatTables = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const response = await fetch('/api/create-chat-tables');
      const data = await response.json();
      
      if (data.success) {
        setResult('✅ Chat tables created successfully!');
      } else {
        setResult(`❌ Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      setResult(`❌ Network error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const fixSchema = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const response = await fetch('/api/fix-chat-schema');
      const data = await response.json();
      
      if (data.success) {
        setResult('✅ Schema fixed successfully!');
      } else {
        setResult(`❌ Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      setResult(`❌ Network error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const createTestChat = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const response = await fetch('/api/test-chat');
      const data = await response.json();
      
      if (data.success) {
        setResult('✅ Test chat created successfully!');
      } else {
        setResult(`❌ Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      setResult(`❌ Network error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testChatAPI = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const response = await fetch('/api/chat/chats');
      const data = await response.json();
      
      if (data.success) {
        setResult(`✅ Chat API working! Found ${data.chats.length} chats.`);
      } else {
        setResult(`❌ Chat API Error: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      setResult(`❌ Network error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
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

  if (!session) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Chat System Test
          </h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Test Chat System
              </h2>
              <p className="text-gray-600 mb-6">
                Use these buttons to test the chat system step by step.
              </p>
            </div>

                         <div className="space-y-4">
               <button
                 onClick={createChatTables}
                 disabled={loading}
                 className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                 {loading ? 'Processing...' : '1. Create Chat Tables & Enums'}
               </button>

               <button
                 onClick={fixSchema}
                 disabled={loading}
                 className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                 {loading ? 'Processing...' : '2. Fix Database Schema'}
               </button>

               <button
                 onClick={createTestChat}
                 disabled={loading}
                 className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                 {loading ? 'Processing...' : '3. Create Test Chat'}
               </button>

               <button
                 onClick={testChatAPI}
                 disabled={loading}
                 className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                 {loading ? 'Processing...' : '4. Test Chat API'}
               </button>

               <button
                 onClick={() => router.push('/chat')}
                 className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors"
               >
                 5. Go to Chat Page
               </button>
             </div>

            {result && (
              <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Result:</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{result}</p>
              </div>
            )}

                         <div className="mt-6 p-4 bg-blue-50 rounded-lg">
               <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
               <ol className="text-blue-800 space-y-1 text-sm">
                 <li>1. Click "Create Chat Tables & Enums" first (creates missing database types)</li>
                 <li>2. Click "Fix Database Schema" to add missing columns</li>
                 <li>3. Click "Create Test Chat" to create a sample chat</li>
                 <li>4. Click "Test Chat API" to verify the API works</li>
                 <li>5. Click "Go to Chat Page" to access the chat interface</li>
               </ol>
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
