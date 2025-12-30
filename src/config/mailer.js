// Import nodemailer to handle email sending
const nodemailer = require('nodemailer');

// Function to configure and create the email transport service
function createTransport() {
  // Destructure SMTP configuration from environment variables
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;

  // Validate that essential credentials (User and Password) are present
  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP_USER/SMTP_PASS not set (use Gmail App Password)');
  }

  // Create the transporter object using the SMTP settings
  const transporter = nodemailer.createTransport({
    // Default to Gmail's SMTP host if not provided
    host: SMTP_HOST || 'smtp.gmail.com',
    // Default to port 465 (SSL) if not provided
    port: Number(SMTP_PORT || 465),
    // Determine if connection should be secure (SSL/TLS). 
    // Compares string value to 'true', defaults to true for port 465.
    secure: String(SMTP_SECURE || 'true') === 'true', // true for 465
    // Authentication credentials
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  // Return the configured transporter instance
  return transporter;
}

// Initialize the mailer instance immediately
const mailer = createTransport();

// Export the mailer instance to be used in services (e.g., OTP service)
module.exports = { mailer };
