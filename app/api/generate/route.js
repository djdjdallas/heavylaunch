import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { getAnthropic } from "@/lib/anthropic";
import { getPlanLimits } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

const SYSTEM_PROMPT = `You are an expert Reddit marketer who has grown dozens of SaaS products organically on Reddit without ever getting banned. You write posts that lead with genuine value, never sound promotional, and naturally introduce products only when it feels completely organic and helpful.

Rules you never break:
- Never mention the product name or URL in the post title
- Always provide standalone value even if the product link is removed
- Match the writing style, tone, and culture of each specific subreddit
- No marketing language, buzzwords, or calls to action
- Write like a real founder or user sharing a genuine experience or insight
- Keep it conversational, not polished
- Vary post formats: some can be questions, some stories, some tips`;

function buildUserPrompt(product, count = 7) {
  return `Product name: ${product.name}
What it does: ${product.description}
Who it's for: ${product.target_audience}
Problem it solves: ${product.problem_solved}
URL (only include naturally if it fits): ${product.url}

Generate ${count} Reddit posts across ${count} different relevant subreddits.

For each post return a JSON object with:
- subreddit: subreddit name without r/
- title: post title (no product name, value-first)
- body: full post body, 200-350 words, genuine and conversational
- why_this_subreddit: one sentence explaining why this community fits
- best_time_to_post: best day and time window (e.g. Tuesday 9-11am EST)

Return a valid JSON array of ${count} objects and nothing else. No markdown fences, no explanation — just the JSON array.`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { product_id, regenerate_post_id } = body;

    if (!product_id) {
      return NextResponse.json(
        { error: "product_id is required" },
        { status: 400 }
      );
    }

    // Use admin client for this server-side operation
    const adminSupabase = createAdminSupabaseClient();

    // Get the auth token from the request to identify the user
    const authHeader = request.headers.get("authorization");
    const cookieHeader = request.headers.get("cookie");

    // Create a client to verify the user's identity from cookies
    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            cookie: cookieHeader || "",
          },
        },
      }
    );

    // Try to get user from the auth header or cookies
    let userId;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const { data: { user } } = await supabaseAuth.auth.getUser(token);
      userId = user?.id;
    }

    if (!userId) {
      // Fallback: look up the product to get user_id
      const { data: productCheck } = await adminSupabase
        .from("products")
        .select("user_id")
        .eq("id", product_id)
        .single();
      userId = productCheck?.user_id;
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch product details
    const { data: product, error: productError } = await adminSupabase
      .from("products")
      .select("*")
      .eq("id", product_id)
      .eq("user_id", userId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Fetch user profile to check plan limits
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    const planLimits = getPlanLimits(profile?.plan || "free");
    const postsUsed = profile?.posts_generated_this_month || 0;
    const postsToGenerate = regenerate_post_id ? 1 : 7;

    // Check monthly post limit
    if (
      planLimits.maxPostsPerMonth !== Infinity &&
      postsUsed + postsToGenerate > planLimits.maxPostsPerMonth
    ) {
      return NextResponse.json(
        {
          error: `Monthly post limit reached. You've used ${postsUsed}/${planLimits.maxPostsPerMonth} posts. Upgrade your plan for more.`,
        },
        { status: 403 }
      );
    }

    // Call Claude to generate posts
    const anthropic = getAnthropic();
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: buildUserPrompt(product, postsToGenerate) },
      ],
      temperature: 0.8,
    });

    const responseText = message.content[0]?.text;
    if (!responseText) {
      return NextResponse.json(
        { error: "AI failed to generate posts" },
        { status: 500 }
      );
    }

    // Parse the AI response — handle both array and wrapped object formats
    let generatedPosts;
    try {
      // Strip any markdown fences Claude might add
      const cleaned = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      generatedPosts = Array.isArray(parsed) ? parsed : parsed.posts || Object.values(parsed)[0];
      if (!Array.isArray(generatedPosts)) {
        throw new Error("Expected an array of posts");
      }
    } catch (parseErr) {
      console.error("Failed to parse AI response:", responseText);
      return NextResponse.json(
        { error: "Failed to parse AI-generated posts" },
        { status: 500 }
      );
    }

    // If regenerating a single post, delete the old one first
    if (regenerate_post_id) {
      await adminSupabase
        .from("posts")
        .delete()
        .eq("id", regenerate_post_id)
        .eq("user_id", userId);
    }

    // Save generated posts to the database
    const postsToInsert = generatedPosts.map((post) => ({
      product_id,
      user_id: userId,
      subreddit: post.subreddit,
      title: post.title,
      body: post.body,
      why_this_subreddit: post.why_this_subreddit,
      best_time_to_post: post.best_time_to_post,
      status: "pending",
    }));

    const { data: savedPosts, error: insertError } = await adminSupabase
      .from("posts")
      .insert(postsToInsert)
      .select();

    if (insertError) {
      console.error("Failed to save posts:", insertError);
      return NextResponse.json(
        { error: "Failed to save generated posts" },
        { status: 500 }
      );
    }

    // Increment the user's monthly post counter
    await adminSupabase
      .from("profiles")
      .update({
        posts_generated_this_month: postsUsed + generatedPosts.length,
      })
      .eq("id", userId);

    return NextResponse.json({ posts: savedPosts });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
