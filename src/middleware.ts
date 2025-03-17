// src/middleware.ts (at the root of your project)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// List of paths that require authentication
const protectedPaths = ['/dashboard'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for API routes and public routes
  if (pathname.startsWith('/api/') || !protectedPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Get the session cookie
  const sessionCookie = request.cookies.get('session')?.value;
  
  if (!sessionCookie) {
    // Redirect to login if no session cookie
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Verify the token
  const userData = verifyToken(sessionCookie);
  
  if (!userData) {
    // Redirect to login if token is invalid
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};