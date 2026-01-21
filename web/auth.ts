import "server-only";

import NextAuth from "next-auth";
import type { Adapter } from "next-auth/adapters";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import bcrypt from "bcryptjs";

import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";
import { Prisma } from "@prisma/client";

interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: UserRole;
  isVerified: boolean;
}

type ExtendedToken = JWT & {
  role?: UserRole;
  isVerified?: boolean;
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
      ? [
          FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          let user = null as
            | ({
                id: string;
                email: string;
                name: string | null;
                image: string | null;
                role: UserRole;
                password: string | null;
                isVerified?: boolean | null;
              } | null);

          try {
            user = await prisma.user.findUnique({
              where: { email: credentials.email as string },
              select: {
                id: true,
                email: true,
                name: true,
                image: true,
                role: true,
                password: true,
                isVerified: true,
              },
            });
          } catch (error) {
            if (
              error instanceof Prisma.PrismaClientKnownRequestError &&
              error.code === "P2022"
            ) {
              user = await prisma.user.findUnique({
                where: { email: credentials.email as string },
                select: {
                  id: true,
                  email: true,
                  name: true,
                  image: true,
                  role: true,
                  password: true,
                },
              });
            } else {
              throw error;
            }
          }

          const isVerified = user?.isVerified ?? false;

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            isVerified,
          } satisfies AuthUser;
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2022"
          ) {
            const fallback = await prisma.user.findUnique({
              where: { email: credentials.email as string },
              select: {
                id: true,
                email: true,
                name: true,
                image: true,
                role: true,
                password: true,
              },
            });

            if (!fallback?.password) {
              return null;
            }

            const isPasswordValid = await bcrypt.compare(
              credentials.password as string,
              fallback.password
            );

            if (!isPasswordValid) {
              return null;
            }

            return {
              id: fallback.id,
              email: fallback.email,
              name: fallback.name,
              image: fallback.image,
              role: fallback.role,
              isVerified: false,
            } satisfies AuthUser;
          }

          // Database connection error or other issues
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: process.env.SESSION_MAX_AGE
      ? parseInt(process.env.SESSION_MAX_AGE, 10)
      : 7 * 24 * 60 * 60, // Default: 7 days in seconds
    updateAge: process.env.SESSION_UPDATE_AGE
      ? parseInt(process.env.SESSION_UPDATE_AGE, 10)
      : 24 * 60 * 60, // Default: 1 day in seconds
  },
  callbacks: {
    async signIn({ user, account }) {
      // Allow credentials sign-in without additional checks
      if (account?.provider === "credentials") {
        return true;
      }

      // For OAuth providers, check if an account with this email already exists
      if (account?.provider && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: {
            accounts: {
              where: { provider: account.provider },
            },
          },
        });

        // If user exists but doesn't have this OAuth provider linked
        if (existingUser && existingUser.accounts.length === 0) {
          // Check if the user registered with email/password (has a password set)
          if (existingUser.password) {
            // User has a password-based account, don't auto-link for security
            // They need to link the account manually from settings
            return `/auth/error?error=OAuthAccountNotLinked&email=${encodeURIComponent(user.email)}`;
          }

          // User exists but was created via another OAuth provider
          // Link this new OAuth account to the existing user
          await prisma.account.create({
            data: {
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              refresh_token: account.refresh_token,
              access_token: account.access_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
              session_state: account.session_state as string | null,
            },
          });

          // Update user object to use existing user's ID
          user.id = existingUser.id;
          return true;
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      const extendedToken = token as ExtendedToken;

      if (user) {
        const authUser = user as AuthUser;
        extendedToken.role = authUser.role;
        extendedToken.isVerified = authUser.isVerified;
      } else if (token.sub && (!extendedToken.role || extendedToken.isVerified === undefined)) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, isVerified: true },
        });
        if (dbUser) {
          extendedToken.role = dbUser.role;
          extendedToken.isVerified = dbUser.isVerified;
        }
      }

      return extendedToken;
    },
    async session({ session, token }) {
      try {
        if (session.user) {
          const extendedToken = token as ExtendedToken;
          session.user.id = token.sub ?? session.user.id;
          session.user.role = extendedToken.role;

          let userRecord: { role: UserRole; isVerified?: boolean | null } | null = null;
          if (token.sub) {
            try {
              userRecord = await prisma.user.findUnique({
                where: { id: token.sub },
                select: { isVerified: true, role: true },
              });
            } catch (error) {
              if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === "P2022"
              ) {
                const fallback = await prisma.user.findUnique({
                  where: { id: token.sub },
                  select: { role: true },
                });
                if (fallback) {
                  userRecord = { role: fallback.role, isVerified: false };
                }
              } else {
                console.error("Session callback error:", error);
                // Return session with fallback values instead of throwing
                session.user.isVerified = extendedToken.isVerified ?? false;
                session.user.role = extendedToken.role ?? "BUYER";
                return session;
              }
            }
          }

          session.user.isVerified =
            userRecord?.isVerified ?? extendedToken.isVerified ?? session.user.isVerified ?? false;
          session.user.role = userRecord?.role ?? extendedToken.role ?? "BUYER";
        }
        return session;
      } catch (error) {
        console.error("Session callback fatal error:", error);
        // Return a minimal valid session to prevent JSON parse errors
        return {
          ...session,
          user: {
            ...session.user,
            id: token.sub ?? "",
            role: (token as ExtendedToken).role ?? "BUYER",
            isVerified: (token as ExtendedToken).isVerified ?? false,
          },
        };
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
});
