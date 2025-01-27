export type TokenPayload = {
  id: string;
  email: string;
  phoneNumber: string;
  username: string;
  firstName: string;
  lastName: string;
  admin: boolean;
};

export type DecodedTokenPayload = {
  id: string;
  email: string;
  phoneNumber: string;
  username: string;
  firstName: string;
  lastName: string;
  admin: boolean;
  iat: number;
  exp: number;
};
