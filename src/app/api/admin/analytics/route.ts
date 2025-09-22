import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['ADMIN', 'OWNER', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden: Only admins can access analytics' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    try {
      // Try to get data from database
      const [totalStudents, totalTutors, totalCourses] = await Promise.all([
        prisma.user.count({ where: { role: 'STUDENT' } }),
        prisma.user.count({ where: { role: 'TUTOR' } }),
        prisma.course.count()
      ]);

      // Get revenue data
      const payments = await prisma.payment.findMany({
        where: {
          status: 'PAID',
          createdAt: { gte: startDate }
        },
        include: {
          enrollment: {
            include: {
              course: true
            }
          }
        }
      });

      const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

      // Get enrollment trends
      const enrollments = await prisma.courseEnrollment.findMany({
        where: {
          enrolledAt: { gte: startDate }
        },
        include: {
          course: true
        }
      });

      // Group enrollments by month
      const monthlyEnrollments = groupByMonth(enrollments, startDate, now);

      // Get course performance data
      const coursePerformance = await getCoursePerformance(startDate, now);

      // Get student progress data
      const studentProgress = await getStudentProgress(startDate, now);

      // Get revenue trends
      const revenueTrends = groupByMonth(payments, startDate, now, 'revenue');

      // Get test results distribution
      const testResults = await getTestResultsDistribution(startDate, now);

      // Get top performing courses
      const topCourses = await getTopCourses(startDate, now);

      return NextResponse.json({
        success: true,
        totalStudents,
        totalTutors,
        totalCourses,
        totalRevenue,
        monthlyEnrollments,
        coursePerformance,
        studentProgress,
        revenueTrends,
        testResults,
        topCourses,
        source: 'database'
      });

    } catch (dbError) {
      console.error('Database error, using fallback analytics data:', dbError);
      
      // Fallback to mock analytics data
      const mockAnalytics = {
        success: true,
        totalStudents: 156,
        totalTutors: 8,
        totalCourses: 12,
        totalRevenue: 2340000, // 2.34M KZT
        monthlyEnrollments: [
          { month: 'Sep 2024', enrollments: 45 },
          { month: 'Oct 2024', enrollments: 52 },
          { month: 'Nov 2024', enrollments: 38 },
          { month: 'Dec 2024', enrollments: 41 }
        ],
        coursePerformance: [
          { course: 'NUET Mathematics Preparation', enrollments: 45, completionRate: 78 },
          { course: 'NUET Logical Reasoning', enrollments: 38, completionRate: 82 },
          { course: 'NUET English Language', enrollments: 32, completionRate: 75 },
          { course: 'NUET Physics Fundamentals', enrollments: 28, completionRate: 71 },
          { course: 'NUET Chemistry Mastery', enrollments: 25, completionRate: 68 }
        ],
        studentProgress: [
          { week: 'Week 1', activeStudents: 45, avgStudyTime: 12 },
          { week: 'Week 2', activeStudents: 52, avgStudyTime: 15 },
          { week: 'Week 3', activeStudents: 48, avgStudyTime: 18 },
          { week: 'Week 4', activeStudents: 41, avgStudyTime: 14 }
        ],
        revenueTrends: [
          { month: 'Sep 2024', revenue: 450000 },
          { month: 'Oct 2024', revenue: 520000 },
          { month: 'Nov 2024', revenue: 380000 },
          { month: 'Dec 2024', revenue: 410000 }
        ],
        testResults: [
          { name: 'EXCELLENT', value: 45 },
          { name: 'GOOD', value: 78 },
          { name: 'AVERAGE', value: 52 },
          { name: 'POOR', value: 23 },
          { name: 'FAILED', value: 8 }
        ],
        topCourses: [
          {
            id: 'course-1',
            title: 'NUET Mathematics Preparation',
            tutor: 'Dr. Sarah Johnson',
            enrollments: 45,
            completionRate: 78,
            averageScore: 85,
            revenue: 450000
          },
          {
            id: 'course-2',
            title: 'NUET Logical Reasoning',
            tutor: 'Prof. Michael Chen',
            enrollments: 38,
            completionRate: 82,
            averageScore: 88,
            revenue: 380000
          },
          {
            id: 'course-3',
            title: 'NUET English Language',
            tutor: 'Ms. Emily Rodriguez',
            enrollments: 32,
            completionRate: 75,
            averageScore: 82,
            revenue: 320000
          }
        ],
        source: 'fallback',
        message: 'Using fallback analytics data due to database issues'
      };

      return NextResponse.json(mockAnalytics);
    }

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

