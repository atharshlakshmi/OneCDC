import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { sendMail } from '../utils/mailer';
import { makePasswordResetToken, verifyPasswordResetToken } from '../utils/emailToken';
import { AppError } from '../middleware';
import logger from '../utils/logger';
import config from '../config';

/**
 * Password Validation
 */
interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Send Password Reset Email
 */
export const sendPasswordResetEmail = async (email: string): Promise<void> => {
  // Always normalize email to lowercase
  const normalizedEmail = email.toLowerCase();

  // Find user - only active users can reset password
  const user = await User.findOne({
    email: normalizedEmail,
    isActive: true,
  });

  // If user doesn't exist, still return success to prevent user enumeration
  if (!user) {
    logger.info(`Password reset requested for non-existent email: ${normalizedEmail}`);
    return;
  }

  // Generate password reset token (expires in 30 minutes)
  const token = makePasswordResetToken(user.id.toString());

  // Create reset URL
  const resetUrl = `${config.server.frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;

  // Send email
  await sendMail({
    to: user.email,
    subject: 'Reset your OneCDC password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>Hi ${user.name || 'there'},</p>
        <p>We received a request to reset your password. Click the link below to set a new password:</p>
        <p style="margin: 30px 0;">
          <a href="${resetUrl}"
             style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset My Password
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          This link will expire in 30 minutes for security reasons.
        </p>
        <p style="color: #666; font-size: 14px;">
          If you didn't request this password reset, you can safely ignore this email.
          Your password will remain unchanged.
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">
          OneCDC - Community Development Council Voucher Platform
        </p>
      </div>
    `,
  });

  logger.info(`Password reset email sent to: ${user.email}`);
};

/**
 * Reset Password with Token
 */
export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<void> => {
  // Validate new password
  const validation = validatePassword(newPassword);
  if (!validation.isValid) {
    throw new AppError(
      `Password validation failed: ${validation.errors.join(', ')}`,
      400
    );
  }

  // Verify token
  let payload;
  try {
    payload = verifyPasswordResetToken(token);
  } catch (error) {
    throw new AppError('Invalid or expired password reset token', 400);
  }

  // Verify token purpose
  if (payload.purpose !== 'pwd_reset') {
    throw new AppError('Invalid token purpose', 400);
  }

  // Find user
  const user = await User.findById(payload.uid);
  if (!user || !user.isActive) {
    throw new AppError('User not found or inactive', 404);
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 10);

  // Update password
  user.passwordHash = passwordHash;
  await user.save();

  logger.info(`Password successfully reset for user: ${user.email}`);

  // Optional: Send confirmation email
  await sendMail({
    to: user.email,
    subject: 'Your OneCDC password has been changed',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Changed Successfully</h2>
        <p>Hi ${user.name || 'there'},</p>
        <p>This is a confirmation that your password has been successfully changed.</p>
        <p style="color: #666; font-size: 14px;">
          If you didn't make this change, please contact us immediately.
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">
          OneCDC - Community Development Council Voucher Platform
        </p>
      </div>
    `,
  });
};
