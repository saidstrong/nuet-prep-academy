"use client";

import { useState } from 'react';

export default function SetupMissingTablesPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runSetup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/setup-missing-tables');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to run setup', details: error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Setup Missing Database Tables
          </h1>
          
          <p className="text-gray-600 mb-6">
            This will create the missing subtopics table and add the required columns to materials and tests tables.
          </p>

          <button
            onClick={runSetup}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Setting up...' : 'Run Database Setup'}
          </button>

          {result && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Result:</h3>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
