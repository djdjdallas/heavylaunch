import { NextResponse } from "next/server";

// Protected routes that require authentication
const protectedPaths = ["/dashboard", "/products", "/settings"];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for Supabase auth cookie
  // Supabase stores the session in cookies prefixed with sb-
  const hasAuthCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token"));

  if (!hasAuthCookie) {
    // Redirect to login if no auth cookie found
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/products/:path*", "/settings/:path*"],
};
