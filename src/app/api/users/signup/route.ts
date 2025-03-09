import Errors from '@/common/errors';
import { Helpers } from '@/helpers/Helpers';
import { AuthenticationService } from '@/services/Authentication/AuthenticationService';
import { NextRequest, NextResponse } from 'next/server';
import config from '@/../config/config.json';

const authenticationService = new AuthenticationService();

/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     tags: [Signup]
 *     summary: Register a new user
 *     description: Creates a new user account with the provided information
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - username
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: User's first name
 *               lastName:
 *                 type: string
 *                 description: User's last name
 *               username:
 *                 type: string
 *                 description: Unique username
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               phoneNumber:
 *                 type: string
 *                 description: User's phone number
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *       400:
 *         description: Bad request - validation errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Missing input fields
 */
export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, username, email, phoneNumber, password } =
      await request.json();

    if (!firstName || !lastName || !username || !password) {
      throw new Error(Errors.MISSING_FIELDS.message);
    }

    if (!email && !phoneNumber) {
      throw new Error(Errors.PHONE_OR_EMAIL_REQUIRED.message);
    }

    const usernameRegex = config.validations.username.map((item) => ({
      regex: new RegExp(item.regex),
      message: item.message,
      error: item.error,
    }));
    const invalidUsername = usernameRegex.find((r) => !r.regex.test(username));
    if (invalidUsername) throw new Error(invalidUsername.message);

    const passwordRegex = config.validations.password.map((item) => ({
      regex: new RegExp(item.regex),
      message: item.message,
      error: item.error,
    }));
    const invalidPassword = passwordRegex.find((r) => !r.regex.test(password));
    if (invalidPassword) throw new Error(invalidPassword.message);

    if (phoneNumber) {
      // Basic phone number validation - modify regex according to your needs
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phoneNumber)) {
        throw new Error(Errors.INVALID_PHONE_NUMBER.message);
      }
    }

    await authenticationService.registerUser(
      firstName,
      lastName,
      username,
      email,
      phoneNumber,
      password,
    );

    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
      },
      { status: 201 },
    );
  } catch (e) {
    console.error('Signup error:', e);
    const error = Helpers.FetchError(e as Error);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: error.status },
    );
  }
}

/**
 * @swagger
 * /api/users/signup:
 *   patch:
 *     tags: [Signup]
 *     summary: Verify user account
 *     description: Verifies user's email or phone number using OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email to verify
 *               phoneNumber:
 *                 type: string
 *                 description: Phone number to verify
 *               otp:
 *                 type: string
 *                 description: One-time password received
 *     responses:
 *       200:
 *         description: Account verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Account verified successfully
 *       400:
 *         description: Bad request or invalid OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Invalid OTP
 */
export async function PATCH(request: NextRequest) {
  try {
    const { email, phoneNumber, otp } = await request.json();

    if (!otp) {
      throw new Error(Errors.MISSING_FIELDS.message);
    }

    // If neither email nor phone is provided
    if (!email && !phoneNumber) {
      throw new Error(Errors.PHONE_OR_EMAIL_REQUIRED.message);
    }

    if (email) {
      await authenticationService.verifyAccount(email, otp);
    } else if (phoneNumber) {
      await authenticationService.verifyPhoneNumber(phoneNumber, otp);
    }

    return NextResponse.json(
      {
        status: 'success',
        message: email
          ? 'email verified successfully'
          : 'phone number verified successfully',
      },
      { status: 200 },
    );
  } catch (e) {
    const error = Helpers.FetchError(e as Error);
    return NextResponse.json(
      {
        status: 'error',
        message: error.message,
      },
      { status: error.status },
    );
  }
}
