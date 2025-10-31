import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
});

export async function sendMail(opts: { to: string; subject: string; html: string }) {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || "OneCDC <no-reply@onecdc.local>",
    ...opts,
  });
  // For Ethereal testing, you’ll get a preview url:
  // console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
  return info;
}
