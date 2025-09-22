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
          console.log("❌ Missing credentials");
          return null;
        }

        try {
          // Try to get user from database
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (user) {
            // Verify password using bcrypt
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
          // In production, we should NOT fall back to mock users
          // This is a critical security issue
          if (process.env.NODE_ENV === 'production') {
            console.error("🚨 CRITICAL: Database connection failed in production!");
            return null;
          }
          
          // Only allow mock users in development
          console.log("🔄 Development mode: Falling back to mock authentication...");
        }

        // DEVELOPMENT ONLY: Mock users (NEVER use in production)
        if (process.env.NODE_ENV === 'development') {
          const mockUsers = [
            {
              id: 'admin-1',
              email: 'admin@nuetprep.academy',
              password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8K.5.2a', // admin123
              name: 'Admin User',
              role: 'ADMIN'
            },
            {
              id: 'manager-1',
              email: 'yeraltay@manager.com',
              password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8K.5.2a', // manager123
              name: 'Yeraltay Manager',
              role: 'MANAGER'
            },
            {
              id: 'tutor-1',
              email: 'tutor@nuet.com',
              password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8K.5.2a', // tutor123
              name: 'Tutor User',
              role: 'TUTOR'
            },
            {
              id: 'student-1',
              email: 'student@nuet.com',
              password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8K.5.2a', // student123
              name: 'Student User',
              role: 'STUDENT'
            }
          ];

          const mockUser = mockUsers.find(u => u.email === credentials.email);
          
          if (mockUser) {
            const isValidPassword = await bcrypt.compare(credentials.password, mockUser.password);
            if (isValidPassword) {
              console.log("✅ Development mock authentication successful for:", credentials.email);
              return {
                id: mockUser.id,
                email: mockUser.email,
                name: mockUser.name,
                role: mockUser.role,
              };
            }
          }
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
        sameSite: 'lax', // Changed from 'none' for better security
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
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  debug: process.env.NODE_ENV === 'development',
};
