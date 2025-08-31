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

        try {
          console.log("🔍 NextAuth authorize called for:", credentials.email);
          
          // Lazy import to prevent build-time issues
          const { prisma } = await import("@/lib/prisma");
          
          // Test database connection first
          await prisma.$connect();
          console.log("✅ Database connected successfully in NextAuth");
          
          // Test basic database functionality first
          console.log("🧪 Testing basic database query...");
          const userCount = await prisma.user.count();
          console.log("✅ User count query successful:", userCount);
          
          // Now try to find the specific user
          console.log("🔍 Looking for user with email:", credentials.email);
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });
          
          if (user) {
            console.log("✅ User found with basic query");
            // Try to get profile separately to avoid include issues
            try {
              const profile = await prisma.profile.findUnique({
                where: { userId: user.id }
              });
              console.log("✅ Profile query successful:", profile ? "Profile exists" : "No profile");
            } catch (profileError) {
              console.log("⚠️ Profile query failed, continuing without profile:", profileError);
            }
          }

          if (!user) {
            console.log("❌ User not found for:", credentials.email);
            return null;
          }
          
          console.log("✅ User found:", { id: user.id, name: user.name, role: user.role });

          // Lazy import bcrypt to prevent build-time issues
          const bcrypt = await import("bcryptjs");
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            console.log("❌ Password validation failed for:", credentials.email);
            return null;
          }
          
          console.log("✅ Password validation successful for:", credentials.email);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("❌ NextAuth error:", error);
          console.error("❌ Error details:", {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : 'Unknown',
            stack: error instanceof Error ? error.stack : 'Unknown'
          });
          return null;
        } finally {
          try {
            const { prisma } = await import("@/lib/prisma");
            await prisma.$disconnect();
            console.log("✅ Database disconnected in NextAuth");
          } catch (e) {
            console.log("⚠️ Error disconnecting database:", e);
          }
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
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
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin"
  }
};
