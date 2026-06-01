import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<boolean> {
  if (!process.env.SMTP_HOST) {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    EMAIL SIMULATION MODE                     ║
╠══════════════════════════════════════════════════════════════╣
║  TO: ${to.padEnd(46)}║
║  Reset Link: ${resetLink}  ║
╚══════════════════════════════════════════════════════════════╝`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"NeuroLearn AI" <${process.env.SMTP_FROM || "noreply@neurolearn.ai"}>`,
      to,
      subject: "Reset Your NeuroLearn Password",
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #00F5D4; margin-bottom: 16px;">Reset Your Password</h2>
          <p style="color: #64748B; line-height: 1.6;">Click the button below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background: #00F5D4; color: #050816; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0;">Reset Password</a>
          <p style="color: #94A3B8; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("[Mail] Failed to send email:", error);
    return false;
  }
}
