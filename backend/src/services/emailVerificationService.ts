import { User } from '../models/User';
import { IUser } from '../types';
import { makeEmailVerifyToken, verifyEmailVerifyToken } from '../utils/emailToken';
import { sendMail } from '../utils/mailer';
import { AppError } from '../middleware';
import logger from '../utils/logger';
import config from '../config';

/**
 * Send Verification Email
 */
export const sendVerificationEmail = async (userId: string): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.emailVerified) {
    throw new AppError('Email already verified', 400);
  }

  // Generate email verification token (expires in 24 hours)
  const token = makeEmailVerifyToken(user.id.toString());

  // Create verification URL
  const verifyUrl = `${config.server.frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;

  // Send email
  await sendMail({
    to: user.email,
    subject: 'Verify your OneCDC account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to OneCDC!</h2>
        <p>Hi ${user.name || 'there'},</p>
        <p>Thank you for registering. Please verify your email address to activate your account:</p>
        <p style="margin: 30px 0;">
          <a href="${verifyUrl}"
             style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify My Email
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          This link will expire in 24 hours.
        </p>
        <p style="color: #666; font-size: 14px;">
          If you didn't create this account, you can safely ignore this email.
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">
          OneCDC - Community Development Council Voucher Platform
        </p>
      </div>
    `,
  });

  logger.info(`Verification email sent to: ${user.email}`);
};

/**
 * Resend Verification Email by Email Address
 */
export const resendVerificationEmail = async (email: string): Promise<void> => {
  const normalizedEmail = email.toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.emailVerified) {
    throw new AppError('Email already verified', 400);
  }

  await sendVerificationEmail(user.id.toString());
};

/**
 * Verify Email with Token
 */
export const verifyEmailWithToken = async (token: string): Promise<IUser> => {
  // Verify token
  let payload;
  try {
    payload = verifyEmailVerifyToken(token);
  } catch (error) {
    throw new AppError('Invalid or expired verification token', 400);
  }

  // Verify token purpose
  if (payload.purpose !== 'email_verify') {
    throw new AppError('Invalid token purpose', 400);
  }

  // Find user
  const user = await User.findById(payload.uid);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check if already verified
  if (user.emailVerified) {
    logger.info(`Email already verified for user: ${user.email}`);
    return user;
  }

  // Mark as verified
  user.emailVerified = true;
  user.emailVerifiedAt = new Date();
  await user.save();

  logger.info(`Email successfully verified for user: ${user.email}`);

  // Optional: Send welcome email
  try {
    await sendMail({
      to: user.email,
      subject: 'Welcome to OneCDC!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Verified Successfully!</h2>
          <p>Hi ${user.name},</p>
          <p>Your email has been verified. You can now enjoy all the features of OneCDC:</p>
          <ul style="color: #666;">
            <li>Search for shops accepting CDC vouchers</li>
            <li>Add shops to your cart and plan efficient routes</li>
            <li>Submit reviews for items and help the community</li>
            <li>Track your shopping and voucher usage</li>
          </ul>
          <p style="margin: 30px 0;">
            <a href="${config.server.frontendUrl}/login"
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Get Started
            </a>
          </p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            OneCDC - Community Development Council Voucher Platform
          </p>
        </div>
      `,
    });
  } catch (error) {
    logger.error('Failed to send welcome email:', error);
    // Continue anyway - verification is complete
  }

  return user;
};

/**
 * Check if Email is Verified
 */
export const isEmailVerified = async (userId: string): Promise<boolean> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user.emailVerified;
};
