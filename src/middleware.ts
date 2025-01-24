import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the requested page is an auth page (login/register)
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                    request.nextUrl.pathname.startsWith('/register');
  
  // Check if the requested page is a protected route (cart and receipt)
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/cart') ||
                          request.nextUrl.pathname.startsWith('/receipt');

  // Get token from cookies
  const token = request.cookies.get('token')?.value;

  // If user is accessing auth page but already has token, redirect to products
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/products', request.url));
  }

  // If user is accessing protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  // Add no-cache header to prevent caching of protected routes
  if (isProtectedRoute) {
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
    '/register'
  ],
};
