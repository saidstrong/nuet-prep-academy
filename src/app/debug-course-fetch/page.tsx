'use client';

import { useState } from 'react';

export default function DebugCourseFetch() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const debugCourseFetch = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/debug-course-fetch');
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
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Debug Course Fetch
          </h1>
          
          <p className="text-gray-600 mb-6">
            This will test the course fetching API to see why courses aren't appearing in the admin interface.
          </p>
          
          <button
            onClick={debugCourseFetch}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Debugging...' : 'Debug Course Fetch'}
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
              
              {result.debug && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Debug Information:</h4>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <pre className="text-sm overflow-auto">
                      {JSON.stringify(result.debug, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              {result.details && (
                <div className="mt-3">
                  <h4 className="font-medium text-gray-900 mb-2">Details:</h4>
                  <p className="text-sm text-gray-700">{result.details}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
