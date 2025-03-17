import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../lib/db';
import SSOSession from '../../../../models/ssoSession';
import { generateToken } from '../../../../lib/auth';
import User from '../../../../models/userModel';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { sessionId, userId } = req.query;

  if (!sessionId || !userId) {
    return res.status(400).json({ message: 'Session ID and user ID are required' });
  }

  try {
    await dbConnect();

    // Find the session
    const session = await SSOSession.findOne({ 
      sessionId,
      isComplete: false,
      expiresAt: { $gt: new Date() }
    });

    if (!session) {
      return res.status(404).json({ message: 'Invalid or expired session' });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate an SSO token
    const token = generateToken(user);

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

    return res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('SSO callback error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}