class Errors {
  static readonly SENDING_VERIFICATION_EMAIL = {
    message: "ErrorSendingVerificationEmail",
    status: 500,
  };
  static readonly DOMAIN_NOT_DEFINED = {
    message: "DOMAIN is not defined in .env file",
    status: 500,
  };
  static readonly SENDER_EMAIL_NOT_DEFINED = {
    message: "SENDER_EMAIL is not defined in .env file",
    status: 500,
  };
  static readonly MONGO_URL_NOT_DEFINED = {
    message: "MONGO_URL is not defined in .env file",
    status: 500,
  };
  static readonly MAIL_HOST_NOT_DEFINED = {
    message: "MAIL_HOST is not defined in .env file",
    status: 500,
  };
  static readonly MAIL_PORT_NOT_DEFINED = {
    message: "MAIL_PORT is not defined in .env file",
    status: 500,
  };
  static readonly MAIL_USER_NOT_DEFINED = {
    message: "MAIL_USER is not defined in .env file",
    status: 500,
  };
  static readonly MAIL_PASS_NOT_DEFINED = {
    message: "MAIL_PASS is not defined in .env file",
    status: 500,
  };
  static readonly USER_ALREADY_EXISTS = {
    message: "User already exists",
    status: 409,
  };
  static readonly UNKNOWN_ERROR = {
    message: "An unknown error occurred",
    status: 500,
  };
  static readonly TOKEN_SECRET_NOT_DEFINED = {
    message: "TOKEN_SECRET is not defined in .env file",
    status: 500,
  };
  static readonly USERNAME_OR_EMAIL_REQUIRED = {
    message: "Username or email is required",
    status: 400,
  };
  static readonly PASSWORD_REQUIRED = {
    message: "Password is required",
    status: 400,
  };
  static readonly INVALID_USER = { message: "Invalid user", status: 400 };
  static readonly INVALID_CREDENTIALS = {
    message: "Invalid credentials",
    status: 400,
  };
  static readonly EMAIL_NOT_VERIFIED = {
    message: "Email not verified",
    status: 400,
  };
  static readonly INACTIVATED_USER = {
    message: "User is not dectivated",
    status: 400,
  };
  static readonly MISSING_FIELDS = {
    message: "Missing input fields",
    status: 400,
  };
  static readonly EMAIL_ALREADY_VERIFIED = {
    message: "Email already verified",
    status: 400,
  };
  static readonly INVALID_OTP = { message: "Invalid OTP", status: 400 };
  static readonly OTP_EXPIRED = { message: "OTP expired", status: 400 };
  static readonly PASSWORD_LENGTH_ERROR = {
    message: "Password must be between 8 and 256 characters",
    status: 400,
  };
  static readonly PASSWORD_UPPERCASE_ERROR = {
    message: "Password must contain at least one uppercase letter",
    status: 400,
  };
  static readonly PASSWORD_LOWERCASE_ERROR = {
    message: "Password must contain at least one lowercase letter",
    status: 400,
  };
  static readonly PASSWORD_NUMBER_ERROR = {
    message: "Password must contain at least one number",
    status: 400,
  };
  static readonly PASSWORD_SPECIAL_CHAR_ERROR = {
    message: "Password must contain at least one special character",
    status: 400,
  };
  static readonly PASSWORD_INVALID_CHARACTER_ERROR = {
    message:
      "Password must contain only alphanumeric and special characters ~!.@#$%^&*<>,._+=",
    status: 400,
  };
  static readonly PASSWORD_SPACE_CHARACTER_ERROR = {
    message: "Password must not contain any spaces",
    status: 400,
  };
  static readonly USERNAME_LENGTH_ERROR = {
    message: "Username must be between 3 and 30 characters",
    status: 400,
  };
  static readonly USERNAME_SPACE_CHARACTER_ERROR = {
    message: "Username must not contain any spaces",
    status: 400,
  };
  static readonly USERNAME_INVALID_CHARACTER_ERROR = {
    message: "Username must contain only alphanumeric characters",
    status: 400,
  };
  static readonly PHONE_OR_EMAIL_REQUIRED = {
    message: "Either phone number or email is required",
    status: 400,
  };
  static readonly INVALID_PHONE_NUMBER = {
    message: "Invalid phone number",
    status: 400,
  };
  static readonly PHONE_ALREADY_EXISTS = {
    message: "Phone number already exists",
    status: 409,
  };
  static readonly PHONE_NOT_VERIFIED = {
    message: "Phone number not verified",
    status: 400,
  };
  static readonly PHONE_ALREADY_VERIFIED = {
    message: "Phone number already verified",
    status: 400,
  };
  static readonly USERNAME_OR_EMAIL_OR_PHONE_REQUIRED = {
    message: "Username, email or phone number is required",
    status: 400,
  };
}

export default Errors;
