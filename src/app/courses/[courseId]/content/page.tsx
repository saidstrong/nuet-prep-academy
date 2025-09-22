import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Course Content - NUET Prep Academy',
  description: 'Access course content and materials',
};

export default function CourseContentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Course Content
          </h1>
          
          <div className="prose max-w-none">
            <p className="text-lg text-gray-600 mb-4">
              Welcome to the course content section. Here you can access all course materials, 
              videos, documents, and interactive content.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-2">
                Course Materials Available
              </h2>
              <ul className="list-disc list-inside text-blue-800 space-y-1">
                <li>Video Lectures</li>
                <li>Reading Materials</li>
                <li>Practice Exercises</li>
                <li>Interactive Quizzes</li>
                <li>Downloadable Resources</li>
              </ul>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-2">Video Lectures</h3>
                <p className="text-gray-600 text-sm">
                  High-quality video content covering all course topics
                </p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-2">Reading Materials</h3>
                <p className="text-gray-600 text-sm">
                  Comprehensive reading materials and study guides
                </p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-2">Practice Tests</h3>
                <p className="text-gray-600 text-sm">
                  Interactive practice tests and assessments
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
