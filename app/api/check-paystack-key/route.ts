// app/api/check-paystack-key/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  
  console.log('Server-side key check:');
  console.log('- Key exists:', !!key);
  console.log('- Key prefix:', key?.substring(0, 10));
  console.log('- Node env:', process.env.NODE_ENV);
  
  return NextResponse.json({
    keyExists: !!key,
    keyPrefix: key ? key.substring(0, 10) : null,
    isOldKey: key === 'pk_live_0a18ecbda9801af17e6c38bc759e33225286a4e5',
    nodeEnv: process.env.NODE_ENV,
    message: !key ? 'No key found in environment' : 
             key === 'pk_live_0a18ecbda9801af17e6c38bc759e33225286a4e5' ? 'Using revoked key' : 
             'Key found and appears valid'
  });
}