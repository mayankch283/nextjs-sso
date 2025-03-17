// src/scripts/generateTestUsers.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/userModel';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sso-idp';

async function generateTestUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Generate test users
    const users = [
      {
        username: 'testuser1',
        email: 'test1@example.com',
        password: 'password123',
      },
      {
        username: 'testuser2',
        email: 'test2@example.com',
        password: 'password123',
      },
      {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
      },
      {
        username: 'developer',
        email: 'dev@example.com',
        password: 'dev123',
      },
      {
        username: 'manager',
        email: 'manager@example.com',
        password: 'manager123',
      },
    ];

    // Hash passwords and create users
    const createdUsers = [];
    for (const user of users) {
      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [
          { username: user.username },
          { email: user.email }
        ]
      });

      if (existingUser) {
        console.log(`User ${user.username} already exists. Skipping...`);
        continue;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);

      // Create user
      const newUser = await User.create({
        username: user.username,
        email: user.email,
        password: hashedPassword,
      });

      createdUsers.push({
        username: newUser.username,
        email: newUser.email,
        _id: newUser._id.toString(),
      });
    }

    console.log(`Created ${createdUsers.length} test users:`);
    console.table(createdUsers);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Error generating test users:', error);
  }
}

// Run the script
generateTestUsers();