"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import GenerateButton from "@/components/GenerateButton";
import PostCard from "@/components/PostCard";
import { Target, ArrowLeft, ExternalLink, CheckCircle } from "lucide-react";

export default function GeneratePage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [generatedPosts, setGeneratedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    async function loadProduct() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        toast({
          title: "Product not found",
          description: "This product doesn't exist or you don't have access.",
          variant: "destructive",
        });
        router.push("/dashboard");
        return;
      }

      setProduct(data);
      setLoading(false);
    }

    loadProduct();
  }, [id]);

  function handleSuccess(posts) {
    setGeneratedPosts(posts);
    toast({
      title: "Posts generated!",
      description: `${posts.length} Reddit posts are ready for review.`,
    });
  }

  function handleError(message) {
    toast({
      title: "Generation failed",
      description: message,
      variant: "destructive",
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Skeleton className="h-8 w-64 mb-6" />
          <Skeleton className="h-48 w-full" />
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
          href={`/products/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to {product.name}
        </Link>

        {/* Product Summary */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{product.name}</CardTitle>
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                {product.url} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium text-muted-foreground">Target Audience</dt>
                <dd className="mt-1">{product.target_audience}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Problem Solved</dt>
                <dd className="mt-1">{product.problem_solved}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-muted-foreground">Description</dt>
                <dd className="mt-1">{product.description}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Generate Section */}
        {generatedPosts.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Ready to generate posts?</h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
              Our AI will analyze your product and create 7 authentic Reddit
              posts across the best-matching subreddits.
            </p>
            <GenerateButton
              productId={id}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h2 className="text-xl font-semibold">
                  {generatedPosts.length} Posts Generated
                </h2>
              </div>
              <Link href={`/products/${id}`}>
                <Button>View All Posts</Button>
              </Link>
            </div>

            <div className="space-y-4">
              {generatedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
