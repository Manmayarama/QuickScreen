import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for port 465
  auth: {
    user: process.env.SENDER_EMAIL, // Gmail account
    pass: process.env.SENDER_PASS,             // App password (not your real password)
  },
});

/**
 * Send an email using Gmail SMTP
 * @param {Object} param0
 * @param {string} param0.to - Recipient email
 * @param {string} param0.subject - Email subject
 * @param {string} param0.body - Email HTML body
 */
const sendEmail = async ({ to, subject, body }) => {
  if (!to) {
    throw new Error("❌ No recipient provided");
  }

  const response = await transporter.sendMail({
    from: '"Movie Tickets" <activeliveprojects@gmail.com>', // must be your authenticated Gmail
    to,
    subject,
    html: body,
  });

  console.log("📧 Gmail SMTP response:", response);
  return response;
};

export default sendEmail;
