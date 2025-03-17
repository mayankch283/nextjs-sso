import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/userModel';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret100';
if (!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET not set in environment variables');
}
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export async function findUserByEmail(email: string) {
  return User.findOne({ email });
}

export async function findUserByUsername(username: string) {
  return User.findOne({ username });
}

export function generateToken(user: any): string {
  // Create a token valid for 1 hour
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      username: user.username 
    }, 
    JWT_SECRET, 
    { expiresIn: '1h' }
  );
}

export function verifyToken(token: string): any {
  try {
    if (!token) {
      throw new Error('No token provided');
    }
    
    // Remove 'Bearer ' if present
    const tokenString = token.startsWith('Bearer ') ? token.slice(7) : token;
    
    return jwt.verify(tokenString, JWT_SECRET);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.error('JWT Verification Error:', error.message);
    }
    throw error;
  }
}