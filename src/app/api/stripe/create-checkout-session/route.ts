
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { admin } from '@/firebase/admin';
import { getAuth } from 'firebase-admin/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL;

async function getUserIdFromRequest(request: Request): Promise<string | null> {
    const authHeader = headers().get('Authorization');
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

export async function POST(request: Request) {
  try {
    const { priceId, userEmail } = await request.json();
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return new NextResponse(JSON.stringify({ error: { message: 'User not authenticated.' } }), { status: 401 });
    }

    const userRef = admin.firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    let customerId = userDoc.data()?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          firebaseUID: userId,
        },
      });
      customerId = customer.id;
      await userRef.set({ stripeCustomerId: customerId }, { merge: true });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: customerId,
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: `${appUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/plans`,
      metadata: {
        firebaseUID: userId,
      }
    });

    return new NextResponse(JSON.stringify({ sessionId: session.id }), { status: 200 });

  } catch (error: any) {
    console.error('Stripe Checkout Session Error:', error);
    return new NextResponse(JSON.stringify({ error: { message: error.message } }), { status: 500 });
  }
}
