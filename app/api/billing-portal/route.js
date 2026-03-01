import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createAdminSupabaseClient } from "@/lib/supabase";

export async function POST(request) {
  try {
    const adminSupabase = createAdminSupabaseClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // In production, extract user ID from auth session cookie
    // For now, we need the stripe_customer_id from the request or session
    // This is a simplified version — in production you'd get the user from middleware

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      // customer: profile.stripe_customer_id, // Set this from auth session
      return_url: `${appUrl}/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Billing portal error:", error);
    return NextResponse.json(
      { error: "Failed to create billing portal session" },
      { status: 500 }
    );
  }
}
