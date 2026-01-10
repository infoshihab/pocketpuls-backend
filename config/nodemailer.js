import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "pocketpulse0@gmail.com",
    pass: process.env.APP_PASSWORD,
  },
});

export default transporter;
