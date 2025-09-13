import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Get user's enrolled courses with progress data
    const enrolledCourses = await prisma.courseEnrollment.findMany({
      where: {
        studentId: session.user.id,
        status: 'ACTIVE'
      },
      include: {
        course: {
          include: {
            topics: {
              include: {
                materials: {
                  include: {
                    progress: {
                      where: {
                        studentId: session.user.id
                      }
                    }
                  }
                },
                tests: {
                  include: {
                    submissions: {
                      where: {
                        studentId: session.user.id
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Calculate progress for each course
    const courseProgress = enrolledCourses.map(enrollment => {
      const course = enrollment.course;
      const topics = course.topics;
      
      let totalMaterials = 0;
      let completedMaterials = 0;
      let totalTimeSpent = 0;
      let totalTests = 0;
      let completedTests = 0;
      let totalTestScore = 0;
      let completedTestCount = 0;

      topics.forEach(topic => {
        // Count materials
        totalMaterials += topic.materials.length;
        topic.materials.forEach(material => {
          if (material.progress && material.progress.length > 0) {
            const progress = material.progress[0];
            if (progress.status === 'COMPLETED') {
              completedMaterials++;
            }
            totalTimeSpent += progress.timeSpent || 0;
          }
        });

        // Count tests
        totalTests += topic.tests.length;
        topic.tests.forEach(test => {
          if (test.submissions && test.submissions.length > 0) {
            completedTests++;
            const submission = test.submissions[0];
            totalTestScore += submission.score || 0;
            completedTestCount++;
          }
        });
      });

      const completionPercentage = totalMaterials > 0 ? Math.round((completedMaterials / totalMaterials) * 100) : 0;
      const averageTestScore = completedTestCount > 0 ? Math.round(totalTestScore / completedTestCount) : 0;
      const estimatedTimeRemaining = totalMaterials > 0 ? 
        Math.round((totalMaterials - completedMaterials) * (totalTimeSpent / Math.max(completedMaterials, 1))) : 0;

      return {
        courseId: course.id,
        courseTitle: course.title,
        courseDescription: course.description,
        enrollmentDate: enrollment.enrolledAt,
        completionPercentage,
        totalMaterials,
        completedMaterials,
        totalTests,
        completedTests,
        totalTimeSpent: Math.round(totalTimeSpent / 60), // Convert to minutes
        averageTestScore,
        estimatedTimeRemaining: Math.round(estimatedTimeRemaining / 60), // Convert to minutes
        lastActivity: enrollment.enrolledAt, // TODO: Track actual last activity
        status: completionPercentage === 100 ? 'COMPLETED' : 
                completionPercentage > 0 ? 'IN_PROGRESS' : 'NOT_STARTED'
      };
    });

    // Calculate overall statistics
    const totalCourses = courseProgress.length;
    const completedCourses = courseProgress.filter(course => course.status === 'COMPLETED').length;
    const inProgressCourses = courseProgress.filter(course => course.status === 'IN_PROGRESS').length;
    const totalTimeSpent = courseProgress.reduce((sum, course) => sum + course.totalTimeSpent, 0);
    const averageCompletion = totalCourses > 0 ? 
      Math.round(courseProgress.reduce((sum, course) => sum + course.completionPercentage, 0) / totalCourses) : 0;

    return NextResponse.json({
      success: true,
      progress: {
        courses: courseProgress,
        overall: {
          totalCourses,
          completedCourses,
          inProgressCourses,
          totalTimeSpent,
          averageCompletion
        }
      }
    });

  } catch (error: any) {
    console.error('Progress tracking error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch progress data',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
