// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { message, courseContext } = await request.json();
    
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set');
      return NextResponse.json(
        { response: "I'm here to help! What would you like to know about this course?" },
        { status: 200 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // ✅ Updated model name
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are a helpful teaching assistant for the online course: "${courseContext.title}"

Course Details:
- Instructor: ${courseContext.instructor}
- Category: ${courseContext.category}
- Description: ${courseContext.description}

Student Question: ${message}

Please provide a helpful, friendly response that:
1. Directly answers the student's question about this specific course
2. Is concise (under 100 words)
3. Is encouraging and supportive
4. If the question is about course content, explain what's covered
5. If about prerequisites, mention what students need to know

If you don't know the answer, suggest they check the course curriculum.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
    
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { response: "I'm here to help! What would you like to know about this course?" },
      { status: 200 }
    );
  }
}