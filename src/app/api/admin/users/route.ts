import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'OWNER', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    try {
      // Build where clause
      const where: any = {};
      if (role && role !== 'ALL') {
        where.role = role;
      }
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            profile: true,
            _count: {
              select: {
                studentEnrollments: true,
                courses: true
              }
            }
          }
        }),
        prisma.user.count({ where })
      ]);

      return NextResponse.json({
        success: true,
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        source: 'database'
      });

    } catch (dbError) {
      console.error('Database error, using fallback data:', dbError);
      
      // Fallback to mock data
      const mockUsers = [
        {
          id: 'admin-1',
          name: 'Admin User',
          email: 'admin@nuetprep.academy',
          role: 'ADMIN',
          createdAt: new Date().toISOString(),
          profile: {
            bio: 'System Administrator',
            avatar: null
          },
          _count: {
            studentEnrollments: 0,
            courses: 5
          }
        },
        {
          id: 'manager-1',
          name: 'Yeraltay Manager',
          email: 'yeraltay@manager.com',
          role: 'MANAGER',
          createdAt: new Date().toISOString(),
          profile: {
            bio: 'Course Manager',
            avatar: null
          },
          _count: {
            studentEnrollments: 0,
            courses: 3
          }
        },
        {
          id: 'tutor-1',
          name: 'Tutor User',
          email: 'tutor@nuet.com',
          role: 'TUTOR',
          createdAt: new Date().toISOString(),
          profile: {
            bio: 'Mathematics Tutor',
            avatar: null
          },
          _count: {
            studentEnrollments: 0,
            courses: 2
          }
        },
        {
          id: 'student-1',
          name: 'Student User',
          email: 'student@nuet.com',
          role: 'STUDENT',
          createdAt: new Date().toISOString(),
          profile: {
            bio: 'NUET Preparation Student',
            avatar: null
          },
          _count: {
            studentEnrollments: 3,
            courses: 0
          }
        }
      ];

      // Filter mock data based on search parameters
      let filteredUsers = mockUsers;
      if (role && role !== 'ALL') {
        filteredUsers = filteredUsers.filter(user => user.role === role);
      }
      if (search) {
        filteredUsers = filteredUsers.filter(user => 
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Paginate mock data
      const startIndex = skip;
      const endIndex = startIndex + limit;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

      return NextResponse.json({
        success: true,
        users: paginatedUsers,
        pagination: {
          page,
          limit,
          total: filteredUsers.length,
          pages: Math.ceil(filteredUsers.length / limit)
        },
        source: 'fallback',
        message: 'Using fallback data due to database issues'
      });
    }

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'OWNER', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, role, password } = body;

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        password: password || 'defaultPassword123', // In production, hash this
        profile: {
          create: {
            bio: '',
            avatar: null
          }
        }
      },
      include: {
        profile: true
      }
    });

    return NextResponse.json({
      success: true,
      user
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
