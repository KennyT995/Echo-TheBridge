
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { admin } from '@/firebase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error(`Webhook signature verification failed: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session?.metadata?.firebaseUID;
  const subscription = event.data.object as Stripe.Subscription;

  if (!userId) {
    console.warn(`No firebaseUID found in webhook metadata for event: ${event.id}`);
    return new NextResponse('Webhook error: Missing firebaseUID in metadata.', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
            session.id,
            { expand: ['line_items'] }
        );
        const lineItem = sessionWithLineItems.line_items?.data[0];
        const priceId = lineItem?.price?.id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        
        await updateUserSubscription(userId, subscriptionId, customerId, priceId);
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const priceId = subscription.items.data[0].price.id;
        const customerId = subscription.customer as string;
        await updateUserSubscription(userId, subscription.id, customerId, priceId, event.type === 'customer.subscription.deleted');
        break;
      }
      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }
  } catch (error) {
    console.error('Error handling webhook:', error);
    return new NextResponse('Webhook handler failed. See logs.', { status: 500 });
  }

  return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
}

async function updateUserSubscription(userId: string, subscriptionId: string, customerId: string, priceId?: string, isDeleted: boolean = false) {
  const userRef = admin.firestore().collection('users').doc(userId);
  const plans = await admin.firestore().collection('plan_tiers').get();
  
  let planId = 'trailblazer'; // Default to free plan
  if (!isDeleted && priceId) {
    const matchedPlan = plans.docs.find(doc => doc.data().stripePriceId === priceId);
    if(matchedPlan) {
      planId = matchedPlan.id;
    }
  }

  const subscriptionData: any = {
    stripeCustomerId: customerId,
    stripeSubscriptionId: isDeleted ? null : subscriptionId,
    stripePriceId: isDeleted ? null : priceId,
    planTierId: planId
  };

  await userRef.set(subscriptionData, { merge: true });
}
