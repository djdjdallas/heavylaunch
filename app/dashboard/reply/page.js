"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import {
  Target,
  ArrowLeft,
  MessageSquareReply,
  Copy,
  Check,
  Sparkles,
  Loader2,
  BarChart3,
} from "lucide-react";

export default function ReplyModePage() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [threadUrl, setThreadUrl] = useState("");
  const [threadTitle, setThreadTitle] = useState("");
  const [threadContent, setThreadContent] = useState("");
  const [subreddit, setSubreddit] = useState("");
  const [generatedReply, setGeneratedReply] = useState(null);
  const [relevanceScore, setRelevanceScore] = useState(null);
  const [strategy, setStrategy] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [recentReplies, setRecentReplies] = useState([]);

  const router = useRouter();
  const { toast } = useToast();
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    async function loadData() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) {
        router.push("/login");
        return;
      }
      setUser(authUser);

      // Load products
      const { data: productsData } = await supabase
        .from("products")
        .select("id, name")
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false });

      setProducts(productsData || []);
      if (productsData?.length) {
        setSelectedProduct(productsData[0].id);
      }

      // Load recent replies
      const { data: repliesData } = await supabase
        .from("replies")
        .select("*, products(name)")
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentReplies(repliesData || []);
      setLoading(false);
    }
    loadData();
  }, []);

  async function handleGenerate() {
    if (!selectedProduct) {
      toast({
        title: "Select a product",
        description: "Choose which product you want to promote in this reply.",
        variant: "destructive",
      });
      return;
    }
    if (!threadContent.trim() || threadContent.trim().length < 10) {
      toast({
        title: "Paste the thread content",
        description:
          "Copy the Reddit thread's title and body text so the AI can craft a relevant reply.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    setGeneratedReply(null);

    try {
      const res = await fetch("/api/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: selectedProduct,
          thread_url: threadUrl || undefined,
          thread_title: threadTitle || undefined,
          thread_content: threadContent,
          subreddit: subreddit || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setGeneratedReply(data.reply.generated_reply);
      setRelevanceScore(data.relevance_score);
      setStrategy(data.strategy);

      // Add to recent replies
      setRecentReplies((prev) => [data.reply, ...prev].slice(0, 5));

      toast({
        title: "Reply generated",
        description: "Your reply is ready to copy and post.",
      });
    } catch (err) {
      toast({
        title: "Generation failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  }

  function handleCopy() {
    if (!generatedReply) return;
    navigator.clipboard.writeText(generatedReply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied to clipboard" });
  }

  // Try to extract subreddit from URL
  function handleUrlChange(url) {
    setThreadUrl(url);
    const match = url.match(
      /reddit\.com\/r\/([^/]+)/
    );
    if (match) {
      setSubreddit(match[1]);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Skeleton className="h-8 w-64 mb-6" />
          <Skeleton className="h-64 w-full" />
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

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
            <MessageSquareReply className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Reply Mode</h1>
            <p className="text-sm text-muted-foreground">
              Paste a Reddit thread and get a product-aware reply
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thread Details</CardTitle>
                <CardDescription>
                  Paste the Reddit thread you want to reply to
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Product Selector */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Product to promote
                  </label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  >
                    <option value="">Select a product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Thread URL (optional) */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Thread URL{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </label>
                  <Input
                    placeholder="https://reddit.com/r/SaaS/comments/..."
                    value={threadUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                  />
                </div>

                {/* Subreddit */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Subreddit{" "}
                    <span className="text-muted-foreground font-normal">
                      (auto-detected from URL)
                    </span>
                  </label>
                  <Input
                    placeholder="e.g. SaaS"
                    value={subreddit}
                    onChange={(e) => setSubreddit(e.target.value)}
                  />
                </div>

                {/* Thread Title */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Thread title
                  </label>
                  <Input
                    placeholder="What's the best tool for..."
                    value={threadTitle}
                    onChange={(e) => setThreadTitle(e.target.value)}
                  />
                </div>

                {/* Thread Content */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Thread content{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="Paste the full thread text here... Copy the post body from Reddit so the AI can understand the context and craft a relevant reply."
                    value={threadContent}
                    onChange={(e) => setThreadContent(e.target.value)}
                    rows={8}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    The more context you paste, the better the reply
                  </p>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={generating || !selectedProduct}
                  className="w-full gap-2"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Crafting your reply...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Reply
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Output & History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Generated Reply */}
            {generatedReply && (
              <Card className="border-green-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Your Reply</CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopy}
                      className="gap-1"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" /> Copy
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm whitespace-pre-wrap leading-relaxed bg-muted/50 rounded-md p-4">
                    {generatedReply}
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {relevanceScore && (
                      <Badge
                        variant="outline"
                        className={
                          relevanceScore >= 7
                            ? "border-green-200 text-green-700"
                            : relevanceScore >= 4
                              ? "border-amber-200 text-amber-700"
                              : "border-red-200 text-red-700"
                        }
                      >
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Relevance: {relevanceScore}/10
                      </Badge>
                    )}
                  </div>

                  {strategy && (
                    <p className="text-xs text-muted-foreground italic">
                      Strategy: {strategy}
                    </p>
                  )}

                  {relevanceScore && relevanceScore < 4 && (
                    <p className="text-xs text-amber-600 bg-amber-50 rounded p-2">
                      Low relevance — your product may not be a natural fit for
                      this thread. Consider posting the reply without the product
                      mention to build karma instead.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recent Replies */}
            {recentReplies.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">
                    Recent Replies
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentReplies.map((reply) => (
                    <div
                      key={reply.id}
                      className="text-xs border rounded-md p-3 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        {reply.subreddit && (
                          <Badge
                            variant="outline"
                            className="text-xs font-mono"
                          >
                            r/{reply.subreddit}
                          </Badge>
                        )}
                        <span className="text-muted-foreground">
                          {new Date(reply.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {reply.thread_title && (
                        <p className="font-medium text-xs truncate">
                          {reply.thread_title}
                        </p>
                      )}
                      <p className="text-muted-foreground line-clamp-2">
                        {reply.generated_reply}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Empty state when no reply generated yet */}
            {!generatedReply && recentReplies.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <MessageSquareReply className="h-8 w-8 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Your generated reply will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
