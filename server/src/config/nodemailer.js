import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT), // convert to number
  secure: process.env.SMTP_SECURE === "true", // convert to boolean
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // fixed typo
  },
});

export default transporter;