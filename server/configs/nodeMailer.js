import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'easyconsult11@gmail.com',
        pass: 'whxicabidvowidub'
    }
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
