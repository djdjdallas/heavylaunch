import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { getAnthropic } from "@/lib/anthropic";
import { getPlanLimits } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

const REPLY_SYSTEM_PROMPT = `You are an expert Reddit commenter who helps founders organically mention their products in relevant conversations. You write replies that:

Rules you never break:
- Lead with genuine, helpful value that directly addresses the thread's question or topic
- Only mention the product if it's genuinely relevant to the conversation
- Never sound like an ad, shill, or marketer
- Match the tone and culture of the subreddit
- Keep it conversational — write like a real person sharing a helpful tool they use
- If the product isn't a natural fit for the thread, say so honestly and still provide a helpful reply
- Never use marketing buzzwords or CTAs
- Keep replies concise (100-200 words) — long replies look suspicious on Reddit
- Reference specific details from the thread to show you actually read it`;

function buildReplyPrompt(product, threadContent, threadTitle, subreddit) {
  return `You're replying to a Reddit thread.

${subreddit ? `Subreddit: r/${subreddit}` : ""}
${threadTitle ? `Thread title: ${threadTitle}` : ""}
Thread content:
${threadContent}

Your product (only mention if genuinely relevant):
- Name: ${product.name}
- What it does: ${product.description}
- Who it's for: ${product.target_audience}
- Problem it solves: ${product.problem_solved}
- URL: ${product.url}

Write a helpful Reddit reply. Return a JSON object with:
- reply: the full reply text (100-200 words, helpful first, product mention only if natural)
- relevance_score: 1-10 how relevant your product is to this thread
- strategy: one sentence explaining your approach (e.g. "Answered the question directly, then mentioned the product as one option among several")

Return valid JSON only. No markdown fences, no explanation — just the JSON object.`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { product_id, thread_url, thread_content, thread_title, subreddit } = body;

    if (!product_id) {
      return NextResponse.json(
        { error: "product_id is required" },
        { status: 400 }
      );
    }

    if (!thread_content || thread_content.trim().length < 10) {
      return NextResponse.json(
        { error: "Thread content is required (paste the thread text or provide a URL)" },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminSupabaseClient();

    // Authenticate user
    const cookieHeader = request.headers.get("cookie");
    const authHeader = request.headers.get("authorization");

    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: { cookie: cookieHeader || "" },
        },
      }
    );

    let userId;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const { data: { user } } = await supabaseAuth.auth.getUser(token);
      userId = user?.id;
    }

    if (!userId) {
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

    // Fetch product
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

    // Check plan limits (replies count toward post limit)
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    const planLimits = getPlanLimits(profile?.plan || "free");
    const postsUsed = profile?.posts_generated_this_month || 0;

    if (
      planLimits.maxPostsPerMonth !== Infinity &&
      postsUsed + 1 > planLimits.maxPostsPerMonth
    ) {
      return NextResponse.json(
        {
          error: `Monthly limit reached. You've used ${postsUsed}/${planLimits.maxPostsPerMonth} generations. Upgrade for more.`,
        },
        { status: 403 }
      );
    }

    // Generate reply via Claude
    const anthropic = getAnthropic();
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: REPLY_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildReplyPrompt(product, thread_content, thread_title, subreddit),
        },
      ],
      temperature: 0.7,
    });

    const responseText = message.content[0]?.text;
    if (!responseText) {
      return NextResponse.json(
        { error: "AI failed to generate reply" },
        { status: 500 }
      );
    }

    let parsed;
    try {
      const cleaned = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    // Save reply to database
    const { data: savedReply, error: insertError } = await adminSupabase
      .from("replies")
      .insert({
        product_id,
        user_id: userId,
        thread_url: thread_url || null,
        thread_title: thread_title || null,
        thread_content: thread_content.slice(0, 5000),
        subreddit: subreddit || null,
        generated_reply: parsed.reply,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to save reply:", insertError);
      return NextResponse.json(
        { error: "Failed to save generated reply" },
        { status: 500 }
      );
    }

    // Increment usage counter
    await adminSupabase
      .from("profiles")
      .update({
        posts_generated_this_month: postsUsed + 1,
      })
      .eq("id", userId);

    return NextResponse.json({
      reply: savedReply,
      relevance_score: parsed.relevance_score,
      strategy: parsed.strategy,
    });
  } catch (error) {
    console.error("Reply generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
