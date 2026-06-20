import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Add x-pathname header to the request so Server Components can read it
  request.headers.set('x-pathname', request.nextUrl.pathname);

  const { supabaseResponse, user, supabase } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Protected routes require the user to be logged in
  if (!user) {
    if (
      pathname.startsWith('/account') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/vendor') ||
      pathname.startsWith('/checkout') ||
      pathname.startsWith('/auth/vendor-apply')
    ) {
      const redirectUrl = new URL('/auth', request.url);
      const redirectResponse = NextResponse.redirect(redirectUrl);
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value);
      });
      return redirectResponse;
    }
  }

  // If user is logged in, we might want to check their role for admin/vendor routes
  if (user && (pathname.startsWith('/admin') || pathname.startsWith('/vendor'))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (pathname.startsWith('/admin') && profile?.role !== 'admin') {
      const redirectUrl = new URL('/account', request.url);
      const redirectResponse = NextResponse.redirect(redirectUrl);
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value);
      });
      return redirectResponse;
    }

    // Optional: if vendor routes strictly require role = 'vendor' or 'admin'
    // For now, if someone applies to be a vendor, their role might be 'vendor'
    if (pathname.startsWith('/vendor') && profile?.role !== 'vendor' && profile?.role !== 'admin') {
      const redirectUrl = new URL('/auth/vendor-apply', request.url);
      const redirectResponse = NextResponse.redirect(redirectUrl);
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value);
      });
      return redirectResponse;
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
