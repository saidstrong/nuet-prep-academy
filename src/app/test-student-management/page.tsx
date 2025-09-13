"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function TestStudentManagement() {
  const { data: session } = useSession();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const testStudentsAPI = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/test-students');
      const data = await response.json();
      
      if (data.success) {
        setStudents(data.students || []);
        setMessage(`✅ Found ${data.studentCount} students. Total users: ${data.totalUsers}`);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Network error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testAdminStudentsAPI = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/admin/students');
      const data = await response.json();
      
      if (data.success) {
        setStudents(data.students || []);
        setMessage(`✅ Admin API: Found ${data.total} students`);
      } else {
        setMessage(`❌ Admin API Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Admin API Network error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Student Management</h1>
        
        {session && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900">Session Info</h2>
            <p className="text-blue-700">User: {session.user.name}</p>
            <p className="text-blue-700">Role: {session.user.role}</p>
            <p className="text-blue-700">Email: {session.user.email}</p>
          </div>
        )}

        <div className="space-y-4 mb-8">
          <button
            onClick={testStudentsAPI}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Testing...' : 'Test Students API'}
          </button>
          
          <button
            onClick={testAdminStudentsAPI}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 ml-4"
          >
            {loading ? 'Testing...' : 'Test Admin Students API'}
          </button>
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

        {students.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Students Found</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student: any) => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {students.length === 0 && !loading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800">No Students Found</h3>
            <p className="text-yellow-700 mt-2">
              This could mean:
            </p>
            <ul className="list-disc list-inside text-yellow-700 mt-2 space-y-1">
              <li>No students have been created yet</li>
              <li>Database connection issues</li>
              <li>API authentication problems</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
