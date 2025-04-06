// src/middleware.ts (at the root of your project)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (pathname.startsWith('/api/') || pathname.startsWith('/cookie-sync')) {
    return NextResponse.next();
  }

  const authToken = request.cookies.get('auth_token')?.value;
  
  if (!authToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  try {
    const decoded = verifyToken(authToken);
    if (!decoded) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};