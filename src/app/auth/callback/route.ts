import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Use robust origin detection for Hostinger/Proxies
  const host = request.headers.get('host') || new URL(request.url).host;
  const protocol = request.headers.get('x-forwarded-proto') || 'https';
  // Normalize the origin to handle IDNs and proxies correctly
  const origin = `${protocol}://${host}`.normalize('NFC');

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log(`[Auth Callback] Processing code for origin: ${origin}, next: ${next}`);

  if (code) {
    const cookieStore = cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[Auth Callback] Missing Supabase environment variables');
      return NextResponse.redirect(`${origin}/login?error=missing_env`)
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (err) {
              // This is expected if the headers are already sent in some environments
              console.warn('[Auth Callback] Could not set cookies in route handler:', err);
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      console.log('[Auth Callback] Exchange successful, redirecting...');
      return NextResponse.redirect(`${origin}${next}`)
    }

    console.error('[Auth Callback] Exchange error:', error.message);
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}
