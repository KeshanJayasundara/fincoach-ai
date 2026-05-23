import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendResetOTP(email: string, otp: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: "FinCoach AI <onboarding@resend.dev>",
      to: [email],
      subject: "Your FinCoach Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 30px; background: #f8f7ff; max-width: 500px; margin: 0 auto; border-radius: 12px;">
          <h2 style="color: #1A1635;">Your OTP Code</h2>
          <p style="font-size: 16px;">Here is your password reset code:</p>
          <h1 style="color: #5B4FE8; font-size: 48px; letter-spacing: 12px; font-weight: bold;">${otp}</h1>
          <p style="color: #8B87A8; margin-top: 20px;">This code expires in <strong>10 minutes</strong>.</p>
          <p style="color: #8B87A8; font-size: 14px;">If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return false;
    }

    console.log(`OTP Email Sent to ${email}`);
    return true;
  } catch (err) {
    console.error("Email sending failed:", err);
    return false;
  }
}