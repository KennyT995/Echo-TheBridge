import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { admin } from "@/firebase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const headerList = await headers();
  const signature = headerList.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: unknown) {
    console.error(
      `Webhook signature verification failed: ${(error as Error).message}`,
    );
    return new NextResponse(`Webhook Error: ${(error as Error).message}`, {
      status: 400,
    });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const subscription = event.data.object as Stripe.Subscription;

  // Try to get userId from metadata (session or subscription)
  let userId = session?.metadata?.firebaseUID || subscription?.metadata?.firebaseUID;

  // If no UID in metadata, try to get it from customer metadata
  if (!userId && (session.customer || subscription.customer)) {
    const customerId = (session.customer || subscription.customer) as string;
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
    userId = customer?.metadata?.firebaseUID;
  }

  if (!userId) {
    console.warn(
      `No firebaseUID found for event: ${event.id} (type: ${event.type})`,
    );
    return new NextResponse("Webhook error: Missing firebaseUID.", {
      status: 400,
    });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
          session.id,
          { expand: ["line_items"] },
        );
        const lineItem = sessionWithLineItems.line_items?.data[0];
        const priceId = lineItem?.price?.id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        await updateUserSubscription(
          userId,
          subscriptionId,
          customerId,
          priceId,
        );
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const priceId = subscription.items.data[0].price.id;
        const customerId = subscription.customer as string;
        await updateUserSubscription(
          userId,
          subscription.id,
          customerId,
          priceId,
          event.type === "customer.subscription.deleted",
        );
        break;
      }
      default:
        console.warn(`Unhandled webhook event type: ${event.type}`);
    }
  } catch (error) {
    console.error("Error handling webhook:", error);
    return new NextResponse("Webhook handler failed. See logs.", {
      status: 500,
    });
  }

  return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
}

async function updateUserSubscription(
  userId: string,
  subscriptionId: string,
  customerId: string,
  priceId?: string,
  isDeleted: boolean = false,
) {
  const userRef = admin.firestore().collection("users").doc(userId);
  const plans = await admin.firestore().collection("plan_tiers").get();

  let planId = "trailblazer"; // Default to free plan
  if (!isDeleted && priceId) {
    const matchedPlan = plans.docs.find(
      (doc) => doc.data().stripePriceId === priceId,
    );
    if (matchedPlan) {
      planId = matchedPlan.id;
    }
  }

  const subscriptionData = {
    stripeCustomerId: customerId,
    stripeSubscriptionId: isDeleted ? null : subscriptionId,
    stripePriceId: isDeleted ? null : priceId,
    planTierId: planId,
  };

  await userRef.set(subscriptionData, { merge: true });
}
