export class SMSService {
  async sendVerificationOTP(phoneNumber: string, otp: string) {
    try {
      // For now, just console.log the OTP
      console.log(`Sending OTP ${otp} to phone number ${phoneNumber}`);
      return true;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message, "while sending verification SMS");
        throw new Error(e.message);
      } else {
        console.error(
          "An unknown error occurred while sending verification SMS"
        );
        throw new Error("Error sending verification SMS");
      }
    }
  }
}
