import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createAdminSupabaseClient } from "@/lib/supabase";

export async function POST(request) {
  try {
    const { plan } = await request.json();

    const priceId =
      plan === "starter"
        ? process.env.STRIPE_STARTER_PRICE_ID
        : plan === "pro"
        ? process.env.STRIPE_PRO_PRICE_ID
        : null;

    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Get user from the cookie/session — use admin to look up
    // In a production app you'd extract the user from the auth cookie
    const adminSupabase = createAdminSupabaseClient();

    // For now we pass the user ID from the client; in production
    // this should be extracted from the session cookie
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?upgraded=true`,
      cancel_url: `${appUrl}/settings`,
      // client_reference_id will be set from the user's session in production
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
