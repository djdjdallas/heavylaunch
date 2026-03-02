import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  Search,
  FileText,
  ArrowRight,
  Check,
  Target,
  MessageSquareReply,
  Zap,
  Eye,
  PenLine,
  X,
} from "lucide-react";

export const metadata = {
  title: "ThreadPilot — Stop Researching, Start Posting",
  description:
    "You already know where your customers hang out. ThreadPilot writes the Reddit posts and replies that actually grow your product — no spam, no bans.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-lg">ThreadPilot</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Start Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-6">
            The posting tool Reddit marketers are missing
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
            Stop Researching.{" "}
            <span className="text-blue-600">Start Posting.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            You already know which subreddits matter. ThreadPilot writes the
            posts and replies that actually grow your product — native-feeling
            content that Redditors appreciate, not flag.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Start Growing Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline">
                See How It Works
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required. 5 free posts to start.
          </p>
        </div>
      </section>

      <Separator />

      {/* The Gap — Positioning Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">
              Already Know Your Subreddits?
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Most Reddit tools stop at research. ThreadPilot picks up where
              they leave off.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-background">
              <CardContent className="pt-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                  <Eye className="h-5 w-5 text-zinc-500" />
                </div>
                <p className="font-semibold text-sm mb-1 text-muted-foreground">
                  Research tools
                </p>
                <p className="text-sm text-muted-foreground">
                  &ldquo;Here are the subreddits where your audience hangs
                  out&rdquo;
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background">
              <CardContent className="pt-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                  <Search className="h-5 w-5 text-zinc-500" />
                </div>
                <p className="font-semibold text-sm mb-1 text-muted-foreground">
                  Monitoring tools
                </p>
                <p className="text-sm text-muted-foreground">
                  &ldquo;Here&apos;s a conversation you should jump
                  into&rdquo;
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border-blue-200 shadow-md">
              <CardContent className="pt-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <PenLine className="h-5 w-5 text-blue-600" />
                </div>
                <p className="font-semibold text-sm mb-1 text-blue-600">
                  ThreadPilot
                </p>
                <p className="text-sm text-muted-foreground">
                  &ldquo;Here are 7 ready-to-post pieces of content that will
                  actually grow your product&rdquo;
                </p>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Use GummySearch to find subreddits. Use ReplyAgent to find
            conversations. Use ThreadPilot to write the posts that convert.
          </p>
        </div>
      </section>

      <Separator />

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Two Ways to Grow</h2>
            <p className="mt-3 text-muted-foreground">
              Proactive content + reactive replies = full Reddit strategy
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Proactive Mode */}
            <div>
              <Badge variant="outline" className="mb-4">
                Proactive Mode
              </Badge>
              <h3 className="text-xl font-semibold mb-4">
                Generate Original Posts
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Add your product</p>
                    <p className="text-sm text-muted-foreground">
                      Describe what you built, who it&apos;s for, and what
                      problem it solves. Voice input supported.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Search className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      AI finds 7 perfect subreddits
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Matches your product to communities where your audience
                      already hangs out.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      Get 7 ready-to-post pieces
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Each post matches the subreddit&apos;s culture, tone, and
                      rules. Just copy, paste, and post.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reply Mode */}
            <div>
              <Badge
                variant="outline"
                className="mb-4 border-green-200 text-green-700 bg-green-50"
              >
                Reply Mode
              </Badge>
              <h3 className="text-xl font-semibold mb-4">
                Jump Into Conversations
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                    <MessageSquareReply className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      Paste a Reddit thread URL
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Found a relevant conversation? Drop the link into
                      ThreadPilot.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                    <Zap className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      Get a product-aware reply
                    </p>
                    <p className="text-sm text-muted-foreground">
                      AI reads the thread and crafts a helpful reply that
                      naturally weaves in your product.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      Never sounds like an ad
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Leads with genuine value. Your product is mentioned only
                      when it&apos;s the natural answer.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* What ThreadPilot Is NOT */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-8">
            What ThreadPilot Is <span className="text-red-500">Not</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              "A subreddit research tool — use GummySearch for that",
              "A monitoring/alert tool — use F5Bot or Syften",
              "An auto-poster or bot — you post manually, on your terms",
              "A spam machine — every post passes Reddit's sniff test",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 text-sm text-muted-foreground"
              >
                <X className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                {item}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            ThreadPilot does one thing and does it well:{" "}
            <span className="text-foreground font-medium">
              writes Reddit content that grows your product without getting you
              banned.
            </span>
          </p>
        </div>
      </section>

      <Separator />

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Simple Pricing</h2>
            <p className="mt-3 text-muted-foreground">
              Start free, upgrade when you&apos;re ready to scale
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Starter Plan */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">Starter</CardTitle>
                <CardDescription>
                  Perfect for validating your Reddit strategy
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-2 text-sm">
                  {[
                    "Up to 3 products",
                    "20 AI-generated posts per month",
                    "Unlimited reply generation",
                    "7 subreddits per generation",
                    "Best time to post suggestions",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-600 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/signup" className="w-full">
                  <Button variant="outline" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Pro Plan */}
            <Card className="flex flex-col border-blue-200 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Pro</CardTitle>
                  <Badge className="bg-blue-600 text-white border-blue-600">
                    Popular
                  </Badge>
                </div>
                <CardDescription>
                  For serious founders scaling organic growth
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$79</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-2 text-sm">
                  {[
                    "Unlimited products",
                    "Unlimited AI-generated posts",
                    "Unlimited reply generation",
                    "7 subreddits per generation",
                    "Best time to post suggestions",
                    "Priority AI generation",
                    "Voice input for products",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-600 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/signup" className="w-full">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Get Started
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Skip the Research. Go Straight to Posting.
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            You&apos;ve done the hard work of finding your audience. Let
            ThreadPilot handle the content that brings them to your product.
          </p>
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Start Growing Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span>ThreadPilot</span>
          </div>
          <p>&copy; 2026 ThreadPilot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
