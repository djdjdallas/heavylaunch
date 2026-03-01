import Stripe from "stripe";

// Lazy-initialize to avoid build-time errors when env vars aren't set
let _stripe;
export function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}


// Plan configuration — functions to avoid reading env vars at import time
export function getPlanConfig() {
  return {
    free: {
      name: "Free",
      maxProducts: 1,
      maxPostsPerMonth: 5,
      priceId: null,
      price: 0,
    },
    starter: {
      name: "Starter",
      maxProducts: 3,
      maxPostsPerMonth: 20,
      priceId: process.env.STRIPE_STARTER_PRICE_ID,
      price: 29,
    },
    pro: {
      name: "Pro",
      maxProducts: Infinity,
      maxPostsPerMonth: Infinity,
      priceId: process.env.STRIPE_PRO_PRICE_ID,
      price: 79,
    },
  };
}

export function getPlanLimits(plan) {
  const plans = getPlanConfig();
  return plans[plan] || plans.free;
}
