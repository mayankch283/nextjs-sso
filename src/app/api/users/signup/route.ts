import Errors from "@/common/errors";
import { Helpers } from "@/helpers/Helpers";
import { AuthenticationService } from "@/services/Authentication/AuthenticationService";
import { NextRequest, NextResponse } from "next/server";
import config from "@/../config/config.json";

const authenticationService = new AuthenticationService();

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

    await authenticationService.registerUser(
      firstName,
      lastName,
      username,
      email,
      phoneNumber,
      password
    );

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
      },
      { status: 201 }
    );
  } catch (e) {
    console.log(e);
    let error = Helpers.FetchError(e as Error);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: error.status }
    );
  }
}

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
        status: "success",
        message: "Account verified successfully",
      },
      { status: 200 }
    );
  } catch (e) {
    let error = Helpers.FetchError(e as Error);
    return NextResponse.json(
      {
        status: "error",
        message: error.message,
      },
      { status: error.status }
    );
  }
}
