import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.SMTP_USER, // Replace with your SMTP username
    pass: process.env.SMTP_PASS, // Replace with your SMTP password
  },
});

const sendEmail = async ({ to, subject, body }) => {
  if (!to) {
    throw new Error("❌ No recipient provided");
  }

  const response = await transporter.sendMail({
    from: process.env.SENDER_EMAIL,
    to,
    subject,
    html: body,
  });
  return response;
};


export default sendEmail;
