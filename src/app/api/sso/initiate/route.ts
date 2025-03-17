// src/app/api/sso/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import dbConnect from '@/lib/db';
import SSOSession from '@/models/ssoSession';

export async function GET(request: NextRequest) {
  // Get the URL object
  const url = new URL(request.url);
  
  // Get service provider callback URL and other params
  const callbackUrl = url.searchParams.get('callbackUrl');
  const state = url.searchParams.get('state');

  if (!callbackUrl) {
    return NextResponse.json(
      { message: 'Callback URL is required' },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    // Generate a unique session ID
    const sessionId = uuidv4();

    // Store the session information
    await SSOSession.create({
      sessionId,
      callbackUrl,
      state,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // Redirect to login page with the session ID
    const redirectUrl = `/login?sessionId=${sessionId}`;
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    console.error('SSO initiation error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}