// src/mail/mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend;

  constructor() {
    // Initialize with your API key from .env
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendWelcomeEmail(to: string, name: string) {
    try {
      const { data, error } = await this.resend.emails.send({
        // Use your verified domain here, or onboarding@resend.dev for testing
        from: 'Cortouch Academy <onboarding@cortouchmedia.com.ng>',
        to: [to],
        subject: 'Welcome to Cortouch Media Academy!',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #219BD5;">Welcome, ${name}!</h1>
            <p>We're thrilled to have you join our community of digital creators.</p>
            <p>You can now start exploring courses and learning new skills.</p>
            <br />
            <p>Best regards,<br/>The Cortouch Team</p>
          </div>
        `,
      });

      if (error) {
        this.logger.error(`Resend error: ${error.message}`);
        throw new Error(error.message);
      }

      this.logger.log(`Welcome email sent successfully to ${to}. ID: ${data?.id}`);
      return data;
    } catch (err) {
      this.logger.error(`Failed to send welcome email to ${to}`, err);
    }
  }

  // 👈 New method for login notifications
  async sendLoginEmail(to: string, name: string) {
    try {
      const loginTime = new Date().toLocaleString('en-US', {
        timeZone: 'Africa/Lagos',
        dateStyle: 'full',
        timeStyle: 'short',
      });

      const { data, error } = await this.resend.emails.send({
        from: 'Cortouch Academy <onboarding@cortouchmedia.com.ng>',
        to: [to],
        subject: '🔐 New Login to Your Cortouch Account',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 32px 16px;">
            <div style="background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb;">
              
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #219BD5; font-size: 24px; margin: 0;">🔐 New Login Detected</h1>
              </div>

              <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi ${name},</p>

              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                We noticed a new login to your Cortouch Media Academy account.
              </p>

              <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 24px 0;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  <strong style="color: #111827;">Time:</strong> ${loginTime}
                </p>
              </div>

              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                <strong>If this was you</strong>, you can safely ignore this email.
              </p>

              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                <strong>If this wasn't you</strong>, please secure your account immediately by changing your password.
              </p>

              <div style="text-align: center; margin: 32px 0;">
                <a href="https://cortouch.tech/forgot-password" 
                   style="background: #219BD5; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                  Change Password
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                This is an automated security notification from Cortouch Media Academy.
              </p>
            </div>
          </div>
        `,
      });

      if (error) {
        this.logger.error(`Login email error: ${error.message}`);
        return { success: false, error: error.message };
      }

      this.logger.log(`Login notification sent to ${to}. ID: ${data?.id}`);
      return { success: true, id: data?.id };
    } catch (err: any) {
      this.logger.error(`Failed to send login email to ${to}`, err);
      return { success: false, error: err?.message ?? 'Unknown error' };
    }
  }
}