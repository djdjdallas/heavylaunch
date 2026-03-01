"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import PlanBadge from "@/components/PlanBadge";
import {
  Target,
  ArrowLeft,
  CreditCard,
  User,
  AlertTriangle,
  Loader2,
  Check,
} from "lucide-react";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "$29/mo",
    features: ["Up to 3 products", "20 posts per month"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$79/mo",
    features: ["Unlimited products", "Unlimited posts", "Priority generation"],
  },
];

export default function SettingsPage() {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    async function load() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push("/login");
        return;
      }
      setUser(authUser);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();
      setProfile(profileData);
      setLoading(false);
    }
    load();
  }, []);

  async function handleUpgrade(planId) {
    setUpgrading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (err) {
      toast({
        title: "Upgrade failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setUpgrading(false);
    }
  }

  async function handleManageBilling() {
    try {
      const res = await fetch("/api/billing-portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to open billing portal",
        variant: "destructive",
      });
    }
  }

  async function handleDeleteAccount() {
    if (
      !confirm(
        "Are you sure? This will permanently delete your account and all data. This cannot be undone."
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete account");
      await supabase.auth.signOut();
      router.push("/");
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Skeleton className="h-8 w-48 mb-8" />
          <Skeleton className="h-48 w-full mb-4" />
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

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-3 w-3" />
          Dashboard
        </Link>

        <h1 className="text-2xl font-bold mb-8">Settings</h1>

        {/* Account Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Account</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span>{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Plan</span>
                <PlanBadge plan={profile?.plan} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Posts This Month</span>
                <span>{profile?.posts_generated_this_month || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <CardTitle>Plan & Billing</CardTitle>
            </div>
            <CardDescription>
              Manage your subscription and billing details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-lg border p-4 ${
                    profile?.plan === plan.id ? "border-blue-200 bg-blue-50/50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{plan.name}</h3>
                    <span className="font-bold">{plan.price}</span>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-blue-600" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {profile?.plan === plan.id ? (
                    <Badge variant="secondary">Current Plan</Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={upgrading}
                    >
                      {upgrading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "Upgrade"
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {profile?.stripe_customer_id && (
              <Button variant="outline" onClick={handleManageBilling}>
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Billing in Stripe
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <CardTitle>Danger Zone</CardTitle>
            </div>
            <CardDescription>
              Irreversible actions that will permanently affect your account
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete Account
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
