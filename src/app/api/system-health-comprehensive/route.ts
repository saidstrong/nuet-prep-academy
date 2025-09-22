import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const healthCheck = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    checks: {
      authentication: { status: 'unknown', details: '' },
      database: { status: 'unknown', details: '', connectionTime: 0 },
      api: { status: 'unknown', details: '' },
      security: { status: 'unknown', details: '' },
      performance: { status: 'unknown', details: '' }
    },
    errors: [] as string[]
  };

  try {
    // 1. Authentication Check
    try {
      const session = await getServerSession(authOptions);
      if (session) {
        healthCheck.checks.authentication = {
          status: 'healthy',
          details: `User ${session.user.name} (${session.user.role}) authenticated`
        };
      } else {
        healthCheck.checks.authentication = {
          status: 'warning',
          details: 'No active session (this is normal for unauthenticated requests)'
        };
      }
    } catch (error) {
      healthCheck.checks.authentication = {
        status: 'error',
        details: `Authentication system error: ${error}`
      };
      healthCheck.errors.push('Authentication system failure');
    }

    // 2. Database Connection Check
    const dbStartTime = Date.now();
    try {
      // Test basic connection
      await prisma.$queryRaw`SELECT 1`;
      
      // Test user table access
      const userCount = await prisma.user.count();
      
      // Test course table access
      const courseCount = await prisma.course.count();
      
      const dbEndTime = Date.now();
      const connectionTime = dbEndTime - dbStartTime;
      
      healthCheck.checks.database = {
        status: 'healthy',
        details: `Connected successfully. Users: ${userCount}, Courses: ${courseCount}`,
        connectionTime
      };
    } catch (error) {
      healthCheck.checks.database = {
        status: 'error',
        details: `Database connection failed: ${error}`,
        connectionTime: Date.now() - dbStartTime
      };
      healthCheck.errors.push('Database connection failure');
      healthCheck.status = 'unhealthy';
    }

    // 3. API Endpoints Check
    try {
      // Test if we can access the API routes
      const testResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/system-health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (testResponse.ok) {
        healthCheck.checks.api = {
          status: 'healthy',
          details: 'API endpoints responding correctly'
        };
      } else {
        healthCheck.checks.api = {
          status: 'warning',
          details: `API responded with status: ${testResponse.status}`
        };
      }
    } catch (error) {
      healthCheck.checks.api = {
        status: 'error',
        details: `API check failed: ${error}`
      };
      healthCheck.errors.push('API endpoints not accessible');
    }

    // 4. Security Check
    try {
      const securityIssues = [];
      
      // Check for hardcoded passwords in auth
      if (process.env.NODE_ENV === 'production') {
        // In production, we should not have mock users
        const mockUserCount = await prisma.user.count({
          where: {
            email: {
              in: ['admin@nuetprep.academy', 'tutor@nuet.com', 'student@nuet.com']
            }
          }
        });
        
        if (mockUserCount > 0) {
          securityIssues.push('Mock users found in production database');
        }
      }
      
      // Check for weak passwords (this would need to be implemented)
      // Check for missing environment variables
      const requiredEnvVars = ['DATABASE_URL', 'NEXTAUTH_SECRET'];
      const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
      
      if (missingEnvVars.length > 0) {
        securityIssues.push(`Missing environment variables: ${missingEnvVars.join(', ')}`);
      }
      
      if (securityIssues.length === 0) {
        healthCheck.checks.security = {
          status: 'healthy',
          details: 'No obvious security issues detected'
        };
      } else {
        healthCheck.checks.security = {
          status: 'warning',
          details: securityIssues.join('; ')
        };
      }
    } catch (error) {
      healthCheck.checks.security = {
        status: 'error',
        details: `Security check failed: ${error}`
      };
    }

    // 5. Performance Check
    try {
      const perfStartTime = Date.now();
      
      // Test a complex query
      await prisma.user.findMany({
        take: 10,
        include: {
          profile: true,
          courseEnrollments: {
            include: {
              course: true
            }
          }
        }
      });
      
      const perfEndTime = Date.now();
      const queryTime = perfEndTime - perfStartTime;
      
      if (queryTime < 1000) {
        healthCheck.checks.performance = {
          status: 'healthy',
          details: `Complex query completed in ${queryTime}ms`
        };
      } else {
        healthCheck.checks.performance = {
          status: 'warning',
          details: `Complex query took ${queryTime}ms (slow)`
        };
      }
    } catch (error) {
      healthCheck.checks.performance = {
        status: 'error',
        details: `Performance check failed: ${error}`
      };
    }

    // Determine overall status
    const hasErrors = healthCheck.errors.length > 0;
    const hasWarnings = Object.values(healthCheck.checks).some(check => check.status === 'warning');
    
    if (hasErrors) {
      healthCheck.status = 'unhealthy';
    } else if (hasWarnings) {
      healthCheck.status = 'degraded';
    } else {
      healthCheck.status = 'healthy';
    }

    return NextResponse.json(healthCheck, {
      status: healthCheck.status === 'healthy' ? 200 : 503
    });

  } catch (error) {
    healthCheck.status = 'unhealthy';
    healthCheck.errors.push(`System health check failed: ${error}`);
    
    return NextResponse.json(healthCheck, { status: 503 });
  }
}
