import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please enter your username'],
      max: 255,
      min: 5,
      unique: true,
    },
    email: {
      type: String,
      max: 255,
      min: 6,
      sparse: true,
      unique: true,
      index: true,
      default: null,
    },
    password: {
      type: String,
      required: [true, 'Please enter your password'],
      max: 1024,
      min: 5,
    },
  },
  {
    timestamps: true,
  },
);

// Create and compile model
let User: any;
try {
  // Try to get existing model
  User = mongoose.model('User');
} catch {
  // Create new model if it doesn't exist
  User = mongoose.model('User', userSchema);
}

export default User;

