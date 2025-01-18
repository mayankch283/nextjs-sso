import Errors from "@/common/errors";
import { Helpers } from "@/helpers/Helpers";
import { AuthenticationService } from "@/services/Authentication/AuthenticationService";
import { NextRequest, NextResponse } from "next/server";
import config from "@/../config/config.json";

const authenticationService = new AuthenticationService();

export async function POST(request: NextRequest) {
    try {
        const { firstName, lastName, username, email, password } = await request.json();
        // validations on the input
        if (!firstName || !lastName || !username || !email || !password)
            throw new Error(Errors.MISSING_FIELDS.message);

        const usernameRegex = config.validations.username.map((item) => ({
            regex: new RegExp(item.regex),
            message: item.message,
            error: item.error
        }));
        const invalidUsername = usernameRegex.find((r) => !r.regex.test(username));
        if (invalidUsername)
            throw new Error(invalidUsername.message);

        const passwordRegex = config.validations.password.map((item) => ({
            regex: new RegExp(item.regex),
            message: item.message,
            error: item.error
        }));
        const invalidPassword = passwordRegex.find((r) => !r.regex.test(password));
        if (invalidPassword)
            throw new Error(invalidPassword.message);

        await authenticationService.registerUser(firstName, lastName, username, email, password);
        return NextResponse.json({
            success: true,
            message: "User registered successfully"
        }, { status: 201 });

    } catch (e) {
        console.log(e);
        let error = Helpers.FetchError(e as Error);
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: error.status });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const { email, otp } = await request.json();
        if (!email && !otp)
            throw new Error(Errors.MISSING_FIELDS.message);
        await authenticationService.verifyAccount(email, otp);
        return NextResponse.json({
            status: "success",
            message: "Account verified successfully"
        }, { status: 200 });
    } catch (e) {
        let error = Helpers.FetchError(e as Error);
        return NextResponse.json({
            status: "error",
            message: error.message
        }, { status: error.status });
    }
}


