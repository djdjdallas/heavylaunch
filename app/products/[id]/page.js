"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import PostCard from "@/components/PostCard";
import { Target, ArrowLeft, Sparkles, ExternalLink } from "lucide-react";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createBrowserSupabaseClient();

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const [productRes, postsRes] = await Promise.all([
      supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("posts")
        .select("*")
        .eq("product_id", id)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    if (productRes.error || !productRes.data) {
      router.push("/dashboard");
      return;
    }

    setProduct(productRes.data);
    setPosts(postsRes.data || []);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // When a post status changes, update it locally
  function handleStatusChange(updatedPost) {
    setPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );
  }

  async function handleRegenerate(postId) {
    toast({
      title: "Regenerating...",
      description: "This will create a new post to replace the current one.",
    });
    // For single post regeneration, we call the generate endpoint with a single_post flag
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: id,
          regenerate_post_id: postId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Replace the old post with the new one
      if (data.posts?.length) {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? data.posts[0] : p))
        );
        toast({ title: "Post regenerated", description: "New post is ready for review." });
      }
    } catch (err) {
      toast({
        title: "Regeneration failed",
        description: err.message,
        variant: "destructive",
      });
    }
  }

  const filteredPosts =
    filter === "all" ? posts : posts.filter((p) => p.status === filter);

  const counts = {
    all: posts.length,
    pending: posts.filter((p) => p.status === "pending").length,
    published: posts.filter((p) => p.status === "published").length,
    skipped: posts.filter((p) => p.status === "skipped").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Skeleton className="h-8 w-64 mb-6" />
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-lg">ThreadPilot</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-3 w-3" />
          Dashboard
        </Link>

        {/* Product Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-blue-600 flex items-center gap-1 mt-1"
            >
              {product.url} <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <Link href={`/products/${id}/generate`}>
            <Button className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate More Posts
            </Button>
          </Link>
        </div>

        {/* Filter Tabs */}
        <Tabs defaultValue="all" onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
            <TabsTrigger value="published">Published ({counts.published})</TabsTrigger>
            <TabsTrigger value="skipped">Skipped ({counts.skipped})</TabsTrigger>
          </TabsList>

          <TabsContent value={filter}>
            {filteredPosts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">
                  {posts.length === 0
                    ? "No posts generated yet."
                    : `No ${filter} posts.`}
                </p>
                {posts.length === 0 && (
                  <Link href={`/products/${id}/generate`}>
                    <Button>Generate Posts</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onStatusChange={handleStatusChange}
                    onRegenerate={handleRegenerate}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
