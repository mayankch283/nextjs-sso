import { dbConnect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();
    const users = await User.find({});
    // await User.findByIdAndUpdate('67d5bda91e0eaa5d7757a878', { isEmailVerified: true }, { boolean: true });
    // await User.findByIdAndUpdate('67d5bda91e0eaa5d7757a878', { isPhoneVerified: true }, { boolean: true });
    await User.findByIdAndUpdate(
      '67d5bda91e0eaa5d7757a878',
      { isActive: true },
      { boolean: true },
    );
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Failed to fetch users' },
      { status: 500 },
    );
  }
}
