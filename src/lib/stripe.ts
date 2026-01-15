"use client";

import { loadStripe, Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (publicKey) {
      stripePromise = loadStripe(publicKey);
    } else {
      console.warn("Stripe publishable key is not set. Stripe.js will not be loaded.");
      return Promise.resolve(null);
    }
  }
  return stripePromise;
};
