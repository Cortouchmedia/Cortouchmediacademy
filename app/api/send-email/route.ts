import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { WelcomeEmail } from '@/components/emails/WelcomeEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, name, type } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 },
      );
    }

    let emailPayload;

    if (type === 'welcome') {
      emailPayload = {
        from: 'Cortouch Academy <onboarding@yourdomain.com>',
        to: [email],
        subject: 'Welcome to Cortouch Media Academy!',
        react: WelcomeEmail({ name }),
      };
    } else {
      return NextResponse.json(
        { error: 'Unknown email type' },
        { status: 400 },
      );
    }

    const { data, error } = await resend.emails.send(emailPayload);

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 },
    );
  }
}