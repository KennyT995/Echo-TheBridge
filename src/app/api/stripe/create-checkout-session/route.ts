
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { admin } from '@/firebase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL;

export async function POST(request: Request) {
  try {
    const { priceId, userId, userEmail } = await request.json();

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
