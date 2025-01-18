import Errors from '@/common/errors';
import nodemailer from 'nodemailer';

export class MailingService {
    domain: string;
    transporter: nodemailer.Transporter;
    senderEmail: string;

    constructor() {
        const domain = process.env.DOMAIN!;
        const senderEmail = process.env.SENDER_EMAIL!;
        const mailHost: string = process.env.MAIL_HOST!;
        const mailPort: string = process.env.MAIL_PORT!;
        const mailUser: string = process.env.MAIL_USER!;
        const mailPass: string = process.env.MAIL_PASS!;
        if (!domain) {
            throw new Error(Errors.DOMAIN_NOT_DEFINED.message);
        }
        if (!senderEmail) {
            throw new Error(Errors.SENDER_EMAIL_NOT_DEFINED.message);
        }
        if (!mailHost) {
            throw new Error(Errors.MAIL_HOST_NOT_DEFINED.message);
        }
        if (!mailPort) {
            throw new Error(Errors.MAIL_PORT_NOT_DEFINED.message);
        }
        if (!mailUser) {
            throw new Error(Errors.MAIL_USER_NOT_DEFINED.message);
        }
        if (!mailPass) {
            throw new Error(Errors.MAIL_PASS_NOT_DEFINED.message);
        }
        this.domain = domain;
        this.senderEmail = senderEmail;
        this.transporter = nodemailer.createTransport({
            host: `${mailHost}`,
            port: parseInt(mailPort.toString()),
            auth: {
                user: mailUser,
                pass: mailPass
            }
        });
    }



    async sendVerificationEmail(email: string, token: string) {
        try {
            const mailOptions = {
                from: this.senderEmail,
                to: email,
                subject: 'Email Verification',
                html: `<p>Click on the button below to verify your email:</p>
                            <a href="${this.domain}/verify-email/?token=${token}" style="text-decoration: none;">
                                <button style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                    Verify Email
                                </button>
                            </a>
                        <p>Or click on this link: <a href="${this.domain}/verify-email/?token=${token}">${this.domain}/verify-email/?token=${token}</a></p>
                    `
            }
            const mailResponse = await this.transporter.sendMail(mailOptions);
            return mailResponse;
        } catch (e) {
            if (e instanceof Error) {
                console.error(e.message, "while sending verification email");
                throw new Error(e.message)
            } else {
                console.error("An unknown error occurred while sending verification email");
                throw new Error(Errors.SENDING_VERIFICATION_EMAIL.message)
            }
        }
    }

    async sendVerificationOTPEmail(email: string, otp: string) {
        try {
            const mailOptions = {
                from: this.senderEmail,
                to: email,
                subject: 'Email Verification',
                html: `<p>Enter the below OTP to verifyyour email:</p>
                       <p>Your OTP is: <strong>${otp}</strong></p>
                    `
            }
            const mailResponse = await this.transporter.sendMail(mailOptions);
            return mailResponse;
        } catch (e) {
            if (e instanceof Error) {
                console.error(e.message, "while sending verification email");
                throw new Error(e.message)
            } else {
                console.error("An unknown error occurred while sending verification email");
                throw new Error(Errors.SENDING_VERIFICATION_EMAIL.message)
            }
        }
    }

}