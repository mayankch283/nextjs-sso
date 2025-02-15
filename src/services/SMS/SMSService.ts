import Errors from '@/common/errors';
import twilio from 'twilio';

export class SMSService {
  accountSID: string;
  authToken: string;
  fromPhone: string;
  client;

  constructor() {
    this.accountSID = process.env.TWILIO_ACCOUNT_SID!;
    this.authToken = process.env.TWILIO_AUTH_TOKEN!;
    this.fromPhone = process.env.TWILIO_PHONE_NUMBER!;
    this.client = twilio(this.accountSID, this.authToken);
  }

  async sendVerificationOTP(phoneNumber: string, otp: string) {
    try {
      const messageOptions = {
        body: `otp: ${otp}`,
        from: this.fromPhone, // Your Twilio phone number
        to: phoneNumber,
      };

      const message = await this.client.messages.create(messageOptions);
      console.log('Message sent:', message.sid);
      return true;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message, 'while sending verification SMS');
        throw new Error(e.message);
      } else {
        console.error(
          'An unknown error occurred while sending verification SMS',
        );
        throw new Error(Errors.ERROR_SENDING_SMS.message);
      }
    }
  }
}
