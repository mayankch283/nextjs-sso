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

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: '1h' },
    );

    session.userId = user._id;
    session.isComplete = true;
    await session.save();

    const domains = process.env.SSO_DOMAINS?.split(',') || ['localhost:3000', 'localhost:3001'];

    const html = `
      <!DOCTYPE html>
      <html>
        <body>
          <script>
            let syncedCount = 0;
            
            window.onmessage = (event) => {
              if (event.data.type === 'TOKEN_SYNCED') {
                syncedCount++;
                if (syncedCount === domains.length) {
                  window.location.href = '${session.callbackUrl}?token=${token}${session.state ? `&state=${session.state}` : ''}';
                }
              }
            };

            domains.forEach(domain => {
              const iframe = document.createElement('iframe');
              iframe.style.display = 'none';
              iframe.src = \`https://\${domain}/cookie-sync\`;
              document.body.appendChild(iframe);
              
              iframe.onload = () => {
                iframe.contentWindow.postMessage({
                  type: 'SET_TOKEN',
                  token: '${token}'
                }, \`https://\${domain}\`);
              };
            });
          </script>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error('SSO callback error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}
