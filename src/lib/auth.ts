// src/lib/auth.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/userModel';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Use environment variables in production

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
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}