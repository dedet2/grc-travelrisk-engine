import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);
const isHomePage = createRouteMatcher(['/']);
const isApiRoute = createRouteMatcher(['/api/(.*)']);

// Admin users allowed to access the dashboard (add Clerk user IDs here)
// These are the ONLY users who can access /dashboard/* routes
const ADMIN_USER_IDS = new Set([
  // Dr. Dédé's Clerk user ID — will be populated on first sign-in
  // Add your Clerk userId here after signing in, e.g.:
  // 'user_2abc123def456',
]);

// Superadmin email addresses (fallback check if user ID list is empty)
const ADMIN_EMAILS = new Set([
  'dede@incluu.us',
  'contact@dr-dede.com',
]);

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
    // Dashboard routes — require authentication AND admin role
    if (isProtectedRoute(req)) {
      const { userId, sessionClaims } = await auth();

      if (!userId) {
        const signInUrl = new URL('/sign-in', req.url);
        signInUrl.searchParams.set('redirect_url', req.url);
        return NextResponse.redirect(signInUrl);
      }

      // RBAC: Check if user is an admin/superadmin
      const userEmail = (sessionClaims as any)?.email ||
                        (sessionClaims as any)?.primaryEmail ||
                        (sessionClaims as any)?.emailAddress || '';

      const isAdmin =
        ADMIN_USER_IDS.size === 0 || // If no IDs configured yet, allow all authenticated users (initial setup)
        ADMIN_USER_IDS.has(userId) ||
        ADMIN_EMAILS.has(userEmail);

      if (!isAdmin) {
        // Non-admin users get redirected to the public landing page
        return NextResponse.redirect(new URL('/?unauthorized=1', req.url));
      }
    }

    // Home page: redirect authenticated admins to dashboard
    if (isHomePage(req)) {
      const { userId, sessionClaims } = await auth();
      if (userId) {
        const userEmail = (sessionClaims as any)?.email ||
                          (sessionClaims as any)?.primaryEmail ||
                          (sessionClaims as any)?.emailAddress || '';
        const isAdmin =
          ADMIN_USER_IDS.size === 0 ||
          ADMIN_USER_IDS.has(userId) ||
          ADMIN_EMAILS.has(userEmail);

        if (isAdmin) {
          return NextResponse.redirect(new URL('/dashboard', req.url));
        }
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
