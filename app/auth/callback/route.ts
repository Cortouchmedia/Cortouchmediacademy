import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'; // 👈 Use the new helper

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/student-dashboard'; // 👈 Default to student dashboard

  if (code) {
    const supabase = createClient();

    // Exchange the code for a session (PKCE cookie is read automatically)
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      try {
        // Sync with your NestJS backend
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/oauth-callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: data.session.access_token }),
        });

        if (res.ok) {
          const response = NextResponse.redirect(`${origin}${next}`);
          
          response.cookies.set('auth_token', data.session.access_token, {
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 week
          });
          
          return response;
        }
      } catch (err) {
        console.error("Backend OAuth sync failed", err);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could not authenticate with OAuth`);
}