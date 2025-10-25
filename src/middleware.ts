import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  let isAuthenticated = false;

  try {
    const userCookie = request.cookies.get('user');
    if (userCookie?.value) {
      const parsed = JSON.parse(decodeURIComponent(userCookie.value));
      isAuthenticated = !!parsed?.email;
    }
  } catch (error) {
    console.error('middleware: failed to parse user cookie', error);
    isAuthenticated = false;
  }
  
  if (!isAuthenticated && 
      (request.nextUrl.pathname.startsWith('/checkout'))) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  if (isAuthenticated && request.nextUrl.pathname === '/auth') {
    return NextResponse.redirect(new URL('/products', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
