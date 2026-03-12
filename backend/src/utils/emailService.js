import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (email, code, fullName) => {
  const html = `
    <div style="font-family:Arial;padding:20px">
      <h2 style="color:#0F3D2E">Journal Account Verification</h2>
      <p>Dear ${fullName},</p>
      <p>Your verification code is:</p>
      <h1 style="letter-spacing:6px;color:#C9A227">${code}</h1>
      <p>This code expires in 10 minutes.</p>
      <hr/>
      <small>If you did not register, ignore this message.</small>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verify Your Email",
    html,
  });
};
