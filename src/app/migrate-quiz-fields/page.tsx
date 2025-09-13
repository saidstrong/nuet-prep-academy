"use client";
import { useState } from 'react';

export default function MigrateQuizFields() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const runMigration = async () => {
    setLoading(true);
    setStatus('Running migration...');
    
    try {
      const response = await fetch('/api/migrate-add-quiz-fields', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setStatus(`✅ Success: ${data.message}`);
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
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Database Migration
        </h1>
        
        <div className="space-y-4">
          <p className="text-gray-600 text-center">
            This will add the quiz fields (hasQuiz and quiz) to the challenges table.
          </p>
          
          <button
            onClick={runMigration}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Running Migration...' : 'Run Migration'}
          </button>
          
          {status && (
            <div className="mt-4 p-3 rounded-lg bg-gray-100">
              <p className="text-sm">{status}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
