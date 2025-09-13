"use client";
import { useState } from 'react';

export default function TestMigrationPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const runMigration = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/run-db-migration', {
        method: 'POST',
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Database Migration Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Run Database Migration</h2>
          <p className="text-slate-600 mb-4">
            This will attempt to fix the database schema mismatch by running Prisma migrations.
          </p>
          
          <button
            onClick={runMigration}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Running Migration...' : 'Run Migration'}
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Migration Result</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
