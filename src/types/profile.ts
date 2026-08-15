export type UpdateCustomerPayload = {
  name?: string;
  email?: string | null;
  profileImage?: string | null;
};

export type PhoneChangeRequestPayload = {
  newPhone: string;
};

export type PhoneChangeRequestResponse = {
  challengeId: string;
  expiresIn: number;
  otpLength?: number;
};

export type PhoneChangeVerifyPayload = {
  challengeId: string;
  otp: string;
};
