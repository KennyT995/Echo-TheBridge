
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { admin } from '@/firebase/admin';
import { getAuth } from 'firebase-admin/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL;

async function getUserIdFromRequest(): Promise<string | null> {
    const headerList = await headers();
    const authHeader = headerList.get('Authorization');
    if (authHeader) {
        const idToken = authHeader.split('Bearer ')[1];
        if (idToken) {
            try {
                const decodedToken = await getAuth(admin.app()).verifyIdToken(idToken);
                return decodedToken.uid;
            } catch (error) {
                console.error("Error verifying ID token:", error);
                return null;
            }
        }
    }
    return null;
}

export async function POST() {
    try {
        const userId = await getUserIdFromRequest();

        if (!userId) {
            return new NextResponse(JSON.stringify({ error: { message: 'Unauthorized' } }), { status: 401 });
        }

        const userDoc = await admin.firestore().collection('users').doc(userId).get();
        const customerId = userDoc.data()?.stripeCustomerId;

        if (!customerId) {
            return new NextResponse(JSON.stringify({ error: { message: 'Stripe customer not found for this user.' } }), { status: 404 });
        }

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${appUrl}/plans`,
        });

        return new NextResponse(JSON.stringify({ url: portalSession.url }), { status: 200 });

    } catch (error: unknown) {
        console.error('Stripe Portal Session Error:', error);
        return new NextResponse(JSON.stringify({ error: { message: (error as Error).message } }), { status: 500 });
    }
}
