// Import Redis client for OTP storage and Mailer for sending emails
const { redis } = require('../config/redis');
const { mailer } = require('../config/mailer');

// Define constants for OTP expiration and verification grace period
const OTP_TTL_SECONDS = 120;     // 2 minutes for the OTP code itself
const OTP_VERIFIED_TTL = 300;    // 5 minutes allowed to complete payment after verification

// Helper to generate the Redis key for storing the raw OTP code
function otpKey(userId, orderId) {
  return `otp:${userId}:${orderId}`;
}

// Helper to generate the Redis key for the "verified" flag
function otpVerifiedKey(userId, orderId) {
  return `otp_verified:${userId}:${orderId}`;
}

// Generate a random 6-digit numeric string
function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
}

// Helper function to send the OTP via email using Nodemailer
async function sendOtpEmail(toEmail, code) {
  const info = await mailer.sendMail({
    from: `"OrderPay API" <${process.env.SMTP_USER}>`, // Sender address
    to: toEmail, // Recipient
    subject: 'Your Order Payment OTP Code', // Subject line
    text: `Your OTP is: ${code}. It expires in 2 minutes.`, // Plain text body
    html: `<p>Your OTP is: <b>${code}</b>. It expires in <b>2 minutes</b>.</p>`, // HTML body
  });
  return info.messageId; // Return message ID for logging/tracking
}

// Main function to request an OTP: generates, stores, and emails it
async function requestOtp(userId, orderId, email) {
  const code = generateOTP();
  // Store OTP in Redis with a 2-minute expiration
  await redis.set(otpKey(userId, orderId), code, { EX: OTP_TTL_SECONDS });
  // Send the generated code to the user's email
  await sendOtpEmail(email, code);
  return code; // Returns code (useful for testing/logging, but usually not sent to client in prod)
}

// Function to verify the OTP provided by the user
async function verifyOtp(userId, orderId, providedCode) {
  // Retrieve the stored OTP from Redis
  const stored = await redis.get(otpKey(userId, orderId));
  
  // Check if OTP exists (it might have expired)
  if (!stored) return { ok: false, reason: 'OTP expired or not found' };
  
  // Check if the provided code matches the stored one
  if (stored !== providedCode) return { ok: false, reason: 'Invalid OTP' };

  // If valid:
  // 1. Delete the OTP so it cannot be reused
  await redis.del(otpKey(userId, orderId));
  // 2. Set a temporary "verified" flag in Redis to allow the subsequent payment request
  await redis.set(otpVerifiedKey(userId, orderId), 'true', { EX: OTP_VERIFIED_TTL });

  return { ok: true };
}

// Check if a specific order/user pair has successfully verified their OTP recently
async function isOtpVerified(userId, orderId) {
  const val = await redis.get(otpVerifiedKey(userId, orderId));
  return Boolean(val); // Returns true if the flag exists
}

// Cleanup function to remove the verified flag (e.g., after successful payment)
async function clearVerifiedFlag(userId, orderId) {
  await redis.del(otpVerifiedKey(userId, orderId));
}

// Export service functions
module.exports = {
  requestOtp,
  verifyOtp,
  isOtpVerified,
  clearVerifiedFlag,
};
