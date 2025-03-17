import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/db';
import { v4 as uuidv4 } from 'uuid'; // to generate unique IDs
import SSOSession from '@/models/ssoSession';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Get service provider callback URL and other params
  const { callbackUrl, state } = req.query;

  if (!callbackUrl) {
    return res.status(400).json({ message: 'Callback URL is required' });
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
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('SSO initiation error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}