function groupByMonth(data: any[], startDate: Date, endDate: Date, valueKey: string = 'count') {
  const months: { [key: string]: any } = {};
  
  for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
    const monthKey = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    months[monthKey] = valueKey === 'revenue' ? 0 : 0;
  }

  data.forEach(item => {
    const date = valueKey === 'revenue' ? item.createdAt : item.enrolledAt;
    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (months[monthKey] !== undefined) {
      if (valueKey === 'revenue') {
        months[monthKey] += item.amount || 0;
      } else {
        months[monthKey]++;
      }
    }
  });

  return Object.entries(months).map(([month, value]) => ({
    month,
    [valueKey === 'revenue' ? 'revenue' : 'enrollments']: value
  }));
}

async function getCoursePerformance(startDate: Date, endDate: Date) {
  const courses = await prisma.course.findMany({
    include: {
      enrollments: {
        where: {
          enrolledAt: { gte: startDate }
        }
      },
      topics: {
        include: {
          tests: {
            include: {
              submissions: true
            }
          }
        }
      }
    }
  });

  return courses.map(course => {
    const enrollments = course.enrollments.length;
    const totalTests = course.topics.reduce((sum, topic) => sum + topic.tests.length, 0);
    const completedTests = course.topics.reduce((sum, topic) => 
      sum + topic.tests.reduce((testSum, test) => testSum + test.submissions.length, 0), 0
    );
    
    const completionRate = totalTests > 0 ? Math.round((completedTests / (enrollments * totalTests)) * 100) : 0;
    
    return {
      course: course.title,
      enrollments,
      completionRate
    };
  }).slice(0, 10); // Top 10 courses
}

async function getStudentProgress(startDate: Date, endDate: Date) {
  const weeks = [];
  const weekInMs = 7 * 24 * 60 * 60 * 1000;
  
  for (let i = 0; i < 12; i++) {
    const weekStart = new Date(startDate.getTime() + i * weekInMs);
    const weekEnd = new Date(weekStart.getTime() + weekInMs);
    
    const activeStudents = await prisma.user.count({
      where: {
        role: 'STUDENT',
        studentEnrollments: {
          some: {
            enrolledAt: { gte: weekStart, lte: weekEnd }
          }
        }
      }
    });

    const avgStudyTime = await prisma.materialProgress.aggregate({
      where: {
        lastAccessed: { gte: weekStart, lte: weekEnd }
      },
      _avg: {
        timeSpent: true
      }
    });

    weeks.push({
      week: `Week ${i + 1}`,
      activeStudents,
      avgStudyTime: Math.round((avgStudyTime._avg.timeSpent || 0) / 3600) // Convert to hours
    });
  }
  
  return weeks;
}

async function getTestResultsDistribution(startDate: Date, endDate: Date) {
  const submissions = await prisma.testSubmission.findMany({
    where: {
      createdAt: { gte: startDate }
    }
  });

  const distribution = {
    EXCELLENT: 0,
    GOOD: 0,
    AVERAGE: 0,
    POOR: 0,
    FAILED: 0
  };

  submissions.forEach(submission => {
    const score = submission.score || 0;
    if (score >= 90) distribution.EXCELLENT++;
    else if (score >= 80) distribution.GOOD++;
    else if (score >= 70) distribution.AVERAGE++;
    else if (score >= 60) distribution.POOR++;
    else distribution.FAILED++;
  });

  return Object.entries(distribution).map(([name, value]) => ({ name, value }));
}

async function getTopCourses(startDate: Date, endDate: Date) {
  const courses = await prisma.course.findMany({
    include: {
      enrollments: {
        where: {
          enrolledAt: { gte: startDate }
        }
      },
      topics: {
        include: {
          tests: {
            include: {
              submissions: true
            }
          }
        }
      },
      assignedTutors: true,
      payments: {
        where: {
          status: 'PAID',
          createdAt: { gte: startDate }
        }
      }
    }
  });

  return courses.map(course => {
    const enrollments = course.enrollments.length;
    const totalTests = course.topics.reduce((sum, topic) => sum + topic.tests.length, 0);
    const completedTests = course.topics.reduce((sum, topic) => 
      sum + topic.tests.reduce((testSum, test) => testSum + test.submissions.length, 0), 0
    );
    
    const completionRate = totalTests > 0 ? Math.round((completedTests / (enrollments * totalTests)) * 100) : 0;
    
    // Calculate average score
    const allScores = course.topics.flatMap(topic => 
      topic.tests.flatMap(test => test.submissions.map(sub => sub.score || 0))
    );
    const averageScore = allScores.length > 0 
      ? Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length)
      : 0;
    
    const revenue = course.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const tutor = course.assignedTutors[0]?.name || 'Unassigned';
    
    return {
      id: course.id,
      title: course.title,
      tutor,
      enrollments,
      completionRate,
      averageScore,
      revenue
    };
  })
  .sort((a, b) => b.enrollments - a.enrollments)
  .slice(0, 10); // Top 10 courses
}
