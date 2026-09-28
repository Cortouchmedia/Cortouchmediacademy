import { NextResponse } from 'next/server';

export async function GET() {
  const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  return NextResponse.json({
    keyExists: !!key,
    keyPrefix: key ? key.substring(0, 10) : null,
    nodeEnv: process.env.NODE_ENV,
    message: !key
      ? 'No key found in environment'
      : 'Key loaded from environment',
  });
}