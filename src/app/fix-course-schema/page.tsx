'use client';

import { useState } from 'react';

export default function FixCourseSchema() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const fixSchema = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/fix-course-schema', {
        method: 'POST',
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Network error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Fix Course Schema
          </h1>
          
          <p className="text-gray-600 mb-6">
            This will add the missing columns (instructor, difficulty, estimated_hours, is_active) 
            to the courses table in the database.
          </p>
          
          <button
            onClick={fixSchema}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Fixing Schema...' : 'Fix Course Schema'}
          </button>
          
          {result && (
            <div className={`mt-6 p-4 rounded-lg ${
              result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <h3 className={`font-semibold ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.success ? '✅ Success' : '❌ Error'}
              </h3>
              <p className={`mt-2 ${
                result.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.message || result.error}
              </p>
              {result.details && (
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {typeof result.details === 'string' ? result.details : JSON.stringify(result.details, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
