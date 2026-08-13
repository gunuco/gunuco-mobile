/** Authentication domain types aligned with documented API contract. */

export type Customer = {
  customerId: string;
  phone: string;
  name?: string | null;
  email?: string | null;
  profileImage?: string | null;
  status?: string;
};

export type OtpRequestPayload = {
  phone: string;
};

export type OtpRequestResponse = {
  challengeId: string;
  expiresIn: number;
};

export type OtpVerifyPayload = {
  phone: string;
  challengeId: string;
  otp: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type OtpVerifyResponse = AuthTokens & {
  customer: Customer;
  isNewUser: boolean;
};

export type RefreshTokenPayload = {
  refreshToken: string;
};

export type RefreshTokenResponse = AuthTokens;

export type ApiErrorBody = {
  message?: string;
  code?: string;
};
