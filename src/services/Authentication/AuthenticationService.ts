import { dbConnect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import Mail from "nodemailer/lib/mailer";
import { MailingService } from "../Mailer/MailingService";
import Errors from "@/common/errors";
import { Helpers } from "@/helpers/Helpers";
import config from "@/../config/config.json";

dbConnect();

export class AuthenticationService {
    mailer: MailingService;
    constructor() {
        this.mailer = new MailingService();
    }

    registerUser = async (firstName: string, lastName: string, username: string, email: string, password: string) => {
        try {
            const user = await User.findOne({ email });
            if (user) {
                throw new Error(Errors.USER_ALREADY_EXISTS.message);
            }
            const salt = await Helpers.salt(10);
            const hashedPassword = await Helpers.hash(password, salt);
            const newUser = new User({
                firstName,
                lastName,
                username,
                email,
                password: hashedPassword,
                mfa_enabled: config.mfa.enabled,
            });
            const savedUser = await newUser.save();
            if (config.registeration.emailVerification.required) {
                // const hashedToken = await Helpers.hash(savedUser.email, salt);
                const otp = Helpers.generateOtp(config.registeration.emailVerification.otpLength);
                await User.findByIdAndUpdate(savedUser._id, { emailVerificationOTP: otp, verificationOTPExpiry: Date.now() + config.registeration.emailVerification.expiryInMinutes * 60 * 1000 });
                await this.mailer.sendVerificationOTPEmail(savedUser.email, otp);
            } else {
                newUser.isEmailVerified = true;
                newUser.isActive = true;
                await newUser.save();
            }
        } catch (e) {
            if (e instanceof Error) {
                console.error(e.message, "while registering user");
                throw new Error(e.message);
            } else {
                console.error("An unknown error occurred while registering user");
                throw new Error(Errors.UNKNOWN_ERROR.message);
            }
        }

    }

    loginUser = async (username: string, email: string, password: string) => {
        if (!username && !email) {
            throw new Error(Errors.USERNAME_OR_EMAIL_REQUIRED.message);
        }
        if (!password) {
            throw new Error(Errors.PASSWORD_REQUIRED.message);
        }
        try {

            const user = await User.findOne({ $or: [{ username }, { email }] });
            if (!user) {
                throw new Error(Errors.INVALID_USER.message);
            }
            const isMatch = await Helpers.compare(password, user.password);
            if (!isMatch) {
                throw new Error(Errors.INVALID_CREDENTIALS.message);
            }
            if (config.registeration.emailVerification && !user.isEmailVerified) {
                throw new Error(Errors.EMAIL_NOT_VERIFIED.message);
            }
            if (!user.isActive) {
                throw new Error(Errors.INACTIVATED_USER.message);
            }
            // if (!config.mfa.enabled) {
            const token = Helpers.generateToken({ id: user._id, email: user.email, username: user.username, firstName: user.firstName, lastName: user.lastname, admin: user.isAdmin });
            return { token, user: { id: user._id, email: user.email, username: user.username, firstName: user.firstName, lastName: user.lastname, admin: user.isAdmin } };
            // } else {
            //     // todo: implement mfa
            // }
        } catch (e) {
            if (e instanceof Error) {
                console.error(e.message, "while logging in user");
                throw new Error(e.message);
            } else {
                console.error("An unknown error occurred while logging in user");
                throw new Error(Errors.UNKNOWN_ERROR.message);
            }
        }
    }

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
            user.isActive = true;
            await user.save();
        } catch (e) {
            if (e instanceof Error) {
                console.error(e.message, "while verifying account");
                throw new Error(e.message);
            } else {
                console.error("An unknown error occurred while verifying account");
                throw new Error(Errors.UNKNOWN_ERROR.message);
            }
        }
    }
}