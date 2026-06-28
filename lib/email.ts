// lib/email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,        // ඔයාගේ Gmail address
    pass: process.env.GMAIL_APP_PASSWORD // Gmail App Password
  }
});

export async function sendResetOTP(email: string, otp: string) {
  try {
    await transporter.sendMail({
      from: `"FinCoach AI" <${process.env.GMAIL_USER}>`,
      to: email,
      replyTo: process.env.GMAIL_USER,
      subject: "Your FinCoach OTP Code",
      // Plain-text fallback — HTML-only emails get penalized by spam filters
      text: `Your FinCoach OTP Code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.`,
      // Unique ref per send so Gmail doesn't bundle/flag repeated similar messages
      headers: {
        'X-Entity-Ref-ID': `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      },
      html: `
        <div style="background-color: #F4F4F9; padding: 40px 20px; font-family: 'Helvetica Neue', Arial, sans-serif;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(91, 79, 232, 0.15);">
            <tr>
              <td style="background-color: #5B4FE8; background-image: linear-gradient(135deg, #5B4FE8 0%, #7C6FF0 100%); padding: 32px 40px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">FinCoach AI</h1>
                <p style="margin: 4px 0 0; color: rgba(255,255,255,0.85); font-size: 13px;">Smart Financial Guidance</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 40px 24px; text-align: center;">
                <p style="margin: 0 0 8px; color: #1A1A2E; font-size: 16px;">Hi there 👋</p>
                <p style="margin: 0 0 24px; color: #666666; font-size: 14px; line-height: 1.6;">
                  Use the verification code below to reset your password. This code is valid for a limited time only.
                </p>
                <div style="background-color: #F0EEFF; border: 1px dashed #5B4FE8; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
                  <h1 style="margin: 0; font-size: 42px; color: #5B4FE8; letter-spacing: 8px; font-weight: 800;">${otp}</h1>
                </div>
                <p style="margin: 0; color: #1A1A2E; font-size: 14px;">
                  ⏳ Expires in <strong>10 minutes</strong>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 40px 32px;">
                <hr style="border: none; border-top: 1px solid #EEEEEE; margin: 0 0 16px;">
                <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.5; text-align: center;">
                  If you didn't request this code, you can safely ignore this email.<br>
                  Need help? Contact our support team anytime.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #FAFAFC; padding: 16px; text-align: center;">
                <p style="margin: 0; color: #B0B0B0; font-size: 11px;">© ${new Date().getFullYear()} FinCoach AI. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </div>
      `
    });

    console.log(`✅ OTP Email Sent to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Gmail OTP Send Failed:", error);
    return false;
  }
}

// Monthly Report (Future use)
export async function sendMonthlyReport(email: string, reportHtml: string) {
  try {
    await transporter.sendMail({
      from: `"FinCoach AI" <${process.env.GMAIL_USER}>`,
      to: email,
      replyTo: process.env.GMAIL_USER,
      subject: "Your Monthly Financial Report - FinCoach",
      headers: {
        'X-Entity-Ref-ID': `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      },
      html: reportHtml,
    });
    console.log(`✅ Monthly Report Sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Monthly Report Failed:", error);
    return false;
  }
}