/**
 * In-memory OTP challenge. Not persisted, not placed in route params.
 */

export type OtpChallenge = {
  phone: string;
  challengeId: string;
  expiresIn: number;
};

let currentChallenge: OtpChallenge | null = null;

export function setOtpChallenge(challenge: OtpChallenge): void {
  currentChallenge = {
    phone: challenge.phone,
    challengeId: challenge.challengeId,
    expiresIn: challenge.expiresIn > 0 ? challenge.expiresIn : 60,
  };
}

export function getOtpChallenge(): OtpChallenge | null {
  return currentChallenge;
}

export function clearOtpChallenge(): void {
  currentChallenge = null;
}
