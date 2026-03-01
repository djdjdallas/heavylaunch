"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import ProductCard from "@/components/ProductCard";
import PlanBadge from "@/components/PlanBadge";
import { Plus, Package, Target, Settings, LogOut } from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [postCounts, setPostCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    async function loadData() {
      // Check auth
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push("/login");
        return;
      }
      setUser(authUser);

      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();
      setProfile(profileData);

      // Load products
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false });
      setProducts(productsData || []);

      // Get post counts per product
      if (productsData?.length) {
        const { data: posts } = await supabase
          .from("posts")
          .select("product_id")
          .eq("user_id", authUser.id);

        const counts = {};
        posts?.forEach((p) => {
          counts[p.product_id] = (counts[p.product_id] || 0) + 1;
        });
        setPostCounts(counts);
      }

      setLoading(false);
    }

    loadData();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  // Calculate usage for the current plan
  const postsUsed = profile?.posts_generated_this_month || 0;
  const plan = profile?.plan || "free";
  const limits = {
    free: { maxPosts: 5, maxProducts: 1 },
    starter: { maxPosts: 20, maxProducts: 3 },
    pro: { maxPosts: Infinity, maxProducts: Infinity },
  };
  const planLimit = limits[plan] || limits.free;
  const usagePercent =
    planLimit.maxPosts === Infinity
      ? 0
      : Math.round((postsUsed / planLimit.maxPosts) * 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <nav className="border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-lg">ThreadPilot</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage your products and Reddit content
            </p>
          </div>
          <Link href="/products/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Plan & Usage */}
        <Card className="mb-8">
          <CardContent className="py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <PlanBadge plan={plan} />
                <span className="text-sm text-muted-foreground">
                  {postsUsed}
                  {planLimit.maxPosts === Infinity
                    ? " posts generated this month"
                    : ` / ${planLimit.maxPosts} posts this month`}
                </span>
              </div>
              {planLimit.maxPosts !== Infinity && (
                <div className="w-48">
                  <Progress value={usagePercent} />
                </div>
              )}
              {plan !== "pro" && (
                <Link href="/settings">
                  <Button variant="outline" size="sm">
                    Upgrade Plan
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        <Separator className="mb-8" />

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h2 className="text-lg font-semibold mb-2">No products yet</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Add your first product to start generating Reddit content
            </p>
            <Link href="/products/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Product
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                postCount={postCounts[product.id] || 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
