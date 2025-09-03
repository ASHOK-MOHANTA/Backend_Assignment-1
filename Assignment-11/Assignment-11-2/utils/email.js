// utils/email.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // or configure SMTP host
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendResetEmail({ to, resetUrl }) {
  const mailOptions = {
    from: `"NoReply" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Password reset request",
    text:
      `You requested a password reset.\n\n` +
      `If you did not request this, ignore this email.\n\n` +
      `Reset link (valid for 15 minutes): ${resetUrl}\n\n` +
      `Regards`,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendResetEmail };
