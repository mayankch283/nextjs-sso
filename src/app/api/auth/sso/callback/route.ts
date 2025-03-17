// src/app/api/auth/sso/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import SSOSession from '@/models/ssoSession';
import User from '@/models/userModel';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  // Get the URL object
  const url = new URL(request.url);

  // Get parameters
  const sessionId = url.searchParams.get('sessionId');
  const userId = url.searchParams.get('userId');

  if (!sessionId || !userId) {
    return NextResponse.json(
      { message: 'Session ID and user ID are required' },
      { status: 400 },
    );
  }

  try {
    await dbConnect();

    // Find the session
    const session = await SSOSession.findOne({
      sessionId,
      isComplete: false,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return NextResponse.json(
        { message: 'Invalid or expired session' },
        { status: 404 },
      );
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Generate an SSO token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: '1h' },
    );

    // Mark the session as complete
    session.userId = user._id;
    session.isComplete = true;
    await session.save();

    // Redirect back to the service provider with the token
    const redirectUrl = new URL(session.callbackUrl);
    redirectUrl.searchParams.append('token', token);
    if (session.state) {
      redirectUrl.searchParams.append('state', session.state);
    }

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('SSO callback error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}
