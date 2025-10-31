// backend/src/utils/emailToken.ts
import jwt, { type Secret, type SignOptions, type JwtPayload } from "jsonwebtoken";

const EMAIL_TOKEN_SECRET: Secret = (process.env.EMAIL_TOKEN_SECRET as string) || "change-me";

// Convert env to exact type jsonwebtoken expects
function getExpiresIn(defaultValue: string): SignOptions["expiresIn"] {
  const v = process.env.EMAIL_TOKEN_EXPIRE;
  if (!v) return defaultValue as unknown as SignOptions["expiresIn"];
  const n = Number(v);
  if (!Number.isNaN(n)) return n;
  return v as unknown as SignOptions["expiresIn"];
}

const VERIFY_EXPIRES = getExpiresIn("24h"); // for email verification
const RESET_EXPIRES = "30m" as SignOptions["expiresIn"]; // short-lived reset token

type BasePayload = JwtPayload & { uid: string; purpose: "email_verify" | "pwd_reset" };

export function makeEmailVerifyToken(userId: string) {
  const payload: BasePayload = { uid: userId, purpose: "email_verify" };
  const options: SignOptions = { expiresIn: VERIFY_EXPIRES };
  return jwt.sign(payload, EMAIL_TOKEN_SECRET, options);
}

export function verifyEmailVerifyToken(token: string) {
  return jwt.verify(token, EMAIL_TOKEN_SECRET) as BasePayload;
}

// NEW — password reset token
export function makePasswordResetToken(userId: string) {
  const payload: BasePayload = { uid: userId, purpose: "pwd_reset" };
  const options: SignOptions = { expiresIn: RESET_EXPIRES };
  return jwt.sign(payload, EMAIL_TOKEN_SECRET, options);
}

export function verifyPasswordResetToken(token: string) {
  return jwt.verify(token, EMAIL_TOKEN_SECRET) as BasePayload;
}
