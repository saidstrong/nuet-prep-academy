"use client";
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BookOpen, Users, Clock, DollarSign, Star, MessageCircle, UserCheck } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  status: string;
  maxStudents: number;
  enrollments: any[];
  topics: any[];
  creator: {
    id: string;
    name: string;
    email: string;
  };
}

interface Tutor {
  id: string;
  name: string;
  email: string;
  profile?: {
    bio?: string;
    phone?: string;
    whatsapp?: string;
    experience?: string;
  };
  tutorEnrollments: any[];
}

export default function CoursesPage() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchTutors();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchTutors = async () => {
    try {
      const response = await fetch('/api/tutors');
      const data = await response.json();
      
      if (data.success) {
        setTutors(data.tutors);
      }
    } catch (error) {
      console.error('Error fetching tutors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!selectedCourse || !selectedTutor || !session) return;

    setEnrolling(true);
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          tutorId: selectedTutor.id,
        }),
      });

      if (response.ok) {
        setShowEnrollmentModal(false);
        setSelectedCourse(null);
        setSelectedTutor(null);
        // Refresh courses to update enrollment counts
        fetchCourses();
        alert('Successfully enrolled in the course!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to enroll in course');
      }
    } catch (error) {
      console.error('Error enrolling:', error);
      alert('An error occurred while enrolling');
    } finally {
      setEnrolling(false);
    }
  };

  const getAvailableTutors = (course: Course) => {
    return tutors.filter(tutor => {
      const tutorEnrollments = tutor.tutorEnrollments.filter(
        (enrollment: any) => enrollment.courseId === course.id
      );
      return tutorEnrollments.length < 30; // Max 30 students per tutor
    });
  };

  const isEnrolled = (courseId: string) => {
    if (!session) return false;
    return courses.some(course => 
      course.id === courseId && 
      course.enrollments.some((enrollment: any) => enrollment.studentId === session.user.id)
    );
  };

  if (loading) {
    return (
      <main>
        <Header />
        <div className="container-section py-16">
          <div className="text-center">Loading...</div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Header />
      <div className="container-section py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Available Courses</h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Choose from our comprehensive selection of courses designed to help you excel in your studies
            </p>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-slate-900">{course.title}</h3>
                    {isEnrolled(course.id) && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <UserCheck className="w-3 h-3 mr-1" />
                        Enrolled
                      </span>
                    )}
                  </div>
                  
                  <p className="text-slate-600 mb-4 line-clamp-3">{course.description}</p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-slate-500">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-500">
                      <BookOpen className="w-4 h-4 mr-2" />
                      <span>{course.topics.length} topics</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-500">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{course.enrollments.length} / {course.maxStudents} students</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-500">
                      <DollarSign className="w-4 h-4 mr-2" />
                      <span className="font-semibold text-slate-900">{course.price.toLocaleString()} ₸</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-500">
                      Created by {course.creator.name}
                    </div>
                    
                    {!isEnrolled(course.id) ? (
                      <button
                        onClick={() => {
                          setSelectedCourse(course);
                          setShowEnrollmentModal(true);
                        }}
                        disabled={course.enrollments.length >= course.maxStudents}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {course.enrollments.length >= course.maxStudents ? 'Full' : 'Enroll Now'}
                      </button>
                    ) : (
                      <button className="btn-secondary">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        View Course
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enrollment Modal */}
      {showEnrollmentModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Enroll in {selectedCourse.title}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select a Tutor
              </label>
              <select
                value={selectedTutor?.id || ''}
                onChange={(e) => {
                  const tutor = tutors.find(t => t.id === e.target.value);
                  setSelectedTutor(tutor || null);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Choose a tutor...</option>
                {getAvailableTutors(selectedCourse).map((tutor) => (
                  <option key={tutor.id} value={tutor.id}>
                    {tutor.name} - {tutor.tutorEnrollments.filter((e: any) => e.courseId === selectedCourse.id).length}/30 students
                  </option>
                ))}
              </select>
            </div>

            {selectedTutor && (
              <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-2">{selectedTutor.name}</h4>
                {selectedTutor.profile?.bio && (
                  <p className="text-sm text-slate-600 mb-2">{selectedTutor.profile.bio}</p>
                )}
                {selectedTutor.profile?.experience && (
                  <p className="text-sm text-slate-500">Experience: {selectedTutor.profile.experience}</p>
                )}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setShowEnrollmentModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEnroll}
                disabled={!selectedTutor || enrolling}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enrolling ? 'Enrolling...' : 'Confirm Enrollment'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}

