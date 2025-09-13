"use client";
import { useState } from 'react';

export default function SetupCompleteDatabase() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const runSetup = async () => {
    setLoading(true);
    setStatus('Setting up complete database...');
    
    try {
      const response = await fetch('/api/setup-complete-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setStatus(`✅ Success: ${data.message}`);
        if (data.details) {
          setStatus(prev => prev + '\n\nDetails:\n' + data.details.join('\n'));
        }
      } else {
        setStatus(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Complete Database Setup
        </h1>
        
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800 mb-2">⚠️ Important</h3>
            <p className="text-yellow-700 text-sm">
              This will create all necessary database tables including users, courses, challenges, and more. 
              This is a comprehensive setup that should be run once to initialize the entire database.
            </p>
          </div>
          
          <p className="text-gray-600 text-center">
            This will create all database tables needed for the NUET Prep Academy application.
          </p>
          
          <button
            onClick={runSetup}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Setting up Database...' : 'Setup Complete Database'}
          </button>
          
          {status && (
            <div className="mt-4 p-3 rounded-lg bg-gray-100">
              <pre className="text-sm whitespace-pre-wrap">{status}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
