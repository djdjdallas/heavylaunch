import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!["pending", "published", "skipped"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be pending, published, or skipped." },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminSupabaseClient();

    // Get the post to verify ownership
    const { data: post, error: fetchError } = await adminSupabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Build update payload
    const updateData = { status };
    if (status === "published") {
      updateData.published_at = new Date().toISOString();
    } else {
      updateData.published_at = null;
    }

    const { data: updated, error: updateError } = await adminSupabase
      .from("posts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update post" },
        { status: 500 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Status update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
