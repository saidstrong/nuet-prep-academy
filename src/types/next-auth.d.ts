import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    role: string;
    id: string;
    // Removed image to prevent session size issues
  }
  
  interface Session {
    user: {
      role: string;
      id: string;
      email: string;
      name: string;
      // Removed image to prevent session size issues
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    id: string;
    // Removed image to prevent session size issues
  }
}
