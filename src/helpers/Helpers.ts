import bryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "@/../config/config.json";
import { jwtVerify } from "jose";
import Errors from "@/common/errors";
import { DecodedTokenPayload, TokenPayload } from "@/common/types";

const tokenSecret = process.env.TOKEN_SECRET!;

export class Helpers {

    static async salt(rounds: number) {
        return await bryptjs.genSalt(rounds);
    }
    static async hash(data: string, salt: string) {
        return await bryptjs.hash(data, salt);
    }
    static async compare(data: string, encrypted: string) {
        return await bryptjs.compare(data, encrypted);
    }
    static generateToken(payload: TokenPayload) {
        if (!tokenSecret)
            throw new Error(Errors.TOKEN_SECRET_NOT_DEFINED.message);
        return jwt.sign(payload, tokenSecret, { expiresIn: config.authentication.accessToken.expiryInMinutes * 60 });
    }
    static verifyToken(token: string): DecodedTokenPayload {
        if (!tokenSecret)
            throw new Error(Errors.TOKEN_SECRET_NOT_DEFINED.message);
        try { return jwt.verify(token, tokenSecret) as DecodedTokenPayload; } catch (e) { throw new Error((e as Error).message); }
    }
    static async joseVerifyToken(token: string): Promise<{ valid: boolean, payload: TokenPayload }> {
        try {
            const secret = new TextEncoder().encode(tokenSecret);
            const { payload } = await jwtVerify(token, secret);
            return { valid: true, payload: payload as TokenPayload };
        } catch (e) {
            throw new Error((e as Error).message);
        }
    }
    static generateOtp(n: number): string {
        const digits = '0123456789';
        let otp = '';
        for (let i = 0; i < n; i++) {
            otp += digits[Math.floor(Math.random() * 10)];
        }
        return otp;
    }
    static FetchError(e: Error) {
        let error = Errors.UNKNOWN_ERROR;
        for (let key in Errors) {
            if (e.message === ((Errors as unknown) as Record<string, { message: string }>)[key].message) {
                error = ((Errors as unknown) as Record<string, { message: string, status: number }>)[key];
                break;
            }
        }
        return error;
    }
}