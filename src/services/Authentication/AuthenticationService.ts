import { dbConnect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';
import { MailingService } from '../Mailer/MailingService';
import Errors from '@/common/errors';
import { Helpers } from '@/helpers/Helpers';
import config from '@/../config/config.json';
import { SMSService } from '../SMS/SMSService';

dbConnect();

export class AuthenticationService {
  mailer: MailingService;
  smsService: SMSService;

  constructor() {
    this.mailer = new MailingService();
    this.smsService = new SMSService();
  }

  registerUser = async (
    firstName: string,
    lastName: string,
    username: string,
    email: string | null,
    phoneNumber: string | null,
    password: string,
  ) => {
    let userId: null | string = null;
    try {
      console.log('Starting user registration process...');

      if (!email && !phoneNumber) {
        throw new Error(Errors.PHONE_OR_EMAIL_REQUIRED.message);
      }

      // Check if email exists (if provided)
      if (email) {
        const userByEmail = await User.findOne({ email });
        if (userByEmail) {
          throw new Error(Errors.USER_ALREADY_EXISTS.message);
        }
      }

      // Check if phone exists (if provided)
      if (phoneNumber) {
        const userByPhone = await User.findOne({ phoneNumber });
        if (userByPhone) {
          throw new Error(Errors.PHONE_ALREADY_EXISTS.message);
        }
      }

      const salt = await Helpers.salt(10);
      const hashedPassword = await Helpers.hash(password, salt);

      const newUser = new User({
        firstName,
        lastName,
        username,
        email,
        phoneNumber,
        password: hashedPassword,
        mfa_enabled: config.mfa.mfa_email || config.mfa.mfa_sms,
        isEmailVerified: !config.registeration.emailVerification.required,
        isPhoneVerified: !config.registeration.phoneVerification.required,
      });

      const savedUser = await newUser.save();
      userId = savedUser._id;

      if (email && config.registeration.emailVerification.required) {
        const otp = Helpers.generateOtp(
          config.registeration.emailVerification.otpLength,
        );
        await User.findByIdAndUpdate(savedUser._id, {
          emailVerificationOTP: otp,
          verificationOTPExpiry:
            Date.now() +
            config.registeration.emailVerification.expiryInMinutes * 60 * 1000,
        });
        await this.mailer.sendVerificationOTPEmail(email, otp);
      }
      if (phoneNumber && config.registeration.phoneVerification.required) {
        const otp = Helpers.generateOtp(
          config.registeration.emailVerification.otpLength,
        );
        await User.findByIdAndUpdate(savedUser._id, {
          phoneVerificationOTP: otp,
          verificationOTPExpiry:
            Date.now() +
            config.registeration.emailVerification.expiryInMinutes * 60 * 1000,
        });
        await this.smsService.sendVerificationOTP(phoneNumber, otp);
      }
      if (
        !config.registeration.emailVerification.required &&
        !config.registeration.phoneVerification.required
      ) {
        savedUser.isActive = true;
        savedUser.save();
      }
    } catch (e) {
      if (userId) {
        await this.deleteUser(userId);
      }
      if (e instanceof Error) {
        throw new Error(e.message);
      } else {
        console.error('Unknown registration error:', e);
        throw new Error(Errors.UNKNOWN_ERROR.message);
      }
    }
  };

  loginUser = async (
    username: string | null,
    email: string | null,
    phoneNumber: string | null,
    password: string,
    otp: string | null,
  ) => {
    if (!username && !email && !phoneNumber) {
      throw new Error(Errors.USERNAME_OR_EMAIL_OR_PHONE_REQUIRED.message);
    }
    if (!password) {
      throw new Error(Errors.PASSWORD_REQUIRED.message);
    }

    try {
      // Create query conditions only for provided values
      const queryConditions = [];
      if (username) queryConditions.push({ username });
      if (email) queryConditions.push({ email });
      if (phoneNumber) queryConditions.push({ phoneNumber });

      const user = await User.findOne({
        $or: queryConditions,
      });

      if (!user) {
        throw new Error(Errors.INVALID_USER.message);
      }

      const isMatch = await Helpers.compare(password, user.password);
      if (!isMatch) {
        throw new Error(Errors.INVALID_CREDENTIALS.message);
      }

      if (user.email && !user.isEmailVerified) {
        throw new Error(Errors.EMAIL_NOT_VERIFIED.message);
      }

      if (user.phoneNumber && !user.isPhoneVerified) {
        throw new Error(Errors.PHONE_NOT_VERIFIED.message);
      }

      if (!user.isActive) {
        throw new Error(Errors.INACTIVATED_USER.message);
      }

      console.log('User logged in successfully', otp);
      if ((config.mfa.mfa_email || config.mfa.mfa_sms) && !otp) {
        const otp = Helpers.generateOtp(config.mfa.otp.length);
        const expiry = Date.now() + config.mfa.otp.expiryInMinutes * 60 * 1000;
        if (config.mfa.mfa_email && user.email) {
          await this.mailer.sendVerificationOTPEmail(user.email, otp);
        }
        if (config.mfa.mfa_sms && user.phoneNumber) {
          await this.smsService.sendVerificationOTP(user.phoneNumber, otp);
        }
        console.log('OTP sent to user', otp);
        user.mfa_otp = otp;
        user.mfa_expiry = expiry;
        await user.save();
        return {
          message:
            'User found kindly verify your email or phone number to login',
        };
      } else if (config.mfa.mfa_email || (config.mfa.mfa_sms && otp)) {
        if (user.mfa_enabled && user.mfa_otp !== otp)
          throw new Error(Errors.INVALID_OTP.message);
        if (user.mfa_expiry < Date.now())
          throw new Error(Errors.OTP_EXPIRED.message);
        user.mfa_otp = null;
        user.mfa_expiry = 0;
        await user.save();
      }

      const accessToken = Helpers.generateToken(
        {
          id: user._id,
          email: user.email,
          phoneNumber: user.phoneNumber,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          admin: user.isAdmin,
        },
        config.authentication.accessToken.expiryInMinutes * 60,
      );

      const refreshToken = Helpers.generateToken(
        {
          id: user._id,
          email: user.email,
          phoneNumber: user.phoneNumber,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          admin: user.isAdmin,
        },
        config.authentication.refreshToken.expiryInMinutes * 60,
      );

      return { accessToken, refreshToken, user };
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message);
      } else {
        throw new Error(Errors.UNKNOWN_ERROR.message);
      }
    }
  };

  verifyAccount = async (email: string, otp: string) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error(Errors.INVALID_USER.message);
      }
      if (user.isEmailVerified) {
        throw new Error(Errors.EMAIL_ALREADY_VERIFIED.message);
      }

      if (user.emailVerificationOTP !== otp) {
        throw new Error(Errors.INVALID_OTP.message);
      }
      if (user.emailVerificationOTPExpiry < Date.now()) {
        throw new Error(Errors.OTP_EXPIRED.message);
      }
      user.isEmailVerified = true;
      user.emailVerificationOTP = null;
      user.emailVerificationOTPExpiry = 0;
      if (user.phoneNumber && user.isPhoneVerified) user.isActive = true;
      await user.save();
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message, 'while verifying account');
        throw new Error(e.message);
      } else {
        console.error('An unknown error occurred while verifying account');
        throw new Error(Errors.UNKNOWN_ERROR.message);
      }
    }
  };

  verifyPhoneNumber = async (phoneNumber: string, otp: string) => {
    try {
      const user = await User.findOne({ phoneNumber });
      if (!user) {
        throw new Error(Errors.INVALID_USER.message);
      }
      if (user.isPhoneVerified) {
        throw new Error(Errors.PHONE_ALREADY_VERIFIED.message);
      }
      if (user.phoneVerificationOTP !== otp) {
        throw new Error(Errors.INVALID_OTP.message);
      }
      if (user.verificationOTPExpiry < Date.now()) {
        throw new Error(Errors.OTP_EXPIRED.message);
      }
      user.isPhoneVerified = true;
      if (user.email && user.isEmailVerified) user.isActive = true;
      user.phoneVerificationOTP = null;
      user.verificationOTPExpiry = 0;
      await user.save();
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message, 'while verifying phone number');
        throw new Error(e.message);
      } else {
        console.error('An unknown error occurred while verifying phone number');
        throw new Error(Errors.UNKNOWN_ERROR.message);
      }
    }
  };

  deleteUser = async (userId: string) => {
    try {
      // Assuming you have a User model with a delete method
      await User.findByIdAndDelete(userId);
      console.log(`User with ID ${userId} has been deleted.`);
    } catch (error) {
      console.error(`Failed to delete user with ID ${userId}:`, error);
      throw new Error(`Failed to delete user with ID ${userId}`);
    }
  };
}
