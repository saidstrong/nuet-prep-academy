import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";

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

        // Mock authentication for testing (bypass database)
        const mockUsers = [
          {
            id: "1",
            email: "admin@nuet.com",
            password: "admin123",
            name: "Admin User",
            role: "ADMIN"
          },
          {
            id: "2", 
            email: "tutor@nuet.com",
            password: "tutor123",
            name: "Tutor User",
            role: "TUTOR"
          },
          {
            id: "3",
            email: "student@nuet.com", 
            password: "student123",
            name: "Student User",
            role: "STUDENT"
          },
          {
            id: "4",
            email: "anton.ivanova@gmail.com",
            password: "admin123",
            name: "Anton Ivanova",
            role: "ADMIN"
          }
        ];

        // Find user in mock data
        const user = mockUsers.find(u => u.email === credentials.email);
        
        if (!user) {
          console.log("❌ User not found for:", credentials.email);
          return null;
        }

        // Simple password check (no hashing for testing)
        if (user.password !== credentials.password) {
          console.log("❌ Password validation failed for:", credentials.email);
          return null;
        }
        
        console.log("✅ Mock authentication successful for:", credentials.email);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
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
