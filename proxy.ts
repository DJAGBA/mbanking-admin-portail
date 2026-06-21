import { NextRequest, NextResponse } from 'next/server';

type JwtPayload = {
  exp?: number;
};

const IS_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  if (!token.includes('.')) return !IS_MOCK;
  const payload = decodeJwtPayload(token);
  if (!payload) return !IS_MOCK;
  if (!payload.exp) return false;
  return payload.exp * 1000 < Date.now();
};

// the middleware function is now exported as a named function 
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  const publicPaths = ['/login', '/auth/login'];
  const isPublicPath = publicPaths.includes(pathname);

  if (!isPublicPath && (!token || isTokenExpired(token))) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }

  return NextResponse.next();
}

// the matcher configuration is now exported as a separate constant
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};