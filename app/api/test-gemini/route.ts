// app/api/test-gemini/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'GEMINI_API_KEY is not set',
        hasKey: false 
      }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // ✅ Updated model name
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent("Say 'API is working properly with gemini-1.5-flash!'");
    const response = await result.response;
    const text = response.text();
    
    return NextResponse.json({ 
      success: true, 
      message: text,
      hasKey: true,
      model: 'gemini-1.5-flash'
    });
    
  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to test API',
      hasKey: !!process.env.GEMINI_API_KEY
    }, { status: 500 });
  }
}