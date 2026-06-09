import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import { validateAdminSession } from '../../utils/auth';

export const POST: APIRoute = async ({ cookies, request }) => {
  try {
    // 1. Authenticate Request
    const { isLoggedIn, adminInfo } = await validateAdminSession(cookies);
    if (!isLoggedIn || !adminInfo) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized: Admin session required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Parse Request Body
    const { to, subject, message } = await request.json();

    if (!to || !subject || !message) {
      return new Response(
        JSON.stringify({ success: false, error: 'Recipient email, subject, and message are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Retrieve SMTP config from environment variables
    const host = import.meta.env.SMTP_HOST || process.env.SMTP_HOST;
    const port = parseInt(import.meta.env.SMTP_PORT || process.env.SMTP_PORT || '587', 10);
    const user = import.meta.env.SMTP_USER || process.env.SMTP_USER;
    const pass = import.meta.env.SMTP_PASS || process.env.SMTP_PASS;
    const from = import.meta.env.SMTP_FROM || process.env.SMTP_FROM || user;

    if (!host || !user || !pass) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'SMTP server configuration is incomplete. Please configure .env with SMTP_HOST, SMTP_USER, and SMTP_PASS.'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Create Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports (like 587)
      auth: {
        user,
        pass
      }
    });

    // 5. Send Mail
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: message,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; borderRadius: 8px;">
          <h2 style="color: #18181b; font-size: 18px; margin-bottom: 16px; border-bottom: 1px solid #e4e4e7; padding-bottom: 8px;">Academic Notification</h2>
          <div style="color: #3f3f46; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</div>
          <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
          <p style="color: #71717a; font-size: 11px; margin: 0;">This email was sent by the TRACIA AI Administrator (${adminInfo.name})</p>
        </div>
      `
    });

    return new Response(
      JSON.stringify({ success: true, messageId: info.messageId }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Email sending error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'An unexpected error occurred while sending email' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
