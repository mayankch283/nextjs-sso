import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';

export async function POST(request: NextRequest) {
  const { token } = await request.json();

  if (!token) {
    return NextResponse.json({ message: 'Token is required' }, { status: 400 });
  }

  try {
    console.log(token);
    await dbConnect();
    const decoded = verifyToken(token);
    console.log(decoded);
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    return NextResponse.json({ 
      valid: true, 
      user: {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email
      } 
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}