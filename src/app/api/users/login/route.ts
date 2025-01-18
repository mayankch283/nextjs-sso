import Errors from "@/common/errors";
import { AuthenticationService } from "@/services/Authentication/AuthenticationService";
import { NextRequest, NextResponse } from "next/server";
import config from "@/../config/config.json";
import { Helpers } from "@/helpers/Helpers";


const authenticationService = new AuthenticationService();

export async function POST(request: NextRequest) {
    try {
        const { username, email, password } = await request.json();
        const user = await authenticationService.loginUser(username, email, password);
        if (!user.token) {
            throw new Error(Errors.UNKNOWN_ERROR.message);
        }
        const response = NextResponse.json({
            message: "User logged in successfully",
            success: true
        }, { status: 200 });
        response.cookies.set(config.other["cookie-name"], user.token, { httpOnly: true, sameSite: "strict" });
        return response;
    } catch (e) {
        let error = Helpers.FetchError(e as Error);
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: error.status });
    }
}