import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);
const isHomePage = createRouteMatcher(['/']);
const isApiRoute = createRouteMatcher(['/api/(.*)']);

const rateLimitStore: Map<string, { count: number; reset: number }> = new Map();

function getRateLimitKey(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
  return ip;
}

function checkRateLimit(key: string, limit: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.reset) {
    rateLimitStore.set(key, { count: 1, reset: now + windowMs });
    return true;
  }

  record.count++;
  return record.count <= limit;
}

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const requestStart = Date.now();
  const rateLimitKey = getRateLimitKey(req);
  const isApi = isApiRoute(req);

  try {
    if (isProtectedRoute(req)) {
      const { userId } = await auth();
      if (!userId) {
        const signInUrl = new URL('/sign-in', req.url);
        signInUrl.searchParams.set('redirect_url', req.url);
        return NextResponse.redirect(signInUrl);
      }
    }

    if (isHomePage(req)) {
      const { userId } = await auth();
      if (userId) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    const response = NextResponse.next();
    const responseTime = Date.now() - requestStart;

    if (isApi) {
      const { userId } = await auth();
      const tenantId = userId ? `user_${userId}` : 'anonymous';

      response.headers.set('X-Response-Time', `${responseTime}ms`);
      response.headers.set('X-Tenant-Id', tenantId);

      const record = rateLimitStore.get(rateLimitKey);
      const remaining = record ? Math.max(0, 100 - record.count) : 100;

      response.headers.set('X-RateLimit-Limit', '100');
      response.headers.set('X-RateLimit-Remaining', remaining.toString());

      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With'
      );
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    const response = NextResponse.next();

    if (isApi) {
      const responseTime = Date.now() - requestStart;
      response.headers.set('X-Response-Time', `${responseTime}ms`);
      response.headers.set('Access-Control-Allow-Origin', '*');
    }

    return response;
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
