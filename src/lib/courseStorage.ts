// Simple in-memory storage for newly created courses
// This is a temporary solution until database is fully functional

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  difficulty: string;
  estimatedHours: number;
  price: number;
  duration: string;
  maxStudents: number;
  status: string;
  isActive: boolean;
  enrollmentDeadline?: string;
  accessStartDate?: string;
  accessEndDate?: string;
  googleMeetLink?: string;
  createdAt: string;
  updatedAt: string;
}

class CourseStorage {
  private courses: Map<string, Course> = new Map();

  // Store a new course
  storeCourse(course: Course): void {
    this.courses.set(course.id, course);
    console.log(`📚 Stored course: ${course.title} (${course.id})`);
  }

  // Get a course by ID
  getCourse(courseId: string): Course | null {
    const course = this.courses.get(courseId);
    if (course) {
      console.log(`📖 Retrieved course: ${course.title} (${course.id})`);
    }
    return course || null;
  }

  // Get all courses
  getAllCourses(): Course[] {
    return Array.from(this.courses.values());
  }

  // Update a course
  updateCourse(courseId: string, updates: Partial<Course>): Course | null {
    const existingCourse = this.courses.get(courseId);
    if (!existingCourse) {
      return null;
    }

    const updatedCourse = {
      ...existingCourse,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.courses.set(courseId, updatedCourse);
    console.log(`📝 Updated course: ${updatedCourse.title} (${courseId})`);
    return updatedCourse;
  }

  // Delete a course
  deleteCourse(courseId: string): boolean {
    const course = this.courses.get(courseId);
    if (course) {
      this.courses.delete(courseId);
      console.log(`🗑️ Deleted course: ${course.title} (${courseId})`);
      return true;
    }
    return false;
  }

  // Check if course exists
  hasCourse(courseId: string): boolean {
    return this.courses.has(courseId);
  }

  // Get course count
  getCourseCount(): number {
    return this.courses.size;
  }
}

// Create a singleton instance
const courseStorage = new CourseStorage();

export default courseStorage;
export type { Course };
