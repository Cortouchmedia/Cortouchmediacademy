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
      // Don't throw here if you don't want email failure to block signup
      // throw err; 
    }
  }
}