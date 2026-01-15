import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { admin } from '@/firebase/admin'; // Make sure this path is correct

async function verifyToken(idToken: string) {
  try {
    await getAuth(admin.app()).verifyIdToken(idToken);
    return true;
  } catch (error) {
    console.error('Token validation error in middleware:', error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  // Pass through if it's for the Stripe webhook
  if (request.nextUrl.pathname.startsWith('/api/stripe/webhook')) {
    return NextResponse.next();
  }


  // For other API routes that are not webhooks or cron jobs, check for a valid Firebase token
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const authHeader = request.headers.get('authorization');
    const idToken = authHeader?.split('Bearer ')[1];

    if (!idToken) {
      return new NextResponse('Unauthorized: No token provided', { status: 401 });
    }

    const isValid = await verifyToken(idToken);
    if (!isValid) {
      return new NextResponse('Unauthorized: Invalid token', { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path((?!stripe/webhook).*)'],
};
