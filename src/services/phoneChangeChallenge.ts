/**
 * In-memory phone-change OTP challenge. Not persisted, not placed in route params.
 */

export type PhoneChangeChallenge = {
  newPhone: string;
  challengeId: string;
  expiresIn: number;
  otpLength?: number;
};

let currentChallenge: PhoneChangeChallenge | null = null;

export function setPhoneChangeChallenge(challenge: PhoneChangeChallenge): void {
  currentChallenge = {
    newPhone: challenge.newPhone,
    challengeId: challenge.challengeId,
    expiresIn: challenge.expiresIn > 0 ? challenge.expiresIn : 60,
    otpLength: challenge.otpLength,
  };
}

export function getPhoneChangeChallenge(): PhoneChangeChallenge | null {
  return currentChallenge;
}

export function clearPhoneChangeChallenge(): void {
  currentChallenge = null;
}
