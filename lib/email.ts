// lib/email.ts
import nodemailer from 'nodemailer';

function createTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error(
      'Missing email credentials: set GMAIL_USER and GMAIL_APP_PASSWORD in your .env file.'
    );
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    pool: true,
    maxConnections: 1,
    rateDelta: 20000,
    rateLimit: 5,
  });
}

function uniqueRef() {
  return `<${Date.now()}-${Math.random().toString(36).slice(2)}@fincoach.ai>`;
}

export async function sendResetOTP(email: string, otp: string): Promise<boolean> {
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: {
        name: 'FinCoach AI',
        address: process.env.GMAIL_USER!,
      },
      to: email,
      subject: `${otp} is your FinCoach verification code`,

      // Strong plain-text — very important for spam score
      text: `Your FinCoach verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, please ignore this email.\n\n-- FinCoach AI Team`,

      headers: {
        'Message-ID': uniqueRef(),
        'X-Mailer': 'FinCoach-Mailer-1.0',
        'X-Priority': '3',
        'Precedence': 'bulk',
        'List-Unsubscribe': `<mailto:${process.env.GMAIL_USER}?subject=unsubscribe>`,
      },

      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FinCoach Verification Code</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F4F9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background-color:#F4F4F9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
               style="max-width:480px;background-color:#ffffff;border-radius:16px;
                      overflow:hidden;box-shadow:0 4px 20px rgba(91,79,232,0.15);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#5B4FE8 0%,#7C6FF0 100%);
                        padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;
                          font-family:Helvetica Neue,Arial,sans-serif;">
                FinCoach AI
              </h1>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px;
                         font-family:Helvetica Neue,Arial,sans-serif;">
                Smart Financial Guidance
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 24px;text-align:center;">
              <p style="margin:0 0 8px;color:#1A1A2E;font-size:16px;
                         font-family:Helvetica Neue,Arial,sans-serif;">
                Hi there 👋
              </p>
              <p style="margin:0 0 24px;color:#666666;font-size:14px;line-height:1.6;
                         font-family:Helvetica Neue,Arial,sans-serif;">
                Use the verification code below to reset your password.
                This code is valid for <strong>10 minutes</strong> only.
              </p>

              <!-- OTP Box -->
              <div style="background-color:#F0EEFF;border:1px dashed #5B4FE8;
                           border-radius:12px;padding:20px;margin:0 0 24px;">
                <p style="margin:0;font-size:42px;color:#5B4FE8;letter-spacing:8px;
                           font-weight:800;font-family:Helvetica Neue,Arial,sans-serif;">
                  ${otp}
                </p>
              </div>

              <p style="margin:0;color:#1A1A2E;font-size:14px;
                         font-family:Helvetica Neue,Arial,sans-serif;">
                ⏳ Expires in <strong>10 minutes</strong>
              </p>
            </td>
          </tr>

          <!-- Divider + disclaimer -->
          <tr>
            <td style="padding:0 40px 32px;">
              <hr style="border:none;border-top:1px solid #EEEEEE;margin:0 0 16px;" />
              <p style="margin:0;color:#999999;font-size:12px;line-height:1.5;
                         text-align:center;font-family:Helvetica Neue,Arial,sans-serif;">
                If you did not request this code, you can safely ignore this email.<br />
                Need help? Contact our support team anytime.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#FAFAFC;padding:16px;text-align:center;">
              <p style="margin:0;color:#B0B0B0;font-size:11px;
                         font-family:Helvetica Neue,Arial,sans-serif;">
                © ${new Date().getFullYear()} FinCoach AI. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    console.log(`✅ OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ OTP email failed:', error);
    return false;
  }
}

export async function sendMonthlyReport(
  email: string,
  reportHtml: string
): Promise<boolean> {
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: {
        name: 'FinCoach AI',
        address: process.env.GMAIL_USER!,
      },
      to: email,
      subject: 'Your Monthly Financial Report – FinCoach AI',
      headers: {
        'Message-ID': uniqueRef(),
        'X-Mailer': 'FinCoach-Mailer-1.0',
        'X-Priority': '3',
        'List-Unsubscribe': `<mailto:${process.env.GMAIL_USER}?subject=unsubscribe>`,
      },
      text: 'Please view this email in an HTML-compatible email client to see your monthly financial report.',
      html: reportHtml,
    });

    console.log(`✅ Monthly report sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Monthly report failed:', error);
    return false;
  }
}