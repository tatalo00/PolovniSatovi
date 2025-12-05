import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Get token from cookie (JWT strategy)
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  });

  const isLoggedIn = !!token;
  const userRole = token?.role as string | undefined;

  // Protect admin routes - require ADMIN role
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      const signInUrl = new URL("/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Protect dashboard routes - require authentication
  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      const signInUrl = new URL("/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Protect sell routes - require authentication
  if (pathname.startsWith("/sell")) {
    if (!isLoggedIn) {
      const signInUrl = new URL("/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

// Only run middleware on protected routes
// This improves performance by skipping middleware for public pages
export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/sell/:path*",
  ],
};
