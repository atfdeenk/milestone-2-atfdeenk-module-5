import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the requested page is an auth page (login/register)
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                    request.nextUrl.pathname.startsWith('/register');
  
  // Check if the requested page is a protected route
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/products') ||
                          request.nextUrl.pathname.startsWith('/cart') ||
                          request.nextUrl.pathname.startsWith('/receipt');

  // For client-side auth check, we'll let the pages handle the auth check
  return NextResponse.next();
}

// Configure which routes should be handled by the middleware
export const config = {
  matcher: [
    '/products/:path*',
    '/cart',
    '/receipt',
    '/login',
    '/register'
  ],
};
