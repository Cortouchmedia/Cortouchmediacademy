import * as React from 'react';
import {
  Html,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Button,
  Hr,
} from '@react-email/components';

interface WelcomeEmailProps {
  name: string;
}

export const WelcomeEmail = ({ name }: WelcomeEmailProps) => {
  return (
    <Html>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>Welcome to Cortouch Media Academy!</Heading>
          </Section>

          {/* Body */}
          <Section style={body}>
            <Text style={text}>Hi {name},</Text>
            <Text style={text}>
              We're thrilled to have you join our community of digital creators.
              You can now start exploring courses and learning new skills from
              industry experts.
            </Text>

            <Button style={button} href="https://cortouchmediacademy.vercel.app/catalog">
              Browse Courses
            </Button>

            <Text style={text}>
              If you have any questions, just reply to this email. We're always
              happy to help.
            </Text>

            <Hr style={hr} />

            <Text style={footer}>
              Best regards,<br />
              The Cortouch Media Academy Team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// 👈 Styles (Tailwind classes don't work in emails, so we use inline styles)
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
  maxWidth: '600px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
};

const header = {
  backgroundColor: '#219BD5',
  padding: '24px',
  textAlign: 'center' as const,
  borderRadius: '8px 8px 0 0',
};

const h1 = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
};

const body = {
  padding: '0 32px',
};

const text = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '26px',
};

const button = {
  backgroundColor: '#219BD5',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px 0',
  margin: '24px 0',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
};