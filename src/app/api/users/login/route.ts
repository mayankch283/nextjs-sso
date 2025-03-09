import Errors from '@/common/errors';
import { AuthenticationService } from '@/services/Authentication/AuthenticationService';
import { NextRequest, NextResponse } from 'next/server';
import config from '@/../config/config.json';
import { Helpers } from '@/helpers/Helpers';

const authenticationService = new AuthenticationService();

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login user
 *     description: Authenticates a user using username/email/phone and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: User's username
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
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User logged in successfully
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad request or invalid credentials
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
 *                   example: Invalid credentials
 */

export async function POST(request: NextRequest) {
  try {
    const { username, email, phoneNumber, password, smsOtp, emailOtp } =
      await request.json();

    if (!password) {
      throw new Error(Errors.PASSWORD_REQUIRED.message);
    }

    if (!username && !email && !phoneNumber) {
      throw new Error(Errors.USERNAME_OR_EMAIL_OR_PHONE_REQUIRED.message);
    }

    const user = await authenticationService.loginUser(
      username || null,
      email || null,
      phoneNumber || null,
      password,
      smsOtp || null,
      emailOtp || null,
    );

    let response;

    if (!user.token) {
      response = NextResponse.json(
        {
          message:
            'User found kindly verify your email or phone number to login',
          success: true,
        },
        { status: 200 },
      );
    } else {
      response = NextResponse.json(
        {
          message: 'User logged in successfully',
          success: true,
        },
        { status: 200 },
      );

      response.cookies.set(config.other['cookie-name'], user.token, {
        httpOnly: true,
        sameSite: 'strict',
      });
    }

    return response;
  } catch (e) {
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
