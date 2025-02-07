import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the requested page is an auth page (login/register)
  const isAuthPage = request.nextUrl.pathname === '/login' || 
                    request.nextUrl.pathname === '/register' ||
                    request.nextUrl.pathname === '/admin/login';

  // Redirect /admin/login to /login
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Check if the requested page is a protected route (cart and receipt)
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/cart') ||
                          request.nextUrl.pathname.startsWith('/receipt');

  // Check if the requested page is an admin route
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

  // Get tokens from cookies
  const token = request.cookies.get('token')?.value;
  const adminToken = request.cookies.get('adminToken')?.value;

  // If user is accessing auth page but already has token, redirect to appropriate page
  if (isAuthPage) {
    if (adminToken) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } else if (token) {
      return NextResponse.redirect(new URL('/products', request.url));
    }
  }

  // If user is accessing admin route without admin token, redirect to login
  if (isAdminRoute && !adminToken) {
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  // If user is accessing protected route without token or admin token, redirect to login
  if (isProtectedRoute && !token && !adminToken) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  // Add no-cache header to prevent caching of protected routes
  if (isProtectedRoute || isAdminRoute) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  return NextResponse.next();
}

// Configure which routes should be handled by the middleware
export const config = {
  matcher: [
    '/cart',
    '/receipt',
    '/login',
    '/register',
    '/admin/:path*'
  ],
};
