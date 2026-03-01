import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createAdminSupabaseClient } from "@/lib/supabase";

// Stripe sends raw body — we need to disable Next.js body parsing
export const runtime = "nodejs";

export async function POST(request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event;

  const stripe = getStripe();

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  const adminSupabase = createAdminSupabaseClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const customerId = session.customer;
      const subscriptionId = session.subscription;
      // The user's Supabase ID should be passed as client_reference_id during checkout
      const userId = session.client_reference_id;

      if (!userId) {
        console.error("No client_reference_id in checkout session");
        break;
      }

      // Determine plan based on the price
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0]?.price?.id;

      let plan = "free";
      if (priceId === process.env.STRIPE_STARTER_PRICE_ID) plan = "starter";
      if (priceId === process.env.STRIPE_PRO_PRICE_ID) plan = "pro";

      await adminSupabase
        .from("profiles")
        .update({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan,
          billing_period_start: new Date().toISOString(),
          posts_generated_this_month: 0, // Reset on new billing cycle
        })
        .eq("id", userId);

      console.log(`Updated user ${userId} to plan: ${plan}`);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      // Find profile by stripe_customer_id and downgrade
      const { data: profile } = await adminSupabase
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (profile) {
        await adminSupabase
          .from("profiles")
          .update({
            plan: "free",
            stripe_subscription_id: null,
          })
          .eq("id", profile.id);

        console.log(`Downgraded user ${profile.id} to free plan`);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const customerId = subscription.customer;
      const priceId = subscription.items.data[0]?.price?.id;

      let plan = "free";
      if (priceId === process.env.STRIPE_STARTER_PRICE_ID) plan = "starter";
      if (priceId === process.env.STRIPE_PRO_PRICE_ID) plan = "pro";

      const { data: profile } = await adminSupabase
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (profile) {
        await adminSupabase
          .from("profiles")
          .update({ plan })
          .eq("id", profile.id);

        console.log(`Updated user ${profile.id} plan to: ${plan}`);
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      console.log(
        `Payment failed for customer ${invoice.customer}. Invoice: ${invoice.id}`
      );
      // TODO: Send email notification to user
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
