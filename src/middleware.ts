import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// ─── Route-Role Configuration ──────────────────────────────────────
// Maps route prefixes to allowed roles (most specific first).
const ROUTE_ROLES: Record<string, string[]> = {
  '/dashboard/analytics': ['admin'],
  '/dashboard/catalogue': ['admin', 'support', 'reseller', 'user'],
  '/dashboard/profiles': ['admin', 'support'],
  '/dashboard/purchases': ['admin', 'support', 'reseller', 'user'],
  '/dashboard/settings': ['admin'],
  '/dashboard/orders': ['admin', 'support', 'reseller', 'user'],
  '/dashboard/inventory': ['admin', 'support'],
  '/dashboard/ranking': ['admin', 'reseller'],
  '/dashboard/messages': ['admin', 'support', 'reseller', 'user'],
  '/dashboard/profile': ['admin', 'support', 'reseller', 'user'],
  '/dashboard': ['admin', 'support', 'reseller', 'user'],
  '/academy': ['admin', 'support', 'reseller', 'user'],
};

// Sorted by specificity (longest first)
const SORTED_ROUTES = Object.keys(ROUTE_ROLES).sort((a, b) => b.length - a.length);

function getRoleForRoute(pathname: string): string[] | null {
  for (const route of SORTED_ROUTES) {
    if (pathname.startsWith(route)) {
      return ROUTE_ROLES[route];
    }
  }
  return null;
}

// ─── Middleware ─────────────────────────────────────────────────────
export async function middleware(request: NextRequest) {
  // 1. Create a basic response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Setup Supabase Client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // 3. Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 4. Protected Routes: require authentication
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/academy');

  if (isProtectedRoute) {
    if (!user) {
      // Not authenticated → redirect to login with return URL
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(url);
    }

    // 5. Role-Based Access: check if user's role can access this route
    let role = (user.app_metadata?.role as string) || 'user';
    const allowedRoles = getRoleForRoute(pathname);

    // Hardcoded admin override for specific email (matches client-side logic)
    if (user.email === 'feitopepe510@gmail.com') {
      role = 'admin';
    }

    // Double-check role from DB if metadata is not admin but route requires privilege
    // This handles cases where metadata isn't synced yet
    if (role === 'user' && allowedRoles && !allowedRoles.includes('user')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role) {
        role = profile.role;
      }
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
      // Role not authorized for this route → redirect to dashboard with message
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      url.searchParams.set('unauthorized', 'true');
      return NextResponse.redirect(url);
    }
  }

  // 6. Auth Routes: redirect authenticated users away from login/register
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    if (user) {
      const url = request.nextUrl.clone();
      // Check if there's a redirect target from pre-auth
      const redirectTo = request.nextUrl.searchParams.get('redirectTo');
      url.pathname = redirectTo || '/dashboard';
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)',],
};
