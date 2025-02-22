import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please enter your first name'],
      min: 3,
      max: 255,
    },
    lastName: {
      type: String,
      required: [true, 'Please enter your last name'],
      min: 3,
      max: 255,
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
    phoneNumber: {
      type: String,
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
    username: {
      type: String,
      required: [true, 'Please enter your username'],
      max: 255,
      min: 5,
      unique: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    mfa_enabled: {
      type: Boolean,
      default: false,
    },
    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: Date,
    emailVerificationOTP: String,
    phoneVerificationOTP: String,
    verificationOTPExpiry: Date,
    mfa_otp: String,
    mfa_expiry: Date,
    lastLogin: Date,
  },
  {
    timestamps: true,
  },
);

// Add compound index to ensure either email or phone is present
userSchema.index(
  { email: 1, phoneNumber: 1 },
  {
    partialFilterExpression: {
      $or: [
        { email: { $type: 'string' } },
        { phoneNumber: { $type: 'string' } },
      ],
    },
  },
);

const User = mongoose.models.users || mongoose.model('users', userSchema);

export default User;
