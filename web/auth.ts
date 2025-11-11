import "server-only";

import NextAuth from "next-auth";
import type { Adapter } from "next-auth/adapters";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
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
  },
  callbacks: {
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
              throw error;
            }
          }
        }

        session.user.isVerified =
          userRecord?.isVerified ?? extendedToken.isVerified ?? session.user.isVerified ?? false;
        session.user.role = userRecord?.role ?? extendedToken.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
});

