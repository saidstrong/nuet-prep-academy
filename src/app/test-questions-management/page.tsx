"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function TestQuestionsManagement() {
  const { data: session } = useSession();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const testQuestionsAPI = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/test-questions-api');
      const data = await response.json();
      
      if (data.success) {
        setQuestions(data.questions || []);
        setMessage(`✅ Found ${data.questionCount} questions. Total questions: ${data.totalQuestions}`);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Network error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testAdminQuestionsAPI = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/admin/test-questions');
      const data = await response.json();
      
      if (data.success) {
        setQuestions(data.questions || []);
        setMessage(`✅ Admin API: Found ${data.total} questions`);
      } else {
        setMessage(`❌ Admin API Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Admin API Network error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testDatabaseStructure = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/test-database-structure');
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Database Structure: Courses: ${data.counts.courses}, Topics: ${data.counts.topics}, Questions: ${data.counts.questions}`);
      } else {
        setMessage(`❌ Database Structure Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Database Structure Network error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const createSampleData = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/create-sample-test-data');
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Sample Data: ${data.message}`);
      } else {
        setMessage(`❌ Sample Data Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Sample Data Network error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const createTopicsAndQuestions = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/create-topics-and-questions');
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Topics & Questions: ${data.message}. Total: ${data.totalTopics} topics, ${data.totalQuestions} questions`);
      } else {
        setMessage(`❌ Topics & Questions Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Topics & Questions Network error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const debugTopicsCreation = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/debug-topics-creation');
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Debug Test: ${data.message}`);
      } else {
        setMessage(`❌ Debug Test Error: ${data.error} - ${data.details}`);
      }
    } catch (error) {
      setMessage(`❌ Debug Test Network error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const fixQuestionSchema = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/fix-question-schema');
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Schema Fix: ${data.message}`);
      } else {
        setMessage(`❌ Schema Fix Error: ${data.error} - ${data.details}`);
      }
    } catch (error) {
      setMessage(`❌ Schema Fix Network error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const fixOrderColumn = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/fix-order-column');
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Order Column Fix: ${data.message}`);
      } else {
        setMessage(`❌ Order Column Fix Error: ${data.error} - ${data.details}`);
      }
    } catch (error) {
      setMessage(`❌ Order Column Fix Network error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const fixTestIdColumn = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/fix-testid-column');
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ TestId Column Fix: ${data.message}`);
      } else {
        setMessage(`❌ TestId Column Fix Error: ${data.error} - ${data.details}`);
      }
    } catch (error) {
      setMessage(`❌ TestId Column Fix Network error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Questions Management</h1>
        
        {session && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900">Session Info</h2>
            <p className="text-blue-700">User: {session.user.name}</p>
            <p className="text-blue-700">Role: {session.user.role}</p>
            <p className="text-blue-700">Email: {session.user.email}</p>
          </div>
        )}

        <div className="space-y-4 mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={testDatabaseStructure}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
            >
              {loading ? 'Testing...' : 'Test Database Structure'}
            </button>
            
            <button
              onClick={createSampleData}
              disabled={loading}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400"
            >
              {loading ? 'Creating...' : 'Create Sample Data'}
            </button>
            
            <button
              onClick={createTopicsAndQuestions}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
            >
              {loading ? 'Creating...' : 'Create Topics & Questions'}
            </button>
            
            <button
              onClick={debugTopicsCreation}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400"
            >
              {loading ? 'Testing...' : 'Debug Topics Creation'}
            </button>
            
            <button
              onClick={fixQuestionSchema}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
            >
              {loading ? 'Fixing...' : 'Fix Question Schema'}
            </button>
            <button
              onClick={fixOrderColumn}
              disabled={loading}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400"
            >
              {loading ? 'Fixing...' : 'Fix Order Column'}
            </button>
            <button
              onClick={fixTestIdColumn}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
            >
              {loading ? 'Fixing...' : 'Fix TestId Column'}
            </button>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={testQuestionsAPI}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Testing...' : 'Test Questions API'}
            </button>
            
            <button
              onClick={testAdminQuestionsAPI}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Testing...' : 'Test Admin Questions API'}
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.includes('✅') 
              ? 'bg-green-50 text-green-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {questions.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Questions Found</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Question
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Topic
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {questions.map((question: any) => (
                    <tr key={question.id}>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {question.text}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {question.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {question.difficulty}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {question.topic?.course?.title || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {question.topic?.title || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {question.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {questions.length === 0 && !loading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800">No Questions Found</h3>
            <p className="text-yellow-700 mt-2">
              This could mean:
            </p>
            <ul className="list-disc list-inside text-yellow-700 mt-2 space-y-1">
              <li>No questions have been created yet</li>
              <li>Database connection issues</li>
              <li>API authentication problems</li>
              <li>Missing topics or courses</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
