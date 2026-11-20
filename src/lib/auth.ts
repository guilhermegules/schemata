import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { isAdminUser } from "./auth_guard";

export * from "./auth_guard";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID || "",
      clientSecret: process.env.AUTH_GITHUB_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      const allowedAdmin = process.env.ADMIN_EMAIL;
      if (!allowedAdmin) {
        return true;
      }
      return user.email?.toLowerCase() === allowedAdmin.toLowerCase();
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});

