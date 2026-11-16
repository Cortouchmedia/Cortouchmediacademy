import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Exchange the OAuth code for a Supabase session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      // 2. Tell YOUR backend that this user just logged in via OAuth
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/oauth-callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: data.session.access_token }),
        });

        if (res.ok) {
          const response = NextResponse.redirect(`${origin}${next}`);
          
          // Set the auth cookie
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