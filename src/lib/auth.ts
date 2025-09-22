import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to check if user has admin or manager privileges
export const isAdminOrManager = (role: string) => {
  return role === 'ADMIN' || role === 'MANAGER';
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        console.log("🔍 NextAuth authorize called for:", credentials.email);

        try {
          // Try database authentication first
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true
            }
          });
          
          if (user) {
            // Check password with bcrypt
            const isValidPassword = await bcrypt.compare(credentials.password, user.password);
            
            if (isValidPassword) {
              console.log("✅ Database authentication successful for:", credentials.email);
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
              };
            } else {
              console.log("❌ Password validation failed for:", credentials.email);
              return null;
            }
          }
        } catch (error) {
          console.error("❌ Database authentication error:", error);
          
          // Check if it's a schema issue (missing columns)
          if (error.code === 'P2022' || error.message.includes('does not exist')) {
            console.log("🔄 Database schema issue detected, falling back to mock authentication...");
          } else {
            console.log("🔄 Database connection issue, falling back to mock authentication...");
          }
        }

        // Fallback to mock users for production/database issues
        const mockUsers = [
          {
            id: 'admin-1',
            email: 'admin@nuetprep.academy',
            password: 'admin123',
            name: 'Admin User',
            role: 'ADMIN'
          },
          {
            id: 'manager-1',
            email: 'yeraltay@manager.com',
            password: 'manager123',
            name: 'Yeraltay Manager',
            role: 'MANAGER'
          },
          {
            id: 'manager-2',
            email: 'asylzada@manager.com',
            password: 'manager123',
            name: 'Asylzada Manager',
            role: 'MANAGER'
          },
          {
            id: 'tutor-1',
            email: 'tutor@nuet.com',
            password: 'tutor123',
            name: 'Tutor User',
            role: 'TUTOR'
          },
          {
            id: 'student-1',
            email: 'student@nuet.com',
            password: 'student123',
            name: 'Student User',
            role: 'STUDENT'
          },
          {
            id: 'student-2',
            email: 'anton.ivanova@gmail.com',
            password: 'student123',
            name: 'Anton Ivanova',
            role: 'STUDENT'
          }
        ];

        const mockUser = mockUsers.find(u => u.email === credentials.email);
        
        if (mockUser && mockUser.password === credentials.password) {
          console.log("✅ Mock authentication successful for:", credentials.email);
          return {
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name,
            role: mockUser.role,
          };
        }

        console.log("❌ User not found or invalid password for:", credentials.email);
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        // Remove image from JWT to prevent header size issues
        // token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
        // Remove image from session to prevent header size issues
        // session.user.image = token.image;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin"
  }
};
