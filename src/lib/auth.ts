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
          
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { profile: true }
          });

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
          console.error("Auth error:", error);
          return null;
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
